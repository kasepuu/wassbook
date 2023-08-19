import "../css/SearchBar.css";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const fetchData = (value) => {
    // fetch from api
    // fetch("http://localhost:8081/users");
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        // see filter tuleks ehk backendis hoopis teha :)
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            user.name &&
            user.name.toLowerCase().includes(value)
          );
        });
        setResults(results); // setresults
      })
      .catch((error) => {
        console.error("Error:", error);
      }); // dummy data, for now
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
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
    </div>
  );
};

export default SearchBar;
