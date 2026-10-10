
import express from "express";
import adminRoute from "./routes/adminRoute.js";
import campRoutes from "./routes/campRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import userRoute from "./routes/userRoute.js";
import ejsMate from "ejs-mate";
import { errorHandler } from "./middlewares/errorHandling.js";
import sessionMiddleware from "./middlewares/session.js";
import { getUserById } from "./models/userModel.js";

const app = express();

app.use(express.static("public"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(sessionMiddleware);

// Make the logged-in user available to every EJS page
app.use(async (req, res, next) => {
    try {
        const userId = req.session.userId;

        res.locals.user = userId
            ? await getUserById(userId)
            : null;

        next();
    } catch (error) {
        next(error);
    }
});

app.use(campRoutes);
app.use(userRoute);
app.use(reviewRoutes);
app.use(adminRoute);

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
