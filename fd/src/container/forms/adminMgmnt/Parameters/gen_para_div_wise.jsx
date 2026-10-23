import React, { useState, useCallback, useEffect } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import GenParaDivWiseDtl from "./gen_para_div_wise_detail";
import { genParaDivWiseHelper } from "./gen_para_div_wise_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const GenParaDivWise = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...genParaDivWiseHelper });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  // DROPDOWN DATA

  const [excise, setExcise] = useState([]);
  const [floor, setFloor] = useState([]);
  const [service, setService] = useState([]);
  const [party, setParty] = useState([]);
  const [receive, setReceive] = useState([]);
  const [production, setProduction] = useState([]);
  const [income, setIncome] = useState([]);
  const [rework, setRework] = useState([]);
  const [trading, setTrading] = useState([]);

  const tabs = ["General Parameter Div Wise "];

    // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DIV_WISE_PARAM_DROPDOWNDATA}?appDivision=${user?.global_division_id}`,{
            credentials:'include'});

        if (response.status === 200) {
          const data = await response.json();
          setExcise([
            { value: "", label: "" },
            ...formatOptions(data.excise || [], "wc_id", "description"),
          ]);
          setFloor([
            { value: "", label: "" },
            ...formatOptions(data.floor || [], "wc_id", "description"),
          ]);
          setParty([
            { value: "", label: "" },
            ...formatOptions(data.party || [], "wc_id", "description"),
          ]);
          setService([
            { value: "", label: "" },
            ...formatOptions(data.service || [], "wc_id", "description"),
          ]);
          setReceive([
            { value: "", label: "" },
            ...formatOptions(data.receive || [], "wc_id", "description"),
          ]);
          setProduction([
            { value: "", label: "" },
            ...formatOptions(data.production || [], "wc_id", "description"),
          ]);
          setIncome([
            { value: "", label: "" },
            ...formatOptions(data.income || [], "wc_id", "description"),
          ]);
          setRework([
            { value: "", label: "" },
            ...formatOptions(data.rework || [], "wc_id", "description"),
          ]);
          setTrading([
            { value: "", label: "" },
            ...formatOptions(data.trading || [], "wc_id", "description"),
          ]);
        }
      } catch (error) {
        console.error("Error fetching constants:", error)
      }
    };
    fetchConstantList()

    if(formStatus === 'Insert'){
      setFormData(prev =>({...prev, division_id: user?.global_division_id}))
    }
  },[formStatus]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleCancel = useCallback(() => {
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData({...genParaDivWiseHelper});
    releaseFormStatus()
  } 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const cleanedFormData = { ...formData };
  
      // Optional: Add validation before submitting
      if (!cleanedFormData || Object.keys(cleanedFormData).length === 0) {
        toast.error("Form is empty. Please fill in the required fields.");
        return;
      }
  
      const body = {
        formData: cleanedFormData,
      };

   
      
  
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DIV_WISE_PARAM_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify(body),
          credentials:'include',
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fetch error while submitting");
      }
  
      toast.success("Data saved successfully!");
      formCleanup();
  
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  

  };
  

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

 

  const handleChange = useCallback((name, value) => {
    
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
             return;
         }

    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  }, [formStatus]);

 const setupQueryData = useCallback(
  (queryData, btnClicked) => {

    

    if (queryData?.type === "not_found") {
      toast.error(queryData?.message || "No data found");
      setFormData(null);
       handleCancel()
      setTotalRecordCount(0);
      return;
    }

    if (queryData?.type === "found") {
      setFormData(queryData?.divWiseParam || null);

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.totalCount || 0);
      }
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
        // authority={{insert:"N",update: "Y"}}
        btnEnableDtl={{ insert:false}}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DIV_WISE_PARAM_DATA}
        formName={"General Para Div Wise Form"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form onSubmit={handleSubmit}>
              <GenParaDivWiseDtl
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
                excise={excise}
                floor={floor}
                party={party}
                service={service}
                receive={receive}
                income={income}
                production={production}
                rework={rework}
                trading={trading}
              />
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default GenParaDivWise;
