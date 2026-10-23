import React, { useEffect } from "react";
import { Card, Col, Form, Row, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import { formatOptions } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";

const InvoiceGenBulkMail = () => {
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
  const { loading, setLoading, formLoading, setFormLoading } = useFormLoading();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = ["Invoice Generation & Bulk Mail"];

  const [dateRanges, setDateRanges] = useState([])

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_INV_BULK_MAIL_FORMDATA
          }`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
         

          setDateRanges([
            { value: "", label: "" },
            ...formatOptions(data?.dateRange || [], "emi_date", "emi_date"),
          ]);
          
        }
      } catch (err) {
        // //console.log(err);
      }
    };

    fetchConstantList();


  }, [formStatus]);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData(supplierMasterInitialData);
    setDiLastCode("");
    setActiveTab(1);
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // //console.log(queryData);
      setFormData(queryData?.supplierMstr);
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.count);
      }
    },
    [formStatus, currentRecordNo]
  );

  const handleTabChange = (newTab) => {
    if (formStatus === "Query" || !formStatus) {
      setActiveTab(newTab);
      return;
    }

    const currentTabKey = tabKeyMap[activeTab];
    const { valid } = validateTab(currentTabKey);

    if (valid) {
      setActiveTab(newTab);
    }
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();

    // try {
    //   setFormLoading(true);

    //   const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${
    //     APP_PROD_API.POST_SUPPLIER_MSTR_DATA
    //   }?form_status=${formStatus}&appDivisionId=${
    //     user.global_division_id
    //   }&appFinYear=${user.global_fin_year}&userId=${user.id}`;

    //   const response = await fetch(apiUrl, {
    //     method: "POST",
    //     body: JSON.stringify({
    //       formData: { ...formData, vcode_auto: "Y" }, // Force auto code if needed
    //       user,
    //     }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //   });

    //   // Step 7: Handle API Response
    //   if (response.ok) {
    //     toast.success(
    //       `Form ${formStatus === "Insert" ? "Saved" : "Updated"} successfully`
    //     );
    //     handleCancel();
    //   } else {
    //     const result = await response.json();
    //     toast.error(result.errMsg || result.message || "Update failed.");
    //   }
    // } catch (error) {
    //   console.error(" Submit Error:", error);
    //   toast.error(
    //     error?.message ||
    //       "Please check all the form fields or contact administrator"
    //   );
    // } finally {
    //   setFormLoading(false);
    // }
  };

  const handleChange = useCallback((event) => {
    let {name, value} = event.target
    setFormData((prev)=>({...prev, [name]: value }))
  }, [formStatus]);

  const handleSearch = async () => {
    return;
  };

  // const generateInv = async()=>{
  //       try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_BASE_API_URL}${
  //         APP_PROD_API.GET_INV_BULK_MAIL_GEN_BULK_INV
  //       }?emi_date=${formData?.emi_date}`,
  //       {
  //         method: "GET",
  //       credentials:'include',
  //       }
  //     );

  //     if (response.ok) {
  //       const result = await response.json();
  //       toast.success(result?.message || "Invoice updated successfully.");
  //       // setFormData((prev) => ({ }));
  //     } else {
  //       const result = await response.json();
  //       throw new Error(result.message)
  //     }
  //   } catch (error) {
  //     console.error("Error updating Invoice:", error);
  //     toast.error(error.message || "An error occurred while generating service charge  Invoice.");
  //   }
  // }

  const generateInv = async () => {
  // start loader
  setIsLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_INV_BULK_MAIL_GEN_BULK_INV
      }?emi_date=${formData?.emi_date}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (response.ok) {
      const result = await response.json();
      toast.success(result?.message || "Invoice generated successfully.");
    } else {
      const result = await response.json();
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error generating Invoice:", error);
    toast.error(
      error.message ||
        "An error occurred while generating the service charge invoice."
    );
  } finally {
    // stop loader
    setIsLoading(false);
  }
};


  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={tabs}
      updateActiveTab={handleTabChange}
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
      QUERY_API={"APP_PROD_API.GET_SUPPLIER_FORM_DATA"}
      searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      formName={"Supplier Master"}
    >
      <TabContent activeTab={activeTab}>
        {/* Main Tab */}
        <TabPane tabId={1}>
          <Form
          >
            <Row>
              <Col xl={7} className="m-auto">
                <Card className="mb-2 p-3 mt-2">
                  <Row className="mt-3">
                    <Col xl={8} className="m-auto ">
                      {/* <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                        }}
                      > */}
                        {/* <label
                          style={{
                            width: "20%",
                            textAlign: "right",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          Select Date
                        </label> */}
                        {/* <div style={{ width: "80%" }}> */}
                          <Select
                            required
                            label = "Select EMI Date"
                            name="emi_date"
                            value={formData.emi_date || ""}
                            onChange={handleChange}
                            options={dateRanges}
                          />
                        {/* </div> */}
                      {/* </div> */}
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        justifyContent: "center",
                      }}
                    >
                      <ButtonUi
                        color="secondary"
                        className="px-3"
                        disabled={isLoading || !formData.emi_date}
                        onClick={generateInv}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Processing...
                          </>
                        ) : (
                          "Generate invoice against EMI date"
                        )}
                      </ButtonUi>

                      <ButtonUi color="secondary">Send Email</ButtonUi>
                    </div>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Form>
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default InvoiceGenBulkMail;
