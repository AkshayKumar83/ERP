import React from 'react'
import { Row, Col, Form, Table, Card } from "reactstrap"
import { TabContent, TabPane } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import RadioGroup from '../../../../components/basic/radioGroup'
import Select from '../../../../components/basic/select'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import { useCallback, useState, useEffect } from "react";
import toast from 'react-hot-toast'


import { loginHeaders, programHeaders, activityAvlHeaders, activityGrantHeaders } from './user_activityHelper'

const UserActivityDtl = ({
  formData,
  formStatus,
  handleChange,
  userLoginData = [{}],
  programDescData = [{}],
  programActivityDescData = [{}],
  userActivityDescData = [{}],
  handleAddRow,
  handleDeleteRow,
  module,
  subModule,
  setFormData,
  setFocusedRowIndex1,
  setFocusedRowIndex2,
  focusedRowIndex1,
  focusedRowIndex2,
  setSelectedProgramId,
  selectedProgramId,
  selectedActivityId,
  setSelectedActivityId,
  setUserActivityDescData,
  setProgramActivityDescData,
  setUserActivityMap,
  userActivityMap,
  originalProgramActivityData,
  setRemovedActivities,
  removedActivities,

}) => {

  const [isFocused, setIsFocused] = useState(false);



  const makeFocusOnTableRow1 = (rowIndex, id) => {
    const entry = userLoginData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex1(rowIndex);
    // triggerFamilyDetail(id)
  };

  const makeFocusOnTableRow2 = (rowIndex, id) => {
    const entry = userLoginData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex2(rowIndex);
    // triggerFamilyDetail(id)
  };


  // filtered module data according to selection of radio buttons, submodule and module  


  const filteredProgramDescData = programDescData?.filter((item) => {
    const isModuleSelected = !!formData?.module_name;
    const isSubmoduleSelected = !!formData?.submod_form_name;
    const isTypeSelected = formData?.rg_frpq && formData?.rg_frpq !== "A";

    const menuName = item.menu_name?.toUpperCase();
    const sub = formData.submod_form_name?.toUpperCase();

    const moduleMatch =
      !isModuleSelected || item.module_name === formData.module_name;

    //Correct submodule filtering (LEVEL2 = USER)
    const submoduleMatch =
      !isSubmoduleSelected ||
      menuName?.split(".")[1] === sub;

    const typeMatch =
      !isTypeSelected || item.module_flag === formData.rg_frpq;

    // console.log({
    //   menuName,
    //   extractedSubmodule: menuName?.split(".")[1],
    //   selectedSubmodule: sub,
    //   submoduleMatch
    // });

    return moduleMatch && submoduleMatch && typeMatch;
  });



  // // filter programActivity Data by program_id  

  // const filteredProgramActivityData = programActivityDescData?.filter((item) => {
  //   const activityData =
  //     item.program_id === selectedProgramId

  //   return activityData
  // });    

  const currentUserActivities = userActivityDescData?.filter(
    (ua) =>
      Number(ua.program_id) === Number(selectedProgramId) &&
      Number(ua.user_id) === Number(formData.user_id)
  );

  const filteredProgramActivityData = programActivityDescData?.filter((item) => {
    if (Number(item.program_id) !== Number(selectedProgramId)) return false;

    const isAssigned = currentUserActivities?.some(
      (ua) =>
        Number(ua.activity_id) === Number(item.activity_id) &&
        Number(ua.program_id) === Number(selectedProgramId) // ✅ fix
    );

    //console.log('currentUserActivityData', currentUserActivities)

    return !isAssigned;
  });

  // const filteredProgramActivityData = programActivityDescData?.filter((item) => {
  //   if (Number(item.program_id) !== Number(selectedProgramId)) return false;

  //   const isAssigned = currentUserActivities?.some(
  //     (ua) => Number(ua.activity_id) === Number(item.activity_id)
  //   );

  //   return !isAssigned;
  // });

  // console.log("selectedProgramId:", selectedProgramId);
  // console.log("programActivityDescData:", programActivityDescData);
  // console.log("filteredProgramActivityData:", filteredProgramActivityData);
  // console.log("Current User Activities:", currentUserActivities);



  const filteredUserActivityData = userActivityDescData?.filter(
    (item) =>
      Number(item.program_id) === Number(selectedProgramId) &&
      Number(item.user_id) === Number(formData.user_id)
  );

  // console.log("userActivityDescData:", userActivityDescData);
  // console.log("user_id:", formData.user_id);
  // console.log("selectedProgramId:", selectedProgramId);

  //console.log("filteredUserActivityData:", filteredUserActivityData);
  //console.log("removedActivitiesData:", removedActivities);


  // for grant all activities 

  const handleGrantAll = () => {
    if (!["Insert", "Update"].includes(formStatus)) {
      toast.error("CANNOT INSERT/UPDATE IN QUERY MODE");
      return;
    }

    const userId = Number(formData.user_id); 

    if(!userId) {
      toast.error("Please select user first")
      return
    }

    // ✅ Step 1: Get ALL program_ids
    const programIds = filteredProgramDescData.map((p) =>
      Number(p.program_id)
    );

    // ✅ Step 2: Get ALL activities for those programs
    const allProgramActivities = programActivityDescData.filter((item) =>
      programIds.includes(Number(item.program_id))
    );

    // ✅ Step 3: Remove already assigned ones
    const newActivities = allProgramActivities.filter((item) => {
      return !userActivityDescData.some(
        (ua) =>
          Number(ua.user_id) === userId &&
          Number(ua.program_id) === Number(item.program_id) &&
          Number(ua.activity_id) === Number(item.activity_id)
      );
    });

    // ✅ Step 4: Map to USER_ACTIVITY
    const mappedActivities = newActivities.map((item) => ({
      activity_id: item.activity_id,
      activity_disp_name: item.activity_disp_name,
      program_id: item.program_id,
      user_id: userId
    }));

    // ✅ Step 5: Update state
    setUserActivityDescData((prev) => [...prev, ...mappedActivities]);

    //  console.log("Granting Activities:", mappedActivities);
  };

  // // for revoke all activities

  // for revoke all activities

const handleRevokeAll = () => {
  if (!["Insert", "Update"].includes(formStatus)) {
    toast.error("CANNOT INSERT/UPDATE IN QUERY MODE");
    return;
  }

  const userId = Number(formData.user_id);

  if (!userId) {
    toast.error("Please select user first");
    return;
  }

  // Step 1: Get ALL program_ids currently selected/displayed
  const programIds = filteredProgramDescData.map((p) =>
    Number(p.program_id)
  );

  // Step 2: Get only the user's activities belonging to those programs
  const activitiesToRemove = userActivityDescData.filter(
    (item) =>
      Number(item.user_id) === userId &&
      programIds.includes(Number(item.program_id))
  );

  console.log("Activities to revoke:", activitiesToRemove);
  console.log("Revoke count:", activitiesToRemove.length);

  // Step 3: Store ONLY these revoked activities
  setRemovedActivities((prev) => [
    ...prev,
    ...activitiesToRemove
  ]);

  // Step 4: Remove them from current user activities
  setUserActivityDescData((prev) =>
    prev.filter(
      (item) =>
        !(
          Number(item.user_id) === userId &&
          programIds.includes(Number(item.program_id))
        )
    )
  );

  console.log("Revoked activities:", activitiesToRemove);
};





  return (
    <React.Fragment>
      <Form id="user-activity-form">
        <Card className="mt-1 mb-2 p-1 shadow-sm">
          <Row>
            <Col xl={3}>
              <Select
                label="Module"
                required
                placeholder=""
                name="module"
                value={formData?.module || ""}
                type="text"
                onChange={(e) => handleChange("formData", "module", e.target.value, null, e)}
                options={module}
              />

            </Col>
            <Col xl={3}>
              <Select
                label="Sub Module"
                placeholder=""
                name="submodule"
                type="text"
                required
                value={formData?.submodule || ""}
                onChange={(e) => handleChange("formData", "submodule", e.target.value, null, e)}
                options={subModule}

              />
            </Col>
            <Col xl={6} style={{ marginTop: '1.47rem' }} >
              <RadioGroup
                className="button-group-wrapper box-border d-flex justify-content-between"
                options={[{ text: "All", value: "A" },
                { text: "Form", value: "F" },
                { text: "Report", value: "R" },
                { text: "Process", value: "P" },
                { text: "Query", value: "Q" },

                ]}
                onChange={(e) => handleChange("formData", "rg_frpq", e.target.value, null, e)}
                checked={formData?.rg_frpq || "A"}
              />
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.4rem' }}>

            <ButtonUi
              //style={{ backgroundColor: "grey", border: '1px solid grey', color: 'black' }}
              color='secondary'
              onClick={handleGrantAll}
            >
              Grants All
            </ButtonUi>



            <ButtonUi
              // style={{ backgroundColor: "grey", border: '1px solid grey', color: 'black' }}
              color='secondary'
              onClick={handleRevokeAll}

            >
              Revoke All
            </ButtonUi>

          </div>
        </Card>
        <Row>
          <Col xl={3}>

            <div className="table-title">
              {/* <span>Sales Order Discount</span> */}
              {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={() => handleAddRow("userLoginTable")}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper height-auto">
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {
                          (formStatus === 'Insert') &&
                          <th className="" style={{}}>Actions</th>
                        } */}
                        {loginHeaders?.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                            {header.label}
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {userLoginData && userLoginData.map((data, rowIndex) => (
                        <tr key={rowIndex}
                          onFocus={
                            () => {
                              makeFocusOnTableRow1(rowIndex, data.sr_no)
                              setIsFocused(true)
                            }
                          }

                        >
                          {/* {
                            (formStatus === 'Insert') &&
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={formData?.length > 0}
                                onDelete={() => handleDeleteRow("loginDescTable", rowIndex)}
                              //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>

                          } */}

                          <td className='table_cell'>
                            <TextField
                              type="text"
                              name="login_name"
                              value={data.login_name || ""}
                              onFocus={() => {
                                setFocusedRowIndex1(rowIndex);
                                setFormData(prev => ({
                                  ...prev,
                                  user_name: data.user_name,
                                  user_id: data.user_id
                                }));
                              }}
                              onBlur={() => {
                                setFocusedRowIndex1(null);
                              }}
                              style={{
                                backgroundColor:
                                  formData.user_id !== null &&
                                    formData.user_id !== undefined &&
                                    data.user_id === formData.user_id
                                    ? "#ffa726"
                                    : "white",
                                transition: "0.2s ease"
                              }}

                              onChange={(e) =>
                                handleChange("userLoginData", "login_name", e.target.value, rowIndex, e)
                              }
                            />
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </Table>
                </div>
              </SimpleBar>
            </div>


          </Col>
          <Col xl={3}>


            <div className="table-title">
              {/* <span>Sales Order Discount</span> */}
              {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={() => handleAddRow("programDescTable")}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper height-auto">
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert") &&
                          <th style={{}} >Actions</th>
                        } */}
                        {programHeaders?.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                          >
                            {header.label}
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProgramDescData && filteredProgramDescData.map((data, rowIndex) => (
                        <tr key={rowIndex}

                          onFocus={() => makeFocusOnTableRow2(rowIndex, data.sr_no)}

                        >
                          {/* {(formStatus === "Insert") &&
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={programDescData?.length > 0}
                                onDelete={() => handleDeleteRow("programDescTable", rowIndex)}
                              //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}

                              />
                            </td>
                          } */}
                          <td className='table_cell'>
                            <TextField
                              type="text"
                              name="program_desc"
                              value={data.program_desc || ""}
                              onChange={(e) =>
                                handleChange("programDescData", "program_desc", e.target.value, rowIndex)
                              }
                              onFocus={() => {
                                setFocusedRowIndex2(rowIndex);
                                setSelectedProgramId(data.program_id);
                              }}
                              onBlur={() => {
                                setFocusedRowIndex2(null);
                              }}
                              style={{
                                backgroundColor:
                                  data.program_id === selectedProgramId ? "#ffa726" : "white",
                                transition: "0.2s ease"
                              }}
                            />
                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>

            </div>


          </Col>
          <Col xl={3}>


            <div className="table-title">
              {/* <span>Sales Order Discount</span> */}
              {/* {(formStatus === "Insert" || formStatus === 'Update') && (
                <ButtonUi color="primary" className="add-action"
                  onClick={() => handleAddRow("programActivityDescTable")}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className='table-sticky-wrapper height-auto'>
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert") &&
                          <th style={{}}>Actions</th>
                        } */}
                        {activityAvlHeaders?.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                          >
                            {header.label}
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProgramActivityData.map((data, rowIndex) => (
                        <tr key={rowIndex}>

                          <td>
                            <TextField
                              type="text"
                              name="activity_disp_name"
                              value={data.activity_disp_name || ""}
                              onChange={(e) => handleChange("programActivityDescData", "activity_disp_name", e.target.value, rowIndex, e)}

                              onDoubleClick={() => {
                                if (formStatus === 'Update') {
                                  const activityId = data.activity_id
                                  setSelectedActivityId(activityId);
                                  const activityName = data.activity_disp_name;
                                  const programId = selectedProgramId
                                  const userId = formData.user_id
                               
                                  // Add into userActivityDescData
                                  setUserActivityDescData((prev) => {
                                    const alreadyExists = prev.some(
                                      (item) =>
                                        item.activity_id === activityId &&
                                        item.program_id === programId &&
                                        item.user_id === userId
                                    );

                                    if (alreadyExists) return prev;


                                    return [
                                      ...prev,
                                      {
                                        activity_id: activityId,
                                        activity_disp_name: activityName,
                                        program_id: programId,
                                        user_id: userId
                                      }
                                    ];
                                  }); 
                                    
                                    // Remove from programActivityDescData

                                    setProgramActivityDescData((prev) =>
                                      prev.filter(
                                        (item) =>
                                          item.activity_id !== activityId ||
                                          item.program_id !== programId
                                      )
                                    );
                                  }

                                else {
                                  toast.error('CANNOT INSERT/UPDATE IN QUERY MODE')
                                }
                              }}
                            />
                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>


          </Col>
          <Col xl={3}>

            <div className="table-title">
              {/* <span>Sales Order Discount</span> */}
              {/* {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                  onClick={() => handleAddRow("useractivityDescTable")}
                >
                  Add Row
                </ButtonUi>
              )} */}
            </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className='table-sticky-wrapper height-auto'>
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert") &&
                          <th style={{}}>Actions</th>
                        } */}
                        {activityGrantHeaders?.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                          >
                            {header.label}
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(filteredUserActivityData).map((data, rowIndex) => (
                        <tr key={rowIndex}>
                          {/* {(formStatus === "Insert") &&
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={userActivityMap.length > 0}
                                onDelete={() => handleDeleteRow("userActivityDescTable", rowIndex)}
                              //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}

                              />
                            </td>
                          } */}
                          <td>
                            <TextField
                              type="text"
                              name="activity_disp_name"
                              value={data.activity_disp_name || ""}
                              onChange={(e) => handleChange("userActivityDescData", "login_name", e.target.value, rowIndex, e)}
                              // onDoubleClick={() => {
                              //   if (formStatus === "Update") {
                              //     const programId = selectedProgramId;
                              //     const activityId = data.activity_id;

                              //     //  Store removed activity
                              //     setRemovedActivities((prev) => [
                              //       ...prev,
                              //       { ...data }
                              //     ]);

                              //     // Remove from userActivityDescData
                              //     // setUserActivityDescData((prev) =>
                              //     //   prev.filter((item) => item.activity_id !== activityId)
                              //     // ); 
                              //     setUserActivityDescData((prev) =>
                              //       prev.filter((_, index) => index !== rowIndex)
                              //     );

                              //     //  Add back to programActivityDescData

                              //     setProgramActivityDescData((prev) => {
                              //       const alreadyExists = prev.some(
                              //         (item) => item.activity_id === data.activity_id &&
                              //        Number(item.program_id) === Number(programId)
                              //       );

                              //       if (alreadyExists)  {
                              //         console.log('already exists')
                              //         return prev; // prevent duplicate
                              //       }


                              //       return [
                              //         ...prev,
                              //         {
                              //           ...data,
                              //           program_id: programId
                              //         }
                              //       ];
                              //     });
                              //   } else {
                              //     toast.error("Cannot update in query mode");
                              //   }
                              // }} 
                              onDoubleClick={() => {
                                if (formStatus !== "Update") {
                                  toast.error("CANNOT INSERT/UPDATE IN QUERY MODE");
                                  return;
                                }

                                const programId = selectedProgramId;
                                const activityId = data.activity_id;

                                // Store removed activity
                                // setRemovedActivities((prev) => [...prev, { ...data }]);

                                // // Remove from userActivityDescData (FIXED)
                                // // setUserActivityDescData((prev) =>
                                // //   prev.filter((item) => item.activity_id !== activityId)
                                // // ); 

                                setRemovedActivities((prev) => {
                                  const alreadyRemoved = prev.some(
                                    (item) => item.activity_id === data.activity_id
                                  );

                                  if (alreadyRemoved) return prev;

                                  return [...prev, { ...data }];
                                });

                                // Remove from userActivityDescData
                                setUserActivityDescData((prev) =>
                                  prev.filter((item) => item.activity_id !== activityId)
                                );

                                // Add back to programActivityDescData
                                setProgramActivityDescData((prev) => {
                                  const alreadyExists = prev.some(
                                    (item) =>
                                      item.activity_id === activityId &&
                                      Number(item.program_id) === Number(programId)
                                  );

                                  if (alreadyExists) {
                                    console.log("already exists");
                                    return prev;
                                  }

                                  return [
                                    ...prev,
                                    {
                                      ...data,
                                      program_id: programId
                                    }
                                  ];
                                });
                              }}
                            />
                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>

          </Col>
        </Row>
        <Row>
          <Col xl={4}>
            <label className="me-2">User Name</label>
            <TextField
              value={formData.user_name || ""}
              onChange={(e) => handleChange("formData", "user_name", e.target.value, null, e)}
            />
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default UserActivityDtl;
