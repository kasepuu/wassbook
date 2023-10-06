package ws

import (
	"encoding/json"
	"fmt"
	"log"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

type Request struct {
	RequesterID int `JSON:"RequesterID"`
	TargetID    int `JSON:"TargetID"`
}

func SendFollowHandler(event Event, c *Client) error {
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
			users, err := function.FetchFollowRequests(TargetID, "pending")
			if err == nil {
				sendResponse(len(users), "update_follower_requests", client)
			}
		} else if client.userId == RequesterID {
			sendResponse(payload, "reload_profile_page", client)
		}
	}

	return nil
}

func SendUnFollowHandler(event Event, c *Client) error {
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
			users, err := function.FetchFollowRequests(TargetID, "pending")
			if err == nil {
				sendResponse(len(users), "update_follower_requests", client)
			}
		} else if client.userId == RequesterID {
			sendResponse(payload, "reload_profile_page", client)
		}
	}

	return nil
}

func AcceptFollowHandler(event Event, c *Client) error {
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[follow_accept] bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	TargetID := payload.TargetID

	err := function.SetFollowStatus(RequesterID, TargetID, "following", "pending")
	if err != nil {
		return err
	}

	for client := range c.client.clients {
		if client.userId == TargetID {
			users, err := function.FetchFollowRequests(TargetID, "pending")
			if err == nil {
				sendResponse(len(users), "update_follower_requests", client)
			}
			usersMutual, errMut := function.GetMutualFollowers(TargetID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}
		} else if client.userId == RequesterID {
			usersMutual, errMut := function.GetMutualFollowers(RequesterID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}
			sendResponse(payload, "reload_profile_page", client)
		}

	}

	return nil
}

func DeclineFollowHandler(event Event, c *Client) error {

	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[follow_decline] bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	TargetID := payload.TargetID

	err := function.SetFollowStatus(RequesterID, TargetID, "remove", "pending")

	if err != nil {
		return err
	}

	for client := range c.client.clients {
		if client.userId == TargetID {
			usersUnderRequests, errReq := function.FetchFollowRequests(TargetID, "pending")
			if errReq == nil {
				sendResponse(len(usersUnderRequests), "update_follower_requests", client)
			}
			usersMutual, errMut := function.GetMutualFollowers(TargetID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}
		} else if client.userId == RequesterID {
			usersMutual, errMut := function.GetMutualFollowers(RequesterID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}
			sendResponse(payload, "reload_profile_page", client)
		}
	}

	return nil
}

func LoadMutualFollowersHandler(event Event, c *Client) error {
	type Request struct {
		RequesterID int `JSON:"RequesterID"`
	}
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[follow_decline] bad payload in request: %v", err)
	}

	usersMutual, errMut := function.GetMutualFollowers(payload.RequesterID)
	if errMut == nil {
		sendResponse(usersMutual, "update_followerslist", c)
	}
	return nil
}

func LoadGroupList(event Event, c *Client) error {
	type Request struct {
		RequesterID int `JSON:"RequesterID"`
	}
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[follow_decline] bad payload in request: %v", err)
	}

	groupList := function.GetGroupsInfo(payload.RequesterID)
	sendResponse(groupList, "update_groupslist", c)

	return nil
}

func LoadProfileFollowersHandler(event Event, c *Client) error {
	type Request struct {
		SenderID int `JSON:"SenderID"`
	}
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[follow_decline] bad payload in request: %v", err)
	}

	profileFollowers, errMut := function.GetProfileFollowers(payload.SenderID)
	if errMut == nil {
		sendResponse(profileFollowers, "profile_followerslist", c)
	}
	profileFollowing, errMut := function.GetProfileFollowing(payload.SenderID)
	if errMut == nil {
		sendResponse(profileFollowing, "profile_followinglist", c)
	}
	return nil
}

// group requests
func AcceptGroupRequestHandler(event Event, c *Client) error {

	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[group_request_accept] bad payload in request: %v", err)
	}
	log.Println(payload)
	RequesterID := payload.RequesterID
	GroupID := payload.TargetID

	function.SetGroupStatus(RequesterID, GroupID, "accepted")

	return nil
}

func DeclineGroupRequestHandler(event Event, c *Client) error {
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[group_request_decline] bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	GroupID := payload.TargetID

	err := function.SetGroupStatus(RequesterID, GroupID, "remove")
	if err != nil {
		log.Println("There was an error setting group status:", err)
	}
	return nil
}
func AcceptGroupInviteHandler(event Event, c *Client) error {
	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[group_invite_accept] bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	GroupID := payload.TargetID

	function.SetGroupStatus(RequesterID, GroupID, "accepted")

	return nil
}

func DeclineGroupInviteHandler(event Event, c *Client) error {

	var payload Request

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("[group_invite_decline] bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID
	GroupID := payload.TargetID

	function.SetGroupStatus(RequesterID, GroupID, "remove")

	return nil
}
