import "../../css/Feed.css";
import "../../css/Groups.css";

import { useState, useEffect } from "react";
import { GroupsMenu } from "./GroupsMenu";
import { Posts } from "./Posts";
import { GroupForm } from "./GroupForm";
import { getGroups, createGroup } from "../utils/groups";
import { createComment } from "../utils/groups";
import { getLoggedUserFromStorage } from "../..";

const Groups = () => {
  const userInfo = getLoggedUserFromStorage(true, true);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const response = await getGroups(userInfo.UserID);
      setGroups(response.Groups);
      setPosts(response.Posts);
    }

    fetchData();
  }, [userInfo.UserID]);

  const submitGroup = async (data) => {
    data.append("userId", userInfo.UserID);

    let response = await createGroup(data);

    setGroups(response);
  };

  const submitComment = async (data, post) => {
    data.append("userId", userInfo.UserID);
    data.append("postId", post.Id);
    data.append("groupId", post.GroupId);
    let response = await createComment(data);
    setPosts(response);
  };

  //TODO vaadata kuidas horisontaalselt scroll korda teha
  return (
    <>
      <div className="Feed">
        <div className="feed-container">
          <GroupsMenu groups={groups} />
          <Posts posts={posts} handleCommentSubmit={submitComment} />
          <GroupForm handleSubmit={submitGroup} />
        </div>
      </div>
    </>
  );
};

export default Groups;
