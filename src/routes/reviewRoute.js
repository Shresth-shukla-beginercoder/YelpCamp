import express from "express";

import {
    createRev,
    deleteRev,
    getRevById,
    updateRev
} from "../controllers/reviewController.js";

import { isLoggedIn } from "../middlewares/auth.js";

const router = express.Router();


// CREATE REVIEW
router.post(
    "/campground/:id/reviews",
    isLoggedIn,
    createRev
);


// EDIT REVIEW PAGE
router.get(
    "/reviews/:id/edit",
    isLoggedIn,
    getRevById
);


// UPDATE REVIEW
router.post(
    "/reviews/:id/edit",
    isLoggedIn,
    updateRev
);


// DELETE REVIEW
router.post(
    "/reviews/:id/delete",
    isLoggedIn,
    deleteRev
);

export default router;