

import React, { useState, useCallback, useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import UploadPhysicalInventoryHeader from "./upload_Physical_Inventory_header";
import { tempPhyinvUploadInitData } from "./upload_Physical_Inventory_helper";
import toast from "react-hot-toast";
import { dateFormatter } from "../../../../utils/fn";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

const UploadPhysicalInventory = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [opngMnth, setOpngMnth] = useState([]);
  const [formData, setFormData] = useState({
    wc_no: "",
    inv_date: "",
    inv_month: "",
    file_name: "",
    rows: [],
    uploadData: null,
  });
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const toggleHelpModal = () => setHelpList(!helpList);
  const { formStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const tabs = ["Upload Physical Inventory"];

  // State for modal and button disable
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(false);

  const updateActiveTab = (tab) => setActiveTab(tab);

  const onSuccessConfirmation = useCallback(
    (confirm, it_code) => {
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formData]
  );

  // Callback for child – validation errors handle
  const handleValidationError = useCallback((type, data) => {
    // Update button disable state based on showGenerateButton
    setIsUploadButtonDisabled(!data.showGenerateButton);

    if (type === 'invalid') {
      setConfirmationConfig({
        title: "Invalid Item Codes",
        description: (
          <div>
            <p>The excel uploaded contains invalid item codes, displayed in red.</p>
            <p>You can not proceed further till corrections are made in the excel file and file uploading done again.</p>
            <ul style={{ color: 'red' }}>
              {data.items.map((code, idx) => (
                <li key={idx}>{code}</li>
              ))}
            </ul>
          </div>
        ),
        onSuccess: () => {
          setConfirmationModal(false);
          if (data.storeItems && data.storeItems.length > 0) {
            setConfirmationConfig({
              title: "Missing Store Items",
              description: (
                <div>
                  <p>The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue.</p>
                  <p>You can not proceed further till corrections are made in the excel file and file uploading done again.</p>
                  <ul style={{ color: 'blue' }}>
                    {data.storeItems.map((code, idx) => (
                      <li key={idx}>{code}</li>
                    ))}
                  </ul>
                </div>
              ),
              onSuccess: () => {
                setConfirmationConfig({});
                setConfirmationModal(false);
              },
              showConfirm: true,
            });
            setConfirmationModal(true);
          }
        },
        showConfirm: true,
      });
      setConfirmationModal(true);
    } else if (type === 'store') {
      setConfirmationConfig({
        title: "Missing Store Items",
        description: (
          <div>
            <p>The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue.</p>
            <p>You can not proceed further till corrections are made in the excel file and file uploading done again.</p>
            <ul style={{ color: 'blue' }}>
              {data.items.map((code, idx) => (
                <li key={idx}>{code}</li>
              ))}
            </ul>
          </div>
        ),
        onSuccess: () => {
          setConfirmationConfig({});
          setConfirmationModal(false);
        },
        showConfirm: true,
      });
      setConfirmationModal(true);
    }
  }, []);

  useEffect(() => {
    const fetchLevel1 = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_UPLOAD_PHY_INV_DROPDOWN_DATA
        }`,
        { credentials: "include" }
      );
      const data = await response.json();
      setOpngMnth([{ value: '', label: '' }, ...formatOptions(data.invMonths || [], "month", "cmonth")]);
    };

    if (formStatus) fetchLevel1();
  }, [formStatus]);

  const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };

  const onSelectHelpItem = async (data) => {
    switch (helpFor) {
      case "WcNo":
        setFormData((prev) => ({
          ...prev,
          wc_no: data.wc_no,
          wc_id: data.wc_id,
        }));
        break;

      // case "item": {
      //   setFormData((prev) => {
      //     const updatedRows = prev.rows.map((row, idx) =>
      //       idx === selectedRowIndex
      //         ? {
      //             ...row,
      //             it_code: data.it_code,
      //             it_name: data.it_name,
      //           }
      //         : row
      //     );
      //     return { ...prev, rows: updatedRows };
      //   });
      //   break;
      // }
    }
  };

  const handleOffset = (data) => setCurrentRecordNo(data);

  const formCleanup = () => {
    setFormData({
      wc_no: "",
      inv_date: "",
      inv_month: "",
      file_name: "",
      rows: [],
      uploadData: null,
    });
    setFocusedRowIndex();
    setIsUploadButtonDisabled(false); // Reset button state
    releaseFormStatus();
  };

  const handleCancel = useCallback(formCleanup, []);

  const handleChange = useCallback(
    (name, value, rowIndex, event) => {
      if (!["Update"].includes(formStatus)) return;

      if (["it_code", "wc_no"].includes(name)) {
        toast.error("Please select value from Help List (double click)");
        return;
      }

      const isTextInput =
        event?.target?.tagName === "INPUT" &&
        !["number", "radio", "checkbox", "date"].includes(event.target.type);

      const cursorPos = event?.target?.selectionStart;

      const finalValue =
        typeof value === "string" && isTextInput ? value.toUpperCase() : value;

      setFormData((prev) => {
        if (typeof rowIndex === "number") {
          const updatedRows = prev.rows.map((r, i) =>
            i === rowIndex ? { ...r, [name]: finalValue } : r
          );
          return { ...prev, rows: updatedRows };
        }
        return { ...prev, [name]: finalValue };
      });

      if (isTextInput) {
        setTimeout(() => {
          try {
            event?.target?.setSelectionRange(cursorPos, cursorPos);
          } catch {}
        }, 0);
      }
    },
    [formStatus]
  );

  const triggerAddRow = useCallback(() => {
    setFormData((prev) => {
      const newIndex = prev.rows.length;
      const next = {
        ...prev,
        rows: [...prev.rows, { ...tempPhyinvUploadInitData, isStatus: "new" }],
      };
      setFocusedRowIndex(newIndex);
      return next;
    });
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (!queryData) return;

      const { type, headerData, rows, count, message } = queryData;

      if (type === "not_found") {
        toast.error(message || "No Data Found");
        handleCancel();
        return;
      }

      if (type === "found" && headerData) {
        const formattedInvDate = headerData.inv_date
          ? dateFormatter(headerData.inv_date)
          : "";

        const formattedMonth = headerData.inv_month
          ? headerData.inv_month.toString().padStart(2, "0")
          : "";

        setFormData({
          wc_no: headerData.wc_no || "",
          inv_date: formattedInvDate,
          inv_month: formattedMonth,
          file_name: headerData.file_name || "",
          rows: rows.map((r) => ({
            rec_id: r.rec_id,
            it_code: r.it_code,
            batch_no: r.batch_no,
            batch_date: r.batch_date,
            make: r.make,
            qty: r.qty,
            uom: r.um_code,
            it_name: r.it_name,
          })),
        });
      }

      setFocusedRowIndex(0);

      if (btnClicked === "Query") {
        setTotalRecordCount(count || 0);
      }
    },
    [formStatus, currentRecordNo]
  );

  const handlePrepareUpload = () => {
  try {
    if (!["Update"].includes(formStatus)) {
      toast.error("Allowed only in UPDATE mode!");
      return;
    }

    if (!formData.wc_id || !formData.inv_date || !formData.inv_month || formData.rows.length === 0) {
      toast.error("Fill Work Center Inv Date & Month and ensure rows are loaded!");
      return;
    }

    // Collect full data from UI
    const collectedData = {
      inv_month: formData.inv_month,
      inv_date: formData.inv_date,
      wc_id: formData.wc_id,
      trans_year: user.global_fin_year,  // From user
      file_name: formData.file_name,
      rows: formData.rows.map(row => ({
        rec_id: row.rec_id,
        it_code: row.it_code,
        qty: row.qty,
        batch_no: row.batch_no,
        make: row.make,
        batch_date: row.batch_date,  // Assume formatted
        it_name:row.it_name,
        uom:row.uom,
      })),
    };

    setFormData(prev => ({ ...prev, uploadData: collectedData })); 

    toast.success(`Data prepared: ${collectedData.rows.length} rows ready. Click Save to insert into main tables.`);
  } catch (err) {
    toast.error("Error preparing data");
    console.error(err);
  }
};

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (!["Update"].includes(formStatus)) return;

        if (!formData.uploadData) {
          toast.error("Prepare data first by clicking 'Upload Into Main Table'!");
          return;
        }

        const payload = formData.uploadData;  // Full collected data

        const method = formStatus === "Update" ? "POST" : "PUT";
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UPLOAD_PHY_INV_FORM_DATA}?form_status=${formStatus}`,
          {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );

        const result = await response.json();

        if (result.success) {
          toast.success(`${result.insertedRows || 0} rows inserted into main tables! Data saved successfully.`);
          formCleanup();  // Reset, including uploadData: null
        } else {
          toast.error(result.message || "Failed to insert data! Check errors and try again.");  // Handle backend errors
        }
      } catch (error) {
        console.error("Insert Error:", error);
        toast.error("Something went wrong while inserting data.");
      }
      };

  return (
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
      handleOffset={handleOffset}
      QUERY_API={APP_PROD_API.GET_UPLOAD_PHY_INV_FORM_DATA}
      formName={"Update Physical Inventory"}
      // opterationBtn={[{ name: "Upload Into main table", disabled: isUploadButtonDisabled }]}
      opterationBtn={[
    { 
      name: "Upload Into main table", 
      disabled: isUploadButtonDisabled || formData.uploadData, 
      onClick: handlePrepareUpload 
    }
  ]}
      btnEnableDtl={{ insert: false, search: false }}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <UploadPhysicalInventoryHeader
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            formStatus={formStatus}
            focusedRowIndex={focusedRowIndex}
            setFocusedRowIndex={setFocusedRowIndex}
            triggerAddRow={triggerAddRow}
            opngMnth={opngMnth}
            handleHelpList={handleHelpList}
            setHelpFor={setHelpFor}
            setHelpListHeader={setHelpListHeader}
            user={user}
            handleValidationError={handleValidationError}
          />
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UPLOAD_PHY_INV_FORM_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                />
              </ModalBody>
            </Modal>
          )}
          {confirmationModal && (
            <ConfirmationModal
              isOpen={confirmationModal}
              onClose={() => {
                setConfirmationConfig({});
                setConfirmationModal(false);
              }}
              {...confirmationConfig}
            />
          )}
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default UploadPhysicalInventory;