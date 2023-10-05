import { FaCheck, FaTimes } from "react-icons/fa";
import { sendEvent } from "../../websocket";

const Request = ({ requests, isLoading }) => {
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

  function handleOnAcceptGroupInvite(RequesterID, GroupID) {
    const payload = {
      RequesterID: RequesterID,
      GroupID: GroupID,
    };

    sendEvent("accept_group_invite", payload);
  }

  function handleOnDeclineGroupInvite(RequesterID, GroupID) {
    const payload = {
      RequesterID: RequesterID,
      GroupID: GroupID,
    };

    sendEvent("decline_group_invite", payload);
  }

  function handleOnAcceptGroupRequest(RequesterID, GroupID) {
    const payload = {
      RequesterID: RequesterID,
      GroupID: GroupID,
    };

    sendEvent("accept_group_request", payload);
  }

  function handleOnDeclineGroupRequest(RequesterID, GroupID) {
    console.log("declined!!!");
    const payload = {
      RequesterID: RequesterID,
      GroupID: GroupID,
    };

    sendEvent("decline_group_request", payload);
  }

  console.log("REQUESTS:", requests);
  console.log("REQUESTS FRIEND:", requests.FollowerRequests);
  console.log("REQUESTS GROUP:", requests.GroupRequests);
  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>No requests found!</p>
      ) : (
        <>
          {requests.FollowerRequests &&
            requests.FollowerRequests.length > 0 && (
              <div className="group-requests">
                {requests.FollowerRequests.map((user) => (
                  <div key={user.UserID} className="dropdown-result">
                    <span className="coloredMessage">{user.FirstName}</span>{" "}
                    wants to follow you
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
              </div>
            )}

          {requests.GroupRequests && requests.GroupRequests.length > 0 && (
            <div className="follower-requests">
              {requests.GroupRequests.map((request, index) => (
                <div
                  key={`${request.UserInfo.UserID}-${index}`}
                  className="dropdown-result"
                >
                  <span className="coloredMessage">
                    {request.UserInfo.FirstName}
                  </span>{" "}
                  wants to join{" "}
                  <span className="coloredMessage">
                    {request.GroupInfo.Name}
                  </span>{" "}
                  <button
                    type="button"
                    className="btn-accept"
                    onClick={() => {
                      handleOnAcceptGroupRequest(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID
                      );
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn-decline"
                    onClick={() => {
                      handleOnDeclineGroupRequest(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID
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
                  Invited to join{" "}
                  <span className="coloredMessage">
                    {request.GroupInfo.Name}
                  </span>{" "}
                  <button
                    type="button"
                    className="btn-accept"
                    onClick={() => {
                      handleOnAcceptGroupInvite(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID
                      );
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn-decline"
                    onClick={() => {
                      handleOnDeclineGroupInvite(
                        request.UserInfo.UserID,
                        request.GroupInfo.ID
                      );
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Request;
