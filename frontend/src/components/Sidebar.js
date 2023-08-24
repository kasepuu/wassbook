import "../css/Sidebar.css";
import { FaAd } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaAngry } from "react-icons/fa";
import Advertisement1 from "../page-images/advertisement.png";
const Sidebar = () => {
  return (
    <div className="Sidebar">
      <div className="ad-container">
        <h2>Ads</h2>
        <FaAd /> advertisement
        <Link to="/game-1">
          <img src={Advertisement1} className="ad1" alt="advertisement" />
        </Link>
      </div>

      <div className="sidebar-content">
        <h2>Sidebar content</h2>
        <FaAngry /> grr
      </div>
    </div>
  );
};

export default Sidebar;
