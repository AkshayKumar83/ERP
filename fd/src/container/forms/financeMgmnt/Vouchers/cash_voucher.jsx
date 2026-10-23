import React, { useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import CashDetail from "./cash_vchr_detail";
import CashHeader from "./cash_vchr_header";
import { APP_PROD_API } from "../../../../utils/api";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import {
  calcTransAmt,
  checkDateEqToToday,
  checkDateNotGreaterThanToday,
  createSearchPayload,
  fetchNarrationData,
  formControlInitDataTemplate,
  getCashVchReport,
  isValidDateForFinancialYear,
  runCashVoucherSubmitValidations,
  transformApiToFormData,
  transformApiToNarrationFormData,
  triggerFetchBillMeta,
  triggerFetchCurrencyData,
} from "././cash_voucher_helper";
import _ from "lodash";
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { validateForm } from "../../../../utils/fn";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

const CashVoucher = () => {
  const {
    formStatus,
    searchQuery,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    setSearchQuery,
  } = useFormStatus();

  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});

  const [gstEntry, setGSTEntry] = useState({});
  const [narrationData, setNarrationData] = useState([{}]);
  const [narrationAPIData, setNarrationAPIData] = useState({});
  const [hasSameNarrationText, setHasSameNarrationText] = useState(false);
  const [billMeta, setBillMeta] = useState({});

  // Added fields
  const [updateFormData, setUpdateFormData] = useState({});
  const [updateNarrationData, setUpdateNarrationData] = useState([{}]);

  const [dataset, setDataset] = useState({});
  const [deletedNarrationRows, setDeletedNarrationRows] = useState([]);

  const [isPayRecDisabled, setIsPayRecDisabled] = useState(false) 

  const [formControlData, setFormControlData] = useState({
    ...formControlInitDataTemplate,
  });

   const [confirmationModal, setConfirmationModal] = useState(false);
   const [confirmationConfig, setConfirmationConfig] = useState({});

  const tabs = [];

  const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

  const preloadConfigurationOnFieldChange = async (key, value = "") => {
    let obj = {};
    if (key === "division" && value) {
      let hasCurrencyData = dataset?.currencyExchangeData?.length;
      if (hasCurrencyData > 0) {
        let { currency_code, exchange_rate,  } =
          dataset?.currencyExchangeData?.[0];
        obj = {
          cur_code: currency_code,
          exchange_rate: parseFloat(exchange_rate).toFixed(3),
          division:dataset?.division[0]?.division_id
          // voucher_dt: DateTime.now().toFormat("yyyy-MM-dd"),
        };
      }
    } else if (key === "section" && value) {
      
      const balanceData = await triggerFetchCurrencyData({ section: value });
      obj.curr_bal = balanceData.balance;
      obj.curr_bal_dbcr = balanceData.balance_db_cr;
    }
    return obj;
  };

  const preloadNarrationConfigurationOnFieldChange = (key, value, rowIndex) => {
    let obj = {};
    if (key === "acc_no") {
      if (!value || _.isEmpty(value)) {
        obj.cost_ctr = null;
      } else {
        let accDetails = narrationAPIData?.accountList?.find(
          (e) => e.acc_no == value
        );
        obj.acc_desc = accDetails?.acc_desc?.trim();
      }
    } else if (key === "cost_ctr") {
      if (value) {
        obj.cost_center = narrationAPIData?.ccDetails
          ?.find((e) => e.code?.trim() == value)
          ?.description?.trim();
      }
    }
    return obj;
  };

  const runValidations = (key, value) => {
    if (["reference_dt", "bill_dt"].includes(key)) {
      // checkDateEqToToday(key, value);
      isValidDateForFinancialYear(key, value, user.global_fin_year);
    }
    return true;
  };

  // //console.log('formData outside:',formData)
  const runNarrationValidations = (key, value, rowIndex) => {
    let masterKeys = [
      "division",
      "type_user",
      "section",
      "reference_dt",
      "cur_code",
      "exchange_rate",
    ];


    // disabled pay_rec field
    setIsPayRecDisabled(true)

    const allKeysPresent = masterKeys.every((key) => key in formData);

    const allValuesValid = masterKeys.every((key) => {
      const value = formData[key];
      //console.log(key,formData[key])
      return value !== undefined && value !== null && value !== "";
    });


    if (!allKeysPresent || !allValuesValid) {
      throw new Error("Please fill Header data first");
    }

    if (key === "acc_no" && value) {
      let accDetails = narrationAPIData?.accountList?.find(
        (e) => e.acc_no == value
      );
      if (_.isEmpty(accDetails) || !accDetails) {
        throw new Error(
          "Invalid Account Number, please select correct Acc no. from Help List"
        );
      }
      if (narrationData?.length > 1) {
        let isExisting = _.findIndex(
          narrationData,
          (e, ind) => e.acc_no?.trim() === value?.trim() && ind != rowIndex
        );
        if (isExisting > -1) {
          throw new Error(`Please select different account number`);
        }
      }
    } else if (key === "amount" || key === "total_Amt") {
      if (isNaN(value)) {
        throw new Error("Enter valid amount");
      }
    }
    return true;
  };

  // const triggerAmountUpdate = (latestData) => {

  //   let dbAmt = _.filter(latestData, e => e.db_cr && e.db_cr === "D" && parseInt(e.amount)).reduce((prev, curr) => {
  //     return prev + curr.amount
  //   }, 0);
  //   let crAmt = _.filter(latestData, e => e.db_cr && e.db_cr === "C" && parseInt(e.amount)).reduce((prev, curr) => {
  //     return prev + curr.amount
  //   }, 0);

  //   let latestFormCtrlData = {...formControlData, tot_amt_db:dbAmt, tot_amt_cr: crAmt}
  //   let getTransAmt = calcTransAmt({pay_rec:0, trans_amt: formData?.trans_amt || 0}, latestFormCtrlData)

  //   setFormData(prev => {
  //     return {...prev, debt_amt: dbAmt, crdt_amt: crAmt, trans_amt:Math.abs(getTransAmt) };
  //   })
  //   setFormControlData(prev => {
  //     return {...latestFormCtrlData};
  //   })
  // };
  
 
  const triggerAmountUpdate = (latestData) => {
    let dbAmt = _.filter(
      latestData,
      (e) => e.db_cr && e.db_cr === "D" && !isNaN(Number(e.amount))
    ).reduce((prev, curr) => prev + Math.abs(Number(curr.amount)), 0);

    let crAmt = _.filter(
      latestData,
      (e) => e.db_cr && e.db_cr === "C" && !isNaN(Number(e.amount))
    ).reduce((prev, curr) => prev + Math.abs(Number(curr.amount)), 0);

    let latestFormCtrlData = {
      ...formControlData,
      tot_amt_db: dbAmt,
      tot_amt_cr: crAmt,
    };
    let getTransAmt = calcTransAmt(
      { pay_rec: 0, trans_amt: formData?.trans_amt || 0 },
      latestFormCtrlData
    );

    // Added - logic for update
    handleUpdateChange(
      "debt_amt",
      Math.abs(dbAmt),
      {},
      {
        crdt_amt: Math.abs(crAmt),
        trans_amt: Math.abs(getTransAmt),
      }
    );

    setFormData((prev) => ({
      ...prev,
      debt_amt: Math.abs(dbAmt),
      crdt_amt: Math.abs(crAmt),
      trans_amt: Math.abs(getTransAmt), // Ensures it's always positive
    }));

    setFormControlData((prev) => ({ ...latestFormCtrlData }));
  };


  // Added function
  const handleUpdateChange = (
    key,
    value,
    currFormState = {},
    additionalObj = {}
  ) => {
    if (formStatus === "Update") {
      setUpdateFormData((prev) => ({
        ...prev,
        [key]: value,
        ...additionalObj,
      }));
    }
  };

  // Added function
  const handleNarrationUpdateChange = (
    index,
    key,
    value,
    currFormState = [],
    additionalObj = {}
  ) => {
    if (currFormState?.[index]?.ref_id) {
      const currRow = currFormState?.[index];
      setUpdateNarrationData((prev) => {
        let latestData = prev.map((row, indice) =>
          indice === index
            ? {
                ...row,
                [key]: value,
                ...additionalObj,
                ref_id: currRow?.ref_id,
                srl_no: currRow?.sno,
              }
            : row
        );
        return latestData;
      });
    } else {
      setUpdateNarrationData((prev) => {
        let latestData = prev.map((row, indice) =>
          indice === index
            ? { ...currFormState[index], [key]: value, ...additionalObj }
            : row
        );
        return latestData;
      });
    }
  };

  // Added update logic
  const handleChange = async (key, value) => {

    try {
      runValidations(key, value);
      let additionalObj = await preloadConfigurationOnFieldChange(key, value);
      setFormData((prev) => {
        handleUpdateChange(key, value, prev, additionalObj);
        return {
          ...prev,
          [key]: value,
          ...additionalObj,
        };
      });
    } catch (error) {
      toast.error(error?.message || "Some error occurred, please try again");
    }
  };

  const handleNarrationChange = (key, value, index) => {

    try {
      //console.log(formData , narrationData)
      runNarrationValidations(key, value, index);
      let additionalObj = preloadNarrationConfigurationOnFieldChange(
        key,
        value
      );
      let parityValue = value;

      if (key === "acc_no" && value) {
        triggerFetchBillMeta({ acc_no: value, division_id: 1 }, (data) => {
          setBillMeta({ ...billMeta, [value]: data });
        });
      }
      // if (key === "db_cr") {
      //   let val = value?.split("#");
      //   parityValue = val[0];
      //   let amtValue = parseInt(val?.[1]);
      //   let actualValue = formData?.type_user === "P" ? "D" : "C";
      //   if (parityValue === actualValue) {
      //     additionalObj.amount = Math.abs(amtValue);
      //   }
      // }

      // set the object
      setNarrationData((prevData) => {
        let latestData = prevData.map((row, indice) =>
          indice === index
            ? { ...row, [key]: parityValue, ...additionalObj }
            : row
        );
        if (key === "amount" || key === "db_cr") {
          triggerAmountUpdate(latestData);
        }
        // Added
        handleNarrationUpdateChange(
          index,
          key,
          parityValue,
          latestData,
          additionalObj
        );
        return latestData;
      });
    } catch (error) {
      toast.error(error?.message || "Some error occurred, please try again");
    }
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  //    const handleAmtChngForLastRow = useCallback((e, key, value, rowIndex) => {
  //     if(!value){
  //       toast.error('Amount cannot be null')
  //       e.target.focus()
  //       return
  //     }

  //     let parityValue = parseFloat(value);
  //     let currType = formData?.[rowIndex]?.db_cr ? formData?.[rowIndex]?.db_cr : null;
  //     if (parityValue < 0) {
  //       let currValue = currType ? (currType == "D" ? "Debit" : "Credit") : null;
  //       let defaultCDValue = formData?.type_user === "0" ? "Credit" : "Debit";
  //       let reverseCDValue = currType ? (currType == "D" ? "Credit" : "Debit") : (formData?.type_user == "0" ? "Debit" : "Credit");

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
  //       handleNarrationChange("db_cr", `${currType || formData?.type_user == "0" ? "D" : "C"}#${value}`, rowIndex)
  //     }
  //     if(value == 0){
  //       toast.error('Amount cannot zero')
  //       e.target.focus()
  //       return
  //     }
  //     handleNarrationChange('amount', Math.abs(value), rowIndex)
  //   },
  //   [formData]
  // );

  // Added logic for update
  async function handleSubmit(e) {
    e.preventDefault();


     // ✅ Run amount validation for the last row before anything else
    // const lastRowIndex = narrationData.length - 1;
    // const lastRow = narrationData[lastRowIndex];
    // const amount = lastRow?.amount;

    // If the last row exists and has an amount field
    
      // const fakeEvent = { target: { focus: () => {} } }; // dummy event
      // handleAmtChngForLastRow(fakeEvent, "amount", amount, lastRowIndex);

    const isValidFormData = validateForm("cash-head-form", "Cash Voucher Header Form");
    if (!isValidFormData) {
      toast.error('Please fill required header data first')
      return;
    }
    const isValidNarration = validateForm("cash-detail-form", "Cash Voucher Detail Form");
    if (!isValidNarration) {
      return;
    }


    //console.log("Form submitted:: ", { formStatus });
    let twikFormData = { ...formData };
    twikFormData.trans_year = user.global_fin_year;
    twikFormData.division_id = user.global_division_id;
    try {
      runCashVoucherSubmitValidations(formData, narrationData);
      if (formStatus === "Update") {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.UPDATE_DATA_CASH_VOUCHER
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              masterData: { ...updateFormData, ref_id: formData?.ref_id },
              narrationData: updateNarrationData,
              deletedNarrationRows,
            }),
            credentials:'include',

          }
        );
        const responseData = await response.json();
        if(response.ok){
          toast.success('Record saved successfully')
        }
        
        //console.log("[Updated]:: ", responseData);
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.POST_DATA_CASH_VOUCHER
          }`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ masterData: twikFormData, narrationData }),
            credentials:'include',
          }
        );
        if(response.ok){
          const responseData = await response.json();

          toast.success('Record saved successfully')
          setFormData({
            division: "",
            reference_dt: "",
            reference_no: "",
            curr_bal_dbcr: "",
          });
          setUpdateFormData({});
          setNarrationData([{}]);
          setUpdateNarrationData([{}]);
          setIsPayRecDisabled(false)
        }else{
          const responseData = await response.json();
          throw Error(responseData?.message)
        }
      }
      // Added
    } catch (error) {
      toast.error(error?.message || "Some error occurred, please try again");
    }
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setNarrationData([{}]);
    setNarrationAPIData({});
    setGSTEntry({});
    setHasSameNarrationText(false);
    setBillMeta({});
    setDeletedNarrationRows([]);
    setIsPayRecDisabled(false)

    // Added
    setUpdateFormData({});
    setUpdateNarrationData([{}]);
  }, []);

  const triggerNarrationAddRow = useCallback(() => {
    try {
      let lastRow = narrationData[narrationData.length - 1];
      let keys = [
        // "naration",
        "acc_no",
        // "bill_no",
        // "bill_dt",
        // "cost_ctr",
        "amount",
        "db_cr",
        // "purpose",
        // "curr_bal",
        // "emp_cd",
        // "emp_name",
        // "total_Amt",
        // "ref_cheque_no",
        // "quantity",
        // "tds_cr_amt",
        // "service_tax",
        // "tds",
        // "tds_amt",
        // "sur",
        // "sur_amt",
        // "cess",
        // "cess_amt",
        // "acc_desc",
        // "cost_center",
        // "party_cd",
        // "party_desc",
        // "ser_tax_flag",
        // "ser_tax_credit_amt",
      ];
      const allKeysPresent = keys.every((key) => key in lastRow);
      const allValuesValid = keys.every((key) => {
        const value = lastRow[key];
        return value !== undefined && value !== null && value !== "";
      });

      if (allKeysPresent && allValuesValid) {
        setNarrationData((prev) => [
          ...prev,
          { naration: narrationData?.[0]?.naration || "" },
        ]);
        setUpdateNarrationData((prev) => {
          let insertObj = [];
          if (Array.isArray(prev) && prev.length !== narrationData.length) {
            let offsetLength = Math.abs(prev.length - narrationData.length);
            insertObj = _.times(offsetLength).map(() => ({}));
            //console.log("Check:: ", { offsetLength, insertObj });
          }
          return [...prev, ...insertObj, {}];
        });
      } else {
        throw new Error(
          "Please enter all the values required to add another row"
        );
      }
    } catch (error) {
      toast.error(error?.message || "Some error occurred, please try again");
    }
  }, [hasSameNarrationText, narrationData]);

  const triggerRowDelete = useCallback((rowIndex) => {
    setNarrationData((prevData) => {
      const newData = [...prevData];

      if (newData[rowIndex]?.sno) {
        setDeletedNarrationRows((del) => [...del, newData[rowIndex].sno]);
      }

      newData.splice(rowIndex, 1);
      triggerAmountUpdate(newData);
      return newData;
    });
  }, []);

  // const triggerRowDelete = (rowIndex) => {
  //   setNarrationData((prevData) => {
  //     const newData = [...prevData];

  //     if (newData[rowIndex]?.sno) {
  //       setDeletedNarrationRows((del) => [...del, newData[rowIndex].sno]);
  //     }

  //     newData.splice(rowIndex, 1);
  //     triggerAmountUpdate(newData);
  //     return newData;
  //   });
  // };


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log({ queryData, btnClicked });
      if (btnClicked === "Insert") {
        // Added
        setFormData({
          division: "",
          reference_dt: "",
          reference_no: "",
          type_user: "0",
        });
        setNarrationData([{}]);
        setUpdateFormData({});
        setUpdateNarrationData([{}]);
        setDeletedNarrationRows([]);
      }
      if (["Query", "Last", "Next", "Prev", "First"].includes(btnClicked)) {
        setFormData(transformApiToFormData(queryData?.masterData || {}, queryData?.narrationData || []));
        setNarrationData(
          transformApiToNarrationFormData(queryData?.narrationData || [])
        );
        setTotalRecordCount(queryData?.totalCount);
        setCurrentRecordNo(queryData?.current);
      }
      setDataset(queryData);
      fetchNarrationData((data) => {
        setNarrationAPIData(data);
      },user);
    },
    [formStatus, currentRecordNo]
  );


  const handleSearch = async () => {
    try {
      const searchPayload = createSearchPayload(formData, narrationData);
      const queryList = new URLSearchParams(searchPayload);
      setSearchQuery(searchPayload);

      const data = await fetchAppData(`${APP_PROD_API.GET_BASE_DATA_CASH_VOUCHER}?form_status=${formStatus}&${queryList}`);

      setupQueryData(data, "Query");
      handleOperation("Query");

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  
  // //console.log("Cash VoucherN:: ", { formStatus, formData, gstEntry, narrationData, hasSameNarrationText });
  // //console.log("FormData:: ", JSON.stringify(formData), { formStatus });
  // //console.log("[Update] FormData:: ", JSON.stringify(updateFormData));
  // //console.log(
  //   "[Update] Narration Data:: ",
  //   JSON.stringify(updateNarrationData)
  // );
  // //console.log("NarrationData:: ", JSON.stringify(narrationData));

  // Voucher Authorization logic
  const handleAuthVch = async()=>{
    // //console.log('data need to be authorize',formData?.ref_id)
    const {ref_id, memo_vchr, posted, cancel, trans_type, section, pay_rec, reference_dt} = formData;
    const {id} = user


    if(memo_vchr === 'Y'){
      alert('Memorandom Voucher cannot be Authorise')
      return
    }
    if(cancel === 'Y'){
      alert('Voucher is Cancelled, cannot Post Voucher.')
      return
    }
    if(posted === 'Y'){
      alert('Voucher has been already Posted, no modifications possible.')
      return
    }


    if(formData?.posted === 'N'){
      if(confirm('Do you want to Post this Cash Voucher? ')){
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_CASH_VCH
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vchrData: {ref_id, id, posted: 'Y', division_id:user?.global_division_id,
                 trans_year:user?.global_fin_year, trans_type, section, pay_rec, ref_date:reference_dt },
            }),
            credentials:'include',
          }
        );
        if(response.ok){
          const result = await response.json();
          toast.success(result?.message)
          setFormData(prev =>({...prev,
            posted:'Y',
            voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            voucher_no: result?.voucher_no,
          }))
        }else{
          const result = await response.json();
          toast.error(result?.message)
        }

      }
    }
  }

  // Voucher Cancellation logic
  const handleCancelVch = async () => {
    let { ref_id, memo_vchr, posted, cancel } = formData;
    const { id } = user;
  
    if (posted === 'Y') {
      alert('This Cash Voucher is already posted, no modifications possible.');
      return;
    }
  
    let newCancelValue = cancel;
  
    if (cancel === 'Y') {
      const confirmRevert = confirm('Voucher already cancelled. Do you want to revert the cancelled Cash Voucher?');
      if (confirmRevert) {
        newCancelValue = 'N';
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm('Do you really want to cancel this Cash Voucher?');
      if (confirmCancel) {
        newCancelValue = 'Y';
      } else {
        return; // don't proceed if user says no
      }
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCELLATION_CASH_VCH}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vchrData: { ref_id, id, cancel: newCancelValue },
          }),
          credentials:'include',
        }
      );
  
      if (response.ok) {
        const result = await response.json();
        toast.success(result?.message || "Voucher updated successfully.");
        setFormData(prev => ({ ...prev, cancel: newCancelValue }));
      } else {
        toast.error("Failed to update voucher status.");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("An error occurred while updating the voucher.");
    }
  };
  

  return (
    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={tabs}
        updateActiveTab={updateActiveTab}
        formStatus={formStatus}
        currentRecordNo={currentRecordNo}
        totalRecordCount={totalRecordCount}
        pageCount={1}
        totalPageCount={1}
        isSingleQuery={true}
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        handleOffset={handleOffset}
        handleSearch={handleSearch}
        handlePrint={()=>getCashVchReport(formData, formStatus)}
        QUERY_API={APP_PROD_API.GET_BASE_DATA_CASH_VOUCHER}
        handleAuthRecord={handleAuthVch}
        formName={"CASH_VOUCHER_FORM"}
        formPayload={{ searchQuery,}}
        authority={{
          insert: 'Y',
          update: formData?.posted === 'Y' || formData?.cancel === 'Y' ? 'N' : 'Y',
          message:
            formData?.posted === 'Y'
              ? 'Voucher has been already Posted, no modifications possible.'
              : formData?.cancel === 'Y'
              ? 'Voucher has been Cancelled, no modifications possible.'
              : '',
        }}
        
        isQueryReqOnInsertBtn={true} // here dev uses this parameter for bring initial dropdown data whic should be not allowed
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <CashHeader
              formStatus={formStatus}
              formData={formData}
              handleChange={handleChange}
              dataset={dataset}
              gstEntry={gstEntry}
              setGSTEntry={setGSTEntry}
              isPayRecDisabled={isPayRecDisabled}
            />
            <CashDetail
              apiData={narrationAPIData}
              apiAccData={billMeta || {}}
              masterData={formData}
              formData={narrationData}
              formStatus={formStatus}
              handleChange={handleNarrationChange}
              triggerNarrationAddRow={triggerNarrationAddRow}
              triggerRowDelete={triggerRowDelete}
              triggerSameNarration={() => {setHasSameNarrationText(true)}}
              handleCancelVch={handleCancelVch}
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
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default CashVoucher;
