package ws

import (
	"encoding/json"
	"fmt"
	"log"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func NewEventHandler(event Event, c *Client) error {
	type CreateGroupEventEvent struct {
		GroupID          int    `json:"GroupID"`
		CreatorID        int    `json:"CreatorID"`
		EventName        string `json:"EventName"`
		EventDescription string `json:"EventDescription"`
		EventDate        string `json:"EventDate"`
	}

	var newEvent CreateGroupEventEvent

	if err := json.Unmarshal(event.Payload, &newEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	statement := `INSERT INTO events (name, date, description, ownerId, groupId) VALUES (?,?,?,?,?)`
	_, errExec := sqlDB.DataBase.Exec(statement,
		newEvent.EventName,
		newEvent.EventDate,
		newEvent.EventDescription,
		newEvent.CreatorID,
		newEvent.GroupID,
	)

	if errExec != nil {
		log.Println("SQL execution error:", errExec)
		return errExec
	}

	fmt.Println("this was received:", newEvent)

	return nil
}

func LoadEventHandler(event Event, c *Client) error {
	type GroupEventEvent struct {
		EventID          int
		GroupID          int
		CreatorID        int
		EventName        string
		EventDescription string
		EventDate        string
		CreatorNickname  string
	}

	type payload struct {
		GroupID int `json:"GroupID"`
	}

	var events []GroupEventEvent
	var groupID payload

	if err := json.Unmarshal(event.Payload, &groupID); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	rows, _ := sqlDB.DataBase.Query(`SELECT events.*, users.nickname
	FROM events
	INNER JOIN users ON events.ownerID = users.id
	WHERE events.GroupID = ?`, groupID.GroupID)
	defer rows.Close()
	for rows.Next() {
		var event GroupEventEvent
		rows.Scan(&event.EventID, &event.EventName, &event.EventDate, &event.EventDescription, &event.CreatorID, &event.GroupID, &event.CreatorNickname)
		events = append(events, event)
	}
	sendResponse(events, "update_events", c)

	return nil
}
