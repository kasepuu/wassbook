import { useEffect, useState } from "react";
import { sendEvent } from "../../websocket";

const ProfileFollowers = () => {
    const [followingList, setFollowingList] = useState([])
    const [followersList, setFollowersList] = useState([])
    const user = JSON.parse(sessionStorage.getItem("CurrentUser"));

    useEffect(() => {
        const sender = user.UserID;
        const payload = {
            SenderID: sender,
        };
        sendEvent("getProfile_followerslist", payload);
    }, []);

    useEffect(() => {
        const handleWebSocketMessage = (e) => {
            const eventData = JSON.parse(e.data);
            if (eventData.type === "profile_followerslist") {
                console.log("EVENT RECEIVED in Sidebar: profile_followerslist");
                setFollowersList(eventData.payload);
            }
            if (eventData.type === "profile_followinglist") {
                console.log("EVENT RECEIVED in Sidebar: profile_followerslist");
                setFollowingList(eventData.payload);
            }
        };

        if (window.socket) {
            window.socket.addEventListener("message", handleWebSocketMessage);
        }

        return () => {
            if (window.socket) {
                window.socket.addEventListener("message", handleWebSocketMessage);
            }
        };
    }, []);
    return (
        <div className="Sidebar">
            <div className="followersOnProfile">
                <h2>You are following:</h2>
                {followingList &&
                    followingList.map(element => (
                        <p><a href={`http://localhost:8080/profile/${element.UserName}`} key={element.UserId}>{element.UserName}
                        </a></p>
                    ))
                }
                <h2>Following you:</h2>
                {followersList &&
                    followersList.map(element => (
                        <p><a href={`http://localhost:8080/profile/${element.UserName}`} key={element.UserId}>{element.UserName}
                        </a></p>
                    ))
                }
            </div>
        </div>
    );
};

export default ProfileFollowers;
