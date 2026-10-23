
import React from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { headers, validateFromDb } from "./define_operation_helper";
import toast from "react-hot-toast";
    import { useRef } from "react";
    
const DefineOperationHeader = ({
  formData = [{}],
  setFormData,
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex
}) => {



const validationLockRef = useRef(false);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };


// const handleOpnNoBlur = async (e, rowIndex) => {
//     const value = e.target.value?.trim();
//     const row = formData[rowIndex];

//   if (!value) {
//     toast.error("Operation No. can't be blank");
//     e.target.focus();
//     return;
//   }
//      // IMPORTANT: sirf NEW ya CHANGED row pe validation
//      if (!row?.isNew && row?.isStatus !== "changed") {
//          return; //  API call hi nahi hogi
//      }

//   const isValid = await validateFromDb({
//     type: "OPERATION_NO",
//     value,
//   });

//   if (!isValid) {
//     e.target.focus();
//   }
// };

// const handleOpnNoBlur = async (e, rowIndex) => {
//   if (validationLockRef.current) return;

//   const value = e.target.value?.trim();
//   const row = formData[rowIndex];

//   if (!value) {
//     toast.error("Operation No. can't be blank");
//     return;
//   }

//   if (!row?.isNew && row?.isStatus !== "changed") return;

//   validationLockRef.current = true;

//   const isValid = await validateFromDb({
//     type: "OPERATION_NO",
//     value,
//     extra: {
//       opn_id: row.opn_id,
//       formStatus,
//     },
//   });

//   if (!isValid) {
//     // 🔥 focus ko defer karo
//     setTimeout(() => {
//       e.target.focus();
//       validationLockRef.current = false;
//     }, 0);
//     return;
//   }

//   validationLockRef.current = false;
// };

const handleOpnNoBlur = async (e, rowIndex) => {
  if (validationLockRef.current) return;

  const value = e.target.value?.trim();
  const row = formData[rowIndex];

  if (!value) return;

  //  UPDATE & reverted back → skip validation
  if (
    formStatus === "Update" &&
    !row.isNew &&
    row.__original?.operation_no === value
  ) {
    return;
  }

  // sirf new / actually changed rows
  if (!row.isNew && row.isStatus !== "changed") return;

  validationLockRef.current = true;

  const isValid = await validateFromDb({
    type: "OPERATION_NO",
    value,
    extra: {
      opn_id: row.opn_id,
      formStatus,
    },
  });

  if (!isValid) {
    setTimeout(() => e.target.focus(), 0);
  }

  validationLockRef.current = false;
};


// const handleOpnDescBlur = async (e, rowIndex) => {
//   const value = e.target.value?.trim();
//   const row = formData[rowIndex];

//   if (!value) {
//     // toast.error("Oparation Description can not be null");
//     // e.target.focus();
//     return;
//   }

//   if (!row?.isNew && row?.isStatus !== "changed") {
//     return;
//   }

//   const isValid = await validateFromDb({
//     type: "OPERATION_DESC",
//     value,
//      extra: { }, // UPDATE safe
//   });

//   if (!isValid) {
//     e.target.focus();
//   }
// };

// const handleOpnDescBlur = async (e, rowIndex) => {
//   if (validationLockRef.current) return;

//   const value = e.target.value?.trim();
//   const row = formData[rowIndex];

//   if (!value) return;
//   if (!row?.isNew && row?.isStatus !== "changed") return;

//   validationLockRef.current = true;

//   const isValid = await validateFromDb({
//     type: "OPERATION_DESC",
//     value,
//     extra: {
//       opn_id: row.opn_id,
//       formStatus,
//     },
//   });

//   if (!isValid) {
//     setTimeout(() => {
//       e.target.focus();
//       validationLockRef.current = false;
//     }, 0);
//     return;
//   }

//   validationLockRef.current = false;
// };

const handleOpnDescBlur = async (e, rowIndex) => {
  if (validationLockRef.current) return;

  const value = e.target.value?.trim();
  const row = formData[rowIndex];

  if (!value) return;

  //  UPDATE & reverted back → skip validation
  if (
    formStatus === "Update" &&
    !row.isNew &&
    row.__original?.opn_desc === value
  ) {
    return;
  }

  // sirf new / actually changed rows
  if (!row.isNew && row.isStatus !== "changed") return;

  validationLockRef.current = true;

  const isValid = await validateFromDb({
    type: "OPERATION_DESC",
    value,
    extra: {
      opn_id: row.opn_id,
      formStatus,
    },
  });

  if (!isValid) {
    setTimeout(() => e.target.focus(), 0);
  }

  validationLockRef.current = false;
};


  return (
    <>
      <div className=" ">
        <Card className=" p-2">
          <Row className="mb-2">
            <Col  xl={12}>
              <Form id="define-oprtn" className="">
                <div className="table-title">
                  <span>Operation Name</span>
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
                <div
                  className="table-wrapper-v3"
                  // style={{ height: "180px", maxHeight: "180px" }}
                >
                  <SimpleBar forceVisible="y" autoHide={false}>
                     <div className="table-sticky-wrapper height-auto">
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
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
                              }}
                            >
                              {header.label}
                              {header.required && (
                            <span className='required-asterisk'>*</span>
                      )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData &&
                          formData.map((data, rowIndex) => (
                            <tr
                              key={rowIndex}
                              onFocus={() =>
                                makeFocusOnTableRow(rowIndex, data.id)
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
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                  required
                                  name="operation_no"
                                   value={data?.operation_no || ""}
                                  maxLength={15}
                                  onChange={(e) =>  handleChange(  "operation_no",  e.target.value,  rowIndex,  e  )  }
                                onBlur={(e) => handleOpnNoBlur(e, rowIndex)}
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="opn_desc"
                                 value={data?.opn_desc || ""}
                                maxLength={100}
                                onChange={(e) =>handleChange("opn_desc", e.target.value, rowIndex, e)}
                                onBlur={(e) => handleOpnDescBlur(e, rowIndex)}
                               
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="opn_stage_name"
                                 value={data?.opn_stage_name || ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("opn_stage_name", e.target.value, rowIndex, e)}
                               
                              />
                            </td>

                              <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange( "machin_based", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                  checked={data?.machin_based === "Y"}
                                  
                                />
                              </td>
                              <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange( "inspection_flag", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                  checked={data?.inspection_flag === "Y"}
                                />
                              </td>
                               <td className="table_cell">
                              <TextField
                                type="text"
                                name="opn_dtl_desc"
                                 value={data?.opn_dtl_desc || ""}
                                maxLength={2000}
                                onChange={(e) =>handleChange("opn_dtl_desc", e.target.value, rowIndex, e)} 
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
        </Card>
      </div>
    </>
  );
};

export default DefineOperationHeader;

