// import membershipModule from "../../../assets/images/membership.png";
// import purchaseModule from "../../../assets/images/purchase.png";
// import saleModule from "../../../assets/images/sale.png";
// import wareHouseModule from "../../../assets/images/werehouse.png";
// import FinanceModule from "../../../assets/images/Finance1.png";
// import AdminModule from "../../../assets/images/admin_pic.png";
// import hrModuleMenu from "../../../assets/images/humanResource.png";

// import ModuleButton from "../ModuleButton";
// import styles from "./style.module.scss";
// // import { hrModuleMenu } from "../../../utils/appHelpers/menuConfig";

// const WelcomeERP = () => {
//     const moduleImgList = [
//         {
//             module: membershipModule,
//             moduleName: "MEMBERSHIP MANAGEMENT",
//             routeName: "memberMgmnt",
//         },
//         {
//             module: purchaseModule,
//             moduleName: "PURCHASE MANAGEMENT",
//             routeName: "materialMgmnt",
//         },
//         {
//             module: saleModule,
//             moduleName: "SALE MANAGEMENT",
//             routeName: "saleMgmnt",
//         },
//         {
//             module: wareHouseModule,
//             moduleName: "WH MANAGEMENT",
//             routeName: "whMgmnt",
//         },
//         {
//             module: FinanceModule,
//             moduleName: "FINANCIAL MANAGEMENT",
//             routeName: "financeMgmnt",
//         },
//         {
//             module: AdminModule,
//             moduleName: "ADMIN MANAGEMENT",
//             routeName: "adminMgmnt",
//         },
//         // {
//         //     module: hrModuleMenu,
//         //     moduleName: "HR MANAGEMENT",
//         //     routeName: "hrMgmnt",
//         // },
//     ];
//     return (
//         <div className={styles.welcome__container}>
//             <div className={styles.moduleSection}>
//                 {moduleImgList.map((item, index) => (
//                     <ModuleButton key={index} item={item} />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default WelcomeERP;











import { useEffect, useMemo, useState } from "react";

import membershipModule from "../../../assets/images/membership.png";
import purchaseModule from "../../../assets/images/purchase.png";
import saleModule from "../../../assets/images/sale.png";
import wareHouseModule from "../../../assets/images/werehouse.png";
import FinanceModule from "../../../assets/images/Finance1.png";
import AdminModule from "../../../assets/images/admin_pic.png";

import ModuleButton from "../ModuleButton";
import styles from "./style.module.scss";
import { APP_PROD_API } from "../../../utils/api";
import { useSelector } from "react-redux";


const MODULE_LIST = [
    {
        module: membershipModule,
        moduleName: "MEMBERSHIP MANAGEMENT",
        module_name: "MEMBERSHIP",
        routeName: "memberMgmnt",
        moduleCode: "MEMBERSHIP",
    },
    {
        module: purchaseModule,
        moduleName: "PURCHASE MANAGEMENT",
        module_name: "PROCURMENT",
        routeName: "materialMgmnt",
        moduleCode: "PURCHASE",
    },
    {
        module: saleModule,
        moduleName: "SALE MANAGEMENT",
        module_name: "SALES",
        routeName: "saleMgmnt",
        moduleCode: "SALES",
    },
    {
        module: wareHouseModule,
        moduleName: "WH MANAGEMENT",
        module_name: "PRODUCTION",
        routeName: "whMgmnt",
        moduleCode: "WAREHOUSE",
    },

    {
        module: FinanceModule,
        moduleName: "FINANCIAL MANAGEMENT",
        module_name: "FINANCIALS",
        routeName: "financeMgmnt",
        moduleCode: "FINANCE",
    },
    {
        module: AdminModule,
        moduleName: "ADMIN MANAGEMENT",
        module_name: "ADMIN",
        routeName: "adminMgmnt",
        moduleCode: "ADMIN",
    },
];


const WelcomeERP = () => {
    const [moduleAccess, setModuleAccess] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deniedModule, setDeniedModule] = useState(null);

    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchModuleAccess = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${
                        APP_PROD_API.USER_MODULE_RIGHTS
                    }?appDivisionId=${
                        user.global_division_id
                    }&appFinYear=${
                        user.global_fin_year
                    }&user=${
                        user.id
                    }`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const result = await response.json();

                if (result.success) {
                    setModuleAccess(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch module access:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchModuleAccess();
        }
    }, [user]);

    /*
     * Keep ALL modules visible.
     * Attach the user's permission to each module.
     */
    const modulesWithAccess = useMemo(() => {
        return MODULE_LIST.map((module) => {
            // const permission = moduleAccess.find(
            //     (item) => item.moduleCode === module.moduleCode
            // );
            const permission = moduleAccess.find(
    (item) => item.module_name === module.module_name
);

            return {
                ...module,
                 moduleId: permission?.module_id,
                canAccess: permission?.canAccess === true,
            };
        });
    }, [moduleAccess]);

    /*
     * Called when user clicks a module
     * that they don't have permission to open.
     */
    const handleAccessDenied = (moduleName) => {
        setDeniedModule(moduleName);

        // Remove error after 3 seconds
        setTimeout(() => {
            setDeniedModule(null);
        }, 3000);
    };

    if (loading) {
        return <div>Loading modules...</div>;
    }

    return (
        <div className={styles.welcome__container}>
            {deniedModule && (
                <div className={styles.accessError}>
                    You don't have rights to open{" "}
                    <strong>{deniedModule}</strong>.
                </div>
            )}

            <div className={styles.moduleSection}>
                {modulesWithAccess.map((item) => (
                    <ModuleButton
                        key={item.moduleCode}
                        item={item}
                        onAccessDenied={handleAccessDenied}
                    />
                ))}
            </div>
        </div>
    );
};

export default WelcomeERP;