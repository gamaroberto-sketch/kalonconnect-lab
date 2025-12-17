import fs from "fs/promises";
import path from "path";

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "waiting-room");
const MEDIA_DIR = path.join(process.cwd(), "public", "user-media");

export default async function handler(req, res) {
    // Handle DELETE request
    if (req.method === "DELETE") {
        try {
            const { path: filePath } = req.body;

            if (!filePath) {
                return res.status(400).json({ message: "File path is required" });
            }

            // Only allow deleting from user-media directory (not default assets)
            if (!filePath.startsWith('/user-media/')) {
                return res.status(403).json({ message: "Can only delete user-uploaded files" });
            }

            const fullPath = path.join(process.cwd(), "public", filePath.substring(1));

            // Check if file exists
            try {
                await fs.access(fullPath);
            } catch {
                return res.status(404).json({ message: "File not found" });
            }

            // Delete the file
            await fs.unlink(fullPath);

            return res.status(200).json({ message: "File deleted successfully" });
        } catch (error) {
            console.error("Error deleting file:", error);
            return res.status(500).json({ message: "Failed to delete file" });
        }
    }

    // Handle GET request
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET", "DELETE"]);
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
