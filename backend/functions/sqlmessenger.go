package function

import (
	"fmt"
	"log"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type ReturnChatData struct {
	UserName     string
	ReceiverName string
	Message      string
	Date         string
}

func LoadMessages(senderID int, receiverID int, limit int) (chatLog []ReturnChatData, totalCount int) {
	const query = `SELECT userid, receiverid, datesent, message 
	FROM chat 
	WHERE (userid = ? AND receiverid = ?) OR (receiverid = ? AND userid = ?) 
	ORDER BY messageid DESC 
	LIMIT ?`

	const countQuery = `SELECT COUNT(*) 
                        FROM chat 
                        WHERE (userid = ? AND receiverid = ?) OR (receiverid = ? AND userid = ?)`


	fmt.Println("getting messages between:", senderID, receiverID, limit)

	err := sqlDB.DataBase.QueryRow(countQuery, senderID, receiverID, senderID, receiverID).Scan(&totalCount)
    if err != nil {
        log.Println(err)
    }

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
	fmt.Println("loaded messages:", chatLog)

	return reverse(chatLog), totalCount
}

func reverse[T any](s []T) []T {
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
