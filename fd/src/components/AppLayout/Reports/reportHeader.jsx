
// import React from "react";
// import styles from "./style.module.scss";
// import eddalLogo from "../../../assets/images/eddal_logo.jpg";

// import ViewColumnIcon from '@mui/icons-material/ViewColumn';
// import DownloadIcon from "@mui/icons-material/Download";
// import CloseIcon from "@mui/icons-material/Close";

// const ReportHeader = ({ onColumnClick, onExportClick, onExitClick }) => {
//   return (
//     <div className={styles.reportHeader}>
      
//       {/* Left Logo */}
//       <div className={styles.leftLogo}>
//         <img src={eddalLogo} alt="logo" />
//       </div>

//       {/* Right Icons */}
//       <div className={styles.iconGroup}>
        
//         <div className={styles.iconBox} onClick={onColumnClick}>
//           <ViewColumnIcon />
//           <span>Columns</span>
//         </div>

//         <div className={styles.iconBox} onClick={onExportClick}>
//           <DownloadIcon />
//           <span>Export</span>
//         </div>

//         <div className={`${styles.iconBox} ${styles.exitBtn}`} onClick={onExitClick}>
//           <CloseIcon />
//           <span>Exit</span>
//         </div>

//       </div>
//     </div>

//   );
// };

// export default ReportHeader;

import React from "react";
import styles from "./style.module.scss";
import eddalLogo from "../../../assets/images/eddal_logo.jpg";

import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

const ReportHeader = ({ 
  onColumnClick, 
  onExportClick, 
  onExitClick, 
  showActions = false  // ← NEW: Prop to control Columns & Export visibility
}) => {
  return (
    <div className={styles.reportHeader}>
      
      {/* Left Logo – same */}
      <div className={styles.leftLogo}>
        <img src={eddalLogo} alt="logo" />
      </div>

      {/* Right Icons – conditional for Columns & Export */}
      <div className={styles.iconGroup}>
        
        {/* ← NEW: Show only if data loaded */}
        {showActions && (
          <div className={styles.iconBox} onClick={onColumnClick}>
            <ViewColumnIcon />
            <span>Columns</span>
          </div>
        )}

        {/* ← NEW: Show only if data loaded */}
        {showActions && (
          <div className={styles.iconBox} onClick={onExportClick}>
            <DownloadIcon />
            <span>Export</span>
          </div>
        )}

        {/* Exit always visible */}
        <div className={`${styles.iconBox} ${styles.exitBtn}`} onClick={onExitClick}>
          <CloseIcon />
          <span>Exit</span>
        </div>

      </div>
    </div>
  );
};

export default ReportHeader;
