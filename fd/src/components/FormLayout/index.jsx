import classNames from "classnames";
import styles from "./style.module.scss";

const FormLayout = (props) => {
    // added className for styling and formLayoutClassName for custom styles in individulas component
    //if any code brakes then uncomment className and commented out the props.formLayoutClassname
    return (
        <form
            key={props.id}
            onSubmit={(e) => e.preventDefault()}
            id={props.id}
            className={classNames(
                {
                    [styles["form__layout"]]: true,
                },
                props.formLayoutClassName
            )}
            //    className={styles["form__layout"]}
        >
            {props.children}
        </form>
    );
};

export default FormLayout;
