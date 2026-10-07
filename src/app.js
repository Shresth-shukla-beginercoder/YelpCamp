import express from "express";
import campRoutes from "./routes/campRoute.js";
import ejsMate from "ejs-mate";
import { errorHandler } from "./middlewares/errorHandling.js";
const app = express();
app.use(express.static("public"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(campRoutes);
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});