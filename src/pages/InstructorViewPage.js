import React, { useState, useEffect } from "react";
import { Table, Spinner } from "react-bootstrap";
import axios from "axios";

const InstructorTable = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchInstructors();
  }, []);

  return (
    <div
      className="m-4 p-4"
      style={{ backgroundColor: "white", width: "97%", borderRadius: "5px" }}
    >
      <Table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </td>
            </tr>
          ) : instructors.length > 0 ? (
            instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td>{instructor.fullName}</td>
                <td>{instructor.username}</td>
                <td>{instructor.email}</td>
                <td>{instructor.phone}</td>
                <td>{instructor.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No instructors found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default InstructorTable;
