import React, { useState } from 'react'
import { Col, Container, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import { purchaseOrderItemHeader } from './purchase_order_helper';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import RadioGroup from '../../../../components/basic/radioGroup';
import Select from '../../../../components/basic/select';
import TextArea from '../../../../components/basic/textArea';

const PurchaseOrderSubContract = ({ formStatus = "",
    handleChange = () => { },
    formSubContrData,
    itemformSubContrData=[{}]
    }) => {

    const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
    
    return (
        <Form id="purchase-order-item-form">

            <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                <Row className='mt-1'>
                    <Col className='mt-2'>
                        <Checkbox
                            onChange={(e) => handleChange("formSubContrData", "mat_disp_clearence_flag", e.target.checked ? "Y" : "N")}
                            text="Material Dispatch Clearence Certificate"
                            checked={formSubContrData?.mat_disp_clearence_flag === "Y"}
                        />
                    </Col>
                    <Col className='mt-2'>
                        <Checkbox
                            onChange={(e) => handleChange("formSubContrData", "gst_applicable_flag", e.target.checked ? "Y" : "N")}
                            text="GST Applicable"
                            checked={formSubContrData?.gst_applicable_flag === "Y"}
                        />
                    </Col>
                    <Col xl={3}>
                        <TextField
                            label="PO No"
                            type="text"
                            name="po_no"
                            value={formSubContrData?.po_no || ""}
                            maxLength={20}
                            disabled
                            onChange={(e) => handleChange("formSubContrData", "po_no", e.target.value)}
                        />
                    </Col>

                    <Col xl={2}>
                        <TextField
                            label="-"
                            type="text"
                            name="amd_no"
                            value={formSubContrData?.amd_no || ""}
                            maxLength={4}
                            disabled
                            onChange={(e) => handleChange("formSubContrData", "amd_no", e.target.value)}
                        />
                    </Col>


                </Row>

            </div>
            <div className="table-title d-flex justify-content-end">
                {/* <span>Member Directory</span> */}
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
            <div className="table-container">
                <SimpleBar forceVisible="y" autoHide={false}>
                    <Table hover>
                        <thead>
                            <tr>
                                {(formStatus === "Insert" || formStatus === "Update") && (
                                    <th className="sticky-column left" style={{ width: "5%" }}>
                                        Actions
                                    </th>
                                )}
                                {purchaseOrderItemHeader.map((header, index) => (
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
                            {itemformSubContrData.map((data, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                    style={{
                                        border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                                            }`,
                                    }}
                                    tabIndex={0}
                                >
                                    {(formStatus === "Insert" || formStatus === "Update") && (
                                        <td className="">
                                            <RowAction
                                                formStatus={formStatus}
                                                canDelete={itemformSubContrData.length > 1}
                                                onDelete={() => handleItemRowDelete(rowIndex)}
                                                onUpdate={
                                                    handleUpdate ? () => handleUpdate(data) : undefined
                                                }
                                            />
                                        </td>
                                    )}
                                    <td>
                                        <TextField
                                            required
                                            type="text"
                                            name="it_code"
                                            value={data.it_code || ""}
                                            onChange={(e) =>
                                                handleChange("it_code", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="hsn_sac_code"
                                            value={data.hsn_sac_code || ""}
                                            onChange={(e) =>
                                                handleChange("hsn_sac_code", e.target.value, rowIndex)
                                            }
                                            disabled

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            disabled
                                            type="text"
                                            name="jw_sac"
                                            value={data.jw_sac || ""}
                                            onChange={(e) =>
                                                handleChange("jw_sac", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="desc"
                                            value={data.desc || ""}
                                            onChange={(e) =>
                                                handleChange("desc", e.target.value, rowIndex)
                                            }
                                            disabled

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="uom"
                                            value={data.uom || ""}

                                            onChange={(e) =>
                                                handleChange("uom", e.target.value, rowIndex)
                                            }
                                            disabled

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="esti_cost_per_unit"
                                            value={data.esti_cost_per_unit || ""}

                                            onChange={(e) =>
                                                handleChange("esti_cost_per_unit", e.target.value, rowIndex)
                                            }
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            required
                                            type="text"
                                            name="po_qty_ord"
                                            value={data.po_qty_ord || ""}

                                            onChange={(e) =>
                                                handleChange("po_qty_ord", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            required
                                            type="text"
                                            name="po_mat_rat"
                                            value={data.po_mat_rat || ""}

                                            onChange={(e) =>
                                                handleChange("po_mat_rat", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            required
                                            type="text"
                                            name="po_disc"
                                            value={data.po_disc || ""}

                                            onChange={(e) =>
                                                handleChange("po_disc", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            required
                                            type="text"
                                            name="po_disc_val"
                                            value={data.po_disc_val || ""}
                                            onChange={(e) =>
                                                handleChange("po_disc_val", e.target.value, rowIndex)
                                            }

                                        />
                                    </td>
                                    <td>
                                        <ButtonUi>Make</ButtonUi>
                                    </td>
                                    <td>
                                        <Checkbox
                                            checked={data?.active || false}
                                            onChange={(e) => handleChange("active", e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </SimpleBar>
            </div>

            <Container>
                <Row>
                    <Col xl={12}>
                        <TextArea
                            type="text"
                            // label="UOM"
                            value={itemformSubContrData[focusedRowIndex]?.it_name_long || ""}
                            onChange={(e) =>
                                handleChange("it_name_long", e.target.value, focusedRowIndex, e)
                            }
                            disabled
                        />
                    </Col>
                </Row>

                <Row className="">
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Raf. Item Code"
                            value={itemformSubContrData[focusedRowIndex]?.fc_code || ""}
                            onChange={(e) =>
                                handleChange("fc_code", e.target.value, focusedRowIndex, e)
                            }
                            disabled

                        />
                    </Col>
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="PR No."
                            value={itemformSubContrData[focusedRowIndex]?.pr_no || ""}
                            onChange={(e) =>
                                handleChange("pr_no", e.target.value, focusedRowIndex, e)
                            }
                            disabled
                        />
                    </Col>
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Old Item Code"
                            value={itemformSubContrData[focusedRowIndex]?.old_it_code || ""}
                            onChange={(e) =>
                                handleChange("old_it_code", e.target.value, focusedRowIndex, e)
                            }
                            disabled
                        />
                    </Col>
                </Row>

                <Row className=" box border mt-2">
                    <Row className="mb-2 justify-content-around mt-1">
                        <Col lg={1} className="mt-4">
                            <h5 className="mt-3">GST --</h5>
                        </Col>
                        <Col lg={3} className="mt-4">
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border Transaction-height"
                                options={[
                                    { text: "%", value: "%" },
                                    { text: "Value", value: "V" },
                                ]}
                                onChange={(e) =>
                                    handleChange(
                                        "gst_amt_prc",
                                        e.target.value,
                                        focusedRowIndex,
                                        e
                                    )
                                }
                                checked={itemformSubContrData[focusedRowIndex]?.gst_amt_prc || "%"}
                            />
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                                <TextField
                                    type="number"
                                    label="SGST"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_sgst_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_sgst_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                />
                                <TextField
                                    type="number"
                                    label="Cess"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_sgst_cess_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_sgst_cess_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                    disabled
                                />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                                <TextField
                                    type="number"
                                    label="UGST"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_ugst_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_ugst_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                />

                                <TextField
                                    type="number"
                                    label="Cess"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_ugst_cess_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_ugst_cess_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                    disabled
                                />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                                <TextField
                                    type="number"
                                    label="CGST"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_cgst_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_cgst_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                />
                                <TextField
                                    type="number"
                                    label="Cess"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_cgst_cess_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_cgst_cess_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                    disabled
                                />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                                <TextField
                                    type="number"
                                    label="IGST"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_igst_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_igst_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                />

                                <TextField
                                    type="number"
                                    label="Cess"
                                    value={itemformSubContrData[focusedRowIndex]?.gst_igst_cess_val || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "gst_igst_cess_val",
                                            e.target.value,
                                            focusedRowIndex,
                                            e
                                        )
                                    }
                                    disabled
                                />
                            </Row>
                        </Col>
                    </Row>
                </Row>

                <Row className="mt-1">
                    <Col xl={3}>
                        <Select
                            label="packing"
                            name="pack_code"
                            value={itemformSubContrData[focusedRowIndex]?.["pack_code"] || "P"}
                            onChange={(e) =>
                                handleChange("pack_code", e.target.value, focusedRowIndex, e)
                            }
                        />
                    </Col>
                    <Col xl={1}>
                        <TextField
                            type="number"
                            label="PO / Unit"
                            value={itemformSubContrData[focusedRowIndex]?.po_perunit || ""}
                            onChange={(e) =>
                                handleChange("po_perunit", e.target.value, focusedRowIndex, e)
                            }

                        />
                    </Col>
                    <Col xl={2}>
                        <TextField
                            type="text"
                            label="Febrication Charges"
                            value={itemformSubContrData[focusedRowIndex]?.po_fab_chg || ""}
                            onChange={(e) =>
                                handleChange("po_fab_chg", e.target.value, focusedRowIndex, e)
                            }

                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextArea
                            type="text"
                            label="Remark"
                            value={itemformSubContrData[focusedRowIndex]?.remark || ""}
                            onChange={(e) =>
                                handleChange("remark", e.target.value, focusedRowIndex, e)
                            }
                        />
                    </Col>
                </Row>

                {/* 
        <Row className="d-flex justify-content-center">
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Main");
              }}
            >
              {" "}
              Main Details{" "}
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Discount");
              }}
            >
              Discount
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Subcontract");
              }}
            >
              Sub Contract
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Advance");
              }}
            >
              Advance
            </ButtonUi>
          </Col>
        </Row> */}

            </Container>
        </Form>
    )
}

export default PurchaseOrderSubContract