import React from "react";

const TextArea = ({
  label = "",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error = "",
  rows = 3,
  ...otherProps
}) => {
  return (
    <div
      className={`text-area-wrapper ${disabled ? "disabled" : ""} ${
        error ? "error" : ""
      }`}
    >
      {label && <label className="text-area-label" style={{ fontWeight: 700 }}>{label}</label>}
      <textarea
        className="text-area-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...otherProps}
      />
      {error && <span className="text-area-error">{error}</span>}
    </div>
  );
};

export default TextArea;
