package ws

import (
	"encoding/json"
	"fmt"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func SendMessageHandler(event Event, c *Client) error {
	// send_message
	type SendMessageEvent struct {
		Message    string `json:"Message"`
		SenderID   int    `json:"SenderID"`
		ReceiverID int    `json:"ReceiverID"`
	}

	var sendMessage SendMessageEvent

	if err := json.Unmarshal(event.Payload, &sendMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	fmt.Println("this was received:", sendMessage)

	receivingUserID := sendMessage.ReceiverID
	sendingUserID := sendMessage.SenderID

	function.SaveChat(sendingUserID, receivingUserID, sendMessage.Message)

	type ResponseStruct struct {
		CurrentChat int
		ChatLog     []function.ReturnChatData
	}

	for client := range c.client.clients {
		var chatLog []function.ReturnChatData
		var currentChat int
		if client.userId == sendMessage.ReceiverID {
			chatLog = function.LoadMessages(sendMessage.ReceiverID, c.userId, 10)
			currentChat = c.userId
		} else if client.userId == sendMessage.SenderID {
			chatLog = function.LoadMessages(c.userId, sendMessage.ReceiverID, 10)
			currentChat = sendMessage.ReceiverID
		}

		payload := ResponseStruct{
			CurrentChat: currentChat,
			ChatLog:     chatLog,
		}
		sendResponse(payload, "update_messages", client)
		sendResponse(payload, "update_notifications", client)
	}
	return nil
}

func LoadMessagesHandler(event Event, c *Client) error {
	type LoadMessageEvent struct {
		ReceiverID int `json:"ReceiverID"`
		SenderID   int `json:"SenderID"`
	}

	// request_message
	var requestMessage LoadMessageEvent

	if err := json.Unmarshal(event.Payload, &requestMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	receivingUserID := requestMessage.ReceiverID
	sendingUserID := requestMessage.SenderID

	type ResponseStruct struct {
		CurrentChat int
		ChatLog     []function.ReturnChatData
	}
	// Prepare the response payload

	for client := range c.client.clients {
		if client.userId == requestMessage.SenderID {
			chatLog := function.LoadMessages(sendingUserID, receivingUserID, 10)

			payload := ResponseStruct{
				CurrentChat: receivingUserID, // Set the current chat to the receiver's ID
				ChatLog:     chatLog,
			}

			sendResponse(payload, "update_messages", client)
		}
	}

	return nil
}
