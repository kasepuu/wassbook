import "../css/SearchResults.css";
import SearchResult from "./SearchResult";
import { useEffect, useState, useRef } from "react";

const SearchResults = ({ results }) => {
  if (!results) return;

  return (
    <div className="results-list">
      {results.map((result, id) => (
        <SearchResult result={result} key={id} />
      ))}
    </div>
  );
};

export default SearchResults;
