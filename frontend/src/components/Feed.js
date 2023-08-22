import "../css/Feed.css";
import React, { useState } from "react";
import profilePicture from "../page-images/blank.png";

const Feed = () => {
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState([]);

  // siia vaja teha load feed databaasist

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim() !== "") {
      const currentDate = new Date().toLocaleString();
      const newPost = {
        title: `${firstName} ${lastName} - ${currentDate}`,
        body: inputValue,
      };
      setPosts([...posts, newPost]);
      setInputValue("");
    }
  };

  // lisada uus postitus databaasi

  let firstName = "Eesnimi";
  let lastName = "Perenimi";
  return (
    <div className="Feed">
      <div className="feed-container">
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder={`What's on your mind, ${firstName}?`}
            className="NewPost"
            value={inputValue}
            onChange={handleInputChange}
          ></input>
        </form>
      </div>

      <div className="feed-posts">
        {posts.map((post, index) => (
          <div key={index} className="feed-post">
            <div className="post-header">
              <img
                src={profilePicture}
                alt="Profile"
                className="profile-picture"
              />
              <div className="post-title">{post.title}</div>
            </div>
            <div className="post-body">{post.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
