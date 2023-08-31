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
        <img src={Advertisement1} className="ad1" alt="advertisement" />
      </div>

      <div className="sidebar-content">
        <h2>Sidebar content</h2>
        <h3>Games</h3>
        <FaAngry />
        <Link to="/game-1"> päkapikk ja kuri koll</Link>
      </div>
    </div>
  );
};

export default Sidebar;
