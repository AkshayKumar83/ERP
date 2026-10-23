import React, { useEffect } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import {
  createSearchPayloadForPurchEntrySearch,
  DetailInitData,
  headerInitData,
  RestDetailInitData,
} from "./purchase_voucher_entry_helper";
import PurchaseVoucherEntryHeader from "./purchase_voucher_entry_header";
import PurchaseVoucherEntryDetail from "./purchase_voucher_entry_detail";

import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";

const PurchaseVoucherEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...headerInitData });
  const [detailData, setDetailData] = useState([{ ...DetailInitData }]);
  const [restDetailData, setRestDetailData] = useState({
    ...RestDetailInitData,
  });
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  //dropdown states
  const [poCategory, setPoCategory] = useState([]);
  const [registerType, setRegisterType] = useState([]);
  const [section, setSection] = useState([]);
  const [purpose, setPurpose] = useState([]);

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery, setSearchQuery, } =
    useFormStatus();

  const { user } = useSelector((state) => state.auth);

  const tabs = ["Purchase Voucher Query"];

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_PURCHASE_VCHR_ENTRY_DROPDOWN_DATA
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setPoCategory([
            { value: "", label: "" },
            ...formatOptions(
              data.poCategory || [],
              "po_cat_prefix",
              "po_cat_description"
            ),
          ]);
          setSection([
            { value: "", label: "" },
            ...formatOptions(data.sections || [], "section_id", "section_desc"),
          ]);
          setPurpose([
            { value: "", label: "" },
            ...formatOptions(data.purposes || [], "code", "description"),
          ]);
          setFormData((prev) => ({
            ...prev,
            sect: data.sect,
            section: data.sections?.[0]?.section_id || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch constant list:", err);
      }
    };

    if (
      formStatus === "Query" &&
      user?.global_division_id &&
      user?.global_fin_year
    ) {
      fetchConstantList();
    }
  }, [formStatus, user?.global_division_id, user?.global_fin_year]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({});
    setDetailData([{}])
  }, []);

  const handleChange = useCallback((stateKey, name, value, index, event) => {
    const cursorPosition = event?.target?.selectionStart;
    let newVal = value.toUpperCase();

    setFormData((prev) => {
      if (stateKey === "formData") {
        return { ...prev, [name]: newVal };
      }
      return prev;
    });

    setRestDetailData((prev) => {
      if (stateKey === "restDetailData") {
        return { ...prev, [name]: newVal };
      }
      return prev;
    });

    if (stateKey === "detailData") {
      setDetailData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    if (event) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, []);

  const triggerAddRow = () => {
    setDetailData((prev) => [
      ...prev,
      { ...DetailInitData, id: prev.length + 1 },
    ]);
  };

  // SETUP QUERY DATA AT ON CLICK QUERY BTN
  const setupQueryData = useCallback((data, btnClicked) => {
    // //console.log('data: ', data)
    setFocusedRowIndex(0)
    if(data?.type == 'not found'){

      toast.error('No Record Found')
      setFormStatus('')
      return
    }
    setFormData((prev) => ({ ...data.formHdrData }));
    setDetailData(data?.formDtlData)
 
    if (btnClicked === "Query") {
          setTotalRecordCount(data.count);
      }
    },
       [formStatus, currentRecordNo]
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForPurchEntrySearch(formData);
      const queryList = new URLSearchParams(searchPayload);
     
      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_PURCHASE_VCHR_ENTRY_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_PURCHASE_VCHR_ENTRY_DATA}
        formName={"Purchase Voucher Query"}
        handleSearch={handleSearch}
        formPayload={{ searchQuery,}}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form>
              <PurchaseVoucherEntryHeader
                formData={formData}
                handleChange={(name, value, event) => handleChange("formData", name, value, null, event)}
                formStatus={formStatus}
                section={section}
                poCategory={poCategory}
              />
            </Form>
            <PurchaseVoucherEntryDetail
              detailData={detailData}
              restDetailData={restDetailData}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              formStatus={formStatus}
              purpose={purpose}
              registerType={registerType}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PurchaseVoucherEntry;
