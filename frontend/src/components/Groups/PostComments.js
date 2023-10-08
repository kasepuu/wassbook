import { backendHost } from "../../index.js";
import profilePicture from "../../page-images/blank.png";

const PostComments = ({ comments }) => {
  return (
    <>
      {comments.map((comment, index) => (
        <div key={index} id={`comment-${comment.Id}`} className="feed-post">
          <div className="post-header">
            <img
              src={`${backendHost}/users/${
                comment.UserId
              }/profilepic/profilepic?timestamp=${Date.now()}`}
              onError={(e) => {
                e.target.onError = null;
                e.target.src = profilePicture;
              }}
              alt="Profile"
              className="profile-picture"
            />
            <div className="post-title">
              {comment.FirstName} {comment.LastName} ({comment.Username}) -{" "}
              {comment.Date}
            </div>
          </div>
          <div className="post-body">{comment.Content}</div>
          {comment.Filename !== "-" || comment.Filename === undefined ? (
            <img
              src={`${backendHost}/${comment.Filename}`}
              alt="Post"
              className="image-content"
            />
          ) : null}
        </div>
      ))}
    </>
  );
};

export default PostComments;
