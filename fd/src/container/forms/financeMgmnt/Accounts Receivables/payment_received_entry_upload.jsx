import React from "react";
import { Row, Col, Table, Form } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import SimpleBar from "simplebar-react";
import { uploadHeaders } from "./payment_received_entry_helper";
import RowAction from "../../../../components/common/rowAction";

const PaymentReceivedEntryUpload = ({
  uploadFormData,
  formStatus,
  handleChange,
}) => {

  function triggerAddRow(){  
  }
  function handleDelete (){
  }
  function handleUpdate (){
  }

  

  return (
    <>
      <Row className="d-flex justify-content-around">
        <Col lg={3}>
          <Row className="mt-4">
            <ButtonUi type="button" color="dark" outline>
              UPLOAD DATA FROM CSV
            </ButtonUi>
          </Row>
          <Row className="mt-4">
            <ButtonUi type="button" color="dark" outline>
              SHOW UPLOADED DATA
            </ButtonUi>
          </Row>
          <Row className="mt-4">
            <ButtonUi type="button" color="dark" outline>
              Show Exceptions
            </ButtonUi>
          </Row>
        </Col>
        <Col lg={8}>
          <span style={{ fontWeight: "500" }}>While Uploading</span> <br />
          <span style={{ fontWeight: "500" }}>
            -Make Sure there is no comma/space/special characters in the CSV for
            uploading.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            -CSV should contain columns serial no, c_code, inv_no, inv_date,
            amount in the order as mentioned.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            -Column serial no. c_code, inv_no. should be in general format, inv
            date in text format (dd-mm-yyyy) eg[14-01-2020].
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            -There should not be any blank/null columns in the CSV for
            uploading.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            -Serial Number should be integer.
          </span>
          <br />
          <span style={{ fontWeight: "500" }}>
            -Once data verified and uploaded from CSV successfully, then press
            'Generate Receipts', once updation completed, system shall display
            'payment receipt entry generated and O/S generated and then press
            save.'
          </span>
        </Col>
      </Row>

      <Row className="mt-2">
        <strong className="text-end">
          FORM WILL ONLY WORK IN UPDATION MODE
        </strong>
      </Row>

      <Row>
        <Col>
          <div
            lg={12}
            className=" text-wrapper upload-customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2" 
             >
            <span className="text-label">
              Upload Customer payment(Bank Receipts)
            </span>
            <Row>
              <Col md={4} lg={4}>
                <TextField
                  type="text"
                  label="Bank Rcpt Voucher No"
                  value={uploadFormData[0]?.voucher_no || ""}
                  onChange={(e) =>
                    handleChange("voucher_no", e.target.value,0,e)
                  }
                />
              </Col>
              <Col md={4} lg={4} className="mt-4">
                <TextField
                  type="text"
                  //   label="Name"
                  value={uploadFormData[0]?.bank_name || ""}
                  onChange={(e) => handleChange("bank_name", e.target.value,0,e)}
                  disabled
                />
              </Col>
              <Col md={4} lg={4} className="">
                <TextField
                  type="text"
                  label="FIle Name Selected"
                  value={uploadFormData[0]?.file_name || ""}
                  onChange={(e) => handleChange("file_name", e.target.value ,0,e)}
                   disabled
                />
              </Col>
            </Row>
            <Form id="GST-debit-credit-note" className=" mt-4">
              <div className="table-title">
                <span>Payment Received Entry Uploaded</span>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <ButtonUi
                    color="primary"
                    className="add-action"
                    onClick={triggerAddRow}
                  >
                    Add Row
                  </ButtonUi>
                )}
              </div>

              <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="">Actions</th>
                        )}
                        {uploadHeaders.map((header, index) => (
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
                      {uploadFormData.map((data, rowIndex) => (
                        <tr key={rowIndex}>
                                              {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td className="">
                             <RowAction
                                 formStatus={formStatus}
                                 canDelete={uploadFormData.length > 1}
                                 onDelete={() => handleDelete(data, rowIndex)}
                                 onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                             />
                         </td>
                    }        
                          <td className=" table_cell">
                            <TextField
                              type="text"
                              required
                              name="rec_id"
                              value={data.rec_id || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("rec_id",e.target.value,rowIndex,e)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="c_code"
                              value={data.c_code || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("c_code",e.target.value,rowIndex,e)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="c_name"
                              value={data.c_name || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("c_name",e.target.value,rowIndex,e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="inv_no"
                              value={data.inv_no || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("inv_no",e.target.value,rowIndex,e)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              required
                              name="inv_dt"
                              value={data.inv_dt || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("inv_dt",e.target.value,rowIndex,e)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="amount"
                              value={data.amount || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("amount",e.target.value,rowIndex,e)}
                              disabled
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>  </div>
                </SimpleBar>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default PaymentReceivedEntryUpload;
