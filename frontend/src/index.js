import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./components/Router.js";
import "./css/index.css";
import { wsAddConnection } from "./websocket.js"; // websocket
import { RouterProvider, createBrowserRouter } from "react-router-dom"; // router
import Register from "./components/pages/Register.js";
import Login from "./components/pages/Login.js";
import Game1 from "./components/pages/Game1.js";
import Profile from "./components/pages/Profile.js";
import Group from "./components/Groups/Group.js";
import Groups from "./components/Groups";
import Error from "./components/pages/Error.js";
import Logout, { clearAllCookies } from "./components/pages/Logout.js";
import Feed from "./components/pages/Feed.js";
import "./css/Sidepanels.css";
import { getCookieValue } from "./jwt.js";
export const backendHost = "http://localhost:8081";

export function getLoggedUserFromStorage(parse = false, forceLogout = false) {
  const loggedUser = sessionStorage.getItem("CurrentUser");
  const cookie = getCookieValue("Bearer");

  if ((!loggedUser && forceLogout) || !cookie) {
    clearAllCookies();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
  if (parse) return JSON.parse(loggedUser);
  else return loggedUser;
}

export function connectAndSendEvents() {
  if (!window.socket) {
    console.log("connectAndSendEvents()");
    wsAddConnection()
      .then((websocket) => {
        console.log("[WS]", websocket);
      })
      .catch((error) => {
        console.error("Error connecting to WebSocket:", error);
      });
  }
}

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Router />, // the element that is being rendered constantly
    errorElement: <Error />,
    children: [
      { index: true, element: <Feed /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/logout", element: <Logout /> },

      { path: "/game-1", element: <Game1 /> },
      { path: "/profile/:id", element: <Profile /> },

      { path: "/groups", element: <Groups /> },
      { path: "/groups/:id", element: <Group /> },
    ],
  },
]);

// rendering starts here
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <React.StrictMode>
    <RouterProvider router={routes}></RouterProvider>
  </React.StrictMode>
);
