import { FaCheck, FaTimes } from "react-icons/fa";
import { sendEvent } from "../../websocket";

const Follower = ({ users, isLoading }) => {
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  function handleOnAccept(Requester) {
    const payload = {
      RequesterID: Requester.UserID,
      TargetID: LoggedUser.UserID,
    };

    sendEvent("accept_follow_request", payload);
  }

  function handleOnDecline(Requester) {
    const payload = {
      RequesterID: Requester.UserID,
      TargetID: LoggedUser.UserID,
    };

    sendEvent("decline_follow_request", payload);
  }

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>No one is trying to follow you!</p>
      ) : users.length > 0 ? (
        <>
          {users.map((user) => (
            <div key={user.UserID} className="dropdown-result">
              {user.FirstName} {user.LastName}
              <button
                type="button"
                className="btn-accept"
                onClick={() => {
                  handleOnAccept(user);
                }}
              >
                <FaCheck />
              </button>
              <button
                className="btn-decline"
                onClick={() => {
                  handleOnDecline(user);
                }}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </>
      ) : (
        <p>No one is trying to contact you!</p>
      )}
    </div>
  );
};

export default Follower;
