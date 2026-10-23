import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import NavigateBtn from "../NavigateBtn";
import { FaClipboardList, FaArrowLeft } from "react-icons/fa";

const FormItemsPage = () => {
    const location = useLocation();
    const { moduleId } = useParams();
	
    const navigate = useNavigate();
    const moduleItem = location.state?.moduleItem;

    if (!moduleItem) {
        return (
            <div className={styles.error__container}>
                <h2 className={styles.error__message}>No form items found.</h2>
                <Link to={`/module/${moduleId}`} className={styles.back__link}>
                    Go back to module menu
                </Link>
            </div>
        );
    }
	console.log(window.location.pathname.split('/')[1])
    return (
        <div className={styles.form__items__wrapper}>
            <div className={styles.form__items__container}>
                <div className={styles.header}>
                    <button
                        onClick={() => navigate(-1)}
                        className={styles.back__button}
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h2 className={styles.title}>
                        <FaClipboardList className={styles.title__icon} />
                        {moduleItem.formName}
                    </h2>
                </div>
                <div className={styles.scrollable__container}>
                    <ul className={styles.item__list}>
                        {moduleItem.item.map((item) => (
                            <li key={item.id} className={styles.item}>
                                <Link
                                    to={`/${window.location.pathname.split('/')[1]}/${moduleId}/${item.url}`}
                                    className={styles.item__link}
                                >
                                    <span className={styles.item__name}>
                                        {item.formName}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <NavigateBtn />
        </div>
    );
};

export default FormItemsPage;
