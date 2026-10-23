


import React from 'react'
import { Row ,Col,Form,Table,} from 'reactstrap'
import { purchaseBillLevelHeader } from './purchase_order_helper';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';

const PurchaseOrderBillLevelChrg = ({billFormData, handleChargeChange,formStatus,chargesMaster = []}) => {

// console.log("chargesMaster:", chargesMaster);

const totalSubsidy = Object.entries(billFormData || {})
  .filter(([key]) => {
    const k = key.toUpperCase();
    return !["IGST", "CGST", "SGST"].includes(k);
  })
  .reduce((sum, [, row]) => sum + Number(row?.subsidy_amt || 0), 0);

//   const totalComputed = Object.values(billFormData || {}).reduce((sum, row) => {
//   return sum + Number(row?.computed_amt || 0);
// }, 0);

const totalComputed = Object.values(billFormData || {}).reduce(
  (sum, row) => sum + Number(row?.computed_amt || 0),
  0
);

  return (
   <>
      <div className=" ">
        
             <Row className="d-flex justify-content-center">
               <Col  xl={10}>
                 <Form id="rate-master" className="">
                  
                   <div
                     className="table-wrapper-v3"
                     // style={{ height: "180px", maxHeight: "180px" }}
                   >
                     <SimpleBar forceVisible="y" autoHide={false}>
                        <div className="table-sticky-wrapper height-auto">
                       <Table hover>
                       <thead>
  <tr>
    {/* {(formStatus === "Insert" || formStatus === "Update") && (
      <th
        style={{ width: "80px" }}
        className="sticky-column left"
      >
        Actions
      </th>
    )} */}

    {/*  Header render */}
    {purchaseBillLevelHeader.map((header, index) => (
      <th
        key={index}
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
  {chargesMaster?.map((row, rowIndex) => (
    <tr key={rowIndex}>
      
      {/*  DB se label */}
      <td className="table_cell">
        {row.chg_component}
      </td>

      {purchaseBillLevelHeader.slice(1).map((col, colIndex) => {
        // const value = billFormData[row.chg_component]?.[col.key];

        const normalizedKey = row.chg_component?.trim().toUpperCase();
        const value = billFormData[normalizedKey]?.[col.key];

        if (col.key === "sub_aplicable") {
          return (
            <td key={colIndex}>
              <Checkbox
                checked={value === "Y"}
                onChange={(e) => {
                  const updated = e.target.checked ? "Y" : "N";

                  handleChargeChange(
                    row.chg_component,
                    col.key,
                    updated
                  );
                }}
              />
            </td>
          );
        }

        return (
          <td key={colIndex}>
          <TextField
              type={col.type || "text"}
              value={value ?? ""}
              maxLength={col.type !== "number" ? col.maxLength : undefined}
              onChange={(e) => {
                let val = e.target.value;

                // number field length control
                if (col.type === "number" && col.maxLength) {
                  if (val.length > col.maxLength) return;
                }

                // handleChargeChange(
                //   row.chg_component,
                //   col.key,
                //   val
                // );
                handleChargeChange(
                row.chg_component?.trim().toUpperCase(),
                col.key,
                val
              );
              }}
            />
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

                       </Table>
                       </div>
                     </SimpleBar>
                   </div>
                 </Form>
               </Col>
             </Row>
          
         </div>
   {/* <Row className="d-flex justify-content-end me-5 mt-2">
   <Col xl={2} className='me-5'>
  <TextField
  label="Total Computed Amount"
  type="number"
  name="total_computed_amt"
  value={totalComputed || ""}
  disabled 
/>
    </Col>
   <Col xl={2} className='me-5'>
  <TextField
  label="Total Subsidy Amount"
  type="number"
  name="total_amount"
  value={totalSubsidy || ""}
  disabled 
/>
    </Col>
   
   </Row>
   <Row className='me-5'>
     <Col className='me-5'>
   <span span className="d-flex justify-content-end me-5" style={{fontStyle:"italic", fontSize:"12px",color:"red"}}>
    Exclude GST
   </span>
    </Col>
   </Row> */}

   <Row className="mt-2 px-3 align-items-end">

  {/* Empty space (Charges + % + Amount) */}
  <Col xl={6}></Col>

  {/* Computed Amount column ke niche */}
  <Col xl={2}>
    <TextField
      label="Total Computed Amount"
      type="number"
     value={Number(totalComputed).toFixed(2)}
      disabled
    />
  </Col>

    <Col xl={1}></Col>

  {/* Subsidy Amount column ke niche */}
  <Col xl={2} className='ms-3'>
    <TextField
      label="Total Subsidy Amount"
      type="number"
      // value={totalSubsidy || ""}
     value={Number(totalSubsidy).toFixed(2)}
      
      disabled
    />
  </Col>

</Row>

<Row>
  <Col xl={10} className="text-end me-4">
    <span style={{ fontStyle: "italic", fontSize: "12px", color: "red" }}>
      Exclude GST
    </span>
  </Col>
</Row>
   </>
  )
}

export default PurchaseOrderBillLevelChrg