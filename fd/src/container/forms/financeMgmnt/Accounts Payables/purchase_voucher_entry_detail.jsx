import React, { useState } from "react";
import { Card, Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { headers } from "./purchase_voucher_entry_helper";
import Select from "../../../../components/basic/select";
import RadioGroup from "../../../../components/basic/radioGroup";
import { formatTwoDecimal } from "../../../../utils/fn";

const PurchaseVoucherEntryDetail = ({
  detailData,
  restDetailData,
  handleChange,
  formStatus,
  triggerAddRow,
  purpose,
  focusedRowIndex,
  setFocusedRowIndex,
}) => {

  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  function handleDelete() {}
  function handleUpdate() {}

  return (
    <>
      <Form id="purchase-voucher-entry">
        {/* <div className="table-title">
          <span>Purchase Voucher Entry</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi
              color="primary"
              className="add-action"
              onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div> */}
      <div className="table-wrapper-v3 mt-3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper height-150'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
                  )}
                  {headers.map((header, index) => (
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
                {detailData.map((data, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                <tr
                   key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                  style={{
                            borderTop: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                            borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                            borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                            borderBottom: "none"
                        }}
                  tabIndex={0}
                  >
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={detailData.length > 1}
                          onDelete={() => handleDelete(data, rowIndex)}
                          onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined
                          }
                        />
                      </td>
                    )}
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="remarks"
                        value={data.remarks || ""}
                        maxLength={30}
                        onChange={(e) =>
                        handleChange("detailData","remarks",e.target.value,rowIndex)}
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="acc_no"
                        value={data.acc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","acc_no",e.target.value,rowIndex)}
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="bill_no"
                        value={data.bill_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","bill_no",e.target.value,rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="bill_dt"
                        value={data.bill_dt || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","bill_dt",e.target.value,rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        // required
                        name="cost"
                        value={data.cost || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","cost", e.target.value, rowIndex)
                        }
                      />
                    </td>
                    <td>
                      <Select
                          name="pur_code"
                          value={data.pur_code || ""}
                          onChange={(e) =>handleChange(e, "pur_code", e.target.value, rowIndex)}
                          options={purpose}
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        style={{ textAlign: "right" }}
                        type="text"
                        required
                        name="amount"
                        // value={data.amount || ""}
                        value = {formatTwoDecimal(data.amount)}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","amount",e.target.value,rowIndex)}
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="db_cr"
                        value={data.db_cr || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("detailData","db_cr",e.target.value,rowIndex)}
                        disabled
                      />
                    </td>
                  </tr>
                  <tr 
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                      style={{
                          borderBottom: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderTop: "none" 
                      }}
                      tabIndex={0}
                  >
                    <td colSpan={4}>
                        <TextField
                            type="text"
                            name="acc_desc"
                            value={data.acc_desc || ""}
                            onChange={(e) =>handleChange(e, "acc_desc", e.target.value, rowIndex)}
                            disabled
                        />
                    </td>
                    <td colSpan={5}>
                        <TextField
                            type="text"
                            name="cost_desc"
                            value={data.cost_desc || ""}
                            onChange={(e) => handleChange(e, "cost_desc", e.target.value,rowIndex)}
                            disabled
                        />
                    </td>
                  </tr>
                  </React.Fragment>
               
                  
                ))}
              </tbody>
            </Table> </div>
          </SimpleBar>
        </div>
      </Form>
        <div className="my-2">
          <Row>
           
            <Col xl={7} >
            <Card className="p-2">
            <Row className="">
              <Col md={2} lg={2}>
                <TextField
                  type="number"
                  label="TDS %"
                  value={detailData[focusedRowIndex]?.tds_perc || ""}
                  onChange={(e) =>handleChange("detailData","tds_perc", e.target.value, focusedRowIndex, e)
                  }
                  disabled
                />
              </Col>
              <Col md={4} lg={2}>
                <TextField
                  type="number"
                  label="TDS Amount"
                  value={detailData[focusedRowIndex]?.tds_amt || ""}
                  onChange={(e) => handleChange("detailData","tds_amt", e.target.value, focusedRowIndex, e)
                  }
                  disabled
                />
              </Col>
              <Col md={3} lg={2}>
                <TextField
                  type="number"
                  label="TDS Cr Amount"
                  value={detailData[focusedRowIndex]?.tds_cr_amt || ""}
                  onChange={(e) => handleChange("detailData","tds_cr_amt", e.target.value, focusedRowIndex, e)}
                  disabled
                />
              </Col>
              <Col md={2} lg={2}>
                <TextField
                  type="number"
                  label="Surch %"
                  value={detailData[focusedRowIndex]?.tds_sur_perc || ""}
                  onChange={(e) => handleChange("detailData","tds_sur_perc", e.target.value, focusedRowIndex, e)
                  }
                  disabled
                />
              </Col>
              <Col md={4} lg={3}>
                <TextField
                  type="number"
                  label="Surchage Amount"
                  value={detailData[focusedRowIndex]?.tds_sur_amt || ""}
                  onChange={(e) =>handleChange("detailData","tds_sur_amt", e.target.value, focusedRowIndex, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="">
              <Col md={2} lg={2}>
                <TextField
                  type="number"
                  label="Cess %"
                  value={detailData[focusedRowIndex]?.tds_cess_perc || ""}
                  onChange={(e) => handleChange( "detailData","tds_cess_perc", e.target.value, focusedRowIndex, e ) }
                  disabled
                />
              </Col>
              <Col md={4} lg={3}>
                <TextField
                  type="number"
                  label="Cess Amount"
                  value={detailData[focusedRowIndex]?.tds_cess_amt || ""}
                  onChange={(e) =>handleChange("detailData","tds_cess_amt", e.target.value, focusedRowIndex, e)}
                  disabled
                />
              </Col>
              <Col md={2} lg={2}>
                <TextField
                  type="number"
                  label="Hsc %"
                  value={detailData[focusedRowIndex]?.tds_hsc_perc || ""}
                  onChange={(e) =>handleChange("detailData","tds_hsc_perc", e.target.value, focusedRowIndex, e)}
                  disabled
                />
              </Col>
              <Col md={4} lg={3}>
                <TextField
                  type="number"
                  label="Hsc Amount"
                  value={detailData[focusedRowIndex]?.tds_hsc_amt || ""}
                  onChange={(e) =>handleChange("detailData","tds_hsc_amt", e.target.value, focusedRowIndex, e)}
                  disabled
                />
              </Col>
            </Row>

            </Card>
            </Col>
            <Col xl={5}>
              <Row className="">
                <Col lg={12}>
                  <div className="text-wrapper box border mt-1">
                    <span className="text-label">Sales Tax</span>
                    <Row className="mb-2 mt-1 justify-content">
                      <Col md={1} lg={2} className="mt-auto  text-end">
                        <span>Type</span>
                      </Col>
                      <Col md={3} lg={4}>
                        <RadioGroup
                          className=" radio-button-wrapper box border"
                          options={[
                            { text: "Local", value: "L" },
                            { text: "Central", value: "C" },
                          ]}
                          onChange={(e) => handleChange("restDetailData","st_flag", e.target.value)}
                          checked={restDetailData?.st_flag || " "}
                        />
                      </Col>
                      <Col md={2} lg={3}>
                        <TextField
                          type="text"
                          // label="Form"
                          placeholder={'Form'}
                          value={restDetailData.st_form || ""}
                          onChange={(e) => handleChange("restDetailData","st_form", e.target.value)}
                          disabled
                        />
                      </Col>
                      <Col md={2} lg={3}>
                        <TextField
                          type="text"
                          // label="%"
                          placeholder={'%'}
                          value={restDetailData.st_perc || ""}
                          onChange={(e) => handleChange("restDetailData", "st_perc", e.target.value)}
                          disabled
                        />
                      </Col>
                      {/* <Col md={2} lg={3}>
                        <TextField
                          type="text"
                          label="Taxable Amt."
                          value={restDetailData.trans_amt || ""}
                          onChange={(e) =>handleChange("restDetailData", "trans_amt", e.target.value)
                          }
                        />
                      </Col> */}
                    </Row>
                  </div>
                </Col>
                {/* <Col lg={4}>
                  <Row className="mt-4 ms-4">
                    <Col lg={4}>
                      <ButtonUi outline disabled>HST</ButtonUi>
                    </Col>
                    <Col lg={4}>
                      <ButtonUi outline>TDS</ButtonUi>
                    </Col>
                  </Row>
                </Col> */}
              </Row>
              <Row className="">
              <Col md={3} lg={4}>
                <Select
                  type="text"
                  label="Register Type"
                  value={detailData[focusedRowIndex]?.register_type || ""}
                  onChange={(e) => handleChange( "detailData","register_type", e.target.value, focusedRowIndex, e ) }
                />
              </Col>
              <Col md={2} lg={2}>
                <TextField
                  type="text"
                  label="Sr No"
                  value={detailData[focusedRowIndex]?.sno || ""}
                  onChange={(e) =>
                    handleChange("detailData","sno", e.target.value, focusedRowIndex, e)
                  }
                />
              </Col>
              <Col md={3} lg={4}>
                <TextField
                  type="date"
                  label="Date"
                  value={detailData[focusedRowIndex]?.credit_date || ""}
                  onChange={(e) =>
                    handleChange( "detailData","credit_date", e.target.value, focusedRowIndex, e)
                  }
                  disabled
                />
              </Col>
            </Row>
            </Col>
          </Row>
        </div>
      

      {/* <Row className="">
        <Col lg={8}>
          <div className="text-wrapper box border mt-2">
            <span className="text-label">Sales Tax</span>
            <Row className="mb-2 mt-1 justify-content">
              <Col md={1} lg={1} className="mt-lg-3 mt-md-3 ms-4">
                <span>Type</span>
              </Col>
              <Col md={3} lg={3}>
                <RadioGroup
                  className=" mt-3 radio-button-wrapper box border"
                  options={[
                    { text: "Local", value: "L" },
                    { text: "Central", value: "C" },
                  ]}
                  onChange={(e) => handleChange("restDetailData","st_flag", e.target.value)}
                  checked={restDetailData?.st_flag || " "}
                />
              </Col>
              <Col md={2} lg={2}>
                <TextField
                  type="text"
                  label="Form"
                  value={restDetailData.st_form || ""}
                  onChange={(e) => handleChange("restDetailData","st_form", e.target.value)}
                  disabled
                />
              </Col>
              <Col md={2} lg={2}>
                <TextField
                  type="text"
                  label="%"
                  value={restDetailData.st_perc || ""}
                  onChange={(e) => handleChange("restDetailData", "st_perc", e.target.value)}
                  disabled
                />
              </Col>
              <Col md={2} lg={3}>
                <TextField
                  type="text"
                  label="Taxable Amt."
                  value={restDetailData.trans_amt || ""}
                  onChange={(e) =>handleChange("restDetailData", "trans_amt", e.target.value)
                  }
                />
              </Col>
            </Row>
          </div>
        </Col>
        <Col lg={4}>
          <Row className="mt-4 ms-4">
            <Col lg={4}>
              <ButtonUi outline disabled>HST</ButtonUi>
            </Col>
            <Col lg={4}>
              <ButtonUi outline>TDS</ButtonUi>
            </Col>
          </Row>
        </Col>
      </Row> */}
    </>
  );
};

export default PurchaseVoucherEntryDetail;
