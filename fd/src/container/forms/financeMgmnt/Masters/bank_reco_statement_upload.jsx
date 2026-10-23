import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useRef } from "react";
import { Row, Col, Form, Table, Card } from 'reactstrap';
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import Select from '../../../../components/basic/select';
//import ButtonUi from '../../../../components/basic/button';


const BankRecoUpload = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({});
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

    const tabs = ["Bank Reco Statement Upload"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);


    function handleSubmit(e) {
        e.preventDefault();

        //console.log("Form submitted", formData)
    }

    function handleOffset(data) {
        setCurrentRecordNo(data)
    }

    const handleCancel = useCallback(() => {
        // Implement cancel logic here
        releaseFormStatus()
        setFormData({});
    }, []);

    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

        },
        [formStatus, currentRecordNo]
    );

    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click(); // Opens the file input dialog
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
                QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Form id={"bank-reco-statement-upload-form"}>
                            <Row>
                                <Col xl={7} className="m-auto">
                                    <Card className="mb-2 p-1 shadow-sm mt-2">
                                        <div>
                                            <h2 style={{ textAlign: "center", fontSize: "28px" }}>
                                                Bank Reconcilation Uploading of Bank Statement
                                            </h2>
                                        </div>

                                        <Row className="mt-4">
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "16px",
                                                    border: "none",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: "none" }}
                                                />
                                                <ButtonUi color="secondary" onClick={handleClick}>
                                                    OK
                                                </ButtonUi>

                                                <ButtonUi color="secondary">Cancel</ButtonUi>
                                            </div>
                                        </Row>

                                        <Row>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    height: "50px", // Adjust height as needed
                                                }}
                                            >
                                                <span style={{ textAlign: "center" }}>MESSG</span>
                                            </div>
                                        </Row>

                                        <Row className='mt-2'>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <h3 style={{ color: 'red', fontSize: '17px', textAlign: 'center' }}>CSV file should be in the format bank acc no, date, cheque no, particulars,
                                                    reference no(sno), debit amt, credit amt <br>
                                                    </br>

                                                    <br>
                                                    </br>
                                                    Note: Authorised alter Uploading bank statement
                                                </h3>
                                            </div>

                                        </Row>
                                    </Card>
                                </Col>
                            </Row>


                        </Form>

                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default BankRecoUpload;

