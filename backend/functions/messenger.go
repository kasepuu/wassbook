package function

import (
	"log"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
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
	Message      string
	Date         string
}

func LoadMessages(senderID int, receiverID int, limit int) (chatLog []ReturnChatData) {
	const query = `SELECT userid, receiverid, datesent, message 
	FROM chat 
	WHERE (userid = ? AND receiverid = ?) OR (receiverid = ? AND userid = ?) 
	ORDER BY messageid DESC 
	LIMIT ?`

	rows, err := sqlDB.DataBase.Query(query, senderID, receiverID, senderID, receiverID, limit)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var sender, receiver int

		var date, message string

		rows.Scan(&sender, &receiver, &date, &message)
		messageDateTime, err := time.Parse(time.RFC3339Nano, date)
		if err == nil {
			date = messageDateTime.Format("15:04 (02.01 2006)")
		}

		chatLog = append(chatLog, ReturnChatData{UserName: GetUserName(sender), ReceiverName: GetUserName(receiver), Message: message, Date: date})
	}

	return reverse(chatLog)
}

func reverse(s []ReturnChatData) []ReturnChatData {
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
