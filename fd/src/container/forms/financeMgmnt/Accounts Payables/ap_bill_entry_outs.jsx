import React, { useState } from "react";
import { Form, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { apbillentryOutsHeader } from "./ap_bill_entry_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";

const ApBillOuts = ({
  formData,
  handleChange = () => {},
  formStatus,
  triggerAddRow = () => {},
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleDelete() {}
  function handleUpdate() {}
  return (
    <Form id="ap-bill-outs">
      <div className="table-title">
        <span>On Acc</span>
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
          <div className="table-sticky-wrapper">
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
                  )}
                  {apbillentryOutsHeader.map((header, index) => (
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
                {formData.map((data, rowIndex) => (
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
                          canDelete={detailData.length > 1}
                          onDelete={() => handleDelete(data, rowIndex)}
                        //   onUpdate={
                        //     handleUpdate ? () => handleUpdate(data) : undefined
                        //   }
                        />
                      </td>
                    )}
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="voucher_no"
                        value={data.voucher_no || ""}
                        onChange={(e) =>handleChange("detailData", "voucher_no", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        onChange={(e) =>handleChange("detailData", "doc_no", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        onChange={(e) =>handleChange("detailData", "doc_dt", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="po_no"
                        value={data.po_no || ""}
                        onChange={(e) =>handleChange("detailData", "po_no", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="number"
                        required
                        name="amount"
                        value={data.amount || ""}
                        onChange={(e) =>handleChange("detailData", "amount", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="db_cr"
                        value={data.db_cr || ""}
                        onChange={(e) =>handleChange("detailData", "db_cr", e.target.value, rowIndex)}
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
    </Form>
  );
};

export default ApBillOuts;
