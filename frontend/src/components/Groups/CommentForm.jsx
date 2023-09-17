import "../../css/Feed.css";
import React, { useState, useRef } from "react";
import { backendHost } from "../../index.js";
import { FaImage } from "react-icons/fa";

const CommentForm = ({ userInfo, handleCommentSubmit }) => {
    const [selectedCommentFile, setSelectedCommentFile] = useState(null);    
    let firstName = userInfo.FirstName;
    let lastName = userInfo.LastName;

    // const handleSubmit = (event) => {
    //     event.preventDefault();

    //     if (commentInputValue.trim() !== "") {

    //         const commentBody = {
    //             userID: userInfo.UserID,
    //             firstName,
    //             lastName,
    //             content: commentInputValue,
    //             PostID: openedPostId,
    //         };

    //         const commentBodyString = JSON.stringify(commentBody);
    //         const blob = new Blob([commentBodyString], {
    //             type: "application/json",
    //         });

    //         const formData = new FormData();
    //         if (commentImageName !== undefined) {
    //             formData.append("file", selectedCommentFile); // Append the image file to the form data
    //         }
    //         formData.append("content", blob); // Append the text content to the form data

    //         fetch(`${backendHost}/savecomment`, {
    //             method: "POST",
    //             body: formData,
    //         })
    //             .then((response) => {
    //                 if (response.ok) {
    //                     loadComments(openedPostId);
    //                     setCommentInputValue("");
    //                     setCommentImageName(undefined);
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error("Error saving comment:", error);
    //             });
    //     }
    // };


    return (
        <form onSubmit={handleCommentSubmit} >
            <div className="comment-input-wrapper">
                <div className="comment-input-container">
                    <input
                        type="text"
                        placeholder={`Write a comment...`}
                        className="NewComment"      
                        name="content"                                
                    />                   
                    <input
                        type="file"
                        accept="image/*"               
                        name="file"
                    />
                    {/* {commentImageName
                        ? `Selected image: ${commentImageName}`
                        : "Click here to select image."} */}
                </div>
                <button type="submit" className="comment-input-button">
                    Post comment
                </button>
            </div>
        </form>
    )
}

export default CommentForm;