import React, { forwardRef, useState } from "react";
import { Input } from "reactstrap";
import { FcInfo } from "react-icons/fc";


const TextField = forwardRef(
  (
    {
      label = "",
      type = "text",
      value,
      onChange,
      placeholder = "",
      disabled = false,
      required = false,
      error = "",
      pClass = "", // newly added for giving class to container/parent  added by amit
      inpClass = "", // newly added for giving class to input field added by amit
      lClass = "", // newly added for giving class to label field added by amit
      id = "", // added by Amit on 06.03.2025
      name = "",
      onDoubleClick,
      searchAllow = false,
      onBlur, // add by akshay on 09.06.2025
      ...otherProps
    },
    ref
  ) => {
    const isHelpExist = typeof onDoubleClick === "function";
    // below state added by akshay for onBlur event not trigger on helpList
    const [isDoubleClicking, setIsDoubleClicking] = useState(false); // Track double-click
      
    // add by akshay on 09.06.2025
    const handleBlur = (e) => {

      // added by amit on dt 24.09.2025 causing running on blur event on cancel
    const nextElement = e.relatedTarget;
    // if (nextElement && nextElement.id === "cancelBtn") {
    if (nextElement && ['cancelBtn','submit-btn'].includes(nextElement.id)) {
      return; 
    }


      // console.log("TextField onBlur triggered", {
      //   name: e.target.name,
      //   value: e.target.value,
      //   id: e.target.id,
      //   propName: name,
      //   isDoubleClicking,
      // }); // Debug log
      // Skip validation if double-clicking
      if (isDoubleClicking) {
        // console.log("Skipping onBlur validation due to double-click");
        setIsDoubleClicking(false); // Reset flag
        return;
      }
      if (onBlur) onBlur(e); // Call passed onBlur handler
    };
           // add by akshay on 09.06.2025
          const handleDoubleClick = (e) => {
                setIsDoubleClicking(true); // Set flag before double-click
                if (onDoubleClick) onDoubleClick(e);
              };
            // console.log("TextField Props:", { id, name, value, type });  

    return (
      <div
        className={`text-field-wrapper ${disabled ? "disabled" : ""} ${error ? "error" : ""
          } ${pClass}`}
      >
        {/* {label && (
          <label className={`text-area-label ${lClass}`} htmlFor={id || name}>
            {label} {isHelpExist && <FcInfo title="Select from Help List" />}
          </label>
        )} */}

        {label && <label className={`text-area-label ${lClass}`} htmlFor={id || name}
          style={{ fontWeight: 600 }}
            >
          {/* {label} {required && <span className="required-asterisk"> *</span>}  {isHelpExist && <FcInfo title="Select from Help List" />} */}
          {label} {required && <span className="required-asterisk"> *</span>}  {isHelpExist && <FcInfo title="Double click or Ctrl + Enter for help" />}

        </label>}
{/* commented by amit on 16072025 */}
        {/* <Input
          innerRef={ref}
          required={required || false}
          type={type}
          className={`input-field ${type === "number" ? "text-end" : ""
            } ${inpClass}`}
          id={id || name}
          name={name} // Directly set name  added by akshay 
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          onDoubleClick={handleDoubleClick}
          disabled={disabled}
          onBlur={handleBlur} // Use custom handler
          onWheel={type === "number" ? (e) => e.target.blur() : undefined} // added by amit on dt.07.05.2025
          onKeyDown={ // added by amit on dt.07.05.2025
            type === "number"
              ? (e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }
              : undefined
          }
          {...otherProps}
        /> */}

      <Input
        innerRef={ref}
        required={required || false}
        type={type}
        className={`input-field ${type === "number" ? "text-end" : ""} ${inpClass} ${searchAllow ==true? 'searchableField':''}`}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // below attributes added by me ========>
        // autoComplete="new-off"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        // -----------------------------========>
        onDoubleClick={handleDoubleClick}
        disabled={disabled}
        onBlur={handleBlur}
         style={{ ...otherProps.style,}}
        onWheel={type === "number" ? (e) => e.target.blur() : undefined}
        onKeyDown={(e) => {
          // prevent scroll in number inputs
          if (type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
          }

          // ✅ handle Ctrl + Enter to trigger onDoubleClick
          if (e.ctrlKey && e.key === "Enter" && typeof onDoubleClick === "function") {
            onDoubleClick(e);
          }

          // You can add more custom key handlers here if needed
        }}
        {...otherProps}
      />


        {/* {error && <span className="input-error">{error}</span>} */}
      </div>
    );
  }
);

export default TextField;
