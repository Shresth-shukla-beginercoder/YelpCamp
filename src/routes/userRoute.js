import express from "express";

import {
    createUsr,
    loginUsr,
    logoutUsr
} from "../controllers/userController.js";

const router = express.Router();

// SHOW REGISTER PAGE
router.get("/register", (req, res) => {
    res.render("pages/register");
});

// SHOW LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("pages/login", {
        error: null,
        email: ""
    });
});

// REGISTER
router.post("/register", createUsr);

// LOGIN
router.post("/login", loginUsr);

// LOGOUT
router.post("/logout", logoutUsr);

export default router;