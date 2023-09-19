import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { sendEvent } from "../../websocket";

const Notification = ({ notifications, isLoading }) => {
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  function handleOnClear(notification, all = false) {
    const payload = {
      NotificationID: notification.ID,
      TargetID: notification.TargetID,
      ClearAll: all,
    };

    console.log("AT NOTIFCIATINOS CLEAR: SENDING THIS PAYLAOD:", payload);
    sendEvent("remove_notification", payload);
  }

  console.log("loaded_notifications:", notifications);

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>Loading notifications...</p>
      ) : notifications && notifications.length > 0 ? (
        <>
          {notifications.map((notification) => (
            <div key={notification.ID} className="dropdown-result">
              {notification.Description}
              <button
                type="button"
                className="btn-accept"
                onClick={() => {
                  handleOnClear(notification);
                }}
              >
                <FaTimes />
              </button>
            </div>
          ))}

          <div
            className="clearNotifications"
            onClick={(e) => {
              handleOnClear({ ID: -1, TargetID: LoggedUser.UserID }, true);
            }}
          >
            Clear All
          </div>
        </>
      ) : (
        <p>No notifications to display.</p>
      )}
    </div>
  );
};

export default Notification;
