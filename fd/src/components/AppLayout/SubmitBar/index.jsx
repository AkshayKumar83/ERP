import Button from "../../Button";
import styles from "./style.module.scss";
import TdsDetails from "../../../components/FormsComponent/GlMaster/TdsDetails"

function SubmitBar({
    handleSubmit = () => {},
    handleCancel = () => {},
    formStatus,
    currentRecordNo,
    totalRecordCount,
    pageCount = 0,
    totalPageCount=0,
    isSingleQuery=false,
    extraBtn = []
}) {
    return (
        <div className={styles["submitbar__container"]}>
            <div className={`${styles["show__form__status"]} ${ pageCount > 0 ? styles["with__page__count"] : ""}`}>
                <div>{formStatus}</div>
                {formStatus === "Query" && (<div>{`${parseInt(currentRecordNo) + 1} / ${totalRecordCount}`}</div>)}
                {pageCount > 0 && (
                    <div className={styles["page__count"]}>
                        Page: {pageCount}/{totalPageCount}
                    </div>
                )}
            </div>

            {extraBtn.length ? ( 
                <div className={styles["operation__btn"]}>
                    {extraBtn.map((btn, index)=>(
                         <Button
                         key={index}
                         onClick={()=>{btn.handleClick()}}
                         disabled={btn?.disabled || false}
                     >
                         {btn.name}
                     </Button>
                    ))}
                </div>
            ) : (
                <></>
            )}  

          
            

            <div className={styles["operation__btn"]}>
                <Button
                    onClick={handleSubmit}
                    disabled={formStatus === "Insert" || formStatus === "Update"? false: true}
                >
                    Submit
                </Button>
                <Button
                    onClick={handleCancel}
                    disabled={formStatus === "Insert" || formStatus === "Update"? false: true}
                >
                    Cancel
                </Button> 
            </div>
        </div>
    );
}

export default SubmitBar;