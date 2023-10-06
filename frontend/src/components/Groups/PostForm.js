import React, { useState, useRef } from "react";
import { backendHost } from "../../index.js";

const FeedPostForm = ({ handlePostForm }) => {
  const loggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
  return (
    <div className="feed-container">
      <form onSubmit={handlePostForm}>
        <input
          type="text"
          placeholder={`What's on your mind, ${loggedUser.FirstName}?`}
          className="NewPost"
          name="content"
        ></input>
        <input
          name="file"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
        />
        <input type="file" accept="image/*" name="file" />
      </form>
    </div>
  );
};

export default FeedPostForm;
