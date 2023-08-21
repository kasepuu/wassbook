import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { tokenValidation } from "../../index.js";
import Login from "./Login";
const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuthorization() {
      const authorized = await tokenValidation();
      setIsAuthorized(authorized);
    }

    checkAuthorization();
  }, []);

  if (!isAuthorized) {
    return <Login />;
  }

  return (
    <>
      <Navbar />
      <Sidebar />
      <Feed />
      <FriendsList />
    </>
  );
};

export default Home;
