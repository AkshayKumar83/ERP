import React from "react";
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import { useCallback, useState, useEffect } from "react";
import StateWiseGstDetails from "./state_wise_gstDetails";
import {
  stateWiseGstInitialData,
  headers,
  createSearchPayloadForStateGst,
} from "./state_wise_gst_helpers";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useSelector } from "react-redux";
import HelpList from '../../../../components/HelpList';

const StateWiseGstMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState();
  const [stateGstData, setStateGstData] = useState([
    { ...stateWiseGstInitialData },
  ]);
  const [pageCount, setPageCount] = useState(0);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const { loading, setLoading, formLoading, setFormLoading } = useFormLoading();

  const [updatedFormData, setUpdatedFormData] = useState([]);
  const [deletedFormData, setDeletedFormData] = useState([]);


    const [helpList , setHelpList] = useState(false);
    const [helpFor,setHelpFor] = useState('');
    const [helpListHeader,setHelpListHeader] = useState([])
     const toggleHelpModal = () =>setHelpList(!helpList)
       const [selectedRowIndex, setSelectedRowIndex] = useState(null);

       
           const PAGE_SIZE = 20;
       const [currentPage, setCurrentPage] = useState(1);
       const [localSearchQuery, setLocalSearchQuery] = useState({});
     
  // const [searchQueryData, setSearchQueryData] = useState({})

  const tabs = ["State Wise GST Master"];
  const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

  // for DropdownData

  const [stateList, setStateList] = useState([]);
  const [hsnSacCodeList, setHsnSacCodeList] = useState([]);

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_STATEWISE_GST_MASTER_DROPDOWNDATA
          }`
        );
        if (response.status === 200) {
          const data = await response.json();
          // //console.log(data);
          setStateList([
            { value: "", label: "" },
            ...formatOptions(
              data.stateList || [],
              "gst_state_code",
              "state_name"
            ),
          ]);
          // setHsnSacCodeList([
          //   { value: "", label: "" },
          //   ...formatOptions(data.hsnCodeList, "hsn_sac_code", "hsn_sac_code"),
          // ]);
        }
      } catch (err) {
        //console.log(err);
      }
    };

    fetchConstantList();
  }, [formStatus]);


//     const handlePageChange = async (direction) => {
//   const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
//   if (newPage < 1) return;

//   try {
//     const offset = (newPage - 1) * PAGE_SIZE;
//     const queryList = new URLSearchParams({
//       ...searchQuery,       // re-use the same search criteria
//       offset,
//       limit: PAGE_SIZE,
//     });

//     const data = await fetchAppData(
//       `${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${
//         user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
//     );

//     if (data?.type === "not_found" || !data?.stateWiseGstData?.length) {
//       toast.error("No more records");
//       return;
//     }

//     setupQueryData(data, "Page");
//     setCurrentPage(newPage);
//   } catch (error) {
//     toast.error(error?.message || "Error fetching page");
//   }
// };

const handlePageChange = async (direction) => {
  const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
  if (newPage < 1) return;

  try {
    const offset = (newPage - 1) * PAGE_SIZE;

    const queryList = new URLSearchParams({
      ...localSearchQuery,
      offset,
      limit: PAGE_SIZE,
    });

    const data = await fetchAppData(
      `${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
    );

    // ✅ Only block if truly no data
    if (!data || data?.type === "not_found") {
      toast.error("No more records");
      return;
    }

    setupQueryData(data, "Page");
    setCurrentPage(newPage);
  } catch (error) {
    toast.error(error?.message || "Error fetching page");
  }
};



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

case "HSNCode":
  setStateGstData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      it_code: data.it_code,
      hsn_sac_code: data.hsn_sac_code,
      // rate_apprvd_by_chairman: data.rate_apprvd_by_chairman,
      // ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
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




  // Function to validate individual percentage values
  const validatePercField = (fieldName, fieldVal) => {
    if (!fieldName) fieldName = "Field of";
    if (fieldVal !== undefined && fieldVal !== null) {
      if (fieldVal < 0 || fieldVal > 100) {
        toast.error(`Invalid ${fieldName} tax percentage: ${fieldVal}`);
        return false;
      }
    }
    return true;
  };

  // Validation functions for amount fields
  const validateAmountTo = (data) => {
    const { amount_to, amount_from } = data;
    if (amount_to < 0) {
      toast.error(`To Amount cannot be Negative.`);
      return false;
    } else if (amount_to > 0 && amount_to < amount_from) {
      toast.error(`To Amount should be greater than From Amount.`);
      return false;
    }
    return true;
  };

  const validateAmountFrom = (data) => {
    const { amount_from, amount_to } = data;
    if (amount_from < 0) {
      toast.error(`From Amount cannot be Negative.`);
      return false;
    } else if (amount_from > 0 && amount_to < amount_from) {
      toast.error(`From Amount cannot be greater than To Amount.`);
      return false;
    }
    return true;
  };

  const validatePercFieldOnAddRec = (data, isSingle = false) => {
    const checkFields = [
      "sgst_perc",
      "sgst_cess_perc",
      "cgst_perc",
      "cgst_cess_perc",
      "igst_perc",
      "igst_cess_perc",
      "ugst_perc",
      "ugst_cess_perc",
    ];

    // Helper function to validate fields in a single row/object
    const validateFieldsInRow = (row) => {
      // Check all percentage fields
      for (let field of checkFields) {
        const isValid = validatePercField(field, row[field]);
        if (!isValid) return false; // Stop if any percentage field is invalid
      }

      // Return true if all validations pass
      return true;
    };

    // If `isSingle` is true, validate fields in a single data object
    if (isSingle) {
      return validateFieldsInRow(data);
    }

    // Otherwise, validate fields in each row within the data array
    return data.every((row) => validateFieldsInRow(row));
  };

  // for validate form Data

  const validateRecordOnAdd = async (data, currDataIndex, formStatus) => {
    // Check for duplicates in the current data array
    if (!["Insert", "Update", 'search'].includes(formStatus)) {
      return;
    }  

    //console.log('this validationRecordonadd')

    if (data.length > 1) {
      const isDupDataFound = checkDupRecord(data);
      if (isDupDataFound) {
        toast.error(
          "GST Tax already defined against State, HSN Code, Effective Date, and Amount Range."
        );
        return false;
      }
    }

    const isEmpty = (val) =>
  val === null ||
  val === undefined ||
  (typeof val === "string" && val.trim() === "");

const currentRow = stateGstData[currDataIndex];

if (
  // isEmpty(currentRow?.gst_state_code) ||
  isEmpty(currentRow?.hsn_sac_code) ||
  isEmpty(currentRow?.eff_dt) ||
  isEmpty(currentRow?.sal_or_st) ||
  isEmpty(currentRow?.amount_from) ||
  isEmpty(currentRow?.amount_to)
) {
 // toast.error("Please fill all required fields before validation."); 
  // //console.log(
  //   // currentRow?.gst_state_code,
  //   currentRow?.hsn_sac_code,
  //   currentRow?.eff_dt,
  //   currentRow?.sal_or_st,
  //   currentRow?.amount_from,
  //   currentRow?.amount_to
  // );
  return;
}  



   
    const currentRecord = data[currDataIndex];
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA
        }/validate-rec?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(currentRecord),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        return true;
      }

      const result = await response.json();
      toast.error(result.message);
      return false;
    } catch (error) {
      console.error("Error during duplicate check:", error);
      toast.error("An error occurred while validating the record.");
      return false;
    }
  };

  const checkDupRecord = (formData) => {
    return stateGstData.some((currentRecord, index, allRecords) => {
      const {
        gst_state_code,
        eff_dt,
        hsn_sac_code,
        sal_or_st,
        amount_from,
        amount_to,
      } = currentRecord;

      // Check if there's any other record in the array with matching fields and overlapping amount range
      return allRecords.some((record, recordIndex) => {
        if (recordIndex === index) return false; // Skip the current record itself

        const isDuplicate =
          record.gst_state_code === gst_state_code &&
          record.eff_dt === eff_dt &&
          record.hsn_sac_code === hsn_sac_code &&
          record.sal_or_st === sal_or_st &&
          ((amount_to > 0 &&
            amount_to >= record.amount_from &&
            amount_from <= record.amount_to) ||
            (amount_to === 0 && record.amount_to === 0));

        return isDuplicate;
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      //Validate StateWiseGstDetails
      const isValidFormData = validateForm(
        "state-wise-gst-form",
        "State Wise Gst Form"
      );
      if (!isValidFormData) {
        setFormLoading(false);
        return;
      }

      // const isValidPercField = validatePercFieldOnAddRec(stateGstData);
      // if (!isValidPercField) {
      //     return;
      // }

      // const isValidCurrRecord = await validateRecordOnAdd(stateGstData, stateGstData.length-1, formStatus);
      // if (!isValidCurrRecord) {
      //     return;
      // }

      ////console.log(stateGstData)
      let formPayload = {};
      if (formStatus === "Insert") {
        let newRecords = stateGstData.filter(
          (newData) => !newData.hasOwnProperty("create_id")
        );
        if (!newRecords.length) {
          toast.error("There should be atleast a New Entry for submit");
          return;
        }
        formPayload = { stateGstData: newRecords };
        //console.log(formPayload);
      }

      if (formStatus === "Update") {
        let newRecords = stateGstData.filter(
          (newData) => !newData.hasOwnProperty("create_id")
        );
        if (
          !newRecords.length &&
          !updatedFormData.length &&
          !deletedFormData.length
        ) {
          toast.error("There should be a Update/Delete/New Entry for Submit");
          return;
        }
        formPayload = {
          stateGstData: [...newRecords],
          updatedGstDetail: [...updatedFormData],
          deletedGstDetail: [...deletedFormData],
        };
        //console.log("formpayload", formPayload);
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify({ ...formPayload }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success(
          `Form ${formStatus === "Insert" ? "Saved" : "Updated"} successfully`
        );
        handleCancel();
        setDeletedFormData([]);
      } else {
        const result = await response.json();
        toast.error(result.message);
        setFormLoading(false);
      }
    } catch (error) {
      toast.error(
        error?.message ||
        "Please check all the form fields or contact administrator"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // const handleSearch = async () => {
  //   try {
  //     setTotalRecordCount(0);
  //     setCurrentRecordNo(0);
  //     //console.log("stategdtDATA", stateGstData[0]);
  //     const searchPayload = createSearchPayloadForStateGst(stateGstData[0]);
  //     const queryList = new URLSearchParams(searchPayload);

  //     if ([...queryList].length === 0) {
  //       toast.error("Please enter search criteria");
  //       return;
  //     }

  //     setSearchQuery(searchPayload);

  //     const data = await fetchAppData(
  //       `${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
  //     );

  //     if (data?.count === 0) {
  //       toast.error("No matching data record found");
  //       return;
  //     }
  //     setupQueryData(data, "Query");
  //     handleOperation("Query");
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error(error?.message || "Some error occurred");
  //   }
  // };



const handleSearch = async () => {
  try {
    setTotalRecordCount(0);
    setCurrentRecordNo(0);
    setCurrentPage(1);                              // ← reset page

    const searchPayload = createSearchPayloadForStateGst(stateGstData[0]);

    if (Object.keys(searchPayload).length === 0) {
      toast.error("Please enter search criteria");
      return;
    }

    // setSearchQuery(searchPayload);                  // ← save WITHOUT limit/offset
    setLocalSearchQuery(searchPayload);             // ← save WITH limit/offset

    const queryList = new URLSearchParams({
      ...searchPayload,
      limit: PAGE_SIZE,                             // ← add for first fetch
      offset: 0,                                    // ← add for first fetch
    });

    const data = await fetchAppData(
      `${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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









  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  // const handleCancel = useCallback(() => {
  //   // Implement cancel logic here
  //   releaseFormStatus();
  //   setFormData({});
  //     setCurrentPage(1);   
  //   setStateGstData([stateWiseGstInitialData]);
  // }, []);

  const handleCancel = useCallback(() => {
  releaseFormStatus();
  setFormData({});
  setCurrentPage(1);
  setLocalSearchQuery({});   // ← add this reset
  setStateGstData([stateWiseGstInitialData]);
}, []);

  // const handleChange = useCallback((field, value, rowIndex) => {
  //   setStateGstData((prevData) => {
  //     const newData = [...prevData];
  //     const updatedRow = { ...newData[rowIndex], [field]: value };
  //     newData[rowIndex] = updatedRow;

  //     // Track updates by unique id
  //     setUpdatedFormData((prevUpdated) => {
  //       const existingIndex = prevUpdated.findIndex(
  //         (row) => row.id === updatedRow.id
  //       );

  //       if (existingIndex !== -1) {
  //         // Replace the existing row with the latest update
  //         const updatedList = [...prevUpdated];
  //         updatedList[existingIndex] = updatedRow;
  //         return updatedList;
  //       } else {
  //         // Add new changed row
  //         return [...prevUpdated, updatedRow];
  //       }
  //     });

  //     return newData;
  //   });
  // }, []);

  //  const handleChange = useCallback((field, value, rowIndex) => {
  //   setStateGstData((prevData) => {
  //     const newData = [...prevData];
  //     const updatedRow = { ...newData[rowIndex], [field]: value };
  //     newData[rowIndex] = updatedRow;

  //     // Update updatedFormData here to keep in sync
  //     setUpdatedFormData((prevUpdated) => {
  //       const existingIndex = prevUpdated.findIndex(row => row.id === updatedRow.id);
  //       if (existingIndex !== -1) {
  //         const updatedList = [...prevUpdated];
  //         updatedList[existingIndex] = updatedRow;
  //         return updatedList;
  //       } else {
  //         return [...prevUpdated, updatedRow];
  //       }
  //     });

  //     return newData;
  //   });
  // }, []);

  // const handleChange = useCallback((field, value, rowIndex) => {
  //   setStateGstData((prevData) => {
  //     const newData = [...prevData];
  //     const updatedRow = { ...newData[rowIndex], [field]: value };
  //     newData[rowIndex] = updatedRow;

  //     // Only track updates for records that have an ID (i.e., existing records)
  //     if (updatedRow.id) {
  //       setUpdatedFormData((prevUpdated) => {
  //         const existingIndex = prevUpdated.findIndex(row => row.id === updatedRow.id);
  //         if (existingIndex !== -1) {
  //           const updatedList = [...prevUpdated];
  //           updatedList[existingIndex] = updatedRow;
  //           return updatedList;
  //         } else {
  //           return [...prevUpdated, updatedRow];
  //         }
  //       });
  //     }

  //     return newData;
  //   });
  // }, []);

  const handleChange = useCallback((field, value, rowIndex) => {
    if (!["Insert", "Update", 'Search'].includes(formStatus)) {
      //console.log('formStatus:', formStatus);

      return;
    }  

    //console.log('clicked')
    setStateGstData((prevData) => {
      const newData = [...prevData];
      const updatedRow = { ...newData[rowIndex], [field]: value };
      newData[rowIndex] = updatedRow;

      // Only track updates if record_id is present (i.e., existing records)
      if (
        updatedRow.record_id !== undefined &&
        updatedRow.record_id !== null &&
        updatedRow.record_id !== ""
      ) {
        setUpdatedFormData((prevUpdated) => {
          const existingIndex = prevUpdated.findIndex(
            (row) => row.record_id === updatedRow.record_id
          );
          if (existingIndex !== -1) {
            const updatedList = [...prevUpdated];
            updatedList[existingIndex] = updatedRow;
            return updatedList;
          } else {
            return [...prevUpdated, updatedRow];
          }
        });
      }

      return newData;
    });
  }, [formStatus]);  



  // ADD NEW ROW
  const handleAddRow = useCallback(() => {
   // //console.log('grbn')
    setStateGstData((prevData) => [...prevData, stateWiseGstInitialData]);
  }, [stateGstData]);

  // DELETE ROW
  const handleDeleteRow = useCallback(
    (data) => {
      if (data?.create_date) {
        let newDeleteData = [...deletedFormData];
        newDeleteData.push(data);
        setDeletedFormData(newDeleteData);
      }

      //Remove it from updatedFormData if it exists there
      setUpdatedFormData((prevUpdated) =>
        prevUpdated.filter((row) => row.id !== data.id)
      );
      setStateGstData((prevData) => prevData.filter((row) => row !== data));
    },
    [deletedFormData]
  );

  // const handleDeleteRow = useCallback((data) => {
  //   if (data?.create_date) {
  //     setDeletedFormData((prevDeleted) => [...prevDeleted, data]);
  //   }

  //   // Remove it from updatedFormData if it exists there
  //   setUpdatedFormData((prevUpdated) =>
  //     prevUpdated.filter((row) => row.id !== data.id)
  //   );

  //   setStateGstData((prevData) => prevData.filter((row) => row !== data));
  // }, []);

  // const setupQueryData = useCallback(
  //   (queryData, btnClicked) => {
  //     const modifiedData = queryData?.gstStateWiseData.map((eachData) => ({
  //       ...eachData,
  //       eff_dt: dateFormatter(eachData.eff_dt || ""),
  //       init_eff_dt: dateFormatter(eachData.eff_dt || ""),
  //       init_hsn_sac_code: eachData.hsn_sac_code,
  //       init_sal_or_st: eachData.sal_or_st,

  //     }));


  //     setStateGstData([...modifiedData]);
  //     setCurrentRecordNo(queryData?.gstStateWiseData.length);
  //     setPageCount(queryData?.currentPage);
  //     if (btnClicked === "Query") {
  //       setTotalRecordCount(queryData.count);
  //       setTotalPageCount(queryData?.totalPages);
  //       if (queryData.count === 0) {
  //         toast.error("No record found");
  //         handleCancel();
  //         return;
  //       }
  //     }
  //     if (btnClicked === "Next") {
  //       //console.log("next press");
  //       // setCurrentRecordNo(prev=> prev + 50);
  //       setPageCount(queryData?.currentPage);
  //       handleOffset(currentRecordNo + 50);
  //     } else if (btnClicked === "Prev") {
  //       setPageCount(queryData?.currentPage);
  //       handleOffset(currentRecordNo - 50);
  //     }
  //   },
  //   [formStatus, currentRecordNo]
  // );


  const setupQueryData = useCallback((queryData, btnClicked) => {
  if (queryData?.type === "not_found" && btnClicked === "Query") {
    toast.error("No Data Found");
    handleCancel();
    setStateGstData([]);
    setTotalRecordCount(0);
    return;
  }

  const modifiedData = (queryData?.gstStateWiseData || []).map((eachData) => ({
    ...eachData,
    eff_dt: dateFormatter(eachData.eff_dt || ""),
    init_eff_dt: dateFormatter(eachData.eff_dt || ""),
    init_hsn_sac_code: eachData.hsn_sac_code,
    init_sal_or_st: eachData.sal_or_st,
  }));

  setStateGstData([...modifiedData]);

  if (btnClicked === "Query") {
    setTotalRecordCount(queryData.count);
  }
}, [formStatus]);


  //console.log("formStatus from memberform", formStatus);
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
        QUERY_API={APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}
        formName={""}
        // isQueryReqOnInsertBtn={true}
        searchQueryPayload={stateGstData[0]}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      // searchQueryPayload = {stateGstData}
      
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <StateWiseGstDetails
              formData={stateGstData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              stateList={stateList}
              hsnSacCodeList={hsnSacCodeList}
              validatePercFieldOnAddRec={validatePercFieldOnAddRec}
              validateRecordOnAdd={validateRecordOnAdd}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              currentPage={currentPage}
              totalRecordCount={totalRecordCount}
              pageSize={PAGE_SIZE}
              onPrev={() => handlePageChange("prev")}
              onNext={() => handlePageChange("next")}
            />
               {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={formStatus}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_STATEWISE_GST_MASTER_DATA}`}
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

export default StateWiseGstMaster;
