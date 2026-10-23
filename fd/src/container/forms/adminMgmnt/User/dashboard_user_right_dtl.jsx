import React, { useState } from 'react'
import { Form, Row, Col, Card, Table, Container } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import { DBModuleHeadHelpListHeader, handleValidateField, headers, LoginNameHeadHelpListHeader } from './dashboard_user_right_helper'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import { FcInfo } from 'react-icons/fc'
import toast from 'react-hot-toast'

const DashboardUserRightDtl = ({formData  ,handleChange , detailFormData, formStatus, triggerAddRow, handleDelete,handleUpdate,focusedRowIndex,setFocusedRowIndex,handleHelpList = () => {}, setHelpFor, setHelpListHeader
 }) => {

   const makeFocusOnTableRow = (rowIndex, id) => {
     const entry = detailFormData.find((entry) => entry.sr_no === id);
     setFocusedRowIndex(rowIndex);
     
   };

 const handleDoubleClick = (field, header) => {
    if(['Insert','Search','Update'].includes(formStatus)) {
       if (field === "DBModule" && !formData?.user_id) {
    toast.error("Please select Login Name first");
    return;
  }
      setHelpFor(field);
      setHelpListHeader(header); 
      handleHelpList(true); 

    }
  };
 

  return (

<Row className="d-flex justify-content-center align-items-center mt-4">
  <Col sm={12} md={8} lg={6} className="d-flex justify-content-center">
    <Card className="w-100">
      <Container className='my-3'>
       <Form id="dashboard-user-right" className="">
        <Row>
          <Col sm={12} md={6} lg={4}>
            <TextField
              type="text"
              label="Login Name"
              maxLength={30}
              name="login_name"        
              value={formData?.login_name || ""}
              onChange={(e) => handleChange("login_name", e.target.value,null,e)}
              onDoubleClick={() => handleDoubleClick("LoginName",LoginNameHeadHelpListHeader )}
              onBlur={(e) => handleValidateField(e, formStatus)}
              required
              disabled={formStatus === "Update"} 
            />
          </Col>
       
          <Col sm={12} md={6} lg={8}>
            <TextField
              type="text"
              label="User Name"
              maxLength={50}
              value={formData?.user_name || ""}
              onChange={(e) => handleChange("user_name", e.target.value,null,e)}
              disabled
            />
          </Col>
        </Row>
    

     
        <div className="table-title">
          <span>Dashboard User Right</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div>

        {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
       <Table>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th>Actions</th>
                  )}
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      data-required={header.required || false}
                      style={{
                        whiteSpace: "nowrap",
                        width: header.width,
                        minWidth: header.width,
                      }}
                    >
                      {header.label}
                        {header.isHelpExist && (<FcInfo title="Info" />)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailFormData.map((data, rowIndex) => (
                  <tr 
                  key={rowIndex} 
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                  style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                  }} 
                  tabIndex={0}>
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td>
                        <RowAction
                          formStatus={formStatus}
                          canDelete={detailFormData.length > 1}
                         onDelete={() => handleDelete(rowIndex)} // Delete row
                          // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                        />
                      </td>
                    )}
                    <td>
                      <TextField
                        type="text"
                        required
                        name="db_module_desc"
                        value={data?.db_module_desc || ""}
                        onChange={(e) =>handleChange("db_module_desc", e.target.value, rowIndex, e) }
                        onDoubleClick={() => handleDoubleClick("DBModule",DBModuleHeadHelpListHeader)}
                        onBlur = {(e) => handleValidateField(e,formStatus)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          </SimpleBar>
        </div>
      </Form>
      </Container>
    </Card>
  </Col>
</Row>

  )
}

export default DashboardUserRightDtl


