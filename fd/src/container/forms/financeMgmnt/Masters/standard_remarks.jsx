import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import StandardRemarksDetails from "./standard_remarks_dtl";
import { standardRemarkData } from "./standard_remarks_helper";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { validateForm } from "../../../../utils/fn";

const StandardRemarks = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState([]);
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
        useFormStatus();
    const [originalFormData, setOriginalFormData] = useState([]);
    const [deletedRecord, setDeletedRecord] = useState([]);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const tabs = ["Standard Remarks"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    function handleOffset(data) {
        setCurrentRecordNo(data);
    }

    function formCleanup() {
        setFormData([]);
        setOriginalFormData([]);
        setDeletedRecord([]);
        releaseFormStatus();
    }

    const handleCancel = useCallback(() => {
        formCleanup();
    }, []);

    const handleDeleteRow = useCallback(
        (data, rowIndex) => {
            if (formStatus === "Update" && data.remark_id) {
                setDeletedRecord((prev) => [...prev, data]);
            }
            setFormData((prev) => prev.filter((_, idx) => idx !== rowIndex));
            setFocusedRowIndex(0);
        },
        [formStatus]
    );

    const handleChange = useCallback(
        (name, value, index, event) => {
            if (!["Insert", "Update", "Search"].includes(formStatus)) {
                return;
            }

            const cursorPosition = event.target.selectionStart;
            let newVal = value.toUpperCase();

            setFormData((prevData) => {
                const newData = [...prevData];
                newData[index] = { ...newData[index], [name]: newVal };
                return newData;
            });

            setTimeout(() => {
                event.target.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        },
        [formStatus]
    );

    //  const triggerAddRow = useCallback(() => {
    //   const lastRow = formData[formData.length - 1];

    //   // Trimmed value check
    //   if (!lastRow.remark_desc?.trim() || !lastRow.remark_cat?.trim()) {
    //     toast.error("Please fill in Remark and Module before adding a new row.");
    //     return;
    //   }

    //   // Duplicate check
    //   const isDuplicate = formData.some(
    //     (row, index) =>
    //       index !== formData.length - 1 &&
    //       row.remark_cat?.trim().toUpperCase() === lastRow.remark_cat?.trim().toUpperCase()
    //   );

    //   if (isDuplicate) {
    //     toast.error("Duplicate Module found. Please enter a unique Module.");
    //     return;
    //   }

    //   // If validation passed, add new row
    //   setFormData((prevData) => {
    //     const newData = [
    //       ...prevData,
    //       { ...standardRemarkData[0] }, // Empty row structure
    //     ];
    //     setFocusedRowIndex(newData.length - 1);
    //     return newData;
    //   });
    // }, [formData]);

    const triggerAddRow = useCallback(() => {
        const lastRow = formData[formData.length - 1];

        // if (!lastRow.remark_desc?.trim() || !lastRow.remark_cat?.trim()) {
        //   toast.error("Please fill in Remark and Module before adding a new row.");
        //   return;
        // }

        const StandardRemarks = validateForm(
            "standard-remark",
            "Standard Remarks"
        );
        if (!StandardRemarks) return;

        // Duplicate check
        let isDuplicate = false;

        formData.forEach((row, index) => {
            if (
                index !== formData.length - 1 &&
                row.remark_cat?.trim().toUpperCase() ===
                    lastRow.remark_cat?.trim().toUpperCase()
            ) {
                isDuplicate = true;
                toast.error(
                    `Duplicate Module found in Inserted Recode. Module: "${row.remark_cat}" is already exist.`
                );
            }
        });

        if (isDuplicate) return;

        // If validation passed, add new row
        setFormData((prevData) => {
            const newData = [...prevData, { ...standardRemarkData[0] }];
            setFocusedRowIndex(newData.length - 1);
            return newData;
        });
    }, [formData]);

    const setupQueryData = useCallback(
        (queryData, btnClicked) => { 

             
            if (queryData?.type === "not_found" && btnClicked === 'Query') {  

            //    // console.log('not found', queryData?.totalCount, formStatus)
            //      if (queryData?.totalCount === 0 && formStatus === 'Insert') { 

            //     //alert(formStatus, 'vfvv') 
            //     console.log(queryData?.totalCount, formStatus )
            //     return
            // }
               
                setFormData([]);
                setOriginalFormData([]);
                setTotalRecordCount(0);
                toast.error(queryData.message || "No data found");
                handleCancel();
                return;
            }

            //  Normal case
            setFormData(queryData?.stdRemark || []);
            setOriginalFormData(queryData?.stdRemark || []);
            setFocusedRowIndex(0);

            if (["Insert", "Query"].includes(btnClicked)) {
                setTotalRecordCount(queryData?.totalCount || 0);
            }
        },
        [formStatus, currentRecordNo]
    );

    function isRecordModified(original, updated) {
        // Compare all keys of original with updated
        for (let key in original) {
            if (
                original[key]?.toString().trim() !==
                updated[key]?.toString().trim()
            ) {
                return true;
            }
        }
        return false;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

     
            const StandardRemarks = validateForm("standard-remark", "Standard Remarks" );
            if (!StandardRemarks) {  
                return;
            }
       

        // Duplicate Module Check
        const moduleSet = new Set();
        let isDuplicate = false;

        for (let i = 0; i < formData.length; i++) {
            const module = formData[i].remark_cat?.trim().toUpperCase();

            if (moduleSet.has(module)) {
                const duplicateRemark = formData[i].remark_desc;
                const duplicateModule = formData[i].remark_cat;

                toast.error(
                    `Duplicate Module found at row ${
                        i + 1
                    } :- Remark: "${duplicateRemark}", Module: "${duplicateModule}" `
                );

                isDuplicate = true;
                break;
            }
            moduleSet.add(module);
        }

        if (isDuplicate) return;

        let newRecord = formData.filter((item) => !item?.remark_id);

        // Compare modified records with original
        let updatedRecord = formData.filter((item) => {
            if (!item?.remark_id) return false;

            const original = originalFormData.find(
                (o) => o.remark_id === item.remark_id
            );
            if (!original) return true;

            return isRecordModified(original, item);
        });

        const body = {
            newRecord, // New records to be inserted
            updatedRecord, // Updated records
            deletedRecord, // Deleted records
        };

        try {
            let response;
            if (formStatus === "Update") {
                // Handle Update request
                response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${
                        APP_PROD_API.POST_STD_REM_DATA
                    }?form_status=${formStatus}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: "include",
                    }
                );
            } else {
                // Handle Insert request
                response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${
                        APP_PROD_API.POST_STD_REM_DATA
                    }?form_status=${formStatus}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: "include",
                    }
                );
            }

            const responseData = await response.json();
            if (!response.ok)
                throw new Error(responseData.message || "Submit failed");

            toast.success(
                responseData.message || "Data submitted successfully!"
            );
            formCleanup();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error.message);
        }
    };

    return (
        <React.Fragment>
            <FormSetup
                navType="tabs"
                activeTab={activeTab}
                tabs={tabs}
                updateActiveTab={updateActiveTab}
                formStatus={formStatus}
                currentRecordNo={currentRecordNo}
                totalRecordCount={totalRecordCount}
                pageCount={1}
                totalPageCount={1}
                isSingleQuery={true}
                setupQueryData={setupQueryData}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                handleOperation={handleOperation}
                formData
                handleOffset={handleOffset}
                QUERY_API={APP_PROD_API.GET_STD_REM_FORM_DATA}
                formName={"Standard Remarks"}
               isQueryReqOnInsertBtn={true}
                isQueryReqOnNextPreBtn={false}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <StandardRemarksDetails
                            formData={formData}
                            handleChange={handleChange}
                            formStatus={formStatus}
                            triggerAddRow={triggerAddRow}
                            handleDeleteRow={handleDeleteRow}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                        />
                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default StandardRemarks;
