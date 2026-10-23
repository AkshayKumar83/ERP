import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import React, { useState, useEffect, useRef } from "react";

import EddalLogo from "../../../assets/images/kubota.png";
import Ekt1Logo from "../../../assets/images/ekt1.png";
import IITPLLogo from "../../../assets/images/iitpl_logo.png";

import Loader from "../../../components/GenricComponents/Loader";
import toast from "react-hot-toast";
import styles from "../Login/style.module.scss";
import { APP_PROD_API } from "../../../utils/api";
import bgImage from "../../../assets/images/Banner-2.jpg";

const RegisterUser = () => {
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const usernameInputRef = useRef(null);

    // Focus on the username field when the page loads
    useEffect(() => {
        if (usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, []);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.REGISTER_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.error || "An error occurred");
                return;
            }

            // Clear inputs and navigate to the login page
            toast.success(
                `Congratulations ${inputs.username}! You have successfully registered.`
            );
            setInputs({ username: "", email: "", password: "" });
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError(err || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div  className={styles.container}
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
                        <span>Register</span>
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <input
                            ref={usernameInputRef}
                            required
                            type="text"
                            placeholder="Enter Your Name"
                            name="username"
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="email"
                            placeholder="Enter Email"
                            name="email"
                            onChange={handleChange}
                        />
                        {/* <input
                            type="text"
                            placeholder="Enter OTP"
                            name="otp"
                            onChange={handleChange}
                        />
                        <button type="button">
                            Send OTP for Registeration
                        </button> */}

                        <button type="submit">Register</button>

                        {error && <p style={{ color: "red" }}>{error}</p>}

                        <span>
                            Do you have an account ?
                            <Link to="/login">Login</Link>
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

export default RegisterUser;
