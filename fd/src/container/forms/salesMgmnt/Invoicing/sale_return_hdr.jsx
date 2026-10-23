import React, { useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import MuiDateField from '../../../../components/basic/MuiDateField'
import MuiTextField from '../../../../components/basic/muiTextField'
import MuiTextArea from '../../../../components/basic/muiTextArea'
import { CCodeHelpList, dbHelpListHeader, invoiceHelpListHeader, saleHelpListHeader } from './sale_return_helper'
import RadioGroup from '../../../../components/basic/radioGroup'

const SaleReturnHdr = ({formData, formStatus, handleChange,  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFormData
}) => {
 
    const handleDoubleClick = (field, header) => {
     if(["Insert",'Update','Search'].includes(formStatus)) {
      setHelpFor(field); 
      setHelpListHeader(header); 
      handleHelpList(true);
    }
  };
 


useEffect(() => {
  if (formStatus === "Insert") {
    const today = new Date();

    // 👉 format: YYYY-MM-DD (input type="date" ke liye perfect)
    const formattedDate = today.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      return_dt: formattedDate,
    }));
  }
}, [formStatus]);
 
  return (
   <>
      <Row className=''>
     <Col lg={2} className=''>
                    <MuiTextField
                      type="text"
                      label="Customer"
                      name="c_code"
                      value={formData?.c_code}
                     onChange={(e) =>handleChange("c_code", e.target.value, null, e)}
                       onDoubleClick={() => handleDoubleClick("cCode", CCodeHelpList)}
                       required
                       showHelpIcon
                       disabled={formStatus === 'Update'}
                    />
                  </Col>
     <Col lg={3} className=''>
                    <MuiTextField
                      type="text"
                      label="Name"
                      name="c_name"
                      value={formData?.c_name}
                     onChange={(e) =>handleChange("c_name", e.target.value, null, e)}
                   
                    disabled
                    />
                  </Col>
                  
                   <Col lg={2} className=''>
                    <MuiTextField
                      type="text"
                      label="Invoice No."
                      name="inv_no"
                      value={formData?.inv_no}
                       onChange={(e) =>handleChange("inv_no", e.target.value, null, e)}
                      onDoubleClick={() => handleDoubleClick("Invoice", invoiceHelpListHeader)}
                       required
                      showHelpIcon
                       disabled={formStatus === 'Update'}
                    />
                  </Col>
                
     <Col lg={2} className=''>
                    <MuiTextField
                      type="text"
                      label="Return No."
                      name="return_no"
                      value={formData?.return_no}
                      onChange={(e) =>handleChange("return_no", e.target.value, null, e)}
                      disabled
                   
                    />
                  </Col>
        <Col xl={2}>
     <MuiDateField
        label="Date"
        name="return_dt"
        value={formData?.return_dt}
        onChange={(e) =>handleChange("return_dt", e.target.value, null, e)}

        required 
        />
    </Col>

     <Col xl={1}>
                      {formData?.auth_flag === "Y" ? (
                        <p
                          className=" px-3 py-1"
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
                 
   </Row>
   <Row className='mt-3'>
  
                    {/* <Col xl={2} className='' >
                              
                                  <MuiSelectField
                                    label="Sale Type"
                                    name="it_sub_c"
                                    value={formData?.it_sub_c}
                                                        onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                                    // options={itemSubCat}
                                    // disabled={isAllType}
                                  />
                                </Col> */}
   
    
                   {/* <Col xl={2} className='' >
                              
                                  <MuiSelectField
                                    label="Reverse Charge"
                                    name="it_sub_c"
                                    value={formData?.it_sub_c}
                                                        onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                                    // options={itemSubCat}
                                    // disabled={isAllType}
                                  />
                                </Col> */}
     <Col lg={1} className=''>
                    <MuiTextField
                      type="text"
                      label="Cr Acc. "
                      name="sale_ac_head"
                      value={formData?.sale_ac_head}
                     onChange={(e) =>handleChange("sale_ac_head", e.target.value, null, e)}
                      onDoubleClick={() => handleDoubleClick("Sale", saleHelpListHeader)}
                      showHelpIcon
                     
                  
                    />
                  </Col>
     <Col lg={3} className=''>
                    <MuiTextField
                      type="text"
                      label=" Description"
                      name="sale_ac_desc"
                      value={formData?.sale_ac_desc}
                      onChange={(e) =>handleChange("sale_ac_desc", e.target.value, null, e)}
                      disabled
                  
                    />
                  </Col>
     <Col lg={1} className=''>
                    <MuiTextField
                      type="text"
                      label="Db Acc."
                      name="debit_acc_code"
                      value={formData?.debit_acc_code}
                       onChange={(e) =>handleChange("debit_acc_code", e.target.value, null, e)}
                      onDoubleClick={() => handleDoubleClick("DB", dbHelpListHeader)}
                      showHelpIcon
                   
                    />
                  </Col>
          <Col lg={3} className=''>
                    <MuiTextField
                      type="text"
                      label="Description"
                      name="debit_acc_desc"
                      value={formData?.debit_acc_desc}
                      onChange={(e) =>handleChange("debit_acc_desc", e.target.value, null, e)}

                      disabled
                   
                    />
                  </Col>
                   <Col xl={3} className="m-auto">
                              <RadioGroup
                                className="button-group-wrapper box-border justify-content-between"
                                name="flag"
                                options={[
                                  { text: "Inter State", value: "I" },
                                  { text: "Intra State", value: "R" },
                                ]}
                                onChange={(e) => handleChange( 'flag', e.target.value,null,e)}
                                checked={formData?.flag || "I"}
                              />
                            </Col>
                  
   </Row>



   <Row className='mt-3'>
             <Col xl={12}>
         <MuiTextArea
        label="Address"
        name='addrerss'
        maxLength={2000}
        value={formData?.address}
        onChange={(e) => handleChange("header","address", e.target.value ,0,e)}
        rows={1}
        fullWidth
        disabled
      />
        </Col>
   </Row>

 {/* <Row className='mt-2'>

    
     <Col lg={2} className='mt-2'>
                    <MuiTextField
                      type="text"
                      label="Sale Tax"
                      name="wc_no"
                      value={formData?.wc_no}
                                          onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                    //   onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                    //   required
                    //   showHelpIcon
                    />
                  </Col>
    
                   
     <Col lg={2} className='mt-2'>
                    <MuiTextField
                      type="text"
                      label="Agent Name"
                      name="wc_no"
                      value={formData?.wc_no}
                                          onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                    //   onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                    //   required
                    //   showHelpIcon
                    />
                  </Col>
     <Col lg={2} className='mt-2'>
                    <MuiTextField
                      type="text"
                      label="Txn Type"
                      name="wc_no"
                      value={formData?.wc_no}
                                          onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                    //   onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                    //   required
                    //   showHelpIcon
                    />
                  </Col>
    
                   
     <Col lg={2} className='mt-2'>
                    <MuiTextField
                      type="text"
                      label="Territory"
                      name="wc_no"
                      value={formData?.wc_no}
                                          onChange={(e) =>handleChange("c_code", e.target.value, null, e)}

                    //   onDoubleClick={() => handleDoubleClick("store", WcNoHelpListHeader)}
                    //   required
                    //   showHelpIcon
                    />
                  </Col>
    
                  
   </Row> */}




   
   </>
  )
}

export default SaleReturnHdr