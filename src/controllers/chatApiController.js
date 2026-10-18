import { getAllcampgrounds, getcampgroundsById } from "../models/taskModel.js";
import { getReviewsByCampground } from "../models/reviewModel.js";

// The chat API exposes a fixed, public projection of each campground. It never
// leaks passwords, session data, or admin/user fields.
const publicCampground = (row) => ({
    id: row.id,
    name: row.title,
    location: row.location,
    price: Number(row.price) || 0,
    description: row.description || ""
});

// Parse a query param as an integer within [1, max]; undefined when absent.
const parseBoundedInt = (value, max) => {
    if (value === undefined || value === "") return undefined;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) return null; // invalid -> null
    return Math.min(n, max);
};

// Parse an optional non-negative number; undefined when absent, null when invalid.
const parsePrice = (value) => {
    if (value === undefined || value === "") return undefined;
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
};

export const getCampgrounds = async (req, res, next) => {
    try {
        const { keyword, location, minPrice, maxPrice, limit } = req.query;

        // Strict validation: reject oversized / malformed inputs early.
        if (keyword !== undefined && String(keyword).length > 200) {
            return res.status(400).json({ error: "keyword is too long" });
        }
        if (location !== undefined && String(location).length > 200) {
            return res.status(400).json({ error: "location is too long" });
        }

        const min = parsePrice(minPrice);
        const max = parsePrice(maxPrice);
        if (min === null || max === null) {
            return res.status(400).json({ error: "price filters must be non-negative numbers" });
        }

        // Bounded result set: default 50, capped at 100.
        const bound = parseBoundedInt(limit, 100);
        if (bound === null) {
            return res.status(400).json({ error: "limit must be a positive integer" });
        }

        const campgrounds = await getAllcampgrounds({
            search: keyword,
            location,
            minPrice: min,
            maxPrice: max,
            limit: bound ?? 50
        });

        res.json(campgrounds.map(publicCampground));
    } catch (error) {
        next(error);
    }
};

export const getCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const parsedId = Number(id);
        if (!Number.isInteger(parsedId)) {
            return res.status(400).json({ error: "invalid campground id" });
        }

        const campground = await getcampgroundsById(parsedId);
        if (!campground) {
            return res.status(404).json({ error: "Campground not found" });
        }

        const reviews = await getReviewsByCampground(parsedId);
        const body = publicCampground(campground);
        body.reviews = reviews.map((r) => r.comment || "");

        res.json(body);
    } catch (error) {
        next(error);
    }
};

export const getCampgroundReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const parsedId = Number(id);
        if (!Number.isInteger(parsedId)) {
            return res.status(400).json({ error: "invalid campground id" });
        }

        // Confirm the campground exists before listing reviews.
        const campground = await getcampgroundsById(parsedId);
        if (!campground) {
            return res.status(404).json({ error: "Campground not found" });
        }

        const reviews = await getReviewsByCampground(parsedId);
        res.json(reviews.map((r) => r.comment || ""));
    } catch (error) {
        next(error);
    }
};
