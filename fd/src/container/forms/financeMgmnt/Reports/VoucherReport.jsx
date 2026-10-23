
import React, { useState } from "react";
import { Card, Col, Container, Form, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import MuiDateField from "../../../../components/basic/MuiDateField";


const VoucherReport = () => {

  const { user } = useSelector((state) => state.auth);

  //  FULL FORM UI INSIDE SAME FILE
  const FormUI = ({ onSubmit }) => {
    const initialForm = {
      from_date: "",
      to_date: "",
    };

    const [formData, setFormData] = useState(initialForm);
   
  

    const handleChange = (e) => {
      const { name, value } = e.target;
      
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

   

    const handleCancel = () => {
      setFormData(initialForm);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const valid = validateForm("mat-accptn", "Material Acceptance");
      if (!valid) return;

     const fyStartYear = Number(user.global_fin_year);
      const fyEndYear = fyStartYear + 1;

      const fyStartDate = new Date(`${fyStartYear}-04-01`);
      const fyEndDate = new Date(`${fyEndYear}-03-31`);

      const from = new Date(formData.from_date);
      const to = new Date(formData.to_date);

      if (to < from) {
        toast.error("To Date cannot be less than From Date.");
        return;
      }

      if (from < fyStartDate || from > fyEndDate) {
        toast.error(`From Date must be between ${fyStartDate.toDateString()} and ${fyEndDate.toDateString()}`);
        return;
      }

      if (to < fyStartDate || to > fyEndDate) {
        toast.error(`To Date must be between ${fyStartDate.toDateString()} and ${fyEndDate.toDateString()}`);
        return;
      }


      const payload = {
      
        from_date: formData.from_date,
        to_date: formData.to_date,
        trans_year: user.global_fin_year,
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_VOUCHER_REPORT_DATA}`,
          {
            method: "POST",
            body: JSON.stringify(payload),
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
        <Form id="mat-accptn">
          <div className="d-flex justify-content-center mt-4">
            <Card className="report-card p-3 shadow-lg mt-4" style={{ width: "50%" }}>
              <Container>


                <Row className="mt-3 d-flex justify-content-center">
                     <Col lg={4}>
          <MuiDateField
          label="From Date"
          name="from_date"
          value={formData.from_date}
          onChange={handleChange}
          required
        />

      </Col>

        <Col lg={4}>
          <MuiDateField
        label="To Date"
        name="to_date"
        value={formData.to_date}
        onChange={handleChange}
        required
      />

        </Col>
          </Row>

                <Row className="mt-4 justify-content-center">
                  <Col xl={2}>
                    <ButtonUi onClick={handleSubmit} style={{width:"60px"}}>OK</ButtonUi>
                  </Col>
                  <Col xl={2}>
                    <ButtonUi color="danger" onClick={handleCancel}>
                      Cancel
                    </ButtonUi>
                  </Col>
                </Row>
              </Container>
            </Card>
          </div>

         
        </Form>
      </>
    );
  };

  return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_VOUCHER_REPORT_DATA"
      reportTitle="Voucher Report"
      rightAlignedFields={[
        'debit','credit'
      ]}
    />
  );
};

export default VoucherReport;
