import Review from "../models/reviews.js";
import Listing from "../models/listing.js";

// Review handlers keep the listing's review array and the review document in sync.

const createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }

    let newreview = new Review(req.body.review);
    newreview.author = req.user._id;

    // Keep the review document and its reference on the listing in sync.
    listing.reviews.push(newreview);

    await newreview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${req.params.id}`);
};

const destroyReview = async (req, res) => {
    let { id, rid } = req.params;
    await Listing.findByIdAndUpdate(id, {
        $pull: {
            reviews: rid
        }
    });
    await Review.findByIdAndDelete(rid);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};

export default {
    createReview,
    destroyReview,
};

