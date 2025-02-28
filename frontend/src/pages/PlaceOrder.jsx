import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency } =
        useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
        alternatePhone: '',
    });
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [showThanksPopup, setShowThanksPopup] = useState(false);
    const [fetchUserDataLoading, setFetchUserDataLoading] = useState(true);
    const [fetchUserDataError, setFetchUserDataError] = useState(null);
    const [userData, setUserData] = useState(null);

    // State to store the data for Thanks Popup
    const [thanksPopupData, setThanksPopupData] = useState({
        discount: 0,
        totalPrice: 0,
        currency: currency,
    });

    // Calculate totals for CartTotal
    const totalOldPrice = Object.entries(cartItems).reduce((total, [productId, sizes]) => {
        const product = products.find((p) => p._id === productId);
        if (product) {
            return total + Object.entries(sizes).reduce((subtotal, [size, quantity]) => {
                return subtotal + quantity * product.oldPrice;
            }, 0);
        }
        return total;
    }, 0);

    const totalPrice = Object.entries(cartItems).reduce((total, [productId, sizes]) => {
        const product = products.find((p) => p._id === productId);
        if (product) {
            return total + Object.entries(sizes).reduce((subtotal, [size, quantity]) => {
                return subtotal + quantity * product.price;
            }, 0);
        }
        return total;
    }, 0);

    const discount = totalOldPrice - totalPrice;


    // Fetch user profile data
    useEffect(() => {
        const fetchUserData = async () => {
            setFetchUserDataLoading(true);
            setFetchUserDataError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }

                const response = await axios.get(`${backendUrl}/api/user/profile`, {
                    headers: {
                        token: token,
                    },
                });

                if (response.data.success) {
                    setUserData(response.data.user);
                    // Initialize formData with user profile data here directly
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        firstName: response.data.user.first_name || '',
                        lastName: response.data.user.last_name || '',
                        email: response.data.user.email || '',
                        // Keep other address fields from potentially being overwritten if already fetched
                        street: prevFormData.street,
                        city: prevFormData.city,
                        state: prevFormData.state,
                        zipcode: prevFormData.zipcode,
                        country: prevFormData.country,
                        phone: prevFormData.phone,
                        alternatePhone: prevFormData.alternatePhone,
                    }));
                } else {
                    setFetchUserDataError(response.data.message || "Failed to fetch user data");
                }
            } catch (err) {
                console.error("Error fetching user data in PlaceOrder:", err);
                setFetchUserDataError(err.message || "An error occurred");
            } finally {
                setFetchUserDataLoading(false);
            }
        };

        fetchUserData();
    }, [backendUrl]);


    // Fetch user address from the database
    useEffect(() => {
        const fetchAddress = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/user/address`, { headers: { token } });
                if (response.data.success && response.data.address) {
                    // Update formData with address, but preserve first name, last name, and email if already fetched
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        street: response.data.address.street || '',
                        city: response.data.address.city || '',
                        state: response.data.address.state || '',
                        zipcode: response.data.address.zipcode || '',
                        country: response.data.address.country || '',
                        phone: response.data.address.phone || '',
                        alternatePhone: response.data.address.alternatePhone || '',
                        firstName: prevFormData.firstName, // Preserve first name
                        lastName: prevFormData.lastName,   // Preserve last name
                        email: prevFormData.email,        // Preserve email
                    }));
                } else {
                    throw new Error(response.data.message || 'No address found');
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                toast.error(`Failed to fetch address: ${error.message}`);
            }
            setLoading(false);
        };

        if (token) {
            fetchAddress();
        }
    }, [backendUrl, token]);

    // Handle changes in form fields
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((data) => ({ ...data, [name]: value }));
    };

    if (loading || fetchUserDataLoading) {
        return <p className="text-center text-gray-600 font-semibold text-xl">Loading Page...</p>;
    }

    if (fetchUserDataError) {
        return <div className="error-message">Error fetching user information: {fetchUserDataError}</div>;
    }

    // Handle Address Update
    const handleUpdateAddress = async () => {
        try {
            const updatedData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipcode: formData.zipcode,
                    country: formData.country,
                    phone: formData.phone,
                    alternatePhone: formData.alternatePhone,
                }
            };

            const response = await axios.put(`${backendUrl}/api/user/address`, updatedData, { headers: { token } });

            if (response.data.success) {
                toast.success('Address updated successfully!');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating Info..:', error);
            toast.error(`Failed to update Info..: ${error.message}`);
        }
    };

    // Handle order confirmation
    const handleConfirmOrder = async () => {
        try {
            const orderItems = [];
            for (const productId in cartItems) {
                for (const size in cartItems[productId]) {
                    const quantity = cartItems[productId][size];
                    if (quantity > 0) {
                        const product = structuredClone(products.find((p) => p._id === productId));
                        if (product) {
                            product.size = size;
                            product.quantity = quantity;
                            orderItems.push(product);
                        }
                    }
                }
            }

            const orderData = {
                address: formData,
                items: orderItems,
                amount: totalPrice + delivery_fee,
            };

            const endpoint = method === 'cod'
                ? '/api/order/place'
                : method === 'stripe'
                    ? '/api/order/stripe'
                    : '/api/order/razorpay';

            const response = await axios.post(backendUrl + endpoint, orderData, { headers: { token } });

            if (response.data.success) {
                if (method === 'stripe' || method === 'razorpay') {
                    window.location.replace(response.data.session_url || response.data.order.payment_url);
                } else {
                    setCartItems({}); // Clear cart after successful order
                    // Set the data for Thanks Popup
                    setThanksPopupData({
                        discount: discount,
                        totalPrice: totalPrice + delivery_fee,
                        currency: currency,
                    });
                    setShowThanksPopup(true);
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to place the order.');
        }
        setShowPopup(false);
    };

    const handleCancelOrder = () => setShowPopup(false);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
            {/* Left Side - Delivery Information */}
            <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
                <div className="text-xl sm:text-2xl my-3">
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="First name" />
                <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Last name" />
                <input required onChange={onChangeHandler} name="email" value={formData.email} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="email" placeholder="Email address" />
                <input required onChange={onChangeHandler} name="street" value={formData.street} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Address" />
                <input required onChange={onChangeHandler} name="city" value={formData.city} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="City" />
                <input required onChange={onChangeHandler} name="state" value={formData.state} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="State" />
                <input required onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Pincode" />
                <input required onChange={onChangeHandler} name="country" value={formData.country} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Country" />
                <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Phone" />
                <input onChange={onChangeHandler} name="alternatePhone" value={formData.alternatePhone || ''} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Alternate Phone" />
                <button type="button" onClick={handleUpdateAddress} className="bg-black text-white px-16 py-1.5 rounded">Update Information</button>
            </div>

            {/* Right Side - Cart Total and Payment */}
            <div className="mt-8">
                {/* Show CartTotal even after placing the order */}
                <CartTotal
                    totalPrice={totalPrice}
                    totalOldPrice={totalOldPrice}
                    discount={discount}
                    currency={currency}
                    setThanksPopupData={setThanksPopupData}
                />

                <div className="mt-12">
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className="flex gap-3 flex-col lg:flex-row">
                        <div onClick={() => setMethod('razorpay')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className={`min-w-3.5 h-3.5 border border-gray-700 rounded-full ${method === 'razorpay' ? 'bg-green-500' : ''}`}></p>
                            <img className="h-5 mx-8" src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                            <p className={`min-w-3.5 h-3.5 border border-gray-700 rounded-full ${method === 'cod' ? 'bg-green-500' : ''}`}></p>
                            <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className="w-full text-end mt-8">
                        <button
                            onClick={() => setShowPopup(true)}
                            type="button"
                            className="bg-black text-white px-16 py-3 text-sm"
                            disabled={Object.keys(cartItems).length === 0}
                        >
                            PLACE ORDER
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col justify-between max-h-[300px] w-100">
                        <p className="text-sm md:text-lg font-medium">Do you want to confirm this order?</p>
                        <p className="text-sm md:text-xs font-small text-red-500">Make sure your address is correct before confirming.</p>
                        <div className="flex gap-3 mt-5 justify-center">
                            <button
                                onClick={handleCancelOrder}
                                type="button"
                                className="py-2 px-8 border text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                type="button"
                                className="py-2 px-8 border text-sm text-white bg-black"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thanks Popup */}
            {showThanksPopup && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col justify-between max-h-[300px] w-[300px] md:w-[400px]">
                        <p className="text-lg md:text-2xl font-semibold">🎉 Congrats!</p>
                        <p className="text-sm md:text-lg font-medium mt-2">
                            You've saved <span className="text-green-500 font-bold">{thanksPopupData.currency}{thanksPopupData.discount.toFixed(2)}</span> on this order!
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Thank you for shopping with us!</p>
                        <div className="flex gap-3 mt-5 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                type="button"
                                className="py-2 px-8 border text-sm text-white bg-black"
                            >
                                Go to Home
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                type="button"
                                className="py-2 px-8 border text-sm text-white bg-black"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default PlaceOrder;