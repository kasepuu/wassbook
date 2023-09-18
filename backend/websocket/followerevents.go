package ws

import (
	"encoding/json"
	"fmt"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
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
				fmt.Println("update_follower_requests")
				sendResponse(len(users), "update_follower_requests", client)
			}
		} else if client.userId == RequesterID {
			fmt.Println("reloading profile")
			sendResponse(payload, "reload_profile_page", client)
		}
	}

	return nil
}

func SendUnFollowHandler(event Event, c *Client) error {
	fmt.Println("send unfollow request")
	// send_follow_request
	type SendFollowEvent struct {
		RequesterID int `json:"RequesterID"`
		TargetID    int `json:"TargetID"`
	}

	var payload SendFollowEvent
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	TargetID := payload.TargetID

	_, sqlErr := sqlDB.DataBase.Exec("DELETE FROM followers WHERE userid = ? AND targetid = ?", RequesterID, TargetID)
	if sqlErr != nil {
		return sqlErr
	}

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

func GetFollowersHandler(event Event, c *Client) error {
	fmt.Println("send follow request")
	// get_followerslist
	type GetFollowersEvent struct {
		RequesterID int `json:"RequesterID"`
	}

	var payload GetFollowersEvent
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID

	mutualFollowers, err := function.GetMutualFollowers(RequesterID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	for client := range c.client.clients {
		if client.userId == RequesterID {
			sendResponse(mutualFollowers, "update_followerslist", client)
		}
	}

	return nil
}
