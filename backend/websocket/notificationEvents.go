package ws

import (
	"encoding/json"
	"fmt"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func SendNotificationHandler(event Event, c *Client) error {
	fmt.Println("New notification has been sent!")
	type Requester struct {
		TargetID    int    `JSON:"TargetID"`
		SenderID    int    `JSON:"SenderID"`
		Description string `JSON:"Description"`
	}
	var payload Requester

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	errSave := function.SaveNotification(payload.TargetID, payload.SenderID, payload.Description)
	if errSave != nil {
		return errSave
	}

	TargetID := payload.TargetID

	for client := range c.client.clients {
		if client.userId == TargetID {
			usersMutual, errMut := function.GetMutualFollowers(TargetID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", c)
			}
			notifications, errNot := function.LoadNotifications(client.userId)
			if errNot == nil {
				sendResponse(len(notifications), "update_notifications", client)
			}
		}
	}

	return nil
}

func SendGroupNotificationHandler(event Event, c *Client) error {
	type Requester struct {
		GroupID  int    `JSON:"GroupID"`
		SenderID int    `JSON:"SenderID"`
		Type     string `JSON:"Type"`
		Topic    string `JSON:"Topic"`
	}
	var payload Requester

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	Members := function.GetGroupMembers(payload.GroupID)

	SenderID := payload.SenderID
	Type := payload.Type
	Topic := payload.Topic

	GroupName := function.GetGroupNameByID(payload.GroupID, "tag")

	if Type == "event" {
		Topic = "New event: '" + Topic + "' in " + GroupName
	}

	for m := 0; m < len(Members); m++ {
		if Members[m] != SenderID {
			function.SaveNotification(Members[m], SenderID, Topic)
		}
	}

	for client := range c.client.clients {
		if client.userId != SenderID && function.Contains(Members, client.userId) {
			usersMutual, errMut := function.GetMutualFollowers(client.userId)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}
			notifications, errNot := function.LoadNotifications(client.userId)
			if errNot == nil {
				sendResponse(len(notifications), "update_notifications", client)
			}
		}
	}

	return nil
}

func RemoveNotificationHandler(event Event, c *Client) error {
	type Request struct {
		NotificationID int  `JSON:"NotificationID"`
		TargetID       int  `JSON:"TargetID"`
		ClearAll       bool `JSON:"ClearAll"`
	}

	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	errClear := function.ClearNotification(payload.NotificationID, payload.TargetID, payload.ClearAll)

	for client := range c.client.clients {
		if client.userId == payload.TargetID {
			usersMutual, errMut := function.GetMutualFollowers(payload.TargetID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", c)
			}
		}
	}

	return errClear
}
