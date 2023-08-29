import SearchBar from "./searchbar/SearchBar";
import SearchResults from "./searchbar/SearchResults";
import "../css/SearchContainer.css";
import React, { useState, useEffect } from "react";

const SearchContainer = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("search-container");
      if (container && !container.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" id="search-container">
      <SearchBar setResults={setResults} />
      <SearchResults results={results} />
    </div>
  );
};

export default SearchContainer;
