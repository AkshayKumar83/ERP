// import React from "react";
// import { FormGroup, Input, Label } from "reactstrap";

// const Select = (props) => {
//   return (
//     <label className={`select-wrapper ${props.disabled ? "disabled" : ""}`}>
//       {props.label && <span className="select-label">{props.label}</span>}
//       <Input name="select" type="select" className="select-input">
//         {props.options && props.options.map((option) => <option>{option}</option>)}
//       </Input>
//     </label>
//   );
// };

// export default Select;

// import React from "react";
// import { Input } from "reactstrap";

// const Select = (props) => {
//   return (
//     <label className={`select-wrapper ${props.disabled ? "disabled" : ""}`}>
//       {props.label && <span className="select-label">{props.label}</span>}
//       <Input name="select" type="select" className="select-input">
//         {Array.isArray(props.options) &&
//           props?.options?.map((option, index) => (
//             <option key={index} value={option?.value} >{option?.label}</option>
//           ))}
//       </Input>
//     </label>
//   );
// };

// export default Select;

import React, { forwardRef } from "react";
import { Input } from "reactstrap";

const Select = forwardRef((props, ref) => {
  return (
    <label
      className={`select-wrapper ${props.disabled ? "disabled" : ""}`}
      htmlFor={props?.id || props?.name}
      style={{ fontWeight: 600 }}
    >
      {/* {props.label && <span className="select-label">{props.label}</span>} */}
      {props.label && <span className="select-label" >{props.label}{props.required && <span className="required-asterisk">*</span>}</span>}
      <Input
        // name="select"
        innerRef={ref}
        name={props?.name}
        id={props?.id || props?.name} // ADDED BY AMIT ON  06.03.2025 SAME AS IN LABEL ALSO
        onChange={props?.onChange}
        value={props?.value}
        type="select"
        required={props?.required || false}
        className="select-input"
        disabled={props.disabled} // Pass disabled prop to the input element
        onBlur={props?.onBlur}
      >
        {Array.isArray(props.options) &&
          props.options.map((option, index) => (
            <option key={index} value={option?.value}>
              {option?.label}
            </option>
          ))}
      </Input>
    </label>
  );
});

export default Select;
