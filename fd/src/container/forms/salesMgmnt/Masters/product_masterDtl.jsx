import React from "react";
import { Row, Col, Form } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import TextArea from "../../../../components/basic/textArea";
import toast from "react-hot-toast";

const ProductMasterDtl = ({
  formData = {},
  formStatus,
  handleChange,
  commodity = [],
  mainCat = [],
  subCat = [],
  product = [],
  filteredSubCat = [],
  setSelectedCategory,
}) => {
  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  const handleRateValue = (data, name) => {
    //console.log(name);
      if (data < 0) {
        toast.error(`This ${name} value cannot be negative.`);
        return true;
      }
    
    return false;
  };

  return (
    <React.Fragment>
      <Form id="product-master-form">
        <Row>
          <Col xl={3}>
            <TextField
              type="text"
              label="Product Code"
              name="it_code"
              value={formData?.it_code || ""}
              onChange={(e) => handleChange("it_code", e.target.value, e)}
              required
              maxLength={20}
              disabled={formStatus === "Update"}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "Product Code");
                }
              }}
            />
          </Col>

          <Col xl={3}>
            <Select
              type="text"
              label="Product Group"
              name="it_group"
              value={formData?.it_group || ""}
              onChange={(e) => handleChange("it_group", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "Product Group");
                }
              }}
              required
              options={product}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={8}>
            <TextArea
              type="text"
              label="Description"
              name="it_desc"
              value={formData?.it_desc || ""}
              maxLength={4000}
              onChange={(e) => handleChange("it_desc", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Update" || formStatus === "Insert") {
                  validateRequiredField(e, "Description");
                }
              }}
              required
            />
          </Col>
          <Col xl={4}>
            <TextArea
              type="text"
              label="Short Description"
              //name="sht_desc"
              value={formData?.sht_desc?.toUpperCase() || ""}
              maxLength={40}
              onChange={(e) => handleChange("sht_desc", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "Short Description");
                }
              }}
              required
            />
          </Col>
        </Row>

        <Row className="d-flex justify-content-between">
          <Col xl={2}>
            <TextField
              type="text"
              label="UOM"
              name="it_um_cd"
              maxLength={4}
              value={formData?.it_um_cd || ""}
              onChange={(e) => handleChange("it_um_cd", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "UOM");
                }
              }}
              required
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Standard Packing"
              name="std_packing"
              value={formData?.std_packing || ""}
              maxLength={20}
              onChange={(e) => handleChange("std_packing", e.target.value, e)}
              // required
            />
          </Col>

          <Col xl={2}>
            <TextField
              style={{ textAlign: "right" }}
              type="number"
              label="Net Weight"
              name="net_wt"
              value={formData?.net_wt || ""}
              onChange={
                (e) => {
                  const val = e.target.value;
                  if (val === "") {
                    handleChange("net_wt", val, e);
                    return;
                  }

                  if (/^\d{0,4}(\.\d{0,2})?$/.test(val)) {
                    handleChange("net_wt", val, e);
                  }
                }
                // handleChange("net_wt", e.target.value, e)
              }
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  const val = parseFloat(formData?.net_wt);

                  if (!isNaN(val)) {
                    handleChange("net_wt", val.toFixed(2), e);
                  }

                  const rate = Number(e.target.value);
                  console.log("errg", rate);
                  const hasLocalError = handleRateValue(rate, e.target.name);
                  if (hasLocalError) {
                    e.target.focus();
                    return;
                  }
                  validateRequiredField(e, "Net weight");
                }
              }}
              required
            />
          </Col>

          <Col xl={2}>
            <TextField
              style={{ textAlign: "right" }}
              type="number"
              label="Gross Wt."
              name="gross_wt"
              value={formData?.gross_wt || ""}
              // value={
              //   !isNaN(parseFloat(formData.gross_wt))
              //     ? parseFloat(formData.gross_wt).toFixed(2)
              //     : ""
              // }
              //onChange={(e) => handleChange("gross_wt", e.target.value, e)}
              onChange={
                (e) => {
                  const val = e.target.value;
                  if (val === "") {
                    handleChange("gross_wt", val, e);
                    return;
                  }

                  if (/^\d{0,4}(\.\d{0,2})?$/.test(val)) {
                    handleChange("gross_wt", val, e);
                  }
                }
                // handleChange("net_wt", e.target.value, e)
              }
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  const val = parseFloat(formData?.gross_wt);

                  if (!isNaN(val)) {
                    handleChange("gross_wt", val.toFixed(2), e);
                  }

                  const rate = Number(e.target.value, e);
                  console.log("errg", rate);
                  const hasLocalError = handleRateValue(rate, e.target.name);
                  if (hasLocalError) {
                    e.target.focus();
                    return;
                  }
                  validateRequiredField(e, "Gross Weight");
                }
              }}
              required
            />
          </Col>
        </Row>

        <Row className="mt-1 justify-content-between">
          <Col xl={2}>
            <TextField
              type="text"
              label="Catalog Code"
              name="catalog_code"
              value={formData?.catalog_code || ""}
              maxLength={20}
              onChange={(e) => handleChange("catalog_code", e.target.value, e)}
              // required
            />
          </Col>

          <Col xl={6}>
            <TextField
              type="text"
              label="Catalog Description"
              name="catalog_desc"
              value={formData?.catalog_desc || ""}
              maxLength={40}
              onChange={(e) => handleChange("catalog_desc", e.target.value, e)}
              //required
            />
          </Col>
          <Col xl={2}>
            <Select
              type="text"
              label="Product Catg"
              name="main_cat_id"
              value={formData?.main_cat_id || ""}
              // onChange={(e) => handleChange("main_cat_id", e.target.value, e)}
              onChange={(e) => {
                handleChange("main_cat_id", e.target.value, e);

                setSelectedCategory(e.target.value, e);
              }}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "Product Description");
                }
              }}
              options={mainCat}
              required
            />
          </Col>

          <Col xl={2}>
            <Select
              type="text"
              label="Sub Catg"
              name="sub_cat_id"
              value={formData?.sub_cat_id || ""}
              onChange={(e) => handleChange("sub_cat_id", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "Sub Category");
                }
              }}
              required
              options={formStatus === "Query" ? subCat : filteredSubCat}
              disabled={!formData?.main_cat_id}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={12}>
            <TextArea
              type="text"
              label="Tech Specs"
              name="tech_specs"
              value={formData?.tech_specs || ""}
              maxLength={2000}
              onChange={(e) => handleChange("tech_specs", e.target.value, e)}
              // required
            />
          </Col>
        </Row>

        <Row className=" justify-content-between ">
          <Col xl={2}>
            <TextField
              type="text"
              label="HSN Code/SED"
              name="hsn_sac_code"
              value={formData?.hsn_sac_code || ""}
              maxLength={20}
              onChange={(e) => handleChange("hsn_sac_code", e.target.value, e)}
              onBlur={(e) => {
                if (formStatus === "Insert" || formStatus === "Update") {
                  validateRequiredField(e, "HSN Sac Code");
                }
              }}
              required
            />
          </Col>
          <Col xl={2}>
            <Select
              style={{ marginTop: "0.31rem" }}
              type="text"
              label="Commodity"
              name="commodity"
              value={formData?.commodity || ""}
              onChange={(e) => handleChange("commodity", e.target.value, e)}
              // required
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Tarrif No."
              name="tarrif_no"
              value={formData?.tarrif_no || ""}
              onChange={(e) => handleChange("tarrif_no", e.target.value, e)}
              //required
            />
          </Col>
          <Col xl={2} className="button-group-wrapper mt-3 ">
            <Checkbox
              onChange={(e) =>
                handleChange("active", e.target.checked ? "1" : "0")
              }
              text="Active"
              checked={formData?.active === "1"}
            />
          </Col>
          <Col xl={3} className="button-group-wrapper mt-3">
            <Checkbox
              onChange={(e) =>
                handleChange("rep_prod", e.target.checked ? "Y" : "N")
              }
              text="Effect in Production Report"
              checked={formData?.rep_prod === "Y"}
            />
          </Col>
        </Row>

        <div className=" text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2 ">
          <span className="text-label">Product Price</span>
          <Row className="d-flex justify-content-around">
            <Col xl={2}>
              <TextField
                style={{ textAlign: "right" }}
                type="number"
                label="Trade Price"
                name="it_rate"
                value={formData?.it_rate || ""}
                // value={
                //   !isNaN(parseFloat(formData.it_rate))
                //     ? parseFloat(formData.it_rate).toFixed(2)
                //     : ""
                // }
                onChange={(e) => handleChange("it_rate", e.target.value, e)}
                onBlur={(e) => {
                  if (formStatus === "Insert" || formStatus === "Update") {
                    const val = parseFloat(formData?.it_rate);

                    if (!isNaN(val)) {
                      handleChange("it_rate", val.toFixed(2), e);
                    }

                    const rate = Number(e.target.value, e);
                    console.log("errg", rate);
                    const hasLocalError = handleRateValue(rate, e.target.name);
                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
                //required
              />
            </Col>
            <Col xl={2}>
              <TextField
                style={{ textAlign: "right" }}
                type="number"
                label="Selling Price as Spares"
                name="selling_price"
                value={formData?.selling_price || ""}
                // value={
                //   !isNaN(parseFloat(formData.selling_price))
                //     ? parseFloat(formData.selling_price).toFixed(2)
                //     : ""
                // }
                onChange={(e) =>
                  handleChange("selling_price", e.target.value, e)
                }
                onBlur={(e) => {
                  if (formStatus === "Insert" || formStatus === "Update") {
                    const val = parseFloat(formData?.selling_price);

                    if (!isNaN(val)) {
                      handleChange("selling_price", val.toFixed(2), e);
                    }

                    const rate = Number(e.target.value, e);
                    console.log("errg", rate);
                    const hasLocalError = handleRateValue(rate, e.target.name);
                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
                //required
              />
            </Col>

            <Col xl={2}>
              <TextField
                style={{ textAlign: "right" }}
                type="number"
                label="Selling Price as Accessories"
                name="price_accessories"
                value={formData?.price_accessories || ""}
                // value={
                //   !isNaN(parseFloat(formData.price_accessories))
                //     ? parseFloat(formData.price_accessories).toFixed(2)
                //     : ""
                // }
                onChange={(e) =>
                  handleChange("price_accessories", e.target.value, e)
                }
                onBlur={(e) => {
                  if (formStatus === "Insert" || formStatus === "Update") {
                    const val = parseFloat(formData?.price_accessories);

                    if (!isNaN(val)) {
                      handleChange("price_accessories", val.toFixed(2), e);
                    }

                    const rate = Number(e.target.value, e);
                    console.log("errg", rate);
                    const hasLocalError = handleRateValue(rate, e.target.name);
                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
                //required
              />
            </Col>

            <Col xl={2} className="button-group-wrapper mt-3">
              <Checkbox
                text="Apply MRP"
                onChange={(e) =>
                  handleChange(
                    "apply_tax_paid_price",
                    e.target.checked ? "Y" : "N"
                  )
                }
                checked={formData?.apply_tax_paid_price === "Y"}
              />
            </Col>

            <Col xl={2}>
              <TextField
                style={{ textAlign: "right" }}
                type="number"
                label="MRP"
                name="tax_paid_price"
                value={formData?.tax_paid_price || ""}
                // value={
                //   !isNaN(parseFloat(formData.tax_paid_price))
                //     ? parseFloat(formData.tax_paid_price).toFixed(2)
                //     : ""
                // }
                onChange={(e) =>
                  handleChange("tax_paid_price", e.target.value, e)
                }
                onBlur={(e) => {
                  if (formStatus === "Insert" || formStatus === "Update") {
                    const val = parseFloat(formData?.tax_paid_price);

                    if (!isNaN(val)) {
                      handleChange("tax_paid_price", val.toFixed(2), e);
                    }

                    const rate = Number(e.target.value, e);
                    console.log("errg", rate);
                    const hasLocalError = handleRateValue(rate, e.target.name);
                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
                //required
              />
            </Col>
          </Row>
        </div>
      </Form>
    </React.Fragment>
  );
};

export default ProductMasterDtl;
