import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { gstAccMstrInitialData } from './account_code_for_gstHelper';
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useFormLoading } from '../../../../hooks/useFormLoading';
import { useCallback, useState, useEffect } from "react";
import AccountCodeforGstDtl from './account_code_for_gstDtl';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import toast from 'react-hot-toast';
import { dateFormatter } from '../../../../utils/fn';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { accHelpListHeader, dupValidation, gstPersHelpListHeader, helpFieldMap } from "../Masters/account_code_for_gstHelper";
//import { stateWiseGstInitialData } from './state_wise_gst_helpers';
import { validateForm } from '../../../../utils/fn';
import { useSelector } from 'react-redux';

const AccountCodeForGst = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState();
  const [accGstData, setAccGstData] = useState([{ ...gstAccMstrInitialData }]);
  const { loading, setLoading, formLoading, setFormLoading } = useFormLoading();

  const [updatedFormData, setUpdatedFormData] = useState([])
  const [deletedFormData, setDeletedFormData] = useState([])
  const [curntFocusedRow, setCurntFocusedRow] = useState(0)


  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();


  const [gstTypeList, setGstTypeList] = useState([]) // DROPDOWN  

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)


  // global user data 
  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);




  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_DROPDOWNDATA}`, { credentials: 'include', });
        if (response.status === 200) {
          const data = await response.json();
          // //console.log(data);
          setGstTypeList([{ value: '', label: '' }, ...formatOptions(data.gstTypeList || [], "prefix", "description")]);

        }
      } catch (err) {
        //console.log(err);
      }
    };

    fetchConstantList()

  }, [formStatus]);


  const tabs = ["Account Code For GST"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const isValidGstAccMstForm = validateForm("gst-acc-mstr-detail-form")
      if (!isValidGstAccMstForm) {
        return
      }
      const validationRecordWithDuplicacy = dupValidation(accGstData);
      if (validationRecordWithDuplicacy) {
        toast.error(`Duplicate Record Found! GST Type, GST % and Eff. Date combination already exist.`);
        return;
      }

      // execute submit logic and hit the API
      let formPayload = {}
      if (formStatus === 'Insert') {
        let newRecords = accGstData.filter(newData => !newData.hasOwnProperty('create_id'));
        if (!newRecords.length) {
          toast.error('There should be atleast a New Entry for submit in Insert')
          return
        }
        formPayload = { gstAccMstr: newRecords };
        //console.log("at insert", formPayload);
      }

      if (formStatus === 'Update') {
        // let newRecords = accGstData.filter(newData => !newData.hasOwnProperty('create_id'));
        // if(!newRecords.length && !updatedFormData.length && !deletedFormData.length){
        //     toast.error('There should be atleast a Update/Delete/New Entry for Submit in Update')
        //     return
        // }    


        // NEW: filter new records from full data
        const newRecords = accGstData.filter(record => !record.record_id || record.record_id === "");

        const validUpdatedRecords = updatedFormData.filter(record => record.record_id && record.record_id !== ""); 
        //console.log('updatedFormData', updatedFormData) 
        //console.log('validUpdatedRecords', validUpdatedRecords)

        if (!newRecords.length && !validUpdatedRecords.length && !deletedFormData.length) {
          toast.error('There should be at least one new, updated, or deleted entry to submit in Update mode.');
          return;
        }

        formPayload = {
          newGstAccMstr: [...newRecords], updatedGstAccMstr: [...validUpdatedRecords],
          deletedGstAccMstr: [...deletedFormData],
        
        }
        //console.log("at update", formPayload)
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_DATA}?form_status=${formStatus}`, {
        method: "POST",
        body: JSON.stringify(formPayload),
        headers: { "Content-Type": "application/json", },
        credentials: 'include',
      });
      if (response.ok) {
        toast.success(`Data successfully saved`);
        handleCancel()
      } else {
        const errorMsg = await response.json()
        toast.error(errorMsg?.message)
      }

    } catch (error) {
      toast.error(error?.message || "Please check all the form fields or contact administrator");
    } finally {
      setLoading(false);
    }

  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here 
    //console.log('formStatus cancel')
    releaseFormStatus()
    setFormData({});
    setAccGstData([gstAccMstrInitialData])
  }, []);

  // SET HELP FOR
  const handleHelpFor = (data) => {
    if (
      [
        "acc_no_payable",
        "acc_no_rev_payable",
        "acc_no_inward",
        "gst_elec_cash_legr_reg_acc",
        "acc_no_available",
        "acc_no_int_paid",
        "acc_no_penalty_paid",
        "gst_expense_acc_no",
        "acc_no_provisional"
      ].includes(data)
    ) {
      setHelpFor(data);
      setHelpListHeader(accHelpListHeader);
    } else if (data === "gst_pers") {
      setHelpFor(data);
      setHelpListHeader(gstPersHelpListHeader);
    }
  };

  // SHOWS THE HELP LIST
  const handleHelpList = (show) => {
    setHelpList(show);
  };


  // Optimized onSelectHelpItem function
  // const onSelectHelpItem = (data) => {
  //   //console.log(data);
  //   if (helpFor === 'gst_pers') {
  //     handleChange('gst_pers', data.gstp, curntFocusedRow);
  //     return
  //   }
  //   // Check if helpFor is mapped
  //   const fields = helpFieldMap[helpFor];
  //   if (fields) {
  //     handleChange(fields[0], data.acc_no, curntFocusedRow);
  //     handleChange(fields[1], data.acc_desc, curntFocusedRow);
  //   } else {
  //     console.warn("No mapping found for the provided helpFor context:", helpFor);
  //   }
  // }; 


  // const onSelectHelpItem = (data) => {
  //   //console.log("Selected Data:", data);


  //   if (helpFor === "gst_pers") {
  //     setAccGstData((prev) => {
  //       const updated = [...prev];
  //       updated[curntFocusedRow] = {
  //         ...updated[curntFocusedRow],
  //         gst_pers: data.gstp,
  //       };
  //       return updated;
  //     });
  //     return;
  //   }


  //   const fields = helpFieldMap[helpFor];
  //   if (fields) {
  //     setAccGstData((prev) => {
  //       const updated = [...prev];
  //       updated[curntFocusedRow] = {
  //         ...updated[curntFocusedRow],
  //         [fields[0]]: data.acc_no,
  //         [fields[1]]: data.acc_desc,
  //       };
  //       return updated;
  //     });
  //   } else {
  //     console.warn(
  //       "No mapping found for the provided helpFor context:",
  //       helpFor
  //     );
  //   }
  // };  

  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    if (helpFor === "gst_pers") {
      handleChange("gst_pers", data.gstp, curntFocusedRow, true)
      return;
    }

    const fields = helpFieldMap[helpFor];
    if (fields) {
      handleChange(fields[0], data.acc_no, curntFocusedRow, true)
      handleChange(fields[1], data.acc_desc, curntFocusedRow, true);
    } else {
      console.warn("No mapping found for helpFor:", helpFor);
    }
  };

  const otherQueryPera = {
    gst_type: accGstData[curntFocusedRow]?.gst_type,
    gst_pers: accGstData[curntFocusedRow]?.gst_pers,
    eff_dt: accGstData[curntFocusedRow]?.eff_dt,
    record_id: accGstData[curntFocusedRow]?.record_id

  };

  // for getValidate Data--------------------

  const getValidateData = async (fieldName, fieldValue, otherQueryPera = {}, rowIndex = null) => {
    try {
      let API_STRING;

      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_VALID_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_VALID_DATA}?${fieldName}=${fieldValue}&${otherParams}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      }

      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.status === 200) {
        // Validation successful
        return { valid: true, data: data.data || null };
      } else if (response.status === 400) {
        toast.error(data.message);

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


  //  const handleChange = useCallback((field, value, rowIndex, fromHelp = false) => {
   
  //     //console.log('this handlechange called', fromHelp) 

  //     if(!['Insert', 'Update', 'Search'].includes(formStatus)) {
  //       return
  //     }
   

  //   if (
  //     !fromHelp &&
  //     ["Insert", "Update"].includes(formStatus) &&
  //     [
  //       // "gst_pers",
  //       "acc_no_payable",
  //       "acc_no_rev_payable",
  //       "acc_no_inward",
  //       "gst_elec_cash_legr_reg_acc",
  //       "acc_no_available",
  //       "acc_no_int_paid",
  //       "acc_no_penalty_paid",
  //       "gst_expense_acc_no",
  //     ].includes(field)
  //   ) { 
  //     //console.log('help', fromHelp, field)
  

  //     toast.error("Please select from Helplist");
  //     return;
  //   }

  //   setAccGstData((prevData) => {
  //     const newData = [...prevData];
  //     const updatedRow = { ...newData[rowIndex], [field]: value };
  //     newData[rowIndex] = updatedRow;

  //     // Track updates by unique id
  //     setUpdatedFormData((prevUpdated) => {
  //       const idx = prevUpdated.findIndex((row) => row.id === updatedRow.id);
  //       if (idx !== -1) {
  //         const updatedList = [...prevUpdated];
  //         updatedList[idx] = updatedRow;
  //         return updatedList;
  //       }
  //       return [...prevUpdated, updatedRow];
  //     });
      
  //     //console.log("updating id:", updatedRow.id, updatedRow);
  //    // //console.log('updatedformData', updatedFormData)
  //     return newData;
  //   });
  // }, [formStatus]);  
  


const handleChange = useCallback((field, value, rowIndex, fromHelp = false) => {
  //console.log("this handlechange called", fromHelp);

  if (!["Insert", "Update", "Search"].includes(formStatus)) {
    return;
  }

  if (
    !fromHelp &&
    ["Insert", "Update"].includes(formStatus) &&
    [
      "acc_no_payable",
      "acc_no_rev_payable",
      "acc_no_inward",
      "gst_elec_cash_legr_reg_acc",
      "acc_no_available",
      "acc_no_int_paid",
      "acc_no_penalty_paid",
      "gst_expense_acc_no",
    ].includes(field)
  ) {
    //console.log("help", fromHelp, field);
    toast.error("Please select from Helplist");
    return;
  }

  setAccGstData((prevData) => {
    const newData = [...prevData];
    const updatedRow = { ...newData[rowIndex], [field]: value };

    // Ensure record_id exists
    if (!updatedRow.record_id) {
      updatedRow.record_id = newData[rowIndex]?.record_id
    }

    newData[rowIndex] = updatedRow;

    // Track updates by unique record_id
    setUpdatedFormData((prevUpdated) => {
      const idx = prevUpdated.findIndex(
        (row) => row.record_id === updatedRow.record_id
      );

      if (idx !== -1) {
        const updatedList = [...prevUpdated];
        updatedList[idx] = updatedRow;
        return updatedList;
      }
      return [...prevUpdated, updatedRow];
    });

    //console.log("updating record_id:", updatedRow.record_id, updatedRow);
    return newData;
  });
}, [formStatus]);

useEffect(() => {
  //console.log("updatedFormData changed:", updatedFormData);
}, [updatedFormData]);



  // ADD NEW ROW
  const handleAddRow = useCallback(() => {
    setAccGstData((prevData) => [...prevData, gstAccMstrInitialData]);
  }, [accGstData]);

  // DELETE ROW
  const handleDeleteRow = useCallback((data) => {
    if (data?.create_date) {
      let newDeleteData = [...deletedFormData]
      newDeleteData.push(data)
      setDeletedFormData(newDeleteData)
    }
    setAccGstData((prevData) => prevData.filter((row) => row !== data));
  }, [deletedFormData]);


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      setFormLoading(true);
      const modifiedData = queryData?.gstAccDetail.map((eachData) => ({
        ...eachData,
        eff_dt: dateFormatter(eachData.eff_dt || ""),
        init_eff_dt: eachData.eff_dt,
        init_gst_type: eachData.gst_type,
        init_gst_pers: eachData.gst_pers
      }));

      setAccGstData([...modifiedData]);
      setCurrentRecordNo(queryData.count - 1);
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count);
        if (queryData?.count == 0) {
          toast.error('No Record Found')
          handleCancel()
          return

        }
      }
      setFormLoading(false);


    },
    [formStatus, currentRecordNo]
  );

  //console.log('formStatus from memberform', formStatus)
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
        QUERY_API={APP_PROD_API.GET_ACC_CODE_FOR_GST_DATA}
        formName={""}
        isQueryReqOnInsertBtn={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <AccountCodeforGstDtl
              formData={accGstData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              gstTypeList={gstTypeList}
              focusedRow={(data) => setCurntFocusedRow(data)}
              handleHelpFor={handleHelpFor}
              handleHelpList={handleHelpList}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}


            />
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                  whereClause={{ gst_type: accGstData[curntFocusedRow]?.gst_type }}


                />
              </ModalBody>
            </Modal>
          )}

        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default AccountCodeForGst;

