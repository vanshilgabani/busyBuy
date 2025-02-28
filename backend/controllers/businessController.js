import BusinessData from '../models/BusinessDataModel.js';
import Order from '../models/orderModel.js';

const updateBusinessData = async (req, res) => {
    try {
        const { totalSales, avgOrderValue, paymentMethodPercentages } = req.body;

        const totalOrdersCountResult = await getTotalOrdersCountInternal();
        let totalOrdersCount = 0;
        if (totalOrdersCountResult.success) {
            totalOrdersCount = totalOrdersCountResult.totalOrdersCount;
        }

        let latestBusinessData = await BusinessData.findOne().sort({ timestamp: -1 });

        if (latestBusinessData) {
            latestBusinessData.totalSales = totalSales;
            latestBusinessData.avgOrderValue = avgOrderValue;
            latestBusinessData.paymentMethodPercentages = paymentMethodPercentages;
            latestBusinessData.totalOrdersCount = totalOrdersCount;

            console.log("updateBusinessData - BusinessData BEFORE SAVE (existing):", latestBusinessData);
            await latestBusinessData.save();
            console.log("updateBusinessData - BusinessData AFTER SAVE (existing):", latestBusinessData);

        } else {
            const newBusinessData = new BusinessData({
                totalSales,
                avgOrderValue,
                paymentMethodPercentages,
                totalOrdersCount
            });

            console.log("updateBusinessData - New BusinessData BEFORE SAVE (new):", newBusinessData);
            await newBusinessData.save();
            latestBusinessData = newBusinessData;
            console.log("updateBusinessData - New BusinessData AFTER SAVE (new):", latestBusinessData);
        }

        res.status(200).json({ success: true, message: "Business data updated successfully", data: latestBusinessData });

    } catch (error) {
        console.error("updateBusinessData - ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update business data", error: error.message });
    }
};


const getTotalOrdersCountInternal = async () => {
    try {
        const totalOrdersCount = await Order.countDocuments({});
        return { success: true, totalOrdersCount };
    } catch (error) {
        console.error("Error fetching total orders count (internal):", error);
        return { success: false, error };
    }
};


const getLatestBusinessData = async (req, res) => {
    try {
        const latestData = await BusinessData.findOne().sort({ timestamp: -1 });
        if (latestData) {
            res.status(200).json({ success: true, data: latestData });
        } else {
            res.status(404).json({ success: false, message: "No business data found" });
        }
    } catch (error) {
        console.error("Error fetching latest business data:", error);
        res.status(500).json({ success: false, message: "Failed to fetch business data", error: error.message });
    }
};

const getTotalOrdersCount = async (req, res) => {
    try {
        console.log("businessController.js - getTotalOrdersCount function called...");
        const totalOrdersCount = await Order.countDocuments({});
        console.log("businessController.js - Total orders count from database:", totalOrdersCount);
        res.status(200).json({ success: true, totalOrdersCount });
        console.log("businessController.js - Response sent:", { success: true, totalOrdersCount });
    } catch (error) {
        console.error("businessController.js - Error fetching total orders count:", error);
        res.status(500).json({ success: false, message: "Failed to fetch total orders count", error: error.message });
        console.log("businessController.js - Error response sent:", { success: false, message: "Failed to fetch total orders count", error: error.message });
    }
};

const getSalesSummary = async (req, res) => {
    try {
        const salesSummary = await Order.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 },
                    orders: { $push: { _id: "$_id", date: "$createdAt", totalPrice: "$totalPrice" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    monthName: { $dateToString: { format: "%B", date: "$createdAt" } },
                    totalSales: 1,
                    orderCount: 1,
                    orders: 1
                }
            }
        ]);
        res.status(200).json({ success: true, salesSummary });
    } catch (error) {
        console.error("Error fetching sales summary:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sales summary", error: error.message });
    }
};

const getOrdersSummary = async (req, res) => {
    try {
        const ordersSummary = await Order.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    orders: { $push: { _id: "$_id", date: "$createdAt", items: "$items" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    monthName: { $dateToString: { format: "%B", date: "$createdAt" } },
                    totalOrders: 1,
                    orders: 1
                }
            }
        ]);
        res.status(200).json({ success: true, ordersSummary });
    } catch (error) {
        console.error("Error fetching orders summary:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders summary", error: error.message });
    }
};

export {
    updateBusinessData,
    getLatestBusinessData,
    getTotalOrdersCount,
    getSalesSummary,
    getOrdersSummary
};