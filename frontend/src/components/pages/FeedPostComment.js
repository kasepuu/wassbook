import { backendHost } from "../../index.js";
import profilePicture from "../../page-images/blank.png";

const FeedPostComment = ({ comments }) => {
  return (
    <>
      {comments.map((comment, index) => (
        <div key={index} id={`comment-${comment.id}`} className="feed-post">
          <div className="post-header">
            <img
              src={`${backendHost}/users/${
                comment.userID
              }/profilepic/profilepic?timestamp=${Date.now()}`}
              onError={(e) => {
                e.target.onError = null;
                e.target.src = profilePicture;
              }}
              alt="Profile"
              className="profile-picture"
            />
            <div className="post-title">{comment.title}</div>
          </div>
          <div className="post-body">{comment.body}</div>
          {comment.file !== "-" || comment.file === undefined ? (
            <img
              src={`${backendHost}/users/${comment.userID}/${comment.file}`}
              alt="Post"
              className="image-content"
            />
          ) : null}
        </div>
      ))}
    </>
  );
};

export default FeedPostComment;
