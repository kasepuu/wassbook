import { FaCheck, FaTimes } from "react-icons/fa";
import { sendEvent } from "../../websocket";

const Request = ({ requests, isLoading }) => {
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  function handleOption(RequesterID, TargetID, eventType) {
    const payload = {
      RequesterID: RequesterID,
      TargetID: TargetID,
    };
    sendEvent(eventType, payload);
  }

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>Loading requests...</p>
      ) : (
        <>
          {requests.FollowerRequests &&
            requests.FollowerRequests.length > 0 && (
              <div className="follower-requests">
                {requests.FollowerRequests.map((user) => (
                  <div key={user.UserID} className="dropdown-result">
                    <div className="dropdown-request-description ">
                      <span className="coloredMessage">{user.FirstName}</span>{" "}
                      wants to follow you
                    </div>
                    <button
                      type="button"
                      className="btn-accept"
                      onClick={() => {
                        handleOption(
                          user.UserID,
                          LoggedUser.UserID,
                          "accept_follow_request"
                        );
                      }}
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => {
                        handleOption(
                          user.UserID,
                          LoggedUser.UserID,
                          "decline_follow_request"
                        );
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          {requests.GroupRequests && requests.GroupRequests.length > 0 && (
            <div className="group-requests">
              {requests.GroupRequests.map((request, index) => (
                <div
                  key={`${request.UserInfo.UserID}-${index}`}
                  className="dropdown-result"
                >
                  <div className="dropdown-request-description">
                    <span className="coloredMessage">
                      {request.UserInfo.FirstName}
                    </span>{" "}
                    wants to join{" "}
                    <span className="coloredMessage">
                      {request.GroupInfo.Name}
                    </span>{" "}
                  </div>

                  <button
                    type="button"
                    className="btn-accept"
                    onClick={() => {
                      handleOption(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID,
                        "accept_group_request"
                      );
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn-decline"
                    onClick={() => {
                      handleOption(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID,
                        "decline_group_request"
                      );
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
          {requests.GroupInvites && requests.GroupInvites.length > 0 && (
            <div className="follower-requests">
              {requests.GroupInvites.map((request, index) => (
                <div
                  key={`${request.UserInfo.UserID}-${index}`}
                  className="dropdown-result"
                >
                  <div className="dropdown-request-description">
                    Invited to join{" "}
                    <span className="coloredMessage">
                      {request.GroupInfo.Name}
                    </span>{" "}
                  </div>
                  <button
                    type="button"
                    className="btn-accept"
                    onClick={() => {
                      handleOption(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID,
                        "accept_group_invite"
                      );
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn-decline"
                    onClick={() => {
                      handleOption(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID,
                        "decline_group_invite"
                      );
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
          {!requests.GroupInvites &&
            !requests.GroupRequests &&
            !requests.FollowerRequests && <p>No requests found!</p>}
        </>
      )}
    </div>
  );
};
export default Request;
