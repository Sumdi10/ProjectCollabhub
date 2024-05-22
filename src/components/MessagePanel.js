import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ensure this is imported correctly
import ModalMessage from "./ModalMessage"; // importing your modal component

const MessagePanel = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const decodedToken = jwtDecode(authToken);
        const currentUserId = decodedToken._id;

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/messages/user-messages/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // Filter messages related to the current user
        const filteredMessages = response.data.messages.filter(
          (message) =>
            message.recipient === currentUserId ||
            message.sender === currentUserId
        );

        setMessages(filteredMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const socket = io(process.env.REACT_APP_SOCKET_URL); // Pass correct socket URL

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Ensure dependency array has correct dependencies or is empty to run once

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const togglePanel = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <div className="messagePanelBody">
      <div className="messageHeader" onClick={togglePanel}>
        <FontAwesomeIcon icon={faEnvelope} />
      </div>
      {isOpen && (
        <div className="messageBody">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message._id} // Ensure a unique key for each message
                className="messageItem"
                onClick={() => handleMessageClick(message)} // Open modal on click
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <div className="messageText">
                  <strong>{message.content}</strong>
                  <div className="messageDate">
                    {new Date(message.createdAt).toDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="noMessages">No messages</div>
          )}
        </div>
      )}
      <div className="messageFooter">
        <Link to="/messages">See all</Link>
      </div>

      {/* Modal to display the selected message */}
      <ModalMessage
        isOpen={isModalOpen} // Control modal visibility
        onClose={() => setIsModalOpen(false)} // Close modal
        message={selectedMessage} // Pass the selected message
      />
    </div>
  );
};

export default MessagePanel;
