import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import eye icons

const Profile = () => {
    const { setToken, backendUrl } = useContext(ShopContext);
    console.log("Backend URL from ShopContext:", backendUrl);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Consolidated form data for both personal info and address
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

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");

    // State for password visibility
    const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
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
                    // Initialize formData with user data - Consolidated
                    setFormData({
                        firstName: response.data.user.first_name || '',
                        lastName: response.data.user.last_name || '',
                        email: response.data.user.email || '',
                        street: response.data.user.address?.street || '',
                        city: response.data.user.address?.city || '',
                        state: response.data.user.address?.state || '',
                        zipcode: response.data.user.address?.zipcode || '',
                        country: response.data.user.address?.country || '',
                        phone: response.data.user.address?.phone || '',
                        alternatePhone: response.data.user.address?.alternatePhone || '',
                    });
                } else {
                    setError(response.data.message || "Failed to fetch user data");
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [backendUrl]);

    const handleEditProfile = () => {
        setIsEditingProfile(true);
    };

    // Reusing onChangeHandler from PlaceOrder - Adapt for formData
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((data) => ({ ...data, [name]: value }));
    };


    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const updatedData = {
                userId: userData._id, // Send userId as backend is expecting it in req.body
                first_name: formData.firstName, // Use formData
                last_name: formData.lastName,   // Use formData
                email: formData.email,     // Use formData
                address: {          // Use formData for address
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipcode: formData.zipcode,
                    country: formData.country,
                    phone: formData.phone,
                    alternatePhone: formData.alternatePhone,
                }
            };

            // **Important: Using /api/user/address endpoint as per PlaceOrder.jsx and backend controller**
            const response = await axios.put(`${backendUrl}/api/user/address`, updatedData, {
                headers: { token: token }
            });

            if (response.data.success) {
                setUserData(response.data.user);
                setIsEditingProfile(false);
                toast.success(response.data.message || "Profile updated successfully!"); // Use toast for success message
            } else {
                setError(response.data.message || "Failed to update profile");
                toast.error(response.data.message || "Failed to update profile"); // Use toast for error
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.message || "An error occurred");
            toast.error(err.message || "An error occurred while updating profile"); // Use toast for error
        }
    };

    const handlePasswordInputChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordUpdateMessage("");

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setPasswordUpdateMessage("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${backendUrl}/api/user/profile/password`, passwordForm, {
                headers: { token: token }
            });

            if (response.data.success) {
                setPasswordUpdateMessage(response.data.message);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                setTimeout(() => setPasswordUpdateMessage(""), 3000);

            } else {
                setPasswordUpdateMessage(response.data.message || "Failed to update password.");
            }
        } catch (err) {
            console.error("Error updating password:", err);
            setPasswordUpdateMessage("Error updating password. Please try again.");
        }
    };

    // Password visibility toggle functions
    const toggleCurrentPasswordVisibility = () => {
        setCurrentPasswordVisible(!currentPasswordVisible);
    };

    const toggleNewPasswordVisibility = () => {
        setNewPasswordVisible(!newPasswordVisible);
    };

    const toggleConfirmNewPasswordVisibility = () => {
        setConfirmNewPasswordVisible(!confirmNewPasswordVisible);
    };


    if (loading) {
        return <div className="loading-message text-center p-6 font-semibold text-gray-600">Loading user data...</div>;
    }

    if (error) {
        return <div className="error-message text-center p-6 font-semibold text-red-600 bg-red-50 rounded-md border border-red-200">Error: {error}</div>;
    }

    if (!userData) {
        return <div className="error-message text-center p-6 font-semibold text-red-600 bg-red-50 rounded-md border border-red-200">User data not found.</div>;
    }

    return (
        <div className="profile-container max-w-screen-md mx-auto mt-12 p-10 rounded-3xl shadow-2xl bg-gradient-to-br from-gray-50 to-white"> {/* Enhanced Container */}
            <h2 className="section-title text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
                <FaUser className="inline-block mr-2 mb-1 text-indigo-500" /> Your Profile
            </h2>

            <div className="profile-section mb-10 p-8 rounded-2xl bg-white shadow-md border border-gray-100"> {/* Enhanced Section */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="profile-section-title text-2xl font-semibold text-gray-800">
                        <FaUser className="inline-block mr-2 align-top text-indigo-500" /> Profile Information
                    </h3>
                    {!isEditingProfile ? (
                        <button
                            onClick={handleEditProfile}
                            className="edit-button inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 focus:outline-none"
                        >
                            <FaEdit className="mr-2" /> Edit
                        </button>
                    ) : (
                        <div className="edit-actions flex space-x-2">
                            <button
                                onClick={handleUpdateProfile}
                                className="save-button inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <FaSave className="mr-2" /> Save
                            </button>
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="cancel-button inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaTimes className="mr-2" /> Cancel
                            </button>
                        </div>
                    )}
                </div>

                {!isEditingProfile ? (
                    <div className="info-display grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid Layout */}
                        <div className="info-item flex items-center">
                            <FaUser className="mr-4 text-gray-500" />
                            <div>
                                <span className="block font-semibold text-gray-700">First Name</span>
                                <span className="block text-gray-900">{userData.first_name}</span>
                            </div>
                        </div>
                        <div className="info-item flex items-center">
                            <FaUser className="mr-4 text-gray-500" />
                            <div>
                                <span className="block font-semibold text-gray-700">Last Name</span>
                                <span className="block text-gray-900">{userData.last_name}</span>
                            </div>
                        </div>
                        <div className="info-item flex items-center">
                            <FaEnvelope className="mr-4 text-gray-500" />
                            <div>
                                <span className="block font-semibold text-gray-700">Email</span>
                                <span className="block text-gray-900">{userData.email}</span>
                            </div>
                        </div>
                        <div className="address-display space-y-4">
                            <div className="info-item flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">House/Flat_No. and Street</span>
                                    <span className="block text-gray-900">{userData.address?.street || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">City</span>
                                    <span className="block text-gray-900">{userData.address?.city || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">State</span>
                                    <span className="block text-gray-900">{userData.address?.state || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">Pincode</span>
                                    <span className="block text-gray-900">{userData.address?.zipcode || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item flex items-center">
                                <FaMapMarkerAlt className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">Country</span>
                                    <span className="block text-gray-900">{userData.address?.country || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item flex items-center">
                                <FaPhone className="mr-4 text-gray-500" />
                                <div>
                                    <span className="block font-semibold text-gray-700">Phone</span>
                                    <span className="block text-gray-900">{userData.address?.phone || 'N/A'}</span>
                                </div>
                            </div>
                            {userData.address?.alternatePhone && (
                                <div className="info-item flex items-center">
                                    <FaPhone className="mr-4 text-gray-500" />
                                    <div>
                                        <span className="block font-semibold text-gray-700">Alternate Phone</span>
                                        <span className="block text-gray-900">{userData.address?.alternatePhone}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <form className="profile-form grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" onSubmit={handleUpdateProfile}> {/* Grid Form Layout */}
                        <div className="personal-info-form space-y-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="firstName" id="firstName" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="First Name" value={formData.firstName} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="lastName" id="lastName" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Last Name" value={formData.lastName} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" id="email" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Email" value={formData.email} onChange={onChangeHandler} required />
                            </div>
                        </div>
                        <div className="address-form space-y-4">
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">House/Flat_No. and Street</label>
                                <input type="text" name="street" id="street" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Street" value={formData.street || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" name="city" id="city" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="City" value={formData.city || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" name="state" id="state" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="State" value={formData.state || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">Pincode</label>
                                <input type="text" name="zipcode" id="zipcode" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Zipcode" value={formData.zipcode || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <input type="text" name="country" id="country" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Country" value={formData.country || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" name="phone" id="phone" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Phone" value={formData.phone || ""} onChange={onChangeHandler} required />
                            </div>
                            <div>
                                <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                                <input type="text" name="alternatePhone" id="alternatePhone" className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3" placeholder="Alternate Phone" value={formData.alternatePhone || ""} onChange={onChangeHandler} />
                            </div>
                        </div>
                    </form>
                )}
            </div>

            <div className="profile-section mb-10 p-8 rounded-2xl bg-white shadow-md border border-gray-100"> {/* Enhanced Section for Password */}
                <div className="mb-6">
                    <h3 className="profile-section-title text-2xl font-semibold text-gray-800">
                        <FaLock className="inline-block mr-2 align-top text-indigo-500" /> Change Password
                    </h3>
                </div>
                {passwordUpdateMessage && <p className={`${passwordUpdateMessage.includes("success") ? 'success-message text-green-700 bg-green-50 border-green-200' : 'error-message text-red-700 bg-red-50 border-red-200'} p-3 rounded-md mb-4`}>{passwordUpdateMessage}</p>}
                <form className="password-form flex flex-col space-y-5" onSubmit={handleUpdatePassword}>
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative"> {/* Relative wrapper for password input and icon */}
                            <input
                                type={currentPasswordVisible ? "text" : "password"} // Toggle type based on visibility state
                                name="currentPassword"
                                id="currentPassword"
                                className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                                placeholder="Current Password"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordInputChange}
                                required
                            />
                            <button
                                type="button" // Important: type="button" to prevent form submission
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={toggleCurrentPasswordVisibility}
                            >
                                <FontAwesomeIcon icon={currentPasswordVisible ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative"> {/* Relative wrapper for password input and icon */}
                            <input
                                type={newPasswordVisible ? "text" : "password"} // Toggle type based on visibility state
                                name="newPassword"
                                id="newPassword"
                                className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                                placeholder="New Password"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordInputChange}
                                required
                            />
                            <button
                                type="button" // Important: type="button" to prevent form submission
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={toggleNewPasswordVisibility}
                            >
                                <FontAwesomeIcon icon={newPasswordVisible ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative"> {/* Relative wrapper for password input and icon */}
                            <input
                                type={confirmNewPasswordVisible ? "text" : "password"} // Toggle type based on visibility state
                                name="confirmNewPassword"
                                id="confirmNewPassword"
                                className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                                placeholder="Confirm New Password"
                                value={passwordForm.confirmNewPassword}
                                onChange={handlePasswordInputChange}
                                required
                            />
                            <button
                                type="button" // Important: type="button" to prevent form submission
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={toggleConfirmNewPasswordVisibility}
                            >
                                <FontAwesomeIcon icon={confirmNewPasswordVisible ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>
                    <div className="form-actions flex justify-end mt-6">
                        <button className="primary-button inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <FaLock className="mr-2" /> Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;