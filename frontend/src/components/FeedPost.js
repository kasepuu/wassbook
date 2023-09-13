import "../css/Feed.css";
import { backendHost } from "../index.js";
import profilePicture from "../page-images/blank.png";
import FeedPostCommentForm from "./FeedPostCommentForm";
import FeedPostComment from "./FeedPostComment";

const FeedPost = ({ handlePostClick, openedPostId, userInfo, loadComments, posts, comments, commentImageName, setCommentImageName, commentInputValue, setCommentInputValue }) => {


    return (
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
                            src={`${backendHost}/users/${post.userID}/profilepic/profilepic?timestamp=${Date.now()}`} onError={(e) => { e.target.onError = null; e.target.src = profilePicture }}
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
                                <FeedPostCommentForm
                                    userInfo={userInfo}
                                    commentImageName={commentImageName}
                                    setCommentImageName={setCommentImageName}
                                    commentInputValue={commentInputValue}
                                    setCommentInputValue={setCommentInputValue}
                                    openedPostId={openedPostId}
                                    loadComments={loadComments}
                                />
                                <FeedPostComment
                                    comments={comments}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default FeedPost;