import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect} from "react";
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formDataInitData, createSearchPayloadForBVSpecificSearch } from './inter_transfer_memo_helpers';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useSelector } from 'react-redux';
import IncomeQualityDvtn from './Incoming_quality_inspection_DVTN';
import IncomingQualityInspectINQCI from './Incoming_quality_inspect_INQCI';
import IncomingQualityInspectBatch from './Incoming_quality_inspect_batch';
import { formBatchInitData, formDetailInitData, formDtlInqInitData, formDvtnInitData } from './Incoming_quality_inspection';
import { dateFormatter } from '../../../../utils/fn';
import { validateForm } from '../../../../utils/fn';
import { PiDeviceTabletSpeakerLight } from 'react-icons/pi';


const IncomingQualityInspection = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ formDataInitData });
    const [formDetailData, setFormDetailData] = useState([formDetailInitData])
    const [formDtlInqData, setFormDtlInqData] = useState([formDtlInqInitData])
    const [batchData, setBatchData] = useState([formBatchInitData])
    const [formDvtnData, setFormDvtnData] = useState({ formDvtnInitData })
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

    const [deletedTdmmrctData, setDeletedTdmmrctData] = useState([])

    const [deletedTommiqciData, setDeletedTommiqciData] = useState([])

    const [deletedBatchData, setDeletedBatchData] = useState([])

    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);

    const tabs = ["INQCI"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    // for dropdown data 

    const [remarkData, setRemarkData] = useState([])


    // for help list 

    const [helpList, setHelpList] = useState(false)
    const [helpFor, setHelpFor] = useState('')
    const [helpListHeader, setHelpListHeader] = useState([])

    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList)

    const onSelectHelpItem = (data) => {
        if (["mrir"].includes(helpFor) && focusedRowIndex !== null && focusedRowIndex >= 0) {

            // Update main form
            setFormData(prev => ({
                ...prev,
                mrir_no: data.mrir_no,
                sale_return: data.sale_return,
                it_p_umf: data.it_p_umf,
                v_code: data.v_code,
                chln_no: data.chln_no,
                chln_date: dateFormatter(data.chln_date),
                desc: data.it_name,
                uom: data.it_pu_um,
                stok_uom: data.um_code,
                pur_uom: data.it_pu_um,
                stk_um: data.um_code,
                it_code: data.it_code,
                invward_control_no: data.invward_control_no,
                insp_report_no: data.insp_report_no,
                qty_in_no: data.qty_in_no,
                v_name: data.v_name,


            }));

            //  Update table row using focusedRowIndex
            setFormDetailData(prev => {
                const updated = [...prev];
                const currentRow = { ...updated[focusedRowIndex] };

                currentRow.qty_recd = data.qty_recd || "";
                currentRow.qty_ets = data.qty_ets || "";
                currentRow.qty_converted = data.qty_converted || "";
                currentRow.qty_prc_flt_stk_um = data.qty_prc_flt_stk_um || "";
                currentRow.qty_mat_flt_in_stk_um = data.qty_mat_flt_in_stk_um || "";
                currentRow.qty_payment = data.qty_payment || "";
                currentRow.qty_scrap_in_stk_um = data.qty_scrap_in_stk_um || "";
                currentRow.mrir_date = dateFormatter(data.mrir_date) || "";
                //currentRow.clear_dt = dateFormatter(data.clear_dt) || "";
                //  currentRow.clear_dt = data.clear_dt ? dateFormatter(new Date(data.clear_dt)) : dateFormatter(new Date());
                currentRow.clear_dt = dateFormatter(data.clear_dt || new Date());
                currentRow.qty_ok_in_stk_um = data.ok_scrap_in_stk_um || "";
                currentRow.po_id = data.po_id || "";
                currentRow.remarks = data.remarks || "";
                currentRow.it_pu_um = data.it_pu_um || "";
                currentRow.um_code = data.um_code || "";
                currentRow.create_id = data.create_id || "";
                currentRow.update_id = data.update_od || "";


                updated[focusedRowIndex] = currentRow;
                return updated;
            });
        }

        if (["spec", "defect"].includes(helpFor) && activeRowIndex !== null) {
            setFormDtlInqData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "defect":
                        currentRow.defect_det_code = data.defect_code;
                        currentRow.defect_desc = data.defect_det_desc;
                        break;
                }

                switch (helpFor) {
                    case "spec":
                        currentRow.spec_no = data.spec_no;
                        currentRow.spec_desc = data.spec;
                        currentRow.inspection_code = data.instrument
                        break;


                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }
    };

    // fetch drop down data
    useEffect(() => {
        const fetchConstantList = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DROPDOWNDATA_INCOMING_QUALITY_INSPECTION}`, { credentials: 'include', }
                )
                if (response.status === 200) {
                    const data = await response.json()
                    setRemarkData([{ value: "", label: "" }, ...formatOptions(data.remark || [], "remark_id", "remark_desc")])

                }
            } catch (err) {
                console.error("Error fetching constants:", err)
            }
        }
        fetchConstantList()
    }, [formStatus])


    const handleHelpList = (data) => {
        setHelpList(data);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        //  Accepted Purchase Qty cannot be blank (per item)
        for (const item of formDetailData) {
            if (!item.qty_acp_in_pur_um) {
                toast.error(`Accepted Purchase Qty cannot be blank for item ${item.it_code || ""}`);
                return;
            }
        }

        // 2 Segregation check (per item)
        const checkBox = formData.under_seg; // boolean
        for (const item of formDetailData) {
            if ((item.qty_ok_in_stk_um || 0) > 0 && (item.qty_rejd_stk || 0) > 0 && !checkBox) {
                toast.error(`This MRIR should be Cleared under Segregation for item ${item.it_code || ""}`);
                return;
            }
        }

        // 3️ Scrap Qty check (per item)
        for (const item of formDetailData) {
            if (item.scrap === 1 && (item.qty_scrap_in_stk_um || 0) === 0) {
                toast.error(`Scrap Qty cannot be blank for item ${item.it_code || ""}`);
                return;
            }
        }

        // 4️ Defect code check (per item, uses formInqiData)
        for (const item of formDetailData) {
            const inqi = formDtlInqData.find(f => f.it_code === item.it_code);
            if ((item.qty_rejd || 0) !== 0 && (!inqi || !inqi.defect_code)) {
                toast.error(`DEFECT CODE MUST BE ENTERED for item ${item.it_code || ""}`);
                return;
            }
        }

        for (const item of formDetailData) {
            if ((item.under_dc || 0) !== 1) {
                if ((item.packed_material || "N") === "N") {
                    if (!item.clear_dt) {
                        // Assign today's date if clear_dt is empty
                        item.clear_dt = new Date().toISOString().split('T')[0]

                    }
                }
            }
        }

        for (const item of formDetailData) {
            // 1️⃣ Status Flag
            if (item.packed_material === 'Y' || item.under_dc === 1) {
                item.status_flg = 'I';
            } else {
                item.status_flg = 'S';
            }

            // 2 Map quantities 
            item.qty_accptd = item.qty_acp_in_pur_um || 0;
            item.qty_prc_fault = item.qty_prc_flt_stk_um || 0;
            item.qty_mat_fault = item.qty_mat_flt_in_stk_um || 0;
            item.scrap_qty = item.qty_scrap_in_stk_um || 0;
            item.qty_reworked = item.qty_rework_in_stk_um || 0;
            item.qty_destructed = item.qty_destruct_in_stk_um || 0;

            // 3️ Assign inspection report
            item.insp_report_no = formData.insp_report_no || item.insp_report_no;


        }
        try {
            const body = {
                formData,
                formDetailData,
                formDtlInqData,
                batchData,
                divisionId: user.global_division_id,
                deletedBatchData: deletedBatchData,
                deletedTdmmrctData: deletedTdmmrctData,
                deletedTommiqciData: deletedTommiqciData,

            };

            //console.log("Final body to send:", body);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_INCOMING_QUALITY_INSPECTION}?form_status=${formStatus}&step=submit`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: "include",
                }
            );

            const result = await response.json();
            //console.log("API Response:", result);

            if (response.ok) {
                toast.success("Record Updated successfully!");
            } else {
                toast.error(result.message || "Failed to submit form.");
            }

            handleCancel();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred during submission.");
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
                `${APP_PROD_API.GET_DATA_FOR_ITEM_OPENING_RATE_MSTR}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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


    function handleOffset(data) {
        setCurrentRecordNo(data)
    }

    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData({ ...formDataInitData });
        setFormDetailData([formDetailInitData])
        setFormDtlInqData([formDtlInqInitData])
        setBatchData([formBatchInitData])
    }, []);

    const numericFieldConfig = {
        qty_ets: { maxLength: 11, decimalPlaces: 3 },
        move_tktqty: { maxLength: 13, decimalPlaces: 3 },
        qty_recd: { maxLength: 15, decimalPlaces: 5 },
        qty_converted: { maxLength: 15, decimalPlaces: 5 },
        qty_acp_in_pur_um: { maxLength: 13, decimalPlaces: 3 },
        qty_ok_in_stk_um: { maxLength: 15, decimalPlaces: 2 },
        qty_rejd: { maxLength: 13, decimalPlaces: 3 },
        qty_rejd_stk: { maxLength: 13, decimalPlaces: 3 },
        qty_prc_flt_stk_um: { maxLength: 15, decimalPlaces: 3 },
        qty_mat_flt_in_stk_um: { maxLength: 15, decimalPlaces: 3 },
        qty_rework_in_stk_um: { maxLength: 15, decimalPlaces: 3 },
        qty_payment: { maxLength: 11, decimalPlaces: 3 },
        qty_scrap_in_stk_um: { maxLength: 13, decimalPlaces: 5 },
        qty_desctruct_in_stk_um: { maxLength: 15, decimalPlaces: 5 },
    };

    // Safe number formatting
    const formatNumberInput = (value, maxLength, decimalPlaces) => {
        if (value === null || value === undefined) return "";

        // Convert number to string
        let strValue = String(value);

        // Remove invalid characters
        strValue = strValue.replace(/[^0-9.]/g, "");

        // Only allow one decimal point
        const parts = strValue.split(".");
        if (parts.length > 2) strValue = parts[0] + "." + parts[1];

        // Limit decimal places
        if (parts[1]) strValue = parts[0] + "." + parts[1].slice(0, decimalPlaces);

        // Limit total length
        if (strValue.length > maxLength) strValue = strValue.slice(0, maxLength);

        return strValue;
    };

    const handleChange = useCallback((target, fieldName, value, rowIndex = null) => {

        if (["mrir_no"].includes(fieldName)) {
            toast.error('Please select from helplist')
        }

        if (formStatus === 'Query') {
            toast.error("This form is not working on Query Mode")
        }
        // Apply numeric formatting if the field has config
        if (numericFieldConfig[fieldName]) {
            const { maxLength, decimalPlaces } = numericFieldConfig[fieldName];
            value = formatNumberInput(value, maxLength, decimalPlaces);
        }

        switch (target) {
            case "formData":

                setFormData(prev => ({ ...prev, [fieldName]: value }));
                if (rowIndex !== null) {
                    setFormData(prev => {
                        const updated = [...prev];
                        updated[rowIndex] = { ...updated[rowIndex], [fieldName]: value };
                    })
                }
                break;

            case "formDetailData":
                if (rowIndex !== null) {
                    setFormDetailData(prev => {
                        const updated = [...prev];
                        updated[rowIndex] = { ...updated[rowIndex], [fieldName]: value };
                        return updated;
                    });
                }
                break;

            case "formBatchData":
                if (rowIndex !== null) {
                    setBatchData(prev => {
                        const updated = [...prev];
                        updated[rowIndex] = { ...updated[rowIndex], [fieldName]: value };
                        return updated;
                    });
                }
                break;

            case "formDtlInqData":
                if (rowIndex !== null) {
                    setFormDtlInqData(prev => {
                        const updated = [...prev];
                        updated[rowIndex] = { ...updated[rowIndex], [fieldName]: value };
                        return updated;
                    });
                }
                break;

            case "formDvtnData":
                setFormDvtnData(prev => ({ ...prev, [fieldName]: value }));
                break;


            default:
                console.warn("Unknown handleChange target:", target);
        }
    }, []);

    // for add delete row 

    const handleAddRow = (tableType) => {
        if (tableType === 'formDtlInqData') {
            // const isvalidItemData = validateForm("form-item-data")

            // if (!isvalidItemData) {
            //     return
            // }
            setFormDtlInqData((prev) => [
                ...prev,
                {
                    ...formDtlInqInitData,
                    //id: prev.length + 1
                },
            ]);
        }

        if (tableType === 'batchData') {

            // const isvalidBatchData = validateForm("form-batch-data")

            // if (!isvalidBatchData) {
            //     return
            // }
            setBatchData((prev) => [
                ...prev,
                {
                    ...formBatchInitData,
                    // id: prev.length + 1
                },
            ]);

        }
    };


    const handleDeleteRow = useCallback((type, data, index) => {

        if (type = 'formDtlData') {
            let newDeleteData = [...deletedTdmmrctData];
            newDeleteData.push(data);
            setDeletedTdmmrctData(newDeleteData);

            setFormDetailData((prev) => {
                if (prev.length === 0) return prev;

                const newData = prev.filter((_, i) => i !== index);

                // Adjust focus index if needed
                setFocusedRowIndex((currentFocusIndex) => {
                    if (index === currentFocusIndex) {
                        // Focus the previous row, or 0 if no previous
                        return index > 0 ? index - 1 : 0;
                    } else if (index < currentFocusIndex) {
                        // Row above deleted, shift focus index down by 1
                        return currentFocusIndex - 1;
                    } else {
                        // No change needed
                        return currentFocusIndex;
                    }
                });

                return newData;
            });
        }

        if (type = 'formDtlInqData') {
            let newDeleteData = [...deletedTommiqciData]
            newDeleteData.push(deletedTommiqciData)
            setDeletedTommiqciData(newDeleteData)

            setFormDtlInqData((prev) => {
                if (prev.length === 0) return prev;

                const newData = prev.filter((_, i) => i !== index);
                return newData;
            });
        }

        if (type = 'batchData') {
            let newDeleteData = [...deletedBatchData]
            newDeleteData.push(deletedBatchData)
            setDeletedBatchData(newDeleteData)
            setBatchData((prev) => {
                if (prev.length === 0) return prev;

                const newData = prev.filter((_, i) => i !== index);

                return newData;
            });

        }

    });

    const whereClauseForHelp = (helpFor) => {

        if (helpFor === 'spec') {
            return { it_code: formData.it_code, defect_code: formDtlInqData[focusedRowIndex]?.defect_code };
        }
        return {};
    }


    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            // Handle failure case
            if (queryData.recordCount === 0) {
                toast.error(queryData.message);
                return;
            }

            // if (btnClicked === "Query") {

            //     setTotalRecordCount(queryData.count || totalRecordCount);
            // }

            // setFormData(queryData.mommitemData)

        },
        [formStatus, currentRecordNo]
    );

    const callInsertFillParam = async (e) => {
        if (e) e.preventDefault();

        const {
            it_code

        } = formData;

        try {
            const body = {
                formData,

            };

            //console.log("Final body to send:", body);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_INCOMING_QUALITY_INSPECTION}?form_status=${formStatus}&step=param`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await response.json();
            toast.success("Data fill successfully!");
            return data; // Success
        } catch (error) {
            toast.error(
                error.message || "Please check all the form fields or contact administrator"
            );
            return null; // Failed
        }
    };

    const callInsertFillBatch = async (e) => {
        if (e) e.preventDefault();
        try {
            const body = {
                formData,
                formDetailData

            };

            //console.log("Final body to send:", body);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_INCOMING_QUALITY_INSPECTION}?form_status=${formStatus}&step=batch`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await response.json();
            toast.success("Data fill successfully!");
            return data; // Success
        } catch (error) {
            toast.error(
                error.message || "Please check all the form fields or contact administrator"
            );
            return null; // Failed
        }
    };

    const callProcDvtnCheck = async (e) => {
        if (e) e.preventDefault();
        try {
            const body = {
                formData,
                formDetailData
            };

            //console.log("Final body to send:", body);

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_INCOMING_QUALITY_INSPECTION}?form_status=${formStatus}&step=dvtn`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await response.json();
            //console.log("API Response:", data);

            if (data?.deviation_test !== undefined) {
                //console.log("Deviation Test Value:", data.deviation_test);

            } else {
                // toast.success("Data filled successfully!");
            }

            return data;
        } catch (error) {
            toast.error(
                error.message || "Please check all the form fields or contact administrator"
            );
            return null;
        }
    };

    const showDeviationModal = async (rowData) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_INCOMING_QUALITY_INSPECTION}?form_status=${formStatus}&step=showDvtn`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        formDetailData: formDetailData,
                        formData: formData,
                        deviation_test: rowData.deviation_test,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to fetch deviation data");

            const data = await response.json();
            if (data.success) {
                setFormDvtnData(data.deviationData);
                setActiveTab(3);
            }
        } catch (error) {
            toast.error("Error loading deviation data: " + error.message);
        }
    };



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
                formData
                handleOffset={handleOffset}
                QUERY_API={APP_PROD_API.GET_DATA_FOR_ITEM_OPENING_RATE_MSTR}
                formName={"Incoming Quality Inspection"}
                authority={{ insert: 'N', update: 'Y' }}
                //authority={{ insert: "N", update: "N" }}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
                btnEnableDtl={{ search: false, insert: false }}

            >
                <TabContent activeTab={activeTab}>

                    <TabPane tabId={3}>
                        <IncomeQualityDvtn
                            formData={formDvtnData}
                            handleChange={handleChange}
                            formStatus={formStatus}
                        />

                    </TabPane>

                    <TabPane tabId={1}>
                        <IncomingQualityInspectINQCI
                            formData={formData}
                            handleChange={handleChange}
                            formStatus={formStatus}
                            formDetailData={formDetailData}
                            formDtlInqData={formDtlInqData}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                            setActiveRowIndex={setActiveRowIndex}
                            setHelpFor={setHelpFor}
                            handleHelpList={handleHelpList}
                            setHelpListHeader={setHelpListHeader}
                            callInsertFillParam={callInsertFillParam}
                            setFormDetailData={setFormDetailData}
                            setActiveTab={setActiveTab}
                            callInsertFillBatch={callInsertFillBatch}
                            setBatchData={setBatchData}
                            handleAddRow={handleAddRow}
                            handleDeleteRow={handleDeleteRow}
                            callProcDvtnCheck={callProcDvtnCheck}
                            showDeviationModal={showDeviationModal}
                            remarkData = {remarkData}

                        />

                    </TabPane>
                    <TabPane tabId={2}>
                        <IncomingQualityInspectBatch
                            batchData={batchData}
                            handleChange={handleChange}
                            formStatus={formStatus}
                            setActiveTab={setActiveTab}
                            setFocusedRowIndex={setFocusedRowIndex}
                            handleAddRow={handleAddRow}
                            handleDeleteRow={handleDeleteRow}

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
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_INCOMING_QUALITY_INSPECTON}`}
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

export default IncomingQualityInspection;

