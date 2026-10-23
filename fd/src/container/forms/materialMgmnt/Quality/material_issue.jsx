import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton';
import { formDataInitData, formDetailInitData, formBatchInitData, createSearchPayloadForBVSpecificSearch } from './material_issue_helpers'
import InterTransferMemoDtl from './Inter_transfer_memoDtl';
import { formatOptions } from '../../../../lib';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import { dateFormatter, validateForm } from '../../../../utils/fn';
//import { fetchAppData } from '../../../../utils/fetchUtils';
import MaterialIssueDtl from './material_issueDtl';
import { fetchAppData } from '../../../../utils/fetchUtils';
//import { dateFormatter } from '../../../../utils/fn';


const MaterialIssue = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ ...formDataInitData });

    const [formDetailData, setFormDetailData] = useState([formDetailInitData])
    const [formBatchData, setFormBatchData] = useState([formBatchInitData])

    const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

    const [deletedRecord, setDeletedRecord] = useState([])

    const [deletedRecord1, setDeletedRecord1] = useState([])

    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const [dept, setDept] = useState(null);


    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);

    // for help list 

    const [helpList, setHelpList] = useState(false)
    const [helpFor, setHelpFor] = useState('')
    const [helpListHeader, setHelpListHeader] = useState([])

    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList)

    const handleHelpList = (data) => {
        setHelpList(data);
    }

    const onSelectHelpItem = (data) => {
        //console.log("Selected Data:", data);

        // Update main form data
        if (["wcno", "trans", "srs"].includes(helpFor)) {
            setFormData((prev) => {
                switch (helpFor) {
                    case "wcno":
                        return {
                            ...prev, wc_no: data.wc_no, wc_id: data.wc_id
                        };

                    case "trans":
                        return {
                            ...prev, from_wc_desc: data.from_desc, to_wc_desc: data.to_desc, trans_code: data.trans_code

                        };

                    case "srs":
                        return {
                            ...prev, srs_no: data.srs_no, srs_id: data.srs_id

                        };

                    default:
                        return prev;
                }
            });
        }

        // Update detail data (table rows)
        if (["item", "cost", "purp", "physical", "batch"].includes(helpFor) && activeRowIndex !== null) {
            setFormDetailData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "item":
                        currentRow.it_code = data.it_code;
                        currentRow.it_name = data.it_name;
                        currentRow.uom_code = data.um_code;
                        currentRow.catalog_code = data.catalog_code;
                        break;

                    case "cost":
                        currentRow.cc = data.prefix;
                        currentRow.cost_desc = data.description;
                        currentRow.cost_centr = data.code
                        break;

                    case "purp":
                        currentRow.purpose = data.description;
                        currentRow.pur_code = data.code
                        break;

                    case "physical":
                        currentRow.physical_loc = data.physical_loc;
                        break;
                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }

        if (["batch"].includes(helpFor) && activeRowIndex !== null) {
            setFormBatchData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "batch":
                        currentRow.batch_no = data.batch_no;
                        currentRow.batch_date = dateFormatter(data.batch_date);
                        currentRow.batch_store_qty = data.batch_qty;
                        currentRow.mrir_no = data.mrir_no;
                        break;


                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }
    };

    const handleDoubleClick = (field, header) => {
        if (formStatus) {
            setHelpFor(field); // Set the help type dynamically
            setHelpListHeader(header); // Set the appropriate header list
            handleHelpList(true); // Open the modal
        }
    };

    const whereClauseForHelp = (helpFor) => {
        //console.log("formData data", formData)

        if (formData.ok_rej && formData.trans_type) {
            // //console.log("Running proctranstype logic...");
            let newTrType = null;
            if (formData.ok_rej === 'O') {
                newTrType = formData.trans_type === 'R' ? 1 : formData.trans_type === 'I' ? 2 : null;
            } else if (formData.ok_rej === 'R') {
                newTrType = formData.trans_type === 'R' ? 3 : formData.trans_type === 'I' ? 4 : null;
            }

            if (formData.tr_type !== newTrType) {
                setFormData(prev => ({
                    ...prev,
                    tr_type: newTrType
                }));
            }
        }
        if (helpFor === 'trans') {
            //console.log("tr_type", formData.tr_type, "ok_rej", formData.ok_rej, "mat_trans_type", formData.mat_trans_type)
            return { wc_id: formData.wc_id, tr_type: formData.tr_type, ok_rej: formData.ok_rej, mat_trans_type: formData.mat_trans_type };
        }

        if (helpFor === 'item') {
            return { trans_code: formData.trans_code, wc_id: formData.wc_id };
        }

        if (helpFor === 'physical') {
            return { it_code: formDetailData[focusedRowIndex]?.it_code };
        }

        if (helpFor === 'batch') {
            return { it_code: formDetailData[focusedRowIndex]?.it_code, wc_id: formData.wc_id };
        }
        return {};
    }


    const tabs = ["Material Issue"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const otherQueryPera = {
        receive_issue_flag: formData?.receive_issue_flag,
        wc_id: formData?.wc_id,
        trans_code: formData?.trans_code,
        ok_rej: formData?.ok_rej,
        doc_date: formData?.doc_date,
        division_id: formData?.division_id,
        srs_no: formData.srs_no,
        mat_trans_type: formData.mat_trans_type,
        batch_date: formBatchData[focusedRowIndex]?.batch_qty,
        tot_batch_qty: formBatchData[focusedRowIndex]?.tot_batch_qty,
        batch_store_qty: formBatchData[focusedRowIndex]?.batch_store_qty,
        store_stock: formDetailData[focusedRowIndex]?.store_stock

    };

    // for field level  validation

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
                appUserId: user?.id
            });

            API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MATERIAL_ISSUE_VALID_DATA}?${queryParams.toString()}$step={}`;

            const response = await fetch(API_STRING);

            const data = await response.json();

            if (response.ok) {
                if (data.error) {
                    toast.error(data.error);
                    if (rowIndex !== null) {
                        setFormDetailData((prev) => {
                            const updated = [...prev];
                            if (updated[rowIndex]) {
                                updated[rowIndex][fieldName] = "";
                            }
                            return updated;
                        });
                    }
                    return false;
                } else if (data.data && rowIndex !== null) {
                    const itemData = data.data;

                    setFormDetailData((prev) => {
                        const updated = [...prev];
                        if (updated[rowIndex]) {
                            updated[rowIndex] = {
                                ...updated[rowIndex],
                                it_name: itemData.it_name,
                                um_code: itemData.um_code,
                                rate: itemData.rate,
                                store_stock: itemData.store_stock,
                                [fieldName]: fieldValue
                            };
                        }
                        return updated;
                    });

                    return true;
                }
            } else if (response.status === 204) {
                return true;
            } else {

                const errMsg = data?.error || "Unexpected error occurred.";
                toast.error(errMsg);

                if (rowIndex !== null) {
                    setFormDetailData((prev) => {
                        const updated = [...prev];
                        if (updated[rowIndex]) {
                            updated[rowIndex][fieldName] = "";
                        }
                        return updated;
                    });
                }

                return false;
            }

        } catch (err) {
            console.error("Error validating field:", err);
            toast.error("Something went wrong while validating the data.");
            return false;
        }
    };

    // For Search Record 
    const handleSearch = async () => {
        try {
            setTotalRecordCount(0);
            setCurrentRecordNo(0);
            const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
            const queryList = new URLSearchParams(searchPayload);

            if ([...queryList].length === 0) {
                toast.error("Please enter search criteria");
                return;
            }

            setSearchQuery(searchPayload);

            const data = await fetchAppData(
                `${APP_PROD_API.GET_DATA_FOR_MATERIAL_ISSUE}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
            );

            if (data?.error) {
                toast.error(data?.error);
                return;
            }
            setupQueryData(data, "Query");
            handleOperation("Query");
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(error?.message || "Some error occurred");
        }
    };


    // for handle authorisation

    const handleAuth = async () => {
        const {
            doc_id,
            doc_no,
            doc_date,
            division_id,
            trans_year,
            trans_code,
            authorised,
        } = formData;

        // Check if already authorised
        if (authorised === 'Y') {
            toast.error("Cannot Unauthorise");
            return;
        }

        // Ask for confirmation
        if (!confirm("WANT TO AUTHORISED ?")) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZED_MATERIAL_ISSUE}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        formData: {
                            doc_id,
                            doc_no,
                            doc_date,
                            division_id,
                            trans_year,
                            trans_code,
                            authorised: 'N', // sending current status 'N' to authorize
                        },
                    }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                toast.success(result?.message || "Voucher authorised successfully");

                // Update formData state to reflect authorised
                setFormData(prev => ({
                    ...prev,
                    authorised: 'Y',
                    disp_flag: 'Authorised', // optional: display flag update
                }));
            } else {
                toast.error(result?.message || "Authorization failed");
            }
        } catch (error) {
            console.error("Authorization error:", error);
            toast.error("Internal error while authorising voucher");
        }
    };




    // Memo Cancellation logic
    const handleCancelMemo = async () => {
        const { cancel_memo, authorised, wc_id, doc_id, doc_no, trans_code, division_id, trans_year, ok_rej } = formData;

        if (cancel_memo === "Y") {
            alert("This Inter Transfer Memo has already been cancelled");
            return;
        }

        if (authorised === "Y") {
            alert("You cannot Cancel Authorised Inter Transfer Memo");
            return;
        }

        if (!confirm("Do you really want to cancel this Inter Transfer Memo?")) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCELLATION_MATERIAL_ISSUE}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({
                        memoData: {
                            division_id,
                            trans_year,
                            doc_no,
                            trans_code,
                            ok_rej,
                            wc_id,
                            doc_id,
                            cancel_memo,
                            authorised
                        },
                        appUserId: user.id

                    }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                toast.success(result?.message || "Memo cancelled successfully.");
                setFormData((prev) => ({ ...prev, cancel_memo: "Y" }));
            } else {
                toast.error(result?.message || "Failed to cancel memo.");
            }
        } catch (error) {
            console.error("Error cancelling memo:", error);
            toast.error("An error occurred while cancelling the memo.");
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        // validation 

        for (const item of formBatchData) {
            if (item.tot_batch_qty) {
                toast.error('Total Batch Qty Cannot be greater than Item Qty')
            }
        }

        const isValidFormData = validateForm("inter-transfer-memoDtl-form");
        if (!isValidFormData) return;

        const validateFormFields = (fields) => {
            for (const [field, message] of Object.entries(fields)) {
                if (!formData[field]) {
                    toast.error(message);
                    return false;
                }
            }
            return true;
        };

        // Usage
        const isValid = validateFormFields({
            wc_no: "Store code cannot be empty",
            from_wc_desc: "Transaction date cannot be null",
            trans_code: "Transaction code cannot be null",
            srs_no: "SRS cannot be null",
            dept_code: "Department cannot be null",
        });

        if (!isValid) return;

        try {
            let body = {
                formData: formData,
                formDetailData: formDetailData,
                transYear: user?.global_fin_year,
                divisionId: user?.global_division_id,
                formBatchData: formBatchData,
                itCode: formDetailData[focusedRowIndex]?.it_code,
            };

            if (formStatus === "Update") {

                if (formData.authorised === "Y") {
                    toast.error("You connot Modify Authorised Inter Transfer Memo")
                    return
                }

                if (formData.cancel_memo === "Y") {
                    toast.error("This Inter Transfer Memo has already been cancelled")
                    return
                }

                if (formData.trans_code <= 100) {
                    toast.error("This entry is automatically generated, You connot Modify")
                    return
                }

                body = {
                    ...body,
                    deletedFormDtlData: deletedRecord,
                    // deletedFormBatchData: deletedRecord1
                };
            }

            setDeletedRecord([]);
            // setDeletedRecord1([]);

            //console.log("Final body to send:", body);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_MATERIAL_ISSUE_DATA}?form_status=${formStatus}`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const responseData = await response.json();

            // ✅ Toast message based on formStatus
            // toast.success(responseData.message || "Data saved successfully!");
            toast.success(
                formStatus === "Insert"
                    ? "Data saved successfully!"
                    : formStatus === "Update"
                        ? "Transaction updated successfully"
                        : responseData.message || "Data saved successfully!"
            );

            handleCancel();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(
                error.message ||
                "Please check all the form fields or contact administrator"
            );
        }

        //console.log("Form submitted", formData);
    };



    function handleOffset(data) {
        setCurrentRecordNo(data)
    }

    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData({ ...formDataInitData });
        setFormDetailData([formDetailInitData])
        setFormBatchData([formBatchInitData])
    }, []);


    // fetch drop down data
    useEffect(() => {
        const fetchConstantList = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DROPDOWNDATA_MATERIAL_ISSUE}`, { credentials: 'include', }
                )
                if (response.status === 200) {
                    const data = await response.json()
                    setDept([{ value: "", label: "" }, ...formatOptions(data.department || [], "dept_cd", "department")])

                }
            } catch (err) {
                console.error("Error fetching constants:", err)
            }
        }
        fetchConstantList()
    }, [formStatus])

    // Set today's date only when status is "Insert"
    useEffect(() => {
        if (formStatus === "Insert") {
            const docDate = formData.doc_date
                ? new Date(formData.doc_date)
                : new Date();

            setFormData((prev) => ({
                ...prev,
                doc_date: dateFormatter(docDate),
            }));

            //console.log("doc_date (computed):", docDate);
        }

    }, [formStatus]);

    useEffect(() => {
        //console.log("Updated doc_date:", formData.doc_date);
    }, [formData.doc_date]);





    const handleChange = useCallback((type, name, value, rowIndex = null) => {
        if (["wc_no", "srs_no", "it_code", "from_wc_desc", "it_code"].includes(name)) {
            toast.error("Please select from helplist")
            return
        }
        switch (type) {

            case "formData":
                setFormData(prev => ({
                    ...prev,
                    [name]: typeof value === "string" ? value.toUpperCase() : value
                }));

                break;

            case "formBatchData":
                setFormBatchData(prev => {
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
                //console.log("handleChange is not properly defined");
        }


    }, []);


    // ADD NEW ROW
    const handleAddRow = useCallback((tableType) => {
        switch (tableType) {
            case "formBatchData":
                setFormBatchData((prevData) => [
                    ...prevData,
                    {
                        ...formBatchInitData,
                        id: prevData.length + 1,
                    }
                ]);
                break;
            case "formDetailData":
                setFormDetailData((prevData) => [
                    ...prevData,
                    {
                        ...formDetailInitData,
                        id: prevData.length + 1,
                    }
                ]);
                break;

            default:
                //console.log("something went wrong")

        }

    }, []);

    // handleDelete row

    const handleDeleteRow = useCallback((tableType, index) => {
        if (tableType === "formDetailTable") {
            setFormDetailData((prev) => {
                if (prev.length === 0) return prev;

                const deletedItem = prev[index];
                const newData = prev.filter((_, i) => i !== index);

                let newDeleteData = [...deletedRecord];
                newDeleteData.push(deletedItem);
                setDeletedRecord(newDeleteData);

                // Adjust focus index
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
        }

        if (tableType === "formBatchTable") {
            setFormBatchData((prev) => {
                if (prev.length === 0) return prev;

                const deletedItem = prev[index];
                const newData = prev.filter((_, i) => i !== index);

                let newDeleteData = [...deletedRecord1];
                newDeleteData.push(deletedItem);
                setDeletedRecord1(newDeleteData);

                // Optionally add focus logic here

                return newData;
            });
        }
    }, [deletedRecord, deletedRecord1]);

    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            if (queryData.recordCount === 0) {
                toast.error(queryData.message);
                return;
            }

            setFormData(queryData.thmmmainData)

            const updatedData = queryData.tdmmmainData.map(item => ({
                ...item,
                init_it_code: item.it_code,

            }))


            // setFormData(updatedData)

            setFormDetailData(updatedData)
            setFormBatchData(queryData.tdmmmainBatchData)

            if (btnClicked === "Query") {
                setTotalRecordCount(queryData.count || totalRecordCount);
            }

        },
        [formStatus, currentRecordNo]
    );

    useEffect(() => {
        if (formStatus === "Insert") {
            const docDate = formData.doc_date
                ? new Date(formData.doc_date)
                : new Date();


            setFormData((prev) => ({
                ...prev,
                doc_date: new Date(formData.doc_date)
            }
            ))
            //console.log(formData.doc_date)
        }
    }, [formStatus, formData.doc_date])




    //console.log('formStatus from memberform', formStatus)
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
                handleAuthRecord={handleAuth}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
                formData
                handleOffset={handleOffset}
                opterationBtn={[
                    {
                        name:
                            formData.cancel === "Y"
                                ? "Revert Cancellation"
                                : "Cancel Memo",
                        onClick: () => handleCancelMemo(),
                    },
                    // {
                    //   name: "Adjust Advances",
                    //   onClick: () => //console.log("Adjust Advances clicked"),
                    // },
                ]}
                QUERY_API={APP_PROD_API.GET_DATA_FOR_MATERIAL_ISSUE}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={3} className='m-auto mt-2'>
                                <div className="text-wrapper">

                                    <RadioGroup
                                        className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                                        options={[
                                            { text: "Ok", value: "O" },
                                            { text: "Rejection", value: "R" },

                                        ]}
                                        onChange={(e) => handleChange("formData", "ok_rej", e.target.value)}
                                        checked={formData?.ok_rej || "O"}
                                    />
                                </div>
                            </Col>

                            <Col xl={3} className='m-auto'>
                                <TextField
                                    label="Store"
                                    required
                                    type="text"
                                    name="wc_no"
                                    value={formData.wc_no || ""}
                                    maxLength={15}
                                    // disabled
                                    onChange={(e) => handleChange("formData", "wc_no", e.target.value)}
                                    onDoubleClick={() => handleDoubleClick("wcno", wchHelpListHeader)}
                                />
                            </Col>

                            <Col xl={3} className='m-auto'>
                                <p style={{
                                    textAlign: "center",
                                    color: "red",
                                    fontWeight: 'Bold',
                                    fontSize: '18px'
                                }}
                                >
                                    {formData.cancel_memo === "Y" ? "Memo Cancelled" : ''}
                                </p>
                            </Col>


                        </Row>
                        <Row className='mt-1'>
                            <Col xl={3} className='m-auto'>
                                <div className="text-wrapper mt-2">

                                    <RadioGroup
                                        className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                                        options={[
                                            { text: "Ok", value: "I" },
                                            { text: "Receive", value: "R" },

                                        ]}
                                        onChange={(e) => handleChange("formData", "trans_type", e.target.value)}
                                        checked={formData?.trans_type || "I"}
                                    />
                                </div>
                            </Col>

                            <Col xl={3} className='m-auto'>
                                <TextField
                                    label="From"
                                    required
                                    type="text"
                                    name="from_wc_desc"
                                    value={formData.from_wc_desc || ""}
                                    maxLength={60}
                                    // disabled
                                    onChange={(e) => handleChange("formData", "from_wc_desc", e.target.value)}
                                    onDoubleClick={() => handleDoubleClick("trans", transHelpListHeader)}
                                />
                            </Col>

                            <Col xl={3} className='m-auto'>
                                <TextField
                                    label="To"
                                    required
                                    type="text"
                                    name="to_wc_desc"
                                    value={formData.to_wc_desc || ""}
                                    //maxLength={15}
                                    disabled
                                    onChange={(e) => handleChange("formData", "to_wc_desc", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col xl={5} className='m-auto'>
                                <div className="text-wrapper mt-2">

                                    <RadioGroup
                                        className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                                        options={[
                                            { text: "Material Issue", value: "I" },
                                            { text: "Material Returned", value: "R" },
                                            { text: "Prod. Delivery", value: "P" },

                                        ]}
                                        onChange={(e) => handleChange("formData", "mat_trans_type", e.target.value)}
                                        checked={formData?.mat_trans_type || "I"}
                                    />
                                </div>
                            </Col>

                            <Col xl={2} className='m-auto'>
                                <TextField
                                    label="Kit No"
                                    //required
                                    type="text"
                                    name="kit_no"
                                    value={formData.kit_no || ""}
                                    maxLength={20}
                                    disabled
                                    onChange={(e) => handleChange("formData", "kit_no", e.target.value)}
                                />
                            </Col>

                            <Col xl={2} className='m-auto'>
                                <p style={{
                                    textAlign: "center",
                                    color: "green",
                                    fontWeight: 'Bold',
                                    fontSize: '18px'
                                }}
                                >
                                    {formData.authorised === "Y" ? "Authorised" : ''}
                                </p>
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={2} className='m-auto'>
                                <TextField
                                    label="SRS No"
                                    required
                                    type="text"
                                    name="srs_no"
                                    value={formData.srs_no || ""}
                                    maxLength={40}
                                    // disabled
                                    onChange={(e) => handleChange("formData", "srs_no", e.target.value)}
                                    onDoubleClick={() => handleDoubleClick("srs", srsHelpListHeader)}
                                />
                            </Col>

                            <Col xl={2} className='m-auto'>
                                <TextField
                                    label="Transaction Code"
                                    required
                                    type="text"
                                    name="trans_code"
                                    value={formData.trans_code || ""}
                                    maxLength={3}
                                    disabled={formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
                                    onChange={(e) => handleChange("formData", "trans_code", e.target.value)}
                                />
                            </Col>

                            <Col xl={2} className='m-auto'>
                                <TextField
                                    label="Document No"
                                    // required
                                    type="text"
                                    name="doc_no"
                                    value={formData.doc_no || ""}
                                    maxLength={15}
                                    disabled={formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
                                    onChange={(e) => handleChange("formData", "doc_no", e.target.value)}
                                />
                            </Col>

                            <Col xl={2} className='m-auto'>
                                <TextField
                                    label="Document Date"
                                    //required
                                    type="date"
                                    name="doc_date"
                                    value={formData.doc_date || ""}
                                    //maxLength={20}
                                    disabled={formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
                                    onChange={(e) => handleChange("formData", "doc_date", e.target.value)}
                                />
                            </Col>

                        </Row>
                        <Row className='mt-1'>
                            <Col xl={4} className='m-auto'>
                                <Select
                                    required
                                    label="Department"
                                    name="dept_code"
                                    // placeholder={" "}
                                    value={formData.dept_code || ""}
                                    onChange={(e) => handleChange("formData", "dept_code", e.target.value)}
                                    options={dept}
                                />
                            </Col>

                            <Col xl={4} className='m-auto'>
                                <TextField
                                    label="Remark"
                                    //required
                                    type="text"
                                    name="remark"
                                    value={formData.remark || ""}
                                    maxLength={200}
                                    //disabled
                                    onChange={(e) => handleChange("formData", "remark", e.target.value)}
                                />
                            </Col>

                            <Col xl={1} className='m-auto'>

                            </Col>
                        </Row>

                        <MaterialIssueDtl
                            formDetailData={formDetailData}
                            formBatchData={formBatchData}
                            formStatus={formStatus}
                            handleChange={handleChange}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                            setActiveRowIndex={setActiveRowIndex}
                            setHelpFor={setHelpFor}
                            handleHelpList={handleHelpList}
                            setHelpListHeader={setHelpListHeader}
                            handleAddRow={handleAddRow}
                            getValidateData={getValidateData}
                            otherQueryPera={otherQueryPera}
                            handleDeleteRow={handleDeleteRow}
                        // setFocusedRowIndex={setFocusedRowIndex}

                        />

                    </TabPane>

                    {helpList && (
                        <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                            <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                            <ModalBody>
                                <HelpList
                                    // formStatus={formStatus='Insert'}
                                    formStatus={'Insert'}
                                    helpFor={helpFor}
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_MATERIAL_ISSUE}`}
                                    helpListHeader={helpListHeader}
                                    handleHelpList={handleHelpList}
                                    onSelectHelpItem={onSelectHelpItem}
                                    queryPera={{ needAppGlobalData: 'Y' }}
                                    whereClause={whereClauseForHelp(helpFor)}

                                />
                            </ModalBody>
                        </Modal>
                    )}
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default MaterialIssue;


