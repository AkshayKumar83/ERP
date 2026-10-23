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
import { formInitData, cityHelpListHeader, createSearchPayloadForBVSpecificSearch } from './contractor_master_helper.js'
import { FcInfo } from "react-icons/fc"
import { APP_PROD_API } from '../../../../utils/api.js'
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { useSelector } from "react-redux"; 
import { fetchAppData } from "../../../../utils/fetchUtils"; 
import { dateFormatter, validateForm } from '../../../../utils/fn';

const ContractorMaster = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ ...formInitData });
    //const [formDetailData, setFormDetailData] = useState([matConsumptionDtlInitFormData])
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
        setSearchQuery, } = useFormStatus();



    // for help list 

    const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
    const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
    const [helpListHeader, setHelpListHeader] = useState([])


    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList)


    const handleHelpList = (data) => {
        setHelpList(data);
    }


    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);


    const tabs = ["Contractor Master"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const onSelectHelpItem = (data) => {
        //console.log("Selected Data:", data);
        setFormData((prev) => {
            switch (helpFor) {
                case "city":
                    return { ...prev, city_name: data.city, cont_district: data.district, cont_state: data.state, cont_country: data.country, cont_region: data.region, cont_zone: data.zone, cont_city: data.ctycode };

                default:
                    return prev;
            }
        });
    };

    const whereClauseForHelp = (helpFor) => {
        //console.log("formData data", formData)
        // if (helpFor === 'acc') {
        //   return { inv_dt: formData.inv_dt };
        // }

        return {};
    }



    const handleDoubleClick = (field, header) => {
        if (['Insert', 'Update', 'Search'].includes(formStatus)) {
            setHelpFor(field); // Set the help type dynamically
            setHelpListHeader(header); // Set the appropriate header list
            handleHelpList(true); // Open the modal
        }
    };




    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const contractorForm = document.getElementById(
                "contractor-master-form"
            );
            const contactFormValidity = contractorForm.checkValidity();
            if (!contactFormValidity) {
                if (contactFormValidity.reportValidity) {
                    contractorForm.reportValidity();
                } else {
                    throw new Error(
                        "Please fill all the required details in item department form"
                    );
                }
                return;
            }

         

            let body = {
                formData: formData,
              
            };

            //  Modify the body for "Update" status
            if (formStatus === "Update") {
                body = {
                    ...body,
                   
                };
            }

            console.log("Final body to send:", body);
            const response = await fetch(
                ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CONTRACTOR_MSTR_FORM_DATA
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
        setFormData({});
    }, []);

    const handleChange = useCallback((type, name, value, rowIndex = null, e) => {
        if (!["Insert", "Update", "Search"].includes(formStatus)) {
            return;
        }

        if (
            [
                "city_name"

            ].includes(name)
        ) {
            toast.error("Please select from helplist");
            return;
        }


        const isNumberField = e?.target?.type === "number";
        const isStringField = typeof value === "string";
        const processedValue = isStringField && name !== "email"  ? value.toUpperCase() : value;

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
                `${APP_PROD_API.GET_CONTRACTOR_MSTR_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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


    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            console.log("queryData", queryData);
            // Handle failure case
            if (queryData.recordCount == 0) {
                //console.log( "toast",queryData.message)
                toast.error(queryData.message);
                //  handleCancel();
                return;
            }

            if (btnClicked === "Query") {
                setTotalRecordCount(queryData.count || totalRecordCount);
            }

            setFormData(queryData.mopmcontrData);


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
                //isQueryReqOnInsertBtn={true}
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
                QUERY_API={APP_PROD_API.GET_CONTRACTOR_MSTR_FORM_DATA}
                formName={"Contractor Master"}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Row>
                            <Col xl={10} className='m-auto'>

                                <Form id="contractor-master-form">
                                    <Row>
                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Contractor Code"
                                                name="cont_code"
                                                value={formData?.cont_code || ""}
                                                onChange={(e) => handleChange("formData", "cont_code", e.target.value, null, e)}
                                                required
                                                maxLength={19} 
                                                 onBlur={(e) => validateRequiredField(e, "Contractor Code")} 
                                                 disabled={formStatus === "Update"}

                                            />
                                        </Col>

                                        <Col xl={6} >
                                            <TextField
                                                type="text"
                                                label="Contractor Name"
                                                name="cont_name"
                                                maxLength={40}
                                                value={formData?.cont_name || ""}
                                                onChange={(e) => handleChange("formData", "cont_name", e.target.value, null, e)}
                                                //  onBlur={(e) => validateRequiredField(e, "Transaction Type")}
                                                required
                                            // disabled
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-1' style={{ justifyContent: 'space-between', border: '' }}>

                                        <Col xl={6}>
                                            <TextField
                                                // required
                                                type="text"
                                                label="Address"
                                                name="cont_add1"
                                                maxLength={200}
                                                value={formData?.cont_add1 || ""}
                                                onChange={(e) => handleChange("formData", "cont_add1", e.target.value, null, e)}
                                            // onBlur={(e) => validateRequiredField(e, "Bank Name")}
                                            // disabled
                                            />
                                        </Col>

                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="City"
                                                name="city_name"
                                                value={formData?.city_name || ""}
                                                maxLength={30}
                                                onChange={(e) => handleChange("formData", "city_name", e.target.value, null, e)}
                                                // onBlur={(e) => validateRequiredField(e, "Address")}
                                                //  required 
                                                onDoubleClick={() => {
                                                    handleDoubleClick("city", cityHelpListHeader);
                                                }}
                                            />
                                        </Col>



                                    </Row>

                                    <Row className='mt-1'>


                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="District"
                                                name="cont_district"
                                                value={formData?.cont_district || ""}
                                                maxLength={20}
                                                onChange={(e) => handleChange("formData", "cont_district", e.target.value, null, e)}
                                                //   onBlur={(e) => validateRequiredField(e, "IFSC Code")} 
                                                disabled
                                            // required
                                            />
                                        </Col>

                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="State"
                                                name="cont_state"
                                                maxLength={30}
                                                value={formData?.cont_state || ""}
                                                onChange={(e) => handleChange("formData", "cont_state", e.target.value, null, e)}
                                                disabled

                                            />
                                        </Col>

                                    </Row>

                                    <Row className='mt-1' style={{ justifyContent: 'space-between' }}>


                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Zone"
                                                name="cont_zone"
                                                value={formData?.cont_zone || ""}
                                                maxLength={20}
                                                onChange={(e) => handleChange("formData", "cont_zone", e.target.value, null, e)}
                                                //onBlur={(e) => validateRequiredField(e, "MICR Code")}
                                                // required
                                                disabled
                                            />
                                        </Col>

                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Country"
                                                name="cont_country"
                                                maxLength={30}
                                                value={formData?.cont_country || ""}
                                                onChange={(e) => handleChange("formData", "cont_country", e.target.value, null, e)}
                                                disabled

                                            />
                                        </Col>
                                    </Row>

                                    <Row className='mt-1' style={{ justifyContent: 'space-between' }}>


                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Region"
                                                name="cont_region"
                                                maxLength={50}
                                                value={formData?.cont_region || ""}
                                                onChange={(e) => handleChange("formData", "cont_region", e.target.value, null, e)}
                                                disabled

                                            />
                                        </Col>
                                        <Col xl={6} style={{}}>
                                            <TextField
                                                type="text"
                                                label="Contact Person"
                                                name="con_per1"
                                                maxLength={30}
                                                value={formData?.con_per1 || ""}
                                                onChange={(e) => handleChange("formData", "con_per1", e.target.value, null, e)}
                                            // onBlur={(e) => validateRequiredField(e, "Account Type")}
                                            // required
                                            />
                                        </Col>
                                    </Row>

                                    <Row className='mt-1' style={{ justifyContent: 'space-between' }}>


                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Fax"
                                                name="fax"
                                                maxLength={20}
                                                value={formData?.fax || ""}
                                                onChange={(e) => handleChange("formData", "fax", e.target.value, null, e)}

                                            />
                                        </Col>

                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Zip Code"
                                                name="cont_zip_code"
                                                value={formData?.cont_zip_code || ""}
                                                maxLength={10}
                                                onChange={(e) => handleChange("formData", "cont_zip_code", e.target.value, null, e)}
                                            //  onBlur={(e) => validateRequiredField(e, "Currency")}
                                            // required
                                            // options={currency}
                                            />
                                        </Col>
                                    </Row>


                                    <Row className='mt-1' style={{ justifyContent: 'space-between' }}>


                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Telephone No"
                                                name="telephone1"
                                                maxLength={10}
                                                value={formData?.telephone1 || ""}
                                                onChange={(e) => handleChange("formData", "telephone1", e.target.value, null, e)}

                                            />
                                        </Col>

                                        <Col xl={6}>
                                            <TextField
                                                type="text"
                                                label="Email"
                                                name="email"
                                                value={formData?.email || ""}
                                                maxLength={50}
                                                onChange={(e) => handleChange("formData", "email", e.target.value, null, e)}

                                            />
                                        </Col>
                                    </Row >



                                </Form>

                            </Col>
                        </Row>

                    </TabPane>
                    {helpList && (
                        <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                            <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                            <ModalBody>
                                <HelpList
                                    formStatus={formStatus}
                                    helpFor={helpFor}
                                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CONTRACTOR_MSTR_FORM_DATA}`}
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

export default ContractorMaster;

