import "../../css/SearchBar.css";
import { FaSearch } from "react-icons/fa";
import React, { useState } from "react";
import { backendHost } from "../../index.js";
let fetchTimeout;

const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const delayedFetchData = (value, delay = 1000) => {
    fetchTimeout = setTimeout(() => {
      fetchData(value);
    }, delay);
  };

  const fetchData = (value) => {
    // Send the value to the backend for filtering
    fetch(
      `${backendHost}/fetch-searchbar-users?filter=${encodeURIComponent(value)}`
    )
      .then((response) => response.json())
      .then((json) => {
        console.log("fetched using this value:", `"${value}"`, json);
        setResults(json); // Assuming the backend returns filtered results
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleChange = (value, delay = 1000) => {
    setInput(value);
    clearTimeout(fetchTimeout);
    delayedFetchData(value, delay);
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />
      <input
        type="text"
        placeholder="Search Wassbook"
        value={input}
        className="search-input"
        id="search-bar"
        autoComplete="off"
        onClick={(e) => {
          handleChange(e.target.value, 100);
        }}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      ></input>
    </div>
  );
};
export default SearchBar;
