import React from "react";
import { Card, Col, Container, Row } from "reactstrap";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";

const GenParaDivWiseDtl = ({ formData, handleChange, formStatus, excise = [], floor = [], party = [], service = [], receive = [], production = [], income=[], rework=[], trading=[]   }) => {
  return (
    <>
    <Card>
    <Container className="my-2">
      {/* Form Row Start */}
   
      <Row>
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Excise Godown Store"
          
           value={formData?.excise_godown_wc_id || ""}
            onChange={(e) =>handleChange("excise_godown_wc_id", e.target.value)}
            options={excise}
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Floor Stock Store"
           value={formData?.floor_stock_wc_id || ""}
            onChange={(e) =>handleChange("floor_stock_wc_id", e.target.value)}
            options={floor}
          />
        </Col>
        {/* <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Rework Store"
           value={formData?.rework_wc_desc || ""}
            onChange={(e) => handleChange("rework_wc_desc", e.target.value)}
          />
        </Col> */}
      </Row>

      <Row className="">
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Service Cell"
           value={formData?.service_cell_wc_id || ""}
            onChange={(e) =>
              handleChange("service_cell_wc_id", e.target.value)
            }
            options={party}
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Party Work Center"
           value={formData?.party_wc_id || ""}
            onChange={(e) => handleChange("party_wc_id", e.target.value)}
            options={service}
          />
        </Col>
      </Row>
      
      <Row className="mt-1">
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Receiving Store"
           value={formData?.receiving_store_wc_id || ""}
            onChange={(e) =>
              handleChange("receiving_store_wc_id", e.target.value)
            }
            options={receive}
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Production Transfer to"
           value={formData?.prdn_transfer_to_wc_id || ""}
            onChange={(e) =>
              handleChange("prdn_transfer_to_wc_id", e.target.value)
            }
            options={production}
          />
        </Col>
      </Row>
      
      <Row className="">
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label=" Incoming Material Rejection Store"
           value={formData?.incoming_matrej_wc_id || ""}
            onChange={(e) =>
              handleChange("incoming_matrej_wc_id", e.target.value)
            }
            options={income}
          />
        </Col>
        <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Rework Store"
           value={formData?.rework_wc_id || ""}
            onChange={(e) => handleChange("rework_wc_id", e.target.value)}
            options={rework}
          />
        </Col>
      </Row>

      <Row>
      <Col sm={12} md={6} lg={6}>
          <Select
            type="text"
            label="Trading Store"
           value={formData?.trading_store || ""}
            onChange={(e) => handleChange("trading_store", e.target.value)}
            options={trading}
          />
        </Col>
      </Row>
      {/* Form Row end */}

      {/* checkbox Row Start */}
     
        <Row className="mt-2">
          <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
              text="WIP Stock Check on Gate Entry"
              onChange={(e) =>
                handleChange("chk_wip_stk_at_prodentry", e.target.checked ? "Y" : "N"   ) }
              checked={formData?.chk_wip_stk_at_prodentry === "Y"}
            />
          </Col>
          <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
             text="Separate Exchange Entry"
              onChange={(e) =>
                handleChange("excise_entry_separate", e.target.checked ? "Y" : "N")} 
              checked={formData?.excise_entry_separate === "Y"}
            />
          </Col>
          <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
             text="Gate Entry Tag Printing"
              onChange={(e) =>
                handleChange("mat_gate_print_flg", e.target.checked ? "Y" : "N")  }
                checked={formData?.mat_gate_print_flg === "Y"}
            />
          </Col>
        </Row>
  
        <Row className="">
          <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
              text="Auto Generate Item Code"
              onChange={(e) =>
                handleChange( "auto_gen_item_cd", e.target.checked ? "Y" : "N" ) }     
                  checked={formData?.auto_gen_item_cd === "Y"}
            />
          </Col>
          {/* <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
            text="check OSP Max Min Days Quantity"
              onChange={(e) =>
                handleChange(  "check_osp_max_min_days_qty", e.target.checked ? "Y" : "N"  ) }
                 checked={formData?.check_osp_max_min_days_qty === "Y"}
            />
          </Col> */}
          <Col md={12} lg={4} xl={4} className="button-group-wrapper ">
            <Checkbox
              text="Auto Generate Item Code Escorts"
              onChange={(e) =>
                handleChange("auto_gen_item_cd_escorts", e.target.checked ? "Y" : "N")}
                checked={formData?.auto_gen_item_cd_escorts === "Y"}
            />
          </Col>
        </Row>
    
      {/* checkbox Row End */}

      {/* <Row className="text-end mt-1">
        <Col lg={12} >
          <h6>
            (This Parameter is used in item master <br /> for enabling/disabling
            item code field <br />
            i.e. automatics/manual modifications)
          </h6>
        </Col>
      </Row> */}
       </Container>
      </Card>
   </>
  );
};

export default GenParaDivWiseDtl;
