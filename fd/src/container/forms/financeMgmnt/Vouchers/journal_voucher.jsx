import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import JournalVoucherHeader from "./journal_voucher_header";
import JournalVoucherDetails from "./journal_voucher_details";

import {
  calculateDbCrTotals,
  calculateNetAmt,
  calculateNetDbAmt,
  createSearchPayloadForJVSpecificSearch,
  getJrlVchReport,
  JVDetailsInitData,
  JVHeaderInitData,
  JVTempInitData,
  parameterData,
  transformApiToFormData,
  transformApiToNarrationFormData,
} from "./journal_voucher_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import toast from "react-hot-toast";


import { checkDateNotGreaterThanToday, checkDateEqToToday, checkDateNotLessThan } from "./journal_voucher_helper";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useLocation } from "react-router-dom";


const JournalVoucher = () => {
  // FormStatus Hook
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({ ...JVHeaderInitData });
  const [narrationData, setNarrationData] = useState([
    { ...JVDetailsInitData },
  ]);
  const [parameter, setParameter] = useState({ ...parameterData });

  // const [totalDbCrData, setTotalDbCrData] = useState ({...JVTempInitData})
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // Updated Form Data
  const [updateFormData, setUpdateFormData] = useState({});
  const [updateNarrationData, setUpdateNarrationData] = useState([]);

  const [dataset, setDataset] = useState({});
  const [deletedNarrationRows, setDeletedNarrationRows] = useState([]);

  //Dropdown Data
  const [sections, setSections] = useState([]);
  const [purpose, setPurpose] = useState([]);

  // for help list
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);
  const [paginationPage, setPaginationPage] = useState(1);
  const tabs = [];

  const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);

  const docNo = params.get("doc_no");
  const fromTracker = params.get("fromTracker");

  const cameFromTracker = sessionStorage.getItem("fromTrackerNav");

  if (fromTracker === "true" && docNo && cameFromTracker === "true") {

    sessionStorage.removeItem("fromTrackerNav");

    setFormData(prev => ({
      ...prev,
      voucher_no: docNo, 
    }));

    setFormStatus("Search"); 
  }

}, []);

// const autoQueryFromTracker = (docNo) => {
//   setFormData(prev => ({
//     ...prev,
//     voucher_no: docNo,
//   }));

//   setSearchQuery({ voucher_no: docNo });

//   handleOperation("Search");
// };


// useEffect(() => {
//   if (formStatus === "Search" && formData?.voucher_no) {
//     handleSearch();
//   }
// }, [formStatus, formData.voucher_no]);


console.log("formData", formData);


  const runValidations = (key, value) => {
    try {
      if (["voucher_dt"].includes(key)) {
        checkDateNotGreaterThanToday(key, value);
      }
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_JOURNAL_VOUCHER_LIST_DATA
          }?formStatus=${formStatus}`,
          { credentials: "include" },
        );

        if (response.status === 200) {
          const data = await response.json();

          setSections([
            { value: "", label: "" },
            ...formatOptions(data.section || [], "section_id", "section_desc"),
          ]);

          setPurpose([
            { value: "", label: "" },
            ...formatOptions(data.purposes || [], "code", "description"),
          ]);

          // setRegisters([{ value: "", label: "" }, ...formatOptions(data.register || [], "register_type", "register_type")])

          if (formStatus == "Insert") {
            setFormData((prev) => ({
              ...prev,
              section: data?.section[0]?.section_id,
              prev_year_chln: data?.prev_year_chln,
              ...data?.currencyExchangeData,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };

    if (formStatus) {
      fetchConstantList(); //todo need to reduce calling unnecessary
    }

    // pre-insert logic
    if (formStatus == "Insert") {
      let prevInsertData = {
        trans_year: user?.global_fin_year,
        division_id: user?.global_division_id,
        trans_type: "J1",
        cancel: "N",
        posted: "N",
      };

      setFormData((prev) => ({
        ...prev,
        ...prevInsertData,
      }));
    }
  }, [formStatus]);


  const handleHelpList = (data) => {
    setHelpList(data);
  };


  // const onSelectHelpItem = (data) => {
  //   setNarrationData((prev) => {
  //     const updated = [...prev];
  //     if (focusedRowIndex === null) return prev;

  //     switch (helpFor) {
  //       case "acc":
  //         updated[focusedRowIndex] = {
  //           ...updated[focusedRowIndex],
  //           acc_no: data.acc_no,
  //           acc_desc: data.acc_desc,
  //         };
  //         break;

  //       case "bill":
  //         updated[focusedRowIndex] = {
  //           ...updated[focusedRowIndex],
  //           bill_no: data.bill_no,
  //         };
  //         break;

  //       case "cost":
  //         updated[focusedRowIndex] = {
  //           ...updated[focusedRowIndex],
  //           cost: data.prefix,
  //           cost_desc: data.description,
  //           cost_centr:data?.code
  //         };
  //         break;

  //       case "emp":
  //         updated[focusedRowIndex] = {
  //           ...updated[focusedRowIndex],
  //           emp_name: data.emp_name,
  //           emp_cd: data.emp_cd,
  //         };
  //         break;

  //       case "vendor":
  //         updated[focusedRowIndex] = {
  //           ...updated[focusedRowIndex],
  //           ser_party_cd: data.v_code,
  //           party_desc: data.v_name,
  //         };
  //         break;

  //       default:
  //         return prev;
  //     }

  //     return updated;

  //   }
  // );


  const onSelectHelpItem = (data) => {
    setNarrationData((prev) => {
      const updated = [...prev];
      if (focusedRowIndex === null) return prev;

      const row = updated[focusedRowIndex]; // Cache for reuse

      switch (helpFor) {
        case "acc":
          updated[focusedRowIndex] = {
            ...row,
            acc_no: data.acc_no,
            acc_desc: data.acc_desc,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "acc_no",
            data.acc_no,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "acc_desc",
            data.acc_desc,
            updated,
          );
          break;

        case "bill":
          updated[focusedRowIndex] = {
            ...row,
            bill_no: data.bill_no,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "bill_no",
            data.bill_no,
            updated,
          );
          break;

        case "cost":
          updated[focusedRowIndex] = {
            ...row,
            cost: data.prefix,
            cost_desc: data.description,
            cost_centr: data?.code,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "cost",
            data.prefix,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "cost_desc",
            data.description,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "cost_centr",
            data.code,
            updated,
          );
          break;
        case "pur_code":
          updated[focusedRowIndex] = {
            ...row,
            pur_code: data.code,
            pur_desc: data.description,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "pur_code",
            data.code,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "pur_desc",
            data.description,
            updated,
          );
          break;

        case "emp":
          updated[focusedRowIndex] = {
            ...row,
            emp_name: data.emp_name,
            emp_cd: data.emp_cd,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "emp_name",
            data.emp_name,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "emp_cd",
            data.emp_cd,
            updated,
          );
          break;

        case "vendor":
          updated[focusedRowIndex] = {
            ...row,
            ser_party_cd: data.v_code,
            party_desc: data.v_name,
          };
          handleNarrationUpdateChange(
            focusedRowIndex,
            "ser_party_cd",
            data.v_code,
            updated,
          );
          handleNarrationUpdateChange(
            focusedRowIndex,
            "party_desc",
            data.v_name,
            updated,
          );
          break;

        default:
          return prev;
      }

      return updated;
    });

    setHelpList(false);
  };

  //   setHelpList(false); // close modal after selection (optional)
  // };

  // SUBMIT LOGIC
  async function handleSubmit(e) {
    e.preventDefault();

    const isValidFormData = validateForm(
      "journal-voucher-header-form",
      "Journal Voucher Header Form",
    );

    if (!isValidFormData) {
      toast.error("Please fill required header data first");
      return;
    }

    const isValidNarration = validateForm(
      "journal-voucher-detail-form",
      "Journal Voucher Detail Form",
    );

    if (!isValidNarration) {
      toast.error("please fill requried details data");
      return;
    }

    //checking net amt is 0

    // let isNetAmtZero = calculateNetAmt(narrationData);

    // // const isNetAmtZero = formData?.net_amt;
    // // //console.log('isNetAmtZero :: ', isNetAmtZero, formData)
    // if (isNetAmtZero != 0) {
    //   toast.error("Debit /Credit totals do not match.");
    //   return;
    // }

const dbTotal = Number(formData?.db_total || 0);
const crTotal = Number(formData?.cr_total || 0);

const dbTotalRounded = Number(dbTotal.toFixed(2));
const crTotalRounded = Number(crTotal.toFixed(2));

if (dbTotalRounded !== crTotalRounded) {
  toast.error("Debit /Credit totals do not match.");
  return;
}

    //calculate trans amount
    const transAmt = calculateNetDbAmt(narrationData);

    //console.log("Form submitted:: ", { formStatus });

    let twikFormData = {...formData, trans_amt: Number(transAmt)};

    try {
      // runCashVoucherSubmitValidations(formData, narrationData);
      if (formStatus === "Update") {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.POST_JOURNAL_VOUCHER_DATA
          }`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              masterData: {
                ...updateFormData,
                voucher_id: formData?.voucher_id,
                trans_amt: parseFloat(transAmt),
              },
              narrationData: updateNarrationData,
              deletedNarrationRows,
            }),
            // credentials: "include",
          },
        );

        const responseData = await response.json();
        if (response.ok) {
          toast.success("Record saved successfully");

          setFormData({ ...JVHeaderInitData });
          setUpdateFormData({});
          setNarrationData([{ ...JVDetailsInitData }]);
          setUpdateNarrationData([{}]);
          releaseFormStatus();
        }

        //console.log("[Updated]:: ", responseData);
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.POST_JOURNAL_VOUCHER_DATA
          }`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ masterData: twikFormData, narrationData }),
            credentials: "include",
          },
        );
        if (response.ok) {
          const responseData = await response.json();
          toast.success(
            `Record saved successfully with new Generated Voucher No. ${responseData?.newVoucher}`,
          );
          setFormData({ ...JVHeaderInitData });
          setUpdateFormData({});
          setNarrationData([{ ...JVDetailsInitData }]);
          setUpdateNarrationData([{}]);
          releaseFormStatus();

          setTimeout(() => {
            handleOperation("Insert");
          }, 0);

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


  const handleAuthVch = async () => {
    //console.log("authorization clicked");
    // //console.log('data need to be authorize',formData?.ref_id)
    const { memo_vchr, posted, cancel, voucher_id } = formData;
    const { id } = user;

    if (memo_vchr === "Y") {
      toast.error("Memorandom Voucher cannot be Authorise");
      return;
    }
    if (cancel === "Y") {
      toast.error(" You cannot Post a Cancelled Voucher.");
      return;
    }
    if (posted === "Y") {
      toast.error(
        " This Voucher is already Posted!, you cannot make any changes. ",
      );
      return;
    }

    if (formData?.posted === "N") {
      if (confirm(" Are you sure you wish to Authorise this Voucher ? ")) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_JOURNAL_VCH
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vchrData: {
                voucher_id,
                id,
                posted,
                division_id: user?.global_division_id,
                trans_year: user?.global_fin_year,
              },
            }),
          },
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message);
          setFormData((prev) => ({
            ...prev,
            posted: "Y",
            //voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            //voucher_no: result?.voucher_no,
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
      alert(
        "This Voucher has been already Posted. You cannot make any changes.",
      );
      return;
    }

    let newCancelValue = cancel;

    if (cancel === "Y" && posted === "N") {
      const confirmRevert = confirm(
        " Do you really want to revert the Cancelled Voucher ? ",
      );
      if (confirmRevert) {
        newCancelValue = "N";
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm(
        "Do you really want to cancel this Journal Voucher?",
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
          APP_PROD_API.CANCELLATION_JOURNAL_VCH
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vchrData: { voucher_id, id, cancel: newCancelValue },
          }),
        },
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

  // Voucher Authorization logic

  // const handleAuthVch = async () => {
  //     // //console.log('data need to be authorize',formData?.ref_id)
  //     const {
  //       voucher_id,
  //       memo_vchr,
  //       posted,
  //       cancel,
  //       trans_type,
  //       section,
  //       pay_rec,
  //       voucher_no,
  //     } = formData;
  //     const { id } = user;

  //     if (memo_vchr === "Y") {
  //       alert("Memorandom Voucher cannot be Authorise");
  //       return;
  //     }

  //     // need to call this database function proc_user_post_valid as in EDDAL it is not applicable said by pm sir 14.05.2025
  //     // updation_in_outstanding not in use as per disscuss with pm sir

  //     if (cancel === "Y") {
  //       alert("Voucher is Cancelled, cannot Post Voucher.");
  //       return;
  //     }
  //     if (posted === "Y") {
  //       alert("Voucher has been already Posted, no modifications possible.");
  //       return;
  //     }

  //     if (formData?.posted === "N") {
  //       if (confirm("Are you sure to Authorise this Bank Voucher ? ")) {
  //         const response = await fetch(
  //           `${import.meta.env.VITE_BASE_API_URL}${
  //             APP_PROD_API.AUTHORIZED_JOURNAL_VCH
  //           }`,
  //           {
  //             method: "PUT",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               vchrData: {
  //                 id,
  //                 voucher_id,
  //                 posted: "Y",
  //                 division_id: user?.global_division_id,
  //                 trans_year: user?.global_fin_year,
  //                 trans_type,
  //                 section,
  //                 pay_rec,
  //                 voucher_no
  //               },
  //             }),
  //           }
  //         );
  //         if (response.ok) {
  //           const result = await response.json();
  //           toast.success(result?.message);
  //           setFormData((prev) => ({
  //             ...prev,
  //             posted: "Y",
  //             // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat(
  //             //   "yyyy-MM-dd"
  //             // ),
  //             // voucher_no: result?.voucher_no,
  //           }));
  //         } else {
  //           const result = await response.json();
  //           toast.error(result?.message);
  //         }
  //       }
  //     }
  //   };

  //   // Voucher Cancellation logic
  //   const handleCancelVch = async () => {
  //     let { voucher_id, posted, cancel } = formData;
  //     const { id } = user;

  //     if (posted === "Y") {
  //       alert("This Bank Voucher is already posted, no modifications possible.");
  //       return;
  //     }

  //     let newCancelValue = cancel;

  //     if (cancel === "Y") {
  //       const confirmRevert = confirm(
  //         "Voucher already cancelled. Do you want to revert the cancelled Bank Voucher?"
  //       );
  //       if (confirmRevert) {
  //         newCancelValue = "N";
  //       } else {
  //         return; // don't proceed if user says no
  //       }
  //     } else {
  //       const confirmCancel = confirm(
  //         "Do you really want to cancel this Cash Voucher?"
  //       );
  //       if (confirmCancel) {
  //         newCancelValue = "Y";
  //       } else {
  //         return; // don't proceed if user says no
  //       }
  //     }

  //     try {
  //       const response = await fetch(
  //         `${import.meta.env.VITE_BASE_API_URL}${
  //           APP_PROD_API.CANCELLATION_BANK_VCH
  //         }`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             vchrData: { voucher_id, id, cancel: newCancelValue },
  //           }),
  //         }
  //       );

  //       if (response.ok) {
  //         const result = await response.json();
  //         toast.success(result?.message || "Voucher updated successfully.");
  //         setFormData((prev) => ({ ...prev, cancel: newCancelValue }));
  //       } else {
  //         toast.error("Failed to update voucher status.");
  //       }
  //     } catch (error) {
  //       console.error("Error updating voucher:", error);
  //       toast.error("An error occurred while updating the voucher.");
  //     }
  //   };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setNarrationData([{ ...JVDetailsInitData }]);
  }, []);

  const formCleanup = () => {
    setFormData({ ...JVHeaderInitData });
    setUpdateFormData({});
    setNarrationData([{ ...JVDetailsInitData }]);
    setUpdateNarrationData([{}]);
  };

  // const runNarrationValidations = (key, value, rowIndex) => {
  //     let masterKeys = [
  //       "division_id",
  //       "voucher_dt",
  //       "section",
  //       "bill_dt",
  //       "cur_code",
  //       "exchange_rate",
  //     ];
  //     // //console.log("formData")
  //     // //console.log('formData', {...formData})

  //     const allKeysPresent = masterKeys.every((key) => key in formData);

  //     const allValuesValid = masterKeys.every((key) => {
  //       const value = formData[key];
  //       //console.log(key,formData[key])
  //       return value !== undefined && value !== null && value !== "";
  //     });

  //     // //console.log('allKeysPresent ::',allKeysPresent, allValuesValid)

  //     if (!allKeysPresent || !allValuesValid) {
  //       throw new Error("Please fill Header data first");
  //     }

  //     if (key === "acc_no" && value) {
  //       let accDetails = narrationAPIData?.accountList?.find(
  //         (e) => e.acc_no == value
  //       );
  //       if (_.isEmpty(accDetails) || !accDetails) {
  //         throw new Error(
  //           "Invalid Account Number, Please enter/select correct Acc no."
  //         );
  //       }
  //       if (narrationData?.length > 1) {
  //         let isExisting = _.findIndex(
  //           narrationData,
  //           (e, ind) => e.acc_no?.trim() === value?.trim() && ind != rowIndex
  //         );
  //         if (isExisting > -1) {
  //           throw new Error(`Please select different account number`);
  //         }
  //       }
  //     } else if (key === "amount" || key === "total_Amt") {
  //       if (isNaN(value)) {
  //         throw new Error("Enter valid amount");
  //       }
  //     }
  //     return true;
  // };

  // const handleUpdateChange = (
  //   key,
  //   value,
  // ) => {
  //   if (formStatus === "Update") {
  //     setUpdateFormData((prev) => ({
  //       ...prev,
  //       [key]: value,
  //     }));
  //   }
  // };

  // Added function
  const handleUpdateChange = (
    key,
    value,
    currFormState = {},
    additionalObj = {},
  ) => {
    if (formStatus === "Update") {
      setUpdateFormData((prev) => ({
        ...prev,
        [key]: value,
        ...additionalObj,
      }));
    }
  };

  // const handleNarrationUpdateChange = (
  //   index,
  //   key,
  //   value,
  //   currFormState = [],
  //   // additionalObj = {}
  // ) => {
  //   if (currFormState?.[index]?.voucher_id) {
  //     const currRow = currFormState?.[index];
  //     setUpdateNarrationData((prev) => {
  //       let latestData = prev.map((row, indice) =>
  //         indice === index
  //           ? {
  //               ...row,
  //               [key]: value,
  //               // ...additionalObj,
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
  //           ? { ...currFormState[index], [key]: value }
  //           : row
  //       );
  //       return latestData;
  //     });
  //   }
  // };

  // const handleNarrationUpdateChange = (
  //   index,
  //   key,
  //   value,
  //   currFormState = []
  // ) => {
  //   const currRow = currFormState?.[index];

  //   if (currRow?.voucher_id && currRow?.srl_no) {
  //     setUpdateNarrationData((prev) => {
  //       const updated = [...prev];
  //       const existingIndex = updated.findIndex(
  //         (item) =>
  //           item.voucher_id === currRow.voucher_id &&
  //           item.srl_no === currRow.srl_no
  //       );

  //       if (existingIndex !== -1) {
  //         // Update only the changed field
  //         updated[existingIndex] = {
  //           ...updated[existingIndex],
  //           [key]: value,
  //         };
  //       } else {
  //         // Insert new entry with only changed field + identifiers
  //         updated.push({
  //           voucher_id: currRow.voucher_id,
  //           srl_no: currRow.srl_no,
  //           [key]: value,
  //         });
  //       }

  //       return updated;
  //     });
  //   }
  // };

  const handleNarrationUpdateChange = (
    index,
    key,
    value,
    currFormState = [],
  ) => {
    if (formStatus != "Update") {
      return;
    }
    const currRow = currFormState?.[index];
    if (!currRow) return;

    //console.log("handleNarrationUpdateChange - currRow:", currRow);
    //console.log("Index:", index, "Key:", key, "Value:", value);

    const isExisting = currRow?.voucher_id && currRow?.srl_no;

    const identifierKey = isExisting ? "voucher" : "row";

    setUpdateNarrationData((prev) => {
      const updated = [...prev];

      const existingIndex = updated.findIndex((item) =>
        isExisting
          ? item.voucher_id === currRow.voucher_id &&
            item.srl_no === currRow.srl_no
          : item.row_id === currRow.row_id,
      );

      if (existingIndex !== -1) {
        // //console.log(
        //   `Updating existing ${identifierKey} record at index`,
        //   existingIndex
        // );
        updated[existingIndex] = {
          ...updated[existingIndex],
          [key]: value,
        };
      } else {
        //console.log(`Adding new ${identifierKey} record`);
        updated.push({
          ...(isExisting
            ? { voucher_id: currRow.voucher_id, srl_no: currRow.srl_no }
            : { row_id: currRow.row_id || Date.now() }),
          [key]: value,
        });
      }

      return updated;
    });
  };

  // const handleChange = (stateKey, name, value, index, event) => {
  //   if (!["Insert", "Update", "Search"].includes(formStatus)) {
  //     return;
  //   }
  //   if (["acc_no", "bill_no"].includes(name)) {
  //     toast.error("Please select from Helplist");
  //     return;
  //   }
  //   const cursorPosition = event?.target?.selectionStart;
  //   let newVal = typeof value === "string" ? value.toUpperCase() : value;

  //   switch (stateKey) {
  //     case "formData": {
  //       setFormData((prev) => {
  //         handleUpdateChange(name, value);
  //         return {
  //           ...prev,
  //           [name]: newVal,
  //         };
  //       });
  //       break;
  //     }

  //     case "detailData": {
  //       setNarrationData((prevData) => {
  //         const newData = [...prevData];

  //         if (["db_amount", "cr_amount"].includes(name)) {
  //           if (!narrationData[index]?.db_cr) {
  //             toast.error("please enter first d/c");
  //             return prevData;
  //           }
  //           // Recalculate party amount if amount/db_cr changed

  //           newData[index] = {
  //             ...newData[index],
  //             [name]: newVal,
  //             amount: newVal,
  //           };

  //           handleNarrationUpdateChange(index, "amount", newVal, newData);

  //           const totalAmount = calculateNetAmt(newData);

  //            const transAmt = calculateNetDbAmt(newData);
  //           //console.log(totalAmount);
  //           setFormData((prev) => {
  //             //todo also call the update handle here for udpdated trans_amt
  //             handleUpdateChange("net_amt", parseInt(totalAmount));
  //             return {
  //               ...prev,
  //               net_amt: parseInt(totalAmount),
  //               trans_amt:transAmt,
  //             };
  //           });
  //           // newData[index] = { ...newData[index], [name]: newVal, amount: newVal };
  //           return newData;
  //         }

  //         newData[index] = { ...newData[index], [name]: newVal };
  //         handleNarrationUpdateChange(index, name, newVal, newData);
  //         return newData;
  //       });
  //       break;
  //     }

  //     default:
  //       break;
  //   }

  //   // Restore cursor position
  //   if (
  //     event?.target &&
  //     event.target.tagName === "INPUT" &&
  //     !["number", "radio", "checkbox", "date"].includes(event.target.type)
  //   ) {
  //     setTimeout(() => {
  //       event.target.setSelectionRange(cursorPosition, cursorPosition);
  //     }, 0);
  //   }
  // };

  const handleChange = (stateKey, name, value, index, event) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) return;

    if (["acc_no"].includes(name)) {
      toast.error("Please select from Helplist");
      return;
    }

    const cursorPosition = event?.target?.selectionStart;
    const newVal =
      typeof value === "string" ? value.toUpperCase() : Number(value || 0);

    switch (stateKey) {
      case "formData": {
        setFormData((prev) => {
          handleUpdateChange(name, value);
          return { ...prev, [name]: newVal };
        });
        break;
      }

      case "detailData": {
        setNarrationData((prevData) => {
          const newData = [...prevData];

          /* ---------- Debit / Credit validation ---------- */
          if (["db_amount", "cr_amount"].includes(name)) {
            if (!newData[index]?.db_cr) {
              toast.error("Please enter D / C first");
              return prevData;
            }

            // Clear opposite amount before setting new one
            if (name === "db_amount") {
              newData[index] = {
                ...newData[index],
                db_amount: newVal,
                cr_amount: 0,
                amount: newVal,
              };
            } else {
              newData[index] = {
                ...newData[index],
                cr_amount: newVal,
                db_amount: 0,
                amount: newVal,
              };
            }

            handleNarrationUpdateChange(index, "amount", newVal, newData);

            // 🔹 Calculate totals from ALL rows
            // const { dbTotal, crTotal } = calculateDbCrTotals(newData);

            // const totalAmount = calculateNetAmt(newData);
            // const transAmt = calculateNetDbAmt(newData);

            // setFormData((prev) => {
            //   handleUpdateChange("net_amt", parseInt(totalAmount));
            //   return {
            //     ...prev,
            //     db_total: dbTotal,
            //     cr_total: crTotal,
            //     net_amt: parseInt(totalAmount),
            //     trans_amt: transAmt,
            //   };
            // });

            const oldDb = Number(prevData[index]?.db_amount || 0);
            const oldCr = Number(prevData[index]?.cr_amount || 0);

            setFormData((prev) => {

              let updatedDbTotal = Number(prev.db_total || 0);
              let updatedCrTotal = Number(prev.cr_total || 0);

            if (name === "db_amount") {
          updatedDbTotal = updatedDbTotal - oldDb + Number(newVal || 0);
          updatedDbTotal = Number(updatedDbTotal.toFixed(2));

        }

        if (name === "cr_amount") {
          updatedCrTotal = updatedCrTotal - oldCr + Number(newVal || 0);
          updatedCrTotal = Number(updatedCrTotal.toFixed(2));
          
        }
              return {
                ...prev,
                db_total: updatedDbTotal,
                cr_total: updatedCrTotal,
              };
            });

            // handleUpdateChange("db_total", dbTotal);
            // handleUpdateChange("cr_total", crTotal);

            return newData;
          }

          /* ---------- Other field changes ---------- */
          newData[index] = { ...newData[index], [name]: newVal };
          handleNarrationUpdateChange(index, name, newVal, newData);
          return newData;
        });
        break;
      }

      default:
        break;
    }

    /* ---------- Restore cursor ---------- */
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  // const triggerAddRow = useCallback(
  //   (stateKey) => {
  //     const isValidNarration = validateForm(
  //       "journal-voucher-detail-form",
  //       "Journal Voucher Detail Form",
  //     );
  //     if (!isValidNarration) {
  //       // toast.error("please fill requried details data");
  //       return;
  //     }

  //     setNarrationData((prev) => [
  //       ...prev,
  //       { ...JVDetailsInitData, row_id: Date.now() },
  //     ]);

  //     // else if (stateKey === "mrirData") {
  //     //   setMrirData((prev) => [...prev, { ...journalVoucherMRIRInitData, id: prev.length + 1 }]);
  //     // }
  //   },
  //   [narrationData],
  // );

  // const handleDeleteRow = (data, rowIndex) => {
  //   setNarrationData((prevData) => {
  //     const newData = [...prevData];

  //     if (newData[rowIndex]?.srl_no) {
  //       setDeletedNarrationRows((del) => [...del, newData[rowIndex].srl_no]);
  //     }

  //     newData.splice(rowIndex, 1);

  //     const transAmt = calculateNetDbAmt(newData);
  //     setFormData(prev=>({...prev, trans_amt:transAmt}))
  //     handleUpdateChange('trans_amt', transAmt);

  //     return newData;
  //   });
  // };


  const triggerAddRow = useCallback(() => {
  const isValidNarration = validateForm(
    "journal-voucher-detail-form",
    "Journal Voucher Detail Form"
  );

  if (!isValidNarration) return;

  setNarrationData((prev) => {
    const updatedData = [
      ...prev,
      { ...JVDetailsInitData, row_id: Date.now() },
    ];

    // 14 rows per page
    const lastPage = Math.ceil(updatedData.length / 14);

    // Add hote hi last page open ho jayega
    setPaginationPage(lastPage);

    return updatedData;
  });
}, [setPaginationPage]);


  const handleDeleteRow = (data, rowIndex) => {
    setNarrationData((prevData) => {
      const newData = [...prevData];

      // Track deleted rows (for update mode)
      if (newData[rowIndex]?.srl_no) {
        setDeletedNarrationRows((del) => [...del, newData[rowIndex].srl_no]);
      }

      // Remove row
      newData.splice(rowIndex, 1);

      /* 🔹 Recalculate Debit / Credit totals */
      const { dbTotal, crTotal } = calculateDbCrTotals(newData);

      setFormData((prev) => ({
        ...prev,
        db_total: dbTotal,
        cr_total: crTotal,
      }));

      handleUpdateChange("db_total", dbTotal);
      handleUpdateChange("cr_total", crTotal);

      /* 🔹 Recalculate transaction / net amount */
      const transAmt = calculateNetDbAmt(newData);

      setFormData((prev) => ({
        ...prev,
        trans_amt: transAmt,
      }));

      handleUpdateChange("trans_amt", transAmt);

      return newData;
    });
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked == "Query" && queryData.count == 0) {
        toast.error(queryData.message);
        return;
      }

      if (["Query", "Last", "Next", "Prev", "First"].includes(btnClicked)) {
        let transformedData = transformApiToFormData(
          queryData?.thfmtranData || {},
          queryData?.tdfmtranData || [],
        );
        setFormData({
          ...transformedData,
          trans_amt: queryData?.thfmtranData?.trans_amt,
          detailTotal: queryData?.detailTotal,
           db_total: Number(queryData?.db_total || 0),
           cr_total: Number(queryData?.cr_total || 0),
        });
        setNarrationData(
          transformApiToNarrationFormData(queryData?.tdfmtranData || []),
          
        );
        setFocusedRowIndex(0)
        if (btnClicked == "Query") {
          setTotalRecordCount(queryData?.count);
        }
      }
      setDataset(queryData);
    },
    [formStatus, currentRecordNo],
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForJVSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_JOURNAL_VOUCHER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`,
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

  //console.log("formStatus from memberform", formStatus);

  //console.log("formData::", narrationData);
  //console.log("formData::", formData);

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
        QUERY_API={APP_PROD_API.GET_JOURNAL_VOUCHER_DATA}
        handlePrint={() => getJrlVchReport(formData, formStatus)}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        handleAuthRecord={handleAuthVch}
        authority={{
          insert: "Y",
          update:
            formData?.posted === "Y" || formData?.cancel === "Y" ? "N" : "Y",
          message:
            formData?.posted === "Y"
              ? "Voucher has been already Posted, no modifications possible."
              : formData?.cancel === "Y"
                ? "Voucher has been Cancelled, no modifications possible."
                : "",
        }}
        opterationBtn={[
          {
            name:
              formData.cancel === "Y"
                ? "Revert Cancellation"
                : "Cancel Voucher",
            onClick: () => handleCancelVch(),
          },
        ]}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <JournalVoucherHeader
              formData={formData}
              handleChange={(name, value, event) =>
                handleChange("formData", name, value, null, event)
              }
              formStatus={formStatus}
              sections={sections}
              runValidations={runValidations}
            />
            <JournalVoucherDetails
              formData={formData}
              detailData={narrationData}
              setNarrationData={setNarrationData}
              handleChange={handleChange}
              purpose={purpose}
              formStatus={formStatus}
              triggerAddRow={() => triggerAddRow("narrationData")}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              triggerDeleteRow={handleDeleteRow}
               setPaginationPage={setPaginationPage}
              paginationPage={paginationPage}
              user={user}
            />
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.GET_JOURNAL_VOUCHER_DATA
                  }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={
                    helpFor === "bill_no"
                      ? { f_acc_no: narrationData[focusedRowIndex].acc_no }
                      : {}
                  }
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default JournalVoucher;
