import express from 'express';
import { updateBusinessData, getLatestBusinessData, getTotalOrdersCount, getSalesSummary, getOrdersSummary } from '../controllers/businessController.js';
import adminAuth from '../middleware/adminAuth.js';

const businessRouter = express.Router();

businessRouter.post('/update-data', adminAuth, updateBusinessData);
businessRouter.get('/latest-data', adminAuth, getLatestBusinessData);
businessRouter.get('/total-orders-count', adminAuth, getTotalOrdersCount);
businessRouter.get('/sales-summary', adminAuth, getSalesSummary);
businessRouter.get('/orders-summary', adminAuth, getOrdersSummary);

export default businessRouter;
