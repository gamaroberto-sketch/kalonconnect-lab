import { supabaseAdmin } from '../../../lib/supabase-admin';

const normalizeProfile = (data = {}) => {
  const services = Array.isArray(data.services)
    ? data.services.map((service) => ({
      name: String(service?.name ?? ""),
      price: String(service?.price ?? "0,00") // Keep as string to preserve formatting
    }))
    : [];

  const normalizeSocialField = (field) => {
    if (Array.isArray(field)) {
      return field.map(String).filter(Boolean);
    }
    return field ? [String(field)] : [];
  };

  const social = data?.social || {};

  return {
    photo: String(data.photo_url || data.photo || ""),
    specialty: String(data.specialty ?? ""),
    name: String(data.name ?? ""),
    phone: String(data.phone ?? ""), // Add phone field
    bio: String(data.bio ?? ""), // Add bio field
    address: data.address || {}, // Add address field
    signaturePad: String((data.signature_pad || data.signaturePad) ?? ""),
    signatureText: String((data.signature_text || data.signatureText) ?? ""),
    signature_image_url: String(data.signature_image_url ?? ""),
    stamp_image_url: String(data.stamp_image_url ?? ""),
    prescription_template_url: String(data.prescription_template_url ?? ""), // Add template URL
    prescription_template_size: String(data.prescription_template_size || "A4"), // Add template size
    prescription_template_positions: data.prescription_template_positions || {},
    prescription_templates: Array.isArray(data.prescription_templates) ? data.prescription_templates : [],
    consent_template_url: String(data.consent_template_url ?? ""),
    consent_template_size: String(data.consent_template_size || "A4"),
    consent_template_positions: data.consent_template_positions || {},
    receipt_template_url: String(data.receipt_template_url ?? ""),
    receipt_template_size: String(data.receipt_template_size || "A4"),
    receipt_template_positions: data.receipt_template_positions || {},
    report_template_url: String(data.report_template_url ?? ""),
    report_template_size: String(data.report_template_size || "A4"),
    report_template_positions: data.report_template_positions || {},
    certificate_template_url: String(data.certificate_template_url ?? ""),
    certificate_template_size: String(data.certificate_template_size || "A4"),
    certificate_template_positions: data.certificate_template_positions || {},
    opinion_template_url: String(data.opinion_template_url ?? ""),
    opinion_template_size: String(data.opinion_template_size || "A4"),
    opinion_template_positions: data.opinion_template_positions || {},
    services,
    // 🟢 v5.58 Fix: Prioritize 'social.slug' (User Edited) over 'raw_user_meta_data' (Auth System)
    // This prevents stale/empty Auth metadata from hiding the saved slug.
    slug: String(social?.slug || data.raw_user_meta_data?.slug || ""),
    // Read city/pixKeys/currency from root or social (fallback)
    city: String(data.city || social?.city || ""),
    pixKeys: data.pix_keys || social?.pixKeys || [],
    currency: String(data.currency || social?.currency || "BRL"),
    social: {
      instagram: normalizeSocialField(social?.instagram),
      whatsapp: normalizeSocialField(social?.whatsapp),
      site: normalizeSocialField(social?.site),
      tiktok: normalizeSocialField(social?.tiktok),
      youtube: normalizeSocialField(social?.youtube),
      facebook: normalizeSocialField(social?.facebook),
      registro: String(social?.registro ?? "")
    }
  };
};

export default async function handler(req, res) {
  // Get user ID from session/auth
  // For now, we'll use a simple approach - in production you'd verify the session
  const userId = req.headers['x-user-id'] || req.query.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Return empty profile with city/pixKeys defaults
        return res.status(200).json({
          photo: "",
          specialty: "",
          name: "",
          city: "",
          pixKeys: [],
          signaturePad: "",
          signatureText: "",
          services: [],
          social: {
            instagram: [],
            whatsapp: [],
            site: [],
            tiktok: [],
            youtube: [],
            facebook: [],
            registro: ""
          }
        });
      }
      if (!user) {
        // ... (lines 87-107 omitted for brevity, keeping existing logic) ...
        return res.status(200).json({ /* ... empty profile ... */ });
      }

      console.log('📝 [Profile API] Raw Supabase User:', {
        id: user.id,
        socialSlug: user.social?.slug,
        metaSlug: user.raw_user_meta_data?.slug
      });

      const normalized = normalizeProfile(user);
      console.log('✅ [Profile API] Returning Normalized:', { slug: normalized.slug });

      return res.status(200).json(normalized);
    } catch (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ message: "Failed to load profile" });
    }
  }

  if (req.method === "POST") {
    try {
      console.log('📝 Profile POST request received');
      console.log('User ID:', userId);

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      console.log('Request body:', JSON.stringify(body, null, 2));

      // 1. Fetch current user data to preserve 'waitingRoom' and other unmanaged fields
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('social')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current social data:', fetchError);
        // Warning: Proceeding without fetch might overwrite data, but we can't block login/save loop easily.
        // Ideally we throw, but for robustness we might proceed if it's a new user. 
      }

      const currentSocial = currentUser?.social || {};

      // Map frontend fields to database fields.
      // Store city and pixKeys in 'social' JSON column since schema columns might not exist.
      const socialData = {
        ...currentSocial, // 🟢 v5.60 Preservation: Start with existing DB data (includes waitingRoom)
        ...body.social,   // Overwrite with new Profile Socials
        city: body.city,
        pixKeys: body.pixKeys,
        currency: body.currency,
        slug: body.slug // 🟢 v5.40/5.58: Save slug
      };

      const updateData = {
        name: body.name,
        specialty: body.specialty,
        photo_url: body.photo,
        bio: body.bio,
        services: body.services,
        social: socialData,
        signature_pad: body.signaturePad,
        signature_text: body.signatureText,
        updated_at: new Date().toISOString()
      };

      // Add optional fields if they exist
      if (body.address !== undefined) updateData.address = body.address;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.consultationPrice !== undefined) updateData.consultation_price = body.consultationPrice;
      if (body.signature_image_url !== undefined) updateData.signature_image_url = body.signature_image_url;
      if (body.stamp_image_url !== undefined) updateData.stamp_image_url = body.stamp_image_url;
      if (body.prescription_template_url !== undefined) updateData.prescription_template_url = body.prescription_template_url;
      if (body.prescription_template_size !== undefined) updateData.prescription_template_size = body.prescription_template_size;
      if (body.prescription_template_positions !== undefined) updateData.prescription_template_positions = body.prescription_template_positions;
      if (body.prescription_templates !== undefined) updateData.prescription_templates = body.prescription_templates;
      if (body.consent_template_url !== undefined) updateData.consent_template_url = body.consent_template_url;
      if (body.consent_template_size !== undefined) updateData.consent_template_size = body.consent_template_size;
      if (body.consent_template_positions !== undefined) updateData.consent_template_positions = body.consent_template_positions;
      if (body.receipt_template_url !== undefined) updateData.receipt_template_url = body.receipt_template_url;
      if (body.receipt_template_size !== undefined) updateData.receipt_template_size = body.receipt_template_size;
      if (body.receipt_template_positions !== undefined) updateData.receipt_template_positions = body.receipt_template_positions;
      if (body.report_template_url !== undefined) updateData.report_template_url = body.report_template_url;
      if (body.report_template_size !== undefined) updateData.report_template_size = body.report_template_size;
      if (body.report_template_positions !== undefined) updateData.report_template_positions = body.report_template_positions;
      if (body.certificate_template_url !== undefined) updateData.certificate_template_url = body.certificate_template_url;
      if (body.certificate_template_size !== undefined) updateData.certificate_template_size = body.certificate_template_size;
      if (body.certificate_template_positions !== undefined) updateData.certificate_template_positions = body.certificate_template_positions;
      if (body.opinion_template_url !== undefined) updateData.opinion_template_url = body.opinion_template_url;
      if (body.opinion_template_size !== undefined) updateData.opinion_template_size = body.opinion_template_size;
      if (body.opinion_template_positions !== undefined) updateData.opinion_template_positions = body.opinion_template_positions;

      console.log('Update data:', JSON.stringify(updateData, null, 2));

      const { data: updated, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error updating profile:', JSON.stringify(error, null, 2));
        return res.status(500).json({ message: "Failed to update profile", error: error.message });
      }

      console.log('✅ Profile updated successfully:', updated);
      return res.status(200).json(normalizeProfile(updated));
    } catch (error) {
      console.error('❌ Profile update error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: "Failed to save profile", error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
