import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import {
  advanceInitDetailFormDataTemplate,
  advanceInitHeadFormDataTemplate,
  controlFieldData,
  discountInitFormDataTemplate,
  eqpmntSrNoFormData,
  itemsInitData,
  mainInitData,
  subContractDetailInitDataTemplate,
  subContractHeadInitDataTemplate,
  volumeDiscountInitFormDataTemplate,
} from "./service_order_helper";
import ServiceOrderAdvance from "./service_order_Advance";
import ServiceOrderSubContact from "./service_order_SubContact";
import ServiceOrderDiscount from "./service_order_discount";
import ServiceOrderItem from "./service_order_Item";
import ServiceOrderCharge from "./service_order_Charge";
import ServiceOrderMain from "./service_order_main";
import ServiceOrderVolumeDiscount from "./service_order_volume_discount";
import ServiceOrderReason from "./service_order_Reason";
import ServiceOrderEqpmntSrNo from "./service_order_Eqpmnt_SrNo";
import ServiceOrderAmendment from "./service_order_amendment";

const TYPES = {
  ITEMS: "items",
  DISCOUNT: "discount",
  SUB_CONTRACT: "subContract",
  VOL_DISCOUNT: "volDiscount",
  ADVANCE: "advance",
  SRNO: "srno",
};

const ServiceOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [mainFormData, setMainFormData] = useState({ ...mainInitData }); //todo change its variable name
  const [chrgFormData, setChrgFormData] = useState({ ...mainInitData });
  const [amdntFormData, setAmdntFormData] = useState({...mainInitData})
  const [itemFormData, setItemFormData] = useState([{ ...itemsInitData }]);
  const [discountFormData, setDiscountFormData] = useState([
    discountInitFormDataTemplate,
  ]);

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const [currentFormTab, setCurrentFormTab] = useState("Main"); // Default tab-> on first time render

  // SUBCONTRACT FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
  const [subcontractHeadData, setSubcontractHeadData] = useState({
    ...subContractHeadInitDataTemplate,
  });
  const [subcontractDetailData, setSubcontractDetailData] = useState([
    { ...subContractDetailInitDataTemplate },
  ]);

  // ADVANCE FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
  const [advanceHeadData, setAdvanceHeadData] = useState({
    ...advanceInitHeadFormDataTemplate,
  });
  const [advanceDetailData, setAdvanceDetailData] = useState([
    { ...advanceInitDetailFormDataTemplate },
  ]);

  const [volumeDiscountData, setVolumeDiscountData] = useState([
    {},
    {},
    {},
    {},
  ]);
  const [itemDiscountData, setItemDiscountData] = useState([
    {},
    {},
    {},
    {},
    {},
    {},
  ]);

  const [reasonFormData, setReasonFormData] = useState({ ...mainInitData });
  const [srnoFormData, setSrnoFormData] = useState([eqpmntSrNoFormData]);
  // CONTROLL FEILD //
  const [formControlField, setFormControlField] = useState({
    ...controlFieldData,
  });

  const [tabs, setTabs] = useState(["Main"]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

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
    setFormData({});
    setMainFormData({ ...mainInitData });
    setChrgFormData({ ...mainInitData });
    setItemFormData([{ ...itemsInitData }]);
    setDiscountFormData([discountInitFormDataTemplate]);
    setCurrentFormTab("Main");
    setSubcontractHeadData({ ...subContractHeadInitDataTemplate });
    setSubcontractDetailData([{ ...subContractDetailInitDataTemplate }]);
    setAdvanceHeadData({ ...advanceInitHeadFormDataTemplate });
    setAdvanceDetailData([{ ...advanceInitDetailFormDataTemplate }]);
    setVolumeDiscountData([{}, {}, {}, {}]);
    setItemDiscountData([{}, {}, {}, {}, {}, {}]);
    setReasonFormData({ ...reasonFormData });
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
      case "AmendmentTab":
        setAmdntFormData((prev) => ({ ...prev, [name]: newVal }));
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
          setSubcontractHeadData((prev) => ({ ...prev, [name]: newVal }));
        } else {
          setSubcontractDetailData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
        }
        break;
      case "advanceTab":
        if (block === "head") {
          setAdvanceHeadData((prev) => ({ ...prev, [name]: newVal }));
        } else {
          setAdvanceDetailData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
        }
        break;
      case "ReasonTab":
        setReasonFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "SrnoTab":
        setSrnoFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;

      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target)
        event.target.setSelectionRange(cursorPosition, cursorPosition);
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
  const handleAddRow = useCallback(
    (type) => {
      if (type === TYPES.DISCOUNT) {
        setDiscountFormData((prevData) => [
          ...prevData,
          { ...discountInitFormDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.SUB_CONTRACT) {
        setSubcontractDetailData((prevData) => [
          ...prevData,
          { ...subContractDetailInitDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.VOL_DISCOUNT) {
        setSubcontractDetailData((prevData) => [
          ...prevData,
          { ...volumeDiscountInitFormDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.ADVANCE) {
        setAdvanceDetailData((prevData) => [
          ...prevData,
          { ...advanceInitDetailFormDataTemplate, sr_no: prevData.length + 1 },
        ]);
      } else if (type === TYPES.ITEMS) {
        setItemFormData((prevData) => [
          ...prevData,
          { ...itemsInitData, sr_no: prevData.length + 1 },
        ]);
      } else if (type === TYPES.SRNO) {
        setSrnoFormData((prevData) => [
          ...prevData,
          { ...eqpmntSrNoFormData, sr_no: prevData.length + 1 },
        ]);
      }
    },
    [
      discountFormData,
      subcontractDetailData,
      volumeDiscountData,
      advanceDetailData,
      srnoFormData,
    ]
  );

  // ON QUERY SET THE FORMDATA
  const setupQueryData = useCallback(
    (queryData, btnClicked) => {},
    [formStatus, currentRecordNo]
  );

  const handleDeleteinDiscountTable = useCallback(
    (index) => {
      setDiscountFormData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [discountFormData]
  );

  const handleDeleteinSubcontractTable = useCallback(
    (index) => {
      setSubcontractDetailData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [subcontractDetailData]
  );

  const handleDeleteinVolumeTable = useCallback(
    (index) => {
      setVolumeDiscountData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [setVolumeDiscountData]
  );

  const handleDeleteinSrnoTable = useCallback(
    (index) => {
      setSrnoFormData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [srnoFormData]
  );

  // CHANGING TAB
  const handleChangeTab = (getTab) => {
    setTabs([getTab]);
    setCurrentFormTab(getTab);
  };

  const renderFormTab = (tab) => {
    if (tab === "Main") {
      return (
        <ServiceOrderMain
          formData={mainFormData}
          formStatus={formStatus}
          handleChange={(name, value) => handleChange("MainTab", name, value)}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Charges") {
      return (
        <ServiceOrderCharge
          chrgFormData={chrgFormData}
          formStatus={formStatus}
          handleChange={(name, value) => handleChange("ChargesTab", name, value)}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Amendment") {
      return (
        <ServiceOrderAmendment
        amdntFormData={amdntFormData}
          formStatus={formStatus}
          handleChange={(name, value) => handleChange("AmendmentTab", name, value)}
          handleChangeTab={handleChangeTab}
        />
      );
    }
     else if (tab === "Items") {
      return (
        <ServiceOrderItem
          itemFormData={itemFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) =>handleChange("ItemTab", name, value, index, event)}
          handleAddRow={() => handleAddRow(TYPES.ITEMS)}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Discount") {
      return (
        <ServiceOrderDiscount
          formData={discountFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) => handleChange("discountTab", name, value, index, event) }
          handleAddRow={() => handleAddRow(TYPES.DISCOUNT)}
          handleDelete={handleDeleteinDiscountTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Subcontract") {
      return (
        <ServiceOrderSubContact
          formData={subcontractHeadData}
          formDetailData={subcontractDetailData}
          formStatus={formStatus}
          handleChange={(name, value, index, event, block) =>
          handleChange( "subContractTab", name, value, index ?? null, event, block ? block : "detail" ) }
          handleAddRow={() => handleAddRow(TYPES.SUB_CONTRACT)}
          handleDelete={handleDeleteinSubcontractTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Volume Discount") {
      return (
        <ServiceOrderVolumeDiscount
          formData={formData}
          formStatus={formStatus}
          volumeDiscountData={volumeDiscountData}
          itemDiscountData={itemDiscountData}
          handleVolumeDiscountChange={handleVolumeDiscountChange}
          handleItemDiscountChange={handleItemDiscountChange}
          handleChange={handleChange}
          handleAddRow={() => handleAddRow(TYPES.VOL_DISCOUNT)}
          handleDelete={handleDeleteinVolumeTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Advance") {
      return (
        <ServiceOrderAdvance
          formData={advanceHeadData}
          formDetailData={advanceDetailData}
          formStatus={formStatus}
          handleChange={(name, value, index, event, block) =>
          handleChange("advanceTab",name,value,index ?? null,event,block ? block : "detail") }
          handleChangeTab={handleChangeTab}
          handleAddRow={() => handleAddRow(TYPES.ADVANCE)}
          controlFieldData={controlFieldData}
        />
      );
    } else if (tab === "Reason") {
      return (
        <ServiceOrderReason
          reasonFormData={reasonFormData}
          formStatus={formStatus}
          handleChange={(name, value) => handleChange("ReasonTab", name, value)}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Srno") {
      return (
        <ServiceOrderEqpmntSrNo
          formData={srnoFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) => handleChange("SrnoTab", name, value, index, event)}
          handleAddRow={() => handleAddRow(TYPES.SRNO)}
          handleDelete={handleDeleteinSrnoTable}
          handleChangeTab={handleChangeTab}
        />
      );
    }
  };

  //console.log("formStatus from memberform", formStatus);
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
        formName={"Service Order"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>{renderFormTab(currentFormTab)}</TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ServiceOrder;
