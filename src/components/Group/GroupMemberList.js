import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { getUserRoleFromToken } from "../../utils/Auth";

const GroupDetailsWithDropdown = () => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroupList = async () => {
    const token = localStorage.getItem("authToken");
    const decodedToken = jwtDecode(token); // Correct jwtDecode usage
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
            const comparisonResult = group.instructor._id === userId;
            return comparisonResult;
          }
        });
      }

      setGroupList(filteredGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the group list.",
      });
    }
  };

  const fetchGroupDetails = async (groupId) => {
    const serverUrl = process.env.REACT_APP_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/group/groups/${groupId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupDetails(response.data.message);
    } catch (error) {
      console.error("Error fetching group details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching group details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupList();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);
  useEffect(() => {
    if (groupList.length > 0) {
      setSelectedGroup(groupList[0]._id);
    }
  }, [groupList]);

  return (
    <div
      style={{ padding: "20px", backgroundColor: "#fff" }}
      className="dataContainerBox"
    >
      <div>
        <h2 style={{ marginBottom: "20px" }}>
          {groupList.length === 1
            ? "View Group Details"
            : "Select a Group to View Details"}
        </h2>
        {groupList.length > 1 && (
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "20px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
            }}
          >
            {groupList.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
        {groupList.length === 1 && (
          <div>
            <h3>{groupList[0].name}</h3>
            <p>Instructor: {groupList[0].instructor.username}</p>
            <p>Project: {groupList[0].projects[0].title}</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ fontSize: "1.2em" }}>Loading group details...</div>
      )}

      {groupDetails && (
        <div>
          <h3>Group: {groupDetails.name}</h3>
          <p>Instructor: {groupDetails.instructor?.username || "N/A"}</p>

          <h4>Members</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "center",
                  backgroundColor: "#eaeaea",
                  fontWeight: "bold",
                }}
              >
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Member Name
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Student ID
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {groupDetails.students.length > 0 ? (
                groupDetails.students.map((student) => (
                  <tr key={student._id} style={{ textAlign: "center" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {student.fullName || student.username}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {student.studentId}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        color: student.isApproved ? "green" : "red",
                      }}
                    >
                      {student.isApproved ? "Approved" : "Not Approved"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsWithDropdown;
