import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ScrapOrderMain from './scrap_order_main';
import ScrapOrderCharges from './scrap_order_charges';
import ScrapOrderItem from './scrap_order_Item';
import { advanceInitDetailFormDataTemplate, advanceInitHeadFormDataTemplate, controlFieldData, discountInitFormDataTemplate, itemsInitData, mainInitData, subContractDetailInitDataTemplate, subContractHeadInitDataTemplate } from './scrap_order_helper';
import ScrapOrderDiscount from './scrap_order_Discount';
import ScrapOrderSubContract from './scrap_order_subContract';
import ScrapOrderAdvance from './scrap_order_Advance';

const TYPES = {
  ITEMS:'items',
  DISCOUNT: "discount",
  SUB_CONTRACT: "subContract",
  ADVANCE:'advance'
};

const ScrapOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
   const [mainFormData, setMainFormData] = useState({...mainInitData}) //todo change its variable name at this time main and charge btab data are same block
   const [chrgFormData, setChrgFormData] = useState({...mainInitData})
   const [itemFormData, setItemFormData] = useState([{...itemsInitData}])
   const [discountFormData, setDiscountFormData] = useState([discountInitFormDataTemplate])
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();


const [currentFormTab, setCurrentFormTab] = useState('Main') // Default tab-> on first time render

  // SUBCONTRACT FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
  const [subcontractHeadData, setSubcontractHeadData] = useState({...subContractHeadInitDataTemplate});
  const [subcontractDetailData, setSubcontractDetailData] = useState([{...subContractDetailInitDataTemplate}]);

    // ADVANCE FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
    const [advanceHeadData, setAdvanceHeadData] = useState({...advanceInitHeadFormDataTemplate})
    const [advanceDetailData, setAdvanceDetailData] = useState([{...advanceInitDetailFormDataTemplate}])
  

    const [volumeDiscountData, setVolumeDiscountData] = useState([{}, {}, {}, {}])
    const [itemDiscountData, setItemDiscountData] = useState([{}, {}, {}, {}, {}, {}])

      // CONTROLL FEILD //
      const [formControlField, setFormControlField] = useState({...controlFieldData})

  const [tabs, setTabs] = useState(['Main'])
   const updateActiveTab = useCallback((tab) => { setActiveTab(tab)}, []);

   function handleSubmit(e){
    e.preventDefault();
    //console.log("Form submitted", formData)
  }

  function handleOffset(data){
    setCurrentRecordNo(data)
  }

    const handleCancel = useCallback(() => {
      // Implement cancel logic here
      releaseFormStatus()
      setFormData({});
      setMainFormData({...mainInitData})
      setChrgFormData({...mainInitData})
      setItemFormData([{...itemsInitData}])
      setDiscountFormData([discountInitFormDataTemplate])
      setCurrentFormTab('Main')
      setSubcontractHeadData({...subContractHeadInitDataTemplate})
      setSubcontractDetailData([{...subContractDetailInitDataTemplate}])
      setAdvanceHeadData({...advanceInitHeadFormDataTemplate})
      setAdvanceDetailData([{...advanceInitDetailFormDataTemplate}])
      setVolumeDiscountData([{}, {}, {}, {}])
      setItemDiscountData([{}, {}, {}, {}, {}, {}])
    }, []);

    // COMMON FIELD CHANGE   ##'NOT INCLUDED VOLUMEN DISCOUNT TAB'
  const handleChange = (tab, name, value, index, event, block = null) => {
    const cursorPosition = event?.target?.selectionStart;
    const newVal = value.toUpperCase();
    
    switch (tab) {
      case "MainTab":
        setMainFormData((prev) => ({ ...prev, [name]: newVal }));
      break;
      case "ChargesTab":
        setChrgFormData((prev) => ({ ...prev, [name]: newVal }));
      break;
      case "ItemTab":
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
      break;
      case "discountTab":
        setDiscountFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
      break;
      case "subContractTab":
        if (block === "head") {
          setSubcontractHeadData((prev) => ({ ...prev, [name]: newVal }))
        } else {
          setSubcontractDetailData((prevData) => {
            const newData = [...prevData]
            newData[index] = { ...newData[index], [name]: newVal }
            return newData
          })
        }
        break
      case "advanceTab":
        if (block === "head") {
          setAdvanceHeadData((prev) => ({ ...prev, [name]: newVal }))
        } else {
          setAdvanceDetailData((prevData) => {
            const newData = [...prevData]
            newData[index] = { ...newData[index], [name]: newVal }
            return newData
          })
        }
        break

      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target) event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  // VOLUME DISCOUNT TAB -> DISCOUNT TABLE FIELDS 
  const handleVolumeDiscountChange = (name, value, rowIndex) => {
    setVolumeDiscountData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [name]: value };
      return newData;
    });
  };  

    // VOLUME DISCOUNT TAB -> ITEM FIELDS
    const handleItemDiscountChange = (name, value, index) => {
      setItemDiscountData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: value };
        return newData;
      });
    };  
  

      // ADD TABLE'S ROW
      const handleAddRow = useCallback((type) => {
        if (type === TYPES.DISCOUNT) {
          setDiscountFormData((prevData) => [ ...prevData, { ...discountInitFormDataTemplate, id: prevData.length + 1,},]);
        }else if (type === TYPES.SUB_CONTRACT) {
          setSubcontractDetailData((prevData) => [...prevData, { ...subContractDetailInitDataTemplate, id: prevData.length + 1,},]);
        }else if (type === TYPES.ADVANCE) {
          setAdvanceDetailData((prevData) => [...prevData, { ...advanceInitDetailFormDataTemplate, sr_no: prevData.length + 1,},]);
        }else if (type === TYPES.ITEMS) {
          setItemFormData((prevData) => [...prevData, { ...itemsInitData, sr_no: prevData.length + 1,},]);
        }
          },[discountFormData, subcontractDetailData, advanceDetailData]
      );

        // ON QUERY SET THE FORMDATA
        const setupQueryData = useCallback(
            (queryData, btnClicked) => { 
            },
            [formStatus, currentRecordNo]
        );  
      
          const handleDeleteinDiscountTable = useCallback((index) => {
            setDiscountFormData((prev) => {
              if (prev.length === 0) return prev; 
              return prev.filter((_, i) => i !== index);
            });
          }, [discountFormData]); 

            const handleDeleteinSubcontractTable = useCallback((index) => {
              setSubcontractDetailData((prev) => {
                if (prev.length === 0) return prev; 
                return prev.filter((_, i) => i !== index);
              });
            }, [subcontractDetailData]);  
            
            
            const handleDeleteinVolumeTable = useCallback((index) => {
              setVolumeDiscountData((prev) => {
                if (prev.length === 0) return prev; 
                return prev.filter((_, i) => i !== index);
              });
            }, [setVolumeDiscountData]);  

              // CHANGING TAB
  const handleChangeTab = (getTab)=>{
    setTabs([getTab])
    setCurrentFormTab(getTab)
  }
  const renderFormTab =(tab)=>{
    if(tab==='Main'){
        return <ScrapOrderMain
        formData={mainFormData}
        formStatus={formStatus}
        handleChange={(name, value) => handleChange("MainTab", name, value,)}
        handleChangeTab={handleChangeTab}
        />
    }else if(tab === 'Charges'){
        return <ScrapOrderCharges
        chrgFormData={chrgFormData}
        formStatus={formStatus}
        handleChange={(name, value) => handleChange("ChargesTab", name, value,)}
        handleChangeTab={handleChangeTab}
        />
    }else if(tab === 'Items'){
        return <ScrapOrderItem
        itemFormData={itemFormData}
        formStatus={formStatus}
        handleChange={(name, value,index,event) => handleChange("ItemTab", name, value ,index,event)}
        handleAddRow = {()=>handleAddRow(TYPES.ITEMS)}
        handleChangeTab={handleChangeTab}
        />
    }else if(tab === 'Discount'){
        return <ScrapOrderDiscount
          formData = {discountFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) => handleChange("discountTab", name, value ,index, event)}
          handleAddRow = {()=>handleAddRow(TYPES.DISCOUNT)}
          handleDelete = {handleDeleteinDiscountTable}
          handleChangeTab={handleChangeTab}
        />
    }else if(tab === 'Subcontract'){
      return <ScrapOrderSubContract
        formData = {subcontractHeadData}
        formDetailData = {subcontractDetailData}
        formStatus = {formStatus}
        handleChange={(name, value, index, event, block) =>
           handleChange("subContractTab", name, value ,index ?? null, event, block?block:'detail')}
        handleAddRow = {()=>handleAddRow(TYPES.SUB_CONTRACT)}
        handleDelete={handleDeleteinSubcontractTable}
        handleChangeTab={handleChangeTab}
      />
    }
    else if(tab === 'Advance'){
      return <ScrapOrderAdvance
        formData = {advanceHeadData}
        formDetailData = {advanceDetailData}
        formStatus = {formStatus}
        handleChange={(name, value, index, event, block) =>
          handleChange("advanceTab", name, value , index ?? null, event, block ? block:'detail')}
        handleChangeTab={handleChangeTab}
        handleAddRow = {()=>handleAddRow(TYPES.ADVANCE)}
        controlFieldData = {controlFieldData}
      />
    }
  }



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
        QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
          {renderFormTab(currentFormTab)}
          </TabPane>
          
        
         
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ScrapOrder;

