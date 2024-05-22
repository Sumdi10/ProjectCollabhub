import React, { useState, useEffect } from "react";
import { Container, Table, Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { getAuthToken, getUserRoleFromToken } from "../utils/Auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import AppButton from "../components/AppButton";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const userRole = getUserRoleFromToken();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error("No token found.");
        return;
      }

      let projectResponse;

      if (userRole === "admin") {
        projectResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/project/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const groupResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/group/groups`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userId = jwtDecode(token)._id;

        const userGroups = groupResponse.data.message.filter((group) => {
          if (userRole === "student") {
            return group.students.some((student) => student._id === userId);
          } else {
            return group.instructor._id === userId;
          }
        });

        const projectIds = userGroups.flatMap((group) =>
          group.projects.map((project) => project._id)
        );

        projectResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/project/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredProjects = projectResponse.data.filter((project) =>
          projectIds.includes(project._id)
        );

        projectResponse.data = filteredProjects;
      }

      if (projectResponse.data.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Projects",
          text: "No projects were found.",
        });
      }

      setProjects(projectResponse.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`/api/v1/project/deleteProjects/${projectId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const toggleModal = () => {
    setEditData(null); // Reset editData when toggling the modal
    setShowModal(!showModal);
  };

  const handleEdit = (project) => {
    setEditData(project); // Set editData when editing a project
    setShowModal(true);
  };

  const handleSubmit = async (project) => {
    const endpoint = editData
      ? `/api/v1/project/updateProjects/${editData._id}`
      : "/api/v1/project/addProjects";

    const method = editData ? "PATCH" : "POST";

    try {
      await axios({
        method,
        url: endpoint,
        data: project,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      fetchProjects(); // Refresh the project list after saving
      toggleModal(); // Close the modal
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <Container
      className="p-4"
      style={{
        backgroundColor: "white",
        width: "97%",
        borderRadius: "5px",
      }}
    >
      {userRole !== "student" && (
        <div className="mb-3">
          <AppButton
            name="Add Project"
            customStyle="addBtnColor"
            icon={faPlus}
            onClick={toggleModal}
          />
        </div>
      )}

      <Table className="table customTable">
        <thead>
          <tr>
            <th>Project Title</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            {!["student"].includes(userRole) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody className="tableData">
          {loading && (
            <tr>
              <td colSpan={6}>
                <p
                  style={{
                    textAlign: "center",
                    color: "#817878",
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  Loading...
                </p>
              </td>
            </tr>
          )}

          {projects.map((project) => (
            <tr key={project._id}>
              <td className="tableData">{project.title}</td>
              <td>
                <p style={{ margin: 0, maxWidth: "250px" }}>
                  {project.description}
                </p>
              </td>
              <td>{new Date(project.startDate).toLocaleDateString()}</td>
              <td>{new Date(project.endDate).toLocaleDateString()}</td>
              <td>{project.status}</td>
              {!["student"].includes(userRole) && (
                <td className="d-flex">
                  <Button
                    variant="link"
                    onClick={() => handleEdit(project)}
                    className="mr-2"
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{ color: "orange" }}
                    />
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => handleDelete(project._id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ color: "red" }}
                    />
                  </Button>
                </td>
              )}
            </tr>
          ))}

          {!projects.length && !loading && (
            <tr>
              <td colSpan={6}>
                <p
                  style={{
                    textAlign: "center",
                    color: "#817878",
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  No projects available
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Project" : "Add Project"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProjectForm
            initialData={editData}
            onSubmit={handleSubmit}
            onClose={toggleModal}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

const ProjectForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    status: initialData?.status || "Pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Form className="container-fluid">
      <Form.Group>
        <Form.Label>Project Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label className="col-md-9">Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label className="col-md-3 mt-1">Start Date</Form.Label>
        <Form.Control
          type="date"
          name="startDate"
          value={
            formData.startDate
              ? new Date(formData.startDate).toISOString().substr(0, 10)
              : ""
          }
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label className="col-md-3 mt-1">End Date</Form.Label>
        <Form.Control
          type="date"
          name="endDate"
          value={
            formData.endDate
              ? new Date(formData.endDate).toISOString().substr(0, 10)
              : ""
          }
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label className="col-md-3 mt-1">Status</Form.Label>
        <Form.Control
          as="select"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </Form.Control>
      </Form.Group>
      <div className="text-center mt-4">
        <Button
          style={{
            borderRadius: "5px",
            border: "0",
            backgroundColor: "#2DBFCD",
            marginRight: "5px",
          }}
          variant="primary"
          onClick={handleFormSubmit}
        >
          Submit
        </Button>
        <Button
          style={{
            borderRadius: "5px",
            border: "0",
          }}
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Form>
  );
};

export default ProjectPage;
