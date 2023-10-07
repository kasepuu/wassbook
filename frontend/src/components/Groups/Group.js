import "../../css/Feed.css";
import { sendEvent } from "../../websocket";
import { GroupPosts } from "./GroupPosts";
import ConfirmationDialog from "../ConfirmationDialog";
import {
  getGroup,
  createPost,
  createComment,
  invitedMembers,
} from "../utils/groups";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info } from "./Info";
import { Members } from "./Members";
import { Events } from "./Events.js";

const Group = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [refreshPage, setRefreshPage] = useState(false);

  const [data, setData] = useState({
    Posts: [],
    Members: [],
    Events: [],
    AllUsers: [],
  });
  const [item, setItem] = useState("main");
  let { id } = useParams();

  // websocket connection to allow real time page refresh (on request accept/decline)
  useEffect(() => {
    const handleWebSocketMessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_group_page") {
        setRefreshPage(true);
      }
    };

    if (window.socket) {
      window.socket.addEventListener("message", handleWebSocketMessage);
    }

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      if (window.socket) {
        window.socket.addEventListener("message", handleWebSocketMessage);
      }
    };
  }, [setRefreshPage]);

  useEffect(() => {
    async function fetchData() {
      const response = await getGroup(id);
      setData(response);
    }
    fetchData();
    if (refreshPage) {
      setRefreshPage(false);
    }
  }, [refreshPage, id]);

  const handlePostForm = async (e) => {
    e.preventDefault();
    let data = new FormData(e.target);

    data.append("userId", userInfo.UserID);
    data.append("groupId", id);

    let response = await createPost(data);

    setData((prevData) => {
      return { ...prevData, Posts: response };
    });
    e.target.reset();
  };

  const handleCommentSubmit = async (data, post) => {
    data.append("userId", userInfo.UserID);
    data.append("postId", post.Id);
    data.append("groupId", post.GroupId);
    let response = await createComment(data);
    setData((prevData) => {
      return { ...prevData, Posts: response };
    });
  };

  const inviteHandler = async (member) => {
    const formData = new FormData();
    formData.append("groupId", data.Id);

    console.log(member);

    const payload = {
      ReceiverID: member.Id,
      SenderID: userInfo.UserID,
      GroupID: data.Id,
      Status: "invited",
    };

    sendEvent("invite_group_join", payload);

    const updatedUsers = await invitedMembers(formData);

    setData((prevData) => {
      return { ...prevData, AllUsers: updatedUsers };
    });
  };

  const handleMenuClick = (e) => {
    setItem(e.target.innerText.toLowerCase().trim());
  };

  const renderSwitch = (cmpnt) => {
    switch (cmpnt) {
      case "info":
        return <Info data={data} />;
      case "members":
        return <Members inviteHandler={inviteHandler} data={data} />;
      case "events":
        return <Events data={data} />;
      default:
        return (
          <GroupPosts
            posts={data.Posts}
            handleCommentSubmit={handleCommentSubmit}
            handlePostForm={handlePostForm}
          />
        );
    }
  };

  const isMemberOf = () => {
    if (data.AllUsers === undefined) return;
    return data.AllUsers.find(({ Id, Status }) => {
      return Id === userInfo.UserID && Status === "accepted";
    });
  };

  const isPending = () => {
    if (data.AllUsers === undefined) return;
    return data.AllUsers.find(({ Id, Status }) => {
      return Id === userInfo.UserID && Status === "pending";
    });
  };

  const handleJoin = () => {
    const payload = {
      ReceiverID: userInfo.UserID,
      SenderID: data.OwnerId,
      GroupID: data.Id,
      Status: "pending",
    };

    sendEvent("request_group_join", payload);
  };

  const handleCancelRequest = () => {
    setShowConfirmation(true);
  };

  const handleLeaveGroup = () => {
    const payload = {
      ReceiverID: userInfo.UserID,
      SenderID: data.OwnerId,
      GroupID: data.Id,
      Status: "pending",
    };

    sendEvent("request_group_leave", payload);

    setRefreshPage(true);
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="Feed feed-container">
        <h1>{data.Name}</h1>

        {isMemberOf() ? (
          <main>
            <div className="group-menu">
              <span onClick={handleMenuClick}>Discussion </span>
              <span onClick={handleMenuClick}>Info </span>
              <span onClick={handleMenuClick}>Members </span>
              <span onClick={handleMenuClick}>Events </span>
              <span onClick={handleCancelRequest}>Leave Group</span>
            </div>
            {renderSwitch(item)}

            <ConfirmationDialog
              open={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={handleLeaveGroup}
            />
          </main>
        ) : isPending() ? (
          <>
            <h3>Your join request is pending approval.</h3>
            <button onClick={handleCancelRequest}>Cancel Request</button>
            <ConfirmationDialog
              open={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={handleLeaveGroup}
            />
          </>
        ) : (
          <>
            <h3>To join this group, press button below</h3>
            <button onClick={handleJoin}>Join</button>
          </>
        )}
      </div>
    </>
  );
};

export default Group;
