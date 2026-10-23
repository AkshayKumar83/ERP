
import React, { useCallback, useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from 'reactstrap';
import FormSetup from '../../../../components/common/formSetup';
import { useFormStatus } from '../../../../hooks/useFormStatus';
import ItemStockOpeningMstrHeader from './Item_stock_opening_mstr_header';
import ItemStockOpeningMstrDetail from './Item_stock_opening_mstr_details';
import { checkDuplicateItCode, createSearchPayloadForISOMSpecificSearch, DetailStockBatchInitData, DetailStockInitData, headerInitData, validateOkQty, validateRejQty } from './Item_stock_opening_mstr_helper';
import ItemStockOpeningMstrBatchStock from './Item_stock_opening_mstr_batchStock';
import { APP_PROD_API } from '../../../../utils/api';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
 import { dateFormatter, validateForm} from '../../../../utils/fn';
import { fetchAppData } from '../../../../utils/fetchUtils';

const ItemStockOpeningMaster = () => {
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,setSearchQuery} = useFormStatus();
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...headerInitData });
  const [detailData, setDetailData] = useState([]);
  const [allBatchData, setAllBatchData] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedBatchRowIndex, setFocusedBatchRowIndex] = useState(0);
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState('');
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(1);
  const [deletedDetailRows, setDeletedDetailRows] = useState([]);
  const [deletedBatchRows, setDeletedBatchRows] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ['Item Stock Opening Master'];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };

  // const onSelectHelpItem = (data) => {
  //   setDetailData((prev) =>
  //     prev.map((row, index) =>
  //       index === selectedRowIndex
  //         ? {
  //             ...row,
  //             fc_code:data.fc_code,
  //             it_code: data.it_code,
  //             item_name: data.it_name,
  //           }
  //         : row
  //     )
  //   );
  //   toggleHelpModal();
  // };

// const onSelectHelpItem = async (data) => {
//    setFormData((prev) => {
//             switch (helpFor) {
//                 case "storeNo":
//                     return {
//                         ...prev,
//                         wc_no: data.wc_no,
//                         wc_id: data.wc_id,
//                     };
               
//             }
//         });

//   const existsInDetail = detailData.some(row => row.it_code === data.it_code);
//    // only ui checking duplicate it code
//   if (existsInDetail) {
//     toast.error("This It Code already exists.");
//     return;
//   }
//       // backend checking for it Code
//   const existsInDb = await checkDuplicateItCode(
//     data.it_code,
//     formData?.wc_id,
//     user.global_fin_year
//   );

//   if (existsInDb) {
//     toast.error("This It Code already exists in database");
//     return;
//   }

//   //  Set detail row if all checks pass
//   setDetailData(prev =>
//     prev.map((row, index) =>
//       index === selectedRowIndex
//         ? {
//             ...row,
//             fc_code: data.fc_code,
//             it_code: data.it_code,
//             item_name: data.it_name,
//           }
//         : row
//     )
//   );

//   toggleHelpModal();
// };

const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    case "storeNo":
      setFormData((prev) => ({
        ...prev,
        wc_no: data.wc_no,
        wc_id: data.wc_id,
      }));
      break;

    case "item": {
      const existsInDetail = detailData.some(
        (row) => row.it_code === data.it_code
      );
      if (existsInDetail) {
        toast.error("This It Code already exists.");
        return;
      }

      const existsInDb = await checkDuplicateItCode(
        data.it_code,
        formData?.wc_id,
        user.global_fin_year
      );

      if (existsInDb) {
        toast.error("This It Code already exists in database");
        return;
      }

      setDetailData((prev) =>
        prev.map((row, index) =>
          index === selectedRowIndex
            ? {
                ...row,
                fc_code: data.fc_code,
                it_code: data.it_code,
                item_name: data.it_name,
              }
            : row
        )
      );
      break;
    }

    default:
      console.warn("Unhandled help type:", helpFor);
      break;
  }

  toggleHelpModal();
};



  const formCleanup = () => {
    releaseFormStatus();
    setFormData({ ...headerInitData });
    setDetailData([]);
    setAllBatchData([]);
    setFocusedRowIndex(0);
    setFocusedBatchRowIndex(0);
    setSelectedRowIndex(0);
    setDeletedDetailRows([]);
    setDeletedBatchRows([]);
  };

  const handleOffset = (data) => {
    setCurrentRecordNo(data);
  };

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);


  const handleFormDataChange = useCallback((name, value, event = null) => {
    if (!["Search", "Update"].includes(formStatus)) return;

    const cursorPosition = event?.target?.selectionStart;
    const newVal = value?.toUpperCase?.() ?? value; // uppercase only if string

    setFormData(prev => ({ ...prev, [name]: newVal }));

    // maintain cursor for text inputs
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, [formStatus]);



    const handleCommonChange = useCallback((stateKey, name, value, index, event = null) => {
  if (!["Update"].includes(formStatus)) return;

  const cursorPosition = event?.target?.selectionStart;
  let newVal = value?.toUpperCase?.() ?? value;

  //   if (["it_code"].includes(name)) {
  //   toast.error("Please select Item from Help List on (double click)");
  //   return;
  // }

    //  Allowed numeric fields with up to 3 decimal places (no negative)
  const numericFields = ["yrop_qtyok", "yrop_qtyre", "ok_qty", "rej_qty"];
  if (numericFields.includes(name)) {
    // Remove spaces
    newVal = newVal?.toString().trim();
    const regex = /^\d*\.?\d{0,3}$/;    //  Allow only numbers and decimal point
    if (newVal && !regex.test(newVal)) return;      //  If not matching allowed format, ignore input
      
    if (newVal.startsWith("00")) {     //  Prevent leading zeros like 00.123 → allow only 0.123
      newVal = newVal.replace(/^0+/, "0");
    }
    if (newVal.includes("-")) return;      //  Prevent typing minus (-)
  }

  if (stateKey === "detailData" && index !== undefined) {
    setDetailData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [name]: newVal,
        ...(newData[index].isStatus !== 'new' ? { isStatus: 'update' } : {})
      };
      return newData;
    });
  } else if (stateKey === "batchData" && index !== undefined) {
    setAllBatchData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [name]: newVal,
        ...(newData[index].isStatus !== 'new' ? { isStatus: 'update' } : {})
      };
      return newData;
    });
  }

  if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  ) {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }
}, [formStatus]);
   


const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (!queryData) return;

    // Case 1: No record found
    if (queryData?.type === "not_found") {
      toast.error("No Data Found");
       handleCancel(); 
      setFormData();  
      setDetailData([]);
      setAllBatchData([]) ;               
      setTotalRecordCount(0); 
      return;
    }
      const {itmStockOpnMstr,itemDetails,batchData,count } = queryData;

    if(itmStockOpnMstr){
      setFormData({
        ...itmStockOpnMstr,
      })
    }
     if (itemDetails) {
      setDetailData(itemDetails.length > 0 ? itemDetails.map(item => ({...item, id: item.id || uuidv4()})) : []);
    }

     if (batchData) {
          if (batchData.length > 0) {
            const formattedData = batchData.map((item) => ({
              ...item,
              id: item.id || uuidv4(),
              batch_date: item.batch_date ? dateFormatter(item.batch_date) : "",
              old_batch_no: item.batch_no || null,
            }));
            setAllBatchData(formattedData);
          } else {
            setAllBatchData([]);
          }
        }
        
          setPaginationPage(1);
          setFocusedRowIndex(0);
          
        if (btnClicked === "Query") {
              setTotalRecordCount(count || 0);
            }
  },
  [formStatus, currentRecordNo,setFormData,setDetailData,setAllBatchData]
);


const filteredBatchData = React.useMemo(() => {
  if (
    focusedRowIndex < 0 ||
    focusedRowIndex >= detailData.length ||
    allBatchData.length === 0
  ) return [];

  const parent = detailData[focusedRowIndex];
  if (!parent.it_code) return [];

  return allBatchData.filter(
    (batch) => batch.it_code === parent.it_code
  );
}, [focusedRowIndex, detailData, allBatchData]);



useEffect(() => {
  if (filteredBatchData.length === 0) {
    setFocusedBatchRowIndex(0);
  } else if (focusedBatchRowIndex >= filteredBatchData.length) {
    setFocusedBatchRowIndex(filteredBatchData.length - 1);
  }
}, [filteredBatchData]);


const triggerAddRowItem = () => {
   if (!["Update"].includes(formStatus)) return;
    const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
    if(!isValidDetail) return
  const newDetail = {
    ...DetailStockInitData,
    id: uuidv4(),
    it_code: "",
    isStatus: 'new'
  };

  setDetailData((prev) => [...prev, newDetail]);
  setFocusedRowIndex(detailData.length);
  setFocusedBatchRowIndex(-1);
};


  // const triggerAddRowBatch = () => {

  //   if (![ "Update"].includes(formStatus))  return;
    
    
  // const validateBatchRow = validateForm('item-stock-open-batch', 'Item Stock Batch')
  //     if(!validateBatchRow) return

  // const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
  //     if(!isValidDetail) return
      
  //   if (focusedRowIndex < 0 || focusedRowIndex >= detailData.length) {
  //     toast.error("Please select a detail row first");
  //     return;
  //   }

  //   const parentDetail = detailData[focusedRowIndex];

  //   if (!parentDetail.it_code) {
  //     toast.error("Please select Item Code before adding batch");
  //     return;
  //   }

  //   const newBatch = {
  //     ...DetailStockBatchInitData,
  //     id: uuidv4(),
  //     wc_id: parentDetail.wc_id || formData.wc_id || "",
  //     it_code: parentDetail.it_code,
  //     trans_year: parentDetail.trans_year || user.global_fin_year || "",
  //     batch_no: "",
  //     batch_date: "",
  //     ok_qty: "",
  //     rej_qty: "",
  //     ytd_recpok: "",
  //     ytd_issuok: "",
  //     currbal_ok: "",
  //     isStatus: 'new'
  //   };

  //   setAllBatchData((prev) => {
  //     const updated = [...prev, newBatch];
  //     // Set focus to last row of this parent
  //     const parentBatches = updated.filter(b => b.it_code === parentDetail.it_code);
  //     setFocusedBatchRowIndex(parentBatches.length - 1);
  //     return updated;
  //   });
  // };

   const triggerAddRowBatch = () => {
  if (!["Update"].includes(formStatus)) return;

  const validateBatchRow = validateForm('item-stock-open-batch', 'Item Stock Batch');
  if (!validateBatchRow) return;

  const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form');
  if (!isValidDetail) return;

  if (focusedRowIndex < 0 || focusedRowIndex >= detailData.length) {
    toast.error("Please select a detail row first");
    return;
  }

  const parentDetail = detailData[focusedRowIndex];
  if (!parentDetail.it_code) {
    toast.error("Please select Item Code before adding batch");
    return;
  }

  //  Duplicate batch check
  const parentBatches = allBatchData.filter(b => b.it_code === parentDetail.it_code);
  if (parentBatches.some(b => b.batch_no === "")) {
    toast.error("Please fill existing batch number before adding new row");
    return;
  }

  // Optional: check if any batch_no duplicates already exist
  const batchNos = parentBatches.map(b => b.batch_no);
  if (batchNos.some((bn, i) => bn && batchNos.indexOf(bn) !== i)) {
    toast.error("Duplicate batch number found.");
    return;
  }

  const newBatch = {
    ...DetailStockBatchInitData,
    id: uuidv4(),
    wc_id: parentDetail.wc_id || formData.wc_id || "",
    it_code: parentDetail.it_code,
    trans_year: parentDetail.trans_year || user.global_fin_year || "",
    batch_no: "",
    batch_date: "",
    ok_qty: "",
    rej_qty: "",
    ytd_recpok: "",
    ytd_issuok: "",
    currbal_ok: "",
    isStatus: 'new'
  };

  setAllBatchData(prev => {
    const updated = [...prev, newBatch];
    setFocusedBatchRowIndex(parentBatches.length); // focus on new row
    return updated;
  });
};



const handleDelete = (data, rowIndex) => {
  //  Case 1: Detail row delete
  if (typeof rowIndex === "number") {
    const deletedItCode = data?.it_code;

    //  Case A: Empty new row (not yet saved) → just remove
    if (!deletedItCode) {
      setDetailData(prev => prev.filter((_, i) => i !== rowIndex));
      setFocusedRowIndex(prev => Math.max(0, prev - 1));
      return;
    }

    // Case B: Check if batches exist → block delete
    const hasBatches = allBatchData.some(b => b.it_code === deletedItCode);
    if (hasBatches) {
      toast.error("Cannot delete master record when matching detail records exist.");
      return;
    }

    // Case C: Move to delete list (if not 'new')
    setDetailData(prev => prev.filter((_, i) => i !== rowIndex));

    if (data.isStatus !== "new") {
      setDeletedDetailRows(prev => [...prev, { ...data, isStatus: "delete" }]);
    }

    // Remove orphan batches too (just in case)
    setAllBatchData(prev => prev.filter(b => b.it_code !== deletedItCode));
  } 

  // Case 2: Batch row delete
  else {
    setAllBatchData(prev => prev.filter(b => b.id !== data.id));

    if (data.isStatus !== "new") {
      setDeletedBatchRows(prev => [...prev, { ...data, isStatus: "delete" }]);
    }

    setFocusedBatchRowIndex(prev => Math.max(0, prev - 1));
  }
};


const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForISOMSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}?formStatus=${formStatus}&appDivisionId=${
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


 
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (formStatus !== 'Update') return;

        // check item Detail form valid record
    const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
    if(!isValidDetail){
      return
    }

     // check batch form valid record
     const validateBatchRow = validateForm('item-stock-open-batch', 'Item Stock Batch')
     if(!validateBatchRow){
      return
     }

      // helper to round to 3 decimal places
    const round3 = (num) => Math.round((num + Number.EPSILON) * 1000) / 1000;

//     for (const detail of detailData) {
//   const currentItCode = detail.it_code;
//   const relatedBatches = allBatchData.filter(b => b.it_code === currentItCode);

//   //  Duplicate batch_no check
//   const batchNos = relatedBatches.map(b => b.batch_no).filter(bn => bn); // ignore empty
//   const uniqueBatchNos = new Set(batchNos);
//   if (uniqueBatchNos.size !== batchNos.length) {
//     toast.error(`Duplicate Batch Number found for Item Code ${currentItCode}`);
//     return; // stop submission
//   }

//   // Validate OK/REJ QTY
//   // const totOkQty = relatedBatches.reduce((sum, b) => sum + (Number(b.ok_qty) || 0), 0);
//   // const totRejQty = relatedBatches.reduce((sum, b) => sum + (Number(b.rej_qty) || 0), 0);

//   // for (const b of relatedBatches) {
//   //   const okValid = validateOkQty(detail.yrop_qtyok, round3(totOkQty), b.ok_qty);
//   //   if (!okValid) return;
//   //   const rejValid = validateRejQty(detail.yrop_qtyre, round3(totRejQty), b.rej_qty);
//   //   if (!rejValid) return;
//   // }
// }

// Step 4: Validation loop
    for (const detail of detailData) {
      const currentItCode = detail.it_code;
      const relatedBatches = allBatchData.filter(b => b.it_code === currentItCode);

      // Duplicate batch_no check
      const batchNos = relatedBatches.map(b => b.batch_no).filter(bn => bn);
      const uniqueBatchNos = new Set(batchNos);
      if (uniqueBatchNos.size !== batchNos.length) {
        toast.error(`Duplicate Batch Number found for Item Code ${currentItCode}`);
        return;
      }

      // === OK/REJ Qty Validation ===
      const yropOk = Number(detail.yrop_qtyok) || 0;
      const yropRej = Number(detail.yrop_qtyre) || 0;

      for (const b of relatedBatches) {
        const okQty = Number(b.ok_qty) || 0;
        const rejQty = Number(b.rej_qty) || 0;

        // OK Qty validations
        if (yropOk === 0 && okQty > 0) {
          toast.error(`Cannot enter Ok Qty when Year Opening Ok Qty is Null or Zero for Item ${currentItCode}`);
          return;
        } else if (yropOk > 0 && okQty < 0) {
          toast.error(`Batch Ok Qty cannot be Negative for Item ${currentItCode}`);
          return;
        } else if (yropOk > 0 && okQty > yropOk) {
          toast.error(`Batch Ok Qty cannot be greater than Year Opening Ok Qty for Item ${currentItCode}`);
          return;
        }

        // Reject Qty validations
        if (yropRej === 0 && rejQty > 0) {
          toast.error(`Cannot enter Reject Qty when Year Opening Reject Qty is Null or Zero for Item ${currentItCode}`);
          return;
        } else if (yropRej > 0 && rejQty < 0) {
          toast.error(`Batch Reject Qty cannot be Negative for Item ${currentItCode}`);
          return;
        } else if (yropRej > 0 && rejQty > yropRej) {
          toast.error(`Batch Reject Qty cannot be greater than Year Opening Reject Qty for Item ${currentItCode}`);
          return;
        }
      }
    }

    const finalTransYear =  user.global_fin_year;

    //  Step 1: Add trans_year + wc_id to all records
    const updatedFormData = {
      ...formData,
      trans_year: finalTransYear,
      wc_id: formData.wc_id,
    };

    //  Step 2: Split detailData into new + updated
    const newDetails = detailData.filter(d => d.isStatus === 'new');
    const updatedDetails = detailData.filter(d => d.isStatus === 'update');

    //  Step 3: Split batchData into new + updated
    const newBatches = allBatchData.filter(b => b.isStatus === 'new');
    const updatedBatches = allBatchData.filter(b => b.isStatus === 'update');

    //  Step 4: Add trans_year + wc_id to each
    const finalNewDetails = newDetails.map(d => ({
      ...d,
      trans_year: finalTransYear,
      wc_id: formData.wc_id,
    }));

    const finalUpdatedDetails = updatedDetails.map(d => ({
      ...d,
      trans_year: finalTransYear,
      wc_id: formData.wc_id,
    }));

    const finalNewBatches = newBatches.map(b => ({
      ...b,
      trans_year: finalTransYear,
      wc_id: formData.wc_id,
    }));

    const finalUpdatedBatches = updatedBatches.map(b => ({
      ...b,
      trans_year: finalTransYear,
      wc_id: formData.wc_id,
    }));

    //  Step 5: Prepare Final Payload
    const payload = {
      formData: updatedFormData,
      detailData: {
        new: finalNewDetails,
        update: finalUpdatedDetails,
        delete: deletedDetailRows,
      },
      batchData: {
        new: finalNewBatches,
        update: finalUpdatedBatches,
        delete: deletedBatchRows,
      },
    };

 
    //  Step 6: Submit to backend
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITEM_STOCK_OPNG_MSTR_DATA}?form_status=Update`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed while submitting!');

    if (result.type === 'success') {
      toast.success('Data saved successfully!');
      formCleanup();
    } else {
      toast.error(result.message || 'Save failed!');
    }
  } catch (err) {
    toast.error(err.message || 'Error during save');
    console.error('Submit error:', err);
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
        QUERY_API={APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}
        formName={'Item Stock Opening Master'}
        authority={{insert:"N",update:"Y"}}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        btnEnableDtl={{ insert:false}}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <ItemStockOpeningMstrHeader
              formData={formData}
             handleChange={handleFormDataChange}
              formStatus={formStatus}
               handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
            />
            <ItemStockOpeningMstrDetail
              detailData={detailData}
              setDetailData={setDetailData}
              handleChange={handleCommonChange}
               triggerAddRow={triggerAddRowItem}
              formStatus={formStatus}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              setFocusedRowIndex={setFocusedRowIndex}
              focusedRowIndex={focusedRowIndex}
              paginationPage={paginationPage}
              setPaginationPage={setPaginationPage}
               allBatchData={allBatchData}
               setAllBatchData={setAllBatchData}  
               handleDelete={handleDelete}
            />
            <ItemStockOpeningMstrBatchStock
               batchData={filteredBatchData} 
               allBatchData={allBatchData}
              setAllBatchData={setAllBatchData}
              detailData ={detailData}
              handleChange={handleCommonChange}
              formStatus={formStatus}
              triggerAddRow={ triggerAddRowBatch}
              setFocusedBatchRowIndex={setFocusedBatchRowIndex}
              focusedBatchRowIndex={focusedBatchRowIndex}
              handleDelete={handleDelete}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: 'Y' }}
                   whereClause={helpFor === 'item'?{f_wc_id: formData.wc_id}:{}}
                  />
                </ModalBody>
              </Modal>
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItemStockOpeningMaster;










// import React, { useCallback, useState } from 'react';
// import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from 'reactstrap';
// import FormSetup from '../../../../components/common/formSetup';
// import { useFormStatus } from '../../../../hooks/useFormStatus';
// import ItemStockOpeningMstrHeader from './Item_stock_opening_mstr_header';
// import ItemStockOpeningMstrDetail from './Item_stock_opening_mstr_details';
// import { createSearchPayloadForISOMSpecificSearch, DetailStockBatchInitData, DetailStockInitData, headerInitData } from './Item_stock_opening_mstr_helper';
// import ItemStockOpeningMstrBatchStock from './Item_stock_opening_mstr_batchStock';
// import { APP_PROD_API } from '../../../../utils/api';
// import HelpList from '../../../../components/HelpList';
// import { useSelector } from 'react-redux';
// import toast from 'react-hot-toast';
// import { v4 as uuidv4 } from 'uuid';
// import { dateFormatter, validateForm } from '../../../../utils/fn';
// import { fetchAppData } from '../../../../utils/fetchUtils';

// const ItemStockOpeningMaster = () => {
//   const { formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,setSearchQuery} = useFormStatus();
//   const [activeTab, setActiveTab] = useState(1);
//   const [currentRecordNo, setCurrentRecordNo] = useState(0);
//   const [totalRecordCount, setTotalRecordCount] = useState(0);
//   const [formData, setFormData] = useState({ ...headerInitData });
//   const [detailData, setDetailData] = useState([{ ...DetailStockInitData, id: uuidv4() }]);
//   const [batchData, setBatchData] = useState([]);
//   const [focusedRowIndex, setFocusedRowIndex] = useState(0);
//   const [helpList, setHelpList] = useState(false);
//   const [helpFor, setHelpFor] = useState('');
//   const [helpListHeader, setHelpListHeader] = useState([]);
//   const [selectedRowIndex, setSelectedRowIndex] = useState(0);
//    const [paginationPage, setPaginationPage] = useState(1);

//   const { user } = useSelector((state) => state.auth);
//   const toggleHelpModal = () => setHelpList(!helpList);

//   const tabs = ['Item Stock Opening Master'];

//   const updateActiveTab = useCallback((tab) => {
//     setActiveTab(tab);
//   }, []);

//   const handleHelpList = (show, rowIndex = -1) => {
//     setHelpList(show);
//     setSelectedRowIndex(rowIndex);
//   };

//   const onSelectHelpItem = (data) => {
//     setDetailData((prev) =>
//       prev.map((row, index) =>
//         index === selectedRowIndex
//           ? {
//               ...row,
//               it_code: data.it_code,
//               item_name: data.it_name,
//             }
//           : row
//       )
//     );
//     toggleHelpModal();
//   };

// //  const validateBatchQtys = () => {
// //   const detailRow = detailData[focusedRowIndex];
// //   if (!detailRow) {
// //     toast.error("Please select a detail row before submitting.");
// //     return false;
// //   }

// //   const relatedBatchRows = batchData.filter(
// //     (row) => row.detailId === detailRow.id
// //   );

// //   const totalOkQty = relatedBatchRows.reduce(
// //     (sum, item) => sum + Number(item.ok_qty || 0),
// //     0
// //   );
// //   const totalRejQty = relatedBatchRows.reduce(
// //     (sum, item) => sum + Number(item.rej_qty || 0),
// //     0
// //   );

// //   const yropQtyOk = Number(detailRow.yrop_qtyok || 0);
// //   const yropQtyRe = Number(detailRow.yrop_qtyre || 0);

// //   // ✅ Validate OK Qty
// //   if (yropQtyOk !== 0 && totalOkQty === 0) {
// //     toast.error("Batch Ok Qty cannot be zero or null");
// //     return false;
// //   }
// //   if (totalOkQty !== 0 && totalOkQty !== yropQtyOk) {
// //     toast.error("Total Ok Batch Qty must be equal to Year Opening Ok Qty");
// //     return false;
// //   }

// //   // ✅ Validate Rejection Qty
// //   if (yropQtyRe !== 0 && totalRejQty === 0) {
// //     toast.error("Batch Reject Qty cannot be zero or null");
// //     return false;
// //   }
// //   if (totalRejQty !== 0 && totalRejQty !== yropQtyRe) {
// //     toast.error("Total Reject Batch Qty must be equal to Year Opening Reject Qty");
// //     return false;
// //   }

// //   return true;
// // };

// const validateBatchOkRejQtys = (detailData = [], batchData = [], batchFlags = {}) => {
//   for (let detail of detailData) {
//     const flag = batchFlags[detail.it_code]; //  Get flag from map
//     if (flag !== 'Y') continue;

//     const relatedBatches = batchData.filter(
//       (batch) =>
//         batch.it_code === detail.it_code &&
//         batch.wc_id === detail.wc_id &&
//         batch.trans_year === detail.trans_year
//     );

//     const totalOkQty = relatedBatches.reduce((sum, item) => sum + Number(item.ok_qty || 0), 0);
//     const totalRejQty = relatedBatches.reduce((sum, item) => sum + Number(item.rej_qty || 0), 0);

//     const yropQtyOk = Number(detail.yrop_qtyok || 0);
//     const yropQtyRe = Number(detail.yrop_qtyre || 0);

//     if (yropQtyOk !== 0 && totalOkQty === 0) {
//       return {
//         valid: false,
//         message: `Batch Ok Qty cannot be zero for item ${detail.it_code}`,
//       };
//     }
//     if (totalOkQty !== 0 && totalOkQty !== yropQtyOk) {
//       return {
//         valid: false,
//         message: `Mismatch: Total Ok Batch Qty must be equal to Year Opening Ok Qty for item ${detail.it_code}`,
//       };
//     }

//     if (yropQtyRe !== 0 && totalRejQty === 0) {
//       return {
//         valid: false,
//         message: `Batch Reject Qty cannot be zero for item ${detail.it_code}`,
//       };
//     }
//     if (totalRejQty !== 0 && totalRejQty !== yropQtyRe) {
//       return {
//         valid: false,
//         message: `Mismatch: Total Reject Batch Qty must be equal to Year Opening Reject Qty for item ${detail.it_code}`,
//       };
//     }
//   }

//   return { valid: true };
// };



// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (formStatus !== 'Update') return;

//   const batchFlags = {};
//     detailData.forEach((item) => {
//       batchFlags[item.it_code] = item.batch_flag;
//   });
//     //  console.log('Batch Flags:', batchFlags);
//     //  console.log('Validating for:', detailData.map(d => ({ code: d.it_code, flag: d.batch_flag })));

//     // check item Detail form valid record
//     const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
//     if(!isValidDetail){
//       return
//     }


//      // check batch form valid record
//      const validateBatchRow = validateForm('item-stock-open-batch', 'Item Stock Batch')
//      if(!validateBatchRow){
//       toast.error('Please Fill required field in Batch row')
//       return
//      }

//   const validation = validateBatchOkRejQtys(detailData, batchData, batchFlags);
// if (!validation.valid) {
//   toast.error(validation.message);
//   return;
// }



//   try {
//     const finalTransYear = formData.trans_year || user.global_fin_year;

//     const updatedFormData = {
//       ...formData,
//       trans_year: finalTransYear,
//     };

//     const updatedDetailData = detailData.map((row) => ({
//       ...row,
//       wc_id: updatedFormData.wc_id,
//       trans_year: updatedFormData.trans_year,
//     }));

//     const updatedBatchData = batchData.map((row) => ({
//       ...row,
//       wc_id: updatedFormData.wc_id,
//       trans_year: updatedFormData.trans_year,
//     }));

//     const payload = {
//       formData: updatedFormData,
//       detailData: updatedDetailData,
//       batchData: updatedBatchData,
//     };

//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITEM_STOCK_OPNG_MSTR_DATA}?form_status=Update`,
//       {
//         method: 'PUT',
//         body: JSON.stringify(payload),
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//       }
//     );

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.message || 'Something went wrong!');

//     if (result.type === 'success') {
//       toast.success('Data updated successfully!');
//       formCleanup();
//     } else {
//       toast.error(result.message || 'Update failed!');
//     }
//   } catch (err) {
//     toast.error(err.message || 'Check your form or contact admin');
//     console.error('Submit error:', err);
//   }
// };


//   const formCleanup = () => {
//     releaseFormStatus();
//     setFormData({ ...headerInitData });
//     setDetailData([{ ...DetailStockInitData, id: uuidv4() }]);
//     setBatchData([]);
//     setFocusedRowIndex(0);
//     setSelectedRowIndex(0);
//   };

//   const handleOffset = (data) => {
//     setCurrentRecordNo(data);
//   };

//   const handleCancel = useCallback(() => {
//     formCleanup();
//   }, []);

//   // const handleChange = useCallback((stateKey, name, value, index, event) => {
//   //    if(!["Search","Update"].includes(formStatus))return;
//   //   const cursorPosition = event?.target?.selectionStart;
//   //   let newVal = value.toUpperCase();

//   //   if (stateKey === 'formData') {
//   //     setFormData((prev) => ({ ...prev, [name]: newVal }));
//   //   } else if (stateKey === 'detailData') {
//   //     setDetailData((prevData) => {
//   //       const newData = [...prevData];
//   //       newData[index] = { ...newData[index], [name]: newVal };
//   //       return newData;
//   //     });
//   //   } else if (stateKey === 'batchData') {
//   //     setBatchData((prevData) => {
//   //       const newData = [...prevData];
//   //       // Find the actual index in the full batchData array based on the filtered batchData
//   //       const filteredBatchData = prevData.filter(
//   //         (batch) => batch.detailId === (detailData[focusedRowIndex]?.id || '')
//   //       );
//   //       const actualIndex = prevData.findIndex(
//   //         (batch) => batch.id === filteredBatchData[index]?.id
//   //       );
//   //       if (actualIndex !== -1) {
//   //         newData[actualIndex] = { ...newData[actualIndex], [name]: newVal };
//   //       }
//   //       return newData;
//   //     });
//   //   }

//   //   if (event) {
//   //     setTimeout(() => {
//   //       event.target.setSelectionRange(cursorPosition, cursorPosition);
//   //     }, 0);
//   //   }
//   // }, [detailData, focusedRowIndex]);

// const handleChange = useCallback((stateKey, name, value, index, event) => {
//   if (!["Search", "Update"].includes(formStatus)) return;

//   const cursorPosition = event?.target?.selectionStart;
//   let newVal = value.toUpperCase?.() ?? value; // only uppercase if string

//   if (stateKey === 'formData') {
//     setFormData((prev) => ({ ...prev, [name]: newVal }));
//   } else if (stateKey === 'detailData') {
//     setDetailData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = { ...newData[index], [name]: newVal };
//       return newData;
//     });
//   } else if (stateKey === 'batchData') {
//     setBatchData((prevData) => {
//       const newData = [...prevData];
//       const filteredBatchData = prevData.filter(
//         (batch) => batch.detailId === (detailData[focusedRowIndex]?.id || '')
//       );
//       const actualIndex = prevData.findIndex(
//         (batch) => batch.id === filteredBatchData[index]?.id
//       );
//       if (actualIndex !== -1) {
//         newData[actualIndex] = { ...newData[actualIndex], [name]: newVal };
//       }
//       return newData;
//     });
//   }

//   // ✅ only apply selection range if input is text
//   if (event && event.target.type === "text") {
//     setTimeout(() => {
//       event.target.setSelectionRange(cursorPosition, cursorPosition);
//     }, 0);
//   }
// }, [detailData, focusedRowIndex, formStatus]);

// const setupQueryData = useCallback(
//   (queryData, btnClicked) => {
//     if (queryData?.type === "not_found") {
//       toast.error("No Data Found");
//       setFormData({ ...headerInitData });
//       setDetailData([{ ...DetailStockInitData, id: uuidv4() }]);
//       setBatchData([]);
//       setTotalRecordCount(0);
//       return;
//     }

//     const itemDetailsWithId =
//       queryData?.itemDetails?.map((item) => ({
//         ...item,
//         id: uuidv4(),
//       })) || [{ ...DetailStockInitData, id: uuidv4() }];

//     const itCodeToDetailIdMap = {};
//     itemDetailsWithId.forEach((item) => {
//       itCodeToDetailIdMap[item.it_code] = item.id;
//     });

//     const batchDataWithIds =
//       queryData?.batchData?.map((item) => ({
//         ...item,
//         id: uuidv4(),
//         detailId: itCodeToDetailIdMap[item.it_code] || "",
//         batch_date: item.batch_date ? dateFormatter(item.batch_date) : "",
//         ok_qty: Number(item.ok_qty).toFixed(3),
//         rej_qty: Number(item.rej_qty).toFixed(3),
//       })) || [];

//     setFormData(queryData?.itmStockOpnMstr || { ...headerInitData });
//     setDetailData(itemDetailsWithId);
//     setBatchData(batchDataWithIds);
//     setFocusedRowIndex(0);
//     setPaginationPage(1)

//     if (btnClicked === "Query") {
//       setTotalRecordCount(queryData?.count || 0);
//     }
//   },
//   [formStatus, currentRecordNo]
// );


// const triggerAddRow = (setState, initData, isBatch = false) => {
//   // alert(isBatch)
//     const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
//     if(!isValidDetail){
//       return
//     }
//   if (isBatch) {
//     if (focusedRowIndex < 0 || !detailData[focusedRowIndex]) {
//       toast.error('Please select a detail row first!');
//       return;
//     }

//     const detailRow = detailData[focusedRowIndex];
//      const relatedBatchData = batchData.filter(
//         (batch) => batch.detailId === detailRow.id
//       );
//        // Validate the last batch row for batch_no and batch_date
//       if (relatedBatchData.length > 0) {
//         const lastBatchRow = relatedBatchData[relatedBatchData.length - 1];
//         if (!lastBatchRow.batch_no || !lastBatchRow.batch_date) {
//           toast.error('Please fill batch number and batch date in the previous batch row before adding a new one.');
//           return;
//         }
//       }

//     // const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
//     // alert('hel')
//     // if(!isValidDetail){
//     //   return
//     // }

//     setState((prev) => [
//       ...prev,
//       {
//         ...initData,
//         id: uuidv4(),
//         detailId: detailRow.id,
//         it_code: detailRow.it_code,          
//         trans_year: detailRow.trans_year,    
//         wc_id: formData.wc_id                
//       },
//     ]);
//   } else {
//     //  alert(isBatch)
//     // const isValidDetail = validateForm('item-stock-detail', 'Stock Detail Form')
//     // if(!isValidDetail){
//     //   return
//     // }
//     // for Detail section
//     setState((prev) => [...prev, { ...initData, id: uuidv4() }]);
//   }
// };



// const handleSearch = async () => {
//     try {
//       setTotalRecordCount(0);
//       setCurrentRecordNo(0);
//       const searchPayload = createSearchPayloadForISOMSpecificSearch(formData);
//       const queryList = new URLSearchParams(searchPayload);

//       if ([...queryList].length === 0) {
//         toast.error("Please enter search criteria");
//         return;
//       }

//       setSearchQuery(searchPayload);

//       const data = await fetchAppData(
//         `${APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}?formStatus=${formStatus}&appDivisionId=${
//         user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
//       );

//       if (data?.count === 0) {
//         toast.error("No matching data record found");
//         return;
//       }
//       setupQueryData(data, "Query");
//       handleOperation("Query");
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error(error?.message || "Some error occurred");
//     }
//   };



//   return (
//     <React.Fragment>
//       <FormSetup
//         navType="tabs"
//         activeTab={activeTab}
//         tabs={tabs}
//         updateActiveTab={updateActiveTab}
//         formStatus={formStatus}
//         currentRecordNo={currentRecordNo}
//         totalRecordCount={totalRecordCount}
//         pageCount={1}
//         totalPageCount={1}
//         isSingleQuery={true}
//         setupQueryData={setupQueryData}
//         handleSubmit={handleSubmit}
//         handleCancel={handleCancel}
//         handleOperation={handleOperation}
//         formData={formData}
//         handleOffset={handleOffset}
//         QUERY_API={APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}
//         formName={'Item Stock Opening Master'}
//         authority={{insert:"N",update:"Y"}}
//         handleSearch={handleSearch}
//         formPayload={{ searchQuery }}
//         setSearchQuery={setSearchQuery}
//         btnEnableDtl={{ insert:false}}

//       >
//         <TabContent activeTab={activeTab}>
//           <TabPane tabId={1}>
//             <ItemStockOpeningMstrHeader
//               formData={formData}
//               handleChange={(name, value, event) => handleChange('formData', name, value, null, event)}
//               formStatus={formStatus}
//             />
//             <ItemStockOpeningMstrDetail
//               detailData={detailData}
//               setDetailData={setDetailData}
//               handleChange={handleChange}
//               triggerAddRow={() => triggerAddRow(setDetailData, DetailStockInitData)}
//               formStatus={formStatus}
//               handleHelpList={handleHelpList}
//               setHelpFor={setHelpFor}
//               setHelpListHeader={setHelpListHeader}
//               setFocusedRowIndex={setFocusedRowIndex}
//               focusedRowIndex={focusedRowIndex}
//               paginationPage={paginationPage}
//               setPaginationPage={setPaginationPage}
//             />
//             <ItemStockOpeningMstrBatchStock
//               batchData={batchData.filter(
//                 (batch) => batch.detailId === (detailData[focusedRowIndex]?.id || '')
//               )}
//               setBatchData={setBatchData}
//               detailData ={detailData}
//               handleChange={handleChange}
//               formStatus={formStatus}
//               triggerAddRow={() => triggerAddRow(setBatchData, DetailStockBatchInitData, true)}
//               setFocusedRowIndex={setFocusedRowIndex}
//               focusedRowIndex={focusedRowIndex}
//             />
//             {helpList && (
//               <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
//                 <ModalHeader toggle={toggleHelpModal}></ModalHeader>
//                 <ModalBody>
//                   <HelpList
//                     formStatus={formStatus}
//                     helpFor={helpFor}
//                     apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_STOCK_OPNG_MSTR_DATA}`}
//                     helpListHeader={helpListHeader}
//                     handleHelpList={handleHelpList}
//                     onSelectHelpItem={onSelectHelpItem}
//                     queryPera={{ needAppGlobalData: 'Y' }}
//                    whereClause={helpFor === 'item'?{f_wc_id: formData.wc_id}:{}}
//                   />
//                 </ModalBody>
//               </Modal>
//             )}
//           </TabPane>
//         </TabContent>
//       </FormSetup>
//     </React.Fragment>
//   );
// };

// export default ItemStockOpeningMaster;

