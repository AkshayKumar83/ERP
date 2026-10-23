

import React, { useState, useEffect } from 'react';
import { IoIosArrowDropdown, IoIosArrowDropright } from "react-icons/io";
import { RiDashboardFill } from "react-icons/ri";
import { MdRocketLaunch } from "react-icons/md";
import { TbLogout2, TbSwitch2 } from "react-icons/tb";
import { FaCalendarCheck } from "react-icons/fa";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { BsSun, BsMoon } from "react-icons/bs";
import styles from "./style.module.scss";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import ChangeFinYear from '../ChangeFInYear';
import { logout } from '../../../features/auth/authSlice';
import { useDispatch } from 'react-redux';


const HomeSideBar = ({ isCollapsed, toggleSidebar }) => {
    const [isERPLaunched, setIsERPLaunched] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isChangeFinYearOpen, setIsChangeFinYearOpen] = useState(false);

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlElement = location.pathname.split("/");
        setIsERPLaunched(urlElement.length >= 2 && urlElement[1] === "erp");
    }, [location]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const handleLogout = () => {
        // Clear Redux state
        dispatch(logout());
    
        // Optionally, clear cookies or localStorage
        document.cookie = 'auth_token=; Max-Age=0; path=/;';
        localStorage.removeItem('persist:root');
    
        // Redirect to login page
        navigate('/login');
      };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <div
                className={`${styles.homeSidebarContainer} ${
                    isCollapsed ? styles.collapsed : ""
                }`}
            >
                <aside
                    id="default-sidebar"
                    className={styles.sidebar}
                    aria-label="Sidebar"
                >
                    <div className={styles.sidebarContent}>
                        <div
                            className={styles.dropdownWrapper}
                            onClick={toggleSidebar}
                        >
                            {isCollapsed ? (
                                <IoIosArrowDropright className={styles.dropdownIcon}/>
                            ) : (
                                <IoIosArrowDropdown className={styles.dropdownIcon}/>
                            )}
                        </div>
                        <ul className={styles.sidebarMenu}>
                            <li>
                                <Link
                                    to="/"
                                    className={`${styles.menuItem} ${isActive("/") ? styles.active : ""}`}
                                >
                                    <RiDashboardFill />
                                    <span className={styles.menuText}>
                                        Dashboard
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/erp"
                                    className={`${styles.menuItem} ${ isActive("/erp") ? styles.active : ""}`}
                                >
                                    <MdRocketLaunch />
                                    <span className={styles.menuText}>
                                        Launch ERP
                                    </span>
                                </Link>
                            </li>
                            {isERPLaunched && (
                                <>
                                    <li>
                                        <a href="#" className={styles.menuItem}>
                                            <TbSwitch2 />
                                            <span className={styles.menuText}>
                                                Change Division
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={styles.menuItem} onClick={() => setIsChangeFinYearOpen(true)}>
                                            <FaCalendarCheck />
                                            <span className={styles.menuText}>
                                                Change Financial Year
                                            </span>
                                        </a>
                                    </li>
                                </>
                            )}
                            {!isERPLaunched && (
                                <li>
                                    <Link to="#" className={styles.menuItem}>
                                        <LiaFileInvoiceDollarSolid />
                                        <span className={styles.menuText}>
                                            E-Invoicing
                                        </span>
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link onClick={handleLogout} className={styles.menuItem}>
                                    <TbLogout2 className={styles.menuIcon} />
                                    <span className={styles.menuText}>Log Out</span>
                                </Link>
                            </li>
                        </ul>
                        <div className={styles.themeToggleWrapper}>
                            <button
                                onClick={toggleTheme}
                                className={styles.themeToggleBtn}
                            >
                                {theme === "light" ? (
                                    <BsMoon className={styles.themeIcon} />
                                ) : (
                                    <BsSun className={styles.themeIcon} />
                                )}
                                <span className={styles.menuText}>
                                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                                </span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
            <ChangeFinYear isOpen={isChangeFinYearOpen} onClose={() => setIsChangeFinYearOpen(false)} />
        </>
    );
};

export default HomeSideBar;