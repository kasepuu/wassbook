import "../css/Feed.css";
import React, { useState, useEffect, useRef } from "react";
import profilePicture from "../page-images/blank.png";
import { backendHost } from "../index.js";

const Feed = () => {
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [imageName, setImageName] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("CurrentUser"));
  let firstName = userInfo.FirstName;
  let lastName = userInfo.LastName;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setImageName(file.name);
  };

  useEffect(() => {
    // Load feed data from the backend on component mount
    loadFeed();
  }, []);

  function loadFeed() {
    fetch(`${backendHost}/getposts`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error fetching feed data!");
        }
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
          file: post.Filename,
          userID: post.UserID,
        }));

        setPosts(postsArray);
      })
      .catch((error) => {
        console.error("Error loading feed:", error);
      });
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (inputValue.trim() !== "") {
      const postBody = {
        userID: userInfo.UserID,
        firstName,
        lastName,
        content: inputValue,
        GroupID: -1,
      };

      const postBodyString = JSON.stringify(postBody);
      const blob = new Blob([postBodyString], {
        type: "application/json",
      });

      const formData = new FormData();
      formData.append("file", selectedFile); // Append the image file to the form data
      formData.append("content", blob); // Append the text content to the form data

      fetch(`${backendHost}/savepost`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log("Post saved successfully!");
            loadFeed();
            setInputValue("");
            setImageName(undefined);
          } else {
            console.error("Error saving post!");
          }
        })
        .catch((error) => {
          console.error("Error saving post:", error);
        });
    }
  };

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
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef} // Use the useRef hook to get a reference to the input element
          />
          <div
            className="DragDropArea"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              setSelectedFile(file);
              setImageName(file.name);
            }}
            onClick={() => fileInputRef.current.click()} // Use the ref to trigger input click
          >
            {imageName
              ? `Selected image: ${imageName}`
              : "Drag and drop an image or click here to select one."}
          </div>
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
    </div>
  );
};

export default Feed;
