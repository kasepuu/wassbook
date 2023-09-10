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
import FollowersDropDown from "./dropdown/followers";
import NotificationsDropdown from "./dropdown/notifications";

const Navbar = () => {
  const [isNotificationsOpen, setNotificationsOpened] = useState(false);
  const [isFollowersOpen, setFollowersOpened] = useState(false);

  function onNotifactionsClick(event) {
    event.stopPropagation();
    setNotificationsOpened(!isNotificationsOpen);
    if (isFollowersOpen) setFollowersOpened(false);
  }

  function onFollowersClick(event) {
    event.stopPropagation();
    setFollowersOpened(!isFollowersOpen);
    if (isNotificationsOpen) setNotificationsOpened(false);
  }

  return (
    <nav className="Navbar">
      <div className="links">
        <Link to="/">
          <FaHome /> Home
        </Link>
        <Link
          to={`/profile/${JSON.parse(sessionStorage.getItem("CurrentUser")).UserName
            }`}
        >
          <FaUserCircle /> Profile
        </Link>
        <Link to="/groups">
          <FaUsers /> Groups
        </Link>

        <Link
          onClick={(e) => {
            onNotifactionsClick(e);
          }}
          className="notificationsBTN"
        >
          <FaBell /> Notifications
          {isNotificationsOpen && (
            <NotificationsDropdown isOpen={isNotificationsOpen} />
          )}
        </Link>
        <Link
          onClick={(e) => {
            onFollowersClick(e);
          }}
          className="followersBTN"
        >
          <FaUserFriends /> Followers
          {isFollowersOpen && <FollowersDropDown isOpen={isFollowersOpen} />}
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
