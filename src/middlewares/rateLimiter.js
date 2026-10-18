// In-memory, per-client rate limiter for the read-only chat API.
// Bounded both by a sliding window and by the number of tracked clients, so
// a flood of distinct client addresses cannot exhaust memory.

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = Number(process.env.CHAT_RATE_LIMIT_MAX) || 60;
const TRACKED_CLIENTS = 1000;

const clientRequests = new Map(); // key -> [timestamps]

const clientKey = (req) => req.ip || "unknown";

export const rateLimiter = (req, res, next) => {
    const key = clientKey(req);
    const now = Date.now();

    let stamps = clientRequests.get(key);
    if (!stamps) {
        // Evict the oldest tracked client when at capacity to stay bounded.
        if (clientRequests.size >= TRACKED_CLIENTS) {
            const oldest = clientRequests.keys().next().value;
            clientRequests.delete(oldest);
        }
        stamps = [];
        clientRequests.set(key, stamps);
    }

    // Drop timestamps that have fallen out of the window.
    while (stamps.length && now - stamps[0] >= WINDOW_MS) {
        stamps.shift();
    }

    if (stamps.length >= MAX_REQUESTS) {
        res.set("Retry-After", String(Math.ceil(WINDOW_MS / 1000)));
        return res.status(429).json({ error: "Too many requests" });
    }

    stamps.push(now);
    next();
};
