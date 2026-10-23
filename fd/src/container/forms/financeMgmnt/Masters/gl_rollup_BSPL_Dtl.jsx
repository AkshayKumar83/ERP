import React, { useState } from 'react'
import { Row, Col, Form, Table } from "reactstrap"
import { barrelFourHeader, barrelOneHeader, barrelThreeHeader, barrelTwoHeader, isDeletableRollup } from './gl_rollup_BSPL_hlpr';
import TextField from '../../../../components/basic/textField';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from "../../../../components/common/rowAction";

import toast from 'react-hot-toast';

const GLrollupBSPLDtl = ({
  hierarchicalData,
  setHierarchicalData,
  focusedRows,
  setFocusedRows,
  handleChange,
  formStatus,
  triggerAddRow,
  setDeletedData=()=>{}
}) => {
 
  
  const formData = hierarchicalData.level1 || [];
  const barrelTwo = hierarchicalData.level1[focusedRows.level1]?.level2 || [];
  const barrelThree = hierarchicalData.level1[focusedRows.level1]?.level2[focusedRows.level2]?.level3 || [];
  const barrelFour =hierarchicalData.level1[focusedRows.level1]?.level2[focusedRows.level2]?.level3[focusedRows.level3]?.level4 || [];


  const makeFocusOnBarrel1 = (rowIndex) => {
    if (formData[rowIndex]?.level1) {
      setFocusedRows((prev) => ({ ...prev, level1: rowIndex, level2: 0, level3: 0, level4: 0 }));
    }
  };

  const makeFocusOnBarrel2 = (rowIndex) => {
    if (barrelTwo[rowIndex]) {
      setFocusedRows((prev) => ({ ...prev, level2: rowIndex, level3: 0, level4: 0 }));
    }
  };

  const makeFocusOnBarrel3 = (rowIndex) => {
    if (barrelThree[rowIndex]) {
      setFocusedRows((prev) => ({ ...prev, level3: rowIndex, level4: 0 }));
    }
  };

  const makeFocusOnBarrel4 = (rowIndex) => {
    if (barrelFour[rowIndex]) {
      setFocusedRows((prev) => ({ ...prev, level4: rowIndex }));
    }
  };


const buildFullFormData = (barrelName, data) => {
  const l1 = hierarchicalData.level1[focusedRows.level1]?.level1 || '';
  const l2 = hierarchicalData.level1[focusedRows.level1]
    ?.level2[focusedRows.level2]?.level2 || '';
  const l3 = hierarchicalData.level1[focusedRows.level1]
    ?.level2[focusedRows.level2]
    ?.level3[focusedRows.level3]?.level3 || '';

  if (barrelName === "formData") {
    return { level1: data.level1 || '' };
  } else if (barrelName === "barrelTwo") {
    return { level1: l1, level2: data.level2 || '' };
  } else if (barrelName === "barrelThree") {
    return { level1: l1, level2: l2, level3: data.level3 || '' };
  } else if (barrelName === "barrelFour") {
    return { level1: l1, level2: l2, level3: l3, level4: data.level4 || '' };
  }
};




  async function handleDelete(data, rowIndex, barrelName) {
    const isNewRecord = data?.isNew;

    // 1. Prevent deleting if record has children
    const hasChildren = (() => {
      if (barrelName === "formData") {
        const level2 = hierarchicalData.level1[rowIndex]?.level2;
        return level2 && level2.length > 0;
      } else if (barrelName === "barrelTwo") {
        const level3 = hierarchicalData.level1[focusedRows.level1]
          ?.level2[rowIndex]?.level3;
        return level3 && level3.length > 0;
      } else if (barrelName === "barrelThree") {
        const level4 = hierarchicalData.level1[focusedRows.level1]
          ?.level2[focusedRows.level2]
          ?.level3[rowIndex]?.level4;
        return level4 && level4.length > 0;
      }
      return false;
    })();

    if (hasChildren) {
      toast.error("Please delete child records first.");
      return;
    }

    // 2. If record is newly created, delete directly without DB check
    if (isNewRecord) {
      setHierarchicalData((prev) => {
        const newData = structuredClone(prev);
        if (barrelName === "barrelFour") {
          newData.level1[focusedRows.level1]
            .level2[focusedRows.level2]
            .level3[focusedRows.level3]
            .level4.splice(rowIndex, 1);
        } else if (barrelName === "barrelThree") {
          newData.level1[focusedRows.level1]
            .level2[focusedRows.level2]
            .level3.splice(rowIndex, 1);
        } else if (barrelName === "barrelTwo") {
          newData.level1[focusedRows.level1].level2.splice(rowIndex, 1);
        } else if (barrelName === "formData") {
          newData.level1.splice(rowIndex, 1);
        }
        return newData;
      });
      return;
    }

      // 3. If it's not new, call backend for validation before deletion
    const formData = buildFullFormData(barrelName, data);
    const isValidToDelete = await isDeletableRollup({
      formData,
      formStatus: formStatus,
      barrel:barrelName
    });


    if (!isValidToDelete?.canDelete) {
      toast.error(isValidToDelete?.message || "This record cannot be deleted.");
      return;
    }

    //  Track deleted row
    if (formStatus === 'Update') {
      const fullData = buildFullFormData(barrelName, data);
      setDeletedData((prev) => [...prev, { ...fullData, barrel: barrelName }]);
    }

    // Passed all checks — delete from state
    setHierarchicalData((prev) => {
      const newData = structuredClone(prev);
      if (barrelName === "barrelFour") {
        newData.level1[focusedRows.level1]
          .level2[focusedRows.level2]
          .level3[focusedRows.level3]
          .level4.splice(rowIndex, 1);
      } else if (barrelName === "barrelThree") {
        newData.level1[focusedRows.level1]
          .level2[focusedRows.level2]
          .level3.splice(rowIndex, 1);
      } else if (barrelName === "barrelTwo") {
        newData.level1[focusedRows.level1].level2.splice(rowIndex, 1);
      } else if (barrelName === "formData") {
        newData.level1.splice(rowIndex, 1);
      }
      return newData;
    });
  }



  return (
    <React.Fragment>
      <Row>
        {/* Barrel 1 */}
        <Col xs={12} lg={6}>
          <Form id="">
            <div className="table-title">
              <span style={{fontSize:"14px"}}>Barrel-1</span>
            </div>
            <div className="table-wrapper-v3"
            >
              <SimpleBar forceVisible="y" autoHide={false}>
              <div className="table-sticky-wrapper">
                <Table hover>
                  <thead>
                    <tr>
                      {barrelOneHeader.map((header, index) => (
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
                      <tr   key={rowIndex}
                      onClick={() => makeFocusOnBarrel1(rowIndex)}
                      style={{
                        border: `${
                          rowIndex === focusedRows.level1
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0} >
                        <td className="table_cell">
                          <TextField
                          style={{ pointerEvents: "none" }}
                            type="text"
                            name="level1"
                            value={data?.level1 || ""}
                            maxLength={2}
                            onChange={(e) =>handleChange("level1",e.target.value,rowIndex,e,"formData")}
                            disabled
                            required
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                          style={{ pointerEvents: "none" }}
                            maxLength={60}
                            type="text"
                            name="cat_desc"
                            value={data?.cat_desc || ""}
                            onChange={(e) => handleChange( "cat_desc", e.target.value, rowIndex, e, "formData" ) }
                            disabled
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

        {/* Barrel 2 */}
        <Col xs={12} lg={6}>
          <Form id="barrelTwo">
            <div className="table-title">
              <span style={{fontSize:"14px"}}>Barrel-2</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddRow("barrelTwo")} >
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
                      {barrelTwoHeader.map((header, index) => (
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
                    {barrelTwo.map((data, rowIndex) => (
                      <tr   key={rowIndex}
                      onClick={() => makeFocusOnBarrel2(rowIndex)}
                      style={{
                        border: `${
                          rowIndex === focusedRows.level2
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0}>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={barrelTwo.length > 0}
                                onDelete={() => handleDelete(data, rowIndex,"barrelTwo")}
                                //  onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="level2"
                            value={data?.level2 || ""}
                            maxLength={2}
                            onChange={(e) =>handleChange("level2",e.target.value,rowIndex,e,"barrelTwo")}
                            // onDoubleClick={() => handleDoubleClick("level2", barrel2Data)}
                             disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                          maxLength={60}
                          required
                            type="text"
                            name="cat_desc"
                            value={data?.cat_desc || ""}
                            onChange={(e) => handleChange( "cat_desc", e.target.value, rowIndex, e, "barrelTwo" ) }
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

      <Row>
        {/* Barrel 3 */}
        <Col xs={12} lg={6}>
          <Form id="barrelThree">
            <div className="table-title">
              <span style={{fontSize:"14px"}}>Barrel-3</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddRow("barrelThree")}
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
                      {barrelThreeHeader.map((header, index) => (
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
                    {barrelThree.map((data, rowIndex) => (
                      <tr   key={rowIndex}
                      onClick={() => makeFocusOnBarrel3(rowIndex)}
                      style={{
                        border: `${
                          rowIndex === focusedRows.level3
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0}>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={barrelThree.length > 0}
                                onDelete={() => handleDelete(data, rowIndex,"barrelThree")}
                                //  onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                          required
                            type="text"
                            name="level3"
                            value={data?.level3 || ""}
                            maxLength={2}
                            onChange={(e) =>handleChange("level3",e.target.value,rowIndex,e,"barrelThree")}
                            // onDoubleClick={() => handleDoubleClick("level3", barrel3Data)}
                             disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                          required
                              maxLength={60}
                            type="text"
                            name="cat_desc"
                            value={data?.cat_desc || ""}
                            onChange={(e) => handleChange( "cat_desc", e.target.value, rowIndex, e, "barrelThree" ) }
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

        {/* Barrel 4 */}
        <Col xs={12} lg={6}>
          <Form id="barrelFour">
            <div className="table-title">
              <span style={{fontSize:"14px"}}>Barrel-4</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddRow("barrelFour")}
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
                      {barrelFourHeader.map((header, index) => (
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
                    {barrelFour.map((data, rowIndex) => (
                      <tr   key={rowIndex}
                      onClick={() => makeFocusOnBarrel4(rowIndex)}
                      style={{
                        border: `${
                          rowIndex === focusedRows.level4
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0}>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={barrelFour.length > 0}
                                onDelete={() => handleDelete(data, rowIndex,"barrelFour")}
                                //  onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                          required
                            type="text"
                            name="level4"
                            value={data?.level4 || ""}
                            maxLength={2}
                            onChange={(e) =>handleChange("level4",e.target.value,rowIndex,e,"barrelFour")}
                            // onDoubleClick={() => handleDoubleClick("level4", barrel4Data)}
                             disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                          required
                            maxLength={60}
                            type="text"
                            name="cat_desc"
                            value={data?.cat_desc || ""}
                            onChange={(e) => handleChange( "cat_desc", e.target.value, rowIndex, e, "barrelFour" ) }
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
    </React.Fragment>
  )
}

export default GLrollupBSPLDtl;

