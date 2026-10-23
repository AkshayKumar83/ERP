
import React from "react";
import styles from "./style.module.scss";

const MessageDialog = ({
    isOpen,
    message,
    type = "error",
    onClose,
    onConfirm,
    onDeny,
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleDeny = () => {
        onDeny();
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <div className={`${styles.header} ${styles[type]}`}>
                    {type === "error" ? "Error" : "Confirmation"}
                </div>
                <div className={styles.content}>{message}</div>
                <div className={styles.actions}>
                    {type === "confirm" && (
                        <>
                            <button
                                className={styles.confirmButton}
                                onClick={handleConfirm}
                            >
                                Yes
                            </button>
                            <button
                                className={styles.denyButton}
                                onClick={handleDeny}
                            >
                                No
                            </button>
                        </>
                    )}
                    {type === "error" && (
                        <button className={styles.closeButton} onClick={onClose}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageDialog;
