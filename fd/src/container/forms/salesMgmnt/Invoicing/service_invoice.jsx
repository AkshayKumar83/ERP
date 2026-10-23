import React, { useRef, useCallback, useState, useEffect } from "react";
import { TabContent, TabPane, Modal, ModalHeader, ModalBody } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
// import { useCallback, useState, useEffect } from "react";
import {
  createSrchPayloadSrvInv,
  customerCodeHelpList,
  vendorCodeHelpList,
  debitAccHelpList,
  fillHdrRestFieldValue,
  getInvoicePrint,
  itemCodeHelpList,
  mhsminvInitData,
  salesPersonHelpList,
  serviceInvBottomBtn,
  validateItemRecord,
} from "./service_invoice_helper";
import ServiceInvMain from "./service_invoice_main";
import ServiceInvAdvance from "./service_invoice_advance";
// import ServiceInvDespatch from "./service_invoice_despatch";
import ServiceInvPayment from "./service_invoice_payment";
// import ServiceInvItems from "./service_invoice_items";
import InvoiceQrCode from "./print_invoice_qr_code";
import { APP_PROD_API } from "../../../../utils/api";

import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { getLocalDateTime, validateForm } from "../../../../utils/fn";
import { v4 as uuidv4 } from 'uuid';
import { fetchAppData } from "../../../../utils/fetchUtils";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

import {  useDispatch } from "react-redux";
import { selectLoader, setLoader } from "../../../../features/loader/loaderSlice";
import Loader from "../../../../components/GenricComponents/Loader";
import { useLocation } from "react-router-dom";

const ServiceInvoice = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...mhsminvInitData });
  const [formDetailData, setFormDetailData] = useState([{}]);
  const [disabledField, setDisabledField] = useState({inv_type:false})
  const { formStatus, handleOperation, releaseFormStatus, setFormStatus, searchQuery, setSearchQuery, } = useFormStatus();

  const [tabs, setTabs] = useState(["Main"]);
  const [currentFormTab, setCurrentFormTab] = useState("Main");
  const [updatedButtons, setUpdatedButtons] = useState(serviceInvBottomBtn);

  // When FormStatus will be Update the updated data will store in these state
  const [updateFormData, setUpdateFormData] = useState({});
  const [updateItemData, setUpdateItemData] = useState([]);
  const [updDeletedItemData, setUpdDeletedItemData] = useState([]);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  // WHEN PRINT BUTTON CLICKED AT TOOLBAR
  const [isPrintInvQRModelOpen, setIsPrintInvQRModelOpen] = useState(false);
  const togglePrintInvQRModal = () =>
    setIsPrintInvQRModelOpen(!isPrintInvQRModelOpen);

  const [itemFocusedRowIndex, setItemFocusedRowIndex] = useState(0);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // for dropdownData
  const [division, setDivision] = useState([]);
  const [invType, setInvType] = useState([]);
  const [docType, setDocType] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [despatch, setDespatch] = useState([]);
  const [preInv, setPreInv] = useState([]);
  const [paymentTerm, setPaymentTerm] = useState([]);
  const [bankList, setBankList] = useState([]);

  const fieldRefs = useRef({});
  const isValidationInProgress = useRef(false);

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("c_code");

  const { user } = useSelector((state) => state.auth);

  const formLoading = useSelector(selectLoader("form"));
  const dispatch = useDispatch();

  const [commonSaleAcc, setCommonSaleAcc] = useState({
  sale_ac_head: "",
  sale_ac_desc: "",
});

  // ## Helplist Related Logics
  const toggleHelpModal = () => setHelpList(!helpList);
  
const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);

  const docNo = params.get("doc_no");
  const fromTracker = params.get("fromTracker");

  const cameFromTracker = sessionStorage.getItem("fromTrackerNav");

  if (fromTracker === "true" && docNo && cameFromTracker === "true") {
    // flag consume karo taaki refresh par na chale
    sessionStorage.removeItem("fromTrackerNav");

    setFormData(prev => ({
    ...prev,
    inv_no: docNo,
  }));

  setFormStatus("Search");
  }
}, []);


  const getHelpListHeaders = () => {
     if (helpFor === "party_code") {
    return formData?.flag_cus_van === "V"
      ? vendorCodeHelpList
      : customerCodeHelpList;
  }
    if (helpFor === "it_code") {
      return itemCodeHelpList;
    }
    if (helpFor === "sale_ac_head") {
      return salesPersonHelpList;
    }
    if (helpFor === "debit_acc_code") {
      return debitAccHelpList;
    }
    return [];
  };
  

  const handleHelpList = (data, htmlFor, focusedRowIndex = 0) => {
    setHelpList(data);
    setHelpFor(htmlFor);
    // if (focusedRowIndex) {
    //   setItemFocusedRowIndex(focusedRowIndex);
    // }
    setItemFocusedRowIndex(focusedRowIndex);
  };

  const onSelectHelpItem = async (data) => {
    //switch case for helpFor
    switch (helpFor) {
      // case "party_code":
//         setFormData((prev) => ({
//           ...prev,
//           party_code: data.c_code,
//           party_name: data.c_name,
//           gst_no :data.gst_no
//         }));

//         if (formStatus === "Update") {
//          setUpdateFormData((prev) => {
//   const updated = {
//     ...prev,
//     c_code: data.c_code,
//     party_name: data.c_name,
//     ship_to_code:data.c_code,
//     bill_to_code:data.c_code,
//      gst_no :data.gst_no

//   };

//   delete updated.party_code;

//   return updated;
// });
//         }
//         // fetch dependent data
//         await fetchCustomerDependentData(data.c_code);
//         break;
      
        case "party_code": {
     const isVendor = formData?.flag_cus_van === "V";

  const partyCode = isVendor
    ? data.v_code
    : data.c_code;

  const partyName = isVendor
    ? data.v_name
    : data.c_name;

  setFormData((prev) => ({
    ...prev,
    party_code: partyCode,
    party_name: partyName,
    gst_no: data.gst_no,
  }));

  if (formStatus === "Update") {
    setUpdateFormData((prev) => ({
      ...prev,

      ...(isVendor
        ? { v_code: partyCode }
        : { c_code: partyCode }),

      party_name: partyName,
      ship_to_code: partyCode,
      bill_to_code: partyCode,
      gst_no: data.gst_no,
    }));
  }

  // SAME dependent API for both Customer and Vendor
  await fetchCustomerDependentData(partyCode);

  break;
}
        case "debit_acc_code":
        setFormData((prev) => ({
          ...prev,
          debit_acc_code: data.acc_no,
          debit_acc_desc: data.acc_desc,
        }));

        if (formStatus === "Update") {
        setUpdateFormData((prev) => ({
          ...prev,
          debit_acc_code: data.acc_no,
          debit_acc_desc: data.acc_desc,
        }));
      }
        // fetch dependent data
        // await fetchCustomerDependentData(data.c_code);
        break;
      case "it_code":
        setFormDetailData((prevData) => {
          const newData = [...prevData];
          // newData[itemFocusedRowIndex] = {
          //   ...newData[itemFocusedRowIndex],
          //   it_code: data.it_code,
          //   it_desc: data.it_name,
          //   c_code: formData?.party_code ?? "",
          //   rate: data?.it_rate,
          // };
          
        //   newData[itemFocusedRowIndex] = {
        //   ...newData[itemFocusedRowIndex],
        //   it_code: data.it_code,
        //   it_desc: data.it_name,
        //   c_code: formData?.party_code ?? "",
        //   // rate: data?.it_rate,
        //    qty: "",

        //   sale_ac_head:
        //     newData[itemFocusedRowIndex]?.sale_ac_head ||
        //     commonSaleAcc.sale_ac_head ||
        //     "",

        //   sale_ac_desc:
        //     newData[itemFocusedRowIndex]?.sale_ac_desc ||
        //     commonSaleAcc.sale_ac_desc ||
        //     "",
        // };

        newData[itemFocusedRowIndex] = {
          ...newData[itemFocusedRowIndex],
          it_code: data.it_code,
          it_desc: data.it_name,

          ...(formData?.flag_cus_van === "V"
            ? { v_code: formData?.party_code ?? "" }
            : { c_code: formData?.party_code ?? "" }),

          qty: "",

          sale_ac_head:
            newData[itemFocusedRowIndex]?.sale_ac_head ||
            commonSaleAcc.sale_ac_head ||
            "",

          sale_ac_desc:
            newData[itemFocusedRowIndex]?.sale_ac_desc ||
            commonSaleAcc.sale_ac_desc ||
            "",
        };
           
          return newData;
        });
        
        if (
  formStatus === "Update" &&
  formDetailData[itemFocusedRowIndex]?.sr_no
) {

  setUpdateItemData((prevUpdate) => {

    const currentRow = formDetailData[itemFocusedRowIndex];

    const existingIndex = prevUpdate.findIndex(
      (item) => item.sr_no === currentRow.sr_no
    );

    let newUpdData = [...prevUpdate];

    const updatedPayload = {
      ...(existingIndex >= 0 ? newUpdData[existingIndex] : {}),
      sr_no: currentRow.sr_no,
      it_code: data.it_code,
      it_desc: data.it_name,
      // rate: data?.it_rate,
    
    };

    if (existingIndex >= 0) {
      newUpdData[existingIndex] = updatedPayload;
    } else {
      newUpdData.push(updatedPayload);
    }

    return newUpdData;
  });
}

await getItemCodeDependentData(
    data.it_code,
    formData?.party_code,
    formData?.inv_type
  );

        setDisabledField((prev)=>({...prev, inv_type:true}))
        break;
      // case "sale_ac_head":
      //   setFormDetailData((prevData) => {
      //     const newData = [...prevData];
      //     newData[itemFocusedRowIndex] = {
      //       ...newData[itemFocusedRowIndex],
      //       sale_ac_head: data.acc_no,
      //       sale_ac_desc: data.acc_desc,
      //     };
      //     return newData;
      //   });
      //   break;

       case "sale_ac_head":
          setCommonSaleAcc((prev) => ({
            ...prev,
            sale_ac_head: data.acc_no,
            sale_ac_desc: data.acc_desc,
          }));

          //  saare items me apply
          setFormDetailData((prev) =>
            prev.map((row) => ({
              ...row,
              sale_ac_head: data.acc_no,
              sale_ac_desc: data.acc_desc,
            }))
          );

          if (formStatus === "Update") {
            setUpdateItemData((prev) =>
              formDetailData.map((row, index) => ({
                ...prev[index],
                sr_no: row.sr_no,
                sale_ac_head: data.acc_no,
                sale_ac_desc: data.acc_desc,
              }))
            );
          }
          break;
      default:
        break;
    }
  };

  // const fetchCustomerDependentData = async (c_code) => {
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_BASE_API_URL}${
  //         APP_PROD_API.GET_SERVICE_INVOICE_DEPENDENT_DATA
  //       }?c_code=${c_code}`,
  //       { credentials: "include" }
  //     );

  //     let data;
  //     try {
  //       data = await response.json();
  //     } catch (parseError) {
  //       throw new Error("Invalid server response");
  //     }

  //     if (!response.ok) {
  //       throw new Error(data?.message || "Failed to fetch customer data");
  //     }

  //     const {
  //       curr_cd,
  //       term_code,
  //       mode_cd,
  //       price_basis,
  //       curr_conv,
  //       octroi_flg,
  //       frt_flg,
  //       ins_flg,
  //       final_dest,
  //     } = data;

  //     setFormData((prev) => ({
  //       ...prev,
  //       curr_cd,
  //       term_code,
  //       mode_cd,
  //       price_basis,
  //       c_ex_rate: curr_conv,
  //       octroi_flg,
  //       frt_flg,
  //       ins_flg,
  //       final_dest,
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching customer dependent data:", error);
  //     toast.error(error.message || "Could not load customer details");
  //   }
  // };

  const fetchCustomerDependentData = async (party_code) => {
  try {
    const partyType = formData?.flag_cus_van || "C";

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_SERVICE_INVOICE_DEPENDENT_DATA
      }?party_code=${party_code}&party_type=${partyType}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to fetch party dependent data"
      );
    }

    const {
      curr_cd,
      term_code,
      mode_cd,
      price_basis,
      curr_conv,
      octroi_flg,
      frt_flg,
      ins_flg,
      final_dest,
    } = data;

    setFormData((prev) => ({
      ...prev,
      curr_cd,
      term_code,
      mode_cd,
      price_basis,
      c_ex_rate: curr_conv,
      octroi_flg,
      frt_flg,
      ins_flg,
      final_dest,
    }));
  } catch (error) {
    console.error("Error fetching party dependent data:", error);

    toast.error(
      error.message || "Could not load party dependent details"
    );
  }
};
  // SET CURRENT TAB NAME AT TOP
  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // CHANGING TAB
  const handleChangeTab = (getTab) => {
    setTabs([getTab]);
    setCurrentFormTab(getTab);
  };

  const fetchInvId = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_SERVICE_INVOICE_DATA
        }?inv_id=true`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          inv_no: `~${data?.gen_inv_id}`,
        }));
      }
    } catch (error) {}
  };

  // fetch drop down data
  useEffect(() => {
    if (!formStatus) return; // avoid calling on initial mount if empty
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_SERVICE_INVOICE_DROPDOWNDATA
          }`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          setDivision([
            { value: "", label: "" },
            ...formatOptions(data.division || [], "division_id", "name"),
          ]);
          setInvType([
            { value: "", label: "" },
            ...formatOptions(data.invType || [], "doc_type", "da_cat_desc"),
          ]);
          setDocType([
            { value: "", label: "" },
            ...formatOptions(data.docType || [], "prefix", "description"),
          ]);
          setCurrency([
            { value: "", label: "" },
            ...formatOptions(data.currency || [], "curr_cd", "curr_desc"),
          ]);
          setDespatch([
            { value: "", label: "" },
            ...formatOptions(data.despatch || [], "c_code", "name"),
          ]);
          setPreInv([
            { value: "", label: "" },
            ...formatOptions(data.preInv || [], "pre_id", "pre_inv_no"),
          ]);
          setPaymentTerm([
            { value: "", label: "" },
            ...formatOptions(data.paymentTerm || [], "term_code", "term_desc"),
          ]);
          setBankList([
            { value: "", label: "" },
            ...formatOptions(data.bank || [], "bank_code", "bank_name"),
          ]);
        }
        preInsert();
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]); // todo check this should be call after submit the invoice

  // pre insert set all data
  const preInsert = () => {
    if (formStatus !== "Insert") {
      return;
    }

    // Set default division_id
    setFormData((prev) => {
      const updated = {
        ...prev,
        division_id: user?.global_division_id,
        trans_year: user?.global_fin_year,
        inv_dt: new Date().toISOString().split("T")[0],
        prep_dt: getLocalDateTime(),
      };

      // Only fetch invoice ID if inv_no doesn't start with ~
      if (!updated?.inv_no?.startsWith("~")) {
        fetchInvId();
      }
      return updated;
    });
  };

  // handle submit logic
  async function handleSubmit(e){
    e.preventDefault();


    let payload = null;
    let method = "POST";

    // Validate Header Form
    const isValidFormData = validateForm("service-inv-main-form", "Service Invoice Main Form");

    if (!isValidFormData) {
      toast.error("Please fill required header data first");
      return;
    }

    // Validate Detail Form
    const isValidNarration = validateForm("service-inv-items-form", "Service Invoice Items Detail");
    if (!isValidNarration) {
      toast.error("Please fill required item details");
      return;
    }

    dispatch(setLoader({ key: "form", value: true })); // Start loader
    // Always set payload to avoid undefined
    // payload = {
    //   formHdrData: { ...formData },
    //   formItemData: [...formDetailData],
    // };
    payload = {
  formHdrData: { ...formData },

  formItemData: formDetailData.map((row) => ({
    ...row,

    sale_ac_head:
      row.sale_ac_head ||
      commonSaleAcc.sale_ac_head,

    sale_ac_desc:
      row.sale_ac_desc ||
      commonSaleAcc.sale_ac_desc,

    debit_acc_code:
      row.debit_acc_code ||
      formData.debit_acc_code,

    debit_acc_desc:
      row.debit_acc_desc ||
      formData.debit_acc_desc,
  })),
};

    if (formStatus === "Update") {
      method = "PUT";
      payload = {
        formHdrData: { ...updateFormData, inv_id:formData?.inv_id, inv_no:formData?.inv_no, flag_cus_van: formData?.flag_cus_van, },
        // formItemData: [...updateItemData],
        formItemData: updateItemData.map((row) => ({
  ...row,

  sale_ac_head:
    row.sale_ac_head ||
    commonSaleAcc.sale_ac_head,

  sale_ac_desc:
    row.sale_ac_desc ||
    commonSaleAcc.sale_ac_desc,

  debit_acc_code:
    row.debit_acc_code ||
    formData.debit_acc_code,

  debit_acc_desc:
    row.debit_acc_desc ||
    formData.debit_acc_desc,
})),
        // newFormItemData: formDetailData.filter((row) => {
        //   return !row.hasOwnProperty("sr_no") || row?.sr_no == "";
        // }),
       
       newFormItemData: formDetailData
  .filter((row) => {
    return !row.hasOwnProperty("sr_no") || row?.sr_no == "";
  })
  .map((row) => ({
    ...row,

    sale_ac_head:
      row.sale_ac_head ||
      commonSaleAcc.sale_ac_head,

    sale_ac_desc:
      row.sale_ac_desc ||
      commonSaleAcc.sale_ac_desc,

    debit_acc_code:
      row.debit_acc_code ||
      formData.debit_acc_code,

    debit_acc_desc:
      row.debit_acc_desc ||
      formData.debit_acc_desc,
  })),
       
       
       
        deletedItemData:[...updDeletedItemData]
      };
    }

    //console.log("Form Payload:", payload);

    try {
      const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.POST_SERVICE_INVOICE_DATA
      }?form_status=${formStatus}&userId=${user.id}`;

      const response = await fetch(apiUrl, {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        let responseData = await response.json()
        toast.success("Record saved successfully");
        if(formStatus == 'Insert'){
          showGeneratedInvNo(responseData?.gen_inv_no)
        }
        formReset()
      } else {
        let errorMsg = {};
        try {
          errorMsg = await response.json();
        } catch (e) {
          errorMsg.message = "Server error message not found";
        }
        toast.error(errorMsg?.message || "Response error occurred");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.message || "Something went wrong during submission");
    }finally{
      dispatch(setLoader({ key: "form", value: false })); // Start loader
    }
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const formReset = (isCancelClicked = false) => {
    setFormData({ ...mhsminvInitData });
    setFormDetailData([{}]);
    setUpdateFormData({})
    setUpdateItemData([])
    setUpdDeletedItemData([])
    setDisabledField({inv_type:false})
    setCommonSaleAcc({ sale_ac_head: "",
  sale_ac_desc: ""})

      if(isCancelClicked){
        return
      }
      releaseFormStatus()
      if(formStatus == 'Insert'){
        setTimeout(() => {
          setFormStatus('Insert')
        }, 200);
      }

  };

  const handleCancel = useCallback(() => {
    formReset(true);
    releaseFormStatus();
  }, []);

 
  const handleChange = (tab, name, value, index, event) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    //console.log(name, value)

    const cursorPosition = event?.target?.selectionStart;
    const newVal = value?.toUpperCase?.() ?? value; // Ensure value is uppercased if it's a string

    // Update formData and updateFormData if formStatus is "Update"
    setFormData((prev) => {
      if (formStatus === "Update") {
        // setUpdateFormData((prevUpdate) => {
        //   return {
        //     ...prevUpdate,
        //     [name]: value,
        //   };
        // });
        setUpdateFormData((prevUpdate) => {

  // const dbFieldMap = {
  //   party_code: "c_code",
  // };

  // const dbFieldName = dbFieldMap[name] || name;

  const dbFieldMap = {
  party_code:
    formData?.flag_cus_van === "V"
      ? "v_code"
      : "c_code",
};

const dbFieldName = dbFieldMap[name] || name;

  return {
    ...prevUpdate,
    [dbFieldName]: value,
  };
});
      }
      return {
        ...prev,
        [name]: newVal,
      };
    });

    // Handle cursor position restoration for text inputs
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date", "datetime-local"].includes(
        event.target.type
      )
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const handleChangeItem = (tab, name, value, index, event) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }
    
    if(formData?.inv_type && !disabledField?.inv_type){
      setDisabledField((prev)=>({...prev, inv_type:true}))
    }


    const cursorPosition = event?.target?.selectionStart;
    const newVal = value?.toUpperCase?.() ?? value; // Ensure value is uppercased if it's a string

    setFormDetailData((prevData) => {
      const newData = [...prevData];
      const existingRow = newData[index] || {};

      // Update the changed field in the item row
      const updatedRow = { ...existingRow, [name]: newVal };

      // Get latest qty and rate after change
      const qty = name === "qty" ? value : existingRow.qty;
      const rate = name === "rate" ? value : existingRow.rate;

      const qtyNum = Number(qty);
      const rateNum = Number(rate);

      // Calculate basic_value if both are valid numbers
      if (!isNaN(qtyNum) && !isNaN(rateNum)) {
        updatedRow.basic_value = (qtyNum * rateNum).toFixed(2);
      }

      newData[index] = updatedRow;

      // If formStatus is "Update", update the corresponding row in updateItemData
      if (
        formStatus === "Update" &&
        existingRow.hasOwnProperty("sr_no") &&
        existingRow.sr_no !== ""
      ) {
        // setUpdateItemData((prevUpdate) => {
        //   const newUpdData = [...prevUpdate];
        //   const existingUpdRow = newUpdData[index] || {};

        //   // Update the specific item row with only the changed fields
        //   newUpdData[index] = {
        //     ...existingUpdRow,
        //     [name]: newVal,
        //     basic_value: updatedRow.basic_value, // Update the calculated value too
        //     assess_value: updatedRow.basic_value, // Assuming assess_value should match basic_value
        //     gst_igst_amt:
        //       updatedRow.gst_igst_val != 0
        //         ? Number(updatedRow.basic_value) * 0.18
        //         : 0,
        //     gst_cgst_amt:
        //       updatedRow.gst_cgst_val != 0
        //         ? Number(updatedRow.basic_value) * 0.09
        //         : 0,
        //     gst_sgst_amt:
        //       updatedRow.gst_sgst_val != 0
        //         ? Number(updatedRow.basic_value) * 0.09
        //         : 0,
        //     sr_no: updatedRow.sr_no, // Preserve sr_no for identification
        //   };

        //   return newUpdData;
        // });
    
    setUpdateItemData((prevUpdate) => {

  const existingIndex = prevUpdate.findIndex(
    (item) => item.sr_no === updatedRow.sr_no
  );

  let newUpdData = [...prevUpdate];

  const updatedPayload = {
    ...(existingIndex >= 0 ? newUpdData[existingIndex] : {}),
    [name]: newVal,
     sale_ac_head:
    updatedRow.sale_ac_head ||
    commonSaleAcc.sale_ac_head ||
    formDetailData[0]?.sale_ac_head ||
    "",

  sale_ac_desc:
    updatedRow.sale_ac_desc ||
    commonSaleAcc.sale_ac_desc ||
    formDetailData[0]?.sale_ac_desc ||
    "",

    basic_value: updatedRow.basic_value,
    assess_value: updatedRow.basic_value,
    // gst_igst_amt:
    //   updatedRow.gst_igst_val != 0
    //     ? Number(updatedRow.basic_value) * gst_igst_val/100
    //     : 0,
    // gst_cgst_amt:
    //   updatedRow.gst_cgst_val != 0
    //     ? Number(updatedRow.basic_value) * gst_cgst_val/100
    //     : 0,
    // gst_sgst_amt:
    //   updatedRow.gst_sgst_val != 0
    //     ? Number(updatedRow.basic_value) * gst_sgst_val/100
    //     : 0,

    // added by akshay 9/24/26 
      gst_igst_amt:
  Number(updatedRow.gst_igst_val) > 0
    ? Number(
        (
          Number(updatedRow.basic_value) *
          Number(updatedRow.gst_igst_val)
        ) / 100
      ).toFixed(2)
    : 0,

gst_cgst_amt:
  Number(updatedRow.gst_cgst_val) > 0
    ? Number(
        (
          Number(updatedRow.basic_value) *
          Number(updatedRow.gst_cgst_val)
        ) / 100
      ).toFixed(2)
    : 0,

gst_sgst_amt:
  Number(updatedRow.gst_sgst_val) > 0
    ? Number(
        (
          Number(updatedRow.basic_value) *
          Number(updatedRow.gst_sgst_val)
        ) / 100
      ).toFixed(2)
    : 0,
    
    sr_no: updatedRow.sr_no,
  };

  if (existingIndex >= 0) {
    newUpdData[existingIndex] = updatedPayload;
  } else {
    newUpdData.push(updatedPayload);
  }

  return newUpdData;
});
    
    
      }

      return newData;
    });

    // Handle cursor position restoration for text inputs
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date", "datetime-local"].includes(
        event.target.type
      )
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const handleAddRow = useCallback(() => {
    setFormDetailData((prevData) => [
      ...prevData,
      // { row_id: uuidv4(), 
      //   sale_ac_head: commonSaleAcc.sale_ac_head || "",
      //   sale_ac_desc: commonSaleAcc.sale_ac_desc || "",
      // },
      {
  row_id: uuidv4(),

  sale_ac_head:
    formDetailData[0]?.sale_ac_head ||
    commonSaleAcc.sale_ac_head ||
    "",

  sale_ac_desc:
    formDetailData[0]?.sale_ac_desc ||
    commonSaleAcc.sale_ac_desc ||
    "",
}
    ]);
 }, [formDetailData, commonSaleAcc]);

 
  const handleDelete = (rowIndex) => {
    setFormDetailData((prevData) => {
      const newData = [...prevData];

      // Check if the row exists and proceed with the deletion logic using row_id
      const rowIdToDelete = newData[rowIndex]?.row_id;

      if (rowIdToDelete) {
        // Store deleted row's sr_no if it exists
        if (newData[rowIndex]?.sr_no) {
          setUpdDeletedItemData((del) => [...del, newData[rowIndex]?.sr_no]);
        }

        // Delete the row by filtering based on row_id
        return newData.filter((item) => item?.row_id !== rowIdToDelete);
      }

      return newData; // If row doesn't exist, return the data unchanged
    });
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if(btnClicked == 'Query'){
        dispatch(setLoader({ key: "form", value: true }));
      }

      if (queryData?.type == "error") {
        toast.error(queryData?.message);
        dispatch(setLoader({ key: "form", value: false }));
        handleCancel();
        return;
      }
      setFormData(queryData?.mhsmInvData);
      // set unique row_id in each row of item
      let getTransformItemData = queryData?.mdsmInvData.map(item=>({...item, row_id :uuidv4()}))
      setFormDetailData(getTransformItemData);
    setFocusedRowIndex(0)
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.count);
      }

      
      dispatch(setLoader({ key: "form", value: false }));
    },
    [formStatus, currentRecordNo, dispatch]
  );

  const validateFormFields = async (
    fieldName,
    focusedRowIndex = 0,
    onSubmit = false,
    validationItemIndex = 0
  ) => {
    // if (isValidationInProgress.current) return;

    if (formStatus !== "Insert" && formStatus !== "Update") return true;
    isValidationInProgress.current = true;

    let isValid = true;
    switch (fieldName) {
      case "party_code":
        // alert('yes came in this bloack')
        isValid = validateCustomerCode((onSubmit = false)); 
        break;
      // case "c_po_no":
      //   isValid = validateFieldNotEmpty(
      //     "c_po_no",
      //     "Customer PO No cannot be empty"
      //   );
      //   break;
      // case "c_po_dt":
      //   isValid = validateCustomerPODate();
      //   break;
      // case "curr_conv":
      //   isValid = validateCurrConversion();
      //   break;
      // case "eff_dt":
      //   isValid = validateEffDate();
      //   break;
      // case "end_dt":
      //   isValid = validateEndDate();
      //   break;
      // case "delivery_date":
      //   isValid = validateDeliveryDate();
      //   break;
      // case "term_code":
      //   isValid = validateFieldNotEmpty(
      //     "term_code",
      //     "Payment Term cannot be empty"
      //   );
      //   break;
      // case "price_basis":
      //   isValid = validateFieldNotEmpty(
      //     "price_basis",
      //     "Price Basis cannot be empty"
      //   );
      //   break;
      // case "mode_cd":
      //   isValid = validateFieldNotEmpty(
      //     "mode_cd",
      //     "Mode of Transport cannot be empty"
      //   );
      //   break;
      // case "catalog_code":
      //   isValid = await validateItemCode(onSubmit, validationItemIndex);
      //   break;
      case "it_code":
        isValid = await validateItemCode(onSubmit, validationItemIndex);
      break;
        // case "qty_ord":
        //   isValid = validateQtyOrd(onSubmit, validationItemIndex);
        //   break;
        // case "mat_rat":
        //   isValid = processMatRate(onSubmit, validationItemIndex);
        //   break;
        // case "perunit":
        //   isValid = validatePerUnit(onSubmit, validationItemIndex);
        break;
      default:
        return true;
    }

    // if (!isValid) {
    //   const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    //   const itemRowValidationFields = [
    //     "catalog_code",
    //     "it_code",
    //     "qty_ord",
    //     "mat_rat",
    //   ];
    //   setTimeout(() => {
    //     const field = itemRowValidationFields.includes(fieldName)
    //       ? `${fieldName}_${index}`
    //       : fieldName;
    //     const currentFieldRef = fieldRefs.current[field]?.current;
    //     if (currentFieldRef) {
    //       currentFieldRef.focus();
    //     }
    //     isValidationInProgress.current = false;
    //   }, 0); // Timeout to avoid conflict with blur event
    // } else {
    //   isValidationInProgress.current = false;
    // }

    return isValid;
  };

  // const validateCustomerCode = (onSubmit) => {
  //   if (!helpList) {
  //     if (!formData?.party_code) {
  //       toast.error("Please enter Customer Code");
  //       return false;
  //     }
  //   }
  //   // if (formData?.pary_code && !onSubmit) {
  //   // alert('h')

  //   setFormData((prev) => ({
  //     ...prev,
  //     ship_to_code: formData?.party_code,
  //     ship_to_name: formData?.party_name,
  //     bill_to_code: formData?.party_code,
  //     bill_to_name: formData?.party_name,
  //     gst_no :formData?.gst_no
  //   }));
  //   // }
  //   return true;
  // };


  const validateCustomerCode = (onSubmit) => {

  if (!helpList) {
    if (!formData?.party_code) {
      toast.error(
        formData?.flag_cus_van === "V"
          ? "Please enter Vendor Code"
          : "Please enter Customer Code"
      );

      return false;
    }
  }

  setFormData((prev) => ({
    ...prev,

    ship_to_code: prev.party_code,
    ship_to_name: prev.party_name,

    bill_to_code: prev.party_code,
    bill_to_name: prev.party_name,

    gst_no: prev.gst_no,
  }));

  return true;
};

  const validateCurrConversion = () => {
    const currConvVal = formData["curr_conv"];
    if (currConvVal == null || currConvVal === 0 || currConvVal === "") {
      toast.error("Currency conversion cannot be blank");
      return false;
    }
    if (currConvVal <= 0) {
      toast.error("Currency conversion cannot be zero or negative");
      return false;
    }
    return true;
  };

  const validateItemCode = async (onSubmit, validationItemIndex) => {
    const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    if (!helpList && !formDetailData[index]?.it_code) {
      toast.error("Item Code cannot be empty");
      return false;
    }
    let returnVal = true;
    if (formDetailData[itemFocusedRowIndex]?.it_code && !onSubmit) {
      //todo might be the below logic need to be apply
      // returnVal = await checkIfItemCodeIsInactive(
      //   formDetailData[itemFocusedRowIndex]?.it_code
      // );
      // if (returnVal) {
      //   returnVal = await getItemCodeDependentData(
      //     formDetailData[itemFocusedRowIndex]?.it_code,
      //     formData?.c_code,
      //     formData?.inv_type
      //   );
      // }

      returnVal = await getItemCodeDependentData(
        formDetailData[itemFocusedRowIndex]?.it_code,
        formData?.party_code,
        formData?.inv_type
      );
    }
    return returnVal;
  };

  const getItemCodeDependentData = async (it_code, party_code, inv_type) => {
 const partyType = formData?.flag_cus_van || "C";

if (!party_code) {
  toast.error(
    partyType === "V"
      ? "Vendor Code should be filled to fetch HSN Code"
      : "Customer Code should be filled to fetch HSN Code"
  );

  setFormDetailData((prevData) => {
    const newData = [...prevData];

    newData[itemFocusedRowIndex] = {
      ...newData[itemFocusedRowIndex],
      it_code: "",
      it_desc: "",
    };

    return newData;
  });

  return false;
}
    try {
    const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_SERVICE_INVOICE_HSN_CODE_DATA
        }?it_code=${it_code}&party_code=${party_code}&party_type=${partyType}&inv_type=${inv_type}&division_id=${
          user.global_division_id
        }&trans_year=${user.global_fin_year}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (!data?.hsn_sac_code) {
        toast.error(data?.error || "HSN Code is not defined in Product Master.");
        // setFormDetailData((prevData) => {
        //   const newData = [...prevData];
        //   newData[itemFocusedRowIndex] = {
        //     ...newData[itemFocusedRowIndex],
        //     it_code: "",
        //     it_desc: "",
        //     hsn_sac_code:'',
        //   };
        //   return newData;
        // });
        return false;
      } else {
        setFormDetailData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            // hsn_sac_code: data?.hsn_sac_code,
            // cus_it_code: data?.cus_it_code ?? "",
            // cus_it_desc: data?.cus_it_desc ?? "",
            // it_desc: data?.it_desc ?? "",
            // it_uom: data?.it_uom ?? "",
            // apply_tax_paid_price: data?.apply_tax_paid_price || null,
            // sale_ac_head: data?.sale_ac_head ?? "",
            // sale_ac_desc: data?.sale_ac_desc ?? "",
            // gst_igst_val:data?.gst_igst_val ?? "",
            ...data,
            // sale_ac_head: "",   // reset
            // sale_ac_desc: "",   // reset

           sale_ac_head:
              commonSaleAcc.sale_ac_head ||
              prevData[itemFocusedRowIndex]?.sale_ac_head ||
              "",

            sale_ac_desc:
              commonSaleAcc.sale_ac_desc ||
              prevData[itemFocusedRowIndex]?.sale_ac_desc ||
              "",
          };
          return newData;
        });
        return true;
      }
    } catch (error) {
      console.error("Error checking HSN code:", error);
      toast.error("Error checking HSN code");
      return false;
    }
  };

  // const checkIfItemCodeIsInactive = async (it_code) => {
  //   if (formDetailData[itemFocusedRowIndex]?.it_code) {
  //     const duplicateItem = formDetailData.find(
  //       (item, index) =>
  //         item.it_code === it_code &&
  //         item.cus_it_code === formDetailData[itemFocusedRowIndex]?.cus_it_code &&
  //         index !== itemFocusedRowIndex
  //     );
  //     if (duplicateItem) {
  //       toast.error(
  //         `Item Code ${it_code} with Customer Item Code ${formDetailData[itemFocusedRowIndex]?.cus_it_code} already exists`
  //       );
  //       setFormDetailData((prevData) => {
  //         const newData = [...prevData];
  //         newData[itemFocusedRowIndex] = {
  //           ...newData[itemFocusedRowIndex],
  //           it_code: "",
  //           it_desc: "",
  //         };
  //         return newData;
  //       });
  //       return false;
  //     }
  //   }
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_BASE_API_URL}${
  //         APP_PROD_API.GET_ITEM_CODE_INACTIVE_DATA
  //       }?it_code=${it_code}`,{credentials:'include'}
  //     );
  //     const data = await response.json();
  //     if (data?.length === 0) {
  //       toast.error("Item Code is not defined in Product Master or Inactive.");
  //       setFormDetailData((prevData) => {
  //         const newData = [...prevData];
  //         newData[itemFocusedRowIndex] = {
  //           ...newData[itemFocusedRowIndex],
  //           it_code: "",
  //           it_desc: "",
  //         };
  //         return newData;
  //       });
  //       return false;
  //     }
  //     return true;
  //   } catch (error) {
  //     console.error("Error checking item code:", error);
  //     toast.error("Error checking item code");
  //     return false;
  //   }
  // };

  const getFieldRef = (fieldName) => {
    if (!fieldRefs.current[fieldName]) {
      fieldRefs.current[fieldName] = React.createRef();
    }
    return fieldRefs.current[fieldName];
  };

  // Render Bottom Submit Bar Btn Dynamically
  const renderBottomBtn = () => {
    const curntTab = {
      name: `${currentFormTab}`,
      id: `${currentFormTab.toLowerCase()}-btn`,
      color: "secondary",
      disabled: false,
      outline: true,
    };

    function handleClick(e, btn) {
      if(btn.name =='Cancel Invoice'){
        cancelInvoice()
        return
      }
      const simpleBarElement = document.querySelector(
        "#simplebar-container .simplebar-content-wrapper"
      );
      if (simpleBarElement) {
        simpleBarElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Find the index of the clicked button
      const btnIndex = updatedButtons.findIndex((item) => item.id === btn.id);

      if (btnIndex !== -1) {
        const newButtons = [...updatedButtons]; // Create a new array (immutability)
        newButtons[btnIndex] = curntTab; // Update the specific button
        setUpdatedButtons(newButtons); // Update state
      }
      handleChangeTab(btn.name);
    }

    return updatedButtons.map((item) => ({
      ...item,
      onClick: (e) => handleClick(e, item),
    }));
  };

    const cancelInvoice= async()=>{
    if(formStatus != 'Query'){
      return
    }

    let { inv_id, cancel_flag, auth_flag } = formData;
    const { id } = user;

    let newCancelValue = cancel_flag;

    if (cancel_flag === "Y") {
      const confirmRevert = confirm(
        "Invoice already cancelled. Do you want to revert the cancelled Invoice?"
      );
      if (confirmRevert) {
        newCancelValue = "N";
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm(
        "Do you really want to cancel this Invoice?"
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
          APP_PROD_API.CANCELLATION_SERVICE_INV
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inv_data: { inv_id, id, cancel_flag: newCancelValue, auth_flag },
          }),
          credentials:'include',
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success(result?.message || "Invoice updated successfully.");
        setFormData((prev) => ({ ...prev, cancel_flag: newCancelValue }));
      } else{
        toast.error(result?.message || "Failed to update Invoice.");
      }
    } catch (error) {
      console.error("Error updating Invoice:", error);
      toast.error("An error occurred while updating the Invoice.");
    }
  }

  
  const handleSearch = async () => {
      try {
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
        const searchPayload = createSrchPayloadSrvInv(formData);
        const queryList = new URLSearchParams(searchPayload);
       
        if ([...queryList].length === 0) {
          toast.error("Please enter search criteria");
          return;
        }

        setSearchQuery(searchPayload);
  

        const data = await fetchAppData(
          `${APP_PROD_API.GET_SERVICE_INVOICE_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
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

  const onSuccessConfirmation = useCallback(
      (confirm, vch_no) => {
        setConfirmationConfig({});
        setConfirmationModal(false);
      },
      [formData]
  );
    
  const showGeneratedInvNo = useCallback((inv_no)=>{
      setConfirmationConfig({
        title: "Invoice No. generated",
        description:`New Invoice no generated is ${inv_no}`,
        uniqKey: "Inv_no",
      });
      setConfirmationModal(true);
  },[])


  const handleAuthInv = async () => {
    const {
        inv_id, auth_flag
    } = formData;
    const { id } = user;

    if (auth_flag === "Y") {
      alert("Invoice has been already Posted, no modifications possible.");
      return;
    }

    if (formData?.auth_flag === "N") {
      if (confirm("Do you want to Authorise this Invoice")) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_INVOICE
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invData: {
                id,
                auth_flag: "Y",
                division_id: user?.global_division_id,
                trans_year: user?.global_fin_year,
                inv_id
              },
            }),
            credentials: "include",
          },
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message);
          setFormData((prev) => ({
            ...prev,
            auth_flag: "Y",
            voucher_no:result?.voucher_no
            // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            // voucher_no: result?.voucher_no,
          }));
        } else {
          const result = await response.json();
          toast.error(result?.message);
        }
      }
    }
  };

  const renderFormTab = (tab) => {
    switch (tab) {
      case "Main": {
        return (
          <ServiceInvMain
            formData={formData}
            setFormData={setFormData}
            formStatus={formStatus}
            handleChange={handleChange}
            handleChangeItem={handleChangeItem}
            handleChangeTab={handleChangeTab}
            invType={invType}
            docType={docType}
            division={division}
            currency={currency}
            despatch={despatch}
            preInv={preInv}
            bankList={bankList}
            handleHelpList={handleHelpList}
            validateFormFields={validateFormFields}
            getFieldRef={getFieldRef}
            // -- below props for Item section -- //
            itemFormDetail={formDetailData}
            handleAddRow={handleAddRow}
            handleDelete={handleDelete}
            setFormDetailData={setFormDetailData}
            setUpdateFormData={setUpdateFormData}
            disabledField={disabledField}
            commonSaleAcc={commonSaleAcc}
            setFocusedRowIndex={setFocusedRowIndex}
            focusedRowIndex={focusedRowIndex}


          />
        );
      }
      // case "Advance": {
      //   return (
      //     <ServiceInvAdvance
      //       formData={formData}
      //       formStatus={formStatus}
      //       handleChange={(e) => handleChange("Advance", e)}
      //       handleChangeTab={handleChangeTab}
      //     />
      //   );
      // }

      case "Payment": {
        return (
          <ServiceInvPayment
            formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChange("MainTab", e.target.name, e.target.value, null, e)}
            handleChangeTab={handleChangeTab}
            paymentTerm={paymentTerm}
          />
        );
      }
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
        handlePrint={()=>getInvoicePrint(formData, formStatus, dispatch)} //todo comment it or remove it later
        QUERY_API={APP_PROD_API.GET_SERVICE_INVOICE_DATA}
        opterationBtn={renderBottomBtn()}
        handleSearch={handleSearch}
        formPayload={{ searchQuery,}}
        setSearchQuery={setSearchQuery}
        handleAuthRecord={handleAuthInv}
        formName={""}
        authority={{
          insert: 'Y',
          update: formData?.auth_flag === 'Y' || formData?.cancel_flag === 'Y' ? 'N' : 'Y',
          message:
            formData?.auth_flag === 'Y'
              ? 'Invoice has been already authorized, no modifications possible.'
              : formData?.cancel_flag === 'Y'
              ? 'Invoice has been Cancelled, no modifications possible.'
              : '',
        }}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            
            {formLoading && <Loader overlayContainer />}
            {renderFormTab(currentFormTab)}
            {helpList && (
              <Modal
                id="help-list-modal"
                isOpen={helpList}
                toggle={toggleHelpModal}
                size="lg"
              >
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_SERVICE_INVOICE_DATA
                    }`}
                    queryPera={{ needAppGlobalData: "Y" }}
                    helpListHeader={getHelpListHeaders()}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    // whereClause={helpFor === 'it_code'?{inv_type:formData?.inv_type}:{}}
                    whereClause={{...(helpFor === "it_code"? { inv_type: formData?.inv_type }: {}),
                    ...(helpFor === "party_code"  ? { party_type: formData?.flag_cus_van || "C" } : {}),
                        }}
                  />
                </ModalBody>
              </Modal>
            )}
            {isPrintInvQRModelOpen && (
              <InvoiceQrCode
                formData={formData}
                formStatus={formStatus}
                handleChange={handleChange}
                isPrintInvQRModelOpen={isPrintInvQRModelOpen}
                togglePrintInvQRModal={togglePrintInvQRModal}
              />
            )}

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
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ServiceInvoice;
