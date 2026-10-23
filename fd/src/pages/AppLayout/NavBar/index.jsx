import React from "react";
import { MdMenu } from "react-icons/md";
import { LiaUser } from "react-icons/lia";
import { useSelector } from "react-redux";
import styles from "./style.module.scss";



const NavBar = ({ 
  toggleSideBar, 
  premisesInfo = { name: 'Eddal', division_id: '1' } 
}) => {
  const user = useSelector((store) => store?.auth?.user);

  return (
    <div className={styles.navBarContainer}>
      <div className={styles.navBarContent}>
        <div className={styles.menuContainer}>
          <div className={styles.menuIconContainer}>
            <div className={styles.menuIconWrapper} onClick={toggleSideBar}>
              <MdMenu className={styles.menuIcon} />
            </div>
          </div>
        </div>

        <div className={styles.premisesInfoContainer}>
          <div className={styles.premisesInfoContent}>
            <p className={styles.premisesName}>{user?.division_name}</p>
            &nbsp;
            <span className={styles.unitText}>{`UNIT-${user?.division}`}</span>
          </div>
        </div>

        <div className={styles.userInfoContainer}>

          <div className={styles.userProfileWrapper}>
            <LiaUser className={styles.userIcon} />
            <p className={styles.userName}>{user?.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

