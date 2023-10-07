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
	m.handlers["request_mutualfollowers"] = LoadMutualFollowersHandler
	m.handlers["request_profile_followerslist"] = LoadProfileFollowersHandler

	// chat events
	m.handlers["send_message"] = SendMessageHandler
	m.handlers["request_messages"] = LoadMessagesHandler
	m.handlers["is_typing"] = IsTypingHandler

	// events regarding requests
	m.handlers["send_follow_request"] = SendFollowHandler
	m.handlers["send_unfollow_request"] = SendUnFollowHandler
	m.handlers["accept_follow_request"] = AcceptFollowHandler
	m.handlers["decline_follow_request"] = DeclineFollowHandler
	m.handlers["accept_group_invite"] = AcceptGroupInviteHandler
	m.handlers["decline_group_invite"] = DeclineGroupInviteHandler
	m.handlers["accept_group_request"] = AcceptGroupRequestHandler
	m.handlers["decline_group_request"] = DeclineGroupRequestHandler

	// notification events
	m.handlers["send_notification"] = SendNotificationHandler
	m.handlers["send_group_notification"] = SendGroupNotificationHandler
	m.handlers["remove_notification"] = RemoveNotificationHandler

	// group events
	m.handlers["create_event"] = NewEventHandler
	m.handlers["load_events"] = LoadEventHandler
	m.handlers["event_response"] = EventResponseHandler
	m.handlers["request_group_join"] = EventGroupJoin
	m.handlers["request_group_leave"] = EventGroupLeave
	m.handlers["invite_group_join"] = EventGroupInvite

	// group chat events
	m.handlers["send_group_message"] = SendGroupMessageHandler
	m.handlers["request_group_messages"] = LoadGroupMessagesHandler
	m.handlers["is_typing_group"] = IsTypingGroupHandler
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
			UpdateRequestsAndNotifications(RequesterID, client)
		}
	}

	return nil
}

// function that responds updated notifications etc...
func UpdateRequestsAndNotifications(UserID int, client *Client) {
	notifications, errNot := function.LoadNotifications(UserID)
	if errNot == nil {
		sendResponse(len(notifications), "update_notifications", client)
	}

	users, err := function.FetchFollowRequests(UserID, "pending")
	users2, err2 := function.FetchGroupInviteRequests(UserID)
	users3, err3 := function.FetchGroupJoinRequests(UserID)

	if err == nil && err2 == nil && err3 == nil {
		sendResponse(len(users)+len(users2)+len(users3), "update_requests", client)
	}

	usersMutual, errMut := function.GetMutualFollowers(UserID)
	if errMut == nil {
		sendResponse(usersMutual, "update_followerslist", client)
	}

	groupList := function.GetGroupsInfo(UserID)
	sendResponse(groupList, "update_groupslist", client)
}
