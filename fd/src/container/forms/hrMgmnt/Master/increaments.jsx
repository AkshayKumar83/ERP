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
//import { InitialFormData, matConsumptionDtlInitFormData } from './pl_schd_mat_consm_helper';
//import PlMatConsumptionDtl from './pl_schd_mat_consmDtl'; 
import { formDataInitData, formDtlInitData, formDataHeader, gradeHelpListHeader, createSearchPayloadForBVSpecificSearch, empHelpListHeader } from './increaments_helper.js'
import { FcInfo } from "react-icons/fc"
import { APP_PROD_API } from '../../../../utils/api.js'
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { dateFormatter, validateForm } from '../../../../utils/fn';
import IncreamentDtl from './increaments_dtl.jsx';


const Increaments = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ ...formDataInitData });
    const [formDetailData, setFormDetailData] = useState([formDtlInitData])
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
        setSearchQuery, } = useFormStatus();


    const [focusedRowIndex, setFocusedRowIndex] = useState(0)
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [deletedRecord, setDeletedRecord] = useState([])

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

    // const onSelectHelpItem = (data) => {

    //     // Update detail data (table rows)
    //     if (["grade", "emp",].includes(helpFor) && activeRowIndex !== null) {
    //         setFormDetailData((prev) => {
    //             const updated = [...prev];
    //             const currentRow = { ...updated[activeRowIndex] };

    //             switch (helpFor) {
    //                 case "emp":
    //                     currentRow.emp_name = data.emp_name
    //                     currentRow.p_desig_desc = data.p_desig
    //                     currentRow.p_department = data.p_dept
    //                     currentRow.p_grade_desc = data.p_grade
    //                     currentRow.p_cat_desc = data.p_category

    //                     break;

    //             }

    //             updated[activeRowIndex] = currentRow;
    //             return updated;
    //         });
    //     }

    // };   

    const onSelectHelpItem = (data) => {
        console.log("Selected Data:", data);

        if (helpFor === "emp") {
            setFormData((prev) => ({
                ...prev,
                emp_name: data.emp_name,
                emp_cd: data.emp_cd,

            }));
        }

        // Update detail data (table rows)
        if (
            ["grade", "cat", "desig"].includes(helpFor) &&
            activeRowIndex !== null
        ) {
            setFormDetailData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "grade":
                        currentRow.grade_cd = data.code;
                        currentRow.grad_desc = data.description;
                        break;

                    case "desig":
                        currentRow.desgn = data.code;
                        currentRow.desg_desc = data.description;
                        break;

                    case "cat":
                        currentRow.category = data.code;
                        currentRow.category_desc = data.description;
                        break;
                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }
    };


    const whereClauseForHelp = (helpFor) => {

        if (helpFor === 'grade') {

            return { category: formDetailData[activeRowIndex]?.category };
        }

        if (helpFor === 'desig') {
            return { category: formDetailData[activeRowIndex]?.category };
        }

        return {};
    }

    const otherQueryPera = {
        emp_cd: formData?.emp_cd || "",

    };

    // for validate data  

    const getValidateData = async (
        fieldName,
        fieldValue,
        otherQueryPera = {}
    ) => {
        try {
            //
            const cleanedParams = { ...otherQueryPera };
            delete cleanedParams[fieldName];

            const otherParams = new URLSearchParams(cleanedParams).toString();

            const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INCREAMENT_VALIDATE_DATA
                }?${fieldName}=${fieldValue}${otherParams ? `&${otherParams}` : ""
                }&appDivisionId=${user?.global_division_id}
        &appFinYear=${user?.global_fin_year}
        &appUserId=${user?.id}`;

            const response = await fetch(API_STRING);
            const result = await response.json();

            if (response.status === 200) {
                const data = result.data || {};

                setFormData((prev) => ({
                    ...prev,
                    emp_name: data.emp_name ?? "",
                    p_desig_desc: data.p_desig_desc ?? "",
                    p_department: data.p_department ?? "",
                    p_grade_desc: data.p_grade_desc ?? "",
                    p_cat_desc: data.p_cat_desc ?? "",
                    p_basic: data.p_basic ?? "",
                    division_id: data.division_id ?? "",
                    location_id: data.location_id ?? "",

                }));

                return true;
            }

            toast.error(result.message);
            return false;

        } catch (err) {
            console.error("Error fetching validation data:", err);
            toast.error(err.message);
            return false;
        }
    };



    const handleDoubleClick = (field, header) => {
        if (formStatus && focusedRowIndex !== null) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
            //setActiveRowIndex(rowIndex);
        }
    };



    const tabs = ["Increaments"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const increamentForm = document.getElementById("increaments-form");

            // Form required field validation
            const increamentFormValidity = increamentForm.checkValidity();
            if (!increamentFormValidity) {
                if (increamentForm.reportValidity) {
                    increamentForm.reportValidity();
                }
                else {
                    toast.error("Please fill all required fields");
                }
                return;
            }

            if (formDetailData.length > 1) {

                // Duplicate check
                const seen = new Set();
                for (const row of formDetailData) {
                    const key = `${row.eff_date}`;
                    if (seen.has(key)) {

                        toast.error("Employee name + eff_date already exists");
                        return
                    }
                    seen.add(key);
                }
            }

            if (formStatus === 'Insert') {
                let newRecords = formDetailData.filter(newData => newData.hasOwnProperty('id'));
                if (newRecords.length === 0) {
                    toast.error('There should be atleast a New Entry for submit in Insert')
                    return
                }

            }

            let body = {
                formData: formData,
                formDetailData: formDetailData,

            };

            //  Modify the body for "Update" status
            if (formStatus === "Update") {
                body = {
                    ...body,
                    deletedData: deletedRecord,
                };
            }

            console.log("Final body to send:", body);
            const response = await fetch(
                ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_INCREAMENT_FORM_DATA
                }?form_status=${formStatus}`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong");
                // setDeletedRecord
            }

            setDeletedRecord([]);

            toast.success("Data saved successfully!");
            handleCancel();
        } catch (error) {
            toast.error(
                error.message ||
                "Please check all the form fields or contact administrator"
            );
        }
    };



    function handleOffset(data) {
        setCurrentRecordNo(data)
    }

    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData({});
        setFormDetailData([formDtlInitData])
    }, []);

    const handleChange = useCallback((type, name, value, rowIndex = null, e) => {
        if (!["Insert", "Update"].includes(formStatus)) { 
             
            console.log('change')
            return; 
            
        }

        if (
            [
                "grd_desc", 


            ].includes(name)
        ) {
            toast.error("Please select from helplist");
            return;
        }

        if (
            [
                "category_desc",
                "grad_desc",
                "desg_desc",
                "emp_cd"

            ].includes(name)
        ) {
            toast.error("Please select from helplist");
            return;
        }



        const isNumberField = e?.target?.type === "number";
        const isStringField = typeof value === "string";
        const processedValue = isStringField ? value.toUpperCase() : value;

        const inputType = e?.target?.type;
        const supportsSelection =
            inputType === "text" || inputType === "search" || inputType === "textarea";

        const getUpdatedValue = () => {
            if (supportsSelection && e?.target) {
                const { selectionStart, selectionEnd } = e.target;
                const newValue = processedValue;

                requestAnimationFrame(() => {
                    e.target.setSelectionRange(selectionStart, selectionEnd);
                });

                return newValue;
            }
            return processedValue;
        };


        switch (type) {

            case "formData":
                setFormData(prev => ({
                    ...prev,
                    [name]: getUpdatedValue()
                }));
                break;



            case "formDetailData":
                setFormDetailData(prev => {
                    if (rowIndex !== null && rowIndex >= 0) {
                        // Update a specific row
                        const newData = [...prev];
                        newData[rowIndex] = {
                            ...newData[rowIndex],
                            [name]: getUpdatedValue()
                        };
                        return newData;
                    } else {
                        // Update all rows (used for Select field outside table)
                        return prev.map(row => ({
                            ...row,
                            [name]: getUpdatedValue()
                        }));
                    }
                });
                break;

            default:
            //console.log("handleChange is not properly defined");
        }


    }, [formStatus]);

    // For Search Record
    const handleSearch = async () => {
        try {
            setTotalRecordCount(0);
            setCurrentRecordNo(0);
            const searchPayload = createSearchPayloadForBVSpecificSearch({ ...formData });
            const queryList = new URLSearchParams(searchPayload);

            if ([...queryList].length === 0) {
                toast.error("Please enter search criteria");
                return;
            }

            setSearchQuery(searchPayload);

            const data = await fetchAppData(
                `${APP_PROD_API.GET_INCREAMENT_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

    //  ADD NEW ROW
    const handleAddRow = useCallback(() => {

        const increamentForm = document.getElementById("increaments-form");

        // Form required field validation
        const increamentFormValidity = increamentForm.checkValidity();
        if (!increamentFormValidity) {
            if (increamentForm.reportValidity) {
                increamentForm.reportValidity();
            }
            else {
                toast.error("Please fill all required fields");
            }
            return;
        }

        if (formDetailData.length > 1) {

            // Duplicate check
            const seen = new Set();
            for (const row of formDetailData) {
                const key = `${row.eff_date}`;
                if (seen.has(key)) {

                    toast.error("Employee name + eff_date already exists");
                    return
                }
                seen.add(key);
            }
        }

        setFormDetailData((prevData) => [...prevData, formDtlInitData]);
    }, [formData]);

    //-----------------------------  if basic is empty in formData then set it from focused row basic  -----------------------

    useEffect(() => {
        const basic = formDetailData?.[focusedRowIndex]?.basic;

        if (basic != null) {
            setFormData(prev => ({
                ...prev,
                p_basic: basic
            }));
        }
    }, [focusedRowIndex, formDetailData]);




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

    }, [deletedRecord]);

    const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = formDetailData.find((entry) => entry.sr_no === id);
        setFocusedRowIndex(rowIndex);
        // triggerFamilyDetail(id)
    };

    const setupQueryData = useCallback(
        (queryData, btnClicked) => {
            // Handle failure case
            if (queryData.recordCount === 0) {
                toast.error(queryData.message);
                handleCancel();
                return;
            }

            if (btnClicked === "Query") {
                setTotalRecordCount(queryData.count || totalRecordCount);
            }

            const updatedData = queryData.increamentData.map(item => ({
                ...item,
                init_eff_date: item.eff_date,

            }))

            setFormData(queryData.employeeData);


            //  setFormDetailData(queryData.increamentData) 
            setFormDetailData(updatedData)


        },
        [formStatus, currentRecordNo]
    );

    const validateRequiredField = (e, fieldLabel) => {
        if (!["Insert", "Update"].includes(formStatus)) {
            return;
        }
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            // e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
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
                isQueryReqOnInsertBtn={true}
                reqCurrentQueryRecOnInsert={true}
                isQueryReqOnNextPreBtn={true}
                setupQueryData={setupQueryData}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                handleOperation={handleOperation}
                formData
                handleOffset={handleOffset}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
                QUERY_API={APP_PROD_API.GET_INCREAMENT_FORM_DATA}
                formName={"Increaments"}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={10}>
                                <Row className='mt-2'>
                                    <Col xl={5} className="m-auto">
                                        <TextField
                                            required
                                            label="Token No."
                                            type="text"
                                            name="emp_cd"
                                            value={formData?.emp_cd || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "emp_cd",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            onDoubleClick={() =>
                                                handleDoubleClick("emp", empHelpListHeader)
                                            }
                                            onBlur={async (e) => {
                                                if (
                                                    formStatus === "Update" ||
                                                    formStatus === "Insert"
                                                ) {
                                                    const item = e.target.value;
                                                    const isValid = await getValidateData(
                                                        "emp_cd",
                                                        item,
                                                        otherQueryPera,
                                                        null
                                                    );

                                                    if (!isValid) {
                                                        e.target.focus();
                                                    }
                                                }
                                            }} 
                                            disabled = {formStatus === 'Insert' || formStatus === 'Update'}
                                        />
                                    </Col>

                                    <Col xl={5} className="m-auto">
                                        <TextField
                                            required
                                            label="Emp. Name"
                                            type="text"
                                            name="emp_name"
                                            value={formData?.emp_name || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "emp_name",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            disabled
                                        />
                                    </Col>
                                </Row>

                                <Row className='mt-2'>
                                    <Col xl={5} className="m-auto">
                                        <TextField
                                            required
                                            label="Designation"
                                            type="text"
                                            name="p_desig_desc"
                                            value={formData?.p_desig_desc || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "p_desig_desc",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            disabled
                                        />
                                    </Col>

                                    <Col xl={5} className="m-auto">
                                        <TextField
                                            required
                                            label="Department"
                                            type="text"
                                            name="p_department"
                                            value={formData?.p_department || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "p_department",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            disabled
                                        />
                                    </Col>
                                </Row>

                                <Row className="mt-2">
                                    <Col xl={3} className="m-auto">
                                        <TextField
                                            required
                                            label="Grade"
                                            type="text"
                                            name="p_grade_desc"
                                            value={formData?.p_grade_desc || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "p_grade_desc",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }

                                            disabled
                                        />
                                    </Col>

                                    <Col xl={3} className="m-auto">
                                        <TextField
                                            required
                                            label="Category"
                                            type="text"
                                            name="p_cat_desc"
                                            value={formData?.p_cat_desc || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "p_cat_desc",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            disabled
                                        />
                                    </Col>

                                    <Col xl={3} className="m-auto">
                                        <TextField
                                            required
                                            label="Basic"
                                            type="number"
                                            name="p_basic"
                                            value={formData?.p_basic || formDetailData[focusedRowIndex]?.basic || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "p_basic",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </Col>

                        </Row>
                        <IncreamentDtl
                            formStatus={formStatus}
                            formDetailData={formDetailData}
                            handleChange={handleChange}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                            setActiveRowIndex={setActiveRowIndex}
                            handleAddRow={handleAddRow}
                            handleDeleteRow={handleDeleteRow}
                            setHelpFor={setHelpFor}
                            handleHelpList={handleHelpList}
                            setHelpListHeader={setHelpListHeader}
                            validateRequiredField={validateRequiredField}


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
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INCREAMENT_FORM_DATA}`}
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

export default Increaments;

