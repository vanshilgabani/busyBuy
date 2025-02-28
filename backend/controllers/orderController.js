import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';

// Global Variables
const currency = 'inr';
const deliveryCharge = 10;

// Gateway Initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Place Orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            status: "Pending",
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear the user's cart after placing the order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Place Orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            status: "Pending",
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges',
                },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Place Orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            status: "Pending",
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
        };

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error });
            }
            res.json({ success: true, order });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All Orders for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Received userId:", userId); // Log input

        const orders = await orderModel.find({ userId });
        console.log("Fetched orders from DB:", orders); // Log fetched data

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error in userOrders API:", error.message); // Log errors
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status, cancelledBy } = req.body; // Add cancelledBy field

        const updateData = { status };
        if (status === 'Delivered') {
            updateData.deliveryDate = new Date();
        } else if (status === 'Cancelled') {
            updateData.cancelledDate = new Date();
            updateData.cancelledBy = cancelledBy || 'Admin'; // Store who cancelled
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, action } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status !== 'Cancelled' && action !== 'refund') { // Normal payment updates
            if (action === 'markAsPaid') {
                order.payment = true;
                order.refunded = false; // Important: Reset refunded to false
            } else if (action === 'markAsUnpaid') {
                order.payment = false;
                order.refunded = false; // Important: Reset refunded to false
            }
        } else if (order.status === 'Cancelled' && action === 'refund') { // Refund
            order.payment = false; // You might want to set payment to false on refund
            order.refunded = true;
        } else {
            return res.status(400).json({ success: false, message: "Invalid action for this order status." });
        }

        await order.save();
        res.json({ success: true, message: getMessage(action), order });

    } catch (error) {
        console.error("Error in updatePaymentStatus:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getMessage = (action) => {
    switch (action) {
        case 'markAsPaid': return "Payment marked as Paid";
        case 'markAsUnpaid': return "Payment marked as Unpaid";
        case 'refund': return "Payment Refunded";
        default: return "Payment status updated";
    }
}

// User Cancel Order Feature
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled as it is already " + order.status.toLowerCase() });
        }

        const orderDate = new Date(order.date);
        const now = new Date();
        const timeDiff = now - orderDate;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return res.status(400).json({ success: false, message: "Order cancellation window (24 hours) has passed" });
        }

        const updateData = { status: 'Cancelled', cancelledDate: new Date(), cancelledBy: 'User' }; 
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });

        res.json({ success: true, message: "Order Cancelled Successfully", order: updatedOrder });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};    

export { verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, updatePaymentStatus, cancelOrder };
