
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./style.module.scss";

const MenuBar = ({ formList = [] }) => {

    return (
        <nav className={styles["menubar"]}>
            <div className={styles["menubar__container"]}>
                <div className={styles.navLinks}>
                    <ul className={styles.navItems}>
                        <li>
                            <Link to={"#"} className={styles.navLinkItem}>
                                Action
                            </Link>
                        </li>
                        <li className={styles["dropdown__form__btn__container"]}>
                            <Link to={`/module/${ window.location.pathname.split("/")[2] }`} className={styles.navLinkItem}>
                                Form
                            </Link>
                        </li>
                        <li>
                            <Link to={`/report/${window.location.pathname.split("/")[2]}`} className={styles.navLinkItem}>
                                Reports
                            </Link>
                        </li>
                        <li>
                            <Link to={"#"} className={styles.navLinkItem}>
                                Query
                            </Link>
                        </li>
                        <li>
                            <Link to={"#"} className={styles.navLinkItem}>
                                Window
                            </Link>
                        </li>
                    </ul>
                </div>
                {/* <div className={styles.dateInfo}>
                    <span>{"03-01-2025"}</span>
                </div> */}
                {/* <div className={styles.userSection}></div> */}
            </div>
        </nav>
    );
};

export default MenuBar;
