import React from 'react'
import MuiTextField from '../../../../components/basic/muiTextField'
import { Col, Row, Table, Form, Card ,Container} from "reactstrap";
import { Select } from '@mui/material';
import MuiSelectField from '../../../../components/basic/muiSelectField';
import { Contact } from 'lucide-react';
import { CrHelpListHeader, DrHelpListHeader } from './dlr_subsidy_account_mstr_hlpr';
import ButtonUi from '../../../../components/basic/button';
import { APP_PROD_API } from '../../../../utils/api';

const DlrSubsidyAccountMstrHdr = ({handleChange, formData,
    formStatus,brandList, 
     handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFormData

}) => {
  
   const handleDoubleClick = (field, header) => {
    if(['Insert',"Search",'Update'].includes(formStatus)) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };


const handleExcelDownload = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DLR_SUBSIDY_ACCOUNT_REPORT_DATA}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `DlrSubsidyReport_${Date.now()}.xlsx`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download Error:", err);
  }
};
    return (
   <>
   <Container fluid className="mt-3 w-50">
        <Card className="p-3">
        <Row>
           <Col xl={4}>
                  <MuiTextField
                    type="text"
                    label="Cr Acc No."
                    name="cr_acc_no"
                     maxLength={100}
                    value={formData?.cr_acc_no}
                    onChange={(e) =>handleChange( e,"cr_acc_no", e.target.value)}
                     required
                onDoubleClick={() => handleDoubleClick("CR", CrHelpListHeader)}
                     
                  />
                </Col>
           <Col xl={8}>
                  <MuiTextField
                    type="text"
                    label="Name"
                    name="cr_name"
                     maxLength={100}
                    value={formData?.cr_name}
                    onChange={(e) =>handleChange( e,"cr_name", e.target.value)}
                    disabled
                  />
                </Col>
                </Row>
          <Row className='mt-3'>
          <Col xl={4}>
                  <MuiTextField
                    type="text"
                    label="Dr Acc No."
                    name="dr_acc_no"
                    // maxLength={20}
                    value={formData?.dr_acc_no}
                    onChange={(e) =>handleChange( e,"dr_acc_no", e.target.value)}
                     required
                onDoubleClick={() => handleDoubleClick("DB", DrHelpListHeader)}
                     
                  />
                </Col>
          <Col xl={8}>
                  <MuiTextField
                    type="text"
                    label="Name"
                    name="dr_name"
                    // maxLength={20}
                    value={formData?.dr_name}
                    onChange={(e) =>handleChange( e,"dr_name", e.target.value)}
                    disabled
                  />
                </Col>
         </Row>
         <Row className='mt-3'>
           <Col xl={6} className="mt-1">
                <MuiSelectField
              label="Brand"
              type="text"
              name="brand_code"
              value={formData?.brand_code || ""}
              options={brandList}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
               required
            />
              </Col>
         

        </Row> 
        </Card>
          <Row className='mt-4 d-flex justify-content-center'>
          <Col xl={3}>
          <ButtonUi onClick={handleExcelDownload}>
             Excel Report
          </ButtonUi>
          </Col>
        </Row>
        </Container>

      
   </>
  )
}

export default DlrSubsidyAccountMstrHdr



 
     


