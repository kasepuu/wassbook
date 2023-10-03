import "../../css/Feed.css";
import React, { useState, useRef } from "react";
import { backendHost } from "../../index.js";
import { FaImage } from "react-icons/fa";

const CommentForm = ({ userInfo, handleCommentSubmit, post }) => {
  const [selectedCommentFile, setSelectedCommentFile] = useState(null);

  const handleSubmit = (e) => {
    console.warn("hello ");
    e.preventDefault();
    let data = new FormData(e.target);
    handleCommentSubmit(data, post);

    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-input-wrapper">
        <div className="comment-input-container">
          <input
            type="text"
            placeholder={`Write a comment...`}
            className="NewComment"
            name="content"
          />
          <input type="file" accept="image/*" name="file" />
          {/* {commentImageName
                        ? `Selected image: ${commentImageName}`
                        : "Click here to select image."} */}
        </div>
        <button type="submit" className="comment-input-button">
          Post comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
