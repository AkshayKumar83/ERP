import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import avatar from "../../../assets/images/avatar.png";
import { logout } from "../../../features/auth/authSlice";
import { APP_PROD_API } from "../../../utils/api";

const Profile = () => {
  const [menu, setMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const username = isAuthenticated ? user?.username : "Guest";

  const toggle = () => setMenu((prevState) => !prevState);

  const expireToken = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.LOGOUT}`,
        { method: "POST", credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("Logout request failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await expireToken();
      dispatch(logout());
      document.cookie = "auth_token=; Max-Age=0; path=/;";
      localStorage.removeItem("persist:root");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/user-profile");
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={toggle}
        className="d-inline-block user-dropdown"
      >
        <DropdownToggle
          tag="button"
          className="btn header-item"
          id="page-header-user-dropdown"
        >
          {/* <img
                        className="rounded-circle header-profile-user me-1"
                        src={avatar}
                        alt="Header Avatar"
                    /> */}
<img
  className="rounded-circle header-profile-user me-1"
  src={
    user?.user_avatar
      ? `${import.meta.env.VITE_BASE_API_URL}${user.user_avatar}`
      : avatar
  }
  alt="Header Avatar"
/>

          <span className="d-none d-xl-inline-block ms-1 text-transform">
            {username}
          </span>
          <i className="mdi mdi-chevron-down d-none ms-1 d-xl-inline-block"></i>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem onClick={handleProfileClick}>
            <i className="ri-user-line align-middle me-1"></i> Profile
          </DropdownItem>
          <DropdownItem className="d-block" href="#">
            <i className="ri-settings-2-line align-middle me-1"></i> Settings
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem className="text-danger" onClick={handleLogout}>
            <i className="ri-shut-down-line align-middle me-1 text-danger"></i>{" "}
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default Profile;
