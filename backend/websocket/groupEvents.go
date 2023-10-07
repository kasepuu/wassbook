package ws

import (
	"encoding/json"
	"fmt"
	"log"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	"01.kood.tech/git/kasepuu/social-network/backend/functions/groups"
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
	return nil
}
func LoadEventHandler(event Event, c *Client) error {
	type EventResponse struct {
		Nickname string
		Response string
	}
	type GroupEvent struct {
		EventID          int
		GroupID          int
		CreatorID        int
		EventName        string
		EventDescription string
		EventDate        string
		CreatorNickname  string
		Response         string
		Attending        int
		AttendingMembers []EventResponse
	}

	type payload struct {
		GroupID int `json:"GroupID"`
		UserID  int `json:"UserID"`
	}

	var events []GroupEvent
	var newPayload payload

	if err := json.Unmarshal(event.Payload, &newPayload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	rows, _ := sqlDB.DataBase.Query(`SELECT events.*, users.nickname, eventMember.status, COALESCE(going_count, 0) AS going_count
	FROM events
	INNER JOIN users ON events.ownerID = users.id
	LEFT JOIN eventMember ON events.id = eventMember.eventId AND eventMember.userId = ?
	LEFT JOIN (
		SELECT eventId, COUNT(*) AS going_count
		FROM eventMember
		WHERE status = 'Going'
		GROUP BY eventId
	) AS eventGoingCounts ON events.id = eventGoingCounts.eventId
	WHERE events.GroupID = ?`, newPayload.UserID, newPayload.GroupID)
	defer rows.Close()
	for rows.Next() {
		var event GroupEvent
		rows.Scan(&event.EventID, &event.EventName, &event.EventDate, &event.EventDescription, &event.CreatorID, &event.GroupID, &event.CreatorNickname, &event.Response, &event.Attending)

		rows, _ := sqlDB.DataBase.Query(`SELECT users.nickname, eventMember.status
		FROM users
		INNER JOIN eventMember ON users.id = eventMember.userId
		WHERE eventMember.eventId = ?
		`, event.EventID)
		defer rows.Close()
		for rows.Next() {
			var eventResponse EventResponse
			rows.Scan(&eventResponse.Nickname, &eventResponse.Response)
			event.AttendingMembers = append(event.AttendingMembers, eventResponse)
		}
		events = append(events, event)
	}
	sendResponse(events, "update_events", c)

	return nil
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
	sendResponse(newEventResponse, "update_eventResponse", c)
	return nil
}

type GroupInvites struct {
	ReceiverID int    `json:"ReceiverID"`
	SenderID   int    `json:"SenderID"`
	GroupID    int    `json:"GroupID"`
	Status     string `json:"Status"`
}

func EventGroupJoin(event Event, c *Client) error {

	var payload GroupInvites
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	senderId := payload.SenderID
	receiverId := payload.ReceiverID // the one that gets the invitation/leaves
	groupId := payload.GroupID
	status := payload.Status

	var invite groups.GroupInvite
	invite.SenderId = senderId
	invite.ReceiverId = receiverId
	invite.GroupId = groupId
	invite.Status = status

	_, err := groups.CreateMember(invite)
	if err != nil {
		fmt.Println("err:", err)
		return err
	}
	message := function.GetUserName(receiverId) + " wants to join " + function.GetGroupNameByID(groupId, "tag")
	err = function.SaveNotification(senderId, receiverId, message)
	if err == nil {
		for client := range c.client.clients {
			if client.userId == receiverId {
				sendResponse("", "update_group_page", client)
				UpdateRequestsAndNotifications(receiverId, client)
			} else if client.userId == senderId {
				UpdateRequestsAndNotifications(senderId, client)
			}
		}
	}
	return err
}

func EventGroupLeave(event Event, c *Client) error {

	var payload GroupInvites
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	senderId := payload.SenderID
	receiverId := payload.ReceiverID // the one that gets the invitation/leaves?
	groupId := payload.GroupID

	err := function.SetGroupStatus(receiverId, groupId, "remove")
	if err != nil {
		return err
	}

	err = function.RemoveNotification(senderId, receiverId, "wants to join")
	if err == nil {
		for client := range c.client.clients {
			if client.userId == receiverId {
				UpdateRequestsAndNotifications(receiverId, client)
			} else if client.userId == senderId {
				UpdateRequestsAndNotifications(senderId, client)
			}
		}
	}
	return err
}

func EventGroupInvite(event Event, c *Client) error {

	var payload GroupInvites
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	var invite groups.GroupInvite
	invite.SenderId = payload.SenderID
	invite.ReceiverId = payload.ReceiverID
	invite.GroupId = payload.GroupID
	invite.Status = payload.Status

	_, err := groups.CreateMember(invite)
	if err != nil {
		fmt.Println("err:", err)
		return err
	}

	message := function.GetUserName(payload.SenderID) + " invited you to join " + function.GetGroupNameByID(payload.GroupID, "tag")
	err = function.SaveNotification(payload.ReceiverID, payload.SenderID, message)
	if err == nil {
		for client := range c.client.clients {
			if client.userId == payload.ReceiverID {
				UpdateRequestsAndNotifications(payload.ReceiverID, client)
			} else if client.userId == payload.SenderID {
				sendResponse("", "update_group_page", client)
				UpdateRequestsAndNotifications(payload.SenderID, client)
			}
		}
	}

	return nil
}
