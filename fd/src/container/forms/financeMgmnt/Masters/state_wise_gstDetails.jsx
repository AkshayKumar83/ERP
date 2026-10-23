import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, Row, Col, Card, Table } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { stateWiseGstInitialData, headers, HSNHelpListHeader, HSNHelpListHeaderForSearch } from "./state_wise_gst_helpers";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const StateWiseGstDetails = ({
  formData = [{}],
  formStatus,
  handleAddRow,
  handleDelete,
  handleChange,
  stateList = [],
  hsnSacCodeList = [],
  validatePercFieldOnAddRec,
  validateRecordOnAdd,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
   currentPage,
  totalRecordCount,
  pageSize = 20,
  onPrev,
  onNext,
}) => {
  //console.log("formData:", formData);
  const tableContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop =
        tableContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (formStatus !== "Query") {
      scrollToBottom();
    }
  }, [formData.length, formStatus, scrollToBottom]);  

   const [focusedRowIndex, setFocusedRowIndex] = useState(0);  

   const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };


   const handleDoubleClick = (field, header, rowIndex) => {
    if (["Insert", "Search", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true, rowIndex);
    }
  };
  

  // ADD NEW ROW
  const triggerAddRow = useCallback(async () => {
    // //console.log('add row clicked')
    const isValidForm = validateForm(
      "state-wise-gst-form",
      "State Wise Gst Form"
    );
    if (!isValidForm) {
      return;
    }
    const isValidPercField = validatePercFieldOnAddRec(formData);
    if (!isValidPercField) {
      toast.error("this validation perc failed");
      return;
    }
    //console.log('validate form')

    // for check getValidateData 
    if (formStatus === "Update") {
      const isChecked =
        formData[focusedRowIndex]?.init_hsn_sac_code === formData[focusedRowIndex]?.hsn_sac_code &&
        formData[focusedRowIndex]?.init_eff_dt === formData[focusedRowIndex]?.eff_dt &&
        formData[focusedRowIndex]?.init_sal_or_st === formData[focusedRowIndex]?.sal_or_st;


      if (!isChecked) {
        const isValidCurrRecord = await validateRecordOnAdd(formData, focusedRowIndex, formStatus);
        if (!isValidCurrRecord) {
          return;
        }

      }
    }
    else {

      const isValidCurrRecord = await validateRecordOnAdd(formData, formData.length - 1, formStatus);
      if (!isValidCurrRecord) {
        return;
      }
    }

    // const isValidCurrRecord = await validateRecordOnAdd(formData, formData.length - 1, formStatus);
    // if (!isValidCurrRecord) {
    //   return;
    // }  



    // //console.log('getvalidate')
    handleAddRow();
  }, [handleAddRow, formStatus,]);

  //   // ADD NEW ROW
  // const triggerAddRow = useCallback(async () => { 
  //   //console.log('add row clicked');

  //   // 1. Validate full form
  //   const isValidForm = validateForm("state-wise-gst-form", "State Wise Gst Form");
  //   if (!isValidForm) {
  //     //console.log("Form validation failed");
  //   //  toast.error("Please fill all the required fields in State Wise GST Form");
  //     return;
  //   }

  //   // 2. Validate percentage field
  //   const isValidPercField = validatePercFieldOnAddRec(formData);
  //   if (!isValidPercField) {
  //     //console.log("Percentage field validation failed");
  //    // toast.error("Percentage validation failed. Please check the GST % fields.");
  //     return;
  //   } 
  //  // //console.log("validate form passed");

  //   // 4. Validate current record
  //   const isValidCurrRecord = await validateRecordOnAdd(
  //     formData,
  //     formData.length - 1,
  //     formStatus
  //   );
  //   if (!isValidCurrRecord) {
  //     //console.log("Record validation failed");
  //    // toast.error("Record validation failed. Please check the current row.");
  //     return;
  //   }

  //   // 5. Add row

  //   handleAddRow();
  // }, [ formStatus, handleAddRow]);


  const validateRequiredField = (e, fieldLabel) => {
    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  const validateField = async (e, formData, rowIndex, formStatus) => {
    if (!["Insert", "Update"].includes(formStatus)) return;
    //console.log('update', formStatus)

    //console.log('gst st code', formData[rowIndex]?.gst_state_code)

    const isEmpty = (val) =>
      val === null ||
      val === undefined ||
      (typeof val === "string" && val.trim() === "");

    const currentRow = formData[rowIndex];

    if (
      // isEmpty(currentRow?.gst_state_code) ||
      isEmpty(currentRow?.hsn_sac_code) ||
      isEmpty(currentRow?.eff_dt) ||
      isEmpty(currentRow?.sal_or_st) ||
      isEmpty(currentRow?.amount_from) ||
      isEmpty(currentRow?.amount_to)
    ) {
      // toast.error("Please fill all required fields before validation.");
      // //console.log(
      //   // currentRow?.gst_state_code,
      //   currentRow?.hsn_sac_code,
      //   currentRow?.eff_dt,
      //   currentRow?.sal_or_st,
      //   currentRow?.amount_from,
      //   currentRow?.amount_to
      // );
      return;
    }



    try {
      const isValid = await validateRecordOnAdd(formData, rowIndex, formStatus);
      //console.log('validate record')

      if (!isValid) {
        e.target.focus();
        return;
      }

    } catch (error) {
      console.error("Validation error:", error);
    }
  };



  const handleQtyError = (data) => {
    if (data < 0 || data > 100) {
      toast.error("Percentage value can not be negative or greater than 100");
      return true;
    }
    return false;
  };

  return (
    <React.Fragment>
      <Card className="mb-2 p-1 shadow-sm">
        <Form id="state-wise-gst-form">
          {/* <div className="table-title">
      
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
         <div className="table-title">
           
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
                  Add Row
                </ButtonUi>
              )}
          
              {/* Pagination — show only in Query/Update/Search */}
              {["Query"].includes(formStatus) && (
                <>
                  <ButtonUi
                    color="secondary"
                    disabled={currentPage <= 1}
                    onClick={onPrev}
                   style={{ fontSize: "13px", padding: "2px 8px" }}
          
                  >
                    ← Prev
                  </ButtonUi>
          
                  <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRecordCount)} of {totalRecordCount} records
                   || Page {currentPage} / {Math.ceil(totalRecordCount / pageSize) || 1}
                  </span>
          
                  <ButtonUi
                    color="secondary"
                    disabled={currentPage >= Math.ceil(totalRecordCount / pageSize)}
                    onClick={onNext}
                    style={{ fontSize: "13px", padding: "2px 8px" }}
                  >
                    Next →
                  </ButtonUi>
                </>
              )}
            </div>
          </div>
          <div className="table-wrapper-v3">
            <SimpleBar forceVisible="y" autoHide={false}>
              <div className="table-sticky-wrapper height-auto">
                <Table hover>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th
                          style={{ width: "80px" }}
                          className="sticky-column left"
                        >
                          Actions
                        </th>
                      )}
                      {headers.map((header, index) => (
                        <th
                          key={index} 
                          data-required={header.required || false}
                          style={{
                            whiteSpace: "nowrap",
                            width: header.width,
                            minWidth: header.width,
                            maxWidth: header.width,
                          }}
                        >
                          {header.label}
                          {header.required && (
                            <span className="required-asterisk"> *</span>
                          )}
                           {header.isHelpExist && <FcInfo title="Info" />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData?.map((data, rowIndex) => (
                      <React.Fragment key={`row-${rowIndex}`}>
                        <tr  
                           onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                        style={{
                          border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                        }} 
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                              <td className="sticky-column left">
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={formData.length > 0}
                                  onDelete={() => handleDelete(data)}
                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                />
                              </td>
                            )}

                          <td className="table_cell">
                            <Select
                              type="text"
                              name={`gst_state_code${rowIndex}_1`}
                              value={data?.gst_state_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "gst_state_code",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              options={stateList}
                              onBlur={(e) => validateField(e, formData, rowIndex, formStatus)}

                            // required
                            />
                          </td>
                          {/* <td className="table_cell">
                            <Select
                              type="text"
                              name={`hsn_sac_code_${rowIndex}_1`}
                              value={data?.hsn_sac_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "hsn_sac_code",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              onBlur={(e) => {
                                validateRequiredField(e, "HSN SAC code")
                                validateField(e, formData, rowIndex, formStatus)
                              }

                              }
                              options={hsnSacCodeList}
                              required
                            />
                          </td> */}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name={`hsn_sac_code_${rowIndex}_1`}
                              value={data?.hsn_sac_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "hsn_sac_code",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              onBlur={(e) => {
                                validateRequiredField(e, "HSN SAC code")
                                validateField(e, formData, rowIndex, formStatus)
                              }

                              }
                              // onDoubleClick={() =>
                              //   handleDoubleClick(
                              //     "HSNCode",
                              //     HSNHelpListHeader,
                              //     rowIndex
                              //   )
                              //   }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "HSNCode",
                                  HSNHelpListHeaderForSearch,
                                  rowIndex
                                )
                                }
                                required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`sgst_perc_${rowIndex}_1`}
                              value={data?.sgst_perc ?? ""}
                              //min={0}
                              //  max={100}
                              maxLength={2}
                              onChange={(e) =>
                                handleChange(
                                  "sgst_perc",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              //   onBlur={(e) =>
                              //     validateRequiredField(e, "SGST perc")
                              //   }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.sgst_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "sgst_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      1
                                    );
                                  }

                                  validateRequiredField(e, "SGST perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                              required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`cgst_perc_${rowIndex}_1`}
                              value={data?.cgst_perc ?? ""}
                              // step="0.1"
                              // min={0}
                              // max={100}
                              onChange={(e) =>
                                handleChange(
                                  "cgst_perc",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              //   onBlur={(e) =>
                              //     validateRequiredField(e, "CGST perc")
                              //   }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.cgst_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "cgst_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      1
                                    );
                                  }

                                  validateRequiredField(e, "CGST perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                              required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`igst_perc_${rowIndex}_1`}
                              value={data?.igst_perc ?? ""}
                              //step="0.1"
                              //min={0}
                              //max={100}
                              onChange={(e) =>
                                handleChange(
                                  "igst_perc",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              //   onBlur={(e) =>
                              //     validateRequiredField(e, "IGST perc")
                              //   }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.igst_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "igst_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      1
                                    );
                                  }

                                  validateRequiredField(e, "IGST perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                              required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`ugst_perc_${rowIndex}_1`}
                              value={data?.ugst_perc ?? ""}
                              // step="0.1"
                              // min={0}
                              //max={100}
                              onChange={(e) =>
                                handleChange(
                                  "ugst_perc",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              //   onBlur={(e) =>
                              //     validateRequiredField(e, "UGST perc")
                              //   }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.ugst_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "ugst_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      1
                                    );
                                  }

                                  validateRequiredField(e, "UGST perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                              required
                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`amount_from_${rowIndex}_1`}
                              value={data?.amount_from ?? ""}
                              // step="0.1"
                              //min={0}
                              onChange={(e) =>
                                handleChange(
                                  "amount_from",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              onBlur={(e) => {

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.amount_from);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "amount_from",
                                      val?.toFixed(2),
                                      rowIndex,
                                      1
                                    );
                                  }

                                  validateRequiredField(e, "amount from")
                                  validateField(e, formData, rowIndex, formStatus)
                                }
                              }

                              }
                              required
                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="date"
                              name={`eff_dt_${rowIndex}_1`}
                              value={data?.eff_dt || ""}
                              // step="0.1"
                              //min={0}
                              onChange={(e) =>
                                handleChange(
                                  "eff_dt",
                                  e.target.value,
                                  rowIndex,
                                  1
                                )
                              }
                              onBlur={(e) => {
                                validateRequiredField(e, "Effective Date")
                                validateField(e, formData, rowIndex, formStatus)
                              }

                              }
                              required
                            />
                          </td>

                          <td className="table_cell">
                            <Checkbox
                              onChange={(e) =>
                                handleChange(
                                  "credit_allowed",
                                  e.target.checked ? "Y" : "N",
                                  rowIndex,
                                  1
                                )
                              }
                              name="credit_allowed"
                              value={data?.credit_allowed || ""}
                              checked={data?.credit_allowed === "Y"}

                            // required
                            />
                          </td>

                          <td className="table_cell">
                            <Checkbox
                              onChange={(e) =>
                                handleChange(
                                  "exempt_flag",
                                  e.target.checked ? "Y" : "N",
                                  rowIndex,
                                  1
                                )
                              }
                              name="exempt_flag"
                              value={data?.exempt_flag || ""}
                              checked={data?.exempt_flag === "Y"}
                            />
                          </td>
                        </tr>

                        {/* Second Row (Duplicate of First Row) */}
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && <td></td>}

                          <td className="table_cell" colSpan={2}>
                            <RadioGroup
                              className="button-group-wrapper box-border justify-content-between"
                              options={[
                                { text: "Goods", value: "S" },
                                { text: "Service", value: "V" },
                              ]}
                              onChange={(e) =>
                                handleChange(
                                  "sal_or_st",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              onBlur={(e) =>
                                validateRequiredField(e, "SGST perc")
                              }
                              checked={data?.sal_or_st || "S"}
                              required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              placeholder={"Cess Perc"}
                              name={`sgst_cess_perc_${rowIndex}_2`}
                              value={data?.sgst_cess_perc ?? ""}
                              //  step="0.1"
                              // min={0}
                              // max={100}
                              onChange={(e) =>
                                handleChange(
                                  "sgst_cess_perc",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              required
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.sgst_cess_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "sgst_cess_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }

                                  validateRequiredField(e, "SGST cess perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            //disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              //step="0.1"
                              // min={0}
                              // max={100}
                              placeholder={"Cess Perc"}
                              name={`cgst_cess_perc_${rowIndex}_2`}
                              value={data?.cgst_cess_perc ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  "cgst_cess_perc",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              required
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.cgst_cess_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "cgst_cess_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }

                                  validateRequiredField(e, "CGST cess perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            //disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              placeholder={"Cess Perc"}
                              name={`igst_cess_perc_${rowIndex}_2`}
                              //step="0.1"
                              // min={0}
                              //max={100}
                              value={data?.igst_cess_perc ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  "igst_cess_perc",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.igst_cess_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "igst_cess_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }

                                  validateRequiredField(e, "IGST cess perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                              required
                            //disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              placeholder={"Cess Perc"}
                              name={`ugst_cess_perc_${rowIndex}_2`}
                              value={data?.ugst_cess_perc ?? ""}
                              //step="0.1"
                              // min={0}
                              // max={100}
                              onChange={(e) =>
                                handleChange(
                                  "ugst_cess_perc",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              required
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.ugst_cess_perc);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "ugst_cess_perc",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }

                                  validateRequiredField(e, "UGST cess perc");

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            //disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`amount_to_${rowIndex}_2`}
                              value={data?.amount_to ?? ""}
                              placeholder={"Amount To"}
                              //  step="0.1"
                              //min={0}
                              onChange={(e) =>
                                handleChange(
                                  "amount_to",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              onBlur={(e) => {

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.amount_to);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "amount_to",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }
                                  validateRequiredField(e, "amount to")
                                  validateField(e, formData, rowIndex, formStatus)
                                }
                              }

                              }
                              required
                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="number"
                              name={`other_tax_${rowIndex}_2`}
                              value={data?.other_tax ?? ""}
                              placeholder={"Other Tax %"}
                              // step="0.1"
                              //min={0}
                              //max={100}
                              onChange={(e) =>
                                handleChange(
                                  "other_tax",
                                  e.target.value,
                                  rowIndex,
                                  2
                                )
                              }
                              required
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = parseFloat(data?.other_tax);
                                  if (!isNaN(val)) {
                                    handleChange(
                                      "other_tax",
                                      val?.toFixed(2),
                                      rowIndex,
                                      2
                                    );
                                  }

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(quantity);

                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            // disabled
                            />
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          </div>
          <h4
            style={{
              textAlign: "left",
              color: "red",
              marginLeft: "60px",
              fontSize: "18px",
              //border: "1px solid black"
            }}
          >
            Note: Null in State Code will apply GST rates to all states against
            corresponding HSN Code.
          </h4>
        </Form>
      </Card>
    </React.Fragment>
  );
};

export default StateWiseGstDetails;
