

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import EddalLogo from "../../../assets/images/Eddal Logo.webp";
import Ekt1Logo from "../../../assets/images/ekt1.png";
import IITPLLogo from "../../../assets/images/iitpl_logo.png";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../features/auth/authSlice";
import Loader from "../../../components/GenricComponents/Loader";
import styles from "./style.module.scss";
import { APP_PROD_API } from "../../../utils/api";
import { validateForm } from "../../../utils/fn";
import bgImage from "../../../assets/images/Banner-2.jpg";

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "", otp: "" });
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const usernameInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // Focus username on page load
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Focus OTP field when OTP step appears
  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [isOtpSent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp") {
      if (/^\d*$/.test(value)) {
        setUser((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (!/^\d*$/.test(paste)) {
      e.preventDefault();
    }
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const { username, password } = user;

    const isValidForm = validateForm("login-form", "login form with otp");
    if (!isValidForm) {
      toast.error("Please enter your credentials");
      setBtnLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMAIL_OTP}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to send OTP");
      } else {
        toast.success(data.message || "OTP sent successfully");
        setIsOtpSent(true);
      }
    } catch (error) {
      console.error("Error while sending OTP:", error);
      toast.error("Something went wrong while requesting OTP");
    } finally {
      setBtnLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.LOGIN_URL}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        const loggedInUser = {
          id: data.user.user_id,
          username: data.user.user_name,
          global_division_id: data.user.division_id,
          global_fin_year: data.user.year_code,
          global_division_name: data.user.division_name,
        };

        dispatch(setCredentials(loggedInUser));
        navigate("/");
        toast.success(`${data.user.user_name} Login successful`);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("loginTimestamp", Date.now().toString());
      } else {
        toast.error(data.message || "Invalid username or password");
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={styles.container}
      style={{
        background: `url(${bgImage}) no-repeat`,
        backgroundSize: "100% 100%",
        backgroundPosition: "left center",
      }}
    >
      <div className={styles.powerText}>
        ** Powered by Integral Infogen Technologies Pvt Ltd
      </div>

      <div className={styles.pic}>
        <div className={styles.auth}>
          <h1 className={styles.form_title}>
            <span>Login</span>
          </h1>

          <form
            onSubmit={!isOtpSent ? handleGetOTP : handleSubmit}
            id="login-form"
          >
            {!isOtpSent && (
              <>
                <input
                  ref={usernameInputRef}
                  autoComplete="off"
                  required
                  type="text"
                  placeholder="Enter User Name"
                  name="username"
                  onChange={handleChange}
                  aria-label="Username"
                />

                <div className={styles.passwordWrapper}>
                  <input
                    autoComplete="off"
                    required
                    type={isPasswordShown ? "text" : "password"}
                    placeholder="Enter Password"
                    name="password"
                    onChange={handleChange}
                    aria-label="Password"
                  />
                  <span
                    className={styles.eyeIcon}
                    onClick={() => setIsPasswordShown((prev) => !prev)}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {isPasswordShown ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </span>
                </div>
              </>
            )}

            {isOtpSent && (
              <input
                ref={otpInputRef}
                type="number"
                placeholder="Enter OTP"
                name="otp"
                onChange={handleChange}
                onPaste={handlePaste}
                aria-label="OTP"
              />
            )}

            {!isOtpSent && (
              <button type="submit" disabled={btnLoading}>
                {btnLoading ? (
                  <span>
                    <span className="button-spinner"></span>
                    Sending...
                  </span>
                ) : (
                  "Get OTP for Login"
                )}
              </button>
            )}

            {isOtpSent && (
              <button type="submit">Submit OTP & Login</button>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <span>
              <Link to="/forgot-password">Forgot your password?</Link>
            </span>
            <span>
              Don't have an account? <Link to="/register">Register</Link>
            </span>
          </form>
        </div>
      </div>

      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;


