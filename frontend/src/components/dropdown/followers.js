import Follower from "./follower";
import { backendHost } from "../..";
import { useEffect, useState } from "react";

const FollowersDropDown = ({ isOpen, onClose }) => {
  const [usersTryingToFollow, setUsersTryingToFollow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const CurrentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

    fetch(
      `${backendHost}/fetch-users-trying-to-follow?UserID=${CurrentUser.UserID}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load users that are trying to follow");
        }
        return response.json();
      })
      .then((data) => {
        setUsersTryingToFollow(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading users trying to follow:", error);
      });
  }, [isOpen]);

  return (
    <div className="dropdown">
      <Follower users={usersTryingToFollow} isLoading={isLoading} />
    </div>
  );
};

export default FollowersDropDown;
