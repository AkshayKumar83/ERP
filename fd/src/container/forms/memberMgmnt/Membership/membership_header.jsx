
// import React, { useEffect, useState } from "react";
// import { Card, Col, Container, Form, Row } from "reactstrap";
// import TextField from "../../../../components/basic/textField";
// import Checkbox from "../../../../components/basic/checkbox";
// import Select from "../../../../components/basic/select";

// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
// import ButtonUi from "../../../../components/basic/button";
// import { validateField } from "../../../../lib";
// import { APP_PROD_API } from "../../../../utils/api";
// import { validateMemberNo } from "./member_onboard_helper";

// const MembershipDetail = ({   
//     formData,
//     setFormData,
//     handleChange,
//     formStatus,
//     handleHelpList=()=>{},
//     dealerCodeData,
//     handleDealerCodeField,
//     regionalInfo,
//     division,
//  }) => {

//     const [isRegionalModelOpen, setIsRegionalModelOpen] = useState()
//     const toggleRegionalModal = () => setIsRegionalModelOpen(!isRegionalModelOpen)
//     const [previousDealerCode, setPreviousDealerCode] = useState(formData.dealerCode);

//     useEffect(() => {
//         setPreviousDealerCode(formData.dealerCode);
//     }, [formData.dealerCode]);

//     const handleDoubleClick = () => {
//         if (formStatus) {
//             handleHelpList(true);
//         }
//     };

//     const handleDealerCodeChange = (e) => {
//         const newDealerCode = e.target.value;
//         handleChange(e, "dealerCode", newDealerCode);

//         if (newDealerCode !== previousDealerCode) {
//             // Clear related fields
//             handleChange(e, "division", "");
//             handleChange(e, "dealershipName", "");
//             handleChange(e, "location", "");
//             handleChange(e, "alternateEmailId", "");
//             handleChange(e, "gstin", "");
//             handleChange(e, "dealershipStatus", "");
//             handleChange(e, "inoprativeDate", "");
//             handleChange(e, "dealerAppointmentDate", "");
//         }
//     };

//     const findDataOnEnter = (e) => {
//         if (e.key === "Enter" || e.key === "Tab") {
//             handleDealerCodeField(e.target.value);
//         }
//     };

//     // todo: on double click the error is still shows
//     const findDealer = async (e) => {
//         // if(e.relatedTarget?.id==='empty-formStatus' || e.relatedTarget?.id === 'help-list-modal' || e.relatedTarget?.id === 'help-list'){
//         //     return
//         // }

//         const nextElement = e.relatedTarget; // The element getting focus after blur

//         // If nextElement is an input field, trigger validation
//         if (!nextElement || nextElement.tagName !== "INPUT") {
//           return// Replace with your validation logic
//         }
//         if(formStatus != 'Insert'){
//             return;
//         }
//         let fieldName = e.target.name
//         let value = e.target.value
//         // if(value.length){
//         //     const result = await validateField(`${import.meta.env.VITE_BASE_API_URL}/${APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}`,fieldName,value);
//         //         if (result?.type === "found") {
//         //             if (result?.dealer_code) {
//         //                 console.log(result?.dealer_code);
//         //                 handleDealerCodeField(result?.dealer_code);
//         //             }
//         //         } else {
//         //             handleDealerCodeField(value);
//         //         }
//         // }
//         handleDealerCodeField(value);

//     };

//     // commented out the logic on member Date on 27-11-2024
//     const handleMembershipDate = (e) => {
//         handleChange(e, "membershipDate", e.target.value);
//         // let {status, message} = currentDate(e.target.value);
//         // if(status){
//         //     handleChange("membershipDate", e.target.value);
//         // } else {
//         //  toast.error(message);
//         //  handleChange("membershipDate", '');
//         // }
//     };
    

//     const handleStartupKitChange = (e) => {
//         const isChecked = e.target.checked;
//         const field = e.target.name;
//         // console.log(field);
//         if(field != 'allKitItem'){
//             handleChange(e, field, isChecked);
//             handleChange(e, 'allKitItem', false)
//         }
      
//         if (field === "allKitItem" && isChecked) {
//             // If "All" is checked, uncheck all other fields
//             handleChange(e, "tools", true);
//             handleChange(e, "uniform", true);
//             handleChange(e, "promotionalKit", true);
//             handleChange(e, "stationary", true);
//             handleChange(e, "allKitItem", true); // "All" is checked
//             // handleChange(e, "tools", false);
//             // handleChange(e, "uniform", false);
//             // handleChange(e, "promotionalKit", false);
//             // handleChange(e, "stationary", false);
//             // handleChange(e, "allKitItem", true); // "All" is checked
//         } 
//     };

//     const handleChangeMemberNo = (e)=>{

//     }
    
//     return (
//         <React.Fragment>
//             <Form id='membership-form-v1'>
//             <Row>
//                 <Col xl={6}>
//                     <Row>
//                         <Col xl={4}>
//                             <TextField
//                                 required
//                                 type="text"
//                                 label="Dealer Code"
//                                 value={formData.dealerCode || ""}
//                                 onChange={handleDealerCodeChange}
//                                 onKeyDown={findDataOnEnter}
//                                 onDoubleClick={handleDoubleClick}
//                                 onBlur={findDealer}
//                             />
//                         </Col>
//                         {/* <Col xl={4}>
//                             <TextField
//                                 type="text"
//                                 label="Membership No."
//                                 name = 'membershipNo'
//                                 value={formData.membershipNo || ""}
//                                 onChange={(e) => handleChange(e, "membershipNo", e.target.value)}
//                                 // disabled={formStatus !== "Query" && formStatus !== 'Search'}
//                                 disabled={formStatus == 'Update'}
//                                 onBlur={(e)=>validateMemberNo({e,formData, setFormData, formStatus})}
//                             />
//                         </Col> */}
//                          <Col xl={4}>
//                         <TextField
//                           type="text"
//                           label="Membership No."
//                           name="membershipNo"
//                           value={formData.membershipNo || ""}
//                           onChange={(e) => {
//                             const value = e.target.value;
                        
//                             // Allow only "M" followed by digits
//                           if (/^[Mm]\d*$/.test(value) || value === "") {
//                             handleChange(e, "membershipNo", value);
//                           }
//                           }}
//                           disabled={formStatus === "Update"}
//                           onBlur={(e) =>
//                             validateMemberNo({ e, formData, setFormData, formStatus })
//                           }
//                         />
//                         </Col>
//                         <Col xl={4}>
//                             <Select 
//                                 disabled ={formStatus != 'Search'}
//                                 label = "Membership Status"
//                                 name="membershipStatus"
//                                 value={formData["membershipStatus"]}
//                                 onChange={(e) =>handleChange(e, "membershipStatus",e.target.value)}
//                                 options={[
//                                     { value: "", label: "" },
//                                     { value: "P", label: "Pending" },
//                                     { value: "C", label: "Confirmed" },
//                                 ]}
//                             />
//                         </Col>
//                     </Row>
//                 </Col>
//                 <Col xl={6}>
//                     <Row>
//                         <Col xl={4}>
//                             <TextField
//                                 type="text"
//                                 label="DD No."
//                                 value={formData.ddNo || ""}
//                                 onChange={(e) =>handleChange(e, "ddNo", e.target.value)}
//                                 maxLength={20}
//                                 title={"Maximum 20 characters allowed"}
//                             />
//                         </Col>
//                         <Col xl={4}>
//                             <TextField
//                                 type="date"
//                                 label="DD Date"
//                                 value={formData.ddDate || ""}
//                                 onChange={(e) =>handleChange(e, "ddDate", e.target.value)}
//                             />
//                         </Col>
//                         <Col xl={4} style={{display:'flex', justifyContent:'center', alignItems:'end'}}>
//                             <div className="checkbox-container">
//                                 <Checkbox
//                                     text="Member Active"
//                                     checked={formData?.membershipActive || false}
//                                     // lableClass={`${formData?.membershipActive == true? 'text-success' : 'text-danger'}  fw-semibold fs-6`}
//                                     onChange={(e) =>handleChange(e, "membershipActive", e.target.checked)}
//                                 />
//                             </div>
//                         </Col>
//                     </Row>
//                 </Col>
//             </Row>
//             <Row className="">
//                 <Col xl={2}>
//                      <Select
//                         required
//                         name="division"
//                         label="Division"
//                         value={formData.division || ""}
//                         onChange={(e) => handleChange(e, "division", e.target.value)}
//                         options={division}
//                         disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
//                     />
//                 </Col>
//                 <Col xl={5}>
//                     <TextField
//                         type="text"
//                         label="Dealership Name"
//                         value={formData.dealershipName || ""}
//                         onChange={(e) =>handleChange(e, "dealershipName", e.target.value)}
//                         disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
//                     />
//                 </Col>
//                 <Col xl={3}>
//                     <TextField
//                         type="text"
//                         label="GSTIN"
//                         value={formData.gstin || ""}
//                         onChange={(e) => handleChange(e, "gstin", e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="text"
//                         label="Location"
//                         value={formData.location || ""}
//                         onChange={(e) =>handleChange(e, "location", e.target.value)}
//                         disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
//                     />
//                 </Col>    
//             </Row>
//             <Row className="mt-1">
//                 <Col xl={3}>
//                     <TextField
//                         label="Dlr Email ID"
//                         type="text"
//                         value={formData.emailId || ""}
//                         onChange={(e) =>handleChange("emailId", e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={3}>
//                     <TextField
//                         type="text"
//                         label="Dlr Alt. Email ID"
//                         value={formData.alternateEmailId || ""}
//                         onChange={(e) =>handleChange(e, "alternateEmailId", e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="text"
//                         label="Dlr Phone No."
//                         value={formData["phoneNo"] || ""}
//                         onChange={(e) => handleChange(e, "phoneNo", e.target.value)}
//                         disabled
//                     />
                    
//                 </Col>
              
//                  <Col xl={4}>
//                     <TextField
//                         type="text"
//                         label="Dlr Address"
//                         value={formData.address || ""}
//                         onChange={(e) =>handleChange(e, "address", e.target.value)}
//                         disabled
//                     />
//                 </Col>

//             </Row>
//             <Row className="mt-1">
//                 <Col xl={2}>
//                     <TextField
//                         type="date"
//                         label="Dlr Appoint Date"
//                         value={formData.dealerAppointmentDate || ""}
//                         onChange={(e) => handleChange(e, "dealerAppointmentDate",e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="date"
//                         label="Dlr Inoperative Date"
//                         value={formData.inoprativeDate || ""}
//                         onChange={(e) => handleChange(e, "inoprativeDate", e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="date"
//                         label="Dlr Cessation Date"
//                         value={formData.ceasationDate || ""}
//                         onChange={(e) =>handleChange(e, "ceasationDate", e.target.value)}
//                         disabled
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         label="Facebook Account Handle"
//                         value={formData.fbAccount || ""}
//                         onChange={(e) =>handleChange(e, "fbAccount", e.target.value)}
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="number"
//                         label="Forfeiture Amount"
//                         value={formData.forFeitureAcc || ""}
//                         onChange={(e) =>handleChange(e, "forFeitureAcc", e.target.value)}
//                     />
//                 </Col>
//                 <Col xl={2}>
//                     <TextField
//                         type="number"
//                         label="Member Fee Amt."
//                         value={formData.memberFeeAmt || ""}
//                         onChange={(e) =>handleChange(e, "memberFeeAmt", e.target.value)}
//                     />
//                 </Col>
//             </Row>
//             <Row className="mt-1">
//                 <Col xl={2}>
//                     <TextField
//                         required
//                         type="date"
//                         label="Membership Date"
//                         value={formData.membershipDate || ""}
//                         onChange={(e) =>handleChange(e, "membershipDate", e.target.value)}
//                     />
//                 </Col>
//                 <Col xl={3}>
//                     <TextField
//                         type="date"
//                         label="Board Meeting (Members Appt.) Date"
//                         value={formData.boardMeetingAppointmentDate || ""}
//                         onChange={(e) => handleChange(e, "boardMeetingAppointmentDate",e.target.value)}
//                     />
//                 </Col>
//                 <Col xl={3}>
//                     <TextField
//                         type="date"
//                         label="Board Meeting (Members Cessation) Date"
//                         value={formData.boardMeetingCeasationDate || ""}
//                         onChange={(e) => handleChange(e, "boardMeetingCeasationDate",e.target.value)}
//                     />
//                 </Col>
//                 <Col xl={3}>
//                     <TextField
//                         type="date"
//                         label="Board Meeting (Members Reinstate) Date"
//                         value={formData.boardMeetingReinstateDate || ""}
//                         onChange={(e) =>handleChange(e, "boardMeetingReinstateDate",e.target.value)}
//                     />
//                 </Col>{" "}
//             </Row>
//             <Row className="d-flex align-items-end mt-3">
//                 <Col xl={4}>
//                     <div className="box-border button-group-wrapper">
//                         <Checkbox
//                              text="Membership Fee"
//                              checked={formData.membershipFee || false}
//                              onChange={(e) =>handleChange(e, "membershipFee", e.target.checked)}
//                         />
//                         <Checkbox
//                              text="Membership Form"
//                              checked={formData.membershipForm || false}
//                              onChange={(e) =>handleChange(e, "membershipForm", e.target.checked)}
//                         />
//                     </div>
//                 </Col>
//                 <Col xl={5}>
//                     <div className="box-border button-group-wrapper">
//                         <Checkbox
//                             text="Tools"
//                             name="tools"
//                             checked={formData.tools || false}
//                             onChange={handleStartupKitChange}
//                         />
//                         <Checkbox
//                             text="Uniform"
//                             name="uniform"
//                             checked={formData.uniform || false}
//                             onChange={handleStartupKitChange}
//                         />
//                         <Checkbox
//                             text="Promotional Kit"
//                             name="promotionalKit"
//                             checked={formData.promotionalKit || false}
//                             onChange={handleStartupKitChange}
//                         />
//                         <Checkbox
//                             text="Stationary"
//                             name="stationary"
//                             checked={formData.stationary || false}
//                             onChange={handleStartupKitChange}
//                         />
//                         <Checkbox
//                             text="All"
//                             name="allKitItem"
//                             checked={formData.allKitItem || false}
//                             onChange={handleStartupKitChange}
//                         />
//                     </div>
//                 </Col>
//                 <Col xl={3} className="mt-2">
//                     <div className="box-border button-group-wrapper text-wrapper pt-1"
//                     style={{backgroundColor: '#DEE7EC'}}
//                     >
//                     <span className="text-label" style={{fontSize:'12px'}}>Dealership Status</span>
//                         <Checkbox
//                              readOnly
//                              text="Active"
//                              checked={formData.dealershipActive || false}
//                             //  onChange={(e) =>handleChange("dealershipActive", e.target.checked)}
//                         />
//                         <Checkbox
//                              readOnly
//                              text="Operative"
//                              checked={formData.dealershipOperative || false}
//                             //  onChange={(e) =>handleChange("dealershipOperative", e.target.checked)}
//                         />
//                     </div>
//                 </Col>
//             </Row>
//             <Row className="mt-3">
//                 <Modal isOpen={isRegionalModelOpen} toggle={toggleRegionalModal} size="xl">
//                     <ModalHeader toggle={toggleRegionalModal}>Regional Information</ModalHeader>
//                     <ModalBody>
//                     <Form>
//                         <Row>
//                             <Col xl={5}>
//                                 <TextField
//                                     label="Zone"
//                                     defaultValue={regionalInfo?.zone || ""}
//                                     disabled
//                                 />
//                             </Col>
//                             <Col xl={4}>
//                                 <TextField
//                                     label="Region"
//                                     defaultValue={regionalInfo?.region || ""}
//                                     disabled
//                                 />
//                             </Col>
//                         </Row>
//                         <Row className="mt-3">
//                         <Col xl={1} >
//                             <TextField
//                             label="ABM Code"
//                             defaultValue={regionalInfo?.abm_code || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="ABM Name"
//                             defaultValue={regionalInfo?.abm_name || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="ABM Mobile No."
//                             defaultValue={regionalInfo?.abm_mobile || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={3}>
//                             <TextField
//                             label="ABM Email"
//                             defaultValue={regionalInfo?.abm_email || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={1}>
//                             <TextField
//                             label="ABM EIN"
//                             defaultValue={regionalInfo?.abm_ein || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="ABM Status"
//                             defaultValue={regionalInfo?.abm_status || ""}
//                             disabled
//                             />
//                         </Col>
                       
//                         </Row>
//                         <Row className="mt-2">
//                         <Col xl={1}>
//                             <TextField
//                             label="RBM Code"
//                             defaultValue={regionalInfo?.rbm_code || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RBM Name"
//                             defaultValue={regionalInfo?.rbm_name || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RBM Mobile No."
//                             defaultValue={regionalInfo?.rbm_mobile || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={3}>
//                             <TextField
//                             label="RBM Email"
//                             defaultValue={regionalInfo?.rbm_email || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={1}>
//                             <TextField
//                             label="RBM EIN"
//                             defaultValue={regionalInfo?.rbm_ein || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RBM Status"
//                             defaultValue={regionalInfo?.rbm_status || ""}
//                             disabled
//                             />
//                         </Col>
                       
//                         </Row>
//                         <Row className="mt-2">
//                         <Col xl={1}>
//                             <TextField
//                             label="TSM Code"
//                             defaultValue={regionalInfo?.tsm_code || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="TSM Name"
//                             defaultValue={regionalInfo?.tsm_name || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="TSM Mobile No."
//                             defaultValue={regionalInfo?.tsm_mobile || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={3}>
//                             <TextField
//                             label="TSM Email"
//                             defaultValue={regionalInfo?.tsm_email || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={1}>
//                             <TextField
//                             label="TSM EIN"
//                             defaultValue={regionalInfo?.tsm_ein || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="TSM Status"
//                             defaultValue={regionalInfo?.tsm_status || ""}
//                             disabled
//                             />
//                         </Col>
                       
//                         </Row>
//                         <Row className="mt-2">
//                         <Col xl={1}>
//                             <TextField
//                             label="RSM Code"
//                             defaultValue={regionalInfo?.rsm_code || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RSM Name"
//                             defaultValue={regionalInfo?.rsm_name || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RSM Mobile No."
//                             defaultValue={regionalInfo?.rsm_mobile || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={3}>
//                             <TextField
//                             label="RSM Email"
//                             defaultValue={regionalInfo?.rsm_email || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={1}>
//                             <TextField
//                             label="RSM EIN"
//                             defaultValue={regionalInfo?.rsm_ein || ""}
//                             disabled
//                             />
//                         </Col>
//                         <Col xl={2}>
//                             <TextField
//                             label="RSM Status"
//                             defaultValue={regionalInfo?.rsm_status || ""}
//                             disabled
//                             />
//                         </Col>
                       
//                         </Row>
//                     </Form>
//                     </ModalBody>
//                     <ModalFooter>
//                     <Button color="secondary" onClick={toggleRegionalModal}>
//                         Close
//                     </Button>
//                     </ModalFooter>
//                 </Modal>
//                 <Col xl={3}>
//                     <ButtonUi color="primary" outline onClick={toggleRegionalModal} >Show Regional Info</ButtonUi>
//                 </Col>
//             </Row>
//             </Form>
//         </React.Fragment>
//     );
// };
// export default MembershipDetail;




import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import ButtonUi from "../../../../components/basic/button";
import { validateField } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import { validateMemberNo } from "./member_onboard_helper";

const MembershipDetail = ({   
    formData,
    setFormData,
    handleChange,
    formStatus,
    handleHelpList=()=>{},
    dealerCodeData,
    handleDealerCodeField,
    regionalInfo,
    division,
    contactData,
    handleContactInfoChange,
    dlrType
 }) => {

    const [isRegionalModelOpen, setIsRegionalModelOpen] = useState()
    const toggleRegionalModal = () => setIsRegionalModelOpen(!isRegionalModelOpen)
    const [previousDealerCode, setPreviousDealerCode] = useState(formData.dealerCode);

    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const toggleContactModal = () => {setIsContactModalOpen(!isContactModalOpen)};

    useEffect(() => {
        setPreviousDealerCode(formData.dealerCode);
    }, [formData.dealerCode]);

    const handleDoubleClick = () => {
        if (formStatus) {
            handleHelpList(true);
        }
    };

    const handleDealerCodeChange = (e) => {
        const newDealerCode = e.target.value;
        handleChange(e, "dealerCode", newDealerCode);

        if (newDealerCode !== previousDealerCode) {
            // Clear related fields
            handleChange(e, "division", "");
            handleChange(e, "dealershipName", "");
            handleChange(e, "location", "");
            handleChange(e, "alternateEmailId", "");
            handleChange(e, "gstin", "");
            handleChange(e, "dealershipStatus", "");
            handleChange(e, "inoprativeDate", "");
            handleChange(e, "dealerAppointmentDate", "");
        }
    };

    const findDataOnEnter = (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            handleDealerCodeField(e.target.value);
        }
    };

    // todo: on double click the error is still shows
    const findDealer = async (e) => {
        // if(e.relatedTarget?.id==='empty-formStatus' || e.relatedTarget?.id === 'help-list-modal' || e.relatedTarget?.id === 'help-list'){
        //     return
        // }

        const nextElement = e.relatedTarget; // The element getting focus after blur

        // If nextElement is an input field, trigger validation
        if (!nextElement || nextElement.tagName !== "INPUT") {
          return// Replace with your validation logic
        }
        if(formStatus != 'Insert'){
            return;
        }
        let fieldName = e.target.name
        let value = e.target.value
        // if(value.length){
        //     const result = await validateField(`${import.meta.env.VITE_BASE_API_URL}/${APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}`,fieldName,value);
        //         if (result?.type === "found") {
        //             if (result?.dealer_code) {
        //                 console.log(result?.dealer_code);
        //                 handleDealerCodeField(result?.dealer_code);
        //             }
        //         } else {
        //             handleDealerCodeField(value);
        //         }
        // }
        handleDealerCodeField(value);

    };

    // commented out the logic on member Date on 27-11-2024
    const handleMembershipDate = (e) => {
        handleChange(e, "membershipDate", e.target.value);
        // let {status, message} = currentDate(e.target.value);
        // if(status){
        //     handleChange("membershipDate", e.target.value);
        // } else {
        //  toast.error(message);
        //  handleChange("membershipDate", '');
        // }
    };
    

    const handleStartupKitChange = (e) => {
        const isChecked = e.target.checked;
        const field = e.target.name;
        // console.log(field);
        if(field != 'allKitItem'){
            handleChange(e, field, isChecked);
            handleChange(e, 'allKitItem', false)
        }
      
        if (field === "allKitItem" && isChecked) {
            // If "All" is checked, uncheck all other fields
            handleChange(e, "tools", true);
            handleChange(e, "uniform", true);
            handleChange(e, "promotionalKit", true);
            handleChange(e, "stationary", true);
            handleChange(e, "allKitItem", true); // "All" is checked
            // handleChange(e, "tools", false);
            // handleChange(e, "uniform", false);
            // handleChange(e, "promotionalKit", false);
            // handleChange(e, "stationary", false);
            // handleChange(e, "allKitItem", true); // "All" is checked
        } 
    };

    const handleChangeMemberNo = (e)=>{

    }
    
    return (
        <React.Fragment>
            <Form id='membership-form-v1'>
            <Row>
                <Col xl={6}>
                    <Row>
                        <Col xl={4}>
                            <TextField
                                required
                                type="text"
                                label="Dealer Code"
                                value={formData.dealerCode || ""}
                                onChange={handleDealerCodeChange}
                                onKeyDown={findDataOnEnter}
                                onDoubleClick={handleDoubleClick}
                                onBlur={findDealer}
                            />
                        </Col>
                        {/* <Col xl={4}>
                            <TextField
                                type="text"
                                label="Membership No."
                                name = 'membershipNo'
                                value={formData.membershipNo || ""}
                                onChange={(e) => handleChange(e, "membershipNo", e.target.value)}
                                // disabled={formStatus !== "Query" && formStatus !== 'Search'}
                                disabled={formStatus == 'Update'}
                                onBlur={(e)=>validateMemberNo({e,formData, setFormData, formStatus})}
                            />
                        </Col> */}
                         <Col xl={4}>
                        <TextField
                          type="text"
                          label="Membership No."
                          name="membershipNo"
                          value={formData.membershipNo || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                        
                            // Allow only "M" followed by digits
                          if (/^[Mm]\d*$/.test(value) || value === "") {
                            handleChange(e, "membershipNo", value);
                          }
                          }}
                          disabled={formStatus === "Update"}
                          onBlur={(e) =>
                            validateMemberNo({ e, formData, setFormData, formStatus })
                          }
                        />
                        </Col>
                        <Col xl={4}>
                            <Select 
                                disabled ={formStatus != 'Search'}
                                label = "Membership Status"
                                name="membershipStatus"
                                value={formData["membershipStatus"]}
                                onChange={(e) =>handleChange(e, "membershipStatus",e.target.value)}
                                options={[
                                    { value: "", label: "" },
                                    { value: "P", label: "Pending" },
                                    { value: "C", label: "Confirmed" },
                                ]}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col xl={6}>
                    <Row>
                        <Col xl={4}>
                            <TextField
                                type="text"
                                label="DD No."
                                value={formData.ddNo || ""}
                                onChange={(e) =>handleChange(e, "ddNo", e.target.value)}
                                maxLength={20}
                                title={"Maximum 20 characters allowed"}
                            />
                        </Col>
                        <Col xl={4}>
                            <TextField
                                type="date"
                                label="DD Date"
                                value={formData.ddDate || ""}
                                onChange={(e) =>handleChange(e, "ddDate", e.target.value)}
                            />
                        </Col>
                        <Col xl={4} style={{display:'flex', justifyContent:'center', alignItems:'end'}}>
                            <div className="checkbox-container">
                                <Checkbox
                                    text="Member Active"
                                    checked={formData?.membershipActive || false}
                                    // lableClass={`${formData?.membershipActive == true? 'text-success' : 'text-danger'}  fw-semibold fs-6`}
                                    onChange={(e) =>handleChange(e, "membershipActive", e.target.checked)}
                                />
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="">
                <Col xl={2}>
                     <Select
                        required
                        name="division"
                        label="Division"
                        value={formData.division || ""}
                        onChange={(e) => handleChange(e, "division", e.target.value)}
                        options={division}
                        disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
                    />
                </Col>
                <Col xl={5}>
                    <TextField
                        type="text"
                        label="Dealership Name"
                        value={formData.dealershipName || ""}
                        onChange={(e) =>handleChange(e, "dealershipName", e.target.value)}
                        disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="text"
                        label="GSTIN"
                        value={formData.gstin || ""}
                        onChange={(e) => handleChange(e, "gstin", e.target.value)}
                        disabled
                    />
                </Col>
                {/* <Col xl={2}>
                    <TextField
                        type="text"
                        label="Location"
                        value={formData.location || ""}
                        onChange={(e) =>handleChange(e, "location", e.target.value)}
                        disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
                    />
                </Col>     */}
                <Col xl={2} className="mt-4">
                   <ButtonUi outline onClick={toggleContactModal}>
                            Contact Details
                            </ButtonUi>
                            <Modal
  isOpen={isContactModalOpen}
  toggle={toggleContactModal}
  size="xl"
>
  <ModalHeader toggle={toggleContactModal}>
    Contact Details
  </ModalHeader>

  <ModalBody>
      <Row >
     
 <Col xl={2}>
                     <Select
                        // required
                        name="dlr_type"
                        label="Dealer Type"
                        value={contactData.dlr_type || ""}
                        onChange={(e) => handleContactInfoChange(e, "dlr_type", e.target.value)}
                        options={dlrType}
                        // disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
                    />
                </Col>

      <Col xl={2}>
        <TextField
        type='text'
          label="City"
          value={contactData?.city || ""}
          onChange={(e) => handleContactInfoChange(e, "city", e.target.value)}
        />
      </Col>

      <Col xl={2}>
        <TextField
          type='text'
          label="District"
          value={contactData?.distt || ""}
          onChange={(e) => handleContactInfoChange(e, "distt", e.target.value)}
        />
      </Col>

      <Col xl={2}>
        <TextField
          type='text'
          label="State"
          value={contactData?.state || ""}
          onChange={(e) => handleContactInfoChange(e, "state", e.target.value)}
        />
      </Col>
        <Col xl={2}>
        <TextField
        type='number'
          label="PIN Code"
          value={contactData?.pin || ""}
          onChange={(e) => handleContactInfoChange(e, "pin", e.target.value)}
        />
      </Col>
       <Col xl={2}>
        <TextField
          type='text'
          label="GSTIN"
          value={contactData?.gstin || ""}
          onChange={(e) => handleContactInfoChange(e, "gstin", e.target.value)}
        />
      </Col>
    </Row>
    <Row className="mt-3">
      <Col xl={2}>
        <TextField
        type='number'
          label="Phone No"
          value={contactData?.phone_no || ""}
          onChange={(e) => handleContactInfoChange(e, "phone_no", e.target.value)}
        />
      </Col>

      <Col xl={2}>
        <TextField
          type='number'
          label="Mobile No"
          value={contactData?.mobile_no || ""}
          onChange={(e) => handleContactInfoChange(e, "mobile_no", e.target.value)}
        />
      </Col>

      <Col xl={4}>
        <TextField
          type='text'
          label="Email ID"
          value={contactData?.email_id || ""}
          onChange={(e) => handleContactInfoChange(e, "email_id", e.target.value)}
        />
      </Col>

      <Col xl={4}>
        <TextField
          type='text'
          label="Alternate Email ID"
          value={contactData?.alternate_email_id || ""}
          onChange={(e) => handleContactInfoChange(e, "alternate_email_id", e.target.value)}
        />
      </Col>
    </Row>

    <Row className="mt-3">
      <Col xl={4}>
        <TextField
          type='text'
           label="Address 1"
          value={contactData?.address1 || ""}
          onChange={(e) => handleContactInfoChange(e, "address1", e.target.value)}
        />
      </Col>

      <Col xl={4}>
        <TextField
          type='text'
           label="Address 2"
          value={contactData?.address2 || ""}
          onChange={(e) => handleContactInfoChange(e, "address2", e.target.value)}
        />
      </Col>
  
      <Col xl={4}>
        <TextField
          type='text'
           label="Address 3"
          value={contactData?.address3 || ""}
          onChange={(e) => handleContactInfoChange(e, "address3", e.target.value)}
        />
      </Col>
    </Row>

    <Row className="mt-2">
      <Col xl={12}>
        <TextField
          type='text'
         label=" Address"
          value={contactData?.address || ""}
          onChange={(e) => handleContactInfoChange(e, "address", e.target.value)}
        />
      </Col>
    </Row>
  </ModalBody>

  <ModalFooter>
    <Button color="secondary" onClick={toggleContactModal}>
      Close
    </Button>
  </ModalFooter>
</Modal>
                </Col>    
            </Row>
            <Row className="mt-1">
                <Col xl={3}>
                    <TextField
                        label="Dlr Email ID"
                        type="text"
                        value={formData.emailId || ""}
                        onChange={(e) =>handleChange("emailId", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="text"
                        label="Dlr Alt. Email ID"
                        value={formData.alternateEmailId || ""}
                        onChange={(e) =>handleChange(e, "alternateEmailId", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Dlr Phone No."
                        value={formData["phoneNo"] || ""}
                        onChange={(e) => handleChange(e, "phoneNo", e.target.value)}
                        disabled
                    />
                    
                </Col>
              
                 <Col xl={4}>
                    <TextField
                        type="text"
                        label="Dlr Address"
                        value={formData.address || ""}
                        onChange={(e) =>handleChange(e, "address", e.target.value)}
                        disabled
                    />
                </Col>

            </Row>
            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="date"
                        label="Dlr Appoint Date"
                        value={formData.dealerAppointmentDate || ""}
                        onChange={(e) => handleChange(e, "dealerAppointmentDate",e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="date"
                        label="Dlr Inoperative Date"
                        value={formData.inoprativeDate || ""}
                        onChange={(e) => handleChange(e, "inoprativeDate", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="date"
                        label="Dlr Cessation Date"
                        value={formData.ceasationDate || ""}
                        onChange={(e) =>handleChange(e, "ceasationDate", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        label="Facebook Account Handle"
                        value={formData.fbAccount || ""}
                        onChange={(e) =>handleChange(e, "fbAccount", e.target.value)}
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Forfeiture Amount"
                        value={formData.forFeitureAcc || ""}
                        onChange={(e) =>handleChange(e, "forFeitureAcc", e.target.value)}
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Member Fee Amt."
                        value={formData.memberFeeAmt || ""}
                        onChange={(e) =>handleChange(e, "memberFeeAmt", e.target.value)}
                    />
                </Col>
            </Row>
            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        required
                        type="date"
                        label="Membership Date"
                        value={formData.membershipDate || ""}
                        onChange={(e) =>handleChange(e, "membershipDate", e.target.value)}
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="date"
                        label="Board Meeting (Members Appt.) Date"
                        value={formData.boardMeetingAppointmentDate || ""}
                        onChange={(e) => handleChange(e, "boardMeetingAppointmentDate",e.target.value)}
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="date"
                        label="Board Meeting (Members Cessation) Date"
                        value={formData.boardMeetingCeasationDate || ""}
                        onChange={(e) => handleChange(e, "boardMeetingCeasationDate",e.target.value)}
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="date"
                        label="Board Meeting (Members Reinstate) Date"
                        value={formData.boardMeetingReinstateDate || ""}
                        onChange={(e) =>handleChange(e, "boardMeetingReinstateDate",e.target.value)}
                    />
                </Col>{" "}
            </Row>
            <Row className="d-flex align-items-end mt-3">
                <Col xl={4}>
                    <div className="box-border button-group-wrapper">
                        <Checkbox
                             text="Membership Fee"
                             checked={formData.membershipFee || false}
                             onChange={(e) =>handleChange(e, "membershipFee", e.target.checked)}
                        />
                        <Checkbox
                             text="Membership Form"
                             checked={formData.membershipForm || false}
                             onChange={(e) =>handleChange(e, "membershipForm", e.target.checked)}
                        />
                    </div>
                </Col>
                <Col xl={5}>
                    <div className="box-border button-group-wrapper">
                        <Checkbox
                            text="Tools"
                            name="tools"
                            checked={formData.tools || false}
                            onChange={handleStartupKitChange}
                        />
                        <Checkbox
                            text="Uniform"
                            name="uniform"
                            checked={formData.uniform || false}
                            onChange={handleStartupKitChange}
                        />
                        <Checkbox
                            text="Promotional Kit"
                            name="promotionalKit"
                            checked={formData.promotionalKit || false}
                            onChange={handleStartupKitChange}
                        />
                        <Checkbox
                            text="Stationary"
                            name="stationary"
                            checked={formData.stationary || false}
                            onChange={handleStartupKitChange}
                        />
                        <Checkbox
                            text="All"
                            name="allKitItem"
                            checked={formData.allKitItem || false}
                            onChange={handleStartupKitChange}
                        />
                    </div>
                </Col>
                <Col xl={3} className="mt-2">
                    <div className="box-border button-group-wrapper text-wrapper pt-1"
                    style={{backgroundColor: '#DEE7EC'}}
                    >
                    <span className="text-label" style={{fontSize:'12px'}}>Dealership Status</span>
                        <Checkbox
                             readOnly
                             text="Active"
                             checked={formData.dealershipActive || false}
                            //  onChange={(e) =>handleChange("dealershipActive", e.target.checked)}
                        />
                        <Checkbox
                             readOnly
                             text="Operative"
                             checked={formData.dealershipOperative || false}
                            //  onChange={(e) =>handleChange("dealershipOperative", e.target.checked)}
                        />
                    </div>
                </Col>
            </Row>
            <Row className="mt-3">
                <Modal isOpen={isRegionalModelOpen} toggle={toggleRegionalModal} size="xl">
                    <ModalHeader toggle={toggleRegionalModal}>Regional Information</ModalHeader>
                    <ModalBody>
                    <Form>
                        <Row>
                            <Col xl={5}>
                                <TextField
                                    label="Zone"
                                    defaultValue={regionalInfo?.zone || ""}
                                    disabled
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    label="Region"
                                    defaultValue={regionalInfo?.region || ""}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                        <Col xl={1} >
                            <TextField
                            label="ABM Code"
                            defaultValue={regionalInfo?.abm_code || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="ABM Name"
                            defaultValue={regionalInfo?.abm_name || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="ABM Mobile No."
                            defaultValue={regionalInfo?.abm_mobile || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={3}>
                            <TextField
                            label="ABM Email"
                            defaultValue={regionalInfo?.abm_email || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={1}>
                            <TextField
                            label="ABM EIN"
                            defaultValue={regionalInfo?.abm_ein || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="ABM Status"
                            defaultValue={regionalInfo?.abm_status || ""}
                            disabled
                            />
                        </Col>
                       
                        </Row>
                        <Row className="mt-2">
                        <Col xl={1}>
                            <TextField
                            label="RBM Code"
                            defaultValue={regionalInfo?.rbm_code || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RBM Name"
                            defaultValue={regionalInfo?.rbm_name || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RBM Mobile No."
                            defaultValue={regionalInfo?.rbm_mobile || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={3}>
                            <TextField
                            label="RBM Email"
                            defaultValue={regionalInfo?.rbm_email || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={1}>
                            <TextField
                            label="RBM EIN"
                            defaultValue={regionalInfo?.rbm_ein || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RBM Status"
                            defaultValue={regionalInfo?.rbm_status || ""}
                            disabled
                            />
                        </Col>
                       
                        </Row>
                        <Row className="mt-2">
                        <Col xl={1}>
                            <TextField
                            label="TSM Code"
                            defaultValue={regionalInfo?.tsm_code || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="TSM Name"
                            defaultValue={regionalInfo?.tsm_name || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="TSM Mobile No."
                            defaultValue={regionalInfo?.tsm_mobile || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={3}>
                            <TextField
                            label="TSM Email"
                            defaultValue={regionalInfo?.tsm_email || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={1}>
                            <TextField
                            label="TSM EIN"
                            defaultValue={regionalInfo?.tsm_ein || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="TSM Status"
                            defaultValue={regionalInfo?.tsm_status || ""}
                            disabled
                            />
                        </Col>
                       
                        </Row>
                        <Row className="mt-2">
                        <Col xl={1}>
                            <TextField
                            label="RSM Code"
                            defaultValue={regionalInfo?.rsm_code || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RSM Name"
                            defaultValue={regionalInfo?.rsm_name || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RSM Mobile No."
                            defaultValue={regionalInfo?.rsm_mobile || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={3}>
                            <TextField
                            label="RSM Email"
                            defaultValue={regionalInfo?.rsm_email || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={1}>
                            <TextField
                            label="RSM EIN"
                            defaultValue={regionalInfo?.rsm_ein || ""}
                            disabled
                            />
                        </Col>
                        <Col xl={2}>
                            <TextField
                            label="RSM Status"
                            defaultValue={regionalInfo?.rsm_status || ""}
                            disabled
                            />
                        </Col>
                       
                        </Row>
                    </Form>
                    </ModalBody>
                    <ModalFooter>
                    <Button color="secondary" onClick={toggleRegionalModal}>
                        Close
                    </Button>
                    </ModalFooter>
                </Modal>
                <Col xl={3}>
                    <ButtonUi color="primary" outline onClick={toggleRegionalModal} >Show Regional Info</ButtonUi>
                </Col>
            </Row>
            </Form>
        </React.Fragment>
    );
};
export default MembershipDetail;
