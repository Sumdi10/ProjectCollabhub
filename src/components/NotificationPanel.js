import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faEnvelope,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./ModalNotification";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const NotificationPanel = ({
  onUpdateNotificationCount,
  notificationCount,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const decodedToken = jwtDecode(authToken);
        const currentUserId = decodedToken._id;

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/notification/notification`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const notificationsWithRole = await Promise.all(
          response.data.notifications.map(async (notification) => {
            const senderRole = await fetchSenderRole(notification.sender);
            return { ...notification, senderRole };
          })
        );

        const filteredNotifications = notificationsWithRole.filter(
          (notification) => {
            const userIsInGroup =
              notification.groupDetails &&
              ((notification.groupDetails.students &&
                notification.groupDetails.students.some(
                  (student) => student._id === currentUserId
                )) ||
                !notification.groupDetails.instructor ||
                notification.groupDetails.instructor._id === currentUserId);

            const isReceiver = notification.receiver === currentUserId;

            return userIsInGroup || isReceiver;
          }
        );

        setNotifications(filteredNotifications);
        onUpdateNotificationCount(filteredNotifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchData();

    const socket = io();

    socket.on("newNotification", (notification) => {
      const authToken = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(authToken);
      const currentUserId = decodedToken._id;
      if (
        (notification.groupDetails &&
          ((notification.groupDetails.students &&
            notification.groupDetails.students.some(
              (student) => student._id === currentUserId
            )) ||
            !notification.groupDetails.instructor ||
            notification.groupDetails.instructor._id === currentUserId)) ||
        notification.receiver === currentUserId
      ) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          notification,
        ]);

        onUpdateNotificationCount((prevCount) => prevCount + 1);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdateNotificationCount]);

  const fetchSenderRole = async (senderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/role/${senderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.role;
    } catch (error) {
      console.error("Error fetching sender's role:", error);
      return "Unknown";
    }
  };

  const handleNotificationClick = async (index, notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    markNotificationAsRead(index);

    try {
      const authToken = localStorage.getItem("authToken");

      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/notification/delete-notification/${notification._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const updatedNotifications = [...notifications];
      updatedNotifications.splice(index, 1);
      setNotifications(updatedNotifications);
      onUpdateNotificationCount(updatedNotifications.length);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markNotificationAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    onUpdateNotificationCount(updatedNotifications.length);
  };

  const renderIcon = (type) => {
    switch (type) {
      case "at-risk":
        return <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />;
      case "message":
        return <FontAwesomeIcon icon={faEnvelope} color="blue" />;
      default:
        return <FontAwesomeIcon icon={faBell} />;
    }
  };

  return (
    <div className="notificationPanelBody">
      <div className="notificationHeader">
        <FontAwesomeIcon icon={faBell} />
        {notificationCount > 0 && (
          <span className="notificationCount">{notificationCount}</span>
        )}
      </div>
      <div className="notificationBody">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={notification._id}
              className="notificationItem"
              onClick={() => handleNotificationClick(index, notification)}
            >
              {notification.type === "general" ? (
                <FontAwesomeIcon icon={faBell} />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />
              )}

              <div className="notificationText">
                <strong>{notification.message}</strong>
                <div className="notificationRole">
                  Sender {notification.senderRole}
                </div>
                <div className="notificationDate">
                  {new Date(notification.date).toDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="noNotifications">No notifications</div>
        )}
      </div>
      <div className="notificationFooter ">
        <Link to="/notifications">See all</Link>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedNotification ? (
          <div>
            <h3>Notification Details</h3>
            <p>{selectedNotification.message}</p>
            <p>Date: {new Date(selectedNotification.date).toDateString()}</p>
          </div>
        ) : (
          <p>No details available</p>
        )}
      </Modal>
    </div>
  );
};

export default NotificationPanel;
