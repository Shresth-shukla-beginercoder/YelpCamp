
import {
    deleteCampground,
    updatecampground,
    getcampgroundsById,
    createCampGround,
    getAllcampgrounds
} from "../models/taskModel.js";

import { getReviewsByCampground } from "../models/reviewModel.js";


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
        filters: { search, minPrice, maxPrice, sort }
    });
}


export async function createCamp(req, res) {
    const { title, location, description, price } = req.body;

    // Cloudinary returns the uploaded image URL in req.file.path.
    if (!req.file) {
        return res.status(400).send("Please upload a campground image.");
    }

    const image = req.file.path;

    const campgrounds = await createCampGround(
        title,
        location,
        description,
        price,
        image,
        req.user.id
    );

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
        error
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

    await updatecampground(
        title,
        description,
        price,
        location,
        image,
        id
    );

    res.redirect(`/campground/${id}`);
}


export async function deleteCamp(req, res) {
    const { id } = req.params;

    // Delete the campground record from PostgreSQL.
    // The Cloudinary image is left untouched for now.
    await deleteCampground(id);

    res.redirect("/campground");
}
