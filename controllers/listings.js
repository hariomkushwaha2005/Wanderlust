import 'dotenv/config';
import express from 'express';
import Listing from "../models/listing.js";
import * as maptilerClient from '@maptiler/client';
import { cloudinary } from "../cloudConfig.js";
import ExpressError from "../utils/ExpressError.js";

// MapTiler is used to geocode user-entered places before saving a listing.
maptilerClient.config.apiKey = process.env.MAP_API_KEY;

const index = async (req, res) => {
    const category = req.query.category;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const query = {};
    if (category && category !== '') {
        query.categories = category;
    }

    if (search) {
        const searchPattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(searchPattern, "i");
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { categories: searchRegex },
        ];
    }

    const allListing = await Listing.find(query);
    res.render("listings/index.ejs", { allListing, category, search });
};

const createListing = async (req, res, next) => {
    try {
        const location = req.body.listing?.location;
        if (!location) {
            throw new ExpressError(400, "Location is required!");
        }

        const response = await maptilerClient.geocoding.forward(location, { limit: 1 });
        if (!response?.features?.length) {
            throw new ExpressError(400, "Location not found. Please enter a more specific place.");
        }

        const url = req.file ? req.file.path : null;
        const filename = req.file ? req.file.filename : null;
        req.body.listing.image = { url, filename };

        const newlisting = new Listing(req.body.listing);
        newlisting.owner = req.user._id;
        newlisting.geometry = response.features[0].geometry;
        await newlisting.save();

        req.flash("success", "New Listing Created!");
        return res.redirect("/listings");
    } catch (err) {
        if (err instanceof ExpressError) {
            req.flash("error", err.message);
            return res.redirect("/listings/new");
        }
        return next(err);
    }
};

const renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

const showListing = async (req, res) => {
    let { id } = req.params;
    // Load review authors and the listing owner for the detail page.
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

const renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url
        ? listing.image.url.replace("upload/", "upload/w_250/")
        : "https://via.placeholder.com/250x180?text=No+Image";

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

const updateListing = async (req, res, next) => {
    let { id } = req.params;

    try {
        let listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing doesn't exist!");
            return res.redirect("/listings");
        }

        let listingData = { ...req.body.listing };

        if (listingData.location && listingData.location !== listing.location) {
            const response = await maptilerClient.geocoding.forward(listingData.location, { limit: 1 });
            if (!response?.features?.length) {
                throw new ExpressError(400, "Location not found. Please enter a more specific place.");
            }
            listingData.geometry = response.features[0].geometry;
        }

        if (req.file) {
            if (listing.image?.filename) {
                await cloudinary.uploader.destroy(listing.image.filename);
            }
            listingData.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        } else if (listing.image) {
            listingData.image = listing.image;
        } else {
            delete listingData.image;
        }

        await Listing.findByIdAndUpdate(id, listingData, {
            runValidators: true,
        });

        req.flash("success", "Listing Updated!");
        return res.redirect(`/listings/${id}`);
    } catch (err) {
        if (err instanceof ExpressError) {
            req.flash("error", err.message);
            return res.redirect(`/listings/${id}/edit`);
        }
        return next(err);
    }
};

const destroyListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (listing?.image?.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
    }

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

export default {
    index,
    createListing,
    renderNewForm,
    showListing,
    renderEditForm,
    updateListing,
    destroyListing,
};