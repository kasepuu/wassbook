import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Application.js";
import "./css/index.css";
import { wsAddConnection } from "./websocket.js"; // websocket
import { BrowserRouter } from "react-router-dom"; // router

export const backendHost = "http://localhost:8081";

export async function tokenValidation() {
  if (!sessionStorage.getItem("Bearer")) {
    console.log("Token not found");
    return false;
  }
  try {
    const response = await fetch(`${backendHost}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: sessionStorage.getItem("Bearer"),
      },
    });

    if (response.ok) {
      const message = await response.text();
      console.log("Everything is finee", `"${message}"`);
      return true;
    } else {
      console.log(
        "You are not authorized, something went wrong while validating!"
      );
      return false;
    }
  } catch (e) {
    console.error("Something went wrong while authorizing:", e);
    return false;
  } finally {
    console.log("You are authorized!");
  }
}

async function connectAndSendEvents() {
  try {
    const websocket = await wsAddConnection(); // Wait for the WebSocket connection to be established
    console.log("[WS]", websocket);
    // websocket events that will be sent on connection
    // sendEvent("get_online_members", `log-in-${currentUser.UserID}`);
    // sendEvent("load_posts", currentUser.UserID);
    // sendEvent("update_users", "other Login");
  } catch (error) {
    console.error("Error connecting to WebSocket:", error);
  }
}

connectAndSendEvents(); // establishing a connection between frontend & backend

// rendering starts here
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
