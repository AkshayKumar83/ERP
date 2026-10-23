import React from 'react';
import { Link } from 'react-router-dom';
import { RiFileTextLine, RiFileChartLine, RiMenuLine } from "@remixicon/react";

const ModuleSubmenu = ({ moduleMenu, moduleName }) => {
  const getSubmenuIcon = (name) => {
    switch (name) {
      case "Form":
        return <RiFileTextLine className="icon" />;
      case "Report":
        return <RiFileChartLine className="icon" />;
      default:
        return <RiMenuLine className="icon" />;
    }
  };

  return (
    <ul className="sub-menu">
      {moduleMenu.map((section, index) => (
        <li key={index}>
          <Link to="/#">
            {getSubmenuIcon(section.name)}
            <span className="sub-menu">{section.formName}</span>
          </Link>
          <ul className="sub-menu">
            {section.item.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Link to={`/module/${moduleName.toLowerCase()}/${item.url}`}>
                  <span className="ms-1-form-name">{item.formName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default ModuleSubmenu;

