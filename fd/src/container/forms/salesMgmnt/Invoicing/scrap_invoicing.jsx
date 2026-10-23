import React, { useEffect } from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { controlData, mhsminv, scrapInvBottomBtn } from './scrap_invoice_helper';
import InvoiceQrCode from './print_invoice_qr_code';
import ScrapInvMain from './scrap_invoice_main';
import ScrapInvDespatch from './scrap_invoice_despatch';
import ScrapInvPayment from './scrap_invoice_payment';
import ScrapInvItems from './scrap_invoice_items';


const ScrapInvoicing = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [itemFormDetail, setItemFormDetail] = useState(Array(3).fill({}));

  const [mhsminvData, setMhsminvData] = useState({...mhsminv})
  const [formControlData, setFormControlData] = useState({...controlData})
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [tabs, setTabs] = useState(['Main Info'])
  const [currentFormTab, setCurrentFormTab] = useState('Main Info') // Default tab-> on first time render
  const [updatedButtons, setUpdatedButtons] = useState(scrapInvBottomBtn);


  // WHEN PRINT BUTTON CLICKED AT TOOLBAR
  const [isPrintInvQRModelOpen, setIsPrintInvQRModelOpen] = useState(false);
  const togglePrintInvQRModal = () =>setIsPrintInvQRModelOpen(!isPrintInvQRModelOpen);

    // SET CURRENT TAB NAME AT TOP
    const updateActiveTab = useCallback((tab) => {
      setActiveTab(tab);
    }, []);


  
      // CHANGING TAB
    const handleChangeTab = (getTab)=>{
      //console.log(getTab)
      if(getTab =='On Acc Bills'){
        setIsPrintInvQRModelOpen(true)
        return
      }
      setTabs([getTab])
      setCurrentFormTab(getTab)
      // return getTab
     

    }


      // COMMON FIELD CHANGE   ##'NOT INCLUDED VOLUMEN DISCOUNT TAB'
      const handleChange = (tab, name, value, index, event, block = null) => {
      const cursorPosition = event?.target?.selectionStart;
      const newVal = value.toUpperCase();
      //console.log(name)
    
    switch (tab) {
      case "MainTab":
        setMhsminvData((prev) => ({ ...prev, [name]: newVal }));
      break;
      // case "ChargesTab":
      //   setChrgFormData((prev) => ({ ...prev, [name]: newVal }));
      // break;
      // case "ItemTab":
      //   setItemFormData((prevData) => {
      //     const newData = [...prevData];
      //     newData[index] = { ...newData[index], [name]: newVal };
      //     return newData;
      //   });
      // break;
      // case "discountTab":
      //   setDiscountFormData((prevData) => {
      //     const newData = [...prevData];
      //     newData[index] = { ...newData[index], [name]: newVal };
      //     return newData;
      //   });
      // break;
      // case "subContractTab":
      //   if (block === "head") {
      //     setSubcontractHeadData((prev) => ({ ...prev, [name]: newVal }))
      //   } else {
      //     setSubcontractDetailData((prevData) => {
      //       const newData = [...prevData]
      //       newData[index] = { ...newData[index], [name]: newVal }
      //       return newData
      //     })
      //   }
      //   break
      // case "advanceTab":
      //   if (block === "head") {
      //     setAdvanceHeadData((prev) => ({ ...prev, [name]: newVal }))
      //   } else {
      //     setAdvanceDetailData((prevData) => {
      //       const newData = [...prevData]
      //       newData[index] = { ...newData[index], [name]: newVal }
      //       return newData
      //     })
      //   }
      //   break

      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target) event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  
  function handleSubmit(e){
    e.preventDefault();

    //console.log("Form submitted", formData)
  }

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handlePrint = ()=>{
    togglePrintInvQRModal()
  } 

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);


  const setupQueryData = useCallback(
      (queryData, btnClicked) => {
         
      },
      [formStatus, currentRecordNo]
  );


  const renderFormTab =(tab)=>{
    switch (tab){
      case 'Main Info':{
        return <ScrapInvMain
          formData={mhsminvData}
          formStatus={formStatus}
          formControlData={formControlData}
          handleChange={(name, value) => handleChange("MainTab", name, value,)}
          handleChangeTab={handleChangeTab}

        />
      }

      case 'Despatch':{
        return <ScrapInvDespatch
          formData={formData}
          formStatus={formStatus}
          handleChange={(e) => handleChange("Despatch", e)}
          handleChangeTab={handleChangeTab}
        />
      }
      case 'Payment':{
        return <ScrapInvPayment
          formData={formData}
          formStatus={formStatus}
          handleChange={(e) => handleChange("payment", e)}
          handleChangeTab={handleChangeTab}
        />
      }
      case 'Items':{
        return <ScrapInvItems
          itemFormDetail={itemFormDetail}
          formControlData={formControlData}
          formStatus={formStatus}
          handleChange={(e) => handleChange("Items", e)}
          handleChangeTab={handleChangeTab}
        />
      }
    }
   
  }

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
        const simpleBarElement = document.querySelector("#simplebar-container .simplebar-content-wrapper");
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
        handleChangeTab(btn.name)
      }
  
      return updatedButtons.map((item) => ({
        ...item,
        onClick: (e) => handleClick(e, item),
      }));
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
        handleOffset={handleOffset}
        QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
        opterationBtn={renderBottomBtn()}
        formName={""}
        handlePrint={handlePrint}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {renderFormTab(currentFormTab)}
            {isPrintInvQRModelOpen && 
            <InvoiceQrCode 
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              isPrintInvQRModelOpen={isPrintInvQRModelOpen}
              togglePrintInvQRModal={togglePrintInvQRModal}
              />
            }
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ScrapInvoicing;

