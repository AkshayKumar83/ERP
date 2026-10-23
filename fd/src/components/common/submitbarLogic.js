import { useState, useEffect } from "react";

export const useSubmitBarLogic = ({
    queryMode,
    formStatus,
    currentRecordNo,
    totalRecordCount,
    pageCount,
    totalPageCount,
    isSingleQuery,
    handleSubmit,
    handleCancel,
    extraBtn,
}) => {
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [isCancelDisabled, setIsCancelDisabled] = useState(true);

    useEffect(() => {
        setIsSubmitDisabled(formStatus !== "Insert" && formStatus !== "Update" && formStatus !== "Search");
        setIsCancelDisabled(formStatus !== "Insert" && formStatus !== "Update" && formStatus !== "Search");
    }, [formStatus]);



    const getFormStatusText = () => {
        if (formStatus === "Query" && pageCount > 0) {
            return `${formStatus} - ${getRecordCountText()}`;
        }
        return formStatus;
    };

    const getRecordCountText = () => {
        if (formStatus === "Query") {
            return `${parseInt(currentRecordNo) + 1} / ${totalRecordCount}`;
        }
        return "";
    };

    return {
        isSubmitDisabled,
        isCancelDisabled,
        getFormStatusText,
        getRecordCountText,
        queryMode,
        extraBtn,
    };
};

