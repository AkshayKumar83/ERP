import React from "react";
import { TabContent, TabPane, Modal, ModalHeader, ModalBody } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import {
  bankHelpListHdr,
  commodityHelpListHdr,
  daIdHelpListHdr,
  divertInvNoHelpListHdr,
  divertOrderNoHelpListHdr,
  docIdHelpListHdr,
  formControlInitDataTempate,
  invBottomBtn,
  itemCodeHelpList,
  mhsminvInitDataTemplate,
  onAccBillInitData,
  orderIdHelpListHdr,
  rejGpIdHelpListHdr,
  rmgpNoHelpListHdr,
} from "./normal_invoice_helper";
import NormalInvMain from "./normal_invoice_main";
import NormalInvDespatch from "./normal_invoice_despatch";
import NormalInvPayment from "./normal_invoice_payment";
import NormalInvItems from "./normal_invoice_items";
import InvoiceQrCode from "./print_invoice_qr_code";
import NormalInvDDN from "./normal_invoice_ddn";
import NormalInvoiceOnAccBill from "./normal_invoice_onAccBill";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import toast from "react-hot-toast";
import Loader from "../../../../components/GenricComponents/Loader";
import { useDispatch, useSelector } from "react-redux";
import { selectLoader } from "../../../../features/loader/loaderSlice";
import HelpList from "../../../../components/HelpList";
import { formatDateForInput, getLocalDateTime } from "../../../../utils/fn";
import { v4 as uuidv4 } from 'uuid';

const NormalInvoicing = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...mhsminvInitDataTemplate });
  const [formDetailData, setFormDetailData] = useState([{}]);
  const [onAccBillData, setOnAccBillData] = useState([
    { ...onAccBillInitData },
  ]);

  const [itemFocusedRowIndex, setItemFocusedRowIndex] = useState(0); //

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const [formTempData, setFormTempData] = useState({
    ...formControlInitDataTempate,
  });

  const [tabs, setTabs] = useState(["Main Info"]);
  const [currentFormTab, setCurrentFormTab] = useState("Main Info"); // Default tab-> on first time render

  const [updatedButtons, setUpdatedButtons] = useState(invBottomBtn);

  // helplist related states
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("c_code");

  const formLoading = useSelector(selectLoader("form"));
  const dispatch = useDispatch();

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // for dropdownData

  const [division, setDivision] = useState([]);
  const [invType, setInvType] = useState([]);
  const [docType, setDocType] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [despatch, setDespatch] = useState([]);
  const [preInv, setPreInv] = useState([]);
  const [paymentTerm, setPaymentTerm] = useState([]);
  const [storage, setStorage] = useState([]);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_NORMAL_INVOICE_DROPDOWNDATA
          }?p_rep_id=${formData?.p_rep_id}&division_id=${
            user?.global_division_id
          }&formSataus=${formStatus}`
        );
        if (response.status === 200) {
          const data = await response.json();
          setDivision([
            { value: "", label: "" },
            ...formatOptions(data.division || [], "division_id", "name"),
          ]);
          setInvType([
            { value: "", label: "" },
            ...formatOptions(data.invType || [], "doc_type", "da_cat_desc"),
          ]);
          setDocType([
            { value: "", label: "" },
            ...formatOptions(data.docType || [], "prefix", "description"),
          ]);
          setCurrency([
            { value: "", label: "" },
            ...formatOptions(data.currency || [],  "curr_code", "curr_desc"),
          ]);
          setDespatch([
            { value: "", label: "" },
            ...formatOptions(data.despatch || [], "c_code", "name"),
          ]);
          setPreInv([
            { value: "", label: "" },
            ...formatOptions(data.preInv || [], "pre_id", "pre_inv_no"),
          ]);
          setPaymentTerm([
            { value: "", label: "" },
            ...formatOptions(data.paymentTerm || [], "pmt_terms", "term_desc"),
          ]);
          setStorage([
            { value: "", label: "" },
            ...formatOptions(data.storage || [], "code", "description"),
          ]);

          if (formStatus == "Insert") {
            const { despatch_fr, p_rep_id, parm_dive_gst_state_code } = data;
            setFormData((prev) => ({
              ...prev,
              despatch_fr,
              p_rep_id,
              parm_dive_gst_state_code,
              division_id: user?.global_division_id,
              prep_dt: getLocalDateTime(),
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  // WHEN PRINT BUTTON CLICKED AT TOOLBAR
  const [isPrintInvQRModelOpen, setIsPrintInvQRModelOpen] = useState(false);
  const togglePrintInvQRModal = () =>
    setIsPrintInvQRModelOpen(!isPrintInvQRModelOpen);

  // ## Helplist Related Logics
  const toggleHelpModal = () => setHelpList(!helpList);

  const getHelpListHeaders = () => {
    if (helpFor === "doc_no") {
      if (formTempData?.doc_no_helplist == "divert_order_no") {
        return divertOrderNoHelpListHdr;
      } else if (formTempData?.doc_no_helplist == "da_id") {
        return daIdHelpListHdr;
      } else if (formTempData?.doc_no_helplist == "order_id") {
        return orderIdHelpListHdr;
      } else if (formTempData?.doc_no_helplist == "rej_gp_id") {
        return rejGpIdHelpListHdr;
      } else if (formTempData?.doc_no_helplist == "doc_id") {
        return docIdHelpListHdr;
      }
      return divertOrderNoHelpListHdr;
    } else if (helpFor == "divert_inv_no") {
      return divertInvNoHelpListHdr;
    }else if (helpFor == "rmgp_no") {
      return rmgpNoHelpListHdr;
    }else if(helpFor == 'commodity'){
      return commodityHelpListHdr
    }else if(helpFor == 'bank_code'){
      return bankHelpListHdr
    }else if(helpFor == 'it_code'){
      return itemCodeHelpList
    }
    // if (helpFor === "it_code") {
    //   return itemCodeHelpList;
    // }
    // if (helpFor === "sale_ac_head") {
    //   return salesPersonHelpList;
    // }
    return [];
  };

  const handleHelpList = (data, htmlFor, focusedRowIndex = 0) => {
    setHelpList(data);
    setHelpFor(htmlFor);
    if (focusedRowIndex) {
      setItemFocusedRowIndex(focusedRowIndex);
    }
  };

  const onSelectHelpItem = async (data) => {
    //switch case for helpFor
    //console.log("selected item from helplist", data);
    switch (helpFor) {
      case "doc_no":
        {
          let selectedData = {};
          if (formData.doc_type == "V") {
            selectedData = {
              party_code: data?.c_code,
              party_name: data?.c_name,
              doc_no: data?.order_no,
            };
          }

          setFormData((prev) => ({
            ...prev,
            ...selectedData,
          }));
        }
        break;
      case "divert_inv_no":{
        let selectedData = {
          divert_inv_no: data?.inv_no,
          party_name: data?.c_name,

          ...data,
          inv_dt: formatDateForInput(data?.inv_dt)
        };

        setFormData((prev) => ({
          ...prev,
          ...selectedData,
        }));
      }
        break;
      case "commodity":{
        let selectedData = {
          ...data,
        };

        setFormData((prev) => ({
          ...prev,
          ...selectedData,
        }));
      }
        break;

      case "bank_code":{
        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
      }
        break;

      case "it_code":
        setFormDetailData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            it_code: data.it_code,
            it_desc: data.it_name,
            c_code: formData?.party_code ?? "",
          };
          return newData;
        });
        break;
      case "sale_ac_head":
        setFormDetailData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            sale_ac_head: data.acc_no,
            sale_ac_desc: data.acc_desc,
          };
          return newData;
        });
        break;
      default:
        break;
    }
  };

    const handleAddRow = () => {
      setFormDetailData((prevData) => [
        ...prevData,
        { row_id: uuidv4(), },
      ]);
    };

  // SET CURRENT TAB NAME AT TOP
  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // CHANGING TAB
  const handleChangeTab = (getTab) => {
    setTabs([getTab]);
    setCurrentFormTab(getTab);
  };

  function handleSubmit(e) {
    e.preventDefault();

    //console.log("Form submitted", formData);
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({ ...mhsminvInitDataTemplate });
    setFormDetailData([{}])
    
  }, []);

  // const handleChange = ({ tab, index = null, event }) => {
  //   if (!["Insert", "Update", "Search"].includes(formStatus)) {
  //     return;
  //   }
  //   let name = event.target.name;
  //   let value = event.target.value;

  //   //console.log(name, value);

  //   const cursorPosition = event?.target?.selectionStart;
  //   const newVal = value?.toUpperCase?.() ?? value; // Ensure value is uppercased if it's a string

  //   // Update formData and updateFormData if formStatus is "Update"
  //   setFormData((prev) => {
  //     if (formStatus === "Update") {
  //       setUpdateFormData((prevUpdate) => {
  //         return {
  //           ...prevUpdate,
  //           [name]: value,
  //         };
  //       });
  //     }
  //     return {
  //       ...prev,
  //       [name]: newVal,
  //     };
  //   });

  //   // Handle cursor position restoration for text inputs
  //   if (
  //     event?.target &&
  //     event.target.tagName === "INPUT" &&
  //     !["number", "radio", "checkbox", "date", "datetime-local"].includes(
  //       event.target.type
  //     )
  //   ) {
  //     setTimeout(() => {
  //       event.target.setSelectionRange(cursorPosition, cursorPosition);
  //     }, 0);
  //   }
  // };

  const handleChange = (arg) => {
    // Allow both handleChange(e) and handleChange({ tab, event: e })
    const event = arg?.target ? arg : arg.event;
    if (!event) return;

    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    const { name, type, value, checked, tagName } = event.target;

    let newVal;
    switch (type) {
      case "checkbox":
        newVal = checked ? "Y" : "N"; // <-- match your usage
        break;
      case "radio":
        newVal = value;
        break;
      case "number":
        newVal = value === "" ? "" : Number(value);
        break;
      case "date":
      case "datetime-local":
        newVal = value;
        break;
      default:
        newVal = value?.toUpperCase?.() ?? value;
    }

    setFormData((prev) => {
      if (formStatus === "Update") {
        setUpdateFormData((prevUpdate) => ({
          ...prevUpdate,
          [name]: newVal,
        }));
      }
      return {
        ...prev,
        [name]: newVal,
      };
    });

    if (
      tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date", "datetime-local"].includes(type)
    ) {
      const cursorPosition = event?.target?.selectionStart;
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  
  const handleChangeDtl = (e, index) => {
    const {name, value} = e.target
 if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    const cursorPosition = e?.target?.selectionStart;
    const newVal = value?.toUpperCase?.() ?? value; // Ensure value is uppercased if it's a string

    setFormDetailData((prevData) => {
      const newData = [...prevData];
      const existingRow = newData[index] || {};

      // Update the changed field in the item row
      const updatedRow = { ...existingRow, [name]: newVal };

      // Get latest qty and rate after change
      const qty = name === "qty" ? value : existingRow.qty;
      const rate = name === "rate" ? value : existingRow.rate;

      const qtyNum = Number(qty);
      const rateNum = Number(rate);

      // Calculate basic_value if both are valid numbers
      if (!isNaN(qtyNum) && !isNaN(rateNum)) {
        updatedRow.basic_value = (qtyNum * rateNum).toFixed(2);
      }

      newData[index] = updatedRow;

      // If formStatus is "Update", update the corresponding row in updateItemData
      // if (
      //   formStatus === "Update" &&
      //   existingRow.hasOwnProperty("sr_no") &&
      //   existingRow.sr_no !== ""
      // ) {
      //   setUpdateItemData((prevUpdate) => {
      //     const newUpdData = [...prevUpdate];
      //     const existingUpdRow = newUpdData[index] || {};

      //     // Update the specific item row with only the changed fields
      //     newUpdData[index] = {
      //       ...existingUpdRow,
      //       [name]: newVal,
      //       basic_value: updatedRow.basic_value, // Update the calculated value too
      //       assess_value: updatedRow.basic_value, // Assuming assess_value should match basic_value
      //       gst_igst_amt:
      //         updatedRow.gst_igst_val != 0
      //           ? Number(updatedRow.basic_value) * 0.18
      //           : 0,
      //       gst_cgst_amt:
      //         updatedRow.gst_cgst_val != 0
      //           ? Number(updatedRow.basic_value) * 0.09
      //           : 0,
      //       gst_sgst_amt:
      //         updatedRow.gst_sgst_val != 0
      //           ? Number(updatedRow.basic_value) * 0.09
      //           : 0,
      //       sr_no: updatedRow.sr_no, // Preserve sr_no for identification
      //     };

      //     return newUpdData;
      //   });
      // }

      return newData;
    });

    // Handle cursor position restoration for text inputs
    if (
      e?.target &&
      e.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date", "datetime-local"].includes(
        e.target.type
      )
    ) {
      setTimeout(() => {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }



  }

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // Handle failure case
      if (queryData.getCount === 0) {
        toast.error(queryData.message);
        return;
      }

      setFormData(queryData.mhsmInvData);
      setFormDetailData(queryData.mdsmInvData);

      setTotalRecordCount(queryData?.count || totalRecordCount);
    },
    [formStatus, currentRecordNo]
  );

  const renderFormTab = (tab) => {
    switch (tab) {
      case "Main Info": {
        return (
          <NormalInvMain
            formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChange({ tab: "MainTab", event: e })}
            handleChangeTab={handleChangeTab}
            setFormData={setFormData}
            invType={invType}
            docType={docType}
            division={division}
            currency={currency}
            despatch={despatch}
            preInv={preInv}
            formTempData={formTempData}
            setFormTempData={setFormTempData}
            user={user}
            handleHelpList={handleHelpList}
            // onSelectHelpItem={onSelectHelpItem}
          />
        );
      }

      case "Despatch": {
        return (
          <NormalInvDespatch
            formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChange("Despatch", e)}
            handleChangeTab={handleChangeTab}
          />
        );
      }
      case "Payment": {
        return (
          <NormalInvPayment
            formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChange("payment", e)}
            handleChangeTab={handleChangeTab}
            paymentTerm={paymentTerm}
          />
        );
      }
      case "Items": {
        return (
          <NormalInvItems
            // formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChangeDtl("Items", e)}
            handleChangeTab={handleChangeTab}
            itemFormDetail={formDetailData}
            storage={storage}
            handleHelpList={handleHelpList}
            handleAddRow={handleAddRow}
            user = {user}
            formData = {formData}
            formControlData = {formTempData}
            formDetailData = {formDetailData}
            setFormDetailData = {setFormDetailData}
          />
        );
      }
      case "DDN": {
        return (
          <NormalInvDDN
            formData={formData}
            formStatus={formStatus}
            handleChange={(e) => handleChange("DDN", e)}
            handleChangeTab={handleChangeTab}
          />
        );
      }
      case "OnAccBill": {
        return (
          <NormalInvoiceOnAccBill
            formData={onAccBillData}
            formStatus={formStatus}
            handleChange={(e) => handleChange("OnAccBill", e)}
            handleChangeTab={handleChangeTab}
          />
        );
      }
    }
  };

  // Render Bottom Submit Bar Btn Dynamically
  const renderBottomBtn = () => {
    const curntTab = {
      name: `${currentFormTab}`,
      id: `${currentFormTab.toLowerCase()}-btn`,
      color: "secondary",
      disabled: false,
      outline: true,
    };

    function handleClick(e, btn) {
      const simpleBarElement = document.querySelector(
        "#simplebar-container .simplebar-content-wrapper"
      );
      if (simpleBarElement) {
        simpleBarElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Find the index of the clicked button
      const btnIndex = updatedButtons.findIndex((item) => item.id === btn.id);

      if (btnIndex !== -1) {
        const newButtons = [...updatedButtons]; // Create a new array (immutability)
        newButtons[btnIndex] = curntTab; // Update the specific button
        setUpdatedButtons(newButtons); // Update state
      }
      handleChangeTab(btn.name);
    }

    return updatedButtons.map((item) => ({
      ...item,
      onClick: (e) => handleClick(e, item),
    }));
  };

  //console.log("formData", formData);
  //console.log("formControlData", formTempData);

  const buildHelpListWhereClause = (helpFor) => {
    let clause = {};

    if (helpFor === "doc_no") {
      switch (formTempData?.doc_no_helplist) {
        case "divert_order_no":
          clause = {
            use_help_query: formTempData?.doc_no_helplist,
          };
          break;

        case "da_id":
          clause = {
            use_help_query: formTempData?.doc_no_helplist,
            inv_type: formData.inv_type,
            foc: formData.foc,
          };
          break;

        case "order_id":
          clause = {
            use_help_query: formTempData?.doc_no_helplist,
          };
          break;

        case "rej_gp_id":
          clause = {
            use_help_query: formTempData?.doc_no_helplist,
          };
          break;

        default:
          clause = { use_help_query: formTempData?.doc_no_helplist };
      }
    }else if(helpFor == 'commodity'){
      clause = { order_id:formData?.order_id, doc_type:formData?.doc_type }
    }else if(helpFor == 'bank_code'){
      clause = { curr_cd:formData?.curr_cd }
    }

    return clause;
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
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_NORMAL_INVOICE_DATA}
        opterationBtn={renderBottomBtn()}
        handlePrint={() => {
          togglePrintInvQRModal();
        }}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {formLoading && <Loader overlayContainer />}
            {renderFormTab(currentFormTab)}
            {isPrintInvQRModelOpen && (
              <InvoiceQrCode
                formData={formData}
                formStatus={formStatus}
                handleChange={handleChange}
                isPrintInvQRModelOpen={isPrintInvQRModelOpen}
                togglePrintInvQRModal={togglePrintInvQRModal}
              />
            )}
            {helpList && (
              <Modal
                id="help-list-modal"
                isOpen={helpList}
                toggle={toggleHelpModal}
                size="xl"
              >
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_NORMAL_INVOICE_DATA
                    }`}
                    queryPera={{ needAppGlobalData: "Y" }}
                    helpListHeader={getHelpListHeaders()}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    whereClause={buildHelpListWhereClause(helpFor)}
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

export default NormalInvoicing;
