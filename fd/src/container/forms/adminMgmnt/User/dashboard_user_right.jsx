import React, { useCallback, useState } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import DashboardUserRightDtl from "./dashboard_user_right_dtl";
import {
  checkDuplicateUserRights,
  createSearchPayloadForURSpecificSearch,
  dashboardUserRightDetailData,
  dashboardUserRightInitData,
} from "./dashboard_user_right_helper";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";

const DashboardUserRights = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...dashboardUserRightInitData });
  const [detailFormData, setDetailFormData] = useState([ ]);

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,setSearchQuery } =
    useFormStatus();
     const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState('');
    const [helpListHeader, setHelpListHeader] = useState([]);

    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList);

     const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

   const handleHelpList = (data) => {
    setHelpList(data);
  };

const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    case "LoginName":
      setFormData(prev => ({
        ...prev,
        user_name: data.user_name,
        login_name: data.login_name,
        user_id: data?.user_id,
      }));
      break;

    case "DBModule":
      const userId = formData?.user_id;
      const dbModule = data?.sht_name;
      const dbModuleDesc = data?.full_name;

      if (!userId) {
        toast.error("Please select Login Name first");
        return;
      }

        // Step 2: Check Duplicate Across All Rows
      const isDuplicate = detailFormData.some((row, idx) => {
        if (!row.db_module || !row.db_module_desc) return false;
        return (
          row.db_module === dbModule &&
          row.db_module_desc === dbModuleDesc
        );
      });

  // alert(isDuplicate)

      if (isDuplicate) {
      toast.error(`"${dbModuleDesc}"user Rights module is already added for the selected user.`);
        return;
      }


      const canAdd = await checkDuplicateUserRights(userId, dbModule, dbModuleDesc, formStatus);
    
      

      if (canAdd) {
        setDetailFormData(prev => {
          const updatedRows = [...prev];
          if (!updatedRows[focusedRowIndex]) {
            updatedRows[focusedRowIndex] = { ...dashboardUserRightDetailData };
          }
          updatedRows[focusedRowIndex] = {
            ...updatedRows[focusedRowIndex],
            db_module_desc: dbModuleDesc,
            db_module: dbModule,
          };
         
          
          return updatedRows;
        });
      } 
      break;
  }
};


   const handleChange = useCallback(
  (name, value, index = null, event = null) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

  
    if (["Insert", "Update"].includes(formStatus) && ['login_name', 'db_module_desc'].includes(name)) {
      toast.error("You can't type here. Please select from help list on double click");
      return;
    }

    const target = event?.target;
    const cursorPosition = target?.selectionStart ?? null;

    let newVal = value.toUpperCase();

    if (index === null) {
      // Update formData
      setFormData((prev) => ({ ...prev, [name]: newVal }));
    } else {
      // Update detailFormData
      setDetailFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    //  Cursor restore in both cases
    if (cursorPosition !== null && target?.setSelectionRange) {
      setTimeout(() => {
        try {
          target.setSelectionRange(cursorPosition, cursorPosition);
        } catch {}
      }, 0);
    }
  },
  [formStatus]
);



const triggerAddRow = async () => {
  const { user_id } = formData;
  const lastRow = detailFormData[detailFormData.length - 1];

  if (!user_id) {
    toast.error("Please enter Login Name first");
    return;
  }

  // if (detailFormData.length > 0 && !lastRow.db_module_desc) {
  //   toast.error("Please enter DashBoard Module Description before adding new row");
  //   return;
  // }

    if(formStatus === "Insert" || formStatus === "Update"){
        const isvalidateField = validateForm("dashboard-user-right",'Dashboard User Rights')
        if(!isvalidateField){
          //  toast.error('Please fill  required Field');
          return;
        }
      }

  setDetailFormData((prev) => {
    const newRows = [...prev, { ...dashboardUserRightDetailData }];
    // Set focusedRowIndex to the new row's index
    setFocusedRowIndex(newRows.length - 1);
    return newRows;
  });
};



const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (btnClicked === "Query") {
      setTotalRecordCount(queryData.totalCount || totalRecordCount);

      if (!queryData?.userMstrData) {
        toast.error(queryData.message || "No User data found");
         handleCancel()
        return;
      }
    }

    setFormData(queryData.userMstrData);
    setDetailFormData(queryData.dbModuleData || []);
  },
  [formStatus, currentRecordNo]
);


  // `handleDelete` function to remove a row
 const handleDelete = (rowIndex) => {
  setDetailFormData((prevData) => {
    const newData = prevData.filter((_, index) => index !== rowIndex);

    if (newData.length > 0) {
      setFocusedRowIndex(0);
    } else {
      setFocusedRowIndex(-1); // Optional: indicate no row is focused
    }

    return newData;
  });
};

  const handleUpdate = (data) => {
    setDetailFormData((prevData) =>
      prevData.map((row, index) =>
        row.sr_no === data.sr_no ? { ...row, ...data } : row
      )
    );
  };
  
  

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({});
    setDetailFormData([])
  }, []);
  

  const handleSubmit = async(e)=> {
     e.preventDefault();
    if (!["Insert", "Update"].includes(formStatus)) return;

    try {

    const isLoginFilled = formData?.user_id?.trim();
    const hasAtLeastOneModule = detailFormData.some(row => row.db_module_desc?.trim());

    if (isLoginFilled && !hasAtLeastOneModule) {
      toast.error("At least one Dashboard Module Description should be entered.");
      return;
    }


      if(formStatus === "Insert" || formStatus === "Update"){
        const isvalidateField = validateForm("dashboard-user-right",'Dashboard User Rights')
        if(!isvalidateField){
          //  toast.error('Please fill  required Field');
          return;
        }
      }

  
      let body ={
         formData,
        detailFormData: detailFormData.map(row => ({
         ...row , 
         user_id :formData?.user_id,
        }))
      };
          

       let method ;
       if(formStatus == 'Insert'){
        method ="POST";
       }   else if(formStatus == "Update"){
        method = "PUT";
       }

       const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DB_USER_RIGHTS_FORM_DATA}?form_status=${formStatus}`,{
        method:method,
        body:JSON.stringify(body),
        headers:{"Content-Type":"application/json"},
        credentials:'include',
       })

       if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Please check all the form fields or contact administrator");
        return;
      }

         
       toast.success("Data Save Successfully");
       handleCancel();
      
    } catch (error) {
      console.error('Submit error:',error);
      toast.error(error.message || "Please check all the form fields or contact administrator")
    }
   
   }


const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForURSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DB_USER_RIGHTS_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        tabs={["Dashboard User Rights"]}
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
        QUERY_API={APP_PROD_API.GET_DB_USER_RIGHTS_FORM_DATA}
        formName={"Dashboard User Rights"}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <DashboardUserRightDtl
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              detailFormData={detailFormData}
              handleDelete={handleDelete} 
              handleUpdate={handleUpdate}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
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
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DB_USER_RIGHTS_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{needAppGlobalData:'Y'}}
                    // whereClause={whereClauseForHelp(helpFor)}
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

export default DashboardUserRights;
