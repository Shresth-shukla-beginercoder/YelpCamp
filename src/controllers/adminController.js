
import { getAdminStats } from "../models/adminModel.js";

export async function showAdminDashboard(req, res) {
    try {
        const stats = await getAdminStats();

        res.render("admin/dashboard", {
            stats,
            user: req.user
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).send("Unable to load the admin dashboard.");
    }
}
