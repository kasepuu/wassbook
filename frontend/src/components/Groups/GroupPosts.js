import { Posts } from "./Posts";
import FeedPostForm from "./PostForm";

export const GroupPosts = ({ handlePostForm, handleCommentSubmit, posts }) => {
  return (
    <>
      <FeedPostForm handlePostForm={handlePostForm} />
      <Posts posts={posts} handleCommentSubmit={handleCommentSubmit} />
    </>
  );
};
