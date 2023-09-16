import "../../css/Feed.css";
import { backendHost } from "../../index.js";
import profilePicture from "../../page-images/blank.png";




import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Post = ({post}) => {
  
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
       
   </div>
  );
};

export default Post;
