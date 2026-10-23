import React from 'react'
import { Card, Col, Form, Row } from 'reactstrap'
import MuiTextField from '../../../../components/basic/muiTextField'
import ButtonUi from '../../../../components/basic/button'
import { newProductCodeHelpListHeader, validateFromDb } from './routing_maintenance_helper'
import toast from 'react-hot-toast'

const RoutingMaintenaceCopyRoute = ({ copyData, handleChange, formStatus,  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,setCopyData, user,headerData

  }) => {

  const handleDoubleClick = (field, header) => {
    if(['Insert',"Search",'Update'].includes(formStatus)) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const handleNewRouteBlur = async (e, formStatus) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;

  /* ================= NEW ROUTE NO ================= */
  if (name !== "new_route_no") return;

  if (!value) {
    toast.error("Route Sheet No. can not be blank");
    e.target.focus();
    return; 
  }

  const res = await validateFromDb({
    type: "COPY_ROUTE_VALIDATE",
    value,
    extra: {
      new_route_no: value,
    },
  });

  if (!res) {
    setCopyData((prev) => ({
      ...prev,
      new_route_no: "",
    }));
    e.target.focus();
  }
};

const handleCopyRoute = async () => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  if (!copyData?.new_route_no || !copyData?.new_it_code) {
    toast.error("New Route No. and Product Code are required");
    return;
  }
  if (!headerData?.wc_id) {
    toast.error("WC ID are required");
    return;
  }
  if (!headerData?.route_no) {
    toast.error("Route No.are required");
    return;
  }

  const res = await validateFromDb({
    type: "COPY_ROUTE_SHEET",
    value: copyData.new_route_no,
    extra: {
      old_route_no: headerData.route_no,  
      new_route_no: copyData.new_route_no,
      new_it_code: copyData.new_it_code,
      wc_id: headerData.wc_id,
      user_id: user.id,
    },
  });

  if (!res) return;

  toast.success("Route Sheet Successfully Copied");

  // optional: reset copy tab
  setCopyData({});
};


  return (
    <Form id ='route-copy'>
    <Row className="justify-content-center mt-5">
      {/*  Card width control yahin se */}
      <Col xl={4} lg={5} md={6} sm={8}>
        <Card className="p-4">
          
          <Row className='d-flex justify-content-center'>
            <Col xl={8}>
              <MuiTextField
                type="text"
                label="New Route No."
                name="new_route_no"
                value={copyData?.new_route_no}
               onChange={(e) => handleChange("copy", "new_route_no", e.target.value, 0, e)}
              onBlur = {(e) => handleNewRouteBlur(e, formStatus)}
              required
              />
            </Col>
          </Row>

           <Row className='mt-4 d-flex justify-content-center'>
            <Col xl={8}>
              <MuiTextField
                type="text"
                label="New Product Code"
                name="new_it_code"
                value={copyData?.new_it_code}
                onChange={(e) => handleChange("copy", "new_it_code", e.target.value, 0, e)}
                onDoubleClick={() => handleDoubleClick("newPrcdCode", newProductCodeHelpListHeader)}
                showHelpIcon
              />
            </Col>
          </Row>
             <Row className='mt-4 d-flex justify-content-center'>
            <Col xl='6'>
            <ButtonUi outline onClick={handleCopyRoute}>
  Copy Route Sheet
</ButtonUi>
            </Col>
          </Row>

        </Card>
      </Col>
    </Row>
    </Form>
  )

}

export default RoutingMaintenaceCopyRoute
