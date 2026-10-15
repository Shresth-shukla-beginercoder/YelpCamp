
import {
    deleteCampground,
    updatecampground,
    getcampgroundsById,
    createCampGround,
    getAllcampgrounds
} from "../models/taskModel.js";

import { getReviewsByCampground } from "../models/reviewModel.js";


// Popup markup is injected into the map as HTML, so escape user content
// rather than relying on EJS's escaping (which does not apply here).
const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

// JSON that is safe to inline inside a <script> block. Escaping < and > stops
// a value such as "</script>" from closing the tag and breaking out into HTML.
const safeJson = (value) =>
    JSON.stringify(value ?? null)
        .replace(/[<>&]/g, (char) =>
            ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" })[char])
        .replace(new RegExp(String.fromCharCode(0x2028, 0x2029), "g"), (char) =>
            "\\u" + char.charCodeAt(0).toString(16))


export const showHome = (req, res) => {
    res.render("pages/home");
};


export const showNewCampgroundForm = (req, res) => {
    res.render("pages/new");
};


export async function getAllcamp(req, res) {
    const { search, minPrice, maxPrice, sort } = req.query;

    const campgrounds = await getAllcampgrounds({
        search,
        minPrice,
        maxPrice,
        sort
    });

    res.render("pages/index", {
        campgrounds,
        filters: { search, minPrice, maxPrice, sort },
        maptilerApiKey: process.env.MAPTILER_API_KEY,
        // Only campgrounds with coordinates can be plotted on the cluster map.
        mapFeatures: safeJson(
            campgrounds
                .filter((camp) => camp.latitude != null && camp.longitude != null)
                .map((camp) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            Number(camp.longitude),
                            Number(camp.latitude)
                        ]
                    },
                    properties: {
                        popUpMarkup: `
                        <strong><a href="/campground/${Number(camp.id)}">${escapeHtml(camp.title)}</a></strong>
                        <p>${escapeHtml((camp.description || "").substring(0, 20))}...</p>
                    `
                    }
                }))
        )
    });
}


// Derive an allowed MapTiler origin from the incoming request so server-side
// geocoding can carry one. Browsers send Origin or Referer; without a match we
// return undefined and geocode falls back to its default allowed origin.
const requestOrigin = (req) => {
    if (req.headers.origin) {
        return req.headers.origin;
    }

    if (req.headers.referer) {
        try {
            return new URL(req.headers.referer).origin;
        } catch {
            return undefined;
        }
    }

    return undefined;
};


export async function createCamp(req, res) {
    const { title, location, description, price } = req.body;

    // Cloudinary returns the uploaded image URL in req.file.path.
    if (!req.file) {
        return res.status(400).send("Please upload a campground image.");
    }

    const image = req.file.path;

    let campgrounds;

    try {
        campgrounds = await createCampGround(
            title,
            location,
            description,
            price,
            image,
            req.user.id,
            { origin: requestOrigin(req) }
        );
    } catch (error) {
        // Geocoding failed - send the user back to the form with the reason.
        return res.render("pages/new", {
            error: error.message,
            values: { title, location, description, price }
        });
    }

    res.redirect(`/campground/${campgrounds.id}`);
}


export async function getcampById(req, res) {
    const { id } = req.params;

    const reviews = await getReviewsByCampground(id);
    const campgrounds = await getcampgroundsById(id);

    if (!campgrounds) {
        return res.status(404).send("Campground not found");
    }

    const error = req.query.error || null;

    res.render("pages/show", {
        campgrounds,
        reviews,
        user: req.user,
        error,
        maptilerApiKey: process.env.MAPTILER_API_KEY,
        mapCoordinates: safeJson(
            campgrounds.latitude != null && campgrounds.longitude != null
                ? [Number(campgrounds.longitude), Number(campgrounds.latitude)]
                : null
        ),
        mapTitle: safeJson(campgrounds.title),
        mapLocation: safeJson(campgrounds.location)
    });
}


export async function editcampById(req, res) {
    const { id } = req.params;

    const campground = await getcampgroundsById(id);

    if (!campground) {
        return res.status(404).send("Campground not found");
    }

    res.render("pages/edit", { campground });
}


export async function updatecamp(req, res) {
    const { id } = req.params;
    const { title, description, price, location } = req.body;

    const campground = await getcampgroundsById(id);

    if (!campground) {
        return res.status(404).send("Campground not found");
    }

    // Keep the current image unless a new image is uploaded.
    let image = campground.image;

    if (req.file) {
        image = req.file.path;
    }

    try {
        await updatecampground(
            title,
            description,
            price,
            location,
            image,
            id,
            { origin: requestOrigin(req) }
        );
    } catch (error) {
        // Geocoding failed - send the user back to the edit form.
        return res.render("pages/edit", {
            campground: { ...campground, title, description, price, location, image },
            error: error.message
        });
    }

    res.redirect(`/campground/${id}`);
}


export async function deleteCamp(req, res) {
    const { id } = req.params;

    // Delete the campground record from PostgreSQL.
    // The Cloudinary image is left untouched for now.
    await deleteCampground(id);

    res.redirect("/campground");
}
