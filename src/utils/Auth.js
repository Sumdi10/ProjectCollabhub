import { jwtDecode } from "jwt-decode";

export function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return token !== null;
}

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getUserRoleFromToken = () => {
  const token = getAuthToken();
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  return null;
};
