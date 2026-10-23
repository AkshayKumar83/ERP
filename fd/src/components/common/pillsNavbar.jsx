import React from "react";
import { NavItem, NavLink } from "reactstrap";

const PillsNavbar = (props) => (
  <div className="pills-navigator">
    <ul className="nav nav-pills nav-justified">
      {props.tabs &&
        props.tabs.map((tab, index) => (
          <NavItem key={index + 1}>
            <NavLink className={`${props.activeTab === index + 1 ? "active" : ""}`} onClick={() => props.toggleTab(index + 1)}>
              <span className="nav-num">{index + 1}</span>
              <span className="nav-title">{tab}</span>
            </NavLink>
          </NavItem>
        ))}
    </ul>
  </div>
);

export default PillsNavbar;
