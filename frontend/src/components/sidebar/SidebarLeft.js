import { FaAd } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaAngry } from "react-icons/fa";
import Advertisement1 from "../../page-images/advertisement.png";
import ProfileFollowers from "./ProfileFollowers";
import { getLoggedUserFromStorage } from "../..";
const SidebarLeft = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const user = getLoggedUserFromStorage(true, true);

  return (
    <>
      {parts.length >= 2 &&
      parts[1] === "profile" &&
      parts[2] === user.UserName ? (
        <>
          <ProfileFollowers />
        </>
      ) : (
        <>
          <div className="Sidebar">
            <div className="ad-container">
              <h2>Ads</h2>
              <FaAd /> advertisement
              <img src={Advertisement1} className="ad1" alt="advertisement" />
            </div>

            <div className="sidebar-content">
              <h2>Sidebar content</h2>
              <h3>Games</h3>
              <FaAngry />
              <Link to="/game-1"> päkapikk ja kuri koll</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SidebarLeft;
