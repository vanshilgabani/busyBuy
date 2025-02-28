import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// Function to add or update product
const addOrUpdateProduct = async (req, res) => {
    try {
        console.log("Received Files:", req.files);

        if (!req.body.name || !req.body.description || !req.body.price) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const images = [
            req.files.image1?.[0],
            req.files.image2?.[0],
            req.files.image3?.[0],
            req.files.image4?.[0]
        ].filter(Boolean);

        let imagesUrl = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];

        if (images.length > 0) {
            const uploadedImages = await Promise.all(
                images.map(async (item) => {
                    console.log("Uploading file:", item.path);
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
            imagesUrl = [...imagesUrl, ...uploadedImages];
        }

        const productData = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: Number(req.body.price),
            oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : null,
            subCategory: req.body.subCategory,
            bestseller: req.body.bestseller === "true",
            sizes: JSON.parse(req.body.sizes),
            image: imagesUrl,
            date: Date.now(),
        };

        let product;
        if (req.body.productId) {
            product = await productModel.findByIdAndUpdate(req.body.productId, productData, { new: true });
        } else {
            product = new productModel(productData);
            await product.save();
        }

        res.json({ success: true, message: "Product saved successfully", images: imagesUrl });
    } catch (error) {
        console.error("Error Adding/Updating Product:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const toggleBestseller = async (req, res) => {
    try {
        const { productId, bestseller } = req.body;

        if (!productId || bestseller === undefined) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            productId, 
            { bestseller: bestseller }, 
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Bestseller status updated", product: updatedProduct });
    } catch (error) {
        console.error("Error in toggleBestseller:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const toggleOutofStock = async (req, res) => {
    try {
        const { productId, OutofStock } = req.body;

        if (!productId || OutofStock === undefined) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            productId, 
            { OutofStock: OutofStock }, 
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Out of Stock status updated", product: updatedProduct });
    } catch (error) {
        console.error("Error in toggleOutofStock:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addOrUpdateProduct , removeProduct, singleProduct, toggleBestseller, toggleOutofStock }