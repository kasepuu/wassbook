import { Posts } from "./Posts";
import FeedPostForm from "./PostForm";

export const GroupPosts = ({ handlePostForm, handleCommentSubmit, posts }) => {
  return (
    <div className="Feed">
      <div className="feed-container">
        <FeedPostForm handlePostForm={handlePostForm} />
        <Posts posts={posts} handleCommentSubmit={handleCommentSubmit} />
      </div>
    </div>
  );
};
