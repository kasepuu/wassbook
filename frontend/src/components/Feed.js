import "../css/Feed.css";
import React, { useState, useEffect } from "react";
import profilePicture from "../page-images/blank.png";
import { backendHost } from "../index.js";


const Feed = () => {
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Load feed data from the backend on component mount
    loadFeed();
  }, []);

  // Function to load feed data from the backend
  async function loadFeed() {
    try {
      const response = await fetch(`${backendHost}/getposts`);
      if (response.ok) {
        const data = await response.json();
        if (data === null) {
          setPosts([]);
          return;
        }
        const postsArray = data.map(post => ({
          title: `${post.FirstName} ${post.LastName} - ${post.Date}`,
          body: post.Content,
        }));
        setPosts(postsArray.reverse());
      } else {
        console.log("Error fetching feed data");
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    if (inputValue.trim() !== "") {
      const currentDate = new Date().toLocaleString(undefined, options);
      const newPost = {
        title: `${firstName} ${lastName} - ${currentDate}`,
        body: inputValue,
      };
      postToDatabase({ userID: userInfo.UserID, firstName, lastName, currentDate, content: inputValue })
      setPosts([newPost, ...posts]);
      setInputValue("");
    }
  };

  async function postToDatabase(PostData) {
    console.log(PostData)
    try {
      const response = await fetch(`${backendHost}/savepost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserID: PostData.userID,
          FirstName: PostData.firstName,
          LastName: PostData.lastName,
          Date: PostData.currentDate,
          Content: PostData.content,
          GroupID: -1
        })
      });

      if (response.ok) {
        const message = await response.text();
        console.log("Everything is finee", `"${message}"`);
        return true;
      } else {
        console.log(
          "Something went wrong!"
        );
        return false;
      }
    } catch (e) {
      console.error("Something went wrong while sabing post:", e);
      return false;
    } finally {
      console.log("Post saved!");
    }
  }
  const userInfo = JSON.parse(localStorage.getItem("CurrentUser"));

  let firstName = userInfo.FirstName;
  let lastName = userInfo.LastName;

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