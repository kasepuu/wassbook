package function

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
)

type ReturnGroupChatData struct {
	SenderID int
	UserName string
	Message  string
	Date     string
}

func LoadGroupMessages(GroupID int, senderID int, limit int) (chatLog []ReturnGroupChatData, totalCount int) {
	const query = `SELECT userid, datesent, message 
	FROM groupchat 
	WHERE (groupid = ?)
	ORDER BY messageid DESC 
	LIMIT ?`

	const countQuery = `SELECT COUNT(*) FROM groupchat WHERE groupid =?`

	err := sqlDB.DataBase.QueryRow(countQuery, GroupID).Scan(&totalCount)
	if err != nil {
		log.Println(err)
	}

	rows, err := sqlDB.DataBase.Query(query, GroupID, limit)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var sender int

		var date, message string

		rows.Scan(&sender, &date, &message)
		messageDateTime, err := time.Parse(time.RFC3339Nano, date)
		if err == nil {
			date = messageDateTime.Format("15:04 (02.01 2006)")
		}

		chatLog = append(chatLog, ReturnGroupChatData{UserName: GetUserName(sender), SenderID: sender, Message: message, Date: date})
	}
	fmt.Println("loaded messages:", chatLog)

	return reverse(chatLog), totalCount
}

func SaveGroupChat(userID int, receiverIDs []int, Message string, groupID int) {
	DateSent := time.Now().Format(time.RFC3339Nano)

	ReceiversJSON, err := json.Marshal(receiverIDs)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	statement, err3 := sqlDB.DataBase.Prepare("INSERT INTO groupchat (userid, receiverids, groupid, datesent, message) VALUES (?,?,?,?,?)")
	if err3 != nil {
		fmt.Println("Error:", err)
		return
	}

	_, err2 := statement.Exec(userID, ReceiversJSON, groupID, DateSent, Message)
	if err2 != nil {
		log.Println("SQL [ERROR]: unable to save message")
	}
}
