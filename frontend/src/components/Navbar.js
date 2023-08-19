import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link } from "react-router-dom";

// react icons: https://react-icons.github.io/react-icons/icons?name=fa
import { FaLock, FaMailBulk, FaHome } from "react-icons/fa";
import SearchContainer from "./SearchContainer";

const Navbar = () => {
  return (
    <nav className="Navbar">
      <div className="links">
        <Link to="/">
          Home <FaHome />
        </Link>

        <Link to="/login">
          <FaLock /> Login
        </Link>

        <Link to="/register">
          <FaMailBulk /> Register
        </Link>
      </div>

      <Link to="/">
        <img src={logo} className="NavbarLogo" alt="logo" />
      </Link>

      <SearchContainer />
    </nav>
  );
};

export default Navbar;
