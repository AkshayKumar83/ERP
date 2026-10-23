
import React, { useState, useCallback, useEffect } from "react";
import { Form, TabContent, TabPane, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useSelector } from "react-redux";
import UpdatePhysicalInventoryHeader from "./update_Physical_Inventory_header";
import { updatePhyInvData } from "./update_Physical_Inventory_helper";
import toast from "react-hot-toast";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";


const UpdatePhysicalInventory = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...updatePhyInvData});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
   const [itemType, setItemType] = useState([]);
  const [itemBase, setItemBase] = useState([]);
  const [itemSubCat, setItemSubCat] = useState([]);
  const [wcList,setWCList]  = useState([]);

     const [confirmationModal, setConfirmationModal] = useState(false);
     const [confirmationConfig, setConfirmationConfig] = useState({});
   
     // for dynamic msg state
     const [statusMessage, setStatusMessage] = useState("");


  const tabs = ["Update Physical Inventory "];
    const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  
            

   // Level2 load based on Level1 selections
  
  const fetchInitialDropdowns = async (storeProcess = "S") => {
  try {
    const params = new URLSearchParams({
      store_process: storeProcess,
      appDivisionId: user?.global_division_id || "",
    });

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UPDATE_PHY_INV_DROPDOWN_DATA}?${params.toString()}`,
      { credentials: "include" }
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error("Failed to load dropdowns:", data.message || data.error);
      return;
    }

    setWCList([
      { value: "", label: "" },
      ...formatOptions(data.wcList || [], "wc_id", "wc_no"),
    ]);

    setItemType([
      { value: "", label: "" },
      ...formatOptions(data.level1 || [], "level1", "cat_desc"),
    ]);
  } catch (err) {
    console.error("Initial dropdown load failed:", err);
  }
    };

  useEffect(() => {
  fetchInitialDropdowns(formData.store_process || "S");
}, [formData.store_process, user?.global_division_id]);

  
   useEffect(() => {
  const fetchLevel2 = async () => {
    if (formData.it_type) {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_UPDATE_PHY_INV_DROPDOWN_DATA
        }?level1=${formData.it_type}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemBase([
        { value: "", label: "" },
        ...formatOptions(data.level2 || [], "level2", "cat_desc"),
      ]);
      setItemSubCat([]);
    } else {
      setItemBase([]);
      setItemSubCat([]);
    }
  };
  fetchLevel2();
}, [formData.it_type]);


  // Level3 load based on Level1 + Level2 selection
  useEffect(() => {
  const fetchLevel3 = async () => {
    if (formData.it_type && formData.it_base) {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_UPDATE_PHY_INV_DROPDOWN_DATA
        }?level1=${formData.it_type}&level2=${formData.it_base}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setItemSubCat([ { value: "", label: "" },...formatOptions(data.level3 || [], "level3", "cat_desc"), ]);
    } else {
      setItemSubCat([]);
    }
  };
  fetchLevel3();
}, [formData.it_type, formData.it_base]);



//  When user clicks on "Generate Adjustment" button
 const handleGenerate = () => {
  if (!formData?.wc_id || !formData?.adj_date) {
    toast.error("Please select Work Center and Inventory Month first.");
    return;
  }

  // Open confirmation modal (just like Oracle confirm)
  setConfirmationConfig({
    title: "Confirmation",
    description: "Are you sure to generate adjustments?",
  });
  setConfirmationModal(true);
 };

 const handleConfirmYes = async () => {
  setConfirmationModal(false);
  setStatusMessage("Creating Adjustments, Wait!"); 

  try {
    const year = new Date(formData.adj_date).getFullYear();
    const invMonth = new Date(formData.adj_date).getMonth() + 1;

    const payload = {
      wc_id: formData.wc_id,
      curryear: Number(year),
      inv_month: invMonth,
      adj_date: formData.adj_date,
      division_id: user?.global_division_id,
    };

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UPDATE_PHY_INV_GEN_ADJUST}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      toast.error(data.message || data.error || "Failed to generate adjustments");
      setStatusMessage(""); 
      return;
    }

    toast.success(
      data.message || (data.branch === "S" ? "Completed for store" : "Completed for process")
    );

    setStatusMessage( data.branch === "S" ? "Completed for store" : "Completed for process" );
  } catch (e) {
    console.error("Error generating adjustments:", e);
    toast.error(e.message || "Error generating adjustments");
    setStatusMessage("");
  }
};


//  If user clicks "Cancel" (No)
const handleConfirmNo = () => {
  setConfirmationModal(false);
};





  const handleSubmit = async (e) => {
    e.preventDefault(); 
  };
  

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData({...updatePhyInvData});
    setItemType([])
    setItemBase([]);
    setItemSubCat([]);
    releaseFormStatus();
    fetchInitialDropdowns("S");  
    setStatusMessage();
  } 

  const handleChange = useCallback((name, value,event) => {
      const cursorPos = event?.target?.selectionStart;

    setFormData((prev) => {
    let updatedData = { ...prev, [name]: value.toUpperCase?.() || value };

    if (name === "adj_date" && value) {
      const year = new Date(value).getFullYear(); 
      updatedData.curryear = year.toString();
    }
    

    if (name === "it_type") {
      updatedData.it_base = "";
      updatedData.it_sub_c = "";
    }

    if (name === "it_base") {
      updatedData.it_sub_c = "";
    }
    return updatedData;
  });
  
   if (event?.target && event.target.tagName === "INPUT" && event.target.type === "text") {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }
}, [[formStatus]]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      console.log("queryData", queryData);
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.totalCount);
      }
    },
    [formStatus, currentRecordNo]
  );

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
         QUERY_API
        btnEnableDtl={{query:false, search:false, insert:false,update:false}}
        formName={"Update Physical Inventory"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
          
              <UpdatePhysicalInventoryHeader
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
                 itemBase={itemBase}
                itemType={itemType}
                itemSubCat ={itemSubCat}
                wcList={wcList}
                handleCancel={handleCancel} 
                handleGenerate={handleGenerate}
                statusMessage={statusMessage}
              />
               {confirmationModal && (
                  <ConfirmationModal
                    isOpen={confirmationModal}
                    title={confirmationConfig.title}
                    description={confirmationConfig.description}
                    onClose={handleConfirmNo}  
                    onSuccess={handleConfirmYes} 
                  />
                 )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UpdatePhysicalInventory