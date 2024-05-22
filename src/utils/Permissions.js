import { jwtDecode } from "jwt-decode";

const getUserRoles = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return [];

  try {
    const decodedToken = jwtDecode(token);
    const roles = decodedToken.role || [];

    // Ensure the roles variable is an array
    if (typeof roles === "string") {
      return [roles];
    } else if (Array.isArray(roles)) {
      return roles;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return [];
  }
};

const caseInsensitiveIncludes = (roles, roleToCheck) => {
  if (!Array.isArray(roles)) return false; // Ensure roles is an array
  return roles.some(
    (role) => role.trim().toLowerCase() === roleToCheck.toLowerCase()
  );
};

export const checkAdmin = () => {
  const roles = getUserRoles();
  return caseInsensitiveIncludes(roles, "admin");
};

export const checkInstructor = () => {
  const roles = getUserRoles();
  return caseInsensitiveIncludes(roles, "instructor");
};

export const checkStudent = () => {
  const roles = getUserRoles();
  return caseInsensitiveIncludes(roles, "student");
};

export default getUserRoles;
