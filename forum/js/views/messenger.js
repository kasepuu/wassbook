import { sendEvent } from "../websocket.js";
import { hasSession } from "../helpers.js";

let messageBox;
var limit = 0;
let scrolling = false;
let scrollEnd = false;
let prevScrollHeight;
let timeOut;


export function openMessenger() {
    messageBox = document.getElementById("messageBox")
    createMessageBox(messageBox)
    updateUserList(JSON.parse(sessionStorage.getItem("CurrentUser")).LoginName)
    let openButton = document.getElementById("openButton")
    openButton.style.display = "none";
    messageBox.style.display = "block";
}

export function createMessageBox(element) {
    element.innerHTML = "";
    createCloseButton(element)
}

export function createUserList(userData, element) {
    if (document.getElementById("userList")) {
        document.getElementById("userList").remove()
    }

    const userList = document.createElement('div');
    userList.className = "messageUsers";
    userList.id = "userList"
    let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))

    for (let i = 0; i < userData.length; i++) {
        const userName = userData[i].UserName;
        const userNameElement = document.createElement("div");
        userNameElement.textContent = userName;
        userNameElement.id = userName
        userNameElement.className = "username"

        if (userData[i].Status) userNameElement.className = userNameElement.className + " " + "online"
        else userNameElement.className = userNameElement.className + " " + "offline"

        userNameElement.addEventListener("click", () => {
            createChat(currentUser.LoginName, userName)
        });
        userList.appendChild(userNameElement)
    }
    element.appendChild(userList)
}

function createCloseButton(element) {
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.type = "button";
    closeButton.className = "cancel";

    closeButton.addEventListener("click", () => {
        let openButton = document.getElementById("openButton")
        localStorage.removeItem("CurrentChat")
        element.style.display = "none";
        openButton.style.display = "block";
    });
    element.appendChild(closeButton);
}

export function loadAllMessages(senderUser, receivingUser, limit) {
    const chatResponse = {
        userName: senderUser,
        receivingUser: receivingUser,
        limit: limit
    };
    sendEvent("load_all_messages", chatResponse) 
}

export async function newMessage(data) {
    loadAllMessages(data.ReceivingUser, data.UserName, limit)
    if (localStorage.getItem("CurrentChat") != data.UserName ||
        !document.getElementById("chat")) displayNotification(data.UserName, data.ReceivingUser)

    updateUserList(data.UserName, data.ReceivingUser)
}

export function updateUserList(senderUser, receivingUser = "") {
    const chatResponse = {
        userName: senderUser,
        receivingUser: receivingUser,
        limit: 1
    };
    sendEvent("update_users", chatResponse)
}

export function displayNotification(sender, receiver) {
    if (sender) {
        let message = `You received a message from ${sender}!`
        notificationHTML(message, sender)
    }
}

function notificationHTML(message, sender) {
    const notificationDIV = document.createElement("div")
    notificationDIV.className = "notificationBar"

    const notificationMessage = document.createElement("div")
    notificationMessage.className = "notificationMessage"
    notificationDIV.appendChild(notificationMessage)

    const closeNotification = document.createElement("button")
    closeNotification.id = "notificationBNT"
    closeNotification.innerHTML = "X"
    notificationDIV.appendChild(closeNotification)

    const textMessage = document.createElement("h1")
    textMessage.innerHTML = message
    notificationMessage.appendChild(textMessage)


    closeNotification.addEventListener("click", () => {
        notificationDIV.remove()
    })

    notificationMessage.addEventListener("click", () => {
        openMessenger()
        createChat(JSON.parse(sessionStorage.getItem("CurrentUser")).LoginName, sender)
        notificationDIV.remove();
    })


    document.getElementById("app").appendChild(notificationDIV)


    // Set a timeout to remove the notification after 10 seconds
    setTimeout(function () {
        notificationDIV.remove();
    }, 7000); // 10000 milliseconds = 10 seconds
}

export function displayIsWriting(sender, receiver) {
    const currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))
    const CurrentChat = localStorage.getItem("CurrentChat")
    const chatStatus = document.getElementById("chat-status")

    const chat = document.getElementById('chat')

    if (!chatStatus) return
    if (receiver === currentUser.LoginName) { return }
    if (CurrentChat !== receiver || !chat) { return }

    clearTimeout(timeOut)

    let messageformat = `📱${receiver} is typing...`

    chatStatus.innerHTML = messageformat

    timeOut = setTimeout(function () {
        chatStatus.innerHTML = ""
    }, 1000);
}

export function displayMessages(receivingUser, senderName, previousMessages) {

    const currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))

    const chat = document.getElementById('chat')
    const chatLog = document.getElementById('chatLog')
    if (!chat) return
    if (chatLog) {
        chatLog.innerHTML = "";
        chatLog.className = "messages"
    }

    if (previousMessages) {
        previousMessages.forEach((loadedMessage) => {
            const message = document.createElement("div");
            message.id = "message";
        
            // Replace newline characters with <br> tags and use textContent to prevent HTML injection
            const messageContent = loadedMessage.Message.trimEnd().replace(/\n/g, '<br>');
        
            if (loadedMessage.UserName === currentUser.LoginName) {
                message.className = "messenger_currentUser";
                message.innerHTML =
                    `<span class="dateColor">${loadedMessage.MessageDate}</span> ` +
                    `<span class="nameColor">${loadedMessage.UserName}</span> <span class="separatorColor">:</span> ` +
                    `<span class="messageColor">${messageContent}</span>`;
            } else {
                message.className = "messenger_receivingUser";
                message.innerHTML =
                    `<span class="dateColor">${loadedMessage.MessageDate}</span> ` +
                    `<span class="nameColor">${loadedMessage.UserName}</span> <span class="separatorColor">:</span> ` +
                    `<span class="messageColor">${messageContent}</span>`;
            }
            chatLog.appendChild(message);
        });
    }
    if (!scrolling) {
        chatLog.scrollTop = chatLog.scrollHeight
    } else {
        chatLog.scrollTop = chatLog.scrollHeight - prevScrollHeight
        if (limit > (previousMessages ? previousMessages.length : 0)) {
            scrollEnd = true
        }
        scrolling = false
    }
}

export function createChat(currentUser, receivingUser) {
    if (document.getElementById("chat")) {
        document.getElementById("chat").remove()
    }
    localStorage.setItem("CurrentChat", receivingUser)
    scrolling = false;
    scrollEnd = false;
    prevScrollHeight = 0
    limit = 10

    const chat = document.createElement("div");
    chat.id = "chat";

    const title = document.createElement("div")
    title.id = "chat-title";
    title.innerHTML = `📪${receivingUser}`
    chat.appendChild(title)

    loadAllMessages(currentUser, receivingUser, limit)

    const chatLog = document.createElement("div")
    chatLog.id = "chatLog"
    chatLog.addEventListener('scroll', (e) => {
        throttle(loadAdditionalMessages(currentUser, receivingUser))
    })
    const textArea = createTextArea(currentUser, receivingUser)

    const status = document.createElement("div")
    status.id = "chat-status"
    status.innerHTML = ""

    const messageBox = document.getElementById('messageBox');
    chat.appendChild(textArea)
    chat.appendChild(chatLog)

    chat.appendChild(status)

    messageBox.appendChild(chat);
}

function createTextArea(currentUser, receivingUser) {
    const textArea = document.createElement("textarea");
    textArea.id = "textBox";
    textArea.placeholder = `Send ${receivingUser} a message!`;
    textArea.maxLength = "10000";

    textArea.addEventListener("input", (e) => {
        const response = {
            currentUser: currentUser,
            receivingUser: receivingUser,
        };
        sendEvent("is_typing", response);
    });

    textArea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            limit++;
            sendMessage(textArea.value, currentUser, receivingUser); // send message to server
        }
    });

    return textArea;
}

async function sendMessage(Message, Sender, Receiver) {
    const chatArea = document.getElementById('chatLog')
    const textArea = document.getElementById('textBox')
    const trimmed_message = Message.trimEnd().replace(/\n/g, "<br>")
    const currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))

    if (trimmed_message != "") {
        const message = document.createElement("div");
        message.id = "message";

        const currentDate = new Date();
        const currentHour = currentDate.getHours().toString().padStart(2, '0');
        const currentMinute = currentDate.getMinutes().toString().padStart(2, '0');

            message.className = "messenger_currentUser";
            message.innerHTML =
                `<span class="dateColor">${currentHour}:${currentMinute}</span> ` +
                `<span class="nameColor">${Sender}</span> <span class="separatorColor">:</span> ` +
                `<span class="messageColor">${trimmed_message}</span>`;
    
        const chatMessage = {
            Message: trimmed_message,
            SenderName: Sender,
            ReceiverName: Receiver,
        };
        sendEvent("send_message", chatMessage)
        updateUserList(currentUser.LoginName)
        chatArea.appendChild(message)

        textArea.value = "";
        textArea.placeholder = `Send ${Receiver} a message!`
    }
    chatArea.scrollTop = chatArea.scrollHeight
}

const loadAdditionalMessages = (currentUser, receivingUser) => {
    if (document.getElementById("chatLog").scrollTop === 0 && !scrollEnd) {
        limit += 10 // increasing the message limit
        prevScrollHeight = document.getElementById("chatLog").scrollHeight // previous scroll height
        loadAllMessages(currentUser, receivingUser, limit) // fetch more messags
        scrolling = true
    }
}

export function throttle(func, wait) {
    var lastEvent = 0
    return function () {
        var currentTime = new Date()
        // check if time elapsed is greater than wait
        if (currentTime - lastEvent > wait) {
            func.apply(this, arguments) // refactoring the original function
            lastEvent = currentTime
        }
    }
}