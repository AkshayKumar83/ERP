// WarehouseMasterMcRate.jsx
import React, { useEffect, useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { checkDuplicateMcRateWefDate, McRateHeader, onlyNumberKeyAllow } from "./warehouse_master_helper";
import toast from "react-hot-toast";

const WarehouseMasterMcRate = ({ mcRateData, handleChange, formStatus, triggerAddRow, handleChangeTab, wc_id, setMcRateData,  focusedRowIndex,
  setFocusedRowIndex,
 }) => {
  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = mcRateData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  useEffect(() => {
    if (focusedRowIndex !== -1) {
      const element = document.getElementById(`mc_hr_rate_${focusedRowIndex}`);
      if (element) {
        element.focus();
      }
    }
  }, [focusedRowIndex]);

  useEffect(() => {
    if (mcRateData.length > 0 && focusedRowIndex === mcRateData.length) {
      setFocusedRowIndex(mcRateData.length);
    }
  }, [mcRateData]);

  function handleDelete(deletedRow, rowIndex) {
    const updatedRows = mcRateData.filter((_, index) => index !== rowIndex);
    handleChange("mcRateData", "deleteRow", updatedRows);
    setFocusedRowIndex(0);
  }

  const handleValidateFieldMCRate = async (e, formStatus, rowIndex, ctid) => {
    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }

    const { name, value } = e.target;

    if (name === "mc_hr_rate") {
      const numericValue = Number(value);

      if (value === "" || value === null) {
        toast.error("Machine Hour Rate cannot be null");
        document.getElementById(`mc_hr_rate_${rowIndex}`).focus();
        setFocusedRowIndex(rowIndex);
        return;
      }

      if (numericValue === 0) {
        toast.error("Machine Hour Rate cannot be zero");
        document.getElementById(`mc_hr_rate_${rowIndex}`).focus();
        setFocusedRowIndex(rowIndex);
        return;
      }

      if (numericValue < 0) {
        toast.error("Machine Hour Rate cannot be less than one");
        document.getElementById(`mc_hr_rate_${rowIndex}`).focus();
        setFocusedRowIndex(rowIndex);
        return;
      }
    }

    if (name === "wef_date" && !value) {
      toast.error("Eff Date cannot be null");
      document.getElementById(`wef_date_${rowIndex}`).focus();
      setFocusedRowIndex(rowIndex);
      return;
    }

    if (name === "wef_date") {
      const updatedData = mcRateData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, wef_date: value };
        }
        return row;
      });

      const isDuplicateInForm = updatedData.some((row, index) => {
        return index !== rowIndex && row.wef_date === value;
      });

      if (isDuplicateInForm) {
        toast.error("Machine rate already defined with this Effective Date!");
        document.getElementById(`wef_date_${rowIndex}`).focus();
        setFocusedRowIndex(rowIndex);
        return;
      }

      const originalDate = mcRateData[rowIndex].wef_date;

      if (formStatus === "Update" && value !== originalDate) {
        const result = await checkDuplicateMcRateWefDate({
          wc_id: wc_id,
          wef_date: value,
          fin_engg: "E",
          ctid: ctid || null,
          formStatus: formStatus,
        });

        if (result.type === "error") {
          toast.error(result.message);
          document.getElementById(`wef_date_${rowIndex}`).focus();
          setFocusedRowIndex(rowIndex);
          return;
        }
      }
    }
  };

  return (
    <Row className="ms-4">
      <Col md={3} lg={3} className="mt-4">
        <Row className="mt-4">
          <Col lg={10} className="box-border bg-light text-black">
            <span>Machine Hour Rate Master</span>
          </Col>
        </Row>
        <Row className="mt-4 ms-4">
          <Col lg={6} className="mt-4">
            <ButtonUi
              outline
              onClick={() => handleChangeTab("Process")}
            >
              Main Screen
            </ButtonUi>
          </Col>
        </Row>
      </Col>
      <Col xs={12} md={8} xl={5}>
        <Form id="mc-rate" className="MC Rate-form">
          <div className="table-title">
            <span>Work Center MC_RATE</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi
                color="primary"
                className="add-action"
                onClick={() => {
                  triggerAddRow(); // Call triggerAddRow with "MC-Rate" already passed in WarehouseMasterMain
                  setFocusedRowIndex(mcRateData.length);
                }}
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
                      {(formStatus === "Insert" || formStatus === "Update") && <th className="">Actions</th>}
                      {McRateHeader.map((header, index) => (
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
                    {mcRateData.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                        style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}` }}
                        tabIndex={0}
                      >
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <td className="">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={mcRateData.length > 0}
                              onDelete={() => handleDelete(data, rowIndex)}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="mc_hr_rate"
                            id={`mc_hr_rate_${rowIndex}`}
                            value={data?.mc_hr_rate || ""}
                            onChange={(e) => handleChange("mcRateData", "mc_hr_rate", e.target.value, rowIndex, e)}
                            onBlur={(e) => handleValidateFieldMCRate(e, formStatus, rowIndex)}
                            onKeyDown = {(e)=> onlyNumberKeyAllow(e)}
                            required
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="date"
                            name="wef_date"
                            id={`wef_date_${rowIndex}`}
                            value={data?.wef_date || ""}
                            onChange={(e) => handleChange("mcRateData", "wef_date", e.target.value, rowIndex, e)}
                            onBlur={(e) => handleValidateFieldMCRate(e, formStatus, rowIndex, data?.ctid)}
                            required
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
      </Col>
    </Row>
  );
};

export default WarehouseMasterMcRate;