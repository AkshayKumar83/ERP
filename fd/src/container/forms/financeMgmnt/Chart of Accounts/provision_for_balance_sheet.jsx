import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { formDetailInitData } from './provision_for_balSheetHelper';
import ButtonUi from '../../../../components/basic/button';
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { formDetailHeader } from './closing_inv_for_balSheetHelper'
import RowAction from '../../../../components/common/rowAction'
import ProvisionForBalanceSheetDtl from './provision_for_balSheetDtl';


const ProvisionForBalanceSheet = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [formDetailData, setFormDetailData] = useState([formDetailInitData])
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();



  const tabs = ["Provision For Balance Sheet"];

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
           setFormData(prev => ({ ...prev, 
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
               setFormDetailData((prevData) => [...prevData, formDetailInitData]);
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
              <Col xl={3} className='m-auto'>
                <ButtonUi color="secondary">
                  Cancel Memo Voucher
                </ButtonUi>
              </Col>
            </Row>

            <Row>
              <Col xl={5} className='m-auto'>
                <Row>
                  <Col xl={5}>
                    <TextField
                      label="Provision Date"
                      required
                      type="text"
                      name="prov_dt"
                      value={formData.prov_dt || ""}
                      maxLength={20}
                      onChange={(e) => handleChange("formData", "prov_dt", e.target.value, rowIndex)}
                    />
                  </Col>

                  <Col xl={3} className='mt-4'>
                    <Checkbox
                      onChange={(e) => handleChange("formData", "total_flag", e.target.checked ? "Y" : "N", rowIndex)}
                      text="Cancel Flag"
                      name="total_flag"
                      checked={formData?.total_flag === "Y"}
                    />
                  </Col>
                </Row>
              </Col>
            </Row> 
            <ProvisionForBalanceSheetDtl  
            formDetailData = {formDetailData}
            handleChange = {handleChange} 
            formStatus = {formStatus}
            handleAddRow={handleAddRow} 
            handleDelete={handleDeleteRow}
             />

          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ProvisionForBalanceSheet;

