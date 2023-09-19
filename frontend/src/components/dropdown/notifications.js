import Notification from "./notification";
import { useState, useEffect } from "react";
import { backendHost } from "../..";
const NotificationsDropDown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const CurrentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

    fetch(`${backendHost}/fetch-notifications?UserID=${CurrentUser.UserID}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load users that are trying to follow");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setNotifications(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading notifications:", error);
      });
  }, [isOpen]);

  return (
    <div className="dropdown">
      <Notification notifications={notifications} isLoading={isLoading} />
    </div>
  );
};

export default NotificationsDropDown;
