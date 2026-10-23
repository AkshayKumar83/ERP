import React from "react";
import "./settingPanel.css";

const SettingsPanel = ({ close }) => {

 const changeTheme = (theme) => {

  localStorage.setItem("theme", theme);

  const wrappers = document.querySelectorAll(".form-wrapper");

  wrappers.forEach((wrapper)=>{
    wrapper.classList.remove("light","dark");
    wrapper.classList.add(theme);
  });

  close();
};

  return (
    <div className="settings-panel">

      <div className="settings-header">
        <h5>Appearance</h5>
        <button className="close-btn" onClick={close}>✕</button>
      </div>

      <p className="theme-title">Theme</p>

      <div className="theme-switch">

        <button
          className="theme-card light-card"
          onClick={()=>changeTheme("light")}
        >
          ☀ Light Mode
        </button>

        <button
          className="theme-card dark-card"
          onClick={()=>changeTheme("dark")}
        >
          🌙 Dark Mode
        </button>

      </div>

    </div>
  );
};

export default SettingsPanel;