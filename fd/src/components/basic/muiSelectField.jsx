import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const MuiSelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required,
  disabled,
  onBlur,
}) => {
  // Find the selected option object based on value
  const selectedOption = options.find((opt) => opt.value === value) || null;

  const handleAutocompleteChange = (event, newValue) => {
    // Simulate the original onChange event
    const syntheticEvent = {
      target: {
        name,
        value: newValue ? newValue.value : "",
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={handleAutocompleteChange}
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      disableClearable={!value} // Optional: Don't allow clearing if value is required
      freeSolo={false} // Ensures only options from list can be selected
      disabled={disabled}
      fullWidth

       slotProps={{
     paper: {
      sx: { maxHeight: 300 },
    },
    listbox: {
      sx: { maxHeight: 300 },
    },
  }}
      sx={{
        // Override any potential Autocomplete-specific focus styles
        "& .MuiAutocomplete-inputFocused": {
          backgroundColor: "transparent !important",
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}             
          required={required}
          size="small"
          variant="outlined"
          onBlur={onBlur}
          sx={{
            mt: 0,
            "& .MuiInputLabel-root": {
              fontSize: "13px",
              top: "-4px",
              color:'black',
              // Required * red color
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
              "&.MuiInputLabel-shrink": {
                fontSize: "12px !important",
                transform: "translate(14px, -8px) scale(1) !important",
                backgroundColor: "#fff3cd",
                padding: "0 4px",
                color:'black',
                fontWeight:600
              },
              // Remove orange color from label on focus - with !important
              "&.Mui-focused": {
                color: "rgba(0, 0, 0, 0.6) !important",
              },
            },
           "& .MuiOutlinedInput-root": {
            height: "28px",
            fontSize: "12px",
            backgroundColor: "#fff",   
              // Force same gray border on normal, hover, and focus states
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0, 0, 0, 0.23) !important",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0, 0, 0, 0.23) !important",
              },
              "&.Mui-focused": {
                backgroundColor: "white !important", // Ensure no background tint on focus
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23) !important",
                  borderWidth: "1px !important",
                },
                // Remove any box-shadow on focus if present
                boxShadow: "none !important",
              },
              "&.Mui-disabled": {
            backgroundColor: "#dee3e6 !important",
             color:'black',
             fontWeight:600 ,
          },
          
          "& .MuiOutlinedInput-root.Mui-disabled": {
           color: "black !important",
        }
              
            },
            "& .MuiInputBase-input": {
              padding: "4px 10px",
              fontSize: "12px",
              // Extra: Remove browser default outline
              "&:focus": {
                outline: "none !important",
                backgroundColor: "transparent !important", // No background on input focus
              },
            },
            // 🔥 disabled value black
"& .MuiOutlinedInput-root.Mui-disabled .MuiInputBase-input": {
  WebkitTextFillColor: "#000 !important",
  color: "#000 !important",
  opacity: 1,
},

// 🔥 disabled label black
"& .MuiInputLabel-root.Mui-disabled": {
  color: "#000 !important",
},

"& .MuiInputLabel-root.Mui-disabled.MuiInputLabel-shrink": {
  color: "#000 !important",
  fontWeight: 600,
},
          }}
        />
      )}
      
      renderOption={(props, option) => {
        const { key, ...restProps } = props;

        return (
          <li key={key} {...restProps} style={{ fontSize: "13px" }}>
            {option.label}
          </li>
        );
      }}

      // renderOption={(props, option) => (
      //   <li {...props} style={{ fontSize: "13px" }}>
      //     {option.label}
      //   </li>
      // )}

      // PaperProps={{ sx: { maxHeight: 300 } }}
      // ListboxProps={{ style: { maxHeight: 300 } }}
      // fullWidth

    />
  );
};

export default MuiSelectField;