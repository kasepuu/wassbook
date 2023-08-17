// https://www.youtube.com/watch?v=pKpKv9MKN-E&ab_channel=ProgrammingPercy
package app

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// used, for keeping active idle connections
var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10
)

type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	client     *wsManager
	userId     int

	// unbuffered channel, to prevent connection getting too many connections
	egress chan Event // avoid concurrent writes on the websocket connection
}

func NewClient(conn *websocket.Conn, client *wsManager, userIndex int) *Client {
	return &Client{
		connection: conn,
		client:     client,
		userId:     userIndex,
		egress:     make(chan Event),
	}
}

func (c *Client) readMessages() {
	defer func() {
		// if connection is lost, remove the client
		c.client.removeClient(c)
	}()

	// pong request
	if err := c.connection.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Printf("pong request failed %v", err)
		return
	}

	c.connection.SetReadLimit(512) // setting maximum limit, to avoid malicious activities
	c.connection.SetPongHandler(c.pongHandler)

	for {
		_, payload, err := c.connection.ReadMessage()
		if err != nil {
			// if connection is closed
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Websocket: connection lost! %v", err)
			}
			break
		}

		var request Event

		// unmarshal payload (user request)
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("Error marshalling event! : %v", err)
		}

		// at valid event, try routing
		if err := c.client.routeEvent(request, c); err != nil {
			log.Printf("Error handling the event! : %v", err)
		}
	}
}

func (c *Client) writeMessages() {
	defer func() {
		// if connection is lost, remove the client
		c.client.removeClient(c)
	}()

	ticker := time.NewTicker(pingInterval)

	for {
		// similar functionality to a regular for loop
		select {
		case message, ok := <-c.egress:
			// if there was an issue with egress, the connection was probably closed
			if !ok {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("WebSocket: connection closed:", err)
				}
				return
			}

			data, err := json.Marshal(message)
			if err != nil {
				log.Println(err)
				return
			}

			// if success, write message
			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("WebSocket: failed to send message! %v", err)
			}

		case <-ticker.C:
			// send a ping to the client
			if err := c.connection.WriteMessage(websocket.PingMessage, []byte("")); err != nil {
				log.Printf("WebSocket: was unable to ping: %v", err)
				return
			}
		}
	}
}

func (c *Client) pongHandler(pongMsg string) error {
	return c.connection.SetReadDeadline(time.Now().Add(pongWait))
}
