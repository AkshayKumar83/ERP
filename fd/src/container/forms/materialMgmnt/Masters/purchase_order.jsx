



import React, { useEffect, useRef } from "react";
import { Button, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { APP_PROD_API } from "../../../../utils/api";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import toast from "react-hot-toast";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { useDispatch, useSelector } from "react-redux";
import { formatOptions } from "../../../../lib";
import PurchaseOrderDtl from "./purchase_order_dtl";
import MainTab from "./purchase_order_main";
import TermsTab from "./purchase_order_term";
import PurchaseOrderItem from "./purchase_order_item";

// import PurchaseOrderAdvance from "./purchase_order_advance";
// import PurchaseOrderDlvrSchedule from "./purchase_order_dlvr_schedule";
// import PurchaseOrderSpec from "./purchase_order_spec";
// import PurchaseOrderAmend from "./purchase_order_amend";
// import PurchaseOrderSubContract from "./purchase_order_subcontract";

import { v4 as uuidv4 } from "uuid";

import {
  formHdrInitData,
  ItemInitialData,
  formDlvrInitData,
  formSubContrInitData,
  createSrchPayloadPO,
  getDispFlag,
  docAuth1,
  docAuth2,
  docAuth3,
  getPOPrint,
  purchaseBillLevelHeader,
} from "./purchase_order_helper";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { fetchAppData } from "../../../../utils/fetchUtils";
import Checkbox from "../../../../components/basic/checkbox";
import MuiTextArea from "../../../../components/basic/muiTextArea";
import MuiDateField from "../../../../components/basic/MuiDateField";
import { useLocation } from "react-router-dom";
import PurchaseOrderBillLevelChrg from "./purchase_order_bill_level_chrg";

const PurchaseOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [formDlvrData, setformDlvrData] = useState([formDlvrInitData]);
  const [formSubContrData, setFormSubContrData] = useState([]);
  const [itemFormData, setItemFormData] = useState([]);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const [formControlData, setFormControlData] = useState({});

  const updateFormData = useRef({ poHdr: {}, poDtl: [], deletedPo: [] });
  const tabs = ["Main", "Items", "PO Level Charges"];

  // for help list
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  // showing generated po_no
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // focus row
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // for delete record
  const [deletedRecord, setDeletedRecord] = useState([]);

  // DROPDOWN LIST DATA CONTAINING STATE
  const [poCategory, setPoCategory] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [modeOfTransportList, setModeOfTransportList] = useState([]);
  // const [paymentTermList, setPaymentTermList] = useState([]);
  const [workCenterList, setWorkCenterList] = useState([]);
  const [priceBasisList, setPriceBasisList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [brandList, setBrandList] = useState([]);

  //for po_type 
  const [allowedDocTypes, setAllowedDocTypes] = useState([]);

  const dispatch = useDispatch();

  const [chargesMaster, setChargesMaster] = useState([]);
  const [billFormData, setBillFormData] = useState({});

  // todo comment only for eddal
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState(1);

  const [authData, setAuthData] = useState({
    1: { ...docAuth1 },
    2: { ...docAuth2 },
    3: { ...docAuth3 },
  });

  const [authTabLabels, setAuthTabLabels] = useState({
    1: "Auth Tab 1",
    2: "Auth Tab 2",
    3: "Auth Tab 3",
  });

  const location = useLocation();
  const itemRefs = useRef([]);

  // on query fetching is gate entry done of this PO/PA
const [isGateEntryDone, setIsGateEntryDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const po_no = params.get("po_no");

    if (po_no) {
      setFormData((prev) => ({
        ...prev,
        po_no: po_no,
      }));

      setSearchQuery({ po_no });
      handleOperation("Search");
    }
  }, []);

  // SETTING USER INSERT logic
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_DRP_DOWN_DATA_PRCH_ORDR
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}&userId=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (response.status === 403) {
        const data = await response.json();
        toast.error(data.message); 
        handleCancel();
        return;
      }

        if (response.status === 200) {
          const data = await response.json();
          setAllowedDocTypes(data.allowedDocTypes || []);

          setPoCategory([
            { value: "", label: "" },
            ...formatOptions(
              data?.poCategory || [],
              "po_cat_prefix",
              "po_cat_description",
            ),
          ]);
          setPackingList([
            { value: "", label: "" },
            ...formatOptions(data?.packingList || [], "code", "description"),
          ]);
          setModeOfTransportList([
            { value: "", label: "" },
            ...formatOptions(
              data?.modeOfTransportList || [],
              "code",
              "description",
            ),
          ]);
          // setPaymentTermList([
          //   { value: "", label: "" },
          //   ...formatOptions(
          //     data?.paymentTermList || [],
          //     "term_code",
          //     "term_desc"
          //   ),
          // ]);
          // setWorkCenterList([
          //   { value: "", label: "" },
          //   ...formatOptions(data?.workCenterList || [], "wc_id", "wc_no"),
          // ]);
          setBrandList([
            { value: "", label: "" },
            ...formatOptions(
              data?.brandList || [],
              "brand_code",
              "description",
            ),
          ]);
          setPriceBasisList([
            { value: "", label: "" },
            ...formatOptions(data?.priceBasisList || [], "code", "description"),
          ]);
          setCurrencyList([
            { value: "", label: "" },
            ...formatOptions(
              data?.currencyList || [],
              "curr_code",
              "curr_desc",
            ),
          ]);

          if (formStatus === "Insert") {
            const docType = data?.allowedDocTypes?.[0];

            setFormData((prev) => {
              return {
                ...prev,

               po_type: docType === "PA" ? "A": docType === "PO" ? "O" : "",
                trans_year: user.global_fin_year,
                division_id: user.global_division_id || 1,
                // po_id: data?.new_po_id || null,
                po_date: new Date().toISOString().split("T")[0],

                 // DEFAULTS
                curr_desc: prev.curr_desc || "RUPEES",
                curr_cd: prev.curr_cd || "INR",
                curr_conv: prev.curr_conv || 1,

                pric_basis: prev.pric_basis || "2010",
                mode_cd: prev.mode_cd || "301",

                term_code: prev.term_code || "2099",
                term_desc: prev.term_desc || "- 100% PAYMENT AGAINST INVOICE SUBMISSION AFTER 15 days",

              };
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    if ((formStatus && formStatus == "Insert") || formStatus == "Query") {
      fetchConstantList();
    }
  }, [formStatus]);

  // useEffect(() => {
  //   if (formStatus === "Insert") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       curr_cd: "INR",
  //       curr_desc: "RUPEES",
  //       curr_conv: 1,
  //       term_code: "2099",
  //       term_desc: "- 100% PAYMENT AGAINST INVOICE SUBMISSION AFTER 15 days",
  //     }));
  //   }
  // }, [formStatus]);

  // HELP LIST HANDLING

  
  const handleHelpList = (show) => {
    setHelpList(show);
  };

  const makeFocusOnTableRow = (rowIndex, row_id) => {
    // console.log(rowIndex, row_id);
    const entry = itemFormData.find((entry) => entry.row_id === row_id);
    setFocusedRowIndex(rowIndex);
  };

  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader, index = null) => {
    if (["Insert", "Update", "Search"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
      // setRecordIndex(index);
    }
  };

  // SELECTING ITEM FROM HELPLIST
  const onSelectHelpItem = (data) => {
    //console.log(data);
    let index = focusedRowIndex;

    if (helpFor === "payTerm") {
      setFormData((prev) => {
        const updated = {
          ...prev,
          term_code: data.term_code,
          term_desc: data.term_desc,
        };

        // INSERT & UPDATE
        if (formStatus === "Update" && prev.term_code !== data.term_code) {
          updateFormData.current.poHdr = {
            ...(updateFormData.current.poHdr || {}),
            term_code: data.term_code,
          };
        }

        return updated;
      });
    }
    // if (helpFor === "vendor") {
    //   setFormData((prev) => {
    //     return {
    //       ...prev,
    //       v_code: data.v_code,
    //       v_name: data.v_name,
    //       curr_cd: data.curr_cd,
    //       curr_conv: data.curr_cd == "INR" ? 1 : "",
    //     };
    //   });
    // }

    if (helpFor === "vendor") {
      setFormData((prev) => {
        const updated = {
          ...prev,
          v_code: data.v_code,
          v_name: data.v_name,
          // curr_cd: data.curr_cd,
          // curr_conv: data.curr_cd == "INR" ? 1 : "",
        };

        //  TRACK HEADER CHANGES
        if (formStatus === "Update" && prev.v_code !== data.v_code) {
          updateFormData.current.poHdr = {
            ...(updateFormData.current.poHdr || {}),
            v_code: data.v_code,
            // curr_cd: data.curr_cd,
          };
        }

        return updated;
      });
    }

    if (helpFor === "shipTo") {
      setFormData((prev) => {
        const updated = {
          ...prev,
          c_code: data.c_code,
          c_name: data.c_name,
          city: data.city, // added city in ship to help list selection
          dealer_code: data.dealer_code, // added dealer code in ship to help list selection
        };

        //  TRACK HEADER CHANGES
        if (formStatus === "Update" && prev.c_code !== data.c_code) {
          updateFormData.current.poHdr = {
            ...(updateFormData.current.poHdr || {}),
            c_code: data.c_code,
            c_name: data.c_name,
          };
        }

        return updated;
      });
    }
    if (helpFor === "AdvanceGL") {
      setFormData((prev) => {
        const updated = {
          ...prev,
          adv_gl_acc_no: data.acc_no,
          acc_desc: data.acc_desc,
        };

        //  TRACK HEADER CHANGES
        if (formStatus === "Update" && prev.adv_gl_acc_no !== data.acc_no) {
          updateFormData.current.poHdr = {
            ...(updateFormData.current.poHdr || {}),
            adv_gl_acc_no: data.acc_no,
            acc_desc: data.acc_desc,
          };
        }

        return updated;
      });
    }
    // added by akshay for duplicate item code check at UI level.
    // else if (helpFor === "it_code") {
    //   setItemFormData((prevData) => {
    //     const newData = [...prevData];
    //     const selectedItCode = data.it_code;

    //     //  DUPLICATE CHECK (UI LEVEL)
    //     const isDuplicate = newData.some(
    //       (row, i) =>
    //         i !== focusedRowIndex && // exclude current row
    //         row.it_code === selectedItCode,
    //     );

    //     if (isDuplicate) {
    //       toast.error("Duplicate Item Code not allowed in same PO");
    //       return prevData; //  HARD BLOCK (Oracle trigger_failure)
    //     }

    //     const prevRow = newData[focusedRowIndex];

    //     const updatedRow = {
    //       ...prevRow,
    //       it_code: selectedItCode,
    //       desc: data.it_name,
    //       uom: data.uom,
    //       it_name_long: data.it_name_long,
    //       // subsidy_applicable: data.subsidy_applicable,
    //       // subsidy_original: data.subsidy_applicable,
    //       subsidy_yes_no: data.subsidy_yes_no,
    //       po_mat_rat: data.it_rate,
    //     };

    //     newData[focusedRowIndex] = updatedRow;

    //     return newData;
    //   });
    // }
    else if (helpFor === "it_code") {
      
         const selectedItCode = data.it_code; 

  setItemFormData((prevData) => {
    const newData = [...prevData];
    const selectedItCode = data.it_code;

    // Duplicate Check
    const isDuplicate = newData.some(
      (row, i) =>
        i !== focusedRowIndex &&
        row.it_code === selectedItCode
    );

    if (isDuplicate) {
      toast.error("Duplicate Item Code not allowed in same PO");
      return prevData;
    }

    const prevRow = newData[focusedRowIndex];

    newData[focusedRowIndex] = {
      ...prevRow,
      it_code: selectedItCode,
      desc: data.it_name,
      it_name_long: data.it_name_long,
      uom: data.it_pu_um,
      subsidy_yes_no: data.subsidy_yes_no || "N",
    };

    return newData;
  });

  // 🔥 Existing handleChange logic reuse karo
  handleChange(
    null,
    "po_mat_rat",
    Number(data.it_rate),
    focusedRowIndex,
    "poDetailData"
  );

  // Payload tracking
  if (formStatus === "Update") {
    updateFormData.current.poDtl ||= [];

    const row = itemFormData[focusedRowIndex];

    let alreadyUpdated = updateFormData.current.poDtl.find(
      (r) =>
        r.original_it_code ===
        (row.original_it_code || row.it_code)
    );

    if (alreadyUpdated) {
      alreadyUpdated.po_mat_rat = Number(data.it_rate);
    } else {
      updateFormData.current.poDtl.push({
        it_code: selectedItCode,
        original_it_code: row.original_it_code || row.it_code,
        po_mat_rat: Number(data.it_rate),
      });
    }
  }
}
  };

  const whereClauseForHelp = (helpFor) => {
    // console.log("formData data", formData);
    if (helpFor === "doc") {
      return { acc_no: formData[focusedRowIndex]?.acc_no };
    }
    return {};
  };

  const updateActiveTab = useCallback(
    (tab) => {
      //  Only validate when moving to ITEM TAB
      if (tab === 2 && ["Insert", "Update"].includes(formStatus)) {
        const isValidMainTab = validateForm(
          "purchase-order-main-form",
          "Purchase Order Main Form",
        );

        if (!isValidMainTab) {
          toast.error(
            "Fill all required fields in Main tab before moving to Item tab",
          );
          return;
        }
      }

      setActiveTab(tab);
    },
    [formStatus],
  );

  const chargesPayload = Object.keys(billFormData || {}).map((key) => {
    const row = billFormData[key];

    return {
      po_id: formData?.po_id,
      chg_component: key,
      flag: row.flag || "",
      amount: row.amount === "" ? null : Number(row.amount),
      computed_amt: row.computed_amt === "" ? null : Number(row.computed_amt),
      subsidy_amt: row.subsidy_amt === "" ? null : Number(row.subsidy_amt),
      sub_aplicable: row.sub_aplicable || "N",
    };
  });

  async function handleSubmit(e) {
    e.preventDefault();

    let payload = null;
    let method = "POST";

    // Validate Header Form
    const isValidFormData = validateForm(
      "purchase-order-main-form",
      "Purchase Order Main Form",
    );

    if (!isValidFormData) {
      toast.error("Please fill required header data first");
      return;
    }

    // Validate Detail Form
    const isValidNarration = validateForm(
      "purchase-order-item-form",
      " Purchase Order Items Detail",
    );
    if (!isValidNarration) {
      toast.error("Please fill required item details");
      return;
    }
    // dispatch(setLoader({ key: "form", value: true })); // Start loader
    // Always set payload to avoid undefined

    // const finalItemData = itemFormData.map((row) => ({
    //   ...row,
    //   po_id: formData.po_id, // force latest
    // }));
const finalItemData = [...itemFormData];
    payload = {
      formHdrData: { ...formData,
       trans_year: user.global_fin_year,
       user_id: user.id,
       division_id: 1,
       },
      formItemData: finalItemData,
      formChargesData: chargesPayload,
    };

    if (formStatus === "Insert") {
      // INSERT: send all data
      payload = {
        formHdrData: {
          ...formData,
          trans_year: user.global_fin_year,
          division_id: 1,
          user_id: user.id,
          amd_no: 0, // as discuss with amit for setting default value of 0 for amd_no and flag as 'N' for new record for calling procedure create_po_in_mhmmpo
          flag: "N",
        },

        formItemData: finalItemData,
        formChargesData: chargesPayload,
      };
    }

    if (formStatus === "Update") {
      const newRows = itemFormData.filter((row) => !row.original_it_code);

      payload = {
        po_id: formData.po_id,
        changedHdrFields: updateFormData.current.poHdr || {},
        changedItemRows: updateFormData.current.poDtl || [],
        deletedItemData: updateFormData.current.deletedPo || [],

        newItemRows: newRows,
        formChargesData: chargesPayload,
      };
    }

// console.log("PO VALUE =", formData.po_value);

// console.log("BASIC VALUE =", billFormData["BASIC VALUE"]);

// console.log(
//   "Charge Payload =",
//   formChargesData.find(x => x.chg_component === "BASIC VALUE")
// );

    // console.log("Form Payload:", payload);

    try {
      const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.POST_PRCH_ORDR_DATA
      }?form_status=${formStatus}&userId=${user.id}`;

      const response = await fetch(apiUrl, {
        method: formStatus === "Update" ? "PUT" : "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        let responseData = await response.json();
        toast.success("Record saved successfully");

        if (formStatus == "Insert") {
          showGeneratedInvNo(responseData?.genPoNo);
        }
        setActiveTab(1);
        formReset();
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
    } finally {
      // dispatch(setLoader({ key: "form", value: false })); // Start loader
    }
  }

  const formReset = (isCancelClicked = false) => {
    setFormData({});
    setItemFormData([]);
    setChargesMaster([]);
    setBillFormData({});
    // setUpdateItemData({})
    // setUpdateItemData([{}])
    setActiveTab(1);
    updateFormData.current = { poHdr: {}, poDtl: [], deletedPo: [] };
    // setUpdDeletedItemData([])
    // setDisabledField({inv_type:false})

    if (isCancelClicked) {
      return;
    }
    releaseFormStatus();
    if (formStatus == "Insert") {
      setTimeout(() => {
        setFormStatus("Insert");
      }, 0);
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  // for validate fields
  const otherQueryPera = {
    acc_no: formData[focusedRowIndex]?.acc_no,
    doc_dt: formData[focusedRowIndex]?.doc_dt,
  };

  const fetchValidation = async (
    param,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null,
  ) => {
    try {
      const queryParams = new URLSearchParams({
        param,
        [param]: fieldValue,
        ...otherQueryPera,
        appDivisionId: user?.global_division_id,
        appFinYear: user?.global_fin_year,
        appUserId: user?.id,
      });

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_VALIDATE_BLOCK_PAYMENT
      }/?${queryParams.toString()}`;

      const response = await fetch(API_STRING);
      const data = await response.json();

      return { ok: response.ok, data };
    } catch (err) {
      console.error("Error validating:", err);
      toast.error("Something went wrong while validating the data.");
      return { ok: false, data: { error: "Network error" } };
    }
  };

  const getValidateData = async (
    param,
    value,
    otherQueryPera = {},
    rowIndex = null,
  ) => {
    switch (param) {
      case "acc_no":
        return await getValidateAccData(value, otherQueryPera, rowIndex);

      case "doc_no":
        return await getValidateDocData(value, otherQueryPera, rowIndex);

      default:
        console.warn(`Validation not implemented for param: ${param}`);
        return true;
    }
  };

  // for acc no
  const getValidateAccData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null,
  ) => {
    const { ok, data } = await fetchValidation(
      "acc_no",
      fieldValue,
      otherQueryPera,
      rowIndex,
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Account");

      return false;
    }

    if (data.data && rowIndex !== null) {
      const accData = data.data;
      setFormData((prev) => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            acc_desc: accData.v_name,
          };
        }
        return updated;
      });
    }

    return true;
  };

  // doc no
  const getValidateDocData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null,
  ) => {
    const { ok, data } = await fetchValidation(
      "doc_no",
      fieldValue,
      otherQueryPera,
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid doc no");
      if (data.data && rowIndex !== null) {
        const docData = data.data;
        setFormData((prev) => {
          const updated = [...prev];
          if (updated[rowIndex]) {
            updated[rowIndex] = {
              ...updated[rowIndex],
              doc_dt: docData.doc_dt,
            };
          }
          return updated;
        });
      }

      return false;
    }

    return true;
  };

  const handleCancel = useCallback(() => {
    formReset(true);
    releaseFormStatus();
  }, []);

  // convert the nvl like functionality
  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };

  // JS version of Oracle procpovalue_gst
  const recalcPoHeaderFromItems = (items, hdr) => {
    // Clone header so we don't mutate directly
    let newHdr = { ...hdr };

    // Initialize totals like Oracle
    let T_GST_SGST_AMT = 0;
    let T_GST_SGST_CESS_AMT = 0;
    let T_GST_UGST_AMT = 0;
    let T_GST_UGST_CESS_AMT = 0;
    let T_GST_CGST_AMT = 0;
    let T_GST_CGST_CESS_AMT = 0;
    let T_GST_IGST_AMT = 0;
    let T_GST_IGST_CESS_AMT = 0;

    let ntot_basic = 0;

    // ---- 1st LOOP: calculate total assessable value (ntot_basic) ----
    items.forEach((row) => {
      if (!row || !row.it_code) return;

      const po_qty_ord = toNum(row.po_qty_ord);
      const po_mat_rat = toNum(row.po_mat_rat);
      const po_perunit = toNum(row.po_perunit) || 1; // NVL(i.po_perunit, 1)

      const po_disc = toNum(row.po_disc);
      const po_disc_val = toNum(row.po_disc_val);

      // nrt := po_mat_rat / po_perunit;
      const nrt = po_mat_rat / po_perunit;

      // Oracle logic:
      // IF (po_disc IS NOT NULL) OR (po_disc != 0) THEN
      //    ndiscamt := nrt * (po_disc / 100)
      // ELSE
      //    ndiscamt := po_disc_val;
      // END IF;
      let ndiscamt = 0;
      if (po_disc !== 0) {
        ndiscamt = nrt * (po_disc / 100);
      } else {
        ndiscamt = po_disc_val;
      }

      // nrate := nrt - ndiscamt;
      const nrate = nrt - ndiscamt;

      // nbasic_val := nrate * po_qty_ord;
      const nbasic_val = nrate * po_qty_ord;

            if (row.it_code === "FT12") {
  console.log({
    po_mat_rat,
    po_qty_ord,
    po_perunit,
    nrt,
    ndiscamt,
    nbasic_val,
  });
}

      ntot_basic = ntot_basic + nbasic_val;

      // ---- GST per item (approx of FILL_GST_DTL_ITEMWISE) ----
      const gstMode = row.gst_amt_prc || "%"; // "%" or "V"
      const baseForGst = nbasic_val; // assessable value for GST

      const sgstVal = toNum(row.gst_sgst_val);
      const sgstCessVal = toNum(row.gst_sgst_cess_val);
      const ugstVal = toNum(row.gst_ugst_val);
      const ugstCessVal = toNum(row.gst_ugst_cess_val);
      const cgstVal = toNum(row.gst_cgst_val);
      const cgstCessVal = toNum(row.gst_cgst_cess_val);
      const igstVal = toNum(row.gst_igst_val);
      const igstCessVal = toNum(row.gst_igst_cess_val);

      let sgstAmt = 0,
        sgstCessAmt = 0,
        ugstAmt = 0,
        ugstCessAmt = 0,
        cgstAmt = 0,
        cgstCessAmt = 0,
        igstAmt = 0,
        igstCessAmt = 0;

      if (gstMode === "V") {
        // User entered absolute amount (Value)
        sgstAmt = sgstVal;
        sgstCessAmt = sgstCessVal;
        ugstAmt = ugstVal;
        ugstCessAmt = ugstCessVal;
        cgstAmt = cgstVal;
        cgstCessAmt = cgstCessVal;
        igstAmt = igstVal;
        igstCessAmt = igstCessVal;
      } else {
        // "%" mode – interpret *_val as percentage
        sgstAmt = (baseForGst * sgstVal) / 100;
        sgstCessAmt = (baseForGst * sgstCessVal) / 100;
        ugstAmt = (baseForGst * ugstVal) / 100;
        ugstCessAmt = (baseForGst * ugstCessVal) / 100;
        cgstAmt = (baseForGst * cgstVal) / 100;
        cgstCessAmt = (baseForGst * cgstCessVal) / 100;
        igstAmt = (baseForGst * igstVal) / 100;
        igstCessAmt = (baseForGst * igstCessVal) / 100;
      }

      // Accumulate into header-level totals (T_GST_* variables)
      T_GST_SGST_AMT += sgstAmt;
      T_GST_SGST_CESS_AMT += sgstCessAmt;
      T_GST_UGST_AMT += ugstAmt;
      T_GST_UGST_CESS_AMT += ugstCessAmt;
      T_GST_CGST_AMT += cgstAmt;
      T_GST_CGST_CESS_AMT += cgstCessAmt;
      T_GST_IGST_AMT += igstAmt;
      T_GST_IGST_CESS_AMT += igstCessAmt;
    });

    // ---- Packing / forwarding as per Oracle logic (if you later add fields) ----
    const packFor = toNum(newHdr.pack_for); // :pack_for
    const packForValue = toNum(newHdr.pack_for_value); // :pack_for_value

    if (packFor > 0 || packForValue > 0) {
      if (packFor > 0) {
        ntot_basic = ntot_basic + (packFor / 100) * ntot_basic;
      } else {
        ntot_basic = ntot_basic + packForValue;
      }
    }

    // ---- Other charges – assume already filled in header (like Oracle does via CALC_FRT_INS_GST) ----
    const nIt_pack_forw_chgs = toNum(newHdr.nIt_pack_forw_chgs); // nit_pack_forw_chgs
    const INS_CHG_VALUE = toNum(newHdr.ins_chg_value || newHdr.INS_CHG_VALUE);
    const FRT_CHG_VALUE = toNum(newHdr.frt_chg_value || newHdr.FRT_CHG_VALUE);

    // ---- Final PO Value (nTot_Amt) ----
    const nTot_Amt =
      ntot_basic +
      nIt_pack_forw_chgs +
      T_GST_SGST_AMT +
      T_GST_SGST_CESS_AMT +
      T_GST_UGST_AMT +
      T_GST_UGST_CESS_AMT +
      T_GST_CGST_AMT +
      T_GST_CGST_CESS_AMT +
      T_GST_IGST_AMT +
      T_GST_IGST_CESS_AMT +
      INS_CHG_VALUE +
      FRT_CHG_VALUE;

    // ---- Push totals into header hidden fields (like :T_GST_* and :MHMMPOAMD.po_value) ----
    newHdr = {
      ...newHdr,
      ntot_basic: ntot_basic, // optional, for debugging
      t_gst_sgst_amt: T_GST_SGST_AMT,
      t_gst_sgst_cess_amt: T_GST_SGST_CESS_AMT,
      t_gst_ugst_amt: T_GST_UGST_AMT,
      t_gst_ugst_cess_amt: T_GST_UGST_CESS_AMT,
      t_gst_cgst_amt: T_GST_CGST_AMT,
      t_gst_cgst_cess_amt: T_GST_CGST_CESS_AMT,
      t_gst_igst_amt: T_GST_IGST_AMT,
      t_gst_igst_cess_amt: T_GST_IGST_CESS_AMT,
      po_value: Number.isFinite(nTot_Amt)
        ? nTot_Amt.toFixed(2)
        : newHdr.po_value || "",
      total_amount: Number.isFinite(nTot_Amt)
        ? nTot_Amt.toFixed(2)
        : newHdr.po_value || "",
    };

    return newHdr;
  };

  // const handleChange = useCallback(
  //   (event, name, value, index = null, block = null) => {
  //     if (!["Insert", "Update", "Search"].includes(formStatus)) {
  //       return;
  //     }

  //     const cursorPosition = event?.target?.selectionStart;
  //     let newVal = value;

  //     if (typeof value !== "number" && typeof value === "string") {
  //       newVal = newVal.toUpperCase();
  //     }

  //     switch (block) {
  //       case "poHdrData":
  //         setFormData((prev) => {
  //           const updated = { ...prev, [name]: newVal };

  //           // ===============================
  //           // 🔐 PO DATE VALIDATION (Oracle-style)
  //           // ===============================
  //           if (formStatus !== "Search") {
  //             const poEffDt = name === "po_eff_dt" ? newVal : updated.po_eff_dt;
  //             const poEndDt = name === "po_end_dt" ? newVal : updated.po_end_dt;

  //             // PO End Date mandatory
  //             if (name === "po_end_dt" && !newVal) {
  //               toast.error("PO End Date cannot be blank");
  //               return prev; // form_trigger_failure
  //             }

  //             if (name === "po_eff_dt" && !newVal) {
  //               toast.error("PO Effective Date cannot be blank");
  //               return prev; // form_trigger_failure
  //             }

  //             // Date comparison only if both exist
  //             if (poEffDt && poEndDt) {
  //               if (new Date(poEndDt) < new Date(poEffDt)) {
  //                 toast.error("PO End Date cannot be less than Effective Date");
  //                 return prev; // rollback change
  //               }
  //             }
  //           }

  //           // ===============================
  //           // Existing logic (unchanged)
  //           // ===============================
  //           if (name === "curr_cd" && newVal === "INR") {
  //             updated.curr_conv = 1;
  //           }

  //           // ✅ TRACK HEADER FIELD CHANGES
  //           if (formStatus === "Update" && prev[name] !== newVal) {
  //             updateFormData.current.poHdr = {
  //               ...(updateFormData.current.poHdr || {}),
  //               [name]: newVal,
  //             };
  //           }

  //           return updated;
  //         });
  //         break;

  //       case "poDetailData":
  //         setItemFormData((prevData) => {
  //           const newData = [...prevData];
  //           const prevRow = newData[index] || {};
  //           if (
  //             name === "po_qty_ord" ||
  //             name === "po_mat_rat" ||
  //             name === "po_perunit" ||
  //             name === "po_disc" ||
  //             name === "po_disc_val"
  //           ) {
  //             const positiveDecimalRegex = /^(?!0(\.0+)?$)\d+(\.\d+)?$/;

  //             if (newVal === "") {
  //               newVal = "";
  //             } else if (!positiveDecimalRegex.test(newVal)) {
  //               return prevData;
  //             }
  //           }
  //           const updatedRow = { ...prevRow, [name]: newVal };
  //           newData[index] = updatedRow;

  //           // ---- Oracle-style item-level amount calc ----
  //           const po_qty_ord = toNum(updatedRow.po_qty_ord);
  //           const po_mat_rat = toNum(updatedRow.po_mat_rat);
  //           const po_perunit = toNum(updatedRow.po_perunit) || 1;

  //           const nrt = po_mat_rat / po_perunit;
  //           const po_disc = toNum(updatedRow.po_disc);
  //           let po_disc_val = toNum(updatedRow.po_disc_val);

  //           if (
  //             ["po_disc", "po_qty_ord", "po_mat_rat", "po_perunit"].includes(
  //               name,
  //             )
  //           ) {
  //             if (po_disc !== 0) {
  //               const discPerUnit = nrt * (po_disc / 100);
  //               po_disc_val = discPerUnit;
  //               updatedRow.po_disc_val = po_disc_val;
  //             }
  //           }

  //           const ndiscamt =
  //             po_disc !== 0 ? nrt * (po_disc / 100) : po_disc_val;
  //           const nrate = nrt - ndiscamt;
  //           const nbasic_val = nrate * po_qty_ord;

  //           const oldAmount = prevRow.amount;
  //           updatedRow.amount = Number.isFinite(nbasic_val)
  //             ? Number(nbasic_val.toFixed(2))
  //             : updatedRow.amount;

  //           // ✅ TRACK ITEM FIELD CHANGES (including calculated amount)
  //           if (formStatus === "Update" && prevRow[name] !== newVal) {
  //             updateFormData.current.poDtl ||= [];

  //             // const alreadyUpdated = updateFormData.current.poDtl.find(
  //             //   (r) => r.srl_no === updatedRow.srl_no
  //             // );

  //             // const keyField = updatedRow.row_id ? "row_id" : "it_code";
  //             const keyField = "it_code";

  //             const alreadyUpdated = updateFormData.current.poDtl.find(
  //               (r) => r[keyField] === updatedRow[keyField],
  //             );

  //             if (alreadyUpdated) {
  //               alreadyUpdated[name] = newVal;

  //               alreadyUpdated.original_it_code =
  //                 prevRow.original_it_code || prevRow.it_code; // 🔥 IMPORTANT
  //             } else {
  //               const trackObj = {
  //                 it_code: updatedRow.it_code,
  //                 original_it_code: prevRow.original_it_code || prevRow.it_code, // 🔥 GOLD LINE
  //                 [name]: newVal,
  //               };

  //               if (oldAmount !== updatedRow.amount) {
  //                 trackObj.amount = updatedRow.amount;
  //               }
  //               updateFormData.current.poDtl.push(trackObj);
  //             }
  //           }

  //           // ---- HEADER RECALC: JS version of procpovalue_gst ----
  //           setFormData((prevHdr) => {
  //             const newHdr = recalcPoHeaderFromItems(newData, prevHdr);

  //             // ✅ ADD THIS
  //             setBillFormData((prevCharges) => {
  //               if (!prevCharges || Object.keys(prevCharges).length === 0)
  //                 return prevCharges;

  //               const updated = { ...prevCharges };

  //               Object.keys(updated).forEach((key) => {
  //                 // 🔥 BASIC VALUE auto sync
  //                 if (key === "BASIC VALUE") {
  //                   updated[key].amount = Number(newHdr.ntot_basic || 0);
  //                 }

  //                 // 🔥 GST auto sync
  //                 if (key === "IGST") {
  //                   updated[key].amount = Number(newHdr.t_gst_igst_amt || 0);
  //                 }
  //                 if (key === "CGST") {
  //                   updated[key].amount = Number(newHdr.t_gst_cgst_amt || 0);
  //                 }
  //                 if (key === "SGST") {
  //                   updated[key].amount = Number(newHdr.t_gst_sgst_amt || 0);
  //                 }

  //                 // 🔥 recalc each row
  //                 updated[key] = calculateRow(
  //                   key,
  //                   updated[key],
  //                   updated,
  //                   newHdr,
  //                   newData,
  //                 );
  //               });

  //               return updated;
  //             });

  //             //  TRACK CALCULATED HEADER FIELDS AFTER RECALC
  //             if (formStatus === "Update") {
  //               const calculatedFields = [
  //                 "t_gst_sgst_amt",
  //                 "t_gst_sgst_cess_amt",
  //                 "t_gst_ugst_amt",
  //                 "t_gst_ugst_cess_amt",
  //                 "t_gst_cgst_amt",
  //                 "t_gst_cgst_cess_amt",
  //                 "t_gst_igst_amt",
  //                 "t_gst_igst_cess_amt",
  //                 "ntot_basic",
  //                 "po_value",
  //                 "total_amount",
  //               ];

  //               calculatedFields.forEach((field) => {
  //                 if (prevHdr[field] !== newHdr[field]) {
  //                   updateFormData.current.poHdr = {
  //                     ...(updateFormData.current.poHdr || {}),
  //                     [field]: newHdr[field],
  //                   };
  //                 }
  //               });
  //             }

  //             return newHdr;
  //           });

  //           return newData;
  //         });
  //         break;

  //       default:
  //         break;
  //     }

  //     // Restore cursor position
  //     if (
  //       event?.target &&
  //       ["INPUT", "TEXTAREA"].includes(event.target.tagName) &&
  //       !["number", "radio", "checkbox", "date"].includes(event.target.type)
  //     ) {
  //       setTimeout(() => {
  //         event.target.setSelectionRange(cursorPosition, cursorPosition);
  //       }, 0);
  //     }
  //   },
  //   [formStatus],
  // );

    const updateTotalPoValue = (billData) => {
    const total = Object.values(billData || {}).reduce(
      (sum, row) => sum + Number(row?.computed_amt || 0),
      0
    );

    setFormData(prev => ({
      ...prev,
      total_po_value: Number(total.toFixed(2)),
    }));
  };



const handleChange = useCallback(
    (event, name, value, index = null, block = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      const cursorPosition = event?.target?.selectionStart;
      let newVal = value;

      if (typeof value !== "number" && typeof value === "string") {
        newVal = newVal.toUpperCase();
      }

      console.log({
  name,
  value,
  type: typeof value
});

      switch (block) {
        case "poHdrData":
          setFormData((prev) => {
            const updated = { ...prev, [name]: newVal };

const formatDate = (date) => {

  if (!date) return "";

  // already yyyy-mm-dd string
  if (typeof date === "string") {
    return date;
  }

  const y = date.getFullYear();

  const m = String(date.getMonth() + 1)
    .padStart(2, "0");

  const d = String(date.getDate())
    .padStart(2, "0");

  return `${y}-${m}-${d}`;
};

const isCompleteDate = (dateStr) => {

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const year = Number(dateStr.split("-")[0]);

  // realistic year check
  if (year < 2000 || year > 2100) {
    return false;
  }

  return true;
};
const convertToDate = (dateStr) => {

  return new Date(dateStr);
};

            // ===============================
            // PO DATE VALIDATION (Oracle-style)
            // ===============================
            // if (formStatus !== "Search") {
            //   const poEffDt = name === "po_eff_dt" ? newVal : updated.po_eff_dt;
            //   const poEndDt = name === "po_end_dt" ? newVal : updated.po_end_dt;

            //   // PO End Date mandatory
            //   if (name === "po_end_dt" && !newVal) {
            //     toast.error("PO End Date cannot be blank");
            //     return prev; // form_trigger_failure
            //   }

            //   if (name === "po_eff_dt" && !newVal) {
            //     toast.error("PO Effective Date cannot be blank");
            //     return prev; // form_trigger_failure
            //   }

            //   // Date comparison only if both exist
            //   if (poEffDt && poEndDt) {
            //     if (new Date(poEndDt) < new Date(poEffDt)) {
            //       toast.error("PO End Date cannot be less than Effective Date");
            //       return prev; // rollback change
            //     }
            //   }
            // }

            if (formStatus !== "Search") {

  const poEffDt = formatDate(
    name === "po_eff_dt"
      ? newVal
      : updated.po_eff_dt
  );

  const poEndDt = formatDate(
    name === "po_end_dt"
      ? newVal
      : updated.po_end_dt
  );

  // allow clear
  if (name === "po_end_dt" && !newVal) {

    updated.po_end_dt = "";

    return updated;
  }

  if (name === "po_eff_dt" && !newVal) {

    updated.po_eff_dt = "";

    return updated;
  }

  // validate only if both exist
  if (
  isCompleteDate(poEffDt) &&
  isCompleteDate(poEndDt)
) {

    const effDate = convertToDate(poEffDt);

    const endDate = convertToDate(poEndDt);

    if (endDate.getTime() < effDate.getTime()) {

      toast.error(
        "PO End Date cannot be less than Effective Date"
      );

      updated.po_end_dt = prev.po_end_dt;

      return updated;
    }
  }
}

            // ===============================
            // Existing logic (unchanged)
            // ===============================
            if (name === "curr_cd" && newVal === "INR") {
              updated.curr_conv = 1;
            }

            // ✅ TRACK HEADER FIELD CHANGES
            if (formStatus === "Update" && prev[name] !== newVal) {
              updateFormData.current.poHdr = {
                ...(updateFormData.current.poHdr || {}),
                [name]: newVal,
              };
            }

            return updated;
          });
          break;

        case "poDetailData":
          setItemFormData((prevData) => {
            const newData = [...prevData];
            const prevRow = newData[index] || {};
            if (
              name === "po_qty_ord" ||
              name === "po_mat_rat" ||
              name === "po_perunit" ||
              name === "po_disc" ||
              name === "po_disc_val"
            ) {
              const positiveDecimalRegex = /^(?!0(\.0+)?$)\d+(\.\d+)?$/;

              if (newVal === "") {
                newVal = "";
              } else if (!positiveDecimalRegex.test(newVal)) {
                return prevData;
              }
            }
            const updatedRow = { ...prevRow, [name]: newVal };
            newData[index] = updatedRow;

            // ---- Oracle-style item-level amount calc ----
            const po_qty_ord = toNum(updatedRow.po_qty_ord);
            const po_mat_rat = toNum(updatedRow.po_mat_rat);
            const po_perunit = toNum(updatedRow.po_perunit) || 1;

            const nrt = po_mat_rat / po_perunit;
            const po_disc = toNum(updatedRow.po_disc);
            let po_disc_val = toNum(updatedRow.po_disc_val);

            if (
              ["po_disc", "po_qty_ord", "po_mat_rat", "po_perunit"].includes(
                name,
              )
            ) {
              if (po_disc !== 0) {
                const discPerUnit = nrt * (po_disc / 100);
                po_disc_val = discPerUnit;
                updatedRow.po_disc_val = po_disc_val;
              }
            }

            const ndiscamt =
              po_disc !== 0 ? nrt * (po_disc / 100) : po_disc_val;
            const nrate = nrt - ndiscamt;
            const nbasic_val = nrate * po_qty_ord;

            const oldAmount = prevRow.amount;
            updatedRow.amount = Number.isFinite(nbasic_val)
              ? Number(nbasic_val.toFixed(2))
              : updatedRow.amount;

            // ✅ TRACK ITEM FIELD CHANGES (including calculated amount)
            if (formStatus === "Update" && prevRow[name] !== newVal) {
              updateFormData.current.poDtl ||= [];

              // const alreadyUpdated = updateFormData.current.poDtl.find(
              //   (r) => r.srl_no === updatedRow.srl_no
              // );

              // const keyField = updatedRow.row_id ? "row_id" : "it_code";
              const keyField = "it_code";

              const alreadyUpdated = updateFormData.current.poDtl.find(
                (r) => r[keyField] === updatedRow[keyField],
              );

              if (alreadyUpdated) {
                alreadyUpdated[name] = newVal;

                alreadyUpdated.original_it_code =
                  prevRow.original_it_code || prevRow.it_code; // 🔥 IMPORTANT
              } else {
                const trackObj = {
                  it_code: updatedRow.it_code,
                  original_it_code: prevRow.original_it_code || prevRow.it_code, // 🔥 GOLD LINE
                  [name]: newVal,
                };

                if (oldAmount !== updatedRow.amount) {
                  trackObj.amount = updatedRow.amount;
                }
                updateFormData.current.poDtl.push(trackObj);
              }
            }

            // ---- HEADER RECALC: JS version of procpovalue_gst ----
            setFormData((prevHdr) => {
  const newHdr = recalcPoHeaderFromItems(newData, prevHdr);

  // ✅ ADD THIS
  setBillFormData(prevCharges => {
    if (!prevCharges || Object.keys(prevCharges).length === 0) return prevCharges;

    const updated = { ...prevCharges };

    Object.keys(updated).forEach(key => {

      // 🔥 BASIC VALUE auto sync
      if (key === "BASIC VALUE") {
        updated[key].amount = Number(newHdr.ntot_basic || 0);
      }

      // 🔥 GST auto sync
      if (key === "IGST") {
        updated[key].amount = Number(newHdr.t_gst_igst_amt || 0);
      }
      if (key === "CGST") {
        updated[key].amount = Number(newHdr.t_gst_cgst_amt || 0);
      }
      if (key === "SGST") {
        updated[key].amount = Number(newHdr.t_gst_sgst_amt || 0);
      }

      // 🔥 recalc each row
      updated[key] = calculateRow(
        key,
        updated[key],
        updated,
        newHdr,
        newData
      );
    });

    updateTotalPoValue(updated);

    return updated;
  });



              //  TRACK CALCULATED HEADER FIELDS AFTER RECALC
              if (formStatus === "Update") {
                const calculatedFields = [
                  "t_gst_sgst_amt",
                  "t_gst_sgst_cess_amt",
                  "t_gst_ugst_amt",
                  "t_gst_ugst_cess_amt",
                  "t_gst_cgst_amt",
                  "t_gst_cgst_cess_amt",
                  "t_gst_igst_amt",
                  "t_gst_igst_cess_amt",
                  "ntot_basic",
                  "po_value",
                  "total_amount",
                ];

                calculatedFields.forEach((field) => {
                  if (prevHdr[field] !== newHdr[field]) {
                    updateFormData.current.poHdr = {
                      ...(updateFormData.current.poHdr || {}),
                      [field]: newHdr[field],
                    };
                  }
                });
              }

              return newHdr;
            });

            return newData;
          });
          break;

        default:
          break;
      }

      // Restore cursor position
      if (
        event?.target &&
        ["INPUT", "TEXTAREA"].includes(event.target.tagName) &&
        !["number", "radio", "checkbox", "date"].includes(event.target.type)
      ) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    },
    [formStatus],
  );


  const validateItemCode = async (
    onSubmit,
    validationItemIndex,
    formStatus,
  ) => {
    if (!["Insert", "Update"].includes(formStatus)) return true;

    const index = onSubmit ? validationItemIndex : focusedRowIndex;
    const row = itemFormData[index];

    if (!row) return true;

    // UPDATE MODE  Check
    if (formStatus === "Update" && row.original_it_code === row.it_code) {
      return true; // SKIP VALIDATION
    }

    if (!helpList && !row?.it_code) {
      toast.error("Item Code cannot be empty");
      return false;
    }

    if (row.it_code && !onSubmit) {
      return await getItemCodeDependentData(
        row.it_code,
        formData?.v_code,
        // formData?.po_id,
      );
    }

    return true;
  };



const getItemCodeDependentData = async (it_code, v_code) => {

 const duplicateExists = itemFormData.some(
  (row, i) =>
    i !== focusedRowIndex &&
    row.it_code?.trim()?.toUpperCase() ===
      it_code?.trim()?.toUpperCase()
);

if (duplicateExists) {

  toast.error("Duplicate Item Code not allowed in same PO");

  setItemFormData((prev) => {
    const updated = [...prev];

    updated[focusedRowIndex] = {
      ...updated[focusedRowIndex],

      it_code: "",
      desc: "",
      hsn_sac_code: "",
      uom: "",
      stock_um: "",
      subsidy_applicable: "N",
      subsidy_original: "N",
    };

    return updated;
  });

  return false;
}

    if (!v_code) {
       toast.error("Vendor Code should be filled to fetch HSN Code");


      setItemFormData((prevData) => {
        const newData = [...prevData];

        const apiRow = Array.isArray(data?.data) ? data.data[0] : data.data;

        newData[focusedRowIndex] = {
          ...newData[focusedRowIndex],
          ...apiRow,
        };

        return newData;
      });

      return false;
    }
    
console.log("formdata for po type", formData)

    try {

    
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.VALIDATE_PO_ITEM_CODE
        }?it_code=${it_code}&v_code=${v_code}&wc_id=1
        &po_end_dt=${formData?.po_end_dt}&po_eff_dt=${
          formData?.po_eff_dt
        }&po_type=${
          formData?.po_type
        }&c_code=${
          formData?.c_code
        }&division_id=${user.global_division_id}&trans_year=${
          user.global_fin_year
        }`,
        { credentials: "include" },
      );
      const data = await response.json();

      if (!data?.data?.hsn_sac_code) {
        throw new Error(data?.message || "validate item code failed");

        return false;
      } else {
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[focusedRowIndex] = {
            ...newData[focusedRowIndex],

            ...data?.data,
             subsidy_applicable: data?.data?.subsidy_applicable || data?.data?.sub_aplicable || "N",
             subsidy_original: data?.data?.subsidy_applicable || data?.data?.sub_aplicable || "N",
             
          };
          return newData;
        });
        return true;
      }
    } catch (error) {
      console.error("Error checking HSN code:", error);
      toast.error(error.message || "Error checking HSN code");
      return false;
    }
  };




const handleShiftEnterAddRow = (e) => {

  if (
    e.key === "Enter" 
    // &&
    // e.shiftKey
  ) {

    e.preventDefault();

    triggerAddRow();
  }
};

  const triggerAddRow = useCallback(() => {

  const isValidNarration = validateForm(
    "purchase-order-item-form",
    "Purchase Order Items Detail",
  );

  if (!isValidNarration) return;

  //  HSN validation
  if (itemFormData.length > 0) {
    const currentRow = itemFormData[itemFormData.length - 1];

    if (!currentRow?.hsn_sac_code?.trim()) {
      toast.error("HSN/SAC Code is required.");
      return;
    }
  }

  // if (!formData?.po_id) {

  //   toast.error(
  //     "PO ID missing. Save header first."
  //   );

  //   return;
  // }

  setItemFormData((prevData) => {

    const newData = [
      ...prevData,
      {
        row_id: uuidv4(),
        // po_id: formData.po_id,
      },
    ];

    const newIndex = newData.length - 1;

    setFocusedRowIndex(newIndex);

    // DOM FOCUS
    setTimeout(() => {

      itemRefs.current[newIndex]
        ?.focus();

    }, 0);

    return newData;
  });

}, [formData]);






  // const triggerAddRow = useCallback(() => {

  // const isValidNarration = validateForm(
  //     "purchase-order-item-form",
  //     "Purchase Order Items Detail"
  // );

  // if (!isValidNarration) return;

  // if (!formData?.po_id) {
  //     toast.error("PO ID missing. Save header first.");
  //     return;
  // }

  // setItemFormData(prevData => [
  //     ...prevData,
  //     {
  //       row_id: uuidv4(),

  //       //  MOST IMPORTANT LINE
  //       po_id: formData.po_id
  //     }
  // ]);

  //  }, [formData]);

  // const triggerAddRow = useCallback(() => {
  //   const isValidNarration = validateForm(
  //     "purchase-order-item-form",
  //     "Purchase Order Items Detail",
  //   );

  //   if (!isValidNarration) return;

  //   if (!formData?.po_id) {
  //     toast.error("PO ID missing. Save header first.");
  //     return;
  //   }

  //   setItemFormData((prevData) => {
  //     const newData = [
  //       ...prevData,
  //       {
  //         row_id: uuidv4(),
  //         po_id: formData.po_id,
  //       },
  //     ];

  //     //  MOVE FOCUS TO LAST ROW
  //     setFocusedRowIndex(newData.length - 1);

  //     return newData;
  //   });
  // }, [formData]);

  // const handleDeleteRow = (data, row_id) => {

  //   const rowToDelete = itemFormData.find(r => r.row_id === row_id);
  //   if (!rowToDelete) return;

  //   // Track DB delete
  //   if (rowToDelete.original_it_code) {

  //       updateFormData.current.deletedPo ||= [];

  //       const alreadyDeleted = updateFormData.current.deletedPo.find(
  //         d => d.it_code === rowToDelete.it_code
  //       );

  //       if (!alreadyDeleted) {
  //         updateFormData.current.deletedPo.push({
  //             it_code: rowToDelete.it_code
  //         });
  //       }
  //   }

  //   // 1️⃣ Remove row from UI
  //   const newItems = itemFormData.filter(r => r.row_id !== row_id);
  //   setItemFormData(newItems);

  //   // 2️⃣ 🔥 IMPORTANT — RECALCULATE HEADER
  //   setFormData(prevHdr => {

  //       const newHdr = recalcPoHeaderFromItems(newItems, prevHdr);

  //       if (formStatus === "Update") {

  //         const calculatedFields = [
  //             "t_gst_sgst_amt",
  //             "t_gst_sgst_cess_amt",
  //             "t_gst_ugst_amt",
  //             "t_gst_ugst_cess_amt",
  //             "t_gst_cgst_amt",
  //             "t_gst_cgst_cess_amt",
  //             "t_gst_igst_amt",
  //             "t_gst_igst_cess_amt",
  //             "ntot_basic",
  //             "po_value",
  //             "total_amount",
  //         ];

  //         calculatedFields.forEach(field => {

  //             if (prevHdr[field] !== newHdr[field]) {

  //               updateFormData.current.poHdr = {
  //                   ...(updateFormData.current.poHdr || {}),
  //                   [field]: newHdr[field]
  //               };
  //             }
  //         });
  //       }

  //       return newHdr;
  //   });
  //   };

  // SETUP QUERY DATA AT ON CLICK QUERY BTN

  const handleDeleteRow = (data, row_id) => {
    const deleteIndex = itemFormData.findIndex((r) => r.row_id === row_id);
    if (deleteIndex === -1) return;

    const rowToDelete = itemFormData[deleteIndex];

    //  Track DB delete
    if (rowToDelete.original_it_code) {
      updateFormData.current.deletedPo ||= [];

      const alreadyDeleted = updateFormData.current.deletedPo.find(
        (d) => d.it_code === rowToDelete.it_code,
      );

      if (!alreadyDeleted) {
        updateFormData.current.deletedPo.push({
          it_code: rowToDelete.it_code,
        });
      }
    }

    //  Remove row
    const newItems = itemFormData.filter((r) => r.row_id !== row_id);

    setItemFormData(newItems);

    //  FOCUS LOGIC
    if (newItems.length === 0) {
      setFocusedRowIndex(0);
    } else if (deleteIndex >= newItems.length) {
      // last row deleted
      setFocusedRowIndex(newItems.length - 1);
    } else {
      // middle row deleted
      setFocusedRowIndex(deleteIndex);
    }

    //  HEADER RECALC
    setFormData((prevHdr) => {
      const newHdr = recalcPoHeaderFromItems(newItems, prevHdr);

      setBillFormData((prevCharges) => {
        if (!prevCharges || Object.keys(prevCharges).length === 0)
          return prevCharges;

        const updated = { ...prevCharges };

        Object.keys(updated).forEach((key) => {
          if (key === "BASIC VALUE") {
            updated[key].amount = Number(newHdr.ntot_basic || 0);
          }

          if (key === "IGST") {
            updated[key].amount = Number(newHdr.t_gst_igst_amt || 0);
          }
          if (key === "CGST") {
            updated[key].amount = Number(newHdr.t_gst_cgst_amt || 0);
          }
          if (key === "SGST") {
            updated[key].amount = Number(newHdr.t_gst_sgst_amt || 0);
          }

          updated[key] = calculateRow(
            key,
            updated[key],
            updated,
            newHdr,
            newItems,
          );
        });

        updateTotalPoValue(updated);

        return updated;
      });

      if (formStatus === "Update") {
        const calculatedFields = [
          "t_gst_sgst_amt",
          "t_gst_sgst_cess_amt",
          "t_gst_ugst_amt",
          "t_gst_ugst_cess_amt",
          "t_gst_cgst_amt",
          "t_gst_cgst_cess_amt",
          "t_gst_igst_amt",
          "t_gst_igst_cess_amt",
          "ntot_basic",
          "po_value",
          "total_amount",
        ];

        calculatedFields.forEach((field) => {
          if (prevHdr[field] !== newHdr[field]) {
            updateFormData.current.poHdr = {
              ...(updateFormData.current.poHdr || {}),
              [field]: newHdr[field],
            };
          }
        });
      }

      return newHdr;
    });
  };

  const setupQueryData = useCallback(
    (data, btnClicked) => {
      if (btnClicked === "Query" && data.count == 0) {
        toast.error(data.message);
        handleCancel();
        return;
      }

      if (data.type === "found") {
        setFormData({ ...data?.purchaseOrder });
        const rows = data?.purchaseOrderDetails || [];
        const rowsWithOriginal = rows.map((row) => ({
          ...row,
          original_it_code: row.it_code,
        }));

        const poLevelRows = data.poLevelCharges || [];

        const poLevelCharge = poLevelRows.map((row) => ({
          ...row,
        }));

        setChargesMaster(poLevelCharge);

        //  ADD THIS
        const billMapped = {};

        poLevelRows.forEach((row) => {
          const key = row.chg_component?.trim().toUpperCase();

          billMapped[key] = {
            flag: row.component_flag_perc_val || "",
            amount: row.component_val || "",
            computed_amt: row.component_amount || "",
            sub_aplicable: row.component_subsity || "N",
            subsidy_amt: row.component_subsidized_amt || "",
          };
        });

        setBillFormData(billMapped);
        updateTotalPoValue(billMapped);

        if (data?.authTabData) {
          setAuthData({
            1: data.authTabData[1] || { ...docAuth1 },
            2: data.authTabData[2] || { ...docAuth2 },
            3: data.authTabData[3] || { ...docAuth3 },
          });
        }
        if (data?.authTabLabels) {
          setAuthTabLabels(data.authTabLabels);
        }

        setItemFormData(rowsWithOriginal);
        setActiveTab(1);
        setFocusedRowIndex(0);
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(data.count);
      }
    },
    [formStatus, currentRecordNo],
  );

  const onSuccessConfirmation = useCallback(
    (confirm, po_no) => {
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formData],
  );

  const showGeneratedInvNo = useCallback((po_no) => {
    setConfirmationConfig({
      title: "Purchase Order No. generated",
      description: `New PO no generated is ${po_no}`,
      uniqKey: "po_no",
    });
    setConfirmationModal(true);
  }, []);

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSrchPayloadPO(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_PRCH_ORDR_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&userId=${user?.id}&appFinYear=${user?.global_fin_year}&${queryList}`,
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
  // const handleAuthPo = async () => {
  //   // //console.log('data need to be authorize',formData?.ref_id)
  //   const { po_id, flag, cancel_flag } = formData;
  //   const { id } = user;

  //   if (cancel_flag === "Y") {
  //     alert(
  //       "Purchase Order is Cancelled, cannot Authorized this Purchase Order."
  //     );
  //     return;
  //   }

  //   if (flag === "F") {
  //     alert(
  //       "Purchase Order has been already Authorized, no modifications possible."
  //     );
  //     return;
  //   }

  //   // todo need to correct this authorization condition/ Logic
  //   if (["A", "F", "N"].includes(formData?.flag)) {
  //     if (confirm("Do you want to Authorize this Purchase Order? ")) {
  //       const response = await fetch(
  //         `${import.meta.env.VITE_BASE_API_URL}${
  //           APP_PROD_API.AUTHORIZE_PRCH_ORDR
  //         }`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             prchOrdrData: {
  //               po_id,
  //               id,
  //               flag: "F",
  //               division_id: user?.global_division_id,
  //               trans_year: user?.global_fin_year,
  //             },
  //           }),
  //           credentials: "include",
  //         }
  //       );
  //       if (response.ok) {
  //         const result = await response.json();
  //         toast.success(result?.message);
  //         setFormData((prev) => ({
  //           ...prev,
  //           flag: "F",
  //           disp_flag: "Approved by (Finance)",
  //         }));
  //       } else {
  //         const result = await response.json();
  //         toast.error(result?.message);
  //       }
  //     }
  //   }
  // };

  //  todo below four comment code are correct comment only for eddal because no need to doc auth form

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleAuthChange = (field, value, event = null) => {
    const cursorPosition = event?.target?.selectionStart;

    setAuthData((prev) => {
      const updatedTab = { ...prev[authTab] };

      let newValue = value;

      // Convert remarks to UPPERCASE
      if (typeof value === "string" && field.includes("remarks")) {
        newValue = value.toUpperCase();
      }

      updatedTab[field] = newValue;

      // AUTO DATE FILL
      if (field === "auth_flag") {
        updatedTab.auth_date = value === "Y" ? getTodayDate() : "";
      }

      if (field === "refuse_flag") {
        updatedTab.refuse_date = value === "Y" ? getTodayDate() : "";
      }

      if (field === "cancel_flag") {
        updatedTab.cancel_date = value === "Y" ? getTodayDate() : "";
      }

      return {
        ...prev,
        [authTab]: updatedTab,
      };
    });

    // Restore cursor position
    if (event?.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const clearAuthFields = () => {
    setAuthData({
      1: { ...docAuth1 },
      2: { ...docAuth2 },
      3: { ...docAuth3 },
    });
    setAuthTab(1);
  };

  // const handleAuthPo = () => {
  //   const { flag, cancel_flag, authLevel } = formData;

  //   if (cancel_flag === "Y") {
  //     toast.error("Purchase Order is Cancelled, cannot authorize.");
  //     return;
  //   }

  //   if (flag === "F") {
  //     toast.error("Purchase Order already Authorized.");
  //     return;
  //   }

  //   // Only open modal according to auth level and current flag
  //   if (authLevel === 1 && flag === "N") {
  //     setAuthTab(1);
  //     setAuthModal(true);
  //   } else if (authLevel === 2 && flag === "Y") {
  //     setAuthTab(2);
  //     setAuthModal(true);
  //   } else if (authLevel === 3 && flag === "Y") {
  //     setAuthTab(3);
  //     setAuthModal(true);
  //   }
  // };

  const handleAuthPo = () => {
    const { flag, cancel_flag, authLevel } = formData;

    if (cancel_flag === "Y") {
      toast.error("Purchase Order is Cancelled, cannot authorize.");
      return;
    }

    if (flag === "F") {
      toast.error("Purchase Order already Authorized.");
      return;
    }

    console.log("authLevel",authLevel)

    // 🚫 NO RIGHTS
    if (!authLevel || authLevel === 0) {
      toast.error("You do not have rights to authorize this PO.");
      return;
    }

     //  Already authorized by current level added  by akshay 22-06-26
      const currentAuthData = authData?.[authLevel];

      if (currentAuthData?.auth_flag === "Y") {
        toast.error("You have already authorized this PO.");
        return;
      }

    // ✅ OPEN MODAL
    setAuthTab(authLevel);
    setAuthModal(true);
  };

  const handleAuthSave = async () => {
    try {
      const currentAuth = authData[authTab];

      const isAuthorized = currentAuth.auth_flag === "Y";
      const isRefused = currentAuth.refuse_flag === "Y";
      const isCancelled = currentAuth.cancel_flag === "Y";

      if (!isAuthorized && !isRefused && !isCancelled) {
        toast.error("Please select Authorize, Refuse or Cancel before saving.");
        return;
      }

      const payload = {
        po_id: formData.po_id,
        auth_level: authTab,
        authData: currentAuth,
        user_id: user.id,
        division_id: user.global_division_id,
        trans_year: user.global_fin_year,
        po_no: formData.po_no,
        // authLevel:formData?.authLevel
      };

      console.log("AUTH PAYLOAD ::", payload);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZE_PRCH_ORDR}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message || "PO Authorized Successfully");

        // 🔥 Update UI flag (important)
        setFormData((prev) => ({
          ...prev,
          flag: authTab === 3 ? "F" : "Y", // final level → Fully Authorized
           disp_flag: result?.disp_flag,  // added by akshay 22-06-26
        }));

        setAuthModal(false);
      } else {
        toast.error(result?.message || "Authorization failed");
      }
    } catch (error) {
      console.error("Auth Save Error:", error);
      toast.error("Something went wrong while authorizing");
    }
  };

  const subsidizedBase = itemFormData
    .filter((item) => item.subsidy_applicable === "Y")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // const calculateRow = (rowKey, rowData, billFormData, formData, itemFormData = []) => {

  //   const baseAmount = Number(billFormData["BASIC VALUE"]?.amount || 0);

  //   // 🔥 subsidized items total
  //   const subsidizedBase = itemFormData
  //     .filter(item => item.subsidy_applicable === "Y")
  //     .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  //   if (rowData.amount === "") {
  //     return {
  //       ...rowData,
  //       computed_amt: "",
  //       subsidy_amt: ""
  //     };
  //   }

  //   const amount = Number(rowData.amount);
  //   const flag = rowData.flag;

  //   let computed_amt = 0;

  //   if (rowKey === "BASIC VALUE") {
  //     computed_amt = amount;
  //   }
  //   else if (flag === "P") {
  //     computed_amt = (baseAmount * amount) / 100;
  //   }
  //   else {
  //     computed_amt = amount;
  //   }

  //   const subsidyPerc = Number(formData?.subsidy_perc || 0);

  //   let subsidy_amt = "";

  //   if (rowData.sub_aplicable === "Y") {

  //     if (rowKey === "BASIC VALUE") {
  //       //  FIX for BASIC VALUE
  //       subsidy_amt = (subsidizedBase * subsidyPerc) / 100;
  //     } else {
  //       //  other rows
  //       subsidy_amt = (computed_amt * subsidyPerc) / 100;
  //     }
  //   }else {

  //   subsidy_amt = computed_amt;
  // }
  //  // (3 decimal rounding)
  //   const format3 = (val) =>
  //     val !== "" && val !== null && val !== undefined
  //       ? Number(Number(val).toFixed(2))
  //       : "";

  //   return {
  //     ...rowData,
  //     amount: format3(amount),
  //     computed_amt: format3(computed_amt),
  //     subsidy_amt: format3(subsidy_amt),
  //   };
  // };

  //  const calculateRow = (rowKey, rowData, billFormData, formData) => {

  //   const baseAmount = Number(billFormData["BASIC VALUE"]?.amount || 0);

  //   //  agar blank hai to pura blank return karo
  //   if (rowData.amount === "") {
  //     return {
  //       ...rowData,
  //       computed_amt: "",
  //       subsidy_amt: ""
  //     };
  //   }

  //   const amount = Number(rowData.amount);
  //   const flag = rowData.flag;

  //   let computed_amt = 0;

  //   if (rowKey === "BASIC VALUE") {
  //     computed_amt = amount;
  //   }
  //   else if (flag === "P") {
  //     computed_amt = (baseAmount * amount) / 100;
  //   }
  //   else {
  //     computed_amt = amount;
  //   }

  //   // subsidy %
  //   const subsidyPerc = Number(formData?.subsidy_perc || 0);

  //   let subsidy_amt = 0;

  //   if (rowData.sub_aplicable === "Y") {
  //     subsidy_amt = (computed_amt * subsidyPerc) / 100;
  //   } else {
  //     subsidy_amt = computed_amt;
  //   }

  //   return {
  //     ...rowData,
  //     computed_amt,
  //     subsidy_amt,
  //   };
  // };

  // const calculateRow = (rowKey, rowData, billFormData, formData, itemFormData = []) => {

  //   const baseAmount = Number(billFormData["BASIC VALUE"]?.amount || 0);

  //   // 🔥 NEW: Calculate subsidized items total
  //   const subsidizedBase = itemFormData
  //     .filter(item => item.subsidy_applicable === "Y")
  //     .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  //   if (rowData.amount === "") {
  //     return {
  //       ...rowData,
  //       computed_amt: "",
  //       subsidy_amt: ""
  //     };
  //   }

  //   const amount = Number(rowData.amount);
  //   const flag = rowData.flag;

  //   let computed_amt = 0;

  //   if (rowKey === "BASIC VALUE") {
  //     computed_amt = amount;
  //   }
  //   else if (flag === "P") {
  //     computed_amt = (baseAmount * amount) / 100;
  //   }
  //   else {
  //     computed_amt = amount;
  //   }

  //   const subsidyPerc = Number(formData?.subsidy_perc || 0);

  //   let subsidy_amt = 0;

  //   if (rowData.sub_aplicable === "Y") {
  //     // 🔥 FIX: Use subsidizedBase instead of computed_amt
  //     subsidy_amt = (subsidizedBase * subsidyPerc) / 100;
  //   } else {
  //     subsidy_amt = computed_amt;
  //   }

  //   return {
  //     ...rowData,
  //     computed_amt,
  //     subsidy_amt,
  //   };
  // };

  const calculateRow = (
    rowKey,
    rowData,
    billFormData,
    formData,
    itemFormData = [],
  ) => {
    
    const baseAmount = Number(billFormData["BASIC VALUE"]?.amount || 0);

    // (3 decimal rounding)
    const format3 = (val) =>
      val !== "" && val !== null && val !== undefined
        ? Number(Number(val).toFixed(2))
        : "";

    // 🔥 subsidized items total
    const subsidizedBase = itemFormData
      .filter((item) => item.subsidy_applicable === "Y")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    if (rowData.amount === "") {
      return {
        ...rowData,
        computed_amt: "",
        subsidy_amt: "",
      };
    }

    const amount = Number(rowData.amount);
    const flag = rowData.flag;

    let computed_amt = 0;

    if (rowKey === "BASIC VALUE") {
      computed_amt = amount;
    } else if (flag === "P") {
      computed_amt = (baseAmount * amount) / 100;
    } else {
      computed_amt = amount;
    }

    const gstRows = ["IGST", "CGST", "SGST"];

    if (gstRows.includes(rowKey)) {
      return {
        ...rowData,
        amount: format3(amount),
        computed_amt: format3(computed_amt),
        subsidy_amt: format3(0),
      };
    }

    const subsidyPerc = Number(formData?.subsidy_perc || 0);

    let subsidy_amt = "";

    if (rowData.sub_aplicable === "Y") {
      if (rowKey === "BASIC VALUE") {
        //  FIX for BASIC VALUE
        subsidy_amt = (subsidizedBase * subsidyPerc) / 100;
      } else {
        //  other rows
        subsidy_amt = (computed_amt * subsidyPerc) / 100;
      }
      //   }else {

      //   subsidy_amt = computed_amt;
      // }
    } else {
      //   subsidy % blank by default  0.00 show in po level tab
      if (subsidyPerc <= 0) {
        subsidy_amt = 0;
      } else {
        subsidy_amt = computed_amt;
      }
    }

    return {
      ...rowData,
      amount: format3(amount),
      computed_amt: format3(computed_amt),
      subsidy_amt: format3(subsidy_amt),
    };
  };

  useEffect(() => {
     if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }
    if (!billFormData) return;

    setBillFormData((prev) => {
      let updatedData = { ...prev };

      Object.keys(updatedData).forEach((key) => {
        updatedData[key] = calculateRow(
          key,
          updatedData[key],
          updatedData,
          formData,
          itemFormData,
        );
      });

      return updatedData;
    });
  }, [formData.subsidy_perc, itemFormData, formData.ntot_basic]); // ✅ FIX

  useEffect(() => {
     if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }
    if (!billFormData || Object.keys(billFormData).length === 0) return;

    setBillFormData((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        updated[key] = calculateRow(
          key,
          updated[key],
          updated,
          formData,
          itemFormData,
        );
      });

      return updated;
    });
  }, [itemFormData, formData.ntot_basic]);


  const handleChargeChange = (rowKey, colKey, value) => {
    if (!["Insert", "Update"].includes(formStatus)) return;
    let finalValue = value;

    // uppercase
    if (typeof value === "string") {
      finalValue = value.toUpperCase();
    }

    const column = purchaseBillLevelHeader.find((col) => col.key === colKey);

    // negative block
    if (column?.type === "number") {
      if (Number(value) < 0) return;
    }

    setBillFormData((prev) => {
      let updatedData = { ...prev };

      updatedData[rowKey] = {
        ...updatedData[rowKey],
        [colKey]: finalValue,
      };

      // 🔥 GST FIX (dynamic)
      const igst = Number(updatedData["IGST"]?.amount || 0);
      const cgst = Number(updatedData["CGST"]?.amount || 0);
      const sgst = Number(updatedData["SGST"]?.amount || 0);

      if (igst > 0) {
        updatedData["CGST"] = {
          ...updatedData["CGST"],
          amount: 0,
        };
        updatedData["SGST"] = {
          ...updatedData["SGST"],
          amount: 0,
        };
      } else if (cgst > 0 || sgst > 0) {
        updatedData["IGST"] = {
          ...updatedData["IGST"],
          amount: 0,
        };
      }

      // 🔥 recalc ALL (important)
      Object.keys(updatedData).forEach((key) => {
        updatedData[key] = calculateRow(
          key,
          updatedData[key],
          updatedData,
          formData,
          itemFormData,
        );
      });

      updateTotalPoValue(updatedData);

      return updatedData;
    });
  };

  // const handleChargeChange = (rowKey, colKey, value) => {

  //   let finalValue = value;

  //   // uppercase only for string
  //   if (typeof value === "string") {
  //     finalValue = value.toUpperCase();
  //   }

  //   //  find column config
  //   const column = purchaseBillLevelHeader.find(col => col.key === colKey);

  //   //  number validation
  //   if (column?.type === "number") {
  //     if (Number(value) < 0) return; // block negative
  //   }

  //   setBillFormData(prev => ({
  //     ...prev,
  //     [rowKey]: {
  //       ...prev[rowKey],
  //       [colKey]: finalValue
  //     }
  //   }));
  // };

  const handleCancelPo = async () => {
    try {
      if (!formData?.po_id) {
        toast.error("Please select a Purchase Order first.");
        return;
      }

      if (formData?.cancel_flag === "Y") {
        toast.error("Purchase Order is already cancelled.");
        return;
      }

      if (formData?.flag !== "F") {
        toast.error("Only fully authorised Purchase Orders can be cancelled.");
        return;
      }




if (isGateEntryDone) {
  toast.error(
    "This Purchase Order cannot be cancelled because Gate Entry has already been recorded against it. Please use a Credit Note/Debit Note or Stock Adjustment instead."
  );
  return;
}

const confirmCancel = window.confirm(
  `Are you sure you want to cancel PO ${formData.po_no}?`
);

if (!confirmCancel) return;

      const payload = {
        po_id: formData.po_id,
        po_no: formData.po_no,
        user_id: user.id,
        // division_id: user.global_division_id,
        // trans_year: user.global_fin_year,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCEL_PRCH_ORDR_DATA}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Unable to cancel Purchase Order.");
        return;
      }

      toast.success(result.message || "Purchase Order cancelled successfully.");

      setFormData((prev) => ({
        ...prev,
        cancel_flag: "Y",
        disp_flag: "Cancelled",
      }));
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while cancelling the Purchase Order.");
    }
  };

// itemFormData.forEach(r => {
//   console.log(
//     r.it_code,
//     "amount =", r.amount,
//     "taxable =", r.it_taxable_val,
//     "qty =", r.po_qty_ord,
//     "rate =", r.po_mat_rat
//   );
// });

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
        handleAuthRecord={handleAuthPo}
        handlePrint={() => getPOPrint(formData, formStatus, dispatch)}
        QUERY_API={APP_PROD_API.GET_PRCH_ORDR_DATA}
        formName={"Purchase Order"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        opterationBtn={[
          {
            name: formData.cancel === "Y" ? "Revert Cancellation" : "Cancel PO",
            onClick: () => handleCancelPo(),
            disabled:
              formStatus !== "Query" ||
              formData?.flag !== "F" ||
              formData?.cancel_flag === "Y",
          },
        ]}
        authority={{
          insert: "Y",
          update:
            formData?.flag === "F" || formData?.cancel_flag === "Y" ? "N" : "Y",
          message:
            formData?.flag === "F"
              ? "PO has been already Authorized, no modifications possible."
              : formData?.cancel_flag === "Y"
                ? "PO has been Cancelled, no modifications possible."
                : "",
        }}
        //  authority = {{query:"N",insert: "N", update: "Y" }}
        // btnEnableDtl={{ update:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <MainTab
              formData={formData}
              handleChange={(e, name, value) =>
                handleChange(e, name, value, null, "poHdrData")
              }
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              handleDeleteRow={handleDeleteRow}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              activeRowIndex={activeRowIndex}
              setActiveRowIndex={setActiveRowIndex}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}
              setFormData={setFormData}
              user={user}
              poCategory={poCategory}
              modeOfTransportList={modeOfTransportList}
              // paymentTermList={paymentTermList}
              workCenterList={workCenterList}
              priceBasisList={priceBasisList}
              currencyList={currencyList}
              openHelpList={openHelpList}
              formControlData={formControlData}
              brandList={brandList}
              allowedDocTypes={allowedDocTypes}
                itemFormData={itemFormData}
            />
          </TabPane>
          {/* // todo below model is correct comment only for eddal because no need to doc auth form */}
          {authModal && (
            <Modal
              isOpen={authModal}
              toggle={() => setAuthModal(false)}
              size="lg"
            >
              <ModalHeader toggle={() => setAuthModal(false)}>
                PO Authorization - {formData.po_no}
              </ModalHeader>

              <ModalBody>
                <div className="d-flex gap-2 mb-3">
                  {/* {[1, 2, 3].map((tab) => (
                    <Button
                      key={tab}
                      size="sm"
                      color={authTab === tab ? "primary" : "secondary"}
                      onClick={() => setAuthTab(tab)}
                    >
                      AUTH_TAB{tab}
                    </Button>
                  ))} */}

                  {[1, 2, 3].map((tab) => {
                    const isAllowed = tab <= formData.authLevel;
                    return (
                      <Button
                        key={tab}
                        size="sm"
                        color={authTab === tab ? "primary" : "secondary"}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (!isAllowed) {
                            toast.error(
                              "You are not authorized for this level.",
                            );
                            return;
                          }
                          setAuthTab(tab);
                        }}
                      >
                        {authTabLabels[tab] || `Auth Tab ${tab}`}{" "}
                        {/* ✅ shows AMIT / RAHUL / SURESH */}
                      </Button>
                    );
                  })}
                </div>

                <div className="border p-3 rounded">
                  <Row className="mb-3 align-items-center">
                    <Col lg={2}>
                      <Checkbox
                        text="Authorized"
                        checked={authData[authTab].auth_flag === "Y"}
                        onChange={(e) =>
                          handleAuthChange(
                            "auth_flag",
                            e.target.checked ? "Y" : "N",
                          )
                        }
                      />
                    </Col>

                    <Col lg={3}>
                      <MuiDateField
                        label="Date"
                        value={authData[authTab].auth_date}
                        onChange={(val) => handleAuthChange("auth_date", val)}
                        disabled
                      />
                    </Col>

                    <Col lg={7}>
                      <MuiTextArea
                        label="Remarks"
                        value={authData[authTab].auth_remarks}
                        onChange={(e) =>
                          handleAuthChange("auth_remarks", e.target.value, e)
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3 align-items-center">
                    <Col lg={2}>
                      <Checkbox
                        text="Refused"
                        checked={authData[authTab].refuse_flag === "Y"}
                        onChange={(e) =>
                          handleAuthChange(
                            "refuse_flag",
                            e.target.checked ? "Y" : "N",
                            e,
                          )
                        }
                      />
                    </Col>

                    <Col lg={3}>
                      <MuiDateField
                        label="Date"
                        value={authData[authTab].refuse_date}
                        onChange={(val) => handleAuthChange("refuse_date", val)}
                        disabled
                      />
                    </Col>

                    <Col lg={7}>
                      <MuiTextArea
                        label="Remarks"
                        value={authData[authTab].refuse_remarks}
                        onChange={(e) =>
                          handleAuthChange("refuse_remarks", e.target.value, e)
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="align-items-center">
                    <Col lg={2}>
                      <Checkbox
                        text="Cancelled"
                        checked={authData[authTab].cancel_flag === "Y"}
                        onChange={(e) =>
                          handleAuthChange(
                            "cancel_flag",
                            e.target.checked ? "Y" : "N",
                            e,
                          )
                        }
                      />
                    </Col>

                    <Col lg={3}>
                      <MuiDateField
                        label="Date"
                        value={authData[authTab].cancel_date}
                        onChange={(val) => handleAuthChange("cancel_date", val)}
                        disabled
                      />
                    </Col>

                    <Col lg={7}>
                      <MuiTextArea
                        label="Remarks"
                        value={authData[authTab].cancel_remarks}
                        onChange={(e) =>
                          handleAuthChange("cancel_remarks", e.target.value, e)
                        }
                      />
                    </Col>
                  </Row>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button color="primary" onClick={handleAuthSave}>
                  Submit
                </Button>
                <Button color="secondary" onClick={clearAuthFields}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          )}
          <TabPane tabId={2}>
            <PurchaseOrderItem
              itemFormData={itemFormData}
              formStatus={formStatus}
              handleChange={(e, name, value, index) =>
                handleChange(e, name, value, index, "poDetailData")
              }
              triggerAddRow={triggerAddRow}
              handleItemRowDelete={handleDeleteRow}
              formControlData={formControlData}
              openHelpList={openHelpList}
              makeFocusOnTableRow={makeFocusOnTableRow}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              validateItemCode={validateItemCode}
              packingList={packingList}
              setActiveTab={setActiveTab}
              setChargesMaster={setChargesMaster}
              setBillFormData={setBillFormData}
              formData={formData}
              calculateRow={calculateRow} 
              itemRefs={itemRefs}
            />
          </TabPane>
          <TabPane tabId={3}>
            <PurchaseOrderBillLevelChrg
              billFormData={billFormData}
              chargesMaster={chargesMaster}
              handleChargeChange={handleChargeChange}
              formStatus={formStatus}
              itemFormData={itemFormData}
              formData={formData}
            />
          </TabPane>

          {/* <TabPane tabId={3}>
            <TermsTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane>
          <TabPane tabId={4}>
            <PurchaseOrderAdvance
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane>

          <TabPane tabId={5}>
            <PurchaseOrderDlvrSchedule
              formDlvrData={formDlvrData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane>
          <TabPane tabId={6}>
            <PurchaseOrderSpec
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane>
          <TabPane tabId={7}>
            <PurchaseOrderAmend
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane>
          <TabPane tabId={8}>
            <PurchaseOrderSubContract
              formSubContrData={formSubContrData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </TabPane> */}
          {helpList && (
            <Modal
              id="help-list-modal"
              isOpen={helpList}
              toggle={toggleHelpModal}
              size="xl"
            >
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.GET_PRCH_ORDR_DATA
                  }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={
                    helpFor === "wo_no"
                      ? { f_party_code: thfmtranData.party_code }
                      : {po_eff_dt:formData?.po_eff_dt}
                  }
                />
              </ModalBody>
            </Modal>
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
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PurchaseOrder;

