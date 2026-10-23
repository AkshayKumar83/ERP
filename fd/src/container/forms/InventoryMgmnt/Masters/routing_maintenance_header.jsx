import React, { useEffect } from "react";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import MuiTextField from "../../../../components/basic/muiTextField";
import MuiDateField from "../../../../components/basic/MuiDateField";
import MuiTextArea from "../../../../components/basic/muiTextArea";
import RadioGroup from "../../../../components/basic/radioGroup";
import { finalCodeHelpListHeader, handleValidateField, mstrRouteHelpListHeader, outputCodeHelpListHeader,validateFromDb } from "./routing_maintenance_helper";
import toast from 'react-hot-toast';



const RoutingMaintenanceHeader = ({
  headerData,
  setHeaderData,
  handleChange,
  formStatus,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
 confirmationModal,
 setConfirmationModal,
 confirmationConfig,
 setConfirmationConfig,
 setPendingFmpCode,
 pendingFmpCode,
           

  }) => {

  const handleDoubleClick = (field, header) => {
    if(['Insert',"Search",'Update'].includes(formStatus)) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

useEffect(() => {
   if(!["Insert"].includes(formStatus)) return
  if (headerData.master === "N") {
    document
      .querySelector('input[name="master_route_no"]')
      ?.focus();
  }
}, [headerData.master]);


const handleMasterChange = (e) => {
  const checked = e.target.checked;
  const masterValue = checked ? "Y" : "N";

  setHeaderData((prev) => ({
    ...prev,
    master: masterValue,
    master_route_no: checked ? "" : prev.master_route_no,
  }));
};

const handleOpnNoBlur = async (e, headerData, setHeaderData) => {
  const value = e.target.value;

  if (!value) {
    toast.error("Operation No. can't be blank");
    e.target.focus();
    return;
  }

  const res = await validateFromDb({
    type: "OPERATION_NO",
    value, 
  });

  if (!res) return; 

  console.log("response",res)

  //  Oracle: select into
  setHeaderData(prev => ({
    ...prev,
    opn_no: value,
    opn_id: res?.data?.opn_id,
    operation_description: res?.data?.operation_description,
  }));
};


const generateFmpCode = (finalCode, opnNo) => {
  console.log("finalCode",finalCode)
  const base = finalCode.slice(0,16);
  console.log("base",base)
  return `${base}-${opnNo}A`;
};



  const handleFmpFlow = async (e, headerData, setHeaderData) => {
    const wcNo = e.target.value?.trim();

    if (!wcNo) {
      toast.error("Work Center No. cannot be blank");
      e.target.focus();
      return;
    }

    /* ===== WC VALIDATION ===== */
    const wcRes = await validateFromDb({
      type: "WC_VALIDATE",
      value: wcNo,
    });

    if (!wcRes) return;

    setHeaderData(prev => ({
      ...prev,
      wc_no: wcNo,
      wc_id: wcRes.data.wc_id,
      main_wc_id: wcRes.data.main_wc_id,
      main_wc_no: wcRes.data.main_wc_no,
      main_wc_desc: wcRes.data.main_wc_desc,
    }));

    /* ===== OPN NO ===== */
    if (!headerData.opn_no || headerData.opn_no.length < 2) {
      toast.error("Min length of opn should be 2 (eg: 05)");
      return;
    }

    /* ===== FMP CODE ===== */
    const fmpCode = generateFmpCode(
      headerData.final_code,
      headerData.opn_no
    );

    const existRes = await validateFromDb({
      type: "FMP_EXIST_CHECK",
      value: fmpCode,
    });

    if (existRes?.exists) {
      setHeaderData(prev => ({ ...prev, it_code: fmpCode }));
      return;
    }

    /* ===== CONFIRM MODAL ===== */
    setPendingFmpCode(fmpCode);
    setConfirmationConfig({
      title: "Confirmation",
      description: "Do you want to create this FMP Item ?",
    });
    setConfirmationModal(true);
   };

   const handleOutputCodeBlur = async (e) => {
  const value = e.target.value?.trim();
   if (!value) {
      toast.error("Output Code cannot be blank");
      e.target.focus();
      return;
    }

  const res = await validateFromDb({
    type: "OUTPUT_CODE_VALIDATE",
    value,
  });

  if (!res) return;

  // warning (Design BOM)
  if (res.data?.warning) {
    toast(res.data.warning, { icon: "⚠️" });
  }

  // set item name
  setHeaderData(prev => ({
    ...prev,
    it_code: value,
    it_name: res.data.it_name,
  }));
};






   return (
    <>
     <Form id='route-header'>
    <Row>
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Route Sheet No."
            name="route_no"
            maxLength={20}
            value={headerData?.route_no}
            onChange={(e) =>handleChange("header", "route_no", e.target.value, 0, e)}
            onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
            required
          />
        </Col>
        <Col  lg={2} className="button-group-wrapper">
          <Checkbox
            text="Master Route"
            // onChange={(e) => handleChange("header", "master", e.target.checked ? "Y" : "N", 0, e)}
             onChange={handleMasterChange}
            checked={headerData?.master === "Y"}
          />
        </Col>
          <Col xl={2}>
         <MuiTextField
            label="Master Route No."
            name="master_route_no"
            value={headerData?.master_route_no || ""}
            onChange={(e) => handleChange("header", "master_route_no", e.target.value, 0, e)}
            disabled={headerData?.master === "Y"}  
            required={headerData?.master === "N"}
            showHelpIcon
            onDoubleClick={() => handleDoubleClick("mstrRoute", mstrRouteHelpListHeader)}
             onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
          />

        </Col>
      </Row>

       <Row className="mt-2">
        <Col lg={2}>
          <MuiDateField
          label="Route Start Date"
          name="route_start_date"
          value={headerData?.route_start_date}
           onChange={(e) => handleChange("header","route_start_date", e.target.value, 0, e)}
             onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
           required
        />
      </Col>
        <Col lg={2}>
          <MuiDateField
        label="Route End Date"
        name="route_end_date"
        value={headerData?.route_end_date}
        onChange={(e) => handleChange("header","route_end_date", e.target.value, 0, e)}
          onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
        required
      />
        </Col>
         <Col xl={2} className="mt-2">
          <MuiTextField
            type="text"
            label="Final Stage Code"
            name="final_code"
            value={headerData?.final_code}
            onChange={(e) => handleChange("header","final_code", e.target.value, 0, e)}
            onDoubleClick={() => handleDoubleClick("finalCode", finalCodeHelpListHeader)}
            showHelpIcon
            required
            onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
          />
        </Col>
         <Col xl={6} className="mt-2">
          <MuiTextField
            type="text"
            // label="Route Sheet No."
            name="fianal_code_desc"
            value={headerData?.fianal_code_desc}
            onChange={(e) => handleChange("header","fianal_code_desc", e.target.value, 0, e)}
            disabled
          />
        </Col>

     </Row>

      <Row className="mt-3">
         <Col xl={2} className="mt-3" >
          <MuiTextField
            type="text"
            label="Operation No."
            name="opn_no"
              maxLength={15}
            value={headerData?.opn_no}
            onChange={(e) => handleChange("header","opn_no", e.target.value ,0,e)}
            onBlur = {(e) => handleOpnNoBlur(e, headerData,setHeaderData)}
required
          />
        </Col>
         <Col xl={10}>
         <MuiTextArea
        label="Operation Description"
        name='operation_description'
          maxLength={2000}
        value={headerData?.operation_description}
        onChange={(e) => handleChange("header","operation_description", e.target.value ,0,e)}
        rows={1}
        fullWidth
      />
        </Col>
     </Row>

        <Row className="mt-3">
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Work Center"
            name="wc_no"
            value={headerData?.wc_no}
            onChange={(e) => handleChange("header","wc_no", e.target.value,0,e)}
             onBlur = {(e) => handleFmpFlow(e, headerData,setHeaderData)}
             required
          />
        </Col>
        <Col  lg={2} className="button-group-wrapper">
          <Checkbox
            text="Default WC"
            onChange={(e) => handleChange("header", "default_wc", e.target.checked ? "Y" : "N", 0,e)}
            checked={headerData?.default_wc === "Y"}
          />
        </Col>
          <Col xl={8}>
          <MuiTextField
            type="text"
            label="Remarks"
            name="remarks"
            value={headerData?.remarks}
            onChange={(e) =>handleChange("header", "remarks", e.target.value, 0, e) }
          />
        </Col>
      </Row>

     <Row className="mt-3">
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Output Code"
            name="it_code"
              maxLength={20}
            value={headerData?.it_code}
            onChange={(e) => handleChange("header","it_code", e.target.value,0,e)}
             onDoubleClick={() => handleDoubleClick("outputCode", outputCodeHelpListHeader)}
              onBlur={handleOutputCodeBlur}
            showHelpIcon
            required
          />
        </Col>
    
          <Col xl={4}>
          <MuiTextField
            type="text"
            label="Description"
            name="it_name"
            value={headerData?.it_name}
            onChange={(e) => handleChange("header","it_name ", e.target.value, 0,e)}
            disabled
          />
        </Col>
        <Col xl={2}>
          <MuiTextField
            type="text"
            label="Main Work Center"
            name="main_wc_no"
            value={headerData?.main_wc_no}
            onChange={(e) => handleChange("header","main_wc_no", e.target.value ,0,e)}
            disabled
          />
        </Col>
          <Col xl={4}>
          <MuiTextField
            type="text"
            label="Description"
            name="main_wc_desc"
            value={headerData?.main_wc_desc}
            onChange={(e) => handleChange("header","main_wc_desc", e.target.value, 0,e)}
            disabled
          />
        </Col>
      </Row>
      <Row></Row>
  <Card className="mt-2 p-3">
    <Row>
      <Col xl='2'>
       <Row>
         <Col xl={10} className="ms-2 mt-4">
          <MuiTextField
            type="number"
            label="Qty."
            name="qty"
            value={headerData?.qty}
            onChange={(e) => handleChange("header","qty", e.target.value,0,e)}
          />
        </Col>
        </Row>
     </Col>
       
      <Col  lg={1}>
               <Row >
                 <RadioGroup
                   className="d-flex flex-wrap justify-content-between box-border radio-button-wrapper"
                   options={[
                     { text: "Hours", value: "H" },
                     { text: "Minutes", value: "M" },
                     { text: "Seconds", value: "S" },
                   ]}
                   onChange={(e) => handleChange("header","min_hour_flag", e.target.value,0 ,e)}
                   checked={headerData?.min_hour_flag || "H"}
                 />
               </Row>
               
       </Col>

       <Col xl='9'>
       <Row>
         <Col xl={3}>
          <MuiTextField
            type="number"
            label="Setup Time"
            name="setup_time"
            value={headerData?.setup_time}
            onChange={(e) => handleChange("header","setup_time", e.target.value ,0,e)}
          />
        </Col>
      <Col xl={3}>
          <MuiTextField
            type="number"
            label="Run Time"
            name="run_time"
            value={headerData?.run_time}
            onChange={(e) => handleChange("header","run_time", e.target.value,0,e)}
          />
        </Col>
        <Col xl={3}>
          <MuiTextField
            type="number"
            label="Move Time"
            name="move_time"
            value={headerData?.move_time}
            onChange={(e) => handleChange("header","move_time", e.target.value,0,e)}
          />
        </Col>
         <Col xl={3}>
          <MuiTextField
            type="number"
            label="Tool Chg. Time"
            name="tool_change_time"
            value={headerData?.tool_change_time}
            onChange={(e) => handleChange("header","tool_change_time", e.target.value, 0,e)}
          />
        </Col>
         <Col xl={3} className="mt-3">
          <MuiTextField
            type="number"
            label="Setup Crew No."
            name="setup_crew_no"
            value={headerData?.setup_crew_no}
            onChange={(e) => handleChange("header","setup_crew_no", e.target.value, 0,e)}
          />
        </Col>
         <Col xl={3} className="mt-3">
          <MuiTextField
            type="number"
            label="Run Crew No."
            name="run_crew_no"
            value={headerData?.run_crew_no}
            onChange={(e) => handleChange("header","run_crew_no", e.target.value ,0,e)}
          />
        </Col>
      <Col xl={3} className="mt-3">
          <MuiTextField
            type="number"
            label="Helper Crew No."
            name="helper_crew_no"
            value={headerData?.helper_crew_no}
            onChange={(e) => handleChange("header","helper_crew_no", e.target.value, 0,e)}
          />
        </Col>

        </Row>
        </Col>
      </Row>
</Card>
      </Form>
        </>
  )
}

export default RoutingMaintenanceHeader