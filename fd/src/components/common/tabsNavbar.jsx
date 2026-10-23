import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap";

const TabsNavbar = (props) => (
  <div className="tabs-navigator">
   <Nav tabs className="nav-tabs-custom nav-justified" style={{ gap: "6px" }}>
      {props.tabs &&
        props.tabs.map((tab, index) => (
          <NavItem key={index + 1}>
            {/* <NavLink className={`${props.activeTab === index + 1 ? "active" : ""} p-1`} onClick={() => props.toggleTab(index + 1)} >
              <span className="nav-title">{tab}</span>
            </NavLink> */}
 <NavLink
  onClick={() => props.toggleTab(index + 1)}
  className="p-1"
  style={{
    backgroundColor: props.activeTab === index + 1 ? "#ffffff" : "#8B7355", // dark beige/brown
    color: props.activeTab === index + 1 ? "#000" : "#fff",
    border: props.activeTab === index + 1 
      ? "2px solid #8B7355" 
      : "2px solid #6f5a40",
    borderBottom: props.activeTab === index + 1 
      ? "2px solid #ffffff" 
      : "2px solid #6f5a40",
    marginRight: "6px",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontWeight: props.activeTab === index + 1 ? "600" : "500",
    padding: "6px 12px",
    boxShadow: props.activeTab === index + 1 
      ? "0px 2px 6px rgba(0,0,0,0.15)" 
      : "none",
    transition: "all 0.2s ease-in-out",
    transform: props.activeTab === index + 1 ? "translateY(-2px)" : "none",
  }}
>
  <span className="nav-title">{tab}</span>
</NavLink>
          </NavItem>
        ))}
    </Nav>
  </div>
);

export default TabsNavbar;
