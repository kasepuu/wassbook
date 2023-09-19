import React, { useState, useRef } from "react";
import { backendHost } from "../../index.js";

const FeedPostForm = ({ userInfo, loadFeed, followersList }) => {
  const [postPrivacy, setPostPrivacy] = useState("public");
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [postInputValue, setPostInputValue] = useState("");
  const [selectedPostFile, setSelectedPostFile] = useState(null);
  const postFileInputRef = useRef(null);
  const [postImageName, setPostImageName] = useState("");
  let firstName = userInfo.FirstName;
  let lastName = userInfo.LastName;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file === undefined) {
      setPostImageName(undefined);
      return;
    }
    setSelectedPostFile(file);
    setPostImageName(file.name);
  };

  const handleInputChange = (event) => {
    setPostInputValue(event.target.value);
  };

  const handlePostFormSubmit = (event) => {
    event.preventDefault();
    if (postInputValue.trim() !== "") {
      const postBody = {
        userID: userInfo.UserID,
        firstName,
        lastName,
        content: postInputValue,
        GroupID: -1,
        Privacy: postPrivacy, // Include the selected privacy setting
        SelectedFollowers:
          postPrivacy === "almost_private" ? selectedFollowers : [], // Include the selected followers if privacy is "Almost Private"
      };

      const postBodyString = JSON.stringify(postBody);
      const blob = new Blob([postBodyString], {
        type: "application/json",
      });

      const formData = new FormData();
      if (postImageName !== undefined) {
        formData.append("file", selectedPostFile); // Append the image file to the form data
      }
      formData.append("content", blob); // Append the text content to the form data

      fetch(`${backendHost}/savepost`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            loadFeed();
            setPostInputValue("");
            setPostImageName(undefined);
            setPostPrivacy("public"); // Reset post privacy to 'public'
            setSelectedFollowers([]); // Clear selected followers
          }
        })
        .catch((error) => {
          console.error("Error saving post:", error);
        });
    }
  };

  const handlePrivacyChange = (event) => {
    setPostPrivacy(event.target.value);
  };

  const handleFollowersChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedFollowers([...selectedFollowers, value]);
    } else {
      setSelectedFollowers(
        selectedFollowers.filter((follower) => follower !== value)
      );
    }
  };

  return (
    <div className="feed-container">
      <form onSubmit={handlePostFormSubmit}>
        <input
          type="text"
          placeholder={`What's on your mind, ${firstName}?`}
          className="NewPost"
          value={postInputValue}
          onChange={(e) => handleInputChange(e)}
        ></input>
        <div className="privacy-selection">
          <label>
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={postPrivacy === "public"}
              onChange={handlePrivacyChange}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={postPrivacy === "private"}
              onChange={handlePrivacyChange}
            />
            Private
          </label>
          <label>
            <input
              type="radio"
              name="privacy"
              value="almost_private"
              checked={postPrivacy === "almost_private"}
              onChange={handlePrivacyChange}
            />
            Almost Private
          </label>
        </div>

        {/* Show follower selection when "Almost Private" is chosen */}
        {postPrivacy === "almost_private" && (
          <div className="follower-selection">
            <label>
              Select followers who can see this post:
              {followersList &&
                Object.keys(followersList).map((followerKey) => (
                  <div key={followerKey}>
                    <label>
                      <input
                        type="checkbox"
                        value={followerKey}
                        checked={selectedFollowers.includes(followerKey)}
                        onChange={handleFollowersChange}
                      />
                      {followersList[followerKey]}
                    </label>
                  </div>
                ))}
            </label>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
          style={{ display: "none" }}
          ref={postFileInputRef}
        />
        <button
          type="button"
          className="file-upload-button"
          onClick={() => {
            postFileInputRef.current && postFileInputRef.current.click();
          }}
        >
          <div
            className="DragDropArea"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              setSelectedPostFile(file);
              setPostImageName(file.name);
            }}
          >
            {postImageName
              ? `Selected image: ${postImageName}`
              : "Drag and drop an image or click here to select one."}
          </div>
        </button>
      </form>
    </div>
  );
};

export default FeedPostForm;
