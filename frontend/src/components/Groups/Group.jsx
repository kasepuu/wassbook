import "../../css/Feed.css";
import { Posts } from "./Posts";
import FeedPostForm from "./PostForm";

import { getGroup, createPost, createComment } from "../utils/groups";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

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

  return (
    <>
      <div className="Feed feed-container">
        <div className="group-menu">
          <span>discussion |</span>
          <span>people |</span>
          <span>events |</span>
        </div>
        <h1>{data.Name}</h1>
        <h2>{data.Owner}</h2>
        <h3>{data.Description}</h3>
        <h4>{data.Date}</h4>

        <FeedPostForm handlePostForm={handlePostForm} />

        <Posts posts={data.Posts} handleCommentSubmit={handleCommentSubmit} />
      </div>
    </>
  );
};

export default Group;
