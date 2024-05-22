import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown, Form, Row, Col, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import AppButton from "../AppButton";

const GroupAddModal = (props) => {
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [groupStudent, setGroupStudent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    if (props.edit) {
      configureEditData();
    }
  }, [props.edit]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`
      );
      const users = response.data.message || [];
      if (Array.isArray(users)) {
        setInstructors(users.filter((user) => user.role === "instructor"));
        setStudents(users.filter((user) => user.role === "student"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/project/Projects`
      );
      const projectsData = response.data || [];
      if (Array.isArray(projectsData)) {
        setAvailableProjects(projectsData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const configureEditData = () => {
    const editData = props.editData || {};
    setName(editData.name || "");
    setInstructor(editData.instructor?._id || "");
    setGroupStudent(editData.students?.map((s) => s._id) || []);
    setProjects(editData.projects?.map((p) => p._id) || []);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Group name is required.";
    }
    if (!instructor) {
      newErrors.instructor = "Instructor selection is required.";
    }
    if (!groupStudent) {
      newErrors.groupStudent = "At least one student must be selected.";
    }
    if (!projects) {
      newErrors.projects = "At least one project must be selected.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (groupStudent.length === 0) {
      Swal.fire("Error", "At least one student must be selected.", "error");
      return;
    }

    // Check if at least one project is selected
    if (projects.length === 0) {
      Swal.fire("Error", "At least one project must be selected.", "error");
      return;
    }

    const groupData = {
      name,
      instructor,
      students: groupStudent,
      projects,
    };

    const token = localStorage.getItem("authToken");

    try {
      let response;
      if (props.edit && props.editData && props.editData._id) {
        response = await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/group/groups/${props.editData._id}`,
          groupData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
          groupData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.status >= 200 && response.status < 300) {
        Swal.fire(
          "Success",
          props.edit
            ? "Group updated successfully!"
            : "Group created successfully!",
          "success"
        );
        props.toggleModal();
        props.onGroupAdded();
      } else {
        throw new Error("Unexpected status code");
      }
    } catch (error) {
      console.error("Error creating or updating group:", error);

      const errorMsg =
        error.response?.data?.message || "Unknown error occurred.";
      Swal.fire("Error", `Group operation failed: ${errorMsg}`, "error");
    }
  };

  const isGroupNameUnique = async (groupName, token) => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_BASE_URL
        }/group/groups?name=${encodeURIComponent(groupName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.length === 0;
    } catch (error) {
      console.error("Error checking group name uniqueness:", error);
      return false;
    }
  };

  return (
    <div className="container-fluid">
      <h2>{props.edit ? "Update Group" : "Create Group"}</h2>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Group Name</strong>
        </Col>
        <Col md={9}>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Enter group name"
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Instructor</strong>
        </Col>
        <Col md={9}>
          <select
            name="instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className={`form-select ${errors.instructor ? "is-invalid" : ""}`}
            required
          >
            <option value="" disabled>
              Choose Instructor
            </option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.username}
              </option>
            ))}
          </select>
          {errors.instructor && (
            <div className="invalid-feedback">{errors.instructor}</div>
          )}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Students</strong>
        </Col>
        <Col md={9}>
          <Dropdown>
            <Dropdown.Toggle
              className="w-100 text-bg-light"
              variant="info"
              id="dropdown-basic"
              required
            >
              {groupStudent.length > 0
                ? `Selected: ${groupStudent.length}`
                : "Select Group Student"}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-100"
              style={{ backgroundColor: "white", padding: "20px" }}
            >
              {students.map((student) => (
                <Form.Check
                  type="switch"
                  label={student.username}
                  key={student._id}
                  checked={groupStudent.includes(student._id)}
                  onChange={() => {
                    if (groupStudent.includes(student._id)) {
                      setGroupStudent(
                        groupStudent.filter((s) => s !== student._id)
                      );
                    } else {
                      setGroupStudent([...groupStudent, student._id]);
                    }
                  }}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
          {errors.groupStudent && (
            <div className="invalid-feedback">{errors.groupStudent}</div>
          )}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <strong>Projects</strong>
        </Col>
        <Col md={9}>
          <Dropdown>
            <Dropdown.Toggle
              className="w-100 text-bg-light"
              variant="info"
              id="dropdown-basic"
              required
            >
              {projects.length > 0
                ? `Selected: ${projects.length}`
                : "Select Projects"}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-100"
              style={{ backgroundColor: "white", padding: "20px" }}
            >
              {availableProjects.map((project) => (
                <Form.Check
                  type="switch"
                  label={project.title}
                  key={project._id}
                  checked={projects.includes(project._id)}
                  onChange={() => {
                    if (projects.includes(project._id)) {
                      setProjects(projects.filter((p) => p !== project._id));
                    } else {
                      setProjects([...projects, project._id]);
                    }
                  }}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
          {errors.projects && (
            <div className="invalid-feedback">{errors.projects}</div>
          )}
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <AppButton
          style={{ backgroundColor: "#FFA500", color: "white" }}
          name={props.edit ? "Update" : "Create"}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

export default GroupAddModal;
