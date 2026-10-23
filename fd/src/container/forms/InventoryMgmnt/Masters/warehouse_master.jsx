
import React, { useEffect, useCallback, useState } from "react";
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import WarehouseMasterMain from "./warehouse_master_main";
import { checkDuplicateWorkCenterNo, createSearchPayloadForWorkCntrSpecificSearch, handleValidationOnSave, hasDuplicateWcIdAndSkillId, hasDuplicateWcIdAndWefDate, WorkCenterInitData, WorkCenterMcRateInitData, WorkCenterSkillInitData } from "./warehouse_master_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useSelector } from "react-redux";
import HelpList from "../../../../components/HelpList";
import { dateFormatter } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";

const WareHouseMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...WorkCenterInitData });
  const [mcRateData, setMcRateData] = useState([]);
  const [skillSetData, setSkillSetData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
        setSearchQuery, } = useFormStatus();
  // const [wcIdGenerated, setWcIdGenerated] = useState(false);

  const [divisionID, setDivisionId] = useState([]);
  const [department, setDepartment] = useState([]);
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [currentHelpRowIndex, setCurrentHelpRowIndex] = useState(-1);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const toggleHelpModal = () => setHelpList(!helpList);

  const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleOffset = (data) => {
    setCurrentRecordNo(data);
  };

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const formCleanup = () => {
    setFormData({});
    setMcRateData([]);
    setSkillSetData([]);
    // setWcIdGenerated(false);
    releaseFormStatus();
  };

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WORK_CENTER_DROPDOWNDATA}`, {
          credentials: "include",
        });
        if (response.status === 200) {
          const data = await response.json();
          setDivisionId([{ value: "", label: "" }, ...formatOptions(data.divisionID || [], "division_id", "name")]);
          setDepartment([{ value: "", label: "" }, ...formatOptions(data.department || [], "dept_cd", "department")]);
          setFormData((prev) => ({ ...prev }));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (formStatus) {
      fetchConstantList();
    }
  }, [formStatus]);

  const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setCurrentHelpRowIndex(rowIndex);
  };

  const onSelectHelpItem = (data) => {
    switch (helpFor) {
      case "mainWorkCenter":
        setFormData((prev) => ({
          ...prev,
          main_wc_id: data.wc_id,
          work_centre_no: data.wc_no,
        }));
        break;
      case "skillDesc":
        setSkillSetData((prevData) => {
          const newData = [...prevData];
          const targetIndex = currentHelpRowIndex !== -1 ? currentHelpRowIndex : prevData.length - 1;
          newData[targetIndex] = {
            ...newData[targetIndex],
            skill_id: data.skill_id,
            skill_desc: data.skill_desc,
            skill_type: data.skill_type,
            wc_id: formData?.wc_id,
          };
          return newData;
        });
        break;
         case "wcNo":
        setFormData((prev) => ({
          ...prev,
          wc_no: data.wc_no,
             description: data.description,
        }));
        break;
         case "Desc":
        setFormData((prev) => ({
          ...prev,
          wc_no: data.wc_no,
          description: data.description,
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }
    try {

      const isValid = handleValidationOnSave(formData);
      if (!isValid) {
        return;
      }

       // Check mc_hr_rate values
    const invalidMcRate = mcRateData.some(row => parseFloat(row.mc_hr_rate) <= 0 || isNaN(row.mc_hr_rate));
    if (invalidMcRate) {
      toast.error("Machine Hour Rate  must be greater than Zero.");
      return;
    }

      // validate mc_rate block
      // Check for duplicate rows in mcRateData
    if (hasDuplicateWcIdAndWefDate(mcRateData)) {
      toast.error("Duplicate wc_id and wef_date combination found in Machine Rate section.");
      return;
    }


    if (hasDuplicateWcIdAndSkillId(skillSetData)) {
      toast.error("Duplicate Skill and description combination found in Skill  section.");
      return;
    }

    // check valid work center
    let isDupWorkCentr = await checkDuplicateWorkCenterNo({wc_no: formData?.wc_no, formStatus, formData})

    if (!isDupWorkCentr) {
        document.getElementById("wc_no").focus();
        // console('yes is it duplicate')
        return;
    }
// return

      const payload = {
        formData,
        mcRateData: mcRateData.map((row) => ({
          ...row,
          fin_engg: "E",
        })),
        skillSetData,
      };

      let method = formStatus === "Insert" ? "POST" : "PUT";

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_WORK_CENTER_MASTER_DATA}?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Can't fecthing error while submiting form");
      }

      if (data.type === "success") {
        toast.success("Data saved successfully!");
        formCleanup();
      } else {
        toast.error(data.message || "Can't fecthing error while submiting form");
      }
    } catch (error) {
      toast.error(error.message || "Please check all the form fields or contact administrator");
    }
  };

  const handleChange = useCallback(
    (stateKey, name, value, index, event) => {

if(!["Insert","Update","Search"].includes(formStatus)) return

      const cursorPosition = event?.target?.selectionStart;

      if (["work_centre_no"].includes(name)) {
    toast.error("Please select value from Help List (double click)");
    return;
  }

  if (name === "efficiency" || name === "labour_burden_rate") {
  // allow 1-100 with max 2 decimal places, zero not allowed
  if (
    value === "" || 
    /^(100(\.0{0,2})?|([1-9]\d?)(\.\d{0,2})?)$/.test(value)
  ) {
    if (stateKey === "formData") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }
  return;
}


if (
  name === "setup_crew_no" || name === "operator_crew_no" ||
  name === "helper_crew_no" || name === "no_of_machine"
) {
  // only integers allowed
  if (value === "" || /^\d*$/.test(value)) {
    if (stateKey === "formData") {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }
  return;
}

if (
  name === "setup_crew_rate" || name === "operator_crew_rate" ||
  name === "helper_crew_rate"
) {
  // positive number with max 2 decimals
  if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
    if (stateKey === "formData") {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }
  return;
}

      if (name === "deleteRow") {
        if (stateKey === "mcRateData") {
          setMcRateData(value);
          if (value.length > 0) {
            const lastRate = value[value.length - 1]?.mc_hr_rate || "";
            setFormData((prev) => ({ ...prev, machine_hour_rate: lastRate }));
          } else {
            setFormData((prev) => ({ ...prev, machine_hour_rate: "" }));
          }
        }
        if (stateKey === "skillSetData") {
          setSkillSetData(value);
        }
        return;
      }

      let newVal = typeof value === "string" ? value.toUpperCase() : value;

      if (stateKey === "formData") {
        setFormData((prev) => ({ ...prev, [name]: newVal }));
      }

      
      if (stateKey === "mcRateData") {
        setMcRateData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          if (name === "mc_hr_rate") {
            setFormData((prev) => ({ ...prev, machine_hour_rate: newVal }));
          }
          return newData;
        });
      }

     
      if (stateKey === "skillSetData") {
        setSkillSetData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
      }

       if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  ) {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }
    },
    [setFormData, setMcRateData, setSkillSetData, formStatus]
  );


const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (!queryData) return;

     if (queryData.type === "not_found") {
      toast.error("No data found");
      handleCancel();
      setFormData()
      setSkillSetData([])
      setMcRateData([])
      return
    }

    const { mommwcData, sub_work_centre, work_centre_no, mdmmwcData, moemwcSkillData, count } = queryData;

    if (mommwcData) {
      setFormData({
        ...mommwcData,
        sub_work_centre,
        work_centre_no,
        original_wc_no:mommwcData?.wc_no
      });
    }

    if (mdmmwcData) {
      if (mdmmwcData.length > 0) {
        const formattedData = mdmmwcData.map((item) => ({
          ...item,
          wef_date: item.wef_date ? dateFormatter(item.wef_date) : "",
        }));
        setMcRateData(formattedData);
      } else {
        setMcRateData([]);
      }
    }

    if (moemwcSkillData) {
      setSkillSetData(moemwcSkillData.length > 0 ? moemwcSkillData : []);
    }

    if (btnClicked === "Query") {
      setTotalRecordCount(count || 0);
    }
  },
  [formStatus, currentRecordNo, setFormData, setMcRateData, setSkillSetData]
);


  const triggerAddRow = (section) => {
    if (section === "MC-Rate") {
      const lastMcRow = mcRateData[mcRateData.length - 1];
      if (lastMcRow && (!lastMcRow.mc_hr_rate || !lastMcRow.wef_date)) {
        toast.error("Please fill all fields in MC Rate before adding a new row.");
        return;
      }

    if (hasDuplicateWcIdAndWefDate(mcRateData)) {
      toast.error("Duplicate wc_id and wef_date combination found in Machine Rate section.");
      return;
    }

      const newMcRow = { mc_hr_rate: "", wef_date: "", fin_engg: "E", wc_id:formData?.wc_id};
      setMcRateData((prev) => [...prev, newMcRow]);
    } else if (section === "SkillSet") {
      const lastSkillRow = skillSetData[skillSetData.length - 1];
      if (lastSkillRow && (!lastSkillRow.skill_id || !lastSkillRow.no_of_emp)) {
        toast.error("Please fill all fields in Skill Set before adding a new row.");
        return;
      }

      
    if (hasDuplicateWcIdAndSkillId(skillSetData)) {
      toast.error("Duplicate Skill and description combination found in Skill  section.");
      return;
    }

      const newSkillRow = { skill_id: "", no_of_emp: "", skill_desc: "", skill_type: "" };
      setSkillSetData((prev) => [...prev, newSkillRow]);
    }
  };

  const handleChangeTab = (getTab) => {
    if (getTab === "Main") {
      setActiveTab(1);
    }
  };


   const handleSearch = async () => {
          try {
              setTotalRecordCount(0);
              setCurrentRecordNo(0);
              const searchPayload =
                  createSearchPayloadForWorkCntrSpecificSearch(formData);
              const queryList = new URLSearchParams(searchPayload);
  
              if ([...queryList].length === 0) {
                  toast.error("Please enter search criteria");
                  return;
              }
  
              setSearchQuery(searchPayload);
  
              const data = await fetchAppData(
                  `${APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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
    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={["Main"]}
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
        formData={formData}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}
        formName={"WORK CENTER"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <WarehouseMasterMain
              formData={{ ...formData, mcRateData, skillSetData, triggerAddRow, setMcRateData, setSkillSetData }}
              setFormData={setFormData}
              handleChange={handleChange}
              formStatus={formStatus}
              handleChangeTab={handleChangeTab}
              divisionID={divisionID}
              department={department}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              // wcIdGenerated={wcIdGenerated}
              // setWcIdGenerated={setWcIdGenerated}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: "Y", help_list: helpFor, wc_id: formData.wc_id }}
                    whereClause={helpFor === "mainWorkCenter"}
                  />
                </ModalBody>
              </Modal>
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default WareHouseMaster;