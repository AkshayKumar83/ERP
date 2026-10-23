import React, { useEffect } from 'react'
import { Label, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import VoucherAuthHeader from './voucher_auth_header';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { useSelector } from 'react-redux';

const VoucherAuthorisation = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

      const [sectionId,setSectionId] = useState([]);
      const [divisionId, setDivisionId] = useState([]);
      const [finYear, setFinYear]  = useState([]);

   const { user } = useSelector((state) => state.auth);

  const tabs = ["Voucher Authorisation"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  useEffect(() =>{
    const fetchConstantList = async () =>{
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VOUCHER_AUTH_DROPDOWN_DATA}?user_id=${user.id}`,{
          credentials:'include'
        })
        if(response.status === 200 ){
          const data = await response.json();
          setDivisionId([{value:'',Label:''}, ... formatOptions(data.divisionList || [],"division_id",'name')])
          setFinYear([{value:'',Label:''}, ... formatOptions(data.finYearList || []," ",'year_code')])
          setSectionId([{value:'',Label:''}, ... formatOptions(data.sectionList || [],"section_id",'section_desc')])
        }
      } catch (error) {
        //console.log(error);
      }
    }
    if(formStatus){
      fetchConstantList()
    }
  },[formStatus])








  function handleSubmit(e){
    e.preventDefault();

    //console.log("Form submitted", formData)
  }

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setupQueryData = useCallback(
      (queryData, btnClicked) => {
 
      },
      [formStatus, currentRecordNo]
  );

//console.log('formStatus from memberform', formStatus)
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
        QUERY_API={"APP_PROD_API.GET_DATA_FOR_VOUCHER_AUTH"}
        formName={"Voucher Authorisation"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              <VoucherAuthHeader 
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              sectionId={sectionId}
              divisionId={divisionId}
              finYear = {finYear}

              />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default VoucherAuthorisation;

