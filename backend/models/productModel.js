import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null }, 
    image: { type: [String], required: true }, 
    category: { type: Array, required: true },
    subCategory: { type: Array, required: true },
    sizes: { type: [String], required: true }, 
    bestseller: { type: Boolean, default: false },
    OutofStock: { type: Boolean, default: false},
    OrderCount: { type: Number, default: 0},
    date: { type: Date, default: Date.now } 
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
