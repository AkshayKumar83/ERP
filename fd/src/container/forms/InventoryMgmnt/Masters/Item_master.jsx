import React, { useEffect } from 'react'
import { Form,  Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ItemMasterMain from './Item_master_main_tab';
import ItemMasterAdditional from './Item_master_additional_tab';
import ItemMasterTechnicalSpecs from './Item_master_technical_tab';
import ItemMasterDrawing from './Item_master_drawing_tab';
import ItemMasterDivisionDetail from './Item_master_division_dtl_tab';
import ItemMasterMakeDetail from './Item_master_make_dtl_tab';
import { createSearchPayloadForItemMstrSpecificSearch, fetchStockPurchaseUnits, generateItemCode, itemMasterDivisionInitData, itemMasterInitData, itemMasterMainTabDtlInitData, itemMasterMakeDtlInitData, runSanitization, triggerLevelFetchConfig, upsertInventoryData } from './Item_master_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import { fetchAppData } from '../../../../utils/fetchUtils';
import _ from 'lodash';
import { validateForm } from '../../../../utils/fn';
import { useSelector } from 'react-redux';
import HelpList from '../../../../components/HelpList';


const ItemMaster = () => {
  const { user } = useSelector(state => state.auth);
  const [dataset, setDataset] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...itemMasterInitData });
  const [mainDtlFormData, setMainDtlFormData] = useState([{ ...itemMasterMainTabDtlInitData }]);
  const [divFormData, setDivFormData] = useState({ ...itemMasterDivisionInitData })
  const [makeFormData, setMakeFormData] = useState([{ ...itemMasterMakeDtlInitData }]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, setSearchQuery, searchQuery } = useFormStatus();
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState('');
  const [helpListHeader, setHelpListHeader] = useState([]);
  const tabs = ["Main", "Additional", "Technical Specs", "Drawing", "Division Detail", "Make Details"];
   const toggleHelpModal = () => setHelpList(!helpList);


 const handleHelpList = (show) => {
    setHelpList(show);
  
  };

  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    case "item":
      setFormData((prev) => ({
        ...prev,
        it_code: data.it_code,
        // it_name: data.it_name,
      }));
      break;
    case "desc":
      setFormData((prev) => ({
        ...prev,
        // it_code: data.it_code,
        it_name: data.it_name,
      }));
      break;
    }
      toggleHelpModal();
  }

  // When levels are changed, fetch data for the dropdown(s)
  useEffect(() => {
    let fetchListType = "typeList";
    if (formData.main_type && formData.it_type && !(formData.it_base || formData.it_sub_c)) {
      fetchListType = "materialBaseList";
    }
    else if (formData.main_type && formData.it_type && formData.it_base && !formData.it_sub_c) {
      fetchListType = "subCategoryList";
    }

    if (formData.main_type) {
      triggerLevelFetchConfig(fetchListType, formData.main_type, formData.it_type, formData.it_base, (data) => {
        setDataset(prev => ({ ...prev, [fetchListType]: data?.configuration?.[fetchListType] }));
      });
    };

  }, [formData.main_type, formData.it_base, formData.it_type, formData.it_sub_c]);

  // Fetch Purchase UOM
  useEffect(() => {
    if (formData.um_code && formData.it_pu_um && formData.um_code !== formData.it_pu_um && !formData.it_p_umf) {
      fetchStockPurchaseUnits({ um_code: formData.um_code, it_pu_um: formData.it_pu_um }, res => {
        if (res?.fieldValue) {
          handleChange("it_p_umf", res.fieldValue?.toString());
          handleChange("it_p_umf_disabled", res?.disabled || "N");
        }
      });
    };
  }, [formData.um_code, formData.it_pu_um]);

  // Fetch Stock UOM
  useEffect(() => {
    if (formData.um_code && formData.it_bom_um && formData.um_code !== formData.it_bom_um && !formData.it_bom_umf) {
      fetchStockPurchaseUnits({ um_code: formData.um_code, it_bom_um: formData.it_bom_um }, res => {
        handleChange("it_bom_umf", res.fieldValue?.toString());
        handleChange("it_bom_umf_disabled", res?.disabled || "N");
      });
    };
  }, [formData.um_code, formData.it_bom_um]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    //console.log("[Inventory Management] Form Submission:: ", formData, formStatus);
    try {
      const isValidFormData = validateForm("it-mngmnt-form", "Inventory Management Master Form");
      if (!isValidFormData) {
        throw new Error("Please fill all the data required.");
      }
      if (!formData.it_code) {
        throw new Error("Please enter item code either manually or generate.");
      }
      const response = await upsertInventoryData(formData, formStatus, user);
      toast.success('Record saved successfully');
      if (formStatus !== "Update")
        setFormData({...itemMasterMainTabDtlInitData});
    } catch (error) {
      console.error("Error Submitting data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  }

  function handleOffset(data) {
    setCurrentRecordNo(data)
  };

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
    setMainDtlFormData([{ ...itemMasterMainTabDtlInitData }]);
  }, []);

  const preloadConfigurationOnFieldChange = async (key, value) => {
    const additionalObj = {};

    switch (key) {
      case "gen_code_manual": {
        if (value === "Y") {
          additionalObj.rev_level =  "00";
          additionalObj.mfg_process_no = "000";
        }
        break;
      }

      case "it_finish": {
        const finishCodeListItem = _.find(dataset?.finishCodeList || [], e => e.code == value);
        if (finishCodeListItem) {
          additionalObj.finish_desc = `[${finishCodeListItem.prefix}] ${finishCodeListItem.description}`;
        }
        break;
      }

      case "it_colour": {
        const colorCodeListItem = _.find(dataset?.colorCodeList || [], e => e.code == value);
        if (colorCodeListItem) {
          additionalObj.colour_desc = `[${colorCodeListItem.prefix}] ${colorCodeListItem.description}`;
        }
        break;
      }

      case "um_code":
      case "it_bom_um":
      case "it_pu_um": {
        const relatedKey = key === "um_code" ? "it_pu_um" : "um_code";
        const stockRelatedKey = key === "um_code" ? "it_bom_um" : "um_code";

        if (key !== "it_bom_um") {
          if (formData[relatedKey] === value) {
            additionalObj.it_p_umf = "1.000";
            additionalObj.it_p_umf_disabled = "Y";
          }
          else {
            additionalObj.it_p_umf = "";
            additionalObj.it_p_umf_disabled = "N";
          }
        };

        if (key !== "it_pu_um") {
          if (formData[stockRelatedKey] === value) {
            additionalObj.it_bom_umf = "1.000";
            additionalObj.it_bom_umf_disabled = "Y";
          }
          else {
            additionalObj.it_bom_umf = "";
            additionalObj.it_bom_umf_disabled = "N";
          }
        };
        break;
      }

      default:
        break;
    }

    return additionalObj;
  };

  // const handleChange = async (name, value) => {
  //   try {
  //     runSanitization(name, value);
  //     let additionalObj = await preloadConfigurationOnFieldChange(name, value);
  //     setFormData(prev => ({ ...prev, [name]: value.toUpperCase(), ...additionalObj }));
  
  //     if (divFormData.hasOwnProperty(name)) {
  //       setDivFormData(prev => ({ ...prev, [name]: value.toUpperCase(), ...additionalObj }));
  //     }
  //   } catch (error) {
  //     toast.error(error?.message);
  //   }
  // };


const handleChange = async (name, value) => {
  try {
    runSanitization(name, value);
    let additionalObj = await preloadConfigurationOnFieldChange(name, value);

    const upperVal = value?.toUpperCase ? value.toUpperCase() : value;

    setFormData(prev => {
      let updated = {
        ...prev,
        [name]: upperVal,
        ...additionalObj
      };

      //  TYPE change → reset both
      if (name === "it_type") {
        updated.it_base = "";
        updated.it_sub_c = "";
      }

      //  MATERIAL BASE change → reset sub only
      if (name === "it_base") {
        updated.it_sub_c = "";
      }

      return updated;
    });

  
    if (divFormData.hasOwnProperty(name)) {
      setDivFormData(prev => {
        let updated = {
          ...prev,
          [name]: upperVal,
          ...additionalObj
        };

        if (name === "it_type") {
          updated.it_base = "";
          updated.it_sub_c = "";
        }

        if (name === "it_base") {
          updated.it_sub_c = "";
        }

        return updated;
      });
    }

  } catch (error) {
    toast.error(error?.message);
  }
};

  const handleChangeDtl = useCallback((name, value, index, event) => {
    const cursorPosition = event.target.selectionStart;
    let newVal = value.toUpperCase();

    setMainDtlFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: newVal };
      return newData;
    });


    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }, []);

  const handleChangeMake = useCallback((name, value, index, event) => {
    const cursorPosition = event.target.selectionStart;
    let newVal = value.toUpperCase();

    setMakeFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: newVal };
      return newData;
    });

    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }, []);

  const triggerAddRow = (type) => {
    switch (type) {
      case "mainDtl":
        setMainDtlFormData((prev) => [...prev, { ...itemMasterMainTabDtlInitData }]);
        break;

      case "makeDtl":
        setMakeFormData((prev) => [...prev, { ...itemMasterMakeDtlInitData }]);
        break;

      default:
        console.warn("Invalid type passed to triggerAddRow:", type);
    }
  };

  const handleCodeGeneration = () => {
    if (!formData.main_type || !formData.it_type || !formData.it_base || !formData.it_sub_c) {
      return;
    }
    const c_level = `${formData.main_type}${formData.it_type}${formData.it_base}${formData.it_sub_c}`;
    handleChange("gen_code_auto", "Y");
    generateItemCode(c_level, data => {
      handleChange("gen_code_auto", "Y");
      handleChange("it_code", data.new_it_code);
      handleChange("rev_level", data.rev_level);
      handleChange("mfg_process_no", data.mfg_process_no);
    });
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log(`[SetupQueryData] Operation: ${btnClicked}`, queryData);
      if (btnClicked === "Insert") {
        setFormData({ ...itemMasterInitData });
        setMainDtlFormData([{ ...itemMasterMainTabDtlInitData }]);
      };

      if (["Query", "Last", "Next", "Prev", "First"].includes(btnClicked)) {
        setFormData(queryData?.masterData);
        setTotalRecordCount(queryData?.totalCount);
        setCurrentRecordNo(queryData?.current);
        setMainDtlFormData(queryData?.masterData?.siteItemsList || []);
      };

      setDataset(queryData?.configuration || {});
    },
    [formStatus, currentRecordNo]
  );

  // const handleSearch = async () => {
  //   try {
  //     const { it_code, it_name } = formData;
  //     let searchPayload = {
  //       appDivisionId: user?.global_division_id,
  //       appFinYear: user?.global_fin_year
  //     };
  //     if (it_code) searchPayload.it_code = it_code;
  //     if (it_name) searchPayload.it_name = it_name;
  //     if (!it_code && !it_name) {
  //       throw new Error("Please enter Code or name for the search");
  //     };

  //     setSearchQuery(searchPayload);
  //     const queryObj = new URLSearchParams(searchPayload)
  //     const data = await fetchAppData(
  //       `${APP_PROD_API.GET_INVENTORY_CONFIG}?form_status=${formStatus}&${queryObj}`
  //     );
  //     setupQueryData(data, "Query");
  //     handleOperation("Query");
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error(error?.message || "Some error occurred");
  //   }
  // };


     const handleSearch = async () => {
             try {
                 setTotalRecordCount(0);
                 setCurrentRecordNo(0);
                 const searchPayload =
                     createSearchPayloadForItemMstrSpecificSearch(formData);
                 const queryList = new URLSearchParams(searchPayload);
     
                 if ([...queryList].length === 0) {
                     toast.error("Please enter search criteria");
                     return;
                 }
     
                 setSearchQuery(searchPayload);
     
                 const data = await fetchAppData(
                     `${APP_PROD_API.GET_INVENTORY_CONFIG}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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
     

  //console.log(`[IT Mngmnt] :: ${formStatus}`);
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
        handleSearch={handleSearch}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_INVENTORY_CONFIG}
        formName={"INVENTORY_MNGMNT_FORM"}
        isQueryReqOnInsertBtn={true}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id="it-mngmnt-form">
              <ItemMasterMain
                apiData={dataset}
                formData={formData}
                handleChange={handleChange}
                mainDtlFormData={mainDtlFormData}
                handleChangeDtl={handleChangeDtl}
                formStatus={formStatus}
                triggerAddRow={() => triggerAddRow("mainDtl")}
                handleCodeGeneration={handleCodeGeneration}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
              />
               {helpList && (
                            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                              <ModalBody>
                                <HelpList
                                  formStatus={formStatus}
                                  helpFor={helpFor}
                                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INVENTORY_CONFIG}`}
                                  helpListHeader={helpListHeader}
                                  handleHelpList={handleHelpList}
                                  onSelectHelpItem={onSelectHelpItem}
                                  queryPera={{ needAppGlobalData: 'Y' }}
                                //  whereClause={helpFor === 'item'?{f_wc_id: formData.wc_id}:{}}
                                />
                              </ModalBody>
                            </Modal>
                       )}
            </Form>
          </TabPane>
          <TabPane tabId={2}>
            <Form>
              <ItemMasterAdditional
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
              />
            </Form>
          </TabPane>
          <TabPane tabId={3}>
            <Form>
              <ItemMasterTechnicalSpecs
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
              />
            </Form>
          </TabPane>
          <TabPane tabId={4}>
            <Form>
              <ItemMasterDrawing
              />
            </Form>
          </TabPane>
          <TabPane tabId={5}>
            <Form>
              <ItemMasterDivisionDetail
                apiData={dataset}
                formData={formData}
                divFormData={divFormData}
                handleChange={handleChange}
                formStatus={formStatus}
              />
            </Form>
          </TabPane>
          <TabPane tabId={6}>
            <Form>
              <ItemMasterMakeDetail
                makeFormData={makeFormData}
                handleChangeMake={handleChangeMake}
                formStatus={formStatus}
                triggerAddRow={() => triggerAddRow("makeDtl")}
              />
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItemMaster;

