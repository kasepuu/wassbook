import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import { useState, useEffect } from "react";
//import { Navigate } from "react-router-dom";
import { tokenValidation } from "../../index.js";
import Login from "./Login";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuthorization() {
      const authorized = await tokenValidation();
      setIsAuthorized(authorized);
      if (!authorized) {
        navigate("/login");
      }
    }
    checkAuthorization();
  }, [navigate]);
  if (isAuthorized) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <Feed />
        <FriendsList />
      </>
    );
  }
};

export default Home;
