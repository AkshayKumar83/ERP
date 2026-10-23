import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import UnpostingVoucherHeader from './unposting_voucher_header';
import { unpostingInitData } from './unposting_voucher_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { useSelector } from 'react-redux';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';



const UnpostingVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...unpostingInitData });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  // for dropdownData 

  const [currentYear, setCurrentYear] = useState([])
  const [section, setSection] = useState([])

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);
  const divisionId = user.global_division_id
  const transYear = formData.curryear

  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList) 

   const navigate = useNavigate();


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UNPOSTING_VOUCHER_DROPDOWNDATA}`,
        )
        if (response.status === 200) {
          const data = await response.json()
          setCurrentYear([{ value: "", label: "" }, ...formatOptions(data.currentYear || [], "year_code", "date_range")])
          setSection([{ value: "", label: "" }, ...formatOptions(data.section || [], "section_prefix", "section_desc")])

        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])

 const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update main form data
    if (["voucher"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "voucher":
            return {
              ...prev, voucher_no: data.voucher_no

            };

          default:
            return prev;
        }
      });
    }

  };


  const whereClauseForHelp = (helpFor) => {
    //console.log("formData data", formData)
    if (helpFor === 'voucher') {
      return { vch_type: formData.vch_type, section: formData.section, trans_year: formData.curryear};
    }

    return {};
  }

  const tabs = ["Unposting Voucher"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleUnpost = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UNPOSTING_VOUCHER_DATA}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            formData: formData,
            divisionId: divisionId,
            transYear: transYear,
          }),
        }
      );

      const result = await response.json();
      //console.log("Backend Response:", result);

      if (response.ok) {
        toast.success(result?.message || "Authorization status updated.")
      } else {
        toast.error(result?.message || "Failed to update authorization.");
      } 
      handleCancel();
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("An unexpected error occurred.");
    }

  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  function handleSubmit(e) {
    e.preventDefault();

    //console.log("Form submitted", formData)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);  

   // On clicking Exit Button
  const handleExist = () => {
    if (formStatus === "Query" || formStatus === "") {
      navigate(`/module/financeMgmnt`);
    } 
  };

  const handleChange = useCallback((name, value) => { 
     if ( [ "voucher_no"].includes(name)) {
      toast.error("Please select from Helplist");
     
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

    },
    [formStatus, currentRecordNo]
  );

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
        btnEnableDtl={{ insert:false,update:false,query:false,search:false }}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UnpostingVoucherHeader
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              currentYear={currentYear}
              section={section}
              handleUnpost={handleUnpost}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              handleCancel = {handleCancel}
              handleExist = {handleExist}
            />
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={'Insert'}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UNPOSTING_VOUCHER_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                   whereClause={whereClauseForHelp(helpFor)}
                //  whereClause={helpFor === 'voucher' ? { trans_year: formData?.curryear } : {}}

                />
              </ModalBody>
            </Modal>
          )}

        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UnpostingVoucher;

