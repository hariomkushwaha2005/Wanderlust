import User from "../models/user.js";

// Authentication controller: handles registration, login, and logout plus redirect safety.
const sanitizeRedirect = (value, fallback = "/listings") => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("//") || !trimmed.startsWith("/")) {
        return fallback;
    }
    return trimmed;
};

const renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

const signupUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // Passport completes the session setup through this callback.
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

const renderLoginForm = (req, res) => {
    const redirectUrl = sanitizeRedirect(req.session.returnTo || req.query.returnTo || "/listings");
    res.render("users/login.ejs", { redirectUrl });
};

const loginUser = (req, res) => {
    const redirectUrl = sanitizeRedirect(req.body.returnTo || res.locals.redirectUrl || req.session.returnTo || "/listings");
    delete req.session.returnTo;
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
};

const logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
};

export default {
    renderSignupForm,
    signupUser,
    renderLoginForm,
    loginUser,
    logoutUser,
};
