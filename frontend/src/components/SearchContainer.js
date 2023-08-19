import { useState } from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import "../css/SearchContainer.css";

const SearchContainer = () => {
  const [results, setResults] = useState([]);

  return (
    <div className="search-container">
      <SearchBar setResults={setResults} />
      <SearchResults results={results} />
    </div>
  );
};

export default SearchContainer;
