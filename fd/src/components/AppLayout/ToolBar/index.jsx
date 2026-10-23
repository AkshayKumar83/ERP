import Button from "../../Button";
import { LuArrowBigLeftDash } from "react-icons/lu"; //first
import { LuArrowBigLeft } from "react-icons/lu"; //pre
import { LuArrowBigRight } from "react-icons/lu"; // next
import { LuArrowBigRightDash } from "react-icons/lu"; //last
import { RiUser2Fill } from "react-icons/ri";
import { ImExit } from "react-icons/im";
import { GrPrint } from "react-icons/gr";
import { FaStamp } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { RxUpdate } from "react-icons/rx";
import { query_data } from "../../../lib";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import styles from "./style.module.scss";
import toast from "react-hot-toast";

function ToolBar({
    handleOperation = () => {},
    formStatus,
    QUERY_API,
    currentRecordNo = 0,
    handleOffset,
    totalRecordCount,
    setupQueryData,
    handleCancel,
    setLoading = ()=>{},
    formName = 'FORM_NAME',
    isQueryReqOnNextPreBtn = true, // by default i do it true
    isQueryReqOnInsertBtn = false, // if query data required on insert btn
    queryDataOnpage = 0,
    pageCount = 0,
    whereClauseForQuery = {},
    searchRecordApi='',
    formPayload,
    formData={},
    authority={insert:'Y', update:'Y'}
}) {
    const [isFocused, setIsFocused] = useState(false); // State to track focus on locate-btn div
    const [activeButton, setActiveButton] = useState(""); // State to track the active button by key press
    const [queryBtnClickCount, setQueryBtnClickCount] = useState(1)

    const clickTimer = useRef(null)

    const param = useParams();
    const navigate = useNavigate();
    const user = useSelector((store)=>store?.auth?.user)

    function handleNavigate() {
        if (!formStatus) {
            navigate(`/${window.location.pathname.split('/')[1]}/${param.moduleId}`);
        } else {
            handleCancel();
        }
    }
    
    // QUERY BTN FEATURING LOGICS ---
    const handleSingleClick = () => {
        console.log("Single Click");
        console.log(queryBtnClickCount)
        handleOperation("Search");
        if (queryBtnClickCount === 2) {
            console.log('query search function call')
            handleSearchRecordOnQuery({...formPayload,  type: formData?.type || ""});
            handleOperation("Query");
        }
        setQueryBtnClickCount((prev) => prev + 1);
    };
    

    const handleSearchRecordOnQuery = async(formPayload)=>{
        let API = QUERY_API
        if(searchRecordApi){ API = searchRecordApi}
        try {
            const data = await fetch(`${API}`, {
                method: "POST",
                body: JSON.stringify(formPayload),
                headers: {"Content-Type": "application/json",},
                credentials:'include'
            });

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // for some form there query data required in INSERT MODE
    function queryDataRequiredOnInsert(btnClicked){
        if(authority.insert !=='Y'){
            toast.error('Insert not Allowed! Please contact Administrator')
            return
        }
        if(isQueryReqOnInsertBtn){
            handleOperation(btnClicked)
            fetchData(btnClicked)
            handleOffset(0)
        }else{
            handleOperation(btnClicked)
        }
    }
    
    function handleUpdate(btnClicked){
        if(authority.update !=='Y'){
            toast.error('Update not Allowed! Please contact Administrator')
            return
        }
        handleOperation(btnClicked)
    }

    // this function will bring the data as per formStatus/btn clicked in tool-bar
    async function fetchData(btnClicked) {
        if (QUERY_API === null || QUERY_API === undefined) {
            return;
        }
        //api will not hit
        if(!isQueryReqOnNextPreBtn){
            if(btnClicked === 'Next' ||btnClicked === 'Prev' || btnClicked === 'First' || btnClicked === 'Last'){
                return;
            }
        }

        // todo: write the logic for not increasing currentRecordNo if totalRecordCount = 0

        let newRecord;
        // setLoading(true);
        switch (btnClicked) {
            case "Next":
                if(queryDataOnpage){
                    newRecord = currentRecordNo
                }else{
                    newRecord = currentRecordNo + 1;
                }
                if (parseInt(newRecord) === parseInt(totalRecordCount)) {
                        // toast.error("No More Data");
                        return;
                    }
                    handleOffset(currentRecordNo + 1);
                break;
            case "Prev":
                if(queryDataOnpage){
                    newRecord = 50// temperarly i minus the queryDataOnpage   
                }else{
                   if (currentRecordNo >= 1) {
                       newRecord = currentRecordNo - 1;
                       handleOffset(newRecord);
                   } else {
                       handleOffset(0);
                       return;
                   }
                }
                break;
            case "First":
            case "Query": {

                handleOffset(0);
                newRecord = 0;
                break;
            }
            case "Insert":{
                if(!isQueryReqOnInsertBtn){
                    return
                }
                newRecord = 0;
                break;
            }
            case "Last": {
                newRecord = totalRecordCount - 1;
                handleOffset(newRecord);
                break;
            }
            default:
                break;
        }

        try {
            const data = await query_data(`${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}`);
            // console.log("Fetched data:", data);
            setupQueryData(data, btnClicked);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
   
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (formStatus === "Query" && isFocused) {
                let btnClicked = "";
                switch (event.key) {
                    case "ArrowRight": // Next record
                        btnClicked = "Next";
                        fetchData(btnClicked);
                        break;
                    case "ArrowLeft": // Previous record
                        btnClicked = "Prev";
                        fetchData(btnClicked);
                        break;
                    case "ArrowUp": // First record
                        btnClicked = "First";
                        fetchData(btnClicked);
                        break;
                    case "ArrowDown": // Last record
                        btnClicked = "Last";
                        fetchData(btnClicked);
                        break;
                    default:
                        break;
                }

                if (btnClicked) {
                    setActiveButton(btnClicked); // Set the active button state
                }
            }
        };

        // Add event listener for keydown
        window.addEventListener("keydown", handleKeyDown);

        // Cleanup listener when component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [formStatus, currentRecordNo, totalRecordCount]); // Add dependencies

    // Handle focusing on locate-btn div
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <div className={styles["toolbar__container"]}>
            <div className={styles["operation-btn"]}>
                <Button
                    disabled={ formStatus === "" || formStatus ==="Search"? false : true }
                    // onClick={handleClickOnQuery}  
                    onClick={() => {
                        handleOperation("Query");
                        fetchData("Query");
                        handleOffset(0);
                    }}
                >
                    Query
                </Button>
                <Button
                    disabled={formStatus === "" ? false : true }
                    onClick={() => queryDataRequiredOnInsert("Insert")}
                >
                    Insert
                </Button>
                <Button
                    disabled={ formStatus === "Query" || formStatus === "" ? false : true }
                    onClick={() => handleUpdate("Update")}
                >
                    <RxUpdate /> Update
                </Button>
                <Button
                    disabled={ formStatus === "Delete" || formStatus === "" ? false : true }
                    onClick={() => console.log('delete btn is click')}
                >
                    <RiDeleteBin5Fill /> Delete
                </Button>
                <Button
                    disabled={ formStatus === "Query" || formStatus === "" || formStatus === "Search"? false : true }
                    onClick={() => handleNavigate()}
                >
                    <ImExit /> Exit
                </Button>
                <Button
                    disabled={ formStatus === "Authorize" || formStatus === "Query" || formStatus === "" ? false : true }
                    onClick={() => console.log('Authorize btn click')}
                >
                    <FaStamp /> Authorize
                </Button>
                <Button
                    disabled={ formStatus === "Print" || formStatus === "Query" || formStatus === "" ? false : true }
                    onClick={() => console.log("print btn click")}
                >
                    <GrPrint /> Print
                </Button>
            </div>
            {formStatus === "Query" ? (
                <div
                    className={styles["locate-btn"]}
                    tabIndex={0} // Make it focusable
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                >
                    <Button
                        className={ activeButton === "First" ? styles["active"] : "" }
                        onClick={() => fetchData("First")}
                    >
                        <LuArrowBigLeftDash />
                    </Button>
                    <Button
                        className={ activeButton === "Prev" ? styles["active"] : "" }
                        onClick={() => fetchData("Prev")}
                    >
                        <LuArrowBigLeft />
                    </Button>
                    <Button
                        className={activeButton === "Next" ? styles["active"] : ""}
                        onClick={() => fetchData("Next")}
                    >
                        <LuArrowBigRight />
                    </Button>
                    <Button
                        className={ activeButton === "Last" ? styles["active"] : ""}
                        onClick={() => fetchData("Last")}
                    >
                        <LuArrowBigRightDash />
                    </Button>
                </div>
            ) : (
                ""
            )}
            <div className={styles['userName']}><RiUser2Fill/> <span>{user?.username}</span></div>
            <div className={styles['formName']}>{formName}</div>
        </div>
    );
}

export default ToolBar;
