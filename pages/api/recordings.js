import { promises as fs } from "fs";
import path from "path";
import { getDriveClient, ensureFolder, findClientFolder, createClientFolderStructure } from '../../lib/driveUtils';
import { Readable } from 'stream'; // Node.js stream for buffer handling

const DATA_ROOT = path.join(process.cwd(), "data");
const TEMP_DIR = path.join(DATA_ROOT, "recordings", "temp");
const CLIENTS_DIR = path.join(DATA_ROOT, "clients");

const sanitize = (value = "") =>
  value
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 64) || "default";

const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const fileExists = async (target) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const getSessionDir = async (clientId, sessionId) => {
  const safeClient = sanitize(clientId);
  const safeSession = sanitize(sessionId);
  const dir = path.join(CLIENTS_DIR, safeClient, "sessions", safeSession);
  await ensureDir(dir);
  return dir;
};

const saveTempRecording = async ({ sessionId, data, mimeType, timestamp }) => {
  if (!sessionId || !data) {
    throw new Error("sessionId e data são obrigatórios.");
  }

  await ensureDir(TEMP_DIR);
  const safeSession = sanitize(sessionId);
  const safeTimestamp = sanitize(timestamp || Date.now().toString());
  const extension = mimeType && mimeType.includes("audio") && !mimeType.includes("video") ? "webm" : "webm";
  const fileName = `session-${safeSession}-${safeTimestamp}.${extension}`;
  const buffer = Buffer.from(data, "base64");
  const targetPath = path.join(TEMP_DIR, fileName);
  await fs.writeFile(targetPath, buffer);
  return { fileName, tempPath: targetPath };
};

const finalizeRecording = async ({
  clientId,
  sessionId,
  tempFileName,
  duration,
  recordingMode,
  notifyClient,
  professionalId
}) => {
  if (!clientId || !sessionId || !tempFileName || !professionalId) {
    throw new Error("clientId, sessionId, tempFileName e professionalId são obrigatórios.");
  }

  const safeTemp = sanitize(tempFileName);
  const originPath = path.join(TEMP_DIR, safeTemp);

  // Verify temp file exists
  try {
    await fs.access(originPath);
  } catch {
    throw new Error("Arquivo temporário de gravação não encontrado.");
  }

  // 1. Authenticate with Drive
  console.log(`🚀 [ZeroRetention] Finalizing recording for ${clientId}...`);
  let drive;
  try {
    drive = await getDriveClient(professionalId);
  } catch (error) {
    console.error("❌ Drive not connected:", error);
    throw new Error("Google Drive desconectado. Não foi possível salvar a gravação final.");
  }

  // 2. Stream Upload
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `Sessão ${safeTimestamp.split('T')[0]} - Final.webm`;

  let clientFolderId = await findClientFolder(drive, clientId);
  if (!clientFolderId) {
    console.warn("⚠️ Client folder not found. Creating fallback.");
    const rootId = await ensureFolder(drive, "KalonConnect");
    const recordingsId = await ensureFolder(drive, "Gravações", rootId);
    clientFolderId = await ensureFolder(drive, `Client_${clientId}`, recordingsId);
  }
  const recordingsFolderId = await ensureFolder(drive, "Gravações", clientFolderId);

  try {
    // Create stream from file on disk
    const stream = fs.createReadStream(originPath);

    const fileMetadata = {
      name: fileName,
      parents: [recordingsFolderId]
    };

    const media = {
      mimeType: 'video/webm',
      body: stream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, size'
    });

    console.log(`✅ [ZeroRetention] Final upload success: ${response.data.id}`);

    // 3. ZERO-RETENTION: Delete local temp file immediately
    await fs.unlink(originPath);
    console.log(`🗑️ [ZeroRetention] Local temp file deleted: ${originPath}`);

    // 4. Update Metadata (we keep metadata locally for log/history, but NO MEDIA)
    const sessionDir = await getSessionDir(clientId, sessionId);
    const metadata = {
      clientId: sanitize(clientId),
      sessionId: sanitize(sessionId),
      professionalId: sanitize(professionalId),
      savedAt: new Date().toISOString(),
      duration: Number(duration) || 0,
      recordingMode: recordingMode || "audio-video",
      driveFileId: response.data.id,
      driveLink: response.data.webViewLink,
      size: response.data.size, // from Drive response
      status: "uploaded_drive"
    };

    await fs.writeFile(
      path.join(sessionDir, "metadata.json"),
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    return { metadata, success: true };

  } catch (driveError) {
    console.error("❌ Finalization Upload Failed:", driveError);
    // We do NOT delete the temp file if upload fails, to allow manual recovery.
    // But we inform the user.
    throw new Error(`Falha no upload para Drive: ${driveError.message}`);
  }
};

const deleteTempRecording = async ({ tempFileName }) => {
  if (!tempFileName) return;
  const safeTemp = sanitize(tempFileName);
  const target = path.join(TEMP_DIR, safeTemp);
  try {
    await fs.unlink(target);
  } catch {
    // ignore
  }
};

const saveChunkRecording = async ({
  clientId,
  sessionId,
  data,
  chunkIndex,
  mimeType,
  professionalId
}) => {
  if (!clientId || !sessionId || !data || !professionalId) {
    throw new Error("clientId, sessionId, data e professionalId são obrigatórios.");
  }

  // 1. Get Drive Client for Professional
  console.log(`🚀 [ZeroRetention] Starting upload for Chunk #${chunkIndex} (Client: ${clientId})`);
  let drive;
  try {
    drive = await getDriveClient(professionalId);
  } catch (error) {
    console.error("❌ Drive not connected:", error);
    throw new Error("Google Drive não conectado. Impossível salvar gravação (Zero-Retention).");
  }

  // 2. Prepare Data Stream (No local file write)
  const buffer = Buffer.from(data, "base64");
  const stream = Readable.from(buffer);

  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const extension = mimeType && mimeType.includes("audio") && !mimeType.includes("video") ? "webm" : "webm";
  const fileName = `Sessão ${safeTimestamp.split('T')[0]} - Parte ${chunkIndex}.webm`;

  // 3. Find/Create Folder Structure
  // We need to find the Client's folder. If not exists, create it.
  // Note: createClientFolderStructure handles "KalonConnect/Clientes/{Name}" logic.
  // However, we might not have the Client Name comfortably here.
  // We'll rely on findClientFolder. If fails, we might need a fallback or just use "KalonConnect/Gravações/Temp".
  // Better: Try find, if null, try to create minimal or fail.
  // Ideally, frontend passes clientName? Or we fetch it.
  // Let's assume folder exists or we create a generic one.

  let clientFolderId = await findClientFolder(drive, clientId);
  if (!clientFolderId) {
    // Fallback: Create generic if strict structure not found? 
    // For now, let's try to create a "Gravações Avulsas" folder in root or minimal client folder.
    // Getting client name from DB would be best.
    // Let's do a minimal effort fallback: "KalonConnect/Gravações/Unassigned"
    console.warn("⚠️ Client folder not found. Creating fallback.");
    const rootId = await ensureFolder(drive, "KalonConnect");
    const recordingsId = await ensureFolder(drive, "Gravações", rootId);
    clientFolderId = await ensureFolder(drive, `Client_${clientId}`, recordingsId);
  }

  // 4. Ensure "Gravações" subfolder exists in Client Folder
  const recordingsFolderId = await ensureFolder(drive, "Gravações", clientFolderId);

  // 5. Upload to Drive
  try {
    const fileMetadata = {
      name: fileName,
      parents: [recordingsFolderId]
    };

    const media = {
      mimeType: mimeType || 'video/webm',
      body: stream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    console.log(`✅ [ZeroRetention] Upload success: ${response.data.id}`);

    // Data is NOT saved locally. Zero retention achieved.
    // We only return metadata.

    return {
      success: true,
      chunkIndex,
      driveFileId: response.data.id,
      driveLink: response.data.webViewLink,
      fileName // returned for UI feedback
    };

  } catch (driveError) {
    console.error("❌ Drive Upload Error:", driveError);
    throw new Error("Falha no upload para Google Drive.");
  }
};

const listClientSessions = async (clientId) => {
  const safeClient = sanitize(clientId);
  const sessionsDir = path.join(CLIENTS_DIR, safeClient, "sessions");
  try {
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const sessionId = entry.name;
      const sessionPath = path.join(sessionsDir, sessionId);
      const metadataPath = path.join(sessionPath, "metadata.json");
      const transcriptPath = path.join(sessionPath, "transcript.txt");
      const summaryPath = path.join(sessionPath, "summary.json");

      let metadata = {};
      try {
        const raw = await fs.readFile(metadataPath, "utf-8");
        metadata = JSON.parse(raw);
      } catch {
        metadata = {};
      }

      let size = metadata.size || null;
      try {
        const stats = await fs.stat(path.join(sessionPath, "recording.webm"));
        size = stats.size;
      } catch {
        size = null;
      }

      results.push({
        sessionId,
        metadata,
        recordingExists: size != null,
        size,
        transcriptExists: await fileExists(transcriptPath),
        summaryExists: await fileExists(summaryPath)
      });
    }
    return results.sort((a, b) =>
      (b.metadata?.savedAt || "").localeCompare(a.metadata?.savedAt || "")
    );
  } catch {
    return [];
  }
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { clientId } = req.query || {};
    if (!clientId) {
      return res.status(400).json({ message: "clientId é obrigatório para consulta." });
    }
    const sessions = await listClientSessions(clientId);
    return res.status(200).json({ sessions });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const action = body.action || "save-temp";

    if (action === "save-temp") {
      const result = await saveTempRecording(body);
      return res.status(200).json(result);
    }

    if (action === "finalize") {
      const result = await finalizeRecording(body);
      return res.status(200).json(result);
    }

    if (action === "delete-temp") {
      await deleteTempRecording(body);
      return res.status(200).json({ ok: true });
    }

    if (action === "save-chunk") {
      const result = await saveChunkRecording(body);
      return res.status(200).json(result);
    }

    return res.status(400).json({ message: "Ação inválida." });
  } catch (error) {
    console.error("Erro no endpoint /api/recordings:", error);
    return res.status(500).json({ error: "Não foi possível processar a requisição." });
  }
}







