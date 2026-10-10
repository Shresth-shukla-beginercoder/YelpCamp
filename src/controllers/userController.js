import bcrypt from "bcrypt";
import {
    createUser,
    getUserByEmail
} from "../models/userModel.js";

export async function createUsr(req, res) {

    const { username, email, password } = req.body;

    await createUser(username, email, password);

    res.redirect("/login");
}

export async function loginUsr(req, res) {

    try {

        const { email, password } = req.body;

        const user = await getUserByEmail(email);

        // User does not exist
        if (!user) {
            return res.status(401).render("pages/login", {
                error: "Invalid email or password. Please check your credentials and try again.",
                email: email
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Wrong password
        if (!isMatch) {
            return res.status(401).render("pages/login", {
                error: "Invalid email or password. Please check your credentials and try again.",
                email: email
            });
        }
        req.session.userId = user.id;
        // Login successful
        res.redirect("/campground");

    } catch (error) {

        console.error(error);

        res.status(500).render("pages/login", {
            error: "Something went wrong. Please try again later.",
            email: req.body.email || ""
        });

    }
}

export function logoutUsr(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
}