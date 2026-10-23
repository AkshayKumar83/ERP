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
import { formInitData, formDataHeader, createSearchPayloadForBVSpecificSearch } from './department_helper.js'
import { FcInfo } from "react-icons/fc"
import { APP_PROD_API } from '../../../../utils/api.js'
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { dateFormatter, validateForm } from '../../../../utils/fn';

const DepartmentMaster = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState([{ ...formInitData }]);
    //const [formDetailData, setFormDetailData] = useState([matConsumptionDtlInitFormData])
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
        setSearchQuery, } = useFormStatus();


    const [focusedRowIndex, setFocusedRowIndex] = useState(0)
    const [deletedRecord, setDeletedRecord] = useState([])

    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);


    const tabs = ["Department Master"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const departmentForm = document.getElementById("department-master-form");

            // Form required field validation
            const departmentFormValidity = departmentForm.checkValidity();
            if (!departmentFormValidity) {
                if (departmentForm.reportValidity) {
                    departmentForm.reportValidity();
                }
                else {
                    toast.error("Please fill all required fields");
                }
                return;
            }

            if (formStatus === 'Insert') {
                let newRecords = formData.filter(newData => newData.hasOwnProperty('id'));
                if (newRecords.length === 0) {
                    toast.error('There should be atleast a New Entry for submit in Insert')
                    return
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
                ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_DEPT_MSTR
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
                `${APP_PROD_API.GET_DATA_FOR_DEPT_MSTR}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

        const departmentForm = document.getElementById("department-master-form");

        // Form required field validation
        const departmentFormValidity = departmentForm.checkValidity();
        if (!departmentFormValidity) {
            if (departmentForm.reportValidity) {
                departmentForm.reportValidity();
            }
            else {
                toast.error("Please fill all required fields");
            }
            return;
        }

        // Duplicate check
        if (formData?.length > 1) {
            const seen = new Set();
            for (const row of formData) {
                const key = `${row.dept_cd}`;
                if (seen.has(key)) {
                    toast.error("Duplicate record found with same entry");
                    return;
                }
                seen.add(key);
            }
        }

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

            setFormData(queryData.mhpmdeptData);


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
                QUERY_API={APP_PROD_API.GET_DATA_FOR_DEPT_MSTR}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={8} className='m-auto'>
                                <div className='box-border m-auto'>
                                    <Form id="department-master-form">
                                        <div className="table-title">

                                            {
                                                (formStatus === 'Insert') &&
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
                                                            {formData &&
                                                                formData.map((data, rowIndex) => (
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
                                                                                name="Dept Code"
                                                                                value={data.dept_cd || ""}
                                                                                maxLength={4}
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "dept_cd",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }

                                                                                onBlur={(e) => validateRequiredField(e, 'Dept Code')}

                                                                            />
                                                                        </td>
                                                                        <td className="table_cell">
                                                                            <TextField
                                                                                type="text"
                                                                                required
                                                                                name="department"
                                                                                value={data.department || ""}
                                                                                //disabled
                                                                                maxLength={30}
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "department",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                onBlur={(e) => validateRequiredField(e, 'Department')}
                                                                            />
                                                                        </td>

                                                                        <td className="table_cell">
                                                                            <TextField
                                                                                type="text"
                                                                                required
                                                                                name="short_desc"
                                                                                value={data.short_desc || ""}
                                                                                maxLength={4}
                                                                                // disabled
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        "formData",
                                                                                        "short_desc",
                                                                                        e.target.value,
                                                                                        rowIndex,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                onBlur={(e) => validateRequiredField(e, 'Short desc')}

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
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default DepartmentMaster;

