import express from "express";
const router = express.Router({ mergeParams: true });

import { isReviewAuthor, validateReview, isLoggedIn } from "../middleware.js";
import reviewController from "../controllers/reviews.js";

// Review routes are nested under each listing and are protected by auth and author checks.


// Add a review to the listing identified by the parent route.
router.post("/", isLoggedIn, validateReview, reviewController.createReview);

// Delete a review written by the current user.
router.delete("/:rid", isLoggedIn, isReviewAuthor, reviewController.destroyReview);


export default router;