import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, TabContent, TabPane, ModalHeader, ModalBody } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import GateEntryHeader from "./gate_entry_header";
import GateEntryDtl from "./gate_entry_dtl";
import GateEntryCancel from "./gate_entry_cancel";
import {
  calculateItemValues,
  createSrchPayloadGE,
  detailInitialData,
  getGateEntryBottomBtn,
  getGEPrint,
  headerInitialData,
  initialData57F4,
  initialData57F4Qty,
  recalcConvertedQty,
  validateVendorChlnNO,
  calculateGEValue,
  applyTransportGST
} from "./gate_entry_helper";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import HelpList from "../../../../components/HelpList";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { v4 as uuidv4 } from "uuid";
import { validateForm } from "../../../../utils/fn";
import { useLocation } from "react-router-dom";
import { fetchAppData } from "../../../../utils/fetchUtils";

const GateEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [formData, setFormData] = useState({ ...headerInitialData });
  const [detailData, setDetailData] = useState([{ ...detailInitialData }]);
  const [f57Data, setF57Data] = useState([{ ...initialData57F4 }]);
  const [f57QtyData, setF57QtyData] = useState([{ ...initialData57F4Qty }]);
  const [disableFreight, setDisableFreight] = useState(true);

  const [freightMaster,setFreightMaster]=useState(null);

  const updateFormData = useRef({ geHdr: {}, geDtl: [], deletedGe: [] });

  // for help list
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const { user } = useSelector((state) => state.auth);

  const [isCnclModelOpen, setIsCnclModelOpen] = useState(false);
  const toggleCnclModal = () => setIsCnclModelOpen((prev) => !prev);

  // showing generated po_no
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const makeFocusOnTableRow = (rowIndex, row_id) => {
    console.log(rowIndex, row_id);
    const entry = detailData.find((entry) => entry.row_id === row_id);
    setFocusedRowIndex(rowIndex);
  };

  const dispatch = useDispatch();

  const tabs = []; // if using FormSetup tabs

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const docNo = params.get("doc_no");
    const fromTracker = params.get("fromTracker");

    const cameFromTracker = sessionStorage.getItem("fromTrackerNav");

    if (fromTracker === "true" && docNo && cameFromTracker === "true") {
      // flag consume karo taaki refresh par na chale
      sessionStorage.removeItem("fromTrackerNav");
      setFormData((prev) => ({
        ...prev,
        ge_no: docNo,
      }));

      setFormStatus("Search");
    }
  }, []);

  // const autoQueryFromTracker = (docNo) => {

  //   setSearchQuery({ ge_no: docNo });

  //   handleOperation("Search");
  // };

  // useEffect(() => {
  //   if (formStatus === "Search" && formData?.ge_no) {
  //     handleSearch();
  //   }
  // }, [formStatus, formData.ge_no]);

  const updateActiveTab = useCallback((tab) => setActiveTab(tab), []);

  // SETTING USER INSERT logic

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_DRP_DOWN_DATA_GATE_ENTRY
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (response.status === 200) {
          const data = await response.json();

           setFreightMaster(data.freightItem);

          if (formStatus === "Insert") {
            setFormData((prev) => {
              return {
                ...prev,
                ge_date: new Date().toISOString().split("T")[0],
                trans_year: user.global_fin_year,
                division_id: user.global_division_id || 1,
                ge_id: data?.new_ge_id || null,
                ...data?.preInsertData,
                ...data?.storeId,
                wc_id: data?.storeId?.wcIdOther || data?.storeId?.wcId1 || 1,
                inward_control_no: "",
                nInwardCtrlNo: data?.preInsertData?.inward_control_no,
              };
            });

           
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (formStatus && ["Insert", "Query"].includes(formStatus)) {
      fetchConstantList();
    }
  }, [formStatus]);

  // HELP LIST HANDLING
  const handleHelpList = (show) => {
    setHelpList(show);
  };

  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader, index = null) => {
    if (["Insert","Search", "Update"].includes(formStatus)) {
        setFocusedRowIndex(index); 
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
      // setRecordIndex(index);
    }
  };

  // SELECTING ITEM FROM HELPLIST
  const onSelectHelpItem = (data) => {
    let index = focusedRowIndex;

    if (helpFor === "v_code") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "c_code") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "ship_to") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "chln_no"  && formStatus == 'Search') {
      setFormData((prev) => {
        return {
          ...prev,
          // invoice_no: data?.inv_no,
          // invoice_dt: data?.inv_dt,
          chln_no: data?.inv_no,
          // chln_date: data?.inv_dt,
        };
      });
    } else if (helpFor === "cons_no") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "order_no") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "manuf_code") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } else if (helpFor === "c_code") {
      setFormData((prev) => {
        return {
          ...prev,
          ...data,
        };
      });
    } 
    else if (helpFor === "po_no") {
      setDetailData((prevData) => {
        const newData = [...prevData];
        const prevRow = newData[index];
        const updatedRow = {
          ...prevRow,
          qtn_ref: data.qtn_ref,
          po_no: data.po_no,
          po_id: data.po_id,
          po_date: data.po_date,
          po_eff_dt: data.po_eff_dt,
          po_validated: "N",   // added by akshay to track if the po_no is validated or not, default is "N"
        };
        newData[index] = updatedRow;
        
        return newData;
      });
    }
    else if (helpFor === "it_code") {

    setDetailData((prevData) => {

        //  Duplicate check
        const alreadyExists = prevData.some((row, i) =>
            i !== index &&
            row.it_code === data.it_code
        );

        if (alreadyExists) {
            toast.error("This item is already filled.");
            return prevData;
        }

        const newData = [...prevData];
        const prevRow = newData[index];

        const updatedRow = {
            ...prevRow,

            it_code: data.it_code,
            it_name: data.it_name,
            it_pu_um: data.it_pu_um,
            rate_rs: data.po_mat_rat,
            gst_cgst_val: data.gst_cgst_val,
            gst_sgst_val: data.gst_sgst_val,
            gst_igst_val: data.gst_igst_val,
            po_qty_ord: data.po_qty_ord,
            po_no: data.po_no,

            //  hardcoded/default values 
             conversion_factor: 1,
             qty_converted: detailData[index]?.qty_advise || 0,
            // ok_rej: "O",
            // status_flg: "S",
        };

        if(formStatus === "Update"){

    updateFormData.current.geDtl ||= [];

    updateFormData.current.geDtl.push({

        ge_id: updatedRow.ge_id,
        plant_cd: updatedRow.plant_cd || 1,
        po_id: updatedRow.po_id,

        it_code: updatedRow.it_code,
        wc_id: updatedRow.wc_id,
        trans_code:2,
        ok_rej:"O",
        status_flg:"S",
        it_pu_um: updatedRow.it_pu_um,
        um_code: updatedRow.it_pu_um,
        rate_rs: updatedRow.rate_rs,
        basic_val: updatedRow.rate_rs*updatedRow.recd_qty,
        net_val: updatedRow.rate_rs*updatedRow.recd_qty,


        qty_advise: updatedRow.qty_advise || 0,
        qty_recd: updatedRow.recd_qty || 0,
        qty_converted: updatedRow.recd_qty || 0,
        qty_accptd: updatedRow.recd_qty || 0,
        qty_payment: updatedRow.recd_qty || 0,

        cancel_mrir:"N",
        print_mrir:"N",
        print_tag:"Y",
        material_test:"N",
        dimen_test:"N",
        ge_tag_ok:"Y",
        create_id:Number(user.id),
        create_date:new Date().toISOString(),
        mrir_gen_by:Number(user.id),
        inspector_cd:Number(user.id),
        qty_damaged:updatedRow.qty_damaged || 0,

        conversion_factor:1
    });

}

        newData[index] = updatedRow;

        return newData;
    });
}
  };

  async function handleSubmit(e) {
    e.preventDefault();

    let payload = null;
    let method = "POST";

    // Validate Header Form
    const isValidHdrData = validateForm(
      "gate-entry-hdr-form",
      "Gate Entry Header Form",
    );

    if (!isValidHdrData) {
      toast.error("Please fill required header data in Gate Entry");
      return;
    }

const isVendorChallanValid = await validateVendorChlnNO({
  ge_id: formData.ge_id,
  v_code: formData.v_code,
  chln_no: formData.chln_no,
  formStatus,
});

if (!isVendorChallanValid) {
  return;
}

    // Validate Detail Form
    const isValidDetailData = validateForm(
      "gate-entry-dtl-form",
      "Gate Entry Items Detail Form",
    );

    if (!isValidDetailData) {
      toast.error("Please fill required item detail in Gate Entry Detail");
      return;
    }

    // dispatch(setLoader({ key: "form", value: true })); // Start loader
    // Always set payload to avoid undefined

    payload = {
      formHdrData: { ...formData },
      formItemData: [...detailData],
    };

   

    if (formStatus === "Insert") {
      payload = {
        formHdrData: { ...formData },
        formItemData: [...detailData],
      };
    } else if (formStatus === "Update") {
      method = "PUT";
      payload = {
        ge_id: formData.ge_id,
        changedHdrFields: updateFormData.current.geHdr || {},
        changedItemRows: updateFormData.current.geDtl || [],
        deletedItemData: updateFormData.current.deletedGe || [],
      };
    }

    console.log("Form Payload:", payload);

    const confirmMsg = `On clicking submit, the system will save the record and generate the Purchase Voucher.
Please check the Gate Entry thoroughly.

If you want to update the Gate Entry after saving, you will have to cancel the Purchase Voucher.

Do you want to proceed?`;

    if (!window.confirm(confirmMsg)) return;

    console.log("Form Payload:", payload);

    try {
      const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.POST_GATE_ENTRY_POST
      }?form_status=${formStatus}&userId=${user.id}`;

      const response = await fetch(apiUrl, {
        method: formStatus === "Update" ? "PUT" : "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        let responseData = await response.json();
        toast.success("Record saved successfully");

        if (formStatus == "Insert") {
          showGeneratedGeNo(
            responseData?.genGeNo,
            responseData?.genInwardCtrlNo,
          );
        }

        formReset();
      } else {
        let errorMsg = {};
        try {
          errorMsg = await response.json();
        } catch (e) {
          errorMsg.message = "Server error message not found";
        }
        toast.error(errorMsg?.message || "Response error occurred");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.message || "Something went wrong during submission");
    } finally {
    }
  }

  const formReset = (isCancelClicked = false) => {
    setFormData({ ...headerInitialData });
    setDetailData([{ ...detailInitialData }]);
    updateFormData.current = {
        geHdr:{},
        geDtl:[],
        deletedGe:[]
    };

    if (isCancelClicked) {
      return;
    }
    releaseFormStatus();
    if (formStatus == "Insert") {
      setTimeout(() => {
        setFormStatus("Insert");
      }, 200);
    }
  };

  const handleOffset = (data) => setCurrentRecordNo(data);

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ ...headerInitialData });
    setDetailData([{ ...detailInitialData }]);
    updateFormData.current = {
    geHdr:{},
    geDtl:[],
    deletedGe:[]
};
  }, []);

  const toNum = (v) => Number(v) || 0;

  const calcBasicVal = (row) => {
    const rate = toNum(row.rate_rs);
    const qty = toNum(row.recd_qty);
    return rate * qty;
  };


  const buildWs22Payload = (freightCharges, qtyConverted = 1) => ({
  it_code: "WS22",
  it_pu_um: "NOS",
  um_code: "NOS",

  qty_advise: 1,
  qty_recd: 1,
  qty_accptd: 1,
  qty_payment: 1,
  qty_converted: qtyConverted || 1,
  qty_damaged: 0,

  conversion_factor: 1,

  rate_rs: Number(freightCharges),
  basic_val: Number(freightCharges),
  net_val: Number(freightCharges),
  net_rate: Number(freightCharges),

  cancel_mrir: "N",
  print_mrir: "N",
  print_tag: "Y",
  // udpated: "N",

  modvat_val: 0,
  modvat_perc: 0,
});


  const handleChange = (event, name, value, index = null, block = null) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    
        if (["it_code"].includes(name)) {
        toast.error("Please select value from Help List (double click)");
        return;
      }

    const cursorPosition = event?.target?.selectionStart;
    let newVal = value;

    if (typeof value !== "number" && typeof value === "string") {
      newVal = newVal.toUpperCase();
    }

    switch (block) {
      case "gEHdrData":

        setFormData((prev) => {
          const updated = { ...prev, [name]: newVal };

          

  
    if (name === "freight_charges") {

      console.log("Before =>", updateFormData.current.geDtl);

    setDetailData(prevDtl => {

        let newDtl = [...prevDtl];

        const freightAmount = Number(newVal || 0);

        // if (freightAmount <= 0) {

        //     newDtl = newDtl.filter(
        //         row => row.it_code !== "WS22"
        //     );

        //     // const totalGeValue = newDtl.reduce((sum,row)=>{
        //     //     const values = calculateItemValues(row,0);
        //     //     return sum + Number(values.total_value);
        //     // },0);

        //     // updated.ge_value = totalGeValue.toFixed(2);

        //     updated.ge_value = calculateGEValue(
        //         newDtl,
        //         0
        //     ).toFixed(2);

        //     return newDtl;
        // }

        if (freightAmount <= 0) {

    // ================================
    // WS22 remove 
    // ================================
    const ws22Row = newDtl.find(
        row => row.it_code === "WS22"
    );

    // ================================
    // UPDATE mode:
    // WS22  fill  deletedItemData 
    // ================================
    if (formStatus === "Update" && ws22Row) {

        updateFormData.current.deletedGe ||= [];

        const alreadyDeleted = updateFormData.current.deletedGe.some(
            row => row.it_code === "WS22"
        );

        if (!alreadyDeleted) {
            updateFormData.current.deletedGe.push(ws22Row);
        }

        // Agar WS22 ka changed payload pehle se bana hua hai
        // to usko changedItemRows se hata do
        updateFormData.current.geDtl =
            (updateFormData.current.geDtl || []).filter(
                row => row.it_code !== "WS22"
            );

        // Header bhi DB ke liye update karo
        updateFormData.current.geHdr = {
            ...(updateFormData.current.geHdr || {}),
            freight_charges: 0,
            transport_chg_gst_perc: 0,
        };
    }

    // ================================
    // UI se WS22 remove
    // ================================
    newDtl = newDtl.filter(
        row => row.it_code !== "WS22"
    );

    // ================================
    // UI header reset
    // ================================
    updated.freight_charges = "";
    updated.transport_chg_gst_perc = "";

    updated.ge_value = calculateGEValue(
        newDtl,
        0
    ).toFixed(2);

    return newDtl;
}
        

        const ws22Index = newDtl.findIndex(
            row => row.it_code === "WS22"
        );

        // WS22 already exists
        if (ws22Index !== -1) {

            const row = {
                ...newDtl[ws22Index],
                rate_rs: Number(newVal)
            };

            const values = calculateItemValues(
                row,
                newVal
            );

            newDtl[ws22Index] = {
                ...row,
                ...values
            };

            if (formStatus === "Update") {
    updateFormData.current.geDtl ||= [];

    const existing = updateFormData.current.geDtl.find(
        r => r.it_code === "WS22"
    );

   const ws22Payload = buildWs22Payload(newVal, row.qty_converted);

      if (existing) {
          Object.assign(existing, ws22Payload);
      } else {
          updateFormData.current.geDtl.push(ws22Payload);
      }
    }

        }

        // WS22 not exists
        else {

          const firstPoItem = newDtl.find(
          row => row.it_code !== "WS22"
            );

      const isIGST =
          Number(firstPoItem?.gst_igst_val || 0) > 0;


const firstRow = newDtl[0];

const freightRow = {
  row_id: uuidv4(),

  // ===== Required FK =====
  ge_id: firstRow.ge_id || formData.ge_id,
  po_id: firstRow.po_id,
  po_no: firstRow.po_no,
  wc_id: firstRow.wc_id,
  plant_cd: firstRow.plant_cd,

  // ===== Freight Master =====
  ...freightMaster,

    create_id: Number(user.id),
  create_date: new Date().toISOString(),

  // ===== Qty =====
  it_pu_um: "NOS",
  um_code: "NOS",

  qty_advise: 1,
  recd_qty: 1,
  qty_accptd: 1,
  qty_payment: 1,
  qty_converted: 1,
  qty_damaged: 0,

  conversion_factor: 1,

  // ===== Rate =====
  rate_rs: Number(newVal),
  net_rate: Number(newVal),
  net_val: Number(newVal),

  // ===== Flags =====
  cancel_mrir: "N",
  print_mrir: "N",
  print_tag: "Y",

  modvat_val: 0,
  modvat_perc: 0,
};

freightRow.qty_converted = recalcConvertedQty(freightRow);



    if (isIGST) {

        freightRow.gst_cgst_val = "0.00";
        freightRow.gst_sgst_val = "0.00";
        freightRow.gst_igst_val = freightMaster.gst_igst_val;

    } else {

        freightRow.gst_cgst_val = freightMaster.gst_cgst_val;
        freightRow.gst_sgst_val = freightMaster.gst_sgst_val;
        freightRow.gst_igst_val = "0.00";
    }

    // updated.transport_chg_gst_perc =
    //     isIGST
    //         ? Number(freightRow.gst_igst_val)
    //         : Number(freightRow.gst_cgst_val) +
    //           Number(freightRow.gst_sgst_val);

    const transportGstPerc = isIGST
    ? Number(freightRow.gst_igst_val || 0)
    : Number(freightRow.gst_cgst_val || 0) +
      Number(freightRow.gst_sgst_val || 0);

updated.transport_chg_gst_perc = transportGstPerc;

if (formStatus === "Update") {
    updateFormData.current.geHdr = {
        ...(updateFormData.current.geHdr || {}),
        freight_charges: newVal,
        transport_chg_gst_perc: transportGstPerc,
    };
}
              

    const values = calculateItemValues(
        freightRow,
        Number(newVal)
    );

    newDtl.push({
        ...freightRow,
        ...values,
    });

    if (formStatus === "Update") {

    updateFormData.current.geDtl ||= [];

// updateFormData.current.geDtl.push(
//     buildWs22Payload(newVal, freightRow.qty_converted)
// );

const {
  row_id,
  basic_val,
  total_value,
  cgst_amt,
  sgst_amt,
  igst_amt,
  po_no,
  it_name,
  hsn_sac_code,
  gst_cgst_val,
  gst_igst_val,
  gst_sgst_val,
  recd_qty,
  ...payloadRow
} = freightRow;

updateFormData.current.geDtl.push({
  ...payloadRow,
  qty_recd: freightRow.recd_qty,
  trans_code: freightRow.trans_code || 2,
  ok_rej: freightRow.ok_rej || 'O',
  status_flg: freightRow.status_flg || 'S',
});

}


    setFocusedRowIndex(newDtl.length - 1);

}

        // const totalGeValue = newDtl.reduce((sum, row) => {
        //     return sum + Number(row.total_value || 0);
        // },0);

        // updated.ge_value = totalGeValue.toFixed(2);

        updated.ge_value = calculateGEValue(
            newDtl,
            Number(newVal || 0)
        ).toFixed(2);

        console.log("After =>", updateFormData.current.geDtl);

        return newDtl;

    });

}

      // if user changes the GST % for transport charges, we need to recalculate the GST values
      //  for WS22 row and update the GE value accordingly
if (name === "transport_chg_gst_perc") {

    setDetailData(prevDtl => {

        const newDtl = [...prevDtl];

        const ws22Index = newDtl.findIndex(
            row => row.it_code === "WS22"
        );

        // Freight row nahi hai
        if (ws22Index === -1)
            return newDtl;

        // GST update helper
  const row = { ...newDtl[ws22Index] };

const firstPoItem = newDtl.find(
    r => r.it_code !== "WS22"
);

const isIGST =
    Number(firstPoItem?.gst_igst_val || 0) > 0;

if (isIGST) {

    row.gst_igst_val = Number(newVal || 0);
    row.gst_cgst_val = 0;
    row.gst_sgst_val = 0;

} else {

    row.gst_igst_val = 0;
    row.gst_cgst_val = Number(newVal || 0) / 2;
    row.gst_sgst_val = Number(newVal || 0) / 2;

}

        // Amount recalculate
        const values = calculateItemValues(
            row,
            Number(updated.freight_charges || 0)
        );

        newDtl[ws22Index] = {
            ...row,
            ...values
        };

        // GE Value
        updated.ge_value = calculateGEValue(
            newDtl,
            Number(updated.freight_charges || 0)
        ).toFixed(2);

        // Update Payload
        // if (formStatus === "Update") {

        //     updateFormData.current.geDtl ||= [];

        //     let existing = updateFormData.current.geDtl.find(
        //         r => r.it_code === "WS22"
        //     );

        //     if (existing) {

        //         existing.gst_cgst_val = row.gst_cgst_val;
        //         existing.gst_sgst_val = row.gst_sgst_val;
        //         existing.gst_igst_val = row.gst_igst_val;

        //     }
        // }

        if (formStatus === "Update") {

    updateFormData.current.geHdr = {
        ...(updateFormData.current.geHdr || {}),
        transport_chg_gst_perc: Number(newVal || 0),
    };

}

        return newDtl;

    });

}


          if (formStatus === "Insert" && name == "sale_return") {
            if (name == "sale_return" && newVal == "1") {
              updated.wc_id = formData?.wcId1;
            } else {
              updated.wc_id = formData?.wcIdOther;
            }
          }

         

          if (name === "chln_no") {
          updated.invoice_no = newVal;

          if (formStatus === "Update") {
              updateFormData.current.geHdr = {
                  ...(updateFormData.current.geHdr || {}),
                  chln_no: newVal,
                  invoice_no: newVal,
              };
          }
      }

        if (name === "chln_date") {
            updated.invoice_dt = newVal;

            if (formStatus === "Update") {
                updateFormData.current.geHdr = {
                    ...(updateFormData.current.geHdr || {}),
                    chln_date: newVal,
                    invoice_dt: newVal,
                };
            }
        }



          const geDate = name === "ge_date" ? newVal : updated.ge_date;
          const chlnDate = name === "chln_date" ? newVal : updated.chln_date;

          if (name === "ge_date" && !newVal) {
            toast.error("Gate Entry Date cannot be blank");
            return prev; // form_trigger_failure
          }

          if (name === "chln_date" && !newVal) {
            toast.error("Challan Date cannot be blank");
            return prev; // form_trigger_failure
          }

          // ## Removed as per sahil said on 9-11-2026 there are many po which crosses there end date
          // if (name === "chln_date" && newVal && updated?.po_end_dt) {
          //   if (new Date(updated?.po_end_dt) < new Date(newVal)) {
          //     toast.error("Chalan Date cannot be greater than PO End Date");
          //     return prev;
          //   }
          // }
     
          if (updated.chln_date && updated.po_end_dt) {
            if (new Date(updated.chln_date) < new Date(updated.po_eff_dt)) {
              toast.error(
                "Chalan Date cannot be lesser than PO Effective Date! It should be between PO Effective Date and PO End Date.",
              );
              updated.chln_date = "";
            }
          }

   

          // ✅ TRACK HEADER FIELD CHANGES
          if (formStatus === "Update" && prev[name] !== newVal) {
            updateFormData.current.geHdr = {
              ...(updateFormData.current.geHdr || {}),
              [name]: newVal,
            };
          }


          console.log("FINAL HEADER =>", {
    freight_charges: updated.freight_charges,
    transport_chg_gst_perc: updated.transport_chg_gst_perc
});


          return updated;
        });


        break;

 

      case "gEDtlData":
        setDetailData((prevData) => {
          const newData = [...prevData];
          const prevRow = newData[index] || {};
          const updatedRow = { ...prevRow, [name]: newVal };

          // ---------- AUTO COPY qty_advise -> recd_qty ----------
          if (name === "qty_advise") {
             const poQty = Number(prevRow.po_qty_ord) || 0;
            let advise = Number(newVal) || 0;

            if (advise > poQty) {
              toast.error("Challan Qty cannot be greater than Ordered Qty");
              advise = poQty;          // ya return prevData; dono approach theek hain
          }

            updatedRow.qty_advise = advise;
            updatedRow.recd_qty = advise;
            updatedRow.bal_qty = Math.max( 0,(Number(updatedRow.po_qty_ord) || 0) - advise );  // added by akshay 17-06-26
          }

          // ---------- VALIDATE recd_qty <= qty_advise ----------
          if (name === "recd_qty") {
            const recd = Number(newVal) || 0;
            const advise = Number(prevRow.qty_advise) || 0;
            updatedRow.recd_qty = recd > advise ? advise : recd;
          }

           // below three line added by akshay 17-06-26
          const poQty = Number(updatedRow.po_qty_ord) || 0;
          const recdQty = Number(updatedRow.recd_qty) || 0;
          updatedRow.bal_qty = Math.max( 0, poQty - recdQty );

          // ---------- RECALC qty_converted ----------
          const qtyConvertedTriggers = [
            "recd_qty",
            "qty_advise",
            "conversion_factor",
            "it_st_um",
            "it_pu_um",
          ];

          if (qtyConvertedTriggers.includes(name)) {
            updatedRow.qty_converted = recalcConvertedQty(updatedRow);
          }

          // ---------- RECALC basic_val (🔥 THIS WAS MISSING) ----------
          // const basicValTriggers = ["recd_qty", "qty_advise", "rate_rs"];

            // if (basicValTriggers.includes(name)) {
            //   updatedRow.basic_val = calcBasicVal(updatedRow);
            // }

          const valueTriggers = ["recd_qty", "qty_advise", "rate_rs"];

        if (valueTriggers.includes(name)) {
          const values = calculateItemValues(
            updatedRow,
            formData.freight_charges
          );
         // console.log("values =>", values);

          updatedRow.basic_val = values.basic_val;
          updatedRow.total_value = values.total_value;

          // console.log(updatedRow.total_value);
        }

          newData[index] = updatedRow;

          // console.log(newData[index]);

        setFormData(prev => ({
            ...prev,
            ge_value: calculateGEValue(
                newData,
                Number(formData.freight_charges || 0)
            ).toFixed(2),
        }));

          // ---------- TRACK DETAIL FIELD CHANGES ----------
          if (formStatus === "Update" && prevRow[name] !== updatedRow[name]) {
            updateFormData.current.geDtl ||= [];

            const keyField = "it_code";
            const existing = updateFormData.current.geDtl.find(
              (r) => r[keyField] === updatedRow[keyField],
            );

         
         
            if (existing) {
  existing[name] = updatedRow[name];

  if (name === "qty_advise") {
    existing.qty_recd = updatedRow.recd_qty;
    existing.qty_converted = updatedRow.qty_converted;
  }

  if (name === "recd_qty") {
    existing.qty_recd = updatedRow.recd_qty;
    existing.qty_converted = updatedRow.qty_converted;
  }
} else {
  const newChangedRow = {
    [keyField]: updatedRow[keyField],
    [name]: updatedRow[name],
  };

  if (name === "qty_advise") {
    newChangedRow.qty_recd = updatedRow.recd_qty;
    newChangedRow.qty_converted = updatedRow.qty_converted;
  }

  if (name === "recd_qty") {
    newChangedRow.qty_recd = updatedRow.recd_qty;
    newChangedRow.qty_converted = updatedRow.qty_converted;
  }

  updateFormData.current.geDtl.push(newChangedRow);
}
          }

          return newData;
        });
        break;

      default:
        break;
    }

    // Restore cursor position
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const triggerAddRow = useCallback(() => {
    // Validate Detail Form

    const isValidDetailData = validateForm(
      "gate-entry-dtl-form",
      "Gate Entry Items Detail Form",
    );

    if (!isValidDetailData) {
      toast.error("Please fill required item detail in Gate Entry Detail");
      return;
    }

  //   setDetailData((prevData) => [...prevData, { row_id: uuidv4() }]);
  // 

  setDetailData((prevData) => {

    const lastRow = prevData[prevData.length - 1] || {};

    return [
        ...prevData,
        {
            row_id: uuidv4(),

            // Copy PO details
            po_no: lastRow.po_no,
            po_id: lastRow.po_id,
            po_date: lastRow.po_date,
            po_eff_dt: lastRow.po_eff_dt,

            wc_id: lastRow.wc_id,
            plant_cd: lastRow.plant_cd,
        }
    ];
    setFocusedRowIndex(prevData.length);
});

}, []);

 

  const setupQueryData = useCallback(
  (data, btnClicked) => {
    if (btnClicked === "Query" && data.count === 0) {
      toast.error(data.message);
      handleCancel();
      return;
    }

    if (data.type === "found") {

      // const detailRows = data.gateEntryDtlData.map((row) => {
      //   const values = calculateItemValues(
      //     row,
      //     data.gateEntryData.freight_charges
      //   );

      //   return {
      //     ...row,
      //     basic_val: values.basic_val,
      //     total_value: values.total_value,
      //   };
      // });

      const detailRows = data.gateEntryDtlData.map((row) => {

  const newRow = { ...row };

  if (
    row.it_code === "WS22" &&
    Number(data.gateEntryData.transport_chg_gst_perc || 0) > 0
  ) {

    const gstPerc = Number(data.gateEntryData.transport_chg_gst_perc);

    const isIGST = Number(row.gst_igst_val || 0) > 0;

    if (isIGST) {
      newRow.gst_igst_val = gstPerc;
      newRow.gst_cgst_val = 0;
      newRow.gst_sgst_val = 0;
    } else {
      newRow.gst_cgst_val = gstPerc / 2;
      newRow.gst_sgst_val = gstPerc / 2;
      newRow.gst_igst_val = 0;
    }
  }

  const values = calculateItemValues(
    newRow,
    data.gateEntryData.freight_charges
  );

  return {
    ...newRow,
    basic_val: values.basic_val,
    total_value: values.total_value,
  };
});


      //  GE Value calculate from Total Value
      const geValue = detailRows.reduce((sum, row) => {
        return sum + Number(row.total_value || 0);
      }, 0);

      setFormData({
        ...data.gateEntryData,
        po_value: Number(data.gateEntryData.po_value || 0).toFixed(3),
        ge_value: geValue.toFixed(3),
      });

      const ws22Row = detailRows.find(
        (row) => row.it_code === "WS22"
      );

      if (!ws22Row) {
        setDisableFreight(false);
      } else if (Number(ws22Row.rate_rs) > 0) {
        setDisableFreight(true);
      } else {
        setDisableFreight(false);
      }


      setDetailData(detailRows);
    }

    if (btnClicked === "Query") {
      setTotalRecordCount(data.count);
    }
  },
  [formStatus, currentRecordNo]
);

  // console.log("formData :: ", formData);

  const buildHelpWhereClause = (helpFor, formData) => {
    switch (helpFor) {
      case "chln_no":
        return { f_inter_div: formData?.inter_div };
      case "po_no":
        return { f_ge_date: formData?.ge_date, f_v_code: formData?.v_code };
      case "ship_to":
        return { f_ship_to_type: formData?.ship_to_type };
      case "it_code":
      return {
          po_no: detailData[focusedRowIndex]?.po_no,
          po_id: detailData[focusedRowIndex]?.po_id,
          ge_id: detailData[focusedRowIndex]?.ge_id
      };
      default:
        return {};
    }
  };

 
  const onSuccessConfirmation = useCallback(
    (confirm, ge_no) => {
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formData],
  );

  const showGeneratedGeNo = useCallback((ge_no, inw_ctrl_no) => {
    setConfirmationConfig({
      title: "Gate Entry & Inward Cntorl No. generated",
      description: `New Gate Entry no & Inward Control no generated is GE No. - ${ge_no} & Inw. Ctrl No. - ${inw_ctrl_no}`,
      // description: `New Inward Control no generated is ${inw_ctrl_no}`,
      uniqKey: "ge_no",
    });
    setConfirmationModal(true);
  }, []);

  console.log("Detail Data :: ", detailData);

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSrchPayloadGE(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_GATE_ENTRY_FORM_DATE}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`,
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



const handleDelete = (rowIndex) => {

  const row = detailData[rowIndex];

  if (formStatus === "Update") {
    updateFormData.current.deletedGe ||= [];
    updateFormData.current.deletedGe.push(row);
  }

  setDetailData((prev) => {

    const newDtl = prev.filter((_, index) => index !== rowIndex);

    setFormData(prevHdr => {

      const updatedHdr = {
        ...prevHdr,
        ge_value: calculateGEValue(
          newDtl,
          Number(prevHdr.freight_charges || 0)
        ).toFixed(2)
      };

      // ✅ WS22 delete hone par header reset
      if (row.it_code === "WS22") {
  updatedHdr.freight_charges = "";
  updatedHdr.transport_chg_gst_perc = "";
  updatedHdr.ge_value = calculateGEValue(newDtl, 0).toFixed(2);

  
  if (formStatus === "Update") {
    updateFormData.current.geHdr = {
      ...(updateFormData.current.geHdr || {}),
      freight_charges: 0,
      transport_chg_gst_perc: 0,
    };
  }
}

      return updatedHdr;
    });

    return newDtl;

  });

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
        opterationBtn={getGateEntryBottomBtn(toggleCnclModal)}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_GATE_ENTRY_FORM_DATE}
        formName={"Gate Entry"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        handlePrint={() => getGEPrint(formData, formStatus, dispatch)}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <GateEntryHeader
              formData={formData}
              formStatus={formStatus}
              handleChange={(e, name, value) =>
                handleChange(e, name, value, null, "gEHdrData")
              }
              openHelpList={openHelpList}
              setFormData={setFormData}
              setDetailData={setDetailData}
              user={user}
              detailData={detailData}
              disableFreight={disableFreight}
            />
            <GateEntryDtl
              formData={formData}
              detailData={detailData}
              f57Data={f57Data}
              f57QtyData={f57QtyData}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              makeFocusOnTableRow={makeFocusOnTableRow}
              handleDelete={handleDelete}
              handleChange={(e, name, value, index) =>
                handleChange(e, name, value, index, "gEDtlData")
              }
              openHelpList={openHelpList}
              setDetailData={setDetailData}
              setFormData={setFormData}
              user={user}
              setDisableFreight={setDisableFreight}
            />
          </TabPane>
        </TabContent>
      </FormSetup>

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
                APP_PROD_API.GET_GATE_ENTRY_FORM_DATE
              }`}
              helpListHeader={helpListHeader}
              handleHelpList={handleHelpList}
              onSelectHelpItem={onSelectHelpItem}
              queryPera={{ needAppGlobalData: "Y" }}
              whereClause={buildHelpWhereClause(helpFor, formData)}
            />
          </ModalBody>
        </Modal>
      )}

      {/*  Show modal conditionally */}
      {isCnclModelOpen && (
        <GateEntryCancel
          formData={formData}
          formStatus={formStatus}
          handleChange={(e, name, value) =>
            handleChange(e, name, value, null, "gEHdrData")
          }
          isCnclModelOpen={isCnclModelOpen}
          toggleCnclModal={toggleCnclModal}
        />
      )}

      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal}
          onClose={() => {
            onSuccessConfirmation(false, confirmationConfig);
            setConfirmationModal(false);
          }}
          {...confirmationConfig}
          onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
        />
      )}
    </React.Fragment>
  );
};

export default GateEntry;
