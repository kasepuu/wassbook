import "../../../css/Profile.css";
import { sendEvent } from "../../../websocket";

const ProfileFollow = ({ userInfo, isLocalUser }) => {
    const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

    function handleUnFollow(requesterID, targetID) {
        const payload = {
            RequesterID: requesterID,
            TargetID: targetID,
        };

        sendEvent("send_unfollow_request", payload);
    }

    function handleFollowClick(requesterID, targetID, status) {
        const payload = {
            RequesterID: requesterID,
            TargetID: targetID,
            Status: status,
        };

        sendEvent("send_follow_request", payload);
    }

    return (
        <>
            {userInfo.FollowStatus === "following" || isLocalUser ? (
                !isLocalUser ? (
                    <button
                        onClick={() => {
                            handleUnFollow(LoggedUser.UserID, userInfo.UserID);
                        }}
                    >
                        Unfollow
                    </button>
                ) : null
            ) : (
                <div>
                    {userInfo.FollowStatus === "pending" ? (
                        <div className="not-friends-message">
                            You are not following this user yet.
                            <button disabled>Request pending ⏳</button>
                            <button
                                onClick={() => {
                                    handleUnFollow(LoggedUser.UserID, userInfo.UserID);
                                }}
                            >
                                Cancel request
                            </button>
                        </div>
                    ) : (
                        <p>
                            You are not following this user.
                            <button
                                onClick={() => {
                                    let status = "following";
                                    if (userInfo.PrivateStatus === 1) status = "pending";
                                    handleFollowClick(
                                        LoggedUser.UserID,
                                        userInfo.UserID,
                                        status
                                    );
                                }}
                                value={userInfo.UserID}
                            >
                                Follow &gt;.&lt;
                            </button>
                        </p>
                    )}
                </div>
            )}
        </>
    );
};
export default ProfileFollow;
