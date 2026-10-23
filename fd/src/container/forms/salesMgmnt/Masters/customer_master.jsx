import React, { useEffect } from "react";
import { Form,Modal,ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import CustomerMasterMainTab from "./customer_master_main_tab";
import { createSearchPayloadForCusMstrSpecificSearch, customerMstrInitDataTemplate, DiscountTabInitData, setShipBillFlag, validateCcode, validateCustMstrFormOnSave } from "./customer_master_helper";
import CustomeMasterAdditionalTab from "./customer_master_additional_tab";
import CustomerMasterTaxInfoTab from "./customer_master_taxInfo_tab";
import CustomerMasterDiscount from "./customer_master_discount";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from '../../../../components/HelpList';

  const CustomerMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...customerMstrInitDataTemplate }); 
  const [disFormData, setDisFormData] = useState([{...DiscountTabInitData}]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } =  useFormStatus(); 
         const [diShipBillCode, setDiShipBillCode] = useState('')
         const [updDiscountData, setUpdDiscountData] = useState([])
         const [delDiscountData, setDelDiscountData] = useState([])

     // BELOW STATE USED FOR DROPDOWN INPUTS
    const [custType, setCustType] = useState([])
    const [custInd, setCustInd] = useState([])
    const [modeOfTrans, setModeOfTrans] = useState([])
    const [pricebasis, setPricebasis] = useState([])
    const [currCodeList, setCurrCodeList] = useState([])
    const [termCodeList, setTermCodeList] = useState([])

        // BELOW STATE USED FOR SEARCH Query DROPDOWN INPUTS
      //  const [customerCodeList, setCustomerCodeList] = useState([])
      //  const [customerNameList, setCustomerNameList] = useState([])

      const tabs = ["Main", "Additional", "Tax Info"];
     const { user } = useSelector((state) => state.auth);
       
          const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
         const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
         const [helpListHeader, setHelpListHeader] = useState([])
     
        const [isHelpModelOpen, setIsHelpModelOpen] = useState()
         const toggleHelpModal = () => setHelpList(!helpList)
           const [whereClause, setWhereClause] = useState({})

 const tabKeyMap = {
  1: 'main',
  2: 'additional',
  3: 'taxInfo',
  4: 'discount',
 }

      useEffect(() => {
        // HERE ALL REQUIRED DROPDOWN DATA FETCHED
        // REQURIED DATA FOR MAKING THE FORM AUTO OR MANUAL
        const fetchConstantList = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUST_LIST_OF_CONSTANTS}`,{
                  credentials:"include"
                });
                if (response.status === 200) {
                    const data = await response.json();
                    setCustType([{value:'', label: ''}, ...formatOptions(data.custType || [], "code", "description")]);
                    setModeOfTrans([{value:'', label: ''}, ...formatOptions(data.modeOfTrans || [], "code", "description")]);
                    setPricebasis([{value:'', label: ''}, ...formatOptions(data.priceBasis || [], "code", "description")]);
                    setCurrCodeList([{value:'', label: ''}, ...formatOptions(data.currList || [], "curr_code", "curr_desc")]);  
                    setTermCodeList([{value:'', label: ''}, ...formatOptions(data.termCodeList || [], "term_code", "term_desc")]);  
                    setCustInd([{value:'', label: ''}, ...formatOptions(data.cust_ind || [], "code", "description")]);  
                    // setFormData(prev=>({...prev, ccode_auto:'N'})) // FOR MANUAL V_CODE ENTRY DO UNCOMMENT IT
                    setFormData(prev=>({...prev, ccode_auto:data.ccode_auto}))
                }
            } catch (err) {
                console.log(err);
            }
        };
            

        if ( formStatus) {
            fetchConstantList();
        }     

    },[formStatus]);
     
     const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForCusMstrSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_CUSTOMER_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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

    const updateActiveTab = useCallback((tab) => {
      setActiveTab(tab);
    }, []);

    function handleOffset(data) {
      setCurrentRecordNo(data);
    }

    const handleCancel = useCallback(() => {
        releaseFormStatus();
        setFormData(customerMstrInitDataTemplate);
        setDiShipBillCode('')
        // setDisFormData([...DiscountTabInitData])
    }, [releaseFormStatus]);

    // Shows the Help list
    const handleHelpList = (show) => {
        setHelpList(show);
    };

      const onSelectHelpItem = async(data) => {
         let getStateCode;
      if (helpFor === 'city' && data?.country === 'INDIA') {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_FORM_DATA}?c_city_name=${data.city}`,
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
                      c_city_name: data.city,
                      c_district:data.district,
                      c_state:data.state,
                      c_zone:data.zone,
                      c_country:data.country,
                      c_region:data.region,
                      c_city:data.ctycode, 
                      gst_state_code:getStateCode,
                    };

                      case "CCode":
                    return { ...prev, c_code: data.c_code, c_name: data.c_name };
                      case "CName":
                    return { ...prev, c_code: data.c_code, c_name: data.c_name };
                      case "shipBillCode":
                    return { ...prev, ship_bill_code: data.c_code, ship_bill_name: data.c_name };
                    
                  case "supplierCode":
                    return { ...prev, c_v_code: data.v_code, c_v_name: data.v_name };

                    case "salePerson":
                      return { ...prev,sales_per_cd: data.emp_cd,emp_name: data.emp_name};

                        case "supplierCodeAlloted":
                      return { ...prev,cus_v_code: data.v_code,};

                        case "stockistCode":
                      return { ...prev,stockist_code: data.c_code,};
                  default:
                    return prev;
                  
                    
                }
              });
        };

    const setupQueryData = useCallback((queryData, btnClicked) => {

       if (queryData?.type === "not found") {
          toast.error("No data found");
          handleCancel()
          setFormData({});
          setDisFormData([]);
          setTotalRecordCount(0);
          return;
        }
          
      setFormData(prev=>{
        return {
          ...prev, ...queryData?.customerMstr
        }
      })

      setDisFormData(queryData?.discountDetail)
      if(btnClicked === 'Query'){
        setTotalRecordCount(queryData?.count)
      }
      },
      [formStatus, currentRecordNo]
    );
    
    const validateTab = (tab) => {
    const requiredFields = {
        main: ["c_name","cust_type","c_add1", "c_city_name", "c_zip_code"],
        additional: [],
        taxInfo: [],
        discount: []
    };

    // Only add ship_bill_code to required fields if ship_bill_flag is S, B, or A
    if (formData?.ship_bill_flag === "S" || formData?.ship_bill_flag === "B" || formData?.ship_bill_flag === "A") {
        requiredFields.main.push("ship_bill_code");
    }

    // Add GST number validation if applicable
    if (formData?.whether_gst_registered_dlr === "Y") {
        requiredFields.taxInfo = [...requiredFields.taxInfo, "gst_no"];
    }

    const emptyField = requiredFields[tab]?.find(
        (field) => !formData[field]?.trim()
    );

    if (emptyField) {
        // Customize error message for ship_bill_code based on ship_bill_flag
        if (emptyField === "ship_bill_code" && formData?.ship_bill_flag !== "N") {
            const label = setShipBillFlag(formData.ship_bill_flag);
            toast.error(`${label} cannot be blank`);
        } else {
            toast.error(`Please fill in the ${emptyField.replace("_", " ")} field.`);
        }

        const targetElement = document.getElementsByName(emptyField)[0];
        if (targetElement) {
            targetElement.focus();
        } else {
            console.warn(`Element with name ${emptyField} not found in DOM.`);
        }
        return false;
    }

    return true;
};
    
      const handleTabChange = (newTab) => {
        if(formStatus === 'Query' || !formStatus){
            setActiveTab(newTab)
            return
        }else{
            const currentTabKey = tabKeyMap[activeTab];
            if (validateTab(currentTabKey)) {
                setActiveTab(newTab)
            }
        }
      }
            
    // submit logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
           
            // Validate all tabs
            const tabs = ["main", "additional", "taxInfo", "discount"];
            for (const tab of tabs) {
                if (!validateTab(tab)) {
                    setActiveTab(tab); // Switch to the tab with invalid fields
                    return; // Stop submission if any tab is invalid
                }
            }
    
            // Validate main form data
            const validationResult = validateCustMstrFormOnSave(formData, formStatus, diShipBillCode);
            if (!validationResult) {
              
                return;
            }

            // validate Customer code
            if(formData.ccode_auto === 'N'){
                const isValideCCode = await validateCcode(formData.c_code, formData.ccode_auto)
                if(!isValideCCode){
                    return;
                }
            }
            if(!formData.c_legal_name){
                setFormData({...formData, c_legal_name: formData.c_name})
            }
            

            // let formPayload = {...formData, c_legal_name: formData.c_name}
            let formPayload = {}
            let discountDetail = disFormData.filter((ele) => ele.disc_id && ele.disc_id.trim() !== '' && !ele.hasOwnProperty('create_date'));
            if(formStatus === 'Insert'){
                formPayload = {formData:{...formData, c_legal_name: formData.c_name}, discountDetail: [...discountDetail], user}
            }else if(formStatus === 'Update'){
                formPayload = {
                    formData: { ...formData, c_legal_name: formData.c_name },
                    // newDiscountDetail: [...discountDetail],
                    // udpatedDiscountDetail:[...updDiscountData],
                    // deletedDiscountDetial:[...delDiscountData],
                    user,
                };
            }
            const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CUSTOMER_FORM_DATA}?form_status=${formStatus}`, {
                method: "POST",
                // body: JSON.stringify({formData: formPayload, discountDetail: [...discountDetail], user}),
                body: JSON.stringify(formPayload),
                headers: {"Content-Type": "application/json"},
                credentials:'include'
            });
    
            if (response.ok) {
                toast.success(`Form ${formStatus === 'Insert' ? 'Saved' : 'Updated'} successfully`);
                handleCancel()
            } else {
                const result = await response.json()
                toast.error(result.errMsg || result.message || "Update failed.")
             
            }
    
        } catch (error) {
         
             toast.error(error?.message || "Please check all the form fields or contact administrator");
            // console.error(error)
        } 
    };

   const handleChange = (tab, name, value, event) => {
    
    if(!["Insert","Update","Search"].includes(formStatus)) return;

    const cursorPosition = event?.target?.selectionStart;
  
    // Convert to lowercase for email, con_per1_email, and con_per2_email; otherwise, uppercase
  const newVal = ["email", "con_per1_email", "con_per2_email"].includes(name)
    ? value.toLowerCase()
    : value.toUpperCase();

    switch (tab) {
      case "MainTab":
        setFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "AdditionalTab":
        setFormData((prev) => ({ ...prev, [name]: newVal }));
        break;;
        case "TaxInfoTab":
          setFormData((prev) => ({ ...prev, [name]: newVal }));
          break;
          // case "DiscountTab":
          //   setDisFormData((prevData) => {
          //     const newData = [...prevData];
          //     newData[index] = { ...newData[index], [name]: newVal };
          //     return newData;
          //   });
          //   break;
      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target) event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
   };

     const handleDiscountChanges = useCallback((name, value, index) => {
        let newVal = value.toUpperCase();
        setDiscountData((prevData) => {
            const newData = [...prevData];
            newData[index] = {
                ...newData[index],
                [name]: newVal,
            };
            return newData;
        });
    }, []);

        const handleAddRow = useCallback(() => {
            setDiscountData((prevData) => [...prevData, {...discountInitData[0],},]);
        }, [formData]);
    
        // delete categoryData row
        const handleDelete = useCallback((data, index) => {
            if(data?.create_date){
               let newDeleteData = [...delDiscountData]
               newDeleteData.push(data)
               setDelDiscountData(newDeleteData)
            }
            setDisFormData((prevData) =>prevData.filter((_, rowIndex) => rowIndex !== index));
        }, [delDiscountData]);
    
        const handleUpdate = useCallback((data) => {
           
            let updatedDicountDetail = [...updDiscountData];
        
            if (!data.hasOwnProperty('create_date')) {
                return;
            }
    
            const existingRecord = updatedDicountDetail.some(record => 
                Object.keys(record).every(key => record[key] === data[key])
            );
    
            if (existingRecord) {
                return;
            }
        
            updatedDicountDetail.push(data);
            setUpdDiscountData(updatedDicountDetail);
        }, [updDiscountData]);
    

    const setFormDataOnValidateField=(data)=>{
        setFormData(data)
    }
 


  return (
    <React.Fragment>
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
        QUERY_API={APP_PROD_API.GET_CUSTOMER_FORM_DATA}
        searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      //  authority={{ insert: "N", update: "N" }}
        formName={"Customer Master"}
        // btnEnableDtl={{insert:false, update:false}}
      >
        <TabContent activeTab={activeTab}>
          {/* Main Tab */}
          <TabPane tabId={1}>
            <Form id = 'customer-main-tab'>
              <CustomerMasterMainTab
                formData={formData}
                custType={custType}
                custInd={custInd}
                handleChange={(name, value,e) => handleChange("MainTab", name, value,e)}
                formStatus={formStatus}
                // customerNameList ={customerNameList}

                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                setFormDataOnValidateField={setFormDataOnValidateField}
                diShipBillCode={diShipBillCode}
                handleDiShipBillCode={(data)=>setDiShipBillCode(data)}
              />
                {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_FORM_DATA}`}
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
              <CustomeMasterAdditionalTab
                formData={formData}
                modeOfTrans={modeOfTrans}
                pricebasis={pricebasis}
                currCodeList={currCodeList}
                termCodeList={termCodeList}
                handleChange={(name, value,e) => handleChange("AdditionalTab", name, value,e)}
                formStatus={formStatus}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                setFormDataOnValidateField={setFormDataOnValidateField}
              />
            </Form>
          </TabPane>
          <TabPane tabId={3}>
            <Form>
              <CustomerMasterTaxInfoTab 
              formData={formData}
              handleChange={(name, value,e) => handleChange("TaxInfoTab", name, value,e)}
              formStatus={formStatus}
              />
            </Form>
          </TabPane>
          {/* <TabPane tabId={4}>
              <CustomerMasterDiscount 
              disFormData={disFormData}
              handleChange={(name, value, index, event) => handleChange("DiscountTab", name, value, index, event)}
              formStatus={formStatus}
              handleAddRow={handleAddRow}
              handleDelete={handleDelete} 
              handleUpdate={handleUpdate}
              />
          </TabPane> */}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default CustomerMaster;



