import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalOldPrice, setTotalOldPrice] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const navigate = useNavigate();

  const handleScroll = () => {
    setShowButton(window.scrollY === 0);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  useEffect(() => {
    let price = 0;
    let oldPrice = 0;

    cartData.forEach((item) => {
      const productData = products.find((product) => product._id === item._id);
      if (productData) {
        price += productData.price * item.quantity;
        oldPrice += productData.oldPrice * item.quantity;
      }
    });

    setTotalPrice(price);
    setTotalOldPrice(oldPrice);
  }, [cartData, products]);

  const handleProceedToCheckout = () => setShowPopup(true);
  const handleConfirmProceed = () => {
    navigate('/place-order');
    setShowPopup(false);
  };
  const handleCancelProceed = () => setShowPopup(false);

  const isCartEmpty = cartData.length === 0;

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {isCartEmpty && (
        <div className="flex flex-col items-center my-10">
          <img className="w-32 sm:w-40" src={assets.empty} />
          <p className="text-xl mt-4">Your cart is empty!</p>
        </div>
      )}

      <div>
        {!isCartEmpty &&
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6 cursor-pointer' onClick={() => navigate(`/product/${productData._id}`)}> {/* Added cursor-pointer and onClick to the div */}
                  <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p>{currency}{productData.price}</p>
                      <p className='line-through text grey 500'>{currency}{productData.oldPrice}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) =>
                    e.target.value === '' || e.target.value === '0'
                      ? null
                      : updateQuantity(item._id, item.size, Number(e.target.value))
                  }
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-center'
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                />
                <img
              t       onClick={() => updateQuantity(item._id, item.size, 0)}
                  className='w-4 mr-4 sm:w-5 cursor-pointer'
                  src={assets.bin_icon}
                  alt=""
                />
              </div>
            );
          })}
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal
            totalPrice={totalPrice}
            totalOldPrice={totalOldPrice}
            discount={totalOldPrice - totalPrice}
          />
          <div className='w-full text-end'>
            <button
              onClick={handleProceedToCheckout}
              className={`bg-black text-white text-sm my-8 px-8 py-3 ${isCartEmpty ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={isCartEmpty}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="font-bold text-lg">Are you sure you want to proceed?</h2>
            <p className="mt-2 text-gray-600">You are about to go to the checkout page.</p>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={handleConfirmProceed} className="bg-green-500 text-white py-2 px-6 rounded-full">Yes, Proceed</button>
              <button onClick={handleCancelProceed} className="bg-red-500 text-white py-2 px-6 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;