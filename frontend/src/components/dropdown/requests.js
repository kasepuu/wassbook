import Request from "./request";
import { backendHost } from "../..";
import { useEffect, useState } from "react";
const FollowersDropDown = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const CurrentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

    fetch(`${backendHost}/fetch-requests?UserID=${CurrentUser.UserID}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to l1oad users that are trying to follow");
        }
        return response.json();
      })
      .then((data) => {
        console.log("requests:", data);
        setRequests(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading users trying to follow:", error);
      });
  }, [isOpen]);

  return (
    <>
      {" "}
      <div className="dropdown">
        <Request requests={requests} isLoading={isLoading} />
      </div>
    </>
  );
};

export default FollowersDropDown;
