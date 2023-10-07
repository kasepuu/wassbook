import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { backendHost } from "../..";
import { getCookieValue } from "../../jwt";
const Logout = () => {
  useEffect(() => {
    const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

    // if there is a current user
    if (LoggedUser) {
      fetch(`${backendHost}/logout-attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserID: LoggedUser.UserID,
          Token: getCookieValue("Bearer"),
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("logout went smooth");
          } else {
            console.log("logout did not go so smooth:", response);
          }
        })
        .catch((error) => {
          console.error("Error during logout attempt:", error);
        });
    }
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
    window.socket = null;
  }, []);
  return <Navigate to="/login" />;
};

export function clearAllCookies() {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export default Logout;