import { getUserById } from "../models/userModel.js";
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