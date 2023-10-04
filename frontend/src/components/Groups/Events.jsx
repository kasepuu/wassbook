import React, { useState, useEffect } from 'react';
import { sendEvent } from "../../websocket";
import { FaArrowCircleDown } from "react-icons/fa";

export const Events = ({ data }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [groupEvents, setGroupEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDateTime = new Date().toISOString().slice(0, 16);
  const user = JSON.parse(sessionStorage.getItem("CurrentUser")).UserID;

  const handleNewEventClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleGoingClick = (eventID) => {
    const payload = {
      UserID: user,
      EventID: eventID,
      Response: "Going"
    };
    sendEvent("event_response", payload);
  };

  const handleNotGoingClick = (eventID) => {
    const payload = {
      UserID: user,
      EventID: eventID,
      Response: "Not Going"
    };
    sendEvent("event_response", payload);
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
    // Calculate the minimum date and time for the input
    const minDateTime = new Date();
    minDateTime.setMinutes(minDateTime.getMinutes() + 1); // Adding 1 minute to ensure it's in the future
    const minDateTimeISO = minDateTime.toISOString().slice(0, 16);

    // Set the min attribute of the input element
    const eventDateInput = document.querySelector('[name="eventDate"]');
    if (eventDateInput && showPopup) {
      eventDateInput.setAttribute('min', minDateTimeISO);
    }

    const handleUpdateEvents = (payload) => {
      setGroupEvents(payload);
      setLoading(false);
    };

    const handleUpdateEventResponse = (payload) => {
      setGroupEvents((prevGroupEvents) => {
        return prevGroupEvents.map((event) => {
          if (event.EventID === payload.EventID) {
            return {
              ...event,
              Response: payload.Response,
            }
          }
          return event;
        });
      });
    }

    // Register socket event listeners
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_events") {
        if (eventData.payload) {
          handleUpdateEvents(eventData.payload);
        }
      } else if (eventData.type === "update_eventResponse") {
        handleUpdateEventResponse(eventData.payload);
      }
    };
    // Request the initial list of events when the component mounts
    sendEvent("load_events", { UserID: user, GroupID: data.Id });
  }, [data.Id, showPopup]);

  const showAttending = (e) => {

    const dialog = document.querySelector("dialog");

    dialog.showModal();
  };

  const closeDialog = () => {
    const dialog = document.querySelector("dialog");

    dialog.close();
  };

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
                <input type="datetime-local" name="eventDate" required min={currentDateTime} />
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
            <table className='eventsTable'>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Creator</th>
                  <th>Description</th>
                  <th>Time</th>
                  <th>Response</th>
                  <th>Attending</th>
                </tr>
              </thead>
              <tbody>
                {groupEvents === null ? (<>No events!</>) : (<>{groupEvents.map((event) => (
                  <tr key={event.EventID}>
                    <td>{event.EventName}</td>
                    <td>{event.CreatorNickname}</td>
                    <td>{event.EventDescription}</td>
                    <td>{event.EventDate}</td>

                    {event.Response ? (
                      <td>
                        {event.Response === "Going" ? (
                          <>
                            {event.Response}
                            <button onClick={() => handleNotGoingClick(event.EventID)}>Not Going</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleGoingClick(event.EventID)}>Going</button>
                            {event.Response}
                          </>
                        )}
                      </td>
                    ) : (
                      <td>
                        <button onClick={() => handleGoingClick(event.EventID)}>Going</button>
                        <button onClick={() => handleNotGoingClick(event.EventID)}>Not Going</button>
                      </td>
                    )}
                    <td>{event.Attending}
                      <dialog>
                        <button onClick={closeDialog} autoFocus>
                          Close
                        </button>
                        <ul>
                          {event.AttendingMembers === null ? (
                            <><div>No one attending yet!</div></>) : (
                            <>{event.AttendingMembers.map((member) => (
                              <div>{member.Nickname} {member.Response}</div>
                            ))}</>
                          )}

                        </ul>
                        <article></article>
                      </dialog>
                      <button onClick={showAttending}><FaArrowCircleDown /></button>
                    </td>
                  </tr>
                ))}</>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
