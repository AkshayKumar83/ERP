import { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { getFormattedCurrentDate, headers } from "./account_wise_dtl_entry_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { formatTwoDecimal } from "../../../../utils/fn";

const AccWiseDtlEntryDtl = ({
  handleChange,
  formData = {},
  formStatus,
  detailFormData = [{}],
  triggerAddRow,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailFormData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  const handleDelete = (data, rowIndex) => {
    // Filter out the row to be deleted
    const newDetailFormData = detailFormData.filter((_, index) => index !== rowIndex);
    // Update detailFormData via a prop callback (you'll need to pass setDetailFormData as a prop)
    // For now, log to verify
    //console.log("Deleting row:", data);
  };

  const handleUpdate = (data, rowIndex) => {
  };

  return (
    <Form>
      <Row>
        <Col>
          <div className="mt-4">
            <div className="table-title">
              {/* <span></span> */}
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
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
                      {detailFormData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                          style={{
                            border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <td className="table_cell">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={detailFormData.length > 1}
                                onDelete={() => handleDelete(data, rowIndex)}
                                onUpdate={data.id ? () => handleUpdate(data, rowIndex) : undefined}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="voucher_no"
                              value={data?.voucher_no || ""}
                              onChange={(e) =>handleChange("detailFormData", "voucher_no", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              name="voucher_dt"
                              value={data?.voucher_dt || ""}
                              onChange={(e) =>handleChange("detailFormData", "voucher_dt", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="ref_no"
                              value={data?.ref_no || ""}
                              // maxLength={30}
                              onChange={(e) =>handleChange("detailFormData", "ref_no", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              name="ref_date"
                              value={data?.ref_date || ""}
                              // maxLength={30}
                              onChange={(e) =>handleChange("detailFormData", "ref_date", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          {/* <td className="table_cell">
                            <TextField
                              type="text"
                              name="db_cr"
                              value={data?.db_cr || ""}
                              onChange={(e) =>handleChange("detailFormData", "db_cr", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td> */}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="type"
                              value={data?.type || ""}
                              onChange={(e) =>handleChange("detailFormData", "type", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          {/* <td className="table_cell">
                            <TextField
                              type="text"
                              name="project_no"
                              value={data?.project_no || ""}
                              onChange={(e) =>handleChange("detailFormData", "project_no", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td> */}
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="db_amount"
                              value={String(data?.db_amount) || ""}
                              onChange={(e) =>handleChange("detailFormData", "db_amount", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="cr_amount"
                              value={String(data?.cr_amount) || ""}
                              onChange={(e) =>handleChange("detailFormData", "cr_amount", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="balance"
                              value={String(data?.balance) || ""}
                              onChange={(e) =>handleChange("detailFormData", "balance", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="bal_dbcr"
                              value={data?.bal_dbcr || ""}
                              onChange={(e) =>handleChange("detailFormData", "bal_dbcr", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="posted"
                              value={String(data?.posted) || ""}
                              onChange={(e) =>handleChange("detailFormData", "posted", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col sm={5} md={4} lg={7}>
        <Row>
            <Col sm={5} md={4} lg={8}>
                <TextField
                    type="text"
                    label="Party Name"
                    name="ser_party_name"
                    value={detailFormData[focusedRowIndex]?.ser_party_name || detailFormData[focusedRowIndex]?.party_reference || ""}
                    onChange={(e) =>handleChange("detailFormData", "ser_party_name", e.target.value, focusedRowIndex, e)}
                    disabled
                />
            </Col>
            <Col sm={5} md={4} lg={2}>
                <TextField
                    type="text"
                    label="Bill No"
                    name="bill_no"
                    value={detailFormData[focusedRowIndex]?.bill_no || ""}
                    onChange={(e) =>handleChange("detailFormData", "bill_no", e.target.value, focusedRowIndex, e)}
                    disabled
                />
            </Col>
            <Col sm={5} md={4} lg={2}>
                <TextField
                    type="date"
                    label="Bill Date"
                    name="bill_dt"
                    value={detailFormData[focusedRowIndex]?.bill_dt || ""}
                    onChange={(e) =>
                    handleChange("detailFormData", "bill_dt", e.target.value, focusedRowIndex, e)}
                    disabled
                />
            </Col>
        </Row>
        </Col>
        <Col sm={5} md={4} lg={2} className="">
            <TextField
              type="number"
              label="Total Debit Amt."
              name="db_total"
              value={formatTwoDecimal(formData?.db_total)}
              onChange={(e) => handleChange("db_total", e.target.value, null, null, e)}
              disabled
            />
        </Col>
        <Col sm={5} md={4} lg={2} className="">
            <TextField
              type="number"
              label="Total Credit Amt."
              name="cr_total"
              value={formatTwoDecimal(formData?.cr_total)}
              onChange={(e) => handleChange("cr_total", e.target.value, null, null, e)}
              disabled
            />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={5} md={4} lg={6}>
          <TextField
            type="text"
            label="Narration"
            name="remarks"
            disabled
            value={detailFormData[focusedRowIndex]?.remarks || ""}
            onChange={(e) =>handleChange("detailFormData", "remarks", e.target.value, focusedRowIndex, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
          disabled
            type="text"
            label="Bill Log No"
            name="bill_log_no"
            value={detailFormData[focusedRowIndex]?.bill_log_no || ""}
            onChange={(e) =>handleChange("detailFormData", "bill_log_no", e.target.value, focusedRowIndex, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
          disabled
            type="text"
            label="Cheque No"
            name="chq_no"
            value={detailFormData[focusedRowIndex]?.chq_no || ""}
            onChange={(e) =>handleChange("detailFormData", "chq_no", e.target.value, focusedRowIndex, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
          disabled
            type="date"
            label="Cheque Date"
            name="chq_dt"
            value={detailFormData[focusedRowIndex]?.chq_dt || ""}
            onChange={(e) =>handleChange("detailFormData", "chq_dt", e.target.value, focusedRowIndex, e)}
          />
        </Col>
      </Row>
        </Form>
      );
    };
    
    export default AccWiseDtlEntryDtl;