import React, { useCallback, useMemo, useState } from "react";
import { Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import {
  bankVoucherDetailsHeaders,
  genBillNo,
  generateTDSEntriesBnk,
  handleBnkDbCrChange,
  isTDSApplicable,
  validateAccNo,
  validateCostCenter,
  validateCostCentr,
} from "./bank_voucher_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import HelpListV2 from "../../../../components/HelpList/v2";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const BankVoucherDetails = ({
  triggerAddRow,
  apiData,
  apiAccData,
  masterData,
  formData = [{}],
  formStatus,
  handleChange = () => {},
  triggerNarrationAddRow,
  triggerSameNarration,
  triggerRowDelete,
  // handleCancelVch = () => {},
  dataset,
  setNarrationData,
  focusedRowIndex,
  setFocusedRowIndex,
  setUpdateNarrationData
}) => {
  const [isMrirModelOpen, setIsMrirModelOpen] = useState(false);
  const toggleMrirModal = () => setIsMrirModelOpen(!isMrirModelOpen);
  const [recordIndex, setRecordIndex] = useState(0);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const [helpListConfig, setHelpListConfig] = useState({
    open: false,
    title: "",
    headers: [], // label, key
    list: [],
    searchKeys: [],
  });

  const purposeOption = useMemo(() => {
    if (dataset?.purpose && Array.isArray(dataset?.purpose)) {
      return [
        { value: "", label: "Select" },
        ...(dataset?.purpose?.map((item) => ({
          value: item.code,
          label: item.description,
        })) || []),
      ];
    }
    return [];
  }, [dataset]);

  const narrationDetailData = useMemo(() => {
    if (formData?.[recordIndex]) {
      return formData?.[recordIndex];
    }
    return {};
  }, [recordIndex, formData]);

  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

 

  // const handleAmountChange = useCallback(
  //   debounce((e, key, value, rowIndex) => {
  //     if(!['Insert', 'Update'].includes(formStatus)){
  //       return
  //     }
  //     if(!value){
  //       toast.error('Amount cannot be null')
  //        handleChange("db_cr", `${ masterData?.pay_rec == "0" ? "D" : "C"}#${value}`, rowIndex)
  //       e.target.focus()
  //       return
  //     }

  //     let parityValue = parseFloat(value);
  //     let currType = formData?.[rowIndex]?.db_cr ? formData?.[rowIndex]?.db_cr : null;
  //     if (parityValue < 0) {
  //       let currValue = currType ? (currType == "D" ? "Debit" : "Credit") : null;
  //       let defaultCDValue = masterData?.type_user === "0" ? "Credit" : "Debit";
  //       let reverseCDValue = currType ? (currType == "D" ? "Credit" : "Debit") : (masterData?.type_user == "0" ? "Debit" : "Credit");

  //       setConfirmationConfig({
  //         title: "Amount Field",
  //         description: `Default amount type is ${currValue || defaultCDValue}, Do you wish to continue with ${reverseCDValue}?`,
  //         uniqKey: "amount_field",
  //         value: parityValue,
  //         rowIndex: rowIndex
  //       });
  //       setConfirmationModal(true);
  //     }
  //     else {
  //       handleChange("db_cr", `${currType || masterData?.pay_rec == "0" ? "D" : "C"}#${value}`, rowIndex)
  //     }
  //     if(value == 0){
  //       toast.error('Amount cannot zero')
  //       e.target.focus()
  //       return
  //     }
  //     handleChange('amount', Math.abs(value), rowIndex)
  //   }, 500), // 500ms debounce delay
  //   [masterData]
  // );

  const handleNarrationTextChange = useCallback(
    debounce((value, rowIndex) => {
      if (rowIndex === 0 && !hasAlerted) {
        setConfirmationConfig({
          title: "Narration Field",
          description:"Narration field changed for the first time in the first row!",
          uniqKey: "narration_text",
        });
        setConfirmationModal(true);
        setHasAlerted(true);
      }
    }, 500),
    [hasAlerted]
  );

  const handleHelpList = useCallback(
    (key, rowIndex) => {
      // if(!['Insert', 'Update'].includes(formStatus)){
      //   return
      // }
      if (key === "acc_no") {
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Select Account Number",
          headers: [
            { key: "acc_desc", label: "Account Description" },
            { key: "acc_no", label: "Account No" },
            { key: "bill_no", label: "Bill No" },
            { key: "bill_dt", label: "Bill Date" },
            { key: "amount", label: "Amount" },
          ],
          list: apiData?.accountList || [],
          searchKeys: ["acc_desc", "acc_no"],
        });
      }if (key === "bill_no") {
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Select Outstanding Bills",
          headers: [
            { key: "acc_desc", label: "Account Description" },
            { key: "acc_no", label: "Account No" },
            { key: "bill_no", label: "Bill No" },
            { key: "bill_dt", label: "Bill Date" },
            { key: "amount", label: "Amount" },
          ],
          list: apiAccData?.[formData?.[rowIndex]?.acc_no]?.billData || [],
          searchKeys: ["acc_desc"],
        });
      }else if(key == 'prof_no'){
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Select Proforma Invoice No.",
          headers: [
            { key: "prof_no", label: "Invoice No." },
            { key: "prof_dt", label: "Invoice Date" },
            { key: "amount", label: "Amount" },
          ],
          list: apiAccData?.[formData?.[rowIndex]?.acc_no]?.profNoData || [],
          searchKeys: ["prof_no"],
        });
      }else if (key === "pur_desc") {
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Help of Purpose",
          headers: [
            { key: "code", label: "Code" },
            { key: "description", label: "Description" }
          ],
          list: apiData?.purpData || [],
          searchKeys: ["description"],
        });
      } else if (key === "emp_cd") {
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Help of Employee",
          headers: [
            { key: "emp_cd", label: "Employee Code" },
            { key: "emp_name", label: "Employee Name" },
            { key: "prefix", label: "Cost Centre" },
          ],
          list: apiAccData?.[formData?.[rowIndex]?.acc_no]?.empData || [],
          searchKeys: ["emp_name"],
        });
      }else if (key === "cost") {
        setHelpListConfig({
          forKey: key,
          uniqKey: `${key}-helpList`,
          open: true,
          recordIndex: rowIndex,
          title: "Help of Cost Center",
          headers: [
            { key: "code", label: "Code" },
            { key: "prefix", label: "Prefix" },
            { key: "description", label: "Cost Center" },
          ],
          list: apiData?.ccDetails || [],
          searchKeys: ["description"],
        });
      }
    },
    [apiAccData, apiData]
  );

  const handleHelpListClickItem = (item) => {
    if(['','Query'].includes(formStatus)){
      return
    }
    if (helpListConfig?.forKey === "acc_no") {
      // if(masterData?.pay_rec == '0' && item.acc_no[0] == 'S'){
      //   toast.error("You Cannot Make Payment Voucher from Bank Vocuher, Pls Go to Payment Advice Form");
      //   return
      // }else
       if(masterData?.pay_rec == '0' && masterData?.ecs_flag =='N' && masterData?.computrized_chq =='Y' && item.acc_no[0]== 'S'){
        toast.error('You Cannot Make Payment Voucher from Bank Vocuher,Pls Go to Payment Advice Form')
        return
      }else if(item.acc_no == 'A0015'){
        toast.error('Cannot use Account code of CASH IN HAND Using CASH BANK CONTRA code instead')
        // todo : automatically fill cash bank contra account
        return
      }else if(item.acc_no == masterData?.acct_type){
         toast.error('Account No can not be same as selected Above')
         return
       }
      handleChange("acc_no", item?.acc_no, helpListConfig.recordIndex);
      handleChange("acc_desc", item?.acc_desc, helpListConfig.recordIndex);
      handleChange("emp_relate", item?.emp_relate, helpListConfig.recordIndex);
      handleChange("cc_purpose", item?.cc_purpose, helpListConfig.recordIndex);
      handleChange("bill_no", item?.bill_no, helpListConfig.recordIndex);
      handleChange("bill_dt", item?.bill_dt, helpListConfig.recordIndex);
      handleChange("amount", Number(item?.amount), helpListConfig.recordIndex);
      // genBillNo({on_acc:masterData?.on_acc, thfmbankData:masterData}) //
      // todo: need to implement value for db_cr field
    }else if(helpListConfig?.forKey === "bill_no"){
      handleChange("acc_no", item?.acc_no, helpListConfig.recordIndex);
      handleChange("acc_desc", item?.acc_desc, helpListConfig.recordIndex);
      handleChange("emp_relate", item?.emp_relate, helpListConfig.recordIndex);
      handleChange("cc_purpose", item?.cc_purpose, helpListConfig.recordIndex);
      handleChange("bill_no", item?.bill_no, helpListConfig.recordIndex);
      handleChange("bill_dt", item?.bill_dt, helpListConfig.recordIndex);
      handleChange("amount", Number(item?.amount), helpListConfig.recordIndex);

      handleChange("prof_no", '', helpListConfig.recordIndex);
      handleChange("prof_dt", '', helpListConfig.recordIndex);
    }else if (helpListConfig?.forKey === "cost") {
      handleChange("cost_desc", item?.description?.trim(), helpListConfig.recordIndex);
      handleChange("cost_centr", item?.code?.trim(), helpListConfig.recordIndex);
      handleChange("cost", item?.prefix?.trim(), helpListConfig.recordIndex);
      
    } else if (helpListConfig?.forKey === "pur_desc") {
      handleChange(
        "pur_desc",
        item?.description?.trim(),
        helpListConfig.recordIndex
      );
      handleChange(
        "pur_code",
        item?.code?.trim(),
        helpListConfig.recordIndex
      );
    } else if (helpListConfig?.forKey === "emp_cd") {
      handleChange("emp_cd", item?.emp_cd?.trim(), helpListConfig.recordIndex);
      handleChange(
        "emp_name",
        item?.emp_name?.trim(),
        helpListConfig.recordIndex
      );
    } else if (helpListConfig?.forKey === "prof_no") {
      handleChange("prof_no", item?.prof_no.trim(), helpListConfig.recordIndex);
      handleChange("prof_dt", item?.prof_dt?.trim(), helpListConfig.recordIndex);
    }

    setHelpListConfig({
      open: false,
    });
  };

  // Added
  const onSuccessConfirmation = useCallback((confirm, data) => {
    if (data.uniqKey === "narration_text" && confirm) {
      triggerSameNarration();
    }
    else if (data.uniqKey === "amount_field") {
      let parityValue = data.value, dbcrVal;
      let existingDBCR = formData?.[data.rowIndex]?.db_cr;
      let existingType = masterData?.pay_rec;
      if (!confirm) {
        parityValue *= -1;
        dbcrVal = existingDBCR ? existingDBCR : (existingType == "0" ? "C" : "D");
      }
      else {
        dbcrVal = existingDBCR ? (existingDBCR == "D" ? "C" : "D") : (existingType == "0" ? "D" : "C");
      }
      handleChange("db_cr", `${dbcrVal}#${parityValue}`, data.rowIndex);
    };
    setConfirmationConfig({});
    setConfirmationModal(false);
  }, [formData]);

  // Function to add a new row
  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleDelete(index){
    triggerRowDelete(index)
    setFocusedRowIndex(index - 1)
  }

  function handleAddRow(){
    triggerNarrationAddRow()
    // setFocusedRowIndex(focusedRowIndex + 1)
  }
 
  //console.log("tds button disable condition::", masterData)

  

  // copy from exp bill vchr
  const handleAmountChange = useCallback((e, index) => {
      const { value } = e.target;
      const { amount, db_cr } = handleBnkDbCrChange(value, formData[index]?.db_cr, masterData?.pay_rec);
       
      if(amount == '0'){
        handleChange("amount", amount, index, e);
        handleChange( "db_cr", '', index,e);
        handleChange( "old_amount", amount, index, e); // ADDED AS PER CALCULATE AMOUNT PROGRAM UNIT
      }else{
          handleChange( "amount", amount, index,e);
          handleChange( "db_cr", db_cr, index,e);
      }
      },
      [formData, handleChange]
  );
        
// copy from exp bill vchr
      const reverseDbCr = (currentDbCr) => {
        return currentDbCr === 'D' ? 'C' : 'D';
      };
  
// copy from exp bill vchr // MAKE ENTRY REVERS
      const handleKeyDownOnAmt = useCallback((e, index) => {
        if (e.key === "-") {
          e.preventDefault();
          if(confirm('Do you want to revers the Entry')){
            let newValDbCr = reverseDbCr(formData[index].db_cr)
            //console.log('value of dbcr', newValDbCr)
            handleChange("db_cr", newValDbCr, index, e);
          }
        }
      }, [formData]);

  const validateAmount = (e) => {
    const { value } = e.target;
    if (masterData?.acc_no && value == "") {
      toast.error("Bill Amount cannot be blank");
      if (e.target) {
        e.target.focus();
      }
    }
    if(value === 0){
      toast.error("Amount cannot be Zero")
      e.target.focus();
    }
  };

  return (
    <Form id="bank-detail-form" className="">
      <div className="table-title">
        <span>Bank Voucher</span>
        {(formStatus === "Insert" || formStatus === "Update") && (
          <ButtonUi
            color="primary"
            className="add-action"
            onClick={handleAddRow}
          >
            Add Row
          </ButtonUi>
        )}
      </div>

      <div className="table-wrapper-v3"
        // style={{ height: "150px", maxHeight: "150px" }}
      >
        <SimpleBar forceVisible="y" autoHide={false}>
          <div className="table-sticky-wrapper">
            <Table hover>
              <thead>
                <tr>
                    {
                      (formStatus==='Insert' || formStatus==='Update') &&
                      <th className="" style={{width:'5%'}}>Actions</th>
                    }
                  {bankVoucherDetailsHeaders.map((header, index) => (
                      <th
                        key={index}
                        data-required={header?.required || false}
                        style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                            {header.label}
                            {header.isHelpExist && (<FcInfo title="Info" />)}
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData &&
                  formData.map((data, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                    <tr
                      key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                      style={{
                        border: `${
                          rowIndex === focusedRowIndex
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="sticky-column left">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={formData.length > 1}
                            onDelete={() => handleDelete(rowIndex)}
                            // onUpdate={
                            //   handleUpdate ? () => handleUpdate(data) : undefined
                            // }
                          />
                        </td>
                      )}
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="remarks"
                          value={data.remarks || " "}
                          // maxLength={30}
                          onChange={(e) =>{
                            handleChange("remarks", e.target.value, rowIndex, e)
                            // handleNarrationTextChange(e.target.value, rowIndex);

                          }}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="acc_no"
                          value={data.acc_no || ""}
                          maxLength={8}
                          onChange={(e) =>handleChange("acc_no", e.target.value, rowIndex, e)}
                          onDoubleClick={(e) => handleHelpList("acc_no", rowIndex)}
                          onBlur={(e)=> validateAccNo({event:e, formStatus, value:e.target.value, formData: masterData, setNarrationData})}
                        />
                      </td>
                      {/* <td className="table_cell">
                        <TextField
                          type="text"
                          // required
                          name="prof_no"
                          value={data.prof_no || ""}
                          // maxLength={30}
                          onChange={(e) => handleChange("prof_no", e.target.value, rowIndex, e)}
                          onDoubleClick={(e) => handleHelpList("prof_no", rowIndex)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="date"
                          // required
                          disabled
                          name="prof_dt"
                          value={data.prof_dt || ""}
                          // maxLength={30}
                          onChange={(e) => handleChange("prof_dt", e.target.value, rowIndex, e)}
                        />
                      </td> */}
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="bill_no"
                          value={data.bill_no || ""}
                          maxLength={30}
                          onChange={(e) => handleChange("bill_no", e.target.value, rowIndex, e)}
                          onDoubleClick={(e) => handleHelpList("bill_no", rowIndex)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="date"
                          required
                          name="bill_dt"
                          value={data.bill_dt || ""}
                          // maxLength={30}
                          onChange={(e) => handleChange("bill_dt", e.target.value, rowIndex, e)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          // required={data?.cc_purpose == 'Y'?true:false} // stop as per said by pm sir on meet on 16102025
                          name="cost"
                          value={data.cost || ""}
                          onChange={(e) =>handleChange("cost", e.target.value, rowIndex, e)}
                          onDoubleClick={(e) => handleHelpList("cost", rowIndex)}
                          // onBlur={(e)=> validateCostCentr(e, e.target.value, formStatus, formData, setNarrationData, rowIndex)}
                          
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          // required={data?.cc_purpose == 'Y'?true:false} // stop as per said by pm sir on meet on 16102025
                          name="pur_desc"
                          value={data.pur_desc || ""}
                          onChange={(e) =>handleChange("pur_desc", e.target.value, rowIndex, e)}
                          onDoubleClick={(e) => handleHelpList("pur_desc", rowIndex)}
                          // onBlur={(e)=> validateCostCentr(e, e.target.value, formStatus, formData, setNarrationData, rowIndex)}
                          
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          style={{ textAlign: "right" }}
                          type="Number"
                          required
                          name="amount"
                          value={data.amount || ""}
                          // maxLength={30}
                          // onChange={(e) => handleChange("amount", e.target.value, rowIndex, e)}
                          onChange={(e) => handleAmountChange(e, rowIndex)}
                          onKeyDown={(e)=>handleKeyDownOnAmt(e, rowIndex)}
                          onBlur={(e)=>validateAmount(e)}
                          // onBlur={(e) => handleAmountChange(e, "amount", e.target.value, rowIndex)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="db_cr"
                          value={data.db_cr || ""}
                          maxLength={1}
                          onChange={(e) =>handleChange("db_cr", e.target.value, rowIndex, e)}
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <ButtonUi
                          color="secondary"
                          className="table-button"
                          disabled={isTDSApplicable({pay_rec: masterData?.pay_rec, on_acc: masterData?.on_acc, formStatus})}
                          onClick={() => {
                            generateTDSEntriesBnk({
                              thfmBankData:masterData,
                              tdfmBankData:data,
                              srl_no: formData.reduce((max, item) => Math.max(max, item.srl_no), 0),
                              formStatus,
                              setUpdateNarrationData
                            }, setNarrationData)}}
                        >
                          TDS
                        </ButtonUi>
                      </td>
                    </tr>
                    <tr 
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                      style={{
                          borderBottom: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          borderTop: "none" 
                      }}
                      tabIndex={0}
                      >
                          <td colSpan={formStatus === 'Query'|| formStatus === ''? 6 : 5}>
                              <TextField
                                  type="text"
                                  name="acc_desc"
                                  value={data.acc_desc || ""}
                                        onChange={(e) =>handleChange("acc_no", e.target.value, rowIndex, e)}
                                  disabled
                                  
                                  style={{ fontWeight: "bold" }}
                              />
                          </td>
                          <td colSpan={6}>
                              <TextField
                                  type="text"
                                  name="cost_desc"
                                  value={data.cost_desc || ""}
                                  onChange={(e) =>handleChange(e, "cost_desc", e.target.value, rowIndex)}
                                  disabled
                              />
                          </td>
                    </tr>
                    </React.Fragment>
                    
                  ))}
              </tbody>
            </Table>
          </div>
        </SimpleBar>
      </div>

      <Container>
        <Row>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="Bank GRN No."
              value={formData[focusedRowIndex]?.bank_grn_no || ""}
              onChange={(e) =>
                handleChange("bank_grn_no", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="date"
              label="Bank GRN Date"
              value={formData[focusedRowIndex]?.bank_grn_dt || ""}
              onChange={(e) =>
                handleChange("bank_grn_dt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2} className="button-group-wrapper mt-4 ">
            <Checkbox
              text="TDS Deposit"
              onChange={(e) =>
                handleChange(
                  "tds_debit_entry",
                  e.target.checked ? "Y" : "N",
                  focusedRowIndex,
                  e
                )
              }
              checked={formData[focusedRowIndex]?.tds_debit_entry === "Y"}
            />
          </Col>
          <Col md={6} lg={3}>
            <TextField
              style={{ textAlign: "right" }}
              type="text"
              label="TDS Credit Amt."
              value={formData[focusedRowIndex]?.tds_cr_amt || ""}
              onChange={(e) =>
                handleChange("tds_cr_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>

          <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS %"
              value={formData[focusedRowIndex]?.tds_perc || ""}
              onChange={(e) =>
                handleChange("tds_perc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Amount"
              value={formData[focusedRowIndex]?.tds_amt || ""}
              onChange={(e) =>
                handleChange("tds_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="Chq No."
              value={formData[focusedRowIndex]?.chq_no || ""}
              onChange={(e) =>
                handleChange("chq_no", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="date"
              label="Chq Date"
              value={formData[focusedRowIndex]?.chq_dt || ""}
              onChange={(e) =>
                handleChange("chq_dt", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={6} lg={3}>
            <TextField
              type="text"
              label="Deposit Slip No."
              value={formData[focusedRowIndex]?.deposit_slip || ""}
              onChange={(e) =>
                handleChange("deposit_slip", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="date"
              label="Deposit Slip Dt."
              value={formData[focusedRowIndex]?.deposit_slip_dt || ""}
              onChange={(e) =>
                handleChange(
                  "deposit_slip_dt",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
            />
          </Col>
          {/* <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS %"
              value={formData[focusedRowIndex]?.tds_perc || ""}
              onChange={(e) =>
                handleChange("tds_perc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Amount"
              value={formData[focusedRowIndex]?.tds_amt || ""}
              onChange={(e) =>
                handleChange("tds_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}


          <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Sur %"
              value={formData[focusedRowIndex]?.tds_sur_perc || ""}
              onChange={(e) => handleChange("tds_sur_perc", e.target.value, focusedRowIndex, e)}
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Sur Amt."
              value={formData[focusedRowIndex]?.tds_sur_amt || ""}
              onChange={(e) =>
                handleChange("tds_sur_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col md={6} lg={3}>
            <TextField
              type="text"
              label="Chq in Favour"
              value={formData[focusedRowIndex]?.chq_in_favour || ""}
              onChange={(e) =>
                handleChange(
                  "chq_in_favour",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
            />
          </Col>
          <Col md={5} lg={2}>
            <TextField
              type="text"
              required={formData[focusedRowIndex]?.emp_relate == 'Y'?true:false}
              label="Emp. Code"
              value={formData[focusedRowIndex]?.emp_cd || ""}
              onChange={(e) =>handleChange("emp_cd", e.target.value, focusedRowIndex, e)}
            />
          </Col>
          <Col md={7} lg={4} className="mt-4">
            <TextField
              type="text"
              value={formData[focusedRowIndex]?.emp_name || ""}
              onChange={(e) =>
                handleChange("emp_name", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          {/* <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Sur %"
              value={formData[focusedRowIndex]?.tds_sur_perc || ""}
              onChange={(e) => handleChange("tds_sur_perc", e.target.value, focusedRowIndex, e)}
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Sur Amt."
              value={formData[focusedRowIndex]?.tds_sur_amt || ""}
              onChange={(e) =>
                handleChange("tds_sur_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}

          <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Cess %"
              value={formData[focusedRowIndex]?.tds_cess_perc || ""}
              onChange={(e) =>
                handleChange(
                  "tds_cess_perc",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Cess Amount"
              value={formData[focusedRowIndex]?.tds_cess_amt || ""}
              onChange={(e) =>
                handleChange("tds_cess_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          {/* <Col md={12} lg={4}>
            <TextField
              type="text"
              label="Account Name"
              value={formData[focusedRowIndex]?.acc_desc || ""}
              onChange={(e) =>
                handleChange("acc_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}
          {/* <Col md={3} lg={2}>
            <TextField
              type="text"
              label="Cost Center"
              value={formData[focusedRowIndex]?.cost_desc || ""}
              onChange={(e) => handleChange("cost_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
            </Col> */}
           {/* <Col md={12} lg={6}></Col> */}

           <Col md={3} lg={2}>
            <TextField
              type="text"
              label="Party Code"
              value={formData[focusedRowIndex]?.ser_party_cd || ""}
              onChange={(e) =>
                handleChange("ser_party_cd", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={3} lg={4} className="mt-4">
            <TextField
              type="text"
              //   label="Party Code"
              value={formData[focusedRowIndex]?.party_desc || ""}
              onChange={(e) =>
                handleChange("party_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
              <Col md={3} lg={3}></Col>
          {/* <Col md={3} lg={3}>
            <Select
              type="text"
              label="Purpose"
              value={formData[focusedRowIndex]?.pur_code || ""}
              onChange={(e) =>
                handleChange("pur_code", e.target.value, focusedRowIndex, e)
              }
              options={purposeOption}
            />
          </Col> */}

          {/* <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Cess %"
              value={formData[focusedRowIndex]?.tds_cess_perc || ""}
              onChange={(e) =>
                handleChange(
                  "tds_cess_perc",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Cess Amount"
              value={formData[focusedRowIndex]?.tds_cess_amt || ""}
              onChange={(e) =>
                handleChange("tds_cess_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}

          <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Hsc %"
              value={formData[focusedRowIndex]?.tds_hsc_perc || ""}
              onChange={(e) =>
                handleChange("tds_hsc_perc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Hsc Amt."
              value={formData[focusedRowIndex]?.tds_hsc_amt || ""}
              onChange={(e) =>
                handleChange("tds_hsc_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>
        <Row className="mt-1">
          {/* <Col md={3} lg={2}>
            <TextField
              type="text"
              label="Party Code"
              value={formData[focusedRowIndex]?.ser_party_cd || ""}
              onChange={(e) =>
                handleChange("ser_party_cd", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col md={3} lg={3} className="mt-4">
            <TextField
              type="text"
              //   label="Party Code"
              value={formData[focusedRowIndex]?.party_desc || ""}
              onChange={(e) =>
                handleChange("party_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}
          <Col md={3} lg={4}></Col>
          {/* <Col md={6} lg={1}>
            <TextField
              type="text"
              label="TDS Hsc %"
              value={formData[focusedRowIndex]?.tds_hsc_perc || ""}
              onChange={(e) =>
                handleChange("tds_hsc_perc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="TDS Hsc Amt."
              value={formData[focusedRowIndex]?.tds_hsc_amt || ""}
              onChange={(e) =>
                handleChange("tds_hsc_amt", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col> */}
        </Row>

        {/* Acc No Help List */}
        <HelpListV2
          {...helpListConfig}
          uniqKey={helpListConfig.uniqKey || "helpListV2"}
          open={helpListConfig.open}
          onClose={() => setHelpListConfig({})}
          onSelectItem={handleHelpListClickItem}
          size="xl"
        />
        {confirmationModal &&
          <ConfirmationModal
            isOpen={confirmationModal}
            onClose={() => {
              onSuccessConfirmation(false, confirmationConfig);
              setConfirmationModal(false);
            }}
            {...confirmationConfig}
            onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
          />
        }
      </Container>
    </Form>
  );
};

export default BankVoucherDetails;
