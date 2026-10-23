
import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { createSearchPayloadForRateMstrSpecificSearch, stagingData } from './staging_purchase_voucher_hlpr';
import StagingPurchaseVoucherHdr from './staging_purchase_voucher_hdr';

const StagingPurchaseVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{...stagingData,isNew: true}]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,
    setSearchQuery} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [deletedRecords, setDeletedRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [updatedRows, setUpdatedRows] = useState({});

  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

    const PAGE_SIZE = 20;
const [currentPage, setCurrentPage] = useState(1);

  const tabs = ["Staging Purchase Voucher"];


  const handlePageChange = async (direction) => {
  const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
  if (newPage < 1) return;

  try {
    const offset = (newPage - 1) * PAGE_SIZE;
    const queryList = new URLSearchParams({
      ...searchQuery, // re-use the same search criteria    
      offset,
      limit: PAGE_SIZE,
    });

    const data = await fetchAppData(
      `${APP_PROD_API.GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
    );

    if (data?.type === "not_found" || !data?.stagingData?.length) {
      toast.error("No more records");
      return;
    }

    setupQueryData(data, "Page");
    setCurrentPage(newPage);
  } catch (error) {
    toast.error(error?.message || "Error fetching page");
  }
};


const handleStatusChange = async (status) => {
  if(formStatus ==="Search") return
    handleOperation("Query"); 
    setStatusFilter(status);
    setCurrentPage(1);

    const payload = {
        status,
        limit: PAGE_SIZE,
        offset: 0,
    };

    setSearchQuery(payload);     

    const queryList = new URLSearchParams(payload);

    const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM}?formStatus=Query&appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}&${queryList}`
    );

    setupQueryData(data, "Query");
    // handleOperation("Query"); 
};

     const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };



  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    // ----------------------  WC NO SELECTION ----------------------
case "Vendor":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      v_code: data.v_code,
      v_name:data.v_name,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;

case "billNo":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      bill_no: data.bill_no,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;
case "AccNo":
  const isDuplicate = formData.some((item, index) => {
    return (
        index !== selectedRowIndex &&
        item.voucher_id === formData[selectedRowIndex].voucher_id &&
        item.acc_no === data.acc_no
    );
});

if (isDuplicate) {
    toast.error("Account No already exists for this Voucher.");
    return;
}
  // setFormData((prev) => {
  //   const updated = [...prev];
  //   const row = updated[selectedRowIndex];

  //   updated[selectedRowIndex] = {
  //     ...row,
  //     acc_no: data.acc_no,
  //     acc_desc: data.acc_desc,
  //     ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
  //   };

  //   return updated;
  // });
  // break;

  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
        ...row,
        acc_no: data.acc_no,
        acc_desc: data.acc_desc,
        ...(formStatus === "Update" &&
            !row?.isNew && { isStatus: "changed" })
    };

    const currentRow = updated[selectedRowIndex];

    setUpdatedRows(prev => ({
        ...prev,
        [currentRow.voucher_id]: {
            voucher_id: currentRow.voucher_id,
            old_acc_no: currentRow.old_acc_no,
            acc_no: currentRow.acc_no,
            bill_no: currentRow.bill_no,
            bill_dt: currentRow.bill_dt,
            approve: currentRow.approve,
            cancel: currentRow.cancel,
        }
    }));

    return updated;
});


    // ----------------------  DEFAULT ----------------------
    default:
      console.warn("Unhandled help type:", helpFor);
      break;
  }

  toggleHelpModal();
};


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);



const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const unitMaster = validateForm(
      "staging-puchr",
      "Staging Purchase Voucher"
    );

    if (!unitMaster) return;

// console.log("updatedRows =", updatedRows);
// console.log("payload =", Object.values(updatedRows));

    // Payload from updatedRows
    const updated = Object.values(updatedRows);

    if (updated.length === 0) {
      toast.error("No changes to save");
      return;
    }

    const payload = {
      user_id: user.id,
      updated,
    };

    console.log("Payload :", payload);

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.PUT_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM
      }?form_status=${formStatus}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.type === "success") {
      toast.success(data.message);

      // Clear local edited vouchers
      setUpdatedRows({});

      formCleanup();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Something went wrong");
  }
};

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData([{...stagingData,  isNew: true}]);
     setUpdatedRows({}); 
    setDeletedRecords([]);
     setCurrentPage(1); 
    releaseFormStatus()
    setStatusFilter("")
    setSearchQuery({});
  }


const checkDuplicate = (data, index, fieldName, value) => {
  const currentRow = data[index];

  const bill_no = fieldName === "bill_no" ? value : currentRow.bill_no;
  const bill_dt = fieldName === "bill_dt" ? value : currentRow.bill_dt;

  return data.some((row, i) => {
    if (i === index) return false;

    return (
      row.bill_no === bill_no &&
      row.bill_dt === bill_dt
    );
  });
};

 
const handleChange = useCallback(
  (name, value, index, event) => {
    if (!["Update", "Search"].includes(formStatus)) return;

    if (["v_code","acc_no"].includes(name)) {
      toast.error("Please select value from Help List (double click)");
      return;
    }

    const cursorPosition = event?.target?.selectionStart;
    const newVal =
      typeof value === "string" ? value.toUpperCase() : value;


  //   if (
  //     // name === "cancel" && value === "Y" || name === "approve" && value === "Y"
  //     ['cancel','approve'].includes(name) && ['N','Y'].includes(value)) {
  //     // 1. user authorization only for user id 583 (shahil) 
  //  if (user?.id !== "583") {
  //     toast.error("You are not authorized to cancel / approve this Purchase Voucher.");
  //     return prevData;
  //  }
  // }

    if (['cancel', 'approve'].includes(name) &&['N', 'Y'].includes(value) &&!["583", "606"].includes(user?.id)) {
  toast.error("You are not authorized to cancel / approve this Purchase Voucher.");
  return prevData;
}

    setFormData((prevData) => {
      const voucherId = prevData[index].voucher_id;

      const newData = prevData.map((row) => {
        if (row.voucher_id === voucherId) {
         const updatedRow = {
              ...row,
              [name]: newVal,
              isNew: row?.isNew ?? false,
              ...(formStatus === "Update" &&
                !row?.isNew && {
                  isStatus: "changed",
                }),
            };

            // Cancel tick -> Approve automatically N
            if (name === "cancel" && newVal === "Y") {
              updatedRow.approve = "N";
            }

            // Approve tick -> Cancel automatically N
            if (name === "approve" && newVal === "Y") {
              updatedRow.cancel = "N";
            }

            return updatedRow;

        }

        return row;
      });

      // Save latest edited voucher for pagination
      const firstRow = newData.find(
        (r) => r.voucher_id === voucherId
      );

      if (firstRow) {
        setUpdatedRows((prev) => ({
          ...prev,
          [voucherId]: {
            voucher_id: voucherId,
            old_acc_no: firstRow.old_acc_no,
            acc_no: firstRow.acc_no,
            bill_no: firstRow.bill_no,
            bill_dt: firstRow.bill_dt,
            approve: firstRow.approve,
            cancel: firstRow.cancel,
          },
        }));
      }

      return newData;
    });

    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(
        event.target.type
      )
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }, 0);
    }
  },
  [formStatus]
);



const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (queryData?.type === "not_found" && btnClicked === "Query") {
      toast.error("No Data Found");
      handleCancel();
      setFormData([]);
      setTotalRecordCount(0);
      return;
    }

    // Format API data
    const formattedDetail = (queryData?.stagingData || []).map((item) => {
      const formattedDate = item.bill_dt
        ? dateFormatter(item.bill_dt)
        : "";

    const formattedVchDate = item.vch_dt
    ? dateFormatter(item.vch_dt)
    : "";

    const formattedVoucherDate = item.voucher_dt
    ? dateFormatter(item.voucher_dt)
    : "";

      return {
        ...item,
        bill_dt: formattedDate,
        vch_dt: formattedVchDate,  // temp date
        voucher_dt:formattedVoucherDate, // after staging date
        old_bill_no: item.bill_no,
        old_bill_dt: formattedDate,
        old_acc_no:item.acc_no,

         isLocked:
        item.approve === "Y" ||
        item.cancel === "Y",
      };
    });

    // Merge local edited vouchers with API data
    const mergedData = formattedDetail.map((row) => {
      const editedVoucher = updatedRows[row.voucher_id];

      if (!editedVoucher) return row;

      return {
        ...row,
        bill_no: editedVoucher.bill_no,
        bill_dt: editedVoucher.bill_dt,
        cancel: editedVoucher.cancel,
        approve: editedVoucher.approve,
        isStatus: "changed",
      };
    });

    setFormData(mergedData);

    setFocusedRowIndex(0);

    if (btnClicked === "Query") {
      setTotalRecordCount(queryData?.totalCount);
    }
  },
  [updatedRows]
);

  const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          // const searchPayload = createSearchPayloadForRateMstrSpecificSearch(formData);
         const searchPayload = {
              ...createSearchPayloadForRateMstrSpecificSearch(formData),
              status: statusFilter,
              offset: 0,
              limit: PAGE_SIZE,
            };
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM}?formStatus=${formStatus}&appDivisionId=${
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

//       const triggerAddRow = useCallback(() => {
//   const unitMaster = validateForm("rate-master", "Rate Master");
//   if (!unitMaster) return;

//    setFormData((prevData) => {
//     const newRow = { ...stagingData, isNew: true}; 
//     const newData = [...prevData, newRow];
//     setFocusedRowIndex(newData.length - 1);
//     return newData;
//   });
// }, [formData]);

const triggerAddRow = {

}

// const handleDelete = (rowIndex) => {
//   const row = formData[rowIndex];
//   const voucherId = row.voucher_id;

//   // deletedRecords voucher_id add 
//   setDeletedRecords((prev) => {
//     if (prev.some((item) => item.voucher_id === voucherId)) {
//       return prev;
//     }

//     return [
//       ...prev,
//       {
//         voucher_id: voucherId,
//       },
//     ];
//   });

//   // same voucher_id ki saari rows remove karo
//   setFormData((prev) =>
//     prev.filter((item) => item.voucher_id !== voucherId)
//   );

//   setFocusedRowIndex(0);
// };

// const handleDeleteClick = (openModal) => {
//   if (user?.id !== "587") {
//     toast.error(
//       "You are not authorized to delete this Purchase Voucher."
//     );
//     return;
//   }

//   openModal();
// };



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
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM}
        searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      formName={"Rate Master"}
        // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
         btnEnableDtl={{query:false,insert:false}}
        
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            
                <StagingPurchaseVoucherHdr 
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                // handleDelete={handleDelete}
                triggerAddRow={triggerAddRow}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
                currentPage={currentPage}
                totalRecordCount={totalRecordCount}
                pageSize={PAGE_SIZE}
                onPrev={() => handlePageChange("prev")}
                onNext={() => handlePageChange("next")}
                  // handleDeleteClick={handleDeleteClick}
                  user={user}
                  statusFilter={statusFilter}
                  handleStatusChange={handleStatusChange}
                          
                />
                {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={formStatus}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{needAppGlobalData:'Y'}} 
                      whereClause={{}}
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

export default StagingPurchaseVoucher;

