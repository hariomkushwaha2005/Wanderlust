if (process.env.NODE_ENV !== "production") {
    await import("dotenv/config");
}
import path from "path";
import dns from "node:dns";
import express from "express";
import ejsMate from "ejs-mate";
import passport from "passport";
import mongoose from "mongoose";
import flash from "connect-flash";
import { fileURLToPath } from "url";
import User from "./models/user.js";
import session from "express-session";
import userRouter from "./routes/users.js";
import LocalStrategy from "passport-local";
import methodOverride from "method-override";
import reviewRouter from "./routes/reviews.js";
import listingRouter from "./routes/listings.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressError from "./utils/ExpressError.js";
import MongoStore from 'connect-mongo';

// Shared Express app setup for the Wanderlust application.
// This file wires up middleware, authentication, routers, and the MongoDB connection.
const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
    app.set("trust proxy", 1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default local MongoDB connection if no environment variable is supplied.
const mongoUrl = process.env.ATLASDBURL;
const mongoDnsServers = (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

if (mongoDnsServers.length > 0) {
    dns.setServers(mongoDnsServers);
}

// Start the HTTP server when this app is running outside of the automated test environment.
// Keeping this logic separate makes it easier to test the Express app without binding a port.
const startServer = async () => {
    try {
        if (!mongoUrl) {
            throw new Error("ATLASDBURL is missing from the environment");
        }

        await mongoose.connect(mongoUrl, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        });
        console.log("connected!");

        const PORT = process.env.PORT || 8080;
        const server = app.listen(PORT, () => {
            console.log(`listening on port ${PORT}!`);
        });
        server.on("error", (err) => {
            console.error(`Unable to listen on port ${PORT}:`, err.message);
            process.exit(1);
        });
        return server;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "test") {
    startServer();
}

// Use EJS with ejs-mate so shared layout/boilerplate templates can be reused across pages.
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: "Too many requests, please try again later.",
    })
);

// Register request parsing and static asset middleware.
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration: keep login state across requests and secure cookies in production.
const store = MongoStore.create({
    mongoUrl: mongoUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Configure Passport for session-based authentication.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Expose flash messages and the authenticated user to all templates through res.locals.
const setViewLocals = (req, res) => {
    res.locals.success = typeof req.flash === "function" ? req.flash("success") || [] : [];
    res.locals.error = typeof req.flash === "function" ? req.flash("error") || [] : [];
    res.locals.curUser = req.user || null;
};

app.use((req, res, next) => {
    setViewLocals(req, res);
    next();
});

// Root route sends users to the main listings page for a predictable landing experience.
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Route modules keep the app organized by feature: listings, reviews, and auth/account pages.
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Convert unmatched requests into a consistent 404 error.
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
});

// Render errors returned by routes and middleware.
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong!" } = err;
    setViewLocals(req, res);
    res.status(status).render("error.ejs", { message });
});

export { app, startServer };

