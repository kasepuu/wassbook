import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="Navbar">
      <Link to="/">
        <img src={logo} className="NavbarLogo" alt="logo" />
      </Link>

      <textarea placeholder="Search Wassbook"></textarea>

      <div className="links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
      </div>
    </nav>
  );
};

export default Navbar;
