import React, { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import styles from "./style.module.scss";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordShown, setIsPasswordShown] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            console.log("Password reset successful");
        } else {
            console.log("Passwords do not match");
        }
    };

    return (
        <div className={styles.loginContainer}>
            <section className={styles.section}>
                <div className={styles.sectionWrapper}>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h1 className={styles.title}>Reset Your Password</h1>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div>
                                    <label htmlFor="password" className={styles.label}>
                                        New Password
                                    </label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={isPasswordShown ? "text" : "password"}
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={styles.passwordInput}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        {password.length > 0 && (
                                            <div
                                                className={styles.icon}
                                                onClick={() => setIsPasswordShown(!isPasswordShown)}
                                            >
                                                {isPasswordShown ? (
                                                    <IoEyeOffOutline className={styles.eyeIcon} />
                                                ) : (
                                                    <IoEyeOutline className={styles.eyeIcon} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className={styles.label}>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.submitButton}>
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResetPasswordPage;
