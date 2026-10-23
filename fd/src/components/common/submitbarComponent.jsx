import React from "react";
import { CardFooter } from "reactstrap";
import ButtonUi from "../basic/button";
import { useSubmitBarLogic } from "./submitbarLogic";

const Submitbar = ({
    formStatus = "",
    currentRecordNo = 0,
    totalRecordCount = 0,
    pageCount,
    totalPageCount,
    isSingleQuery,
    handleSubmit = () => { },
    handleSearch = () => { },
    handleCancel,
    extraBtn = [],
}) => {
    const {
        isSubmitDisabled,
        isCancelDisabled,
        getFormStatusText,
        getRecordCountText,
        extraBtn: extraBtnLogic,
    } = useSubmitBarLogic({
        formStatus,
        currentRecordNo,
        totalRecordCount,
        pageCount,
        totalPageCount,
        isSingleQuery,
        handleSubmit,
        handleCancel,
        extraBtn,
    });

    return (
        <CardFooter className={"form-footer"}>
            {/* Meta Data about Records */}
            <div className={"form-footer-left"}>
                <ButtonUi color="light" disabled outline>
                    <div>{getFormStatusText()}</div>
                </ButtonUi>
            </div>
            
            {/* Rendering other buttons as per form requirement  */}
            <div className="form-footer-center">
                {extraBtn.length > 0 && (
                    extraBtn.map(({onClick,name, ...props}, index) => (
                        <ButtonUi
                            key={index}
                            // onClick={(e)=>{ onClick()}} 
                            onClick={onClick}
                            {...props}
                        >
                            {name}
                        </ButtonUi>
                    ))
                )}
            </div>

            {/* Submit and Cancel buttons */}
            <div className={"form-footer-right"}>
                <div className="d-flex" style={{ gap: "16px" }}>
                    <ButtonUi 
                        // id = 'empty-formStatus' // commented by amit on dt 24.09.2025 and added below id
                        id = 'cancelBtn'
                        color="danger" 
                        outline 
                        type="button" 
                        onClick={handleCancel} 
                        disabled={isCancelDisabled}
                    >
                        Cancel
                    </ButtonUi>
                    <ButtonUi 
                        id='submit-btn'
                        color="primary" 
                        type="button" 
                        onClick={formStatus==='Search'? handleSearch : handleSubmit} 
                        disabled={isSubmitDisabled}
                    >
                        {formStatus === 'Search' ? 'Search' : 'Submit'}
                    </ButtonUi>
                </div>
            </div>
        </CardFooter>
    );
};

export default Submitbar;
