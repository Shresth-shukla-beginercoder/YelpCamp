
import express from "express";
import { showAdminDashboard } from "../controllers/adminController.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin dashboard — admins only
router.get("/admin", isLoggedIn, isAdmin, showAdminDashboard);

export default router;
