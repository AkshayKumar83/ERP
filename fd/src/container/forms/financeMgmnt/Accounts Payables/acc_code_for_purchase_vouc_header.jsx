import React from "react";
import { Col, Form, Row, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import {
  accCodePurVcurHeader,
  AccHelpListHeader,
  CessHelpListHeader,
  DescHelpListHeader,
  handleValidateField,
  HscHelpListHeader,
  ItBaseHelpListHeader,
  ItemHelpListHeader,
  ItSubHelpListHeader,
  ItTypeHelpListHeader,
  typeHelpListHeader,
  vendorHelpListHeader,
} from "./acc_code_for_purchase_vouc_helper";
import RowAction from "../../../../components/common/rowAction";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RadioButton from "../../../../components/basic/radioButton";
import { FcInfo } from "react-icons/fc";

const AccCodeForPurchaseVoucherHeader = ({
  formData = [{}],
  setFormData,
  tempData,
  formStatus,
  handleChange,
  focusedRowIndex,
  setFocusedRowIndex,
  triggerAddRow,
  poCat = [],
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  handleDelete=()=>{},
  // setShowRecord,
  // showRecord,
  // actualData = [{}],

}) => {
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

 

  return (
    <>
      <Row>
        <Col xl={2}>
          <TextField
            type="text"
            label="Type"
            maxLength={5}
            name="type"
            value={tempData?.type || ""}
            onChange={(e) => handleChange("type", e.target.value)}
            disabled={formStatus !== "Search"}
            onDoubleClick={() => handleDoubleClick("Type",typeHelpListHeader ) }
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Type Desc"
            name="type_desc"
            value={tempData?.type_desc || ""}
            onChange={(e) => handleChange("type_desc", e.target.value)}
            disabled={formStatus !== "Search"}
            onDoubleClick={() => handleDoubleClick("Desc",DescHelpListHeader ) }
          />
        </Col>
      </Row>

      {/* table start here */}
      <Row>
        <Col>
          <Form id="acc-code-pur-vucr">
            <div className="table-title">
              <span>Acc. Code For Purchase Voucher</span>
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
              {/* <SimpleBar forceVisible="y" autoHide={false} onScrollCapture={(e)=> handleScroll(e)}> */}
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="sticky-column left">Actions</th>
                        )}
                        {accCodePurVcurHeader.map((header, index) => (
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
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <td>
                              <RowAction
                                formStatus={formStatus}
                                canDelete={formData.length > 0}
                                onDelete={() => handleDelete(data?.row_id)}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="acc_no"
                              value={data?.acc_no || ""}
                              maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "acc_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "AccNo",
                                  AccHelpListHeader,
                                  rowIndex
                                )
                              }
                              onBlur= {(e)=>handleValidateField(e,formStatus)}
                              required
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="sub_acc_no"
                              value={data?.sub_acc_no || ""}
                              maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "sub_acc_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "SubAccNo",
                                  CessHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="hsc_acc_no"
                              value={data?.hsc_acc_no || ""}
                              maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "hsc_acc_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "HscAccNo",
                                  HscHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="v_code"
                              value={data?.v_code || ""}
                              maxLength={19}
                              onChange={(e) =>
                                handleChange(
                                  "v_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "VCode",
                                  vendorHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_code"
                              maxLength={20}
                              value={data?.it_code || ""}
                              onChange={(e) =>
                                handleChange(
                                  "it_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "ItCode",
                                  ItemHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <Select
                              type="text"
                              name="po_cat_prefix"
                              // maxLength={2}
                              value={data?.po_cat_prefix || ""}
                              onChange={(e) =>
                                handleChange(
                                  "po_cat_prefix",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              options={poCat}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_type_desc"
                              value={data?.it_type_desc || ""}
                              onChange={(e) =>
                                handleChange(
                                  "it_type_desc",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "ItType",
                                  ItTypeHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_base_desc"
                              value={data?.it_base_desc || ""}
                              onChange={(e) =>
                                handleChange(
                                  "it_base_desc",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "ItBase",
                                  ItBaseHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="it_sub_c_desc"
                              value={data?.it_sub_c_desc || ""}
                              onChange={(e) =>
                                handleChange(
                                  "it_sub_c_desc",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "ItSubc",
                                  ItSubHelpListHeader,
                                  rowIndex
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <RadioButton
                              className="radio-button"
                              required
                              //required={false}
                              type="radio"
                              name="st_type"
                              value="L"
                              checked={data?.st_type === "L"}
                              onChange={(e) =>
                                handleChange(
                                  "st_type",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <RadioButton
                              className="radio-button"
                              required
                              //required={false}
                              type="radio"
                              name="st_type"
                              value="C"
                              checked={data?.st_type === "C"}
                              onChange={(e) =>
                                handleChange(
                                  "st_type",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <RadioButton
                              className="radio-button"
                              required
                              //required={false}
                              type="radio"
                              name="st_type"
                              value="N"
                              checked={data?.st_type === "N"}
                              onChange={(e) =>
                                handleChange(
                                  "st_type",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
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

      <Row className="mt-1">
        <Col xl={4}>
          <TextField
            type="text"
            label="Item Description"
            // maxLength={30}
            name="it_desc"
            value={formData[focusedRowIndex]?.it_desc || ""}
            onChange={(e) =>
              handleChange("it_desc", e.target.value, focusedRowIndex, e)
            }
            disabled
          />
        </Col>
        <Col xl={4}>
          <TextField
            type="text"
            label="Acc Description"
            // maxLength={30}
            name="acc_desc"
            value={formData[focusedRowIndex]?.acc_desc || ""}
            onChange={(e) =>
              handleChange("acc_desc", e.target.value, focusedRowIndex, e)
            }
            disabled
          />
        </Col>
        <Col xl={4}>
          <TextField
            type="text"
            label="Cess Acc Description"
            // maxLength={30}
            name="sub_acc_desc"
            value={formData[focusedRowIndex]?.sub_acc_desc || ""}
            onChange={(e) =>
              handleChange("sub_acc_desc", e.target.value, focusedRowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col xl={4}>
          <TextField
            type="text"
            label="C Name"
            // maxLength={30}
            name="v_name"
            value={formData[focusedRowIndex]?.v_name || ""}
            onChange={(e) =>
              handleChange("v_name", e.target.value, focusedRowIndex, e)
            }
            disabled
          />
        </Col>
        <Col xl={4}>
          <TextField
            type="text"
            label="Hsc Acc Description"
            // maxLength={30}
            name="hsc_acc_desc"
            value={formData[focusedRowIndex]?.hsc_acc_desc || ""}
            onChange={(e) =>
              handleChange("hsc_acc_desc", e.target.value, focusedRowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>
    </>
  );
};

export default AccCodeForPurchaseVoucherHeader;
