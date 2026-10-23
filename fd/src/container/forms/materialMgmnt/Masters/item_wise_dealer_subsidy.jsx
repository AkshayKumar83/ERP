




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
import { createSearchPayloadForItemWiseDealerSubsidySpecificSearch, itemWiseDealerSubSidyData } from './item_wise_dealer_subsidy_helper';
import ItemWiseDealerSubsidyHdr from './item_wise_dealer_subsidy_hdr';

const ItemWiseDealerSubsidy = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{...itemWiseDealerSubSidyData,isNew: true}]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,
    setSearchQuery} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [deletedRecords, setDeletedRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);


  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

  const tabs = ["Item Wise Dealer Subsidy"];

     const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };



  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    // ----------------------  WC NO SELECTION ----------------------
// case "Vendor":
//   setFormData((prev) => {
//     const updated = [...prev];
//     const row = updated[selectedRowIndex];

//     updated[selectedRowIndex] = {
//       ...row,
//       v_code: data.v_code,
//       v_name: data.v_name,
//       ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
//     };

//     return updated;
//   });
//   break;

case "item":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      it_code: data.it_code,
      it_name: data.it_name,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;

case "Name":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      it_code: data.it_code,
      it_name: data.it_name,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;

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
    const unitMaster = validateForm("item-wise-dealer-subsidy", "Rate Master");
  if (!unitMaster) return;

    let method = formStatus === "Insert" ? "POST" : "PUT";

    let payload = {};

    if (formStatus === "Insert") {
      // sirf new rows
      const inserted = formData.filter(
        (row) =>
          row.isNew
          
      );

      if (inserted.length === 0) {
        toast.error("No New records to insert, At least one row added ");
        return;
      }

      payload = { inserted }; 
    }
    console.log("FORM DATA:", formData);
console.log("INSERTED:", formData.filter(r => r.isNew));

    if (formStatus === "Update") {
      const inserted = formData.filter(
        (row) => row.isNew
      );

      const updated = formData.filter(
        (row) => !row.isNew && row.isStatus === "changed"
      );

      const deleted = deletedRecords || [];

      if (
        inserted.length === 0 &&
        updated.length === 0 &&
        deleted.length === 0
      ) {
        toast.error("No changes to save ");
        return;
      }

      payload = { inserted, updated, deleted };
    }

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data?.type === "success") {
      toast.success("Data saved successfully!");
      formCleanup();
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (error) {
    toast.error(error.message);
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
    setFormData([{...itemWiseDealerSubSidyData,  isNew: true}]);
    setDeletedRecords([]);
    releaseFormStatus()
  }


const checkDuplicate = (data, index, fieldName, value) => {
  const currentRow = data[index];

  const it_code = fieldName === "it_code" ? value : currentRow.it_code;
  const eff_date = fieldName === "eff_date" ? value : currentRow.eff_date;

  return data.some((row, i) => {
    if (i === index) return false;

    return (
      row.it_code === it_code &&
      row.eff_date === eff_date
    );
  });
};



  const handleChange = useCallback(
   (name, value, index, event) => {
     if (!["Insert", "Update"].includes(formStatus)) return;
        if (['it_code'].includes(name)) {
        toast.error("Please select value from Help List (double click)");
        return;
      }
 
     const cursorPosition = event.target.selectionStart;
     let newVal = value.toUpperCase();
    //  let newVal = value;

//  validation
if (name === "subsidy_perc") {
  const numVal = parseFloat(value);

  if (value === "") {
    newVal = "";
  } else if (isNaN(numVal) || numVal < 0 || numVal > 100) {
    toast.error("Subsidy % must be between 0 and 100");
    return;
  } else {
    newVal = numVal;
  }
}
 
     setFormData((prevData) => {
       const newData = [...prevData];
         //  duplicate check
      if (["it_code", "eff_date"].includes(name)) {
        const isDuplicate = checkDuplicate(newData, index, name, newVal);

        if (isDuplicate) {
          toast.error("Same Item Code + Date already exists ");
          return prevData; // update rok do
        }
      }
       const updatedRow = {
          ...newData[index],   //  bas ye rakho
          [name]: newVal,
         isNew: newData[index]?.isNew ?? false       
        };
 
       // agar Insert me ho to isNew rakho, agar Update me ho to changed mark karo
       if (formStatus === "Update" && !updatedRow.isNew) {
         updatedRow.isStatus = "changed";
       }
 
       newData[index] = updatedRow;
       return newData;
     });
 
        if (
     event?.target &&
     event.target.tagName === "INPUT" &&
     !["number", "radio", "checkbox", "date"].includes(event.target.type)
   ) {
     setTimeout(() => {
       event.target.setSelectionRange(cursorPosition, cursorPosition);
     }, 0);
   }
     },
   [formStatus]
 );
 


const setupQueryData = useCallback((queryData, btnClicked) => {
  if (queryData?.type === "not_found" && btnClicked === 'Query') {
    toast.error("No Data Found");
    handleCancel()
    setFormData([]);
    setTotalRecordCount(0);
    return;
  }

  //  DETAIL + DATE FORMAT
const formattedDetail = (queryData?.itemWiseDealerSubsidy || []).map((item) => {
  const formattedDate = item.eff_date
    ? dateFormatter(item.eff_date)
    : "";

  return {
    ...item,
    eff_date: formattedDate,
    old_it_code: item.it_code,
    old_eff_date: formattedDate, //  FIX
  };
});

  setFormData(formattedDetail);

  setFocusedRowIndex(0);

  if (btnClicked === "Query") {
    setTotalRecordCount(queryData?.totalCount);
  }
}, [formStatus, currentRecordNo]);



  const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForItemWiseDealerSubsidySpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM}?formStatus=${formStatus}&appDivisionId=${
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

      const triggerAddRow = useCallback(() => {
  const unitMaster = validateForm("item-wise-dealer-subsidy", "Rate Master");
  if (!unitMaster) return;

   setFormData((prevData) => {
    const newRow = { ...itemWiseDealerSubSidyData, isNew: true}; 
    const newData = [...prevData, newRow];
    setFocusedRowIndex(newData.length - 1);
    return newData;
  });
}, [formData]);


 const handleDelete = (rowIndex) => {
  setFormData((prev) => {
    const deletedRow = prev[rowIndex];
    // agar existing row hai (unit_id already hai) tabhi deletedRecords me add karein
    if (formStatus === "Update" && !deletedRow.isNew) {
      setDeletedRecords((prevDel) => [...prevDel, { ...deletedRow }]);
    }
    return prev.filter((_, idx) => idx !== rowIndex);
  });
  setFocusedRowIndex(0);
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
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM}
        searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      formName={"Item Wise Dealer Subsidy"}
        // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            
                <ItemWiseDealerSubsidyHdr 
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                handleDelete={handleDelete}
                triggerAddRow={triggerAddRow}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
             
                />
                {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={formStatus}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM}`}
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

export default ItemWiseDealerSubsidy;

