import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link } from "react-router-dom";

// react icons: https://react-icons.github.io/react-icons/icons?name=fa
import {
  FaAccessibleIcon,
  FaWineBottle,
  FaRegAddressCard,
  FaXRay,
} from "react-icons/fa";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { useState } from "react";

const Navbar = () => {
  const [results, setResults] = useState([]);

  return (
    <nav className="Navbar">
      <Link to="/">
        <img src={logo} className="NavbarLogo" alt="logo" />
      </Link>

      <SearchBar setResults={setResults} />
      <SearchResults results={results} />

      <div className="links">
        <>
          <Link to="/">
            <FaAccessibleIcon />
            Home
          </Link>
        </>

        <>
          {" "}
          <Link to="/about">
            <FaXRay />
            About
          </Link>
        </>

        <>
          <Link to="/login">
            <FaWineBottle />
            Login
          </Link>
        </>

        <>
          {" "}
          <Link to="/register">
            <FaRegAddressCard />
            Register
          </Link>
        </>
      </div>
    </nav>
  );
};

export default Navbar;
