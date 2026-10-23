import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { formInitData, formDetailInitData } from "./invoice_category_helper";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import InvoiceCategoryDetails from "./invoice_category_dtl";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import toast from "react-hot-toast";

const InvoiceCategory = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{ ...formInitData }]);
  const [formDetailData, setFormDetailData] = useState([
    { ...formDetailInitData },
  ]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const [deletedFormdata, setDeletedFormdata] = useState([]);
  const [deletedFormDtldata, setDeletedFormDtldata] = useState([]);

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // for dropdown Data
  const [section, setSection] = useState([]);
  const [deptHeadOffice, setDeptHeadOffice] = useState([]);

  const [activeFormDetailData, setActiveFormDetailData] = useState([
    { ...formDetailInitData },
  ]);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_INVOICE_DROPDOWNDATA
          }`
        );
        if (response.status === 200) {
          const data = await response.json();
          setSection([
            { value: "", label: "" },
            ...formatOptions(data.section || [], "section_id", "section_desc"),
          ]);
          setDeptHeadOffice([
            { value: "", label: "" },
            ...formatOptions(data.deptHeadOffice || [], "c_code", "c_name"),
          ]);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  const tabs = ["Invoice Category"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const getValidateData = async (validData, value, rowIndex) => {
    console.log(
      "Validating:",
      validData,
      "Value:",
      value,
      "RowIndex:",
      rowIndex
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_INVOICE_CATEGORY_VALID_DATA
        }?validdata=${validData}&value=${value}`
      );

      if (response.status === 200) {
        const data = await response.json();
       // console.log("Validation response:", data);

        if (data.message) {
          toast.error(data.message);

          setFormData((prevData) => {
            const updated = [...prevData];
            if (updated[rowIndex]) {
              if (validData === "da_cat") {
               // updated[rowIndex].da_cat = "";
              } else if (validData === "da_cat_desc") {
               // updated[rowIndex].da_cat_desc = "";
              }
            }
            return updated;
          });

          return false;
        }
      }

      if (response.status === 204) {
        return true;
      }

      if (response.status === 500) {
        const errmsg = await response.json();
        throw new Error(errmsg.message);
      }

      toast.error("Unexpected error occurred");
      return false;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate input");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form validation for invoice form
      const invHeaderForm = document.getElementById("invoice-header-form");
      if (!invHeaderForm.checkValidity()) {
        invHeaderForm.reportValidity();
        return;
      }

      const invDetailForm = document.getElementById("invoice-detail-form");
      if (!invDetailForm.checkValidity()) {
        invDetailForm.reportValidity();
        return;
      }

      let body = {
        formData: formData,
        formDetailData: activeFormDetailData,
      };

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedFormDtldata: deletedFormDtldata,
          deletedFormData: deletedFormdata,
        };
      }
      console.log("Final body to send:", body);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_INVOICE_CATEGORY_DATA
        }?form_status=${formStatus}`,
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

      toast.success(
        `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`
      );
      handleCancel();
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

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData([formInitData]);
    setFormDetailData([formDetailInitData]);
    setActiveFormDetailData([formDetailInitData]);
  }, []);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null, e = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) return;

      //const upperCasedValue = typeof value === "string" ? value.toUpperCase() : value;

      const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;

      //   const getUpdatedValue = () => {
      //     if (!isNumberField && e?.target) {
      //       const { selectionStart, selectionEnd } = e.target;
      //       const newValue = processedValue;

      //       requestAnimationFrame(() => {
      //         e.target.setSelectionRange(selectionStart, selectionEnd);
      //       });

      //       return newValue;
      //     }
      //     return processedValue;
      //   };

      const getUpdatedValue = () => {
        if (!isNumberField && e?.target) {
          const target = e.target;
          const { selectionStart, selectionEnd } = target;

          const newValue = processedValue;

          if (typeof target.setSelectionRange === "function") {
            requestAnimationFrame(() => {
              target.setSelectionRange(selectionStart, selectionEnd);
            });
          }

          return newValue;
        }
        return processedValue;
      };

      switch (type) {
        case "formData":
          setFormData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: getUpdatedValue(),
              };
              return newData;
            } else {
              return prev.map((row) => ({
                ...row,
                [name]: getUpdatedValue(),
              }));
            }
          });
          break;

        case "formDetailData":
          setActiveFormDetailData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: getUpdatedValue(),
              };
              return newData;
            } else {
              return prev.map((row) => ({
                ...row,
                [name]: getUpdatedValue(),
              }));
            }
          });
          break;

        default:
          console.warn("Invalid type provided to handleChange");
      }
    },
    [formStatus]
  );

  // ADD NEW ROW
  const handleAddRow = useCallback((tableType) => {
    // Form validation for invoice form
    const invHeaderForm = document.getElementById("invoice-header-form");
    if (!invHeaderForm.checkValidity()) {
      invHeaderForm.reportValidity();
      return;
    }

    const invDetailForm = document.getElementById("invoice-detail-form");
    if (!invDetailForm.checkValidity()) {
      invDetailForm.reportValidity();
      return;
    }  

    // for duplicate check  

if (formData.length > 1) {
  const seenCat = new Set();
  const seenDesc = new Set();
  const seenPair = new Set();

  for (const row of formData) {
    const cat = row.da_cat?.trim();
    const desc = row.da_cat_desc?.trim();

    // Check duplicate category code
    if (cat) {
      if (seenCat.has(cat)) {
        toast.error("Duplicate Category Code found");
        return;
      }
      seenCat.add(cat);
    }

    // Check duplicate category description
    if (desc) {
      if (seenDesc.has(desc)) {
        toast.error("Duplicate Category Description found");
        return;
      }
      seenDesc.add(desc);
    }

    // Check duplicate combination
    if (cat && desc) {
      const key = `${cat}|${desc}`;
      if (seenPair.has(key)) {
        toast.error(
          "Duplicate record found with same Category Code and Category Description"
        );
        return;
      }
      seenPair.add(key);
    }
  }
}


// for add row
    switch (tableType) {
      case "formDataTable":
        setFormData((prevData) => [
          ...prevData,
          {
            ...formInitData,
            id: prevData.length + 1,
          },
        ]);
        break;
      case "formDetailData":
        setActiveFormDetailData((prevData) => [
          ...prevData,
          {
            ...formDetailInitData,
            id: prevData.length + 1,
          },
        ]);
        break;

      default:
        console.log("something went wrong");
    }
  }, []);

  // Delete Row
  const handleDeleteRow = useCallback(
    (type, data, index) => {
      if (type === "formData") {
        let newDeleteData = [...deletedFormdata];

        newDeleteData.push(data);
        setDeletedFormdata(newDeleteData);

        setFormData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });
      }

      if (type === "formDetailData") {
        let newDeleteData = [...deletedFormDtldata];
        newDeleteData.push(data);
        setDeletedFormDtldata(newDeleteData);

        setActiveFormDetailData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });
      }
    },
    [deletedFormdata]
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // if (btnClicked === "Query") {
      setFormData(queryData.invoiceData);
      setFormDetailData(queryData.invoiceDtlData);
      // }

      setTotalRecordCount(queryData?.count || totalRecordCount);
    },
    [formStatus, currentRecordNo]
  );

  console.log("formStatus from memberform", formStatus);
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
        QUERY_API={APP_PROD_API.GET_INVOICE_CATEGORY_DATA}
        formName={""}
        isQueryReqOnInsertBtn={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <InvoiceCategoryDetails
              formStatus={formStatus}
              formData={formData}
              formDetailData={formDetailData}
              handleChange={handleChange}
              triggerAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              section={section}
              deptHeadOffice={deptHeadOffice}
              getValidateData={getValidateData}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              activeFormDetailData={activeFormDetailData}
              setActiveFormDetailData={setActiveFormDetailData}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default InvoiceCategory;
