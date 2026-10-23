import React from 'react';
import { TextField } from '@mui/material';

const MuiTextArea = ({
  label,
  name,
  value = '',
  onChange,
  onDoubleClick,
  disabled = false,
  required = false,
  showHelpIcon = false,
  maxLength,
  rows = 2,
  placeholder = 'Enter text here...',
  error = false,
  helperText = '',
  ...otherProps
}) => {

  const renderLabel = showHelpIcon ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {label}
      <span
        onClick={(e) => {
          e.stopPropagation();
          if (onDoubleClick) onDoubleClick(e);    
        }}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#0d6efd",
          color: "#fff",
          fontSize: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        i
      </span>
    </span>
  ) : (
    label
  );

  return (
    <TextField
      label={renderLabel}
      name={name}
      multiline
      rows={rows}
      value={value || ''}
      onChange={onChange}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      inputProps={{ maxLength }}
      size="small"
      variant="outlined"
      fullWidth
      {...otherProps}
      sx={{
        mt: 0,
        "& .MuiInputBase-root": {
          fontSize: "13px",
          width: "100%",
          backgroundColor: "#fff !important",
          minHeight: "48px", // Slightly increased for better rows=2 fit without too much gap
        },
        "& .MuiOutlinedInput-input": {
          padding: "6px 12px !important", // Reduced vertical padding to minimize gap
          fontSize: "13px !important",
          textAlign: "left",
          boxSizing: "border-box",
           
        },
        "& .MuiOutlinedInput-root textarea:focus": {
          backgroundColor: "#fff !important",
        },
        "& .MuiInputLabel-root": {
          fontSize: "13px",
          lineHeight: 1,
          color:'black',
          
        },
        "& .MuiInputLabel-shrink": {
          fontSize: "12px !important", // Smaller for proper shrink
          transform: "translate(14px, -7px) scale(1) !important", // Proper scale and adjusted Y for tighter fit
          backgroundColor: "#fff3cd",
          padding: "0 4px",
          borderRadius: "4px 4px 0 0",
          zIndex: 1,
          color:'black',
         fontWeight:600
        },
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
          borderColor: "#bdbdbd",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#757575 !important",
        },
        "& .MuiOutlinedInput-root.Mui-focused": {
          backgroundColor: "#fff !important",
          boxShadow: "none !important",
        },
        "& .MuiFormLabel-asterisk": {
          color: "red",
          fontSize: "18px",
          fontWeight: "bold",
          verticalAlign: "middle",
          lineHeight: 1,
          position: "relative",
          top: "1px",
          marginLeft: "-3px",
        },
        // Disabled grey full background
        "& .MuiOutlinedInput-root.Mui-disabled": {
          backgroundColor: "#dee3e6 !important",
          // fontWeight:600,
          color:'black'
        },
        "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input": {
          backgroundColor: "transparent !important",
          padding: "6px 12px !important", // Match reduced padding
          boxSizing: "border-box",
          WebkitTextFillColor: "#000 !important",
        },
        "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
          borderColor: "#c4c4c4 !important",
        },

      }}
    />
  );
};

export default MuiTextArea;