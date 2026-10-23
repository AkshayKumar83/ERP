import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import { Row, Col, Form, Table } from "reactstrap";
import SimpleBar from "simplebar-react";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import { APP_PROD_API } from "../../../../utils/api";
//import ButtonUi from '../../../../components/basic/button';
import toast from "react-hot-toast";

const FinancialYearOpenUpdation = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();
  const [years, setYear] = useState([]);

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_YEAR_OPEN_UPDATION_DROPDOWNDATA
          }`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          console.log("Fetched data:", data);
          setYear(data.years);

          console.log("years data:", data.years);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };

    fetchConstantList();
  }, [formStatus]);

  const [yearname, setYearName] = useState([]);

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (years?.length > 0) {
      const transformedYr = [
        { value: "", label: "" }, // empty default option
        ...years.map((item) => ({
          value: item.year_code,
          label: item.year_desc,
        })),
      ];

      setYearName(transformedYr);
    }
  }, [years]);

  //   useEffect(() => {
  //     console.log("Updated filtered tranData", filteredTranData);
  // }, [filteredTranData]); // Runs whenever filteredTranData is updated

  const tabs = ["Financial Year Opening Updation"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Form submitted", formData);
  }

  // for get procedure
  const handleFinancialYear = async (e) => {
    if (e) {
      e.preventDefault();
    }

    try {
      let body = {
        formData: formData,
      };

      console.log("final body to send:", body);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_YEAR_OPEN_UPDATION_DATA
        }`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      handleCancel();
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator"
      );
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
  }, []);

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {},
    [formStatus, currentRecordNo]
  );

  console.log("formStatus from memberform", formStatus);
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
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id={"year-opening-upadtion-yearOpen-form"}>
              <div
                className="table-title"
                style={{ border: "1px solid #d3d3d3" }}
              >
                <span>
                  Year Opening Updation: Please ensure that you are working in
                  the new year by selecting the financial year. It will transfer
                  opening balances from the previous year.
                </span>
              </div>

              <Row>
                <Col xl={4} style={{ margin: "auto" }}>
                  <Select
                    label="From Year"
                    required
                    placeholder="--select--"
                    name="year_code"
                    type="text"
                    options={yearname}
                    value={formData?.year_code || ""}
                    onChange={(e) => handleChange("year_code", e.target.value)}
                    onBlur={(e) => validateRequiredField(e, "Year Code")}

                    //options={yearname}
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper"
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    //required
                    text="GL Opening"
                    placeholder=""
                    name="mhfmglm"
                    type="checkbox"
                    checked={formData?.mhfmglm === "G"}
                    onChange={(e) =>
                      handleChange("mhfmglm", e.target.checked ? "G" : "N")
                    }
                    //onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="GL Opening FC"
                    //required
                    placeholder=""
                    name="ITEM162"
                    type="checkbox"
                    checked={formData?.ITEM162 === "F" ? true : false}
                    onChange={(e) =>
                      handleChange("ITEM162", e.target.checked ? "F" : "N")
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="Imprest Opening"
                    //required
                    placeholder=""
                    name="MOFMIMPR"
                    type="checkbox"
                    checked={formData?.MOFMIMPR === "I" ? true : false}
                    onChange={(e) =>
                      handleChange("MOFMIMPR", e.target.checked ? "I" : "N")
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="Stock Opening"
                    //required
                    placeholder=""
                    name="mommstok"
                    type="checkbox"
                    checked={formData?.mommstok === "S" ? true : false}
                    onChange={(e) =>
                      handleChange("mommstok", e.target.checked ? "S" : "N")
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="WIP Opening"
                    //required
                    placeholder=""
                    name="MOMMSTOK_WIP"
                    type="checkbox"
                    checked={formData?.MOMMSTOK_WIP === "W" ? true : false}
                    onChange={(e) =>
                      handleChange("MOMMSTOK_WIP", e.target.checked ? "W" : "N")
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="OSP Opening(Vendor)"
                    //required
                    placeholder=""
                    name="MOSCSUBC"
                    type="checkbox"
                    checked={formData?.MOSCSUBC === "O" ? true : false}
                    onChange={(e) =>
                      handleChange("MOSCSUBC", e.target.checked ? "O" : "N")
                    }
                  />
                </Col>
              </Row>

              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="OSP Opening(Customer)"
                    //required
                    placeholder=""
                    name="MOSMSCOP"
                    type="checkbox"
                    checked={formData?.MOSMSCOP === "C" ? true : false}
                    onChange={(e) =>
                      handleChange("MOSMSCOP", e.target.checked ? "C" : "N")
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="Year Opening Rate"
                    //required
                    placeholder=""
                    name="MOMMITEM"
                    type="checkbox"
                    checked={formData?.MOMMITEM === "R" ? true : false}
                    onChange={(e) =>
                      handleChange("MOMMITEM", e.target.checked ? "R" : "N")
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  xl={4}
                  className="button-group-wrapper "
                  style={{ margin: "auto" }}
                >
                  <Checkbox
                    text="Income Tax Sections"
                    //required
                    placeholder=""
                    name="ITAX_SEC"
                    type="checkbox"
                    checked={formData?.ITAX_SEC === "X" ? true : false}
                    onChange={(e) =>
                      handleChange("ITAX_SEC", e.target.checked ? "X" : "N")
                    }
                  />
                </Col>
              </Row>
              <Row>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    border: "none",
                    justifyContent: "center",
                  }}
                >
                  <ButtonUi
                    //  className={styles["ok-button"]}
                    onClick={() => {
                      const userConfirmed = alert(
                        "Do you want to Transfer Closing of Selected financial year?"
                      );
                      handleFinancialYear();
                    }}
                  >
                    OK
                  </ButtonUi>
                  {/* <button className={styles["cancel-button"]}  */}
                  <ButtonUi
                    onClick={() => {
                      handleCancel();
                    }}
                  >
                    Cancel
                  </ButtonUi>
                </div>
              </Row>
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default FinancialYearOpenUpdation;
