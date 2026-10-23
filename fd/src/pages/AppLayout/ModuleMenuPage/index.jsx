// import { useOutletContext, useNavigate, useParams } from "react-router-dom";
// // import styles from "./style.module.scss";
// import NavigateBtn from "../NavigateBtn";
// import Button from "../../../components/Button";
// // import { FaList } from "react-icons/fa";
// import { AiOutlineForm } from "react-icons/ai";
// import { GrDocumentPerformance } from "react-icons/gr";
// import { TbReportAnalytics } from "react-icons/tb";
// import { useState } from "react";

// const ModuleMenuPage = () => {
//     const { moduleMenuFormList } = useOutletContext();
//     const [getFormList, setGetFormList] = useState(moduleMenuFormList.filter(item=>item.name === 'Form'))
//     const [getReportList, setGetReportList] = useState(moduleMenuFormList.filter(item=>item.name != 'Form'))
//     const { moduleId } = useParams();
//     const navigate = useNavigate();

//     // const handleButtonClick = (moduleItem) => {
//     //     if(window.location.pathname.split('/')[1] === 'module'){
//     //         navigate(`/module/${moduleId}/form-items/${moduleItem.id}`, {
//     //             state: { moduleItem },
//     //         });
//     //     }else{          
//     //         navigate(`/report/${moduleId}/form-items/${moduleItem.id}`, {
//     //             state: { moduleItem },
//     //         });
//     //     }
//     // };


//     // if(window.location.pathname.split('/')[1] === 'module'){
//         return (
//             <div >
//                 {/* <div className={styles.module__menu__container}>
//                     <div className={styles.header}>
//                         <h2 className={styles.title}>
//                             <AiOutlineForm className={styles.title__icon} />
//                             Forms
//                         </h2>
//                     </div>
//                     <div className={styles.scrollable__container}>
//                         <div className={styles.form__menu__btn__container}>
//                             {getFormList.map((module) => (
//                                 <Button
//                                     key={module.id}
//                                     onClick={() => handleButtonClick(module)}
//                                     className={styles.module__button}
//                                 >
//                                     {module.formName}
//                                 </Button>
//                             ))}
//                         </div>
//                     </div>
//                 </div> */}
//                 {/* <NavigateBtn /> */}
//             </div>
//         );
//     // }
//     // if(window.location.pathname.split('/')[1]=== 'report'){
//     //     return (
//     //         <div className={styles.module__menu__wrapper}>
//     //             <div className={styles.module__menu__container}>
//     //                 <div className={styles.header}>
//     //                     <h2 className={styles.title}>
//     //                         <FaList className={styles.title__icon} />
//     //                         Reports
//     //                     </h2>
//     //                 </div>
//     //                 <div className={styles.scrollable__container}>
//     //                     <div className={styles.form__menu__btn__container}>
//     //                         {getReportList.map((module) => (
//     //                             <Button
//     //                                 key={module.id}
//     //                                 onClick={() => handleButtonClick(module)}
//     //                                 className={styles.module__button}
//     //                             >
//     //                                 {module.formName}
//     //                             </Button>
//     //                         ))}
//     //                     </div>
//     //                 </div>
//     //             </div>
//     //             <NavigateBtn />
//     //         </div>
//     //     );
//     // }
// };

// export default ModuleMenuPage;

import { useOutletContext, useNavigate, useParams } from "react-router-dom";
// import styles from "./style.module.scss";
import NavigateBtn from "../NavigateBtn";
import Button from "../../../components/Button";
// import { FaList } from "react-icons/fa";
import { AiOutlineForm } from "react-icons/ai";
import { GrDocumentPerformance } from "react-icons/gr";
import { TbReportAnalytics } from "react-icons/tb";
import { useState } from "react";

import PurchaseDashboard from "../ModuleDashboard/PurchaseDashboard";
import MembershipDashboard from "../ModuleDashboard/MembershipDashboard";
import SalesDashboard from "../ModuleDashboard/SalesDashboard";
import FinanceDashboard from "../ModuleDashboard/FinanceDashboard";
import WarehouseDashboard from "../ModuleDashboard/WarehouseDashboard";

const ModuleMenuPage = () => {
    const { moduleMenuFormList } = useOutletContext();
    const [getFormList, setGetFormList] = useState(moduleMenuFormList.filter(item=>item.name === 'Form'))
    const [getReportList, setGetReportList] = useState(moduleMenuFormList.filter(item=>item.name != 'Form'))
    const { moduleId } = useParams();
    const navigate = useNavigate();




    switch (moduleId) {

        case "materialMgmnt":
            return <PurchaseDashboard />;

        case "memberMgmnt":
            return <MembershipDashboard />;

        case "saleMgmnt":
            return <SalesDashboard />;

        case "financeMgmnt":
            return <FinanceDashboard />;

        case "whMgmnt":
            return <WarehouseDashboard />;

        default:
            return null;
    }
};

export default ModuleMenuPage;
