import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Application.js";
import "./css/index.css";
import { wsAddConnection } from "./websocket.js"; // websocket
import { BrowserRouter } from "react-router-dom"; // router

export const backendHost = "http://localhost:8081";

export function connectAndSendEvents() {
  if (!window.socket) return;
  console.log("connectAndSendEvents()");
  wsAddConnection()
    .then((websocket) => {
      console.log("[WS]", websocket);
      // websocket events that will be sent on connection
      // sendEvent("get_online_members", `log-in-${currentUser.UserID}`);
      // sendEvent("load_posts", currentUser.UserID);
      // sendEvent("update_users", "other Login");
    })
    .catch((error) => {
      console.error("Error connecting to WebSocket:", error);
    });
}

// rendering starts here
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
