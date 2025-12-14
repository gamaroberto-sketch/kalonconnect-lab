import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "test-users.json");

const loadUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const raw = fs.readFileSync(USERS_FILE, "utf8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : (data.users || []);
    } catch (error) {
        return [];
    }
};

export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    const users = loadUsers();

    // Find users referred by this userId
    const referrals = users
        .filter(u => u.referredBy === userId)
        .map(u => ({
            id: u.id,
            name: u.name,
            email: u.email, // Maybe mask this for privacy? Keeping full for now as "friends"
            version: u.version,
            createdAt: u.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(referrals);
}
