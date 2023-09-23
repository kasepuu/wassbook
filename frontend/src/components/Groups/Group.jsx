import "../../css/Feed.css";

import { GroupPosts } from "./GroupPosts";

import { getGroup, createPost, createComment } from "../utils/groups";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info } from "./Info";
import { Members } from "./Members";
import { Events } from "./Events";

const Group = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));

  const [data, setData] = useState({ Posts: [], Members: [], Events: [] });
  let { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const response = await getGroup(id);
      setData(response);
      console.warn(response);
    }

    fetchData();
  }, []);

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
    console.warn(data, post);

    data.append("userId", userInfo.UserID);
    data.append("postId", post.Id);
    data.append("groupId", post.GroupId);
    let response = await createComment(data);
    setData((prevData) => {
      return { ...prevData, Posts: response };
    });
  };

  const handleMenuClick = (e) => {
    setItem(e.target.innerText.toLowerCase().trim());
  };

  const [item, setItem] = useState("main");
  const renderSwitch = (cmpnt) => {
    console.log(cmpnt);
    switch (cmpnt) {
      case "info":
        return <Info />;
      case "members":
        return <Members />;
      case "events":
        return <Events />;
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

  return (
    <>
      <div className="Feed feed-container">
        <h1>{data.Name}</h1>

        <main>
          <div className="group-menu">
            <span onClick={handleMenuClick}>DISCUSSION </span>
            <span onClick={handleMenuClick}>INFO </span>
            <span onClick={handleMenuClick}>MEMBERS </span>
            <span onClick={handleMenuClick}>EVENTS </span>
          </div>

          {/* <GroupPosts
            posts={data.Posts}
            handleCommentSubmit={handleCommentSubmit}
            handlePostForm={handlePostForm}
          /> */}
          {renderSwitch(item)}
        </main>
      </div>
    </>
  );
};

export default Group;
