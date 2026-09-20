import Review from "./models/reviews.js";
import Listing from "./models/listing.js";
import { reviewSchema, listingSchema } from "./schema.js";
import ExpressError from "./utils/ExpressError.js";

// Accept only same-site relative redirects to prevent phishing/open-redirect attacks.
const sanitizeRedirect = (value, fallback = "/listings") => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("//") || !trimmed.startsWith("/")) {
        return fallback;
    }
    return trimmed;
};

// Protect routes that require an authenticated user before they can be accessed.
export const isLoggedIn = (req, res, next) => {
    // Save the requested page so the user can return after logging in.
    if (!req.isAuthenticated()) {
        req.session.returnTo = sanitizeRedirect(req.originalUrl || req.url, "/listings");
        req.flash("error", "You must be signed in to create a new listing!");
        return res.redirect("/login");
    }
    next();
};

// Preserve a safe post-login destination from either the request or session.
export const saveRedirectUrl = (req, res, next) => {
    // Make the saved destination available to the login controller once.
    if (req.body?.returnTo) {
        res.locals.redirectUrl = sanitizeRedirect(req.body.returnTo);
    } else if (req.session.returnTo) {
        res.locals.redirectUrl = sanitizeRedirect(req.session.returnTo);
        delete req.session.returnTo;
    }
    next();
};

// Ensure a user can only modify resources they own.
export const isOwner = async (req, res, next) => {
    // Protect listing changes by checking the authenticated user's ownership.
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "Listing doesn't belong to you!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Validate listing form submissions before they are persisted.
export const validateListing = (req, res, next) => {
    // Validate listing form data before it reaches the database.
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else next();
};

// Validate review payloads before a new review is added.
export const validateReview = (req, res, next) => {
    // Validate review form data before creating a review.
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else next();
};

// Only the review author should be able to delete that review.
export const isReviewAuthor = async (req, res, next) => {
    // Only the author of a review may delete it.
    let { id, rid } = req.params;
    let review = await Review.findById(rid);
    let listing = await Listing.exists({ _id: id, reviews: rid });
    if (!review || !listing) {
        req.flash("error", "Review doesn't exist!");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};