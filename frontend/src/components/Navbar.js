import "../css/Navbar.css";
import logo from "../logo.svg";
import { Link, useNavigate } from "react-router-dom";
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
import { useEffect, useState } from "react";
import FollowersDropDown from "./dropdown/followers";
import NotificationsDropdown from "./dropdown/notifications";

const Navbar = () => {
  const [isNotificationsOpen, setNotificationsOpened] = useState(false);
  const [isFollowersOpen, setFollowersOpened] = useState(false);
  const [followerRequests, setFollowerRequests] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

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

  // event listener for updates (new notification or new follower request)
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_notifications") {
        console.log("update_notifications");
        // update the chat log with the received message, only if chat is opened with the right person.
      } else if (eventData.type === "update_follower_requests") {
        console.log("update_follower_requests");
        if (eventData.payload) {
          setFollowerRequests(eventData.payload);
        }
        // update notifications
      }
    };
  }, [followerRequests]);

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
          <span className="notification-design">{followerRequests}</span>
          <FaUserFriends /> Followers
          {isFollowersOpen && <FollowersDropDown isOpen={isFollowersOpen} />}
        </Link>

        <Link to="/logout" onClick={handleLogout}>
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
