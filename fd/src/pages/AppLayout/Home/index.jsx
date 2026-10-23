
import HomeSideBar from "../HomeSideBar";
import { useState } from "react";
import styles from "./style.module.scss";
import { Outlet } from "react-router-dom";

const Home = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={styles.home__container}>
      <HomeSideBar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`${styles.mainContent} ${isCollapsed ? styles.expanded : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Home;