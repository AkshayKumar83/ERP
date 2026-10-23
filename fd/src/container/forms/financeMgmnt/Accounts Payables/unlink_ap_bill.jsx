import React, { useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import UnlinkAPbillDtl from "./unlink_ap_billDtl";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLoader,
  setLoader,
} from "../../../../features/loader/loaderSlice";
import Loader from "../../../../components/GenricComponents/Loader";
import { checkUnlink, createSearchPaylaod } from "./unlink_ap_bill_helper";

import { fetchAppData } from "../../../../utils/fetchUtils";

const UnlinkApBill = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const dispatch = useDispatch();
  const tabs = ["Unlink AP Bill"];

  const formLoading = useSelector(selectLoader("form"));
  const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    const checkUpdateEligibility = async () => {
      if (formStatus === "Update") {
        const isDataOk = await checkUnlink(formData);
        //console.log(isDataOk);
        if (!isDataOk) {
          setFormStatus("Query"); // assuming you meant setFormStatus, not setFormData
        }
      }
    };

    checkUpdateEligibility();
  }, [formStatus]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(setLoader({ key: "form", value: true })); // Start loader
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_UNLINK_AP_BILL_DATA
        }?form_status=${formStatus}&userId=${user.id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(`Bill Successfully Unlinked`);
        const responseData = await response.json();
        //console.log(responseData);
      } else {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Something Error on unlinking bill");
    } finally {
      dispatch(setLoader({ key: "form", value: false })); // Start loader
    }
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
  }, []);

  const handleChange = (e) => {
    if (!["Update", "Search"].includes(formStatus)) {
      return;
    }
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SETUP QUERY DATA AT ON CLICK QUERY BTN
  const setupQueryData = useCallback(
    (data, btnClicked) => {
      if (btnClicked == "Query") {
        dispatch(setLoader({ key: "form", value: true }));
      }
      if (data?.type == "not found") {
        toast.error("No Record Found");
        setFormStatus("");
        dispatch(setLoader({ key: "form", value: false }));
        return;
      }
      setFormData(data?.formHdrData);

      if (btnClicked === "Query") {
        setTotalRecordCount(data.count);
      }

      dispatch(setLoader({ key: "form", value: false }));
    },
    [formStatus, currentRecordNo]
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPaylaod(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_UNLINK_AP_BILL_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_UNLINK_AP_BILL_DATA}
        formName={""}
        btnEnableDtl={{ insert: false }}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {formLoading && <Loader overlayContainer />}
            <UnlinkAPbillDtl
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UnlinkApBill;
