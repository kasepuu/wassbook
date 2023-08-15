import { hasSession } from "../helpers.js";
import { navigateTo } from "./router.js";
import { openMessenger } from "./messenger.js";
import { fetchComments } from "./postComment.js";
import { sendEvent } from "../websocket.js";
import { wsAddConnection } from "../websocket.js";
import { waitForWSConnection } from "../websocket.js";
function homeHTML(currentUser) {
    document.getElementById("app").innerHTML = `
        <nav class="nav">
        <a class="nav__link" id="onlineMembers"></a>
        <a class="nav__link">Welcome, ${currentUser.LoginName}!</a>
        <!--a href="/" class="nav__link" data-link>Home</a-->
        <a href="/logout" class="nav__link" data-link>Logout</a>
         </nav>
        <div id="home" class="home">
                <h1>FORUM</h1>
                <button id="openPostSection" class="openPostBTN">New post</button>
        </div>


        <div id="createPostSection" style="display:none">

        <!-new post form-->
        <form id="createPostForm" action="javascript:" method="POST">
        <div class="cancelPostButton" id="postboxCloseBTN">Back</div><br><br>

        <textarea placeholder="Title" name="post_title" id="newPostBox_title" class="newPostBox_title"></textarea><br>
        <a id="CreatePost_Error_Title">Title is too short!</a><br>
        <textarea placeholder="Content" name="post_content" id="newPostBox_content" class="newPostBox_content"></textarea><br>
        <a id="CreatePost_Error_Content">Content is non-existent!</a><br>
        <label for="category" style="color:white;"></label>
        <select id="category" name="post_categories" required>
            <option value="" disabled selected>Select a category</option>
            <option value="Nature">Nature</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
        </select><br>       
        <a id="CreatePost_Error_Categories">Please select a category!</a><br>
        <button type="submit" class="addPostButton" id="newPostBTN">Create post!</button>
        </form></div>

        <div id="posts"></div><br>

        <div id="openedPost" style="display:none">     
    
        <div id="openedPostSection">
        

        <div id="openedPostTitle">Pealkiri</div>
        <div id="openedPostContent">siin on mingi sisue</div>
        <div id="openedPostOriginalPoster">Madis</div>
        <div id="openedPostLikes"><form id="addPostLike" action="javascript:" method="POST"><button type="submit" id="amountOfLikes">3</button></form></div>
        <div id="openedPostDisLikes"><form id="addPostDisLike" action="javascript:" method="POST"><button type="submit" id="amountOfDisLikes">3</button></form></div>

        <div id="openedPostDate">23 feb</div>
        <div id="openedPostAvatar"><img id="profilepic" src="/forum/images/avatarTemplate.png"></div>
        <button class="closePostBTN" id="postCloseBTN">X</button>
        <button class="newComment" id="newCommentBTN">Add comment</button>
   
        <div id="newCommentSection", class="newCommentSection" style="display:none">
        <button class="cancelCommentButton" id="commentboxCloseBTN">X</button>
        
        <form id="addCommentForm" action="javascript:" method="POST">
        <input type="hidden" id="hiddenPostID" name="hiddenPostID">
        <textarea placeholder="Comment" name="comment_content" id="newCommentBox" class="newCommentBox"></textarea><br><br>
        
        <a id="CreateCommentError">Comment is too short!</a>
        <button type="submit" class="addCommentButton">Add comment!</button>
        </form>
        </div>
        </div>
        


        <div id="openedPostCommentSection"></div>
        
        </div>
        </div>

        <button class="open-button" id="openButton">Messenger</button>
        <div id="messageBox" class="form-popup"></div>
        `
}

async function connectAndSendEvents(currentUser) {
    try {
        const websocket = await wsAddConnection(); // Wait for the WebSocket connection to be established

        // websocket events that will be sent on connection
        sendEvent("get_online_members", `log-in-${currentUser.UserID}`);
        sendEvent("load_posts", currentUser.UserID);
        sendEvent("update_users", "other Login");
    } catch (error) {
        console.error("Error connecting to WebSocket:", error);
    }
}

export default async function () {
    const isAuthenticated = await hasSession()
    if (isAuthenticated) {
        let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
        connectAndSendEvents(currentUser)
        homeHTML(currentUser)
        document.title = "Home"

        const openButton = document.getElementById("openButton");
        openButton.addEventListener("click", openMessenger);

        document.getElementById("postCloseBTN").addEventListener("click", () => {
            document.getElementById("openedPost").style.display = "none";
            localStorage.removeItem("OpenedPostID")
            document.title = "Home"
        })

        document.getElementById("commentboxCloseBTN").addEventListener("click", () => {
            document.getElementById("newCommentSection").style.display = "none";
        })

        document.getElementById("newCommentBTN").addEventListener("click", () => {
            document.getElementById("newCommentSection").style.display = "inline";
        })

        document.getElementById("openPostSection").addEventListener("click", () => {
            document.getElementById("openPostSection").style.display = "none"
            document.getElementById("createPostSection").style.display = "inline"
        })

        document.getElementById("postboxCloseBTN").addEventListener("click", () => {
            document.getElementById("openPostSection").style.display = "inline"
            document.getElementById("createPostSection").style.display = "none"
        })


        addEventListener("keyup", (e) => {
            if (e.key === "Escape" && document.getElementById("openedPost").style.display !== "none" && document.getElementById("newCommentSection").style.display === "none") {
                document.getElementById("openedPost").style.display = "none";
            }

            if (e.key === "Escape" && document.getElementById("newCommentSection").style.display !== "none" && document.getElementById("openedPost").style.display !== "none") {
                document.getElementById("newCommentSection").style.display = "none";
            }
        })

        newPostListener()
        newCommentListener()
    } else {
        navigateTo("/login")
        return
    }
}

function newPostListener() {
    let section = document.getElementById("createPostForm")
    let form = {}

    verifyFormNewPost()
    section.addEventListener("submit", async (e) => {
        if (isValid()) {
            e.preventDefault()
            let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))

            var formData = new FormData(section)

            for (var [key, value] of formData.entries()) {
                form[key] = value
            }

            const options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            }

            try {
                let response = await fetch(`/new-post?UserID=${currentUser.UserID}`, options)
                if (response.ok) {
                    sendEvent("load_posts", "new_post")
                    navigateTo("/")
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            console.log("New post attempt:", "failed!", "Invalid form values!")
        }
    })
}


function isValid() {
    if (document.getElementById("CreatePost_Error_Title").innerHTML === ""
        && document.getElementById("CreatePost_Error_Content").innerHTML === ""
        && document.getElementById("CreatePost_Error_Categories").innerHTML === ""
    ) {
        return true
    } else {
        return false
    }
}

function verifyFormNewPost() {
    let postSetup = ["newPostBox_title", "newPostBox_content"]
    let minLength = [3, 10, 1]
    let errorMsg1 = ["Title is too short!", "Content is non-existent!"]
    let errorDiv = ["CreatePost_Error_Title", "CreatePost_Error_Content"]

    for (let i = 0; i < postSetup.length; i++) {
        let id = postSetup[i]
        let element = document.getElementById(id)
        element.addEventListener("input", () => {
            if (element.value.length < minLength[i]) {
                document.getElementById(errorDiv[i]).innerHTML = errorMsg1[i]
            } else {
                document.getElementById(errorDiv[i]).innerHTML = ""
            }
        })
    }

    let categorySelect = document.getElementById("category");
    let categoryErrorDiv = document.getElementById("CreatePost_Error_Categories");

    categorySelect.addEventListener("change", () => {
        if (categorySelect.value === "") {
            categoryErrorDiv.innerHTML = "Please select a category!"
        } else {
            categoryErrorDiv.innerHTML = ""
        }
    })

}

function verifyFormNewComment() {
    let id = "newCommentBox"
    let element = document.getElementById(id)
    element.addEventListener("input", () => {
        if (element.value.length < 4) {
            document.getElementById("CreateCommentError").innerHTML = "Comment is too short!"
        } else {
            document.getElementById("CreateCommentError").innerHTML = ""
        }
    })
}

function newCommentListener() {
    let section = document.getElementById("addCommentForm")
    let form = {}

    verifyFormNewComment()

    section.addEventListener("submit", async (e) => {
        if (document.getElementById("CreateCommentError").innerHTML === "") {
            let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))

            e.preventDefault()

            var formData = new FormData(section)

            for (var [key, value] of formData.entries()) {
                form[key] = value
            }

            const options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            }

            try {
                let response = await fetch(`/new-comment?UserID=${currentUser.UserID}`, options)
                if (response.ok) {
                    navigateTo("/")
                    let postId = localStorage.getItem("OpenedPostID")
                    fetchComments(postId)
                }
                // loginResponse(response)
            } catch (e) {
                console.error(e)
            }
        } else {
            console.log("New comment attempt:", "failed!", "Too short of a comment!")
        }

    })

}