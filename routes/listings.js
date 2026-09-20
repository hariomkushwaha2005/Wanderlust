import express from "express";
import { isLoggedIn, isOwner, validateListing } from "../middleware.js";
import listingController from "../controllers/listings.js";
import multer from "multer";
import { storage } from "../cloudConfig.js";

// Listing routes manage listing discovery, creation, editing, and deletion.
// Multer is used so uploaded images are stored via Cloudinary rather than on the local filesystem.
const upload = multer({ storage });
const router = express.Router({ mergeParams: true });

router.route("/")
    .get(listingController.index)
    .post(isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        listingController.createListing);

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(listingController.showListing)
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        listingController.updateListing)
    .delete(isLoggedIn, isOwner, listingController.destroyListing);

router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

export default router;