import React, { useState, useCallback, useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { Col, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import { memberNoHelpListHeader } from "./loan_repay_helper";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import { useRecordCount } from "../../../../hooks/useRecordCount";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import Select from "../../../../components/basic/select";
import { formatOptions } from "../../../../lib";

const EfaVehicalDetail = () => {
  //GLOBAL PARAMETERS
  const { user } = useSelector((state) => state.auth);

  // HOOKS
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const {
    handleOffset,
    currentRecordNo,
    totalRecordCount,
    setTotalRecordCount,
    setCurrentRecordNo,
  } = useRecordCount();

  // FORM DATA STATE FOR EACH FORM COMPONENT
  const [formHdrData, setFormHdrData] = useState({});
  const [loanList, setLoanList] = useState([]);

  const [searchQueryData, setSearchQueryData] = useState({});

  const [activeTab, setActiveTab] = useState(1);

  // FOR HELP LIST
  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ["EDDAL Financial Assistance"];

  const fetchLoanList = async (member_id) => {
    ////console.log("member_id from inside", member_id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_VEHICAL_DTL_LOAN_LIST
        }?formStatus=${formStatus}&division_id=${
          user.global_division_id
        }&member_id=${member_id}`,
        {
          credentials: "include",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        ////console.log("data from response", data);
        setLoanList([
          { value: "", label: "" },
          ...formatOptions(data.loanList || [], "efa_id", "efa_ctrl_id"),
        ]);
      }
      // setTotalRecordCount(0) // comment it while building search feature
      setCurrentRecordNo(0);
    } catch (err) {
      ////console.log(err);
    }
  };

  ////console.log(loanList);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    if (helpFor === "party_name") {
      setFormHdrData((prev) => ({
        ...prev,
        dlr_name: data.dlr_name,
        member_id: data.member_id,
        member_no: data.member_no,
      }));
      ////console.log("member_id", data.member_id);
      fetchLoanList(data.member_id);
    }
    if (helpFor === "efa_ctrl_id") {
      setFormHdrData((prev) => ({
        ...prev,
        efa_id: data.efa_id,
        efa_ctrl_id: data.efa_ctrl_id,
      }));
    }
  };

  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
    }
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    ////console.log(name, value);
    setFormHdrData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SUBMIT LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formHdrData,
      };
      ////console.log(payload);
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_SUBMIT_VEHICAL_DATA}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Vehicle details saved successfully!");
        formCleanup();
        releaseFormStatus();
      } else {
        toast.error(result?.message || "Failed to save data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while submitting form.");
    }
  };

  const formCleanup = async () => {
    setFormHdrData({});
    setLoanList([])
    if (formStatus !== "Insert") {
      setFormStatus("");
    }

    setSearchQueryData({});
  };

  const handleCancel = useCallback(() => {
    formCleanup();
    releaseFormStatus();
  }, []);

  const setupQueryData = (queryData, btnClicked) => {};

  const handleSearch = async () => {};

  return (
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
      handleOffset={handleOffset}
      isQueryReqOnNextPreBtn={false}
      QUERY_API={APP_PROD_API.GET_EMI_REPAYMENT_DATA}
      formName={"EFA EMI Repayment"}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      authority={{
        insert: "Y",
        update: "N",
        message: "Update not allowed!",
      }}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // minHeight: "80vh",
            }}
          >
            <Form
              id="loan-repay-hdr-form"
              className="loan-repay-hdr-form p-4 bg-white shadow rounded"
              style={{ maxWidth: "960px", width: "100%" }}
            >
              <Row>
                <Col xl={3}>
                  <TextField
                    required
                    label="Member No."
                    name="member_no"
                    value={formHdrData.member_no || ""}
                    onChange={handleChange}
                    onDoubleClick={() =>
                      openHelpList("party_name", memberNoHelpListHeader)
                    }
                  />
                </Col>
                <Col xl={5}>
                  <TextField
                    label="Member Name"
                    name="dlr_name"
                    value={formHdrData.dlr_name || ""}
                    onChange={handleChange}
                    display
                  />
                </Col>
                <Col xl={2}>
                  <Select
                    required
                    type="text"
                    label="EMFA No."
                    name="efa_id"
                    value={formHdrData.efa_id || ""}
                    onChange={(e) => handleChange(e, "efa_id", e.target.value)}
                    options={loanList}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    required
                    label="Regn No."
                    name="vehicle_regn_no"
                    value={formHdrData.vehicle_regn_no || ""}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row className="mt-2">
                <Col xl={3}>
                  <TextField
                    required
                    label="Vehicle Make"
                    name="vehicle_make"
                    value={formHdrData.vehicle_make || ""}
                    onChange={handleChange}
                  />
                </Col>
                <Col xl={5}>
                  <TextField
                    label="Vehicle Model"
                    name="vehicle_model"
                    value={formHdrData.vehicle_model || ""}
                    onChange={handleChange}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    required
                    label="Manufacturer"
                    name="vehicle_manufacturer"
                    value={formHdrData.vehicle_manufacturer || ""}
                    onChange={handleChange}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    required
                    label="Engine No."
                    name="vehicle_engine_no"
                    value={formHdrData.vehicle_engine_no || ""}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row className="mt-2">
                <Col xl={3}>
                  <TextField
                    required
                    label="Vehicle Chasis No."
                    name="vehicle_chasis_no"
                    value={formHdrData.vehicle_chasis_no || ""}
                    onChange={handleChange}
                  />
                </Col>
                <Col xl={5}>
                  <TextField
                    required
                    label="RTO Address"
                    name="rto_address"
                    value={formHdrData.rto_address || ""}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Form>
          </div>

          {helpList && (
            <Modal
              id="help-list-modal"
              isOpen={helpList}
              toggle={toggleHelpModal}
              size="lg"
            >
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${ APP_PROD_API.GET_EMI_REPAYMENT_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                />
              </ModalBody>
            </Modal>
          )}
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default EfaVehicalDetail;
