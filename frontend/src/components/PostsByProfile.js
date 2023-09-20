import "../css/Feed.css";
import React, { useState, useEffect } from "react";
import profilePicture from "../page-images/blank.png";
import { backendHost } from "../index.js";

const PostsByProfile = ({ profilepic, userID, loggedUserID }) => {
  const [posts, setPosts] = useState([]);
  //const userInfo = JSON.parse(localStorage.getItem("CurrentUser"));

  function loadFeed() {
    console.log(userID, loggedUserID)
    fetch(`${backendHost}/getPostByUserId?userID=${userID}&loggedUserID=${loggedUserID}`, {
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error updating private status:", error);
      })
      .then((data) => {
        if (data === null) {
          setPosts([]);
          return;
        }

        console.log(data);

        const postsArray = data.map((post) => ({
          title: `${post.FirstName} ${post.LastName} - ${post.Date}`,
          body: post.Content,
          id: post.PostID,
          file: post.Filename,
          userID: post.UserID,
        }));

        setPosts(postsArray.reverse());
      })
      .catch((error) => {
        console.error("Error loading feed:", error);
      });
  }

  useEffect(() => {
    loadFeed(userID, loggedUserID);
  }, [userID, loggedUserID]);

  return (
    <>
      <div className="feed-posts" id="feed-posts">
        {posts.map((post, index) => (
          <div key={index} id={`post-${post.id}`} className="feed-post">
            <div className="post-header">
              <img
                src={profilepic}
                onError={(e) => {
                  e.target.onError = null;
                  e.target.src = profilePicture;
                }}
                alt="Profile"
                className="profile-picture"
              />
              <div className="post-title">{post.title}</div>
            </div>
            <div className="post-body">{post.body}</div>
            {post.file !== "-" || post.file === undefined ? (
              <img
                src={`${backendHost}/users/${post.userID}/${post.file}`}
                alt="Post"
                className="image-content"
              />
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};

export default PostsByProfile;
