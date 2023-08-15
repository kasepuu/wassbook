export function createPostHtml(data) {
    let element = document.getElementById("posts")
    element.innerHTML = ""

    for (let i = 0; i < data.length; i++) {

        const postDiv = document.createElement("div")
        postDiv.id = `post-${data[i].PostID}`
        postDiv.className = "post"

        const post = document.createElement("a")
        post.id = `post-${data[i].PostID}`
        //post.href = `/get-comments?PostID=${data[i].PostID}`

        const datePosted = document.createElement("div")
        datePosted.className = "datePosted"
        datePosted.id = `post-${data[i].PostID}`

        datePosted.innerHTML = `${data[i].Date}`
        post.appendChild(datePosted)

        const category = document.createElement("div")
        category.className = "postCategory"
        category.id = `post-${data[i].PostID}`

        category.innerHTML = `${data[i].Category}`
        post.appendChild(category)

        const title = document.createElement("div")
        title.className = "postTitle"
        title.id = `post-${data[i].PostID}`

        title.innerHTML = `${data[i].Title}`
        post.appendChild(title)

        const op = document.createElement("div")
        op.className = "originalPoster"
        op.id = `post-${data[i].PostID}`
        op.innerHTML = `Posted by: ${data[i].OriginalPoster}`
        post.appendChild(op)


        postDiv.appendChild(post)
        element.appendChild(postDiv)
        element.appendChild(document.createElement("br"))
    }

    element.addEventListener("click", handlePostClick)
}

function handlePostClick(event) {
    // Check if the clicked element has the "post" id
    const target = event.target
    if (target.id.includes("post-")) {
        event.preventDefault() // Prevent the default event behavior

        const postId = event.target.id.replace("post-", "")
        // saving current postId at localstorage
        localStorage.setItem("OpenedPostID", postId)
        fetchComments(postId)
    }
}

export async function fetchComments(postId) {
    try {
        const url = `/get-comments?PostID=${postId}`;
        const response = await fetch(url);

        if (response.ok) {
            let data = await response.json();
            openPost(postId, data)
        } else {
            console.log("Failed to fetch comments data.");
        }
    } catch (e) {
        console.error(e);
    }
}

function openPost(postId, data) {
    document.title = `Post-${postId}`

    let element = document.getElementById("openedPost")
    element.style.display = "inline"
    element.className = `post-${postId}`

    let title = document.getElementById("openedPostTitle")
    title.innerHTML = data.postData.Title
    let content = document.getElementById("openedPostContent")
    content.innerHTML = data.postData.Content

    let owner = document.getElementById("openedPostOriginalPoster")
    owner.innerHTML = data.postData.OriginalPoster

    let date = document.getElementById("openedPostDate")
    date.innerHTML = data.postData.Date

    // likes are disabled for now..
    let likes = document.getElementById("amountOfLikes")
    likes.innerHTML = "5 👍"
    likes.style.display = "none"
    let disLikes = document.getElementById("amountOfDisLikes")
    disLikes.innerHTML = "👎 5"
    disLikes.style.display = "none"

    let PIDElement = document.getElementById("hiddenPostID")
    PIDElement.value = postId


    if (data.comments){
        let commentSection = document.getElementById("openedPostCommentSection")
        commentSection.innerHTML = ""

        for (let i = 0; i < data.comments.length; i++) {
            createComment(data.comments[i].Content, data.comments[i].OriginalPoster, data.comments[i].Date)
        }
    }
}

function createComment(commentContent, commentOP, commentDate) {
    let commentSection = document.getElementById("openedPostCommentSection")

    let commentBody = document.createElement("div")
    commentBody.id = "openedPostComment"

    let commentAvatarBody = document.createElement("div")
    commentAvatarBody.id = "openedPostCommentAvatar"

    let avatar = document.createElement("img")
    avatar.src = "/forum/images/avatarTemplate.png"
    avatar.id = "profilepic"

    let div = document.createElement("div")
    let commentor = document.createElement("div")
    commentor.id = "openedPostCommentOP"
    commentor.innerHTML = commentOP
    let comment_date = document.createElement("div")
    comment_date.id = "openedPostCommentDate"
    comment_date.innerHTML = commentDate
    div.appendChild(commentor)
    div.appendChild(comment_date)
    commentAvatarBody.appendChild(avatar)

    commentAvatarBody.appendChild(div)
    commentBody.appendChild(commentAvatarBody)

    let content = document.createElement("div")
    content.id = "openedPostCommentContent"
    content.innerHTML = commentContent
    let content_div = document.createElement("div")
    content.appendChild(content_div)

    commentBody.appendChild(content)

    commentSection.appendChild(commentBody)

}