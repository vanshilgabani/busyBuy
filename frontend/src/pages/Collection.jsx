import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { useNavigate } from 'react-router-dom';

const Collection = () => {
    const { products, search, showSearch } = useContext(ShopContext);
    const [showFilter, setShowFilter] = useState(false);
    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [priceRange, setPriceRange] = useState([]); // Changed to an array to handle multiple selections
    const [sortType, setSortType] = useState('relavent');
    const [showButton, setShowButton] = useState(true);

    const navigate = useNavigate();

    const handleScroll = () => {
        if (window.scrollY > 0) {
            setShowButton(false);
        } else {
            setShowButton(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Toggle category filter
    const toggleCategory = (e) => {
        if (category.includes(e.target.value)) {
            setCategory((prev) => prev.filter((item) => item !== e.target.value));
        } else {
            setCategory((prev) => [...prev, e.target.value]);
        }
    };

    // Toggle sub-category filter
    const toggleSubCategory = (e) => {
        if (subCategory.includes(e.target.value)) {
            setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
        } else {
            setSubCategory((prev) => [...prev, e.target.value]);
        }
    };

    // Toggle price filter
    const togglePriceRange = (e) => {
        const value = e.target.value;
        if (priceRange.includes(value)) {
            setPriceRange((prev) => prev.filter((item) => item !== value));
        } else {
            setPriceRange((prev) => [...prev, value]);
        }
    };

    // Apply filters to products
    const applyFilter = () => {
        let productsCopy = products.slice();
        if (showSearch && search) {
            productsCopy = productsCopy.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category.length > 0) {
            productsCopy = productsCopy.filter((item) => {
                return item.category.some(cat => category.includes(cat));
            });
        }

        if (subCategory.length > 0) {
            productsCopy = productsCopy.filter((item) => {
                return item.subCategory.some(subCat => subCategory.includes(subCat));
            });
        }


        if (priceRange.length > 0) {
            productsCopy = productsCopy.filter((item) =>
                priceRange.some((range) => {
                    switch (range) {
                        case 'under-999':
                            return item.price <= 999;
                        case '999-1999':
                            return item.price > 999 && item.price <= 1999;
                        case '1999-2999':
                            return item.price > 1999 && item.price <= 2999;
                        case 'above-2999':
                            return item.price > 2999;
                        default:
                            return false;
                    }
                })
            );
        }
        setFilterProducts(productsCopy);
    };

    // Sort products based on selected criteria
    const sortProduct = () => {
        let fpCopy = filterProducts.slice();

        switch (sortType) {
            case 'low-high':
                setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
                break;

            case 'high-low':
                setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
                break;

            default:
                applyFilter();
                break;
        }
    };

    useEffect(() => {
        console.log("useEffect calling applyFilter - Filters:", { category, subCategory, search, showSearch, priceRange }); // ADD THIS LINE
        applyFilter();
    }, [category, subCategory, search, showSearch, products, priceRange]);

    useEffect(() => {
        sortProduct();
    }, [sortType]);

    return (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
            {/* Home Button */}
            <button
                onClick={() => navigate('/')}
                className={`${showButton ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out fixed left-0 top-40 bg-black text-white ml-[-5px] px-4 py-2 rounded-md text-xs sm:text-xs sm:hidden`}
            >
                Home
            </button>

            {/* Filter Options */}
            <div className="min-w-60">
                <p onClick={() => setShowFilter(!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2">
                    FILTERS
                    <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
                </p>

                {/* Category Filter */}
                <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className="mb-3 text-sm font-medium">CATEGORIES</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Men" onChange={toggleCategory} /> Men
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Women" onChange={toggleCategory} /> Women
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Kids" onChange={toggleCategory} /> Kids
                        </p>
                    </div>
                </div>

                {/* SubCategory Filter */}
                <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className="mb-3 text-sm font-medium">TYPE</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Topwear" onChange={toggleSubCategory} /> Topwear
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Bottomwear" onChange={toggleSubCategory} /> Bottomwear
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="Winterwear" onChange={toggleSubCategory} /> Winterwear
                        </p>
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className={`border border-gray-300 pl-5 py-3 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className="mb-3 text-sm font-medium">PRICE RANGE</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="under-999" onChange={togglePriceRange} /> Under 999
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="999-1999" onChange={togglePriceRange} /> 1000-1999
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="1999-2999" onChange={togglePriceRange} /> 2000-2999
                        </p>
                        <p className="flex gap-2">
                            <input className="w-3" type="checkbox" value="above-2999" onChange={togglePriceRange} /> Above 2999
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex-1">
                <div className="flex justify-between text-base sm:text-2xl mb-4">
                    <Title text1={'ALL'} text2={'COLLECTIONS'} />
                    {/* Product Sort */}
                    <select onChange={(e) => setSortType(e.target.value)} className="border-2 border-gray-300 text-sm px-2">
                        <option value="relavent">Sort by: Random</option>
                        <option value="low-high">Sort by: Low to High</option>
                        <option value="high-low">Sort by: High to Low</option>
                    </select>
                </div>

                {/* Map Products */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                    {filterProducts.length > 0 ? ( // Conditional check here
                        filterProducts.map((item, index) => {
                            return (
                                <div key={index} className="relative">
                                    <ProductItem // ProductItem rendering
                                        name={item.name}
                                        id={item._id}
                                        price={item.price}
                                        oldPrice={item.oldPrice || null}
                                        image={item.image}
                                        OutofStock={item.OutofStock} // Passing OutofStock prop here
                                    />
                                </div>
                            );
                        })
                    ) : ( // If filterProducts is empty, render this:
                        <p className="text-gray-500 text-center col-span-full">No products found matching your filters.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Collection;