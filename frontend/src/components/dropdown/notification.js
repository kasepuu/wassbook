import React from "react";
import { FaTimes } from "react-icons/fa";
import { sendEvent } from "../../websocket";

const Notification = ({ notifications, isLoading }) => {
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  function handleOnClear(notification, all = false) {
    const payload = {
      NotificationID: notification.ID,
      TargetID: notification.TargetID,
      ClearAll: all,
    };

    sendEvent("remove_notification", payload);
  }

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>Loading notifications...</p>
      ) : notifications && notifications.length > 0 ? (
        <>
          <div className="notifications-container">
            {notifications.map((notification) => (
              <div key={notification.ID} className="dropdown-result">
                <div className="dropdown-desc">{notification.Description}</div>
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
          </div>
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
        <p>No notifications to display</p>
      )}
    </div>
  );
};

export default Notification;
