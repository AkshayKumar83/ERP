

import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import HelpList from "../../../../components/HelpList";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { formatOptions } from "../../../../lib";
import MuiSelectField from "../../../../components/basic/muiSelectField";
import MuiTextField from "../../../../components/basic/muiTextField";
import MuiDateField from "../../../../components/basic/MuiDateField";
import Checkbox from "../../../../components/basic/checkbox";

const ITCRecord = () => {

      const { user } = useSelector((state) => state.auth);

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      rg_goods_service:"",
      rg_detail_sum:"",
      rg_reverse_invoice:"",
      rg_auth_flag:"",
      inv_date_from: "",
      inv_date_to: "",
      division_id:"",
      curryear:"",
     
    };
  

   const [formData, setFormData] = useState(initialForm);
          // for dropdown state 
     const [division, setDevision] = useState([]);



      useEffect(() => {
        const fetchLevel1 = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_ITC_RECORD_DROPDOWN_DATA
            }?division_id=${user.global_division_id}`,
            { credentials: "include" }
          );
          const data = await response.json();
           setDevision([ { value: "", label: "" }, ...formatOptions(data.divisionList || [], "division_id", "name"), ]);
        };
    
        fetchLevel1();
      }, []);

      


 const handleCancel = () => {
      setFormData(initialForm);
    };

  const handleChange = (e) => {

  const { name, value, type, checked } = e.target;
  const finalValue =
    type === "checkbox"
      ? (checked ? "Y" : "N")
      : value;

  setFormData((prev) => {
    let updated = {
      ...prev,
      [name]: finalValue,
    };

    return updated;
  });
};



 


const handleSubmit = async (e) => {
  e.preventDefault();

  const valid = validateForm(
    "item-stock-ledger",
    "Item Stock Ledger"
  );

  if (!valid) return;

  const payload = {
    global_division_id: user?.global_division_id,
    curryear: user?.global_fin_year,
    division_id : formData?.division_id,
    inv_date_from: formData.inv_date_from,
    inv_date_to: formData.inv_date_to,
    rg_goods_service:formData?.rg_goods_service,
    rg_detail_sum:formData?.rg_detail_sum,
    rg_reverse_invoice:formData?.rg_reverse_invoice,
    rg_auth_flag:formData?.rg_auth_flag,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITC_RECORD_FORM_DATA}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

        const data = await response.json();
        if (!response.ok || !data.success) {
          toast.error(data.message || "Error while submitting form");
          return;
        }

        toast.success("Data fetched successfully!");
        onSubmit(data);
        handleCancel();
        
      } catch (error) {
        toast.error("Something went wrong");
      }
    };



  return (
    <>
           <Form id="item-stock-ledger">
             <div className="d-flex justify-content-center mt-3">
               <Card className="report-card p-2 shadow-lg" style={{width:"60%"}}>
                 <Container>
                   <h4 className="d-flex justify-content-center">ITC Record</h4>
 
           <Row className="d-flex mt-5">
             <Col xl={12}>
               <MuiSelectField
              label="Division"
              name="division_id"
              value={formData.division_id}
              onChange={handleChange}
              options={division}
            />
          </Col>
            </Row>

       <Row className="mt-3">
         
        <Col  xl={5} className="">
                <div className="box-border d-flex  justify-content-between flex-wrap  gap-4">

                {[
                    { text: "Goods", value: "G" },
                    { text: "Service ", value: "S" },
                    { text: "Both ", value: "B" },
                  
                  ].map((item, i) => (
                   <div key={i} className="radio-item mt-1">
                    <label className="d-flex align-items-center gap-2"
                          style={{ fontWeight: "600" }} >
                      <input
                        type="radio"
                        name="rg_goods_service"
                        value={item.value}
                        checked={formData?.rg_goods_service === item.value}
                        onChange={(e) => {
                              handleChange(e);              
                            //   handleSelectionLogic(e.target.value); 
                            }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>
        </Col>

        <Col  xl={5} className="">
                 <div className="text-wrapper box-border d-flex  justify-content-between flex-wrap  gap-4">
                 <span className="text-label">Reverse Charges (Invoice)</span>
                {[
                    { text: "Yes", value: "N" },
                    { text: "No ", value: "Y" },
                    { text: "Both ", value: "B" },
                  
                  ].map((item, i) => (
                   <div key={i} className="radio-item mt-1">
                    
                    <label className="d-flex align-items-center gap-2"
                          style={{ fontWeight: "600" }} >
                      <input
                        type="radio"
                        name="rg_reverse_invoice"
                        value={item.value}
                        checked={formData?.rg_reverse_invoice === item.value}
                        onChange={(e) => {
                              handleChange(e);              
                            //   handleSelectionLogic(e.target.value); 
                            }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>
        </Col>
       </Row>
       <Row className="mt-3">
         
        <Col  xl={6} className="">
                <div className="box-border d-flex  justify-content-between flex-wrap  gap-4">

                {[
                    { text: "Authorized", value: "Y" },
                    { text: "Unauthorized ", value: "N" },
                    { text: "Both ", value: "B" },
                  
                  ].map((item, i) => (
                   <div key={i} className="radio-item">
                    <label className="d-flex align-items-center gap-2"
                          style={{ fontWeight: "600" }} >
                      <input
                        type="radio"
                        name="rg_auth_flag"
                        value={item.value}
                        checked={formData?.rg_auth_flag === item.value}
                        onChange={(e) => {
                              handleChange(e);              
                            //   handleSelectionLogic(e.target.value); 
                            }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>
        </Col>

        <Col  xl={4} className="">
               <div className="box-border d-flex  justify-content-between flex-wrap  gap-1">
                
                {[
                    { text: "Details", value: "D" },
                    { text: "Summery ", value: "S" },
                   
                  
                  ].map((item, i) => (
                   <div key={i} className="radio-item">
                    
                    <label className="d-flex  gap-2"
                          style={{ fontWeight: "600" }} >
                      <input
                        type="radio"
                        name="rg_detail_sum"
                        value={item.value}
                        checked={formData?.rg_detail_sum === item.value}
                        onChange={(e) => {
                              handleChange(e);              
                            //   handleSelectionLogic(e.target.value); 
                            }}
                      />
                      {item.text}
                    </label>
                  </div>
                ))}

                </div>
        </Col>
       </Row>

         <Row className="mt-3 d-flex justify-content-center">
                     <Col lg={3}>
          <MuiDateField
          label="From Date"
          name="inv_date_from"
          value={formData.inv_date_from}
          onChange={handleChange}
          required
        />

      </Col>

        <Col lg={3}>
          <MuiDateField
        label="To Date"
        name="inv_date_to"
        value={formData.inv_date_to}
        onChange={handleChange}
        required
      />

        </Col>
          </Row>
                    
        <Row className=" d-flex justify-content-end mt-4">
        <Col xl={2}>
        
          <ButtonUi onClick={handleSubmit} style={{ width: "80px" }}>
            OK
          </ButtonUi>
      </Col>
        <Col xl={2}>
          <ButtonUi
            color="danger"
            onClick={handleCancel}
            style={{ width: "80px" }}
          >
            Cancel
          </ButtonUi>
        </Col>

       </Row>

                    
        </Container>
    </Card>
             </div>
           </Form>
 </>
  )
}

 return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_ITC_RECORD_FORM_DATA"
      reportTitle="ITC Record Report"
      rightAlignedFields={['ITC_SR_NO', 'TRANS_YEAR','BASIC_AMT','SGST_AMT','CGST_AMT','IGST_AMT','GST_AMT','GST_PERCENT','TOTAL_AMT']}
    />
  );

}

export default ITCRecord;



