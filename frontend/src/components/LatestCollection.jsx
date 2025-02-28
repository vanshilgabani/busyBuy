import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 8));
  }, [products]);

  const handleScrollRight = () => {
    document.getElementById('productContainer').scrollBy({
      left: 1250, // Adjust scroll distance (e.g., for 5 items of 250px each)
      behavior: 'smooth',
    });
  };

  const handleScrollLeft = () => {
    document.getElementById('productContainer').scrollBy({
      left: -1250, // Adjust scroll distance (e.g., for 5 items of 250px each)
      behavior: 'smooth',
    });
  };

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
        Just arrived: Hot new styles – swipe right to see the full lineup. </p>
      </div>

      {/* Product Container with Horizontal Scroll */}
      <div className="relative">
        <div
          id="productContainer"
          className="flex overflow-x-auto gap-1 scrollbar-none snap-x snap-mandatory"
        >
          {/* Rendering Products */}
          {latestProducts.map((item, index) => {
            return (
              <div key={index} className="flex-none w-1/4 snap-start relative">
                <ProductItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  oldPrice={item.oldPrice || null}
                  OutofStock={item.OutofStock}  
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LatestCollection;