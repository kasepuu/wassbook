package ws

import "fmt"

func SendNotificationHandler(event Event, c *Client) error {
	fmt.Println("New notification has been sent!")

	return nil
}
