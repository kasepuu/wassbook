package ws

import (
	"encoding/json"
	"fmt"
	"log"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

type ResponseStruct struct {
	CurrentChat int
	ChatLog     []function.ReturnGroupChatData
	TotalCount  int
}

func SendGroupMessageHandler(event Event, c *Client) error {
	// send_message
	type SendGroupMessageEvent struct {
		Message     string `json:"Message"`
		UserID      int    `json:"UserID"`
		ReceiverIDs []int  `json:"ReceiverIDs"`
		GroupID     int    `json:"GroupID"`
	}

	var sendMessage SendGroupMessageEvent

	if err := json.Unmarshal(event.Payload, &sendMessage); err != nil {
		return fmt.Errorf("bad payload in send message: %v", err)
	}

	fmt.Println("this was received:", sendMessage)

	sendingUserID := sendMessage.UserID

	function.SaveGroupChat(sendingUserID, sendMessage.ReceiverIDs, sendMessage.Message, sendMessage.GroupID)

	for _, ReceiverID := range sendMessage.ReceiverIDs {

		for client := range c.client.clients {
			var chatLog []function.ReturnGroupChatData
			var currentChat int
			var totalCount int

			if client.userId == ReceiverID {
				chatLog, totalCount = function.LoadGroupMessages(sendMessage.GroupID, c.userId, 10)
				currentChat = sendMessage.GroupID
				formatPayload(currentChat, chatLog, totalCount, client)

			} else if client.userId == sendMessage.UserID {
				chatLog, totalCount = function.LoadGroupMessages(sendMessage.GroupID, c.userId, 10)
				currentChat = sendMessage.GroupID
				formatPayload(currentChat, chatLog, totalCount, client)
			}
		}
	}
	return nil
}

func formatPayload(currentChat int, chatLog []function.ReturnGroupChatData, totalCount int, client *Client) {
	payload := ResponseStruct{
		CurrentChat: currentChat,
		ChatLog:     chatLog,
		TotalCount:  totalCount,
	}
	sendResponse(payload, "update_group_messages", client)
}

func LoadGroupMessagesHandler(event Event, c *Client) error {
	type LoadMessageEvent struct {
		GroupID     int   `json:"OpenedChatID"`
		ReceiverIDs []int `json:"ReceiverID"`
		UserID      int   `json:"UserID"`
		Limit       int   `json:"Limit"`
	}

	// request_message
	var requestMessage LoadMessageEvent

	if err := json.Unmarshal(event.Payload, &requestMessage); err != nil {
		return fmt.Errorf("bad payload in load message: %v", err)
	}

	sendingUserID := requestMessage.UserID
	type ResponseStruct struct {
		CurrentChat int
		ChatLog     []function.ReturnGroupChatData
		TotalCount  int
	}
	// Prepare the response payload
	for client := range c.client.clients {
		if client.userId == requestMessage.UserID {
			chatLog, totalCount := function.LoadGroupMessages(requestMessage.GroupID, sendingUserID, requestMessage.Limit)

			payload := ResponseStruct{
				CurrentChat: requestMessage.GroupID, // Set the current chat to the receiver's ID
				ChatLog:     chatLog,
				TotalCount:  totalCount,
			}
			sendResponse(payload, "update_group_messages", client)
			fmt.Println("SENT SOMETHING:", payload)
		}
	}

	return nil
}

type isTypingGroupFormat struct {
	SenderID    int    `json:"SenderID"`
	ReceiverIDs []int  `json:"ReceiverIDs"`
	UserName    string `json:"UserName"`
}

func IsTypingGroupHandler(event Event, c *Client) error {
	var payload isTypingGroupFormat
	log.Println(string(event.Payload))
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	for _, ReceiverID := range payload.ReceiverIDs {
		for client := range c.client.clients {
			if client.userId == ReceiverID {
				sendResponse(payload, "is_typing_group", client)
			}
		}
	}
	return nil
}
