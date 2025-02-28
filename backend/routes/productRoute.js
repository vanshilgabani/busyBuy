import express from 'express';
import {
    listProducts,
    addOrUpdateProduct,
    removeProduct,
    singleProduct,
    toggleBestseller,
    toggleOutofStock
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Add or update product
productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), addOrUpdateProduct);

productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct); 
productRouter.get('/list', listProducts);
productRouter.post('/toggle-bestseller', adminAuth, toggleBestseller);
productRouter.post('/toggle-OutofStock', toggleOutofStock);

export default productRouter;