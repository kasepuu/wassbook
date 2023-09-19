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
		}
	}

	return nil
}

func RemoveNotificationHandler(event Event, c *Client) error {
	fmt.Println("Notification has been cleared")
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
