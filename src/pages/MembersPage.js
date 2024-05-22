import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faFilter,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import AppButton from "../components/AppButton";

const MembersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudents, setShowStudents] = useState(true);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken._id;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${serverUrl}/users/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.message || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching users.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenMessagePopup = (userId) => {
    setSelectedUserId(userId);
    setShowMessagePopup(true);
  };

  const handleCloseMessagePopup = () => {
    setShowMessagePopup(false);
    setNewMessage("");
    setSelectedFile(null);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Message content or file cannot be empty.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", newMessage);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      await axios.post(
        `${serverUrl}/message/send-message-to-user/${selectedUserId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Message sent successfully.",
      });

      handleCloseMessagePopup();
    } catch (error) {
      console.error("Failed to send message:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUserList = filteredUsers.filter((user) =>
    showStudents ? user.role === "student" : user.role === "instructor"
  );

  const selectedUser = users.find((user) => user._id === selectedUserId);

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <h2>Users List</h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <AppButton
          name="Filter Students"
          customStyle="addBtnColor"
          icon={faFilter}
          onClick={() => setShowStudents(true)}
        />
        <AppButton
          name="Filter Instructors"
          customStyle="addBtnColor"
          icon={faFilter}
          onClick={() => setShowStudents(false)}
        />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchInputChange}
        placeholder="Search users..."
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          marginBottom: "20px",
          width: "100%",
        }}
      />
      <table
        style={{
          width: "100%",
          border: "1px solid #ddd",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Username
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Role</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUserList.map((user) => (
            <tr key={user._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.username}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.role}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  style={{ color: "#2196F3", cursor: "pointer" }}
                  onClick={() => handleOpenMessagePopup(user._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showMessagePopup && selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
              maxWidth: "700px",
              position: "relative",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <button
              aria-label="Close"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                fontSize: "24px",
                color: "#ff4d4f",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleCloseMessagePopup}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h2
              style={{
                textAlign: "center",
                marginBottom: "20px",
                fontFamily: "'Roboto', sans-serif",
                color: "#333",
              }}
            >
              Send a Message to : {selectedUser.username}
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between", // Aligns input and button side-by-side
                alignItems: "center",
                gap: "10px", // Adds some space between elements
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message..."
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "80%", // Adjusted width to fit beside the button
                  fontSize: "16px",
                }}
              />

              <button
                style={{
                  backgroundColor: "#25628F",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={handleSendMessage}
              >
                Send
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  style={{ marginLeft: "5px" }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
