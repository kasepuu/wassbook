import "../css/Feed.css";

const Feed = ({ children }) => {
  return (
    <div className="Feed">
      <div className="feed-container">
        <input
          type="text"
          placeholder="Whats on your mind, $USER?"
          className="NewPost"
        ></input>
      </div>

      <div className="feed-posts">{children}</div>
    </div>
  );
};

export default Feed;
