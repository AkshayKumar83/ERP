import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import RowAction from '../../../../components/common/rowAction'
import { formDetailInitData } from './closing_inv_for_balSheetHelper';
import ClosingInvforBalSheetDtl from './closing_inv_for_balSheetDtl';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { APP_PROD_API } from '../../../../utils/api';
import { useSelector } from 'react-redux';
import { validateForm } from '../../../../utils/fn';


const ClosingInvForBalance = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [formDetailData, setFormDetailData] = useState([{ ...formDetailInitData }])
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [deletedRecord, setDeletedRecord] = useState([])


  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);



  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const otherQueryPera = {
    inv_dt: formDetailData[focusedRowIndex]?.inv_dt,

  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update detail data (table rows)
    if (["account"].includes(helpFor) && activeRowIndex !== null) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "account":
            currentRow.acc_no = data.acc_no;
            currentRow.acc_desc = data.acc_desc;
            break;

        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData)
    if (helpFor === 'account') {
      return { inv_dt: formData.inv_dt };
    }

    return {};
  }


  const tabs = ["Closing Inv. For Balance Sheet"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // for validation

  const getValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    let API_STRING;

    try {
      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CLOSING_INV_BAL_SHEET_VALID_DATA}?${fieldName}=${fieldValue}`;
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CLOSING_INV_BAL_SHEET_VALID_DATA}?${fieldName}=${fieldValue}&${otherParams}`;
      }

      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.status === 200) {

        if (data.success) {
          console.log("Validation passed:", data.message);
          return true;
        }
      } else if (response.status === 400) {

        toast.error(data.error || "Validation failed.");
        return false;
      } else if (response.status === 500) {
        toast.error(data.error || "Server error occurred.");
        return false;
      }

      else {
        console.error("Unexpected status:", response.status);
        toast.error("Unexpected error occurred.");
        return false;
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
      return false;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const closingInvForm = document.getElementById("closing-inv-balance-dtl-form")
      const closingInvFormValidity = closingInvForm.checkValidity()
      if (!closingInvFormValidity) {
        if (closingInvForm.reportValidity) {
          closingInvForm.reportValidity()
        } else {
          throw new Error("Please fill all the required details in Closing Inv Balance Sheet")
        }
        return
      }

      let body = {
        formDetailData: formDetailData,
        inv_dt: formDetailData[focusedRowIndex]?.inv_dt,
        divisionId: user.global_division_id
      };

      //  Modify the body for "Update" status
      if (formStatus === "Update") {

        //  Duplicate check
        if (formDetailData.length > 1) {
          const seen = new Set();
          for (const row of formDetailData) {
            const key = `${row.acc_no}| ${row.inv_dt}`;
            if (seen.has(key)) {
              toast.error("Duplicate record found with same Acc no and inv date");
              return;
            }
            seen.add(key);
          }
        }


        body = {
          ...body,
          deletedData: deletedRecord,

        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CLOSING_INV_BAL_SHEET_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      handleCancel();
      setDeletedRecord([])
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };


  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData([]);
    setFormDetailData([formDetailInitData])
  }, []);

  const handleChange = useCallback((type, name, value, rowIndex = null) => {

    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }

    if (["Insert", "Update"].includes(formStatus) && ["acc_no"].includes(name)) {
      toast.error("Please select from Helplist");
      return
    }
    switch (type) {

      case "formData":
        setFormData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;

      case "formDetailData":
        setFormDetailData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;

      default:
        console.log("handleChange is not properly defined");
    }


  }, [formStatus]);

  // ADD NEW ROW
  const handleAddRow = useCallback(async () => {
    //  Required field check
    const closingInvForm = document.getElementById("closing-inv-balance-dtl-form");
    if (closingInvForm && !closingInvForm.checkValidity()) {
      if (closingInvForm.reportValidity) {
        closingInvForm.reportValidity();
      } else {
        throw new Error("Please fill all the required details in Closing Inv Balance Sheet");
      }
      return;
    }

    //  Duplicate check
    if (formDetailData.length > 1) {
      const seen = new Set();
      for (const row of formDetailData) {
        const key = `${row.acc_no}| ${row.inv_dt}`;
        if (seen.has(key)) {
          toast.error("Duplicate record found with same Acc no and inv date");
          return;
        }
        seen.add(key);
      }
    }

    // validation 
    if (formStatus === "Update" || formStatus === "Insert") {
      const isChecked =
        formDetailData[focusedRowIndex]?.init_acc_no === formDetailData[focusedRowIndex]?.acc_no;
      formDetailData[focusedRowIndex]?.init_inv_dt === formDetailData[focusedRowIndex]?.inv_dt;

      if (!isChecked) {
        console.log('get validate called')
        const result = await getValidateData(
          "acc_no",
          formDetailData[focusedRowIndex]?.acc_no,
          otherQueryPera,
          focusedRowIndex
        );
        if (!result) return;
      }
    }

    // 4. Add new row
    setFormDetailData((prevData) => [...prevData, formDetailInitData]);
  }, [formDetailData, formStatus, focusedRowIndex, otherQueryPera, formDetailInitData]);



  // DELETE ROW
  const handleDeleteRow = useCallback((data, index) => {
    console.log("Deleting row", index, data);

    //  Always get the latest deletedRecord
    setDeletedRecord((prevDeleted) => [...prevDeleted, data]);

    setFormDetailData((prev) => {
      if (prev.length === 0) return prev;

      const newData = prev.filter((_, i) => i !== index);
      console.log("Row deleted:", data);

      setFocusedRowIndex((currentFocusIndex) => {
        if (index === currentFocusIndex) {
          return index > 0 ? index - 1 : 0;
        } else if (index < currentFocusIndex) {
          return currentFocusIndex - 1;
        } else {
          return currentFocusIndex;
        }
      });

      return newData;
    });

  }, []);


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      // if (btnClicked === "Query") {
      const updatedData = queryData.closingInvData.map(item => ({
        ...item,
        init_acc_no: item.acc_no,
        init_inv_dt: item.inv_dt

      }));

      setFormDetailData(updatedData)
      setFormData(updatedData)
      //  }

      //  setFormDetailData(updatedData)
      //  setFormData(queryData.closingInvData)
      setTotalRecordCount(queryData.count || totalRecordCount);

    },
    [formStatus, currentRecordNo]
  );

  console.log('formStatus from memberform', formStatus)
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
        QUERY_API={APP_PROD_API.GET_CLOSING_INV_BAL_SHEET}
        isQueryReqOnInsertBtn={true}
        isQueryReqOnNextPreBtn={false}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>

            <ClosingInvforBalSheetDtl
              formDetailData={formDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              setActiveRowIndex={setActiveRowIndex}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              formData={formData}
              otherQueryPera={otherQueryPera}
              getValidateData={getValidateData}
            />
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={'Insert'}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CLOSING_INV_BAL_SHEET}`}
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

export default ClosingInvForBalance;

