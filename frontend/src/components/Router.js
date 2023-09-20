import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { tokenValidation } from "../jwt";
import { Outlet } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLeft from "./sidebar/SidebarLeft";
import SidebarRight from "./sidebar/SidebarRight";
import { connectAndSendEvents } from "..";
import { sendEvent, wsAddConnection } from "../websocket";
function Router() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const AuthorizedStatus = await tokenValidation();
        setIsAuthorized(AuthorizedStatus);

        if (AuthorizedStatus && !window.socket) {
          wsAddConnection()
            .then(() => {
              setIsWebSocketConnected(true);

              const LoggedUser = JSON.parse(
                sessionStorage.getItem("CurrentUser")
              );
              const payload = {
                RequesterID: LoggedUser.UserID,
              };

              sendEvent("on_connection", payload); // onconnection :O
            })
            .catch((e) => {
              console.error(e);
              setIsWebSocketConnected(false);
            });
        }

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
            <SidebarLeft />
            <Outlet />
            <SidebarRight />
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
}

export default Router;
