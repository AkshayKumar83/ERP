import React from "react";
import { Row, Col, Container } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import { storeNoHelpListHeader } from "./Item_stock_opening_mstr_helper";

const ItemStockOpeningMstrHeader = ({ formData, handleChange,formStatus,handleHelpList = () => {},
setHelpFor,setHelpListHeader}) => {

    const handleDoubleClick = (field, header) => {
    if(["Search"].includes(formStatus)) {
      setHelpFor(field); 
      setHelpListHeader(header); 
      handleHelpList(true);
    }
  };

  return (
    <>
      <Row>
        <Col md={3} lg={2}>
          <TextField
            type="text"
            label="Store no"
            value={formData?.wc_no || ""}
            onChange={(e) => handleChange("wc_no", e.target.value,e)}
            disabled  ={formStatus !=='Search'}
            onDoubleClick={() => handleDoubleClick('storeNo', storeNoHelpListHeader)}
          />
        </Col>
        <Col md={2} lg={1}>
          <TextField
            type="text"
            label="Store Type"
            value={formData?.store_process || ""}
            onChange={(e) => handleChange("store_process", e.target.value,e)}
            disabled
          />
        </Col>
        <Col md={4} lg={2} className="mt-1">
          <span style={{ color: "blue", fontWeight: "bold", fontSize: "14px" }}>
            S - used for Store
          </span>
          <p style={{ color: "blue", fontWeight: "bold", fontSize: "14px" }}>
            P - used for Process
          </p>
        </Col>
        <Col md={3} lg={4}>
          <TextField
            type="text"
            label="Description"
            value={formData?.description || ""}
             onChange={(e) => handleChange("description", e.target.value, e)}
             disabled
          />
        </Col>
      </Row>
    </>
  );
};

export default ItemStockOpeningMstrHeader;
