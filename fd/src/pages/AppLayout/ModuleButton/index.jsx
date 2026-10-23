
// import { Link } from "react-router-dom";
// import styles from "./style.module.scss";

// const ModuleButton = ({ item }) => {
//   const { module, moduleName, routeName } = item;

//   return (
//     <Link to={`/module/${routeName}`} className={styles.moduleContainer}
//     >
//       <img src={module} className={styles.moduleImage} alt={moduleName} />
//       <p className={styles.moduleName}>{moduleName}</p>
//     </Link>
//   );
// };

// export default ModuleButton;





import { Link } from "react-router-dom";
import styles from "./style.module.scss";

const ModuleButton = ({ item, onAccessDenied }) => {
    const {
        module,
        moduleName,
        routeName,
        moduleId,
        canAccess,
    } = item;

    const handleClick = (event) => {
        if (!canAccess) {
            event.preventDefault();

            onAccessDenied?.(moduleName);
        }
    };

    // console.log('item', item)

    return (
        <Link
            to={`/module/${routeName}`}
            state={{item}}
            onClick={handleClick}
            className={`${styles.moduleContainer} ${
                !canAccess ? styles.moduleDenied : ""
            }`}
        >
            <img
                src={module}
                className={styles.moduleImage}
                alt={moduleName}
            />

            <p className={styles.moduleName}>
                {moduleName}
            </p>
        </Link>
    );
};

export default ModuleButton;