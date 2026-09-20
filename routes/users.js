import express from "express";
import passport from "passport";
import { saveRedirectUrl } from "../middleware.js";
import userController from "../controllers/users.js";
const router = express.Router();

// Authentication routes: signup, login, and logout.
// The login flow saves a safe return destination before redirecting to the protected page.

// Display the account creation form.
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(userController.signupUser);

// Display the login form.
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }), userController.loginUser);

// Log the user out of the session.

router.route("/logout")
    .get(userController.logoutUser)
    .post(userController.logoutUser);


export default router;