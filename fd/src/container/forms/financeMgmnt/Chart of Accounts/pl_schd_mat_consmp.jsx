import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RadioGroup from '../../../../components/basic/radioGroup';
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton';
import { InitialFormData, matConsumptionDtlInitFormData } from './pl_schd_mat_consm_helper';
import PlMatConsumptionDtl from './pl_schd_mat_consmDtl';

const PlSchdMatConsumption = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...InitialFormData });
  const [formDetailData, setFormDetailData] = useState([matConsumptionDtlInitFormData])
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();


  const tabs = ["Pl / Schd. Mat. Consumption"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  function handleSubmit(e) {
    e.preventDefault();

    console.log("Form submitted", formData)
  }

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);

  const handleChange = useCallback((type, name, value, rowIndex = null) => {
    switch (type) {

      case "formData":
        setFormData(prev => ({
          ...prev,
          [name]: typeof value === "string" ? value.toUpperCase() : value
        }));
        break;

      case "formDetailData":
        setFormDetailData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;

      default:
        console.log("handleChange is not properly defined");
    }


  }, []);

  // ADD NEW ROW
  const handleAddRow = useCallback(() => {
    setFormDetailData((prevData) => [...prevData, matConsumptionDtlInitFormData]);
  }, [formDetailData]);

  // DELETE ROW
  const handleDeleteRow = useCallback((data, index) => {
    setFormDetailData((prev) => {
      if (prev.length === 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, [formDetailData]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

    },
    [formStatus, currentRecordNo]
  );

  console.log('formStatus from memberform', formStatus)
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
            <Row>
              <Col xl={6}>
                <TextField
                  label="Description"
                  required
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  maxLength={150}
                  onChange={(e) => handleChange("formData", "description", e.target.value)}
                />
              </Col>

              <Col xl={2}>
                <TextField style={{ textAlign: 'left' }}
                  label="Sr. No."
                  required
                  type="number"
                  name="seq_no"
                  value={formData.seq_no || ""}
                  maxLength={3}
                  onChange={(e) => handleChange("formData", "seq_no", e.target.value)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  label="Group By"
                  required
                  type="text"
                  name="group_by"
                  value={formData.group_by || ""}
                  maxLength={2}
                  onChange={(e) => handleChange("formData", "group_by", e.target.value)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  label="Group By 2"
                  required
                  type="text"
                  name="group_by1"
                  value={formData.group_by1 || ""}
                  maxLength={2}
                  onChange={(e) => handleChange("formData", "group_by1", e.target.value)}
                />
              </Col>
            </Row>
            <PlMatConsumptionDtl
              formDetailData={formDetailData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
            />

            <Row>
              <Col xl={10}>
                <Row>
                  <Col xl={3}>
                    <TextField
                      required
                      type="text"
                      name="cntl"
                      value={formData.cntl || ""}
                      maxLength={2}
                      onChange={(e) => handleChange("formData", "cntl", e.target.value)}
                    />
                  </Col>
                  <Col xl = {7}>
                    <ButtonUi color="secondary">
                      PUSH_BUTTON258
                    </ButtonUi>
                  </Col>
                </Row>
              </Col>
            </Row>

          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PlSchdMatConsumption;

