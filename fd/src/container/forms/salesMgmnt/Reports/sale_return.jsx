


import React, { useState } from "react";
import { Card, Col, Container, Form, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import HelpList from "../../../../components/HelpList";
import GenericReportPage from "../../../../components/common/GenericReportPage";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import MuiTextField from "../../../../components/basic/muiTextField";
import MuiDateField from "../../../../components/basic/MuiDateField";


const SaleReturn = () => {

  const { user } = useSelector((state) => state.auth);

  //  FULL FORM UI INSIDE SAME FILE
  const FormUI = ({ onSubmit }) => {
    const initialForm = {
      from_date: "",
      to_date: "",
    };

    const [formData, setFormData] = useState(initialForm);
    const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);

    const toggleHelpModal = () => setHelpList(!helpList);

    const handleChange = (e) => {
      const { name, value } = e.target;
       if (["wc_no"].includes(name)) {
           toast.error("Please select value from Help List on double click");     return;
         }
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const WcNoHelpListHeader = [
      { label: "Store", key: "wc_no" },
      { label: "Description", key: "description" },
      { label: "WC ID", key: "wc_id" },
    ];

    const validateStore = async (wc_no) => {
   try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MATERIAL_ACCEPTANCE_WC_NO_DATA}?wc_no=${wc_no}`,
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
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_SALE_RETURN_REPORT_DATA}`,
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
                <h3 className="d-flex justify-content-center">Sale Return</h3>

                {/* <Row className="mt-4">
                  <Col lg={4}>
                    <MuiTextField
                      type="text"
                      label="Store"
                      name="wc_no"
                      value={formData.wc_no}
                      onChange={handleChange}
                      onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                      required
                      showHelpIcon
                    />
                  </Col>

                  <Col lg={8}>
                    <MuiTextField
                      type="text"
                      label="Description"
                      name="wc_description"
                      value={formData.wc_description}
                      onChange={handleChange}
                      disabled
                    />
                  </Col>
                </Row> */}

                <Row className="mt-4 d-flex justify-content-center">
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

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus="Insert"
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MATERIAL_ACCEPTANCE_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={setHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                />
              </ModalBody>
            </Modal>
          )}
        </Form>
      </>
    );
  };

  return (
    <GenericReportPage
      FormComponent={FormUI}
      apiUrl="POST_SALE_RETURN_REPORT_DATA"
      reportTitle="Sale Return Report"
      rightAlignedFields={[
         'Return Qty.','Rate','IGST Value','CGST Value','SGST Value','Basic Value','Net Value','HSN/SAC Code'
      ]}
    />
  );
};

export default SaleReturn;

