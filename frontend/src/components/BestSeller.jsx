import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 8)); // Get up to 8 bestsellers
  }, [products]);

  // Scroll Functions (Same as Latest Collection)
  const handleScrollRight = () => {
    document.getElementById('bestSellerContainer').scrollBy({
      left: 1250, // Adjust scroll distance for smooth scrolling
      behavior: 'smooth',
    });
  };

  const handleScrollLeft = () => {
    document.getElementById('bestSellerContainer').scrollBy({
      left: -1250, // Scroll left
      behavior: 'smooth',
    });
  };

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.
        </p>
      </div>

      {/* Product Container with Horizontal Scroll */}
      <div className="relative">
        <div
          id="bestSellerContainer"
          className="flex overflow-x-auto gap-1 scrollbar-none snap-x snap-mandatory"
        >
          {/* Rendering Products */}
          {bestSeller.map((item, index) => {
            return (
              <div key={index} className="flex-none w-1/4 snap-start relative">
                <ProductItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  oldPrice={item.oldPrice || null}
                  OutofStock={item.OutofStock}  // ADDED OutofStock prop here
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BestSeller;