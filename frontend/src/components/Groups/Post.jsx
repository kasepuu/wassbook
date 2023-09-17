import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "../../css/Feed.css";
import { backendHost } from "../../index.js";
import profilePicture from "../../page-images/blank.png";
import CommentForm from "./CommentForm";
import PostComments from "./PostComments";

const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));

const Post = ({post, handleCommentSubmit}) => {
  
  let { id } = useParams();

  return (
   <div className="feed-post" key={post.Id}>
    
    <div className="post-header">       
        <img
            src={`${backendHost}/users/${post.userId}/profilepic/profilepic` }
            onError={(e) => { e.target.onError = null; e.target.src = profilePicture }}
            alt="Profile"
            className="profile-picture"
        />
        <div className="post-title">{post.GroupName} {post.Date}</div>
    </div>
       

    <div className="post-body">{post.Content}</div>
        <img
            src={`${backendHost}/users/${post.UserId}/${post.Filename}`}
            alt=""            
            className="image-content"
        />       

     <div className="post-overlay">
        <div className="post-commentbox">
            <CommentForm
                hidden
                userInfo={userInfo}
                handleCommentSubmit={handleCommentSubmit}
                // commentImageName={commentImageName}
                // setCommentImageName={setCommentImageName}
                // commentInputValue={commentInputValue}
                // setCommentInputValue={setCommentInputValue}
                // openedPostId={openedPostId}
                // loadComments={post.Comments}
            />
            <PostComments
                comments={post.Comments}
            />
        </div>
    </div> 

   </div>

 
  );
};

export default Post;