import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Application.js';
import "./css/index.css"
// import {wsAddConnection} from "./websocket.js"
/*
async function connectAndSendEvents() {
  try {
      const websocket = await wsAddConnection(); // Wait for the WebSocket connection to be established
      console.log("[WS]", websocket)
      // websocket events that will be sent on connection
      // sendEvent("get_online_members", `log-in-${currentUser.UserID}`);
      // sendEvent("load_posts", currentUser.UserID);
      // sendEvent("update_users", "other Login");
  } catch (error) {
      console.error("Error connecting to WebSocket:", error);
  }
}

connectAndSendEvents() // establishing a connection between frontend & backend
*/



// router
import Home from "./components/pages/Home"
import {BrowserRouter as Router, Route, Routes, BrowserRouter} from "react-router-dom"


// rendering starts here
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);