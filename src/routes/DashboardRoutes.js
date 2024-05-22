import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import GroupPage from "../pages/GroupPage";
import ProjectPage from "../pages/ProjectPage";
import MembersPage from "../pages/MembersPage";
import InstructorPage from "../pages/InstrutorPage";
import ErrorPage from "../pages/ErrorPage";
import StudentProjectPage from "../pages/StudentProjectPage";
import ApprovalVerifyList from "../pages/StudentVerifyList";
import InstructorTable from "../pages/InstructorViewPage";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="groupPage" element={<GroupPage />} />
      <Route path="project" element={<ProjectPage />} />
      <Route path="studentProject" element={<StudentProjectPage />} />
      <Route path="ApprovalVerifyList" element={<ApprovalVerifyList />} />
      <Route path="InstructorView" element={<InstructorTable />} />
      <Route path="membersPage" element={<MembersPage />} />
      <Route path="instructorPage" element={<InstructorPage />} />
      <Route path="*" element={<ErrorPage />} />{" "}
      {/* Catch-all for unmatched routes */}
    </Routes>
  );
};

export default DashboardRoutes;
