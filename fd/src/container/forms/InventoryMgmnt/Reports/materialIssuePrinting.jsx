

import React, { useState } from "react";
import { Card, Col, Container, Form, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import HelpList from "../../../../components/HelpList";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import MuiTextField from "../../../../components/basic/muiTextField";


const MaterialIssuePrinting = () => {
const { user } = useSelector((state) => state.auth);

const FormUI = ({ onSubmit }) => {
    const initialForm = {
      wc_no: "",
      wc_description: "",
      iss_no_from: "",
      iss_no_to: "",
    };

    const [formData, setFormData] = useState(initialForm);
    const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);

    const toggleHelpModal = () => setHelpList(!helpList);

    const handleChange = (e) => {
      const { name, value } = e.target;
       if (["wc_no",].includes(name)) {
           toast.error("Please select value from Help List on double click"); 
            return;
         }

          if (["iss_no_from", "iss_no_to"].includes(name) && !formData.wc_no) {
            toast.error("Please fill store first!");
            return;
          }
          if (["iss_no_from", "iss_no_to"].includes(name) && formData.wc_no) {
           toast.error("Please select value from Help List on double click"); 
            return;
          }
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const WcNoHelpListHeader = [
      { label: "Store", key: "wc_no" },
      { label: "Description", key: "description" },
      { label: "WC ID", key: "wc_id" },
    ];

     const fromHelpListHeader = [
       { label: "Doc No", key: "doc_no" },
      { label: "Doc Date", key: "doc_date" },

    ];

    const toHelpListHeader = [
       { label: "Doc No", key: "doc_no" },
      { label: "Doc Date", key: "doc_date" },
     ];

    const validateStore = async (wc_no) => {
   try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MATERIAL_ISSUE_PRINTING_WC_NO_DATA}?wc_no=${wc_no}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error("Store does not exist");
      setFormData((prev) => ({
        ...prev,
        wc_no: "",
        wc_description: "",
        wc_id: "",
      }));
      return false;
    }

    return true;

  } catch (err) {
    toast.error("Server error while checking store");
    return false;
  }
    };


    const handleDoubleClick = (field, header) => {
      setHelpFor(field);
      setHelpListHeader(header);
      setHelpList(true);
    };

    const onSelectHelpItem = (data) => {
     if (helpFor === "store") {

      validateStore(data.wc_no).then((valid) => {
        if (!valid) return;

    setFormData((prev) => ({
      ...prev,
      wc_no: data.wc_no,
      wc_description: data.description,
      wc_id: data.wc_id,
    }));
  });

}
 if (helpFor === "from") {
        setFormData((prev) => ({
          ...prev,
          iss_no_from: data.doc_no,
          doc_date: data.doc_date,
        }));
      }
      if (helpFor === "to") {
        setFormData((prev) => ({
          ...prev,
          iss_no_to: data.doc_no,
          doc_date: data.doc_date,

        }));
      }

    };

    const handleCancel = () => {
      setFormData(initialForm);
    };

    const correctIssueRange = (from, to) => {

  // 1. dono blank
  if (!from && !to) {
    toast.error("Values cannot be left blank");
    return null;
  }

  // 2. from blank
  if (!from) {
    from = to;
  }

  // 3. to blank
  if (!to) {
    to = from;
  }

  // 4. swap if reversed
  if (to < from) {
    let temp = from;
    from = to;
    to = temp;
  }

  return { from, to };
      };


  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const matAccptn = validateForm("mat-accptn", "Material Issue Printing");
    if (!matAccptn) return;

    const { wc_id } = formData;

    // Apply correction logic
    const fixedRange = correctIssueRange(
      formData.iss_no_from,
      formData.iss_no_to
    );

    if (!fixedRange) return; // blank or error

    // IMPORTANT: update formData UI values also (like Oracle)
    setFormData((prev) => ({
      ...prev,
      iss_no_from: fixedRange.from,
      iss_no_to: fixedRange.to,
    }));

    const finYear = user.global_fin_year;

    // Use corrected range
    const payload = {
      wc_id,
      iss_no_from: fixedRange.from,
      iss_no_to: fixedRange.to,
      trans_year: finYear,
    };

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_MATERIAL_ISSUE_PRINTING_DATA}`,
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
    <Form id='mat-accptn'>
        <div className="d-flex justify-content-center mt-4">
          <Card className="report-card p-3 shadow-lg mt-4" style={{ width: "50%" }}>
            <Container>
              <h4 className="d-flex justify-content-center">Material Issue (PDS/SRS/STN/SRV) Printing</h4>
              <Row className="mt-4">
                <Col sm={4} md={2} lg={4}>
                  <MuiTextField
                    type="text"
                    label="Store"
                    name="wc_no"
                    value={formData?.wc_no}
                    onChange={handleChange}
                    onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                    required
                    showHelpIcon
                  />
                </Col>

                <Col sm={12} md={6} lg={8}>
                  <MuiTextField
                    type="text"
                    label="Description"
                    maxLength={40}
                    name="description"
                    value={formData?.wc_description}
                    onChange={handleChange}
                    disabled
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={4}>
                  <MuiTextField
                    type="text"
                    label="From No."
                    name='iss_no_from'
                    value={formData?.iss_no_from || ""}
                    onChange={handleChange}
                     onDoubleClick={() => handleDoubleClick("from", fromHelpListHeader)}
                    required
                    showHelpIcon
                    disabled={!formData.wc_no}
                  />
                </Col>

                <Col lg={4}>
                  <MuiTextField
                    type="text"
                    label="To No."
                    name='iss_no_to'
                    value={formData?.iss_no_to || ""}
                    onChange={handleChange}
                    required
                    showHelpIcon
                     onDoubleClick={() => handleDoubleClick("to", toHelpListHeader)}
                     disabled={!formData.iss_no_from}
                  />
                </Col>
              </Row>

              <Row className="mt-4 d-flex justify-content-center">
                <Col xl={2}>
                  <ButtonUi onClick={handleSubmit} style={{width:"60px"}}>OK</ButtonUi>
                </Col>
                <Col xl={2}>
                  <ButtonUi color="danger" onClick={handleCancel}> Cancel </ButtonUi>
                </Col>
              </Row>
            </Container>
          </Card>
        </div>
        {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                        formStatus={'Insert'}
                        helpFor={helpFor}
                        apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MATERIAL_ISSUE_PRINTING_DATA}`}
                        helpListHeader={helpListHeader}
                        handleHelpList={setHelpList}
                        onSelectHelpItem={onSelectHelpItem}
                        queryPera={{ needAppGlobalData: "Y" }}
                        whereClause={{ wc_id: formData.wc_id }}

                      />
                    </ModalBody>
                  </Modal>
                )}
              </Form>
   </>
  )
};

 return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_MATERIAL_ISSUE_PRINTING_DATA"
      reportTitle="Material Issue Printing Report"
      rightAlignedFields={[
         'doc_id', 'trans_code', 'wc_id','qty','batch_qty',
      ]}
    />
  );
};

export default MaterialIssuePrinting