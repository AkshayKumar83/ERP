import classNames from "classnames";

import styles from "./style.module.scss";

const Title = ({
    large = false,
    medium = false,
    rightSection = <></>,
    children
}) => {
    return (
        <div className={classNames({
            [styles["title"]]: true,
            [styles["title--large"]]: large,
            [styles["title--medium"]]: medium
        })}>
            <span>{children}</span>
            <div>{rightSection}</div>
        </div>
    )
};

export default Title;