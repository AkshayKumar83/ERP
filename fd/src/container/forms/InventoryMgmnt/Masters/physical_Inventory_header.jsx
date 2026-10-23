import React, { useEffect } from 'react'
import { Col, Form, Row } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import { handleValidateHeaderField, WcNoHelpListHeader } from './physical_Inventory_helper'
import toast from 'react-hot-toast'

const PhysicalInventoryHeader = ({formData, handleChange,formStatus, 
  itemBase = [],
  itemType = [],
  itemSubCat = [],
  opngMnth=[],
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  }) => {

      const handleDoubleClick = (field, header) => {
     if(["Insert",'Update','Search'].includes(formStatus)) {
      setHelpFor(field); 
      setHelpListHeader(header); 
      handleHelpList(true);
    }
  };

    const handleManualInput = (e) => {
      toast.error("Please select value from Help List only!");
      e.preventDefault();
    };
  
   useEffect(() => {
    if (formStatus === "Insert") {
      if (!formData?.store_process) {
        handleChange("store_process", "S", { target: { value: "S" } }, "header");
      }
      if (!formData?.ok_rej) {
        handleChange("ok_rej", "O", { target: { value: "O" } }, "header");
      }
    }
  }, [formStatus]);


  return (
    <>
    <Form id='phy-inv'>
       <Row className="">
          <Col xl={2} className="mt-4 mb-2">
            <RadioGroup
          className="radio-button-wrapper box-border"
          options={[
            { text: "Store", value: "S" },
            { text: "WIP", value: "P" },
          ]}
          onChange={(e) => {
            const value = e.target.value;
            // Step 1: Update store_process
            handleChange("store_process", value, e, "header");
            //  Step 2: Reset wc_no if store_process changed
            if (formData?.store_process && formData?.store_process !== value) {
              handleChange("wc_no", "", e, "header"); 
              setHelpListHeader([]); 
              handleHelpList(false);
            }
          }}
          checked={formData?.store_process || " "}
        />

          </Col>
          <Col xl={3} className="mt-4 mb-2">
            <RadioGroup
              className="radio-button-wrapper box-border"
              options={[
                { text: "OK", value: "O" },
                { text: "REJECTION", value: "R" },
              ]}
              onChange={(e) => handleChange("ok_rej",  e.target.value, e, "header")}
              checked={formData?.ok_rej || " "}
            />
          </Col>
         <Col xl={2}>
            <TextField
              type="date"
              label="Opng Date"
              name="inv_date"
              value={formData?.inv_date || ""}
            onChange={(e) => {
            const dateValue = e.target.value;
            handleChange("inv_date", dateValue, e, "header");
                //  Automatically set month name in inv_month
           if (dateValue) {
              const monthNumber = String(new Date(dateValue).getMonth() + 1).padStart(2, "0");
              handleChange("inv_month", monthNumber, e, "header");
            } else {
              handleChange("inv_month", "", e, "header");
            }}}
             onBlur = {(e) => handleValidateHeaderField(e, formStatus,formData)}
              required
            />
          </Col>
          <Col xl={2}>
           <Select
              label="Opng Month"
              name="inv_month"
              placeholder=" "
              value={formData?.inv_month || ""}
              onChange={(e) => handleChange("inv_month", e.target.value, e, "header")}
              disabled
              options={opngMnth}
              onBlur = {(e) => handleValidateHeaderField(e, formStatus,formData)}
              required
            />
          </Col>
         <Col xl={2}>
            <TextField
              type="text"
              label="Work Center"
              name="wc_no"
              value={formData?.wc_no || ""}
              // onChange={(e) => handleChange("wc_no", e.target.value, e, "header")}
                onChange={handleManualInput} 
              onDoubleClick={() => handleDoubleClick('WcNo', WcNoHelpListHeader)}
              // required={formData?.store_process === "S"} 
              required
              onBlur = {(e) => handleValidateHeaderField(e, formStatus,formData)}
            />
          </Col>
         </Row>
     
        <Row className="mt-1">
          <Col xl={4}>
            <Select
              label="Item Type"
              name="it_type"
              value={formData?.it_type || ""}
              onChange={(e) => handleChange("it_type", e.target.value, e, "header")}
               options={itemType}
            />
          </Col>

          <Col xl={4}>
            <Select
              label="Item Base"
              name="it_base"
              value={formData?.it_base || ""}
              onChange={(e) => handleChange("it_base",  e.target.value, e, "header")}
              options={itemBase}
            />
          </Col>
   
          <Col xl={4}>
            <Select
              label="Sub Category"
              name="it_sub_c"
              value={formData?.it_sub_c || ""}
              onChange={(e) => handleChange("it_sub_c",  e.target.value, e, "header")}
              options={itemSubCat}
            />
          </Col>
           </Row>
           </Form>
    </>
  )
}

export default PhysicalInventoryHeader

