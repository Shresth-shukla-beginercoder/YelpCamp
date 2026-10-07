import express from "express";
import {
    deleteCamp ,updatecamp ,getcampById,createCamp,getAllcamp,
    showHome,
    showNewCampgroundForm,
    editcampById
} from '../controllers/campController.js'
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/",showHome);

router.get("/campground/new",showNewCampgroundForm);

router.get("/campground",getAllcamp);

router.post("/campground",(req,res,next)=>{

    upload.single("image")(req,res,(err)=>{
        if(err){
            return next(err);
        }
        next();
    })
},createCamp);

router.get("/campground/:id",getcampById);

router.get("/campground/:id/edit",editcampById);

router.post("/campground/:id/edit",(req,res,next)=>{

    upload.single("image")(req,res,(err)=>{
        if(err){
            return next(err);
        }
        next();
    })
},updatecamp);

router.get("/campground/:id/delete",deleteCamp);

export default router;