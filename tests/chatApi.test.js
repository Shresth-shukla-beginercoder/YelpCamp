import { test, before, after } from "node:test";
import assert from "node:assert";
import express from "express";
import { pool } from "../src/db/pool.js";
import chatApiRoute from "../src/routes/chatApiRoute.js";

// Deterministic token for the test. dotenv/config (loaded by chatAuth) will
// not override an already-set variable, so this wins over .env.
const TOKEN = "test-chat-token";
process.env.YELPCAMP_CHAT_SERVICE_TOKEN = TOKEN;
process.env.NODE_ENV = "test";

// ---- Fixtures + pool mock ------------------------------------------------
const CAMPS = [
    { id: 1, title: "Sunny Pines", location: "California", description: "Pine forest", price: 50, image: "x.jpg" },
    { id: 2, title: "Desert Oasis", location: "Arizona", description: "Desert views", price: 30, image: "y.jpg" },
    { id: 3, title: "Mountain View", location: "Colorado", description: "High altitude", price: 75, image: "z.jpg" }
];
const REVIEWS = [
    { id: 10, campground_id: 1, rating: 5, comment: "Great place!" },
    { id: 11, campground_id: 1, rating: 4, comment: "Wifi was spotty." },
    { id: 12, campground_id: 2, rating: 3, comment: "No shade." }
];

const realQuery = pool.query.bind(pool);
let lastQuery = { text: null, params: null };

pool.query = async (text, params) => {
    lastQuery = { text, params };
    const table = (text.match(/\bFROM (\w+)/i) || [])[1];
    if (table === "camp" && /WHERE 1=1/i.test(text)) {
        // list/search
        return { rows: CAMPS };
    }
    if (table === "camp") {
        return { rows: CAMPS.filter((c) => c.id === Number(params[0])) };
    }
    if (table === "reviews") {
        return { rows: REVIEWS.filter((r) => r.campground_id === Number(params[0])) };
    }
    return { rows: [] };
};

let server;
let base;

before(async () => {
    const app = express();
    app.use(chatApiRoute);
    await new Promise((resolve) => {
        server = app.listen(0, () => resolve());
    });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) server.close();
    pool.query = realQuery;
});

const headers = { Authorization: `Bearer ${TOKEN}` };

const getJson = async (path, opts = {}) => {
    const res = await fetch(`${base}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
};

test("search: 401 without a valid token", async () => {
    const res = await fetch(`${base}/api/chat/campgrounds`);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.headers.get("content-type").includes("application/json"), true);
});

test("search: returns public fields and applies location filter param", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds?location=California");
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.strictEqual(body.length, CAMPS.length);
    const first = body[0];
    // Only the public projection is exposed.
    assert.deepStrictEqual(Object.keys(first).sort(), ["description", "id", "location", "name", "price"]);
    assert.strictEqual(first.name, "Sunny Pines");
    assert.strictEqual(typeof first.price, "number");
    // The location filter must be forwarded to the SQL layer.
    assert.match(lastQuery.text, /LOWER\(location\)/i);
});

test("search: price + limit bounds are forwarded", async () => {
    await getJson("/api/chat/campgrounds?minPrice=40&maxPrice=100&limit=2");
    assert.match(lastQuery.text, /price >= \$\d+/);
    assert.match(lastQuery.text, /price <= \$\d+/);
    assert.match(lastQuery.text, /LIMIT \$\d+/);
});

test("search: rejects an invalid price filter", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds?minPrice=abc");
    assert.strictEqual(status, 400);
    assert.match(body.error, /price/i);
});

test("search: rejects a non-integer limit", async () => {
    const { status } = await getJson("/api/chat/campgrounds?limit=0");
    assert.strictEqual(status, 400);
});

test("details: returns campground + review comments", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds/1");
    assert.strictEqual(status, 200);
    assert.strictEqual(body.name, "Sunny Pines");
    assert.deepStrictEqual(body.reviews, ["Great place!", "Wifi was spotty."]);
});

test("details: 404 for a missing campground", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds/999");
    assert.strictEqual(status, 404);
    assert.strictEqual(body.error, "Campground not found");
});

test("details: rejects a non-numeric id", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds/abc");
    assert.strictEqual(status, 400);
    assert.match(body.error, /id/i);
});

test("reviews: lists comment strings for a campground", async () => {
    const { status, body } = await getJson("/api/chat/campgrounds/2/reviews");
    assert.strictEqual(status, 200);
    assert.deepStrictEqual(body, ["No shade."]);
});

test("reviews: 404 for a missing campground", async () => {
    const { status } = await getJson("/api/chat/campgrounds/999/reviews");
    assert.strictEqual(status, 404);
});
