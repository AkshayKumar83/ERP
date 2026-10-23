
import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Form, Table } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import { itemWiseAccEntryHeader, PurchaseAccHeadHelpListHeader, PurchaseAccHelpListHeader, SalesAccHeadHelpListHeader, SalesAccHelpListHeader, validatePurchaseAccHeadAPI, validateSalesAccHeadAPI } from './item_wise_account_entry_helper'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import { FcInfo } from 'react-icons/fc'
import { APP_PROD_API } from '../../../../utils/api'
import toast from 'react-hot-toast'

const ItemWiseAccountEntryDtl = ({
  formData,
  setFormData,
  controlData,
  handleControlChange,
  formStatus,
  handleChange,
  itemBase = [],
  itemType = [],
  itemSubCat = [],
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  focusedRowIndex,
  setFocusedRowIndex,
  handleDelete,
  paginationPage,
  setPaginationPage,
  handleCancel
}) => {
  // const [paginationPage, setPaginationPage] = useState(1);
  const rowsPerPage = 10;
  const [fieldsDisabled, setFieldsDisabled] = useState(false);


  useEffect(() => {
  const firstRowIndex = (paginationPage - 1) * rowsPerPage;

  
  if (
    focusedRowIndex >= firstRowIndex &&
    focusedRowIndex < firstRowIndex + rowsPerPage
  ) {
    return; 
  }

  // Agar focus current page ke bahar hai (ya pehli baar open hua hai)
  if (formData[firstRowIndex]) {
    setFocusedRowIndex(firstRowIndex);
  }
}, [paginationPage, formData, focusedRowIndex, setFocusedRowIndex]);


  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedRowIndex(rowIndex); // Only update focused row, don't reset pagination
  };

  const totalPages = Math.ceil(formData.length / rowsPerPage);
  const paginatedData = formData.slice(
    (paginationPage - 1) * rowsPerPage,
    paginationPage * rowsPerPage
  );

  const handlePreviousPage = () => {
    if (paginationPage > 1) {
      setPaginationPage(paginationPage - 1);
    }
  };

  const handleNextPage = () => {
    if (paginationPage < totalPages) {
      setPaginationPage(paginationPage + 1);
    }
  };

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  useEffect(() => {
    handleControlChange("rg_sort", "I");
    setFieldsDisabled(true);
  }, []);

  useEffect(() => {
    if (controlData?.rg_sort === "I") {
      setFieldsDisabled(true);
    } else {
      setFieldsDisabled(false);
    }
  }, [controlData?.rg_sort]);

  const handleRadioChange = (e) => {
    if (formStatus !== "Update") {
      toast.error(`Form working only update mode. Please switch to Update mode.`);
      return;
    }

    const value = e.target.value;
    handleControlChange("rg_sort", value);

    if (value === "I") {
      setFieldsDisabled(true);
    } else {
      setFieldsDisabled(false);
    }
  };

  const handleShowItemClick = async () => {
    if (formStatus !== "Update") {
      toast.error(`Form working only update mode. Please switch to Update mode.`);
      return;
    }

    if (controlData?.rg_sort !== "I") {
      return;
    }

   try {
  const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_SHOW_ITEM}`, {
    credentials: 'include'
  });

  const data = await response.json();

  if (data?.type === "found") {
    setFormData(data.itemWiseAccEntry);
    setFocusedRowIndex(0);
  } else {
    setFormData([]);
    toast.error(data?.message || "No Items defined for above Category.");
  }
    } catch (error) {
      console.error("Error fetching item data:", error);
      toast.error(error.message || "Failed to fetch item data.");
    }

  };

  const validatePurchaseAccHead = async (e) => {
    if (controlData.rg_sort !== 'C' || formStatus !== 'Update') {
      return;
    }

    if (!controlData.purac_head) {
      toast.error("Please enter Purchase Account Head.");
      e.target.focus();
      return;
    }

    const result = await validatePurchaseAccHeadAPI(controlData.purac_head);
    if (!result.valid) {
      toast.error(result.message || "Invalid Purchase Account Head.");
    }
  };

  const validateSalesAccHead = async (e) => {
    if (controlData.rg_sort !== 'C' || formStatus !== 'Update') {
      return;
    }

    if (!controlData.saleac_head) {
      e.target.focus();
    }

    const result = await validateSalesAccHeadAPI(controlData.saleac_head);

    if (!result.valid) {
      toast.error(result.message || "Invalid Sales Account Head.");
      throw new Error("Account validation failed");
    }
  };

  const handleUpdateBlankAccounts = async () => {
    if (formStatus !== "Update") {
      toast.error(`Form is working only update mode. Please switch to Update mode.`);
      return;
    }

    if (!controlData.purac_head && !controlData.saleac_head) {
      toast.error("Select at least one Purchase/Sales Account Head.");
      return;
    }

    const confirmUpdate = window.confirm("Update only blank Purchase/Sales Account Heads?");
    if (!confirmUpdate) return;

    let newUpdateRec = formData.map((row) => {
      return {
        ...row,
        isStatus: 'update',
        purac_head: (!row.purac_head && controlData.purac_head) ? controlData.purac_head : row.purac_head,
        salac_head: (!row.salac_head && controlData.saleac_head) ? controlData.saleac_head : row.salac_head
      };
    });

    setFormData(newUpdateRec);
  };

  return (
    <>
      <Container>
        <Row className="d-flex justify-content-center">
          <Col sm={10} md={8} xl={3} className=" mb-2">
            <RadioGroup
              className="radio-button-wrapper box-border"
              options={[
                { text: "ItemWise", value: "I" },
                { text: "Categorywise", value: "C" },
              ]}
              onChange={handleRadioChange}
              checked={controlData?.rg_sort || "I"}
            />
          </Col>
        </Row>
        <Row className='mt-1'>
          <Col sm={12} md={4} xl={4}>
            <Select
              required
              label="Item Type"
              name="level1"
              placeholder={" "}
              value={controlData?.level1 || ""}
              onChange={(e) => handleControlChange("level1", e.target.value, 0, e)}
              options={itemType}
              disabled={fieldsDisabled}
            />
          </Col>
          <Col sm={12} md={4} xl={4}>
            <Select
              required
              label="Item Base"
              name="level2"
              placeholder={" "}
              value={controlData?.level2 || ""}
              onChange={(e) => handleControlChange("level2", e.target.value, 0, e)}
              onBlur={(e) => {
                if (!controlData?.level1) {
                  toast.error('Please select Item Type first.');
                  e.target.focus();
                  handleControlChange('level2', '', 0);
                }
              }}
              options={itemBase}
              disabled={fieldsDisabled}
            />
          </Col>
          <Col sm={12} md={4} xl={4}>
            <Select
              required
              label="Item Sub Category"
              name="level3"
              placeholder={" "}
              value={controlData?.level3 || ""}
              onChange={(e) => handleControlChange("level3", e.target.value, 0, e)}
              onBlur={(e) => {
                if (!controlData?.level1) {
                  toast.error('Please select Item Type first.');
                  e.target.focus();
                  handleControlChange('level3', '', 0);
                } else if (!controlData?.level2) {
                  toast.error('Please select Item Base first.');
                  e.target.focus();
                  handleControlChange('level3', '', 0);
                }
              }}
              options={itemSubCat}
              disabled={fieldsDisabled}
            />
          </Col>
        </Row>
        <Row className='mt-1'>
          <Col sm={12} md={6} xl={2}>
            <TextField
              type="text"
              label="Purchase Acc. Head"
              value={controlData?.purac_head || ""}
              onChange={(e) => handleChange("purac_head", e.target.value, 0, e)}
              onDoubleClick={() => handleDoubleClick("PurchaseAcchead", PurchaseAccHeadHelpListHeader)}
              onBlur={validatePurchaseAccHead}
              disabled={fieldsDisabled}
            />
          </Col>
          <Col sm={12} md={6} xl={2}>
            <TextField
              type="text"
              label="Sales Acc. Head"
              value={controlData?.saleac_head || ""}
              onChange={(e) => handleChange("saleac_head", e.target.value, 0, e)}
              onDoubleClick={() => handleDoubleClick("SalesAcchead", SalesAccHeadHelpListHeader)}
              onBlur={validateSalesAccHead}
              disabled={fieldsDisabled}
            />
          </Col>
          <Col xl={2} className='mt-4 ms-4'>
            <ButtonUi type="button" color="primary" outline onClick={handleUpdateBlankAccounts}   disabled={controlData?.rg_sort === "I"}>
              Update Account
            </ButtonUi>
          </Col>
          <Col xl={2} className='mt-4'>
            <ButtonUi type="button" color="primary" outline onClick={handleShowItemClick} disabled={controlData?.rg_sort === "C"}>
              Show Items
            </ButtonUi>
          </Col>
        </Row>
      </Container>
      
      <Row>
        <Col>
        <Container>
          <Form id="item-wise-acc-entry" className="mt-4">
            <div className="table-title">
              <span>Item Wise Account Entry</span>
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
                        {itemWiseAccEntryHeader.map((header, index) => (
                          <th
                            key={index}
                            style={{
                              whiteSpace: "nowrap",
                              width: header.width,
                              minWidth: header.width,
                            }}
                          >
                            {header.label}
                            {header.isHelpExist && (<FcInfo title="Info" />)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((data, index) => {
                        const globalIndex = (paginationPage - 1) * rowsPerPage + index;
                        return (
                          <tr 
                            key={globalIndex} 
                            onFocus={() => makeFocusOnTableRow(globalIndex, data.sr_no)} 
                            style={{ border: globalIndex === focusedRowIndex ? "2px solid black" : "none" }} 
                            tabIndex={0}
                          >
                            {(formStatus === 'Insert' || formStatus === 'Update') && (
                              <td className="">
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={formData.length > 0}
                                  onDelete={() => handleDelete(data, globalIndex)}
                                />
                              </td>
                            )}
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="it_code"
                                value={data?.it_code || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("it_code", e.target.value, globalIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="it_name"
                                value={data?.it_name || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("it_name", e.target.value, globalIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="it_pu_um"
                                value={data?.it_pu_um || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("it_pu_um", e.target.value, globalIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="purac_head"
                                value={data?.purac_head || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("purac_head", e.target.value, globalIndex, e)}
                                onDoubleClick={() => handleDoubleClick("PurchaseAcc", PurchaseAccHelpListHeader)}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="salac_head"
                                value={data?.salac_head || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("salac_head", e.target.value, globalIndex, e)}
                                onDoubleClick={() => handleDoubleClick("SalesAcc", SalesAccHelpListHeader)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' ,marginRight:'200px'}}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <ButtonUi
                  color="secondary"
                  onClick={handlePreviousPage}
                  disabled={paginationPage === 1}
                  style={{ marginRight: '3px', padding: '2px 6px' }}
                >
                  Previous
                </ButtonUi>
                <span style={{ marginRight: '3px', padding: '2px 6px' }}>
                  Page {paginationPage} of {totalPages || 1}
                </span>
                <ButtonUi
                  color="secondary"
                  onClick={handleNextPage}
                  disabled={paginationPage === totalPages || totalPages === 0}
                  style={{ padding: '2px 6px' }}
                >
                  Next
                </ButtonUi>
              </span>
            </div>
          </Form>
          </Container>
        </Col>
      </Row>
    </>
  )
}

export default ItemWiseAccountEntryDtl