import React, { useState, useEffect } from "react";
import axios from "axios";
import AppButton from "../AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import ModalWindow from "../../utils/ModalWindow";
import GroupAddModal from "./GroupAddModal";
import Swal from "sweetalert2";
import Switch from "react-switch";
import { jwtDecode } from "jwt-decode";
import { getUserRoleFromToken } from "../../utils/Auth";

const getAuthToken = () => localStorage.getItem("authToken");

const GroupList = () => {
  const [groupList, setGroupList] = useState([]);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupList();
    const token = getAuthToken();
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role || "user");
    }
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

      setLoading(false);

      let filteredGroups;

      if (userRole === "admin") {
        filteredGroups = response.data.message;
      } else {
        filteredGroups = response.data.message.filter((group) => {
          if (userRole === "student") {
            return group.students.some((student) => student._id === userId);
          } else {
            return group.instructor._id === userId;
          }
        });
      }

      const groupsWithLastMessage = await Promise.all(
        filteredGroups.map(async (group) => {
          try {
            const messageResponse = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/message/group-messages/${group._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const messages = messageResponse.data.messages;

            const lastMessage = messages.length
              ? messages[messages.length - 1].content
              : "Conversation not started";

            return {
              ...group,
              lastMessage,
            };
          } catch (error) {
            return {
              ...group,
              lastMessage: "Error fetching last message",
            };
          }
        })
      );

      setGroupList(groupsWithLastMessage);
      // Set the filtered groups with last message
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the group list.",
      });
    }
  };

  const toggleAddGroupModal = () => {
    if (userRole !== "student") {
      setAddGroupModal(!addGroupModal);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Forbidden",
        text: "You do not have permission to edit this group.",
      });
    }
  };

  const toggleAtRiskStatus = async (groupId, currentAtRisk) => {
    const newAtRiskStatus = !currentAtRisk;
    const token = getAuthToken();

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${groupId}/flag-at-risk`,
        { atRisk: newAtRiskStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedGroupList = groupList.map((group) => {
          if (group._id === groupId) {
            // If the group ID matches, update the group's atRisk status
            return {
              ...group,
              atRisk: newAtRiskStatus,
              // Update the group's notification to include the group details
              notification: {
                ...group.notification,
                groupId: group._id,
                groupDetails: response.data.groupDetails,
              },
            };
          }
          return group;
        });

        setGroupList(updatedGroupList);

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: "The group's 'at risk' status has been updated!",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "Forbidden",
          text: "You do not have permission to change the 'at risk' status.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the 'at risk' status.",
        });
      }
    }
  };

  const addGroup = async (groupData) => {
    const token = getAuthToken();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/group/group`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setGroupList([...groupList, response.data.message]);
        toggleAddGroupModal();
      }
    } catch (error) {
      console.error("Error adding group:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the group.",
      });
    }
  };

  const editGroup = (group) => {
    if (userRole !== "student") {
      setEdit(true);
      setEditData(group);
      setAddGroupModal(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Forbidden",
        text: "You do not have permission to edit this group.",
      });
    }
  };

  const handleEditGroup = async (groupData) => {
    const token = getAuthToken();
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${editData._id}`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response && response.status === 200) {
        const updatedGroupList = groupList.map((group) =>
          group._id === editData._id ? { ...response.data.message } : group
        );
        setGroupList(updatedGroupList);

        toggleAddGroupModal();

        Swal.fire({
          icon: "success",
          title: "Group Updated",
          text: "The group has been updated successfully!",
        });
      } else {
        console.error("Unexpected response or status:", response);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unexpected response from server.",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      Swal.fire({
        icon: "error",
        text: "An error occurred while updating the group.",
      });
    }
  };

  const deleteGroup = async (groupId) => {
    const token = getAuthToken();
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/group/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setGroupList(groupList.filter((group) => group._id !== groupId));

        Swal.fire({
          icon: "success",
          title: "Group Deleted",
          text: "The group has been deleted successfully!",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "Forbidden",
          text: "You do not have permission to change the 'at risk' status.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the 'at risk' status.",
        });
      }
    }
  };

  return (
    <div className="dataContainerBox">
      {userRole !== "student" && (
        <div className="mb-3">
          <AppButton
            name="Add Group"
            customStyle="addBtnColor"
            icon={faPlus}
            onClick={toggleAddGroupModal}
          />
        </div>
      )}
      <table className="table customTable">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Instructor</th>
            <th>Students</th>
            <th>Projects</th>
            <th>Last Message</th>
            <th>Raise A Flag</th>
            {userRole !== "student" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {!loading && groupList.length > 0 ? (
            groupList.map((group) => (
              <tr key={group._id}>
                <td>{group.name}</td>
                <td>{group.instructor ? group.instructor.username : "N/A"}</td>
                <td>
                  <span>{group.students.length}</span>
                </td>
                <td>
                  {group.projects.map((project) => project.title).join(", ")}
                </td>
                <td>
                  {/* Render the last message here */}
                  {group.lastMessage ? group.lastMessage : "Attachment sent"}
                </td>
                <td>
                  <Switch
                    onChange={() => toggleAtRiskStatus(group._id, group.atRisk)}
                    checked={group.atRisk}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.5)"
                    offColor="#2DBFCD"
                    onColor="#FFA500"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={18}
                    width={36}
                    disabled={userRole === "student"}
                  />
                </td>

                {userRole !== "student" && (
                  <td>
                    <div className="flex justify-center">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="actionIcons editIcon cursor-pointer"
                        onClick={() => editGroup(group)}
                        style={{
                          paddingRight: "2rem",
                          borderRight: "1px solid #ccc",
                          marginBottom: "1rem",
                          "@media (maxWidth: 768px)": {
                            fontSize: "1.5rem",
                          },
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        className="actionIcons deleteIcon cursor-pointer pl-2"
                        onClick={() => deleteGroup(group._id)}
                        style={{
                          paddingLeft: "2rem",
                          marginBottom: "1rem",
                          "@media (maxWidth: 768px)": {
                            fontSize: "1.5rem",
                          },
                        }}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center">
                {loading ? "Loading..." : "No groups found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ModalWindow
        modal={addGroupModal}
        toggleModal={toggleAddGroupModal}
        modalHeader={edit ? "Edit Group" : "Add Group"}
        size="lg"
        modalBody={
          <GroupAddModal
            edit={edit}
            editData={editData}
            toggleModal={toggleAddGroupModal}
            onSubmit={edit ? handleEditGroup : addGroup}
            onGroupAdded={fetchGroupList}
          />
        }
      />
    </div>
  );
};

export default GroupList;
