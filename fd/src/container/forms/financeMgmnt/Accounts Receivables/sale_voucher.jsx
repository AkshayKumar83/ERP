import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import SaleVoucherheader from "./sale_voucher_header";
import SaleVoucherDetail from "./sale_voucher_detail";
import {
  MOFMSTFORMInitData,
  saleVoucherDetailHeader,
  saleVoucherInitData,
  createSrchPayload,
} from "./sale_voucher_helper";
import { formatOptions } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";

const SaleVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...saleVoucherInitData });
  const [detailData, setDetailData] = useState([
    { ...saleVoucherDetailHeader },
  ]);
  const [mofData, setMofData] = useState({ ...MOFMSTFORMInitData });
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const { user } = useSelector((state) => state.auth);

  //Dropdown Data
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purposes, setPurposes] = useState([]);

  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_SALE_VOUCHER_LIST_DATA
          }?formStatus=${formStatus}&appDivisionId=${
            user.global_division_id
          }&appFinYear=${user.global_fin_year}&appUserId=${user.id}`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          setDivisions([
            { value: "", label: "" },
            ...formatOptions(data.division || [], "division_id", "name"),
          ]);
          setSections([
            { value: "", label: "" },
            ...formatOptions(data.section || [], "section_id", "section_desc"),
          ]);
          setInvoices([
            { value: "", label: "" },
            ...formatOptions(data.invoice || [], "da_cat", "da_cat_desc"),
          ]);
          setPurposes([
            { value: "", label: "" },
            ...formatOptions(data.purpose || [], "code", "description"),
          ]);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  function handleSubmit(e) {
    e.preventDefault();

    //console.log("Form submitted", formData);
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setDetailData([{}]);
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

    if (stateKey === "detailData") {
      setDetailData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    if (stateKey === "mofData") {
      setMofData((prev) => ({
        ...prev,
        [name]: newVal,
      }));
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
      { ...saleVoucherDetailHeader, id: prev.length + 1 },
    ]);
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log("queryData", queryData);

      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.thfmtranData);

      setDetailData(queryData.tdfmtranData);
    },
    [formStatus, currentRecordNo]
  );

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSrchPayload(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_SALE_VOUCHER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

  // //console.log('formStatus from memberform', formStatus)
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
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_SALE_VOUCHER_DATA}
        formName={"Sale Voucher"}
        opterationBtn={[
          {
            name: "Cancel Voucher",
            onClick: () => console.log()
          },
        ]}
        btnEnableDtl={{ insert: false, update: false }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <SaleVoucherheader
              formData={formData}
              handleChange={(name, value, event) =>
                handleChange("formData", name, value, null, event)
              }
              formStatus={formStatus}
              divisions={divisions}
              sections={sections}
              invoices={invoices}
            />
            <SaleVoucherDetail
              detailData={detailData}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              formStatus={formStatus}
              mofData={mofData}
              purposes={purposes}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default SaleVoucher;
