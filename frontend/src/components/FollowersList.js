import React, { useState, useEffect } from "react";
import { backendHost } from "../";

const FollowersList = (UserID) => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  useEffect(() => {
    fetch(`${backendHost}/getMutualFollowers`, {
      method: "POST",
      body: JSON.stringify({
        UserID: LoggedUser.UserID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMutualFollowers(data);
      })
      .catch((error) => {
        console.error("Error fetching mutual followers:", error);
      });
  }, []);

  return (
    <div className="FollowersList">
      <h1>Followers:</h1>
      <ul>
        {mutualFollowers !== null && mutualFollowers.length > 0 && mutualFollowers.map((follower, index) => (
          <li key={`${follower.UserID}-${index}`}>
            {follower.UserName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowersList;
