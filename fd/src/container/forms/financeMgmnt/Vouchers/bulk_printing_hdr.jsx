import React, { useEffect, useState } from 'react'
import { Row,Col, Card, Form, Table } from 'reactstrap'
import MuiTextField from '../../../../components/basic/muiTextField';
import { HELP_LIST_CONFIG, RADIO_CONFIG, RANGE_LABEL_CONFIG, TABLE_CONFIG } from './bulk_printing_helper';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import Checkbox from '../../../../components/basic/checkbox';
import toast from 'react-hot-toast';
import MuiDateField from '../../../../components/basic/MuiDateField';

const BulkPrintingHdr = ({formHeader,setFormHeader, formData,
  setFormData, handleChange, formStatus,
  focusedRowIndex,setFocusedRowIndex,handleGo,showTable,
handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  totalRecordCount,
  handleBulkPrint
}) => {



const currentConfig = TABLE_CONFIG[formHeader?.selection] || {};
const currentHeaders = currentConfig.headers || [];
const currentFields = currentConfig.fields || [];

const selectedCount = formData.filter(
  (item) => item.print === "Y"
).length;

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };


   const handleDoubleClick = (field) => {

  const type = formHeader.selection;
  const subTypeName = RADIO_CONFIG[type]?.name;
  const subTypeValue = formHeader[subTypeName];

  //  ADD THIS CHECK
  if (!type) {
    toast.error("please select  Select Type first");
    return;
  }

  if (!subTypeValue) {
    toast.error(`please select ${subTypeName} first`);
    return;
  }

  const headers =
    HELP_LIST_CONFIG[type]?.[subTypeValue] || [];

  setHelpFor(field);
  setHelpListHeader(headers);
  handleHelpList(true);
};



  return (
   <>


<Card style={{ padding: "4px 8px", borderRadius: "10px" }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
    }}
  >
    {/* LEFT SIDE */}
    <div style={{ minWidth: "200px" }}>
      <h6 style={{ marginBottom: "6px" }}>Select Type</h6>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[
          { text: "Voucher", value: "V" },
          { text: "Invoice", value: "I" },
          { text: "Purchase Order", value: "P" },
        ].map((item, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              background:
                formHeader?.selection === item.value
                  ? "#eef2ff"
                  : "#fff",
            }}
          >
            <input
              type="radio"
              name="selection"
              value={item.value}
              checked={formHeader?.selection === item.value}
              onChange={(e) => {
                const value = e.target.value;

                setFormHeader((prev) => ({
                  ...prev,
                  selection: value,
                  Voucher: "",
                  Invoice: "",
                  PO: "",
                }));
                setFormData([{}]);
              }}
              style={{ accentColor: "#4f46e5" }}
            />
            {item.text}
          </label>
        ))}
      </div>
    </div>

    {/*  VERTICAL DIVIDER */}
    {formHeader?.selection && (
      <div
        style={{
          width: "1px",
          height: "60px",
          background: "#ccc",
        }}
      />
    )}

    {/* RIGHT SIDE */}
    {formHeader?.selection &&
      RADIO_CONFIG[formHeader.selection]?.options.length > 0 && (
        <div style={{ flex: 1 }}>
          <h6 style={{ marginBottom: "6px" }}>
            {RADIO_CONFIG[formHeader.selection].name}
          </h6>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {RADIO_CONFIG[formHeader.selection].options.map((item, i) => (
              <label
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  background:
                    formHeader?.[
                      RADIO_CONFIG[formHeader.selection].name
                    ] === item.value
                      ? "#eef2ff"
                      : "#fafafa",
                }}
              >
                <input
                  type="radio"
                  name={RADIO_CONFIG[formHeader.selection].name}
                  value={item.value}
                  checked={
                    formHeader?.[
                      RADIO_CONFIG[formHeader.selection].name
                    ] === item.value
                  }
                  onChange={(e) => {
                    const name =
                      RADIO_CONFIG[formHeader.selection].name;
                    const value = e.target.value;

                    setFormHeader((prev) => ({
                      ...prev,
                      [name]: value,
                    }));
                  }}
                  style={{ accentColor: "#4f46e5" }}
                />
                {item.text}
              </label>
            ))}
          </div>
        </div>
      )}
  </div>
</Card>




  <Row className="mt-4 d-flex justify-content-center">
        {formHeader?.selection === "V" &&
 formHeader?.Voucher === "PE" && (

  <Col lg={3}>
    <Card
      body
      style={{
        padding: "3px 5px",
        background: "#f8f9fa",
        border: "1px solid #d9d9d9",
      }}
    >
      <div className="d-flex align-items-center gap-4">

        <label
          className="d-flex align-items-center gap-2 mb-0"
          style={{
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="search_by"
            value="V"
            checked={formHeader?.search_by === "V"}
            onChange={(e) =>
              handleChange(
                "search_by",
                e.target.value,
                null,
                e,
                "header"
              )
            }
          />
          Voucher Range
        </label>

        <label
          className="d-flex align-items-center gap-2 mb-0"
          style={{
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="search_by"
            value="D"
            checked={formHeader?.search_by === "D"}
            onChange={(e) =>
              handleChange(
                "search_by",
                e.target.value,
                null,
                e,
                "header"
              )
            }
          />
          Date Range
        </label>

      </div>
    </Card>
  </Col>

)}
    {!(
  formHeader?.selection === "V" &&
  formHeader?.Voucher === "PE" &&
  formHeader?.search_by === "D"
) && (
<>
                  <Col lg={2}>
                    <MuiTextField
                      type="text"
                      label={`${RANGE_LABEL_CONFIG[formHeader?.selection] || ""} From`}
                      name="from"
                      value={formHeader?.from}
                     onChange={(e) =>handleChange("from", e.target.value, null, e, "header")}
                      onDoubleClick={() => handleDoubleClick("From")}      
                      required
                      // showHelpIcon
                    />
                  </Col>

                  <Col lg={2}>
                    <MuiTextField
                      type="text"
                     label={`${RANGE_LABEL_CONFIG[formHeader?.selection] || ""} To`}
                      name="to"
                      value={formHeader.to}
                     onChange={(e) => handleChange("to", e.target.value, null, e, "header")}
                      required
                   onDoubleClick={() => handleDoubleClick("To")}
                      // showHelpIcon
                    />
                  </Col>

                    </>
)}
     {formHeader?.selection === "V" &&
      formHeader?.Voucher === "PE" &&
      formHeader?.search_by === "D" && (
          <>
            <Col lg={2}>
              <MuiDateField
                label="From Date"
                name="from_date"
                value={formHeader?.from_date || ""}
                onChange={(e) => handleChange( "from_date", e.target.value, null, e, "header" ) }
                required
              />
            </Col>

            <Col lg={2}>
              <MuiDateField
                label="To Date"
                name="to_date"
                value={formHeader?.to_date || ""}
                onChange={(e) => handleChange( "to_date", e.target.value, null, e, "header" ) }
                required
              />
            </Col>
          </>
        )}
                   <Col xl={2} className=''>
                    <ButtonUi
                    color= "primary"
                    className="add-action"
                    onClick={() => { handleGo()}}
                  >
                    GO
                  </ButtonUi>
  </Col>
                   <Col xl={2} className='d-flex justify-content-end align-items-end ms-auto'>
                  <ButtonUi
                    color= "primary"
                    className="add-action"
                    onClick={() => {handleBulkPrint()}}
                    disabled={!showTable || formData.length === 0}
                  >
                    Bulk Print
                  </ButtonUi>
  </Col>
  </Row>

{showTable && (
  <>
  
   
    <div className="mt-4 d-flex justify-content-center align-items-center">
        <Card className="w-75 p-2">
            {/* <div style={{fontWeight: "600" }}>
             Total Records: {totalRecordCount} | Selected For Printing: {selectedCount}
            </div> */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "600",
                // background: "#f5f5f5",
              }}
            >
          <div>
                Total Records: {totalRecordCount}
              </div>

              <div style={{ color: "#2e7d32" }}>
                Selected For Printing: {selectedCount}
              </div>
            </div>
               <Row className="">
                 <Col  xl={12}>
                   <Form id="rate-master" className="">
                     {/* <div className="table-title">
                       <span>Bulk Printing</span>
                       {(formStatus === "Insert" || formStatus === "Update") && (
                         <ButtonUi
                           color="primary"
                           className="add-action"
                           onClick={triggerAddRow}
                         >
                           Add Row
                         </ButtonUi>
                       )}
                     </div> */}
                     <div
                       className="table-wrapper-v3"
                        // style={{ height: "280px", maxHeight: "280px" }}
                     >
                       <SimpleBar forceVisible="y" autoHide={false}>
                          <div className="table-sticky-wrapper">
                         <Table hover>
                           <thead>
                             <tr>
                               {(formStatus === "Insert" ||
                                 formStatus === "Update") && (
                                 <th
                                   style={{ width: "80px" }}
                                   className="sticky-column left"
                                 >
                                   Actions
                                 </th>
                               )}
                             {currentHeaders.map((header, index) => (
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
                                   {/* {header.required && (
                                    <span className='required-asterisk'>*</span>)}
                                   {header.isHelpExist && <FcInfo title="Info" />} */}
                           
                                 </th>
                               ))}
                             </tr>
                           </thead>
                           <tbody>
                           {Array.isArray(formData) &&
                            formData.map((data, rowIndex) => (
                                 <tr
                                   key={rowIndex}
                                   onFocus={() =>
                                     makeFocusOnTableRow(rowIndex, data.id)
                                   }
                                   style={{
                                     border: `${
                                       rowIndex === focusedRowIndex
                                         ? "2px solid black"
                                         : "none"
                                     }`,
                                   }}
                                   tabIndex={0}
                                 >
                                   {(formStatus === "Insert" ||
                                     formStatus === "Update") && (
                                     <td className="sticky-column left">
                                       <RowAction
                                         formStatus={formStatus}
                                         canDelete={formData.length > 1}
                                         onDelete={() => handleDelete(rowIndex)}
                                         // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                       />
                                     </td>
                                   )}

                                {currentFields.map((field, colIndex) => (
                                  <td key={colIndex} className="table_cell">
                                    <TextField
                                      type={field.type}
                                      name={field.name}
                                      value={data?.[field.name] ?? ""}
                                      onChange={(e) =>
                                        handleChange(field.name, e.target.value, rowIndex, e)
                                      }
                                      // disabled
                                    />
                                  </td>
                                ))}
                                  
                                   <td className="table_cell">
                                     <Checkbox
                                       onChange={(e) => handleChange( "print", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                       checked={data?.print === "Y"}
                                     />
                                   </td>
                                  
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
            
           
          </Card>
    </div>
     </>
  )}
   
   </>
  )
}

export default BulkPrintingHdr

