import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Application.js";
import "./css/index.css";
import { wsAddConnection } from "./websocket.js"; // websocket
import { RouterProvider, createBrowserRouter } from "react-router-dom"; // router
import Register from "./components/pages/Register.js";
import Login from "./components/pages/Login.js";
import Game1 from "./components/pages/Game1.js";
import Profile from "./components/pages/Profile.js";
import Group from "./components/pages/Group.js";
import Groups from "./components/pages/Groups.js";
import Error from "./components/pages/Error.js";
import Logout from "./components/pages/Logout.js";
import Feed from "./components/Feed.js";

import { sendEvent } from "./websocket.js";
export const backendHost = "http://localhost:8081";

export function connectAndSendEvents() {
  if (!window.socket) {
    console.log("connectAndSendEvents()");
    wsAddConnection()
      .then((websocket) => {
        console.log("[WS]", websocket);
        // websocket events that will be sent on connection
        sendEvent(
          "update_notifications",
          JSON.parse(sessionStorage.getItem("CurrentUser")).UserID
        );
        // sendEvent("get_online_members", `log-in-${currentUser.UserID}`);
        // sendEvent("load_posts", currentUser.UserID);
        // sendEvent("update_users", "other Login");
      })
      .catch((error) => {
        console.error("Error connecting to WebSocket:", error);
      });
  }
}

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />, // the element that is being rendered constantly
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
