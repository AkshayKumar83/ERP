
import { TextField } from "@mui/material";
import { useState } from "react";

const MuiTextField = ({
  label,
  name,
  value,
  onChange,
  onDoubleClick,
  disabled = false,
  type = "text",
  required = false,
  // showHelpIcon = false,
  maxLength,
  onBlur,

}) => {

  /* ================= STATE ================= */
  const [isDoubleClicking, setIsDoubleClicking] = useState(false);

    const showHelpIcon = !!onDoubleClick;

  /* ================= BLUR HANDLER ================= */
  const handleBlur = (e) => {
    const next = e.relatedTarget;

    //  cancel / submit button pe blur ignore
    if (next && (next.id === "cancelBtn" || next.id === "submit-btn")) {
      return;
    }

    //  help list open hua tha → blur skip
    if (isDoubleClicking) {
      setIsDoubleClicking(false);
      return;
    }

    onBlur && onBlur(e);
  };

  /* ================= DOUBLE CLICK ================= */
  const handleDoubleClick = (e) => {
    setIsDoubleClicking(true);
    onDoubleClick && onDoubleClick(e);
  };

  /* ================= LABEL WITH HELP ICON ================= */
  const renderLabel = showHelpIcon ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {label}
      <span
        onClick={(e) => {
          e.stopPropagation();
          handleDoubleClick(e);
        }}
        title="Double click or Ctrl + Enter for help"
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
    //  autoComplete="new-password"
    // name={`${name}_field`}
      label={renderLabel}
       name={name}
      type={type}
      value={value === null || value === undefined ? "" : value}
      onChange={onChange}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      disabled={disabled}
      required={required}
      inputProps={{
        // autoComplete: "off",
        // form: {
        //   autoComplete: "off"
        // },
        maxLength,
        onWheel: type === "number" ? (e) => e.target.blur() : undefined,
        onKeyDown: (e) => {
          if (type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
          }
          if (e.ctrlKey && e.key === "Enter" && onDoubleClick) {
            handleDoubleClick(e);
          }
        },
        // for removing numbe icon in 
        ...(type === "number" && {
          className: "no-spinner",
        }),
      }}
      
      size="small"
      variant="outlined"
      fullWidth
       sx={{
        mt: 0,

        "& .MuiInputBase-root": {
          height: "28px",
          fontSize: "13px",
          width: "100%",
         backgroundColor: "#fff",
         
        },

        "& .MuiOutlinedInput-input": {
          // Specific selector for outlined input; symmetric padding
          padding: "4px 12px !important",
          fontSize: "13px !important",
          // Remove height:100% to avoid conflicts with padding
          // backgroundColor: "#fff !important", // Moved to root if needed
          textAlign: type === "number" ? "right" : "left", 
          boxSizing: "border-box", // Ensure padding is inside
        },
        "& .MuiOutlinedInput-root input:focus": {
          backgroundColor: "#fff !important",
        },
        "& .MuiInputLabel-root": {
          fontSize: "13px",
          top: "-3px" ,
          lineHeight: 1, // Tight line height for positioning
          color:'black',
        },
        "& .MuiInputLabel-shrink": {
          fontSize: "13px !important",
          // Adjusted for custom small height: standard small shrunk is ~ -6px, but for 28px height, tweak to -7px for better fit
          transform: "translate(14px, -7px) scale(1) !important",  // Changed to scale(0.75) for proper shrink effect, adjust Y if needed
          // Add background to cover border line under label
           backgroundColor: "#fff3cd",
          padding: "0 1px", // Small horizontal padding for label itself to create micro-gap
          borderRadius: "4px 4px 0 0", // Rounded to blend with input bg
          zIndex: 1, // Ensure on top
          fontWeight:'600',
          color:'black'
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
 
"& .MuiOutlinedInput-root.Mui-disabled": {
  backgroundColor: "#dee3e6 !important",
},

"& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input": {
  backgroundColor: "transparent !important",   // ⭐ ye missing hai
  WebkitTextFillColor: "#000 !important",
  color: "#000 !important",
  opacity: 1,
},

"& .MuiOutlinedInput-root.Mui-disabled fieldset": {
  borderColor: "#c4c4c4 !important",
},
//  label black even when disabled
"& .MuiInputLabel-root.Mui-disabled": {
  color: "#000 !important",
},

//  shrink label black
"& .MuiInputLabel-root.Mui-disabled.MuiInputLabel-shrink": {
  color: "#000 !important",
  // fontWeight: 600,
},

          // for number icon remove
    "& input[type=number]": {
      MozAppearance: "textfield !important",
    },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
      WebkitAppearance: "none !important",
      margin: 0,
    },

    // Agar className wala use kar rahe to yeh optional backup
    "& .no-spinner::-webkit-outer-spin-button, & .no-spinner::-webkit-inner-spin-button": {
      WebkitAppearance: "none !important",
      margin: 0,
    },
    "& .no-spinner": {
      MozAppearance: "textfield !important",
    },
 

      }}
    />
  );
};

export default MuiTextField;