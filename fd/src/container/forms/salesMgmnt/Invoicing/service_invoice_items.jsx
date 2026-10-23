import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import {
  calcBasicValue,
  fillHdrRestFieldValue,
  onlyNumberKeyAllow,
  serviceOrderItemsheader,
  validateItemRecord,
} from "./service_invoice_helper";
import TextField from "../../../../components/basic/textField";
// import Checkbox from '../../../../components/basic/checkbox';
import RowAction from "../../../../components/common/rowAction";
// import RadioGroup from '../../../../components/basic/radioGroup';
import { FcInfo } from "react-icons/fc";
import { formatTwoDecimal, validateForm } from "../../../../utils/fn";

const ServiceInvItems = ({
  itemFormDetail = [{}, {}],
  formStatus,
  handleChange = () => {},
  handleAddRow = () => {},
  handleDelete = () => {},
  getFieldRef,
  handleHelpList,
  validateFormFields,
  setFormDetailData = () => {},
  formData,
  setFormData = () => {},
  setUpdateFormData = () => {},
  commonSaleAcc = {},
   setFocusedRowIndex,
  focusedRowIndex
}) => {
  // Tracking Focus in Table Row
  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const triggerAddRow = () => {
    const isValidForm = validateForm("service-inv-items-form", "Invoice Item");
    if (!isValidForm) {
      return;
    }

    handleAddRow();
    setFocusedRowIndex(itemFormDetail.length);
  };

  const triggerDelRow = (index) => {
    handleDelete(index);
    setFocusedRowIndex(0);
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = itemFormDetail.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
  };

  const handleDoubleClick = (name) => {
    if (formStatus) {
      handleHelpList(true, name, focusedRowIndex);
    }
  };

  const doubleClickFieldsReadOnly =
    formStatus === "Insert" || formStatus === "Update";

  const handleRowBlur = (rowIndex) => {
    const rowData = itemFormDetail[rowIndex];

    validateItemRecord({
      formData,
      formDetailData: itemFormDetail,
      formStatus,
      setFormData,
      setFormDetailData,
      setUpdateFormData,
    });
  };

  useEffect(() => {
    if (
      ["Insert", "Update"].includes(formStatus) &&
      itemFormDetail.length > 0
    ) {
      fillHdrRestFieldValue({
        formData,
        formDetailData: itemFormDetail,
        formStatus,
        hdrCb: setFormData,
        setUpdateFormData,
      });
    }
  }, [itemFormDetail, formStatus]);

  return (
    <Form id="service-inv-items-form">
      {/* Table Header */}
      <div className="table-title d-flex justify-content-end gap-2">
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
      {/* Items Table */}
      <div className="table-wrapper-v3 ">
        <SimpleBar forceVisible="y" autoHide={false}>
          <div className="table-sticky-wrapper height-150">
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th style={{ width: "5%" }}>Actions</th>
                  )}
                  {serviceOrderItemsheader.map((header, index) => (
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
                      {header.isHelpExist && <FcInfo title="Info" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemFormDetail &&
                  itemFormDetail?.map((data, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                      onBlur={() => handleRowBlur(rowIndex)}
                      style={{
                        border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                      }}
                      tabIndex={0}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={itemFormDetail.length > 1}
                            onDelete={() => triggerDelRow(rowIndex)}
                          />
                        </td>
                      )}
                      <td>
                        <TextField
                          required
                          name="it_code"
                          value={data.it_code || ""}
                          // onChange={(e) => handleChange("it_code", e.target.value, rowIndex, e)}
                          onChange={(e) =>
                            handleChange("it_code", e.target.value, rowIndex, e)
                          }
                          onDoubleClick={() => handleDoubleClick("it_code")}
                          // readOnly={doubleClickFieldsReadOnly}
                          onBlur={() =>
                            validateFormFields("it_code", focusedRowIndex)
                          }
                          ref={getFieldRef(`it_code_${rowIndex}`)}
                        />
                      </td>
                      <td>
                        <TextField
                          disabled
                          name="hsn_sac_code"
                          value={data.hsn_sac_code || ""}
                          onChange={(e) =>
                            handleChange(
                              "hsn_sac_code",
                              e.target.value,
                              rowIndex,
                              e,
                            )
                          }
                        />
                      </td>
                      <td>
                        <TextField
                          disabled
                          name="it_desc"
                          value={data.it_desc || ""}
                          onChange={(e) =>
                            handleChange("it_desc", e.target.value, rowIndex, e)
                          }
                        />
                      </td>
                      <td>
                        <TextField
                          required
                          type="number"
                          name="qty"
                          value={data.qty || ""}
                          onChange={(e) =>
                            handleChange("qty", e.target.value, rowIndex, e)
                          }
                          onKeyDown={(e) => onlyNumberKeyAllow(e)}
                          // onBlur={(e)=>calcBasicValue({formDetailData:itemFormDetail, index: rowIndex, formStatus}, setFormDetailData )}
                        />
                      </td>
                      {/* <td>
                      <TextField
                        type="number"
                        name="order_rate"
                        value={data.order_rate || ""}
                        onChange={(e) => handleChange("order_rate", e.target.value, rowIndex)}
                      />
                    </td> */}
                      <td>
                        <TextField
                          required
                          // disabled
                          type="number"
                          name="rate"
                          value={data?.rate || ""}
                          // value={formatTwoDecimal(data.rate)}
                          onChange={(e) =>
                            handleChange("rate", e.target.value, rowIndex, e)
                          }
                          onKeyDown={(e) => onlyNumberKeyAllow(e)}
                          // onBlur={(e)=>calcBasicValue({formDetailData:itemFormDetail, index: rowIndex, formStatus}, setFormDetailData )}
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          name="gst_sgst_val"
                          // value={data.gst_sgst_val || ""}
                          value={formatTwoDecimal(data.gst_sgst_val)}
                          onChange={(e) =>
                            handleChange(
                              "gst_sgst_val",
                              e.target.value,
                              rowIndex,
                              e,
                            )
                          }
                          // onKeyDown={(e) => onlyNumberKeyAllow(e)}
                          // onBlur={(e)=>calcBasicValue({formDetailData:itemFormDetail, index: rowIndex, formStatus}, setFormDetailData )}
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          name="gst_cgst_val"
                          // value={data.gst_cgst_val || ""}
                          value={formatTwoDecimal(data.gst_cgst_val)}
                          onChange={(e) =>
                            handleChange(
                              "gst_cgst_val",
                              e.target.value,
                              rowIndex,
                              e,
                            )
                          }
                          // onKeyDown={(e) => onlyNumberKeyAllow(e)}
                          // onBlur={(e)=>calcBasicValue({formDetailData:itemFormDetail, index: rowIndex, formStatus}, setFormDetailData )}
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          name="gst_igst_val"
                          // value={data.gst_igst_val || ""}
                          value={formatTwoDecimal(data.gst_igst_val)}
                          onChange={(e) =>
                            handleChange(
                              "gst_igst_val",
                              e.target.value,
                              rowIndex,
                              e,
                            )
                          }
                          // onKeyDown={(e) => onlyNumberKeyAllow(e)}
                          // onBlur={(e)=>calcBasicValue({formDetailData:itemFormDetail, index: rowIndex, formStatus}, setFormDetailData )}
                        />
                      </td>
                      <td>
                        <TextField
                          required
                          type="number"
                          name="basic_value"
                          // value={data.basic_value || ""}
                          value={formatTwoDecimal(data.basic_value)}
                          onChange={(e) =>
                            handleChange(
                              "basic_value",
                              e.target.value,
                              rowIndex,
                              e,
                            )
                          }
                          onKeyDown={(e) => onlyNumberKeyAllow(e)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </SimpleBar>
      </div>
      <Container className="mt-3">
        <Row className="mt-1 d-flex flex-row gx-1">
          <Col xl={6}>
            <Card className="text-wrapper px-2">
              <span className="text-label">Credit Account Head</span>
              <Row className="py-2">
                <Col>
                  <Row>
                    <Col>
                      <label htmlFor="" style={{ fontSize: "13px" }}>
                        Credit A/C Head
                         <FcInfo/>
                      </label>
                    </Col>
                  </Row>
                  <Row className="d-flex flex-row gx-0">
                    <Col xl={4}>
                      <TextField
                        name="sale_ac_head"
                        required
                        // value={
                        //   itemFormDetail[focusedRowIndex]?.sale_ac_head || ""
                        // }
                         value={
                          itemFormDetail[focusedRowIndex]?.sale_ac_head ||
                          commonSaleAcc.sale_ac_head ||
                          ""
                        }
                        onChange={(e) =>
                          handleChange(
                            "sale_ac_head",
                            e.target.value,
                            focusedRowIndex,
                          )
                        }
                        onDoubleClick={() => handleDoubleClick("sale_ac_head")}
                        
                      />
 
                      
                    </Col>
                    <Col xl={8} className="mt-auto">
                      <TextField
                        name="sale_ac_desc"
                        value={
                          itemFormDetail[focusedRowIndex]?.sale_ac_desc || ""
                        }
                        onChange={(e) =>
                          handleChange(
                            "sale_ac_desc",
                            e.target.value,
                            focusedRowIndex,
                          )
                        }
                      />
                      
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xl={6}>
            <Card className="text-wrapper px-2">
              <span className="text-label">Debit Account Head</span>
              <Row className="py-2">
                <Col>
                  <Row>
                    <Col>
                      <label htmlFor="" style={{ fontSize: "13px" }}>
                        Debit A/C Head
                          <FcInfo/>
                      </label>
                    </Col>
                  </Row>
                  <Row className="d-flex flex-row gx-0">
                    <Col xl={4}>
                      <TextField
                      required
                        name="debit_acc_code"
                        // value={itemFormDetail[focusedRowIndex]?.sale_ac_head || ""}
                        value={formData.debit_acc_code || ""}
                        // onChange={(e) => handleChange("debit_acc_code", e.target.value, focusedRowIndex)}
                        onChange={(e) =>
                          handleChange(
                            "MainTab",
                            e.target.name,
                            e.target.value,
                            null,
                            e,
                          )
                        }
                        onDoubleClick={() =>
                          handleDoubleClick("debit_acc_code")
                        }
                      />
                    </Col>
                    <Col xl={8} className="mt-auto">
                      <TextField
                        name="debit_acc_desc"
                        value={formData?.debit_acc_desc || ""}
                        onChange={(e) =>
                          handleChange(
                            "MainTab",
                            "debit_acc_desc",
                            e.target.value,
                            null,
                            e,
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row className="mt-1 d-flex flex-row gx-1">
          <Col xl={2} className="d-flex flex-column ">
            <label
              htmlFor="cus_it_code"
              style={{
                fontSize: "13px",
                textAlign: "right",
                paddingInline: "5px",
              }}
            >
              Customer item Code
            </label>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                textAlign: "right",
                paddingInline: "5px",
              }}
            >
              Invoice item description (Printed on Invoice)
            </span>
          </Col>
          <Col xl={6} className="">
            <Row className="d-flex flex-row gx-0">
              <Col xl={2}>
                <TextField
                  name="cus_it_code"
                  id="cus_it_code"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                  onChange={(e) =>
                    handleChange("cus_it_code", e.target.value, focusedRowIndex)
                  }
                />
              </Col>
              <Col xl={10}>
                <TextField
                  name="cus_it_desc"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_desc || ""}
                  onChange={(e) =>
                    handleChange("cus_it_desc", e.target.value, focusedRowIndex)
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <TextField
                  name="invoice_it_desp"
                  value={itemFormDetail[focusedRowIndex]?.invoice_it_desp || ""}
                  onChange={(e) =>
                    handleChange(
                      "invoice_it_desp",
                      e.target.value,
                      focusedRowIndex,
                    )
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
        {/* <Row className='mt-2'>
          <Col xl={6}>
            <Card className='text-wrapper px-2'>
                <span className='text-label'>Sales Account Head</span>
                <Row className='py-2'>
                  <Col>
                    <Row>
                      <Col>
                        <label htmlFor="" style={{ fontSize: '13px' }}>Sales A/C Head</label>
                      </Col>
                    </Row>
                    <Row className='d-flex flex-row gx-0'>
                      <Col xl={4}>
                        <TextField
                          name='sale_ac_head'
                          value={itemFormDetail[focusedRowIndex]?.sale_ac_head || ""}
                          onChange={(e) => handleChange("sale_ac_head", e.target.value, focusedRowIndex)}
                          onDoubleClick={() => handleDoubleClick("sale_ac_head")}
                        />
                      </Col>
                      <Col xl={8} className='mt-auto'>
                        <TextField
                          name='sale_ac_desc'
                          value={itemFormDetail[focusedRowIndex]?.sale_ac_desc || ""}
                          onChange={(e) => handleChange("sale_ac_desc", e.target.value, focusedRowIndex)}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
            </Card>
          </Col>
        </Row>  */}
      </Container>

      {/* <Container>
        <Row className='mt-1'> */}
      {/* <Col xl={2} >
            <span style={{ fontSize: "14px" }}>Group Rate</span>
          </Col> */}
      {/* <Col xl={4} className='d-flex flex-row gap-2 w-auto '>
            <ButtonUi color='secondary' >Discount</ButtonUi> */}
      {/* <ButtonUi color='secondary' disabled >Supplementary Item</ButtonUi> */}
      {/* </Col> */}
      {/* <Col xl={1} >
            <TextField
              name='perunit'
              value={itemFormDetail[focusedRowIndex]?.perunit || ""}
              onChange={(e) => handleChange("perunit", e.target.value, focusedRowIndex)}
              onKeyDown={(e) => onlyNumberKeyAllow(e)}
            />
          </Col> */}
      {/* <Col xl={4} className='d-flex flex-row '>
            <label htmlFor="tot_qty" style={{ fontSize: '13px', minWidth: "40%", textAlign: 'right', paddingRight: '8px' }}>
              Total Ordered Qty
            </label>
            <div style={{ width: '30%' }}>
              <TextField
                name='tot_qty'
                inpClass='bkg-yellow'
                value={itemFormDetail[focusedRowIndex]?.tot_qty || ""}
                onChange={(e) => handleChange("tot_qty", e.target.value, focusedRowIndex)}
                disabled
              />
            </div>
          </Col> */}
      {/* </Row> */}
      {/* <Row className='mt-1'>
          <Col xl={4}>
            <Row>
              <Col xl={6}>
                <TextField
                  disabled
                  label='Catalog Code'
                  name="catalog_code"
                  value={itemFormDetail[focusedRowIndex]?.catalog_code || ""}
                  onChange={(e) => handleChange("catalog_code", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={6} className='d-flex align-items-end'>
                <Checkbox
                  text="Different Assess. Val"
                  onChange={(e) => handleChange("calc_gst_on_ins", e.target.checked ? "Y" : "N", focusedRowIndex)}
                  checked={itemFormDetail[focusedRowIndex]?.assess_flg === "Y"}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={4}>
            <Row>
              <Col xl={6}>
                <TextField
                  label='Assess Rate'
                  name="assess_rt"
                  value={itemFormDetail[focusedRowIndex]?.assess_rt || ""}
                  onChange={(e) => handleChange("assess_rt", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={4}>
            <Row>
              <Col xl={6}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>A#=Accessories</span>
              </Col>
              <Col xl={6}>
                <TextField
                  disabled
                  label='Assess Val'
                  name="assess_val"
                  value={itemFormDetail[focusedRowIndex]?.assess_val || ""}
                  onChange={(e) => handleChange("assess_val", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='mt-1 d-flex flex-row gx-0'>
          <Col xl={2} className='d-flex flex-column'>
            <label htmlFor="cus_it_code" style={{ fontSize: '13px', textAlign: 'right', paddingInline: '5px' }}>Customer item Code</label>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Invoice item description (Printed on Invoice)</span>
          </Col>
          <Col xl={10} className=''>
            <Row className='d-flex flex-row gx-0'>
              <Col xl={2}>
                <TextField
                  name='cus_it_code'
                  id="cus_it_code"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                  onChange={(e) => handleChange("cus_it_code", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={10}>
                <TextField
                  name='cus_it_desc'
                  value={itemFormDetail[focusedRowIndex]?.cus_it_desc || ""}
                  onChange={(e) => handleChange("cus_it_desc", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <TextField
                  name='invoice_it_desp'
                  value={itemFormDetail[focusedRowIndex]?.invoice_it_desp || ""}
                  onChange={(e) => handleChange("invoice_it_desp", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>

          </Col>
        </Row> */}
      {/* <Row className='mt-1'>
          <Col xl={9}>
            <Card className="col-sm-12 col-md-12 col-lg-12 text-wrapper p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">GST</span>
              <Row className=" justify-content-between">
                <Col lg={2} className="mt-4">
                  <RadioGroup
                    className="mt-2 radio-button-wrapper box-border d-flex flex-column "
                    options={[{ text: "%", value: "P" }, { text: "Value", value: "A" },]}
                    onChange={(e) => handleChange("gst_amt_prc_f", e.target.value, focusedRowIndex)}
                    checked={itemFormDetail[focusedRowIndex]?.gst_amt_prc_f || "P"}
                  />
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="SGST"
                      name="gst_sgst_val"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_sgst_val) || ''}
                      onChange={(e) => handleChange("gst_sgst_val", e.target.value, focusedRowIndex)}
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      name="gst_sgst_cess_val"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_sgst_cess_val) || ""}
                      onChange={(e) => handleChange("gst_sgst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="UGST"
                      name="gst_ugst_val"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_ugst_val) || ''}
                      onChange={(e) => handleChange("gst_ugst_val", e.target.value, focusedRowIndex)}
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_ugst_cess_val) || ''}
                      onChange={(e) => handleChange("gst_ugst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="CGST"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_cgst_val) || ''}
                      onChange={(e) => handleChange("gst_cgst_val", e.target.value, focusedRowIndex)}
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={String(itemFormDetail[focusedRowIndex]?.gst_cgst_cess_val) || ''}
                      onChange={(e) => handleChange("gst_cgst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="IGST"
                    value={String(itemFormDetail[focusedRowIndex]?.gst_igst_val) || ''}
                      onChange={(e) => handleChange("gst_igst_val", e.target.value, focusedRowIndex)}
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value = {String(itemFormDetail[focusedRowIndex]?.gst_igst_cess_val) || ""}
                      onChange={(e) => handleChange("gst_igst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2} className='mt-auto'>
                  <Row>
                    <TextField
                      type="number"
                      label="Compensation Cess"
                      value = {String(itemFormDetail[focusedRowIndex]?.gst_comp_cess_val) || ""}
                      onChange={(e) => handleChange("gst_comp_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xl={3} className='mt-sm-3 mt-md-3 mt-lg-2'>
            <Card className='text-wrapper px-2'>
              <span className='text-label'>Sales Account Head</span>
              <Row className='py-2'>
                <Col>
                  <Row>
                    <Col>
                      <label htmlFor="" style={{ fontSize: '13px' }}>Sales A/C Head</label>
                    </Col>
                  </Row>
                  <Row className='d-flex flex-row gx-0'>
                    <Col xl={4}>
                      <TextField
                        name='sale_ac_head'
                        // label='Sales A/C Head'
                        value={itemFormDetail[focusedRowIndex]?.sale_ac_head || ""}
                        onChange={(e) => handleChange("sale_ac_head", e.target.value, focusedRowIndex)}
                        onDoubleClick={() => handleDoubleClick("sale_ac_head")}
                      />
                    </Col>
                    <Col xl={8} className='mt-auto'>
                      <TextField
                        name='sale_ac_desc'
                        value={itemFormDetail[focusedRowIndex]?.sale_ac_desc || ""}
                        onChange={(e) => handleChange("sale_ac_desc", e.target.value, focusedRowIndex)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row> */}
      {/* Total field remain */}
      {/* <Row className='mb-4'> */}

      {/* <Col xl={3}>
            <Row> */}
      {/* <Col xl={6}>
                <TextField
                  type="text"
                  label="HSN/SAC Code"
                  value={itemFormDetail[focusedRowIndex]?.hsn_sac_code || ""}
                  onChange={(e) => handleChange("hsn_sac_code", e.target.value, focusedRowIndex)}
                />
              </Col> */}
      {/* <Col xl={6}>
                <TextField
                  type="text"
                  label="Addtl Imp Duty"
                  value={itemFormDetail.addtl_import_duty || ""}
                  onChange={(e) => handleChange("addtl_import_duty", e.target.value)}
                />
              </Col> */}
      {/* </Row> */}
      {/* <Row className='mt-1'>
              <Col xl={6}>
                <TextField
                  type="text"
                  label="Storage Type"
                  value={itemFormDetail.item_storage_type || ""}
                  onChange={(e) => handleChange("item_storage_type", e.target.value)}
                />
              </Col>
            </Row> */}

      {/* </Col>
        </Row> */}

      {/* <Row>
          <Card className='text-wrapper py-2'>
            <span className='text-label'>Last Invoice Detail of Current Item</span>
            <Row>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Invoice No.'
                  name="last_inv_no"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_no || ""}
                  onChange={(e) => handleChange("last_inv_no", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Invoice Dt'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Inv Rate'
                  name="st_inv_rate"
                  value={itemFormDetail[focusedRowIndex]?.st_inv_rate || ""}
                  onChange={(e) => handleChange("st_inv_rate", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Discount'
                  name="last_di"
                  value={itemFormDetail[focusedRowIndex]?.last_di || ""}
                  onChange={(e) => handleChange("last_di", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Inv Qty'
                  name="t_inv_qty"
                  value={itemFormDetail[focusedRowIndex]?.t_inv_qty || ""}
                  onChange={(e) => handleChange("t_inv_qty", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
            <Row className='mt-1'>
              <Col xl={2}>
                <TextField
                  disabled
                  label='SGST + Cess'
                  name="last_sgst"
                 // value={itemFormDetail[focusedRowIndex]?.last_sgst || ""}
                 value={itemFormDetail[focusedRowIndex]?.last_sgst ?? ""}
                  onChange={(e) => handleChange("last_sgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='UGST + Cess'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='CGST + Cess'
                  name="last_cgst"
                  value={itemFormDetail[focusedRowIndex]?.last_cgst || ""}
                  onChange={(e) => handleChange("last_cgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='IGST + Cess'
                  name="last_igst"
                  value={itemFormDetail[focusedRowIndex]?.last_igst || ""}
                  onChange={(e) => handleChange("last_igst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Comp + Cess'
                  name="comp_cess"
                  value={itemFormDetail[focusedRowIndex]?.comp_cess || ""}
                  onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Inv Free Qty'
                  name="free_qty"
                  value={itemFormDetail[focusedRowIndex]?.free_qty || ""}
                  onChange={(e) => handleChange("free_qty", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Card>
        </Row> */}

      {/* <Row className='mt-3'>
          <Card className='text-wrapper py-2'>
            <span className='text-label'>Totals</span>
            <Row>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Basic Value'
                  name="last_inv_no"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_no || ""}
                  onChange={(e) => handleChange("last_inv_no", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Discount'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Accessable Value'
                  name="st_inv_rate"
                  value={itemFormDetail[focusedRowIndex]?.st_inv_rate || ""}
                  onChange={(e) => handleChange("st_inv_rate", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='SGST + Cess'
                  name="last_sgst"
                  value={itemFormDetail[focusedRowIndex]?.last_sgst || ""}
                  onChange={(e) => handleChange("last_sgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='UGST + Cess'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='CGST + Cess'
                  name="last_cgst"
                  value={itemFormDetail[focusedRowIndex]?.last_cgst || ""}
                  onChange={(e) => handleChange("last_cgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Row className='mt-1'>
                <Col xl={2}>
                  <TextField
                    disabled
                    label='IGST + Cess'
                    name="last_igst"
                    value={itemFormDetail[focusedRowIndex]?.last_igst || ""}
                    onChange={(e) => handleChange("last_igst", e.target.value, focusedRowIndex)}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    disabled
                    label='Comp + Cess'
                    name="comp_cess"
                    value={itemFormDetail[focusedRowIndex]?.comp_cess || ""}
                    onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    disabled
                    label='Net Amount'
                    name="comp_cess"
                    inpClass='bkg-pink'
                    value={itemFormDetail[focusedRowIndex]?.comp_cess || ""}
                    onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                  />
                </Col>
              </Row>
            </Row>
          </Card>
        </Row> */}
      {/* </Container> */}
    </Form>
  );
};

export default ServiceInvItems;
