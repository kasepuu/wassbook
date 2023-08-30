import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import { useState, useEffect } from "react";
//import { Navigate } from "react-router-dom";
import { tokenValidation } from "../../index.js";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../jwt";
const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function checkAuthorization() {
      tokenValidation()
        .then((authorized) => {
          setIsAuthorized(authorized);
          if (!authorized) {
            navigate("/login");
          }
          console.log("current user is:", authorized);
        })
        .catch((error) => {
          console.error("Authorization error:", error);
        });
    }
    checkAuthorization();
  }, [navigate]);

  if (isAuthorized) {
    loadUser();
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
