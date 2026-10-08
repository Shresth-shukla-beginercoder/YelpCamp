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
            return res.status(401).send("Invalid email or password");
        }

        // Check password
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Wrong password
        if (!isMatch) {
            return res.status(401).send("Invalid email or password");
        }
        req.session.userId = user.id;
        // Login successful
        res.redirect("/campground");

    } catch (error) {

        console.error(error);

        res.status(500).send("Something went wrong");

    }
}