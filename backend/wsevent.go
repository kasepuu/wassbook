// https://www.youtube.com/watch?v=pKpKv9MKN-E&ab_channel=ProgrammingPercy
package app

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	handler "01.kood.tech/git/kasepuu/social-network/backend/handlers"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

type SendActiveUsers struct {
	Amount int `json:"amount"`
}

// event handlers
func (m *wsManager) setupEventHandlers() {
	m.handlers[EventGetOnlineMembers] = GetOnlineMembersHandler
	m.handlers[EventSendMessage] = SendMessageHandler
	m.handlers[EventLoadMessages] = LoadMessagesHandler
	//m.handlers[EventLoadPosts] = GetAllPosts
	m.handlers[EventSortUsers] = SortUserList
	m.handlers[EventIsTyping] = IsTypingHandler
	m.handlers[followEvent] = FollowHandler
}

const followEvent = "follow_user"

type followFormat struct {
	UserID          string `json:"UserID"`
	ReceivingUserID string `json:"ReceivingUserID"`
	Status          string `json:"Status"`
}

func FollowHandler(event Event, c *Client) error {
	var payload followFormat
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	UserID, _ := strconv.Atoi(payload.UserID)
	ReceivingUserID, _ := strconv.Atoi(payload.ReceivingUserID)

	handler.SaveFollow(UserID, ReceivingUserID, payload.Status)

	payload.Status = "follow_"+payload.Status
	handler.SaveNotification(UserID, ReceivingUserID, payload.Status)

	for client := range c.client.clients {
		if client.userId == ReceivingUserID {
			sendResponse(payload, "notification", client)
		}
	}
	return nil
}

func sendResponse(responseData any, event string, c *Client) {
	response, err := json.Marshal(responseData)
	if err != nil {
		log.Printf("There was an error marshalling response %v", err)
	}
	// sending data back to the client
	var responseEvent Event
	responseEvent.Type = event
	responseEvent.Payload = response
	c.egress <- responseEvent
}

const EventIsTyping = "is_typing"

type isTypingFormat struct {
	CurrentUser   string `json:"currentUser"`
	ReceivingUser string `json:"receivingUser"`
}

func IsTypingHandler(event Event, c *Client) error {
	var payload isTypingFormat
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	for client := range c.client.clients {
		if client.userId == getUserId(payload.ReceivingUser) {
			sendResponse(payload, EventIsTyping, client)
		}
	}
	return nil
}

const EventGetOnlineMembers = "get_online_members"

var onlineUsersArray []int

func GetOnlineMembersHandler(event Event, c *Client) error {
	var payload string
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	login := true

	if !strings.Contains(payload, "log-in") {
		login = false
	}

	userId, err := strconv.Atoi(payload[7:])
	if err != nil {
		log.Println("[FATAL] @GetOnlineMemebersHandler STRCONVERSION USERID>:", err, login)
	}

	onlineUserList := getOnlineUsers()
	if !login {
		onlineUserList = removeFromSlice(onlineUserList, userId)
	}
	onlineUsersArray = onlineUserList

	// sending data back to the clients
	for client := range c.client.clients {
		sendResponse(onlineUserList, EventGetOnlineMembers, client)
	}
	return nil
}

const EventLoadPosts = "load_posts"

/* func GetAllPosts(event Event, c *Client) error {
	var userId int
	if err := json.Unmarshal(event.Payload, &userId); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	// sending data back to the client
	for client := range c.client.clients {
		sendResponse(getAllPosts(), EventLoadPosts, client)
	}
	return nil
} */

/*MESSAGE HANDLERS*/

type loadMessages struct {
	Sender   string `json:"userName"`
	Receiver string `json:"receivingUser"`
	Method   string `json:"type"`
	Limit    int    `json:"limit"`
}

type SendMessageEvent struct {
	Message      string `json:"Message"`
	SenderName   string `json:"SenderName"`
	ReceiverName string `json:"ReceiverName"`
}

const EventSortUsers = "update_users"

func SortUserList(event Event, c *Client) error {
	var loadMessage loadMessages
	forOthers := strings.Contains(string(event.Payload), "other")
	if err := json.Unmarshal(event.Payload, &loadMessage); err != nil {
		if !forOthers {
			return fmt.Errorf("bad payload in request: %v", err)
		}
	}

	for client := range c.client.clients {
		if forOthers && client.userId == c.userId {
			continue
		}
		responseData := getAllUsers(client.userId)
		sendResponse(responseData, EventSortUsers, client)
	}
	return nil
}

const EventSendMessage = "send_message"

func SendMessageHandler(event Event, c *Client) error {
	var sendMessage SendMessageEvent

	if err := json.Unmarshal(event.Payload, &sendMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	receivingUserID := getUserId(sendMessage.ReceiverName)
	senderUserID := getUserId(sendMessage.SenderName)

	SaveChat(senderUserID, receivingUserID, sendMessage.Message)

	var outgoing ReturnMessage
	outgoing.MessageDate = time.Now().Format(time.RFC3339Nano)
	outgoing.Message = sendMessage.Message
	outgoing.ReceivingUser = sendMessage.ReceiverName
	outgoing.UserName = sendMessage.SenderName

	for client := range c.client.clients {
		if client.userId == getUserId(sendMessage.ReceiverName) {
			sendResponse(outgoing, "new_message", client)
		}
	}
	return nil
}

const EventLoadMessages = "load_all_messages"

const sql = `SELECT userid, receiverid, datesent, message FROM chat WHERE (userid = ? AND receiverid = ?) OR
(receiverid = ? AND userid = ?) ORDER BY messageid DESC LIMIT ?`

func LoadMessagesHandler(event Event, c *Client) error {
	var loadMessage loadMessages

	if err := json.Unmarshal(event.Payload, &loadMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	for client := range c.client.clients {
		if client.userId == getUserId(loadMessage.Sender) {
			responseData := LoadMessages(sql, getUserName(client.userId), loadMessage.Receiver, loadMessage.Limit)
			sendResponse(responseData, EventLoadMessages, client)
		}
	}
	return nil
}
