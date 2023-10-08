import "../../css/Feed.css";
import React from "react";
const CommentForm = ({ userInfo, handleCommentSubmit, post }) => {
  const handleSubmit = (e) => {
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
        </div>
        <button type="submit" className="comment-input-button">
          Post comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
