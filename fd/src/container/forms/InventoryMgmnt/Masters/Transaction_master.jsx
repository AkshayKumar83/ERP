import React from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import TransactionMasterHeader from "./Transaction_master_header";
import {
    createSearchPayloadForTransMstrSpecificSearch,
    transactionMstrInitData,
} from "./Transaction_master_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import HelpList from "../../../../components/HelpList";
import { fetchAppData } from "../../../../utils/fetchUtils";
import toast from "react-hot-toast";
import { validateForm } from "../../../../utils/fn";

const TransactionMaster = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({ ...transactionMstrInitData });
    const {
        formStatus,
        setFormStatus,
        handleOperation,
        releaseFormStatus,
        searchQuery,
        setSearchQuery,
    } = useFormStatus();

    const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);
    const [isHelpModelOpen, setIsHelpModelOpen] = useState();
    const toggleHelpModal = () => setHelpList(!helpList);

    const { user } = useSelector((state) => state.auth);

    const tabs = ["Transaction Master"];

    const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const handleHelpList = (data) => {
        setHelpList(data);
    };

    const onSelectHelpItem = (data) => {
        setFormData((prev) => {
            switch (helpFor) {
                case "from":
                    return {
                        ...prev,
                        from_wc_no: data.wc_no,
                        from_desc: data.description,
                         from_wc_id: data.wc_id,
                    };
                case "to":
                    return {
                        ...prev,
                        to_wc_no: data.wc_no,
                        to_desc: data.description,
                        to_wc_id: data.wc_id,
                    };
                case "Desc":
                    return {
                        ...prev,
                        trans_code: data.trans_code,
                        type_desc: data.type_desc,
                    };
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
        setFormData({});
    }, []);



const handleChange = useCallback((name, value, event) => {
  if (!["Insert", "Search", "Update"].includes(formStatus)) return;

  // Cursor position store karo
  const cursorPos = event?.target?.selectionStart;

  // Uppercase conversion
  let newVal = typeof value === "string" ? value.toUpperCase() : value;

  // Block typing for from_wc_no / to_wc_no
  if (["from_wc_no", "to_wc_no"].includes(name)) {
    toast.error("Please select value from Help List (double click)");
    return;
  }

  setFormData((prev) => {
    const updatedForm = { ...prev, [name]: newVal };

    // PL/SQL logic for type
    if (name === "type") {
      if (newVal === "1" || newVal === "2") updatedForm.ok_rej = "O";
      else if (newVal === "3" || newVal === "4") updatedForm.ok_rej = "R";

      if (newVal === "1" || newVal === "3") updatedForm.receive_issue_flag = "R";
      else if (newVal === "2" || newVal === "4") updatedForm.receive_issue_flag = "I";
    }

    return updatedForm;
  });

  // Restore cursor for text inputs
  if (event?.target && event.target.tagName === "INPUT" && event.target.type === "text") {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

}, [formStatus]);


        const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            if (!queryData || queryData.type === "not_found") {
            toast.error("No data found"); 
            setFormData({});  
            handleCancel()         
            setTotalRecordCount(0);
            return;
            }

            // First record set in formData
            setFormData(queryData?.transMstrData?.[0] || {});

            if (btnClicked === "Query") {
            setTotalRecordCount(queryData?.count || 0);
            }
        },
        [formStatus, currentRecordNo]
        );

    const handleSearch = async () => {
        try {
            setTotalRecordCount(0);
            setCurrentRecordNo(0);
            const searchPayload =
                createSearchPayloadForTransMstrSpecificSearch(formData);
            const queryList = new URLSearchParams(searchPayload);

            if ([...queryList].length === 0) {
                toast.error("Please enter search criteria");
                return;
            }

            setSearchQuery(searchPayload);

            const data = await fetchAppData(
                `${APP_PROD_API.GET_TRANSACTION_MSTR_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!["Insert", "Search", "Update"].includes(formStatus)) return;

        try {
              if(formStatus === "Insert"){
             const transMstr = validateForm('trans-mstr','Transaction Master')
            if(!transMstr){
            // toast.error("Please fill all required Field")
            return;
            }
        }

           const payload = {
            ...formData,
            type: Number(formData.type) 
          };
            let method;
            if (formStatus == "Insert") {
                method = "POST";
            } else if (formStatus == "Update") {
                method = "PUT";
            }

            const response = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.POST_TRANSACTION_MSTR_DATA
                }?form_status=${formStatus}`,
                {
                    method: method,
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            toast.success(`Data saved successfully!`);
            handleCancel();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(
                error.message ||
                    "Please check all the form fields or contact administrator"
            );
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
                QUERY_API={APP_PROD_API.GET_TRANSACTION_MSTR_DATA}
                formName={"Transaction Master"}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <TransactionMasterHeader
                            formData={formData}
                            formStatus={formStatus}
                            handleChange={handleChange}
                            handleHelpList={handleHelpList}
                            setHelpFor={setHelpFor}
                            setHelpListHeader={setHelpListHeader}
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
                                        apiUrl={`${
                                            import.meta.env.VITE_BASE_API_URL
                                        }${
                                            APP_PROD_API.GET_TRANSACTION_MSTR_DATA
                                        }`}
                                        helpListHeader={helpListHeader}
                                        handleHelpList={handleHelpList}
                                        onSelectHelpItem={onSelectHelpItem}
                                        queryPera={{ needAppGlobalData: "Y" }}
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

export default TransactionMaster;
