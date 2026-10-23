import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Production = ({ formData, formStatus, handleChange,  excise1 = [], floor1 = [], scrapYard = [],  serviceCell = []  }) => {  

  const getOptions = (fieldName) => {
    switch(fieldName) {
      case "floor_stock":
        return floor1;

        case  "excise_godown":
          return excise1; 

          case "service_cell":
            return serviceCell; 

            case "scrap_yard":
              return scrapYard;

              default: 
              return [];
    }
  };
  
  return (
    <React.Fragment> 

      <Form id = "general-parameter-production-form"> 
      <Row>
        <Col xl={6} style={{ margin: 'auto' }}>
          <div className="text-wrapper box-border p-2 m-auto" >
            <span className="text-label">Work Center</span>
            {[
              { label: "Floor Stock", name: "floor_stock" },
              { label: "Excise Godown", name: "excise_godown" },
              { label: "Service Cell", name: "service_cell" },
              { label: "Scrap_yard", name: "scrap_yard" },
            ].map((field) => (
              <div key={field.name}>
                <div>
                  {/* <label>{field.label}</label> */}
                  <Select
                    name={field.name}
                    label={field.label}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value, "MOPRPARM")}
                    options={getOptions(field.name)} // Dynamically set options based on field name
                  //className={styles.input}
                  />
                </div>
              </div>
            ))}
          </div>
        </Col>

        <Col className='ms-1'>
          <div className='text-wrapper' style={{ width: '240px' }}  >
            <span className="text-label"> Freez MPS</span>
            <RadioGroup 
            //style
              className="button-group-wrapper box-border  m-auto mt-1 py-2 justify-content-evenly"
              options={[
                { text: "Yes", value: "Y" },
                { text: "No", value: "N" },
              ]}
              onChange={(e) => handleChange("freeze_mps", e.target.value, "MOPRPARM")}
              checked={formData?.freeze_mps}
            />
          </div>

          <Col className="button-group-wrapper m-auto mt-4 ">
            <Checkbox
              onChange={(e) => handleChange("consider_store_stk", e.target.checked ? "Y" : "N", "MOPRPARM")}
              text="Consider Finished goods stock in MPS"
              checked={formData?.consider_store_stk === "Y"}
            />
          </Col>
        </Col>


      </Row>

      <Row>

      </Row>
      <Row>
        <Col xl={6}>
          <div className='text-wrapper'  >
            <span className="text-label">  Production Transfer of</span>
            <RadioGroup 
            //style
              className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
              options={[
                { text: "Product", value: "P" },
                { text: "Spare Part", value: "S" },
                { text: "Both", value: "B" },
              ]}
              onChange={(e) => handleChange("prdn_transfer_prod_spare_both", e.target.value, "MOPRPARM")}
              checked={formData?.prdn_transfer_prod_spare_both}
            />
          </div>
        </Col>

        <Col xl={6} className='' style={{ marginTop: '0.23rem' }}>
          {[
            { label: "Opening Stock for MPS/MRP", name: "physical_books" },

          ].map((field) => (
            <div key={field.name}>
              <div>
                {/* <label>{field.label}</label> */}
                <Select
                  name={field.name}
                  label={field.label}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value, "MOPRPARM")}
                  options={[ 
                    { label: "", value: "" },
                    { label: "Physical Stock", value: "P" },
                    { label: "Book Stock", value: "B" },
                    
                ]}
                />
              </div>
            </div>
          ))}
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <div className='text-wrapper' >
            <span className="text-label">Consumption Based on</span>
            <RadioGroup 
            //style
              className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
              options={[
                { text: "Final Work Center Wise", value: "F" },
                { text: "Individual Work Center Wise", value: "I" },

              ]}
              onChange={(e) => handleChange("consumption_based", e.target.value, "MOPRPARM")}
              checked={formData?.consumption_based}
            />
          </div>
        </Col>

        <Col xl={6}>
          <div className='text-wrapper' >
            <span className="text-label"> Pick Production (BackFlushingFrom)</span>
            <RadioGroup
            // style
              className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
              options={[
                { text: "Directly From Production", value: "D" },
                { text: "Inprocess Quality", value: "I" },

              ]}
              onChange={(e) => handleChange("production_backflushing", e.target.value, "MOPRPARM")}
              checked={formData?.production_backflushing}
            />
          </div>
        </Col>
      </Row> 
      </Form>

    </React.Fragment>
  )
}

export default Production
