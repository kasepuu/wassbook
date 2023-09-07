import "../css/Feed.css";
import React, { useState, useEffect, useRef } from "react";
import profilePicture from "../page-images/blank.png";
import { backendHost } from "../index.js";
import { FaImage } from "react-icons/fa";
import { useAuthorization } from "./Authorization";

const Feed = () => {
  useAuthorization();
  const [postInputValue, setPostInputValue] = useState("");
  const [commentInputValue, setCommentInputValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPostFile, setSelectedPostFile] = useState(null);
  const [selectedCommentFile, setSelectedCommentFile] = useState(null);
  const postFileInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
  const [postImageName, setPostImageName] = useState("");
  const [commentImageName, setCommentImageName] = useState("");
  const [openedPostId, setOpenedPostId] = useState(null);
  const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
  let firstName = userInfo.FirstName;
  let lastName = userInfo.LastName;

  const handleFileChange = (event, inputType) => {
    const file = event.target.files[0];
    if (file === undefined) {
      setPostImageName(undefined);
      return;
    }
    if (inputType === 'post') {
      setSelectedPostFile(file);
      setPostImageName(file.name);
      setCommentImageName(undefined)
    } else if (inputType === 'comment') {
      setSelectedCommentFile(file);
      setCommentImageName(file.name);
      setPostImageName(undefined)
    }
  };

  useEffect(() => {
    // Load feed data from the backend on component mount
    loadFeed();

    // close post if clicked outside any post
    const handleClickOutsidePost = (event) => {
      if (event.target.closest(".feed-post") === null) {
        setOpenedPostId(null);
      }
    };

    document.addEventListener("click", handleClickOutsidePost);

    // cleanup function to remove event listener
    return () => {
      document.removeEventListener("click", handleClickOutsidePost);
    };
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

        const postsArray = data.map((post) => ({
          title: `${post.FirstName} ${post.LastName} - ${post.Date}`,
          body: post.Content,
          id: post.PostID,
          file: post.Filename,
          userID: post.UserID,
        }));

        setPosts(postsArray.reverse());
      })
      .catch((error) => {
        console.error("Error loading feed:", error);
      });
  }


  function loadComments(postID) {
    // Construct the URL with the postID as a query parameter
    const url = `${backendHost}/getcomments?postID=${postID}`;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error fetching comment data!");
        }
      })
      .then((data) => {
        if (data === null) {
          setComments([]);
          return;
        }

        const commentsArray = data.map((comment) => ({
          title: `${comment.FirstName} ${comment.LastName} - ${comment.Date}`,
          body: comment.Content,
          id: comment.CommentID,
          postID: comment.PostID,
          file: comment.Filename,
          userID: comment.UserID,
        }));

        setComments(commentsArray.reverse());
      })
      .catch((error) => {
        console.error("Error loading feed:", error);
      });
  }


  const handleInputChange = (event, inputType) => {
    if (inputType === 'post') {
      setPostInputValue(event.target.value);
    } else if (inputType === 'comment') {
      setCommentInputValue(event.target.value);
    }
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
            console.log("Post saved successfully!");
            loadFeed();
            setPostInputValue("");
            setPostImageName(undefined);
          } else {
            console.error("Error saving post!");
          }
        })
        .catch((error) => {
          console.error("Error saving post:", error);
        });
    }
  };

  const handleCommentFormSubmit = (event) => {
    event.preventDefault();

    if (commentInputValue.trim() !== "") {

      const commentBody = {
        userID: userInfo.UserID,
        firstName,
        lastName,
        content: commentInputValue,
        PostID: openedPostId,
      };

      const commentBodyString = JSON.stringify(commentBody);
      const blob = new Blob([commentBodyString], {
        type: "application/json",
      });

      const formData = new FormData();
      if (commentImageName !== undefined) {
        formData.append("file", selectedCommentFile); // Append the image file to the form data
      }
      formData.append("content", blob); // Append the text content to the form data

      fetch(`${backendHost}/savecomment`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            console.log("Comment saved successfully!");
            loadComments(openedPostId);
            setCommentInputValue("");
            setCommentImageName(undefined);
          } else {
            console.error("Error saving comment!");
          }
        })
        .catch((error) => {
          console.error("Error saving post:", error);
        });
    }
  };

  const handlePostClick = (post) => {
    if (openedPostId !== post.id) {
      setOpenedPostId(post.id);
      localStorage.setItem("OpenedPost", post.id);
      console.log("clicked post:", post);
      setCommentInputValue("")
      setCommentImageName(undefined);
    }
    loadComments(post.id)
  };

  const isAuthorized = useAuthorization();
  if (isAuthorized) {
    return (
      <div className="Feed">
        <div className="feed-container">
          <form onSubmit={handlePostFormSubmit}>
            <input
              type="text"
              placeholder={`What's on your mind, ${firstName}?`}
              className="NewPost"
              value={postInputValue}
              onChange={(e) => handleInputChange(e, 'post')}
            ></input>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'post')}
              style={{ display: "none" }}
              ref={postFileInputRef} // Use the useRef hook to get a reference to the input element
            />
            <button
              type="button"
              className="file-upload-button"

              onClick={() => {
                console.log("Button clicked"); // Add this line for debugging
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
                  setCommentImageName(undefined)
                }}
              >
                {postImageName
                  ? `Selected image: ${postImageName}`
                  : "Drag and drop an image or click here to select one."}
              </div>
            </button>

          </form>
        </div>

        <div className="feed-posts" id="feed-posts">
          {posts.map((post, index) => (
            <div
              key={index}
              id={`post-${post.id}`}
              className="feed-post"
              onClick={() => handlePostClick(post)}
            >
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

              {openedPostId === post.id && (
                <div className="post-overlay">
                  <div className="post-commentbox">
                    <form onSubmit={handleCommentFormSubmit}>
                      <div className="comment-input-wrapper">
                        <div className="comment-input-container">
                          <input
                            type="text"
                            placeholder={`Write a comment...`}
                            className="NewComment"
                            value={commentInputValue}
                            onChange={(e) => handleInputChange(e, 'comment')}
                          />
                          <button
                            type="button"
                            className="file-upload-button"
                            onClick={() => commentFileInputRef.current.click()}
                          >
                            <FaImage />
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'comment')}
                            ref={commentFileInputRef}
                            className="hidden-file-input"
                          />
                          {commentImageName
                            ? `Selected image: ${commentImageName}`
                            : "Click here to select image."}
                        </div>
                        <button type="submit" className="comment-input-button">
                          Post comment
                        </button>
                      </div>
                    </form>
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        id={`comment-${comment.id}`}
                        className="feed-post"
                      >
                        <div className="post-header">
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="profile-picture"
                          />
                          <div className="post-title">{comment.title}</div>
                        </div>
                        <div className="post-body">{comment.body}</div>
                        {comment.file !== "-" || comment.file === undefined ? (
                          <img
                            src={`${backendHost}/users/${comment.userID}/${comment.file}`}
                            {...console.log(comment)}
                            alt="Post"
                            className="image-content"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default Feed;
