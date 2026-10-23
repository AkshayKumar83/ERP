import React, { useState } from "react";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import { Col, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { mrirInitData } from "./purchase_voucher_entry_helper";
import PurchaseVoucherEntryMRIR from "./purchase_voucher_entry_MRIR";

const PurchaseVoucherEntryHeader = ({ formData, handleChange, formStatus, section, poCategory }) => {

    const [isMrirModelOpen, setIsMrirModelOpen] = useState(false)
      const toggleMrirModal = () => setIsMrirModelOpen(!isMrirModelOpen)
  
      const [mrirData, setMrirData] = useState([{...mrirInitData }]);
  
      const handleChangeMRIR = (fieldName, value, rowIndex) => {
        const updatedData = [...mrirData]; 
        updatedData[rowIndex] = { ...updatedData[rowIndex], [fieldName]: value.toUpperCase() };
        setMrirData(updatedData);
      };
    
      // Function to add a new row
      const triggerAddRowMRIR = () => {
        setMrirData([...mrirData, 
          {...mrirInitData}]); 
    };
  
  return (
    <>
      <Row className=" d-flex ">
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Division"
            value={formData.division_name || ""}
            onChange={(e) => handleChange("division_name", e.target.value,)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <Select
              required={true}
              label="Section"
              name="section"
              value={formData["section"]}
              onChange={(e) => handleChange("section", e.target.value, rowIndex)}
              options={section}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Voucher No."
            value={formData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value)}
            disabled={formStatus !='Search'}
            searchAllow={true}
          />
        </Col>
         <Col sm={4} md={4} lg={2}>
          <TextField
            type="date"
            label="Voucher Date"
            value={formData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value)}
            searchAllow={formStatus == 'Search'}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <Select
            label="Po Cat"
            name="po_cat"
            value={formData["po_cat"]}
            onChange={(e) => handleChange("po_cat", e.target.value, rowIndex)}
            options={poCategory}
          />
        </Col>
      </Row>

      <Row className=" d-flex ">
        {/* <Col sm={4} md={4} lg={2}>
          <TextField
            type="date"
            label="Voucher Date"
            value={formData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value)}
          />
        </Col> */}
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Log"
            value={formData.bill_log || ""}
            onChange={(e) => handleChange("bill_log", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={4} lg={1}>
          <TextField
            type="text"
            label="Curr. Code"
            value={formData.curr_code || ""}
            onChange={(e) => handleChange("curr_code", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={1}>
          <TextField
            type="text"
            label="Exch. rate"
            value={formData.exchang_rt || ""}
            onChange={(e) => handleChange("exchang_rt", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Bill No."
            value={formData.bill_no || ""}
            onChange={(e) => handleChange("bill_no", e.target.value)}
          />
        </Col>
         <Col sm={7} md={3} lg={2}>
          <TextField
            type="date"
            label="Bill Date"
            value={formData.bill_dt || ""}
            onChange={(e) => handleChange("bill_dt", e.target.value)}
          />
        </Col>
        <Col sm={6} md={2} lg={1} className="button-group-wrapper mt-4 ms-lg-4 ">
          <Checkbox
            text="E1 flag"
            onChange={(e) => handleChange("e1_flag", e.target.checked ? "Y" : "N") }
            checked={formData?.e1_flag === "Y"}
          />
        </Col>
        <Col sm={7} md={3} lg={2}>
          {formData?.posted === "Y" ? (
                <p
                  className="mt-4 px-3 py-1"
                  style={{
                    borderRadius: "6px",
                    fontSize: "10px",
                    backgroundColor: "yellow",
                    color: "blue",
                    textAlign: "center",
                  }}
                >
                  Posted
                </p>
              ) : formData?.cancel === "Y" ? (
                <p
                  className="mt-4 px-3 py-1"
                  style={{
                    borderRadius: "6px",
                    fontSize: "10px",
                    backgroundColor: "yellow",
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  Cancelled
                </p>
            ) : null
          }
        </Col >
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={3} lg={1}>
          <TextField
            type="text"
            label="Party Code"
            value={formData.party_code || ""}
            onChange={(e) => handleChange("party_code", e.target.value)}
          />
        </Col>
        <Col sm={6} md={6} lg={4} className="mt-4">
          <TextField
            type="text"
            value={formData.party_name || ""}
            onChange={(e) => handleChange("party_name", e.target.value)}
            disabled
          />
        </Col>
       <Col sm={12} md={7} lg={5}>
          <TextField
            type="text"
            label="Reference"
            value={formData.reference || ""}
            onChange={(e) => handleChange("reference", e.target.value)}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="number"
            label="Total Amount"
            value={formData.trans_amt || ""}
            onChange={(e) => handleChange("trans_amt", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      {
          isMrirModelOpen && 
          <PurchaseVoucherEntryMRIR
          mrirData={mrirData}
          handleChangeMRIR={handleChangeMRIR}
          formStatus={formStatus}
          triggerAddRowMRIR={triggerAddRowMRIR}
          isMrirModelOpen={isMrirModelOpen}
          toggleMrirModal={toggleMrirModal}
        />
         }
    </>
  );
};

export default PurchaseVoucherEntryHeader;
