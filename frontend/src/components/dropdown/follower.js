import { FaCheck, FaTimes } from "react-icons/fa";
import { backendHost } from "../..";
const Follower = ({ users, isLoading }) => {
  function handleOnAccept(Requester) {
    fetch(
      `${backendHost}/send-follower-accept-request?Requester=${
        Requester.UserID
      }&Accepter=${JSON.parse(sessionStorage.getItem("CurrentUser")).UserID}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send accept request");
        }
        console.log("Accepted!", Requester.UserID);
      })
      .catch((error) => {
        console.error("Error sending accept request:", error);
      });
  }

  function handleOnDecline(Requester) {
    `${backendHost}/send-follower-decline-request?Requester=${
      Requester.UserID
    }&Accepter=${JSON.parse(sessionStorage.getItem("CurrentUser").UserID)}`
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send decline request");
        }
        console.log("Declined!", Requester.UserID);
      })
      .catch((error) => {
        console.error("Error sending decline request:", error);
      });
  }

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>No one is trying to follow you!</p>
      ) : users.length > 0 ? (
        <>
          {users.map((user) => (
            <div className="dropdown-result">
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
