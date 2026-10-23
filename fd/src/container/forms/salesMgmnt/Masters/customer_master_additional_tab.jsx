import React from "react";
import { Row, Col, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import { salePersonHelpListHeader, StockistCodeHelpListHeader, SupplierCodeAllotedHelpListHeader,  } from "./customer_master_helper";

const CustomeMasterAdditionalTab = ({
  formData = {},
handleChange = () => {},
  formStatus,
  currCodeList=[],
   modeOfTrans=[],
    termCodeList=[],
     pricebasis=[],
     handleHelpList = () => {},setHelpFor, setHelpListHeader,
     setFormDataOnValidateField=()=>{}
}) => {

     const handleDoubleClick = (field, header) => {
      if (["Insert", "Update"].includes(formStatus)) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
        }
     }

     const ValidateFieldFromDB=(e, data, setData, formStatus, cb)=>{
        if(!formData?.c_name){
            toast.error('Customer Name cannot be left blank')
            setData({...data, c_city_name:''})
            return;
        }
        if(e.key === 'Enter' || e.key === 'Tab'){
            cb(e, setData, data, formStatus);
        }
    }

     // const handleWhenValidateItem = (e) => {
    //     if(!['Insert, Update'].includes(formStatus)){
    //         return
    //     }
    //     if(e.target.name == 'interest' && e.target.value < 0){
    //         if(e.target.value <0){
    //             toast.error(`Panel Interest cannot be negative`);
    //             document.querySelector("#interest").focus();
    //         }else if(e.target.value > 100){
    //             toast.error(`Panel Interest cannot be greater than 100`);
    //             document.querySelector("#interest").focus();
    //         }
    //     }
    // };


  return (
    <>
      <Card>
        <Row className="mb-1 ms-1 sm-me-1">
          <Col sm={11} md={6} lg={6}>
            <h6>End User Contact Person Detail</h6>
            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Name"
                  value={formData?.con_per1 || ""}
                  onChange={(e) => handleChange("con_per1", e.target.value ,e)}
                />
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="E-mail"
                  value={formData?.con_per1_email || ""}
                  onChange={(e) => handleChange("con_per1_email", e.target.value ,e) }
                />
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Telephone"
                  value={formData?.con_per1_telephone || ""}
                  onChange={(e) =>
                    handleChange("con_per1_telephone", e.target.value,e )
                  }
                />
              </Col>
            </Row>

            <Row className="mb-1">
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Designation"
                  value={formData?.con_per1_desig || ""}
                  onChange={(e) =>
                    handleChange("con_per1_desig", e.target.value ,e)
                  }
                />
              </Col>
            </Row>
          </Col>

          <Col sm={11} md={6} lg={6}>
            <h6>Purchase Contact Person Detail</h6>
            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Name"
                  value={formData?.con_per2 || ""}
                  onChange={(e) => handleChange("con_per2", e.target.value,e )}
                />
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="E-mail"
                  value={formData?.con_per2_email || ""}
                  onChange={(e) =>
                    handleChange("con_per2_email", e.target.value ,e)
                  }
                />
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Telephone"
                  value={formData?.con_per2_telephone || ""}
                  onChange={(e) =>
                    handleChange("con_per2_telephone", e.target.value ,e)
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card className="mt-2">
        <Row className="mb-1 ms-1">
          <Col sm={11} md={6} lg={6}>
            <h6>Commercial Contact Person Detail</h6>
            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Name"
                  value={formData?.commercial_con_per || ""}
                  onChange={(e) =>
                    handleChange("commercial_con_per", e.target.value,e )
                  }
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="E-mail"
                  value={formData?.commercial_con_per_mail || ""}
                  onChange={(e) =>
                    handleChange("commercial_con_per_mail", e.target.value ,e)
                  }
                />
              </Col>
            </Row>
          </Col>

          <Col sm={11} md={6} lg={6} className="mt-4">
            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Telephone"
                  value={formData?.commercial_con_per_telephone || ""}
                  onChange={(e) =>
                    handleChange("commercial_con_per_telephone", e.target.value,e )
                  }
                />
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={10} lg={10}>
                <TextField
                  type="text"
                  label="Designation"
                  value={formData?.commercial_con_per_desig || ""}
                  onChange={(e) =>
                    handleChange("commercial_con_per_desig", e.target.value ,e)
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row className="mt-1">
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Sale Person"
            value={formData?.sales_per_cd || ""}
            onChange={(e) => handleChange("sales_per_cd", e.target.value ,e)}
            onDoubleClick = {() => handleDoubleClick('salePerson',salePersonHelpListHeader)}
            onKeyDown={(e) =>ValidateFieldFromDB(e, formData, setFormDataOnValidateField, formStatus, validateSalesCd)}
          />
        </Col>
        <Col sm={6} md={3} lg={3} className="mt-4">
          <TextField
            type="text"
            // label="Sale Person"
            value={formData?.emp_name || ""}
            onChange={(e) => handleChange("emp_name", e.target.value ,e)}
            disabled={formStatus !== "Query"}
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <TextField
            type="text"
            label="Port of Discharge"
            value={formData?.port_disc || ""}
            onChange={(e) => handleChange("port_disc", e.target.value ,e)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={6} lg={3}>
          <Select
            label="Currency"
            name="curr_cd"
            placeholder={" "}
            value={formData?.curr_cd || ""}
            onChange={(e) => handleChange("curr_cd", e.target.value,e )}
            options={currCodeList}
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <Select
            label="Mode Code"
            name="mode_cd"
            placeholder={" "}
            value={formData?.mode_cd || ""}
            onChange={(e) => handleChange("mode_cd", e.target.value ,e)}
            options={modeOfTrans}
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <Select
            label=" Term Code"
            name="term_code"
            placeholder={" "}
            value={formData?.term_code || ""}
            onChange={(e) =>handleChange("term_code", e.target.value  ,e) }
            options={termCodeList}
          />
        </Col>

        <Col sm={12} md={6} lg={3}>
          <Select
            label="Delivery Term"
            name="del_terms"
            placeholder={" "}
            value={formData?.del_terms || ""}
            onChange={(e) =>handleChange("del_terms", e.target.value,e )}
            options={pricebasis}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col md={3} lg={2} className="button-group-wrapper">
          <Checkbox
            text="Octroi"
            onChange={(e) =>
              handleChange("octroi", e.target.checked ? "Y" : "N",e)
            }
            checked={formData?.octroi === "Y"}
          />
        </Col>
        <Col md={3} lg={2} className="button-group-wrapper">
          <Checkbox
            text="Freight"
            onChange={(e) =>
              handleChange("freight", e.target.checked ? "Y" : "N",e)
            }
            checked={formData?.freight === "Y"}
          />
        </Col>
        <Col md={3} lg={2} className="button-group-wrapper">
          <Checkbox
            text="Insurance"
            onChange={(e) =>
              handleChange("insurance", e.target.checked ? "Y" : "N",e)
            }
            checked={formData?.insurance === "Y"}
          />
        </Col>
        <Col sm={12} md={8} lg={4} className="mt-lg-1 mt-md-2 mt-sm-2">
          <div className="text-wrapper">
            <span className="text-label">TCS</span>
            <RadioGroup
              className="box-border radio-button-wrapper Transaction-height"
              options={[
                { text: "Company", value: "C" },
                { text: " Non Company", value: "N" },
              ]}
              // check again data
              onChange={(e) => handleChange("tcs_cat", e.target.value,e)}
              checked={formData?.tcs_cat || "C"}
            />
          </div>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            label="Ship mark"
            name="ship_mark"
            value={formData?.ship_mark || ""}
            onChange={(e) => handleChange("ship_mark", e.target.value ,e)}
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="number"
            step="0.1"
            min={0}
            max={100}
            label="Penal Interest(%)"
            // value={formData?.interst || ""}
            value={formData?.interst || "0.00"}
              // onBlur ={handleWhenValidateItem}
            onChange={(e) => handleChange("interst", e.target.value,e )}
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            label="Credit Limit"
            value={formData?.cre_limit || ""}
            onChange={(e) => handleChange("cre_limit", e.target.value ,e)}
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            label="Payment days"
            value={formData?.pymnt_days || ""}
            onChange={(e) => handleChange("pymnt_days", e.target.value ,e)}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={12} md={12} lg={4}>
          <TextField
            type="text"
            label="Banker"
            value={formData?.bankers || ""}
            onChange={(e) => handleChange("bankers", e.target.value ,e)}
          />
        </Col>
        <Col sm={12} md={6} lg={4}>
          <TextField
            type="text"
            label="Supplier Code Alloted by Customer"
            value={formData?.cus_v_code || ""}
            onChange={(e) => handleChange("cus_v_code", e.target.value,e )}
            onDoubleClick = {()=>handleDoubleClick("supplierCodeAlloted",SupplierCodeAllotedHelpListHeader)}
          />
        </Col>
        <Col sm={12} md={6} lg={4}>
          <TextField
            type="text"
            label="Stockist Code"
            value={formData?.stockist_code || ""}
            onChange={(e) => handleChange("stockist_code", e.target.value,e )}
            onDoubleClick = {()=> handleDoubleClick('stockistCode',StockistCodeHelpListHeader)}
          />
        </Col>
      </Row>
    </>
  );
};

export default CustomeMasterAdditionalTab;
