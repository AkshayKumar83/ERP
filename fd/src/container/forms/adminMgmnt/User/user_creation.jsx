import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col, Form, Table, Card } from 'reactstrap';
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import Select from '../../../../components/basic/select';
import { APP_PROD_API } from '../../../../utils/api';
//import ButtonUi from '../../../../components/basic/button'; 
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';


// check_password_strength


const UserCreation = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({});
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

    const dispatch = useDispatch()
    const navigate = useNavigate();
    // GLOBAL USERDATA 

    const { user } = useSelector((state) => state.auth);

    const tabs = ["User Creation"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);


    function handleSubmit(e) {
        e.preventDefault();

        console.log("Form submitted", formData)
    }

    const handlePostUserDetails = async (e) => {
        if (e) {
            e.preventDefault();
        }
        try {

            const passwordForm = document.getElementById("user-creation-form")
            const passwordFormValidity = passwordForm.checkValidity()
            if (!passwordFormValidity) {
                if (passwordForm.reportValidity) {
                    passwordForm.reportValidity()
                } else {
                    throw new Error("Please fill all the required details in user login")
                }
                return
            }


            if (formData.passwrd !== formData.retype_pass) {
                toast.error("Your New Password does not match with retype Password")
                return
            }
            let body = {
                userId: user.id,
                formData: formData
            }

            console.log("final body to send:", body);
            const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_USER_CREATION_DATA}`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include'
                });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            // else {
            //     toast.success('Password has been changed Successfully!')

            //     dispatch(logout());
            //     document.cookie = "auth_token=; Max-Age=0; path=/;";
            //     localStorage.removeItem("persist:root");
            //     navigate("/login");
            // } 
            toast.success("Data saved successfully!");
            handleCancel();

        } catch (error) {
            toast.error(
                error.message ||
                "Please check all the form fields or contact administrator"
            );
        }
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
                QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
                formName={""}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Form id="user-creation-form">
                            <Row>
                                <Col xl={5} className="m-auto">
                                    <Card className="mb-2 p-3 mt-2">
                                        {/* Center the title */}

                                        <h2 style={{ fontSize: "18px", textAlign: "center", color: '#00008b' }}>User Creation</h2>

                                        <Row className="mt-3">
                                            <Col xl={10} className="">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>

                                                    <label style={{ width: "40%", textAlign: "right", fontSize: '14px', color: '#00008b' }}>Login Id</label>
                                                    <div style={{ width: "60%" }}>
                                                        <TextField
                                                            required
                                                            type="text"
                                                            style={{ width: '100%' }} // Ensures full width inside its div
                                                            name="user_name"
                                                            value={formData.user_name || ""}
                                                            onChange={(e) => handleChange("user_name", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="mt-3">
                                            <Col xl={10} className="">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>

                                                    <label style={{ width: "40%", textAlign: "right", fontSize: '14px', color: '#00008b' }}>Email Id</label>
                                                    <div style={{ width: "60%" }}>
                                                        <TextField
                                                            required
                                                            type="text"
                                                            style={{ width: '100%' }} // Ensures full width inside its div
                                                            name="email_id"
                                                            value={formData.email_id || ""}
                                                            onChange={(e) => handleChange("email_id", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row className="mt-3">
                                            <Col xl={10} className="">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>

                                                    <label style={{ width: "40%", textAlign: "right", fontSize: '14px', color: '#00008b' }}>Mobile No</label>
                                                    <div style={{ width: "60%" }}>
                                                        <TextField
                                                            required
                                                            type="text"
                                                            style={{ width: '100%' }} // Ensures full width inside its div
                                                            name="mobile_no"
                                                            value={formData.mobile_no || ""}
                                                            onChange={(e) => handleChange("mobile_no", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row className="mt-3">
                                            <Col xl={10} className="">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>

                                                    <label style={{ width: "40%", textAlign: "right", fontSize: '14px', color: '#00008b' }}>Password</label>
                                                    <div style={{ width: "60%" }}>
                                                        <TextField
                                                            required
                                                            type="password"
                                                            style={{ width: '100%' }} // Ensures full width inside its div
                                                            name="passwrd"
                                                            value={formData.passwrd || ""}
                                                            onChange={(e) => handleChange("passwrd", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row className="mt-3">
                                            <Col xl={10} className="">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>

                                                    <label style={{ width: "40%", textAlign: "right", fontSize: '14px', color: '#00008b' }}>Re-type Password</label>
                                                    <div style={{ width: "60%" }}>
                                                        <TextField
                                                            required
                                                            type="password"
                                                            style={{ width: '100%' }} // Ensures full width inside its div
                                                            name="retype_pass"
                                                            value={formData.retype_pass || ""}
                                                            onChange={(e) => handleChange("retype_pass", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row className="mt-4">
                                            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                                                <ButtonUi color="secondary" onClick={() => {

                                                    handlePostUserDetails();
                                                }}
                                                >Submit</ButtonUi>
                                                <ButtonUi color="secondary" onClick={() => {

                                                    handleCancel();
                                                }}>Cancel</ButtonUi>
                                            </div>
                                        </Row>

                                        <Row className='mt-4 '>
                                            <span className='d-flex justify-content-center fw-bold '>
                                                PASSWORD SHOULD START WITH ANY ALPHABET
                                            </span>
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

export default UserCreation;

