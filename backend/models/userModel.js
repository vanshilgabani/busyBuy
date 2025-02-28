import mongoose from "mongoose";
import validator from "validator"; // Import validator

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email is not valid'
        }
    },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    address: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipcode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true }
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }  
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;