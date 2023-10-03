import React, { useState, useEffect } from 'react';
import { sendEvent } from "../../websocket"; // Assuming you have WebSocket functions for sending and receiving events

export const Events = ({ data }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [groupEvents, setGroupEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleNewEventClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleFormSubmit = (event) => {
    // Handle form submission logic here
    event.preventDefault();
    const formData = new FormData(event.target);

    // Convert FormData to a plain JavaScript object
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    const creator = JSON.parse(sessionStorage.getItem("CurrentUser")).UserID;
    const payload = {
      GroupID: data.Id,
      CreatorID: creator,
      EventName: formDataObject.eventName,
      EventDescription: formDataObject.eventDescription,
      EventDate: formDataObject.eventDate,
    };
    sendEvent("create_event", payload);
    setShowPopup(false);
  };

  useEffect(() => {
    // Load events when the component mounts
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_events") {
        // update the chat log with the received message, only if chat is opened with the right person.
        if (eventData.payload) {
          setGroupEvents(eventData.payload)
          setLoading(false);
        }
      } 
    };
    // Request the initial list of events when the component mounts
    sendEvent("load_events", { GroupID: data.Id });
  }, [data.Id]);

  return (
    <div>
      <h1>Events</h1>
      {!showPopup && <button onClick={handleNewEventClick}>New Event</button>}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <button onClick={handleClosePopup} className="close-button">
              Close
            </button>
            <h2>Create New Event</h2>
            <form onSubmit={handleFormSubmit}>
              {/* Add form fields for new event details */}
              <label>
                Event Name:
                <input type="text" name="eventName" required />
              </label>
              <label>
                Event Description:
                <input type="text" name="eventDescription" required maxLength={150} />
              </label>
              <label>
                Event Date:
                <input type="datetime-local" name="eventDate" required />
              </label>
              <button type="submit">Create Event</button>
            </form>
          </div>
        </div>
      )}

      {/* Display events */}
      <div>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div>
            <h2>Events</h2>
            <ul>
              {groupEvents.map((event) => (
                <li key={event.EventID}>{event.CreatorNickname} {event.EventName} {event.EventDescription} {event.EventDate}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
