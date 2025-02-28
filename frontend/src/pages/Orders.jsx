import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { format } from 'date-fns';
import { assets } from '../assets/assets'; // Import assets for default image
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Orders = () => {
    const { backendUrl, token, currency, delivery_fee } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [cancelMessage, setCancelMessage] = useState(''); // State for cancellation message
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    // Function to load user orders
    const loadOrderData = async () => {
        try {
            if (!token) return;

            const response = await axios.post(
                `${backendUrl}/api/order/userorders`,
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                const groupedOrders = response.data.orders.map((order) => ({
                    ...order,
                    totalAmount: order.items.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                    ) + delivery_fee,
                }));
                setOrders(groupedOrders.reverse());
            }
        } catch (error) {
            console.error('Error loading order data:', error);
        }
    };

// Function to group items by name and sizes for display
    const groupItemsByName = (items) => {
            const groupedItems = {};
            items.forEach(item => {
                const itemName = item.name;
                if (!groupedItems[itemName]) {
                    groupedItems[itemName] = {
                        ...item,
                        _id: item._id, 
                        totalQuantity: 0,
                        sizes: {},
                        formattedName: `${itemName}`
                    };
                }
                groupedItems[itemName].totalQuantity += item.quantity;
                groupedItems[itemName].sizes[item.size] = (groupedItems[itemName].sizes[item.size] || 0) + item.quantity;
            });
            return Object.values(groupedItems);
        };

    // Helper function to format sizes and quantities for display
    const formatSizes = (sizes) => {
        if (!sizes || Object.keys(sizes).length === 0) return '[Sizes: N/A]';
        const sizeArray = Object.entries(sizes)
            .map(([size, quantity]) => `${quantity}${size}`);
        return `[${sizeArray.join(', ')}]`;
    };

    // Helper function to safely format dates to dd/MM/yyyy using date-fns
    const formatDate = (date) => {
        try {
            return date ? format(new Date(date), 'dd/MM/yyyy') : 'Invalid Date';
        } catch {
            return 'Invalid Date';
        }
    };

    // Function to handle order cancellation
    const handleCancelOrder = async (orderId) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/order/cancel`,
                { orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCancelMessage(response.data.message);
                loadOrderData(); // Refresh order data to reflect cancellation
                setTimeout(() => setCancelMessage(''), 3000); // Clear message after 3 seconds
            } else {
                setCancelMessage(response.data.message); // Display error message
                setTimeout(() => setCancelMessage(''), 3000); // Clear message after 3 seconds
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            setCancelMessage('Failed to cancel order. Please try again.');
            setTimeout(() => setCancelMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    // Function to check if order is within 24 hours
    const isWithinCancelWindow = (orderDate) => {
        const orderDateTime = new Date(orderDate);
        const now = new Date();
        const timeDiff = now - orderDateTime;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= 24;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await loadOrderData();
            setLoading(false);
        };

        fetchData();
    }, [token]);

    return (
        <div className="border-t pt-16">
            <div className="text-2xl">
                <Title text1="MY" text2="ORDERS" />
            </div>

            {cancelMessage && (
                <div className={`mt-4 p-3 text-center ${cancelMessage.startsWith('Success') ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'} rounded-md`}>
                    {cancelMessage}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                <p className="text-lg font-semibold text-gray-700">Loading orders...</p>
                </div>
            ) : (
            <div>
                {orders.map((order, index) => (
                    <div key={index} className="py-4 border-t border-b text-gray-700">
                        {/* Order Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm sm:text-base font-medium">
                                    Date: {formatDate(order.date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm sm:text-base font-semibold">
                                    Total: {currency}
                                    {order.totalAmount.toFixed(2)}
                                    <span>{" "}</span>
                                    <span className="text-xs text-gray-500 font">(Incl. shipping)</span>
                                </p>
                                <div className='font-semibold'>

                                    <p className={`${order.payment ? 'text-green-500' : 'text-yellow-500'}`}>
                                        <span className='text-gray-900 font-normal'>Payment : </span>
                                        {order.refunded ? <span className="text-purple-800">Refunded</span> : order.payment ? "Done" : "Pending"}{" "}
                                        <span className='text-blue-300'>({order.paymentMethod})</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items - Displaying all item details in order list */}
                        <div className="flex flex-wrap gap-10">
                            {groupItemsByName(order.items).map((groupedItem, idx) => {
                                return (
                                  <div
                                        key={idx}
                                        className="flex items-start gap-4 py-2 text-sm sm:w-auto cursor-pointer" // Added cursor-pointer
                                        onClick={() => navigate(`/product/${groupedItem._id}`)} // Added onClick
                                  >
                                    <img
                                        className="w-16 sm:w-20 h-auto object-cover"
                                        src={groupedItem.image[0]}
                                        alt={groupedItem.name}
                                    />
                                    <div>
                                        <p className="sm:text-base font-medium">{groupedItem.formattedName}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mt-1 text-base text-gray-700">
                                            <p>
                                                Quantity: {groupedItem.totalQuantity} <span className="font-bold">{formatSizes(groupedItem.sizes)}</span>
                                            </p>
                                            <p className='font-semibold'>Price: {currency}{groupedItem.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        </div>

                        {/* Order Status and Cancel Button */}
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-center">
                                <p className="flex items-center justify-center gap-2 text-sm">
                                    <span
                                        className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Cancelled' ? 'bg-red-500' : order.status === 'Order Placed' || order.status === 'Out for delivery' ? 'bg-blue-500' : 'bg-yellow-400'}`}
                                    ></span>
                                    <span>
                                        {(order.status || 'Order Placed')} on{' '}
                                        <span className="text-gray-400">
                                            {formatDate(order.deliveryDate || order.date)}
                                        </span>
                                    </span>
                                </p>
                            </div>

                            {/* Cancel Button - Conditionally Rendered */}
                            {isWithinCancelWindow(order.date) && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="px-3 py-1.5 bg-red-600 text-xs text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>

    );
};

export default Orders;