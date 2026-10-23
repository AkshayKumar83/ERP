


import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import MuiDateField from "../../../../components/basic/MuiDateField";
import MuiSelectField from "../../../../components/basic/muiSelectField";
import { formatOptions } from "../../../../lib";


const AuditTrial = () => {

  const { user } = useSelector((state) => state.auth);

  //  FULL FORM UI INSIDE SAME FILE
  const FormUI = ({ onSubmit }) => {

   
    const initialForm = {
     division_id: "",
     from_date: "",
     to_date: "",
     key_value: "",
     transaction_no: "",
     trans_year: "",
     menu_name: "",
    };

     const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialForm);
           // for dropdown state 
    const [division, setDevision] = useState([]);
     const [year, setYear] = useState([]);
     const [menuName, setMenuName] = useState([]);
     const [keyName, setKeyname]  = useState([]);
     const [transaction, setTransaction]  = useState([]);
     const [dateReady, setDateReady] = useState(false);

     const lastQueryRef = React.useRef("");


      useEffect(() => {
        const fetchLevel = async () => {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.GET_AUDIT_TRAIL_DROPDOWN_DATA
            }`,
            { credentials: "include" }
          );
          const data = await response.json();
           setDevision([ { value: "", label: "" }, ...formatOptions(data.divisionList || [], "division_id", "name"), ]);
           setYear([{value:'', label:''}, ...formatOptions(data.transYearList || [],"trans_year", "trans_year" )])
           setMenuName([{value:'', label:''}, ...formatOptions(data.menuList || [],"menu_name", "menu_name_desc" )])
          //  setKeyname([{value:'', label:''}, ...formatOptions(data.keyNameList || [],"key_field", "key_field" )])
          //  setTransaction([{value:'', label:''}, ...formatOptions(data.poCategoryList || [],"po_cat_prefix", "po_cat_description" )])
        
        };
    
        fetchLevel();
      }, []);

   useEffect(() => {
  const fetchLevel2 = async () => {
    if (!formData.menu_name) {
      setKeyname([{ value: "", label: "" }]);
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_AUDIT_TRAIL_DROPDOWN_DATA
      }?menu_name=${encodeURIComponent(formData.menu_name)}`,
      { credentials: "include" }
    );

    if (!response.ok) return;

    const data = await response.json();
    setKeyname([{ value: "", label: "" }, ...formatOptions(data.keyNameList || [], "key_value", "key_value")
    ]);
  };

  fetchLevel2();
}, [formData.menu_name]);

useEffect(() => {
  if (!dateReady) return;

  const { menu_name, division_id, trans_year, from_date, to_date } = formData;
  if (!menu_name || !division_id || !trans_year || !from_date || !to_date) return;

  const query = new URLSearchParams({
    menu_name,
    division_id,
    trans_year,
    from_date,
    to_date,
  }).toString();

  if (lastQueryRef.current === query) return;
  lastQueryRef.current = query;

  const fetchTransactionNO = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_AUDIT_TRAIL_TRANSACTION_NO}?${query}`,
      { credentials: "include" }
    );

    const data = await response.json();

    setTransaction([
      { value: "", label: "" },
      ...formatOptions(
        data.transactionList || [],
        "key_field_value",
        "key_field_value"
      ),
    ]);
  };

  fetchTransactionNO();
}, [dateReady, formData.from_date, formData.to_date,formData.division_id, formData.menu_name, formData.trans_year]);


    const handleNext = (e) => {
      e.preventDefault();

      const valid = validateForm("audit-trail-1", "Audit Trail");
      if (!valid) return;

      setStep(2);
    };

    const handleBack = (e) => {
      e.preventDefault();
      setStep(1);
    };


    const handleChange = (e) => {
      const { name, value } = e.target;
    
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // jab bhi date change ho, ready reset
  if (name === "from_date" || name === "to_date") {
    setDateReady(false);
  }
    };


    const handleCancel = () => {
      setFormData(initialForm);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const valid = validateForm("audit-trail-2", "Audit Trail");
      if (!valid) return;

   
      const payload = {
      division_id: formData.division_id,
      from_date: formData.from_date,
      to_date: formData.to_date,
      key_value: formData.key_value,
      tran_no: formData.transaction_no,  
      year: formData.trans_year,
      menu_name: formData.menu_name,
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_AUDIT_TRAIL_DATA}`,
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
      {/* ================= FIRST FORM ================= */}
      {step === 1 && (
        <Form id='audit-trail-1'>
          <div className="d-flex justify-content-center mt-4">
            <Card className="report-card p-3 shadow-lg mt-4" style={{ width: "50%" }}>
              <Container>
                <h3 className="text-center">FINANCIAL AUDIT TRAIL</h3>

                <Row className="mt-4">
                  <Col lg={12}>
                    <MuiSelectField
                      label="Division"
                      name="division_id"
                      value={formData.division_id}
                      onChange={handleChange}
                      required
                      options={division}
                    />
                  </Col>

                 
                </Row>

                <Row className="mt-3">
                   <Col lg={3}>
                    <MuiSelectField
                      label="Trans Year"
                      name="trans_year"
                      value={formData.trans_year}
                      onChange={handleChange}
                      required
                      options={year}
                    />
                  </Col>
                  <Col lg={9}>
                    <MuiSelectField
                      label="Menu Name"
                      name="menu_name"
                      value={formData.menu_name}
                      onChange={handleChange}
                      required
                      options={menuName}
                    />
                  </Col>
                </Row>

                <Row className="mt-3 justify-content-end">
                  <Col lg={2}>
                    <ButtonUi onClick={handleNext}>Next</ButtonUi>
                  </Col>
                </Row>
              </Container>
            </Card>
          </div>
        </Form>
      )}

      {/* ================= SECOND FORM ================= */}
      {step === 2 && (
        <Form id="audit-trail-2">
          <div className="d-flex justify-content-center mt-4">
            <Card className="p-3 shadow-lg mt-4" style={{ width: "50%" }}>
              <Container>
                <h3 className="text-center">FINANCIAL AUDIT TRAIL</h3>

                <Row className="mt-4 justify-content-center">
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
                       onBlur={() => setDateReady(true)}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mt-3 justify-content-center">
                  <Col lg={8}>
                    <MuiSelectField
                      label="Key Name"
                      name="key_value"
                      value={formData.key_value}
                      onChange={handleChange}
                      required
                        options={keyName}
                    />
                  </Col>
                </Row>

                <Row className="mt-3 justify-content-center">
                  <Col lg={8}>
                    <MuiSelectField
                      label="Transaction No."
                      name="transaction_no"
                      value={formData.transaction_no}
                      onChange={handleChange}
                      required
                      options={transaction}
                    />
                  </Col>
                </Row>

                <Row className="mt-4 justify-content-center">
                  <Col xl={2}>
                    <ButtonUi color="secondary" onClick={handleSubmit}>OK</ButtonUi>
                  </Col>
                  <Col xl={2}>
                    <ButtonUi color="danger" onClick={handleCancel}>
                      Cancel
                    </ButtonUi>
                  </Col>
                  <Col xl={2}>
                    <ButtonUi color="primary" onClick={handleBack}>
                      Back
                    </ButtonUi>
                  </Col>
                </Row>
              </Container>
            </Card>
          </div>
        </Form>
      )}
    </>
  );
  };

  return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_AUDIT_TRAIL_DATA"
      reportTitle="Audit Trail Report"
      rightAlignedFields={[
         
      ]}
    />
  );
};

export default AuditTrial;
