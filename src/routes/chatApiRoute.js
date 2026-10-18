import express from "express";
import { getCampgrounds, getCampground, getCampgroundReviews } from "../controllers/chatApiController.js";
import { chatAuth } from "../middlewares/chatAuth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// All chat API traffic: bounded rate limit, then service-to-service auth.
router.use("/api/chat", rateLimiter, chatAuth);

router.get("/api/chat/campgrounds", getCampgrounds);
router.get("/api/chat/campgrounds/:id", getCampground);
router.get("/api/chat/campgrounds/:id/reviews", getCampgroundReviews);

// Generic, safe error handler for the chat API: JSON only, no internal detail
// leaked to the caller. The error is logged server-side.
router.use((error, req, res, next) => {
    console.error("[chat-api]", error);
    const status = Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ error: "Internal server error" });
});

export default router;
