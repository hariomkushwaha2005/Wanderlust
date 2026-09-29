import mongoose from "mongoose";
import dns from "node:dns";
import "dotenv/config";
import initData from "./data.js";
import featuredData from "./featuredData.js";
import Listing from "../models/listing.js";
import Review from "../models/reviews.js";
import User from "../models/user.js";

const mongoUrl = process.env.ATLASDBURL || "mongodb://127.0.0.1:27017/wanderlust";
const dnsServers = (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
}

const demoUsers = [
    { username: "wanderlust_ava", email: "ava@example.com" },
    { username: "wanderlust_noah", email: "noah@example.com" },
    { username: "wanderlust_mia", email: "mia@example.com" },
    { username: "wanderlust_liam", email: "liam@example.com" },
];

const reviewComments = [
    [
        "The ocean view was even better than the photos. We loved the easy beach access.",
        "A peaceful, comfortable stay with a wonderful location.",
        "Everything was spotless and the sunset from the cottage was unforgettable.",
    ],
    [
        "A great base for exploring the city, with everything we needed nearby.",
        "Bright, comfortable, and exactly as described. I would stay here again.",
        "The loft was stylish and convenient for our weekend in town.",
    ],
    [
        "Beautiful mountain scenery and a genuinely restful place to unplug.",
        "The cabin was cozy, clean, and close to some lovely trails.",
        "Quiet mornings and amazing views made this trip special.",
    ],
    [
        "The villa made a perfect home base for exploring Tuscany.",
        "Lovely details throughout and a relaxing place to come back to.",
        "A memorable stay, especially enjoying the countryside around Florence.",
    ],
];

const coordinates = [
    [-118.7798, 34.0259],
    [-74.006, 40.7128],
    [-106.8175, 39.1911],
    [11.2558, 43.7696],
];

async function seedDemoData() {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Refusing to seed demo data in production.");
    }

    const demoPassword = process.env.SEED_DEMO_PASSWORD;
    if (!demoPassword) {
        throw new Error("SEED_DEMO_PASSWORD is required to create demo accounts.");
    }

    await mongoose.connect(mongoUrl, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
    });

    const alphaHouses = await Listing.find({ title: /alpha house/i }).select("_id");
    for (const alphaHouse of alphaHouses) {
        await Listing.findOneAndDelete({ _id: alphaHouse._id });
    }

    const users = [];
    for (const userData of demoUsers) {
        let user = await User.findOne({ username: userData.username });
        if (!user) {
            user = await User.register(new User(userData), demoPassword);
        }
        users.push(user);
    }

    async function upsertListing(listingData, comments, listingCoordinates) {
        const ownerIndex = [...listingData.title].reduce(
            (total, character) => total + character.charCodeAt(0),
            0,
        ) % users.length;
        const listing = await Listing.findOneAndUpdate(
            { title: listingData.title },
            {
                $set: {
                    ...listingData,
                    geometry: {
                        type: "Point",
                        coordinates: listingCoordinates,
                    },
                },
                $setOnInsert: { owner: users[ownerIndex]._id },
            },
            { returnDocument: "after", upsert: true, runValidators: true },
        );

        for (const [reviewIndex, comment] of comments.entries()) {
            const author = users[(ownerIndex + reviewIndex + 1) % users.length];
            const matchingReviews = await Review.find({
                _id: { $in: listing.reviews },
                comment,
            }).sort({ createdAt: 1, _id: 1 });
            let review = matchingReviews[0];
            const duplicateIds = matchingReviews.slice(1).map(({ _id }) => _id);
            if (duplicateIds.length > 0) {
                await Review.deleteMany({ _id: { $in: duplicateIds } });
                const duplicateIdSet = new Set(duplicateIds.map((id) => id.toString()));
                listing.reviews = listing.reviews.filter(
                    (reviewId) => !duplicateIdSet.has(reviewId.toString()),
                );
            }
            if (!review) {
                review = await Review.create({
                    comment,
                    rating: [5, 4, 5][reviewIndex],
                    author: author._id,
                });
            }
            if (!listing.reviews.some((reviewId) => reviewId.equals(review._id))) {
                listing.reviews.push(review._id);
            }
        }
        await listing.save();
    }

    for (const [listingIndex, listingData] of initData.slice(0, 4).entries()) {
        await upsertListing(listingData, reviewComments[listingIndex], coordinates[listingIndex]);
    }

    for (const listingData of featuredData) {
        const { sampleReviews, ...listing } = listingData;
        await upsertListing(listing, sampleReviews, listing.geometry.coordinates);
    }

    console.log(`Removed ${alphaHouses.length} Alpha House listing(s).`);
    console.log(`Demo data is ready: 4 users, ${4 + featuredData.length} listings, and ${12 + featuredData.length * 3} reviews.`);
    console.log(`Usernames: ${demoUsers.map(({ username }) => username).join(", ")}`);
}

seedDemoData()
    .catch((error) => {
        console.error("Unable to seed demo data:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
