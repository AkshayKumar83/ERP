import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Row, Col ,Table ,Form, Container} from 'reactstrap'
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import { headers,validateCrDays,validateEffCode,validatePayTermDetail,validatePerPamnt,validateTermDesc } from './payment_term_sale_helper'
import Select from '../../../../components/basic/select'
import toast from "react-hot-toast";


const PaymentTermSaleDetail = ({
  paymentTermDetailData = [{}],
  handleChange = () => {},
  handleAddRow = () => {},
  handleUpdateRow = () => {},
  handleDeleteRow = () => {},
  formStatus,
  effectiveCode = [],
  formData = {},
  setTotalPercentage = () => {},
  focusedRowIndex,
  setFocusedRowIndex

}) => {

    //  const [focusedRowIndex, setFocusedRowIndex] = useState(0)
     const inputRefs = useRef({});
       
     const calcTotalPerc = useCallback(() => {
        const total = paymentTermDetailData.reduce((sum, row) => sum + (parseFloat(row.per_pamnt) || 0), 0);
        return total.toFixed(2);
      }, [paymentTermDetailData]);

       useEffect(() => {
    const newTotal = calcTotalPerc();
    setTotalPercentage(newTotal);

    if (parseFloat(newTotal) > 100) {
      toast.error("Total Percentage exceeds 100%");
    }
  }, [paymentTermDetailData, calcTotalPerc, setTotalPercentage]);

    const handleValidateField = (cb, e, data, index, otherData = {}) => {
    if (!formStatus || formStatus === "Query") {
      return;
    }

  const isValidPaytermHead = validateForm("payment-term-head-form", "Payment Term Head Form");
    if (!isValidPaytermHead) {
      toast.error(`Fill First Required Field in Payment Term`);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
      if (e.key === "Enter" || e.key === "Tab") {

      let isValid;
      if (otherData) {
        isValid = cb(e, data, index, otherData);
      } else {
        isValid = cb(e, data, index);
      }

      if (!isValid) {
        e.preventDefault();
        e.stopPropagation();
       
        setTimeout(() => {
          inputRefs.current[e.target.id]?.focus();

        }, 0);
        return false;
      }

    }
      };
  
   const triggerDelete = (data, index) => {
    handleDeleteRow(data);
    setFocusedRowIndex(paymentTermDetailData.length - 2);
  };

  // const triggerAddRow = useCallback(() => {
  //   const validationResult = validatePayTermDetail(paymentTermDetailData);
  //   if (!validationResult.isValid) {
  //     toast.error(validationResult.error);
  //     return;
  //   }
  //   handleAddRow();
  // }, [paymentTermDetailData, handleAddRow]);

  
  const triggerAddRow = useCallback(() => { 
    const validationResult = validatePayTermDetail(paymentTermDetailData);
    if (!validationResult.isValid) {
      toast.error(validationResult.error);
      return;
    }
  
    const newIndex = paymentTermDetailData.length; // nayi row ka index
    handleAddRow();
  
    // Add hone ke baad focusedRowIndex set karna
    setTimeout(() => {
      setFocusedRowIndex(newIndex);
    }, 0);
  
  }, [paymentTermDetailData, handleAddRow, setFocusedRowIndex]);

  const triggerUpdate = (data, index) => {
    const validationResult = validatePayTermDetail(data, true);
    if (!validationResult.isValid) {
      toast.error(validationResult.error);
      return;
    }
    handleUpdateRow(data);
  };

  const handleFieldFocus = useCallback((index) => {
    setFocusedRowIndex(index);
  }, []);
  
return (
    <Container>
      <Col>
          <Form id='pay-term-detail-form'>
          <div className="table-title">
            <span>Payment Term</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
                Add Row
              </ButtonUi>
            )}
          </div>
          <div className="table-wrapper-v3">
            <SimpleBar forceVisible="y" autoHide={false}>
              <div className="table-sticky-wrapper">
                <Table hover={false}>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th style={{ width: "80px" }} className="">
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
                          {header.required && ( <span className='required-asterisk'>*</span>)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentTermDetailData.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        style={{
                          border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                        }}
                      >
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <td className="">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={paymentTermDetailData.length > 1}
                              onDelete={() => triggerDelete(data, rowIndex)}
                              // onUpdate={() => triggerUpdate(data, rowIndex)}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            type="number"
                            name="per_pamnt"
                            id={`per_pamnt_${rowIndex}`}
                            value={data?.per_pamnt || ""}
                            onChange={(e) => handleChange("per_pamnt", e.target.value, rowIndex, e)}
                            onBlur={(e) => validatePerPamnt(e, paymentTermDetailData, rowIndex,formStatus)}
                             onFocus={() => handleFieldFocus(rowIndex)}
                            //  onKeyDown={(e) => handleValidateField(validatePerPamnt, e, paymentTermDetailData, rowIndex)}            
                            // inputRef={(el) => (inputRefs.current[`per_pamnt_${rowIndex}`] = el)}
                            required
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            id={`term_desc_${rowIndex}`}
                            name="term_desc"
                            value={data?.term_desc || ""}
                            onChange={(e) => handleChange("term_desc", e.target.value, rowIndex, e)}
                            onBlur={(e) => validateTermDesc(e,formStatus)}
                             onFocus={() => handleFieldFocus(rowIndex)}
                            // onKeyDown={(e) => handleValidateField(validateTermDesc, e, data, rowIndex, formData)}
                            // inputRef={(el) => (inputRefs.current[`term_desc_${rowIndex}`] = el)}
                              required
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            id={`po_cr_days_${rowIndex}`}
                            name="po_cr_days"
                            value={data?.po_cr_days ?? ""}
                            onChange={(e) => handleChange("po_cr_days", e.target.value, rowIndex, e)}
                            onBlur={(e) => validateCrDays(e, formStatus)}
                             onFocus={() => handleFieldFocus(rowIndex)}
                            // onKeyDown={(e) => handleValidateField(validateCrDays, e, paymentTermDetailData, rowIndex)}
                            // inputRef={(el) => (inputRefs.current[`po_cr_days_${rowIndex}`] = el)}
                             required
                          />
                        </td>
                        <td className="table_cell">
                          <Select
                            id={`eff_code_${rowIndex}`}
                            name="eff_code"
                            placeholder=" "
                            value={data?.eff_code || ""}
                            onChange={(e) => handleChange("eff_code", e.target.value, rowIndex, e)}
                            options={effectiveCode}
                            onBlur={(e) => validateEffCode(e, formStatus)}
                             onFocus={() => handleFieldFocus(rowIndex)}
                            // onKeyDown={(e) => handleValidateField(validateEffCode, e, paymentTermDetailData, rowIndex)}
                            required
                            // inputRef={(el) => (inputRefs.current[`eff_code_${rowIndex}`] = el)}
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
        <Col sm={3} md={2} lg={1} className="mt-1">
          <TextField
            type="number"
            name="total_perc"
            value={calcTotalPerc()}
            onChange={() => {}}
            disabled
            required
          />
        </Col>
      </Col>
    </Container>
  );
}

export default PaymentTermSaleDetail;