import React, { useEffect } from "react";
     import { Col, Form, Row } from "reactstrap";
     import TextField from "../../../../components/basic/textField";
     import Checkbox from "../../../../components/basic/checkbox";
     import { bankCodeHelpListHeader, handleValidateField } from "./cheque_bookEntry_helper";

     const ChequeBookEntryHeader = ({
       formData,
       setFormData,
       handleChange,
       detailFormData,
       formStatus,
       handleHelpList = () => {},
       setHelpFor,
       setHelpListHeader,
     }) => {

       const handleDoubleClick = (field, header) => {
         if (["Insert", "Search","Update"].includes(formStatus)) {
           setHelpFor(field);
           setHelpListHeader(header);
           handleHelpList(true);
         }
       };

         useEffect(() => {
    if (formStatus === "Insert") {
      setFormData((prev) => ({
        ...prev,
        issue_dt: prev.issue_dt || new Date().toISOString().split("T")[0], // current date
        open_flag: prev.open_flag || "Y", // default Y
      }));
    }
  }, [formStatus, setFormData]);

       return (
         <Form id="chq-book">
           <Row>
             <Col sm={4} md={3} xl={2}>
               <TextField
                 type="text"
                 label="Bank Code"
                 name="bank_acc_no"
                 value={formData?.bank_acc_no || ""}
                 onChange={(e) => handleChange("bank_acc_no", e.target.value, null, e)}
                 onDoubleClick={() => handleDoubleClick("bankCode", bankCodeHelpListHeader)}
                 maxLength={20}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData, detailFormData)}
                 required
               />
             </Col>
             <Col sm={8} md={9} lg={6}>
               <TextField
                 type="text"
                 label="Bank Description"
                 value={formData?.acc_desc || ""}
                onChange={(e) => handleChange("acc_desc", e.target.value, null, e)}
                 disabled
               />
             </Col>
           </Row>
           <Row className="mt-1">
             <Col sm={6} md={4} lg={2}>
               <TextField
                 type="number"
                 label="Cheque No. Start"
                 name="chq_no_strt"
                 value={formData?.chq_no_strt || ""}
                 onChange={(e) => handleChange("chq_no_strt", e.target.value, null, e)}
                 maxLength={20}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData, detailFormData)}
                 required
               />
             </Col>
             <Col sm={6} md={4} lg={2}>
               <TextField
                 type="number"
                 label="Cheque No. End"
                 name="chq_no_end"
                 value={formData?.chq_no_end || ""}
                 onChange={(e) => handleChange("chq_no_end", e.target.value, null, e)}
                 maxLength={20}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData, detailFormData)}
                 required
               />
             </Col>
             <Col sm={6} md={4} lg={2}>
               <TextField
                 type="number"
                 label="Last Chq. No. Used"
                 name="last_chq_no_used"
                 value={formData?.last_chq_no_used || ""}
                 onChange={(e) => handleChange("last_chq_no_used", e.target.value, null, e)}
                 maxLength={20}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData, detailFormData)}
               />
             </Col>
             <Col sm={6} md={4} lg={2}>
               <TextField
                 type="date"
                 label="Date of Start"
                 name="issue_dt"
                 value={formData?.issue_dt || ""}
                 onChange={(e) => handleChange("issue_dt", e.target.value, null, e)}
                 required
               />
             </Col>
             <Col sm={6} md={4} lg={2}>
               <TextField
                 type="number"
                 label="No. of Cheque"
                 name="no_of_chq"
                 value={formData?.no_of_chq || ""}
                 onChange={(e) => handleChange("no_of_chq", e.target.value, null, e)}
                 disabled
               />
             </Col>
             <Col sm={6} md={4} lg={2} className="mt-4">
               <Checkbox
                 text="Open Flag"
                 onChange={(e) => handleChange("open_flag", e.target.checked ? "Y" : "N")}
                 checked={formData?.open_flag === "Y"}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData, detailFormData)}
               />
             </Col>
           </Row>
         </Form>
       );
     };

     export default ChequeBookEntryHeader;