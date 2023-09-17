package ws

import (
	"encoding/json"
	"fmt"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

func SendFollowHandler(event Event, c *Client) error {
	fmt.Println("send follow request")
	// send_follow_request
	type SendFollowEvent struct {
		RequesterID int    `json:"RequesterID"`
		TargetID    int    `json:"TargetID"`
		Status      string `json:"Status"`
	}

	var payload SendFollowEvent
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	TargetID := payload.TargetID

	function.SaveFollow(RequesterID, TargetID, payload.Status)

	payload.Status = "follow_" + payload.Status
	// function.SaveNotification(RequesterID, TargetID, payload.Status)

	for client := range c.client.clients {
		if client.userId == TargetID {
			users, err := function.FetchUsersWithFollowStatus(TargetID, "pending")
			if err == nil {
				sendResponse(len(users), "update_follower_requests", client)
			}
		} else if client.userId == RequesterID {
			sendResponse(payload, "reload_profile_page", client)
		}
	}

	return nil
}

func GetFollowRequestsHandler(event Event, c *Client) error {
	fmt.Println("get follow requests requested")

	return nil
}
