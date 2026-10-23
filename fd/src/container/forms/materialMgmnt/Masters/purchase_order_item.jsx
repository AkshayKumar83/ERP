



import { Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import {itemCodeHelpListHeader, purchaseOrderItemHeader} from "./purchase_order_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";
import { FcInfo } from "react-icons/fc";
import { useState } from "react";
import PurchaseOrderBillLevelChrg from "./purchase_order_bill_level_chrg";
import { APP_PROD_API } from "../../../../utils/api";

const PurchaseOrderItem = ({
  formStatus = "",
  handleChange = () => {},
  itemFormData,
  triggerAddRow = () => {},
  handleItemRowDelete = () => {},
  makeFocusOnTableRow = () => {},
  formControlData = {},
  openHelpList = () => {},
  focusedRowIndex,
  setFocusedRowIndex=() => {},
  validateItemCode=()=>{},
  packingList=[],
  setActiveTab,
  chargesMaster,
  setChargesMaster,
  billFormData,
  setBillFormData,
  handleChargeChange,
  formData,
  calculateRow,
  itemRefs
  
}) => {

  const [showCharges, setShowCharges] = useState(false);
 


const applyGstLogic = (data) => {
  const igst = Number(data["IGST"]?.amount || 0);
  const cgst = Number(data["CGST"]?.amount || 0);
  const sgst = Number(data["SGST"]?.amount || 0);

  console.log("GST DEBUG ", { igst, cgst, sgst, data });

  let updated = { ...data };

  if (igst > 0) {
    if (updated["CGST"]) updated["CGST"].amount = 0;
    if (updated["SGST"]) updated["SGST"].amount = 0;
  } 
  else if (cgst > 0 || sgst > 0) {
    if (updated["IGST"]) updated["IGST"].amount = 0;
  }

  return updated;
};


// const handleOpenCharges = async () => {

//   if (!["Insert", "Update"].includes(formStatus))   return;
      

//   const response = await fetch(
//     `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PO_LEVEL_CHARGES_WITH_MASTER}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     }
//   );

//   const data = await response.json();

//   setActiveTab(3);
//   setChargesMaster(data);

//   const mapped = {};

//   data.forEach((item) => {

//   data.forEach((item) => {

//   const key = item.chg_component?.trim().toUpperCase();

//   let amount = "";   //  default blank

//   //  sirf GST & BASIC VALUE fill honge
//   if (key === "BASIC VALUE") amount = Number(formData?.ntot_basic || 0);
//   if (key === "IGST") amount = Number(formData?.t_gst_igst_amt || 0);
//   if (key === "CGST") amount = Number(formData?.t_gst_cgst_amt || 0);
//   if (key === "SGST") amount = Number(formData?.t_gst_sgst_amt || 0);

//   let flag = ["BASIC VALUE", "IGST", "CGST", "SGST"].includes(key) ? "F" : "";

//   mapped[key] = {
//     flag,
//     amount,
//     computed_amt: "",
//     sub_aplicable: "N",
//     subsidy_amt: ""
//   };
// });
//   });

//   //  GST logic apply
//   const finalData = applyGstLogic(mapped);

//   //  calculation
//   Object.keys(finalData).forEach(key => {
//     finalData[key] = calculateRow(key, finalData[key], finalData, formData,itemFormData);
//   });

//   setBillFormData(finalData);
// };


const handleOpenCharges = async () => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PO_LEVEL_CHARGES_WITH_MASTER}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  const data = await response.json();

  setActiveTab(3);
  setChargesMaster(data);

  const mapped = {};

  //  MAIN FIX
  const itemBasicTotal = itemFormData.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  data.forEach((item) => {
    const key = item.chg_component?.trim().toUpperCase();

    let amount = "";

    if (key === "BASIC VALUE") {
      amount = Number(itemBasicTotal || formData?.ntot_basic || 0);
    }

    if (key === "IGST") amount = Number(formData?.t_gst_igst_amt || 0);
    if (key === "CGST") amount = Number(formData?.t_gst_cgst_amt || 0);
    if (key === "SGST") amount = Number(formData?.t_gst_sgst_amt || 0);

    let flag = ["BASIC VALUE", "IGST", "CGST", "SGST"].includes(key)
      ? "F"
      : "";

    mapped[key] = {
      flag,
      amount,
      computed_amt: "",
      sub_aplicable: "N",
      subsidy_amt: 
      Number(formData?.subsidy_perc || 0) <= 0
      ? "0.00"
      : "",
    
    };
  });

  const finalData = applyGstLogic(mapped);

  Object.keys(finalData).forEach((key) => {
    finalData[key] = calculateRow(
      key,
      finalData[key],
      finalData,
      formData,
      itemFormData
    );
  });

  setBillFormData(finalData);
};
  return (
    <>
      {/* <Row>
        <Col xl={3}>
          <TextField
            type="text"
            label="PR No."
            value={formControlData?.prno || ""}
            onChange={(e) => handleChange("prno", e.target.value, focusedRowIndex, e)}
            disabled
          />
        </Col>
        <Col xl={5}>
          <TextField
            type="text"
            label="Old Item Code"
            value={itemFormData[focusedRowIndex]?.old_it_code || ""}
            onChange={(e) => handleChange(e, "old_it_code", e.target.value, focusedRowIndex)}
            disabled
          />
        </Col>
      </Row> */}
      <Form id="purchase-order-item-form">
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
        {/* <div className="table-container">*/}
         <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
             <div className="table-sticky-wrapper">
            <Table hover id ='po-table'>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left" style={{ width: "5%" }}>
                      Actions
                    </th>
                  )}
                  {/* { purchaseOrderItemHeader.map((header, index) => (
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
                  ))} */}

                     {purchaseOrderItemHeader.map((header, index) => {
                        const words = header.label.split(" "); // split label into words
                        const midpoint = Math.ceil(words.length / 3);
                        const firstLine = words.slice(0, midpoint).join(" ");
                        const secondLine = words.slice(midpoint).join(" ");
  
                        return (
                          <th
                            key={index}
                            className="tds-header-th"   // this class added by akshay 24/10/25
                            data-required={header.required || false}
                            style={{
                              width: header.width,
                              minWidth: header.width,
                            }}
                          >
                            {firstLine}
                            {secondLine && <br />}
                            {secondLine}
                            {header.required && <span className="required-asterisk"> *</span>}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        );
                       })}
                </tr>
              </thead>
              <tbody>
                {itemFormData.map((data, rowIndex) => (
                  <tr
                    key={data.row_id}
                    onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                     onKeyDown={(e) => {
                      if (
                        e.key === "Enter"

                      ) {
                        e.preventDefault();
                        triggerAddRow();
                      }
                    }}


                    style={{border: `${ rowIndex === focusedRowIndex ? "2px solid black" : "none"}`}}
                    tabIndex={0}
                  >
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={itemFormData.length > 1}
                          onDelete={() => handleItemRowDelete(data, data.row_id)}
                        />
                      </td>
                    )}
                    {/* <td> */}
                      {/* <Checkbox
                        checked={data?.filer || 'Y'}
                        name="filer"
                        value={data?.filer || ""}
                        onChange={(e) => handleChange(e, "sa_code", e.target.checked ? "Y" : "N", rowIndex)}
                      /> */}
                      {/* <Checkbox
                        name="filer"
                        checked={data?.filer === "Y"}   // BOOLEAN
                        onChange={(e) =>handleChange(e, "filer", e.target.checked ? "Y" : "N", rowIndex)}
                      /> */}
                    {/* </td> */}
                    <td>
                      {/* <TextField
                        required
                        type="text"
                        name="it_code"
                        value={data.it_code || ""}
                        onChange={(e) => handleChange(e, "it_code", e.target.value, rowIndex)}
                        onDoubleClick={() => openHelpList("it_code",  itemCodeHelpListHeader,  rowIndex)}
                        onBlur={() => validateItemCode(false, rowIndex,formStatus)}
                      /> */}
                  <TextField
                    required
                    type="text"
                    name="it_code"
                    value={data.it_code || ""}
                    onFocus={(e) => { e.target.dataset.prevValue = data.it_code || ""; }}
                    onChange={(e) =>handleChange(e, "it_code", e.target.value, rowIndex)}
                    onBlur={(e) => {
                      const prev = e.target.dataset.prevValue || "";
                      const current = e.target.value || "";
                      if (prev !== current) {
                        validateItemCode(false, rowIndex, formStatus);
                      }
                     }}
                     onDoubleClick={() =>openHelpList("it_code", itemCodeHelpListHeader, rowIndex)}
                     ref={(el) =>itemRefs.current[rowIndex] = el }
                  />

                    </td>
                    <td>
                      <TextField
                        type="text"
                        name="hsn_sac_code"
                        value={data.hsn_sac_code || ""}
                        onChange={(e) =>handleChange( e, "hsn_sac_code", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    {/* <td>
                      <TextField
                        disabled
                        type="text"
                        name="jw_sac"
                        value={data.jw_sac || ""}
                        onChange={(e) => handleChange(e, "jw_sac", e.target.value, rowIndex)}
                      />
                    </td> */}
                    <td>
                      <TextField
                        type="text"
                        name="desc"
                        value={data.desc || ""}
                        onChange={(e) => handleChange(e, "desc", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td>
                      <TextField
                        type="text"
                        name="stock_um"
                        value={data.stock_um || ""}
                        onChange={(e) =>handleChange(e, "stock_um", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    {/* <td>
                      <TextField
                        type="text"
                        name="po_qty_in_stk_uom"
                        value={data.po_qty_in_stk_uom || ""}
                        onChange={(e) => handleChange(e, "po_qty_in_stk_uom", e.target.value, rowIndex)}
                      />
                    </td> */}
                    <td>
                      <TextField
                        required
                        type="text"
                        name="uom"
                        value={data.uom || ""}
                        onChange={(e) => handleChange(e, "uom", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td>
                      <TextField
                        required
                        type="number"
                        name="po_qty_ord"
                        value={data.po_qty_ord || ""}
                        onChange={(e) =>handleChange(e,"po_qty_ord",e.target.value,rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        // required
                        type="number"
                        name="po_mat_rat"
                        value={data.po_mat_rat || ""}
                        onChange={(e) => handleChange(e, "po_mat_rat", e.target.value, rowIndex)}
                        disabled
                      />
                    </td>
                    <td>
                      <TextField
                        // required
                        type="number"
                        name="po_disc"
                        value={data.po_disc || ""}
                        onChange={(e) => handleChange(e, "po_disc", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        // required
                        type="number"
                        name="po_disc_val"
                        value={data.po_disc_val || ""}
                        onChange={(e) =>handleChange(e, "po_disc_val", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        // required
                        type="number"
                        name="amount"
                        value={data.amount || ""}
                        onChange={(e) => handleChange(e, "amount", e.target.value, rowIndex)}
                      />
                    </td>
                    {/* <td>
                      <ButtonUi className="p-0 px-2">Make</ButtonUi>
                    </td> */}
                    {/* <td>
                      <Checkbox
                        name="active"
                        checked={data?.active === "Y"}   // BOOLEAN
                        onChange={(e) =>handleChange(e, "active", e.target.checked ? "Y" : "N", rowIndex)}
                      />
                    </td> */}
                     <td>
                      <Checkbox
                        name="subsidy_yes_no"
                        checked={data?.subsidy_yes_no === "Y"}   
                        onChange={(e) =>handleChange(e, "subsidy_yes_no", e.target.checked ? "Y" : "N", rowIndex)}
                         disabled
                      />
                    </td>
                     <td>
                      <Checkbox
                        name="subsidy_applicable"
                        checked={data?.subsidy_applicable === "Y"}   
                        onChange={(e) =>handleChange(e, "subsidy_applicable", e.target.checked ? "Y" : "N", rowIndex)}
                        
                      />
                    </td>
                  

{/* <td>
  <Checkbox
    name="subsidy_applicable"
    checked={data?.subsidy_applicable === "Y"}
    onChange={(e) => {
      const isChecked = e.target.checked;
      const newValue = isChecked ? "Y" : "N";

      const message = isChecked
        ? "Are you sure want to allowed subsidy in this item?"
        : "Are you sure want to not allowed subsidy in this item?";

      const confirmChange = window.confirm(message);

      if (!confirmChange) {
        return;
      }

      handleChange(
        e,
        "subsidy_applicable",
        newValue,
        rowIndex
      );
    }}
  />
</td> */}
{/* <td>
  <Checkbox
    name="subsidy_applicable"
    checked={data?.subsidy_applicable === "Y"}

    //  sirf original N wale disable honge
    disabled={data?.subsidy_original === "N"}

    onChange={(e) => {
      const isChecked = e.target.checked;
      const newValue = isChecked ? "Y" : "N";

      const message = isChecked
        ? "Are you sure want to allowed subsidy in this item?"
        : "Are you sure want to not allowed subsidy in this item?";

      const confirmChange = window.confirm(message);
      if (!confirmChange) return;

      handleChange(
        e,
        "subsidy_applicable",
        newValue,
        rowIndex
      );
    }}
  />
</td> */}


                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          </SimpleBar>
        </div>

        <Container>
          <Row>
            <Col xl={6}>
              <TextField
              label="Item long Name"
                type="text"
                // label="UOM"
                value={itemFormData[focusedRowIndex]?.it_name_long || ""}
                onChange={(e) => handleChange(e,"it_name_long",e.target.value,focusedRowIndex)}
                disabled
              />
            </Col>
            <Col xl={6}>
              <TextField
                type="text"
                label="Remark"
                value={itemFormData[focusedRowIndex]?.remark || ""}
                onChange={(e) => handleChange(e, "remark", e.target.value, focusedRowIndex)}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            {/* <Col xl={3}>
              <TextField
                type="text"
                label="Raf. Item Code"
                value={itemFormData[focusedRowIndex]?.fc_code || ""}
                onChange={(e) =>
                  handleChange(e, "fc_code", e.target.value, focusedRowIndex)
                }
                disabled
              />
            </Col> */}

            {/* <Col xl={3}>
            <TextField
              type="text"
              label="PR No."
              value={itemFormData[focusedRowIndex]?.pr_no || ""}
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
              value={itemFormData[focusedRowIndex]?.old_it_code || ""}
              onChange={(e) =>
                handleChange("old_it_code", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}
          </Row>

          <Row className=" box border">
            <Row className="mb-2 justify-content-around mt-1">
              <Col lg={2} className="mt-4">
                <h5 className="mt-3">ITEM LEVEL GST </h5>
              </Col>
              {/* <Col lg={3} className="mt-4">
                <RadioGroup
                  className="mt-2 radio-button-wrapper box-border Transaction-height"
                  options={[{ text: "%", value: "%" }, { text: "Value", value: "V" }]}
                  onChange={(e) => handleChange(e,"gst_amt_prc",e.target.value,focusedRowIndex)}
                  checked={itemFormData[focusedRowIndex]?.gst_amt_prc || "%"}
                />
              </Col> */}
              <Col sm={6} md={3} lg={2}>
                <Row>
                  <TextField
                    type="number"
                    label="SGST"
                    value={itemFormData[focusedRowIndex]?.gst_sgst_val || ""}
                    onChange={(e) => handleChange(e, "gst_sgst_val", e.target.value, focusedRowIndex)}
                  />
                  <TextField
                    type="number"
                    label="Cess"
                    value={itemFormData[focusedRowIndex]?.gst_sgst_cess_val || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_sgst_cess_val",
                        e.target.value,
                        focusedRowIndex
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
                    value={itemFormData[focusedRowIndex]?.gst_ugst_val || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_ugst_val",
                        e.target.value,
                        focusedRowIndex
                      )
                    }
                  />

                  <TextField
                    type="number"
                    label="Cess"
                    value={
                      itemFormData[focusedRowIndex]?.gst_ugst_cess_val || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_ugst_cess_val",
                        e.target.value,
                        focusedRowIndex
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
                    value={itemFormData[focusedRowIndex]?.gst_cgst_val || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_cgst_val",
                        e.target.value,
                        focusedRowIndex
                      )
                    }
                  />
                  <TextField
                    type="number"
                    label="Cess"
                    value={
                      itemFormData[focusedRowIndex]?.gst_cgst_cess_val || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_cgst_cess_val",
                        e.target.value,
                        focusedRowIndex
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
                    value={itemFormData[focusedRowIndex]?.gst_igst_val || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_igst_val",
                        e.target.value,
                        focusedRowIndex
                      )
                    }
                  />

                  <TextField
                    type="number"
                    label="Cess"
                    value={
                      itemFormData[focusedRowIndex]?.gst_igst_cess_val || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        e,
                        "gst_igst_cess_val",
                        e.target.value,
                        focusedRowIndex
                      )
                    }
                    disabled
                  />
                </Row>
              </Col>
            </Row>
          </Row>

          {/* <Row className="mt-1">
            <Col xl={3}>
              <Select
                label="packing"
                name="pack_code"
                value={itemFormData[focusedRowIndex]?.["pack_code"] || "P"}
                options={packingList}
                onChange={(e) =>
                  handleChange(e, "pack_code", e.target.value, focusedRowIndex)
                }
              />
            </Col>
            <Col xl={1}>
              <TextField
                type="number"
                label="PO / Unit"
                value={itemFormData[focusedRowIndex]?.po_perunit || 1}
                onChange={(e) =>
                  handleChange(e, "po_perunit", e.target.value, focusedRowIndex)
                }
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="Fabrication Charges"
                value={itemFormData[focusedRowIndex]?.po_fab_chg || ""}
                onChange={(e) =>
                  handleChange(e, "po_fab_chg", e.target.value, focusedRowIndex)
                }
              />
            </Col>

            <Col className=" mt-auto p-1">
              <RadioGroup
              className="button-group-wrapper box-border justify-content-between"
                options={[
                  { text: "Purchase", value: "P" },
                  { text: "Stock", value: "S" },
                  { text: "Both", value: "B" }
                ]}
                checked={itemFormData[focusedRowIndex]?.print_qty_in_stk || "P"}
                onChange={(e) =>handleChange(e, "print_qty_in_stk", e.target.value, focusedRowIndex)}
              />
            </Col>
          </Row> */}
          
          <Row>
            {/* <Col>
              <TextArea
                type="text"
                label="Remark"
                value={itemFormData[focusedRowIndex]?.remark || ""}
                onChange={(e) =>
                  handleChange(e, "remark", e.target.value, focusedRowIndex)
                }
              />
            </Col> */}
          </Row>
        </Container>
      </Form>

     <Row className="mt-4">
        <Col className="d-flex justify-content-center">
         <ButtonUi
            color="primary"
            onClick={handleOpenCharges}
          >
            PO Level Charges
          </ButtonUi>
        </Col>
      </Row>

    {showCharges && (
  <PurchaseOrderBillLevelChrg
    billFormData={billFormData}
    chargesMaster={chargesMaster}
    handleChargeChange={handleChargeChange}
    formStatus={formStatus}
    calculateRow={calculateRow}
  />
)}
    </>
  );
};

export default PurchaseOrderItem;
