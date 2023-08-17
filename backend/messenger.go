package app

import (
	"log"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
	// "encoding/json"
	// "log"
)

type ReceivedMessageType struct {
	ReceivedMessage string `json:"type"`
}

type ReturnMessage struct {
	UserName      string
	ReceivingUser string
	MessageDate   string
	Message       string
}

type ChatMessage struct {
	UserName      string `json:"userName"`
	ReceivingUser string `json:"receivingUser"`
	MessageDate   string `json:"messageDate"`
	Message       string `json:"message"`
}

type LoadRequest struct {
	UserName      string `json:"userName"`
	ReceivingUser string `json:"receivingUser"`
}

type ReturnChatData struct {
	UserName     string
	ReceiverName string
	Messages     []ReturnMessage
}

func LoadMessages(sqlSentence string, userName string, receiverName string, limit int) ReturnChatData {
	var chat ReturnChatData

	chat.UserName = userName
	chat.ReceiverName = receiverName

	userID := getUserIdFomMessage(userName)
	receiverID := getUserIdFomMessage(receiverName)

	rows, err := sqlDB.DataBase.Query(sqlSentence, userID, receiverID, userID, receiverID, limit)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()
	var sender, receiver int
	for rows.Next() {
		var messageData ReturnMessage

		rows.Scan(&sender, &receiver, &messageData.MessageDate, &messageData.Message)
		messageDateTime, err := time.Parse(time.RFC3339Nano, messageData.MessageDate)
		if err == nil {
			messageData.MessageDate = messageDateTime.Format("15:04")
		}

		messageData.UserName = getUserNameByID(sender)
		messageData.ReceivingUser = getUserNameByID(receiver)
		chat.Messages = append(chat.Messages, messageData)
	}
	chat.Messages = reverse(chat.Messages)
	return chat
}

func reverse(s []ReturnMessage) []ReturnMessage {

	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}

	return s
}

func SaveChat(userID int, receiverID int, Message string) {

	DateSent := time.Now().Format(time.RFC3339Nano)

	statement, _ := sqlDB.DataBase.Prepare("INSERT INTO chat (userid, receiverid, datesent, message) VALUES (?,?,?,?)")
	_, err2 := statement.Exec(userID, receiverID, DateSent, Message)
	if err2 != nil {
		log.Println("SQL [ERROR]: unable to save message")
	}
}
