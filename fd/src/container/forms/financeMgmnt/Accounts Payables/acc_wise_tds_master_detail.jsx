import React, { useState, useRef, useEffect, useCallback } from "react";
import RadioGroup from "../../../../components/basic/radioGroup";
import { Col, Row, Table, Form } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import { accWiseTdsDetailData, headers, accHelpListHeader, vendorHelpListHeader, tdsAccHelpListHeader, tdsCessHelpListHeader, tdsSurHelpListHeader, tdsHscHelpListHeader } from "./acc_wise_tds_master_helper";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from 'simplebar-react'
import RowAction from "../../../../components/common/rowAction";
import { RiNurseFill } from "@remixicon/react";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";


const AccWiseTdsDetails = ({ formData = [{}], radioData, handleChange, formStatus, triggerAddRow,
  actualAccData,
  setSelectedTypeFlag,
  handleSetAccData,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  setActiveRowIndex,
  getValidateData,
  otherQueryPera,
  focusedRowIndex,
  setFocusedRowIndex,
  handleDeleteRow,
  visibleData = [{}],
  setVisibleData,
  setRecordsToShow,
  recordsToShow,
  setFilteredAccData,
  selectedTypeFlag,
  filteredAccData,
  setCurrentRecordNo

}) => {

  //const [focusedRowIndex, setFocusedRowIndex] = useState(0); 


  useEffect(() => {
    if (formStatus === "Query" && (selectedTypeFlag === "V" || selectedTypeFlag === "O")) {
      const filteredData =
        selectedTypeFlag === "V"
          ? actualAccData.filter((item) => item.category_flag === "V")
          : actualAccData.filter((item) => item.category_flag === "O");

      setFilteredAccData(filteredData);
      //handleSetAccData(filteredData);
    }
  }, [formStatus, selectedTypeFlag, actualAccData]);



  const handleDoubleClick = (field, header, rowIndex) => {
    // if (formStatus === "Search") {
    //   toast.error("Help list is not available in search mode")
    // }
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };



  const lastScrollTopRef = useRef(0);

  // const handleScroll = (e) => {
  //   const { scrollTop, scrollHeight, clientHeight } = e.target;

  //   // run only if vertical scroll changed
  //   if (scrollTop !== lastScrollTopRef.current) {
  //     lastScrollTopRef.current = scrollTop;

  //     if (formStatus === 'Query' && scrollTop + clientHeight >= scrollHeight - 10) {  

  //       if (selectedTypeFlag === 'O') {
  //          const nextRecords = formData.slice(0, recordsToShow + 100);
  //       setVisibleData(nextRecords);
  //       setRecordsToShow(prev => prev + 100);
  //       }  


  //       const nextRecords = formData.slice(0, recordsToShow + 100);
  //       setVisibleData(nextRecords);
  //       setRecordsToShow(prev => prev + 100);
  //     }
  //   }
  // };  

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop !== lastScrollTopRef.current) {
      lastScrollTopRef.current = scrollTop;

      if (formStatus === "Query" && scrollTop + clientHeight >= scrollHeight - 10) {

        // const sourceData =
        //   selectedTypeFlag === "O" || selectedTypeFlag === "V"
        //     ? filteredAccData
        //     : formData;

        const sourceData =
          (selectedTypeFlag === "O" || selectedTypeFlag === "V") && filteredAccData.length > 0
            ? filteredAccData
            : formData;


        const nextRecords = sourceData.slice(0, recordsToShow + 100);
        setVisibleData(nextRecords);
        setRecordsToShow((prev) => prev + 100);
      }
    }
  };



  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };


  //   const value = visibleData[rowIndex]?.[fieldName];

  //   // Skip validation if field is empty
  //   if (value === "" || value === null || value === undefined) {
  //     return true;
  //   }  

  //   //console.log('-ve value')

  //   const num = parseFloat(value);
  //   if (isNaN(num) || num <= 0) {
  //     toast.error(`${label} cannot be negative or zero`);
  //     e.preventDefault();
  //     e.target.focus();
  //     return false;
  //   }
  //   return true;
  // };

  const handleQtyError = (data) => {
    if (data < 0 || data > 100) {

      toast.error('Percentage value can not be negative or greater than 100')
      return true;
    }
    return false;
  };


  const handleLimitError = (data) => {
    if (data < 0) {

      toast.error('Limit can not be negative')
      return true;
    }
    return false;

  }

  //   const handleVendorBlur = async (e, rowIndex) => {
  //   if (!(formStatus === "Update" || formStatus === "Insert" || formStatus === "Search")) return;

  //   const field = e.target;
  //   const vCode = field.value;

  //   // Validate required field immediately
  //   validateRequiredField({ target: field }, "Vendor Code");

  //   try {
  //     const isValid = await getValidateData("v_code", vCode, otherQueryPera, rowIndex);
  //     //console.log('isValid', isValid)
  //     if (!isValid) {
  //       // Only focus if INVALID
  //       field.focus();
  //     } else {

  //     }
  //   } catch (err) {
  //     console.error("Validation error:", err);
  //   }
  // };  

  const handleVendorBlur = async (e, rowIndex) => {
    if (!(formStatus === "Update" || formStatus === "Insert" || formStatus === "Search")) return;

    const field = e.target;
    const vCode = field.value;


    validateRequiredField({ target: field }, "Vendor Code");

    try {
      const result = await getValidateData("v_code", vCode, otherQueryPera, rowIndex);
      //console.log('Validation result:', result);

      if (!result.valid) {
        // Only focus if INVALID
        field.focus();
      } else if (result.data) {

        setVisibleData((prevData) => {
          const updated = [...prevData];
          if (updated[rowIndex]) {
            // updated[rowIndex].v_code = vCode;
            updated[rowIndex].v_name = result.data.v_name;
            updated[rowIndex].pan_no = result.data.pan_no;
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Validation error:", err);
    }
  };



  const handleTypeChange = (flag) => {

    setSelectedTypeFlag(flag);
    handleChange("radioData", "category_flag", flag);


    if (formStatus === "Search") {
      return
    }
    if (['Insert', 'Update'].includes(formStatus)) {
      return
    }

    let filteredData;

    if (flag === "V") {
      filteredData = actualAccData.filter((item) => item.category_flag === "V");
      //console.log("V, Filtered Data:", filteredData);
    } else if (flag === "O") {
      filteredData = actualAccData.filter((item) => item.category_flag === "O");
      //console.log("O, Filtered Data:", filteredData);
    }

    setFilteredAccData(filteredData);
    handleSetAccData(filteredData)
    setCurrentRecordNo(filteredData.length - 1)
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = visibleData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };


  return (
    <React.Fragment>
      {/* <Form id="accwise-tds-master"> */}
      {/* Radio Group Row start */}
      <Row className="d-flex justify-content-center">
        <Col sm={10} md={6} lg={3}>
          <RadioGroup
            className="radio-button-wrapper  box-border"
            options={[
              { text: "Vendor", value: "V" },
              { text: "Others", value: "O" },
            ]}

            onChange={(e) => { handleTypeChange(e.target.value) }}
            checked={radioData?.category_flag || "V"}

            required
          />
        </Col>
      </Row>


      <Row>
        <Col>

          <div className="table-title">
            <span>Account Wise TDS Master</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
              >
                Add Row
              </ButtonUi>
            )}
          </div>

          <div
            className="table-wrapper-v3"

          >
            <SimpleBar forceVisible="y" autoHide={false} onScrollCapture={(e) => handleScroll(e)}>
              <div className="table-sticky-wrapper" >
                <Table hover>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th className="sticky-column left">Actions</th>
                      )}
                      {/* {headers.map((header, index) => (
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
                           {header.required && (
                          <span className="required-asterisk"> *</span>
                        )}
                          {header.isHelpExist && (<FcInfo title="Info" />)}
                        </th>
                      ))} */}  
                     
                      {headers.map((header, index) => {
                      const words = header.label.split(" "); // split label into words
                      const midpoint = Math.ceil(words.length / 2);
                      const firstLine = words.slice(0, midpoint).join(" ");
                      const secondLine = words.slice(midpoint).join(" ");

                      return (
                        <th
                          key={index}
                          className="tds-header-th"   // this class added by akshay 24/10/25
                          data-required={header.required || false}
                          style={{
                            width: header.width,
                            minWidth: header.width,
                          }}
                        >
                          {firstLine}
                          {secondLine && <br />}
                          {secondLine}
                          {header.required && <span className="required-asterisk"> *</span>}
                          {header.isHelpExist && <FcInfo title="Info" />}
                        </th>
                      );
                    })}

                    </tr>
                  </thead>
                  <tbody>
                    {visibleData.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                        style={{
                          border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                        }}
                        tabIndex={0}>
                        {
                          (formStatus === 'Insert' || formStatus === 'Update') &&
                          <td className="sticky-column left">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={visibleData.length > 1}
                              onDelete={() => handleDeleteRow(data, rowIndex)}
                            //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        }
                        <td className=" table_cell">
                          <TextField
                            type="text"
                            required
                            name="acc_no"
                            value={data.acc_no || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "acc_no", e.target.value, rowIndex, e)}
                            onDoubleClick={
                              () => handleDoubleClick("acc", accHelpListHeader, rowIndex)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update') {
                                validateRequiredField(e, "Account No")
                              }

                            }
                            }


                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="date"
                            required
                            name="eff_date"
                            value={data.eff_date || ""}
                            maxLength={2}
                            onChange={(e) => handleChange("formData", "eff_date", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update') {
                                validateRequiredField(e, "Effective Date")
                              }

                            }
                            }

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            required
                            name="tds_perc"
                            value={data.tds_perc || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("formData", "tds_perc", e.target.value, rowIndex, e)
                            }
                            onBlur={(e) => {
                              if (formStatus === "Insert" || formStatus === "Update" || formStatus === 'Search') {
                                const val = parseFloat(data.tds_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_perc", val.toFixed(3), rowIndex);
                                }

                                // validateRequiredField(e, "TDS Percentage");

                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }
                              }
                            }}
                          />

                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            // required
                            name="tds_surc_perc"
                            value={data.tds_surc_perc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_surc_perc", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_surc_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_surc_perc", val.toFixed(3), rowIndex);
                                }
                                //   validateRequiredField(e, "TDS Sur Percentage");

                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }

                              }

                            }}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            //required
                            name="tds_cess_perc"
                            value={data.tds_cess_perc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_cess_perc", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_cess_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_cess_perc", val.toFixed(3), rowIndex);
                                }

                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }

                              }

                            }}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            //required
                            name="tds_hsc_perc"
                            value={data.tds_hsc_perc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_hsc_perc", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_hsc_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_hsc_perc", val.toFixed(3), rowIndex);
                                }

                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }

                              }

                            }}
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                             required = {Number(data.tds_perc > 0)}
                            name="tds_acc_no"
                            value={data.tds_acc_no || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_acc_no", e.target.value, rowIndex, e)}
                            onDoubleClick={() => handleDoubleClick("tdsAcc", tdsAccHelpListHeader, rowIndex)}
                            onBlur={(e) => {
                              if (formStatus === 'Update' || formStatus === 'Insert' || formStatus === 'Search') {
                                if(Number(data.tds_perc > 0)){
                                  validateRequiredField(e, " TDS account no")
                                } 
                              }
                            }
                            }

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="tds_sur_acc_no"
                            value={data.tds_sur_acc_no || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_sur_acc_no", e.target.value, rowIndex, e)}
                            onDoubleClick={() => handleDoubleClick("tdsSur", tdsSurHelpListHeader, rowIndex)}
                            // onBlur={(e) => {
                            //   if (formStatus === 'Update' || formStatus === 'Insert' || formStatus === 'Search')
                            //     validateRequiredField(e, "TDS surcharge")
                            // }
                            // }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="tds_cess_acc_no"
                            value={data.tds_cess_acc_no || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_cess_acc_no", e.target.value, rowIndex, e)}
                            onDoubleClick={() => handleDoubleClick("tdsCess", tdsCessHelpListHeader, rowIndex)}
                            // onBlur={(e) => {
                            //   if (formStatus === 'Update' || formStatus === 'Insert' || formStatus === 'Search') {
                            //     validateRequiredField(e, "TDS Cess")
                            //   }
                            // }
                            // }

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="tds_hsc_acc_no"
                            value={data.tds_hsc_acc_no || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_hsc_acc_no", e.target.value, rowIndex, e)}
                            onDoubleClick={() => handleDoubleClick("tdsHsc", tdsHscHelpListHeader, rowIndex)}
                            // onBlur={(e) => {
                            //   if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search')
                            //     validateRequiredField(e, "TDS Hsc")
                            // }
                            // }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="certificate_prefix"
                            value={(data.certificate_prefix)?.toUpperCase() || ""}
                            maxLength={2}
                            onChange={(e) => handleChange("formData", "certificate_prefix", e.target.value, rowIndex, e)}
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            //  ref={vendorRef}
                            type="text"
                            required
                            name="v_code"
                            value={data.v_code || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "v_code", e.target.value, rowIndex, e)}
                            onBlur={(e) => handleVendorBlur(e, rowIndex)}

                            onDoubleClick={() => handleDoubleClick("vendor", vendorHelpListHeader, rowIndex)}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            // required
                            name="tds_limit"
                            value={data.tds_limit || ""}
                            maxLength={15}
                            onChange={(e) => handleChange("formData", "tds_limit", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_limit);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_limit", val.toFixed(3), rowIndex);
                                }

                              }
                              const quantity = Number(e.target.value);
                              const hasLocalError = handleLimitError(quantity);

                              if (hasLocalError) {
                                e.target.focus();
                                return;
                              }
                            }}


                          />
                        </td>
                        {/* <td className="table_cell">
                          <TextField
                            type="date"
                            // required
                            name="start_tds_deduction_dt"
                            value={data.start_tds_deduction_dt || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "start_tds_deduction_dt", e.target.value, rowIndex, e)}
                          />
                        </td> */}
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="tds_penal_perc"
                            value={data.tds_penal_perc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_penal_perc", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_penal_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_penal_perc", val.toFixed(3), rowIndex);
                                }
                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }

                              }

                            }}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="tds_non_pan_perc"
                            value={data.tds_non_pan_perc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formData", "tds_non_pan_perc", e.target.value, rowIndex, e)}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Search') {
                                const val = parseFloat(data.tds_non_pan_perc);
                                if (!isNaN(val)) {
                                  handleChange("formData", "tds_non_pan_perc", val.toFixed(3), rowIndex);
                                }
                                const quantity = Number(e.target.value);
                                const hasLocalError = handleQtyError(quantity);

                                if (hasLocalError) {
                                  e.target.focus();
                                  return;
                                }

                              }

                            }}
                          />
                        </td>
                        <td className="table_cell">
                          <RadioGroup
                            className="radio-button-wrapper  box-border"
                            options={[
                              { text: "Goods", value: "G" },
                              { text: "Service", value: "S" },
                            ]}
                            onChange={(e) => handleChange("formData", "goods_service", e.target.value, rowIndex)}
                            checked={data?.goods_service}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          </div>
        </Col>
      </Row>

      {/* Form Row End */}

      <Row>
        <Col sm={12} md={12} lg={6}>
          <TextField
            type="text"
            label="Description"
            value={visibleData[focusedRowIndex]?.acc_desc || ""}
            onChange={(e) => handleChange("formData", "acc_desc", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
        <Col sm={12} md={6} lg={2}>
          <TextField
            type="text"
            label="Pan No."
            value={visibleData[focusedRowIndex]?.pan_no || ""}
            onChange={(e) => handleChange("formData", "pan_no", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
        <Col sm={12} md={6} lg={4}>
          <TextField
            type="text"
            label="Vendor"
            value={visibleData[focusedRowIndex]?.v_name || ""}
            onChange={(e) => handleChange("formData", "v_name", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={6}>
          <TextField
            type="text"
            label="TDS Account Description"
            value={visibleData[focusedRowIndex]?.tds_acc_desc || ""}
            onChange={(e) => handleChange("formData", "tds_acc_desc", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <TextField
            type="text"
            label="TDS Surcharge Account "
            value={visibleData[focusedRowIndex]?.tds_sur_acc_desc || ""}
            onChange={(e) => handleChange("formData", "tds_sur_acc_desc", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={6}>
          <TextField
            type="text"
            label="TDS Cess Account "
            value={visibleData[focusedRowIndex]?.tds_cess_acc_desc || ""}
            onChange={(e) => handleChange("formData", "tds_cess_acc_desc", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <TextField
            type="text"
            label="TDS Hsc Account"
            value={visibleData[focusedRowIndex]?.tds_hsc_acc_desc || ""}
            onChange={(e) => handleChange("formData", "tds_hsc_acc_desc", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
      </Row>
      {/* </Form> */}
    </React.Fragment>
  );
};

export default AccWiseTdsDetails;
