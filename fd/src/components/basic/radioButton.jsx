import React from "react";
import { RiCheckboxBlankCircleLine, RiRadioButtonLine } from "@remixicon/react";

const RadioButton = (props) => {
  return (
    <label className={`radio-button-wrapper ${props.disabled ? "disabled" : ""}`}  style={props.style}>
      <input type="radio" className="radio-button" checked={props.checked} onChange={props.onChange} value={props.value ? props.value : ""} disabled={props.disabled} onBlur={props.onBlur} />
      {props.checked ? <RiRadioButtonLine className="radio-icon checked" /> : <RiCheckboxBlankCircleLine className="radio-icon" />}

      {props.text && <span className="radio-text">{props.text}</span>}
    </label>
  );
};

export default RadioButton;
