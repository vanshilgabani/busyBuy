import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'; // Import cross icon

const Add = ({ token }) => {
    const [image1, setImage1] = useState(false);
    const [image2, setImage2] = useState(false);
    const [image3, setImage3] = useState(false);
    const [image4, setImage4] = useState(false);

    const [existingImage1Url, setExistingImage1Url] = useState('');
    const [existingImage2Url, setExistingImage2Url] = useState('');
    const [existingImage3Url, setExistingImage3Url] = useState('');
    const [existingImage4Url, setExistingImage4Url] = useState('');

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [oldPrice, setOldPrice] = useState("");
    const [category, setCategory] = useState("Men");
    const [subCategory, setSubCategory] = useState("Topwear");
    const [bestseller, setBestseller] = useState(false);
    const [sizes, setSizes] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const productId = new URLSearchParams(location.search).get("productId");

    const isEditMode = !!productId;

    useEffect(() => {
        if (isEditMode && productId) {
            fetchProductDetails(productId);
        }
    }, [isEditMode, productId]);

    const fetchProductDetails = async (id) => {
        try {
            const response = await axios.post(backendUrl + "/api/product/single", { productId: id }, { headers: { token } });
            if (response.data.success) {
                const productData = response.data.product;
                setName(productData.name);
                setDescription(productData.description);
                setPrice(productData.price);
                setOldPrice(productData.oldPrice || "");
                setCategory(productData.category);
                setSubCategory(productData.subCategory);
                setBestseller(productData.bestseller);
                setSizes(productData.sizes);
                // Prefill existing image URLs
                if (productData.image && productData.image.length > 0) {
                    setExistingImage1Url(productData.image[0] || '');
                    setExistingImage2Url(productData.image[1] || '');
                    setExistingImage3Url(productData.image[2] || '');
                    setExistingImage4Url(productData.image[3] || '');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            toast.error("Failed to fetch product details for editing.");
        }
    };

    const handleRemoveExistingImage = (imageSlot) => {
        switch (imageSlot) {
            case 'image1':
                setExistingImage1Url('');
                setImage1(false); // Clear any newly selected image as well
                break;
            case 'image2':
                setExistingImage2Url('');
                setImage2(false);
                break;
            case 'image3':
                setExistingImage3Url('');
                setImage3(false);
                break;
            case 'image4':
                setExistingImage4Url('');
                setImage4(false);
                break;
            default:
                break;
        }
    };


    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Validation to ensure all required fields are filled
        if (!name || !description || !price || !category || !subCategory || !sizes.length ) {
            toast.error("Please fill all the required fields.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("oldPrice", oldPrice);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("bestseller", bestseller);
            formData.append("sizes", JSON.stringify(sizes));

            if (isEditMode && productId) {
                formData.append("productId", productId);
            }

            // Append new images only if they are selected, otherwise send existing image URLs
            if (image1) formData.append("image1", image1);
            if (image2) formData.append("image2", image2);
            if (image3) formData.append("image3", image3);
            if (image4) formData.append("image4", image4);

            // Handle existing images - Send URLs of existing images if new images are not uploaded for that slot
            const existingImages = [];
            if (!image1 && existingImage1Url) existingImages.push(existingImage1Url);
            if (!image2 && existingImage2Url) existingImages.push(existingImage2Url);
            if (!image3 && existingImage3Url) existingImages.push(existingImage3Url);
            if (!image4 && existingImage4Url) existingImages.push(existingImage4Url);

            if (existingImages.length > 0) {
                formData.append("existingImages", JSON.stringify(existingImages));
            }

            const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setName("");
                setDescription("");
                setImage1(false);
                setImage2(false);
                setImage3(false);
                setImage4(false);
                setPrice("");
                setOldPrice("");
                setSizes([]);
                setExistingImage1Url('');
                setExistingImage2Url('');
                setExistingImage3Url('');
                setExistingImage4Url('');

                navigate('/list');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving the product.");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
            {/* Image Upload Section */}
            <div>
                <p className="mb-2">Upload Image</p>
                <div className="flex gap-2">
                    <div className="relative"> {/* Container for image and cross icon */}
                        <label htmlFor="image1" className="cursor-pointer">
                            <img className="w-20" src={image1 ? URL.createObjectURL(image1) : (existingImage1Url || assets.upload_area)} alt="" />
                            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
                        </label>
                        {isEditMode && existingImage1Url && ( // Show cross only in edit mode and if image exists
                            <button
                                type="button"
                                onClick={() => handleRemoveExistingImage('image1')}
                                className="absolute top-0 right-0 p-1 text-red-500 rounded-full transition-colors"
                                style={{ transform: 'translate(30%, -30%)' }} // Adjust position as needed
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="image2" className="cursor-pointer">
                            <img className="w-20" src={image2 ? URL.createObjectURL(image2) : (existingImage2Url || assets.upload_area)} alt="" />
                            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
                        </label>
                        {isEditMode && existingImage2Url && (
                            <button
                                type="button"
                                onClick={() => handleRemoveExistingImage('image2')}
                                className="absolute top-0 right-0 p-1 text-red-500 rounded-full transition-colors"
                                style={{ transform: 'translate(30%, -30%)' }}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="image3" className="cursor-pointer">
                            <img className="w-20" src={image3 ? URL.createObjectURL(image3) : (existingImage3Url || assets.upload_area)} alt="" />
                            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
                        </label>
                        {isEditMode && existingImage3Url && (
                            <button
                                type="button"
                                onClick={() => handleRemoveExistingImage('image3')}
                                className="absolute top-0 right-0 p-1 text-red-500 rounded-full transition-colors"
                                style={{ transform: 'translate(30%, -30%)' }}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="image4" className="cursor-pointer">
                            <img className="w-20" src={image4 ? URL.createObjectURL(image4) : (existingImage4Url || assets.upload_area)} alt="" />
                            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
                        </label>
                        {isEditMode && existingImage4Url && (
                            <button
                                type="button"
                                onClick={() => handleRemoveExistingImage('image4')}
                                className="absolute top-0 right-0 p-1 text-red-500 rounded-full transition-colors"
                                style={{ transform: 'translate(30%, -30%)' }}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Name */}
            <div className="w-full">
                <p className="mb-2">Product name</p>
                <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="w-full max-w-[500px] px-3 py-2"
                    type="text"
                    placeholder="Name..."
                    required
                />
            </div>

            {/* Product Description */}
            <div className="w-full">
                <p className="mb-2">Product description</p>
                <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="Write product description..."
                    required
                />
            </div>

            {/* Category, Subcategory, Price, and Old Price */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
                <div>
                    <p className="mb-2">Product category</p>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} className="w-full px-3 py-2">
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>

                <div>
                    <p className="mb-2">Sub category</p>
                    <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className="w-full px-3 py-2">
                        <option value="Topwear">Topwear</option>
                        <option value="Bottomwear">Bottomwear</option>
                        <option value="Winterwear">Winterwear</option>
                    </select>
                </div>

                <div>
                    <p className="mb-2">Product Price</p>
                    <input
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        className="w-full px-3 py-2 sm:w-[120px]"
                        type="Number"
                        placeholder="00"
                        required
                    />
                </div>

                <div>
                    <p className="mb-2">Old Price</p>
                    <input
                        onChange={(e) => setOldPrice(e.target.value)}
                        value={oldPrice}
                        className="w-full px-3 py-2 sm:w-[120px]"
                        type="Number"
                        placeholder="00"
                        required
                    />
                </div>
            </div>

            {/* Sizes */}
            <div>
                <p className="mb-2">Product Sizes</p>
                <div className="flex gap-3">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                        <div
                            key={size}
                            onClick={() =>
                                setSizes((prev) =>
                                    prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
                                )
                            }
                        >
                            <p
                                className={`${sizes.includes(size) ? "bg-black text-white" : "bg-black-100"} px-3 py-1 cursor-pointer`}
                            >
                                {size}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bestseller */}
            <div className="flex gap-2 mt-2">
                <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
                <label className="cursor-pointer" htmlFor="bestseller">
                    Add to bestseller
                </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
                {isEditMode ? "Update" : "Add"}
            </button>
        </form>
    );
};

export default Add;