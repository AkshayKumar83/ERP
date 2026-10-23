import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { headers } from "./year_opening_for_bank_reco_helper";
import RadioGroup from "../../../../components/basic/radioGroup";
import RowAction from "../../../../components/common/rowAction";

const YearOpeningForBankRecoDetails = ({ formData  ,handleChange ,  detailFormData, formStatus, triggerAddRow }) => {

   const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
   
     const makeFocusOnTableRow = (rowIndex, id) => {
       const entry = detailFormData.find((entry) => entry.sr_no === id);
       setFocusedRowIndex(rowIndex);
       // triggerFamilyDetail(id)
     };

  function handleDelete (){
  }
  function handleUpdate (){
  }

  return (
  
  <Form id="Year-Opening-For-Bank-Reco">
      <Row>
     <Col sm={12} md={4} lg={4}>
      <Select
        required
        label="Opening for the Month of"
        name="month"
        placeholder={" "}
        value={formData.month || ""}
        onChange={(e) => handleChange("month", e.target.value)}
      />
    </Col>
     <Col sm={6} md={4} lg={4}>
      <TextField
        type="text"
        label="Bank Code"
        value={formData.acc_no || ""}
        onChange={(e) => handleChange("acc_no", e.target.value)}
      />
    </Col> 
     <Col sm={6} md={4} lg={4} className="mt-4">
      <TextField
        type="text"
        // label="Invoice Date"
        value={formData.acc_desc || ""}
        onChange={(e) => handleChange("acc_desc", e.target.value)}
        disabled={formStatus !== "Query"}
      />
    </Col>
  </Row>

    <div className="table-title">
      <span>Year opening For Bank Reco</span>
      {
      (formStatus === 'Insert' || formStatus === 'Update') &&
      <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
      }
  </div>
        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
          <Table hover>
              <thead>
                  <tr>{
                          (formStatus==='Insert' || formStatus==='Update') &&
                          <th className="">Actions</th>
                      }
                      {headers.map((header, index) => (
                          <th
                          key={index}
                          data-required={header.required || false}
                          style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                              {header.label}
                          </th>
                      ))}
                      
                  </tr>
              </thead>
              <tbody>
                  {detailFormData.map((data, rowIndex) => (
                    <>
                   <tr 
                    key={rowIndex} 
                    onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                    style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                    }} 
                    tabIndex={0}>
                      {
                     (formStatus==='Insert' || formStatus==='Update') &&
                      <td className="">
                          <RowAction
                          formStatus={formStatus}
                          canDelete={detailFormData.length > 1}
                          onDelete={() => handleDelete(data, rowIndex)}
                          onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                          />
                      </td>  
                      }
                  
                  <td>
                  <TextField
                  type="date"
                  required
                  name="trans_date"
                  value={data.trans_date || ""}
                  maxLength={30}
                  onChange={(e) => handleChange("trans_date", e.target.value, rowIndex,e )}                       
                  />
                  </td>
                  <td>
                  <TextField
                  type="text"
                  name="chq_no"
                  value={data.chq_no || ""}
                  maxLength={30}
                  onChange={(e) => handleChange("chq_no", e.target.value, rowIndex, e)}
                    />
                  </td>
                  <td>
                  <TextField
                  type="text"
                  required
                  name="ref_no"
                  value={data.ref_no || ""}
                  maxLength={30}
                  onChange={(e) => handleChange("ref_no", e.target.value, rowIndex,  e  )} 
                  />
                  </td>
                  <td>
                  <TextField
                  type="text"
                  required
                  name="deposit_slip"
                  value={data.deposit_slip || ""}
                  maxLength={30}
                  onChange={(e) =>handleChange("deposit_slip", e.target.value, rowIndex, e)}      
                 />
                  </td>
                  <td>
                  <TextField
                  type="text"
                  required
                  name="voucher_no"
                  value={data.voucher_no || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("voucher_no", e.target.value, rowIndex,e )}   
                 />
                  </td>
                  <td>
                  <TextField
                  type="date"
                  required
                  name="voucher_dt"
                  value={data.voucher_dt || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("voucher_dt", e.target.value, rowIndex,e )}                       
                 />
                 </td>
                 <td>
                  <TextField
                  type="text"
                  required
                  name="db_cr"
                  value={data.db_cr || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("db_cr", e.target.value, rowIndex,e )}
                  disabled={formStatus !== "Query"}                       
                 />
                 </td>
                 <td>
                  <TextField
                  type="text"
                  required
                  name="db_amt"
                  value={data.db_amt || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("db_amt", e.target.value, rowIndex,e )}                       
                 />
                 </td>
                 <td>
                  <TextField
                  type="text"
                  required
                  name="cr_amt"
                  value={data.cr_amt || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("cr_amt", e.target.value, rowIndex,e )}                       
                 />
                 </td>
                  </tr>
                    <tr>
                    <td colSpan={10}>
                  <TextField
                  type="text"
                  required
                  name="remarks"
                  value={data.remarks || ""}                    
                  maxLength={30}
                  onChange={(e) => handleChange("remarks", e.target.value, rowIndex,e )}                       
                 />
                 </td>
                    </tr>
                    </>
              



                  ))}
              </tbody>
          </Table>
            </div>
      </SimpleBar>
  </div>



<Row className="mt-4">
  
    <Col sm={12} md={10} lg={5} >
      <RadioGroup 
                className="radio-button-wrapper  box-border d-flex flex-wrap justify-content-between"
                options={[
                  { text: "Deposited but not Credited by Bank", value: "1" },
                  { text: "Credited by Bank but not Debited by us", value: "3" },
                  { text: "Deposited by Bank but not Credited by us", value: "2" },
                  { text: "Cheque issued but not presented for payment", value: "4" },
                ]}
            onChange={(e) => handleChange("repo_flag", e.target.value)}
            checked={formData?.repo_flag || "1"} 
          />
    </Col>
  
  <Col sm={6} md={5} lg={3} className="mt-3">
      <TextField
        type="text"
        value={detailFormData.dr_total || ""}
        onChange={(e) => handleChange("dr_total", e.target.value, rowIndex , e)}
        disabled={formStatus !== "Query"}
      />
    </Col> 
    <Col sm={6} md={5} lg={3} className="mt-3">
      <TextField
        type="text"
        value={detailFormData.cr_total || ""}
        onChange={(e) => handleChange("cr_total", e.target.value, rowIndex ,e)}
         disabled={formStatus !== "Query"}
      />
    </Col>  

    </Row>

</Form>
  )
}

export default YearOpeningForBankRecoDetails