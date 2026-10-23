import React, { useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import AllMemberReactReportHdr from "./allMemberReactReportHdr";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { emfaInitialFormData, membershipInitialFormData } from "./allMemberReactReportHelper";
import MemberDashboard from "./memberDashboard";
import MemberTable from "./memberTable.jsx"
import EmfaTable from "./emfaTable.jsx";
import EmfaDashboard from "./emfaDashboard.jsx";
import { formatOptions } from "../../../../lib/index.js";


 const AllMemberReactReport = () => {
  const [activeTab, setActiveTab] = useState(1);
   const [currentRecordNo, setCurrentRecordNo] = useState(0);
   const [totalRecordCount, setTotalRecordCount] = useState(0);
   const [formData, setFormData] = useState({...membershipInitialFormData});
   const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
     useFormStatus();
 const [emfaFormData, setEmfaFormData] = useState({ ...emfaInitialFormData });
 const [selectedReport, setSelectedReport] = useState("MEMBER"); // or "EMFA"

 const [dlrName, setDlrName] = useState([]);

 
   const tabs = ["Report Form", "Report Data"];
   const [reportData, setReportData] = useState([]);
 
   const updateActiveTab = useCallback((tab) => {
     setActiveTab(tab);
   }, []);

useEffect(() => {
  const fetchConstantList = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DLR_NAME_LIST_OF_CONSTANTS}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setDlrName([
          { value: "", label: "" },
          ...formatOptions(data.dlrNameList || [], "dealer_code", "dlr_name"),
        ]);
      }
    } catch (error) {
      console.log("fetchConstantList error:", error);
    }
  };

  fetchConstantList();
}, []);



const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    let apiUrl = "";
    let reportType = "MEMBER"; // default

    if (emfaFormData.dlr_name) {
      reportType = "EMFA";
      apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMFA_REPORT_DATA}?emfa_data=true&dlr_name=${emfaFormData.dlr_name}`;
    } else if (emfaFormData.from_date && emfaFormData.to_date) {
      reportType = "EMFA";
      apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMFA_REPORT_DATA}?emfa_data=true&from_date=${emfaFormData.from_date}&to_date=${emfaFormData.to_date}`;
    } else {
      reportType = "MEMBER";
      apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_MEMBER_REPORT_DATA}?get_data=true&report_type=${formData.report_type || "A"}`;
    }

    setSelectedReport(reportType);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }

    const data = await response.json();
    setReportData(data);
    // handleCancel()

     toast.success(`Data fetched successfully for ${reportType}!`);
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(error.message || "Please check all form fields");
  }
};



    
   function handleOffset(data) {
     setCurrentRecordNo(data);
   }
 
   const handleCancel = useCallback(() => {
     // Implement cancel logic here
     releaseFormStatus();
     setFormData({});
     setEmfaFormData({})
   }, []);
 
const handleChange = useCallback((type, name, value) => {
  if (type === "member") {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSelectedReport("MEMBER");
  } else if (type === "emfa") {
    setEmfaFormData((prev) => ({ ...prev, [name]: value }));
    setSelectedReport("EMFA");
  }
}, []);

 
  
 
   const setupQueryData = useCallback(
     (queryData, btnClicked) => {
       // setMemberDirectoryData(hasDirectory ? transformDirectoryData(queryData?.directory): [directoryInitialFormDataTemplate]);
     },
     [formStatus, currentRecordNo]
   );
 
   console.log("formStatus from memberform", formStatus);
   return (
     <React.Fragment>
       <FormSetup
         navType="tabs"
         activeTab={activeTab}
         tabs={tabs}
         updateActiveTab={updateActiveTab}
         formStatus={'Insert'}
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
         formName={"Block Payment Option"}
         btnEnableDtl={{query:false, search:false, insert:false}}
       >
         <TabContent activeTab={activeTab}>
           <TabPane tabId={1}>
             <AllMemberReactReportHdr
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              emfaFormData={emfaFormData}
              dlrName={dlrName}
             />
      {/* <MemberReportChart 
    reportData={reportData} 
    reportType={formData.report_type} 
  /> */}
   {/* <MemberDashboard reportData={reportData}/> */}
   {/* {reportData.length > 0 && (
  <MemberDashboard reportData={reportData} />
)} */}

{reportData.length > 0 && (
  selectedReport === "EMFA" ? (
    <EmfaDashboard reportData={reportData}
     dlrNameSelected={emfaFormData.dlr_name} />
  ) : (
    <MemberDashboard reportData={reportData} />
  )
)}
             </TabPane>
          {/* <TabPane tabId={2}>
           <MemberDashboard reportData={reportData}/>
           </TabPane> */}
           <TabPane tabId={2}>
            {/* <div className="d-flex justify-content-end mb-2">
              <Button
                variant="contained"
                color="primary"
                onClick={() => exportToExcel(reportData, "MemberReport.xlsx")}
              >
                Export to Excel
              </Button>
            </div> */}
             {/* <AllMemberReportGRidData rows={reportData}
             /> */}
             
             {/* <MemberTable data={reportData}/> */}
             
             {/* {selectedReport && (
  selectedReport === "EMFA" ? (
    <EmfaTable data={reportData} />
  ) : (
    <MemberTable data={reportData} />
  )
)} */}

{reportData.length > 0 && (
  selectedReport === "EMFA" ? (
    <EmfaTable data={reportData} />
  ) : (
    <MemberTable data={reportData} />
  )
)}

           </TabPane>
         </TabContent>
       </FormSetup>
     </React.Fragment>
   );
 };


export default AllMemberReactReport