import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { APP_PROD_API } from "../../../../utils/api";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import BlockPaymentOptionMain from "./block_payment_option_main";
import { blockPymtInitData } from "./block_payment_option_helper";
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import toast from 'react-hot-toast';
import { dateFormatter } from "../../../../utils/fn";
import { useSelector } from "react-redux";


const BlockPaymentOption = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{ ...blockPymtInitData }]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const tabs = [];


  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [activeRowIndex, setActiveRowIndex] = useState(null);


  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);



  // focus row 

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // for delete record

  const [deletedRecord, setDeletedRecord] = useState([])


  const handleHelpList = (data) => {
    setHelpList(data);
  }


  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update detail data (table rows)
    if (["acc", "doc"].includes(helpFor) && activeRowIndex !== null) {
      setFormData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "acc":
            currentRow.acc_no = data.v_code;
            currentRow.acc_desc = data.v_name;
            break;

          case "doc":
            currentRow.doc_no = data.doc_no;
            currentRow.doc_dt = dateFormatter(data.doc_dt);
            break;

        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const whereClauseForHelp = (helpFor) => {
    //console.log("formData data", formData)

    if (helpFor === 'doc') {
      return { acc_no: formData[focusedRowIndex]?.acc_no };
    }


    return {};
  }

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blockForm = document.getElementById("block-payment-form")
      const blockFormValidity = blockForm.checkValidity()
      if (!blockFormValidity) {
        if (blockForm.reportValidity) {
          blockForm.reportValidity()
        } else {
          throw new Error("Please fill all the required details in acc wise tds master")
        }
        return
      }

      // check for duplicate

      const seen = new Set()

      for (const item of formData) {
        let key = `${item.acc_no}|${item.doc_no}`
        if (seen.has(key)) {
          toast.error(`Duplicate record found with same Acc no and doc no`)
          return
        }
        seen.add(key)
      }

      if (formStatus === 'Insert') {
        let newRecords = formData.filter(newData => newData.hasOwnProperty('id'));
        if (newRecords.length === 0) {
          toast.error('There should be atleast a New Entry for submit in Insert')
          return
        }

      }

      let body = {
        formData: formData,
        appUserId: user?.id
      };

      //Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedData: deletedRecord,

        };
      }

      setDeletedRecord([])

      //console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_FOR_BLOCK_PAYMENT_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      handleCancel()
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  // for validate fields 

  const otherQueryPera = {
    acc_no: formData[focusedRowIndex]?.acc_no,
    doc_dt: formData[focusedRowIndex]?.doc_dt


  };


  const fetchValidation = async (param, fieldValue, otherQueryPera = {}, rowIndex = null) => {
    try {
      const queryParams = new URLSearchParams({
        param,
        [param]: fieldValue,
        ...otherQueryPera,
        appDivisionId: user?.global_division_id,
        appFinYear: user?.global_fin_year,
        appUserId: user?.id
      });

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VALIDATE_BLOCK_PAYMENT}/?${queryParams.toString()}`;

      const response = await fetch(API_STRING);
      const data = await response.json();

      return { ok: response.ok, data };
    } catch (err) {
      console.error("Error validating:", err);
      toast.error("Something went wrong while validating the data.");
      return { ok: false, data: { error: "Network error" } };
    }
  };


  const getValidateData = async (param, value, otherQueryPera = {}, rowIndex = null) => {
    switch (param) {
      case "acc_no":
        return await getValidateAccData(value, otherQueryPera, rowIndex);

      case "doc_no":
        return await getValidateDocData(value, otherQueryPera, rowIndex);

      default:
        console.warn(`Validation not implemented for param: ${param}`);
        return true;
    }
  };


  // for acc no
  const getValidateAccData = async (fieldValue, otherQueryPera = {}, rowIndex = null) => {
    const { ok, data } = await fetchValidation("acc_no", fieldValue, otherQueryPera, rowIndex);

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Account");

      return false;
    }

    if (data.data && rowIndex !== null) {
      const accData = data.data;
      setFormData(prev => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            acc_desc: accData.v_name,

          };
        }
        return updated;
      });
    }

    return true;
  };

  // doc no

  const getValidateDocData = async (fieldValue, otherQueryPera = {}, rowIndex = null) => {
    const { ok, data } = await fetchValidation("doc_no", fieldValue, otherQueryPera);

    if (!ok || data.error) {
      toast.error(data.error || "Invalid doc no");
      if (data.data && rowIndex !== null) {
        const docData = data.data;
        setFormData(prev => {
          const updated = [...prev];
          if (updated[rowIndex]) {
            updated[rowIndex] = {
              ...updated[rowIndex],
              doc_dt: docData.doc_dt,

            };
          }
          return updated;
        });
      }

      return false;
    }

    return true;
  };


  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData([blockPymtInitData]);
  }, []);

  const handleChange = useCallback((name, value, index, event) => {
    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }
    if (["acc_no", "doc_no"].includes(name)) {
      toast.error("Please select from helplist")
      return
    }
    const cursorPosition = event.target.selectionStart;
    let newVal = value.toUpperCase();

    setFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: newVal };
      return newData;
    });

    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }, [formStatus]);

  //  for Add row 

  const triggerAddRow = async () => {
    const blockForm = document.getElementById("block-payment-form")
    const blockFormValidity = blockForm.checkValidity()
    if (!blockFormValidity) {
      if (blockForm.reportValidity) {
        blockForm.reportValidity()
      } else {
        throw new Error("Please fill all the required details in acc wise tds master")
      }
      return
    }

    // check for duplicate

    const seen = new Set()

    for (const item of formData) {
      let key = `${item.acc_no}|${item.doc_no}`
      if (seen.has(key)) {
        toast.error(`Duplicate record found with same Acc no and doc no`)
        return
      }
      seen.add(key)

    }



    // Proceed to add new row
    setFormData((prev) => [
      ...prev,
      { ...blockPymtInitData, id: prev.length + 1 }
    ]);
  };

  // for delete Row 

  const handleDeleteRow = useCallback((data, index) => {

    let newDeleteData = [...deletedRecord];
    newDeleteData.push(data);
    setDeletedRecord(newDeleteData);

    setFormData((prev) => {
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

  // for query data

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      if (btnClicked === "Query") {
        if (queryData.count === 0) {
          toast.error('No record found')
          handleCancel()
          return
        }
      }
      const updatedData = queryData.blockPaymentData.map(item => ({
        ...item,
        init_acc_no: item.acc_no,

      }))

      setFormData(updatedData)

      setTotalRecordCount(queryData?.count || totalRecordCount);
    },
    [formStatus, currentRecordNo]
  );

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
        isQueryReqOnInsertBtn={true}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_BLOCK_PAYMENT}
        formName={"Block Payment Option"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <BlockPaymentOptionMain
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              handleDeleteRow={handleDeleteRow}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              activeRowIndex={activeRowIndex}
              setActiveRowIndex={setActiveRowIndex}
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
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_BLOCK_PAYMENT}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                  whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}

        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default BlockPaymentOption;
