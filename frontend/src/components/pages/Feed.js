import "../../css/Feed.css";
import React, { useState, useEffect, useCallback } from "react";
import { backendHost } from "../../index.js";
import FeedPostForm from "./FeedPostForm";
import FeedPost from "./FeedPost";
import SidebarRight from "../sidebar/SidebarLeft";
import FollowersList from "../sidebar/SidebarRight";

const Feed = () => {
  const [openedPostId, setOpenedPostId] = useState(null);
  const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentImageName, setCommentImageName] = useState("");
  const [commentInputValue, setCommentInputValue] = useState("");
  const [followersList, setFollowersList] = useState([]);

  const loadFeed = useCallback(() => {
    fetch(`${backendHost}/getposts?userID=${userInfo.UserID}`)
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
  }, [userInfo.UserID, setPosts]);

  const getFollowersList = () => {
    console.log("getting followers list");
    fetch(`${backendHost}/getfollowerslist?UserID=${userInfo.UserID}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        setFollowersList(data);
        console.log(followersList);
      })
      .catch((error) => {
        console.error("Error fetching followers list:", error);
      });
  };

  useEffect(() => {
    // Load feed data from the backend on component mount
    loadFeed();
    getFollowersList();

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
  }, [loadFeed]);

  function loadComments(postID) {
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
        console.error("Error loading comments:", error);
      });
  }

  const handlePostClick = (post) => {
    if (openedPostId !== post.id) {
      setOpenedPostId(post.id);
      localStorage.setItem("OpenedPost", post.id);
      setCommentInputValue("");
      setCommentImageName(undefined);
    }
    loadComments(post.id);
  };

  return (
    <>
      <div className="Feed">
        <FeedPostForm
          userInfo={userInfo}
          loadFeed={loadFeed}
          followersList={followersList}
        />
        <FeedPost
          handlePostClick={handlePostClick}
          openedPostId={openedPostId}
          userInfo={userInfo}
          loadComments={loadComments}
          posts={posts}
          comments={comments}
          commentImageName={commentImageName}
          setCommentImageName={setCommentImageName}
          commentInputValue={commentInputValue}
          setCommentInputValue={setCommentInputValue}
        />
      </div>
    </>
  );
};

export default Feed;
