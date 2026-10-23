import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import EmailDescriptionDtl from "./email_descriptionDtl";
import { emailDescInitialFormDataTemplate } from "./email_description_helper";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";

const EmailDescription = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();
  const [emailDescData, setEmailDescData] = useState([
    { ...emailDescInitialFormDataTemplate },
  ]);
  const [deletedEmailDescData, setDeletedEmailDescData] = useState([]);

  const [focusedRowIndex, setFocusedRowIndex] = useState(0)

  const tabs = ["Email Description"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // const fetchValidateData = async (fieldName, fieldValue, rowIndex = null) => {  

  //   console.log('ffetdch')
  //   if (!fieldValue) return { valid: false };

  //   let API_STRING =
  //     (`${import.meta.env.VITE_BASE_API_URL}${
  //       APP_PROD_API.GET_EMAIL_DESCRIPTION_VALIDATE_DATA
  //     }?${encodeURIComponent(fieldName)}=${encodeURIComponent(fieldValue)}`,
  //     { credentials: "include" });

  //   try {
  //     const response = await fetch(API_STRING, { credentials: "include" });

  //     if (response.status === 400) {
  //       toast.error("Email type already exists");
  //       setEmailDescData((prev) => {
  //         const updated = [...prev];
  //         updated[rowIndex] = {
  //           ...updated[rowIndex],
  //          /// [fieldName]: "",
  //         };
  //         return updated;
  //       });
  //       return { valid: false };
  //     }

  //     return { valid: true };
  //   } catch (err) {
  //     console.error("Error fetching validation data:", err);
  //     toast.error("Something went wrong while validating the data.");
  //     return { valid: false };
  //   }
  // };

  const fetchValidateData = async (fieldName, fieldValue, rowIndex = null) => {
    console.log('ffetdch')
    if (!fieldValue) return { valid: false };


    let API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMAIL_DESCRIPTION_VALIDATE_DATA}?${fieldName}=${fieldValue}`;

    try {
      const response = await fetch(API_STRING, { credentials: "include" });

      if (response.status === 400) {
        const data = await response.json();
        if (data.error) {
          toast.error(data.error)
        }
        setEmailDescData((prev) => {
          const updated = [...prev];
          updated[rowIndex] = {
            ...updated[rowIndex],
            // [fieldName]: "", // uncomment if needed to clear value
          };
          return updated;
        });
        return { valid: false };
      }

      return { valid: true };
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
      return { valid: false };
    }
  };


  function formCleanup() {
    setEmailDescData([emailDescInitialFormDataTemplate]);
    releaseFormStatus();
    setFormData({});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // form validation for email description
      const emailDescForm = document.getElementById("email-description-form");
      if (!emailDescForm.checkValidity()) {
        emailDescForm.reportValidity();
        return;
      }

      if (formStatus === "Insert") {
        let newRecords = emailDescData.filter((newData) =>
          newData.hasOwnProperty("id")
        );
        if (newRecords.length === 0) {
          toast.error(
            "There should be atleast a New Entry for submit in Insert"
          );
          return;
        }
      }

      let body = {
        emailDescData: emailDescData,
      };

      if (formStatus === "Update") {
        body = {
          emailDescData: emailDescData,
          deletedEmailDescData: deletedEmailDescData,
        };
      }

      console.log("Final body to send:", body);

      //console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_EMAIL_DESCRIPTION_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      formCleanup();
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }

    console.log("Form submitted", formData);
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null, e = null) => {
      if (!["Insert", "Update"].includes(formStatus)) {
        return;
      }

      const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;

      const getUpdatedValue = () => {
        if (!isNumberField && e?.target) {
          const { selectionStart, selectionEnd } = e.target;
          const newValue = processedValue;

          requestAnimationFrame(() => {
            e.target?.setSelectionRange(selectionStart, selectionEnd);
          });

          return newValue;
        }
        return processedValue;
      };

      switch (type) {
        case "formData":
          setFormData((prev) => ({ ...prev, [name]: getUpdatedValue() }));
          break;

        case "emailDescData":
          setEmailDescData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              // Update a specific row
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                // [name]: typeof value === "string" ? value.toUpperCase() : value
                [name]: getUpdatedValue(),
              };
              return newData;
            } else {
              // Update all rows (used for Select field outside table)
              return prev.map((row) => ({
                ...row,
                // [name]: typeof value === "string" ? value.toUpperCase() : value
                [name]: getUpdatedValue(),
              }));
            }
          });
          break;

        default:
          console.log("handleChange is not properly defined");
      }
    },
    [formStatus]
  );

  // add category row
  const handleAddRow = useCallback(async () => {
    // form validation for email description
    const emailDescForm = document.getElementById("email-description-form");
    if (!emailDescForm.checkValidity()) {
      emailDescForm.reportValidity();
      return;
    }

    // duplicate entry 

    const seen = new Set();
    for (const item of emailDescData) {
      const key = `${item.email_type}-${item.email_desc}`;
      if (seen.has(key)) {
        toast.error("Combination already exists");
        return; // stop further execution
      }
      seen.add(key);
    }

    // 3. Validation logic
    const fields = [
      { name: "email_type", value: emailDescData[focusedRowIndex]?.email_type },
      { name: "email_desc", value: emailDescData[focusedRowIndex]?.email_desc },

    ];

    if (formStatus === "Update" || formStatus === "Insert") {
      console.log("formStatus", formStatus);

      const row = emailDescData[focusedRowIndex];

      // Safe null/undefined-aware comparison helper
      const isEqual = (a, b) => (a == null && b == null) || a === b;

      const isChecked =
        isEqual(row?.init_sno, row?.sno) &&
        isEqual(row?.init_sch_sno, row?.sch_sno) &&
        isEqual(row?.init_schd_no, row?.schd_no) &&
        isEqual(row?.init_rollup_acc1, row?.rollup_acc1);

      if (!isChecked) {
        console.log("not checked");
        for (const f of fields) {
          const result = await getValidateData(
            f.name,
            f.value,
            otherQueryPera,
            focusedRowIndex
          );
          if (!result.valid) return;
        }
      }
    }




    setEmailDescData((prevData) => [
      ...prevData,
      { ...emailDescInitialFormDataTemplate },
    ]);
  }, [emailDescData]);

  //DELETE ROW
  const handleDeleteRow = useCallback(
    (data, index) => {
      let newDeleteData = [...deletedEmailDescData];

      newDeleteData.push(data);
      setDeletedEmailDescData(newDeleteData);

      setEmailDescData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [emailDescData]
  );


  // const setupQueryData = useCallback(
  //   (queryData, btnClicked) => {

  //     if (btnClicked === "Query") {
  //       setEmailDescData(queryData.emailDescData)

  //     }

  //     setTotalRecordCount(queryData?.count || totalRecordCount);
  //   },
  //   [formStatus, currentRecordNo]
  // );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked === "Query") {
        // Handle failure case
        if (queryData.count == 0) {
          toast.error('No record found');
          handleCancel()
          return;
        }
        //setEmailDescData(queryData.emailDescData)
      }



      const updatedData = queryData.emailDescData.map((item) => ({
        ...item,
        init_email_type: item.email_type,
        init_email_desc: item.email_desc
      }));

      setEmailDescData(updatedData);

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
        QUERY_API={APP_PROD_API.GET_EMAIL_DESCRIPTION_DATA}
        formName={""}
        isQueryReqOnInsertBtn={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <EmailDescriptionDtl
              formData={formData}
              emailDescData={emailDescData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              fetchValidateData={fetchValidateData}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default EmailDescription;
