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
    // Simple admin check (in production use real middleware)
    const userEmail = req.headers['x-user-email'];
    if (userEmail !== 'bobgama@uol.com.br') { // Hardcoded admin for Lab environment
        return res.status(403).json({ error: "Access denied" });
    }

    const users = loadUsers();
    const referralsMap = {};

    // Group by referrer
    users.forEach(user => {
        if (user.referredBy) {
            if (!referralsMap[user.referredBy]) {
                referralsMap[user.referredBy] = {
                    count: 0,
                    activeCount: 0, // Pro or Normal paid
                    details: []
                };
            }

            const isPaid = user.version === 'PRO' || (user.version === 'NORMAL' && !user.trialEndsAt); // Simple heuristic

            referralsMap[user.referredBy].count += 1;
            if (isPaid) referralsMap[user.referredBy].activeCount += 1;

            referralsMap[user.referredBy].details.push({
                id: user.id,
                name: user.name,
                email: user.email,
                version: user.version,
                createdAt: user.createdAt,
                isPaid
            });
        }
    });

    // Enrich with referrer details
    const report = Object.keys(referralsMap).map(referrerId => {
        const referrer = users.find(u => u.id === referrerId);
        return {
            referrerId,
            referrerName: referrer ? referrer.name : "Unknown",
            referrerEmail: referrer ? referrer.email : "Unknown",
            totalReferrals: referralsMap[referrerId].count,
            qualifiedReferrals: referralsMap[referrerId].activeCount,
            estimatedDiscount: referralsMap[referrerId].activeCount * 20, // 20% per qualified
            referrals: referralsMap[referrerId].details
        };
    }).sort((a, b) => b.totalReferrals - a.totalReferrals);

    return res.status(200).json(report);
}
