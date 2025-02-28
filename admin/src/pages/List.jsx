import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import SearchBarList from "../components/SearchBarList"; 

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showBestsellerPopup, setShowBestsellerPopup] = useState(false);
  const [showOutofStockPopup, setShowOutofStockPopup] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedBestsellerStatus, setSelectedBestsellerStatus] = useState(null);
  const [selectedOutofStockStatus, setSelectedOutofStockStatus] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({ Men: 0, Women: 0, Kids: 0 });
  const navigate = useNavigate();

const handleSearch = (query) => {
      if(!query) {
        setFilteredList([]);
        return;
      }
      const filtered = list.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query.toLowerCase());
        const categoryMatch = typeof item.category === 'string' && item.category.toLowerCase().includes(query.toLowerCase());
        const priceMatch = String(item.price).includes(query);
        let bestsellerMatch = false;
        let outOfStockMatch = false; // Added outOfStockMatch
  
        // Check for "bestseller" keyword
        if (query.toLowerCase() === 'bestseller' || query.toLowerCase() === 'bestsellers' || query.toLowerCase() === 'best seller') {
            bestsellerMatch = item.bestseller === true;
        } else if (query.toLowerCase() === 'true') { 
            bestsellerMatch = item.bestseller === true;
        } else if (query.toLowerCase() === 'false') { 
            bestsellerMatch = item.bestseller === false;
        }
  
        if (query.toLowerCase() === 'stock' || query.toLowerCase() === 'out of stock' || query.toLowerCase() === 'out of stock products') {
            outOfStockMatch = item.OutofStock === true;
        } else if (query.toLowerCase() === 'instock' || query.toLowerCase() === 'in stock') { 
            outOfStockMatch = item.OutofStock === false;
        }
  
        return nameMatch || categoryMatch || priceMatch || bestsellerMatch || outOfStockMatch; 
      });
      setFilteredList(filtered);
    };
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        const products = response.data.products.reverse();
        setList(products);
        calculateCategoryCounts(products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryCounts = (products) => {
    const counts = products.reduce(
      (acc, product) => {
        if (acc[product.category] !== undefined) {
          acc[product.category] += 1;
        }
        return acc;
      },
      { Men: 0, Women: 0, Kids: 0 }
    );
    setCategoryCounts(counts);
  };

  const removeProduct = (id) => {
    setSelectedProductId(id);
    setShowPopup(true);
  };

  const confirmRemoval = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id: selectedProductId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setShowPopup(false);
  };

  const cancelRemoval = () => {
    setShowPopup(false);
  };

  const handleEdit = (item) => {
    navigate(`/add?productId=${item._id}`);
  };

  const toggleBestsellerPopup = (id, currentStatus) => {
    setSelectedProductId(id);
    setSelectedBestsellerStatus(!currentStatus);
    setShowBestsellerPopup(true);
};

  const toggleOutofStockPopup = (id, currentStatus) => {
      setSelectedProductId(id);
      setSelectedOutofStockStatus(!currentStatus);
      setShowOutofStockPopup(true);
  };

const confirmBestsellerChange = async () => {
    try {
        const response = await axios.post(
            `${backendUrl}/api/product/toggle-bestseller`,
            { productId: selectedProductId, bestseller: selectedBestsellerStatus },
            { headers: { token } }
        );

        if (response.data.success) {
            toast.success(response.data.message);
            fetchList();
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error("Error updating bestseller:", error);
        toast.error("Failed to update bestseller");
    }
    setShowBestsellerPopup(false);
};

const confirmOutofStockChange = async () => {
      try {
          const response = await axios.post(
              `${backendUrl}/api/product/toggle-OutofStock`,
              { productId: selectedProductId, OutofStock: selectedOutofStockStatus },
              { headers: { token } }
          );
  
          if (response.data.success) {
              toast.success(response.data.message);
              fetchList();
          } else {
              toast.error(response.data.message);
          }
      } catch (error) {
          console.error("Error updating Out of Stock:", error);
          toast.error("Failed to update Out of Stock");
      }
      setShowOutofStockPopup(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="mb-2 text-lg font-semibold">
          All Products List{' '}
          <span className="text-xl font-extrabold text-gray-800">({list.length})</span>
        </p>
        <div className="flex gap-4 text-sm font-medium">
          <p>Men: {categoryCounts.Men}</p>
          <p>Women: {categoryCounts.Women}</p>
          <p>Kids: {categoryCounts.Kids}</p>
        </div>
      </div>
    <SearchBarList onSearch={handleSearch} />

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-lg font-semibold text-gray-700">Loading products...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center py-2 px-3 bg-gray-100 border-b text-sm font-semibold">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Old Price</b>
            <b>Bestseller</b>
            <b>Out of Stock</b>
            <b className="text-center">Action</b>
          </div>
          {(filteredList.length > 0 ? filteredList : list).map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-3 py-2 px-3 border-b text-sm"
            >
              <div className="flex justify-center md:block">
                <img
                  className="w-13 h-14 object-cover rounded border"
                  src={item.image[0]}
                  alt={item.name}
                />
              </div>
              <div className="flex justify-between w-full md:block">
                <span className="font-semibold md:hidden">Name:</span>
                <p className="truncate">{item.name}</p>
              </div>
              <div className="flex justify-between w-full md:block">
                <span className="font-semibold md:hidden">Category:</span>
                <p className='ml-[15px]'>{item.category}</p>
              </div>
              <div className="flex justify-between w-full md:block">
                <span className="font-semibold md:hidden">Price:</span>
                <p>
                  {currency}
                  {item.price}
                </p>
              </div>
              <div className="flex justify-between w-full md:block">
                <span className="font-semibold md:hidden">Old Price:</span>
                <p className="text-gray-500 line-through">
                  {currency}
                  {item.oldPrice}
                </p>
              </div>
              <div className="flex justify-between w-full md:block">
                <span className="font-semibold md:hidden">Bestseller:</span>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.bestseller}
                    onChange={() => toggleBestsellerPopup(item._id, item.bestseller)}
                    className="ml-[17px] cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-between w-full md:block">
                  <span className="font-semibold md:hidden">Out of Stock:</span>
                  <div className="flex items-center">
                      <input
                          type="checkbox"
                          checked={item.OutofStock}
                          onChange={() => toggleOutofStockPopup(item._id, item.OutofStock)}
                          className="ml-[17px] cursor-pointer"
                      />
                  </div>
              </div>
              <div className="flex justify-between w-full md:justify-center">
                <span className="font-semibold md:hidden">Action:</span>
                {/* Edit Button */}
                <div className='flex gap-10'>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-500 cursor-pointer hover:text-black transition-all"
                >
                  ✎
                </button>
                <button
                  onClick={() => removeProduct(item._id)}
                  className="text-red-500 cursor-pointer hover:text-black transition-all text-lg ml-[-10px]"
                >
                  X
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <p className="text-lg font-medium">Do you want to confirm this removal?</p>
            <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={cancelRemoval}
                className="py-2 px-6 border text-sm text-black rounded-md hover:bg-gray-400 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoval}
                className="py-2 px-6 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Popup for Changing Bestseller */}
      {showBestsellerPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <p className="text-lg font-medium">Are you sure you want to update bestseller status?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={() => setShowBestsellerPopup(false)} className="py-2 px-6 border text-sm text-black rounded-md hover:bg-gray-400 bg-gray-200">
                Cancel
              </button>
              <button onClick={confirmBestsellerChange} className="py-2 px-6 bg-green-500 text-white text-sm rounded-md hover:bg-green-600">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup for Changing OutofStock */}
      {showOutofStockPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <p className="text-lg font-medium">Are you sure you want to update OutofStock status?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={() => setShowOutofStockPopup(false)} className="py-2 px-6 border text-sm text-black rounded-md hover:bg-gray-400 bg-gray-200">
                Cancel
              </button>
              <button onClick={confirmOutofStockChange} className="py-2 px-6 bg-green-500 text-white text-sm rounded-md hover:bg-green-600">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default List;