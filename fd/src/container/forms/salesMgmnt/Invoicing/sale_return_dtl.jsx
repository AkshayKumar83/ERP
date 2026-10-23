import React from 'react'
import { headers, ItemHelpListHeader } from './sale_return_helper';
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import MuiTextField from '../../../../components/basic/muiTextField';
import { FcInfo } from 'react-icons/fc';

const SaleReturnDtl = ({ formData, detailData = [{}],
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,

}) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

   const handleDoubleClick = (field, rowIndex) => {
        if (['Insert','Update'].includes(formStatus)) {
          setHelpFor(field);
          setHelpListHeader(ItemHelpListHeader);
          handleHelpList(true, rowIndex);
        }
      };

  return (
    <>
      <div className=" ">
      
          <Row className="mb-2">
            <Col  xl={12}>
              <Form id="sale-item" className="">
                <div className="table-title">
                  <span>Item Details</span>
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
                <div
                  className="table-wrapper-v3"
                  // style={{ height: "180px", maxHeight: "180px" }}
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
                             {header.isHelpExist && (<FcInfo title="Info" />)}
                             {header.required && (
                               <span className='required-asterisk'>*</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detailData &&
                          detailData.map((data, rowIndex) => (
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
                                    canDelete={detailData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              {/* <td className="table_cell">
                                <TextField
                                  type="text"
                                  required
                                  name="s_no"
                                   value={data?.s_no || ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "s_no",  e.target.value,  rowIndex,  e  )  }
                                  disabled
                                
                                />
                              </td> */}
                              <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="it_code"
                                 value={data?.it_code || ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("it_code", e.target.value, rowIndex, e)}
                                   onDoubleClick={() => handleDoubleClick('Item', rowIndex)}
                               
                              />
                            </td>
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                
                                  name="it_name"
                                   value={data?.it_name || ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "it_name",  e.target.value,  rowIndex,  e  )  }
                                disabled
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="discount_val"
                                 value={data?.discount_val ?? ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("discount_val", e.target.value, rowIndex, e)}
                               disabled
                              />
                            </td>
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                 
                                  name="cgst_prc"
                                   value={data?.cgst_perc ?? ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "cgst_perc",  e.target.value,  rowIndex,  e  )  }
                                disabled
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                 
                                  name="sgst_perc"
                                   value={data?.sgst_perc ?? ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "sgst_perc",  e.target.value,  rowIndex,  e  )  }
                                disabled
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  type="number"
                               
                                  name="igst_perc"
                                   value={data?.igst_perc ?? ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "igst_perc",  e.target.value,  rowIndex,  e  )  }
                                disabled
                                />
                              </td>
                              {/* <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="type"
                                 value={data?.type || ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("type", e.target.value, rowIndex, e)}
                               
                              />
                            </td> */}
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                  required
                                  name="return_qty"
                                   value={data?.return_qty ?? ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "return_qty",  e.target.value,  rowIndex,  e  )  }
                                
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                required
                                name="rate"
                                 value={data?.rate ?? ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("rate", e.target.value, rowIndex, e)}
                               
                              />
                            </td>
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                 
                                  name="basic_val"
                                   value={data?.basic_val ?? ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange( "basic_val",  e.target.value,  rowIndex,  e  )  }
                                disabled
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
     
      </div>

      <Row className="mt-3">
  {/* <Col lg={1}>
    <MuiTextField
      type="number"
      label="Dsc. %"
      name="discount"
      value={formData?.discount}
      onChange={handleChange}
      disabled
    />
  </Col> */}

  <Col lg={2}>
    <MuiTextField
      type="number"
      label="Discount Amount"
      name="t_discount_val"
      value={formData?.t_discount_val}
     onChange={(e) => handleChange( 't_discount_val', e.target.value,null,e)}

       disabled
    />
  </Col>

  {/* Right side fields */}
 

         
        {/* </Row>
        <Row className='mt-3'> */}
            {/* <Col lg={1} >
                    <MuiTextField
                      type="number"
                      label="CGST %"
                      name="discount"
                      value={formData?.discount}
                      onChange={handleChange}
                      disabled
           
                    />
                  </Col> */}
            <Col lg={2} >
                    <MuiTextField
                      type="number"
                      label="CGST% Amt."
                      name="t_cgst_val"
                      value={formData?.t_cgst_val}
                    onChange={(e) => handleChange( 't_cgst_val', e.target.value, null, e)}

                       disabled
           
                    />
                  </Col>
  
            {/* <Col lg={1} >
                    <MuiTextField
                      type="number"
                      label="SGST %"
                      name="discount"
                      value={formData?.discount}
                      onChange={handleChange}
                      disabled
           
                    />
                  </Col> */}
            <Col lg={2} >
                    <MuiTextField
                      type="number"
                      label="SGST% Amt."
                      name="t_sgst_val"
                      value={formData?.t_sgst_val}
                       onChange={(e) => handleChange( 't_sgst_val', e.target.value, null, e)}

                       disabled
           
                    />
                  </Col>
    
           

         {/* <Col lg={1} >
                    <MuiTextField
                      type="number"
                      label="IGST %"
                      name="discount"
                      value={formData?.discount}
                      onChange={handleChange}
                      disabled
           
                    />
                  </Col> */}
            <Col lg={2} >
                    <MuiTextField
                      type="number"
                      label="IGST% Amt."
                      name="t_igst_val"
                      value={formData?.t_igst_val}
                       onChange={(e) => handleChange( 't_igst_val', e.target.value, null, e)}

                       disabled
           
                    />
                  </Col>
                   <Col lg={4} className="ms-auto d-flex gap-2">
    <Col lg={6}>
      <MuiTextField
        type="number"
        label="Total Amount"
        name="t_net_val"
        value={formData?.t_net_val}
        onChange={(e) => handleChange( 't_net_val', e.target.value, null, e)}

        disabled
      />
    </Col>

    <Col lg={6}>
      <MuiTextField
        type="number"
        label="Sub Total"
        name="t_basic_val"
        value={formData?.t_basic_val}
          onChange={(e) => handleChange( 't_basic_val', e.target.value, null, e)}
         disabled
      />
    </Col>
  </Col>
            {/* <Col lg={1} >
                    <MuiTextField
                      type="text"
                      label="Rounding"
                      name="discount"
                      value={detailData.discount}
                      onChange={handleChange}

           
                    />
                  </Col> */}
        </Row>
      
    </>
  );
};

export default SaleReturnDtl