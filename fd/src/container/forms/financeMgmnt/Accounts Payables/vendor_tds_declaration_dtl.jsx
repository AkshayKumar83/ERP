import React, { useEffect } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form } from "reactstrap";
import { headers1, headers2 } from "./vendor_tds_declaration_helper";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import toast from "react-hot-toast";
import Select from "../../../../components/basic/select";

const VendorTdsDeclarationDetails = ({
  formData = [{}],
  handleChange = () => {},
  formStatus = "",
  triggerAddRow,
  disFormData = [{}],
  transYear = [],
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveFormDisData,
  activeFormDisData,
  getValidateData,
  focusedRowIndex1,
  visibleData = [{}],
  setVisibleData,
  setRecordsToShow,
  recordsToShow,
  handleDelete,
  childDataMap,
  vCode,
  otherQueryPera
}) => {
  // const makeFocusOnTableRow = (rowIndex, id) => {
  //   const entry = disFormData[rowIndex];
  //   if (!entry) return;

  //   setFocusedRowIndex(rowIndex);
  //   // setFocusedRowIndex1(rowIndex)

  //   const relatedChildren = formData.filter(
  //     (child) => child.v_code === entry.v_code
  //   );

  //   console.log("Focused Row Index:", rowIndex);
  //   console.log("entry.v_code:", entry.v_code);
  //   console.log("Matching children:", relatedChildren.map(c => c.v_code));

  //   setActiveFormDisData(relatedChildren);
  // };

  useEffect(() => {
    if (vCode && childDataMap) {
      const children = childDataMap[vCode] || [];
      setActiveFormDisData(children);
      console.log("Setting activeFormDisData for", vCode, children);
    }
  }, [vCode, childDataMap]);

  const makeFocusOnTableRow = (rowIndex) => {
    const entry = disFormData[rowIndex];
    if (!entry) return;

    setFocusedRowIndex(rowIndex);
    const relatedChildren = childDataMap[entry.v_code] || [];
    setActiveFormDisData([...relatedChildren]); // Always use a clone
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // User reached bottom, load more
      const nextRecords = disFormData.slice(0, recordsToShow + 100);
      setVisibleData(nextRecords);
      setRecordsToShow((prev) => prev + 100);
    }
  };

  const validateRequiredField = (e, fieldLabel) => { 

    if(!['Insert', 'Update'].includes(formStatus)) {
      return
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

  // handle handleValidateBlur

const handleValidate = async (e, rowIndex, name) => {
    if (!["Insert", "Update"].includes(formStatus)) {
        return;
    }

    const field = e.target;
    const value = field.value;

    validateRequiredField({ target: field }, `${name}`);

    try {
        const result = await getValidateData(
            name,
            value,
            otherQueryPera,
            rowIndex
        );
        console.log("Validation result:", result);

        if (!result.valid) {
            // Only focus if INVALID
            field.focus();
        } else if (result.data) {
           
        }
    } catch (err) {
        console.error("Validation error:", err);
    }
};


  return (
    <>
      <Row>
        <Col md={8} lg="8">
          <Form id="vendor-tds-form" className="ms-4 me-4">
            <div className="table-title">
              <span>Vendor TDS Declaration</span>
              {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={() => triggerAddRow("formData")}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar
                forceVisible="y"
                autoHide={false}
                onScrollCapture={(e) => handleScroll(e)}
              >
                <div className="table-sticky-wrapper height-auto">
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" || formStatus === "Update") && (
                          <th className="sticky-column left">Actions</th>
                        )} */}
                        {headers1.map((header, index) => (
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
                              <span className="required-asterisk">*</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onClick={() => makeFocusOnTableRow(rowIndex, data.id)}
                          // style={{
                          //   border: `${
                          //     rowIndex === focusedRowIndex
                          //       ? "2px solid black"
                          //       : "none"
                          //   }`,
                          // }}
                          tabIndex={0}
                        >
                          {/* above tr styleing comment by akshya for arrow up down behaivour  */}
                       
                          {/* {
                            (formStatus === 'Insert' || formStatus === 'Update') &&
                            <td className="sticky-column left">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={visibleData.length > 1}
                                onDelete={() => handleDelete(data, rowIndex)}
                              // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          } */}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="v_code"
                              value={data.v_code || ""}
                              maxLength={19}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "v_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              } 
                              
                              // disabled={formStatus !== "Query"}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="v_name"
                              value={data.v_name || ""}
                              maxLength={40}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "v_name",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              // disabled={formStatus !== "Query"}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="pan_no"
                              value={data.pan_no || ""}
                              maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "pan_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              // disabled={formStatus !== "Query"}
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
        <Col lg="4" className="mt-4">
          <p className="note-text mt-lg-4">
            Note :- Only Active Vendors are Considered.
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg="12" className="">
          <Form id="vendor-tds-detail-form" className="ms-4 me-4">
            <div className="table-title">
              <span>Vendor TDS Declaration</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddRow("formDetailData")}
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
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="sticky-column left">Actions</th>
                        )}
                        {headers2.map((header, index) => (
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
                              <span className="required-asterisk">*</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeFormDisData?.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{
                            border: `${
                              rowIndex === focusedRowIndex1
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
                                canDelete={activeFormDisData.length >= 1}
                                onDelete={() =>
                                  handleDelete("formData", data, rowIndex)
                                }
                                // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <Select
                              // type="text"
                              required
                              name="trans_year"
                              value={data.trans_year || ""}
                              // maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "trans_year",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              options={transYear}
                              onBlur = {(e)=> {
                               handleValidate(e, rowIndex, 'trans_year')
                              }}
                            />
                          </td>
                          <td className="table_cell">
                            <Checkbox
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "return_filed",
                                  e.target.checked ? "Y" : "N",
                                  rowIndex,
                                  e
                                )
                              }
                              checked={data?.return_filed === "Y"}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="acknowledgement_no"
                              value={data.acknowledgement_no || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "acknowledgement_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              //required
                              name="acknowledgement_date"
                              value={data.acknowledgement_date || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "acknowledgement_date",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              // required
                              name="last_date_return_file"
                              value={data.last_date_return_file || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "last_date_return_file",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="contact_person"
                              value={data.contact_person || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "contact_person",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="contact_person_tel"
                              value={data.contact_person_tel || ""}
                              maxLength={10}
                              onChange={(e) =>
                                handleChange(
                                  "formData",
                                  "contact_person_tel",
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
        <p className="note-text ">
          Note :- If in the Govt. Portal the party is defined as specified
          person then tick the check box or leave as it is
        </p>
      </Row>
    </>
  );
};

export default VendorTdsDeclarationDetails;
