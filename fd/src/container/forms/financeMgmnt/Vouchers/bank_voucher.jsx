import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import BankVoucherHeader from "./bank_voucher_header";
import {
  bankVoucherDetailsData,
  bankVoucherInitialData,
  bankVoucherLoanInitData,
  calcTransAmt,
  createSearchPayloadForBVSpecificSearch,
  fetchNarrationData,
  genBillNo,
  getBnkVchReport,
  isValidDateForFinancialYear,
  runBankVoucherSubmitValidations,
  transformApiToFormData,
  transformApiToNarrationFormData,
  triggerFetchBillMeta,
  triggerFetchCurrencyData,
  validateBankHeader,
} from "./bank_voucher_helper";
import BankVoucherDetails from "./bank_voucher_details";
import { APP_PROD_API } from "../../../../utils/api";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import toast from "react-hot-toast";
import _ from "lodash";
import { validateForm } from "../../../../utils/fn";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

const BankVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...bankVoucherInitialData});

  const [narrationData, setNarrationData] = useState([{}]);
  const [narrationAPIData, setNarrationAPIData] = useState({});
  const [hasSameNarrationText, setHasSameNarrationText] = useState(false);
  const [billMeta, setBillMeta] = useState({});

  const [newInsertId, setNewInsertId] = useState(Date.now())

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  // Added fields
  const [updateFormData, setUpdateFormData] = useState({});
  const [updateNarrationData, setUpdateNarrationData] = useState([{}]);

  const [dataset, setDataset] = useState({});
  const [deletedNarrationRows, setDeletedNarrationRows] = useState([]);

  const [isPayRecDisabled, setIsPayRecDisabled] = useState(false);

  const [formControlData, setFormControlData] = useState({});

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [parameterData, setParameterData] = useState({chq_print:'N'})

  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const tabs = [];

  const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

  // SETTING USER INSERT logic
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_BANK_VOUCHER_LIST_DATA
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}&appUserId=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setDataset((prev) => {
            return { ...prev, ...data };
          });

          // todo: may be it whould only need in formStatus Insert so Check it in when you do Query work
          if (formStatus == "Insert") {
            setFormData((prev) => {
              return {
                ...prev,
                voucher_dt: new Date().toISOString().split("T")[0],
                section: data?.section[0]?.section_id,
                division_id: data?.division[0]?.division_id,
                trans_year: user?.global_fin_year || "2017",
                curr_code: data?.currencyExchangeData[0]?.currency_code,
                exchang_rt: data?.currencyExchangeData[0]?.exchange_rate,
                pay_rec: "0",
              };
            });
          }
        }
      } catch (err) {
        //console.log(err);
      }
    };

    if (formStatus == "Insert") {
      fetchConstantList();
      fetchNarrationData((data) => {
        setNarrationAPIData(data);
      }, user?.global_fin_year, user?.global_division_id, user?.id, formData?.on_acc || 'N');
    }
  }, [formStatus, newInsertId]);

  const preloadConfigurationOnFieldChange = async (key, value = "") => {
    let obj = {};
    if (key === "division" && value) {
      let hasCurrencyData = dataset?.currencyExchangeData?.length;
      if (hasCurrencyData > 0) {
        let { currency_code, exchange_rate } =
          dataset?.currencyExchangeData?.[0];
        obj = {
          cur_code: currency_code,
          exchange_rate: parseFloat(exchange_rate).toFixed(3),
          division: dataset?.division[0]?.division_id,
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

  //console.log("formData outside:", formData);
   const runNarrationValidations = (key, value, rowIndex) => {
    let masterKeys = ["section", "division_id", "curr_code", "exchang_rt", 'chq_no', 'chq_dt', 'acct_type'];

    setIsPayRecDisabled(true);

    const allKeysPresent = masterKeys.every((key) => key in formData);

    const allValuesValid = masterKeys.every((key) => {
      const value = formData[key];
      //console.log(key, formData[key]);
      return value !== undefined && value !== null && value !== "";
    });

    if (!allKeysPresent || !allValuesValid) {
      validateBankHeader()
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
      // TODO : COMMENTED THIS DOUPLICATE ACCOUNT NO ENTRY CHECK
      // if (narrationData?.length > 1) {
      //   let isExisting = _.findIndex(
      //     narrationData,
      //     (e, ind) => e.acc_no?.trim() === value?.trim() && ind != rowIndex
      //   );
      //   if (isExisting > -1) {
      //     throw new Error(`Please select different account number`);
      //   }
      // }
    }else if(key == 'prof_no' && value){
          throw new Error(
          "Invalid Performa Invoice Number, please select correct Invoice no. from Help List"
        );
    }
    //  else if (key === "amount" || key === "total_Amt") {
    //   if (isNaN(value)) {
    //     throw new Error("Enter valid amount");
    //   }
    // }
    return true;
  };

  const triggerAmountUpdate = (latestData) => {
    //console.log('latestData', latestData)
    
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
  // const handleNarrationUpdateChange = (
  //   index,
  //   key,
  //   value,
  //   currFormState = [],
  //   additionalObj = {}
  // ) => {
  //   if (currFormState?.[index]?.voucher_id) {
  //     const currRow = currFormState?.[index];
  //     setUpdateNarrationData((prev) => {
  //       let latestData = prev.map((row, indice) =>
  //         indice === index
  //           ? {
  //               ...row,
  //               [key]: value,
  //               ...additionalObj,
  //               voucher_id: currRow?.voucher_id,
  //               srl_no: currRow?.srl_no,
  //             }
  //           : row
  //       );
  //       return latestData;
  //     });
  //   } else {
  //     setUpdateNarrationData((prev) => {
  //       let latestData = prev.map((row, indice) =>
  //         indice === index
  //           ? { ...currFormState[index], [key]: value, ...additionalObj }
  //           : row
  //       );
  //       return latestData;
  //     });
  //   }r
  // };

  const handleNarrationUpdateChange = (
  index,
  key,
  value,
  currFormState = [],
  additionalObj = {}
) => {
  const currRow = currFormState?.[index];

  setUpdateNarrationData((prev) => {
    const updated = [...prev];

    // Ensure the array has this index
    if (!updated[index]) {
      updated[index] = {};
    }

    if (currRow?.voucher_id) {
      updated[index] = {
        ...updated[index],
        [key]: value,
        ...additionalObj,
        voucher_id: currRow?.voucher_id,
        srl_no: currRow?.srl_no,
      };
    } else {
      updated[index] = {
        ...currFormState[index],
        [key]: value,
        ...additionalObj,
      };
    }

    return updated;
  });
};

  // Added update logic
  const handleChange = async (key, value, e) => {
    if(!['Insert', 'Update', 'Search'].includes(formStatus)){
      return;
    }

    const cursorPosition = e?.target?.selectionStart;

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

    // Restore cursor position
    if (
      e?.target &&
      e.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(e.target.type)
    ) {
      setTimeout(() => {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  // bank Detail entry tabular feild handle change 
  const handleNarrationChange = (key, value, index, event) => {
    if(!['Insert', 'Update','Search'].includes(formStatus)){
      return;
    }
    try {

      // //console.log(formData, narrationData);

      runNarrationValidations(key, value, index);
      let additionalObj = preloadNarrationConfigurationOnFieldChange(
        key,
        value
      );
      
      let parityValue = value;

      if(key == "acc_no" && value) {
        triggerFetchBillMeta({ acc_no: value, division_id: 1, trans_year:formData?.trans_year, ...formData }, (data) => {
          if (data?.isChequeNoExist == true) {
            if (confirm(`This Cheque No available in some other transaction of this Party. Cannot proceed further. Do You Want to Continue ?`)) {
              // todo :: stop the user to move in other field if user do cancel
              return;
            }
          }

          if (data?.isControlledAccount === true) {
            setNarrationData((prev) => {
              const newData = [...prev];
              newData[index] = {
                ...newData[index],
                chq_in_favour: data?.chq_in_favour || '',
                
              };
              return newData;
            });
          }
            setFormData(prev=>({...prev, bank_trnf_flg:data?.bankTransfer }))
            setBillMeta({ ...billMeta, [value]: data });
        });
      }

      //original code before changes by amit
      // if (key === "db_cr") {
      //   let val = value?.split("#");
      //   parityValue = val[0];
      //   let amtValue = parseInt(val?.[1]);
      //   let actualValue = formData?.pay_rec === "P" ? "D" : "C";
      //   if (parityValue === actualValue) {
      //     additionalObj.amount = Math.abs(amtValue);
      //   }
      // }


      // if (key === "db_cr") {
      //   let val = value
      //   parityValue = val[0];
      //   let amtValue = parseInt(val?.[1]);
      //   let actualValue = formData?.pay_rec === "P" ? "D" : "C";
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

  // Added logic for update
  async function handleSubmit(e) {
    e.preventDefault();

    const isValidFormData = validateForm("bank-head-form", "Bank Voucher Header Form");
    if (!isValidFormData) {
      toast.error("Please fill required header data first");
      return;
    }

    const isValidNarration = validateForm("bank-detail-form", "Bank Voucher Detail Form");
    if (!isValidNarration) {
      return;
    }

    // //console.log("Form submitted:: ", { formStatus });

    // if on_acc is checked 
    // genBillNo({on_acc:formData?.on_acc, formData}, setNarrationData)


    let twikFormData = { ...formData };
    try {
      runBankVoucherSubmitValidations(formData, narrationData);
      if (formStatus === "Update") {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.POST_BANK_VOUCHER_DATA
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              masterData: {
                ...updateFormData,
                voucher_id: formData?.voucher_id,
                acct_type: formData?.acct_type
              },
              narrationData: updateNarrationData,
              deletedNarrationRows,
            }),
            credentials:'include',
          }
        );
        const responseData = await response.json();
        if (response.ok) {
          toast.success("Record saved successfully");
        }

        handleCancel()
        //console.log("[Updated]:: ", responseData);
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.POST_BANK_VOUCHER_DATA
          }`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ masterData: twikFormData, narrationData }),
            credentials:'include',

          }
        );
        if (response.ok) {
          const responseData = await response.json();
          //console.log(responseData)
          showGeneratedVouhcerNo(responseData?.gen_voucher_no)

          toast.success("Record saved successfully");
          setFormData({
            division: "",
            voucher_dt: "",
            voucher_no: "",
          });
          setUpdateFormData({});
          setNarrationData([{}]);
          setUpdateNarrationData([{}]);
          setIsPayRecDisabled(false);
          setNewInsertId(Date.now())
          setFocusedRowIndex(0)
        } else {
          const responseData = await response.json();
          throw Error(responseData?.message);
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
    setHasSameNarrationText(false);
    setBillMeta({});
    setDeletedNarrationRows([]);
    setIsPayRecDisabled(false);
    setFocusedRowIndex(0)
    // Added
    setUpdateFormData({});
    setUpdateNarrationData([{}]);
  }, []);


  const triggerNarrationAddRow = useCallback(() => {
    try {
      let lastRow = narrationData[narrationData.length - 1];
      let keys = ["acc_no", "amount", "db_cr"];
      const allKeysPresent = keys.every((key) => key in lastRow);
      const allValuesValid = keys.every((key) => {
        const value = lastRow[key];
        return value !== undefined && value !== null && value !== "";
      });

      if (allKeysPresent && allValuesValid) {
        setNarrationData((prev) => [
          ...prev,
          { naration: narrationData?.[0]?.naration || "", chq_no:formData?.chq_no || '', chq_dt:formData?.chq_dt || ''},
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
          genBillNo({on_acc:formData?.on_acc, formData}, setNarrationData)
          setFocusedRowIndex(focusedRowIndex + 1)
      } else {
        throw new Error("Please fill all the  required fields to add another row");
      }
    } catch (error) {
      toast.error(error?.message || "Some error occurred, please try again");
    }
  }, [hasSameNarrationText, narrationData, formData?.on_acc]);

  
  const triggerRowDelete = useCallback((rowIndex) => {
    setNarrationData((prevData) => {
      const newData = [...prevData];

      if (newData[rowIndex]?.srl_no) {
        setDeletedNarrationRows((del) => [...del, newData[rowIndex].srl_no]);
      }

      newData.splice(rowIndex, 1);
      triggerAmountUpdate(newData);
      // genBillNo({on_acc:formData?.on_acc, formData}, setNarrationData)
      return newData;
    });
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log({ queryData, btnClicked });
      if (btnClicked === "Insert") {
        // Added
        setFormData({
          division_id: "",
          pay_rec: "B1",
        });
        setNarrationData([{}]);
        setUpdateFormData({});
        setUpdateNarrationData([{}]);
        setDeletedNarrationRows([]);
      }
      if (["Query", "Last", "Next", "Prev", "First"].includes(btnClicked)) {
           if (btnClicked == "Query") {
              if(queryData?.count == 0){
                toast.error('No Bank voucher record found')
                handleCancel()
                return;
              }
              setTotalRecordCount(queryData?.count);
           }
        setFormData(
          transformApiToFormData(
            queryData?.thfmbankData || {},
            queryData?.tdfmbankData || []
          )
        );
        setNarrationData(
          transformApiToNarrationFormData(queryData?.tdfmbankData || [])
        );
        // setTotalRecordCount(queryData?.count);
        // setCurrentRecordNo(queryData?.current);
      }
   
      setDataset(queryData);
      fetchNarrationData((data) => {
        setNarrationAPIData(data);
      }, user?.global_fin_year, user?.global_division_id, user?.id, queryData?.thfmbankData?.on_acc || 'N');
    },
    [formStatus, currentRecordNo]
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_BANK_VOUCHER_DATA}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        return;
      }
      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  // Voucher Authorization logic
  const handleAuthVch = async () => {
    // //console.log('data need to be authorize',formData?.ref_id)
    const {
      voucher_id,
      memo_vchr,
      posted,
      cancel,
      trans_type,
      section,
      pay_rec,
      voucher_no,
    } = formData;
    const { id } = user;

    if (memo_vchr === "Y") {
      alert("Memorandom Voucher cannot be Authorise");
      return;
    }


    // need to call this database function proc_user_post_valid as in EDDAL it is not applicable said by pm sir 14.05.2025
    // updation_in_outstanding not in use as per disscuss with pm sir

    if (cancel === "Y") {
      alert("Voucher is Cancelled, cannot Post Voucher.");
      return;
    }
    if (posted === "Y") {
      alert("Voucher has been already Posted, no modifications possible.");
      return;
    }

    if (formData?.posted === "N") {
      if (confirm("Are you sure to Authorise this Bank Voucher ? ")) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_BANK_VCH
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vchrData: {
                id,
                voucher_id,
                posted: "Y",
                division_id: user?.global_division_id,
                trans_year: user?.global_fin_year,
                trans_type,
                section,
                pay_rec,
                voucher_no
              },
            }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message);
          setFormData((prev) => ({
            ...prev,
            posted: "Y",
            // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat(
            //   "yyyy-MM-dd"
            // ),
            // voucher_no: result?.voucher_no,
          }));
        } else {
          const result = await response.json();
          toast.error(result?.message);
        }
      }
    }
  };

  // Voucher Cancellation logic
  const handleCancelVch = async () => {
    let { voucher_id, posted, cancel } = formData;
    const { id } = user;

    if (posted === "Y") {
      alert("This Bank Voucher is already posted, no modifications possible.");
      return;
    }

    let newCancelValue = cancel;

    if (cancel === "Y") {
      const confirmRevert = confirm(
        "Voucher already cancelled. Do you want to revert the cancelled Bank Voucher?"
      );
      if (confirmRevert) {
        newCancelValue = "N";
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm(
        "Do you really want to cancel this Bank Voucher?"
      );
      if (confirmCancel) {
        newCancelValue = "Y";
      } else {
        return; // don't proceed if user says no
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.CANCELLATION_BANK_VCH
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vchrData: { voucher_id, id, cancel: newCancelValue },
          }),
          credentials:'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(result?.message || "Voucher updated successfully.");
        setFormData((prev) => ({ ...prev, cancel: newCancelValue }));
      } else {
        toast.error("Failed to update voucher status.");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("An error occurred while updating the voucher.");
    }
  };


  const onSuccessConfirmation = useCallback(
    (confirm, vch_no) => {
        if(confirm && vch_no){
          //console.log('generated_voucher_no is :', vch_no)
        }
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formData]
  );

  const showGeneratedVouhcerNo = useCallback((vch_no)=>{
    setConfirmationConfig({
      title: "Voucher No. generated",
      description:`New Bank voucher no generated is ${vch_no}`,
      uniqKey: "vch_no",
    });
    setConfirmationModal(true);
  },[])

  //console.log("formData :: ", formData);
  //console.log("narrationData :: ", narrationData);
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
        handlePrint={()=>getBnkVchReport(formData, formStatus)}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_BANK_VOUCHER_DATA}
        formName={"Bank Voucher"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        handleAuthRecord={handleAuthVch}
        opterationBtn={[
          {
            name:
              formData.cancel === "Y"
                ? "Revert Cancellation"
                : "Cancel Voucher",
            onClick: () => handleCancelVch(),
            disabled: !['Query'].includes(formStatus)
          },
          // {
          //   name: "Adjust Advances",
          //   onClick: () => //console.log("Adjust Advances clicked"),
          // },
        ]}
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
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <BankVoucherHeader
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              dataset={dataset}
              isPayRecDisabled={isPayRecDisabled}
              setNarrationData={setNarrationData}
              parameterData={parameterData}
            />
            <BankVoucherDetails
              formStatus={formStatus}
              apiData={narrationAPIData}
              apiAccData={billMeta || {}}
              dataset={dataset}
              setNarrationData={setNarrationData}
              masterData={formData}
              formData={narrationData}
              handleChange={(name, value, index, event) =>
                handleNarrationChange(name, value, index, event)
              }
              triggerNarrationAddRow={triggerNarrationAddRow}
              triggerRowDelete={triggerRowDelete}
              triggerSameNarration={() => {
                setHasSameNarrationText(true);
              }}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              setUpdateNarrationData={setUpdateNarrationData}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal}
          onClose={() => {
            onSuccessConfirmation(false, confirmationConfig);
            setConfirmationModal(false);
          }}
          {...confirmationConfig}
          onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
        />
      )}
    </React.Fragment>
  );
};

export default BankVoucher;
