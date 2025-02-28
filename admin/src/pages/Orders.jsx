import React, { useEffect, useState, useCallback } from "react"; 
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { format } from "date-fns";
import SearchBar from "../components/SearchBarOrder";

const Orders = ({ token, shippingFee = 100 }) => {
  console.log("Orders.jsx - Token Prop Received:", token)

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const calculateTotalAmountForOrder = (order, currentShippingFee = shippingFee) => {
        const totalItemAmount = order.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        return totalItemAmount + currentShippingFee;
    };

    const calculateTotalSalesForOrders = (currentOrders, currentShippingFee = shippingFee) => {
        if (!currentOrders || !currentOrders.length) return 0;
        return currentOrders.reduce(
            (total, order) => total + calculateTotalAmountForOrder(order, currentShippingFee),
            0
        ).toFixed(2);
    };

    const calculateAvgOrderValueForOrders = (currentOrders, currentShippingFee = shippingFee) => {
        if (!currentOrders || !currentOrders.length) return 0; // Avoid division by zero
        const totalRevenue = calculateTotalSalesForOrders(currentOrders, currentShippingFee);
        return (totalRevenue / currentOrders.length).toFixed(2);
    };

    const calculatePaymentMethodPercentagesForOrders = (currentOrders) => {
        if (!currentOrders || !currentOrders.length) return { cod: 0, razorpay: 0 };
        const codCount = currentOrders.filter((order) => order.paymentMethod === "COD").length;
        const razorpayCount = currentOrders.filter((order) => order.paymentMethod === "Razorpay").length;
        const codPercentage = ((codCount / currentOrders.length) * 100).toFixed(2);
        const razorpayPercentage = ((razorpayCount / currentOrders.length) * 100).toFixed(2);
        return { cod: codPercentage, razorpay: razorpayPercentage };
    };

    const calculatePendingOrdersCountForOrders = (currentOrders) => {
        if (!currentOrders) return 0;
        return currentOrders.filter((order) => order.status === "Pending").length;
    };

    // --- FUNCTION TO UPDATE BUSINESS DATA ON BACKEND ---
    const updateBusinessDataOnBackend = useCallback(async (currentOrders) => { // Use useCallback
        if (!token) return;
        try {
            const shippingFeeForCalculation = shippingFee; // Use shippingFee prop for calculations
            const businessDataPayload = {
                totalSales: calculateTotalSalesForOrders(currentOrders, shippingFeeForCalculation),
                avgOrderValue: calculateAvgOrderValueForOrders(currentOrders, shippingFeeForCalculation),
                paymentMethodPercentages: calculatePaymentMethodPercentagesForOrders(currentOrders),
            };

            await axios.post(`${backendUrl}/api/business/update-data`, businessDataPayload, {
                headers: { token }
            });
            // No need to handle success message for background updates
        } catch (error) {
            console.error("Error updating business data on backend:", error);
            // Optionally handle error, maybe log it or show a silent error message if needed for debugging
        }
    }, [token, shippingFee]); // Dependencies for useCallback

    // Fetch all orders and update business data initially
    const fetchAllOrders = async () => {
        if (!token) return;
        try {
            const response = await axios.post(
                `${backendUrl}/api/order/list`,
                {},
                { headers: { token } }
            );
            if (response.data.success) {
                const allOrders = response.data.orders.reverse();
                const ordersWithRefunded = allOrders.map(order => ({ ...order, refunded: order.refunded ?? false }));
                setOrders(allOrders);
                setFilteredOrders(allOrders); // Initially show all orders
                updateBusinessDataOnBackend(allOrders); // Update business data after fetching orders initially
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAllOrders();
    }, [token, updateBusinessDataOnBackend]); 


    const handleSearch = (query) => {
        const filtered = orders.filter((order) => {
            const totalAmount = calculateTotalAmountForOrder(order).toFixed(2); 
            const customerName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
            const date = formatDate(order.date).toLowerCase();
            const paymentMethod = order.paymentMethod.toLowerCase();
            const paymentStatus = (order.refunded ? "Refunded" : order.payment ? "Done" : "Pending").toLowerCase();
            const matchesName = order.items.some((item) =>
                item.name.toLowerCase().includes(query)
            );
            const status = order.status.toLowerCase();

            return (
                matchesName ||
                customerName.includes(query) ||
                date.includes(query) ||
                totalAmount.includes(query) ||
                status.includes(query) ||
                paymentMethod.includes(query)||
                paymentStatus.includes(query)
            );
        });
        setFilteredOrders(filtered);
    };


    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy");
        } catch {
            return "Invalid Date";
        }
    };

    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        const cancelledBy = newStatus === 'Cancelled' ? 'Admin' : null;

        // Optimistically update the UI
        const updatedOrders = orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        updateBusinessDataOnBackend(updatedOrders); // Update business data after status change

        try {
            const response = await axios.post(
                `${backendUrl}/api/order/status`,
                { orderId, status: newStatus, cancelledBy },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Order status updated successfully");
            } else {
                throw new Error(response.data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating order status");
            fetchAllOrders(); // Re-fetch to ensure UI is correct
        }
    };

    const updatePaymentStatus = async (orderId, currentPaymentStatus, orderStatus, currentRefundedStatus) => { // Include currentRefundedStatus
        try {
            let action;
    
            if (orderStatus === "Cancelled") {
                action = "refund";
            } else if (currentPaymentStatus) {
                action = "markAsUnpaid";
            } else {
                action = "markAsPaid";
            }
    
            const response = await axios.post(
                `${backendUrl}/api/order/updatePaymentStatus`,
                { orderId, action },
                { headers: { token } }
            );
    
            if (!response.data.success) {
                toast.error(response.data.message || "Failed to update payment status");
            } else {    
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, payment: response.data.order.payment, refunded: response.data.order.refunded } : order // Update both payment and refunded
                    )
                );
    
                setFilteredOrders((prevFilteredOrders) =>
                    prevFilteredOrders.map((order) =>
                        order._id === orderId ? { ...order, payment: response.data.order.payment, refunded: response.data.order.refunded } : order // Update both
                    )
                );
                updateBusinessDataOnBackend(orders);
            }
        } catch (error) {
            toast.error("Error updating payment status");
        }
    };

    const openModal = (items) => {
        const images = items.reduce((acc, item) => {
            const existingProduct = acc.find(
                (product) => product.imageUrl === (item.image[0] || assets.parcel_icon)
            );

            if (existingProduct) {
                const existingSize = existingProduct.sizes.find(
                    (size) => size.size === item.size
                );

                if (existingSize) {
                    existingSize.quantity += item.quantity;
                } else {
                    existingProduct.sizes.push({ size: item.size || "N/A", quantity: item.quantity });
                }
            } else {
                acc.push({
                    imageUrl: item.image[0] || assets.parcel_icon,
                    sizes: [{ size: item.size || "N/A", quantity: item.quantity }],
                });
            }

            return acc;
        }, []);

        setSelectedImages(images);
        setIsModalOpen(true);
    };

    const formatSizes = (sizes, itemName) => { // Pass itemName as well
      if (!sizes || sizes.length === 0) {
          return itemName; // If no sizes, just return item name
      }
  
      if (sizes.length === 1 && sizes[0].size === "N/A" && sizes[0].quantity === 1) {
          return itemName; // If only "N/A" size with quantity 1, just return item name
      }
  
      return sizes
          .map((size) => {
              if (size.size && size.size !== "N/A") { // Only include size if it's not "N/A" and exists
                  return `${size.quantity} (${size.size})`;
              } else {
                  return `${size.quantity}`; // If size is "N/A" or missing, just show quantity (if relevant) - adjust as needed
              }
          })
          .join(", ");
  };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="mb-2 text-2xl font-semibold">
                    Orders{" "}
                    <span className="text-2xl font-bold text-gray-800">
                        ({filteredOrders.length})
                    </span>
                    <p
                        className={`ml-auto text-sm ${calculatePendingOrdersCountForOrders(orders) === 0 ? "text-green-500" : "text-red-500"
                            }`}
                    >
                        Pending Orders: {calculatePendingOrdersCountForOrders(orders)}
                    </p>
                </p>
            </div>
            <SearchBar onSearch={handleSearch} />

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <p className="text-lg font-semibold text-gray-700">Loading orders...</p>
                </div>
            ) : (
                <div>
                    {filteredOrders.map((order, index) => (
                        <div
                            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
                            key={index}
                        >
                            <div
                                className="relative cursor-pointer"
                                onClick={() => openModal(order.items)}
                            >
                                <p className="text-xs text-gray-400">(Click on Image)</p>
                                <img
                                    className="w-18 h-18 object-cover"
                                    src={order.items[0]?.image?.[0] || assets.parcel_icon}
                                    alt={order.items[0]?.name || "Order Image"}
                                />
                            </div>

                            <div>
                            {Object.values(
                                    order.items.reduce((acc, item) => {
                                        const key = item.name;
                                        if (!acc[key]) {
                                            acc[key] = { ...item, sizes: [] };
                                        } else {
                                            const existingSize = acc[key].sizes.find((size) => size.size === item.size);
                                            if (existingSize) {
                                                existingSize.quantity += item.quantity;
                                            } else {
                                                acc[key].sizes.push({ size: item.size, quantity: item.quantity });
                                            }
                                        }
                                        return acc;
                                    }, {})
                                ).map((item, idx) => (
                                    <p className="py-0.5" key={idx}>
                                        {item.name} {item.sizes && item.sizes.length > 0 ? `- ${formatSizes(item.sizes, item.name)}` : ''}
                                    </p>
                                ))}

                                <p className="mt-3 mb-2 font-medium">
                                    {order.address.firstName + " " + order.address.lastName}
                                </p>
                                <div>
                                    <div>{order.address.street + ","}</div>
                                    <div>
                                        {order.address.city +
                                        ", " +
                                        order.address.state +
                                        ", " +
                                        order.address.country +
                                        ", " +
                                        order.address.zipcode}
                                    </div>
                                </div>
                                <p className="font-semibold">
                                    Phone: {order.address.phone}
                                    {order.address.alternatePhone && `, ${order.address.alternatePhone}`}
                                </p>
                            </div>
                            <div>
                                <p>Products: {order.items.length}</p>
                                <p>Method: {order.paymentMethod}</p>
                                <p className="font-semibold">
                                    <span className="font-normal">Payment: </span>
                                    {order.refunded ? "Refunded" : order.payment ? "Done" : "Pending"}</p>
                                <p>Date: {formatDate(order.date)}</p>
                                {order.status === "Delivered" && order.deliveryDate && (
                                    <p>
                                        Delivered Date:
                                        <span className="text-gray-400">
                                            {formatDate(order.deliveryDate)}
                                        </span>
                                    </p>
                                )}
                                {order.status !== "Cancelled" && order.paymentMethod === "COD" && (
                                    <button
                                        onClick={() => updatePaymentStatus(order._id, order.payment, order.status, order.refunded)}
                                        className={`mt-2 px-4 py-2 rounded-md ${
                                            order.payment === true ? "bg-red-500" : "bg-green-500"
                                        } text-white transition-all duration-300`}
                                    >
                                        {order.payment === true ? "Mark as Unpaid" : "Mark as Paid"}
                                    </button>
                                )}
                                {order.status === "Cancelled" &&
                                            (order.payment === null || order.payment === undefined || order.payment === false) &&
                                            null // Hide the button if conditions are met
                                        }

                                        {/* The button will be rendered here ONLY if the above condition is FALSE */}
                                        {order.status === "Cancelled" &&
                                            !(order.payment === null || order.payment === undefined || order.payment === false) && // Payment is NOT pending
                                            (order.refunded === null || order.refunded === undefined || order.refunded === false) &&
                                            (
                                                <button
                                                    onClick={() => updatePaymentStatus(order._id, order.payment, order.status)}
                                                    className={`mt-2 px-4 py-2 rounded-md bg-yellow-500 text-white transition-all duration-300`}
                                                >
                                                    Refund
                                                </button>
                                            )
                                        }
                            </div>
                            <div>
                                <p className="text-sm sm:text-base font-semibold">
                                    {currency}
                                    {calculateTotalAmountForOrder(order).toFixed(2)}
                                <span className="font-normal">{" "}(Incl. Shipping)</span></p>
                                {order.status === "Cancelled" && order.cancelledBy && ( // Show cancelled by info
                                    <p className="text-xs text-red-500 mt-1">
                                        Cancelled by: {order.cancelledBy}
                                    </p>
                                )}
                            </div>
                            <select
                                onChange={(event) => statusHandler(event, order._id)}
                                value={order.status || "Pending"}
                                className="p-2 font-semibold cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Order Placed">Order Placed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for delivery">Out for delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative bg-white p-6 rounded-lg max-w-5xl w-full h-[80vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedImages.map((image, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={image.imageUrl}
                                        alt={`Product ${idx + 1}`}
                                        className="w-full h-auto object-cover rounded-lg"
                                    />
                                    <div
                                        className="absolute top-2 right-2 bg-gray-800 text-white rounded-lg"
                                        style={{ fontSize: "9px", padding: "1px 3px" }}
                                    >
                                        {formatSizes(image.sizes)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;