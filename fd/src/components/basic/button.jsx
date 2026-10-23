import React from "react";
import { Button } from "reactstrap";

const ButtonUi = ({
  color = "primary",
  outline = false,
  onClick = ()=>{},
  disabled = false,
  className = "",
  icon,
  iconPos = "after",
  children = "",
  style = {},
  ...rest
}) => (
  <Button
    color={color}
    className={`${className}`}
    outline={outline}
    onClick={onClick}
    disabled={disabled}
    {...rest}
    style = {style}
  >
    {iconPos == "before" && icon}
    {children}
    {iconPos == "after" && icon}
  </Button>
);

export default ButtonUi;
