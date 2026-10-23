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
import { formDataInitData, formDtlInitData, formDataHeader, gradeHelpListHeader, createSearchPayloadForBVSpecificSearch } from './grade_category_helper.js'
import { FcInfo } from "react-icons/fc"
import { APP_PROD_API } from '../../../../utils/api.js'
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { dateFormatter, validateForm } from '../../../../utils/fn';


const GradeCategory = () => {
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

    const onSelectHelpItem = (data) => {

        // Update detail data (table rows)
        if (["grade"].includes(helpFor) && activeRowIndex !== null) {
            setFormDetailData((prev) => {
                const updated = [...prev];
                const currentRow = { ...updated[activeRowIndex] };

                switch (helpFor) {
                    case "grade":
                        currentRow.grd_desc = data.description
                        currentRow.grd_no = data.code

                        break;

                }

                updated[activeRowIndex] = currentRow;
                return updated;
            });
        }

    };


    const handleGradeBlur = async (e, grdNo, rowIndex) => {
        if (!(formStatus === "Update" || formStatus === "Insert" || formStatus === "Search")) return;

        const field = e.target;
        //const grdNo = field.value;


        validateRequiredField({ target: field }, "Grade Description");

        try {
            const result = await getValidateData("grd_no", grdNo, otherQueryPera, rowIndex);
            //console.log('Validation result:', result);

            if (!result.valid) {
                // Only focus if INVALID
                field.focus();
            } else if (result.data) {

                //     setVisibleData((prevData) => {
                //       const updated = [...prevData];
                //       if (updated[rowIndex]) {
                //         // updated[rowIndex].v_code = vCode;
                //         updated[rowIndex].v_name = result.data.v_name;
                //         updated[rowIndex].pan_no = result.data.pan_no;
                //       }
                //       return updated;
                //     } 
                // );
            }
        } catch (err) {
            console.error("Validation error:", err);
        }
    };



    const otherQueryPera = {
        cat_no: formData?.code || ''

    };


    // for validate data -----------

    const getValidateData = async (fieldName, fieldValue, otherQueryPera = {}, rowIndex = null) => {
        try {
            let API_STRING;

            if (!Object.keys(otherQueryPera).length) {
                API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GRADE_AND_CAT_VALID_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
            } else {
                const otherParams = new URLSearchParams(otherQueryPera).toString();
                API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GRADE_AND_CAT_VALID_DATA}?${fieldName}=${fieldValue}&${otherParams}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
            }

            const response = await fetch(API_STRING);
            const data = await response.json();

            if (response.status === 200) {
                // Validation successful
                return { valid: true, data: data.data || null };
            } else if (response.status === 400) {

                console.log('Validation error message:', data.error);
                toast.error(data.error);
                setFormDetailData((prevData) => {
                    const updated = [...prevData];
                    if (updated[rowIndex]) {
                        // updated[rowIndex].v_code = "";
                    }
                    return updated;
                });
                return { valid: false };
            } else if (response.status === 500) {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error("Error fetching validation data:", err);
            toast.error(err.message);
            return { valid: false };
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


    const tabs = ["Grade and Category"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);





    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const gradeCategoryForm = document.getElementById("grade-category-form");

            // Form required field validation
            const gradeCategoryFormValidity = gradeCategoryForm.checkValidity();
            if (!gradeCategoryFormValidity) {
                if (gradeCategoryForm.reportValidity) {
                    gradeCategoryForm.reportValidity();
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
                    const key = `${row.grd_no}`;
                    if (seen.has(key)) {

                        toast.error("Combination of Category and Grade already exists");
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
                formDetailData: formDetailData
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
                ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_GRADE_AND_CAT
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
        setFormData({ ...formDataInitData });
        setFormDetailData([formDtlInitData])
    }, []);

    const handleChange = useCallback((type, name, value, rowIndex = null, e) => {
        if (!["Insert", "Update", "Search"].includes(formStatus)) {
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
                `${APP_PROD_API.GET_DATA_FOR_GRADE_AND_CAT}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

        const gradeCategoryForm = document.getElementById("grade-category-form");

            // Form required field validation
            const gradeCategoryFormValidity = gradeCategoryForm.checkValidity();
            if (!gradeCategoryFormValidity) {
                if (gradeCategoryForm.reportValidity) {
                    gradeCategoryForm.reportValidity();
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
                const key = `${row.grd_no}`;
                if (seen.has(key)) {

                    toast.error("Combination of Category and Grade already exists");
                    return
                }
                seen.add(key);
            }
        }

        setFormDetailData((prevData) => [...prevData, formDtlInitData]);
    }, [formData]);

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

            const updatedData = queryData.categoryData.map(item => ({
                ...item,
                init_grd_no: item.grd_no,

            }))

            setFormData(queryData.descriptionData);


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
                QUERY_API={APP_PROD_API.GET_DATA_FOR_GRADE_AND_CAT}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={8}>
                                <Row>
                                    <Col xl={4} className="m-auto">
                                        <TextField
                                            required
                                            label="Category"
                                            type="text"
                                            name="description"
                                            value={formData?.description || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "formData",
                                                    "description",
                                                    e.target.value,
                                                    null,
                                                    e
                                                )
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Row className='mt-4'>

                                <Col xl={12} className='m-auto'>
                                    <div className='box-border m-auto'>
                                        <Form id="grade-category-form">
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
                                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
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
                                                                {formDetailData &&
                                                                    formDetailData.map((data, rowIndex) => (
                                                                        <tr key={rowIndex}
                                                                            onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                                                            style={{
                                                                                border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                                                                            }}
                                                                        >

                                                                            {
                                                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                                                <td className="">
                                                                                    <RowAction
                                                                                        formStatus={formStatus}
                                                                                        canDelete={formDetailData?.length > 0}
                                                                                        onDelete={() => handleDeleteRow(data, rowIndex)}
                                                                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                                    />
                                                                                </td>

                                                                            }
                                                                            <td className=" table_cell">
                                                                                <TextField
                                                                                    type="text"
                                                                                    required
                                                                                    name="grd_desc"
                                                                                    value={data.grd_desc || ""}
                                                                                    // maxLength={4}
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "grd_desc",
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

                                                                                    //onBlur={(e) => validateRequiredField(e, 'Grade Description')} 
                                                                                    // onBlur={(e) => {
                                                                                    //     if (formStatus === 'Insert' || formStatus === 'Update') {
                                                                                    //         validateRequiredField(e, "Account No")
                                                                                    //     }

                                                                                    // }
                                                                                    // }  

                                                                                    onBlur={(e) => handleGradeBlur(e, data.grd_no, rowIndex)}


                                                                                />
                                                                            </td>

                                                                            <td className="table_cell">
                                                                                <Checkbox
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "calc_salary_based_on",
                                                                                            e.target.checked ? "M" : "W",
                                                                                            rowIndex,
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                    name="calc_salary_based_on"
                                                                                    value={data?.calc_salary_based_on || ""}
                                                                                    checked={data?.calc_salary_based_on === "M"}

                                                                                // required
                                                                                />
                                                                            </td>

                                                                            <td className="table_cell">
                                                                                <TextField
                                                                                    type="text"
                                                                                    //  required
                                                                                    name="lease_ent_per"
                                                                                    value={data.lease_ent_per || ""}
                                                                                    maxLength={3}
                                                                                    // disabled
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "lease_ent_per",
                                                                                            e.target.value,
                                                                                            rowIndex,
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                //onBlur={(e) => validateRequiredField(e, 'Short desc')}

                                                                                />
                                                                            </td>
                                                                            <td className="table_cell">
                                                                                <Checkbox
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "rounded_off",
                                                                                            e.target.checked ? "Y" : "N",
                                                                                            rowIndex,
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                    name="rounded_off"
                                                                                    value={data?.rounded_off || ""}
                                                                                    checked={data?.rounded_off === "Y"}

                                                                                // required
                                                                                />
                                                                            </td>


                                                                            <td className="table_cell">
                                                                                <RadioGroup
                                                                                    className="button-group-wrapper box-border justify-content-between"
                                                                                    options={[
                                                                                        { text: "Rupees", value: "R" },
                                                                                        { text: "Paise", value: "P" },

                                                                                    ]}
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "rupees_paise",
                                                                                            e.target.value,
                                                                                            rowIndex,
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                    // onBlur={(e) =>
                                                                                    //     validateRequiredField(e, "SGST perc")
                                                                                    // }
                                                                                    checked={data?.rupees_paise || "R"}
                                                                                // required
                                                                                />
                                                                            </td>



                                                                            <td className="table_cell">

                                                                                <Select
                                                                                    //label="Authorised Person"
                                                                                    name="rounded_upto"
                                                                                    value={data?.rounded_upto || ""}
                                                                                    onChange={(e) => handleChange("formDetailData", "rounded_upto", e.target.value, rowIndex, e)}
                                                                                    // options={authpersons} 
                                                                                    options={[
                                                                                        { label: "", value: "" },
                                                                                        { label: "1", value: "1" },
                                                                                        { label: "5", value: "5" },
                                                                                        { label: "10", value: "10" },
                                                                                        { label: "50", value: "50" }
                                                                                    ]}
                                                                                />

                                                                            </td>


                                                                            <td className="table_cell">

                                                                                <Select
                                                                                    //label="Authorised Person"
                                                                                    name="round_direction"
                                                                                    value={data?.round_direction || ""}
                                                                                    onChange={(e) => handleChange("formDetailData", "round_direction", e.target.value, rowIndex, e)}
                                                                                    // options={authpersons} 
                                                                                    options={[
                                                                                        { label: "", value: "" },
                                                                                        { label: "Upper", value: "U" },
                                                                                        { label: "Lower", value: "L" },
                                                                                        { label: "Near", value: "N" },

                                                                                    ]}
                                                                                />

                                                                            </td>



                                                                            <td className="table_cell">
                                                                                <Checkbox
                                                                                    onChange={(e) =>
                                                                                        handleChange(
                                                                                            "formDetailData",
                                                                                            "exgratia_not_apply",
                                                                                            e.target.checked ? "Y" : "N",
                                                                                            rowIndex,
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                    name="exgratia_not_apply"
                                                                                    value={data?.exgratia_not_apply || ""}
                                                                                    checked={data?.exgratia_not_apply === "Y"}

                                                                                // required
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
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_GRADE_AND_CAT}`}
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

export default GradeCategory;

