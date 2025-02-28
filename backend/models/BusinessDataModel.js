import mongoose from "mongoose";

const BusinessDataSchema = new mongoose.Schema({
    totalSales: {
        type: Number,
        default: 0
    },
    avgOrderValue: {
        type: Number,
        default: 0
    },
    paymentMethodPercentages: {
        cod: {
            type: Number,
            default: 0
        },
        razorpay: {
            type: Number,
            default: 0
        }
    },
    totalOrdersCount: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('BusinessData', BusinessDataSchema);