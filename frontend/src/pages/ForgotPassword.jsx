import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'react-router-dom';

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
     if (token) {
      setStep(2);
    } else {
      setStep(1); 
    }
  }, [token]); 


  const handleInputChange = (e) => {
    if (e.target.name === 'emailOrPhone') {
      setEmailOrPhone(e.target.value);
    } else if (e.target.name === 'newPassword') {
      setNewPassword(e.target.value);
    }
  };

  const handleRequestResetLink = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/request-password-reset`, {
        emailOrPhone: emailOrPhone,
      });

      if (response.data.success) {
        setMessage(response.data.message || "Password reset link sent to your email. Please check your inbox (and spam folder).");
        toast.success(response.data.message || "Password reset link sent to your email. Please check your inbox (and spam folder).");
        setStep(1); 
        setEmailOrPhone('');
      } else {
          setError(response.data.message || "Failed to send password reset link.");
          toast.error(response.data.message || response.data.message || "Failed to send password reset link.");
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError("Link already sent, You can request new link after 1 hour. Please check your inbox (and spam folder)");
      toast.error("Link already sent, You can request new link after 1 hour. Please check your inbox (and spam folder)");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
       e.preventDefault();
       setMessage('');
       setError('');
       setLoading(true);
    
       if (!newPassword) {
        setError("Please enter a new password.");
        setLoading(false);
        return;
       }
    
       try {
        const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
         token: token, 
         newPassword: newPassword,
        });
    
        if (response.data.success) {
         setMessage(response.data.message || "Password updated successfully.");
         toast.success(response.data.message || "Password updated successfully. You can now login with your new password.");
         setStep(1); 
         setEmailOrPhone('');
         setNewPassword('');
        } else {
         setError(response.data.message || "Failed to update password. Invalid or expired token.");
         toast.error(response.data.message || "Failed to update password. Invalid or expired token.");
        }
       } catch (err) {
        console.error("Error updating password:", err);
        setError("An error occurred while updating your password. Please try again.");
        toast.error("An error occurred while updating your password. Please try again.");
       } finally {
        setLoading(false);
       }
      };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="forgot-password-container max-w-md mx-auto mt-12 p-8 rounded-2xl shadow-xl bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {step === 1 ? "Forgot Password" : "Enter New Password"}
      <h3 className='text-xs text-center font-semibold text-blue-500'> The link will only be sent to registered E-Mail </h3>
      </h2>

      {message && <p className="success-message text-green-700 bg-green-50 border-green-200 p-3 rounded-md mb-4">{message}</p>}
      {error && <p className="error-message text-red-700 bg-red-50 border-red-200 p-3 rounded-md mb-4">{error}</p>}

      {step === 1 ? (
        <form onSubmit={handleRequestResetLink} className="space-y-4">
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">Registered Email or Phone</label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
              placeholder="Your email or phone"
              value={emailOrPhone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-actions flex justify-center mt-6">
            <button
              type="submit"
              className="primary-button inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Sending Link..." : "Reset Password"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"} 
                id="newPassword"
                name="newPassword"
                className="input-field mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="New password"
                value={newPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="form-actions flex justify-center mt-6">
            <button
              type="submit"
              className="primary-button inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;