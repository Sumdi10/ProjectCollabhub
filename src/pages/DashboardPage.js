import {
  faChalkboardTeacher,
  faLaptopCode,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Summary from "../components/Dashboard/Summary";
import DashboardCharts from "../components/Dashboard/DashboardCharts";
import GroupProgress from "../components/Dashboard/GroupProgress";
import EventCalendar from "../components/Dashboard/EventCalendar";
import { getAuthToken, getUserRoleFromToken } from "../utils/Auth";

const DashboardPage = () => {
  const [groupList, setGroupList] = useState([]);
  const [events, setEvents] = useState([]);
  const [groupCount, setGroupCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [instructorCount, setInstructorCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    fetchGroupList();
  }, []);

  const fetchGroupList = async () => {
    const token = localStorage.getItem("authToken");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken._id;

    try {
      if (!token) {
        console.error("No token found.");
        return;
      }

      const userRole = getUserRoleFromToken(token);

      if (!userRole) {
        console.error("No role found in the token.");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let filteredGroups;

      if (userRole === "admin") {
        filteredGroups = response.data.message;
      } else if (userRole === "student" || userRole === "instructor") {
        filteredGroups = response.data.message.filter((group) => {
          if (userRole === "student") {
            return group.students.some((student) => student._id === userId);
          } else {
            return group.instructor._id === userId;
          }
        });
      }

      const fetchMessagesForGroups = async (set) => {
        const updatedGroupsWithMessages = await Promise.all(
          filteredGroups.map(async (group) => {
            try {
              const token = localStorage.getItem("authToken"); // Get token from local storage
              const config = {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              };

              const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/group/groups/${group._id}/messages`,
                config
              );

              const messages = response.data.message.messages;
              const lastMessage =
                messages.length > 0
                  ? messages[messages.length - 1].content
                  : null;

              return { ...group, lastMessage: lastMessage || null };
            } catch (error) {
              console.error("Error fetching messages for group:", error);
              return { ...group, lastMessage: null };
            }
          })
        );

        set(updatedGroupsWithMessages); // Use the set function to update the state
      };

      fetchMessagesForGroups(setGroupList); // Pass setGroupList function as an argument

      // Set counts
      setGroupCount(filteredGroups.length);
      setStudentCount(
        filteredGroups.reduce(
          (total, group) => total + group.students.length,
          0
        )
      );
      setInstructorCount(
        new Set(filteredGroups.map((group) => group.instructor._id)).size
      );
      setProjectCount(
        filteredGroups.reduce(
          (total, group) => total + group.projects.length,
          0
        )
      );
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the group list.",
      });
    }
  };

  const displayIcons = (idx) => {
    switch (idx) {
      case 0:
        return faUsers;
      case 1:
        return faChalkboardTeacher;
      case 2:
        return faLaptopCode;
      default:
        return faUser;
    }
  };

  // Static data for group progress
  const groupProgressData = [
    {
      groupName: "Group A",
      progress: "75%",
    },
    {
      groupName: "Group B",
      progress: "50%",
    },
    {
      groupName: "Group C",
      progress: "90%",
    },
    {
      groupName: "Group D",
      progress: "60%",
    },
  ];

  // Static data for events
  const eventsData = [
    {
      title: "Group A Project Discussion",
      date: "2015-02-10T10:12:50.500Z",
    },
    {
      title: "Group A Project Submission Deadline",
      date: "2015-02-10T10:12:50.500Z",
    },
    {
      title: "Semi Annual Meeting and Project Discussion",
      date: "2015-02-10T10:12:50.500Z",
    },
  ];

  return (
    <div className="container-fluid customMargin">
      <Summary
        displayIcons={displayIcons}
        summary={[
          { name: "Groups", count: groupCount },
          { name: "Students", count: studentCount },
          { name: "Instructors", count: instructorCount },
        ]}
      />
      <DashboardCharts />
      <div className="row" style={{ marginBottom: "1.5rem" }}>
        <div className="col-md-6">
          <GroupProgress groupProgress={groupProgressData} />
        </div>
        <div className="col-md-6">
          <EventCalendar events={eventsData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
