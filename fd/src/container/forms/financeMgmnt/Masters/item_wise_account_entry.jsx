import React, { useEffect } from "react";
import {
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ItemWiseAccountEntryDtl from "./item_wise_account_entry_dtl";
import { itemWiseAccEntryInitData } from "./item_wise_account_entry_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const ItemWiseAccountEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [showData, setShowData] = useState(false);
  const [controlData, setControlData] = useState({
    item_cat: "I",
    level1: "",
    level2: "",
    level3: "",
    purac_head: "",
    saleac_head: "",
  });

  const [deletedRow, setDeletedRow] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [itemType, setItemType] = useState([]);
  const [itemBase, setItemBase] = useState([]);
  const [itemSubCat, setItemSubCat] = useState([]);

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);
  const { user } = useSelector((state) => state.auth);
  const [paginationPage, setPaginationPage] = useState(1);

  const tabs = ["Item Wise Account Entry"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  //dropdowndata
  // Level1 load on formStatus
  useEffect(() => {
    const fetchLevel1 = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_DROPDOWN_DATA
        }`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemType([
        { value: "", label: "" },
        ...formatOptions(data.level1 || [], "level1", "cat_desc"),
      ]);
    };

    if (formStatus) fetchLevel1();
  }, [formStatus]);

  // Level2 load based on Level1 selection
  useEffect(() => {
    const fetchLevel2 = async () => {
      if (controlData.level1) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_DROPDOWN_DATA
          }?level1=${controlData.level1}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setItemBase([
          { value: "", label: "" },
          ...formatOptions(data.level2 || [], "level2", "cat_desc"),
        ]);
        setItemSubCat([]); // reset level3
      } else {
        setItemBase([]);
        setItemSubCat([]);
      }
    };

    fetchLevel2();
  }, [controlData.level1]);

  // Level3 load based on Level1 + Level2 selection
  useEffect(() => {
    const fetchLevel3 = async () => {
      if (controlData.level1 && controlData.level2) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_DROPDOWN_DATA
          }?level1=${controlData.level1}&level2=${controlData.level2}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setItemSubCat([
          { value: "", label: "" },
          ...formatOptions(data.level3 || [], "level3", "cat_desc"),
        ]);
      } else {
        setItemSubCat([]);
      }
    };

    fetchLevel3();
  }, [controlData.level1, controlData.level2]);

  // filter data acc to select filed and item acc showing in UI table
  useEffect(() => {
    const fetchFilteredItems = async () => {
      const params = new URLSearchParams({
        level1: controlData.level1 || "",
        level2: controlData.level2 || "",
        level3: controlData.level3 || "",
      });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_FILTER_DATA
          }?${params}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data?.type === "found") {
          setFormData(data.itemWiseAccEntry);
        } else if (data?.type === "empty") {
          setFormData([]);
          toast.error(data.message);
        } else {
          setFormData([]);
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
      }
    };

    if (controlData.level1 || controlData.level2 || controlData.level3) {
      fetchFilteredItems();
    }
  }, [controlData.level1, controlData.level2, controlData.level3]);

  const handleHelpList = (data) => {
    if (["Update"].includes(formStatus)) {
      setHelpList(data);
    }
  };

  const onSelectHelpItem = (data) => {
    switch (helpFor) {
      case "PurchaseAcchead":
        setControlData((prev) => ({ ...prev, purac_head: data.acc_no }));
        break;

      case "SalesAcchead":
        setControlData((prev) => ({ ...prev, saleac_head: data.acc_no }));
        break;

      case "PurchaseAcc":
        setFormData((prev) => {
          const updatedRows = [...prev];
          updatedRows[focusedRowIndex] = {
            ...updatedRows[focusedRowIndex],
            purac_head: data.acc_no,
            isStatus: 'update'
          };
          return updatedRows;
        });
        break;

      case "SalesAcc":
        setFormData((prev) => {
          const updatedRows = [...prev];
          updatedRows[focusedRowIndex] = {
            ...updatedRows[focusedRowIndex],
            salac_head: data.acc_no,
            isStatus: 'update'
          };
          return updatedRows;
        });
        break;
    }
  };

  function handleDelete(rowData, rowIndex) {
    // const updatedRows = formData.filter((row, index) => index === rowIndex);
    
    if (rowData?.it_code) {
      setDeletedRow((prev) => [...prev, rowData]);
    }

    setFormData((prev) =>{
      let newformData = prev
      let curntRow = {...newformData[rowIndex], purac_head:null, salac_head:null}
      newformData[rowIndex]= curntRow
      return newformData
      
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
     const rowsToSubmit = formData.filter(row => row.isStatus);

    if (rowsToSubmit.length === 0 && deletedRow.length === 0) {
      throw new Error("No rows to submit. Please update / delete at least one row.");
    }

    const body = { formData: rowsToSubmit, deletedRow };

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.PUT_ITEM_WISE_ACC_ENTRY_DATA
        }?form_status=${formStatus}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Can't fecting error while submiting data");
      }

      const result = await response.json();
      toast.success("Form submitted successfully.");

      handleCancel();
    } catch (error) {
      console.error("Submit error:", error.message);
      toast.error(error.message || "Can't fecting error while submiting data");
    }

   
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData([]);
    setDeletedRow([])
    setControlData({
      rg_sort: "I", // Radio ko default "ItemWise" pe set karo
      level1: "",
      level2: "",
      level3: "",
      purac_head: "",
      saleac_head: "",
    });
      setPaginationPage(1); 
  }, []);

  const handleControlChange = (name, value) => {
     setPaginationPage(1);
    if (name === "level1") {
      setControlData((prev) => ({
        ...prev,
        level1: value,
        level2: "",
        level3: "",
      }));
    } else if (name === "level2") {
      setControlData((prev) => ({
        ...prev,
        level2: value,
        level3: "",
      }));
    } else {
      setControlData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChange = useCallback(
    (name, value, index, event) => {
      if (!["Update"].includes(formStatus)) {
        return;
      }
        
      if (["purac_head", "salac_head"].includes(name)) {
       toast.error("Please select from Help List on Double Click");
      return;
    }

      const cursorPosition = event.target.selectionStart;
      let newVal = value.toUpperCase();

      setFormData((prev) => {
        const updatedRows = [...prev];
        updatedRows[index] = { ...updatedRows[index], [name]: newVal};
        return updatedRows;
      });

      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    },
    [formStatus]
  );

  const triggerAddRow = () => {
    setFormData((prev) => [...prev, { ...itemWiseAccEntryInitData }]);
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //      setFormData(queryData?.itemWiseAccEntry);
      //     if (['Insert', 'Query'].includes(btnClicked)) {
      //    setTotalRecordCount(queryData?.totalCount);
      //  }
      
    },
    [formStatus, currentRecordNo]
  )

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
        QUERY_API={APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_DATA}
        authority={{ query: "N", insert: "N", update: "Y" }}
        btnEnableDtl={{ search: false, insert: false }}
        formName={"Item Wise Acc Entry"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <ItemWiseAccountEntryDtl
              controlData={controlData}
              formData={formData}
              setFormData={setFormData}
              formStatus={formStatus}
              handleControlChange={handleControlChange}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              itemBase={itemBase}
              itemType={itemType}
              itemSubCat={itemSubCat}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              handleDelete={handleDelete}
              paginationPage={paginationPage}         
              setPaginationPage={setPaginationPage} 
              handleCancel={handleCancel}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: "Y" }}
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

export default ItemWiseAccountEntry;
