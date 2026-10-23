import React, { useState, useCallback } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
// import { APP_PROD_API } from "../../../../utils/api";
// import { dateFormatter, formatDateForInput } from "../../../../utils/fn";
import AccWiseTdsDetails from "./acc_wise_tds_master_detail";
import { accWiseTdsDetailData, createSearchPayloadForBVSpecificSearch } from "./acc_wise_tds_master_helper";
import { APP_PROD_API } from "../../../../utils/api";
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { fetchAppData } from "../../../../utils/fetchUtils";



const AccWiseTds = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);

  const [formData, setFormData] = useState([{ ...accWiseTdsDetailData }]);
  const [visibleData, setVisibleData] = useState([{ ...accWiseTdsDetailData }]);
  const [recordsToShow, setRecordsToShow] = useState(100);


  const [radioData, setRadioData] = useState()
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();
  const tabs = [];

  const [actualAccData, setActualAccData] = useState([{}]);

  //const [visibleData, setVisibleData] = useState([{ ...accWiseTdsDetailData }])
  const [page, setPage] = useState(1)

  const ITEMS_PER_PAGE = 100


  const [selectedTypeFlag, setSelectedTypeFlag] = useState("");

  const [filteredAccData, setFilteredAccData] = useState(formData);

  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [deletedRecord, setDeletedRecord] = useState([])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);


  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)


  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);



  const handleHelpList = (data) => {
    setHelpList(data);
  }


  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update detail data (table rows)
    if (["acc", "tdsAcc", "tdsSur", "tdsCess", "tdsHsc", "vendor"].includes(helpFor) && activeRowIndex !== null) {
      setVisibleData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "acc":
            currentRow.acc_no = data.acc_no;
            currentRow.acc_desc = data.acc_desc;
            break;

          case "tdsAcc":
            currentRow.tds_acc_no = data.acc_no;
            currentRow.tds_acc_desc = data.acc_desc;
            break;

          case "tdsSur":
            currentRow.tds_sur_acc_no = data.acc_no;
            currentRow.tds_sur_acc_desc = data.acc_desc;
            break;

          case "tdsCess":
            currentRow.tds_cess_acc_no = data.acc_no;
            currentRow.tds_cess_acc_desc = data.acc_desc;
            break;

          case "tdsHsc":
            currentRow.tds_hsc_acc_no = data.acc_no;
            currentRow.tds_hsc_acc_desc = data.acc_desc;
            break;

          case "vendor":
            currentRow.v_code = data.acc_no;
            currentRow.v_name = data.acc_desc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  // for validate data -----------

  const getValidateData = async (fieldName, fieldValue, otherQueryPera = {}, rowIndex = null) => {
    try {
      let API_STRING;

      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACCWISE_TDS_MSTR_VALID_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACCWISE_TDS_MSTR_VALID_DATA}?${fieldName}=${fieldValue}&${otherParams}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      }

      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.status === 200) {
        // Validation successful
        return { valid: true, data: data.data || null };
      } else if (response.status === 400) {
        toast.error(data.message);
        setFormData((prevData) => {
          const updated = [...prevData];
          if (updated[rowIndex]) {
            // updated[rowIndex].v_code = "";
          }
          return updated;
        });
        return { valid: false };
      } else if (response.status === 500) {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error(err.message);
      return { valid: false };
    }
  };


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accTdsForm = document.getElementById("accwise-tds-master")
      const accTdsFormValidity = accTdsForm.checkValidity()
      if (!accTdsFormValidity) {
        if (accTdsForm.reportValidity) {
          accTdsForm.reportValidity()
        } else {
          throw new Error("Please fill all the required details in acc wise tds master")
        }
        return
      }

      // if (formStatus === 'Insert') {
      //   const isValid = await getValidateData(
      //     "v_code",
      //     visibleData?.[focusedRowIndex]?.v_code,
      //     {
      //       acc_no: visibleData?.[focusedRowIndex]?.acc_no,
      //       eff_date: visibleData?.[focusedRowIndex]?.eff_date,
      //       category_flag: radioData?.category_flag,
      //     },
      //     0
      //   );

      //   if (!isValid)
      //     alert('bvd')
      //      return;
      // }  

      if (formStatus === 'Insert') {
        let newRecords = visibleData.filter(newData => newData.hasOwnProperty('id'));
        if (newRecords.length === 0) {
          toast.error('There should be atleast a New Entry for submit in Insert')
          return
        }

      }


      let body = {
        formData: visibleData,
        radioData: radioData,
      };

      //  Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedData: deletedRecord,
          category_flag: radioData.category_flag,
        };
      }

      //console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ACCWISE_TDS_MSTR_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        //console.log('errorData', errorData)
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      formCleanup()
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  
  function formCleanup() {
    setFormData([accWiseTdsDetailData])
    setVisibleData([accWiseTdsDetailData])
    releaseFormStatus()
    setRadioData({});
  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // document.activeElement?.blur();
    formCleanup();
  }, []);



  const handleChange = useCallback((type, name, value, rowIndex = null) => {
          if(!['Insert', 'Update', 'Search'].includes(formStatus)) {
        return
      }


    if (["Insert", "Update"].includes(formStatus) && ["acc_no", "v_code", "tds_acc_no", "tds_sur_acc_no", "tds_cess_acc_no", "tds_hsc_acc_no"].includes(name)) {
      toast.error("Please select from Helplist");
      return
    }



    switch (type) {
      case "radioData":
        setRadioData(prev => ({ ...prev, [name]: value }));
        break;

      // case "formData":
      //   setVisibleData(prev => {
      //     if (rowIndex !== null && rowIndex >= 0) {
      //       // Update a specific row
      //       const newData = [...prev];
      //       newData[rowIndex] = {
      //         ...newData[rowIndex],
      //         [name]: value
      //       };
      //       return newData;
      //     } else {

      //       return prev.map(row => ({
      //         ...row,
      //         [name]: value
      //       }));
      //     }
      //   });
      //   break;  

      case "formData":
        setVisibleData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update only the specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: value
            };
            return newData;
          }
          // If rowIndex is null, do nothing (or handle separately if needed)
          return prev;
        });
        break;

      default:
        //console.log("handleChange is not properly defined");
    }
  }, [formStatus]);


  //  const handleChange = useCallback((type, name, value, rowIndex = null) => { 
  //    if (["Insert", "Update"].includes(formStatus) && ["acc_no", "v_code", "tds_acc_no", "tds_sur_acc_no", "tds_cess_acc_no", "tds_hsc_acc_no"].includes(name)) {
  //       toast.error("Please select from Helplist");
  //       return
  //     }  
  //   switch(type) {
  //     case "formData":
  //       setVisibleData(prev => {
  //         if (rowIndex !== null && rowIndex >= 0) {
  //           const newData = [...prev];
  //           newData[rowIndex] = { ...newData[rowIndex], [name]: value }
  //           return newData;
  //         } else {
  //           return prev.map(row => ({ ...row, [name]: value }));
  //         }
  //       });
  //       break;

  //     case "radioData":
  //       setRadioData(prev => ({ ...prev, [name]: value }));
  //       break;

  //     default:
  //       //console.log("handleChange is not properly defined");
  //   }
  // }, []);




  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      //console.log('visibleData[0] ', visibleData[0])
      const searchPayload = createSearchPayloadForBVSpecificSearch({ ...visibleData[0], category_flag: radioData?.category_flag });
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_ACCOUNT_WISE_TDS_MSTR}?formStatus=${formStatus}&${queryList}`
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



  const triggerAddRow = async () => {
    const accTdsForm = document.getElementById("accwise-tds-master");
    const accTdsFormValidity = accTdsForm.checkValidity();

    // for check required field
    if (!accTdsFormValidity) {
      if (accTdsForm.reportValidity) {
        accTdsForm.reportValidity();
      } else {
        throw new Error("Please fill all the required details in acc wise tds master");
      }
      return;
    }

    //console.log('check for required')

    if (visibleData.length > 1) {

      // Duplicate check
      const seen = new Set();
      for (const row of visibleData) {
        const key = `${row.eff_date}|${row.v_code}|${row.acc_no}`;
        if (seen.has(key)) {

          toast.error("Duplicate record found with same Eff Date, Vendor Code & Acc No");
          return
        }
        seen.add(key);
      }
    }

    //console.log('duplicate')



    // for check getValidateData 
    if (formStatus === "Update") {
      const isChecked =
        visibleData[focusedRowIndex]?.init_acc_no === visibleData[focusedRowIndex]?.acc_no &&
        visibleData[focusedRowIndex]?.init_eff_date === visibleData[focusedRowIndex]?.eff_date &&
        visibleData[focusedRowIndex]?.init_v_code === visibleData[focusedRowIndex]?.v_code;

      
      if (!isChecked) {
        const result = await getValidateData(
          "v_code",
          visibleData[focusedRowIndex]?.v_code,
          otherQueryPera,
          focusedRowIndex
        );
        if (!result.valid) return;
      }
    } else {
     
      const result = await getValidateData(
        "v_code",
        visibleData[focusedRowIndex]?.v_code,
        otherQueryPera,
        focusedRowIndex
      );
      if (!result.valid) return;
    }


    // Proceed to add new row
    setVisibleData((prev) => [
      ...prev,
      { ...accWiseTdsDetailData, id: prev.length + 1 }
    ]);
  };



  const handleDeleteRow = useCallback((data, index) => {

    let newDeleteData = [...deletedRecord];
    newDeleteData.push(data);
    setDeletedRecord(newDeleteData);

    setVisibleData((prev) => {
      if (prev.length === 0) return prev;

      const newData = prev.filter((_, i) => i !== index);

      // Adjust focus index if needed
      setFocusedRowIndex((currentFocusIndex) => {
        if (index === currentFocusIndex) {
          // Focus the previous row, or 0 if no previous
          return index > 0 ? index - 1 : 0;
        } else if (index < currentFocusIndex) {
          // Row above deleted, shift focus index down by 1
          return currentFocusIndex - 1;
        } else {
          // No change needed
          return currentFocusIndex;
        }
      });

      return newData;
    });

  }, [deletedRecord]);



  const handleSetAccData = (data) => {
    setVisibleData(data);

    //console.log("visible data", visibleData)

  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log(btnClicked)
      if (queryData?.count == 0) {
        toast.error('No Record Found')
        handleCancel()
        return

      }
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);

      }
      const updatedData = queryData.accWiseTdsData.map(item => ({
        ...item,
        init_acc_no: item.acc_no,
        init_v_code: item.v_code,
        init_eff_date: item.eff_date
      }))


      setFormData(updatedData)
      setActualAccData(updatedData)
      setVisibleData(updatedData.slice(0, 30)); // First 30 only


      setSelectedTypeFlag("V")
      handleChange("radioData", "category_flag", "V")
      setCurrentRecordNo(updatedData.length - 1)
      setFocusedRowIndex(0)
    },
    [formStatus, currentRecordNo]
  );

  const otherQueryPera = {
    category_flag: radioData?.category_flag,
    acc_no: visibleData[focusedRowIndex]?.acc_no,
    eff_date: visibleData[focusedRowIndex]?.eff_date,

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
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
        //  isQueryReqOnInsertBtn={true}
        QUERY_API={APP_PROD_API.GET_ACCOUNT_WISE_TDS_MSTR}
        formName={"Account Wise TDS"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id="accwise-tds-master" onSubmit={handleSubmit}>
              <AccWiseTdsDetails
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
                triggerAddRow={triggerAddRow}
                handleDeleteRow={handleDeleteRow}
                radioData={radioData}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                actualAccData={actualAccData}
                accWiseTdsDetailData={accWiseTdsDetailData}
                setFilteredAccData={setFilteredAccData}
                setSelectedTypeFlag={setSelectedTypeFlag}
                handleSetAccData={handleSetAccData}
                setActiveRowIndex={setActiveRowIndex}
                getValidateData={getValidateData}
                otherQueryPera={otherQueryPera}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
                visibleData={visibleData}
                setVisibleData={setVisibleData}
                setRecordsToShow={setRecordsToShow}
                recordsToShow={recordsToShow}
                selectedTypeFlag={selectedTypeFlag}
                filteredAccData={filteredAccData}
                setCurrentRecordNo={setCurrentRecordNo}
                

              />
            </Form>
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACCOUNT_WISE_TDS_MSTR}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                //whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}


        </TabContent>
      </FormSetup>
    </React.Fragment>
  )
}

export default AccWiseTds