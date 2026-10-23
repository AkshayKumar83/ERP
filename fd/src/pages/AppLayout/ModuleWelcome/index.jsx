import { Link, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    adminModuleMenu,
    finModuleMenu,
    membershipModuleMenu,
    purchaseModuleMenu,
    saleModuleMenu,
    whModuleMenu,
} from "../../../utils/constants";
import Loader from "../../../components/GenricComponents/Loader";
import NavigateBtn from "../NavigateBtn";

const ModuleWelcome = () => {
    const [formList, setFormList] = useState([]);
    const [moduleMenuFormList, setModuleMenuFormList] = useState([]);
    const [loading, setLoading] = useState(true); // loading before form render
    const param = useParams();

    useEffect(() => {
        function handleFormList() {
            switch (param.moduleId) {
                case "memberMgmnt":
                    setModuleMenuFormList(membershipModuleMenu);
                    break;
                case "materialMgmnt":
                    setModuleMenuFormList(purchaseModuleMenu);
                    break;
                case "adminMgmnt":
                    setModuleMenuFormList(adminModuleMenu);
                    break;
                case "saleMgmnt":
                    setModuleMenuFormList(saleModuleMenu);
                    break;
                case "whMgmnt":
                    setModuleMenuFormList(whModuleMenu);
                    break;
                case "financeMgmnt":
                    // setFormList(finModuleMenu);
                    setModuleMenuFormList(finModuleMenu);
                    break;
                default:
                    setFormList([]);
                    break;
            }

        }
        handleFormList();
        setLoading(false);
    }, [param.moduleId]);

    if (loading) {
        return (
            <div className={"parent_loader__container"}>
                <Loader />
            </div>
        );
    }

    return (
        <div >
            {/* Render MenuBar with the dynamic formList */}
            <div >
                {/* <MenuBar formList={formList} /> */}
            </div>
            {/* Outlet will dynamically render the selected form component */}
            <div >
                {formList.length ? (
                    <div >
                        <NavigateBtn />
                    </div>
                ) : (
                    <Outlet context={{ moduleMenuFormList }} />
                )}
            </div>
        </div>
    );
};

export default ModuleWelcome;
