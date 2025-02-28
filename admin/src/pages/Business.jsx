import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { format } from 'date-fns';

const Business = ({ token }) => {

    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return format(date, "dd/MM/yyyy");
        } catch (error) {
            console.error("Date parsing error:", error, timestamp);
            return "Invalid Date";
        }
    };

    const [businessData, setBusinessData] = useState({
        totalSales: null,
        avgOrderValue: null,
        paymentMethodPercentages: null,
        pendingOrdersCount: null,
        loading: true,
    });
    const [totalOrders, setTotalOrders] = useState(null);
    const [salesSummary, setSalesSummary] = useState(null);
    const [ordersSummary, setOrdersSummary] = useState(null);
    const [showDetailedSales, setShowDetailedSales] = useState(false);
    const [showDetailedOrders, setShowDetailedOrders] = useState(false);

    useEffect(() => {
        const fetchBusinessData = async () => {
            setBusinessData(prevState => ({ ...prevState, loading: true }));
            try {
                const headersToSend = { token: token };
                const response = await axios.get(`${backendUrl}/api/business/latest-data`, { headers: headersToSend });

                if (response.data.success) {
                    setBusinessData({ ...response.data.data, loading: false });
                } else {
                    toast.error(response.data.message || "Failed to load business data");
                    setBusinessData({ ...businessData, loading: false, totalSales: 0, avgOrderValue: 0, paymentMethodPercentages: { cod: 0, razorpay: 0 }, pendingOrdersCount: 0 });
                }
            } catch (error) {
                console.error("Error fetching business data:", error);
                toast.error("Error loading business data");
                setBusinessData({ ...businessData, loading: false, totalSales: 0, avgOrderValue: 0, paymentMethodPercentages: { cod: 0, razorpay: 0 }, pendingOrdersCount: 0 });
            }
        };

        fetchBusinessData();
    }, [backendUrl, token]);

    useEffect(() => {
        const fetchTotalOrdersCount = async () => {
            if (!token) return;
            try {
                const headersToSend = { token: token };
                const response = await axios.get(`${backendUrl}/api/business/total-orders-count`, { headers: headersToSend });

                if (response.data.success) {
                    setTotalOrders(response.data.totalOrdersCount);
                } else {
                    console.error("Failed to fetch total orders count:", response.data.message);
                    setTotalOrders(0);
                }
            } catch (error) {
                console.error("Error fetching total orders count:", error);
                setTotalOrders(0);
            }
        };
        fetchTotalOrdersCount();
    }, [backendUrl, token]);

    const fetchSalesSummaryData = async () => {
        if (!token) return;
        try {
            const headersToSend = { token: token };
            const response = await axios.get(`${backendUrl}/api/business/sales-summary`, { headers: headersToSend });
            if (response.data.success) {
                setSalesSummary(response.data.salesSummary);
            } else {
                console.error("Failed to fetch sales summary:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching sales summary:", error);
        }
    };

    const fetchOrdersSummaryData = async () => {
        if (!token) return;
        try {
            const headersToSend = { token: token };
            const response = await axios.get(`${backendUrl}/api/business/orders-summary`, { headers: headersToSend });
            if (response.data.success) {
                setOrdersSummary(response.data.ordersSummary);
            } else {
                console.error("Failed to fetch orders summary:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching orders summary:", error);
        }
    };

    const handleTotalSalesClick = () => {
        setShowDetailedSales(!showDetailedSales);
        if (!showDetailedSales && !salesSummary) {
            fetchSalesSummaryData();
        }
    };

    const handleTotalOrdersClick = () => {
        setShowDetailedOrders(!showDetailedOrders);
        if (!showDetailedOrders && !ordersSummary) {
            fetchOrdersSummaryData();
        }
    };

    if (businessData.loading || totalOrders === null) { 
        return <div className='text-lg font-semibold text-gray-700 items-center flex justify-center min-h-[300px]'>Loading Business Data...</div>;
    }

    if (businessData.totalSales === null || businessData.avgOrderValue === null || businessData.paymentMethodPercentages === null || businessData.pendingOrdersCount === null) {
        return <div className='text-lg font-semibold text-gray-700 items-center flex justify-center min-h-[300px]'>Loading Business Data...</div>; 
    }


    return (
        <div className="business-dashboard">
            <h2 className="text-2xl font-bold mb-4">Business Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={handleTotalSalesClick} className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 bg-white shadow-md rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">Total Sales</h3>
                        <p className="text-2xl font-bold text-green-600">{currency}{businessData.totalSales}</p>
                    </div>
                </div>
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Average Order Value</h3>
                    <p className="text-2xl font-bold text-blue-600">{currency}{businessData.avgOrderValue}</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Method (COD)</h3>
                    <p className="text-2xl font-bold text-yellow-600">{businessData.paymentMethodPercentages.cod}%</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Method (Razorpay)</h3>
                    <p className="text-2xl font-bold text-purple-600">{businessData.paymentMethodPercentages.razorpay}%</p>
                </div>
                <div onClick={handleTotalOrdersClick} className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 bg-white shadow-md rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">Total Orders</h3>
                        <p className="text-2xl font-bold text-purple-900">{totalOrders}</p>
                    </div>
                </div>

                {showDetailedSales && salesSummary && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white shadow-md rounded-lg p-6">
                        {salesSummary.map((item, index) => (
                            <div key={index}>
                                <p>{item.date}</p>
                                <p>{item.totalSales}</p>
                                {/* ... other sales summary data */}
                            </div>
                        ))}
                    </div>
                )}

                {showDetailedOrders && ordersSummary && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white shadow-md rounded-lg p-6">
                        {ordersSummary.map((item, index) => (
                            <div key={index}>
                                <p>{item.date}</p>
                                <p>{item.totalOrders}</p>
                                {/* ... other orders summary data */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Business;