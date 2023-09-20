import Post from "./Post";

export const Posts = ({ posts, handleCommentSubmit }) => {
  return (
    <>
      <h1>Feed</h1>
      <div className="feed-posts" id="feed-posts">
        {posts.map((post) => (
          <Post
            key={post.Id}
            post={post}
            handleCommentSubmit={handleCommentSubmit}
          />
        ))}
      </div>
    </>
  );
};
