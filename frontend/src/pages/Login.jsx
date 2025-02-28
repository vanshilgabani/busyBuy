// Login.jsx
import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [currentState, setCurrentState] = useState('Login');
    const { setToken, backendUrl } = useContext(ShopContext);
    const routerNavigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        emailOrPhone: '',
        password: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
        alternatePhone: '',
    });

    const [passwordVisible, setPasswordVisible] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle form submission
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const payload =
                currentState === 'Sign Up'
                    ? {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.emailOrPhone, // Use email for signup
                        password: formData.password,
                        address: { // Ensure phone is inside address
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zipcode: formData.zipcode,
                            country: formData.country,
                            phone: formData.phone, // ✅ Fix: Put phone inside address
                            alternatePhone: formData.alternatePhone,
                        },
                    }
                    : {
                        emailOrPhone: formData.emailOrPhone, // Allow login with email or phone
                        password: formData.password,
                    };

            const endpoint = currentState === 'Sign Up' ? '/api/user/register' : '/api/user/login';
            const response = await axios.post(backendUrl + endpoint, payload);

            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                // ✅ Add loginSuccess parameter to the home route
                routerNavigate('/?loginSuccess=true');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
            <div className="inline-flex items-center gap-2 mb-2 mt-10">
                <p className="prata-regular text-3xl">{currentState}</p>
                <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>

            {/* Show extra fields only for sign-up */}
            {currentState === 'Sign Up' && (
                <>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="First Name" required />
                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="Last Name" required />
                    <input name="street" value={formData.street} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="House/Flat_No. and Street" required />
                    <input name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="City" required />
                    <input name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="State" required />
                    <input name="zipcode" value={formData.zipcode} onChange={handleChange} type="number" className="w-full px-3 py-2 border border-gray-800" placeholder="Pincode" required />
                    <input name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-800" placeholder="Country" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} type="number" className="w-full px-3 py-2 border border-gray-800" placeholder="Phone" required />
                    <input name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} type="number" className="w-full px-3 py-2 border border-gray-800" placeholder="Alternate Phone" />
                </>
            )}

            {/* Email or Phone Field */}
            <input
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                type={currentState === 'Login' ? 'text' : 'email'} // Use text for login (email or phone), email for sign-up
                className="w-full px-3 py-2 border border-gray-800"
                placeholder={currentState === 'Login' ? 'Email or Phone' : 'Email'}
                required
            />

            {/* Password Field with Toggle */}
            <div className="relative w-full">
                <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={passwordVisible ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-800"
                    placeholder="Password"
                    required
                />
                <button type="button" onClick={togglePasswordVisibility} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600">
                    {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <div className="w-full flex justify-between text-sm mt-[-8px]">
                <p className="cursor-pointer" onClick={() => routerNavigate('/ForgotPassword')}>
                    Forgot password?
                </p>
                {currentState === 'Login' ? (
                    <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer">
                        Create account
                    </p>
                ) : (
                    <p onClick={() => setCurrentState('Login')} className="cursor-pointer">
                        Login Here
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button className="bg-black text-white font-light px-8 py-2 mt-4">{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
        </form>
    );
};

export default Login;