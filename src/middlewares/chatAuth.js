import "dotenv/config";
import crypto from "node:crypto";

// Compare the presented bearer token against the configured service token in
// constant time to avoid leaking which prefix matched via timing.
const safeEqual = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string") return false;
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
};

export const chatAuth = (req, res, next) => {
    const expected = process.env.YELPCAMP_CHAT_SERVICE_TOKEN;

    // Fail closed: without a configured token, reject rather than open up.
    if (!expected) {
        return res.status(503).json({ error: "Chat service is not configured" });
    }

    const header = req.headers.authorization || "";
    const [scheme, ...rest] = header.split(" ");
    const token = rest.join(" ");

    if (scheme.toLowerCase() !== "bearer" || !safeEqual(token, expected)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
};
