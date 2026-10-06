import express from "express";
import {
    deleteCamp ,updatecamp ,getcampById,createCamp,getAllcamp,
    showHome,
    showNewCampgroundForm,
    editcampById
} from '../controllers/campController.js'

const router = express.Router();

router.get("/",showHome);

router.get("/campground/new",showNewCampgroundForm);

router.get("/campground",getAllcamp);

router.post("/campground",createCamp);

router.get("/campground/:id",getcampById);

router.get("/campground/:id/edit",editcampById);

router.post("/campground/:id/edit",updatecamp);

router.get("/campground/:id/delete",deleteCamp);

export default router;