import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const SalesOrderMain = ({
  formData = {},
  formStatus = "",
  handleChange = () => {},
  handleChangeTab = () => {},
  dropdownData,
  handleHelpList = () => {},
  validateFormFields = () => {},
  getFieldRef = () => {},
}) => {
  const handleDoubleClick = (name) => {
    if (formStatus) {
      handleHelpList(true, name);
    }
  };

  const handleNumericChange = (e, fieldName) => {
    let value = e.target.value;

    const regex = /^-?\d{0,14}(\.\d{0,2})?$/; // Allows up to 14 digits + 2 decimal places
    if (regex.test(value) || value === "") {
      handleChange(fieldName, value);
    }
  };

  const doubleClickFieldsReadOnly =
    formStatus === "Insert" || formStatus === "Update";

  return (
    <Form id="sales-order-main-form">
      <Row>
        <Col xl={9}>
          <Row>
            <Col xl={7}>
              <Card className="p-2">
                <Row>
                  <Col xl={12}>
                    <Select
                      disabled={!doubleClickFieldsReadOnly}
                      label="Type"
                      name="inv_type"
                      value={formData["inv_type"] || ""}
                      onChange={(e) => handleChange("inv_type", e.target.value)}
                      options={[
                        { value: "", label: "" },
                        ...dropdownData.typeList,
                      ]}
                      onBlur={() => validateFormFields("inv_type")}
                      ref={getFieldRef("inv_type")}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={4}>
                    <TextField
                      required
                      type="text"
                      name="c_code"
                      label="Customer Code"
                      value={formData.c_code || ""}
                      onDoubleClick={() => handleDoubleClick("c_code")}
                      onChange={(e) => handleChange("c_code", e.target.value)}
                      readOnly={doubleClickFieldsReadOnly}
                      onBlur={() => validateFormFields("c_code")}
                      ref={getFieldRef("c_code")}
                    />
                  </Col>
                  <Col xl={8}>
                    <TextField
                      type="text"
                      label="Name"
                      value={formData.c_name || ""}
                      onChange={(e) => handleChange("c_name", e.target.value)}
                      disabled
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={4}>
                    <TextField
                      disabled={formStatus !== "Update"}
                      type="text"
                      label="Ship To Code"
                      value={formData.ship_to_code || ""}
                      onChange={(e) =>
                        handleChange("ship_to_code", e.target.value)
                      }
                    />
                  </Col>
                  <Col xl={8}>
                    <TextField
                      disabled={formStatus !== "Update"}
                      type="text"
                      label="Name"
                      value={formData.ship_to_name || ""}
                      onChange={(e) =>
                        handleChange("ship_to_name", e.target.value)
                      }
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={4}>
                    <TextField
                      disabled={formStatus !== "Update"}
                      type="text"
                      label="Bill To Code"
                      value={formData.bill_to_code || ""}
                      onChange={(e) =>
                        handleChange("bill_to_code", e.target.value)
                      }
                    />
                  </Col>
                  <Col xl={8}>
                    <TextField
                      disabled={formStatus !== "Update"}
                      type="text"
                      label="Name"
                      value={formData.bill_to_name || ""}
                      onChange={(e) =>
                        handleChange("bill_to_name", e.target.value)
                      }
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={7}>
                    <div className="button-group-wrapper box-border">
                      <Checkbox
                        text="Job Work"
                        name="jw"
                        checked={formData.jw !== "N"}
                        onChange={(e) =>
                          handleChange("jw", e.target.checked ? "Y" : "N")
                        }
                      />
                      <Checkbox
                        text="FOC"
                        name="foc_flag"
                        checked={formData.foc_flag !== "N"}
                        onChange={(e) =>
                          handleChange("foc_flag", e.target.checked ? "Y" : "N")
                        }
                      />
                      <Checkbox
                        text="Trading"
                        name="trading_ord_flg"
                        checked={formData.trading_ord_flg !== "N"}
                        onChange={(e) =>
                          handleChange(
                            "trading_ord_flg",
                            e.target.checked ? "Y" : "N"
                          )
                        }
                      />
                    </div>
                  </Col>
                  <Col xl={5}>
                    <RadioGroup
                      className="button-group-wrapper box-border"
                      options={[
                        { text: "Open", value: "A" },
                        { text: "One Time", value: "O" },
                      ]}
                      onChange={(e) =>
                        handleChange("annual_flag", e.target.value)
                      }
                      checked={formData.annual_flag || "O"}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={4}>
                    <TextField
                      type="text"
                      label="Customer Po No."
                      value={formData.c_po_no || ""}
                      onChange={(e) => handleChange("c_po_no", e.target.value)}
                      onBlur={() => validateFormFields("c_po_no")}
                      ref={getFieldRef("c_po_no")}
                    />
                  </Col>
                  <Col xl={8}>
                    <TextField
                      type="date"
                      label="Date"
                      value={formData.c_po_dt || ""}
                      onChange={(e) => handleChange("c_po_dt", e.target.value)}
                      onBlur={() => validateFormFields("c_po_dt")}
                      ref={getFieldRef("c_po_dt")}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={4}>
                    <Select
                      disabled
                      label="Currency"
                      name="curr_cd"
                      value={formData["curr_cd"] || ""}
                      onChange={(e) => handleChange("curr_cd", e.target.value)}
                      options={[
                        { value: "", label: "" },
                        ...(dropdownData?.currencyList || []),
                      ]}
                    />
                  </Col>
                  <Col xl={8}>
                    <TextField
                      disabled={formData["curr_cd"] === "INR"}
                      type="number"
                      label="Currency Conv."
                      value={formData.curr_conv || ""}
                      onChange={(e) => handleNumericChange(e, "curr_conv")}
                      onBlur={() => validateFormFields("curr_conv")}
                      ref={getFieldRef("curr_conv")}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xl={5}>
              <Card className="p-3 position-relative border">
                <span
                  className="position-absolute bg-white px-2 fw-bold"
                  style={{ top: "-10px", left: "12px", fontSize: "14px" }}
                >
                  Order
                </span>
                <Row>
                  <Col xl={6}>
                    <TextField
                      disabled={formStatus !== "Search"}
                      type="text"
                      label="Number"
                      value={formData.order_no || ""}
                      onChange={(e) => handleChange("order_no", e.target.value)}
                    />
                  </Col>
                  <Col xl={6}>
                    <p
                      style={{
                        //border: "1px solid black",
                        textAlign: "center",
                        color: "red",
                        fontWeight: "Bold",
                        fontSize: "18px",
                      }}
                    >
                      {(() => {
                        if (formData.flag === "Y") {
                          return "POSTED";
                        } else if (formData.cancel_flag === "Y") {
                          return "CANCELLED";
                        }
                        return "";
                      })()}
                    </p>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col xl={6}>
                    <Row>
                      <Col>
                        <TextField
                          type="date"
                          label="Date"
                          value={formData.order_dt || ""}
                          onChange={(e) =>
                            handleChange("order_dt", e.target.value)
                          }
                          onBlur={() => validateFormFields("order_dt")}
                          ref={getFieldRef("order_dt")}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        <TextField
                          type="date"
                          label="Eff. Date"
                          value={formData.eff_dt || ""}
                          onChange={(e) =>
                            handleChange("eff_dt", e.target.value)
                          }
                          onBlur={() => validateFormFields("eff_dt")}
                          ref={getFieldRef("eff_dt")}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        <TextField
                          type="date"
                          label="End Date"
                          value={formData.end_dt || ""}
                          onChange={(e) =>
                            handleChange("end_dt", e.target.value)
                          }
                          onBlur={() => validateFormFields("end_dt")}
                          ref={getFieldRef("end_dt")}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        <TextField
                          type="date"
                          label="Delivery Date"
                          value={formData.delivery_date || ""}
                          onChange={(e) =>
                            handleChange("delivery_date", e.target.value)
                          }
                          onBlur={() => validateFormFields("delivery_date")}
                          ref={getFieldRef("delivery_date")}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xl={6}>
                    <Card className="p-2 mt-4 position-relative border">
                      <span
                        className="position-absolute bg-white px-2 fw-bold"
                        style={{ top: "-10px", left: "12px", fontSize: "14px" }}
                      >
                        Amendment
                      </span>
                      <Row>
                        <Col xl={8}>
                          <TextField
                            disabled={formStatus !== "Update"}
                            type="text"
                            label="No."
                            value={formData.order_amd_no || ""}
                            onChange={(e) =>
                              handleChange("order_amd_no", e.target.value)
                            }
                          />
                        </Col>
                      </Row>
                      <Row className="mt-1">
                        <Col>
                          <TextField
                            disabled
                            type="date"
                            label="Date."
                            value={formData.order_amd_dt || ""}
                            onChange={(e) =>
                              handleChange("order_amd_dt", e.target.value)
                            }
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4 border">
            <div className="text-wrapper">
              <span className="text-label">Terms & Conditions</span>
              <Row>
                <Col className=" mt-2">
                  <Select
                    label="Payment Term"
                    name="term_code"
                    value={formData["term_code"] || ""}
                    onChange={(e) => handleChange("term_code", e.target.value)}
                    options={[
                      { value: "", label: "" },
                      ...(dropdownData?.paymentTerms || []),
                    ]}
                    onBlur={() => validateFormFields("term_code")}
                    ref={getFieldRef("term_code")}
                  />
                </Col>
              </Row>
              <Row>
                <Col xl={6} className="">
                  <Select
                    label="Mode of Transport"
                    name="mode_cd"
                    value={formData["mode_cd"] || ""}
                    onChange={(e) => handleChange("mode_cd", e.target.value)}
                    options={[
                      { value: "", label: "" },
                      ...(dropdownData?.modeOfTransport || []),
                    ]}
                    onBlur={() => validateFormFields("mode_cd")}
                    ref={getFieldRef("mode_cd")}
                  />
                </Col>
                <Col xl={6} className="">
                  <Select
                    label="Price Basis"
                    name="price_basis"
                    value={formData["price_basis"] || ""}
                    onChange={(e) =>
                      handleChange("price_basis", e.target.value)
                    }
                    options={[
                      { value: "", label: "" },
                      ...(dropdownData?.priceBasis || []),
                    ]}
                    onBlur={() => validateFormFields("price_basis")}
                    ref={getFieldRef("price_basis")}
                  />
                </Col>
              </Row>
            </div>
          </Row>
          <Row className="mt-4">
            <Col xl={5}>
              <TextField
                type="text"
                label="Document Thru"
                value={formData.desp_by || ""}
                onChange={(e) => handleChange("desp_by", e.target.value)}
              />
            </Col>
            <Col xl={7}>
              <Row>
                <Col xl={4}>
                  <TextField
                    type="text"
                    label="Sales Person Code"
                    value={formData.sales_pers_cd || ""}
                    onDoubleClick={() => handleDoubleClick("sales_pers_cd")}
                    onChange={(e) =>
                      handleChange("sales_pers_cd", e.target.value)
                    }
                    readOnly={doubleClickFieldsReadOnly}
                  />
                </Col>
                <Col xl={8}>
                  <TextField
                    type="text"
                    label="Sales Person Name"
                    value={formData.sales_pers_name || ""}
                    onChange={(e) =>
                      handleChange("sales_pers_name", e.target.value)
                    }
                    disabled
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col xl={5}>
              <TextField
                type="text"
                label="Spl. Instruction"
                value={formData.sp_ins || ""}
                onChange={(e) => handleChange("sp_ins", e.target.value)}
              />
            </Col>
            <Col xl={7}>
              <Row>
                <Col xl={4}>
                  <TextField
                    type="text"
                    label="Scheme No."
                    value={formData.scheme_no || ""}
                    onChange={(e) => handleChange("scheme_no", e.target.value)}
                  />
                </Col>
                <Col xl={8}>
                  <TextField
                    type="text"
                    label="Dl number"
                    value={formData.dl_number || ""}
                    onChange={(e) => handleChange("dl_number", e.target.value)}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col xl={5}>
              <TextField
                type="text"
                label="Final Dest."
                value={formData.final_dest || ""}
                onChange={(e) => handleChange("final_dest", e.target.value)}
              />
            </Col>
            <Col xl={7}>
              <Row>
                <Col xl={12}>
                  <TextField
                    type="text"
                    label="Transporter"
                    value={formData.tpt_name || ""}
                    onChange={(e) => handleChange("tpt_name", e.target.value)}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col>
              <TextArea
                label="Note"
                value={formData.note || ""}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mt-1 d-flex justify-content-center">
            <Col md={3}>
              <TextField
                type="text"
                label="Value of Input Items (Rs.)"
                value={formData.val_of_input_items || ""}
                onChange={(e) =>
                  handleChange("val_of_input_items", e.target.value)
                }
                disabled
              />
            </Col>
          </Row>
          <Row className="mt-4">
            <div className="d-flex flex-row gap-3 justify-content-center">
              <ButtonUi
                type="button"
                color="primary"
                outline
                onClick={() => {
                  handleChangeTab("Volume Discount");
                }}
              >
                Volume Discount
              </ButtonUi>
              <ButtonUi type="button" color="primary" outline>
                Copy of Sales Order
              </ButtonUi>
              <ButtonUi
                type="button"
                color="primary"
                outline
                onClick={() => {
                  handleChangeTab("Charges");
                }}
              >
                Other Charges
              </ButtonUi>
              <ButtonUi
                type="button"
                color="primary"
                outline
                onClick={() => {
                  handleChangeTab("Items");
                }}
              >
                Items
              </ButtonUi>
              <ButtonUi type="button" color="primary" outline>
                Amendment
              </ButtonUi>
              <ButtonUi
                type="button"
                color="primary"
                outline
                onClick={() => {
                  handleChangeTab("CancelOrder");
                }}
              >
                Cancel Order
              </ButtonUi>
            </div>
          </Row>
        </Col>
        <Col xl={3}>
          <Card className="p-1 d-flex flex-col gap-1">
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_basic_val"
                >
                  Basic Value
                </label>
                <TextField
                  type="number"
                  id="t_basic_val"
                  value={formData.t_basic_val || ""}
                  onChange={(e) => handleChange("t_basic_val", e.target.value)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_pack_forw"
                >
                  Pack/Forw
                </label>
                <TextField
                  type="number"
                  id="t_pack_forw"
                  value={formData.t_pack_forw || ""}
                  onChange={(e) => handleChange("t_pack_forw", e.target.value)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_ass_val"
                >
                  Assessable
                </label>
                <TextField
                  type="number"
                  id="t_ass_val"
                  value={formData.t_ass_val || ""}
                  onChange={(e) => handleChange("t_ass_val", e.target.value)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_sgst_amt"
                >
                  SGST Value
                </label>
                <TextField
                  type="number"
                  id="t_gst_sgst_amt"
                  value={formData.t_gst_sgst_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_sgst_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_sgst_cess_amt"
                >
                  SGST Cess
                </label>
                <TextField
                  type="number"
                  id="t_gst_sgst_cess_amt"
                  value={formData.t_gst_sgst_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_sgst_cess_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_ugst_amt"
                >
                  UGST Value
                </label>
                <TextField
                  type="number"
                  id="t_gst_ugst_amt"
                  value={formData.t_gst_ugst_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_ugst_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_ugst_cess_amt"
                >
                  UGST Cess
                </label>
                <TextField
                  type="number"
                  id="t_gst_ugst_cess_amt"
                  value={formData.t_gst_ugst_cess_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_ugst_cess_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_cgst_amt"
                >
                  CGST Value
                </label>
                <TextField
                  type="number"
                  id="t_gst_cgst_amt"
                  value={formData.t_gst_cgst_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_cgst_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_cgst_cess_amt"
                >
                  CGST Cess
                </label>
                <TextField
                  type="number"
                  id="t_gst_cgst_cess_amt"
                  value={formData.t_gst_cgst_cess_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_cgst_cess_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_igst_amt"
                >
                  IGST Value
                </label>
                <TextField
                  type="number"
                  id="t_gst_igst_amt"
                  value={formData.t_gst_igst_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_igst_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_gst_igst_cess_amt"
                >
                  IGST Cess
                </label>
                <TextField
                  type="number"
                  id="t_gst_igst_cess_amt"
                  value={formData.t_gst_igst_cess_amt || ""}
                  onChange={(e) =>
                    handleChange("t_gst_igst_cess_amt", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_freight"
                >
                  Freight
                </label>
                <TextField
                  type="number"
                  id="t_freight"
                  value={formData.t_freight || ""}
                  onChange={(e) => handleChange("t_freight", e.target.value)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="t_insurance"
                >
                  Insurance
                </label>
                <TextField
                  type="number"
                  id="t_insurance"
                  value={formData.t_insurance || ""}
                  onChange={(e) => handleChange("t_insurance", e.target.value)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex">
                <label
                  style={{
                    minWidth: "120px",
                    textAlign: "right",
                    paddingInline: "5px",
                  }}
                  htmlFor="net_amt"
                >
                  Net Amount
                </label>
                <TextField
                  type="number"
                  id="net_amt"
                  value={formData.net_amt || ""}
                  onChange={(e) => handleChange("net_amt", e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

SalesOrderMain.propTypes = {
  formData: PropTypes.object,
  formStatus: PropTypes.string,
  handleChange: PropTypes.func,
  handleChangeTab: PropTypes.func,
  dropdownData: PropTypes.shape({
    typeList: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    currencyList: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    paymentTerms: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    modeOfTransport: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    priceBasis: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }),
  handleHelpList: PropTypes.func,
  validateFormFields: PropTypes.func,
  getFieldRef: PropTypes.func,
};

export default SalesOrderMain;
