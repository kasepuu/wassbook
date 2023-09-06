import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link } from "react-router-dom";
import SearchContainer from "./SearchContainer";

// react icons: https://react-icons.github.io/react-icons/icons?name=fa
import {
  FaHome,
  FaDoorOpen,
  FaUserFriends,
  FaUsers,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="Navbar">
      <div className="links">
        <Link to="/">
          <FaHome /> Home
        </Link>

        <Link
          to={`/profile/${
            JSON.parse(sessionStorage.getItem("CurrentUser")).UserName
          }`}
        >
          <FaUserCircle /> Profile
        </Link>

        <Link to="/">
          <FaUserFriends /> Friends
        </Link>

        <Link to="/">
          <FaUsers /> Groups
        </Link>

        <Link to="/">
          <FaBell /> Notifications
        </Link>

        <Link to="/logout">
          <FaDoorOpen /> Logout
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
