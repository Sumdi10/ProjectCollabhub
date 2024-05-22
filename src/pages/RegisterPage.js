import React, { Component } from "react";
import axios from "axios";
import koiLogo from "../assets/images/koiLogo.png";
import AppButton from "../components/AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt, faKey, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import Swal from "sweetalert2";
import History from "../utils/History";
import { WithRouter } from "../utils/WithRouter";

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      studentId: "",
      username: "",
      fullName: "",
      password: "",
      showPassword: false,
      isLoading: false,
    };

    this.axiosInstance = axios.create({
      baseURL:
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api/v1",
    });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleShowPassword = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  isValidUsername = (username) => username.length >= 5;

  isValidFullName = (fullName) => fullName.trim().length > 0;

  isValidPassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasSpecialChar
    );
  };

  getFriendlyErrorMessage = (errorData) => {
    if (typeof errorData !== "string") {
      return "An unexpected error occurred.";
    }

    if (errorData.includes("Username already exists")) {
      return "Username already exists. Please choose another.";
    }

    if (errorData.includes("Student ID already exists")) {
      return "Student ID already exists. Please use a different ID.";
    }

    return "An unexpected error occurred.";
  };

  handleRegister = async () => {
    const { studentId, username, fullName, password } = this.state;

    if (!studentId || !username || !fullName || !password) {
      Swal.fire({
        title: "Error!",
        text: "All fields are required.",
        icon: "error",
      });
      return;
    }

    if (!this.isValidUsername(username)) {
      Swal.fire({
        title: "Error!",
        text: "Username must be at least 5 characters long.",
        icon: "error",
      });
      return;
    }

    if (!this.isValidFullName(fullName)) {
      Swal.fire({
        title: "Error!",
        text: "Full name cannot be empty.",
        icon: "error",
      });
      return;
    }

    if (!this.isValidPassword(password)) {
      Swal.fire({
        title: "Error!",
        text: "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.",
        icon: "error",
      });
      return;
    }

    this.setState({ isLoading: true });

    try {
      await this.axiosInstance.post("/users/register", {
        studentId,
        username,
        fullName,
        password,
        role: "student",
      });

      Swal.fire({
        title: "Success!",
        text: "Registration successful!",
        icon: "success",
      });

      History.push(`${process.env.PUBLIC_URL}/`);
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";

      if (error.response && error.response.data) {
        errorMessage = this.getFriendlyErrorMessage(error.response.data);
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleLogin = () => {
    History.push(`${process.env.PUBLIC_URL}/login`);
  };

  render() {
    const { isLoading, showPassword } = this.state;

    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", flexDirection: "column" }}
      >
        <div className="loginDiv">
          <img src={koiLogo} className="img-fluid" alt="Logo" />
          <div className="mt-4">
            <div className="position-relative">
              <FontAwesomeIcon icon={faIdCard} className="loginIcon" />
              <input
                type="text"
                className="form-input"
                name="studentId"
                placeholder="Student ID"
                onChange={this.handleChange}
              />
            </div>

            <div className="position-relative">
              <FontAwesomeIcon icon={faUserAlt} className="loginIcon" />
              <input
                type="text"
                className="form-input"
                name="fullName"
                placeholder="Full Name"
                onChange={this.handleChange}
              />
            </div>

            <div className="position-relative">
              <FontAwesomeIcon icon={faUserAlt} className="loginIcon" />
              <input
                type="text"
                className="form-input"
                name="username"
                placeholder="Username"
                onChange={this.handleChange}
              />
            </div>

            <div className="position-relative">
              <FontAwesomeIcon icon={faKey} className="loginIcon" />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                name="password"
                placeholder="Password"
                onChange={this.handleChange}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="pswIcon"
                onClick={this.handleShowPassword}
              />
            </div>
          </div>

          <div className="m-3 d-flex justify-content-center gap-3">
            <AppButton
              name="Register"
              onClick={this.handleRegister}
              disabled={isLoading}
            />
            <AppButton
              name="Login"
              onClick={this.handleLogin}
              disabled={isLoading}
            />
          </div>

          {isLoading && <div>Loading...</div>}
        </div>
      </div>
    );
  }
}

export default WithRouter(RegisterPage);
