
import { pool } from "../db/pool.js";

// Get admin dashboard statistics
export async function getAdminStats() {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM camp) AS total_campgrounds,
            (SELECT COUNT(*) FROM reviews) AS total_reviews,
            (
                SELECT COUNT(*)
                FROM users
                WHERE is_admin = TRUE
            ) AS total_admins
    `);

    const stats = result.rows[0];

    return {
        totalUsers: Number(stats.total_users),
        totalCampgrounds: Number(stats.total_campgrounds),
        totalReviews: Number(stats.total_reviews),
        totalAdmins: Number(stats.total_admins)
    };
}
