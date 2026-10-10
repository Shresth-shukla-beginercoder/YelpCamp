import { getUserById } from "../models/userModel.js";
import { getcampgroundsById } from "../models/taskModel.js";
export async function isLoggedIn(req, res, next) {
try{

    const userId = req.session.userId;
if(!userId){
    return res.redirect("/login");
}
  const user = await getUserById(userId);
   

   // Session exists, but user no longer exists
        if (!user) {
            return req.session.destroy(() => {
                res.redirect("/login");
            });
        }



  req.user = user;
  next();
    
}catch(error){
    console.error(error);

        res.status(500).send("Something went wrong");
}



    // find the user
    // attach user to req.user
    // continue to next middleware/controller
}


export function isAdmin(req, res, next) {
  if (!req.user || req.user.is_admin !== true) {
    return res.status(403).send("Access denied. Admins only.");
  }

  next();
}


export async function isCampgroundOwnerOrAdmin(req, res, next) {
  try {
    const campground = await getcampgroundsById(req.params.id);

    if (!campground) {
      return res.status(404).send("Campground not found");
    }

    if (
      req.user.is_admin !== true &&
      campground.user_id !== req.user.id
    ) {
      return res.status(403).send("You are not allowed to modify this campground");
    }

    req.campground = campground;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
}
