import React, { useState } from "react";
import styles from "./style.module.scss";

const ResetPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle password reset logic here
        console.log("Reset link sent to", email);
    };

    return (
        <div className={styles.resetPasswordContainer}>
            <section className={styles.section}>
                <div className={styles.sectionWrapper}>
                    <div className={styles.card}>
                        <div className={styles.cardContent}>
                            <h1 className={styles.title}>
                                Reset your password
                            </h1>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className={styles.label}
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    Send Reset Link
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResetPassword;
