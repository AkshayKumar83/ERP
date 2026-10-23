import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import RmgpHeader from "./rmgp_header";
import RmgpDtl from "./rmgp_dtl";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  batchInitialData,
  dtlInitialData,
  headerInitialData,
  rmgpBottomBtn,
  createSearchPayloadForBVSpecificSearch
} from "./rmgp_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { formatOptions } from "../../../../lib";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { useRef } from "react";
import { fetchAppData } from "../../../../utils/fetchUtils";



const RMGP = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
    setSearchQuery, } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedDtlRowIndex, setFocusedDtlRowIndex] = useState(0);
  const [focusedBatchRowIndex, setFocusedBatchRowIndex] = useState(0);

  const [formData, setFormData] = useState({ ...headerInitialData });
  const [detailData, setDetailData] = useState([dtlInitialData]);
  const [batchData, setBatchData] = useState([batchInitialData]);


  const [deletedItemRecord, setDeletedItemRecord] = useState([]);
  const [deletedBatchRecord, setDeletedBatchRecord] = useState([]);

  const updateFormData = useRef({});

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // DROPDOWN LIST DATA CONTAINING STATE
  const [costCentr, setCostCentr] = useState([]);
  const [purpose, setPurposeList] = useState([]);
  const [modeOfTransportList, setModeOfTransportList] = useState([]);

  const makeFocusOnTableRow = (rowIndex, row_id) => {
    console.log(rowIndex, row_id);
    const entry = detailData.find((entry) => entry.row_id === row_id);
    setFocusedRowIndex(rowIndex); 
    setFocusedDtlRowIndex(rowIndex);
    setFocusedBatchRowIndex(rowIndex)
  };  

  //set doc_date to current date
  useEffect(() => {
    if (formStatus === "Insert") {
      const today = new Date().toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        doc_date: today,
      }));
    }
  }, [formStatus]);



  // const makeFocusOnTableRow = (rowIndex, tableType) => {
  //   if (tableType === "DETAIL") {
  //     setFocusedDtlRowIndex(rowIndex);
  //   }

  //   if (tableType === "BATCH") {
  //     setFocusedBatchRowIndex(rowIndex);
  //   }
  // };


  // for help list
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ["Main"];

  // SETTING USER INSERT logic
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_RMGP_FORM_DROP_DWN_DATA
          }?formStatus=${formStatus}&appDivisionId=${user.global_division_id
          }&appFinYear=${user.global_fin_year}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setCostCentr([
            { value: "", label: "" },
            ...formatOptions(data?.costCList || [], "code", "description"),
          ]);
          setPurposeList([
            { value: "", label: "" },
            ...formatOptions(data?.purpList || [], "code", "description"),
          ]);
          setModeOfTransportList([
            { value: "", label: "" },
            ...formatOptions(
              data?.modeOfTransportList || [],
              "code",
              "description"
            ),
          ]);

          if (formStatus === "Insert") {
            setFormData((prev) => {
              return {
                ...prev,
                trans_year: user.global_fin_year,
                division_id: user.global_division_id || 1,
                enter_by: user.id,
                ok_rej: "O",
                doc_id: data?.new_doc_id,
                dlvr_note_no: data?.new_doc_id,
                customer_enabled: "Y",
                po_no_enabled: "N",
                po_no_display: "DISPLAY",
                text_item253: "Supplier",
                item254: "WO NO",
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


  const handleHelpList = (show) => {
    setHelpList(show);
  };

  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader, index = null) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
      // setRecordIndex(index);
    }

    if (index && index.length > 0) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
      setRecordIndex(index);
    }
  };

  // SELECTING ITEM FROM HELPLIST
  const onSelectHelpItem = (data) => {
    //console.log(data);
    let index;

    if (helpFor === "batch") {
      index = focusedBatchRowIndex;
    } else {
      index = focusedDtlRowIndex;
    }

    if (helpFor === "vendor") {
      const isCustomer = formData?.customer_flag === 'Y';

      setFormData((prev) => ({
        ...prev,
        v_code: isCustomer ? data.c_code : data.v_code,
        v_name: isCustomer ? data.c_name : data.v_name,
        curr_cd: data.curr_cd,
        curr_conv: data.curr_cd === "INR" ? 1 : "",
      }));


    }

    if (helpFor === "po_no") {
      setFormData((prev) => {
        return {
          ...prev,
          po_no: data.po_no,
          po_date: data.po_date,
          po_id: data.po_id,
          wc_id: data.wc_id,
          wc_no: data.wc_no
        };
      });
    }

    else if (helpFor === "it_code") {
      setDetailData((prevData) => {
        const newData = [...prevData];
        const prevRow = newData[index];
        const updatedRow = {
          ...prevRow,
          it_code: data.it_code,
          it_name: data.it_name,
          //uom: data.uom,
          it_hsn_sac_code: data.hsn_sac_code
        };
        newData[index] = updatedRow;
        if (
          formStatus === "Update" &&
          (prevRow.it_code !== data.it_code || prevRow.it_name !== data.it_name)
        ) {
          updateFormData.current.poDtl ||= [];
          const alreadyUpdated = updateFormData.current.poDtl.find(
            (r) => r.row_id === updatedRow.row_id
          );
          if (alreadyUpdated) {
            alreadyUpdated.it_code = data.it_code;
            alreadyUpdated.it_name = data.it_name;
          } else {
            updateFormData.current.poDtl.push({
              row_id: updatedRow.row_id,
              it_code: data.it_code,
              it_name: data.it_name,
            });
          }
        }
        return newData;
      });
    }

    else if (helpFor === "batch") {
      batchData((prevData) => {
        const newData = [...prevData];
        const prevRow = newData[index];
        const updatedRow = {
          ...prevRow,
          batch_no: data.batch_no,
          batch_date: data.batch_date,

        };
        newData[index] = updatedRow;
        if (
          formStatus === "Update" &&
          (prevRow.batch_no !== data.batch_no || prevRow.batch_date !== data.batch_date)
        ) {
          updateFormData.current.poDtl ||= [];
          const alreadyUpdated = updateFormData.current.poDtl.find(
            (r) => r.row_id === updatedRow.row_id
          );
          if (alreadyUpdated) {
            alreadyUpdated.batch_no = data.batch_no
            alreadyUpdated.batch_date = data.batch_date;
          } else {
            updateFormData.current.poDtl.push({
              row_id: updatedRow.row_id,
              batch_no: data.batch_no,
              batch_date: data.batch_date,
            });
          }
        }
        return newData;
      });
    }
  };

  const buildHelpWhereClause = (helpFor, formData) => {
    switch (helpFor) {
      case "vendor":
        return { customer_flag: formData?.customer_flag || 'N' };
      case "po_no":
        return { f_v_code: formData?.v_code };
      case "it_code":
        return { f_wc_id: formData?.wc_id };
      case "batch":
        return { wc_id: formData?.wc_id, doc_date: formData.doc_date, it_code: detailData[focusedDtlRowIndex]?.it_code };
      default:
        return {};
    }
  };


  // For Search Record
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
        `${APP_PROD_API.GET_RMGP_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
      );

      if (data?.error) {
        toast.error(data?.error);
        return;
      }
      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };



  const otherQueryPera = {
    chl_type: formData.chl_type || "M",
    customer_flag: formData.customer_flag || "N",
    v_code: formData.v_code,
    serv_call_id: formData.serv_call_id,
    wc_id: formData.wc_id,
    nonkardex_flag: formData.nonkardex_flag || "N",
    ok_rej: formData.ok_rej || "O",
    doc_date: formData.doc_date,
    hsn_sac_code: detailData[focusedDtlRowIndex]?.it_hsn_sac_code,
    it_code: detailData[focusedDtlRowIndex]?.it_code,
    rate: detailData[focusedDtlRowIndex]?.rate,
    po_id: formData.po_id,
    doc_id: formData.doc_id,
    batch_date: batchData[focusedBatchRowIndex]?.batch_date,
    gst_amt_prc: detailData[focusedDtlRowIndex]?.gst_amt_prc || 'P',
    amount: detailData[focusedDtlRowIndex]?.amount

  }

  // for validation of form fields 

  const fetchValidation = async (
    param,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
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

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_RMGP_VALIDATE_DATA
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
    rowIndex = null
  ) => {
    switch (param) {
      case "it_code":
        return await getValidateItemData(value, otherQueryPera, rowIndex);

      case "v_code":
        return await getValidateVendorData(value, otherQueryPera, rowIndex);

      case "po_no":
        return await getValidatePonoData(value, otherQueryPera, rowIndex);

      case "wc_no":
        return await getValidateWcnoData(value, otherQueryPera, rowIndex);

      case "qty_desp":
        return await getValidateQtyDespData(value, otherQueryPera, rowIndex);

      case "amount":
        return await getValidateAmountData(value, otherQueryPera, rowIndex);

      case "batch_no":
        return await getValidateBatchData(value, otherQueryPera, rowIndex);

      case "loca_rack_bin_desc":
        return await getValidatePhysicalData(value, otherQueryPera, rowIndex);



      default:
        console.warn(`Validation not implemented for param: ${param}`);
        return true;
    }
  };

  // handle item level validation
  const getValidateItemData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "it_code",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    // console.log("API Response:", data);

    if (!ok || !data || data.message) {
      toast.error(data?.message || "Invalid Item");
      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;

      setDetailData((prev) => {
        const updated = [...prev];

        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            it_name: itemData.it_name,
            um_code: itemData.um_code,
            rate: itemData.rate ?? 0,
            hsn_sac_code: itemData.hsn_sac_code,
            store_stock: itemData.store_stock ?? 0,
          };
        }

        return updated;
      });
    }

    return true;
  };
  // handle vendor validation 

  const getValidateVendorData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "v_code",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.message) {
      toast.error(data.message || "Invalid Vendor code");

      return false;
    }

    if (data.data && rowIndex === null) {
      const vendorData = data.data;
      setFormData((prev) => ({
        ...prev,
        v_name: vendorData.v_name,
        gst_no: vendorData.gst_no,
      }
      )
      );
    }

    return true;
  };

  // handle po no validation 

  const getValidatePonoData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "po_no",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.message) {
      toast.error(data.message || "Invalid Vendor code");

      return false;
    }

    if (data.data && rowIndex === null) {
      const ponoData = data.data;
      setFormData((prev) => ({
        ...prev,
        wc_no: ponoData.wc_no,
        po_id: ponoData.po_id,
        wc_id: ponoData.wc_id,
        doc_id: ponoData.doc_id,
      }
      )
      );
    }

    return true;
  };

  // handle wc no validation 

  const getValidateWcnoData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "wc_no",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.message) {
      toast.error(data.message || "Invalid Vendor code");

      return false;
    }

    if (data.data && rowIndex === null) {
      const wcnoData = data.data;
      setFormData((prev) => ({
        ...prev,
        wc_no: wcnoData.wc_no,
        po_id: wcnoData.po_id,
        wc_id: wcnoData.wc_id
      }
      )
      );
    }

    return true;
  };

  // for qty_desp 

  const getValidateQtyDespData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "qty_desp",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    // console.log("API Response:", data);

    if (!ok || !data || data.message) {
      toast.error(data?.message || "Invalid Item");
      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;

      // setDetailData((prev) => {
      //   const updated = [...prev];

      //   if (updated[rowIndex]) {
      //     updated[rowIndex] = {
      //       ...updated[rowIndex],
      //       it_name: itemData.it_name,
      //      
      //     };
      //   }

      //   return updated;
      // });
    }

    return true;
  };

  // for amount 
  const getValidateAmountData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "amount",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    // console.log("API Response:", data);

    if (!ok || !data || data.message) {
      toast.error(data?.message || "Invalid Item");
      return false;
    }

    if (data.gst && rowIndex !== null) {
      const itemData = data.gst;
      console.log('itemData', itemData)

      setDetailData((prev) => {
        const updated = [...prev];

        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            gst_sgst_val: Number(itemData.gst_sgst_val),
            gst_sgst_cess_val: Number(itemData.gst_sgst_cess_val),

            gst_ugst_val: Number(itemData.gst_ugst_val),
            gst_ugst_cess_val: Number(itemData.gst_ugst_cess_val),

            gst_cgst_val: Number(itemData.gst_cgst_val),
            gst_cgst_cess_val: Number(itemData.gst_cgst_cess_val),

            gst_igst_val: Number(itemData.gst_igst_val),
            gst_igst_cess_val: Number(itemData.gst_igst_cess_val),

            gst_sgst_amt: Number(itemData.gst_sgst_amt),
            gst_sgst_cess_amt: Number(itemData.gst_sgst_cess_amt),

            gst_ugst_amt: Number(itemData.gst_ugst_amt),
            gst_ugst_cess_amt: Number(itemData.gst_ugst_cess_amt),

            gst_cgst_amt: Number(itemData.gst_cgst_amt),
            gst_cgst_cess_amt: Number(itemData.gst_cgst_cess_amt),

            gst_igst_amt: Number(itemData.gst_igst_amt),
            gst_igst_cess_amt: Number(itemData.gst_igst_cess_amt),

            gst_comp_cess_amt: Number(itemData.gst_comp_cess_amt),
          };
        }

        return updated;
      });


    }

    return true;
  };

  // for batch_no 

  const getValidateBatchData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "batch_no",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    // console.log("API Response:", data);

    if (!ok || !data || data.error) {
      toast.error(data?.error || "Invalid Batch");
      return false;
    }

    if (data.data && rowIndex !== null) {
      const batchData = data.data;

      batchData((prev) => {
        const updated = [...prev];

        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            batch_store_qty: batchData.batch_store_qty,
            loca_rack_bin_desc: batchData.loca_rack_bin_desc,

          };
        }

        return updated;
      });
    }

    return true;
  };

  // for physical_loc  

  const getValidatePhysicalData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "batch_no",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    // console.log("API Response:", data);

    if (!ok || !data || data.error) {
      toast.error(data?.error || "Invalid Item");
      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;

      batchData((prev) => {
        const updated = [...prev];

        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            it_name: itemData.it_name,
            um_code: itemData.um_code,
            rate: itemData.rate ?? 0,
            hsn_sac_code: itemData.hsn_sac_code,
            store_stock: itemData.store_stock ?? 0,
          };
        }

        return updated;
      });
    }

    return true;
  };


  // for required field 

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`This ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  // for submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidFormData = validateForm("rmgp-header-data-form");
    if (!isValidFormData) return;

    const isValidFormDtlData = validateForm("rmgp-dtl-data-form");
    if (!isValidFormDtlData) return;



    try {
      let body = {
        formData: formData,
        detailData: detailData,
        batchData: batchData,
        transYear: user?.global_fin_year,
        divisionId: user?.global_division_id,
        userId: user?.id,

      };

      if (formStatus === "Update") {
        if (formData.r57f_ref) {
          toast.error("57f4 no. is filled Modification not allowed");
          return;
        }

        if (formData.cancel_sdv === "Y") {
          toast.error("This RMGP has already been cancelled");
          return;
        }


        body = {
          ...body,
          deletedBatchRecord: deletedBatchRecord,
          deletedItemRecord: deletedItemRecord
        };
      }

      setDeletedBatchRecord([]);
      setDeletedItemRecord([]);

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_RMGP_FORM_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const responseData = await response.json();

      toast.success(
        formStatus === "Insert"
          ? "Data saved successfully!"
          : formStatus === "Update"
            ? "Transaction updated successfully"
            : responseData.message || "Data saved successfully!"
      );

      handleCancel();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }

    console.log("Form submitted", formData);
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setDetailData([]);
    setBatchData([]);
  }, []);


  const handleChange = (event, name, value, index = null, block = null) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    const cursorPosition = event?.target?.selectionStart;
    let newVal = value;

    if (typeof value !== "number" && typeof value === "string") {
      newVal = newVal.toUpperCase();
    }

    switch (block) {
      case "rmgpHdrData":
        setFormData((prev) => {
          const updated = { ...prev, [name]: newVal };

          // ✅ TRACK HEADER FIELD CHANGES
          if (formStatus === "Update" && prev[name] !== newVal) {
            updateFormData.current.geHdr = {
              ...(updateFormData.current.geHdr || {}),
              [name]: newVal,
            };
          }

          return updated;
        });
        break;

      case "rmgpDtlData":
        setDetailData((prevData) => {
          const newData = [...prevData];
          const prevRow = newData[index] || {};
          const updatedRow = { ...prevRow, [name]: newVal };

          newData[index] = updatedRow;

          // ---------- TRACK DETAIL FIELD CHANGES ----------
          if (formStatus === "Update" && prevRow[name] !== updatedRow[name]) {
            updateFormData.current.geDtl ||= [];

            const keyField = "it_code";
            const existing = updateFormData.current.geDtl.find(
              (r) => r[keyField] === updatedRow[keyField]
            );

            if (existing) {
              existing[name] = updatedRow[name];
            } else {
              updateFormData.current.geDtl.push({
                [keyField]: updatedRow[keyField],
                [name]: updatedRow[name],
              });
            }
          }

          return newData;
        });
        break;

      case "rmgpBatchData":
        setBatchData((prevData) => {

          const newData = [...prevData];

          newData[index] = {
            ...newData[index],
            [name]: newVal,
          };

          return newData;
        });
        break;



      default:
        break;
    }


    // Restore cursor position
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

  // for add row 
  const handleAddDtlRow = useCallback(() => {
    const isValidFormData = validateForm("rmgp-dtl-data-form");
    if (!isValidFormData) return;

    setDetailData(prev => {
      const newData = [...prev, { ...dtlInitialData }];
      setFocusedDtlRowIndex(newData.length - 1);
      return newData;
    });
  }, []);

  const handleAddBatchRow = useCallback(() => {
    const isValidFormData = validateForm("rmgp-dtl-data-form");
    if (!isValidFormData) return;

    setBatchData(prev => {
      const newData = [...prev, { ...batchInitialData }];
      setFocusedBatchRowIndex(newData.length - 1);
      return newData;
    });
  }, []);


  // handleDelete row

  const handleDeleteRow = useCallback(
    (tableType, index) => {
      if (tableType === "formDetailTable") {
        setDetailData((prev) => {
          if (prev.length === 0) return prev;

          const deletedItem = prev[index];
          const newData = prev.filter((_, i) => i !== index);

          let newDeleteData = [...deletedItemRecord];
          newDeleteData.push(deletedItem);
          setDeletedItemRecord(newDeleteData);

          // Adjust focus index
          setFocusedDtlRowIndex((currentFocusIndex) => {
            if (index === currentFocusIndex) {
              return index > 0 ? index - 1 : 0;
            } else if (index < currentFocusIndex) {
              return currentFocusIndex - 1;
            } else {
              return currentFocusIndex;
            }
          });

          return newData;
        });
      }

      if (tableType === "formBatchTable") {
        setBatchData((prev) => {
          if (prev.length === 0) return prev;
          const deletedItem = prev[index];
          const newData = prev.filter((_, i) => i !== index);

          let newDeleteData = [...deletedBatchRecord];
          newDeleteData.push(deletedItem);
          setDeletedBatchRecord(newDeleteData);

          // Adjust focus index
          setFocusedBatchRowIndex((currentFocusIndex) => {
            if (index === currentFocusIndex) {
              return index > 0 ? index - 1 : 0;
            } else if (index < currentFocusIndex) {
              return currentFocusIndex - 1;
            } else {
              return currentFocusIndex;
            }
          });

          return newData;
        });
      }
    },
    [deletedItemRecord, deletedBatchRecord]
  );

  const setupQueryData = useCallback(
    (data, btnClicked) => {
      if (btnClicked === "Query" && data.count == 0) {
        toast.error(data.message);
        handleCancel();
        return;
      }

      if (data.type === "found") {
        setFormData({ ...data?.rmgpData });
        //  setDetailData(data?.rmgpDetailData || [{ ...dtlInitialData }]); 

        const updatedData = (data.rmgpDetailData || []).map((item) => ({
          ...item,
          init_it_code: item.it_code,
        }));

        const updatedData1 = (data.rmgpBatchData || []).map((item) => ({
          ...item,
          init_batch_no: item.batch_no,
        }));

        setDetailData(updatedData);
        setBatchData(updatedData1);
      }
      if (btnClicked === "Query") {
        setTotalRecordCount(data.count);
      }
    },
    [formStatus, currentRecordNo]
  );

  console.log('FormData:::', formData)
  console.log('DetailData:::', detailData)

  // cancel sdv 

  const handleCancelSdv = async () => {
    
    if (formData.cancle_sdv === "Y") {
      toast.error("This SDV has already been cancelled")
      return;
    }  
    
    if (formData.print_ok === "Y") {
      toast.error("This SDV has already been printed")
      return;
    } 

       
    if (formData.r57f_ref) {
      toast.error("R57F4 Ref. no. has already been entered")
      return;
    }

    const confirmed = confirm("Do you really want to delete this SDV?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.DELETE_RMGP_FORM_DATA
        }`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: formData,
            appUserId: user.id,
            appFinYear: user.global_fin_year,
            appDivisionId: user.global_division_id
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
      } else {
        toast.error(result?.message);
      } 
       handleCancel();
    } catch (error) {
      //console.log("Deletion error:", error);
      toast.error("An unexpected error occurred.");
    }
  };  

  const updatedButton = rmgpBottomBtn.map((btn) => {
  if (btn.id === "cancel-vch-btn") {
    return {
      ...btn,
      onClick: handleCancelSdv
    };
  }
  return btn;
});

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
        //opterationBtn={rmgpBottomBtn} 
        opterationBtn={updatedButton}
        formData
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_RMGP_FORM_DATA}
        formName={"RMGP"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <RmgpHeader
              formData={formData}
              formStatus={formStatus}
              costCentr={costCentr}
              purpose={purpose}
              modeOfTransportList={modeOfTransportList}
              handleChange={(e, name, value) => handleChange(e, name, value, null, "rmgpHdrData")}
              openHelpList={openHelpList}
              setFormData={setFormData}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}
              validateRequiredField={validateRequiredField}
            />
            <RmgpDtl
              formData={formData}
              detailData={detailData}
              batchData={batchData}
              formStatus={formStatus}
              handleAddDtlRow={handleAddDtlRow}
              handleAddBatchRow={handleAddBatchRow}
              handleDeleteRow={handleDeleteRow}
              focusedDtlRowIndex={focusedDtlRowIndex}
              focusedBatchRowIndex={focusedBatchRowIndex}
              setFocusedDtlRowIndex={setFocusedDtlRowIndex}
              setFocusedBatchRowIndex={setFocusedBatchRowIndex}
              makeFocusOnTableRow={makeFocusOnTableRow}
              // handleChange={(e, name, value, index) =>handleChange(e, name, value, index, "rmgpDtlData")}
              openHelpList={openHelpList}
              handleChange={handleChange}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}
              validateRequiredField={validateRequiredField}
            />
          </TabPane>

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
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_RMGP_FORM_DATA
                    }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={buildHelpWhereClause(helpFor, formData)}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default RMGP;
