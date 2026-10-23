
import React, { useEffect, useState, useRef } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import SidebarContent from "./SidebarContent";
import { useLocation } from "react-router-dom";
import { moduleIconConfig } from "../../../utils/appHelpers/menuConfig"; // Adjust the path

const Sidebar = ({ type, isMobile, onVisibilityChange }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef(null);

  // Get all routeNames from the config
  const autoHideModules = moduleIconConfig.map((mod) => mod.routeName);

  // Extract module name from current path
  const match = location.pathname.match(/^\/module\/([^/]+)/);
  const currentModule = match ? match[1] : null;

  const shouldAutoHide = autoHideModules.includes(currentModule);

  useEffect(() => {
    if (!shouldAutoHide) return;

    const hoverZone = document.getElementById("hover-zone");
    const showSidebar = () => setIsVisible(true);

    if (hoverZone) {
      hoverZone.addEventListener("mouseenter", showSidebar);
    }

    return () => {
      if (hoverZone) {
        hoverZone.removeEventListener("mouseenter", showSidebar);
      }
    };
  }, [shouldAutoHide]);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  const handleMouseLeave = () => {
    if (shouldAutoHide) {
      timeoutRef.current = setTimeout(() => setIsVisible(false), 2000);
    }
  };

  const handleMouseEnter = () => {
    if (shouldAutoHide) {
      clearTimeout(timeoutRef.current);
      setIsVisible(true);
    }
  };

  return (
    <>
      {shouldAutoHide && <div id="hover-zone" className="sidebar-hover-zone" />}
      <div
        className={`sidebar ${isVisible ? "sidebar-visible" : "sidebar-hidden"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div data-simplebar className="h-100">
          {type !== "condensed" ? (
            <SimpleBar style={{ maxHeight: "100%" }}>
              <SidebarContent isMobile={isMobile} />
            </SimpleBar>
          ) : (
            <SidebarContent isMobile={isMobile} />
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
