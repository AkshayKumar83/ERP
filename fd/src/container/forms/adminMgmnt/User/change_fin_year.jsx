import React, { useEffect } from "react";
import { Modal, ModalBody, ModalHeader,} from "reactstrap";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Select from "../../../../components/basic/select";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../../features/auth/authSlice";

const ChangeFinYear = ({ isModalOpen, toggleModal }) => {
    const [formData, setFormData] = useState({fin_year:''});
    const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
    const [finYearList, setFinYearList] = useState([]);

    const { user } = useSelector((state) => state.auth);


    const dispatch = useDispatch()

    const handleChange = useCallback((name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    
    useEffect(()=>{
        const fetchYearList = async () => {
            try {
            
                const resp = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.FIN_YEAR_LIST}`,{credentials:'include',});
                if (resp.status === 200) {
                    const data = await resp.json();
                    console.log(data)
                    if(data?.data.length){
                        setFinYearList([{value:'', label: ''}, ...formatOptions(data?.data || [], "year_code", "year")]);
                    }

                }

            } catch (err) {
                console.log(err);
            }
        }; 
        
        fetchYearList();
        
    },[])

    function handleSubmit(e){
        e.preventDefault()
        if(formData.fin_year != ''){
            dispatch(setCredentials({...user, global_fin_year: formData.fin_year}));
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
                            <Card className="mb-2 p-3 mt-2" 
                                  style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", borderRadius: "12px"}}>
                                <div className="d-flex justify-content-center box-border mb-2 shadow-sm">
                                    <h2 style={{fontSize: "28px", textAlign: "center",}}>
                                        Change Financial Year
                                    </h2>
                                </div>

                                <Row className="mt-3">
                                    <Col xl={12} className="m-auto">
                                        <div
                                            style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%",}}
                                        >
                                            <label
                                                style={{ width: "30%", textAlign: "right", fontWeight: "bold", fontSize: "13px"}}
                                            >
                                                Financial Year
                                            </label>
                                            <div style={{ width: "60%" }}>
                                                <Select
                                                    style={{ width: "100%" }} // Ensures full width inside its div
                                                    name="fin_year"
                                                    value={formData.fin_year || ""}
                                                    onChange={(e) => handleChange("fin_year", e.target.value)}
                                                    options={finYearList}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <div style={{ display: "flex", gap: "16px", justifyContent: "center",}}>
                                        <ButtonUi color="secondary" className="px-3" onClick={handleSubmit}>
                                            OK
                                        </ButtonUi>
                                        <ButtonUi color="secondary" onClick={()=>{toggleModal()}}>
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

export default ChangeFinYear;


