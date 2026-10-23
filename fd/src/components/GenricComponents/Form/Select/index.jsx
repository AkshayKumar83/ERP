import classNames from "classnames";

import styles from "../style.module.scss";

const SelectField = ({
  selectClassName,
  name,
  placeholder,
  disabled = false,
  required = true,
  value = "",
  options = [],
  onChange,
  ...rest
}) => {
  return (
    <select
      className={classNames(
        {
          [styles["form__select"]]: true,
        },
        selectClassName
      )}
      name={name}
      onChange={onChange}
      value={value}
      disabled={disabled}
      required={required}
      {...rest}
    >
      {!!placeholder && <option value="">{placeholder}</option>}
      {Array.isArray(options) &&
        options?.map((option, index) => (
          // <option value={option?.value} key={option?.value}> // changed key as index
          <option value={option?.value} key={index}>
            {option?.label}
          </option>
        ))}
    </select>
  );
};

export default SelectField;






