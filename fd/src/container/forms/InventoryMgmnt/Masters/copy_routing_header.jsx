

import React, { useRef } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import { FcInfo } from "react-icons/fc";
import MuiTextField from "../../../../components/basic/muiTextField";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import { fromRouteHelpListHeader, handleValidateField, headers, ToRouteHelpListHeader, validateFromDb } from "./copy_routing_helper";
import ButtonUi from "../../../../components/basic/button";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";

const CopyRoutingHeader = ({
  formData = [{}],
  setFormData,
  tempData,
  formStatus,
  handleChange,
  focusedRowIndex,
  setFocusedRowIndex,
  // triggerAddRow,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  // handleDelete=()=>{},

}) => {

   const validationLockRef = useRef(false);
   const pendingTabRef = useRef(null);



  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
  };

  const handleDoubleClick = (field, header, rowIndex) => {
    if (["Insert", "Search", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true, rowIndex);
    }
  };


const validateOutputCode = async ({ e, rowIndex, moveNext }) => {
  if (validationLockRef.current) return;
  validationLockRef.current = true;

  const value = e.target.value?.trim() || null;

  const res = await validateFromDb({
    type: "NEW_IT_CODE",
    value,
  });

  //  INVALID → wahi focus
  if (!res) {
    validationLockRef.current = false;
    setTimeout(() => e.target.focus(), 0);
    return;
  }

  //  VALID
  setFormData(prev => {
    const updated = [...prev];
    updated[rowIndex] = {
      ...updated[rowIndex],
      new_it_code: value,
      new_it_name: res.it_name || "",
    };
    return updated;
  });

  validationLockRef.current = false;

  // keyboard case only
  if (moveNext) {
    setTimeout(() => {
      document
        .querySelectorAll('input[name="new_final_code"]')
        [rowIndex]?.focus();
    }, 0);
  }
};

const validateFinalCode = async ({ e, rowIndex, moveNext }) => {
  if (validationLockRef.current) return;
  validationLockRef.current = true;

  const value = e.target.value?.trim() || null;

  const res = await validateFromDb({
    type: "NEW_FINAL_CODE",
    value,
  });

  //  INVALID
  if (!res) {
    validationLockRef.current = false;
    setTimeout(() => e.target.focus(), 0);
    return;
  }

  //  VALID
  setFormData(prev => {
    const updated = [...prev];
    updated[rowIndex] = {
      ...updated[rowIndex],
      new_final_code: value,
    };
    return updated;
  });

  validationLockRef.current = false;

  // moveNext sirf Tab / Enter ke liye
  if (moveNext) {
    setTimeout(() => {
      document
        .querySelectorAll('input[type="checkbox"]')
        ?.[rowIndex * 2]?.focus();
    }, 0);
  }
};

const handleFill = async () => {
  if(!["Insert"].includes(formStatus))return;
  const fromRouteNo = tempData?.from_route_no?.trim();
  const toRouteNo = tempData?.to_route_no?.trim();

  if (!fromRouteNo) {
    toast.error("From Route No. is required");
    return;
  }
  if (!toRouteNo) {
    toast.error("To Route No. is required");
    return;
  }

  try {
    const query = new URLSearchParams({
      from_route_no: fromRouteNo,
      to_route_no: toRouteNo,
    });

    const data = await fetchAppData(
      `${APP_PROD_API.GET_COPY_ROUTING_FORM_DATA}?${query}`
    );

    if (!data?.detail || data.detail.length === 0) {
      toast.error("No routing data found");
      setFormData([]);
      return;
    }

    // table fill
    setFormData(
      data.detail.map(row => ({
        ...row,

      }))
    );
    setFocusedRowIndex(0);
    
  } catch (err) {
    console.error(err);
    toast.error(err?.message || "Failed to load routing data");
  }
};


 

  return (
    <>
    <Form id="copy-routing">
      <Row>
        <Col xl={3}>
          <MuiTextField
            type="text"
            label="From Route No."
            maxLength={20}
            name="from_route_no"
            value={tempData?.from_route_no || ""}
            onChange={(e) => handleChange("from_route_no", e.target.value)}
            showHelpIcon
           onDoubleClick={() => handleDoubleClick("fromRoute", fromRouteHelpListHeader)}
           onBlur={(e) => handleValidateField(e, formStatus)}
           required
          />
        </Col>
        <Col xl={3}>
          <MuiTextField
            type="text"
            label="To Route No."
             maxLength={20}
            name="to_route_no"
            value={tempData?.to_route_no || ""}
            onChange={(e) => handleChange("to_route_no", e.target.value)}
            showHelpIcon
            onDoubleClick={() => handleDoubleClick("toRoute", ToRouteHelpListHeader)}
            onBlur={(e) => handleValidateField(e, formStatus)}
            required
          />
        </Col>
        <Col xl={2}>
        <ButtonUi onClick={handleFill}>Fill</ButtonUi>
        </Col>
      </Row>

      {/* table start here */}
      <Row>
        <Col>
          {/* <Form id="copy-routing"> */}
            <div className="table-title">
              <span>Acc. Code For Purchase Voucher</span>
              {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={triggerAddRow}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>
            <div className="table-wrapper-v3">
              {/* <SimpleBar forceVisible="y" autoHide={false} onScrollCapture={(e)=> handleScroll(e)}> */}
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper height-auto">
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="">Actions</th>
                        )} */}
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
                            {header.required && (
                             <span className='required-asterisk'>*</span>)}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() =>
                            makeFocusOnTableRow(rowIndex, data.sr_no)
                          }
                          style={{
                            border:
                              rowIndex === focusedRowIndex
                                ? "2px solid black"
                                : "none",
                          }}
                          tabIndex={0}
                        >
                          {/* {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <td>
                              <RowAction
                                formStatus={formStatus}
                                canDelete={formData.length > 0}
                                onDelete={() => handleDelete(rowIndex)}
                              />
                            </td>
                          )} */}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="operation_no"
                              value={data?.operation_no || ""}
                              maxLength={20}
                              onChange={(e) => handleChange( "operation_no", e.target.value, rowIndex, e ) }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_code"
                              value={data?.it_code || ""}
                              maxLength={20}
                              onChange={(e) => handleChange( "it_code", e.target.value, rowIndex, e ) } 
                              disabled
                              />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_name"
                              value={data?.it_name || ""}
                              maxLength={20}
                              onChange={(e) => handleChange( "it_name", e.target.value, rowIndex, e ) } 
                              disabled
                              />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="wc_no"
                              value={data?.wc_no || ""}
                              maxLength={19}
                              onChange={(e) => handleChange( "wc_no", e.target.value, rowIndex, e ) }
                            disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="final_code"
                              maxLength={20}
                              value={data?.final_code || ""}
                              onChange={(e) => handleChange( "final_code", e.target.value, rowIndex, e ) }
                             disabled
                            />
                          </td>
                         
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="new_it_code"
                              value={data?.new_it_code || ""}
                              onChange={(e) =>handleChange("new_it_code",e.target.value,rowIndex,e)}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault();
                                    validateOutputCode({ e, rowIndex, moveNext: true, })}
                                  }}
                                 onBlur={(e) => { validateOutputCode({ e, rowIndex, moveNext: false});}} 
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="new_it_name"
                              value={data?.new_it_name || ""}
                              onChange={(e) =>handleChange("new_it_name",e.target.value,rowIndex,e)}
                             disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="new_final_code"
                              value={data?.new_final_code || "" }
                               onChange={(e) =>  handleChange(  "new_final_code",  e.target.value,  rowIndex,  e  )  }
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault(); 
                                     validateFinalCode({e,rowIndex,moveNext: true })} }}
                                  onBlur={(e) => { validateFinalCode({ e, rowIndex, moveNext: false,  }) }}
                             
                            />
                          </td>
                          <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange( "cancel_flag", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                  checked={data?.cancel_flag === "Y"}
                                  
                                />
                              </td>
                              <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange( "select_check", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                  checked={data?.select_check === "Y"}
                                />
                              </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
          {/* </Form> */}
        </Col>
      </Row>
      </Form>
    </>
  );
};

export default CopyRoutingHeader;
