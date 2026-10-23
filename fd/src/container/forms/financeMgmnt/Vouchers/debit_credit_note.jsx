import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import DebitCreditNoteHeader from './debit_credit_noteHeader';
import DebitCreditNoteDtl from './debit_credit_noteDtl';
import { debitcreditDtlInitData, debitcreditHeadInitData, debitcreditStformInitData, createSearchPayloadForBVSpecificSearch, getDbCrVchReport } from './debit_credit_noteHelper';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import toast from 'react-hot-toast';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import { useSelector } from 'react-redux';
import { fetchAppData } from '../../../../utils/fetchUtils';

const DebitCreditNote = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...debitcreditHeadInitData });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

  const [debitCreditDetailData, setDebitCreditDetailData] = useState([{ ...debitcreditDtlInitData }])
  const [stformData, setStformData] = useState({ ...debitcreditStformInitData })

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [deletedRecord, setDeletedRecord] = useState([])

  const [parameter, setParameter] = useState({ p_voucher_id: '', common_narr: '', p_sect: '', p_vch_dt: '', narr: '' })
   const [isDisabled, setIsPayRecDisabled] = useState(false);

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  //Dropdown Data 
  const [noteType, setNoteType] = useState([]);
  const [division, setDivision] = useState([]);
  const [section, setSection] = useState([]);
  const [purpose, setPurpose] = useState([]);

  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DEBIT_CREDIT_NOTE_DROPDOWNDATA}?formStatus=${formStatus}&appUserId=${user?.id}`, { credentials: 'include', },
        )
        if (response.status === 200) {
          const data = await response.json()
          setNoteType([{ value: "", label: "" }, ...formatOptions(data.noteType || [], "note_type", "note_desc")])
          setDivision([{ value: "", label: "" }, ...formatOptions(data.division || [], "division_id", "name")])
          setSection([{ value: "", label: "" }, ...formatOptions(data.section || [], "section_id", "section_desc")])
          setPurpose([{ value: "", label: "" }, ...formatOptions(data.purpose || [], "code", "description")])

          if(formStatus == 'Insert'){
            setFormData(prev=>{
              return{
                ...prev, 
                section: data?.section[0]?.section_id,
                division_id: data?.division[0]?.division_id,
                trans_year: user?.global_fin_year,
              }
            })
          }

        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
    if(formStatus == 'Insert'){
      setFormData((prev)=>{
        return {
          ...prev,
          voucher_dt: new Date().toISOString().split("T")[0],
        }
      })
    }
  }, [formStatus])

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update main form data
    if (["dbcrAcc", "curr", "bill"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "dbcrAcc":
            return {
              ...prev, dbcr_code: data.acc_no, dbcr_name: data.acc_desc
            };

          case "curr":
            return { ...prev, curr_code: data.curr_code, exchang_rt: data.rate };

          case "bill":
            return { ...prev, bill_no: data.doc_no, bill_dt: dateFormatter(data.doc_date) };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (["acc", "cost"].includes(helpFor) && activeRowIndex !== null) {
      setDebitCreditDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "cost":
            currentRow.cost = data.prefix;
            currentRow.cost_desc = data.description;
            currentRow.cost_centr = data.code;

            break;

          case "acc":
            currentRow.acc_no = data.acc_no;
            currentRow.acc_desc = data.acc_desc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  useEffect(() => {
    setDebitCreditDetailData((prev) =>
      prev.map((item) => ({
        ...item,
        db_cr:
          item.db_cr && item.db_cr !== ""
            ? item.db_cr
            : formData.trans_type === "RN"
              ? "D"
              : formData.trans_type === "DN"
                ? "C"
                : "",
      }))
    );
  }, [formData?.trans_type]);


  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  // Voucher Authorization logic
  const handleAuthVch = async () => {
    //console.log("this auth called")
    //console.log("trans_type", formData.trans_type)
    const { posted, cancel, trans_type, section, pay_rec, voucher_id, trans_amt } = formData;
    const { id } = user

    if (cancel === 'Y') {
      alert('Voucher is Cancelled, cannot Post Voucher.')
      return
    }
    if (posted === 'Y') {
      alert(' This voucher is already posted!, no changes allowed.')
      return
    }


    if (formData?.posted === 'N') {
      // //console.log("trans_type", trans_type)

      const transLabel = trans_type === 'DN' ? 'Debit' : trans_type === 'RN' ? 'Credit' : 'Debit/Credit';
      if (confirm(`Are you sure you wish to authorise this ${transLabel} Note?`)) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZED_DEBIT_CREDIT_NOTE_DATA
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vchrData: {
                id, posted: 'Y', division_id: user?.global_division_id,
                trans_year: user?.global_fin_year, trans_type, section, pay_rec, voucher_id, trans_amt
              },
            }),
            credentials: 'include',
          }
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message)
          setFormData(prev => ({
            ...prev,
            posted: 'Y',
            // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            // voucher_no: result?.voucher_no,
          }))
        } else {
          const result = await response.json();
          toast.error(result?.message)
        }

      }
    }
  }  

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
          `${APP_PROD_API.GET_DEBIT_CREDIT_NOTE_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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
  


  const callInsertTdsData = async (e) => {
    if (e) e.preventDefault();

    const {
      dbcr_code, voucher_dt
    } = formData;

    const requiredFields = {
      dbcr_code, voucher_dt
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === null || value === undefined || value === "") {
        toast.error(`Please fill in the "${key}" field.`);
        return; // Stop function execution if any required field missing
      }
    }

    try {
      const body = {
        formData: formData,
        formDetailData: debitCreditDetailData,
        //divisionId: user.division_id
      };

      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DEBIT_CREDIT_NOTE_DATA}?form_status=${formStatus}&step=tds`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success("Data inserted successfully!");
      return data; // Success
    } catch (error) {
      toast.error(
        error.message || "Please check all the form fields or contact administrator"
      );
      return null; // Failed
    }
  };

  // TRANS AMOUNT CALCULATION 

  function updateCalcTotals(formData, debitCreditDetailData) {
    //console.log("this function called")
    // Reset all totals
    let trans_amt = 0;
    // Loop through each row
    debitCreditDetailData.forEach(row => {
      trans_amt += parseFloat(row.amount || 0);
    });

    return {
      trans_amt: trans_amt.toFixed(2),
    };
  }

  const totals = updateCalcTotals(formData, debitCreditDetailData);

  const handleSubmit = async (e) => {

    if (e) e.preventDefault();

    const isValidFormData = validateForm("debit-credit-noteDtl");
    if (!isValidFormData) {

      return;
    }

    const validateFormFields = (fields) => {
      for (const [field, message] of Object.entries(fields)) {
        if (!formData[field]) {
          toast.error(message);
          return false;
        }
      }
      return true;
    };

    // Usage
    const isValid = validateFormFields({
      dbcr_code: "A/C code cannot be null",
      voucher_dt: "Voucher date cannot be null",
      curr_code: "Currency cannot be null",
    });

    if (!isValid) return;

    const isInvalidBillDate = debitCreditDetailData.some(
      (row) => new Date(row.bill_dt) > new Date(formData.voucher_dt)
    );

    if (isInvalidBillDate) {
      toast.error("Bill date must be less than or equal to Voucher date.");
      return;
    }

    // const hasSameCode = debitCreditDetailData.some(
    //   (row) => row.acc_no === formData.dbcr_code
    // );

    // if (hasSameCode) {
    //   //console.log("Matched acc_no:", formData.dbcr_code);
    //   toast.error("You cannot choose the same Code as Account Code.");
    //   return;
    // }

    if (!totals) return;
    //console.log("trasn_amt", formData.trans_amt)

    const updatedFormData = {
      ...formData,
      ...totals,

    };

    const updatedDetailData = debitCreditDetailData.map((item) => ({
      ...item,
      db_cr:
        item.db_cr && item.db_cr !== ""
          ? item.db_cr
          : formData.trans_type === "RN"
            ? "D"
            : formData.trans_type === "DN"
              ? "C"
              : "",
    }));



    try {
      let body = {
        formData: updatedFormData,
        formDetailData: updatedDetailData,
        finYear: user.global_fin_year,
        divisionId: user.global_division_id
      };

      if (formStatus === "Update") {

        if (formData.cancel === "Y") {
          toast.error("You Cannot Modify a Cancelled Voucher!.")
        }

        if (formData.posted === "Y") {
          toast.error(" You Cannot Modify a Posted Voucher!.")
          return;
        }

        body = {
          formData: updatedFormData,
          formDetailData: updatedDetailData,
          deletedData: deletedRecord
        }
      }

      setDeletedRecord([]);
      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DEBIT_CREDIT_NOTE_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success(data.message || "Data Saved successfully!");
      handleCancel();

      return data;
    } catch (error) {
      toast.error(
        error.message || "Please check all the form fields or contact administrator"
      );
      return false;
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    releaseFormStatus()
    setFormData({ ...debitcreditHeadInitData });
    setDebitCreditDetailData([debitcreditDtlInitData])
  }, []);


  const handleChange = useCallback((type, name, value, rowIndex = null) => { 
    if(!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }
    if (
      ["Insert", "Update"].includes(formStatus) &&
      ["dbcr_code", "curr_code", "acc_no", "cost"].includes(name)
    ) {
      toast.error("Please select from Helplist");
      return;
    }

    let parsedValue = value;

    // Convert all string inputs to uppercase
    if (typeof value === "string") {
      parsedValue = value.toUpperCase();
    }

    // Convert numeric strings to float
    const isNumericField = !isNaN(value) && value !== "";
    if (isNumericField) {
      parsedValue = parseFloat(value);
    }

    switch (type) {
      case "formData":
        setFormData(prev => ({
          ...prev,
          [name]: parsedValue
        }));
        break;

      case "stFormData":
        setStformData(prev => ({
          ...prev,
          [name]: parsedValue
        }));
        break;

      case "debitCreditDetailData":
        setDebitCreditDetailData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: parsedValue
            };
            return newData;
          } else {
            return prev.map(row => ({
              ...row,
              [name]: parsedValue
            }));
          }
        });
        break;

      default:
        console.warn("Invalid type provided to handleChange");
    }
  }, [formStatus]);


  const handleAddRow = () => {
    setDebitCreditDetailData((prev) => {
      const newSrlNo = prev.length + 1; // increment based on current number of rows
      return [
        ...prev,
        {
          ...debitcreditDtlInitData,
          srl_no: newSrlNo
        },
      ];
    });
  };


  // ADD NEW ROW
  const triggerAddRow = () => { 
     const isValidFormData = validateForm("debit-credit-noteDtl");
    if (!isValidFormData) {

      return;
    }
    handleAddRow()

    // todo : i make this logic by my own way might be required to check actual implementation in oracle fmb
    if (parameter?.common_narr === 'Y' && parameter?.narr) {
      setDebitCreditDetailData(prev => {
        const newData = [...prev];
        newData[debitCreditDetailData.length] = { ...newData[debitCreditDetailData.length], ['remarks']: parameter?.narr };
        return newData;
      })
    }
  };


  // DELETE ROW
  const handleDeleteRow = useCallback((data, index) => {

    //console.log("Deleting row", index, data);

    let newDeleteData = [...deletedRecord];
    newDeleteData.push(data);
    setDeletedRecord(newDeleteData);

    setDebitCreditDetailData((prev) => {
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

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {  

        // Handle failure case
          if (queryData.recordCount === 0) {
            toast.error(queryData.message);
            handleCancel()
            return;
          }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.thfmtranData)
      setDebitCreditDetailData(queryData.tdfmtranData);

      //setDebitCreditDetailData(updatedDetailData);
      setStformData(queryData.mofmstformData)

    },
    [formStatus, currentRecordNo]
  );

  //console.log('formStatus from memberform', formStatus)

  // REMARKS AUTOMIZED LOGIC
  function whenValidateNarr(e, data, parameterData) {
    let updatedParameter = { ...parameterData };

    if (
      updatedParameter.common_narr === "" ||
      updatedParameter.common_narr === null
    ) {
      if (confirm("Do You Want Common Narration?")) {
        updatedParameter.common_narr = "Y";
      } else {
        updatedParameter.common_narr = "N";
      }
    }

    updatedParameter.narr =
      updatedParameter.common_narr === "Y" ? data.remarks : "";

    return updatedParameter;
  }

  // WHEN VALIDATE REMARKS / AUTOMAIZATION NARRATION
  const handleBlurRemarks = (e, data) => {
    if (['Insert', 'Update'].includes(formStatus)) {
      if (parameter.common_narr != 'Y' || parameter.common_narr == '') {
        let newParaData = whenValidateNarr(e, data, parameter)
        setParameter(prev => {
          return {
            ...prev, ...newParaData
          }
        })
      }
    }
  }


  // Voucher Cancellation logic
  const handleCancelVch = async () => {
    let { voucher_id, posted, cancel } = formData;
    const { id } = user;

    if (posted === "Y") {
      alert("This Voucher has been already posted. You cannot make any changes.");
      return;
    }

    let newCancelValue = cancel;

    if (cancel === "Y") {
      const confirmRevert = confirm(
        "Voucher already cancelled. Do you want to revert the cancelled Voucher?"
      );
      if (confirmRevert) {
        newCancelValue = "N";
      } else {
        return; // don't proceed if user says no
      }
    } else {
      const confirmCancel = confirm("Do you really want to cancel this Voucher?");
      if (confirmCancel) {
        newCancelValue = "Y";
      } else {
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCELLATION_DBCR_VCH}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vchrData: { voucher_id, id, cancel: newCancelValue },
          }),
          credentials:'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(result?.message || "Voucher cancelled successfully.");
        setFormData((prev) => ({ ...prev, cancel: newCancelValue }));
      } else {
        toast.error("Failed to update cancellation status.");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("An error occurred while updating the voucher.");
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
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DEBIT_CREDIT_NOTE_DATA}
        formName={""}
        handleAuthRecord={handleAuthVch}
        handlePrint={()=>getDbCrVchReport(formData, formStatus)}
        opterationBtn={[
          {
            name: formData.cancel === "Y" ? "Revert Cancellation" : "Cancel Voucher",
            onClick: () => handleCancelVch(),
            disabled: !['Query'].includes(formStatus)
            
          }
        ]}
        authority={{
          insert: 'Y',
          update: formData?.posted === 'Y' || formData?.cancel === 'Y' ? 'N' : 'Y',
          message:
            formData?.posted === 'Y'
              ? 'Voucher has been already Posted, no modifications possible.'
              : formData?.cancel === 'Y'
              ? 'Voucher has been Cancelled, no modifications possible.'
              : '',
        }}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <DebitCreditNoteHeader
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              noteType={noteType}
              division={division}
              section={section}
              purpose={purpose}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              validateRequiredField={validateRequiredField}

            />
            <DebitCreditNoteDtl
              formData={formData}
              formDetailData={debitCreditDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDeleteRow}
              purpose={purpose}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              setActiveRowIndex={setActiveRowIndex}
              validateRequiredField={validateRequiredField}
              setParameter={setParameter}
              parameter={parameter}
              handleBlurRemarks={handleBlurRemarks}
              callInsertTdsData={callInsertTdsData}
              setDebitCreditDetailData={setDebitCreditDetailData}
            />
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DEBIT_CREDIT_NOTE_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                // whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default DebitCreditNote;
