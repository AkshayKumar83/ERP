import React, { useEffect } from "react";
import { Form,  Modal,ModalBody, ModalHeader,TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import SupplierMasterMainTab from "./supplier_master_main_tab";
import SupplierMasterAdditionalTab from "./supplier_master_additional_info_tab";
import SupplierMasterVendorsTab from "./supplier_master_vendors_banker_tab";
import SupplierMasterIFSCTab from "./supplier_master_IFSC_tab";
import SupplierMasterGSTTab from "./supplier_master_gst_tab";
import {  createSearchPayloadForSupMstrSpecificSearch, supplierMasterInitialData, validateFormDataOnSave, validateGstNo, validatePanNo, validateVcode } from "./supplier_master_helper";
import { formatOptions } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import HelpList from '../../../../components/HelpList';
import toast from "react-hot-toast";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";

const SupplierMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...supplierMasterInitialData });
 const {formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } = useFormStatus();
 const { loading, setLoading, formLoading, setFormLoading } = useFormLoading();
  // BELOW STATE USED FOR DROPDOWN INPUTS
  const [vendType, setVendType] = useState([]);
  const [modeOfTrans, setModeOfTrans] = useState([]);
  const [pricebasis, setPricebasis] = useState([]);
  const [currCodeList, setCurrCodeList] = useState([]);
  const [termCodeList, setTermCodeList] = useState([]);

  // BELOW STATE USED FOR SEARCH Query DROPDOWN INPUTS
  const [vendorCodeList, setVendorCodeList] = useState([]);
  const [vendorNameList, setVendorNameList] = useState([]);

     const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
    const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
    const [helpListHeader, setHelpListHeader] = useState([])

   const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList)
      
    const [diLastCode, setDiLastCode] = useState('')

    const { user } = useSelector((state) => state.auth);

  const tabs = ["Main","Additional Info","Vendors Banker","IFSC Detail","GST"];

  const tabKeyMap = {
  1: "main",
  2: "additionalInfo",
  3: "vendorsBanker",
  4: "ifscDetail",
  5: "gst",
};

  useEffect(() => {
    // HERE I FETCH ALL REQUIRED DROPDOWN DATA
    // REQURIED DATA FOR MAKING THE FORM AUTO OR MANUAL
    const fetchConstantList = async () => {
      try {
        // const response = await fetch(`${API_URLS.GET_LIST_OF_CONSTANTS}`);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_SUPPLIER_LIST_OF_CONSTANTS
          }`,{credentials:'include',}
        );
        if (response.status === 200) {
          const data = await response.json();
          setVendType([
            { value: "", label: "" },
            ...formatOptions(data.vendorType || [], "code", "prefix"),
          ]);
          setModeOfTrans([
            { value: "", label: "" },
            ...formatOptions(data.modeOfTrans || [], "code", "description"),
          ]);
          setPricebasis([
            { value: "", label: "" },
            ...formatOptions(data.priceBasis || [], "code", "description"),
          ]);
          setCurrCodeList([
            { value: "", label: "" },
            ...formatOptions(data.currList || [], "curr_code", "curr_desc"),
          ]);

          setTermCodeList([
             { value: "", label: "" },
            ...formatOptions(data.termCodeList || [], "term_code", "term_desc"),
          ]);

              //   setTermCodeList([
              //   { value: "", label: "" },
              //   ...formatOptions((data.termCodeList || []).slice(0, 200), "term_code", "term_desc"),
              // ]);
          // setFormData((prev) => ({ ...prev, vcode_auto: "N" })); // FOR MANUAL V_CODE ENTRY DO UNCOMMENT IT
          setFormData(prev=>({...prev, vcode_auto:data.vcode_auto}))
        }
      } catch (err) {
      
        
      }
    };
    if (formStatus) {
      fetchConstantList();
    }

   
    
  }, [formStatus]);

   
  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


    // Shows the Help list
    const handleHelpList = (show) => {
        setHelpList(show);
    };

 const onSelectHelpItem = async(data) => {
  let getStateCode;
      if (helpFor === 'city' && data?.country === 'INDIA') {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}?v_city_name=${data.city}`,
          { credentials: 'include' }
        );
        if (!response.ok) {
          console.error("Failed to fetch supplier form data");
          return;
        }
        const result = await response.json();
        getStateCode = result?.locationData?.gst_state_code
        //console.log("State code result:", result);
        // If you need to update formData with fetched info, do it here
      }
        setFormData((prev) => {
          switch (helpFor) {
            case "city":
              return { 
                ...prev,              
                v_city_name: data.city,
                v_district:data.district,
                v_state:data.state,
                v_zone:data.zone,
                v_country:data.country,
                v_region:data.region,
                v_city:data.ctycode, 
                gst_state_code:getStateCode,
              };

                case "vendorCode":
              return { ...prev, v_code: data.v_code, v_name: data.v_name };
              
            case "vendorName":
              return { ...prev, v_code: data.v_code, v_name: data.v_name };

              case "taxCode":
                return { ...prev,tax_code: data.tax_code,tax_desc: data.tax_desc};
            default:
              return prev;
          }
        });
      };

    function handleOffset(data) {
        setCurrentRecordNo(data);
      }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData(supplierMasterInitialData);
     setDiLastCode('')
       setActiveTab(1);
  }, []);

 
  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
    
      setFormData(queryData?.supplierMstr);
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.count);
      }
    },
    [formStatus, currentRecordNo]
  );


    //     const validateTab = (tab) => {
    //     const requiredFields = {
    //   main: ["v_name", "v_add1", "v_city_name", 'v_zip_code','vend_type'],
    //   additionalInfo: ["telephone1", "email"],
    //   vendorsBanker: ['pan_no'],
    //   ifscDetail: [],
    //   gst: [],
    // };

    // if (formData?.whether_gst_registered_dlr === 'Y') {
    //   requiredFields.gst.push('gst_no');
    // }

    // const fieldsToCheck = requiredFields[tab] || [];

    // const emptyField = fieldsToCheck.find(field => !formData[field]?.trim());

    // if (emptyField) {
    //   toast.error(`Please fill in the ${emptyField.replace('_', ' ')} field.`);
    //   document.getElementsByName(emptyField)[0]?.focus();
    //   return false;
    // }

    // return true;
    //       };

       const validateTab = (tab) => {
       const requiredFields = {
    main: ["v_name", "v_add1", "v_city_name", 'v_zip_code','vend_type'],
    additionalInfo: ["telephone1", "email"],
    vendorsBanker: ['pan_no'],
    ifscDetail: [],
    gst: [],
  };

  if (formData?.whether_gst_registered_dlr === 'Y') {
    requiredFields.gst.push('gst_no');
  }

  const fieldsToCheck = requiredFields[tab] || [];

  const emptyField = fieldsToCheck.find(field => !formData[field]?.trim());

  if (emptyField) {
    toast.error(`Please fill in the ${emptyField.replace('_', ' ')} field.`);
    document.getElementsByName(emptyField)[0]?.focus();
    return { valid: false, invalidField: emptyField };
  }

  return { valid: true };
};


//       const handleTabChange = (newTab) => {
//   if (formStatus === 'Query' || !formStatus) {
//     setActiveTab(newTab);
//     return;
//   }

//   const currentTabKey = tabKeyMap[activeTab];
//   if (validateTab(currentTabKey)) {
//     setActiveTab(newTab);
//   }
// };

const handleTabChange = (newTab) => {
  if (formStatus === 'Query' || !formStatus) {
    setActiveTab(newTab);
    return;
  }

  const currentTabKey = tabKeyMap[activeTab];
  const { valid } = validateTab(currentTabKey);

  if (valid) {
    setActiveTab(newTab);
  }
};



    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        setFormLoading(true);

        // // Step 1: Validate all tabs
        // const tabs = ["main", "additionalInfo", "vendorsBanker", "ifscDetail", "gst"];
        // for (const tab of tabs) {
        //     if (!validateTab(tab)) {
        //         setActiveTab(tab); // Switch to invalid tab
        //         setFormLoading(false);
        //         return;
        //     }
        // }

              // All tabs
    const tabsToValidate = ["main", "additionalInfo", "vendorsBanker", "ifscDetail", "gst"];

    for (const tab of tabsToValidate) {
      const result = validateTab(tab);

      if (!result.valid) {
        const tabId = Object.keys(tabKeyMap).find(key => tabKeyMap[key] === tab);
        if (tabId) setActiveTab(Number(tabId));
        setFormLoading(false);
        return;
      }
    }
        


        // Step 2: Validate form data
        const validationResult = validateFormDataOnSave(formData);
        if (!validationResult) {
            setFormLoading(false);
            return;
        }

        // Step 3: Validate PAN and GST
        if (!validatePanNo(formData, formStatus)) {
            setFormLoading(false);
            return;
        }

        if (!validateGstNo(formData)) {
            setFormLoading(false);
            return;
        }

        // Step 4: Validate vendor code (if not auto-generated)
        if (formData.vcode_auto === 'N') {
            const isValideVCode = await validateVcode(formData.v_code, formData.vcode_auto);
            if (!isValideVCode) {
                setFormLoading(false);
                return;
            }
        }

        // Step 5: Fill missing legal name
        if (!formData.v_legal_name) {
            formData.v_legal_name = formData.v_name;
        }

        // Step 6: Prepare API call
        // const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_SUPPLIER_MSTR_DATA}?form_status=${formStatus}&appDivisionId=${user.division_id}&appFinYear=${user.trans_year}&userId=${user.user_id}`;
        const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_SUPPLIER_MSTR_DATA}?form_status=${formStatus}&appDivisionId=${user.global_division_id}&appFinYear=${user.global_fin_year}&userId=${user.id}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({
                formData: { ...formData, vcode_auto: 'Y' }, // Force auto code if needed
                user
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials:'include',
        });

        // Step 7: Handle API Response
        if (response.ok) {
            toast.success(`Form ${formStatus === 'Insert' ? 'Saved' : 'Updated'} successfully`);
            handleCancel();
        } else {
            const result = await response.json();
            toast.error(result.errMsg || result.message || "Update failed.");
        }

    } catch (error) {
        console.error(" Submit Error:", error);
        toast.error(error?.message || "Please check all the form fields or contact administrator");
    } finally {
        setFormLoading(false);
    }
};

 
  const handleChange = useCallback((name, value, event) => {
     if (!["Insert", "Update", "Search"].includes(formStatus)) return;
  
     if (name === "v_city_name") {
    return; // ignore user input
  }
   const cursorPosition = event?.target?.selectionStart;
  let newVal = value;

  if (typeof value !== "number" && typeof value === "string") {
    newVal = newVal.toUpperCase();
  }

  // 🔹 Only allow numbers with max 2 decimal places in "trunover"
  if (name === "turnover") {
    const regex = /^\d*\.?\d{0,2}$/;  
    if (!regex.test(newVal)) {
      return; //  Prevent invalid inputtds_perc
    }
  }
    
     setFormData((prev) => ({...prev,
    [name]: name === "email" ? value.toLowerCase() : value.toUpperCase(),
      }));

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
  }, [formStatus]);
  
  

    const setFormDataOnValidateField=(data)=>{
        setFormData(data)
    }

   const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForSupMstrSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_SUPPLIER_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
            user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={tabs}
      // updateActiveTab={updateActiveTab}
      updateActiveTab={handleTabChange}
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
      QUERY_API={APP_PROD_API.GET_SUPPLIER_FORM_DATA}
      searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      formName={"Supplier Master"}
    >
      <TabContent activeTab={activeTab}>
        {/* Main Tab */}
        <TabPane tabId={1}>
          <Form id="supplier-main-tab">
            <SupplierMasterMainTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              vendType={vendType}
              // vendorNameList={vendorNameList}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              setFormDataOnValidateField={setFormDataOnValidateField}
              diLastCode={diLastCode}
              handleDiLastCode={(data)=>setDiLastCode(data)}
            />
              {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{needAppGlobalData:'Y'}}
                  />
                </ModalBody>
              </Modal>
            )}
          </Form>
        </TabPane>
        <TabPane tabId={2}>
          <Form>
            <SupplierMasterAdditionalTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              modeOfTrans={modeOfTrans}
              pricebasis={pricebasis}
              currCodeList={currCodeList}
              termCodeList={termCodeList}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
            />
          </Form>
        </TabPane>
        <TabPane tabId={3}>
          <Form>
            <SupplierMasterVendorsTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </Form>
        </TabPane>
        <TabPane tabId={4}>
          <Form>
            <SupplierMasterIFSCTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </Form>
        </TabPane>
        <TabPane tabId={5}>
          <Form>
            <SupplierMasterGSTTab
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
            />
          </Form>
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default SupplierMaster;
