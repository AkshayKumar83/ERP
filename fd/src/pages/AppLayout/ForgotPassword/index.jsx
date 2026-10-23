
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import Loader from "../../../components/GenricComponents/Loader";

import EddalLogo from "../../../assets/images/Eddal Logo.webp";
import Ekt1Logo from "../../../assets/images/ekt1.png";
import IITPLLogo from "../../../assets/images/iitpl_logo.png";

import styles from "./style.module.scss";
import { APP_PROD_API } from "../../../utils/api";

const ForgotPassword = () => {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (usernameInputRef.current) usernameInputRef.current.focus();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp" && !/^\d*$/.test(value)) return; // only digits allowed
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Request OTP
  const handleGetOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Please enter your email");
      return;
    }

    setBtnLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_RESET_PSK_OTP_EMAIL}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to send OTP");
      } else {
        toast.success(data.message || "OTP sent successfully to your email");
        setIsOtpSent(true);
      }
    } catch (error) {
      console.error("Error while sending OTP:", error);
      toast.error("Something went wrong while sending OTP");
    } finally {
      setBtnLoading(false);
    }
  };

  // Reset password with OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.otp || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.RESET_NEW_PSK}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message || "Invalid OTP or expired");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow digits in OTP paste
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (!/^\d*$/.test(paste)) e.preventDefault();
  };

  return (
    <div className={styles.login_container}>
      {/* Logo */}
      <div className={styles.logo}>
        <div>
          <img src={IITPLLogo} alt="IITPL Logo" />
        </div>
        <div
          className="client-logo"
          style={{
            width: "80px",
            height: "48px",
            backgroundColor: "white",
            padding: "3px",
            borderRadius: "5px",
          }}
        >
          <img
            src={EddalLogo}
            alt="Client Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      <div className={styles.title}>
        <p>Escorts Dealers Development Association Limited</p>
      </div>

      <div className={styles.pic}>
        <img src={Ekt1Logo} alt="Tractor" />
        <h2 className={styles.power_by}>
          <span>** Powered by Integral Infogen Technologies Pvt Ltd</span>
        </h2>

        <div className={styles.auth}>
          <h1 className={styles.form_title}>
            <span>Forgot your Password</span>
          </h1>

          {/* Main form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isOtpSent) {
                handleGetOTP(e); // first press = send OTP
              } else {
                handleSubmit(e); // after OTP sent = reset password
              }
            }}
            id="forgot-form"
          >
            {/* Step 1: Email */}
            {!isOtpSent && (
              <>
                <p
  style={{
    fontSize: "13px",
    color: "#6c757d",
    textAlign: "center",
    marginTop: "-5px",
    marginBottom: "20px",
    letterSpacing: "0.3px",
  }}
>
  Please enter your registered email to reset your password.
</p>

                <input
                  ref={usernameInputRef}
                  autoComplete="off"
                  required
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  onChange={handleChange}
                  aria-label="email"
                  value={form.email}
                />

                <button type="submit" disabled={btnLoading}>
                  {btnLoading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {/* Step 2: OTP + New Password + Confirm Password */}
            {isOtpSent && (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Enter OTP"
                  name="otp"
                  onChange={handleChange}
                  onPaste={handlePaste}
                  aria-label="OTP"
                  value={form.otp}
                />

                {/* New Password */}
                <div className={styles.passwordWrapper}>
                  <input
                    type={isPasswordShown ? "text" : "password"}
                    placeholder="Enter New Password"
                    name="newPassword"
                    onChange={handleChange}
                    aria-label="New Password"
                    value={form.newPassword}
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

                {/* Confirm Password */}
                <div className={styles.passwordWrapper}>
                  <input
                    type={isConfirmPasswordShown ? "text" : "password"}
                    placeholder="Confirm New Password"
                    name="confirmPassword"
                    onChange={handleChange}
                    aria-label="Confirm Password"
                    value={form.confirmPassword}
                  />
                  <span
                    className={styles.eyeIcon}
                    onClick={() =>
                      setIsConfirmPasswordShown((prev) => !prev)
                    }
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {isConfirmPasswordShown ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </span>
                </div>

                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Reset Password"}
                </button>
              </>
            )}

            <span>
              Remembered your password? <Link to="/login">Login</Link>
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

export default ForgotPassword;
