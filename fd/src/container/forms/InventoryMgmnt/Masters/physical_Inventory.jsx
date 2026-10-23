
import React, { useState, useCallback, useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from 'reactstrap';
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import PhysicalInventoryHeader from "./physical_Inventory_header";
import PhysicalInventoryDetail from "./physical_Inventory_detail";
import PhysicalInventoryBatch from "./physical_Inventory_batch";
import { formatOptions } from '../../../../lib';
import toast from "react-hot-toast";
import { batchInitData, checkBatchExistApi, checkItemExistApi, createSearchPayloadForPhyInvSpecificSearch, detailInitData, headerInitData } from "./physical_Inventory_helper";
import HelpList from "../../../../components/HelpList";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { fetchAppData } from "../../../../utils/fetchUtils";

const PhysicalInventory = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [detailData, setDetailData] = useState([])
  const [batchData, setBatchData] = useState([])
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,setSearchQuery } = useFormStatus();
  const [focusedDetailRowIndex, setFocusedDetailRowIndex] = useState(0);
  const [focusedBatchRowIndex, setFocusedBatchRowIndex] = useState(0);
  const [itemType, setItemType] = useState([]);
  const [itemBase, setItemBase] = useState([]);
  const [itemSubCat, setItemSubCat] = useState([]);
  const [opngMnth, setOpngMnth] = useState([]);
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [deletedDetails, setDeletedDetails] = useState([]);
  const [deletedBatches, setDeletedBatches] = useState([]); 
  const [paginationPage, setPaginationPage] = useState(1);
  const tabs = ["Physical Inventory"];
    const { user } = useSelector((state) => state.auth);

   const [confirmationModal, setConfirmationModal] = useState(false);
   const [confirmationConfig, setConfirmationConfig] = useState({});

     
            const onSuccessConfirmation = useCallback(
               (confirm, it_code) => {
                setConfirmationConfig({});
                setConfirmationModal(false);
                },
              [formData]
             );
          

        const itemIsBatch = useCallback((message, it_code) => {
          setConfirmationConfig({
            title: `Item Code: ${it_code}`,
            description: message,
            uniqKey: "it_code",
          });
          setConfirmationModal(true);
        }, []);


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };



  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    // ----------------------  WC NO SELECTION ----------------------
    case "WcNo":
      setFormData((prev) => ({
        ...prev,
        wc_no: data.wc_no,
        wc_id: data.wc_id,
      }));
      break;

    // ----------------------  ITEM SELECTION ----------------------

    case "item": {
  const existsInDetail = detailData.some(
    (row) => row.it_code === data.it_code
  );
  if (existsInDetail) {
    toast.error(`This It_code ${data.it_code} already exists.`);
    return;
  }

  try {
    const res = await checkItemExistApi({
      it_code: data.it_code,
      wc_id: formData?.wc_id,
      trans_year: user.global_fin_year,
      it_type: formData?.it_type ?? null,
      it_base: formData?.it_base ?? null,
      it_sub_c: formData?.it_sub_c ?? null,
    });

    if (res) {
      setDetailData((prev) =>
        prev.map((row, idx) =>
          idx === selectedRowIndex
            ? {
                ...row,
                it_code: data.it_code,
                it_name: res.it_name,
                drawing_no: res.drawing_no,
                um_code: res.um_code,
                batch_control: res.batch_control,
                old_it_code: row.old_it_code || row.it_code, // Preserve original it_code
                batches: (row.batches || []).map((b) => ({
                ...b,
                it_code: data.it_code, // Update batch it_code
                old_it_code: b.old_it_code || b.it_code, // Preserve original batch it_code
                })),
               }
                : row
            )
          );

      // Update batchData if the selected row is focused
      if (selectedRowIndex === focusedDetailRowIndex) {
        setBatchData((prev) =>
          prev.map((b) => ({
            ...b,
            it_code: data.it_code,
            old_it_code: b.old_it_code || b.it_code,
          }))
        );
      }

      // Message handling for batch/non-batch items
      let finalMessage = res.message;
      if (res.batch_control === "N") {
        finalMessage = `${res.message}. Batch no is not required for this Item`;
      }

      if (finalMessage) {
        itemIsBatch(finalMessage, data.it_code);
      }
    }
  } catch (error) {
    toast.error("Invalid Item Code");
  }
  break;
}

    // ---------------------- 🔹 BATCH SELECTION ----------------------

    case "batch": {
  const currentDetailRow = detailData?.[focusedDetailRowIndex];
  const currentBatchRow = batchData?.[focusedBatchRowIndex];

  const existsInBatch = batchData.some(
    (row) =>
      row.batch_no === data.supp_batch_no &&
      row.it_code === currentDetailRow?.it_code
  );
  if (existsInBatch) {
    toast.error(
      `Batch No. ${data.supp_batch_no} already exists for selected item.`
    );
    return;
  }

  const isNewDetail = currentDetailRow?.isStatus === "new";
  const isNewBatch = currentBatchRow?.isStatus === "new";

  // API call only if formStatus is Update AND both detail + batch are not new
  if (formStatus === "Update" && !isNewDetail && !isNewBatch) {
    try {
      const res = await checkBatchExistApi({
        it_code: currentDetailRow?.it_code,
        batch_no: data.supp_batch_no,
        pinv_id: currentDetailRow?.pinv_id,
      });

      setBatchData((prev) =>
        prev.map((row, idx) =>
          idx === focusedBatchRowIndex
            ? {
                ...row,
                it_code: currentDetailRow?.it_code,
                batch_no: data.supp_batch_no,
                batch_date: data.batch_date
                  ? dateFormatter(data.batch_date)
                  : "",
                old_batch_no: row.old_batch_no || row.batch_no, // Preserve original batch_no
                isStatus: row.isStatus === "new" ? "new" : "updated",
              }
            : row
        )
      );

      // Sync with detailData.batches
      setDetailData((prev) =>
        prev.map((row, idx) =>
          idx === focusedDetailRowIndex
            ? {
                ...row,
                batches: batchData.map((b, bIdx) =>
                  bIdx === focusedBatchRowIndex
                    ? {
                        ...b,
                        it_code: currentDetailRow?.it_code,
                        batch_no: data.supp_batch_no,
                        batch_date: data.batch_date
                          ? dateFormatter(data.batch_date)
                          : "",
                        old_batch_no: b.old_batch_no || b.batch_no,
                        isStatus: b.isStatus === "new" ? "new" : "updated",
                      }
                    : b
                ),
              }
            : row
        )
      );

      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || "Error validating batch.");
    }
  } else {
    // Skip API for new record
    setBatchData((prev) =>
      prev.map((row, idx) =>
        idx === focusedBatchRowIndex
          ? {
              ...row,
              it_code: currentDetailRow?.it_code,
              batch_no: data.supp_batch_no,
              batch_date: data.batch_date ? dateFormatter(data.batch_date) : "",
              old_batch_no: row.old_batch_no || row.batch_no, // Preserve original batch_no
              isStatus: row.isStatus === "new" ? "new" : "updated",
            }
          : row
      )
    );

    // Sync with detailData.batches
    setDetailData((prev) =>
      prev.map((row, idx) =>
        idx === focusedDetailRowIndex
          ? {
              ...row,
              batches: batchData.map((b, bIdx) =>
                bIdx === focusedBatchRowIndex
                  ? {
                      ...b,
                      it_code: currentDetailRow?.it_code,
                      batch_no: data.supp_batch_no,
                      batch_date: data.batch_date
                        ? dateFormatter(data.batch_date)
                        : "",
                      old_batch_no: b.old_batch_no || b.batch_no,
                      isStatus: b.isStatus === "new" ? "new" : "updated",
                    }
                  : b
              ),
            }
          : row
      )
    );
  }
  break;
}

    // ----------------------  DEFAULT ----------------------
    default:
      console.warn("Unhandled help type:", helpFor);
      break;
  }

  toggleHelpModal();
};




  useEffect(() => {
    const fetchLevel1 = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_PHYSICAL_INV_DROPDOWN_DATA
        }`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemType([
        { value: "", label: "" },
        ...formatOptions(data.level1 || [], "level1", "cat_desc"),
      ]);
       setOpngMnth([{value:'', label:''}, ...formatOptions(data.invMonths || [],"month", "cmonth" )])
    };

    if (formStatus) fetchLevel1();
  }, [formStatus]);

   // Level2 load based on Level1 selections
  useEffect(() => {
  const fetchLevel2 = async () => {
    if (formData.it_type) {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_PHYSICAL_INV_DROPDOWN_DATA
        }?level1=${formData.it_type}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemBase([
        { value: "", label: "" },
        ...formatOptions(data.level2 || [], "level2", "cat_desc"),
      ]);
      setItemSubCat([]);
    } else {
      setItemBase([]);
      setItemSubCat([]);
    }
  };
  fetchLevel2();
}, [formData.it_type]);


  // Level3 load based on Level1 + Level2 selection
  useEffect(() => {
  const fetchLevel3 = async () => {
    if (formData.it_type && formData.it_base) {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_PHYSICAL_INV_DROPDOWN_DATA
        }?level1=${formData.it_type}&level2=${formData.it_base}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemSubCat([
        { value: "", label: "" },
        ...formatOptions(data.level3 || [], "level3", "cat_desc"),
      ]);
    } else {
      setItemSubCat([]);
    }
  };
  fetchLevel3();
}, [formData.it_type, formData.it_base]);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData({});
    setDetailData([])
    setBatchData([])
    setDeletedDetails([])
    setDeletedBatches([])
    setFocusedBatchRowIndex(0);
    setFocusedDetailRowIndex(0);
    setSelectedRowIndex(0);
    releaseFormStatus()
  } 

const handleChange = useCallback(
  (name, value, event, type, rowIndex = 0) => {
    // console.log("data change see ::>>",name, value, type, rowIndex, batchData);
    if (!["Insert", "Search", "Update"].includes(formStatus)) return;

    const cursorPos = event?.target?.selectionStart;
    const upperValue =
      typeof value === "string" && name !== "inv_month"
        ? value.toUpperCase()
        : value;

       if (["it_code", "batch_no"].includes(name)) {
           toast.error("Please select value from Help List (double click)");     return;
         }

    // ---------------- REGEX VALIDATION ----------------
    const numericFields = ["it_rej_qty", "it_ok_qty"];
    const threeDecimalRegex = /^\d*\.?\d{0,3}$/;
    if (numericFields.includes(name) && value !== "" && !threeDecimalRegex.test(value)) return;

    // ---------------- Ensure it_code before qty fields ----------------
    if (type === "detail" && ["it_ok_qty", "it_rej_qty"].includes(name)) {
      const currentRow = detailData?.[rowIndex];
      if (!currentRow?.it_code?.trim()) {
        toast.error("Please fill Item Code first!");
        return;
      }
    }

    // ---------------- QTY VALIDATION (ONLY IN INSERT) ----------------
    if (type === "batch" && formStatus === "Insert") {
      const currentBatch = batchData[rowIndex];
      // const hasBatchNo = currentBatch?.batch_no?.trim();
       const hasBatchNo =
        currentBatch?.batch_no &&
        currentBatch.batch_no.trim() !== "";
       // ---------------- QTY_OK ----------------
      if (name === "qty_ok") {
        const positiveRegex = /^(?!0(\.0{1,3})?$)\d+(\.\d{1,3})?$/;

        if (!hasBatchNo) {
          toast.error("Please fill batch number first!");
          return;
        }

        if (value !== "" && !positiveRegex.test(value)) return;
      }
      //       // ---------------- QTY_REJ ----------------
      if (name === "qty_rej") {
        const nonNegativeRegex = /^\d+(\.\d{1,3})?$/;

        if (!hasBatchNo) {
          toast.error("Please fill batch number first!");
          return;
        }

        if (value !== "" && !nonNegativeRegex.test(value)) return;

        // qty_rej < 0 not allowed
        const rejValue = parseFloat(value || 0);
        if (rejValue < 0) {
          toast.error("Rej qty cannot be less than 0");
          return;
        }
      }
    
    }

    // ---------------- HEADER ----------------
    if (type === "header") {
      if (name === "it_type") {
        setFormData((p) => ({ ...p, it_type: upperValue, it_base: "", it_sub_c: "" }));
        setItemBase([]); setItemSubCat([]);
        return;
      }
      if (name === "it_base") {
        setFormData((p) => ({ ...p, it_base: upperValue, it_sub_c: "" }));
        setItemSubCat([]);
        return;
      }
      setFormData((p) => ({ ...p, [name]: upperValue }));
      return;
    }

    // ---------------- DETAIL ----------------
if (type === "detail") {
  setDetailData((prev) => {
    const updated = [...prev];
    const current = { ...updated[rowIndex], [name]: upperValue };

    // Track original code and update related batches
    if (name === "it_code" && updated[rowIndex].it_code !== upperValue) {
      current.old_it_code = updated[rowIndex].old_it_code || updated[rowIndex].it_code;
      current.batches = (current.batches || []).map((b) => ({
        ...b,
        it_code: upperValue, // Update batch it_code to new value
        old_it_code: b.old_it_code || b.it_code || updated[rowIndex].it_code,
      }));
    }

    if (formStatus === "Update" && current.isStatus !== "new") {
      current.isStatus = "updated";
    }

    updated[rowIndex] = current;

    // Sync batchData if current row is focused
    if (focusedDetailRowIndex === rowIndex) {
      setBatchData(current.batches || []);
    }

    return updated;
  });
  return;
}

    // ---------------- BATCH ----------------

    if (type === "batch") {
  setBatchData((prevBatches) => {
    const currentItCode = detailData?.[focusedDetailRowIndex]?.it_code;

    const newBatches = prevBatches.map((row, idx) => {
      if (idx !== rowIndex) return row;
      const updatedRow = {
        ...row,
        [name]: upperValue,
        it_code: row.it_code || currentItCode,
      };

      // Track original batch_no
      if (name === "batch_no" && row.batch_no !== upperValue) {
        updatedRow.old_batch_no = row.old_batch_no || row.batch_no;
      }

      if (formStatus === "Update" && row.isStatus !== "new") {
        updatedRow.isStatus = "updated";
      }
      return updatedRow;
    });

    // Recalculate rej qty
    const totalRej = newBatches
      .filter((b) => b.it_code === currentItCode)
      .reduce((sum, r) => sum + (parseFloat(r.qty_rej) || 0), 0);

    // Update parent detail record
    setDetailData((prev) => {
      const updated = [...prev];
      const d = updated[focusedDetailRowIndex];
      if (d) {
        d.it_rej_qty = totalRej.toFixed(3);
        d.batches = newBatches.map((b) => ({
          ...b,
          old_batch_no: b.old_batch_no || b.batch_no,
        }));
        if (formStatus === "Update" && d.isStatus !== "new") {
          d.isStatus = "updated";
        }
      }
      return updated;
    });

    return [...newBatches];
  });
}

    // ---------------- Restore cursor ----------------
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
  },
  [formStatus, detailData, batchData, focusedDetailRowIndex]
);


const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (!queryData) return;
    const { type, headerData, detailData, batchData, count } = queryData;

    if (type === "not_found") {
      toast.error(queryData.message || "No Data Found");
      handleCancel();
      return;
    }

    if (headerData) {
      setFormData({
        ...headerData,
        inv_date: dateFormatter(headerData.inv_date),
        inv_month: headerData.inv_month?.toString().padStart(2, "0"),
      });
    }

    if (Array.isArray(detailData)) {
      const formattedDetails = detailData.map((d) => {
        const relatedBatches = (batchData || [])
          .filter((b) => b.pinv_id === d.pinv_id) // Match by pinv_id instead of it_code
          .map((b) => ({
            ...b,
            batch_date: b.batch_date ? dateFormatter(b.batch_date) : "",
            old_it_code: b.old_it_code || b.it_code, // Preserve original it_code from DB
            old_batch_no: b.old_batch_no || b.batch_no,
          }));

        return {
          ...d,
          old_it_code: d.old_it_code || d.it_code, // Preserve original it_code from DB
          batches: relatedBatches,
        };
      });

      setDetailData(formattedDetails);
      setBatchData(formattedDetails[0]?.batches || []);
      setFocusedDetailRowIndex(0);
      setFocusedBatchRowIndex(0);
      setPaginationPage(1);
    }

    if (btnClicked === "Query") setTotalRecordCount(count || 0);
  },
  [formStatus, currentRecordNo]
);


const triggerAddRow = useCallback(
  (type) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const phyInv = validateForm("phy-inv", "Physical Inventory");
    if (!phyInv) return;

    const phyInvdtl = validateForm("item-phy-inv", "Physical Inventory");
    if (!phyInvdtl) return;

    // -------------------- DETAIL ADD LOGIC --------------------
    if (type === "detail") {
      if (detailData.length > 0) {
        const lastRow = detailData[detailData.length - 1];
        if (!lastRow.it_code) {
          toast.error("Please fill the last row item code before adding a new one.");
          return;
        }
      }

      setDetailData((prev = []) => {
        const newData = [...prev, { ...detailInitData, isStatus: "new" }];
        setFocusedDetailRowIndex(newData.length - 1);
        return newData;
      });
      return;
    }

    // -------------------- BATCH ADD LOGIC --------------------
    if (type === "batch") {
      const currentDetail = detailData?.[focusedDetailRowIndex];
      if (!currentDetail?.it_code) {
        toast.error("Please select an item code before adding batch.");
        return;
      }

      // Check last batch row for batch_no filled
      if (batchData.length > 0) {
        const lastBatch = batchData[batchData.length - 1];
        if (!lastBatch.batch_no) {
          toast.error("Please fill the last batch number before adding a new one.");
          return;
        }
      }

      //  Attach pinv_id (for Update mode)
      const newBatch = {
        ...batchInitData,
        it_code: currentDetail.it_code,
        pinv_id: currentDetail.pinv_id || "",   // attach parent id
        isStatus: "new",
      };

      // Add batch to selected detail row
      setDetailData((prev) => {
        const updated = [...prev];
        const curr = updated[focusedDetailRowIndex];

        const existingBatches = curr?.batches || [];
        curr.batches = [...existingBatches, newBatch];

        setBatchData(curr.batches);
        setFocusedBatchRowIndex(curr.batches.length - 1);
        return updated;
      });
    }
  },
  [formStatus, detailData, batchData, focusedDetailRowIndex]
);


//  EFFECT 1: Sync detail → batch (only when switching detail row)
  useEffect(() => {
    const currentDetail = detailData?.[focusedDetailRowIndex];

    if (!currentDetail) {
      if (batchData.length > 0) setBatchData([]);
      return;
    }

    // agar batchData already same hai to skip karo
    const newBatchData = currentDetail.batches || [];
    if (
      newBatchData.length === batchData.length &&
      JSON.stringify(newBatchData) === JSON.stringify(batchData)
    ) {
      return;
    }

    //  IMPORTANT: Ye flag lagate hain taaki next effect ignore kare
    setBatchData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newBatchData)) return prev;
      return newBatchData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedDetailRowIndex]);



//  EFFECT 2: Sync batch → detail (only when batchData actually changes by user)
  useEffect(() => {
    if (!detailData?.[focusedDetailRowIndex]) return;

    setDetailData((prev) => {
      const updated = [...prev];
      const currentDetail = updated[focusedDetailRowIndex];

      // agar batchData same hai to skip karo
      const prevBatches = currentDetail?.batches || [];
      if (
        prevBatches.length === batchData.length &&
        JSON.stringify(prevBatches) === JSON.stringify(batchData)
      ) {
        return prev;
      }

      updated[focusedDetailRowIndex] = {
        ...currentDetail,
        batches: batchData,
      };
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchData]);


const handleDelete = useCallback(
  (type, rowIndex) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    // ---------- DELETE DETAIL ----------
    if (type === "detail") {
      const itemToDelete = detailData[rowIndex];
      if (!itemToDelete) return;

      const itemCode = itemToDelete?.it_code?.trim();

      // Prevent delete if child batches exist
      const hasBatches = batchData.some(
        (b) => b.it_code && b.it_code.trim() === itemCode
      );
      if (hasBatches) {
        toast.error("Cannot delete master record -  batch records exist!");
        return;
      }

      //  Only push to deleted list if record is from DB
      if (itemToDelete?.isStatus !== "new") {
        setDeletedDetails((prev) => [
          ...prev,
          { ...itemToDelete, _delete: true },
        ]);
      }

      // Remove from current state
     setDetailData((prev) => {
        const newDetails = prev.filter((_, idx) => idx !== rowIndex);

        // Update focus to previous row (or 0 if first)
        const newFocus = rowIndex > 0 ? rowIndex - 1 : 0;
        setFocusedDetailRowIndex(newFocus);

        //  Sync batchData with the new focused item
        setBatchData(newDetails[newFocus]?.batches || []);

        return newDetails;
      });

      return;
    }

    // ---------- DELETE BATCH ----------
    if (type === "batch") {
      const batchToDelete = batchData[rowIndex];
      if (!batchToDelete) return;

      //  Only push to deleted list if record is from DB
      if (batchToDelete?.isStatus !== "new") {
        setDeletedBatches((prev) => [
          ...prev,
          { ...batchToDelete, _delete: true },
        ]);
      }

      // Remove from batchData
      const updatedBatches = batchData.filter((_, idx) => idx !== rowIndex);
      setBatchData(updatedBatches);

      // Reflect in detailData
      setDetailData((prevDetails) => {
        const updated = [...prevDetails];
        const currentItem = updated[focusedDetailRowIndex];
        if (currentItem) currentItem.batches = updatedBatches;
        return updated;
      });

      // Adjust focus
      setFocusedBatchRowIndex((prev) =>
        prev === rowIndex && prev > 0 ? prev - 1 : prev
      );
      return;
    }
  },
  [formStatus, detailData, batchData, focusedDetailRowIndex]
);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!["Insert", "Update"].includes(formStatus)) return;

    const phyInv = validateForm("phy-inv", "Physical Inventory");
    const phyInvdtl = validateForm("item-phy-inv", "Physical Inventory");
    if (!phyInv || !phyInvdtl) return;

    const finalDetails = detailData.map(({ batches, ...row }) => ({
      ...row,
      wc_id: formData.wc_id,
      trans_year: user.global_fin_year,
      inv_month: formData.inv_month,
      inv_date: formData.inv_date,
      store_process: formData.store_process,
    }));

    const allBatches = detailData.flatMap((d) =>
      (d.batches || []).map((b) => ({
        ...b,
        pinv_id: b.pinv_id || d.pinv_id,
        it_code: b.it_code || d.it_code, // Ensure latest it_code
        old_it_code: b.old_it_code || d.old_it_code || b.it_code, // Preserve original it_code
        old_batch_no: b.old_batch_no || b.batch_no,
      }))
    );

    // Validate batchData it_code matches detailData
    const detailItCodes = new Set(finalDetails.map((d) => d.it_code));
    const invalidBatches = allBatches.filter((b) => !detailItCodes.has(b.it_code));
    if (invalidBatches.length > 0) {
      toast.error("Batch data contains it_codes not present in detail data!");
      console.error("Invalid Batches:", invalidBatches);
      return;
    }

    const payload = {
      formData: { ...formData, trans_year: user.global_fin_year },
      detailData: [...finalDetails, ...deletedDetails].filter(
        (d) => d.isStatus === "new" || d.isStatus === "updated" || d._delete
      ),
      batchData: [...allBatches, ...deletedBatches].filter(
        (b) => b.isStatus === "new" || b.isStatus === "updated" || b._delete
      ),
    };

    if (payload.detailData.length === 0 && payload.batchData.length === 0) {
      toast.error("No records found to submit.");
      return;
    }

    // console.log(" Final Payload Sent:", JSON.stringify(payload, null, 2));

    const method = formStatus === "Insert" ? "POST" : "PUT";
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PHYSICAL_INV_FORM_DATA}?form_status=${formStatus}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    const result = await response.json();
    if (result.success) {
      toast.success(result.message || "Data saved successfully!");
      formCleanup();
    } else {
      toast.error(result.message || "Failed to save data.");
    }
   };

   const handleSearch = async () => {
       try {
         setTotalRecordCount(0);
         setCurrentRecordNo(0);
         const searchPayload = createSearchPayloadForPhyInvSpecificSearch(formData);
         const queryList = new URLSearchParams(searchPayload);
   
         if ([...queryList].length === 0) {
           toast.error("Please enter search criteria");
           return;
         }
   
         setSearchQuery(searchPayload);
   
         const data = await fetchAppData(
           `${APP_PROD_API.GET_PHYSICAL_INV_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        formData={formData}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_PHYSICAL_INV_FORM_DATA}
        formName={" Physical Inventory"}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
          
              <PhysicalInventoryHeader
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
                itemBase={itemBase}
                itemType={itemType}
                itemSubCat ={itemSubCat}
                opngMnth={opngMnth}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
              />

              <PhysicalInventoryDetail
              detailData={detailData}
              setDetailData={setDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              triggerAddRow= {triggerAddRow}
              handleDelete={handleDelete}
              focusedRowIndex={focusedDetailRowIndex}
              setFocusedRowIndex = {setFocusedDetailRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              setPaginationPage={setPaginationPage}
              paginationPage={paginationPage}
              />
              <PhysicalInventoryBatch
                detailData={detailData}        
               setDetailData={setDetailData} 
              batchData={batchData}
              setBatchData={setBatchData}
              formStatus={formStatus}
              handleChange={handleChange}
              triggerAddRow= {triggerAddRow}
              handleDelete={handleDelete}
              focusedRowIndex={focusedBatchRowIndex}
              setFocusedRowIndex = {setFocusedBatchRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              />
              {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PHYSICAL_INV_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: 'Y' }}
              //      whereClause={
              //      helpFor === "WcNo" ? { storeProcess: formData?.store_process }
              //      : helpFor === "item"
              //      ? { wc_id: formData?.wc_id,
              //         inv_month: formData?.inv_month,
              //         it_type: formData?.it_type ?? null,
              //         it_base: formData?.it_base ?? null,
              //         it_sub_c: formData?.it_sub_c ?? null,
              //       }: helpFor === "batch"
              //         ? { it_code: detailData?.[focusedDetailRowIndex]?.it_code }
              //         : {}
              // }
                  whereClause={
                    helpFor === "WcNo"
                      ? (formStatus === "Search"
                          ? {}                              // Search mode → NOTHING sent
                          : { storeProcess: formData?.store_process } 
                        )
                      : helpFor === "item"
                      ? {
                          wc_id: formData?.wc_id,
                          inv_month: formData?.inv_month,
                          it_type: formData?.it_type ?? null,
                          it_base: formData?.it_base ?? null,
                          it_sub_c: formData?.it_sub_c ?? null,
                        }
                      : helpFor === "batch"
                      ? { it_code: detailData?.[focusedDetailRowIndex]?.it_code }
                      : {}
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
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PhysicalInventory