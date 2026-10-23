

import { IoHome } from "react-icons/io5";
import { TbDoorExit } from "react-icons/tb";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";

import styles from './style.module.scss'


const NavigateBtn = () => {
    return (
        <div className={styles["navigate_btn_container"]}>
            <Link to={"/erp"}>
                <Button to={"/erp"}>
                    <IoHome />
                    {/* Home */}
                </Button>
            </Link>
            <Link to={"/"}>
                <Button>
                    <TbDoorExit />
                    {/* Exit */}
                </Button>
            </Link>
        </div>
    );
};

export default NavigateBtn;
