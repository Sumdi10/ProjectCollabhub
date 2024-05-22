import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Spinner,
  Modal,
  Form,
  Container,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { getAuthToken } from "../utils/Auth";
import AppButton from "../components/AppButton";

const InstructorPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const toggleModal = () => {
    setShowModal((prevShow) => !prevShow);
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/users`
      );
      const data = response.data.message;

      if (Array.isArray(data)) {
        // Filter only instructors
        const instructorData = data.filter(
          (instructor) => instructor.role === "instructor"
        );
        setInstructors(instructorData);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstructor = async () => {
    const newInstructor = {
      ...formData,
      role: "instructor",
      isApproved: true,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/register`,
        newInstructor
      );
      fetchInstructors();
      Swal.fire("Success", "Instructor added successfully.", "success");
      setFormData({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
      }); // Reset the form
      toggleModal(); // Close the modal
    } catch (error) {
      Swal.fire(
        "Error",
        `Error adding instructor: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  };

  const handleDelete = async (instructorId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/users/users-delete/${instructorId}`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setInstructors((prevInstructors) =>
        prevInstructors.filter((i) => i._id !== instructorId)
      );
      Swal.fire("Success", "Instructor deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        `Error deleting instructor: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <>
      <Container
        className="p-4"
        style={{
          backgroundColor: "white",
          width: "97%",
          borderRadius: "5px",
        }}
      >
        <div className="mb-3">
          <AppButton
            name="Add Instructor"
            customStyle="addBtnColor"
            icon={faPlus}
            onClick={toggleModal}
          />
        </div>

        <Table className="table customTable">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div>Loading...</div>
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor._id}>
                  <td>{instructor.fullName}</td>
                  <td>{instructor.username}</td>
                  <td>{instructor.email}</td>
                  <td>{instructor.phone}</td>
                  <td>{instructor.role}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => handleDelete(instructor._id)}
                    >
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        style={{ color: "red" }}
                      />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => handleFormChange("username", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => handleFormChange("password", e.target.value)}
              />
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
                onClick={handleAddInstructor}
              >
                Add Instructor
              </Button>

              <Button
                style={{
                  borderRadius: "5px",
                  border: "0",
                  backgroundColor: "#FFA500",
                }}
                variant="secondary"
                onClick={toggleModal}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InstructorPage;
