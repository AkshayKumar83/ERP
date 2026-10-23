
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { formatOptions } from "../../../../lib";
import MuiSelectField from "../../../../components/basic/muiSelectField";
import MuiDateField from "../../../../components/basic/MuiDateField";
import EmfaDashboard from "./emfaDashboard";

  const EmfaStatusAllMembers = () => {

  const { user } = useSelector((state) => state.auth);

  const FormUI = ({ onSubmit }) => {

    const initialForm = {
      dlr_name:'',
      from_date: "",
      to_date: "",
      member_id:"",
      efa_ctrl_id:'',
      efa_id:"",

    };
  

   const [formData, setFormData] = useState(initialForm);
    
        // for dropdown state 
       const [dlrName, setDlrName] = useState([]);
       const [loanNo, setLoanNo] = useState([]);
       
        useEffect(() => {
          const fetchLevel1 = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_DLR_NAME_LIST_OF_CONSTANTS
            }`,
            { credentials: "include" }
          );
          const data = await response.json();
          setDlrName([ { value: "", label: "" }, ...formatOptions(data.dlrNameList || [], "member_id", "dlr_name"), ])};
          fetchLevel1();
        }, []);


 const handleCancel = () => {
      setFormData(initialForm); 
    };



  const handleChange = async (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // WHEN dealer is selected → fetch loan list
  if (name === "dlr_name") {
    if (!value) {
      setLoanNo([]);
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_LOAN_NO_LIST_OF_CONSTANTS
      }?member_id=${value}`,
      { credentials: "include" }
    );

    const data = await response.json();

    setLoanNo([
      { value: "", label: "" },
      ...formatOptions(data.loanNameList || [], "efa_id", "efa_ctrl_id"),
    ]);
  }
};





const handleSubmit = async (e) => {
  e.preventDefault();

  const valid = validateForm("emfa-status-all-members", "EMFA STATUS ALL MEMBERS");
  if (!valid) return;

  const from = new Date(formData.from_date);
  const to = new Date(formData.to_date);

  if (to < from) {
    toast.error("To Date cannot be less than From Date.");
    return;
  }

  const payload = {
    member_id: formData?.dlr_name,
    efa_id:formData?.efa_ctrl_id,
    from_date: formData?.from_date,
    to_date: formData?.to_date,
  };

  try {
    const queryParams = new URLSearchParams(payload).toString();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMFA_REPORT_DATA}?${queryParams}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
           <Form id="emfa-status-all-members" onSubmit={handleSubmit}>
             <div className="d-flex justify-content-center mt-4">
               <Card className="report-card p-2 shadow-lg" style={{width:"50%"}}>
                 <Container>
                   <h2 className="d-flex justify-content-center mt-2">EMFA STATUS ALL MEMBERS</h2>
 
       <Row className="mt-4 ">
          <Col xl={6}>
            <MuiSelectField
              label="Dlr. Name"
              name="dlr_name"
              value={formData.dlr_name}
              onChange={handleChange}
              options={dlrName}
               required
            />
          </Col>
          <Col xl={4}>
            <MuiSelectField
              label="Loan no."
              name="efa_ctrl_id"
              value={formData.efa_ctrl_id}
              onChange={handleChange}
              options={loanNo}
                required
            />
             </Col>
            </Row>
             <Row className="mt-4 ">
         
          <Col lg={3}>
          <MuiDateField
          label="From Date"
          name="from_date"
          value={formData.from_date}
          onChange={handleChange}
          // required
        />
      </Col>
        <Col lg={3}>
          <MuiDateField
        label="To Date"
        name="to_date"
        value={formData.to_date}
        onChange={handleChange}
        // required
      />
        </Col>
        <Col xl={2} className="mt-2">
        
          <ButtonUi onClick={handleSubmit} style={{ width: "80px" }}>
            OK
          </ButtonUi>
      </Col>
        <Col xl={2} className="mt-2">
          <ButtonUi
            color="danger"
            onClick={handleCancel}
            style={{ width: "80px" }}
          >
            Cancel
          </ButtonUi>
        </Col>

      </Row>

        {/* <Row className=" d-flex justify-content-center mt-4">
        
       </Row> */}

                    
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
      apiUrl="GET_EMFA_REPORT_DATA"
      reportTitle="EMFA STATUS ALL MEMBERS"
      chartComponent={EmfaDashboard}   // always import component
      rightAlignedFields={[
         'emi_sno','efa_id','member_id','trans_month','emi_principal','emi_service_chg_ded','emi_interest_amt','emi_igst_amt',
         'emi_cgst_amt','emi_sgst_amt','emi_total_amt','principal_adjusted','serv_chg_ded_adjusted','interest_amt_adjusted','igst_amt_adjusted',
         'cgst_amt_adjusted','sgst_amt_adjusted','total_amt_adjusted'
      ]}
    />
  );

}

export default EmfaStatusAllMembers