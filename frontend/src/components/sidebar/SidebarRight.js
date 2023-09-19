import React, { useState, useEffect, useRef } from "react";
import "../../css/Chat.css";
import Chat from "../Chat";
import { backendHost } from "../..";
import MutualFollowers from "./MutualFollowers";
const SidebarRight = () => {
  return (
    <div className="FollowerContainer">
      <MutualFollowers />
    </div>
  );
};

export default SidebarRight;
