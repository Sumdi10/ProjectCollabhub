import React, { useEffect, useState } from "react";
import { getAuthToken } from "../utils/Auth";

const StudentProjectPage = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/v1/project/Projects", {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjectList(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dataContainerBox">
      <table className="table customTable mt-3">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Project Title</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projectList.length > 0 ? (
            projectList.map((project, index) => (
              <tr key={project._id}>
                <td>{index + 1}</td>
                <td>{project.title}</td>
                <td>{project.description}</td>
                <td>{new Date(project.startDate).toLocaleDateString()}</td>
                <td>{new Date(project.endDate).toLocaleDateString()}</td>
                <td>{project.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No Projects found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentProjectPage;
