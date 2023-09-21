// WEBSOCKET

export class Event {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

export function wsAddConnection() {
  return new Promise((resolve, reject) => {
    if (window["WebSocket"]) {
      let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
      const ws = new WebSocket(
        `ws://localhost:8081/ws?UserID=${currentUser.UserID}`
      );

      ws.onopen = () => {
        console.log("WebSocket Connection established!");
        resolve(ws); // Resolve the promise with the WebSocket object when the connection is established.
      };

      ws.onclose = (e) => {
        console.log("WebSocket connection Lost! Is the server running?", e);
        resolve(e);
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

export function sendEvent(type, payload) {
  console.log("SENDING EVENT", type, "& PAYLOAD:", payload);
  console.log("Current ws:", window.socket);
  const event = new Event(type, payload);

  window.socket.send(JSON.stringify(event));
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
