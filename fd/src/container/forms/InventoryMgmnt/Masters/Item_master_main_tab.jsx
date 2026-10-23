import React from "react";
import { Container, Row, Col, Table, Form } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import Select from "../../../../components/basic/select";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import {
  headers,
  itCodeHelpListHeader,
  itDescHelpListHeader,
} from "./Item_master_helper";
import RowAction from "../../../../components/common/rowAction";
import _ from "lodash";
import toast from "react-hot-toast";

const ItemMasterMain = ({
  apiData,
  formData,
  handleChange,
  formStatus,
  mainDtlFormData,
  handleChangeDtl,
  handleCodeGeneration,
  triggerAddRow,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
}) => {
  const handleDoubleClick = (field, header) => {
    if (["Search"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  const isUpdate = formStatus == "Update",
    isQuery =
      ["Query", "Last", "Next", "Prev", "First"].indexOf(formStatus) > -1;
  const isUpdateOrQuery = isUpdate || isQuery;

  const barrelOptions =
    _.map(apiData?.barrelCategoryList || [], (item) => ({
      value: item.level1,
      // label: `${item.cat_desc} [${item.level1}]`,
      label: `${item.cat_desc}`,
    })) || [];
  const typeListOptions =
    _.map(apiData?.typeList || [], (item) => ({
      value: item.level2,
      // label: `${item.description} [${item.level2}]`,
      label: `${item.description}`,
    })) || [];
  const materialBaseListOptions =
    _.map(apiData?.materialBaseList || [], (item) => ({
      value: item.level3,
      // label: `${item.cat_desc} [${item.level3}]`,
      label: `${item.cat_desc}`,
    })) || [];
  const subCategoryListOptions =
    _.map(apiData?.subCategoryList || [], (item) => ({
      value: item.level4,
      // label: `${item.cat_desc} [${item.level4}]`,
      label: `${item.cat_desc}`,
    })) || [];
  const broadPurchaseOptions =
    _.map(apiData?.broadCategoryList || [], (item) => ({
      value: item.code,
      // label: `${item.description} [${item.code}]`,
      label: `${item.description}`,
    })) || [];
  const finishCodeOptions =
    _.map(apiData?.finishCodeList || [], (item) => ({
      value: item.code,
      label: `${item.prefix} - ${item.description} [${item.code}]`,
    })) || [];
  const colorCodeOptions =
    _.map(apiData?.colorCodeList || [], (item) => ({
      value: item.code,
      label: `${item.prefix} - ${item.description} [${item.code}]`,
    })) || [];
  const unitsListOptions =
    _.map(apiData?.unitsDataList || [], (item) => ({
      value: item.unit,
      // label: `[${item.unit}] ${item.description}`,
      label: `${item.description}`,
    })) || [];
  const storageListOptions =
    _.map(apiData?.storageDataList || [], (item) => ({
      value: item.code,
      // label: `[${item.code}] ${item.description}`,
      label: `${item.description}`,
    })) || [];
  const packingListOptions =
    _.map(apiData?.packingList || [], (item) => ({
      value: item.code,
      // label: `[${item.code}] ${item.description}`,
      label: `${item.description}`,
    })) || [];
  const classListOptions = _.map(["A", "B", "C", "D"], (e) => ({
    value: e,
    label: e,
  }));

  function handleDelete() {}
  function handleUpdate() {}

  //console.log(`[Inventory -> Master Form Data] :: `, formData);
  return (
    <Container>
      <Row className="">
        <Col sm={6} md={3} lg={3} className="mt-auto">
          <Select
            required
            type="text"
            label="Barrel 1 Category"
            value={formData.main_type || ""}
            onChange={(e) => handleChange("main_type", e.target.value)}
            // disabled={isUpdateOrQuery}
            options={[{ value: "", label: "Select" }, ...barrelOptions]}
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            type="text"
            label="Type"
            value={formData.it_type || ""}
            onChange={(e) => handleChange("it_type", e.target.value)}
            // disabled={!formData.main_type || isUpdateOrQuery}
            options={[{ value: "", label: "Select" }, ...typeListOptions]}
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            type="text"
            label="Material Base"
            value={formData.it_base || ""}
            onChange={(e) => handleChange("it_base", e.target.value)}
            // disabled={
            //   !(formData.main_type && formData.it_type) || isUpdateOrQuery
            // }
            options={[
              { value: "", label: "Select" },
              ...materialBaseListOptions,
            ]}
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            type="text"
            label="Sub Category"
            value={formData.it_sub_c || ""}
            onChange={(e) => handleChange("it_sub_c", e.target.value)}
            // disabled={
            //   !(formData.main_type && formData.it_type && formData.it_base) ||
            //   isUpdateOrQuery
            // }
            options={[
              { value: "", label: "Select" },
              ...subCategoryListOptions,
            ]}
          />
        </Col>
        {/* <Col sm={12} md={4} lg={2} className="button-group-wrapper mt-auto">
          <Checkbox
            text="Manual Item Code"
            onChange={(e) =>
              handleChange("gen_code_manual", e.target.checked ? "Y" : "N")
            }
            checked={formData?.gen_code_manual === "Y"}
            disabled={
              !(
                formData.main_type &&
                formData.it_type &&
                formData.it_sub_c &&
                formData.it_base
              ) ||
              formData?.gen_code_manual === "Y" ||
              formData?.gen_code_auto === "Y" ||
              isUpdateOrQuery
            }
          />
        </Col>
        <Col sm={5} md={2} lg={2} className="mt-auto ">
          <ButtonUi
            color="dark"
            disabled={
              !(
                formData.main_type &&
                formData.it_type &&
                formData.it_sub_c &&
                formData.it_base
              ) ||
              formData.gen_code_manual === "Y" ||
              formData?.gen_code_auto === "Y" ||
              isUpdateOrQuery
            }
            onClick={handleCodeGeneration}
          >
            Gen. Code
          </ButtonUi>
        </Col> */}
      </Row>

      <Row className="mt-1">
        {/* <Col sm={12} md={4} lg={3} className="button-group-wrapper mt-auto">
          <Checkbox
            text="Manual Item Code"
            onChange={(e) =>
              handleChange("gen_code_manual", e.target.checked ? "Y" : "N")
            }
            checked={formData?.gen_code_manual === "Y"}
            disabled={
              !(
                formData.main_type &&
                formData.it_type &&
                formData.it_sub_c &&
                formData.it_base
              ) ||
              formData?.gen_code_manual === "Y" ||
              formData?.gen_code_auto === "Y" ||
              isUpdateOrQuery
            }
          />
        </Col> */}
        {/* <Col sm={5} md={2} lg={3} className="mt-auto ">
          <ButtonUi
            color="dark"
            disabled={
              !(
                formData.main_type &&
                formData.it_type &&
                formData.it_sub_c &&
                formData.it_base
              ) ||
              formData.gen_code_manual === "Y" ||
              formData?.gen_code_auto === "Y" ||
              isUpdateOrQuery
            }
            onClick={handleCodeGeneration}
          >
            Gen. Code
          </ButtonUi>
        </Col> */}
        <Col sm={6} md={3} lg={3}>
          <TextField
            required
            type="text"
            label="Item Code"
            value={formData.it_code || ""}
            onChange={(e) => handleChange("it_code", e.target.value)}
            disabled={
              formData?.gen_code_manual == "N" ||
              formData?.gen_code_auto == "Y" ||
              isUpdateOrQuery
            }
            onDoubleClick={() =>
              handleDoubleClick("item", itCodeHelpListHeader)
            }
          />
        </Col>
        {/* <Col sm={5} md={2} lg={1} className="mt-3 ms-4">
          <ButtonUi color="dark" outline>
            Cat
          </ButtonUi>
        </Col> */}
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            required
            label="Item Name(Max 40)"
            value={formData.it_name || ""}
            onChange={(e) => handleChange("it_name", e.target.value)}
            disabled={isUpdateOrQuery}
            onBlur={(e) => handleChange("it_name_long", formData.it_name)}
            onDoubleClick={() =>
              handleDoubleClick("desc", itDescHelpListHeader)
            }
          />
        </Col>
        {/* <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Barrel 1 Category"
            value={formData.disp_it_level1 || ""}
            onChange={(e) => handleChange("disp_it_level1", e.target.value)}
          />
        </Col> */}
        <Col sm={12} md={4} lg={2} className="button-group-wrapper mt-4">
          <div
            style={{
              color: formData?.subsidy_yes_no === "Y" ? "green" : "red",
              fontWeight: "900",
            }}
          >
            <Checkbox
              text={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: formData?.subsidy_yes_no === "Y" ? "green" : "red",
                  }}
                >
                  Subsidy Applicable
                </span>
              }
              onChange={(e) =>
                handleChange("subsidy_yes_no", e.target.checked ? "Y" : "N")
              }
              checked={formData?.subsidy_yes_no === "Y"}
            />
          </div>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={6} lg={4}>
          <Select
            required
            label="Broad Purchase category"
            name="brod_lvl_purch_cat"
            placeholder={" "}
            value={formData.brod_lvl_purch_cat || ""}
            onChange={(e) => handleChange("brod_lvl_purch_cat", e.target.value)}
            options={[{ value: "", label: "Select" }, ...broadPurchaseOptions]}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mt-4">
          <RadioGroup
            className="radio-button-wrapper  box-border"
            options={[
              { text: "Fast", value: "F" },
              { text: "Slow", value: "S" },
              { text: "Non Moving", value: "N" },
            ]}
            onChange={(e) => handleChange("fsn_flag", e.target.value)}
            checked={formData?.fsn_flag || "F"}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={4} lg={2} className="mt-3">
          <span>DIMENSIONS:</span>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="number"
            label="Length (mm)"
            value={formData.it_length || ""}
            onChange={(e) => handleChange("it_length", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="number"
            label="Width (mm)"
            value={formData.it_width || ""}
            onChange={(e) => handleChange("it_width", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="number"
            label="Height (mm)"
            value={formData.it_height || ""}
            onChange={(e) => handleChange("it_height", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="number"
            label="Thickness (mm)"
            value={formData.it_thick || ""}
            onChange={(e) => handleChange("it_thick", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="number"
            label="Sp.Gravity (kg/cu.m)"
            value={formData.density || ""}
            onChange={(e) => handleChange("density", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={3} lg={2}>
          <Select
            // required
            type="text"
            label="Finish"
            value={formData.it_finish || ""}
            onChange={(e) => handleChange("it_finish", e.target.value)}
            options={[{ value: "", label: "Select" }, ...finishCodeOptions]}
          />
        </Col>
        <Col sm={6} md={3} lg={3} className="mt-4">
          <TextField
            type="text"
            // label="Finish"
            value={formData.finish_desc || ""}
            onChange={(e) => handleChange("finish_desc", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <Select
            // required
            type="text"
            label="Colour"
            value={formData.it_colour || ""}
            onChange={(e) => handleChange("it_colour", e.target.value)}
            options={[{ value: "", label: "Select" }, ...colorCodeOptions]}
          />
        </Col>
        <Col sm={6} md={3} lg={3} className="mt-4">
          <TextField
            type="text"
            //  label="Colour"
            value={formData.colour_desc || ""}
            onChange={(e) => handleChange("colour_desc", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            label="Grade"
            value={formData.it_grade || ""}
            onChange={(e) => handleChange("it_grade", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Drawing No."
            value={formData.drawing_no || ""}
            onChange={(e) => handleChange("drawing_no", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Revision level"
            value={formData.rev_level || ""}
            onChange={(e) => handleChange("rev_level", e.target.value)}
            disabled={true}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Process No."
            value={formData.mfg_process_no || ""}
            onChange={(e) => handleChange("mfg_process_no", e.target.value)}
            disabled={true}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Development No."
            value={formData.development_no || ""}
            onChange={(e) => handleChange("development_no", e.target.value)}
          />
        </Col>
        {/* <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Sub assy Ref:"
            value={formData.sub_assy_ref || ""}
            onChange={(e) => handleChange("sub_assy_ref", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Cross ref No."
            value={formData.old_it_code || ""}
            onChange={(e) => handleChange("old_it_code", e.target.value)}
          />
        </Col>   as disscuss with pm sir*/}
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={8} lg={9}>
          <TextField
            required
            type="text"
            label="Item long name"
            value={formData.it_name_long || " "}
            onChange={(e) => handleChange("it_name_long", e.target.value)}
          />
        </Col>
        {/* <Col
          sm={6}
          md={3}
          lg={2}
          className=" ms-md-4 ms-lg-4 mt-lg-4 mt-md-4 mt-sm-1"
          style={{
            color: "red",
            visibility: isUpdateOrQuery ? "initial" : "hidden",
          }}
        >
          
          <h5>
            {apiData?.auth_flag_status == "Y" ? "Authorized" : "Unauthorized"}
          </h5>
        </Col> */}
      </Row>

      <Row className="mt-1">
        <div className="  col md-9 col-lg-10 text-wrapper  box border p-1 mt-2">
          <span className="text-label">Unit of Measure</span>
          <Row>
            <Col lg={8}>
              <Row>
                <Col md={6} lg={3}>
                  <Select
                    required
                    type="text"
                    label="Stock"
                    value={formData.um_code || ""}
                    onChange={(e) => handleChange("um_code", e.target.value)}
                    options={[
                      { value: "", label: "Select" },
                      ...unitsListOptions,
                    ]}
                  />
                </Col>
                <Col md={6} lg={3}>
                  <Select
                    required
                    type="text"
                    label="Purchase"
                    value={formData.it_pu_um || ""}
                    onChange={(e) => handleChange("it_pu_um", e.target.value)}
                    options={[
                      { value: "", label: "Select" },
                      ...unitsListOptions,
                    ]}
                  />
                </Col>
                <Col md={6} lg={5}>
                  <TextField
                    required
                    type="number"
                    name="it_p_umf"
                    label="Purch. UOM = How many Stock UOM"
                    value={formData.it_p_umf || ""}
                    onChange={(e) => handleChange("it_p_umf", e.target.value)}
                    disabled={
                      formData.um_code === formData.it_pu_um ||
                      formData.it_p_umf_disabled === "Y"
                    }
                    onBlur={(e) => {
                      if (e.target.value <= 0) {
                        toast.error(
                          "zero, negative and null value not allowed",
                        );
                        handleChange("it_p_umf", "1.000");
                      }
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={4}>
              <Row>
                <Col md={6} lg={5}>
                  <Select
                    required
                    type="text"
                    label="BOM"
                    value={formData.it_bom_um || ""}
                    onChange={(e) => handleChange("it_bom_um", e.target.value)}
                    options={[
                      { value: "", label: "Select" },
                      ...unitsListOptions,
                    ]}
                  />
                </Col>
                <Col md={6} lg={7}>
                  <TextField
                    required
                    type="number"
                    label="Stock UOM = How many"
                    value={formData.it_bom_umf || ""}
                    onChange={(e) => handleChange("it_bom_umf", e.target.value)}
                    disabled={
                      formData.um_code === formData.it_bom_um ||
                      formData.it_bom_umf_disabled === "Y"
                    }
                    onBlur={(e) => {
                      if (e.target.value <= 0) {
                        toast.error(
                          "zero, negative and null value not allowed",
                        );
                        handleChange("it_bom_umf", "1.000");
                      }
                    }}
                  />
                </Col>
              </Row>
            </Col>
            {/* <Col md={6} lg={2}>
              <Select
                required
                type="text"
                label="Stock"
                value={formData.um_code || ""}
                onChange={(e) => handleChange("um_code", e.target.value)}
                options={[{ value: "", label: "Select" }, ...unitsListOptions]}
              />
            </Col>
            <Col md={6} lg={2}>
              <Select
                required
                type="text"
                label="Purchase"
                value={formData.it_pu_um || ""}
                onChange={(e) => handleChange("it_pu_um", e.target.value)}
                options={[{ value: "", label: "Select" }, ...unitsListOptions]}
              />
            </Col>
            <Col md={6} lg={3}>
              <TextField
                required
                type="number"
                name="it_p_umf"
                label="Purchase UOM = How many Stock UOM"
                value={formData.it_p_umf || ""}
                onChange={(e) => handleChange("it_p_umf", e.target.value)}
                disabled={
                  formData.um_code === formData.it_pu_um ||
                  formData.it_p_umf_disabled === "Y"
                }
                onBlur={(e)=>{
                if(e.target.value <= 0){
                  toast.error('zero, negative and null value not allowed')
                  handleChange("it_p_umf", '1.000')
                }  
                }}
              />
            </Col> */}

            {/* <Col md={6} lg={2}>
              <Select
                required
                type="text"
                label="BOM"
                value={formData.it_bom_um || ""}
                onChange={(e) => handleChange("it_bom_um", e.target.value)}
                options={[{ value: "", label: "Select" }, ...unitsListOptions]}
              />
            </Col>
            <Col md={6} lg={2}>
              <TextField
                required
                type="number"
                label="Stock UOM = How many"
                value={formData.it_bom_umf || ""}
                onChange={(e) => handleChange("it_bom_umf", e.target.value)}
                disabled={
                  formData.um_code === formData.it_bom_um ||
                  formData.it_bom_umf_disabled === "Y"
                }
                onBlur={(e)=>{
                  if(e.target.value <= 0){
                    toast.error('zero, negative and null value not allowed')
                    handleChange("it_bom_umf", '1.000')
                  }  
                  }}
              />
            </Col> */}
          </Row>
        </div>
        <Col md={3} lg={2} className=" mt-2">
          <TextField
            required
            type="text"
            label="HSN/SAC Code"
            value={formData.hsn_sac_code || ""}
            onChange={(e) => handleChange("hsn_sac_code", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col lg={4}>
          <Row>
            <Col sm={6} md={3} lg={5}>
              <Select
                required
                label="Class"
                name="it_abc"
                placeholder={""}
                value={formData.it_abc || ""}
                onChange={(e) => handleChange("it_abc", e.target.value)}
                options={[{ value: "", label: "Select" }, ...classListOptions]}
              />
            </Col>
            <Col sm={6} md={5} lg={7} className="mt-4">
              <RadioGroup
                className="radio-button-wrapper  box-border"
                options={[
                  { text: "Purchase", value: "P" },
                  { text: "FMP", value: "F" },
                ]}
                onChange={(e) => handleChange("it_fmp_pu", e.target.value)}
                checked={formData?.it_fmp_pu || "P"}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={6} md={4} lg={4}>
              <TextField
                type="text"
                label="Bulk Issue Qty."
                value={formData.bulk_issue || ""}
                onChange={(e) => handleChange("bulk_issue", e.target.value)}
              />
            </Col>
            <Col sm={6} md={4} lg={4}>
              <TextField
                type="number"
                label="Weight (kgs)"
                value={formData.it_wgt_kg || ""}
                onChange={(e) => handleChange("it_wgt_kg", e.target.value)}
              />
            </Col>
            <Col sm={6} md={4} lg={4}>
              <TextField
                type="number"
                label="Shell life (Days)"
                value={formData.it_sh_li || ""}
                onChange={(e) => handleChange("it_sh_li", e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={6} md={6} lg={6}>
              <Select
                type="text"
                label="Storage Type"
                value={formData.item_storage_type || ""}
                onChange={(e) =>
                  handleChange("item_storage_type", e.target.value)
                }
                options={[
                  { value: "", label: "Select" },
                  ...storageListOptions,
                ]}
              />
            </Col>
            <Col sm={6} md={6} lg={6}>
              <Select
                label="Packing Mode"
                name="pack_mod"
                placeholder={" "}
                value={formData.pack_mod || ""}
                onChange={(e) => handleChange("pack_mod", e.target.value)}
                options={[
                  { value: "", label: "Select" },
                  ...packingListOptions,
                ]}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={6} md={6} lg={6}>
              <TextField
                type="text"
                label="Packing Lot"
                value={formData.pack_lot || ""}
                onChange={(e) => handleChange("pack_lot", e.target.value)}
              />
            </Col>
            <Col sm={6} md={6} lg={6}>
              <TextField
                type="number"
                label="Lot Size"
                value={formData.lot_size || ""}
                onChange={(e) => handleChange("lot_size", e.target.value)}
              />
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <Row className="mt-2">
            <Col sm={12} md={4} lg={6} className="button-group-wrapper">
              <Checkbox
                text="Bulk Issue"
                onChange={(e) =>
                  handleChange("bulk_flag", e.target.checked ? "Y" : "N")
                }
                checked={formData?.bulk_flag === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className=" button-group-wrapper ">
              <Checkbox
                text="Imported"
                onChange={(e) =>
                  handleChange("it_lo_im", e.target.checked ? "I" : "L")
                }
                checked={formData?.it_lo_im === "I"}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Batch Control Reqd"
                onChange={(e) =>
                  handleChange(
                    "batch_control_flag",
                    e.target.checked ? "Y" : "N",
                  )
                }
                checked={formData?.batch_control_flag === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Active"
                onChange={(e) =>
                  handleChange("active", e.target.checked ? "Y" : "N")
                }
                checked={formData?.active === "Y"}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Make Required"
                onChange={(e) =>
                  handleChange("make_req", e.target.checked ? "Y" : "N")
                }
                checked={formData?.make_req === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Inventory"
                onChange={(e) =>
                  handleChange("inventory_yesno", e.target.checked ? "Y" : "N")
                }
                checked={formData?.inventory_yesno === "Y"}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Srl No Required"
                onChange={(e) =>
                  handleChange("srlno_req", e.target.checked ? "Y" : "N")
                }
                checked={formData?.srlno_req === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Include in MRP"
                onChange={(e) =>
                  handleChange("mrp_yesno", e.target.checked ? "Y" : "N")
                }
                checked={formData?.mrp_yesno === "Y"}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Phantom Assembly"
                onChange={(e) =>
                  handleChange("phntm_asby", e.target.checked ? "Y" : "N")
                }
                checked={formData?.phntm_asby === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper ">
              <Checkbox
                text="Spare part"
                onChange={(e) =>
                  handleChange("spar_part", e.target.checked ? "Y" : "N")
                }
                checked={formData?.spar_part === "Y"}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper ">
              <Checkbox
                text="FMP Final Component"
                onChange={(e) =>
                  handleChange(
                    "fmp_final_component",
                    e.target.checked ? "Y" : "N",
                  )
                }
                checked={formData?.fmp_final_component === "Y"}
              />
            </Col>
            <Col sm={12} md={4} lg={6} className="button-group-wrapper  ">
              <Checkbox
                text="Treat as Consumed on Issue"
                onChange={(e) =>
                  handleChange(
                    "treat_as_consumed_on_issue",
                    e.target.checked ? "Y" : "N",
                  )
                }
                checked={formData?.treat_as_consumed_on_issue === "Y"}
              />
            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
            <Col sm={8} md={6} lg={8} className="mt-2">
              <div className="text-wrapper">
                <span className="text-label">FIFO based on</span>
                <RadioGroup
                  className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                  options={[
                    { text: "MRIR Date", value: "M" },
                    { text: "Batch Date", value: "B" },
                  ]}
                  onChange={(e) => handleChange("fifo_base", e.target.value)}
                  checked={formData?.fifo_base || "M"}
                />
              </div>
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <Row className="">
            <Col xs={12} lg={12}>
              <Form id="item-master">
                <div className="table-title">
                  <span>Item Site</span>
                  {/* {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi
                      color="primary"
                      className="add-action"
                      onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )} */}
                </div>

                <div
                  className="table-container"
                  style={{ height: "180px", maxHeight: "180px" }}
                >
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <Table hover>
                      <thead>
                        <tr>
                          {/* {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                              <th className="sticky-column left">Actions</th>
                            )} */}
                          {headers.map((header, index) => (
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
                        {mainDtlFormData.map((data, rowIndex) => (
                          <tr key={rowIndex}>
                            {/* {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={mainDtlFormData.length > 1}
                                    onDelete={() => handleDelete(data, rowIndex)}
                                    onUpdate={
                                      handleUpdate
                                        ? () => handleUpdate(data)
                                        : undefined
                                    }
                                  />
                                </td>
                              )} */}
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="wc_no"
                                disabled
                                value={data.wc_no || ""}
                                maxLength={30}
                                onChange={(e) =>
                                  handleChangeDtl(
                                    "wc_no",
                                    e.target.value,
                                    rowIndex,
                                    e,
                                  )
                                }
                              />
                            </td>
                            <td className="table_cell">
                              <Checkbox
                                onChange={(e) =>
                                  handleChangeDtl(
                                    "active",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex,
                                    e,
                                  )
                                }
                                checked={data?.active === "Y"}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <Checkbox
                                onChange={(e) =>
                                  handleChangeDtl(
                                    "default_store",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex,
                                    e,
                                  )
                                }
                                checked={data?.default_store === "Y"}
                                disabled
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </SimpleBar>
                </div>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Created By"
            value={formData.create_by || ""}
            onChange={(e) => handleChange("create_by", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="date"
            label="Created date"
            value={formData.create_date || ""}
            onChange={(e) => handleChange("create_date", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Modified By"
            value={formData.update_by || ""}
            onChange={(e) => handleChange("update_by", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="date"
            label="Modified date"
            value={formData.update_date || ""}
            onChange={(e) => handleChange("update_date", e.target.value)}
            disabled
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ItemMasterMain;
