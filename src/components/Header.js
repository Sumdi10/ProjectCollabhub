import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import NotificationPanel from "./NotificationPanel";
import { jwtDecode } from "jwt-decode"; // Corrected import
import getUserRoles from "../utils/Permissions";
import userImg from "../assets/images/userImg.jpg";

class Header extends Component {
  state = {
    username: "",
    userRoles: [],
    unreadNotificationCount: 0,
  };

  componentDidMount() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const username = decodedToken.username || "User";
        const userRoles = getUserRoles();
        this.setState({ username, userRoles });
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }

  handleNotificationCountUpdate = (count) => {
    this.setState({ unreadNotificationCount: count });
  };

  handleNotificationClick = () => {
    const panel = document.getElementById("nPanel");
    if (panel) {
      panel.classList.toggle("panelHeight");
    }
  };

  render() {
    const { toggleSidebar } = this.props;
    const { username, userRoles, unreadNotificationCount } = this.state;

    const userType = userRoles.length > 0 ? userRoles[0] : "User";

    return (
      <header className="headerDiv">
        <FontAwesomeIcon
          icon={faBars}
          className="sidebarToggle"
          onClick={toggleSidebar}
        />

        <div className="emptyDiv"></div>
        <div className="userInfoDiv">
          {/* <FontAwesomeIcon icon={faEnvelope} className="mailIcon" /> */}
          <div
            className="position-relative"
            style={{ cursor: "pointer" }}
            onClick={this.handleNotificationClick}
          >
            <FontAwesomeIcon icon={faBell} className="bellIcon" />
            <span className="badge headerBadge">{unreadNotificationCount}</span>
            <div className="notificationPanel" id="nPanel">
              <NotificationPanel
                onUpdateNotificationCount={this.handleNotificationCountUpdate}
              />
            </div>
          </div>
          <div
            className="d-flex align-items-center"
            style={{ margin: "0 10px" }}
          >
            <img src={userImg} className="userImage" alt="User" />
            <div className="ms-3">
              <p className="userLabel">{username}</p>
              <p className="userType">{userType}</p>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
