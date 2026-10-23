import React, { useCallback, useMemo, useState } from "react";
import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table, Card } from "reactstrap";
import toast from "react-hot-toast";

import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import TextField from "../../../../components/basic/textField";
import LoanDetailsModal from "../../../../components/Modals/loanDetailsModal";
import MRIRModal from "../../../../components/Modals/mrirModal";
import HelpListV2 from "../../../../components/HelpList/v2";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { useSelector } from "react-redux";
import { DISABLED_OPTIONS, handleCashDbCrChange, validateCostCenter, validateFieldAccNo } from "./cash_voucher_helper";

const CashDetail = ({
  apiData,
  apiAccData,
  masterData,
  formData = [{}],
  formStatus,
  handleChange = () => { },
  triggerNarrationAddRow,
  triggerSameNarration,
  triggerRowDelete,
  handleCancelVch=()=>{}
}) => {
  const [recordIndex, setRecordIndex] = useState(0);
  const [loanModal, setLoanModal] = useState(false);
  const [mrirModal, setMrirModal] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [helpListConfig, setHelpListConfig] = useState({
    open: false,
    title: "",
    headers: [],   // label, key
    list: [],
    searchKeys: []
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(-1);

  const { user } = useSelector((state) => state.auth);

  const narrationDetailData = useMemo(() => {
    if (formData?.[recordIndex]) {
      return formData?.[recordIndex];
    };
    return {};
  }, [recordIndex, formData]);

  const costCentreOptions = useMemo(() => {
    if (apiData?.ccDetails) {
      return [
        { label: "Select", value: "" },
        // ...apiData?.ccDetails?.map(item => ({ label: `[${item.prefix}] ${item.description}`, value: item.code?.trim() }))
        ...apiData?.ccDetails?.map(item => ({ label: `${item.prefix}`, value: item.code?.trim() }))
      ];
    };
    return [];
  }, [apiData]);

  const cashVoucherDetailHeader = [
    { label: "Narration", key: "narration", width: "30%" },
    { label: "Account no", key: "acc_no", width: "10%" },
    { label: "Bill no", key: "bill_no", width: "10%" },
    { label: "Bill date.", key: "bill_date", width: "5%" },
    { label: "cost center", key: "cost_center", width: "10%" },
    { label: "Amount", key: "amt", width: "10%" },
    { label: "D/C", key: "dc", width: "5%" },
  ];

  const sampleMrirData = [
    { mrirNo: "MRIR_001", mrirDate: "2025-02-21" },
    { mrirNo: "MRIR_002", mrirDate: "2025-02-20" },
    { mrirNo: "MRIR_003", mrirDate: "2025-02-19" },
    { mrirNo: "MRIR_004", mrirDate: "2025-02-18" },
    { mrirNo: "MRIR_005", mrirDate: "2025-02-17" },
  ];

  const handleNarrationChange = (field, value, rowIndex) => {
    handleChange(field, value, rowIndex);
    setRecordIndex(rowIndex);
  };

  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleNarrationTextChange = useCallback(
    debounce((value, rowIndex) => {
      if (rowIndex === 0 && !hasAlerted) {
        setConfirmationConfig({
          title: "Narration Field",
          description: "Narration field changed for the first time in the first row!",
          uniqKey: "narration_text"
        });
        setConfirmationModal(true);
        // let allowSameNarration = window.confirm("Narration field changed for the first time in the first row!");
        // if (allowSameNarration) {
        //   triggerSameNarration();
        // }
        setHasAlerted(true);
      }
    }, 500),
    [hasAlerted]
  );

  // Added
  const onSuccessConfirmation = useCallback((confirm, data) => {
    if (data.uniqKey === "narration_text" && confirm) {
      triggerSameNarration();
    }
    else if (data.uniqKey === "amount_field") {
      let parityValue = data.value, dbcrVal;
      let existingDBCR = formData?.[data.rowIndex]?.db_cr;
      let existingType = masterData?.type_user;
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

  // Added
  // const handleAmountChange = useCallback((e, key, value, rowIndex) => {
  //     if(!value){
  //       toast.error('Amount cannot be null')
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
  //       handleChange("db_cr", `${currType || masterData?.type_user == "0" ? "D" : "C"}#${value}`, rowIndex)
  //     }
  //     if(value == 0){
  //       toast.error('Amount cannot zero')
  //       e.target.focus()
  //       return
  //     }
  //     handleChange('amount', Math.abs(value), rowIndex)
  //   },
  //   [masterData]
  // );
  // const handleAmountChange = useCallback(
  //   debounce((e, key, value, rowIndex) => {
  //     if(!value){
  //       toast.error('Amount cannot be null')
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
  //       handleChange("db_cr", `${currType || masterData?.type_user == "0" ? "D" : "C"}#${value}`, rowIndex)
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

  const handleFieldLevelValidations = (key, value, rowIndex) => {
    try {
      if (key === "cost_ctr") {
        if (value && !formData?.[rowIndex]?.acc_no) {
          throw new Error("Please Enter/Select Account Number");
        }
        handleChange(key, value, rowIndex);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const handleHelpList = useCallback((key, rowIndex) => {
    if (key === "acc_no") {
      setHelpListConfig({
        forKey: key,
        uniqKey: `${key}-helpList`,
        open: true,
        recordIndex: rowIndex,
        title: "Select Account Number",
        headers: [{ key: "acc_desc", label: "Account Description" }, { key: "acc_no", label: "Account No" }],
        list: apiData?.accountList || [],
        searchKeys: ["acc_desc"]
      });
    }
    else if (key === "purpose") {
      setHelpListConfig({
        forKey: key,
        uniqKey: `${key}-helpList`,
        open: true,
        recordIndex: rowIndex,
        title: "Help of Purpose",
        headers: [{ key: "description", label: "Description" }],
        list: apiData?.purpData || [],
        searchKeys: ["description"]
      });
    }
    else if (key === "emp_cd") {
      setHelpListConfig({
        forKey: key,
        uniqKey: `${key}-helpList`,
        open: true,
        recordIndex: rowIndex,
        title: "Help of Employee",
        headers: [{ key: "emp_cd", label: "Employee Code" }, { key: "emp_name", label: "Employee Name" }, { key: "prefix", label: "Cost Centre" }],
        list: apiAccData?.[formData?.[rowIndex]?.acc_no]?.empData || [],
        searchKeys: ["emp_name"]
      });
    }
  }, [apiAccData, apiData]);

  const handleHelpListClickItem = (item) => {
    if (helpListConfig?.forKey === "acc_no") {
      handleChange("acc_no", item?.acc_no, helpListConfig.recordIndex);
      handleChange("acc_desc", item?.acc_desc, helpListConfig.recordIndex);
      handleChange("emp_relate", item?.emp_relate, helpListConfig.recordIndex)
    }
    else if (helpListConfig?.forKey === "purpose") {
      handleChange("purpose", item?.description?.trim(), helpListConfig.recordIndex);
      handleChange("purpose_code", item?.code?.trim(), helpListConfig.recordIndex);
    }
    else if (helpListConfig?.forKey === "emp_cd") {
      handleChange("emp_cd", item?.emp_cd?.trim(), helpListConfig.recordIndex);
      handleChange("emp_name", item?.emp_name?.trim(), helpListConfig.recordIndex);
    }
    setHelpListConfig({
      open: false
    })
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(-1);
  };

  const handleDelete = () => {
    triggerRowDelete(isDeleteModalOpen);
    toggleDeleteModal();
    setRecordIndex(0);
  };


    // copy from exp bill vchr
    const handleAmountChange = useCallback((e, index) => {
      const { value } = e.target;
      const { amount, db_cr } = handleCashDbCrChange(value, formData[index]?.db_cr, masterData?.type_user);
       
      if(amount == '0'){
        handleChange("amount", amount, index);
        handleChange( "db_cr", '', index);
        handleChange( "old_amount", amount, index); // ADDED AS PER CALCULATE AMOUNT PROGRAM UNIT
      }else{
          handleChange( "amount", amount, index);
          handleChange( "db_cr", db_cr, index);
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
        handleChange("db_cr", newValDbCr, index);
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

  // Added: Logic for disabling fields based on formStatus
  return (
    <Form id="cash-detail-form">
      <LoanDetailsModal
        isOpen={loanModal}
        onClose={() => setLoanModal(false)}
      />
      <div className="table-title">
        <span></span>
        {/* {(formStatus === "Insert" || formStatus === "Update") && ( */}
        <div className="d-flex gap-2">
          <ButtonUi
            color="primary"
            className="add-action"
            onClick={triggerNarrationAddRow}
            //style={{fontsize:'10px'}}
          >
            Add Row
          </ButtonUi>
        </div>
      </div>
      <div className="table-container ">
        <SimpleBar forceVisible="y" autoHide={false}>
          <Table hover>
            <thead>
              <tr>
                {["Insert", "Update"].includes(formStatus) &&
                  <th
                    style={{
                      whiteSpace: "nowrap",
                      width: "5%",
                      minWidth: "5%",
                    }}
                  >
                    Action
                  </th>
                }
                {cashVoucherDetailHeader.map((header, index) => (
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
              {formData.map((data, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr>
                    {["Insert", "Update"].includes(formStatus) &&
                      <td className="row-action">
                        {formData?.length > 1 ?
                          <button className="action-button delete-button" type="button" onClick={() => setDeleteModalOpen(rowIndex)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
                              <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
                            </svg>
                          </button>
                          :
                          <span>-</span>
                        }
                      </td>
                    }
                    <td>
                      <TextField
                        type="text"
                        required
                        name="naration"
                        value={data.naration || ""}
                        onChange={(e) => {
                          handleNarrationChange("naration", e.target.value, rowIndex);
                          handleNarrationTextChange(e.target.value, rowIndex);
                        }}
                        onFocus={() => setRecordIndex(rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        type="text"
                        required
                        name="acc_no"
                        value={data.acc_no || ""}
                        onChange={(e) => handleNarrationChange("acc_no", e.target.value, rowIndex)}
                        onFocus={() => setRecordIndex(rowIndex)}
                        onDoubleClick={() => handleHelpList("acc_no", rowIndex)}
                        onBlur={(e) => validateFieldAccNo(e, data, formStatus, user.global_division_id, user.global_fin_year, handleChange, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        type="text"
                        // required
                        name="bill_no"
                        value={data.bill_no || ""}
                        onChange={(e) => handleNarrationChange("bill_no", e.target.value, rowIndex)}
                        onFocus={() => setRecordIndex(rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        type="date"
                        name="bill_dt"
                        value={data.bill_dt || ""}
                        onChange={(e) => handleNarrationChange("bill_dt", e.target.value, rowIndex)}
                        onFocus={() => setRecordIndex(rowIndex)}
                      />
                    </td>
                    <td>
                      <Select
                        // required
                        name="cost_ctr"
                        value={data.cost_ctr || ""}
                        onChange={(e) => handleFieldLevelValidations("cost_ctr", e.target.value, rowIndex)}
                        options={costCentreOptions}
                        onFocus={() => setRecordIndex(rowIndex)}
                        onBlur={(e) => validateCostCenter(e, formStatus, data.cc_purpose, data.cost_ctr)}
                      />
                    </td>
                    {/* // Added */}
                    <td>
                      <TextField
                        type="number"
                        id='amt'
                        required
                        name="amount"
                        value={data.amount || ""}
                        // onChange={e => {
                        //   handleChange("amount", e.target.value, rowIndex);
                        // }}
                        // onBlur={(e) => handleAmountChange(e, "amount", e.target.value, rowIndex)}
                        // onFocus={() => setRecordIndex(rowIndex)}

                        onChange={(e) => handleAmountChange(e, rowIndex)}
                        onKeyDown={(e)=>handleKeyDownOnAmt(e, rowIndex)}
                        onBlur={(e)=>validateAmount(e)}
                      />
                    </td>
                    <td>
                      <TextField
                        type="text"
                        name="db_cr"
                        value={data.db_cr || ""}
                        onChange={(e) => handleNarrationChange("db_cr", e.target.value, rowIndex)}
                        // disabled={formStatus === "Insert" || formStatus === "Query"}
                        disabled={DISABLED_OPTIONS.includes(formStatus)}
                        onFocus={() => setRecordIndex(rowIndex)}
                      />
                    </td>
                  </tr>
                  <tr 
                  // onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                  // style={{
                  //     borderBottom: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                  //     borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                  //     borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                  //     borderTop: "none" 
                  // }}
                  tabIndex={0}
                  >
                  <td colSpan={formStatus === 'Query'|| formStatus === ''? 2 : 3}>
                    <TextField
                      type="text"
                      name="acc_desc"
                      value={data.acc_desc || ""}
                      onChange={(e) =>handleChange(e, "acc_desc", e.target.value, rowIndex)}
                      disabled
                    />
                  </td>
                  <td colSpan={5}>
                    <TextField
                      type="text"
                      name="cost_center"
                      value={data.cost_center || ""}
                      onChange={(e) =>handleChange(e, "cost_center", e.target.value, rowIndex)}
                      disabled
                    />
                  </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </div>
      <Row className="">
        <Col md={2}>
          <TextField
            type="text"
            label="Cheque no"
            name="cheque_no"
            value={narrationDetailData?.cheque_no || ""}
            onChange={(e) => handleChange("cheque_no", e.target.value, recordIndex)}
            disabled={DISABLED_OPTIONS.includes(formStatus)}
          />
        </Col>
        <Col md={2} className="">
          <TextField
            type="text"
            label="Cheque Date"
            name="cheque_dt"
            value={narrationDetailData?.cheque_dt || ""}
            onChange={(e) => handleChange("cheque_dt", e.target.value, recordIndex)}
            disabled={DISABLED_OPTIONS.includes(formStatus)}
          />
        </Col>
        <Col md={2}>
          <TextField
            type="text"
            label="Purpose"
            name="purpose"
            value={narrationDetailData?.purpose || ""}
            onChange={(e) => handleChange("purpose", e.target.value, recordIndex)}
            onClick={() => handleHelpList("purpose", recordIndex)}
          />
        </Col>
        <Col md={6}>
          <Row>
            <Col md={3}>
              <TextField
                type="text"
                label="Party Cd"
                name="party_cd"
                value={narrationDetailData?.party_cd || ""}
                onChange={(e) => handleChange("party_cd", e.target.value, recordIndex)}
              />
            </Col>
            <Col md={7} className="mt-4">
              <TextField
                type="text"
                name="party_desc"
                value={narrationDetailData?.party_desc || ""}
                onChange={(e) => handleChange("party_desc", e.target.value, recordIndex)}
                disabled={DISABLED_OPTIONS.includes(formStatus)}
              />
            </Col>
          </Row>
        </Col>
        {/* <Col md={2}>
          <TextField
            type="text"
            label="Curr Bal"
            name="curr_bal"
            value={masterData?.curr_bal || ""}
            disabled={DISABLED_OPTIONS.includes(formStatus)}
          />
        </Col>
        <Col md={1} className="mt-4">
          <TextField type="text" name="curr_bal_dbcr" value={masterData?.curr_bal_dbcr} disabled />
        </Col> */}
      </Row>
      <Row className="mt-1">
        <Col md={6}>
        <Card className="px-2 p-1">
          <Row>
            <Col md={3}>
              <TextField
                type="text"
                label="Emp Code"
                name="emp_cd"
                value={narrationDetailData?.emp_cd || ""}
                onChange={(e) => handleChange("emp_cd", e.target.value, recordIndex)}
                onClick={() => handleHelpList("emp_cd", recordIndex)}
                disabled={narrationDetailData?.emp_rel === "N" ? true : false}
              />
            </Col>
            <Col md={8}>
              <TextField
                type="text"
                label="Emp Name"
                name="emp_name"
                value={narrationDetailData?.emp_name || ""}
                onChange={(e) => handleChange("emp_name", e.target.value, recordIndex)}
                disabled={DISABLED_OPTIONS.includes(formStatus)}
              />
            </Col>

          </Row>
          <Row className="mt-2">
            <Col md={3}>
              <TextField
                type="text"
                label="TDS CR Amt"
                name="tds_cr_amt"
                value={narrationDetailData?.tds_cr_amt || ""}
                onChange={(e) => handleChange("tds_cr_amt", e.target.value, recordIndex)}
                disabled={DISABLED_OPTIONS.includes(formStatus)}
              />
            </Col>
            <Col md={3}>
              <TextField
                type="Number"
                label="Total Amt"
                name="total_Amt"
                value={narrationDetailData?.total_Amt || ""}
                onChange={(e) => handleChange("total_Amt", e.target.value, recordIndex)}
              />
            </Col>

          <Col xl={4} className='d-flex justify-content-center align-items-end pb-1'>
            <ButtonUi color='danger' onClick={handleCancelVch}>Cancel Voucher</ButtonUi>
          </Col>
          </Row>

        </Card>
        </Col>
        <Col md={6}>
          <Card className="px-2 py-1">
            <Row className="">
                  <Col md={2} className="d-flex">
                    <TextField
                      type="Number"
                      label="TDS %"
                      name="tds"
                      value={narrationDetailData?.tds || ""}
                      onChange={(e) => handleChange("tds", e.target.value, recordIndex)}
                      disabled={DISABLED_OPTIONS.includes(formStatus)}
                    />
                  </Col>
                  <Col md={4} className="d-flex">
                    <TextField
                      type="Number"
                      label="Amt"
                      name="tds_amt"
                      value={narrationDetailData?.tds_amt || ""}
                      onChange={(e) => handleChange("tds_amt", e.target.value, recordIndex)}
                      disabled={DISABLED_OPTIONS.includes(formStatus)}
                    />
                  </Col>
                  <Col md={2} className="d-flex">
                    <TextField
                      type="Number"
                      label="SUR %"
                      name="sur"
                      value={narrationDetailData?.sur || ""}
                      onChange={(e) => handleChange("sur", e.target.value, recordIndex)}
                      disabled={DISABLED_OPTIONS.includes(formStatus)}
                    />
                  </Col>
                  <Col md={4} className="d-flex">
                    <TextField
                      type="Number"
                      label="Amt"
                      name="sur_amt"
                      value={narrationDetailData?.sur_amt || ""}
                      onChange={(e) => handleChange("sur_amt", e.target.value, recordIndex)}
                      disabled={DISABLED_OPTIONS.includes(formStatus)}
                    />
                  </Col>
            </Row>
            <Row className="mt-2">
                  
            </Row>
            <Row className="">
                  <Col md={2}>
                    {/* <div style={{ width: "40%" }}> */}
                      <TextField
                        type="Number"
                        label="CESS %"
                        name="cess"
                        value={narrationDetailData?.cess || ""}
                        onChange={(e) => handleChange("cess", e.target.value, recordIndex)}
                        disabled={DISABLED_OPTIONS.includes(formStatus)}
                      />
                    {/* </div> */}
                  </Col>
                  <Col md={4} className="d-flex">
                    <TextField
                      type="Number"
                      label="Amt"
                      name="cess_amt"
                      value={narrationDetailData?.cess_amt || ""}
                      onChange={(e) => handleChange("cess_amt", e.target.value, recordIndex)}
                      disabled={DISABLED_OPTIONS.includes(formStatus)}
                    />
                  </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      {/* Modals */}
      <MRIRModal
        isOpen={mrirModal}
        onClose={() => setMrirModal(false)}
        data={sampleMrirData}
      />
      {/* Acc No Help List */}
      <HelpListV2
        {...helpListConfig}
        uniqKey={helpListConfig.uniqKey || "helpListV2"}
        open={helpListConfig.open}
        onClose={() => setHelpListConfig({})}
        onSelectItem={handleHelpListClickItem}
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
      <Modal isOpen={isDeleteModalOpen > -1} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Confirm Deletion</ModalHeader>
        <ModalBody>Are you sure you want to delete this record?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Delete
          </Button>{" "}
          <Button color="secondary" onClick={toggleDeleteModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Form>
  );
};

export default CashDetail;


