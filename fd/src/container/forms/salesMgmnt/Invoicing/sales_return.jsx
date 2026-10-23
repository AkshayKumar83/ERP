import React, { useEffect } from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from 'reactstrap';

import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import SaleReturnHdr from './sale_return_hdr';
import SaleReturnDtl from './sale_return_dtl';
import HelpList from "../../../../components/HelpList";

import { APP_PROD_API } from '../../../../utils/api';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { createSrchPayloadSaleReturn } from './sale_return_helper';
import { fetchAppData } from '../../../../utils/fetchUtils';



const SalesReturn = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [detailData, setDetailData] = useState([{}])
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
    setSearchQuery } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
 const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
 const [deletedDetails, setDeletedDetails] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const tabs = ["Sale Return"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


const COMPANY_STATE_CODE = "06";

const fetchGSTDetails = async (it_code, rowIndex) => {
  try {
    //  validation
    if (!formData?.c_code || !user?.global_division_id || !user?.global_fin_year) {
      alert("Please select customer first");
      return;
    }

    //  query params URL me add karo
    const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_GST_SALE_RETURN_FORM}?it_code=${it_code}&c_code=${formData.c_code}&division_id=${user.global_division_id}&trans_year=${user.global_fin_year}&inv_id=${formData.inv_id}`;

    const res = await fetch(url);

    const data = await res.json(); //  correct

    setDetailData((prev) => {
      const updated = [...prev];

      updated[rowIndex] = {
        ...updated[rowIndex],
        hsn_code: data.hsn_sac_code || "",
        sgst_perc: data.sgst || 0,
        cgst_perc: data.cgst || 0,
        igst_perc: data.igst || 0,
        discount_val: data.discount_val || 0, 
      };

    const qty = Number(updated[rowIndex].return_qty) || 0;
    const rate = Number(updated[rowIndex].rate) || 0;

    const basic = qty * rate;

    const cgst = (basic * Number(updated[rowIndex].cgst_perc || 0)) / 100;
    const sgst = (basic * Number(updated[rowIndex].sgst_perc || 0)) / 100;
    const igst = (basic * Number(updated[rowIndex].igst_perc || 0)) / 100;

    const discount = Number(updated[rowIndex].discount_val || 0);

    updated[rowIndex].basic_val = basic.toFixed(2);
    updated[rowIndex].cgst_val = cgst.toFixed(2);
    updated[rowIndex].sgst_val = sgst.toFixed(2);
    updated[rowIndex].igst_val = igst.toFixed(2);

    updated[rowIndex].net_val = ( basic + cgst + sgst + igst - discount ).toFixed(2);

      return updated;

    });

  } catch (err) {
    console.error("GST fetch error", err);
  }
};

    const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };



  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    // ----------------------  WC NO SELECTION ----------------------
    case "cCode":
       const flag =
    data.state_code === COMPANY_STATE_CODE ? "R" : "I";

      setFormData((prev) => ({
        ...prev,
        c_code: data.c_code,
        c_name: data.c_name,
        c_state: data.c_state,
        state_code:data.state_code,
        address:data.address,
         flag: flag,
      }));
      break;

    case "Invoice":
      setFormData((prev) => ({
        ...prev,
        inv_no: data.inv_no,
        inv_id: data.inv_id,
      
      }));
      break;
    case "Sale":
      setFormData((prev) => ({
        ...prev,
        sale_ac_head: data.acc_no,
        sale_ac_desc: data.acc_desc,
      
      }));
      break;
    case "DB":
      setFormData((prev) => ({
        ...prev,
       debit_acc_code: data.acc_no,
      debit_acc_desc: data.acc_desc,
      
      
      }));
      break;


//     case "Item":
//   setDetailData((prev) => {
//     //  check duplicate (except current row)
//     const isDuplicate = prev.some(
//       (row, index) =>
//         row.it_code === data.it_code && index !== selectedRowIndex
//     );

//     if (isDuplicate) {
//       toast.error("Item already selected in another row ");
//       return prev; // \ update mat karo
//     }

//     const updated = [...prev];

//    updated[selectedRowIndex] = {
//   ...updated[selectedRowIndex],
//   it_code: data.it_code,
//   it_name: data.it_name,

//   _status:
//     formStatus === "Update" &&
//     updated[selectedRowIndex]._status === "old"
//       ? "update"
//       : updated[selectedRowIndex]._status,
// };

//     return updated;
//   });
//     //  GST CALL
//   fetchGSTDetails(data.it_code, selectedRowIndex);

//   break;


case "Item":

  const isDuplicate = detailData.some(
    (row, index) =>
      row.it_code === data.it_code && index !== selectedRowIndex
  );

  const isDeletedDuplicate = deletedDetails.some(
    (row) => row.it_code === data.it_code
  );

  if (isDuplicate) {
    toast.error("Item already selected in another row");
    return;
  }

  if (isDeletedDuplicate) {
    toast.error("This item is already marked for delete");
    return;
  }

  setDetailData((prev) => {
    const updated = [...prev];

    updated[selectedRowIndex] = {
      ...updated[selectedRowIndex],
      it_code: data.it_code,
      it_name: data.it_name,
    };

    return updated;
  });

  //  safe call
  fetchGSTDetails(data.it_code, selectedRowIndex);

  break;
    // ----------------------  DEFAULT ----------------------
    default:
      console.warn("Unhandled help type:", helpFor);
      break;
  }

  toggleHelpModal();
};




const handleSubmit = async (e) => {
  e.preventDefault();
  if (!["Insert", "Update"].includes(formStatus)) return;

  const phyInv = validateForm("sale-hdr", "Sale Return");
  const phyInvdtl = validateForm("sale-item", "Sale Return");

  if (!phyInv || !phyInvdtl) return;

 // ❗ empty rows remove
  const filteredDetails = detailData.filter(
    (row) => row.it_code && row.return_qty && row.rate
  );

  if (filteredDetails.length === 0) {
    toast.error("Please add at least one item");
    return;
  }

  // //  HEADER (NO return_id)
  const header = {
    ...formData,
    trans_year:user?.global_fin_year,
    division_id:user?.global_division_id,

    create_id: user?.id,
  
    return_id: null,   // backend generate karega
    return_no: null,   // agar auto hai


  };

  //  DETAILS (NO return_id)
  const details = filteredDetails.map((row) => ({
    it_code: row.it_code,

    return_qty: Number(row.return_qty) || 0,
    rate: Number(row.rate) || 0,

    basic_val: Number(row.basic_val) || 0,
    discount_val: Number(row.discount_val) || 0,

    igst_perc: Number(row.igst_perc) || 0,
    cgst_perc: Number(row.cgst_perc) || 0,
    sgst_perc: Number(row.sgst_perc) || 0,

    igst_val: Number(row.igst_val) || 0,
    cgst_val: Number(row.cgst_val) || 0,
    sgst_val: Number(row.sgst_val) || 0,

    net_val: Number(row.net_val) || 0,

    create_id: user?.id,
  


  }));


let payload = {};

if (formStatus === "Insert") {
  payload = {
    header,
    details,
  };
} else {
  // 🔥 UPDATE MODE

  // ❗ sirf valid rows (same as insert)
  const validDetails = detailData.filter(
    (row) => row.it_code && row.return_qty && row.rate
  );

  // ✅ INSERTED
  const inserted = validDetails
    .filter((row) => row._status === "new")
    .map((row) => ({
         return_id: formData.return_id,
      it_code: row.it_code,
      return_qty: Number(row.return_qty) || 0,
      rate: Number(row.rate) || 0,
      basic_val: Number(row.basic_val) || 0,
      discount_val: Number(row.discount_val) || 0,

      igst_perc: Number(row.igst_perc) || 0,
      cgst_perc: Number(row.cgst_perc) || 0,
      sgst_perc: Number(row.sgst_perc) || 0,

      igst_val: Number(row.igst_val) || 0,
      cgst_val: Number(row.cgst_val) || 0,
      sgst_val: Number(row.sgst_val) || 0,

      net_val: Number(row.net_val) || 0,
      create_id: user?.id,
    }));

  // ✅ UPDATED
  const updated = validDetails
    .filter((row) => row._status === "update")
    .map((row) => ({
      it_code: row.it_code,
      old_it_code: row.old_it_code, // 🔥 important

      return_qty: Number(row.return_qty) || 0,
      rate: Number(row.rate) || 0,
      basic_val: Number(row.basic_val) || 0,
      discount_val: Number(row.discount_val) || 0,

      igst_perc: Number(row.igst_perc) || 0,
      cgst_perc: Number(row.cgst_perc) || 0,
      sgst_perc: Number(row.sgst_perc) || 0,

      igst_val: Number(row.igst_val) || 0,
      cgst_val: Number(row.cgst_val) || 0,
      sgst_val: Number(row.sgst_val) || 0,

      net_val: Number(row.net_val) || 0,
      update_id: user?.id,
    }));

  //  DELETED (already stored correctly )
  const deleted = deletedDetails.map((row) => ({
  
 return_id: formData.return_id,  
  it_code: row.it_code,
  old_it_code: row.old_it_code
  }));

  payload = {
    header: {
      ...formData,
      return_id: formData.return_id, // 🔥 must
      update_id: user?.id,           // current logged-in user
    },

    inserted,
    updated,
    deleted,
  };
}

  console.log(" Final Payload:", payload);

  const method = formStatus === "Insert" ? "POST" : "PUT";

  const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_SALE_RETURN_FORM_DATA}?form_status=${formStatus}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    }
  );

  const result = await response.json();

  if (result.success) {
    toast.success(result.message || "Data saved successfully!");
    handleCancel();
  } else {
    toast.error(result.message || "Failed to save data.");
  }
};

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
    setDetailData([{}]);
    setDeletedDetails([])
  }, []);

 

useEffect(() => {
  let totalBasic = 0;

  detailData.forEach((row) => {
    totalBasic += Number(row.basic_val) || 0;
  });

  setFormData((prev) => ({
    ...prev,
    t_basic_val: totalBasic.toFixed(2),
  }));
}, [detailData]);


useEffect(() => {
  let totalBasic = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalDiscount = 0;

  detailData.forEach((row) => {
    const basic = Number(row.basic_val) || 0;

    const cgst = (basic * Number(row.cgst_perc || 0)) / 100;
    const sgst = (basic * Number(row.sgst_perc || 0)) / 100;
    const igst = (basic * Number(row.igst_perc || 0)) / 100;

    totalBasic += basic;
    totalCGST += cgst;
    totalSGST += sgst;
    totalIGST += igst;
    totalDiscount += Number(row.discount_val || 0);
  });

  const net =
    totalBasic +
    totalCGST +
    totalSGST +
    totalIGST -
    totalDiscount;

  setFormData((prev) => ({
    ...prev,
    t_basic_val: totalBasic.toFixed(2),
    t_cgst_val: totalCGST.toFixed(2),
    t_sgst_val: totalSGST.toFixed(2),
    t_igst_val: totalIGST.toFixed(2),
    t_discount_val: totalDiscount.toFixed(2),
    t_net_val: net.toFixed(2),
  }));
}, [detailData]);


const handleChange = useCallback((name, value, rowIndex = null, event = null) => {
  if (!["Insert", "Search", "Update"].includes(formStatus)) return;

  const cursorPos = event?.target?.selectionStart;

    if (["c_code", "inv_no","sale_ac_head",'debit_acc_code','it_code'].includes(name)) {
    toast.error("Please select value from Help List (double click)");
    return;
  }

  let updatedValue =
    typeof value === "string"
      ? value.toUpperCase()
      : value;

if (["rate", "return_qty"].includes(name)) {
  if (updatedValue === "" || updatedValue === null) {
    // allow empty
  } else {
    const regex = /^\d*\.?\d{0,2}$/;

    // ❌ block mat karo
    if (!regex.test(updatedValue)) {
      // just skip calculation, don't return
    } else {
      const numValue = Number(updatedValue);

      if (numValue <= 0) {
        // optional: skip calculation
      }
    }
  }
}

if (rowIndex !== null) {
  setDetailData((prev) => {
    const updated = [...prev];

    let row = updated[rowIndex];

    updated[rowIndex] = {
      ...row,
      [name]: updatedValue,

      // 🔥 only set update if old
      _status:
        formStatus === "Update" && row._status === "old"
          ? "update"
          : row._status,
    };

    // calculation
    // if (["return_qty", "rate"].includes(name)) {
    //   const qty = Number(updated[rowIndex].return_qty) || 0;
    //   const rate = Number(updated[rowIndex].rate) || 0;
    //   updated[rowIndex].basic_val = (qty * rate).toFixed(2);
    // }

    if ( [ "return_qty", "rate", "cgst_perc", "sgst_perc", "igst_perc", "discount_val",].includes(name)
  ) {
  const qty = Number(updated[rowIndex].return_qty) || 0;
  const rate = Number(updated[rowIndex].rate) || 0;

  const basic = qty * rate;

  const cgstPerc = Number(updated[rowIndex].cgst_perc) || 0;
  const sgstPerc = Number(updated[rowIndex].sgst_perc) || 0;
  const igstPerc = Number(updated[rowIndex].igst_perc) || 0;

  const discount = Number(updated[rowIndex].discount_val) || 0;

  const cgst = (basic * cgstPerc) / 100;
  const sgst = (basic * sgstPerc) / 100;
  const igst = (basic * igstPerc) / 100;

  const net = basic + cgst + sgst + igst - discount;

  updated[rowIndex].basic_val = basic.toFixed(2);

  updated[rowIndex].cgst_val = cgst.toFixed(2);
  updated[rowIndex].sgst_val = sgst.toFixed(2);
  updated[rowIndex].igst_val = igst.toFixed(2);

  updated[rowIndex].net_val = net.toFixed(2);
}

    return updated;
  });
}
else {
    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  }

  //  cursor restore
  if (event && cursorPos !== null) {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }
}, [formStatus]);

const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (!queryData) return;
    const { type, headerData, detailData, count } = queryData;

    if (type === "not_found") {
      toast.error(queryData.message || "No Data Found");
      handleCancel();
      return;
    }

    if (headerData) {
      setFormData({
        ...headerData,
        return_dt: dateFormatter(headerData.return_dt),
      
      });
    }

    if (Array.isArray(detailData) && detailData.length > 0) {
 setDetailData(detailData.map(row => ({
  ...row,
  _status: "old" ,
  old_it_code:row.it_code
})));
  setFocusedRowIndex(0);
} else {
  setDetailData([{}]);
}

   
    

    if (btnClicked === "Query") setTotalRecordCount(count || 0);
  },
  [formStatus, currentRecordNo]
);

const triggerAddRow = useCallback(() => {
  const phyInv = validateForm("sale-hdr", "Sale Return");
  if (!phyInv) return;

  const phyInvdtl = validateForm("sale-item", "Sale Return");
  if (!phyInvdtl) return;

  setDetailData((prev) => {
    const newIndex = prev.length; // 🔥 correct index

    setFocusedRowIndex(newIndex); // ✅ yahin set karo

    return [...prev, { _status: "new" }];
  });
}, []);




const handleDelete = useCallback((rowIndex) => {
  setDetailData((prev) => {
    const updated = [...prev];
    const row = updated[rowIndex];

    // delete tracking
    if (formStatus === "Update" && row._status !== "new") {
      setDeletedDetails((prevDel) => [...prevDel, row]);
    }

    updated.splice(rowIndex, 1);

    const newData = updated.length ? updated : [{}];

    // 🔥 focus logic
    const newIndex =
      rowIndex > 0 ? rowIndex - 1 : 0;

    setFocusedRowIndex(newIndex);

    return newData;
  });
}, [formStatus]);

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSrchPayloadSaleReturn(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_SALE_RETURN_FORM}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
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

    const handleAuthSaleReturn = async () => {
    const {
        return_id, auth_flag
    } = formData;
    const { id } = user;

    if (auth_flag === "Y") {
      alert("Sale Return has been already Posted, no modifications possible.");
      return;
    }

    if (formData?.auth_flag === "N") {
      if (confirm("Do you want to Authorise this Sale Return")) {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_SALE_RETURN
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              saleReturnData: {
                id,
                auth_flag: "Y",
                division_id: user?.global_division_id,
                trans_year: user?.global_fin_year,
                return_id
              },
            }),
            credentials: "include",
          },
        );
        if (response.ok) {
          const result = await response.json();
          toast.success(result?.message);
          setFormData((prev) => ({
            ...prev,
            auth_flag: "Y",
            voucher_no:result?.voucher_no
            // voucher_dt: DateTime.fromISO(result?.voucher_dt).toFormat("yyyy-MM-dd"),
            // voucher_no: result?.voucher_no,
          }));
        } else {
          const result = await response.json();
          toast.error(result?.message);
        }
      }
    }
  };


//console.log('formStatus from memberform', formStatus)
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
        QUERY_API={APP_PROD_API.GET_DATA_FOR_SALE_RETURN_FORM}
        formName={"Sale Return"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{searchQuery}}
        setSearchQuery={setSearchQuery}
        handleAuthRecord={handleAuthSaleReturn}
         authority={{
          insert: 'Y',
          update: formData?.auth_flag === 'Y' || formData?.cancel_flag === 'Y' ? 'N' : 'Y',
          message:
            formData?.auth_flag === 'Y'
              ? 'Sale Return has been already authorized, no modifications possible.'
              : formData?.cancel_flag === 'Y'
              ? 'Sale Return has been Cancelled, no modifications possible.'
              : '',
        }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id='sale-hdr'>
              <SaleReturnHdr 
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
               handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                setFormData={setFormData}
              />
              </Form>
              <SaleReturnDtl 
              formData={formData}
              detailData={detailData}
              setDetailData={setDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              focusedRowIndex ={focusedRowIndex} 
              setFocusedRowIndex ={setFocusedRowIndex}
              handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                handleDelete ={handleDelete}
                triggerAddRow={triggerAddRow}

              />
                {helpList && (
                            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                              <ModalBody>
                                <HelpList
                                  formStatus={formStatus}
                                  helpFor={helpFor}
                                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_SALE_RETURN_FORM}`}
                                  helpListHeader={helpListHeader}
                                  handleHelpList={handleHelpList}
                                  onSelectHelpItem={onSelectHelpItem}
                                  queryPera={{ needAppGlobalData: 'Y' }}
                                 whereClause={{...(helpFor === "Invoice" && { c_code: formData?.c_code }),
                                                  ...(helpFor === "Item" && { inv_id: formData?.inv_id }) 
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

export default SalesReturn;

