import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { bankRecoEntryHeader } from "./Bank_reco_entry_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import TextArea from "../../../../components/basic/textArea";

const BankRecoEntryDetail = ({
    formData ,   // formdata is not formdata this is control data ,i have not created useState of control data .at this time
  detailFormData,
  handleChange,
  triggerAddRow,
  formStatus,
  handleDelete,
}) => {

  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailFormData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleUpdate() {}

  return (

    <Row className="justify-content-center">
<Col > 
      <Form  id="Cheque-Book_entry" className=" mt-5">
        <div className="table-title">
          <span>Cheque Book Entry</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div>

        <div
          className="table-container"
          style={{ height: "180px", maxHeight: "180px" }}
        >
          <SimpleBar forceVisible="y" autoHide={false}>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left">Actions</th>
                  )}
                  {bankRecoEntryHeader.map((header, index) => (
                    <th
                      key={index}
                      data-required={header.required || false}
                      style={{
                        whiteSpace: "nowrap",
                        width: header.width,
                        minWidth: header.width,
                      }}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailFormData.map((data, rowIndex) => (
                  <tr 
                  key={rowIndex} 
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                  style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                  }} 
                  tabIndex={0}>
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="sticky-column left">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={detailFormData.length > 1}
                          onDelete={() => handleDelete( rowIndex)}
                          onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                        />
                      </td>
                    )}
                    <td>
                    <TextField
                        type="text"
                        required
                        name="voucher_no"
                        value={data.voucher_no || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("voucher_no",e.target.value,rowIndex, e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <TextField
                        type="date"
                        required
                        name="voucher_dt"
                        value={data.voucher_dt || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("voucher_dt",e.target.value,rowIndex, e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <TextField
                        type="text"
                        required
                        name="chq_no"
                        value={data.chq_no || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("chq_no",e.target.value,rowIndex,e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <TextField
                        type="date"
                        required
                        name="chq_dt"
                        value={data.chq_dt || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("chq_dt",e.target.value,rowIndex, e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <TextField
                        type="text"
                        required
                        name="debit"
                        value={data.debit || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("debit",e.target.value,rowIndex, e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <TextField
                        type="text"
                        required
                        name="credit"
                        value={data.credit || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("credit",e.target.value,rowIndex, e)}                      
                        disabled
                      />
                    </td>
                    <td>
                    <Checkbox
                    onChange={(e) => handleChange( "total_flag", e.target.checked ? "Y" : "N", rowIndex)}
                    name="total_flag"
                    checked={data?.total_flag === "Y"}
                    />
                    </td>
                    <td>
                    <TextField
                        type="date"
                        required
                        name="reco_date1"
                        value={data.reco_date1 || ""} 
                        maxLength={30}
                        onChange={(e) =>handleChange("reco_date1",e.target.value,rowIndex, e)}                      
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </SimpleBar>
        </div>
      </Form>
      </Col>

     
      <Row className="">  
      <Col lg={4}>
       <TextArea
            label="Particulars"
            value={detailFormData.details || ""}
            onChange={(e) =>handleChange("details", e.target.value)}
        />
    </Col>
      {/* Below this row data is control block */}
    <Col lg={7} className="mt-2 ms-2">
    
    <Row className="d-flex align-items-center mb-1">
        <Col xs="auto">
            <span>Closing Balance as per Company Books as on above date</span>
        </Col>
        <Col >
            <TextField
                type="text"
                value={formData.cl_bal_cr || ""}
                onChange={(e) => handleChange("cl_bal_cr", e.target.value)}
                disabled
            />
        </Col>
        <Col >
            <TextField
                type="text"
                value={formData.cl_cr || ""}
                onChange={(e) => handleChange("cl_cr", e.target.value)}
                disabled
            />
        </Col>
    </Row>

    <Row className=" ">
        <Col xs="auto" className="ms-5">
            <span className="ms-4">Closing Balance as per Bank as on above date</span>
        </Col>
        <Col>
            <TextField
                type="text"
                value={formData.bank_bal1 || ""}
                onChange={(e) => handleChange("bank_bal1", e.target.value)}
                disabled
            />
        </Col>
        <Col>
            <TextField
                type="text"
                value={formData.bank_db_cr1 || ""}
                onChange={(e) => handleChange("bank_db_cr1", e.target.value)}
                disabled
            />
        </Col>
    </Row>
    <Row>
    <span style={{ color: "red" }}>** After Reco, effect can be viewed in next days balance</span>
</Row>

</Col>


      </Row>
      </Row>
  )
  
};

export default BankRecoEntryDetail;
