import React, { useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import GlMasterHeader from "./gl_master_trial_bal";
import GlMasterBSPL from "./gl_master_BSPL";
import GlMasterMain from "./gl_master_main";
import GlMasterDetail from "./gl_masterDetail";
import TdsDetails from "./gl_master_tdsDetails";
import { createSearchPayloadForGLSpecificSearch, formDetailInitData, tdsDetailInitData } from "./gl_master_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { useSelector } from "react-redux";
import HelpList from "../../../../components/HelpList";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";

const GlMaster = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState();
    const [formDetailData, setFormDetailData] = useState([
        { ...formDetailInitData },
    ]);
    const [tdsDetailData, setTdsDetailData] = useState([
        { ...tdsDetailInitData },
    ]);

    const { formStatus, setFormStatus, handleOperation, releaseFormStatus,  searchQuery,
    setSearchQuery, } =
        useFormStatus();
          const [isCanceling, setIsCanceling] = useState(false);

    const [currentView, setCurrentView] = useState("Main Details");

    const { user } = useSelector((state) => state.auth);
    //    BELOW STATE USED FOR DROPDOWN INPUTS

    const [rollupAcc1, setRollupAcc1] = useState([]);
    const [rollupAcc2, setRollupAcc2] = useState([]);
    const [rollupAcc3, setRollupAcc3] = useState([]);
    const [rollupAcc4, setRollupAcc4] = useState([]);
    const [rollupAccFC1, setRollupAccFC1] = useState([]);
    const [rollupAccFC2, setRollupAccFC2] = useState([]);
    const [rollupAccFC3, setRollupAccFC3] = useState([]);
    const [rollupAccFC4, setRollupAccFC4] = useState([]);

    const [controlAcc, setControlAcc] = useState([]);
    const [genFlag, setGenFlag] = useState([]);

    const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
    const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want
    const [helpListHeader, setHelpListHeader] = useState([]);

    const [isHelpModelOpen, setIsHelpModelOpen] = useState();
    const toggleHelpModal = () => setHelpList(!helpList);

    const tabs = ["Main", "Rollup Trial Balance", "Rollup BSPL"];

    useEffect(() => {
        const fetchConstantList = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}${
                        APP_PROD_API.GET_GL_MSTR_DROPDOWNDATA
                    }`,
                    { credentials: "include" }
                );
                if (response.status === 200) {
                    const data = await response.json();
                   

                    setControlAcc([
                        { value: "", label: "" },
                        ...formatOptions(
                            data.controlAcc || [],
                            "controlacc",
                            "acc_desc"
                        ),
                    ]);

                    setGenFlag([
                        { value: "", label: "" },
                        ...formatOptions(
                            data.genFlag || [],
                            "gen_flag",
                            "description"
                        ),
                    ]);

                    setFormData((prev) => ({ ...prev }));
                }
            } catch (error) {
               
            }
        };

        if (formStatus) {
            fetchConstantList();
        }
    }, [formStatus]);

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    function handleOffset(data) {
        setCurrentRecordNo(data);
    }

    const formCleanup = () => {
          
        setFormData({});
        setFormDetailData([{ ...formDetailInitData }]);
        releaseFormStatus();
         setIsCanceling(false);
    };

    const handleCancel = useCallback(() => {
          setIsCanceling(true);
        formCleanup();
    }, []);


    // const handleChange = useCallback((type, name, value, event) => {
    // if (!["Insert", "Update", "Search"].includes(formStatus)) return;

    // if (['rollup_acc1','rollup_acc2','rollup_acc3','rollup_acc4'].includes(name)){
    //     toast.error("Please Select from Help List on Double Click ");
    //     return;
    // }

    // const cursorPosition = event?.target?.selectionStart;
    // let newVal = value;

    // if (typeof value !== "number" && typeof value === "string") {
    //     newVal = newVal.toUpperCase();
    // }

    // //  Prevent negative or decimal for sch_no and sub_sch_no
    // if (["sch_no", "sub_sch_no"].includes(name)) {
    //     // Remove non-digit characters
    //     newVal = newVal.replace(/[^0-9]/g, "");
    // }

    // switch (type) {
    //     case "formData":
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: newVal, // use newVal directly
    //     }));
    //     break;

    //     case "formDetailData":
    //     setFormDetailData((prev) => {
    //         const updatedData = {
    //         ...prev[0],
    //         [name]:
    //             name === "yr_op_bal" || name === "cur_bal"
    //             ? value === "" ||
    //                 (/^-?\d{0,14}(\.\d{0,2})?$/.test(value) && value.length <= 17)
    //                 ? value
    //                 : prev[0][name]
    //             : newVal, // use newVal directly
    //         };
    //         return [updatedData];
    //     });
    //     break;

    //     case "tdsDetailData":
    //     setTdsDetailData((prev) => ({
    //         ...prev,
    //         [name]: newVal, // use newVal directly
    //     }));
    //     break;
    // }

    // if (
    //     event?.target &&
    //     event.target.tagName === "INPUT" &&
    //     !["number", "radio", "checkbox", "date"].includes(event.target.type)
    // ) {
    //     setTimeout(() => {
    //     event.target.setSelectionRange(cursorPosition, cursorPosition);
    //     }, 0);
    // }
    //  }, [formStatus]);
  
    const handleChange = useCallback((type, name, value, event) => {
  if (!["Insert", "Update", "Search"].includes(formStatus)) return;

  const cursorPosition = event?.target?.selectionStart;
  let newVal = value;

  if (typeof value !== "number" && typeof value === "string") {
    newVal = newVal.toUpperCase();
  }

  if (["sch_no", "sub_sch_no"].includes(name)) {
    newVal = newVal.replace(/[^0-9]/g, "");
  }

  const rollupFields = ["rollup_acc1", "rollup_acc2", "rollup_acc3", "rollup_acc4"];

  //  Case 1: Filling ControlAcc while any Rollup already filled
  if (name === "controlacc") {
    const anyRollupFilled = rollupFields.some(
      (r) => formData?.[r] && formData?.[r].trim() !== ""
    );
    if (anyRollupFilled) {
      toast.error("You cannot fill Control Account when Rollup is filled");
      setFormData((prev) => ({
        ...prev,
        controlacc: "",
      }));
      return;
    }
  }

  //  Case 2: Filling Rollup while ControlAcc already filled
  if (rollupFields.includes(name)) {
    const controlAccFilled = formData?.controlacc && formData?.controlacc.trim() !== "";
    if (controlAccFilled) {
      toast.error("You cannot fill Rollup when Control Account is filled");
      setFormData((prev) => ({
        ...prev,
        rollup_acc1: "",
        rollup_acc1_desc: "",
        rollup_acc2: "",
        rollup_acc2_desc: "",
        rollup_acc3: "",
        rollup_acc3_desc: "",
        rollup_acc4: "",
        rollup_acc4_desc: "",
      }));
      return;
    }
  }

  //  Help list message tabhi dikhao jab koi aur validation fail na ho
  if (rollupFields.includes(name) && !formData?.controlacc) {
    toast.error("Please Select from Help List on Double Click ");
    return;
  }

  //  State update
  switch (type) {
    case "formData":
      setFormData((prev) => ({
        ...prev,
        [name]: newVal,
      }));
      break;

    case "formDetailData":
      setFormDetailData((prev) => {
        const updatedData = {
          ...prev[0],
          [name]:
            name === "yr_op_bal" || name === "cur_bal"
              ? value === "" ||
                (/^-?\d{0,14}(\.\d{0,2})?$/.test(value) && value.length <= 17)
                ? value
                : prev[0][name]
              : newVal,
        };
        return [updatedData];
      });
      break;

    case "tdsDetailData":
      setTdsDetailData((prev) => ({
        ...prev,
        [name]: newVal,
      }));
      break;
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
}, [formStatus, formData]);


    const setupQueryData = useCallback(
        (queryData, btnClicked) => {

          if (queryData.type === "not found") {
            toast.error(queryData.message || "No data found");
            handleCancel()
            setFormDetailData([{}]);
            setFormData({});
            setTotalRecordCount(0);
            return;
        }

            const { GlMasterHeader, GlMasterDetail, count } = queryData;
            // Set formatted detail data
            if (GlMasterDetail) {
                const formattedDetail = {
                    ...GlMasterDetail,
                    cur_bal_dt: dateFormatter(GlMasterDetail.cur_bal_dt),
                };
                setFormDetailData([formattedDetail]);
            } else {
                setFormDetailData([{}]); // Fallback if detail is missing
            }

            // Set header data
            setFormData(GlMasterHeader || {});
            

            // Set record count if the button clicked was "Query"
            if (btnClicked === "Query") {
                setTotalRecordCount(count || 0);
            }
        },
        [formStatus, currentRecordNo]
    );

    // SETUP Roll UP Acc1  AND THERE RELATED FIELD ON SELECTIN USING HELP OR MANUALLY

    const handleRollUpAcc = (data, manual = false) => {
        setRollupAcc1(data.rollup_acc1);
        setRollupAcc2(data.rollup_acc2);
        setRollupAcc3(data.rollupAcc3);
        setFormData((prev) => ({
            ...prev,
            rollup_acc1: data.rollup_acc1,
            rollup_acc1_desc: data.rollup_acc1_desc, // Correctly separate desc
            rollup_acc2: data.rollup_acc2,
            rollup_acc2_desc: data.rollup_acc2_desc, // Correctly separate desc
            rollup_acc3: data.rollup_acc3,
            rollup_acc3_desc: data.rollup_acc3_desc, // Correctly separate desc
        }));
    };

    const handleHelpList = (data) => {
        if (["Insert","Search", "Update"].includes(formStatus)) 
            setHelpList(data);
        
    };

    const onSelectHelpItem = (data) => {
   

        setFormData((prev) => {
            let newFormData = { ...prev };

            switch (helpFor) {
                case "rollUpAcc1":
                    newFormData = {
                        ...newFormData,
                        rollup_acc1: data.level1,
                        rollup_acc1_desc: data.cat_desc,
                        // rollup_acc1_fc: data.level1,
                        // rollup_acc1_fc_desc: data.cat_desc,
                    };
                    handleRollUpAcc(data);
                    break;
                case "rollUpAcc2":
                    newFormData = {
                        ...newFormData,
                        rollup_acc2: data.level2,
                        rollup_acc2_desc: data.cat_desc,
                        // rollup_acc2_fc: data.level2,
                        // rollup_acc2_fc_desc: data.cat_desc,
                    };
                    handleRollUpAcc(data);
                    break;
                case "rollUpAcc3":
                    newFormData = {
                        ...newFormData,
                        rollup_acc3: data.level3,
                        rollup_acc3_desc: data.cat_desc,
                        // rollup_acc3_fc: data.level3,
                        // rollup_acc3_fc_desc: data.cat_desc,
                    };
                    handleRollUpAcc(data);
                    break;
                case "rollUpAcc4":
                    newFormData = {
                        ...newFormData,
                        rollup_acc4: data.level4,
                        rollup_acc4_desc: data.cat_desc,
                        // rollup_acc4_fc: data.level4,
                        // rollup_acc4_fc_desc: data.cat_desc,
                    };
                    handleRollUpAcc(data);
                    break;
                case "rollUpAcc1Fc":
                    newFormData = {
                        ...newFormData,
                        rollup_acc1_fc: data.level1,
                        rollup_acc1_fc_desc: data.cat_desc,
                    };
                    break;
                case "rollUpAcc2Fc":
                    newFormData = {
                        ...newFormData,
                        rollup_acc2_fc: data.level2,
                        rollup_acc2_fc_desc: data.cat_desc,
                    };
                    break;
                case "rollUpAcc3Fc":
                    newFormData = {
                        ...newFormData,
                        rollup_acc3_fc: data.level3,
                        rollup_acc3_fc_desc: data.cat_desc,
                    };
                    break;
                case "rollUpAcc4Fc":
                    newFormData = {
                        ...newFormData,
                        rollup_acc4_fc: data.level4,
                        rollup_acc4_fc_desc: data.cat_desc,
                    };
                    break;
                case "accNo":
                    newFormData = {
                        ...newFormData,
                        acc_no: data.acc_no,
                        acc_desc: data.acc_desc,
                    };
                    break;
                case "accDesc":
                    newFormData = {
                        ...newFormData,
                          acc_no: data.acc_no,
                        acc_desc: data.acc_desc,
                    };
                    break;
                default:
                    return prev;
            }

            // Concatenate selected rollup accounts into the rollup_acc field
            const concatenatedAcc = [
                newFormData.rollup_acc1,
                newFormData.rollup_acc2,
                newFormData.rollup_acc3,
                newFormData.rollup_acc4,
            ]
                .filter((acc) => acc) // Remove empty values
                .join(""); // Join with a comma and space

            newFormData.rollup_acc = concatenatedAcc;

            // Concatenate selected rollup accounts fc into the rollup_acc_fc field
            const concatenatedAccFc = [
                newFormData.rollup_acc1_fc,
                newFormData.rollup_acc2_fc,
                newFormData.rollup_acc3_fc,
                newFormData.rollup_acc4_fc,
            ]
                .filter((accFc) => accFc) // Remove empty values
                .join(""); // Join without a separator (no comma)

            newFormData.rollup_acc_fc = concatenatedAccFc;

            return newFormData;
        });
    };

    const whereClauseForHelp = (helpFor) => {
        if (helpFor === "rollUpAcc2") {
            const { rollup_acc1 } = formData;
            return { h_rollup_acc1: rollup_acc1 };
        } else if (helpFor === "rollUpAcc3") {
            const { rollup_acc1, rollup_acc2 } = formData;
            return { h_rollup_acc1: rollup_acc1, h_rollup_acc2: rollup_acc2 };
        } else if (helpFor === "rollUpAcc4") {
            const { rollup_acc1, rollup_acc2, rollup_acc3 } = formData;
            return {
                h_rollup_acc1: rollup_acc1,
                h_rollup_acc2: rollup_acc2,
                h_rollup_acc3: rollup_acc3,
            };
        } else if (helpFor === "rollUpAcc2Fc") {
            const { rollup_acc1_fc } = formData;
            return { h_rollup_acc1_fc: rollup_acc1_fc };
        } else if (helpFor === "rollUpAcc3Fc") {
            const { rollup_acc1_fc, rollup_acc2_fc } = formData;
            return {
                h_rollup_acc1_fc: rollup_acc1_fc,
                h_rollup_acc2_fc: rollup_acc2_fc,
            };
        } else if (helpFor === "rollUpAcc4Fc") {
            const { rollup_acc1_fc, rollup_acc2_fc, rollup_acc3_fc } = formData;
            return {
                h_rollup_acc1_fc: rollup_acc1_fc,
                h_rollup_acc2_fc: rollup_acc2_fc,
                h_rollup_acc3_fc: rollup_acc3_fc,
            };
        }
        return {};
    };


  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (formStatus === "Insert" || formStatus === "Update") {

 const requiredFields = [
 
  ["rollup_acc1", "Trial Balance Rollup Acc. 1"],
  ["rollup_acc2", "Trial Balance Rollup Acc. 2"],
  ["rollup_acc3", "Trial Balance Rollup Acc. 3"],
  ["rollup_acc4", "Trial Balance Rollup Acc. 4"],

  ["rollup_acc1_fc", "BSPL Rollup Acc. 1"],
  ["rollup_acc2_fc", "BSPL Rollup Acc. 2"],
  ["rollup_acc3_fc", "BSPL Rollup Acc. 3"],
  ["rollup_acc4_fc", "BSPL Rollup Acc. 4"],

   ["acc_desc", "Account Description"],
];

const missingField = requiredFields.find(([key]) => {
  return !String(formData?.[key] ?? "").trim();
});

if (missingField) {
  const [key, label] = missingField;

  // Automatically open the tab containing the missing field
  if (key.startsWith("rollup_acc") && key.endsWith("_fc")) {
    setActiveTab(3); // BSPL tab
  } else if (key.startsWith("rollup_acc")) {
    setActiveTab(2); // Trial Balance tab
  } else {
    setActiveTab(1); // Main tab
  }

  toast.error(`${label} is required.`);
  return;
}

      // Existing detail form validation
      const detailValid = validateForm(
        "gl-master-detail-form",
        "Gl Master"
      );

      if (!detailValid) return;
    }
  

    const yrOpBal = parseFloat(formDetailData[0]?.yr_op_bal);
    if (formDetailData[0]?.yr_op_bal === "") return;
    if (yrOpBal < 0) {
      toast.error("Year Opening Balance field cannot be less than zero.");
      return;
    }

    if (!formData?.acc_no) {
      toast.error("Please generate Account No before submitting the form.");
      return;
    }

    const formHdrData = { ...formData };

    const body = {
        formHdrData,
        formDtlData: {
            ...formDetailData[0],
            trans_year: user?.global_fin_year,
            division_id: user?.global_division_id,
        },
    };

    const method = formStatus === "Insert" ? "POST" : "PUT";

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GL_MSTR_DATA}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok || result.type === "error") {
      throw new Error(result.message || "Failed to save record.");
    }

    toast.success(result.message || "Data saved successfully!");
    formCleanup();

  } catch (error) {
    console.error("Submit error:", error);

    toast.error(
      error.message ||
      "Please check all the form fields or contact administrator"
    );

    //  Auto-clear rollups if control account + rollup conflict error
if (error.message?.includes("Cannot create roll-up account")) {
  setFormData((prev) => ({
    ...prev,
    rollup_acc1: null,
    rollup_acc1_desc: null,
    rollup_acc2: null,
    rollup_acc2_desc: null,
    rollup_acc3: null,
    rollup_acc3_desc: null,
    rollup_acc4: null,
    rollup_acc4_desc: null,
    rollup_acc:null,
  }));
}
  } 
};


    const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForGLSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_GL_MSTR_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        handleCancel()
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
                QUERY_API={APP_PROD_API.GET_GL_MSTR_FORM_DATA}
                formName={"GL MASTER"}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={2}>
                        {currentView === "Address Details" ? (
                            <>
                                <TdsDetails
                                    formData={formData}
                                    formStatus={formStatus}
                                    handleChange={handleChange}
                                    tdsDetailData={tdsDetailData}
                                />
                            </>
                        ) : (
                            <>
                                <GlMasterHeader
                                activeTab={activeTab}
                                    formData={formData}
                                    setFormData={setFormData}
                                    formStatus={formStatus}
                                    handleChange={handleChange}
                                    genFlag={genFlag}
                                    controlAcc={controlAcc}
                                    handleHelpList={handleHelpList}
                                    setHelpFor={setHelpFor}
                                    setHelpListHeader={setHelpListHeader}
                                    setFormDetailData={setFormDetailData}
                                    isCanceling={isCanceling}
                                />
                                {helpList && (
                                    <Modal
                                        isOpen={helpList}
                                        toggle={toggleHelpModal}
                                        size="lg"
                                    >
                                        <ModalHeader
                                            toggle={toggleHelpModal}
                                        ></ModalHeader>
                                        <ModalBody>
                                            <HelpList
                                                formStatus={formStatus}
                                                helpFor={helpFor}
                                                apiUrl={`${import.meta.env.VITE_BASE_API_URL
                                                }${
                                                    APP_PROD_API.GET_GL_MSTR_FORM_DATA
                                                }`}
                                                helpListHeader={helpListHeader}
                                                handleHelpList={handleHelpList}
                                                onSelectHelpItem={
                                                    onSelectHelpItem
                                                }
                                                queryPera={{needAppGlobalData: "Y",}}
                                                whereClause={whereClauseForHelp(
                                                    helpFor
                                                )}
                                            />
                                        </ModalBody>
                                    </Modal>
                                )}

                                
                            </>
                        )}
                    </TabPane>
                    <TabPane tabId={3}>
                     
                                <GlMasterBSPL
                                activeTab={activeTab}
                                    formData={formData}
                                    setFormData={setFormData}
                                    formStatus={formStatus}
                                    handleChange={handleChange}
                                    genFlag={genFlag}
                                    controlAcc={controlAcc}
                                    handleHelpList={handleHelpList}
                                    setHelpFor={setHelpFor}
                                    setHelpListHeader={setHelpListHeader}
                                    setFormDetailData={setFormDetailData}
                                    isCanceling={isCanceling}
                                />
                             
                     
                    </TabPane>
                    <TabPane tabId={1}>
                     
                                <GlMasterMain
                                activeTab={activeTab}
                                    formData={formData}
                                    setFormData={setFormData}
                                    formStatus={formStatus}
                                    handleChange={handleChange}
                                    genFlag={genFlag}
                                    controlAcc={controlAcc}
                                    handleHelpList={handleHelpList}
                                    setHelpFor={setHelpFor}
                                    setHelpListHeader={setHelpListHeader}
                                    setFormDetailData={setFormDetailData}
                                    isCanceling={isCanceling}
                                />
                                <GlMasterDetail
                                    formData={formData}
                                    formStatus={formStatus}
                                    handleChange={(name, value, event) =>
                                        handleChange(
                                            "formDetailData",
                                            name,
                                            value,
                                            event
                                        )
                                    }
                                    formDetailData={formDetailData}
                                         isCanceling={isCanceling}
                                />
                             
                     
                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default GlMaster;
