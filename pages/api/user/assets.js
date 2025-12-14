import fs from "fs/promises";
import path from "path";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "waiting-room");
const MEDIA_DIR = path.join(process.cwd(), "public", "user-media");

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end("Method Not Allowed");
    }

    try {
        // Ensure directories exist
        await Promise.all([
            fs.mkdir(ASSETS_DIR, { recursive: true }).catch(() => { }),
            fs.mkdir(MEDIA_DIR, { recursive: true }).catch(() => { })
        ]);

        const [defaultFiles, userFiles] = await Promise.all([
            fs.readdir(ASSETS_DIR).catch(() => []),
            fs.readdir(MEDIA_DIR).catch(() => [])
        ]);

        const mapFiles = (files, basePath) => files.filter(file =>
            !file.startsWith('.') &&
            !file.endsWith('.txt') &&
            !file.endsWith('.md')
        ).map(file => ({
            name: file,
            path: `${basePath}/${file}`,
            type: getFileType(file)
        }));

        const allFiles = [
            ...mapFiles(defaultFiles, '/assets/waiting-room'),
            ...mapFiles(userFiles, '/user-media')
        ];

        return res.status(200).json({ files: allFiles });
    } catch (error) {
        console.error("Error listing assets:", error);
        return res.status(500).json({ message: "Failed to list assets" });
    }
}

function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
    if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
    return 'other';
}
