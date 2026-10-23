// import React, { useState } from "react";
// import PropTypes from "prop-types";
// import RadioButton from "./radioButton";

// const RadioGroup = (props) => {
//   const [selectedValue, setSelectedValue] = useState(props.initialValue ? props.initialValue : "");
//   const handleChange = (event) => {
//     setSelectedValue(event.target.value);
//   };
//   return (
//     <div className={`radio-button-group ${props.className ? props.className : ""}`}>
//       {props.options.map((option) => (
//         <RadioButton key={option.value} disabled={option.disabled} text={option.text} checked={selectedValue === option.value} onChange={(e) => handleChange(e)} value={option.value} />
//       ))}
//     </div>
//   );
// };

// RadioGroup.propTypes = {
//   disabled: PropTypes.bool,
//   text: PropTypes.string,
//   checked: PropTypes.bool,
//   onChange: PropTypes.func.isRequired,
//   // value: PropTypes.string.isRequired,
// };

// RadioGroup.defaultProps = {
//   disabled: false,
//   text: "",
//   checked: false,
// };

// export default RadioGroup;


import React, { useState } from "react";
import PropTypes from "prop-types";
import RadioButton from "./radioButton";

const RadioGroup = ({ className = "", options = [], onChange,  disabled = false, checked, ...otherProps  }) => {
   const [selectedValue, setSelectedValue] = useState(checked);


  const handleChange = (event) => {
    setSelectedValue(event.target.value); 
    // Invoke the onChange prop if provided
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={`radio-button-group ${className}`}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          disabled={option.disabled || disabled}
          text={option.text}
          checked={checked === option.value}
          onChange={handleChange}
          value={option.value}
          // style = {style}
          style={{ fontWeight: 600 }}
          {...otherProps}
        />
      ))}
    </div>
  );
};

// Prop validation
RadioGroup.propTypes = {
  disabled: PropTypes.bool,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
 initialValue: PropTypes.string,
  className: PropTypes.string,
};

export default RadioGroup;
