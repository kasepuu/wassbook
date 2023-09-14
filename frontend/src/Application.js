import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { tokenValidation } from "./jwt";
import { Outlet } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import FollowersList from "./components/FollowersList";

function App() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const AuthorizedStatus = await tokenValidation();
        setIsAuthorized(AuthorizedStatus);
        if (
          !AuthorizedStatus &&
          location.pathname !== "/login" &&
          location.pathname !== "/register"
        ) {
          console.log("You are not authorized, redirecting to login...");
          navigate("/login");
          return;
        }
        console.log("Authorization status:", AuthorizedStatus);
      } catch (error) {
        console.error("[Authorization] Error:", error);
      }
    };

    checkAuthorization();
  }, [navigate, location]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthorized ? (
        <>
          <div className="MainContainer">
            <Navbar />
            <Sidebar />
            <Outlet />
            <FollowersList />
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
}

export default App;
