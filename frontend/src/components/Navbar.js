import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link } from "react-router-dom";
import SearchContainer from "./SearchContainer";

// react icons: https://react-icons.github.io/react-icons/icons?name=fa
import {
  FaHome,
  FaDoorOpen,
  FaUsers,
  FaBell,
  FaUserCircle,
  FaUserFriends,
} from "react-icons/fa";
import { useState } from "react";

const Navbar = () => {
  const [isNotificationsOpen, setNotificationsOpened] = useState(false);
  const [isFollowersOpen, setFollowersOpened] = useState(false);

  function onNotifactionsClick() {
    setNotificationsOpened(!isNotificationsOpen);
    if (isFollowersOpen) setFollowersOpened(!isFollowersOpen);
  }

  function onFollowersClick() {
    setFollowersOpened(!isFollowersOpen);
    if (isNotificationsOpen) setNotificationsOpened(!isNotificationsOpen);
  }

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
          <FaUsers /> Groups
        </Link>

        <Link onClick={onNotifactionsClick} className="notificationsBTN">
          <FaBell /> Notifications
          <NotificationsDropdown isOpen={isNotificationsOpen} />
        </Link>
        <Link onClick={onFollowersClick} className="followersBTN">
          <FaUserFriends /> Followers
          <FollowersDropdown isOpen={isFollowersOpen} />
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

const NotificationsDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dropdown">
      <div className="dropdown-contents">
        <p>No one is missing you!</p>
      </div>
    </div>
  );
};

const FollowersDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dropdown">
      <div className="dropdown-contents">
        <p>No one is trying to contact with you!</p>
      </div>
    </div>
  );
};

export default Navbar;
