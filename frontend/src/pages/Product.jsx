import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart } = useContext(ShopContext);
    const [productData, setProductData] = useState(null);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');
    const [showButton, setShowButton] = useState(true); // Initially, show the button

    const navigate = useNavigate(); // Initialize navigate

    // Track scroll position
    const handleScroll = () => {
        if (window.scrollY > 0) {
            setShowButton(false);
        } else {
            setShowButton(true);
        }
    };

    // Hook to set up the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchProductData = () => {
        const foundProduct = products.find((item) => item._id === productId);
        if (foundProduct) {
            setProductData(foundProduct);
            setImage(foundProduct.image[0]);
        }
    };

    const handleAddToCart = () => {
        if (!size) {
            toast.error('Please select a size before adding to the cart');
            return;
        }

        // Add product to the cart
        addToCart(productData._id, size);

        toast.success('Item added to cart!', {
            position: "top-center",
            autoClose: 1000,  // Duration for toast message (1 second)
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
        });
    };

    useEffect(() => {
        fetchProductData();
    }, [productId, products]);

    if (!productData) return null;

    // Calculate discount percentage
    const discountPercentage =
        productData.oldPrice && productData.oldPrice > productData.price
            ? Math.round(((productData.oldPrice - productData.price) / productData.oldPrice) * 100)
            : 0;

    return (
        <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
            {/* Back to Collection Button */}
            <button
                onClick={() => navigate('/collection')}
                className={`${showButton ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out fixed left-0 top-40 ml-[-5px] bg-black text-white px-4 py-2 rounded-md text-xs sm:text-xs sm:hidden`}
            >
                Back to Collection
            </button>

            {/* Product Data */}
            <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
                {/* Product Images */}
                <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
                    <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
                        {productData.image.map((item, index) => (
                            <img
                                onClick={() => setImage(item)}
                                src={item}
                                key={index}
                                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                            />
                        ))}
                    </div>
                    <div className="w-full sm:w-[80%] relative">
                        {discountPercentage > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-s px-5 py-1 rounded-full">
                                {discountPercentage}% OFF
                            </div>
                        )}
                        <img className="w-full h-auto" src={image} alt={productData.name} />
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
                    <div className="flex items-center gap-2 mt-5">
                        <p className="text-3xl font-medium">{currency}{productData.price}</p>
                        {productData.oldPrice && productData.oldPrice > productData.price && (
                            <p className="text-xl text-gray-500 line-through">{currency}{productData.oldPrice}</p>
                        )}
                    </div>
                    <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
                    <div className="flex flex-col gap-4 my-8">
                        <p>Select Size</p>
                        <div className="flex gap-2">
                            {productData.sizes.map((item, index) => (
                                <button
                                    onClick={() => setSize(item)}
                                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-black' : ''}`}
                                    key={index}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    {productData.OutofStock ? ( // Conditional rendering for button
                        <button
                            className="bg-red-500 text-white px-8 py-3 text-sm cursor-not-allowed"
                            disabled
                        >
                            Out of Stock
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
                        >
                            ADD TO CART
                        </button>
                    )}

                    <hr className="mt-8 sm:w-4/5" />
                    <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
                        <p>100% Original product.</p>
                        <p>(Cash on delivery is available on this product )*.</p>
                        <p>(Easy return and exchange policy within 7 days)*.</p>
                    </div>
                </div>
            </div>

            {/* Display Related Products */}
            <RelatedProducts
                category={productData.category}
                subCategory={productData.subCategory}
                currentProductId={productData._id}
            />
        </div>
    );
};

export default Product;