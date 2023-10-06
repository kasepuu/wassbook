import "../../css/Feed.css";
import { sendEvent } from "../../websocket";
import { GroupPosts } from "./GroupPosts";

import {
  getGroup,
  createPost,
  createComment,
  inviteMember,
} from "../utils/groups";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info } from "./Info";
import { Members } from "./Members";
import { Events } from "./Events.js";
//import { GroupForm } from "./GroupForm";

const Group = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));

  const [data, setData] = useState({
    Posts: [],
    Members: [],
    Events: [],
    AllUsers: [],
  });
  const [item, setItem] = useState("main");
  let { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const response = await getGroup(id);
      setData(response);
    }

    fetchData();
  }, [id]);

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
    formData.append("receiverId", member.Id);
    formData.append("senderId", data.OwnerId);
    formData.append("groupId", data.Id);
    formData.append("status", "invited");

    const notificationPayload = {
      TargetID: member.id,
      SenderID: data.OwnerId,
      Description: "New group Invite!",
    };

    sendEvent("send_notification", notificationPayload);

    const updatedUsers = await inviteMember(formData);

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

  const handleJoin = async () => {
    const formData = new FormData();
    formData.append("receiverId", userInfo.UserID);
    formData.append("senderId", data.OwnerId);
    formData.append("groupId", data.Id);
    formData.append("status", "pending");

    const notificationPayload = {
      TargetID: data.OwnerId,
      SenderID: userInfo.UserID,
      Description: `${userInfo.FirstName} wants to join your group!`,
    };

    sendEvent("send_notification", notificationPayload);

    const updatedUsers = await inviteMember(formData);

    setData((prevData) => {
      return { ...prevData, AllUsers: updatedUsers };
    });
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
            </div>
            {renderSwitch(item)}
          </main>
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
