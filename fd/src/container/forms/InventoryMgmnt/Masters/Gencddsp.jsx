import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import GencddspDetail from "./Gencddsp_details";
import {
  BarrelFourInitData,
  BarrelThreeInitData,
  BarrelTwoInitData,
   GencddspBarrelInitData,
  GencddspDispLevels,
} from "./Gencddsp_helper";

  const Gencddsp = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...GencddspBarrelInitData });
  const [barrelTwo, setBarrelTwo] = useState({ ...BarrelTwoInitData });
  const [barrelThree, setBarrelThree] = useState({ ...BarrelThreeInitData });
  const [barrelFour, setBarrelFour] = useState({ ...BarrelFourInitData });
  const [gencddspDispLevels, setGencddspDispLevels] = useState({
    ...GencddspDispLevels,
  });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const tabs = ["GENCDDSP"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

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
  }, []);



    //  for nested array object
  // const handleChange = useCallback((name, value) => {
  //   setFormData((prev) => {
  //     const keys = name.split(".");
  //     let newData = { ...prev };

  //     let current = newData;
  //     for (let i = 0; i < keys.length - 1; i++) {
  //       if (Array.isArray(current[keys[i]])) {
  //         current = current[keys[i]][parseInt(keys[i + 1])];
  //         i++; // Skip the index part
  //       } else {
  //         current = current[keys[i]];
  //       }
  //     }

  //     current[keys[keys.length - 1]] = value;
  //     return { ...newData };
  //   });
  // }, []);


    //  for each state 
  const handleChange = useCallback((name, value, section) => {
    if (section === "barrelTwo") {
      setBarrelTwo((prev) => ({ ...prev, [name]: value }));
    } else if (section === "barrelThree") {
      setBarrelThree((prev) => ({ ...prev, [name]: value }));
    } else if (section === "barrelFour") {
      setBarrelFour((prev) => ({ ...prev, [name]: value }));
    } else if (section === "gencddspDispLevels") {
      setGencddspDispLevels((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const triggerAddRow = () => {
    setFormData((prev) => [...prev, {}]);
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {},
    [formStatus, currentRecordNo]
  );

  //console.log("formStatus from memberform", formStatus);
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
        formName={"Gencddsp"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form>

              {/* for nested array */}
              {/* <GencddspDetail
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
              /> */}
              <GencddspDetail
                formData={formData}
                barrelTwo={barrelTwo}
                barrelThree={barrelThree}
                barrelFour={barrelFour}
                gencddspDispLevels={gencddspDispLevels}
                handleChange={handleChange}
                formStatus={formStatus}
              />
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default Gencddsp;
