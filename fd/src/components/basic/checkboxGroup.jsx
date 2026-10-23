import React, { useState } from "react";
import Checkbox from "./checkbox";

const CheckboxGroup = ({ options, onChange, disabled }) => {
  const [selectedValues, setSelectedValues] = useState([]);

  const handleCheckboxChange = (value, checked) => {
    let updatedValues;
    if (checked) {
      updatedValues = [...selectedValues, value];
    } else {
      updatedValues = selectedValues.filter((item) => item !== value);
    }

    setSelectedValues(updatedValues);
    if (onChange) {
      onChange(updatedValues);
    }
  };

  return (
    <div className={`checkbox-group}`}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          text={option.text}
          value={option.value}
          checked={selectedValues.includes(option.value)}
          onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
          disabled={disabled || option.disabled}
        />
      ))}
    </div>
  );
};

export default CheckboxGroup;
