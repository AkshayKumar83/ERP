import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Table } from 'reactstrap';
import RadioGroup from '../../../../components/basic/radioGroup';
import Select from '../../../../components/basic/select';
import TextField from '../../../../components/basic/textField';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import { handleValidateStockField, itemMinMaxHeader } from './Item_min_max_stock_level_helper';
import toast from 'react-hot-toast';
import { APP_PROD_API } from '../../../../utils/api';

const ItemMinMaxStockLevelMain = ({
  formData,
  setFormData,
  controlData,
  handleControlChange,
  formStatus,
  handleChange,
  itemBase = [],
  itemType = [],
  itemSubCat = [],
  focusedRowIndex,
  setFocusedRowIndex,
  handleDelete,
  paginationPage,
  setPaginationPage
}) => {
  //  const [paginationPage, setPaginationPage] = useState(1);
  const rowsPerPage = 10;
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  // Reset pagination to page 1 when controlData (level1, level2, level3) changes
  useEffect(() => {
    setPaginationPage(1);
  }, [controlData.level1, controlData.level2, controlData.level3]);


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
      toast.error(`Form working in update mode. Please switch to Update mode.`);
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


  // Placeholder for Show Items button functionality
   const handleShowItemClick = async () => {
    if (formStatus !== "Update") {
      toast.error(`Form working in Update mode. Please switch to Update mode.`);
      return;
    }

    if (controlData?.rg_sort !== "I") {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_SHOW_ITEM}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data?.type === "found") {
        setFormData(data.itemMinMaxStockLevel);
        setFocusedRowIndex(0);
      } else {
        setFormData([]);
        toast.error("No Items defined for above Category.");
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  };


  return (
    <>
      <Container>
        <Row className="d-flex justify-content-center">
          <Col lg={3} className="mt-1 mb-2">
            <RadioGroup
              className="radio-button-wrapper box-border"
              options={[
                { text: 'ItemWise', value: 'I' },
                { text: 'Categorywise', value: 'C' },
              ]}
              onChange={handleRadioChange}
              checked={controlData?.rg_sort || 'I'}
            />
          </Col>
          <Col lg={4} className="ms-4">
            <ButtonUi type="button" color="primary" outline onClick={handleShowItemClick} disabled={controlData?.rg_sort === "C"}>
              Show Items
            </ButtonUi>
          </Col>
        </Row>
        <Row className="mt-1 justify-content-between">
          <Col sm={12} md={4} lg={3}>
            <Select
              required
              label="Item Type"
              name="level1"
              placeholder=" "
              value={controlData?.level1 || ''}
              onChange={(e) => handleControlChange('level1', e.target.value, 0, e)}
              options={itemType}
              disabled={fieldsDisabled}
            />
          </Col>
          <Col sm={12} md={4} lg={3}>
            <Select
              required
              label="Item Base"
              name="level2"
              placeholder=" "
              value={controlData?.level2 || ''}
              onChange={(e) => handleControlChange('level2', e.target.value, 0, e)}
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
          <Col sm={12} md={4} lg={3}>
            <Select
              required
              label="Item Sub Category"
              name="level3"
              placeholder=" "
              value={controlData?.level3 || ''}
              onChange={(e) => handleControlChange('level3', e.target.value, 0, e)}
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
      </Container>

      <Form id="item-min-max-stock">
        <div className="table-title">
          <span>Item Min Max Stock Level</span>
        </div>
        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className="table-sticky-wrapper">
              <Table hover>
                <thead>
                  <tr>
                    {(formStatus === 'Insert' || formStatus === 'Update') && (
                      <th className="">Actions</th>
                    )}
                    {itemMinMaxHeader.map((header, index) => (
                      <th
                        key={index}
                        data-required={header.required || false}
                        style={{
                          whiteSpace: 'nowrap',
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
                  {paginatedData.map((data, index) => {
                    const globalIndex = (paginationPage - 1) * rowsPerPage + index;
                    return (
                      <tr
                        key={globalIndex}
                        onFocus={() => makeFocusOnTableRow(globalIndex, data.sr_no)}
                        style={{ border: globalIndex === focusedRowIndex ? '2px solid black' : 'none' }}
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
                            name="it_code"
                            value={data?.it_code || ''}
                            onChange={(e) => handleChange('it_code', e.target.value, globalIndex, e)}
                            disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            name="it_name"
                            value={data?.it_name || ''}
                            onChange={(e) => handleChange('it_name', e.target.value, globalIndex, e)}
                            disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            name="it_pu_um"
                            value={data?.it_pu_um || ''}
                            onChange={(e) => handleChange('it_pu_um', e.target.value, globalIndex, e)}
                            disabled
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="max_stock"
                            value={data?.max_stock ?? ''}
                            onChange={(e) => handleChange('max_stock', e.target.value, globalIndex, e)}
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="max_stock_days"
                            value={data?.max_stock_days ?? ''}
                            onChange={(e) => handleChange('max_stock_days', e.target.value, globalIndex, e)}
                          />
                        </td>
                        <td className="table_cell">
                         <TextField
                        type="number"
                        name="min_stock"
                        id={`min_stock_${globalIndex}`}
                        value={data?.min_stock ?? ''}
                        onChange={(e) => handleChange('min_stock', e.target.value, globalIndex, e)}
                        onBlur={(e) => handleValidateStockField(e, formData, formStatus, globalIndex)}
                          // disabled={formStatus === 'Update' && (!data.max_stock || !data.max_stock_days)}
                      />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="min_stock_days"
                            id={`min_stock_days_${globalIndex}`}
                            value={data?.min_stock_days ?? ''}
                            onChange={(e) => handleChange('min_stock_days', e.target.value, globalIndex, e)}
                            onBlur={(e) => handleValidateStockField(e, formData, formStatus, globalIndex)}
                            //  disabled={formStatus === 'Update' && (!data.max_stock || !data.max_stock_days)}
                          />
                          </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="optimumstk"
                            id={`optimumstk_${globalIndex}`}
                            value={data?.optimumstk ?? ''}
                            onChange={(e) => handleChange('optimumstk', e.target.value, globalIndex, e)}
                            onBlur={(e) => handleValidateStockField(e, formData, formStatus, globalIndex)}
                            //  disabled={formStatus === 'Update' && (!data.max_stock || !data.max_stock_days)}
                          />
                        </td>
                        <td className="table_cell">
                        <TextField
                            type="number"
                            name="optimumstk_days"
                            id={`optimumstk_days_${globalIndex}`}
                            value={data?.optimumstk_days ?? ''}
                            onChange={(e) => handleChange('optimumstk_days', e.target.value, globalIndex, e)}
                            onBlur={(e) => handleValidateStockField(e, formData, formStatus, globalIndex)}
                            //  disabled={formStatus === 'Update' && (!data.max_stock || !data.max_stock_days)}
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px', marginRight: '200px' }}>
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
    </>
  );
};

export default ItemMinMaxStockLevelMain;