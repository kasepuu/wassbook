// https://www.youtube.com/watch?v=pKpKv9MKN-E&ab_channel=ProgrammingPercy
package ws

import (
	"encoding/json"
	"fmt"
	"log"

	function "01.kood.tech/git/kasepuu/social-network/backend/functions"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

// event handlers
func (m *wsManager) setupEventHandlers() {
	m.handlers["on_connection"] = OnConnectionHandler
	m.handlers["send_message"] = SendMessageHandler
	m.handlers["request_messages"] = LoadMessagesHandler
	m.handlers["send_notification"] = SendNotificationHandler

	m.handlers["send_follow_request"] = SendFollowHandler
	m.handlers["send_unfollow_request"] = SendUnFollowHandler
	m.handlers["accept_follow_request"] = AcceptFollowHandler
	m.handlers["decline_follow_request"] = DeclineFollowHandler

	m.handlers["request_mutualfollowers"] = LoadMutualFollowersHandler
	m.handlers["get_followerslist"] = GetFollowersHandler
}

func sendResponse(responseData any, event string, c *Client) {
	response, err := json.Marshal(responseData)
	if err != nil {
		log.Printf("There was an error marshalling response %v", err)
	}
	// sending data back to the client
	var responseEvent Event
	responseEvent.Type = event
	responseEvent.Payload = response
	c.egress <- responseEvent
}

func OnConnectionHandler(event Event, c *Client) error {
	fmt.Println("connection event handlign..")
	type Requester struct {
		RequesterID int `JSON:"RequesterID"`
	}
	var payload Requester

	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	RequesterID := payload.RequesterID

	for client := range c.client.clients {
		if client.userId == RequesterID {
			users, err := function.FetchUsersWithFollowStatus(RequesterID, "pending")
			if err == nil {
				sendResponse(len(users), "update_follower_requests", client)
			}

			usersMutual, errMut := function.GetMutualFollowers(RequesterID)
			if errMut == nil {
				sendResponse(usersMutual, "update_followerslist", client)
			}

			sendResponse(payload, "update_notifications", client)
		}
	}

	return nil
}
