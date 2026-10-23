import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formDataInitData, createSearchPayloadForBVSpecificSearch} from './item_opening_rate_mstr_helper';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useSelector } from 'react-redux';


const ItemOpeningRateMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ formDataInitData });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery} = useFormStatus();

    // GLOBAL USERDATA
      const { user } = useSelector((state) => state.auth);
  
  const tabs = ["Item Opening Rate Master"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // for help list 

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])

  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update main form data
    if (["wcno", "trans", "srs"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "wcno":
            return {
              ...prev, wc_no: data.wc_no, wc_id: data.wc_id
            };

          case "trans":
            return {
              ...prev, from_wc_desc: data.from_desc, to_wc_desc: data.to_desc, trans_code: data.trans_code

            };

          default:
            return prev;
        }
      });
    }
  };

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const whereClauseForHelp = (helpFor) => {
    //console.log("formData data", formData)

    if (formData.ok_rej && formData.trans_type) {
      // //console.log("Running proctranstype logic...");
      let newTrType = null;
      if (formData.ok_rej === 'O') {
        newTrType = formData.trans_type === 'R' ? 1 : formData.trans_type === 'I' ? 2 : null;
      } else if (formData.ok_rej === 'R') {
        newTrType = formData.trans_type === 'R' ? 3 : formData.trans_type === 'I' ? 4 : null;
      }

      if (formData.tr_type !== newTrType) {
        setFormData(prev => ({
          ...prev,
          tr_type: newTrType
        }));
      }
    }
    if (helpFor === 'trans') {
      //console.log("tr_type", formData.tr_type, "ok_rej", formData.ok_rej, "mat_trans_type", formData.mat_trans_type)
      return { wc_id: formData.wc_id, tr_type: formData.tr_type, ok_rej: formData.ok_rej, mat_trans_type: formData.mat_trans_type };
    }

    if (helpFor === 'item') {
      return { trans_code: formData.trans_code, wc_id: formData.wc_id };
    }

    if (helpFor === 'physical') {
      return { it_code: formDetailData[focusedRowIndex]?.it_code };
    }

    if (helpFor === 'batch') {
      return { it_code: formDetailData[focusedRowIndex]?.it_code, wc_id: formData.wc_id };
    }
    return {};
  }


  const handleHelpList = (data) => {
    setHelpList(data);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // Step 3: Prepare Payload
      let body = {
        formData: formData,

      };

      if (formStatus === "Update") {
        body = {
          ...formData,

        };
      }

      //console.log("Final body to send:", body);

      // Step 4: Submit to API
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ITEM_OPENING_RATE_MSTR}?form_status=${formStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          credentials: 'include',
        }
      );

      const result = await response.json();
      //console.log("API Response:", result);

      // Optional: Handle response success or errors
      if (response.ok) {
        toast.success("Record Updated successfully!");
      } else {
        toast.error(result.message || "Failed to submit form.");
      }
      handleCancel();

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred during submission.");
    }
  };  

    // For Search Record 
      const handleSearch = async () => {
          try {
              setTotalRecordCount(0);
              setCurrentRecordNo(0);
              const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
              const queryList = new URLSearchParams(searchPayload);
  
              if ([...queryList].length === 0) {
                  toast.error("Please enter search criteria");
                  return;
              }
  
              setSearchQuery(searchPayload);
  
              const data = await fetchAppData(
                  `${APP_PROD_API.GET_DATA_FOR_ITEM_OPENING_RATE_MSTR}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
              );
  
              if (data?.error) {
                  toast.error(data?.error);
                  return;
              }
              setupQueryData(data, "Query");
              handleOperation("Query");
          } catch (error) {
              console.error("Error fetching data:", error);
              toast.error(error?.message || "Some error occurred");
          }
      };
  

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({ formDataInitData });
  }, []);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        return;
      }

      if (btnClicked === "Query") {

        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.mommitemData)

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
        QUERY_API={APP_PROD_API.GET_DATA_FOR_ITEM_OPENING_RATE_MSTR}
        formName={""}
        authority={{ insert: 'N', update: 'Y' }}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}



      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>

              <Col xl={2} className='m-auto'>
                <TextField
                  label="Item Code"
                  required
                  type="text"
                  name="it_code"
                  value={formData.it_code || ""}
                  maxLength={20}
                  disabled = {formStatus === 'Update' || formStatus === 'Query'}
                  onChange={(e) => handleChange("it_code", e.target.value)}
                // onDoubleClick={() => handleDoubleClick("wcno", wchHelpListHeader)}
                />
              </Col>

              <Col xl={5} className='m-auto'>
                <TextField
                  label="Item Name"
                  required
                  type="text"
                  name="it_name"
                  value={formData.it_name || ""}
                  maxLength={15}
                  disabled = {formStatus === 'Update' || formStatus === 'Query'}
                  onChange={(e) => handleChange("it_name)", e.target.value)}
                // onDoubleClick={() => handleDoubleClick("wcno", wchHelpListHeader)}
                />
              </Col>

              <Col xl={1} className='m-auto'>

              </Col>
            </Row>
            <Row className='mt-2'>
              <Col xl={2} className='m-auto'>
                <TextField
                  label="Old Item Code"
                  // required
                  type="text"
                  name="old_it_code"
                  value={formData.old_it_code || ""}
                  maxLength={50}
                  disabled
                  onChange={(e) => handleChange("old_it_code", e.target.value)}
                // onDoubleClick={() => handleDoubleClick("wcno", wchHelpListHeader)}
                />
              </Col>

              <Col xl={2} className='m-auto'>
                <TextField
                  label="Drawing No"
                  // required
                  type="text"
                  name="drawing_no"
                  value={formData.drawing_no || ""}
                  maxLength={40}
                  disabled
                  onChange={(e) => handleChange("drawing_no", e.target.value)}
                // onDoubleClick={() => handleDoubleClick("trans", transHelpListHeader)}
                />
              </Col>

              <Col xl={2} className='m-auto'>
                <TextField
                  label="Revision No"
                  // required
                  type="text"
                  name="rev_level"
                  value={formData.rev_level || ""}
                  maxLength={15}
                  disabled = {formStatus === 'Update' || formStatus === 'Query'}
                  onChange={(e) => handleChange("rev_level", e.target.value)}
                />
              </Col>

              <Col xl={1} className='m-auto'>

              </Col>

            </Row>

            <Row className='mt-2'>
              <Col xl={2} className='m-auto'>
                <TextField
                  label="Year Opening Rate"
                  //required
                  type="number"
                  name="yrop_rate"
                  value={formData.yrop_rate || ""}
                  //maxLength={20}
                  // disabled
                  onChange={(e) => handleChange("yrop_rate", e.target.value)}
                />
              </Col>

              <Col xl={2} className='m-auto'>
                <TextField
                  label="Weighted Avg Rate"
                  //required
                  type="number"
                  name="currwt_rt"
                  value={formData.currwt_rt || ""}
                  maxLength={20}
                  //disabled
                  onChange={(e) => handleChange("currwt_rt", e.target.value)}
                />
              </Col>

              <Col xl={2} className='m-auto'>
                <TextField
                  label="Standard Cost"
                  //required
                  type="number"
                  name="std_cost"
                  value={formData.std_cost || ""}
                  maxLength={20}
                  //disabled
                  onChange={(e) => handleChange("std_cost", e.target.value)}
                />
              </Col>

              <Col xl={1} className='m-auto'>

              </Col>

            </Row>

          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={'Insert'}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_ITEM_OPENING_RATE_MSTR}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                  whereClause={whereClauseForHelp(helpFor)}

                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItemOpeningRateMaster;

