import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileDownload,
  faPaperPlane,
  faPaperclip,
  faTimesCircle,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import io from "socket.io-client";
import userImg1 from "../../assets/images/userImg.jpg";
import defaultAvatar from "../../assets/images/userImg2.jpg";
import { IconContext } from "react-icons";
import {
  RiFilePdf2Fill,
  RiFileWord2Fill,
  RiFileExcel2Fill,
  RiFileImageFill,
  RiFileTextFill,
} from "react-icons/ri";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const GroupMessage = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilePopupOpen, setIsFilePopupOpen] = useState(false);

  const messageListRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const decodedToken = jwtDecode(token);
  const currentUserId = decodedToken._id;

  const serverUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup);
      socket.emit("joinGroup", selectedGroup);
    }

    return () => {
      socket.off("newMessage");
    };
  }, [selectedGroup]);

  useEffect(() => {
    const newMessageListener = (message) => {
      console.log("Received new message:", message);
      fetchGroupMessages(selectedGroup); // Fetch messages after receiving a new message
    };

    socket.on("newMessage", newMessageListener);

    return () => {
      socket.off("newMessage", newMessageListener);
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom(); // Call scrollToBottom instead of scrollToTop
  }, [groupMessages]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const fetchGroupList = async () => {
    try {
      const response = await axios.get(`${serverUrl}/group/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let filteredGroups;

      if (decodedToken.role === "admin") {
        filteredGroups = response.data.message;
      } else if (
        decodedToken.role === "student" ||
        decodedToken.role === "instructor"
      ) {
        filteredGroups = response.data.message.filter((group) => {
          if (decodedToken.role === "student") {
            return group.students.some(
              (student) => student._id === currentUserId
            );
          } else {
            return group.instructor._id === currentUserId;
          }
        });
      }

      setGroupList(filteredGroups);
      if (filteredGroups.length > 0) {
        setSelectedGroup(filteredGroups[0]._id);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch groups.",
      });
    }
  };

  const fetchGroupMessages = async (groupId) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const messages = response.data.message.messages.map((message) => {
        const filename = message.filename || message.attachment?.filename;
        const fileUrl = filename
          ? ` http://localhost:3000//uploads/${filename}`
          : null;

        return {
          ...message,
          fileUrl,
          senderName: message.sender.username,
          senderAvatar:
            message.sender._id === currentUserId ? userImg1 : defaultAvatar,
          isCurrentUser: message.sender._id === currentUserId,
        };
      });
      setGroupMessages(messages);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch messages for the selected group.",
      });
    } finally {
      setIsLoading(false);
    }
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

    setIsLoading(true);

    const data = new FormData();
    data.append("groupId", selectedGroup);

    if (newMessage.trim() !== "") {
      data.append("content", newMessage);
    }

    data.append("senderId", currentUserId);
    if (selectedFile) {
      data.append("file", selectedFile);
    }

    try {
      const response = await axios.post(
        `${serverUrl}/message/send-message-to-group`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response from server:", response.data);

      // Fetch the updated group messages after sending the new message
      fetchGroupMessages(selectedGroup);

      setNewMessage("");
      setSelectedFile(null);
      socket.emit("sendMessage", response.data.message);

      // Emit a custom event to broadcast the new message
      socket.emit("newMessageBroadcast", response.data.message);

      // Emit the new message to the server
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send the message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const handleToggleFilePopup = () => {
    setIsFilePopupOpen(!isFilePopupOpen);
  };

  const filteredMessages = groupMessages
    .filter(
      (message) =>
        (message.content &&
          message.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (message.attachment &&
          message.attachment.filename
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )
    .reverse();

  const allAttachments = groupMessages
    .filter((message) => message.attachment)
    .map((message) => message.attachment);

  return (
    <div
      style={{
        display: "flex",
        height: "78vh",
        flexDirection: "column",
        backgroundColor: "white",
        padding: "10px",
        border: "2px dashed #25628F",
      }}
    >
      <div
        className="custom-scrollbar"
        style={{
          backgroundColor: "#25628F",
          padding: "20px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "thin",
        }}
      >
        {groupList.map((group) => (
          <div
            key={group._id}
            style={{
              marginRight: "10px",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor:
                selectedGroup === group._id ? "#2DC0CD" : "#4a5568",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              display: "inline-block",
            }}
            onClick={() => setSelectedGroup(group._id)}
          >
            {group.name}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "10px 0",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Search messages"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "2px solid #ccc",
          }}
        />
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={handleToggleFilePopup}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: "#25628F",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
              border: "none",
              outline: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const tooltip = document.getElementById("fileTooltip");
              tooltip.style.display = "block";
            }}
            onMouseLeave={(e) => {
              const tooltip = document.getElementById("fileTooltip");
              tooltip.style.display = "none";
            }}
          >
            <FontAwesomeIcon icon={faFile} />
          </button>
          <div
            id="fileTooltip"
            style={{
              zIndex: 10,
              display: "none",
              position: "absolute",
              top: "calc(100% + 5px)",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#25628F",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            All Files
          </div>
        </div>
      </div>

      {isFilePopupOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            maxHeight: "600px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              backgroundColor: "#25628F",
              color: "#fff",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            <h4 style={{ margin: 0 }}>All Files</h4>
            <FontAwesomeIcon
              icon={faTimesCircle}
              onClick={handleToggleFilePopup}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              padding: "20px",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {allAttachments.map((attachment, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "5px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconContext.Provider
                      value={{
                        color:
                          attachment.mimeType === "application/pdf"
                            ? "#e63946"
                            : attachment.mimeType ===
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "#007bff"
                            : attachment.mimeType ===
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            ? "#2a9d8f"
                            : attachment.mimeType === "text/plain"
                            ? "#f4a261"
                            : attachment.mimeType === "image/png"
                            ? "#9b59b6"
                            : "#666",
                      }}
                    >
                      {attachment.mimeType === "application/pdf" ? (
                        <RiFilePdf2Fill size={20} />
                      ) : attachment.mimeType ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                        <RiFileWord2Fill size={20} />
                      ) : attachment.mimeType ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                        <RiFileExcel2Fill size={20} />
                      ) : attachment.mimeType === "text/plain" ? (
                        <RiFileTextFill size={20} />
                      ) : attachment.mimeType === "image/png" ? (
                        <RiFileImageFill size={20} />
                      ) : (
                        <RiFileTextFill size={20} />
                      )}
                    </IconContext.Provider>
                    <span style={{ marginLeft: "10px" }}>
                      {attachment.filename}
                    </span>
                  </div>
                  <a
                    href={`http://localhost:3000/uploads/${attachment.filename}`}
                    download
                    style={{
                      backgroundColor: "#25628F",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1D4C70";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#25628F";
                    }}
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div
        ref={messageListRef}
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: "400px",
          display: "flex",
          flexDirection: "column-reverse", // Add this line
          scrollbarWidth: "thin",
        }}
      >
        {filteredMessages.map((message) => (
          <div
            key={message._id}
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: message.isCurrentUser ? "flex-end" : "flex-start",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: message.isCurrentUser ? "#d1e7dd" : "#f8d7da",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "left",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
            >
              <img
                src={message.senderAvatar}
                alt="User Avatar"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <strong>{message.senderName}</strong>
              <br />
              <div style={{ padding: "2px" }}>{message.content}</div>

              {message.attachment && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    // backgroundColor: "#fff",
                    border: "1px solid #fff",
                    padding: "5px",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconContext.Provider
                      value={{
                        color:
                          message.attachment.mimeType === "application/pdf"
                            ? "#e63946"
                            : message.attachment.mimeType ===
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "#007bff"
                            : message.attachment.mimeType ===
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            ? "#2a9d8f"
                            : message.attachment.mimeType === "text/plain"
                            ? "#f4a261"
                            : message.attachment.mimeType === "image/png"
                            ? "#9b59b6"
                            : "#666",
                      }}
                    >
                      {message.attachment.mimeType === "application/pdf" ? (
                        <RiFilePdf2Fill size={20} />
                      ) : message.attachment.mimeType ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                        <RiFileWord2Fill size={20} />
                      ) : message.attachment.mimeType ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                        <RiFileExcel2Fill size={20} />
                      ) : message.attachment.mimeType === "text/plain" ? (
                        <RiFileTextFill size={20} />
                      ) : message.attachment.mimeType === "image/png" ? (
                        <RiFileImageFill size={20} />
                      ) : (
                        <RiFileTextFill size={20} />
                      )}
                    </IconContext.Provider>
                    <span style={{ margin: "4px" }}>
                      {message.attachment.filename}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      fetch(
                        `http://localhost:3000/uploads/${message.attachment.filename}`
                      )
                        .then((response) => response.blob())
                        .then((blob) => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = message.attachment.filename; // Set the file name
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        })
                        .catch((error) => {
                          console.error("Error downloading file:", error);
                          // Handle error
                        });
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#25628F",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      padding: "6px 6px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1D4C70";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#25628F";
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileDownload}
                      style={{ marginRight: "8px" }}
                    />
                    Download
                  </button>
                </div>
              )}
              <div style={{ fontSize: "0.8em", color: "#666" }}>
                {moment(message.createdAt).fromNow()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #e5e5e5",
          paddingTop: "10px",
          position: "relative",
        }}
      >
        <div
          style={{
            flexGrow: 1,
            backgroundColor: "#eee",
            borderRadius: "25px",
            padding: "5px 15px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            style={{
              flexGrow: 1,
              padding: "6px 12px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontFamily: "inherit",
              fontSize: "16px",
              resize: "none",
              height: "36px",
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
            }}
          />
          <input
            type="file"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            style={{ marginLeft: "10px", cursor: "pointer" }}
          >
            <FontAwesomeIcon
              icon={faPaperclip}
              style={{
                fontSize: "18px",
                color: "#666",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#666";
              }}
            />
          </label>
        </div>
        <button
          onClick={handleSendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#25628F",
            color: "#fff",
            borderRadius: "25px",
            cursor: "pointer",
            border: "none",
            outline: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1D4C70";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#25628F";
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
        {selectedFile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "10px",
              backgroundColor: "#f8f8f8",
              padding: "5px 10px",
              borderRadius: "20px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span style={{ marginRight: "10px" }}>{selectedFile.name}</span>
            <FontAwesomeIcon
              icon={faTimesCircle}
              onClick={handleRemoveFile}
              style={{
                cursor: "pointer",
                color: "#e74c3c",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c0392b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#e74c3c";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMessage;
