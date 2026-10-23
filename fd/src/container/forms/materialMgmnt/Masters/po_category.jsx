
import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import PoCategoryDetails from "./po_category_details";
import { createSearchPayloadForPoCategorySpecificSearch, poCategoryInitialData, validatePOCategory } from "./po_category_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { validateForm } from '../../../../utils/fn';
import toast from 'react-hot-toast';
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useSelector } from "react-redux";

const PoCategory = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } = useFormStatus();
  const [formData, setFormData] = useState([]);
  const [updatedFormData, setUpdatedFormData] = useState([]);
  const [deletedFormData, setDeletedFormData] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const tabs = ["PO Category"];

    const {user} = useSelector((state) => state.auth);


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleAddRow = useCallback(() => {
    setFormData((prevData) => {
      const newData = [
        ...prevData,
        {
          ...poCategoryInitialData[0],
          // user_code: "OT",
        },
      ];
      setFocusedRowIndex(newData.length - 1);
      return newData;
    });
  }, []);

  const handleDeleteRow = useCallback(
    (data) => {
      if (data?.create_date) {
        let newDeleteData = [...deletedFormData];
        newDeleteData.push(data);
        setDeletedFormData(newDeleteData);
      }
      setFormData((prevData) =>
        prevData.filter((filtrData) => filtrData.po_cat_description !== data.po_cat_description)
      );
      setFocusedRowIndex(0);
    },
    [deletedFormData]
  );

  const handleUpdateRow = useCallback(
    (data, index) => {
      if (!data?.create_date) {
        return;
      }

      setUpdatedFormData((prevUpdated) => {
        const existingIndex = prevUpdated.findIndex(
          (record) => record.original_po_cat_prefix === data.po_cat_prefix
        );

        if (existingIndex >= 0) {
          const newUpdated = [...prevUpdated];
          newUpdated[existingIndex] = {
            ...data,
            original_po_cat_prefix: newUpdated[existingIndex].original_po_cat_prefix,
          };
          return newUpdated;
        } else {
          return [
            ...prevUpdated,
            {
              ...data,
              original_po_cat_prefix: formData[index].po_cat_prefix,
            },
          ];
        }
      });

      setFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...data };
        return newData;
      });
    },
    [formData]
  );

  const handleChange = useCallback(
    (name, value, index, type = 'text', event) => {
  
if(!["Insert","Search","Update"].includes(formStatus))return;

      const { selectionStart, selectionEnd } = event.target;
      let newVal = type === 'checkbox' ? (value ? 'Y' : 'N') : value.toUpperCase();

      setFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };

        if (newData[index].create_date && formStatus === 'Update') {
          handleUpdateRow(newData[index], index);
        }

        return newData;
      });
  if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  )
      setTimeout(() => {
        if (event.target) {
          event.target.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    },
    [handleUpdateRow, formStatus]
  );

   

  const setupQueryData = useCallback(
    (data, btnClicked) => {
      if (data.type === "found") {
        setFormData([...data.poCategories]);
        setTotalRecordCount(data.poCategories.length);
        setFocusedRowIndex(0)
      }
    },
    [formStatus, currentRecordNo]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const isValidPoCatgegoryForm = validateForm("po-category-form", "poCategory-form");
      if (!isValidPoCatgegoryForm) {
        return;
      }
      const validationRecordWithDuplicacy = validatePOCategory(formData);
      if (!validationRecordWithDuplicacy.isValid) {
        toast.error(validationRecordWithDuplicacy.error);
        return;
      }

      let formPayload = {};
      if (formStatus === 'Insert') {
        let newRecords = formData.filter((newData) => !newData.hasOwnProperty('create_id'));
        if (!newRecords.length) {
          toast.error('There should be at least a New Entry for submit');
          return;
        }
        formPayload = { poCategory: newRecords };
      
      }

      if (formStatus === 'Update') {
        let newRecords = formData.filter((newData) => !newData.hasOwnProperty('create_id'));
        if (!newRecords.length && !updatedFormData.length && !deletedFormData.length) {
          toast.error('There should be a Update/Delete/New Entry for Submit');
          return;
        }
        formPayload = {
          newPoCategory: [...newRecords],
          updatedPoCategory: [...updatedFormData],
          deletedPoCategory: [...deletedFormData],
        };

      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PO_CAT_FORM_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success(`Data successfully saved`);
        formCleanup();
      } else {
        const errorMsg = await response.json();
        toast.error(errorMsg?.message);
      }
    } catch (error) {
      toast.error(error?.message || "Please check all the form fields or contact administrator");
    }
  }

  function formCleanup() {
    setFormData([]);
    setUpdatedFormData([]);
    setDeletedFormData([]);
    setFocusedRowIndex(0);
    releaseFormStatus();
  }

  function handleCancel() {
    releaseFormStatus();
    formCleanup();
  }


    const handleSearch = async () => {
          try {
            setTotalRecordCount(0);
            setCurrentRecordNo(0);
            const searchPayload = createSearchPayloadForPoCategorySpecificSearch(formData);
            const queryList = new URLSearchParams(searchPayload);
      
            if ([...queryList].length === 0) {
              toast.error("Please enter search criteria");
              return;
            }
      
            setSearchQuery(searchPayload);
      
            const data = await fetchAppData(
              `${APP_PROD_API.GET_PO_CAT_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        formData={formData}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_PO_CAT_FORM_DATA}
        formName={"Po Category"}
        isQueryReqOnNextPreBtn={false}
        isQueryReqOnInsertBtn={true}
        searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <PoCategoryDetails
              formData={formData}
              formStatus={formStatus}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              handleChange={handleChange}
              handleUpdateRow={handleUpdateRow}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PoCategory;