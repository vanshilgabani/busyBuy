import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, oldPrice, OutofStock }) => { // Added OutofStock prop
    const { currency } = useContext(ShopContext);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate discount percentage
    const calculateDiscount = (price, oldPrice) => {
        if (oldPrice && oldPrice > price) {
            return Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        return 0;
    };

    const discountPercentage = calculateDiscount(price, oldPrice);

    return (
        <Link
            onClick={() => scrollTo(0, 0)}
            className="text-gray-700 cursor-pointer"
            to={`/product/${id}`}
        >
            <div
                className="overflow-hidden relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    className={`w-full h-auto object-cover transition-all duration-300 transform ${isHovered ? 'hover:scale-110' : ''}`}
                    src={isHovered ? image?.[1] || image?.[0] : image?.[0]}
                    alt={name}
                />

                {/* Display Discount Badge */}
                {discountPercentage > 0 && (
                    <div
                        className="absolute top-1.5 left-2 bg-red-500 text-white text-[4px]  px-1 py-0.4 rounded-full
                                    sm:top-1 sm:left-3 sm:text-[10px] sm:px-1.5 sm:py-0.5 shadow-md z-10 ml-[-7px]"
                    >
                        {discountPercentage}% OFF
                    </div>
                )}
            </div>

            <p className="pt-3 pb-1 text-sm">{name}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{currency}{price}</p>
                {oldPrice && oldPrice > price && (
                    <>
                        <span className="text-sm text-gray-500 line-through">
                            {currency}{oldPrice}
                        </span>
                        {OutofStock && ( // Conditionally render "Out of Stock" text
                            <span className="text-red-500 text-sm font-semibold ml-2">
                                Out of Stock
                            </span>
                        )}
                    </>
                )}
                 {!oldPrice && OutofStock && ( // Conditionally render "Out of Stock" text when no oldPrice
                            <span className="text-red-500 text-sm font-semibold ml-2">
                                Out of Stock
                            </span>
                        )}
            </div>
        </Link>
    );
};

export default ProductItem;