import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup';
import ButtonUi from '../../../../components/basic/button'
import BalanceSheetDtl from './balance_sheet_dtl';
import { balanceSheetDtlInitFormData, InitialFormData } from './balance_sheet_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';

const BalanceSheet = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ ...InitialFormData });
    const [formDetailData, setFormDetailData] = useState([balanceSheetDtlInitFormData])
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

    const { user } = useSelector((state) => state.auth);

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState('');
    const [helpListHeader, setHelpListHeader] = useState([]);

    const [deletedRecord, setDeletedRecord] = useState([])

    const [originalData, setOriginalData] = useState([{}])


    const [filteredFormDtlData, setFilteredFormDtlData] = useState(formDetailData);

    const [selectedBsPlFlag, setSelectedBsPlFlag] = useState("");  // "B" or "P"
    const [selectedAssFlag, setSelectedAssFlag] = useState("");    // "A", "L", etc.

    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList);

    const tabs = ["Balance Sheet / Profit and Loss"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);


    const handleHelpList = (data) => {
        console.log('handleHelpList called with data:', data, 'formStatus:', formStatus);
        if (['Insert', 'Update'].includes(formStatus)) {
            setHelpList(data);
        }
    }

    const onSelectHelpItem = (data) => {
        // console.log('onSelectHelpItem called with data:', data, 'helpFor:', helpFor, 'focusedRowIndex:', focusedRowIndex);
        switch (helpFor) {
            case "RollupAcc":
                setFormDetailData(prev => {
                    const updatedRows = [...prev];
                    updatedRows[focusedRowIndex] = { ...updatedRows[focusedRowIndex], rollup_acc1: data.rollup_acc1 };
                    return updatedRows;
                });
                break;

        }
    };

    // const setupQueryData = useCallback(
    //     (queryData, btnClicked) => {
    //         if (!queryData) return;

    //         // if (btnClicked === "Query") {
    //         setTotalRecordCount(queryData.totalCount || 0);
    //         // }

    //         if (queryData.type === "empty") {
    //             toast.error(queryData.message || "No data found.");
    //             setFormData([]);
    //             setFormDetailData([]);
    //             return;
    //         }

    //         setFormData(queryData.balSheetPL);
    //         setOriginalData(queryData.balSheetPL)

    //         const updatedMdfmData = queryData.balSheetPL.map((item) => ({
    //             ...item,
    //             init_description: item.description,
    //         }));

    //         setFormDetailData(updatedMdfmData);
    //         // setFormDetailData(queryData.balSheetPL);

    //     },
    //     [formStatus, currentRecordNo]
    // );

    // const setupQueryData = useCallback(
    //     (queryData, btnClicked) => {
    //         if (!queryData) return;

    //         setTotalRecordCount(queryData.totalCount || 0);


    //         if (queryData.type === "empty") {
    //             toast.error(queryData.message || "No data found.");
    //             setFormData([]);
    //             setFormDetailData([]);
    //             return;
    //         }

    //         // Save original unfiltered data
    //         setOriginalData(queryData.balSheetPL);

    //         // Add init_description for tracking changes
    //         const updatedMdfmData = queryData.balSheetPL.map((item) => ({
    //             ...item,
    //             init_description: item.description,
    //         }));

    //         // Filter default view by bs_pl_flag === "B" && ass_flag === "A"
    //         const defaultFilteredData = updatedMdfmData.filter(
    //             (item) =>
    //                 item.bs_pl_flag === "B" && item.ass_lib_inc_exp_app_sch_flag === "A"
    //         );

    //         console.log("defaultFilteredData", defaultFilteredData)

    //         setFormDetailData(defaultFilteredData); //  Filtered detail rows 
    //         setCurrentRecordNo(defaultFilteredData.length - 1)
    //         console.log("currentRecordNo", defaultFilteredData.length)

    //         // update selected radio flag states if needed
    //         setSelectedBsPlFlag("B");
    //         setSelectedAssFlag("A");
    //     },
    //     [formStatus, currentRecordNo]
    // );      

    const setupQueryData = useCallback(
        (queryData, btnClicked) => {
            if (!queryData) return;

            setTotalRecordCount(queryData.totalCount || 0);


            if (queryData.type === "empty") {
                toast.error(queryData.message || "No data found.");
                setFormData([]);
                setFormDetailData([]);
                return;
            }

            // Save original unfiltered data
            setOriginalData(queryData.balSheetPL);

            // Add init_description for tracking changes
            const updatedMdfmData = queryData.balSheetPL.map((item) => ({
                ...item,
                init_description: item.description,
                init_sno: item.sno,
                init_schd_no: item.schd_no,
                init_sch_sno: item.sch_no,
                init_rollup_acc1: item.rollup_acc1,
                init_trans_year: item.trans_year,
            }));

            // Filter default view by bs_pl_flag === "B" && ass_flag === "A"
            const defaultFilteredData = updatedMdfmData.filter(
                (item) =>
                    item.bs_pl_flag === "B" && item.ass_lib_inc_exp_app_sch_flag === "A"
            );

            console.log("defaultFilteredData", defaultFilteredData)

            setFormDetailData(defaultFilteredData); //  Filtered detail rows 
            setCurrentRecordNo(defaultFilteredData.length - 1)
            console.log("currentRecordNo", defaultFilteredData.length)

            // update selected radio flag states if needed
            setSelectedBsPlFlag("B");
            setSelectedAssFlag("A");
        },
        [formStatus, currentRecordNo]
    );


    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData(InitialFormData);
        setFormDetailData([balanceSheetDtlInitFormData])
    }, []);

    const otherQueryPera = {
        bs_pl_flag: formData?.bs_pl_flag,
        ass_lib_inc_exp_app_sch_flag: formData?.ass_lib_inc_exp_app_sch_flag,
        description: formDetailData[focusedRowIndex]?.description,
        total_flag: formDetailData[focusedRowIndex]?.total_flag,
        line_flag: formDetailData[focusedRowIndex]?.line_flag,
        heading_flag: formDetailData[focusedRowIndex]?.heading_flag,
        plus_minus: formDetailData[focusedRowIndex]?.plus_minus
    };

    // for validation

    const getValidateData = async (
        fieldName,
        fieldValue,
        otherQueryPera = {},
        rowIndex = null
    ) => {
        let API_STRING;

        try {
            const queryParams = new URLSearchParams({
                [fieldName]: fieldValue,
                ...otherQueryPera,
                appDivisionId: user?.global_division_id,
                appFinYear: user?.global_fin_year,
            });

            API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BAL_SHEET_PL_VALID_DATA}?${queryParams.toString()}`;

            const response = await fetch(API_STRING);

            if (response.status === 200) {
                const data = await response.json();
                // console.log("Received data:", data); 
                return data


            }

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error)
            }
        } catch (err) {
            console.error("Error validating field:", err);
            toast.error("Something went wrong while validating the data.");
        }

        // In case of any failure or non-200/204 response, treat it as invalid
        return false;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const balSheetForm = document.getElementById("balance-sheet-form")
        const balSheetFormValidity = balSheetForm.checkValidity()
        if (!balSheetFormValidity) {
            if (balSheetForm.reportValidity) {
                balSheetForm.reportValidity()
            } else {
                throw new Error("Please fill all the required details in Closing Inv Balance Sheet")
            }
            return
        } 

    


        // for duplicate check 

        // if (formDetailData.length > 0) {

        //     const seen = new Set()

        //     for (const item of formDetailData) {
        //         const key = `${item.ass_lib_inc_exp_app_sch_flag}` | `${item.bs_pl_flag}` | `${item.sno}` | `${item.description}`
        //         if (seen.has(key)) {
        //             toast.error('Combination already exists')
        //         }
        //     }

        // }

        try {
            let body = {
                formHdrData: formData,
                formDtlData: formDetailData.map(row => ({
                    ...row,
                    trans_year: user?.global_fin_year,
                    division_id: user?.global_division_id,
                    // appFinYear: user?.global_fin_year,
                }))
            };
            //   console.log("Final body to send:", body);

            if (formStatus == "Insert") {

            } else if (formStatus == "Update") {
                body = {
                    ...body,
                    deletedData: deletedRecord,

                };

            }

            console.log("Final body to send:", body);
            setDeletedRecord([])

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BAL_SHEET_PL_DATA}?form_status=${formStatus}`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                }

            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong");
            }

            toast.success(`Data saved successfully!`);
            handleCancel();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(
                error.message ||
                "Please check all the form fields or contact administrator"
            );
        }

        console.log("Form submitted", formData)
    }

    function handleOffset(data) {
        setCurrentRecordNo(data)
    }


    const handleChange = useCallback((type, name, value, rowIndex = null, event) => {
        if (!['Insert', 'Update', 'Search', 'Query'].includes(formStatus)) {
            return
        }

        console.log('event', event)
        const cursorPosition = event?.target?.selectionStart;

        if (["Insert", "Update"].includes(formStatus) && ["rollup_acc1"].includes(name)) {
            toast.error("Please select from Helplist");
            return
        }
        switch (type) {

            case "formData":
                setFormData(prev => ({ ...prev, [name]: value }));
                break;

            case "formDetailData":
                setFormDetailData(prev => {
                    if (rowIndex !== null && rowIndex >= 0) {
                        // Update a specific row
                        const newData = [...prev];
                        newData[rowIndex] = {
                            ...newData[rowIndex],
                            [name]: typeof value === "string" ? value.toUpperCase() : value
                        };
                        return newData;
                    } else {
                        // Update all rows (used for Select field outside table)
                        return prev.map(row => ({
                            ...row,
                            [name]: typeof value === "string" ? value.toUpperCase() : value
                        }));
                    }
                });
                break;

            default:
                console.log("handleChange is not properly defined");
        }

        // // Restore cursor only for text-compatible fields
        const supportedTypes = ["text", "search", "tel", "url", "password", "textarea"];
        if (event && supportedTypes.includes(event.target?.type)) {
            setTimeout(() => {
                event.target.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        }


    }, [formStatus]);



    const filterData = (bsFlag, assFlag) => {
        if (!bsFlag || !assFlag) return; // Wait until both values are set

        const filtered = originalData.filter(
            (item) =>
                item.bs_pl_flag === bsFlag &&
                item.ass_lib_inc_exp_app_sch_flag === assFlag
        );

        console.log("Filtered Data:", filtered);
        setFilteredFormDtlData(filtered);
        setFormDetailData(filtered)
        setCurrentRecordNo(filtered.length - 1)
    };


    const handleBsPlFlagChange = (flag) => {
        setSelectedBsPlFlag(flag);
        handleChange("formData", "bs_pl_flag", flag);

        if (formStatus !== "Search") {
            filterData(flag, selectedAssFlag); // call filter with latest state
        }
    };

    const handleAssFlagChange = (flag) => {
        setSelectedAssFlag(flag);
        handleChange("formData", "ass_lib_inc_exp_app_sch_flag", flag);

        if (formStatus !== "Search") {
            filterData(selectedBsPlFlag, flag); // call filter with latest state
        }
    };


    // ADD NEW ROW
    // const handleAddRow = useCallback(() => {  

    //     // for checking form required field 
    //      const balSheetForm = document.getElementById("balance-sheet-form")
    //     const balSheetFormValidity = balSheetForm.checkValidity()
    //     if (!balSheetFormValidity) {
    //         if (balSheetForm.reportValidity) {
    //             balSheetForm.reportValidity()
    //         } else {
    //             throw new Error("Please fill all the required details in Closing Inv Balance Sheet")
    //         }
    //         return
    //     } 

    //     // for check duplicate entry 
    //     const seen = new Set()
    //     for( const item of formDetailData) {
    //     const key = `${item.bs_pl_flag | item.ass_lib_inc_exp_app_sch_flag | item.description | item.total_flag | item.line_flag | item.heading_flag | item.plus_minus  | item.trans_year}` 

    //     if (seen.has(key)) {
    //         toast.error('Combination already exists')
    //     } 
    //     seen.add(key)
    //     } 

    //     // for check getValidateData  

    //      // Common field list
    //     const fields = [
    //         { name: "sno", value: formDetailData[focusedRowIndex]?.sno },
    //         { name: "schd_no", value: formDetailData[focusedRowIndex]?.schd_no },
    //         { name: "sch_no", value: formDetailData[focusedRowIndex]?.sch_sno },
    //          { name: "rollup_acc1", value: formDetailData[focusedRowIndex]?.rollup_acc1 },
    //     ];

    //     // get Validation logic
    //     if (formStatus === "Update") {
    //         const isChecked =
    //             formDetailData[focusedRowIndex]?.init_sno ===
    //             formDetailData[focusedRowIndex]?.sno &&
    //             formDetailData[focusedRowIndex]?.init_sch_sno ===
    //             formDetailData[focusedRowIndex]?.sch_sno &&
    //             formDetailData[focusedRowIndex]?.init_schd_no === formDetailData[focusedRowIndex]?.schd_no;
    //             formDetailData[focusedRowIndex]?.init_rollup_acc1 === formDetailData[focusedRowIndex]?.rollup_acc1

    //         if (!isChecked) {
    //             // validate all fields only if not checked
    //             for (const f of fields) {
    //                 const result = await getValidateData(
    //                     f.name,
    //                     f.value,
    //                     otherQueryPera,
    //                     focusedRow
    //                 );
    //                 if (!result.valid) return;
    //             }
    //         }
    //     }
    //     // else if (formStatus != 'Insert') {
    //     // for (const f of fields) {
    //     //     const result = await getValidateData(
    //     //         f.name,
    //     //         f.value,
    //     //         otherQueryPera,
    //     //         focusedRow
    //     //     );
    //     //     if (!result.valid) return;
    //     // }

    //    // for add row

    //     setFormDetailData((prevData) => [...prevData, balanceSheetDtlInitFormData]);
    // }, [formDetailData]); 

    const handleAddRow = useCallback(async () => {
        // 1. Required field check
        const balSheetForm = document.getElementById("balance-sheet-form");
        if (balSheetForm && !balSheetForm.checkValidity()) {
            if (balSheetForm.reportValidity) {
                balSheetForm.reportValidity();
            } else {
                throw new Error("Please fill all the required details in Closing Inv Balance Sheet");
            }
            return;
        }

        // 2. Duplicate entry check
        const seen = new Set();
        for (const item of formDetailData) {
            const key = `${item.bs_pl_flag}-${item.ass_lib_inc_exp_app_sch_flag}-${item.description}-${item.total_flag}-${item.line_flag}-${item.heading_flag}-${item.plus_minus}-${item.trans_year}`;
            if (seen.has(key)) {
                toast.error("Combination already exists");
                return; // stop further execution
            }
            seen.add(key);
        }

        // 3. Validation logic
        const fields = [
            { name: "sno", value: formDetailData[focusedRowIndex]?.sno },
            { name: "schd_no", value: formDetailData[focusedRowIndex]?.schd_no },
            { name: "sch_no", value: formDetailData[focusedRowIndex]?.sch_sno },
            { name: "rollup_acc1", value: formDetailData[focusedRowIndex]?.rollup_acc1 },
        ];



        if (formStatus === "Update" || formStatus === "Insert") {
            console.log("formStatus", formStatus);

            const row = formDetailData[focusedRowIndex];

            // Safe null/undefined-aware comparison helper
            const isEqual = (a, b) => (a == null && b == null) || a === b;

            const isChecked =
                isEqual(row?.init_sno, row?.sno) &&
                isEqual(row?.init_sch_sno, row?.sch_sno) &&
                isEqual(row?.init_schd_no, row?.schd_no) &&
                isEqual(row?.init_rollup_acc1, row?.rollup_acc1);

            if (!isChecked) {
                console.log("not checked");
                for (const f of fields) {
                    const result = await getValidateData(
                        f.name,
                        f.value,
                        otherQueryPera,
                        focusedRowIndex
                    );
                    if (!result.valid) return;
                }
            }
        }


        // 4. Add new row
        setFormDetailData((prevData) => [...prevData, balanceSheetDtlInitFormData]);
    }, [formDetailData, focusedRowIndex, formStatus, otherQueryPera, focusedRowIndex, balanceSheetDtlInitFormData]);


    // DELETE ROW
    const handleDeleteRow = useCallback((data, index) => {
        console.log("Deleting row", index, data);

        //  Always get the latest deletedRecord
        setDeletedRecord((prevDeleted) => [...prevDeleted, data]);

        setFormDetailData((prev) => {
            if (prev.length === 0) return prev;

            const newData = prev.filter((_, i) => i !== index);
            console.log("Row deleted:", data);

            setFocusedRowIndex((currentFocusIndex) => {
                if (index === currentFocusIndex) {
                    return index > 0 ? index - 1 : 0;
                } else if (index < currentFocusIndex) {
                    return currentFocusIndex - 1;
                } else {
                    return currentFocusIndex;
                }
            });

            return newData;
        });

    }, []);

    const handleGenerateEntries = async () => {
        if (confirm(`All Descriptions would be deleted and re-generated as per 
  roll-up master. Are you sure you want to re-generate entries?`)) {


            try {
                const body = {

                    divisionId: user.global_division_id,
                    transYear: user.global_fin_year
                };

                console.log("Final body to send:", body);

                const response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BAL_SHEET_PL_GENERATE_DATA
                    }`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: 'include',
                    }
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Something went wrong");
                }

                const data = await response.json();
                toast.success("Data regenerated successfully!");
                return data; // Success
            } catch (error) {
                toast.error(
                    error.message || "Please check all the form fields or contact administrator"
                );
                return null; // Failed
            }
        }
    };



    console.log('formStatus from memberform', formStatus)
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
                isQueryReqOnInsertBtn={true}
                // isQueryReqOnInsertBtn={true}

                QUERY_API={APP_PROD_API.GET_DATA_FOR_BALANCE_SHEET_PL}
                formName={"Balance Sheet Profit and Loss"}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>

                        <Row>
                            <Col xl={2} className='mt-5 ms-5'>
                                <ButtonUi color="secondary"
                                    onClick={async () => {
                                        console.log("generate entries clicked");

                                        if (formStatus === "Query") {
                                            try {
                                                const result = await handleGenerateEntries();
                                                const newData = result?.mofmData || [];

                                                if (!newData.length) {
                                                    toast.error("No entries regenerated.");
                                                    return;
                                                }

                                                // Add init_description to each entry
                                                const updatedData = newData.map((item) => ({
                                                    ...item,
                                                    init_description: item.description,
                                                }));

                                                // Save original full data
                                                setOriginalData(updatedData);

                                                // Filter by current selected flags
                                                const filtered = updatedData.filter(
                                                    (item) =>
                                                        item.bs_pl_flag === selectedBsPlFlag &&
                                                        item.ass_lib_inc_exp_app_sch_flag === selectedAssFlag
                                                );

                                                // Update UI
                                                setFilteredFormDtlData(filtered);
                                                setFormDetailData(filtered);
                                                setCurrentRecordNo(filtered.length - 1);

                                                toast.success("Entries regenerated successfully.");
                                            } catch (error) {
                                                console.error("Error during regeneration:", error);
                                                toast.error("Failed to regenerate entries.");
                                            }
                                        }
                                    }}
                                >
                                    Generate Entries
                                </ButtonUi>
                            </Col>
                            <Col xl={9}>
                                <div className='box-border'>
                                    <Row>
                                        <Col xl={3}>
                                            <div className=" text-wrapper customer-height box border p-3 mt-sm-3 mt-md-3 mt-lg-3 ">
                                                <span className="text-label mt-1">Report</span>
                                                <Row>
                                                    <RadioGroup
                                                        //style
                                                        className="button-group-wrapper d-flex"
                                                        options={[
                                                            { text: "Balance Sheet", value: "B" },
                                                        ]}
                                                        //  onChange={(e) => handleChange("formData", "bs_pl_flag", e.target.value)}
                                                        onChange={(e) => handleBsPlFlagChange(e.target.value)}
                                                        checked={formData?.bs_pl_flag}
                                                    />
                                                </Row>

                                                <Row>
                                                    <RadioGroup
                                                        //style
                                                        className="button-group-wrapper d-flex mb-2"
                                                        options={[
                                                            { text: "Profit and Loss", value: "P" },
                                                        ]}
                                                        // onChange={(e) => handleChange("formData", "bs_pl_flag", e.target.value)}
                                                        onChange={(e) => handleBsPlFlagChange(e.target.value)}
                                                        checked={formData?.bs_pl_flag}
                                                    />
                                                </Row>
                                            </div>
                                        </Col>

                                        <Col xl={8}>
                                            <div className=" text-wrapper customer-height box border p-3 mt-sm-3 mt-md-3 mt-lg-3 ">
                                                <span className="text-label">Group</span>
                                                <Row>
                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Assests", value: "A" },

                                                            ]}
                                                            // onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                            disabled={formData.bs_pl_flag === "P"}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Liabilities", value: "L" },

                                                            ]}
                                                            //  onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                            disabled={formData.bs_pl_flag === "P"}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Schedules", value: "S" },
                                                            ]}
                                                            // onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Sub Sch.", value: "U" },

                                                            ]}
                                                            // onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                        />
                                                    </Col>



                                                </Row>

                                                <Row>
                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Income", value: "I" },

                                                            ]}
                                                            // onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                            disabled={formData.bs_pl_flag === "B"}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Expenditure", value: "E" },

                                                            ]}
                                                            // onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                            disabled={formData.bs_pl_flag === "B"}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <RadioGroup
                                                            //style
                                                            className="button-group-wrapper d-flex"
                                                            options={[
                                                                { text: "Appropriations", value: "P" },
                                                            ]}
                                                            //   onChange={(e) => handleChange("formData", "ass_lib_inc_exp_app_sch_flag", e.target.value)}
                                                            onChange={(e) => handleAssFlagChange(e.target.value)}
                                                            checked={formData?.ass_lib_inc_exp_app_sch_flag}
                                                            disabled={formData.bs_pl_flag === "B"}
                                                        />
                                                    </Col>

                                                    <Col>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        <BalanceSheetDtl
                            formDetailData={formDetailData}
                            formStatus={formStatus}
                            handleChange={handleChange}
                            handleAddRow={handleAddRow}
                            handleDelete={handleDeleteRow}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                            handleHelpList={handleHelpList}
                            setHelpFor={setHelpFor}
                            setHelpListHeader={setHelpListHeader}
                            getValidateData={getValidateData}
                            otherQueryPera={otherQueryPera}
                        />
                        {helpList && (
                            console.log('Rendering Modal with helpList:', helpList),
                            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                                <ModalBody>
                                    <HelpList
                                        formStatus={formStatus}
                                        helpFor={helpFor}
                                        apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_BALANCE_SHEET_PL}`}
                                        helpListHeader={helpListHeader}
                                        handleHelpList={handleHelpList}
                                        onSelectHelpItem={onSelectHelpItem}
                                        queryPera={{ needAppGlobalData: 'Y' }}
                                    // whereClause={whereClauseForHelp(helpFor)}
                                    />
                                </ModalBody>
                            </Modal>
                        )}

                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default BalanceSheet;

