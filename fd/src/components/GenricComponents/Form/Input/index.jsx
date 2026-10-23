
import classNames from "classnames";
import styles from "../style.module.scss";

const InputField = ({
  inputClassName,
  type = "text",
  name,
  placeholder,
  disabled = false,
  required = false,
  checked = false,
  value = "",
  onChange = () => {},
  ...rest
}) => {
  return (
    <input
      className={classNames(
        {
          [styles["form__input"]]: true,
          [styles["form__input--checkbox"]]: ["checkbox", "radio"].includes(
            type || ""
          ),
          [styles["form__input--date"]]: type === "date",
        },
        inputClassName
      )}
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      checked={type === "checkbox" || type === "radio" ? checked : undefined}
      disabled={disabled}
      required={required}
      {...rest}
    />
  );
};

export default InputField;

