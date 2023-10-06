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
    const payload = {
      RequesterID: RequesterID,
      GroupID: GroupID,
    };

    sendEvent("decline_group_request", payload);
  }

  return (
    <div className="dropdown-contents">
      {isLoading ? (
        <p>Loading requests...</p>
      ) : (
        <>
          {(requests.FollowerRequests &&
            requests.FollowerRequests.length > 0) ||
          (requests.GroupRequests && requests.GroupRequests.length > 0) ||
          (requests.GroupInvites && requests.GroupInvites.length > 0) ? (
            <>
              {requests.FollowerRequests &&
                requests.FollowerRequests.length > 0 && (
                  <div className="group-requests">
                    {/* ... Follower Requests Rendering */}
                  </div>
                )}

              {requests.GroupRequests && requests.GroupRequests.length > 0 && (
                <div className="follower-requests">
                  {/* ... Group Requests Rendering */}
                </div>
              )}

              {requests.GroupInvites && requests.GroupInvites.length > 0 && (
                <div className="follower-requests">
                  {/* ... Group Invites Rendering */}
                </div>
              )}
            </>
          ) : (
            <p>No requests found!</p>
          )}
        </>
      )}
    </div>
  );
};

export default Request;
