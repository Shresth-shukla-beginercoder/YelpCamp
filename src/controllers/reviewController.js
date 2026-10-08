import {
    createReview,
    deleteReview,
    getReviewById,
    getReviewsByCampground,
    updateReview
} from "../models/reviewModel.js";


// CREATE REVIEW
export async function createRev(req, res) {

    const { rating, comment } = req.body;

    // ID of the campground from the URL
    const campground_id = req.params.id;

    // ID of the logged-in user
    const { id } = req.user;

    const rev = await createReview(
        rating,
        comment,
        id,
        campground_id
    );

    res.redirect(`/campground/${rev.campground_id}`);
}


// UPDATE REVIEW
export async function updateRev(req, res) {

    const { rating, comment } = req.body;

    // Here id = review ID
    const { id } = req.params;

    // Get the review
    const review = await getReviewById(id);

    // Only the owner can edit
    if (review.user_id !== req.user.id) {
        return res.status(403).send("You can only edit your own review");
    }

    // Update the review
    const rev = await updateReview(
        rating,
        comment,
        id
    );

    res.redirect(`/campground/${rev.campground_id}`);
}


// GET ONE REVIEW FOR EDIT
export async function getRevById(req, res) {

    // Here id = review ID
    const { id } = req.params;

    // Get the review
    const rev = await getReviewById(id);

    // Only the owner can open the edit page
    if (rev.user_id !== req.user.id) {
        return res.status(403).send("You can only edit your own review");
    }

    // Show edit page
    res.render("pages/editReview", { rev });
}


// GET ALL REVIEWS OF CAMPGROUND
export async function getRevByCamp(req, res) {

    const campground_id = req.params.id;

    const reviews = await getReviewsByCampground(campground_id);

    res.render("pages/show", { reviews });
}


// DELETE REVIEW
export async function deleteRev(req, res) {

    const { id } = req.params;

    const rev = await getReviewById(id);

    // Only the owner can delete
    if (rev.user_id !== req.user.id) {
        return res.status(403).send("You can only delete your own review");
    }

    await deleteReview(id);

    res.redirect(`/campground/${rev.campground_id}`);
}