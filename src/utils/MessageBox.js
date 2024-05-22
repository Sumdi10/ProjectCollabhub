// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPaperPlane,
//   faPaperclip,
//   faFilePdf,
//   faFileWord,
//   faTimesCircle,
// } from "@fortawesome/free-solid-svg-icons";
// import Swal from "sweetalert2";
// import { jwtDecode } from "jwt-decode"; // Corrected import statement
// import moment from "moment";
// import io from "socket.io-client";
// import Scrollbars from "react-custom-scrollbars";
// import userImg1 from "../assets/images/userImg.jpg";
// import defaultAvatar from "../assets/images/userImg2.jpg";

// import { IconContext } from "react-icons";
// import { RiFilePdf2Fill, RiFilePdfLine, RiFileWordLine } from "react-icons/ri";

// const socket = io(process.env.REACT_APP_SOCKET_URL);

// const UserMessage = ({ userId, onClose }) => {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userMessages, setUserMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   const messageListRef = useRef(null);

//   const token = localStorage.getItem("authToken");
//   const decodedToken = jwtDecode(token); // Corrected function call
//   const currentUserId = decodedToken._id;

//   const serverUrl = process.env.REACT_APP_SOCKET_URL;

//   useEffect(() => {
//     if (userId) {
//       fetchUserMessages(userId);
//     }
//   }, [userId]);

//   const fetchUserMessages = async (userId) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `${serverUrl}/api/vi/message/user-messages/${userId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Response data:", response.data); // Log the response data
//       if (response.data.message.length === 0) {
//         setUserMessages([]); // No messages found, set userMessages to an empty array
//       } else {
//         const messages = response.data.message.map((message) => ({
//           ...message,
//           senderName: message.sender.username,
//           senderAvatar:
//             message.sender._id === currentUserId ? userImg1 : defaultAvatar,
//           isCurrentUser: message.sender._id === currentUserId,
//         }));
//         console.log("Transformed messages:", messages); // Log the transformed messages
//         setUserMessages(messages);
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to fetch messages for the selected user.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     if (messageListRef.current) {
//       messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
//     }
//   };

//   const handleSendMessage = async () => {
//     if (newMessage.trim() === "" && !selectedFile) {
//       Swal.fire({
//         icon: "warning",
//         title: "Warning",
//         text: "Message content or file cannot be empty.",
//       });
//       return;
//     }

//     setIsLoading(true);

//     const data = new FormData();
//     data.append("userId", selectedUser._id);
//     data.append("content", newMessage);
//     data.append("senderId", currentUserId);
//     if (selectedFile) {
//       data.append("file", selectedFile);
//     }

//     try {
//       const response = await axios.post(
//         `${serverUrl}/api/v1/message/send-message-to-user/${selectedUser._id}`,
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       const newMessageObj = {
//         ...response.data.message,
//         sender: {
//           _id: currentUserId,
//           username: decodedToken.username,
//         },
//         senderName: decodedToken.username,
//         senderAvatar: userImg1,
//       };

//       setUserMessages((prevMessages) => [...prevMessages, newMessageObj]);
//       setNewMessage("");
//       setSelectedFile(null);
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to send the message.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleFileSelect = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   const handleFileDownload = (file) => {
//     const url = URL.createObjectURL(file);
//     window.open(url);
//   };

//   const handleRemoveFile = () => {
//     setSelectedFile(null);
//   };

//   const handleSearchInputChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const filteredMessages = userMessages.filter((message) =>
//     message.content.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div
//       style={{
//         display: "flex",
//         height: "82vh",
//         width: "65vh",
//         flexDirection: "column",
//         backgroundColor: "white",
//         padding: "10px",
//         border: "2px dashed #25628F",
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: "#25628F",
//           padding: "20px",
//           color: "#fff",
//           display: "flex",
//           alignItems: "center",
//           boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <h3 style={{ margin: "0", marginRight: "20px" }}>Users</h3>
//       </div>
//       <input
//         type="text"
//         value={searchQuery}
//         onChange={handleSearchInputChange}
//         style={{
//           margin: "10px 0",
//           padding: "10px",
//           borderRadius: "5px",
//           border: "1px solid #ccc",
//           width: "100%",
//         }}
//         placeholder="Search messages..."
//       />
//       <div style={{ flex: 1, position: "relative" }}>
//         {isLoading ? (
//           <div>Loading messages...</div>
//         ) : (
//           <Scrollbars
//             autoHide
//             autoHideTimeout={1000}
//             autoHideDuration={200}
//             style={{ maxHeight: "400px" }}
//             renderThumbVertical={({ style, ...props }) => (
//               <div
//                 {...props}
//                 style={{
//                   ...style,
//                   backgroundColor: "rgba(0,0,0,.3)",
//                   borderRadius: "3px",
//                   cursor: "pointer",
//                   position: "absolute",
//                   right: "2px",
//                   top: "2px",
//                   bottom: "2px",
//                   width: "5px",
//                   zIndex: "999",
//                 }}
//               />
//             )}
//           >
//             <div ref={messageListRef} style={{ marginBottom: "10px" }}>
//               {filteredMessages.map((message) => (
//                 <div
//                   key={message._id}
//                   style={{
//                     marginBottom: "10px",
//                     display: "flex",
//                     justifyContent: message.isCurrentUser
//                       ? "flex-end"
//                       : "flex-start",
//                   }}
//                 >
//                   <div
//                     style={{
//                       backgroundColor: message.isCurrentUser
//                         ? "#d1e7dd"
//                         : "#f8d7da",
//                       padding: "10px",
//                       borderRadius: "10px",
//                       textAlign: "left",
//                       boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//                       position: "relative",
//                     }}
//                   >
//                     <img
//                       src={message.senderAvatar}
//                       alt="User Avatar"
//                       style={{
//                         width: "30px",
//                         height: "30px",
//                         borderRadius: "50%",
//                         marginRight: "10px",
//                       }}
//                     />
//                     <strong>{message.senderName}</strong>
//                     <br />
//                     {message.content}
//                     <div style={{ fontSize: "0.8em", color: "#666" }}>
//                       {moment(message.createdAt).fromNow()}
//                     </div>
//                     {message.file && (
//                       <div
//                         style={{
//                           position: "absolute",
//                           bottom: "10px",
//                           right: "10px",
//                           display: "grid",
//                           gridTemplateColumns: "auto auto",
//                           gap: "5px",
//                         }}
//                       >
//                         <IconContext.Provider value={{ color: "#007bff" }}>
//                           {message.file.type === "application/pdf" ? (
//                             <RiFilePdf2Fill size={20} />
//                           ) : (
//                             <RiFileWordLine size={20} />
//                           )}
//                         </IconContext.Provider>
//                         <button
//                           onClick={() => handleFileDownload(message.file)}
//                           style={{
//                             border: "none",
//                             background: "none",
//                             color: "#007bff",
//                             cursor: "pointer",
//                           }}
//                         >
//                           {message.file.type === "application/pdf"
//                             ? "PDF File"
//                             : message.file.name}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Scrollbars>
//         )}

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginTop: "20px",
//             backgroundColor: "white",
//           }}
//         >
//           <FontAwesomeIcon
//             icon={faPaperclip}
//             onClick={() => document.getElementById("fileInput").click()}
//             style={{ cursor: "pointer", color: "#25628F" }}
//           />
//           <input
//             id="fileInput"
//             type="file"
//             style={{ display: "none" }}
//             onChange={handleFileSelect}
//           />
//           {selectedFile && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//               }}
//             >
//               <span>
//                 {selectedFile.type === "application/pdf"
//                   ? "PDF File"
//                   : selectedFile.name}
//               </span>
//               <FontAwesomeIcon
//                 icon={faTimesCircle}
//                 onClick={handleRemoveFile}
//                 style={{ cursor: "pointer", color: "#dc3545", marginLeft: 5 }}
//               />
//             </div>
//           )}
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             style={{
//               flex: 1,
//               padding: "10px",
//               borderRadius: "5px",
//               border: "1px solid #ccc",
//               margin: "0 10px",
//               backgroundColor: "#fff",
//               boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//               height: "40px",
//             }}
//             placeholder="Write your message..."
//           />
//           <FontAwesomeIcon
//             icon={faPaperPlane}
//             onClick={handleSendMessage}
//             style={{ cursor: "pointer", color: "#25628F" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserMessage;
