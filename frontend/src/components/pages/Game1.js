import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import { useState, useEffect } from "react";
import { tokenValidation } from "../../index.js";
import Login from "./Login";
const Game1 = () => {
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
      <iframe src="http://joelsoft.eu:1111" width="1300px" height="740px" />
      <FriendsList />
    </>
  );
};

export default Game1;
