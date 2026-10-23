import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
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
import { formInitData, formDataHeader, createSearchPayloadForBVSpecificSearch, gradeHelpListHeader } from './grade_helper.js'
import { FcInfo } from "react-icons/fc"
import { APP_PROD_API } from '../../../../utils/api.js'
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { dateFormatter, validateForm } from '../../../../utils/fn';

const Grade = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState([formInitData]);
    //const [formDetailData, setFormDetailData] = useState([matConsumptionDtlInitFormData])
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


    const tabs = ["Grade"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);



    const handleHelpList = (data) => {
        setHelpList(data);
    }

    const onSelectHelpItem = (data) => {

        // Update detail data (table rows)
        if (["grade"].includes(helpFor) && activeRowIndex !== null) {
            setFormData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "grade":
                        currentRow.description = data.description
                        currentRow.grade_cd = data.code

                        break;

                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }

    };

    const handleDoubleClick = (field, header, rowIndex) => {
        if (formStatus && focusedRowIndex !== null) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
            setActiveRowIndex(rowIndex);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const gradeForm = document.getElementById("grade-form");

            // Form required field validation
            const gradeFormValidity = gradeForm.checkValidity();
            if (!gradeFormValidity) {
                if (gradeForm.reportValidity) {
                    gradeForm.reportValidity();
                }
                else {
                    toast.error("Please fill all required fields");
                }
                return;
            }

            if (formStatus === 'Insert') {
                console.log(formData);
                let newRecords = formData.filter(newData => newData.hasOwnProperty('id'));
                // console.log('newRecords', newRecords, formData) ;
                if (newRecords.length === 0) {
                    toast.error('There should be atleast a New Entry for submit in Insert')
                    return
                }

            }

            for (const record of formData) {

                if (record.start_basic >= record.end_basic) {
                    toast.error("End Basic can't be less than Start Basic");
                    return;
                }
            }


            // Duplicate check
            if (formData?.length > 1) {
                const seen = new Set();
                for (const row of formData) {
                    const key = `${row.description}|${row.start_basic}|${row.increament}|${row.end_basic}`;
                    if (seen.has(key)) {
                        toast.error("Duplicate record found with same entry");
                        return;
                    }
                    seen.add(key);
                }
            }

            let body = {
                formData: formData,
                //transYear: user?.global_fin_year,
                // divisionId: user?.global_division_id,
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
                ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GRADE_DATA
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
            }

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
        setFormData([formInitData]);
    }, []);

    const handleChange = useCallback((type, name, value, rowIndex = null, e) => {
        if (!["Insert", "Update", "Search"].includes(formStatus)) {
            return;
        }

        if (
            [
                "description"

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
            if (!isNumberField && e?.target) {
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

            // case "formData":
            //     setFormData(prev => ({
            //         ...prev,
            //         [name]: typeof value === "string" ? value.toUpperCase() : value
            //     }));
            //     break;    



            case "formData":
                setFormData(prev => {
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
            const searchPayload = createSearchPayloadForBVSpecificSearch({ ...formData[0] });
            const queryList = new URLSearchParams(searchPayload);

            if ([...queryList].length === 0) {
                toast.error("Please enter search criteria");
                return;
            }

            setSearchQuery(searchPayload);

            const data = await fetchAppData(
                `${APP_PROD_API.GET_GRADE_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

        let hasError = false;

        const gradeForm = document.getElementById("grade-form");

        // Form required field validation
        const gradeFormValidity = gradeForm.checkValidity();
        if (!gradeFormValidity) {
            if (gradeForm.reportValidity) {
                gradeForm.reportValidity();
            }
            else {
                toast.error("Please fill all required fields");
            }
            return;
        }

        // Start vs End basic validation
        for (const record of formData) {
            if (Number(record.start_basic) >= Number(record.end_basic)) {
                toast.error("End Basic must be greater than Start Basic");
                hasError = true;
            }
        }

        // Duplicate validation
        if (formData?.length > 1) {
            const seen = new Set();
            for (const row of formData) {
                const key = `${row.description}|${row.start_basic}|${row.increament}|${row.end_basic}`;
                if (seen.has(key)) {
                    toast.error("Duplicate record found with same entry");
                    hasError = true;
                }
                seen.add(key);
            }
        }

        //  If any error found then STOP here
        if (hasError) return;

        //  If no error, then add row
        setFormData((prevData) => [...prevData, formInitData]);

    }, [formData]);


    // DELETE ROW
    const handleDeleteRow = useCallback((data, index) => {
        console.log("Deleting row", index, data);

        //  Always get the latest deletedRecord
        setDeletedRecord((prevDeleted) => [...prevDeleted, data]);

        setFormData((prev) => {
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

    const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = formData.find((entry) => entry.sr_no === id);
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

            const updatedData = queryData.mopmgradeData.map(item => ({
                ...item,
                init_grade_cd: item.grade_cd,

            }))

            setFormData(updatedData);
            // setFormData(queryData.mopmgradeData);


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

    const handleQtyError = (data) => {
        console.log(data);
        if (data === null || data === undefined || data === "") {
            return;
        }

        if (data < 0) {
            toast.error("This value can not be negative");
            return true;
        }
        if (data === 0) {
            toast.error("This value can not be zero");
            return true;
        }

        return false;
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
                QUERY_API={APP_PROD_API.GET_GRADE_FORM_DATA}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={8} className='m-auto'>
                                <div className='box-border m-auto'>
                                    <Form id="grade-form">
                                        <div className="table-title">

                                            {
                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                <ButtonUi color="primary" className="add-action"
                                                    onClick={handleAddRow}
                                                >Add Row</ButtonUi>}

                                        </div>

                                        <div className="table-wrapper-v3">
                                            <SimpleBar forceVisible="y" autoHide={false}>
                                                <div className='table-sticky-wrapper'>
                                                    <Table hover>
                                                        <thead style={{ border: '' }}>
                                                            <tr>
                                                                {
                                                                    (formStatus === 'Insert') &&
                                                                    <th className="" style={{}}>Actions</th>
                                                                }
                                                                {formDataHeader?.map((header, index) => (
                                                                    <th
                                                                        key={index}
                                                                        data-required={header.required || false}
                                                                        style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                                                        {header.label}
                                                                        {header.required && (
                                                                            <span className="required-asterisk">*</span>
                                                                        )}
                                                                        {header.isHelpExist && <FcInfo title="Info" />}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {formData &&
                                                                formData.map((data, rowIndex) => (
                                                                    <tr key={rowIndex}
                                                                        onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                                                        style={{
                                                                            border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                                                                        }}
                                                                    >

                                                                        {
                                                                            (formStatus === 'Insert') &&
                                                                            <td className="">
                                                                                <RowAction
                                                                                    formStatus={formStatus}
                                                                                    canDelete={formData?.length > 0}
                                                                                    onDelete={() => handleDeleteRow(data, rowIndex)}
                                                                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                                />
                                                                            </td>

                                                                        }
                                                                        <td className=" table_cell">
                                                                            <TextField
                                                                                type="text"
                                                                                required
                                                                                name="description"
                                                                                value={data.description || ""}
                                                                                maxLength={4}
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "description",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                onDoubleClick={() =>
                                                                                    handleDoubleClick(
                                                                                        "grade",
                                                                                        gradeHelpListHeader,
                                                                                        rowIndex
                                                                                    )
                                                                                }

                                                                                onBlur={(e) => validateRequiredField(e, 'Description')}

                                                                            />
                                                                        </td>
                                                                        <td className="table_cell">
                                                                            <TextField
                                                                                type="number"
                                                                                required
                                                                                name="start_basic"
                                                                                value={data.start_basic || ""}
                                                                                //disabled
                                                                                maxLength={13}
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "start_basic",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                // onBlur={(e) => validateRequiredField(e, 'Department')} 
                                                                                onBlur={async (e) => {
                                                                                    if (
                                                                                        formStatus === "Update" ||
                                                                                        formStatus === "Insert"
                                                                                    ) {
                                                                                        validateRequiredField(e, 'start basic')
                                                                                        const val = data.start_basic;
                                                                                        const isNumericField =
                                                                                            !isNaN(val) && val !== "";
                                                                                        const parsedValue = isNumericField
                                                                                            ? parseFloat(val)
                                                                                            : val;
                                                                                        // console.log(parsedValue);

                                                                                        handleChange(
                                                                                            "formData",
                                                                                            "start_basic",
                                                                                            parsedValue?.toFixed(2),
                                                                                            rowIndex,
                                                                                            e
                                                                                        );

                                                                                        const value = e.target.value;

                                                                                        if (
                                                                                            value === "" ||
                                                                                            value === null ||
                                                                                            value === undefined
                                                                                        ) {
                                                                                            return;
                                                                                        }


                                                                                    }
                                                                                }}
                                                                            />
                                                                        </td>

                                                                        <td className="table_cell">
                                                                            <TextField
                                                                                type="number"
                                                                                required
                                                                                name="increament"
                                                                                value={data.increament || ""}
                                                                                maxLength={13}
                                                                                // disabled
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "increament",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                onBlur={async (e) => {
                                                                                    if (
                                                                                        formStatus === "Update" ||
                                                                                        formStatus === "Insert"
                                                                                    ) {

                                                                                        validateRequiredField(e, 'increament')
                                                                                        const val = data.increament;
                                                                                        const isNumericField =
                                                                                            !isNaN(val) && val !== "";
                                                                                        const parsedValue = isNumericField
                                                                                            ? parseFloat(val)
                                                                                            : val;
                                                                                        // console.log(parsedValue);

                                                                                        handleChange(
                                                                                            "formData",
                                                                                            "increament",
                                                                                            parsedValue?.toFixed(2),
                                                                                            rowIndex,
                                                                                            e
                                                                                        );

                                                                                        const value = e.target.value;

                                                                                        if (
                                                                                            value === "" ||
                                                                                            value === null ||
                                                                                            value === undefined
                                                                                        ) {
                                                                                            return;
                                                                                        }


                                                                                    }
                                                                                }}
                                                                            //  onBlur={(e) => validateRequiredField(e, 'Short desc')}

                                                                            />
                                                                        </td>


                                                                        <td className="table_cell">
                                                                            <TextField
                                                                                type="number"
                                                                                required
                                                                                name="end_basic"
                                                                                value={data.end_basic || ""}
                                                                                maxLength={13}
                                                                                // disabled
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "end_basic",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                onBlur={async (e) => {
                                                                                    if (
                                                                                        formStatus === "Update" ||
                                                                                        formStatus === "Insert"
                                                                                    ) {
                                                                                        validateRequiredField(e, 'end basic')
                                                                                        const val = data.end_basic;
                                                                                        const isNumericField =
                                                                                            !isNaN(val) && val !== "";
                                                                                        const parsedValue = isNumericField
                                                                                            ? parseFloat(val)
                                                                                            : val;
                                                                                        // console.log(parsedValue);

                                                                                        handleChange(
                                                                                            "formData",
                                                                                            "end_basic",
                                                                                            parsedValue?.toFixed(2),
                                                                                            rowIndex,
                                                                                            e
                                                                                        );

                                                                                        const value = e.target.value;

                                                                                        if (
                                                                                            value === "" ||
                                                                                            value === null ||
                                                                                            value === undefined
                                                                                        ) {
                                                                                            return;
                                                                                        }
                                                                                        const quantity = Number(e.target.value);

                                                                                        const hasLocalError =
                                                                                            handleQtyError(quantity);
                                                                                        if (hasLocalError) {
                                                                                            e.target.focus();
                                                                                            return;
                                                                                        }

                                                                                        if (quantity <= Number(data.start_basic)) {

                                                                                            console.log('error in end basic', Number(data.start_basic), quantity);
                                                                                            toast.error("End Basic must be greater than Start Basic");
                                                                                            // handleChange(
                                                                                            //     "formData",
                                                                                            //     "end_basic",
                                                                                            //     e.target.value,
                                                                                            //     rowIndex,
                                                                                            //     e
                                                                                            // );
                                                                                            e.target.focus();
                                                                                            return;


                                                                                        }
                                                                                        else {
                                                                                            // No errors, proceed as normal
                                                                                        }
                                                                                    }
                                                                                }
                                                                                }
                                                                            // onBlur={(e) => validateRequiredField(e, 'Short desc')}

                                                                            />
                                                                        </td>

                                                                    </tr>
                                                                ))}
                                                        </tbody>

                                                    </Table>  </div>
                                            </SimpleBar>

                                        </div>


                                    </Form>
                                </div>
                            </Col>
                        </Row>

                    </TabPane>
                    {helpList && (
                        <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                            <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                            <ModalBody>
                                <HelpList
                                    // formStatus={formStatus='Insert'}
                                    formStatus={'Insert'}
                                    helpFor={helpFor}
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GRADE_FORM_DATA}`}
                                    helpListHeader={helpListHeader}
                                    handleHelpList={handleHelpList}
                                    onSelectHelpItem={onSelectHelpItem}
                                    queryPera={{ needAppGlobalData: 'Y' }}
                                // whereClause={whereClauseForHelp(helpFor)}

                                />
                            </ModalBody>
                        </Modal>
                    )}
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default Grade

