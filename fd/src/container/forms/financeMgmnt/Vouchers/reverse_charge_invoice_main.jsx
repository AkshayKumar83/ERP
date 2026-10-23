import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import ButtonUi from "../../../../components/basic/button";

const ReverseChargeInvoiceMain = ({
  formData = {},
  handleChange = () => {},
  handleChangeTab = () => {},
  division=[],
  despatch=[],
  currency=[],
  preShipmentNo=[],
}) => {
  return (
    <Form>
      <Row>
        <Col xl={9}>
          <Row className="justify-content-center text-center">
            <Col>
              <span
                style={{ color: "red", fontSize: "30px", fontWeight: "bold" }}
              >
                Reverse Charge Invoice
              </span>
            </Col>
          </Row>

          <Row className="">
            <Col xl={10}>
              <Select
                type="text"
                label="Division"
                value={formData?.division_id || ""}
                onChange={(e) => handleChange("division_id", e.target.value)}
                options={division}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={3}>
              <TextField
                type="text"
                label="RMGP No."
                value={formData?.rmgp_no || ""}
                onChange={(e) => handleChange("rmgp_no", e.target.value)}
              />
            </Col>
            <Col xl={7}>
              <Select
                type="text"
                label="Despatch From"
                value={formData?.despatch_fr || ""}
                onChange={(e) => handleChange("despatch_fr", e.target.value)}
                options={despatch}
                disabled
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={3}>
              <TextField
                type="text"
                label="Invoice No."
                value={formData?.inv_no || ""}
                onChange={(e) => handleChange("inv_no", e.target.value)}
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="Date"
                value={formData?.inv_dt || ""}
                onChange={(e) => handleChange("inv_dt", e.target.value)}
              />
            </Col>
            <Col xl={2} className="mt-4">
              <TextField
                type="number"
                value={formData?.st_38_no || ""}
                onChange={(e) => handleChange("st_38_no", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={7}>
              <TextField
                type="text"
                label="Commodity"
                value={formData?.commodity_desc || ""}
                onChange={(e) => handleChange("commodity_desc", e.target.value)}
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="PO No."
                value={formData?.c_po_no || ""}
                onChange={(e) => handleChange("c_po_no", e.target.value)}
                disabled
              />
            </Col>
          </Row>

          <Row className="mt-1 d-flex gap-0 gx-0">
            <Col xl={2}>
              <TextField
                //todo: fix this style as fmb
                type="text"
                label="Vendor"
                name="party_code"
                value={formData?.party_code || ""}
                onChange={(e) => handleChange("party_code", e.target.value)}
                 disabled
              />
            </Col>
            <Col xl={10} className="mt-auto">
              <TextField
                disabled
                type="text"
                name="party_name"
                // label="Name"
                value={formData?.party_name || ""}
                onChange={(e) => handleChange("party_name", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1 d-flex gap-0 gx-0">
            <Col xl={2}>
              <TextField
                type="text"
                label="Ship From"
                value={formData?.ship_to_code || ""}
                onChange={(e) => handleChange("ship_to_code", e.target.value)}
              />
            </Col>
            <Col xl={10} className="mt-auto" >
              <TextField
                type="text"
                // label="Name"
                disabled
                value={formData?.ship_to_name || ""}
                onChange={(e) => handleChange("ship_to_name", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1 d-flex gap-0 gx-0">
            <Col xl={2}>
              <TextField
                type="text"
                label="Bill From"
                value={formData?.bill_to_code || ""}
                onChange={(e) => handleChange("bill_to_code", e.target.value)}
              />
            </Col>
            <Col xl={10} className="mt-auto">
              <TextField
                type="text"
                // label="Name"
                value={formData?.bill_to_name || ""}
                onChange={(e) => handleChange("bill_to_name", e.target.value)}
                disabled
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={4}>
              <TextField
                type="text"
                label="Sales Vch. No."
                value={formData?.voucher_no || ""}
                onChange={(e) => handleChange("voucher_no", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={4}>
              <TextField
                type="text"
                label="WAYY BILL No."
                value={formData?.elec_ref_no || ""}
                onChange={(e) => handleChange("elec_ref_no", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={4}>
              <TextField
                type="text"
                label="GR/RR No."
                value={formData?.gr_rr_no || ""}
                onChange={(e) => handleChange("gr_rr_no", e.target.value)}
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="GR/RR dt."
                value={formData?.gr_rr_dt || ""}
                onChange={(e) => handleChange("gr_rr_dt", e.target.value)}
              />
            </Col>
            <Col xl={4}>
              <TextField
                type="text"
                label="End Cust PO No."
                value={formData?.end_c_po_no || ""}
                onChange={(e) => handleChange("end_c_po_no", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={4}>
              <TextField
                type="date"
                label="Prep. Date & Time"
                value={formData?.prep_dt || ""}
                onChange={(e) => handleChange("prep_dt", e.target.value)}
              />
            </Col>
           {/* <Col xl={4} className="mt-4">
               this value given by API, At this time default value using 
              <span className="text-danger">Di_Status_Flag</span>
            </Col>
            */}
          </Row>

          <Row className="mt-1">
            <Col xl={4}>
              <TextField
                type="text"
                label="Curr. in Sales Ord."
                value={formData?.so_curr_cd || ""}
                onChange={(e) => handleChange("so_curr_cd", e.target.value)}
                disabled
              />
            </Col>

            <Col xl={2}>
              <TextField
                type="text"
                label="Exch. Rate"
                value={formData?.so_c_ex_rate || ""}
                onChange={(e) => handleChange("so_c_ex_rate", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="End Cust Date"
                value={formData?.end_c_po_date || ""}
                onChange={(e) => handleChange("end_c_po_date", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col xl={4}>
              <Select
                type="text"
                label="Currency"
                value={formData?.curr_cd || ""}
                onChange={(e) => handleChange("curr_cd", e.target.value)}
                options={currency}
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="number"
                label="Exch. Rate"
                value={formData?.c_ex_rate ?? ""}
                onChange={(e) => handleChange("c_ex_rate", e.target.value)}
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="Credit Note"
                value={formData?.credit_note || ""}
                onChange={(e) => handleChange("credit_note", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={4}>
              <Select
                type="text"
                label="Pre-Shipment No."
                value={formData?.pre_id || ""}
                onChange={(e) => handleChange("pre_id", e.target.value)}
                options={preShipmentNo}
                disabled
              />
            </Col>
          </Row>

          <Row className="">
            <Col xl={4} className="">
              <Row className="mt-4 border">
                <div className="text-wrapper">
                  <span className="text-label">
                    Credit Limit and Current balance
                  </span>
                  <Row className="mt-3">
                    <Col xl={9}>
                      <TextField
                        type="text"
                        label={
                          <span style={{ color: "blue" }}>Credit Limit</span>
                        }
                        value={formData?.credit_limit || ""}
                        onChange={(e) =>
                          handleChange("credit_limit", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row className="mt-1">
                    <Col xl={9}>
                      <TextField
                        type="text"
                        label={
                          <span style={{ color: "blue" }}>Current Balance</span>
                        }
                        value={formData?.current_balance || ""}
                        onChange={(e) =>
                          handleChange("current_balance", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                    <Col xl={3} className="mt-4">
                      <TextField
                        type="text"
                        // label="Current Balance"
                        value={formData?.current_balance_db_cr || ""}
                        onChange={(e) =>
                          handleChange("current_balance_db_cr", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2 mb-2">
                    <Col xl={9}>
                      <TextField
                        type="text"
                        label={
                          <span style={{ color: "blue" }}>Balance Credit</span>
                        }
                        value={formData?.balance_credit || ""}
                        onChange={(e) =>
                          handleChange("balance_credit", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                </div>
              </Row>
            </Col>
            <Col xl={4} className="mx-auto">
              <Row className="mt-4 border">
                <div className="text-wrapper">
                  <span className="text-label">Last Invoice Detail</span>
                  <Row className="mt-3">
                    <Col xl={9}>
                      <TextField
                        type="text"
                        label={
                          <span style={{ color: "blue" }}>Invoice No.</span>
                        }
                        value={formData?.last_inv_no || ""}
                        onChange={(e) =>
                          handleChange("last_inv_no", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row className="mt-1">
                    <Col xl={9}>
                      <TextField
                        type="date"
                        label={
                          <span style={{ color: "blue" }}>Invoice Dt.</span>
                        }
                        value={formData?.last_inv_dt || ""}
                        onChange={(e) =>
                          handleChange("last_inv_dt", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2 mb-2">
                    <Col xl={9}>
                      <TextField
                        style={{ textAlign: "right" }}
                        type="text"
                        label={<span style={{ color: "blue" }}>Net Amt.</span>}
                        value={formData?.last_inv_net_amt || ""}
                        onChange={(e) =>
                          handleChange("last_inv_net_amt", e.target.value)
                        }
                        // inpClass="bkg-yellow"
                        disabled
                      />
                    </Col>
                  </Row>
                </div>
              </Row>
            </Col>

            <Col xl={2} className="mt-4">
            <ButtonUi className="mt-4">Cancle Invoice</ButtonUi>
            </Col>
          </Row>
        </Col>

      
          <Col xl={3}>
          <Card className="p-2 d-flex flex-column gap-1 text-wrapper">
            <span className="text-label">Totals</span>
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
                  value={formData?.t_basic_val ?? ""}
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
                  htmlFor="volume_discount_amt"
                >
                  Volume Disc
                </label>
                <TextField
                  type="number"
                  id="volume_discount_amt"
                  value={formData?.volume_discount_amt ?? ""}
                  onChange={(e) =>
                    handleChange("volume_discount_amt", e.target.value)
                  }
                  disabled
                  inpClass="bkg-yellow"
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
                  htmlFor="trade_discount_amt"
                >
                  Trade Disc
                </label>
                <TextField
                  type="number"
                  id="trade_discount_amt"
                  value={formData?.trade_discount_amt ?? ""}
                  onChange={(e) =>
                    handleChange("trade_discount_amt", e.target.value)
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
                  htmlFor="t_pack_forw"
                >
                  Pack/Forw
                </label>
                <TextField
                  type="number"
                  id="t_pack_forw"
                  value={formData?.t_pack_forw ?? ""}
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
                  htmlFor="t_ass_val_1"
                >
                  Assessable
                </label>
                <TextField
                  type="number"
                  id="t_ass_val"
                  value={formData?.t_ass_val ?? ""}
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
                  SGST
                </label>
                <TextField
                  type="number"
                  id="t_gst_sgst_amt"
                  value={formData?.t_gst_sgst_amt ?? ""}
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
                  value={formData?.t_gst_sgst_cess_amt ?? ""}
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
                  UGST
                </label>
                <TextField
                  type="number"
                  id="t_gst_ugst_amt"
                  value={formData?.t_gst_ugst_amt ?? ""}
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
                  value={formData?.t_gst_ugst_cess_amt ?? ""}
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
                  CGST
                </label>
                <TextField
                  type="number"
                  id="t_gst_cgst_amt"
                  value={formData?.t_gst_cgst_amt ?? ""}
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
                  value={formData?.t_gst_cgst_cess_amt ?? ""}
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
                  IGST
                </label>
                <TextField
                  type="number"
                  id="t_gst_igst_amt"
                  value={formData?.t_gst_igst_amt ?? ""}
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
                  value={formData?.t_gst_igst_cess_amt ?? ""}
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
                  htmlFor="t_gst_comp_cess_amt"
                >
                  Compnst. Cess
                </label>
                <TextField
                  type="number"
                  id="t_gst_comp_cess_amt"
                  value={formData?.t_gst_comp_cess_amt ?? ""}
                  onChange={(e) =>
                    handleChange("t_gst_comp_cess_amt", e.target.value)
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
                  htmlFor="t_addtl_imp_duty"
                >
                  Addtl Imp Duty
                </label>
                <TextField
                  type="number"
                  id="t_addtl_imp_duty"
                  value={formData?.t_addtl_imp_duty ?? ""}
                  onChange={(e) =>
                    handleChange("t_addtl_imp_duty", e.target.value)
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
                  value={formData?.t_freight ?? ""}
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
                  htmlFor="tcs_amt"
                >
                  TCS
                </label>
                <TextField
                  type="number"
                  id="tcs_amt"
                  value={formData?.tcs_amt ?? ""}
                  onChange={(e) => handleChange("tcs_amt", e.target.value)}
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
                  htmlFor="SELECT MAX(voucher_id) FROM thfmtran;"
                >
                  TCS Cess
                </label>
                <TextField
                  type="number"
                  id="tcs_cess_amt"
                  value={formData?.tcs_cess_amt ?? ""}
                  onChange={(e) => handleChange("tcs_cess_amt", e.target.value)}
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
                  htmlFor="tcs_surch_amt"
                >
                  TCS Surcharge
                </label>
                <TextField
                  type="number"
                  id="tcs_surch_amt"
                  value={formData?.tcs_surch_amt ?? ""}
                  onChange={(e) =>
                    handleChange("tcs_surch_amt", e.target.value)
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
                    color: "blue",
                    fontWeight: "bold",
                  }}
                  htmlFor="net_amt"
                >
                  Net Amount
                </label>
                <TextField
                  type="number"
                  id="net_amt"
                  value={formData?.net_amt ?? ""}
                  onChange={(e) => handleChange(e)}
                  disabled
                  inpClass="bkg-pink"
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
      </Row>

      {/* <Row className="mt-4">
        <div className="d-flex flex-row gap-3 justify-content-center">
          <ButtonUi
            type="button"
            color="dark"
            outline
            onClick={() => {
              handleChangeTab("Items");
            }}
          >
            Items
          </ButtonUi>
          <ButtonUi
            type="button"
            color="dark"
            outline
            onClick={() => {
              handleChangeTab("Payment");
            }}
          >
            Payment
          </ButtonUi>
          <ButtonUi
            type="button"
            color="dark"
            outline
            onClick={() => {
              handleChangeTab("Despatch");
            }}
          >
            Despatch
          </ButtonUi>
        </div>
      </Row> */}
    </Form>
  );
};

export default ReverseChargeInvoiceMain;
