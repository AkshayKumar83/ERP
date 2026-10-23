import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import { additionTapHeaders } from "./payment_advise_helper";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";

const PaymentAdviseAditionTab = ({
  additionFormData,
  handleChange,
  triggerAddRow,
  formStatus,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = additionFormData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };
  function handleDelete() {}
  function handleUpdate() {}

  return (
    <Row>
      <Form id="purchase-voucher-entry" className="">
        <div className="table-title">
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
        </div>
        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
                  )}
                  {additionTapHeaders.map((header, index) => (
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
                {additionFormData.map((data, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                    style={{
                      border: `${
                        rowIndex === focusedRowIndex
                          ? "2px solid black"
                          : "none"
                      }`,
                    }}
                    tabIndex={0}
                  >
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={additionFormData.length > 1}
                          onDelete={() => handleDelete(data, rowIndex)}
                          onUpdate={
                            handleUpdate ? () => handleUpdate(data) : undefined
                          }
                        />
                      </td>
                    )}
                    <td className=" table_cell">
                      <TextField
                        type="text"
                        required
                        name="remarks"
                        value={data.remarks || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("remarks", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="acc_no"
                        value={data.acc_no || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("acc_no", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("doc_no", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("doc_dt", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="amount"
                        value={data.amount || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("amount", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="db_cr"
                        value={data.db_cr || ""}
                        maxLength={30}
                        onChange={(e) =>
                          handleChange("db_cr", e.target.value, rowIndex, e)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>  </div>
          </SimpleBar>
        </div>
      </Form>

      <Row className="d-flex justify-content-end">
        <Col xl={2}>
          <ButtonUi color="primary" outline>
            TDS Entry
          </ButtonUi>
        </Col>
      </Row>

      <Row>
        <Col lg={2}>
          <TextField
            type="text"
            label="TDS Credit Amount"
            value={additionFormData.tds_cr_amt || ""}
            onChange={(e) =>
              handleChange("tds_cr_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Sur %"
            value={additionFormData.tds_sur_perc || ""}
            onChange={(e) =>
              handleChange("tds_sur_perc", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Cess %"
            value={additionFormData.tds_cess_perc || ""}
            onChange={(e) =>
              handleChange("tds_cess_perc", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col lg={2}>
          <TextField
            type="text"
            label="TDS %"
            value={additionFormData.tds_perc || ""}
            onChange={(e) =>
              handleChange("tds_perc", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Sur Amount"
            value={additionFormData.tds_sur_amt || ""}
            onChange={(e) =>
              handleChange("tds_sur_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Cess Amount"
            value={additionFormData.tds_cess_amt || ""}
            onChange={(e) =>
              handleChange("tds_cess_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col lg={2}>
          <TextField
            type="text"
            label="TDS Amount"
            value={additionFormData.tds_amt || ""}
            onChange={(e) =>
              handleChange("tds_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="HSC Perc"
            value={additionFormData.tds_hsc_perc || ""}
            onChange={(e) =>
              handleChange("tds_hsc_perc", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="HSC Amt"
            value={additionFormData.tds_hsc_amt || ""}
            onChange={(e) =>
              handleChange("tds_hsc_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col lg={6}>
          <TextField
            type="text"
            label="Acc Desc"
            value={additionFormData.acc_name || ""}
            onChange={(e) =>
              handleChange("acc_name", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Debit Total"
            value={additionFormData.total_db_amt || ""}
            onChange={(e) =>
              handleChange("total_db_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col lg={2}>
          <TextField
            type="text"
            label="Credit Total"
            value={additionFormData.total_cr_amt || ""}
            onChange={(e) =>
              handleChange("total_cr_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>
    </Row>
  );
};

export default PaymentAdviseAditionTab;

{
  /*

<td className="table_cell">
<TextField
  type="text"
  required
  name="db_cr"
  value={data.db_cr || ""}                    
  maxLength={30}
  onChange={(e) =>
  handleChange("db_cr", e.target.value, rowIndex,e )} 
  disabled 
 />
</td>
<td className="table_cell">
<TextField
  type="text"
  required
  name="total_cr_amt"
  value={data.total_cr_amt || ""}                    
  maxLength={30}
  onChange={(e) =>
  handleChange("total_cr_amt", e.target.value, rowIndex,e )}
  disabled 

 />
</td> */
}
