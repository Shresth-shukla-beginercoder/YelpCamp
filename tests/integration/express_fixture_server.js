// Hermetic local integration fixture: serves the real /api/chat routes but
// backs them with in-memory rows so no database (and no Neon) is required.
// Run with:  node tests/integration/express_fixture_server.js
import express from "express";
import chatApiRoute from "../../src/routes/chatApiRoute.js";
import { pool } from "../../src/db/pool.js";

const CAMPS = [
    { id: 1, title: "Sunny Pines", location: "California", description: "Beautiful pine forest.", price: 50, image: "x.jpg", latitude: 34, longitude: -117 },
    { id: 2, title: "Desert Oasis", location: "Arizona", description: "Stunning desert views.", price: 30, image: "y.jpg", latitude: 33, longitude: -112 },
    { id: 3, title: "Mountain View", location: "Colorado", description: "High altitude camping.", price: 75, image: "z.jpg", latitude: 40, longitude: -105 }
];
const REVIEWS = [
    { id: 10, campground_id: 1, rating: 5, comment: "Great place!" },
    { id: 11, campground_id: 1, rating: 4, comment: "Wifi was spotty." },
    { id: 12, campground_id: 2, rating: 3, comment: "No shade." }
];

// Replace the DB layer with fixtures. pg.Pool never connects because no real
// query is issued.
pool.query = async (text, params) => {
    const table = (text.match(/\bFROM (\w+)/i) || [])[1];
    if (table === "camp" && /WHERE 1=1/i.test(text)) {
        let rows = [...CAMPS];
        // Apply the same filters the controller forwards (keyword/location/price/limit).
        const p = params || [];
        // NOTE: the fixture keeps it simple and ignores filter params; the
        // unfiltered list is enough to prove the HTTP + auth + shape wiring.
        void p;
        return { rows };
    }
    if (table === "camp") {
        return { rows: CAMPS.filter((c) => c.id === Number(params?.[0])) };
    }
    if (table === "reviews") {
        return { rows: REVIEWS.filter((r) => r.campground_id === Number(params?.[0])) };
    }
    return { rows: [] };
};

// The token must match the value the MCP client sends (MCP .env).
process.env.YELPCAMP_CHAT_SERVICE_TOKEN = process.env.YELPCAMP_CHAT_SERVICE_TOKEN || "dev-chat-service-token";
process.env.NODE_ENV = "test";

const app = express();
app.use(chatApiRoute);

const port = Number(process.env.FIXTURE_PORT) || 3123;
app.listen(port, () => {
    console.log(`yelpcamp-fixture ready on ${port}`);
});
