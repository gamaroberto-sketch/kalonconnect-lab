import { supabaseAdmin } from '../../../lib/supabase-admin';

const DEFAULT_SETTINGS = {
  activeMediaType: "video",
  mediaAssets: {
    video: "",
    image: "",
    slides: ""
  },
  music: "",
  message: "",
  allowClientPreview: true,
  alertOnClientJoin: true,
  multiSpecialty: false,
  animatedMessage: false,
  specialtyOverrides: {}
};

export default async function handler(req, res) {
  // Try to get userId from header (injected by middleware or client)
  // For safety in this environment we assume the client sends x-user-id or we rely on the session if we had one.
  // The current app seems to rely on client-side auth state matching DB.
  // We will check header 'x-user-id' first, then query param.
  const userId = req.headers['x-user-id'] || req.query.userId;

  if (!userId) {
    // If no userId provided, we can't save/load for a specific user.
    // In dev we might return defaults, but in prod this is an error for saving.
    if (req.method === "POST") {
      return res.status(401).json({ message: "Usuário não identificado" });
    }
  }

  if (req.method === "GET") {
    if (!userId) return res.status(200).json({ waitingRoom: DEFAULT_SETTINGS });

    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('social')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return res.status(200).json({ waitingRoom: DEFAULT_SETTINGS });
      }

      // Settings are stored inside the 'social' JSON column under 'waitingRoom' key
      // This allows us to use existing column without migration
      const savedSettings = data.social?.waitingRoom || {};

      return res.status(200).json({
        waitingRoom: { ...DEFAULT_SETTINGS, ...savedSettings }
      });
    } catch (err) {
      console.error("Error loading settings:", err);
      // Fallback
      return res.status(200).json({ waitingRoom: DEFAULT_SETTINGS });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const newSettings = body.waitingRoom || {};

      // 1. Fetch current data to preserve other social fields
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('social')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentSocial = currentUser?.social || {};

      // 2. Update just the waitingRoom part
      const updatedSocial = {
        ...currentSocial,
        waitingRoom: {
          ...DEFAULT_SETTINGS,
          ...(currentSocial.waitingRoom || {}),
          ...newSettings
        }
      };

      // 3. Save back
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ social: updatedSocial })
        .eq('id', userId)
        .select();

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        waitingRoom: updatedSocial.waitingRoom
      });

    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      return res.status(500).json({ message: "Não foi possível salvar as configurações." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

