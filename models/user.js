import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

// User model stores the minimum fields needed for Passport's local strategy.
// Passport Local Mongoose adds username and password authentication fields.
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

export default mongoose.model("User", userSchema);