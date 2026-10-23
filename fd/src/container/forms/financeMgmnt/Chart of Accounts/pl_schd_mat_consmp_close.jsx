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
import { matConsumptionCloseNbtInitFormData, matConsumptionCloseNbtTHeader, formInitData, formDetailInitData } from './pl_schd_mat_consm_closeHelper';
import PlSchdConsCloseDtl from './pl_schd_mat_cons_closeDtl';


const PlSchdMatConsumptionClose = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...formInitData });
  const [nbtFormDetailData, setNbtFormDetailData] = useState([matConsumptionCloseNbtInitFormData])
  const [formDetailData, setFormDetailData] = useState([formDetailInitData])

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();



  const tabs = ["Pl / Schd. Mat. Consumption Close"];

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

      case "nbtDetailData":
        setNbtFormDetailData(prev => {
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
  const handleAddRow = useCallback((tableType) => {
    switch (tableType) {
      case "matConsNBtable":
        setNbtFormDetailData((prevData) => [
          ...prevData,
          {
            ...matConsumptionCloseNbtInitFormData,
            id: prevData.length + 1,
          }
        ]);
        break;
      case "matConsumptable":
        setFormDetailData((prevData) => [
          ...prevData,
          {
            ...formDetailInitData,
            id: prevData.length + 1,
          }
        ]);
        break;

      default:
        console.log("something went wrong")

    }

  }, []);

  // DELETE ROW
  const handleDeleteRow = useCallback((tableType, index) => {
    switch (tableType) {
      case "matConsNBtable":
        setNbtFormDetailData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

      case "matConsumptable":
        setFormDetailData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

    }

  }, []);


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
              <Col xl={5} className='m-auto'>
                <TextField
                  label="Description"
                  required
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  maxLength={150}
                  disabled
                  onChange={(e) => handleChange("formData", "description", e.target.value)}
                />
              </Col>
            </Row>

            <Row>
              <Col xl={8} className='m-auto'>
                <Form id="mat-consumption-close-nbt-form">
                  <div className="table-title">
                    {
                      (formStatus === 'Insert' || formStatus === 'Update') &&
                      <ButtonUi color="primary" className="add-action"
                        onClick={() => handleAddRow("matConsNBtable")}
                      >Add Row</ButtonUi>}

                  </div>

                  <div className='table-container' style={{ height: '150px', maxHeight: '150px' }}>
                    <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                      <Table hover>
                        <thead style={{ border: '' }}>
                          <tr>
                            {
                              (formStatus === 'Insert' || formStatus === 'Update') &&
                              <th className="sticky-column left" style={{ width: '120px' }}>Actions</th>
                            }
                            {matConsumptionCloseNbtTHeader.map((header, index) => (
                              <th
                                key={index}
                                data-required={header.required || false}
                                style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                {header.label}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {nbtFormDetailData &&
                            nbtFormDetailData.map((data, rowIndex) => (
                              <tr key={rowIndex}>
                                {
                                  (formStatus === 'Insert' || formStatus === 'Update') &&
                                  <td className="sticky-column left">
                                    <RowAction
                                      formStatus={formStatus}
                                      canDelete={nbtFormDetailData.length > 1}
                                      onDelete={() => handleDeleteRow("matConsNBtable", rowIndex)}
                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                    />
                                  </td>

                                }
                                <td className="table_cell">
                                  <TextField
                                    required
                                    type="date"
                                    name="from_date"
                                    value={data.from_date || ""}
                                    maxLength={20}
                                    onChange={(e) => handleChange("nbtDetailData", "from_date", e.target.value, rowIndex)}
                                  />
                                </td>

                                <td className="table_cell">
                                  <TextField style={{ textAlign: 'left' }}
                                    required
                                    type="date"
                                    name="to_date"
                                    value={data.to_date || ""}
                                    maxLength={250}
                                    onChange={(e) => handleChange("nbtDetailData", "to_date", e.target.value, rowIndex)}
                                  />
                                </td>
                                <td className="table_cell">
                                  <TextField
                                    required
                                    type="number"
                                    name="clos_stock"
                                    value={data.clos_stock || ""}
                                    maxLength={17}
                                    onChange={(e) => handleChange("nbtDetailData", "clos_stock", e.target.value, rowIndex)}
                                  />
                                </td>
                                <td className="table_cell">
                                  <TextField style={{ textAlign: 'left' }}
                                    required
                                    type="number"
                                    name="prov_close_stock"
                                    value={data.prov_clos_stock || ""}
                                    maxLength={17}
                                    onChange={(e) => handleChange("nbtDetailData", "prov_close_stock", e.target.value, rowIndex)}
                                  />
                                </td>

                              </tr>
                            ))}
                        </tbody>

                      </Table>
                    </SimpleBar>

                  </div>

                </Form>
              </Col>
            </Row>
            <PlSchdConsCloseDtl
              formDetailData={formDetailData}
              handleChange={handleChange}
              formStatus={formStatus}
              handleAddRow = {handleAddRow}
              handleDeleteRow = {handleDeleteRow}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PlSchdMatConsumptionClose;

