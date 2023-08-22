import "../css/SearchBar.css";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { backendHost } from "../index.js";

const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownContent, setDropdownContent] = useState([]);


  const fetchDropdownData = (value) => {
    // Fetch dropdown data from API

    fetch(`${backendHost}/getSearchedUsers`)
      .then((response) => response.json())
      .then((json) => {
        // see filter tuleks ehk backendis hoopis teha :)
        console.log(json);
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            (user.UserName.toLowerCase().includes(value) ||
              user.FirstName.toLowerCase().includes(value) ||
              user.LastName.toLowerCase().includes(value))
          );
        });
        setResults(results); // setresults
      })
      .catch((error) => {
        console.error("Error fetching dropdown data:", error);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    fetchDropdownData(value); // Fetch dropdown suggestions

    // Toggle dropdown visibility
    setIsDropdownVisible(value.length > 0);
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />

      <input
        type="text"
        placeholder="Search Wassbook"
        value={input}
        className="search-input"
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      ></input>

      {isDropdownVisible && (
        <div className="dropdown-menu">
          {dropdownContent.map((item) => (
            <div key={item.id} className="dropdown-item">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default SearchBar;
