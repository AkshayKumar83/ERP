import React from "react";

import { Modal, ModalBody, ModalHeader, TabContent, TabPane,Row, Col, Form, Table, Card } from "reactstrap";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import ButtonUi from "../../../../components/basic/button";
import Select from "../../../../components/basic/select";
import { useDispatch, useSelector } from "react-redux"; 
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { setCredentials } from "../../../../features/auth/authSlice";


const ChangeDivision = ({ isModalOpen, toggleModal }) => {
    const [formData, setFormData] = useState({});
    const { formStatus } = useFormStatus();  

      const [divisionList, setDivisionList] = useState([]);
    
        const { user } = useSelector((state) => state.auth); 

          const dispatch = useDispatch()
    

    const handleChange = useCallback((name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);  


    useEffect(()=>{
            const fetchDivisionList = async () => {
                try {
                
                    const resp = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.DIVISION_LIST}`,{credentials:'include',});
                    if (resp.status === 200) {
                        const data = await resp.json();
                        console.log(data)
                        if(data?.data.length){
                            setDivisionList([{value:'', label: ''}, ...formatOptions(data?.data || [], "division_id", "name")]);
                        }
    
                    }
    
                } catch (err) {
                    console.log(err);
                }
            }; 
            
            fetchDivisionList();
            
        },[])   

          function handleSubmit(e){
                e.preventDefault()
                if(formData.fin_year != ''){
                    dispatch(setCredentials({...user, global_division_id: formData.division_id}));
                }
                toggleModal()
            }

    console.log("formStatus from memberform", formStatus);
    return (
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
            <ModalHeader toggle={toggleModal}></ModalHeader>
            <ModalBody>
                <Form id={"change-fin-year-form"}>
                    <Row>
                        <Col xl={7} className="m-auto">
                            <Card className="mb-2 p-3 mt-2">
                                <div className="d-flex justify-content-center box-border mb-2 shadow-sm">
                                    <h2
                                        style={{
                                            fontSize: "28px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Change Division
                                    </h2>
                                </div>
                                <Row className="mt-3">
                                    <Col xl={8} className="m-auto">
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "15px",
                                                width: "100%",
                                            }}
                                        >
                                            <label
                                                style={{
                                                    width: "20%",
                                                    textAlign: "right",
                                                    fontWeight: "bold",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                Division
                                            </label>
                                            <div style={{ width: "80%" }}>
                                                <Select
                                                    name="division_id"
                                                    value={
                                                        formData.division_id || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "division_id",
                                                            e.target.value
                                                        )
                                                    } 
                                                     options={divisionList}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "16px",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ButtonUi color="secondary" className="px-3"  onClick={handleSubmit}>
                                            OK
                                        </ButtonUi>
                                        <ButtonUi color="secondary" onClick={() =>{toggleModal()}}>
                                            Cancel
                                        </ButtonUi>
                                    </div>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default ChangeDivision;
