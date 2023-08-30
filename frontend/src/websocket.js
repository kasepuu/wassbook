// WEBSOCKET
// import { createUserList, displayMessages, displayIsWriting, newMessage } from "./views/messenger.js"
// import { createPostHtml } from "./views/postComment.js"
export class Event {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

export function wsAddConnection() {
  return new Promise((resolve, reject) => {
    if (window["WebSocket"]) {
      if (window.socket) window.socket.close();

      // let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
      const ws = new WebSocket(`ws://localhost:8081/ws`); //?UserID=${currentUser.UserID}`);

      ws.onopen = () => {
        console.log("WebSocket Connection established!");
        resolve(ws); // Resolve the promise with the WebSocket object when the connection is established.
      };

      ws.onmessage = (e) => {
        console.log("WebSocket Message attempt");
        const eventData = JSON.parse(e.data);
        const event = Object.assign(new Event(), eventData);
        routeEvent(event);
      };

      ws.onclose = (e) => {
        console.log("WebSocket connection Lost! Is the server running?", e);
      };

      window.socket = ws;

      window.addEventListener("beforeunload", function () {
        ws.close();
      });
    } else {
      alert("This browser does not support websockets!");
      reject(new Error("WebSocket not supported"));
    }
  });
}

const functionMap = {
  //USAGE: functionMap["send_message"]();
  send_message: sendData,
  load_all_messages: loadChat,
  load_posts: loadPosts,
  update_users: updateUserList,
  get_online_members: loadOnlineMembers,
  is_typing: updateIsTyping,
  follow_user: followNotify
  // "new_message": newMessage
};

function followNotify(){
  console.log("follow sent!!!!")
}

function updateIsTyping(data) {
  // displayIsWriting(data.receivingUser, data.currentUser)
}

export function loadPosts(data) {
  //    createPostHtml(data)
}

export function sendEvent(type, payload) {
  const event = new Event(type, payload);

  window.socket.send(JSON.stringify(event));
  routeEvent(event);
}

export async function routeEvent(event) {
  if (event.type === undefined) alert("Bad event!");
  functionMap[event.type](event.payload);
}

export function loadOnlineMembers(data) {
  document.getElementById("onlineMembers").innerHTML = data.length + "👥";
  document.getElementById("openButton").innerHTML = `Messenger ${
    data.length - 1
  }🌐`;
}
export function updateUserList(data) {
  // if (document.getElementById("messageBox").innerHTML != "") createUserList(data, document.getElementById("messageBox"))
}

export function loadChat(data) {
  // displayMessages(data.ReceiverName, data.userName, data.Messages)
}

export function sendData(data) {
  const jsonString = JSON.stringify(data);
  console.log("Sent:", jsonString);
}

export function waitForWSConnection(cb, counter = 30) {
  setTimeout(function () {
    const socketURL = sessionStorage.getItem("WebSocketURL");
    console.log(socketURL);
    if (socketURL) {
      const socket = new WebSocket(socketURL);
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("WebSocket is connected!");
        window.socket = socket; // Update the global socket variable with the re-established connection.
        if (cb != null) {
          cb();
        }
      } else {
        console.log("Waiting for connection...");
        if (counter > 0) waitForWSConnection(cb, counter - 1);
        else window.location.href = "/login";
      }
    } else {
      console.log("WebSocket URL not found in sessionStorage.");
      window.location.href = "/login"; // Redirect to login or handle the case when the WebSocket URL is not found.
    }
  }, 100);
}
