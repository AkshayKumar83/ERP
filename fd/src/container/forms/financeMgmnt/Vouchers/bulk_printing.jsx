

import React, { useEffect } from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import BulkPrintingHdr from './bulk_printing_hdr';
import { validateForm } from '../../../../utils/fn';
import { HELP_LIST_CONFIG, RADIO_CONFIG } from './bulk_printing_helper';
import HelpList from '../../../../components/HelpList';
import Loader from '../../../../components/GenricComponents/Loader';

const BulkPrinting = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [formHeader, setFormHeader] = useState({
  selection: "",
  Voucher: "",
  Invoice: "",
  PO: "",
  from: "",
  to: "",
  from_date: "",
  to_date: "",
  search_by: "V", // V=Voucher Range, D=Date Range
});
const [showTable, setShowTable] = useState(false);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [deletedRecords, setDeletedRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [loading, setLoading] = useState(false);


  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

  const tabs = ["Bulk Printing"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

const resetRange = () => {
  setFormHeader((prev) => ({
    ...prev,
    from: "",
    to: "",
    from_date: "",
    to_date: "",
    search_by: "V",
  }));
   setFormData([]); 
  setShowTable(false);
};

useEffect(() => {
  resetRange();
}, [
  formHeader.selection,
  formHeader.Voucher,
  formHeader.Invoice,
  formHeader.PO,
]);

const buildQueryParams = () => {
  const type = formHeader.selection;

  const TYPE_MAP = {
    V: { key: "voucher_type", field: "Voucher" },
    I: { key: "invoice_type", field: "Invoice" },
    P: { key: "po_type", field: "PO" },
  };

  const config = TYPE_MAP[type];

  const params = new URLSearchParams();

  params.append("doc_type", type);
  params.append(config.key, formHeader[config.field]);
  params.append("trans_year", user?.global_fin_year || "");

  // PE Special Case
  if (
    formHeader.selection === "V" &&
    formHeader.Voucher === "PE"
  ) {
    params.append("search_by", formHeader.search_by);

    if (formHeader.search_by === "D") {
      params.append("from_date", formHeader.from_date || "");
      params.append("to_date", formHeader.to_date || "");
    } else {
      params.append("from_no", formHeader.from || "");
      params.append("to_no", formHeader.to || "");
    }
  } else {
    params.append("from_no", formHeader.from || "");
    params.append("to_no", formHeader.to || "");
  }

  return params.toString();
};

const PO_STATUS_MAP = {
  N: "Unauthorized",
  Y: "Prepared",
  A: "Checked",
  F: "Authorized", 
};

const handleGo = async () => {
  try {
    if (!formHeader.selection) {
  toast.error("Select Type First");
  return;
}

  const type = formHeader.selection;
    const subTypeField = RADIO_CONFIG[type]?.name;

    if (subTypeField && !formHeader[subTypeField]) {
      toast.error(`Select ${subTypeField} Type`);
      return;
    }

      const unitMaster = validateForm("bulk-printing", "Bulk Printing");
      if (!unitMaster) return;

    const query = buildQueryParams();

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BULK_PRINTING_DATA}?${query}`
    );

const response = await res.json();

const data = response.data || [];
const count = response.count || 0;

if (data.length > 0) {

  const updatedData = data.map((item) => ({
    ...item,
    print: "Y",
    flag:
      formHeader.selection === "P"
        ? PO_STATUS_MAP[item.flag] || item.flag
        : item.flag,
  }));

  setFormData(updatedData);
  setTotalRecordCount(count);   
  setShowTable(true);
  setFocusedRowIndex(0);

} else {
  toast.error("No Data Found");
  setShowTable(false);
}

  } catch (err) {
    console.error(err);
    setShowTable(false);
  }
};

const handleSubmit = useCallback(() => {
    // Implement submit logic here
    formCleanup()
}, [formData, formHeader]);


  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData([]);
    setFormHeader({
      selection: "",
      Voucher: "",
      Invoice: "",
      PO: "",
      from: "",
      to: "",
      from_date: "",
      to_date: "",
    });
    setShowTable(false);
    releaseFormStatus()
  }


      // Shows the Help list
      const handleHelpList = (show) => {
          setHelpList(show);
      };
  
  //  const onSelectHelpItem = async(data) => {
  //         setFormHeader((prev) => {
  //           switch (helpFor) {
  //            case "From":
  //           return { ...prev, from: data.voucher_no };

  //        case "To":
  //          return { ...prev, to: data.voucher_no };
  
  //                default:
  //               return prev;
  //           }
  //         });
  //       };

  const onSelectHelpItem = (data) => {
  const type = formHeader.selection;
  const subTypeName = RADIO_CONFIG[type]?.name;
  const subTypeValue = formHeader[subTypeName];

  //  dynamic key nikalo config se
  const key =
    HELP_LIST_CONFIG[type]?.[subTypeValue]?.[0]?.key;

  const value = data[key];

  setFormHeader((prev) => ({
    ...prev,
    [helpFor.toLowerCase()]: value,
  }));
};



const handleChange = useCallback(
  (name, value, index = null, event, source = "table") => {

    // HEADER CHANGE
    if (source === "header") {
      setFormHeader((prev) => ({
        ...prev,
        [name]:
          event?.target?.type === "checkbox"
            ? value
            : (value || "").toUpperCase(),
      }));
      return;
    }

    //  TABLE CHANGE
    setFormData((prevData) => {
      if (!Array.isArray(prevData)) return [{}];

      const newData = [...prevData];

      const updatedRow = {
        ...newData[index],
        [name]:
          event?.target?.type === "checkbox"
            ? value
            : event?.target?.type === "number"
            ? value
            : (value || "").toUpperCase(),
      };

      newData[index] = updatedRow;
      return newData;
    });

  },
  []
);
 


const setupQueryData = useCallback((queryData, btnClicked) => {
}, []);

// const handleBulkPrint = async () => {
//   try {
//     //  selected rows filter karo
//     const selectedRows = formData.filter(
//       (item) => item.print === "Y"
//     );

//     if (selectedRows.length === 0) {
//       toast.error("Select at least one record to print");
//       return;
//     }

//     console.log("PRINT PAYLOAD:", selectedRows);

//     //  API call
//     const res = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BULK_PRINT_ROW_DATA}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           printRows: selectedRows,
//         }),
//       }
//     );

//     const response = await res.json();

//     if (res.ok) {
//       toast.success("Print request sent successfully");
//     } else {
//       toast.error(response.message || "Print failed");
//     }

//   } catch (error) {
//     console.error(error);
//     toast.error("Something went wrong");
//   }
// };

 
const handleBulkPrint = async () => {
  try {
    const selectedRows = formData.filter((item) => item.print === "Y");

    if (selectedRows.length === 0) {
      toast.error("Select at least one record to print");
      return;
    }
     setLoading(true); 

    console.log("PRINT PAYLOAD:", selectedRows);

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BULK_PRINT_ROW_DATA}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printRows: selectedRows,
            doc_type: formHeader.selection,
         }),
      }
    );

    if (!res.ok) {
      // backend returned JSON error, parse it
      const errData = await res.json();
      toast.error(errData.error || errData.message || "Print failed");
      return;
    }

    // Response is a PDF blob, not JSON
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // Open PDF in new tab
    window.open(url, "_blank");

    // Optionally also trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_print.pdf";
    a.click();
     setLoading(false);  

    // Cleanup URL after use
    window.URL.revokeObjectURL(url);

    toast.success("PDF generated successfully");
    handleCancel(); // Reset form after printing  
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  
   } finally {
     setLoading(false);  
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
        QUERY_API={APP_PROD_API}
      formName={"Bulk Printing"}
        // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
         btnEnableDtl={{query:false,insert:false, update:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id='bulk-printing'>
              {loading && <Loader overlayContainer />}
                <BulkPrintingHdr
                 formHeader={formHeader}
                setFormHeader={setFormHeader}
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
                 showTable={showTable}
                handleGo={handleGo}
               handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              totalRecordCount={totalRecordCount}
              handleBulkPrint={handleBulkPrint}
                />
                </Form>
                   {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={"Insert"}
                      helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BULK_PRINT_HELP_DATA}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{needAppGlobalData:'Y'}} 
                     whereClause={{
                      type: formHeader.selection,
                      subType: formHeader[RADIO_CONFIG[formHeader.selection]?.name],
                    }}
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

export default BulkPrinting;

