import Notification from "./notification";

const NotificationsDropDown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="dropdown">
      <Notification />
    </div>
  );
};

export default NotificationsDropDown;
