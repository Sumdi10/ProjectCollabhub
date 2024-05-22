import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, ListGroup, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode

const UserGroups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = jwtDecode(token)._id;

    if (userId) {
      fetchUserGroups(userId, token);
    } else {
      Swal.fire("Error", "User ID not found in token.", "error");
    }
  }, []);

  const fetchUserGroups = async (userId, token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setGroups(response.data.message); // Assuming the endpoint returns 'message' with group list
      } else {
        Swal.fire("Error", "Unable to fetch user groups.", "error");
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
      Swal.fire("Error", `Error occurred: ${error.message}`, "error");
    }
  };

  const sendMessage = async () => {
    if (!selectedGroup || message.trim() === "") {
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/group/${selectedGroup._id}/message`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire("Success", "Message sent!", "success");
        setMessage(""); // Reset the message
      } else {
        Swal.fire("Error", "Failed to send message.", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire("Error", `Error occurred: ${error.message}`, "error");
    }
  };

  const startFetchingGroupDetails = (groupId) => {
    const interval = setInterval(() => {
      fetchGroupDetails(groupId); // Fetch data at intervals
    }, 1000); // 1 second interval
    setIntervalId(interval); // Save interval ID to clear later
  };

  const fetchGroupDetails = async (groupId) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSelectedGroup(response.data.message); // Assuming the endpoint returns 'message'
      } else {
        Swal.fire("Error", "Unable to fetch group details.", "error");
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Swal.fire("Error", `Error occurred: ${error.message}`, "error");
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clear the interval on unmount
      }
    };
  }, [intervalId]);

  const handleGroupSelection = (group) => {
    setSelectedGroup(group);
    startFetchingGroupDetails(group._id); // Start fetching details at regular intervals
  };

  return (
    <div>
      <h1>Your Groups</h1>
      {groups.length === 0 ? (
        <p>No groups found</p>
      ) : (
        <div>
          <h2>Groups List</h2>
          <ListGroup>
            {groups.map((group) => (
              <ListGroup.Item
                key={group._id}
                onClick={() => handleGroupSelection(group)}
                style={{ cursor: "pointer" }}
              >
                {group.name}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {selectedGroup && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>{selectedGroup.name}</Card.Title>
                <Card.Text>Members:</Card.Text>
                <ListGroup>
                  {selectedGroup.members.map((member) => (
                    <ListGroup.Item key={member._id}>
                      {member.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Form.Group className="mt-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </Form.Group>
                <Button onClick={sendMessage} className="mt-2">
                  Send Message
                </Button>
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default UserGroups;
