import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  // Function to calculate discount percentage
  const calculateDiscount = (price, oldPrice) => {
    if (oldPrice && oldPrice > price) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return 0;
  };

  useEffect(() => {
    if (products.length > 0) {
        console.log("All Products in ShopContext:", products);

        let productsCopy = products.slice();

        console.log("Props received by RelatedProducts:", { category, subCategory, currentProductId });

        // Filter products based on category and subCategory (HANDLE ARRAYS CORRECTLY)
        productsCopy = productsCopy.filter((item) => {
            console.log("Current Item Category and SubCategory:", { itemCategory: item.category, itemSubCategory: item.subCategory });
            // Check if there is ANY category in the prop array that is also in the item.category array
            return category.some(cat => item.category.includes(cat));
        });
        productsCopy = productsCopy.filter((item) => {
             // Check if there is ANY subCategory in the prop array that is also in the item.subCategory array
            return subCategory.some(subCat => item.subCategory.includes(subCat));
        });


        // Exclude the current product from the related products list
        productsCopy = productsCopy.filter((item) => item._id !== currentProductId);

        console.log("Filtered Products before slice:", productsCopy);

        // Set related products (limit to first 8)
        setRelated(productsCopy.slice(0, 8));
        console.log("Related Products State:", related);
    }
}, [products, category, subCategory, currentProductId]);
  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item, index) => {
          const discountPercentage = calculateDiscount(item.price, item.oldPrice);

          return (
            <div key={index} className="relative">
              {/* Display Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full ml-[-10px]">
                  {discountPercentage}% OFF
                </div>
              )}
              <ProductItem
                id={item._id}
                name={item.name}
                price={item.price}
                oldPrice={item.oldPrice || null}
                image={item.image}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;