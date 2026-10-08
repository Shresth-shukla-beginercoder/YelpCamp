import session from "express-session";

const sessionMiddleware = session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false
});

export default sessionMiddleware;