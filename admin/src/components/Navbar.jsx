import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Navbar = ({ setToken }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    setToken('');
    setModalOpen(false); 
  };

  return (
    <div className="flex items-center py-10 px-[4%] justify-between">
      <h1 className="w-[max(10%,80px)] text-3xl font-bold">BusyBuy</h1>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-gray-950 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
      >
        Logout
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Confirm Logout!!</h2>
            <p className="text-center text-gray-600 mt-2">
              Are you sure you want to log out ?
            </p>
            <div className="flex justify-center mt-4 gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
