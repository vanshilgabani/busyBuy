import React, { useContext } from 'react';
import Title from './Title';
import { ShopContext } from '../context/ShopContext';

const CartTotal = ({ totalPrice = 0, totalOldPrice = 0, discount = 0 }) => {
  const { currency, delivery_fee: shippingFee } = useContext(ShopContext);

  // Calculate discount percentage
  const discountPercentage = totalOldPrice > 0 
    ? ((discount / totalOldPrice) * 100).toFixed(2) 
    : 0;

  // Determine the shipping fee (0 if the cart is empty)
  const effectiveShippingFee = totalPrice === 0 ? 0 : shippingFee;

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Total</p>
          <p>{currency}{totalOldPrice.toFixed(2)}</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Discount</p>
          <p>
            -{currency}{discount.toFixed(2)} 
            <span className="font-bold text-blue-700"> ({discountPercentage}%)</span>
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency}{effectiveShippingFee.toFixed(2)}</p>
        </div>
        <hr />
        <div className="flex justify-between items-center pt-2">
          <b className="text-lg sm:text-xl">Total</b>
          <b className="text-lg sm:text-xl">{currency}{(totalPrice + effectiveShippingFee).toFixed(2)}</b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
