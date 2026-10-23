import React, { useState } from 'react'
import { Form, Row, Col, Card, Table, Container } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import { DBModuleHeadHelpListHeader, headers, LoginNameHeadHelpListHeader } from './dashboard_link_right_helper'
import SimpleBar from 'simplebar-react'
import Checkbox from '../../../../components/basic/checkbox'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'

const DashboardLinkRightDtl = ({formData  ,handleChange , detailFormData, formStatus, triggerAddRow, handleDelete,handleUpdate,focusedRowIndex,setFocusedRowIndex,handleHelpList = () => {}, setHelpFor, setHelpListHeader}) => {

 
 const makeFocusOnTableRow = (rowIndex, id) => {
     const entry = detailFormData.find((entry) => entry.sr_no === id);
     setFocusedRowIndex(rowIndex);
     
   };

 
 const handleDoubleClick = (field, header) => {
      setHelpFor(field);
      setHelpListHeader(header); 
      handleHelpList(true); 

  };
 
  // function handleUpdate (){
  // }
  

  return (
<>
<Row className="d-flex justify-content-center align-items-center">
  <Col sm={12} md={8} xl={6} className="d-flex justify-content-center">
    <Card className="w-100">
      <Container className='my-3'>
      <Form id="dashboard-link-right" className=''>
        <Row>
          <Col sm={11} md={11} xl={4}>
            <TextField
              type="text"
              label="Login Name"
              name='login_name'
              value={formData?.login_name || ""}
              onChange={(e) => handleChange("login_name", e.target.value,null ,e)}
               onDoubleClick={() => handleDoubleClick("UserName",LoginNameHeadHelpListHeader )}
               disabled={formStatus === "Update"} 
            />
          </Col>
     
          <Col sm={11} md={11} xl={6}>
            <TextField
              type="text"
              label="User Name"
              value={formData?.user_name || ""}
              onChange={(e) => handleChange("user_name", e.target.value, null,e)}
              disabled
            />
          </Col>
        </Row>
        <Row className='mt-2'>
          <Col sm={11} md={11} xl={10}>
            <TextField
              type="text"
              label="Dashboard Module"
              name="db_module_desc"
              value={formData?.db_module_desc || ""}
              onChange={(e) => handleChange("db_module_desc", e.target.value, null,e)}
               onDoubleClick={() => handleDoubleClick("DBModule",DBModuleHeadHelpListHeader)}
               disabled={formStatus === "Update"} 
            />
          </Col>
        </Row>
      

      
        <div className="table-title">
          <span>Dashboard Link Right</span>
          {/* {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )} */}
        </div>

       <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
               <div className='table-sticky-wrapper'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th ></th>
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
                        {/* <RowAction
                          formStatus={formStatus}
                          canDelete={detailFormData.length > 1}
                          onDelete={() => handleDelete( rowIndex)}
                          // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                        /> */}
                      </td>
                    )}
                    <td>
                      <TextField
                        type="text"
                        required
                        name="link_name"
                        value={data?.link_name || ""}
                        maxLength={30}
                        onChange={(e) =>handleChange("link_name", e.target.value, rowIndex, e) }
                        disabled
                      />
                    </td>
                    <td>
                    <Checkbox 
                        onChange={(e) =>  handleChange("allow_view", e.target.checked ? "Y" : "N", rowIndex,e)}
                        checked={data?.allow_view === "Y"}
                        // disabled
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
</>
  )
}

export default DashboardLinkRightDtl