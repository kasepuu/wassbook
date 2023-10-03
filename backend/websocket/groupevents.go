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
		Response         string
	}

	type payload struct {
		GroupID int `json:"GroupID"`
		UserID  int `json:"UserID"`
	}

	var events []GroupEventEvent
	var data payload

	if err := json.Unmarshal(event.Payload, &data); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	rows, _ := sqlDB.DataBase.Query(`SELECT events.*, users.nickname
	FROM events
	INNER JOIN users ON events.ownerID = users.id
	WHERE events.GroupID = ?`, data.GroupID)
	defer rows.Close()
	for rows.Next() {
		var event GroupEventEvent
		rows.Scan(&event.EventID, &event.EventName, &event.EventDate, &event.EventDescription, &event.CreatorID, &event.GroupID, &event.CreatorNickname)
		event.Response = getEventResponse(event.EventID, data.UserID)
		events = append(events, event)
	}

	sendResponse(events, "update_events", c)

	return nil
}

func getEventResponse(EventID int, UserID int) (resp string) {
	sqlDB.DataBase.QueryRow(`SELECT status FROM eventMember WHERE userId = ? AND eventId = ?`, UserID, EventID).Scan(&resp)
	return 
}

func EventResponseHandler(event Event, c *Client) error {
	type EventResponse struct {
		UserID   int    `json:"UserID"`
		EventID  int    `json:"EventID"`
		Response string `json:"Response"`
	}

	var newEventResponse EventResponse

	if err := json.Unmarshal(event.Payload, &newEventResponse); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	statement := `INSERT OR REPLACE INTO eventMember (userId, eventId, status)
	VALUES (?,?,?)`
	_, errExec := sqlDB.DataBase.Exec(statement,
		newEventResponse.UserID,
		newEventResponse.EventID,
		newEventResponse.Response,
	)

	if errExec != nil {
		log.Println("SQL execution error:", errExec)
		return errExec
	}

	fmt.Println("this was received:", newEventResponse)

	sendResponse(newEventResponse, "update_eventResponse", c)

	return nil
}
