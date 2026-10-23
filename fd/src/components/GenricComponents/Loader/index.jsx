// import React from "react";
// import PropTypes from "prop-types";
// import styles from "./style.module.scss";

// const Loader = ({ overlayContainer = false }) => {
//   const containerClass = overlayContainer
//     ? styles.overlay_loader_container
//     : styles.loader_container;
//   return (
//     <div className={containerClass}>
//       <div className={styles.loader}></div>
//     </div>
//   );
// };

// Loader.propTypes = {
//   overlayContainer: PropTypes.bool,
// };

// export default Loader;


import React from "react";
import PropTypes from "prop-types";
import styles from "./style.module.scss";

const Loader = ({ overlayContainer = false }) => {
  const containerClass = overlayContainer
    ? styles.overlay_loader_container
    : styles.loader_container;

  return (
    <div className={containerClass}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>Loading, please wait...</p>
    </div>
  );
};

Loader.propTypes = {
  overlayContainer: PropTypes.bool,
};

export default Loader;

