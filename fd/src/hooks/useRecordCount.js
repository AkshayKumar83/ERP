// hooks/useRecordCount.js
import { useState } from "react";

export const useRecordCount = () => {
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [totalPageCount, setTotalPageCount] = useState(0);

    // using this we send the offset in api to get back data on next/pre btn click
    const handleOffset = (data) => {
        setCurrentRecordNo(data);
    };

    return {
        currentRecordNo,
        setCurrentRecordNo,
        totalRecordCount,
        setTotalRecordCount,
        handleOffset,
        pageCount,
        setPageCount,
        totalPageCount,
        setTotalPageCount,
    };
};
