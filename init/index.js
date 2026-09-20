import mongoose from "mongoose";
import initData from "./data.js";
import Listing from "../models/listing.js";

// Seed script that clears the listings collection and repopulates it with sample data.
const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected!");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongoUrl);
}

const initDB = async () => {
    await Listing.deleteMany({});
    let newData = initData.map((listing) => ({
        ...listing,
        owner: "6a9829682d0ebb3d8f850f5e",
        geometry: listing.geometry ?? {
            type: "Point",
            coordinates: [0, 0],
        },
    }));
    await Listing.insertMany(newData);
    console.log("initialized!");
    mongoose.connection.close();
};

initDB();
