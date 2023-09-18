// https://www.youtube.com/watch?v=pKpKv9MKN-E&ab_channel=ProgrammingPercy
package ws

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

var websockerUpgrader = websocket.Upgrader{
	CheckOrigin:     checkOrigin,
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type wsManager struct {
	clients      ClientList
	sync.RWMutex                         // protect the connections with RWMutex
	handlers     map[string]EventHandler // event handlers
}

func NewManager() *wsManager {
	manager := &wsManager{
		// create a client
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
	}

	manager.setupEventHandlers()
	return manager
}

func (m *wsManager) routeEvent(event Event, c *Client) error {
	// if event type is part of handlers, return nil
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		fmt.Println("event:", event)
		return errors.New("[FATAL] There is no such event type")
	}
}

func (m *wsManager) ServeWs(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.Atoi(r.URL.Query().Get("UserID"))
	if err != nil {
		log.Println("WebSocket: At connection, failed to fetch the UserID!")
	}
	// upgrade regular http connection into websocket
	conn, err := websockerUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewClient(conn, m, userId)

	m.addClient(client)

	// go routines for client processes
	go client.readMessages()
	go client.writeMessages()
}

func (m *wsManager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
}

func (m *wsManager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)
	}
}

func checkOrigin(r *http.Request) bool {
	// make sure that the origin of connection is from a trusted source
	origin := r.Header.Get("Origin")

	switch origin {
	case "http://localhost:8080":
		return true
	default:
		return false
	}
}
