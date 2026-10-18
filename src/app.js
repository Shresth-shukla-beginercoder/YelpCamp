
import express from "express";
import adminRoute from "./routes/adminRoute.js";
import campRoutes from "./routes/campRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import userRoute from "./routes/userRoute.js";
import chatApiRoute from "./routes/chatApiRoute.js";
import ejsMate from "ejs-mate";
import { errorHandler } from "./middlewares/errorHandling.js";
import sessionMiddleware from "./middlewares/session.js";
import { getUserById } from "./models/userModel.js";

const app = express();

app.use(express.static("public"));
app.engine("ejs", ejsMate);
app.use(express.json()); // Need to parse JSON if chat API uses it
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(sessionMiddleware);

// Make the logged-in user available to every EJS page, and expose the
// (non-secret) FastAPI chat endpoint base URL for the floating chat widget.
app.use(async (req, res, next) => {
    try {
        const userId = req.session.userId;

        res.locals.user = userId
            ? await getUserById(userId)
            : null;

        // A public service URL, not a secret. The Gemini key and the Express
        // service token never reach the browser.
        res.locals.chatApiUrl = process.env.CHAT_API_URL || "http://localhost:8000";

        next();
    } catch (error) {
        next(error);
    }
});

app.use(campRoutes);
app.use(userRoute);
app.use(reviewRoutes);
app.use(adminRoute);
app.use(chatApiRoute);

app.use(errorHandler);

// Only start listening when running the server directly (not under tests or
// when imported as a module).
if (process.env.NODE_ENV !== "test") {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;
