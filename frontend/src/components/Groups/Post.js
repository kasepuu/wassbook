import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "../../css/Feed.css";
import { backendHost } from "../../index.js";
import profilePicture from "../../page-images/blank.png";
import CommentForm from "./CommentForm";
import PostComments from "./PostComments";

const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));

const handleOverlay = (e) => {
  e.preventDefault();

  const all =
    e.currentTarget.parentNode.parentNode.querySelectorAll(".post-overlay");

  for (const node of all) {
    node.hidden = true;
  }

  const current = e.currentTarget.parentNode.querySelector(".post-overlay");
  current.hidden = false;
};

const Post = ({ post, handleCommentSubmit }) => {
  let { id } = useParams();

  return (
    <div className="feed-post" key={post.Id}>
      <div onClick={handleOverlay} className="post-header">
        <img
          src={`${backendHost}/users/${post.userId}/profilepic/profilepic`}
          onError={(e) => {
            e.target.onError = null;
            e.target.src = profilePicture;
          }}
          alt="Profile"
          className="profile-picture"
        />
        <div className="post-title">
          {post.GroupName} {post.Date}
        </div>
      </div>

      <div onClick={handleOverlay} className="post-body">
        {post.Content}
      </div>
      <img
        src={`${backendHost}/${post.Filename}`}
        alt=""
        className="image-content"
      />

      <div hidden className="post-overlay">
        <div className="post-commentbox">
          <CommentForm
            userInfo={userInfo}
            handleCommentSubmit={handleCommentSubmit}
            post={post}
            // commentImageName={commentImageName}
            // setCommentImageName={setCommentImageName}
            // commentInputValue={commentInputValue}
            // setCommentInputValue={setCommentInputValue}
            // openedPostId={openedPostId}
            // loadComments={post.Comments}
          />
          <PostComments comments={post.Comments} post={post} />
        </div>
      </div>
    </div>
  );
};

export default Post;