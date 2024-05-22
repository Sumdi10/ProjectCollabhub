import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { getUserRoleFromToken } from "../../utils/Auth";
import Swal from "sweetalert2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: [],
  datasets: [
    {
      label: "# of Votes",
      data: [35, 35, 30],
      backgroundColor: ["#25628f", "#f36d38", "#13deb9"],
    },
  ],
};

const labels = ["Mon", "Tues", "Wed", "Thu ", "Fri", "Sat", "Sun"];

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      align: "start",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 50,
      },
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
};

const lineData = {
  labels,
  datasets: [
    {
      label: "Active",
      data: [1000, 1500, 2000, 1800, 1500, 2000, 2200],
      borderColor: "#2dbfcd",
      backgroundColor: "#2dbfcd",
      tension: 0.3,
    },
    {
      label: "Passive",
      data: [500, 1300, 2500, 2200, 3000, 2500, 2800],
      borderColor: "#f36d38",
      backgroundColor: "#f36d38",
      tension: 0.3,
    },
  ],
};

const DashboardCharts = () => {
  const [duration, setDuration] = useState("thisWeek");
  // const [totalProjects, setTotalProjects] = useState(660);
  const [projectCount, setProjectCount] = useState(0);

  const fetchProjectCount = async () => {
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

      const projectCount = filteredGroups.reduce(
        (total, group) => total + group.projects.length,
        0
      );

      setProjectCount(projectCount);
    } catch (error) {
      console.error("Error fetching project count:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching the project count.",
      });
    }
  };

  // Call the function
  fetchProjectCount();

  const handleDurationChange = (e) => {
    let { value } = e.target;
    setDuration(value);
    //reload chart data on changing this value
  };

  return (
    <div className="row" style={{ marginBottom: "1.5rem" }}>
      <div className="col-md-4">
        <div className="dataContainerBox">
          <p className="contentTitle mb-0">Yearly Updates</p>
          <p className="contentSubtitle">Total Projects</p>
          <div className="position-relative" style={{ padding: "0.5rem 5rem" }}>
            <Doughnut
              data={data}
              options={{
                cutout: "90%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      pointStyle: "circle",
                      padding: 40,
                    },
                  },
                },
              }}
            />
            <div className="chartTitle" style={{}}>
              <p>
                Projects
                <br />
                {projectCount}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-8">
        <div className="dataContainerBox">
          <div className="d-flex justify-content-between">
            <div>
              <p className="contentTitle mb-0">Performance</p>
              <p className="contentSubtitle mb-0">Overview</p>
            </div>
            <div>
              <select
                name="duration"
                value={duration}
                className="form-select"
                onChange={handleDurationChange}
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
          </div>
          <Line data={lineData} options={lineOptions} height={"100%"} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
