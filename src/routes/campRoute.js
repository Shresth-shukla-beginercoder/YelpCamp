import express from "express";
import {
    deleteCamp ,updatecamp ,getcampById,createCamp,getAllcamp,
    showHome,
    showNewCampgroundForm,
    editcampById
} from '../controllers/campController.js'
import { upload } from "../middlewares/upload.js";
import {
  isLoggedIn,
  isCampgroundOwnerOrAdmin
} from "../middlewares/auth.js";

const router = express.Router();

router.get("/",showHome);

router.get("/campground/new",isLoggedIn ,showNewCampgroundForm);

router.get("/campground",isLoggedIn,getAllcamp);

router.post("/campground",isLoggedIn,(req,res,next)=>{

    upload.single("image")(req,res,(err)=>{
        if(err){
            return next(err);
        }
        next();
    })
},createCamp);

router.get("/campground/:id",isLoggedIn,getcampById);

router.get(
  "/campground/:id/edit",
  isLoggedIn,
  isCampgroundOwnerOrAdmin,
  editcampById
);

router.post(
  "/campground/:id/edit",
  isLoggedIn,
  isCampgroundOwnerOrAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  updatecamp
);
router.post(
  "/campground/:id/delete",
  isLoggedIn,
  isCampgroundOwnerOrAdmin,
  deleteCamp
);

export default router;