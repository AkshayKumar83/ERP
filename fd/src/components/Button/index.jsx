import classNames from "classnames";

import styles from "./style.module.scss";

const Button = ({
    type = "button",
    children,
    className = "",
    onClick = () => {},
    disabled = false,
    ...rest
}) => {
    return (
        <button className={classNames({
            [styles["btn"]]: true
        }, className)} type={type} onClick={onClick} disabled={disabled} {...rest}>
            {children}
        </button>
    );
};

export default Button;