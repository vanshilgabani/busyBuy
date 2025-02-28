import React, { useState } from 'react';

const SearchBarList = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    onSearch(newQuery); 
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        className="w-full p-2 border rounded text-sm"
        placeholder="Search products by Name, Category, Price, Bestseller, Stock"
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchBarList;