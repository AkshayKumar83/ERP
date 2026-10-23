import { Card, Form, Row, Col } from "reactstrap";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import ServiceInvItems from "./service_invoice_items";
import { formatTwoDecimal } from "../../../../utils/fn";
import RadioGroup from "../../../../components/basic/radioGroup";

const ServiceInvMain = ({
  formData = {},
  setFormData=()=>{},
  formStatus,
  handleChange = () => {},
  handleChangeItem = () => {},
  handleChangeTab = () => {},
  controlFormData = {},
  currency = [],
  invType = [],
  division = [],
  handleHelpList,
  bankList,
  validateFormFields,
  getFieldRef,
  disabledField,

  // -- below this props related to item component -- //
  itemFormDetail = [{}, {}],
  handleAddRow = () => {},
  handleDelete = () => {},
  setFormDetailData = ()=>{},
  setUpdateFormData=()=>{},
  commonSaleAcc = {},
  setFocusedRowIndex,
  focusedRowIndex
  // handleChange = () => { },
  // getFieldRef,
  // handleHelpList,
  // validateFormFields,
}) => {
  const handleDoubleClick = (name) => {
    if (formStatus) {
      handleHelpList(true, name);
    }
  };


  return (
    <>
      <Row>
        <Col xl={9}>
          <Row>
            <Form id="service-inv-main-form">
              <Col xl={12}>
                <Card className="p-1 px-2">
                  <Row className="">
                    <Col xl={3}>
                      <Select
                        label="Division"
                        name="division_id"
                        value={formData?.division_id || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                        options={division}
                        required
                      />
                    </Col>
                    {/* <Col xl={4} className="d-flex align-end pt-4 pb-1">
                      <div className="button-group-wrapper box-border">
                        <Checkbox
                          text="With GST And Without GST"
                          name="with_gst"
                          checked={formData.with_gst !== "N"}
                          onChange={(e) => handleChange(e)}
                        />
                      </div>
                    </Col> */}
                    <Col xl={2}>
                      <Select
                        label="Invoice Type"
                        name="inv_type"
                        value={formData?.inv_type || ""}
                        disabled={disabledField?.inv_type}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", 'inv_type', e.target.value, null, e)}
                        options={invType}
                        required
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        type="text"
                        name = "inv_no"
                        label="Invoice No."
                        value={formData.inv_no || ""}
                        // onChange={(e) => handleChange(e)}
                         onChange={(e) => handleChange("MainTab", 'inv_no', e.target.value, null, e)}
                        disabled = {formStatus != 'Search'}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        required
                        type="date"
                        label="Date"
                        name = "inv_dt"
                        value={formData.inv_dt || ""}
                        // onChange={(e) => handleChange(e)}
                         onChange={(e) => handleChange("MainTab", 'inv_dt', e.target.value, null, e)}
                      />
                    </Col>
                       <Col  xl={3} className="d-flex align-items-end">
                          <RadioGroup
                              className="radio-button-wrapper box-border d-flex gap-3 mb-1 flex-wrap"
                              options={[ 
                                { text: "Customer", value: "C" }, 
                                { text: "Vendor", value: "V" },
                              ]}
                              onChange={(e) => handleChange("MainTab", 'flag_cus_van', e.target.value, null, e)}
                              checked={formData?.flag_cus_van || "C"}
                               />
                                    </Col>
                   {/* <Col xl={3} className="d-flex align-end pt-4 pb-1">
                    <div className="button-group-wrapper box-border">
                      <Checkbox
                        text="With GST And Without GST"
                        name="with_gst"
                        checked={formData.with_gst !== "N"}  // Assuming "N" means unchecked, otherwise use the proper check condition
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.checked ? 'Y' : 'N', null, e)}  // Handle checkbox change
                      />
                    </div>
                  </Col> */}
                    {/* <Col xl={2}>
                      <Select
                        label="Currency"
                        name="curr_cd"
                        value={formData.curr_cd || ""}
                        onChange={(e) => handleChange(e)}
                        options={currency}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        type="text"
                        label="Exch. Rate"
                        name="c_ex_rate"
                        value={formData.c_ex_rate || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                  </Row>
                  {/* <Row className="">
                    <Col xl={3}>
                      <Select
                        label="Invoice Type"
                        name="inv_type"
                        value={formData?.inv_type || ""}
                        onChange={(e) => handleChange(e)}
                        options={invType}
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        type="text"
                        label="Invoice No."
                        value={formData.inv_no || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        type="date"
                        label="Date"
                        value={formData.inv_dt || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                  </Row> */}

                  <Row className="">
                    <Col xl={2}>
                      <TextField
                        //todo: fix this style as fmb
                        required
                        type="text"
                        label={formData?.flag_cus_van === "C" ? "Customer" : "Vendor"}
                        // label="Customer"
                        name="party_code"
                        value={formData.party_code || formData.c_code || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                        onDoubleClick={() => handleDoubleClick("party_code")}
                        onBlur={() => validateFormFields("party_code")}
                      />
                    </Col>
                    <Col xl={5}>
                      <TextField
                        type="text"
                        label="Name"
                        name="party_name"
                        value={formData.party_name || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    <Col xl={2}>
                      <Select
                        label="Currency"
                        name="curr_cd"
                        value={formData.curr_cd || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                        options={currency}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        type="number"
                        disabled = {formData?.curr_cd == 'INR'}
                        label="Exch. Rate"
                        name="c_ex_rate"
                        value={formData?.c_ex_rate || ""}
                        // value={formatTwoDecimal(formData.c_ex_rate)}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                  </Row>
                  <Row className="">
                    <Col xl={2}>
                      <TextField
                        //todo: fix this style as fmb
                        type="text"
                        label="Ship To"
                        name="ship_to_code"
                        value={formData.ship_to_code || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                        disabled // as per pm sir said
                      />
                    </Col>
                    <Col xl={5}>
                      <TextField
                        disabled
                        type="text"
                        name="ship_to_name"
                        label="Name"
                        value={formData.ship_to_name || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        disabled
                        type="text"
                        label="Sales Vch No."
                        name="voucher_no"
                        value={formData.voucher_no || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        type="datetime-local"
                        label="Prep. Date & Time"
                        name="prep_dt"
                        value={formData.prep_dt || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                  </Row>
                  <Row className="">
                    <Col xl={2}>
                      <TextField
                        //todo: fix this style as fmb
                        type="text"
                        label="Bill To"
                        name="bill_to_code"
                        value={formData.bill_to_code || ""}
                        // onChange={(e) => handleChange(e)}
                        onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                        disabled // as per pm sir said
                      />
                    </Col>
                    <Col xl={5}>
                      <TextField
                        disabled
                        type="text"
                        name="bill_to_name"
                        label="Name"
                        value={formData.bill_to_name || ""}
                        // onChange={(e) => handleChange(e)}
                         onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        disabled 
                        type="text"
                        name="gst_no"
                        label="GST NO."
                        value={formData.gst_no || ""}
                        // onChange={(e) => handleChange(e)}
                         onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    <Col md={2}>
                      {formData?.auth_flag === "Y" ? (
                        <p
                          className="mt-4 px-3 py-1"
                          style={{
                            borderRadius: "6px",
                            fontSize: '10px',
                            backgroundColor: "yellow",
                            color: "blue",
                            textAlign: "center",
                          }}
                        >
                          Posted
                        </p>
                      ) : formData?.cancel_flag === "Y" ? (
                        <p
                          className="mt-4 px-3 py-1"
                          style={{
                            borderRadius: "6px",
                            fontSize: '10px',
                            backgroundColor: "yellow",
                            color: "red",
                            textAlign: "center",
                          }}
                        >
                          Cancelled
                        </p>
                      ) : null}
                    </Col>

                    <Col xl={12}>
                      <TextField
                       
                        type="text"
                        name="remark"
                        label="Remarks"
                        value={formData.remark || ""}
                        // onChange={(e) => handleChange(e)}
                         onChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
                      />
                    </Col>
                    
                  </Row>
                  {/* <Row className="mt-1">
                    <Col xl={2}>
                      <Select
                        label="Currency"
                        name="curr_cd"
                        value={formData.curr_cd || ""}
                        onChange={(e) => handleChange(e)}
                        options={currency}
                      />
                    </Col>
                    <Col xl={2}>
                      <TextField
                        type="text"
                        label="Exch. Rate"
                        name="c_ex_rate"
                        value={formData.c_ex_rate || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                  </Row> */}
                  {/* <Row className="mt-1"> */}
                  {/* <Col xl={3}>
                      <TextField
                        disabled
                        type="text"
                        label="Sales Vch No."
                        name="voucher_no"
                        value={formData.voucher_no || ""}
                        onChange={(e) => handleChange(e)}
                        
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        type="datetime-local"
                        label="Prep. Date & Time"
                        name="prep_dt"
                        value={formData.prep_dt || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                  {/* <Col xl={5}>
                    <Select
                        required
                        type="text"
                        label="Bank"
                        name="bank_code"
                        value={formData.bank_code || ""}
                        onChange={(e) => handleChange(e)}
                        options={bankList}
                      />
                    </Col> */}
                  {/* <Col xl={3}>
                      <TextField
                        type="text"
                        label="GR/RR No."
                        name="gr_rr_no"
                        value={formData.gr_rr_no || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        type="date"
                        label="GR/RR Dt"
                        name="gr_rr_dt"
                        value={formData.gr_rr_dt || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                    <Col xl={3}>
                      <TextField
                        type="text"
                        label="End Cust PO No."
                        name="end_c_po_no"
                        value={formData.end_c_po_no || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                  {/* </Row> */}
                  {/* <Row className=""> */}
                  {/* <Col xl={4}>
                      <TextField
                        type="datetime-local"
                        label="Prep. Date & Time"
                        name="prep_dt"
                        value={formData.prep_dt || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                  {/* <Col xl={4} className="d-flex align-items-end">
                      <span className="fw-bold" style={{ color: "#90ee90" }}>
                        {controlFormData?.di_status_flag}
                      </span>
                    </Col> */}
                  {/* <Col xl={4}>
                      <TextField
                        type="text"
                        label="End Cust Date"
                        name="end_c_po_dt"
                        value={formData.end_c_po_no || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                  {/* </Row> */}
                  {/* <Row className="mt-1">
                    <Col xl={2}>
                      <TextField
                        //todo: fix this style as fmb
                        type="text"
                        label="Bank"
                        name="bank_code"
                        value={formData.bank_code || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                    <Col xl={8}>
                      <TextField
                        disabled
                        type="text"
                        name="bank_name"
                        label="Name"
                        value={formData.bank_name || ""}
                        onChange={(e) => handleChange(e)}
                      />
                    </Col>
                  </Row> */}
                  {/* <Row className="mt-3">
                    <Col xl={5}>
                      <Card className="p-2 text-wrapper">
                        <span className="text-label">
                          Credit Limit & Current Balance
                        </span>
                        <Row>
                          <Col>
                            <TextField
                              disabled
                              type="text"
                              name="credit_limit"
                              label="Credit Limit"
                              value={formData.credit_limit || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col xl={8}>
                            <TextField
                              disabled
                              type="text"
                              name="crrent_balance"
                              label="Current Balance"
                              value={formData.crrent_balance || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                          <Col xl={3} className="d-flex align-items-end">
                            <TextField
                              disabled
                              type="text"
                              name="current_balance_db_cr"
                              value={formData.current_balance_db_cr || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col xl={8}>
                            <TextField
                              disabled
                              type="text"
                              name="balance_credit"
                              label="Balance Credit"
                              value={formData.balance_credit || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col xl={4}>
                      <Card className="p-2 text-wrapper">
                        <span className="text-label">Last Invoice Detail</span>
                        <Row>
                          <Col>
                            <TextField
                              disabled
                              type="text"
                              name="last_inv_no"
                              label="Invoice No."
                              value={formData.last_inv_no || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col>
                            <TextField
                              disabled
                              type="text"
                              name="last_inv_dt"
                              label="Invoice Dt."
                              value={formData.last_inv_dt || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col>
                            <TextField
                              disabled
                              type="text"
                              name="t_inv_net_amt"
                              label="Net Amt."
                              value={formData.t_inv_net_amt || ""}
                              onChange={(e) => handleChange(e)}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col xl={3} className="d-flex flex-column gap-3 py-4">
                      <Row className="mt-1">
                        <Col>
                          <ButtonUi
                            type="button"
                            color="secondary"
                            outline
                            onClick={() => handleChangeTab("Advance")}
                          >
                            Advance Adjust
                          </ButtonUi>
                        </Col>
                      </Row>
                      <Row className="mt-1">
                        <Col>
                          <ButtonUi color="secondary" outline>
                            Cancel Invoice
                          </ButtonUi>
                        </Col>
                      </Row>
                    </Col>
                  </Row> */}
                </Card>
              </Col>
            </Form>
          </Row>

          {/* Item form component */}
          <Row>
            <ServiceInvItems
              formStatus={formStatus}
              handleChange={(name, value, index, e) => handleChangeItem("Items", name, value, index, e)}
              handleChangeTab={handleChangeTab}
              itemFormDetail={itemFormDetail}
              getFieldRef={getFieldRef}
              handleHelpList={handleHelpList}
              handleAddRow={handleAddRow}
              handleDelete={handleDelete}
              validateFormFields={validateFormFields}
              setFormDetailData={setFormDetailData}
              formData={formData}
              setFormData={setFormData}
              setUpdateFormData={setUpdateFormData}
              commonSaleAcc={commonSaleAcc}
               setFocusedRowIndex={setFocusedRowIndex}
            focusedRowIndex={focusedRowIndex}
            />
          </Row>
        </Col>
        <Col xl={3}>
          <Card className="p-2 d-flex flex-column gap-1 text-wrapper ">
            <span className="text-label">Total</span>
            {[
              {
                label: "Basic Value",
                id: "t_basic_val",
                value: formData.t_basic_val,
              },
              {
                label: "Volume Disc",
                id: "volume_discount_amt",
                value: formData.volume_discount_amt,
                inpClass: "bkg-yellow",
              },
              {
                label: "Trade Disc",
                id: "trade_discount_amt",
                value: formData.trade_discount_amt,
              },
              {
                label: "Pack/Forw",
                id: "t_pack_forw",
                value: formData.t_pack_forw,
              },
              {
                label: "Assessable",
                id: "t_ass_val",
                value: formData.t_ass_val,
              },
              {
                label: "SGST",
                id: "t_gst_sgst_amt",
                value: formData.t_gst_sgst_amt,
              },
              // {
              //   label: "SGST Cess",
              //   id: "t_gst_sgst_cess_amt",
              //   value: formData.t_gst_sgst_cess_amt,
              // },
              // {
              //   label: "UGST",
              //   id: "t_gst_ugst_amt",
              //   value: formData.t_gst_ugst_amt,
              // },
              // {
              //   label: "GST Cess",
              //   id: "t_gst_ugst_cess_amt",
              //   value: formData.t_gst_ugst_cess_amt,
              // },
              {
                label: "CGST",
                id: "t_gst_cgst_amt",
                value: formData.t_gst_cgst_amt,
              },
              // {
              //   label: "CGST Cess",
              //   id: "t_gst_cgst_cess_amt",
              //   value: formData.t_gst_cgst_cess_amt,
              // },
              {
                label: "IGST",
                id: "t_gst_igst_amt",
                value: formData.t_gst_igst_amt,
              },
              // {
              //   label: "IGST Cess",
              //   id: "t_gst_igst_cess_amt",
              //   value: formData.t_gst_igst_cess_amt,
              // },
              // {
              //   label: "Compensation Cess",
              //   id: "t_gst_comp_cess_amt",
              //   value: formData.t_gst_comp_cess_amt,
              // },
              {
                label: "Addtl Imp Duty",
                id: "t_addtl_imp_duty",
                value: formData.t_addtl_imp_duty,
              },
              { label: "Freight", id: "t_freight", value: formData.t_freight },
              {
                label: "Insurance",
                id: "t_insurance",
                value: formData.t_insurance,
              },
              { label: "TCS", id: "tcs_amt", value: formData.tcs_amt },
              {
                label: "TCS Cess",
                id: "tcs_cess_amt",
                value: formData.tcs_cess_amt,
              },
              {
                label: "TCS Surcharge",
                id: "tcs_surch_amt",
                value: formData.tcs_surch_amt,
              },
              {
                label: "Net Amount",
                id: "net_amt",
                value: formData.net_amt,
                inpClass: "bkg-pink",
                labelStyle: { color: "blue", fontWeight: "bold" },
              },
            ].map(({ label, id, value, inpClass, labelStyle }) => (
              <div
                key={id}
                className="d-flex align-items-end justify-content-end gap-2"
              >
                <label
                  htmlFor={id}
                  style={{
                    minWidth: "140px",
                    textAlign: "right",
                    paddingInline: "5px",
                    marginBottom: 0,
                    ...(labelStyle || {}),
                  }}
                >
                  {label}
                </label>
                <TextField
                  type="number"
                  id={id}
                  // value={typeof value === "number" ? value : ""}
                 value={formatTwoDecimal(value)}
                  onChange={(e) => handleChange(e)}
                  disabled
                  inpClass={inpClass}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServiceInvMain;
