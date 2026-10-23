import React from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import {
  itemTabGstHeaders,
  headers,
  tableData,
  vendorHelpListHeader,
  itemHelpListHeader,
  hsnHelpListHeader,
} from "./itc_helpers";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
import { useMemo, useCallback, useState, useEffect } from "react";
import { toFormData } from "axios";
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";

const Items = ({
  formData = [{}],
  handleChange,
  formStatus,
  handleChangeTab,
  triggerAddRow,
  setActiveRowIndex,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  fetchValidateData,
  validateRatefield,
  formData1,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  setTotnetAmt,
  callInsertGstDataAPI,
  setFormDetailData,
  updateGstTotals,
}) => {
  // for checking qty and rate field validation

  const handleQtyError = (data, name) => {
    if (data === null || data === undefined || data === "") {
      return;
    }

    //console.log('data', data)

    if (name === "Quantity" || name === "Rate") {
      if (data < 0) {
        toast.error(`${name} cannot be negative`);
        return true;
      }

      if (data === 0) {
        toast.error(`${name} can not be zero`);
        return true;
      }
    } else {
      if (data < 0) {
        toast.error(`${name} can not be negative`);
        return true;
      }
    }

    return false;
  };

  // for gst percentage

  const handleGstValue = (data) => {
    if (!data) {
      return;
    }
    if (data < 0) {
      toast.error("Percentage value can not be negative");
      return true;
    }

    if (data > 100) {
      toast.error("Percentage cannot be Greater than 100");
      return true;
    }

    return false;
  };

  const handleGstPercValue = (data) => {
    if (!data) {
      return;
    }
    if (data < 0) {
      toast.error("Percentage value can not be negative");
      return true;
    }

    return false;
  };

  const getCalData = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const misc = parseFloat(row.misc_chgs_in_fc) || 0;
    const pack = parseFloat(row.pack_forwad_amt) || 0;
    const conv = parseFloat(row.curr_conv) || 0;
    const insurance = parseFloat(row.insurance_amt) || 0;
    //const bcdAmt = parseFloat(row.bcd_amt_ndb) || 0;
    const bcdEdu = parseFloat(row.bcd_edu_cess_amt_ndb) || 0;
    const bcdHsc = parseFloat(row.bcd_hsc_cess_amt_ndb) || 0;
    const customAmt = parseFloat(row.custom_hndlg_amt) || 0;
    const bcdPrc = parseFloat(row.bcd_prc) || 0;
    const bcdEduCess = parseFloat(row.bcd_edu_cess_prc) || 0;
    const bcdHscCess = parseFloat(row.bcd_hsc_cess_prc) || 0;

    const val_in_fc = qty * rate + pack + misc;
    const val_in_inr = qty * rate + misc + pack * conv;
    const t_ass_val = val_in_inr + insurance;
    const bcd_amt_ndb = ((t_ass_val + customAmt) * bcdPrc) / 100;
    //const net_amt = bcd_amt_ndb + bcdEdu + bcdHsc + t_ass_val + customAmt
    const bcd_edu_cess_amt_ndb = (bcd_amt_ndb * bcdEduCess) / 100;
    const bcd_hsc_cess_amt_ndb = (bcd_amt_ndb * bcdHscCess) / 100;

    //Net Amount
    const net_amt =
      t_ass_val +
      customAmt +
      bcd_amt_ndb +
      bcd_edu_cess_amt_ndb +
      bcd_hsc_cess_amt_ndb;

    return {
      val_in_inr: val_in_inr.toFixed(2),
      t_ass_val: t_ass_val.toFixed(2),
      net_amt: net_amt.toFixed(2),
      bcd_edu_cess_amt_ndb: bcd_edu_cess_amt_ndb.toFixed(2),
      bcd_hsc_cess_amt_ndb: bcd_hsc_cess_amt_ndb.toFixed(2),
      bcd_amt_ndb: bcd_amt_ndb.toFixed(2),
      val_in_fc: val_in_fc.toFixed(2),
    };
  };

  const totAmt = (formData) => {
    return formData?.reduce((total, row) => {
      const { net_amt } = getCalData(row);
      return total + (parseFloat(net_amt) || 0);
    }, 0);
  };

  // Automatically update totnetAmt when formData changes
  useEffect(() => {
    const total = totAmt(formData);
    setTotnetAmt(total);
  }, [formData]);

  const handleBlur = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const misc = parseFloat(row.misc_chgs_in_fc) || 0;
    const packPrc = parseFloat(row.pack_forwad_prc) || 0;
    const insPrc = parseFloat(row.insurance_prc) || 0;

    // Get calculated val_in_inr from getCalData
    const valInr = parseFloat(getCalData(row).val_in_inr) || 0;

    // Correct packaging‐forward amount
    const pack_forwad_amt = ((qty * rate + misc) * packPrc) / 100;

    // Insurance amount using calculated valInr
    const insurance_amt = (valInr * insPrc) / 100;

    return {
      pack_forwad_amt: pack_forwad_amt.toFixed(2),
      insurance_amt: insurance_amt.toFixed(2),
    };
  };

  const handleBlur1 = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const misc = parseFloat(row.misc_chgs_in_fc) || 0;
    const packPrc = parseFloat(row.pack_forwad_prc) || 0;

    // correct packaging‐forwad
    const pack_forwad_amt = ((qty * rate + misc) * packPrc) / 100;

    return {
      pack_forwad_amt: pack_forwad_amt.toFixed(2),
    };
  };

  const handleBlur2 = (row) => {
    // Get calculated val_in_inr from getCalData
    const valInr = parseFloat(getCalData(row).val_in_inr) || 0;
    const insPrc = parseFloat(row.insurance_prc) || 0;

    // correct insurance amount
    const insurance_amt = (valInr * insPrc) / 100;

    return {
      insurance_amt: insurance_amt.toFixed(2),
    };
  };

  const handleBlur3 = (row) => {
    const tAss = parseFloat(getCalData(row).t_ass_val) || 0;
    const customPerc = parseFloat(row.custom_hndlg_perc) || 0;

    const custom_hndlg_amt = (tAss * customPerc) / 100;

    return {
      custom_hndlg_amt: custom_hndlg_amt.toFixed(2),
    };
  };

  function calcPercVal(formData) {
    return formData?.map((row) => {
      const net_amt = parseFloat(getCalData(row).net_amt) || 0;
      const gst_amt_prc = row.gst_amt_prc;

      //console.log("net_amt", net_amt);

      let igst_value = 0,
        sgst_value = 0,
        cgst_value = 0;
      let igst_val_cr_allowable = 0,
        sgst_val_cr_allowable = 0,
        cgst_val_cr_allowable = 0,
        igst_cess_val_cr_allowable = 0,
        cgst_cess_val_cr_allowable = 0,
        sgst_cess_val_cr_allowable = 0,
        igst_cess_val = 0,
        cgst_cess_val = 0,
        sgst_cess_val = 0;

      if (gst_amt_prc === "P") {
        //console.log("gst_amt_prc", gst_amt_prc);

        // igst_value = Math.round((net_amt * (row.igst_perc || 0)) / 100);
        // sgst_value = Math.round((net_amt * (row.sgst_perc || 0)) / 100);
        // cgst_value = Math.round((net_amt * (row.cgst_perc || 0)) / 100);

        igst_value = (net_amt * (row.igst_perc || 0)) / 100;
        sgst_value = (net_amt * (row.sgst_perc || 0)) / 100;
        cgst_value = (net_amt * (row.cgst_perc || 0)) / 100;

        igst_cess_val = (net_amt * (row.igst_cess_perc || 0)) / 100;
        sgst_cess_val = (net_amt * (row.sgst_cess_perc || 0)) / 100;
        cgst_cess_val = (net_amt * (row.cgst_cess_perc || 0)) / 100;

        //console.log("sgst_val_cr_allowable", sgst_val_cr_allowable);
        //console.log("sgst_val_cr_allowable", sgst_val_cr_allowable);
        //console.log("igst_val_cr_allowable", sgst_val_cr_allowable);

        igst_val_cr_allowable =
          (net_amt * (row.igst_perc_cr_allowable || 0)) / 100;

        sgst_val_cr_allowable =
          (net_amt * (row.sgst_perc_cr_allowable || 0)) / 100;

        cgst_val_cr_allowable =
          (net_amt * (row.cgst_perc_cr_allowable || 0)) / 100;

        igst_cess_val_cr_allowable = 
          (net_amt * (row.igst_cess_perc_cr_allowable || 0)) / 100,
        
        cgst_cess_val_cr_allowable =
          (net_amt * (row.cgst_cess_perc_cr_allowable || 0)) / 100;

        sgst_cess_val_cr_allowable =
          (net_amt * (row.sgst_cess_perc_cr_allowable || 0)) / 100;
      }

      return {
        ...row,
        igst_value: igst_value.toFixed(2),
        sgst_value: sgst_value.toFixed(2),
        cgst_value: cgst_value.toFixed(2),
        igst_val_cr_allowable: igst_val_cr_allowable.toFixed(2),
        sgst_val_cr_allowable: sgst_val_cr_allowable.toFixed(2),
        cgst_val_cr_allowable: cgst_val_cr_allowable.toFixed(2),
        igst_cess_val_cr_allowable: igst_cess_val_cr_allowable.toFixed(2),
        sgst_cess_val_cr_allowable: sgst_cess_val_cr_allowable.toFixed(2),
        cgst_cess_val_cr_allowable: cgst_cess_val_cr_allowable.toFixed(2),
        igst_cess_val: igst_cess_val.toFixed(2),
        cgst_cess_val: cgst_cess_val.toFixed(2),
        sgst_cess_val: sgst_cess_val.toFixed(2),
      };
    });
  }

  const handleDoubleClick = (field, header, rowIndex) => {
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };

  //const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData?.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  return (
    <React.Fragment>
      <Form id="itc-item-form">
        <Row>
          <div className="table-title">
            <span>Item</span>
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
                  {/* <thead>
                {renderTableHeader}
              </thead> */}
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th style={{ width: "80px" }} className="">
                          Actions
                        </th>
                      )}
                      {headers.map((header, index) => (
                        <th
                          // key={index}
                          key={`header-${index}`}
                          data-required={header.required || false}
                          style={{
                            whiteSpace: "nowrap",
                            width: header.width,
                            minWidth: header.width,
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
                      // key={`row-${rowIndex}`}
                      <React.Fragment key={`row-${rowIndex}`}>
                        <tr
                          className=""
                          //   key={rowIndex}
                          // key={`main-${rowIndex}`}
                          onFocus={() =>
                            makeFocusOnTableRow(
                              rowIndex,
                              formData[focusedRowIndex]?.id,
                            )
                          }
                          style={{
                            border: `${
                              rowIndex === focusedRowIndex
                                ? "2px solid black"
                                : "none"
                            }`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={formData?.length > 1}
                                onDelete={() => {
                                  handleDelete(data, rowIndex);
                                }}
                                //  handleDelete(data, rowIndex)}
                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          )}

                          <td>
                            <TextField
                              type="text"
                              name={`it_code${rowIndex}_1`}
                              // value={formData[focusedRowIndex]?.it_code || ""}
                              value={data?.it_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "it_code",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              // disabled
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "item",
                                  itemHelpListHeader,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  fetchValidateData(
                                    "it_code",
                                    e.target.value,
                                    rowIndex,
                                  );
                                }
                              }}
                              required
                            />
                          </td>
                          <td>
                            <RadioGroup
                              className="button-group-wrapper box-border justify-content-between"
                              options={[
                                { text: "Goods", value: "G" },
                                { text: "Services", value: "S" },
                              ]}
                              //name={`itm_goods_service${rowIndex}_1`}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "itm_goods_service",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              checked={data.itm_goods_service || "G"}
                            />
                          </td>
                          <td>
                            <TextField
                              type="text"
                              name={`hsn_sac_code_${rowIndex}_1`}
                              // value={
                              //   formData[focusedRowIndex]?.hsn_sac_code || ""
                              // }
                              value={data?.hsn_sac_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "hsn_sac_code",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              required
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  if (!e.target.value) {
                                    return;
                                  }

                                  (async () => {
                                    try {
                                      // 1. Call GST insert API

                                      // if (!e.target.value) {
                                      //   return
                                      // }

                                      if (formData1.whether_ge_yesno === "N") {
                                        const result =
                                          await callInsertGstDataAPI();

                                        // 2. Update formDetailData from API response
                                        const newGstData =
                                          result?.tdfminwardgstData || [];

                                        const mergedDetailData = formformData[
                                          focusedRowIndex
                                        ]?.map((existingItem, index) => {
                                          const updatedItem =
                                            newGstData[0] || {};
                                          const mergedItem = {
                                            ...existingItem,
                                          };

                                          for (const key in updatedItem) {
                                            if (
                                              updatedItem[key] !== null &&
                                              updatedItem[key] !== undefined
                                            ) {
                                              mergedItem[key] =
                                                updatedItem[key];
                                            }
                                          }

                                          return mergedItem;
                                        });
                                        //console.log(mergedDetailData);
                                        setFormDetailData(mergedDetailData);

                                        // 3. Recalculate percentage values
                                        const updatedPercVals =
                                          calcPercVal(mergedDetailData);
                                        const updatedRow =
                                          updatedPercVals[focusedRowIndex];

                                        if (updatedRow) {
                                          handleChange(
                                            "formDetailData",
                                            "igst_value",
                                            updatedRow.igst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_cess_val",
                                            updatedRow.igst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_val_cr_allowable",
                                            updatedRow.igst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_cess_val_cr_allowable",
                                            updatedRow.igst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_value",
                                            updatedRow.sgst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_cess_val",
                                            updatedRow.sgst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_val_cr_allowable",
                                            updatedRow.sgst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_cess_val_cr_allowable",
                                            updatedRow.sgst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_value",
                                            updatedRow.cgst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_cess_val",
                                            updatedRow.cgst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_val_cr_allowable",
                                            updatedRow.cgst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_cess_val_cr_allowable",
                                            updatedRow.cgst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                        }

                                        // 4. Update overall GST totals
                                        updateGstTotals(
                                          formData1,
                                          mergedDetailData,
                                        );
                                      }
                                    } catch (error) {
                                      // console.error("Error during onBlur GST flow:", error);
                                      //toast.error("Failed to update GST formData[focusedRowIndex]?.");
                                    }
                                  })();
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`qty_advise_${rowIndex}_1`}
                              // value={formData[focusedRowIndex]?.qty_advise || ""}

                              value={
                                !isNaN(parseFloat(data?.qty_advise))
                                  ? parseFloat(data?.qty_advise).toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "qty_advise",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`qty_${rowIndex}_1`}
                              value={data?.qty || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.qty === "number"
                              //     ? formData[focusedRowIndex]?.qty.toFixed(3)
                              //     : ""
                              // }
                              required
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "qty",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const val = formData[focusedRowIndex]?.qty;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "qty",
                                    parsedValue,
                                    rowIndex,
                                  );

                                  const rate = Number(e.target.value);
                                  //console.log("errg", rate);
                                  const hasLocalError = handleQtyError(
                                    rate,
                                    "Quantity",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`rate_${rowIndex}_1`}
                              value={data?.rate || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.rate === "number"
                              //     ? formData[focusedRowIndex]?.rate.toFixed(2)
                              //     : ""
                              // }
                              required
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "rate",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const val = formData[focusedRowIndex]?.rate;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "rate",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                  );

                                  const rate = Number(e.target.value);
                                  //console.log("errg", rate);
                                  const hasLocalError = handleQtyError(
                                    rate,
                                    "Rate",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  (async () => {
                                    try {
                                      // 1. Call GST insert API

                                      // if (!formData[rowIndex]?.it_code) {
                                      //   return;
                                      // }

                                      if (formData1.whether_ge_yesno === "N") {
                                        const result =
                                          await callInsertGstDataAPI();

                                        // 2. Update formDetailData from API response
                                        // const newGstData =
                                        //   result?.tdfminwardgstData || [];

                                        // const mergedDetailData = formData?.map((existingItem, index) => {
                                        //   const updatedItem =
                                        //     newGstData[index] || {};
                                        //   const mergedItem = {
                                        //     ...existingItem,
                                        //   };

                                        //   for (const key in updatedItem) {
                                        //     if (
                                        //       updatedItem[key] !== null &&
                                        //       updatedItem[key] !== undefined
                                        //     ) {
                                        //       mergedItem[key] =
                                        //         updatedItem[key];
                                        //     }
                                        //   }

                                        //   return mergedItem;
                                        // });

                                        const newGstRow =
                                          result?.tdfminwardgstData?.[0];
                                        if (!newGstRow) return;

                                        const mergedDetailData = formData.map(
                                          (existingItem, index) => {
                                            if (index !== rowIndex)
                                              return existingItem;

                                            const mergedItem = {
                                              ...existingItem,
                                            };

                                            for (const key in newGstRow) {
                                              if (
                                                newGstRow[key] !== null &&
                                                newGstRow[key] !== undefined
                                              ) {
                                                mergedItem[key] =
                                                  newGstRow[key];
                                              }
                                            }

                                            return mergedItem;
                                          },
                                        );

                                        setFormDetailData(mergedDetailData);

                                        // 3. Recalculate percentage values
                                        const updatedPercVals =
                                          calcPercVal(mergedDetailData);
                                        const updatedRow =
                                          updatedPercVals[focusedRowIndex];

                                        if (updatedRow) {
                                          handleChange(
                                            "formDetailData",
                                            "igst_value",
                                            updatedRow.igst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_cess_val",
                                            updatedRow.igst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_val_cr_allowable",
                                            updatedRow.igst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "igst_cess_val_cr_allowable",
                                            updatedRow.igst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_value",
                                            updatedRow.sgst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_cess_val",
                                            updatedRow.sgst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_val_cr_allowable",
                                            updatedRow.sgst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "sgst_cess_val_cr_allowable",
                                            updatedRow.sgst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_value",
                                            updatedRow.cgst_value,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_cess_val",
                                            updatedRow.cgst_cess_val,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_val_cr_allowable",
                                            updatedRow.cgst_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                          handleChange(
                                            "formDetailData",
                                            "cgst_cess_val_cr_allowable",
                                            updatedRow.cgst_cess_val_cr_allowable,
                                            focusedRowIndex,
                                          );
                                        }

                                        // 4. Update overall GST totals
                                        updateGstTotals(
                                          formData1,
                                          mergedDetailData,
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error during onBlur GST flow:",
                                        error,
                                      );
                                      toast.error(
                                        "Failed to update GST formData[focusedRowIndex]?.",
                                      );
                                    }
                                  })();
                                }
                              }}
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`misc_chgs_in_fc_${rowIndex}_1`}
                              value={data?.misc_chgs_in_fc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.misc_chgs_in_fc === "number"
                              //     ? formData[focusedRowIndex]?.misc_chgs_in_fc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "misc_chgs_in_fc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const val =
                                    formData[focusedRowIndex]?.misc_chgs_in_fc;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "misc_chgs_in_fc",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                  );

                                  const charge = Number(e.target.value);
                                  //console.log("errg", charge);
                                  const hasLocalError = handleQtyError(
                                    charge,
                                    "Miscellaneous charge",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  const { pack_forwad_amt, insurance_amt } =
                                    handleBlur(data);

                                  handleChange(
                                    "formDetailData",
                                    "pack_forwad_amt",
                                    pack_forwad_amt,
                                    rowIndex,
                                  );
                                  handleChange(
                                    "formDetailData",
                                    "insurance_amt",
                                    insurance_amt,
                                    rowIndex,
                                  );

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`pack_forward_prc_${rowIndex}_1`}
                              // value={
                              //   formData[focusedRowIndex]?.pack_forwad_prc || ""
                              // }
                              value={data?.pack_forwad_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.pack_forwad_prc === "number"
                              //     ? formData[focusedRowIndex]?.pack_forwad_prc.toFixed(2)
                              //     : ""
                              // }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const val =
                                    formData[focusedRowIndex]?.pack_forwad_prc;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "pack_forwad_prc",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                  );

                                  const charge = Number(e.target.value);
                                  //console.log("errg", charge);
                                  const hasLocalError = handleQtyError(
                                    charge,
                                    "PF amount",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  const { pack_forwad_amt } = handleBlur1(data);
                                  handleChange(
                                    "formDetailData",
                                    "pack_forwad_amt",
                                    pack_forwad_amt,
                                    rowIndex,
                                  );

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "pack_forwad_prc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`curr_val_${rowIndex}_1`}
                              // value={formData1?.curr_conv || formData[focusedRowIndex]?.curr_val || ""}
                              value={
                                formData1?.curr_conv !== undefined &&
                                formData1?.curr_conv !== null
                                  ? Number(formData1.curr_conv).toFixed(2)
                                  : formData[focusedRowIndex]?.curr_val !==
                                        undefined &&
                                      formData[focusedRowIndex]?.curr_val !==
                                        null
                                    ? Number(
                                        formData[focusedRowIndex]?.curr_val,
                                      ).toFixed(2)
                                    : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "curr_val",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`val_in_fc_${rowIndex}_1`}
                              value={getCalData(formData[rowIndex]).val_in_fc}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "val_in_fc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`insurance_prc_${rowIndex}_1`}
                              value={data?.insurance_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.insurance_prc === "number"
                              //     ? formData[focusedRowIndex]?.insurance_prc.toFixed(2)
                              //     : ""
                              // }
                              onBlur={(e) => {
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const val =
                                    formData[focusedRowIndex]?.insurance_prc;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "insurance_prc",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                  );

                                  const insPerc = Number(e.target.value);
                                  //console.log("errg", insPerc);
                                  const hasLocalError = handleQtyError(
                                    insPerc,
                                    "Insurance Percentage",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  const { insurance_amt } = handleBlur2(data);
                                  handleChange(
                                    "formDetailData",
                                    "insurance_amt",
                                    insurance_amt,
                                    rowIndex,
                                  );

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "insurance_prc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`t_ass_val_${rowIndex}_1`}
                              value={getCalData(formData[rowIndex]).t_ass_val}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "t_ass_val",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`custom_hndlg_perc_${rowIndex}_1`}
                              value={data?.custom_hndlg_perc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.custom_hndlg_perc === "number"
                              //     ? formData[focusedRowIndex]?.custom_hndlg_perc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "custom_hndlg_perc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.custom_hndlg_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "custom_hndlg_perc",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (formStatus === "Insert" || formStatus) {
                                  const custPerc = Number(e.target.value);
                                  //console.log("errg", custPerc);
                                  const hasLocalError = handleQtyError(
                                    custPerc,
                                    "Custom handling Percentage",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  const { custom_hndlg_amt } =
                                    handleBlur3(data);
                                  handleChange(
                                    "formDetailData",
                                    "custom_hndlg_amt",
                                    custom_hndlg_amt,
                                    rowIndex,
                                  );

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_prc_${rowIndex}_1`}
                              value={data?.bcd_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.bcd_prc === "number"
                              //     ? formData[focusedRowIndex]?.bcd_prc.toFixed(2)
                              //     : ""
                              // }

                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_prc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                if (formStatus === "Insert" || "Update") {
                                  const val =
                                    formData[focusedRowIndex]?.bcd_prc;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  //console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "bcd_prc",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                  );

                                  const bcdPerc = Number(e.target.value);
                                  //console.log("errg", bcdPerc);
                                  const hasLocalError = handleQtyError(
                                    bcdPerc,
                                    "Bcd Perctange",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_edu_cess_prc_${rowIndex}_1`}
                              value={data?.bcd_edu_cess_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.bcd_edu_cess_prc === "number"
                              //     ? formData[focusedRowIndex]?.bcd_edu_cess_prc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_edu_cess_prc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.bcd_edu_cess_prc_;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "bcd_edu_cess_prc_",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const eduPerc = Number(e.target.value);
                                  //console.log("errg", eduPerc);
                                  const hasLocalError = handleQtyError(
                                    eduPerc,
                                    "Bcd edu cess perc",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_hsc_cess_prc_${rowIndex}_1`}
                              value={data?.bcd_hsc_cess_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.bcd_hsc_cess_prc === "number"
                              //     ? formData[focusedRowIndex]?.bcd_hsc_cess_prc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_hsc_cess_prc",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.bcd_hsc_cess_prc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "bcd_hsc_cess_prc",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleQtyError(
                                    hscPerc,
                                    "Bcd hsc cess perc",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`net_amt_${rowIndex}_1`}
                              value={getCalData(formData[rowIndex]).net_amt}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "net_amt",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>

                        <tr
                          // key={rowIndex}
                          //key={`detail-${rowIndex}`}
                          onFocus={() =>
                            makeFocusOnTableRow(
                              rowIndex,
                              formData[focusedRowIndex]?.id,
                            )
                          }
                          style={{
                            border: `${
                              rowIndex === focusedRowIndex
                                ? "2px solid black"
                                : "none"
                            }`,
                          }}
                          // tabIndex={0}
                        >
                          <td>
                            <TextField
                              type="text"
                              name={`mrir_no_${rowIndex}_2`}
                              // value={formData[focusedRowIndex]?.mrir_no || ""}
                              value={data?.mrir_no || ""}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "mrir_no",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td></td>
                          <td colSpan={5}>
                            <TextField
                              type="text"
                              name={`it_name_${rowIndex}_2`}
                              // value={formData[focusedRowIndex]?.it_name || ""}
                              value={data?.it_name || ""}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "it_name",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`pack_forwad_amt_${rowIndex}_2`}
                              value={data?.pack_forwad_prc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.pack_forwad_amt === "number"
                              //     ? formData[focusedRowIndex]?.pack_forwad_amt.toFixed(2)
                              //     : ""
                              // }

                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.pack_forwad_prc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "pack_forwad_prc",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleQtyError(
                                    hscPerc,
                                    "Pack forward amount",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "pack_forwad_amt",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                            />
                          </td>

                          <td colSpan={2}>
                            <TextField
                              type="number"
                              name={`val_in_inr_${rowIndex}_2`}
                              value={getCalData(formData[rowIndex]).val_in_inr}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "val_in_inr",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`insurance_amt_${rowIndex}_2`}
                              value={data?.insurance_amt || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.insurance_amt === "number"
                              //     ? formData[focusedRowIndex]?.insurance_amt.toFixed(2)
                              //     : ""
                              // }

                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.insurance_amt;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "insurance_amt",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleQtyError(
                                    hscPerc,
                                    "Insurance amount",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "insurance_amt",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              //disabled
                            />
                          </td>

                          <td></td>

                          <td>
                            <TextField
                              type="number"
                              name={`custom_hndlg_amt_${rowIndex}_2`}
                              value={data?.custom_hndlg_amt || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.custom_hndlg_amt === "number"
                              //     ? formData[focusedRowIndex]?.custom_hndlg_amt.toFixed(2)
                              //     : ""
                              // }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.custom_hndlg_amt;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "custom_hndlg_amt",
                                  parsedValue?.toFixed(2),
                                  rowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleQtyError(
                                    hscPerc,
                                    "Custom handling amount",
                                  );
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);

                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );

                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "custom_hndlg_amt",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_amt_ndb_${rowIndex}_2`}
                              value={getCalData(formData[rowIndex]).bcd_amt_ndb}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_amt_ndb",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_edu_cess_amt_ndb_${rowIndex}_2`}
                              value={
                                getCalData(formData[rowIndex])
                                  .bcd_edu_cess_amt_ndb
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_edu_cess_amt_ndb",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`bcd_hsc_cess_amt_ndb_${rowIndex}_2`}
                              value={
                                getCalData(formData[rowIndex])
                                  .bcd_hsc_cess_amt_ndb
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "bcd_hsc_cess_amt_ndb",
                                  e.target.value,
                                  rowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          </div>
        </Row>

        <Row className="mt-4">
          <Col xl={2}>
            <div className="text-wrapper box-border p-2 m-auto">
              <span className="text-label">GST</span>

              <Row className="mt-1">
                <Col>
                  <RadioGroup
                    className="button-group-wrapper box-border justify-content-between"
                    options={[
                      { text: "%", value: "P" },
                      { text: "value", value: "V" },
                    ]}
                    onChange={(e) =>
                      handleChange(
                        "formDetailData",
                        "gst_amt_prc",
                        e.target.value,
                        focusedRowIndex,
                      )
                    }
                    checked={formData[focusedRowIndex]?.gst_amt_prc}
                  />
                </Col>
              </Row>
            </div>
          </Col>

          <Col xl={8}>
            <div className="text-wrapper box-border p-2 m-auto">
              <div className="table-title">
                <span>IGST</span>
                {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={triggerAddRow}
                >
                  Add Row
                </ButtonUi>
              )} */}
              </div>
              {/* <Row className='mt-1'> */}
              <div
                className="table-container"
                style={{ height: "100px", maxHeight: "100px" }}
              >
                <SimpleBar forceVisible="y" autoHide={false}>
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" || formStatus === "Update") &&
                        <th style={{ width: '80px' }} className="">Actions</th>
                      } */}
                        {itemTabGstHeaders.map((header, index) => (
                          <th
                            // key={index}
                            key={`gst-header-${index}`}
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
                      <React.Fragment key={`row-${focusedRowIndex}`}>
                        <tr
                          className=""
                          //key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          // style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "5px",
                              }}
                            >
                              IGST_LBL
                            </span>
                          </td>

                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`igst_perc_${focusedRowIndex}_1`}
                              value={formData[focusedRowIndex]?.igst_perc || ""}
                              // value={
                              //   typeof formData[focusedRowIndex]?.igst_perc === "number"
                              //     ? formData[focusedRowIndex]?.igst_perc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.igst_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_value",
                                      updatedRow.igst_value,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              // disabled
                            />
                          </td>
                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`igst_cess_perc_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]?.igst_cess_perc || ""
                              }
                              // value={
                              //   typeof formData[focusedRowIndex]?.igst_cess_perc === "number"
                              //     ? formData[focusedRowIndex]?.igst_cess_perc.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.igst_cess_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_cess_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_cess_val",
                                      updatedRow.igst_cess_val,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.igst_perc_cr_allowable || ""
                              }
                              // value={
                              //   typeof formData[focusedRowIndex]?.igst_perc_cr_allowable === "number"
                              //     ? formData[focusedRowIndex]?.igst_perc_cr_allowable.toFixed(2)
                              //     : ""
                              // }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.igst_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_val_cr_allowable",
                                      updatedRow.igst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`igst_cess_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.igst_cess_perc_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.igst_cess_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_cess_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "igst_cess_val_cr_allowable",
                                      updatedRow.igst_cess_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}

                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.igst_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.igst_perc_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.igst_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.igst_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`igst_cess_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.igst_cess_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.igst_cess_perc_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.igst_cess_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.igst_cess_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>

                        <tr
                          key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          //style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              Value
                            </span>
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`igst_value_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.igst_value || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_value",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.igst_value;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_value",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const quantity = Number(e.target.value);
                                  //console.log("errg", quantity);
                                  const hasLocalError =
                                    handleGstPercValue(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`igst_cess_val_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.igst_cess_val || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_val",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.igst_cess_val;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_cess_val",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const quantity = Number(e.target.value);
                                  //console.log("errg", quantity);
                                  const hasLocalError =
                                    handleGstPercValue(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.igst_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.igst_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const quantity = Number(e.target.value);
                                  //console.log("errg", quantity);
                                  const hasLocalError =
                                    handleGstPercValue(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_cess_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.igst_cess_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.igst_cess_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "igst_cess_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const quantity = Number(e.target.value);
                                  //console.log("errg", quantity);
                                  const hasLocalError =
                                    handleGstPercValue(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_val_cr_availed_${focusedRowIndex}_2`}
                              //value={formData[focusedRowIndex]?.igst_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.igst_val_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.igst_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.igst_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_val_cr_availed_",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`igst_cess_val_cr_availed_${focusedRowIndex}_2`}
                              //value={formData[focusedRowIndex]?.igst_cess_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.igst_cess_val_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.igst_cess_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.igst_cess_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "igst_cess_val_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    </tbody>
                  </Table>
                </SimpleBar>
              </div>
              {/* </Row> */}
            </div>
          </Col>
          <Col>
            <Row>
              <label>Total </label>
              <TextField
                type="number"
                name="tot_net_amt"
                //value={formData?.tot_net_amt || ""}
                //value={totAmt(formData)}
                value={totAmt(formData).toFixed(2)}
                onChange={(e) =>
                  handleChange("formDetailData", "tot_net_amt", e.target.value)
                }
                //disabled
              />
            </Row>
            <Row>
              <label>PO</label>
              <TextField
                type="text"
                name="po_no"
                value={formData[focusedRowIndex]?.po_no || ""}
                onChange={(e) =>
                  handleChange(
                    "formDetailData",
                    "po_no",
                    e.target.value,
                    focusedRowIndex,
                  )
                }
                disabled
              />
            </Row>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col xl={2}>
            <Row className="mt-1">
              <Col>
                <Checkbox
                  onChange={(e) =>
                    handleChange(
                      "formDetailData",
                      "round_gst_flag_detail",
                      e.target.checked ? "Y" : "N",
                      focusedRowIndex,
                    )
                  }
                  text="Round GST"
                  checked={
                    formData[focusedRowIndex]?.round_gst_flag_detail === "Y"
                  }
                />
              </Col>
            </Row>
          </Col>
          <Col xl={8}>
            <div className="text-wrapper box-border p-2 m-auto">
              <div className="table-title">
                <span>SGST</span>
                {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={triggerAddRow}
                >
                  Add Row
                </ButtonUi>
              )} */}
              </div>
              {/* <Row className='mt-1'> */}
              <div
                className="table-container"
                style={{ height: "100px", maxHeight: "100px" }}
              >
                <SimpleBar forceVisible="y" autoHide={false}>
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" || formStatus === "Update") &&
                        <th style={{ width: '80px' }} className="">Actions</th>
                      } */}
                        {itemTabGstHeaders.map((header, index) => (
                          <th
                            //key={index}
                            key={`gst-header2-${index}`}
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
                      <React.Fragment key={`row-${focusedRowIndex}`}>
                        <tr
                          className=""
                          // key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          //style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "5px",
                              }}
                            >
                              SGST_LBL
                            </span>
                          </td>

                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`sgst_perc_${focusedRowIndex}_1`}
                              value={formData[focusedRowIndex]?.sgst_perc || ""}
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.sgst_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "sgst_value",
                                      updatedRow.sgst_value,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }

                              // disabled
                            />
                          </td>
                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`sgst_cess_perc_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]?.sgst_cess_perc || ""
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.sgst_cess_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (formStatus === "Insert" || "Update") {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "sgst_cess_val",
                                      updatedRow.sgst_cess_val,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              // disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.sgst_perc_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.sgst_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  const newVal =
                                    parseFloat(e.target.value) || 0;

                                  // Make a shallow copy of formData and update the relevant value manually
                                  const updatedFormData = [...formData];
                                  updatedFormData[focusedRowIndex] = {
                                    ...updatedFormData[focusedRowIndex],
                                    sgst_perc_cr_allowable: newVal,
                                  };

                                  const updatedPercVals =
                                    calcPercVal(updatedFormData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "sgst_val_cr_allowable",
                                      updatedRow.sgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}

                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`sgst_cess_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.sgst_cess_perc_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.sgst_cess_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Create a deep copy of the row with the updated percentage
                                  const updatedFormData = [...formData];
                                  const updatedRowData = {
                                    ...updatedFormData[focusedRowIndex],
                                    sgst_cess_perc_cr_allowable: newValue,
                                  };
                                  updatedFormData[focusedRowIndex] =
                                    updatedRowData;

                                  // Run calc with updated row
                                  const updatedPercVals =
                                    calcPercVal(updatedFormData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "sgst_cess_val_cr_allowable",
                                      updatedRow.sgst_cess_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}

                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.sgst_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.sgst_perc_cr_availed ).toFixed(2)|| ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.sgst_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.sgst_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`sgst_cess_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.sgst_cess_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.sgst_cess_perc_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.sgst_cess_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.sgst_cess_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>

                        <tr
                          key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          //style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              Value
                            </span>
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`sgst_value_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.sgst_value || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_value",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.sgst_value;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_value",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`sgst_cess_val_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.sgst_cess_val || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_val",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.sgst_cess_val;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_val",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.sgst_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.sgst_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );

                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_cess_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.sgst_cess_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.sgst_cess_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_val_cr_availed_${focusedRowIndex}_2`}
                              //value={formData[focusedRowIndex]?.sgst_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.sgst_val_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.sgst_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.sgst_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_val_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`sgst_cess_val_cr_availed_${focusedRowIndex}_2`}
                              //value={formData[focusedRowIndex]?.sgst_cess_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.sgst_cess_val_cr_availed ).toFixed(2)|| ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.sgst_cess_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.sgst_cess_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "sgst_cess_val_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    </tbody>
                  </Table>
                </SimpleBar>
              </div>
              {/* </Row> */}
            </div>
          </Col>

          <Col xl={2}>
            <Row>
              <Col xl={12}>
                <ButtonUi
                  color="secondary"
                  className="mt-1"
                  onClick={() => {
                    handleChangeTab("Freight");
                  }}
                >
                  Freight / Insuarance
                </ButtonUi>
              </Col>
            </Row>
            <Row>
              <Col xl={12}>
                <ButtonUi
                  color="secondary"
                  className="mt-1"
                  onClick={() => {
                    handleChangeTab("Main");
                  }}
                >
                  Main
                </ButtonUi>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col xl={2}></Col>

          <Col xl={8}>
            <div className="text-wrapper box-border p-2 m-auto">
              <div className="table-title">
                <span>CGST</span>
                {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={triggerAddRow}
                >
                  Add Row
                </ButtonUi>
              )} */}
              </div>
              {/* <Row className='mt-1'> */}
              <div
                className="table-container"
                style={{ height: "100px", maxHeight: "100px" }}
              >
                <SimpleBar forceVisible="y" autoHide={false}>
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" || formStatus === "Update") &&
                        <th style={{ width: '80px' }} className="">Actions</th>
                      } */}
                        {itemTabGstHeaders.map((header, index) => (
                          <th
                            // key={index}
                            key={`gst-header3-${index}`}
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
                      <React.Fragment key={`row-${focusedRowIndex}`}>
                        <tr
                          className=""
                          // key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          //style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "5px",
                              }}
                            >
                              CGST_LBL
                            </span>
                          </td>

                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`cgst_perc_${focusedRowIndex}_1`}
                              value={formData[focusedRowIndex]?.cgst_perc || ""}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.cgst_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "cgst_value",
                                      updatedRow.cgst_value,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              style={{ width: "90px" }}
                              type="number"
                              name={`cgst_cess_perc_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]?.cgst_cess_perc || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_perc",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.cgst_cess_perc;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_perc",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "cgst_cess_val",
                                      updatedRow.cgst_cess_val,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.cgst_perc_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.cgst_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  const newVal =
                                    parseFloat(e.target.value) || 0;

                                  // Make a shallow copy of formData and update the relevant value manually
                                  const updatedFormData = [...formData];
                                  updatedFormData[focusedRowIndex] = {
                                    ...updatedFormData[focusedRowIndex],
                                    cgst_perc_cr_allowable: newVal,
                                  };

                                  const updatedPercVals =
                                    calcPercVal(updatedFormData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "cgst_val_cr_allowable",
                                      updatedRow.cgst_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`cgst_cess_perc_cr_allowable_${focusedRowIndex}_1`}
                              value={
                                formData[focusedRowIndex]
                                  ?.cgst_cess_perc_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_perc_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.cgst_cess_perc_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_perc_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError = handleGstValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Calculate percentage values
                                  const updatedPercVals = calcPercVal(formData);
                                  const updatedRow =
                                    updatedPercVals[focusedRowIndex];

                                  if (updatedRow) {
                                    handleChange(
                                      "formDetailData",
                                      "cgst_cess_val_cr_allowable",
                                      updatedRow.cgst_cess_val_cr_allowable,
                                      focusedRowIndex,
                                    );
                                  }
                                }
                              }}
                              //disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.cgst_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.cgst_perc_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.cgst_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.cgst_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`cgst_cess_perc_cr_availed_${focusedRowIndex}_1`}
                              //value={formData[focusedRowIndex]?.cgst_cess_perc_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.cgst_cess_perc_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.cgst_cess_perc_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.cgst_cess_perc_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_perc_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>

                        <tr
                          key={focusedRowIndex}
                          //onFocus={() => makeFocusOnTableRow(rowIndex, formData[focusedRowIndex]?.id)}
                          //style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                          tabIndex={0}
                        >
                          <td>
                            <span
                              style={{
                                fontWeight: "bold",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              Value
                            </span>
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`cgst_value_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.cgst_value || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_value",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.cgst_value;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_value",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>

                          <td>
                            <TextField
                              type="number"
                              name={`cgst_cess_val_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]?.cgst_cess_val || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_val",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]?.cgst_cess_val;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_val",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.cgst_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.cgst_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_cess_val_cr_allowable_${focusedRowIndex}_2`}
                              value={
                                formData[focusedRowIndex]
                                  ?.cgst_cess_val_cr_allowable || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_val_cr_allowable",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              onBlur={(e) => {
                                const val =
                                  formData[focusedRowIndex]
                                    ?.cgst_cess_val_cr_allowable;

                                const isNumericField =
                                  !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                  ? parseFloat(val)
                                  : val;
                                //console.log(parsedValue);

                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_val_cr_allowable",
                                  parsedValue?.toFixed(2),
                                  focusedRowIndex,
                                );
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update"
                                ) {
                                  const hscPerc = Number(e.target.value);
                                  //console.log("errg", hscPerc);
                                  const hasLocalError =
                                    handleGstPercValue(hscPerc);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_val_cr_availed_${focusedRowIndex}_2`}
                              // value={formData[focusedRowIndex]?.cgst_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.cgst_val_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.cgst_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.cgst_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_val_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              name={`cgst_cess_val_cr_availed_${focusedRowIndex}_2`}
                              //value={formData[focusedRowIndex]?.cgst_cess_val_cr_availed === 0 ? "0.00" : (formData[focusedRowIndex]?.cgst_cess_val_cr_availed).toFixed(2) || ""}
                              value={
                                typeof formData[focusedRowIndex]
                                  ?.cgst_cess_val_cr_availed === "number"
                                  ? formData[
                                      focusedRowIndex
                                    ]?.cgst_cess_val_cr_availed.toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "cgst_cess_val_cr_availed",
                                  e.target.value,
                                  focusedRowIndex,
                                )
                              }
                              disabled
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    </tbody>
                  </Table>
                </SimpleBar>
              </div>
              {/* </Row> */}
            </div>
          </Col>
          {/* <Col xl={2}>
            <Row>
              <Col xl={12}>

                <ButtonUi color="secondary" className='mt-1' onClick={() => { handleChangeTab('Freight') }}>
                  Freight / Insuarance
                </ButtonUi>
              </Col>

            </Row>
            <Row>
              <Col xl={12}>
                <ButtonUi color="secondary" className='mt-1' onClick={() => { handleChangeTab('Main') }}>
                  Main
                </ButtonUi>
              </Col>

            </Row>

          </Col> */}
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default Items;
