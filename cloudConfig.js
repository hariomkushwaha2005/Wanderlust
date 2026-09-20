import * as cloudinaryPackage from 'cloudinary';
import multerStorageCloudinary from "multer-storage-cloudinary";

const cloudinaryStorageFactory = multerStorageCloudinary.default || multerStorageCloudinary;
const cloudinary = cloudinaryPackage.v2;

// Cloudinary is used for listing image uploads so the app can store files outside the local server.
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = cloudinaryStorageFactory({
    cloudinary: cloudinaryPackage,
    params: {
        folder: "Wanderlust_DEV",
        allowedFormats: ["jpeg", "png", "jpg"]
    }
});

export { cloudinary, storage };