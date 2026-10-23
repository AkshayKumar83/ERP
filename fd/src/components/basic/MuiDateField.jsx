

import { TextField } from "@mui/material";

const MuiDateField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
    onBlur, 
}) => {
  return (
    <TextField
      label={label}
      type="date"
      name={name}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      required={required}
      disabled={disabled}
      size="small"
      fullWidth
      InputLabelProps={{
        shrink: true, // label always top
      }}
  sx={{
  mt: 0,

  "& .MuiInputBase-root": {
    height: "28px",
    fontSize: "13px",
    backgroundColor: "#fff",
  },

  "& .MuiOutlinedInput-input": {
    padding: "6px 10px !important",
    fontSize: "13px",
  },

  "& .MuiInputLabel-root": {
    fontSize: "13px",
    top: "-4px",
    color:'black',
  },

  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -7px) scale(1) !important",
    fontSize: "12px",
    backgroundColor: "#fff3cd",
    padding: "0 1px",
    borderRadius: "4px 4px 0 0",
    zIndex: 1,
    fontWeight:'600',
    color:'black'
  },

  // Asterisk same rakha
  "& .MuiFormLabel-asterisk": {
    color: "red",
    fontSize: "18px",
    fontWeight: "bold",
    verticalAlign: "middle",
    lineHeight: 1,
    position: "relative",
    top: "1px",
    marginLeft: "-2px",
  },

  "& input:invalid": {
    backgroundColor: "#fff !important",
    boxShadow: "none !important",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
   color: "#000 !important",
  // WebkitTextFillColor: "#000 !important",
  opacity: "1 !important",
},



  "& .MuiOutlinedInput-root.Mui-disabled": {
    backgroundColor: "#dee3e6 !important",     //  grey background root pe
    borderRadius: "4px",                        // clip karne ke liye (optional, agar rounded chahiye)
  },


  "& .MuiInputBase-input.Mui-disabled": {
  WebkitTextFillColor: "#000 !important",
  opacity: "1 !important",
},

  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input": {
    backgroundColor: "transparent !important",  // input transparent → root ka grey dikhega
    padding: "6px 10px !important",             // padding same rakho
    height: "100% !important",
    margin: 0,
    boxSizing: "border-box",
    // color: "rgba(0, 0, 0, 0.38)",               // MUI default disabled text color (optional)
  color: "#000 !important",
    WebkitTextFillColor: "#000 !important", // important for date field
  opacity: "1 !important",                // remove faded effect
  },

  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#c4c4c4 !important",          // disabled border color
  },

  // Extra safety: agar koi white layer aa raha ho to force remove
  "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
    backgroundColor: "transparent !important",
  },
}}

    />
  );
};

export default MuiDateField;



















