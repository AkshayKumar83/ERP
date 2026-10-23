import PropTypes from "prop-types";
import { RiCheckboxBlankLine, RiCheckboxLine } from "@remixicon/react";

const Checkbox = ({ disabled, text, checked, onChange, value, labelClass='', ...otherProps }) => {
  return (
    // <label className={`checkbox-wrapper ${disabled ? "disabled" : ""}`}>
    <label className={`checkbox-wrapper ${disabled ? "disabled" : ""} ${labelClass}`}style={{ fontWeight: 600 }}>
      <input type="checkbox" className="checkbox-input" checked={checked} onChange={onChange} value={value} disabled={disabled} {...otherProps} />

      {checked ? <RiCheckboxLine className="checkbox-icon checked" /> : <RiCheckboxBlankLine className="checkbox-icon" />}

      {text && <span className="checkbox-text">{text}</span>}
    </label>
  );
};

export default Checkbox;
