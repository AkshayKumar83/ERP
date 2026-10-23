import React from "react"
import { Col, Form, Row, Table } from "reactstrap"
import TextField from "../../../components/basic/textField"
import Checkbox from "../../../components/basic/checkbox"
import RadioGroup from "../../../components/basic/radioGroup"
import Select from "../../../components/basic/select"
import { MdDeleteForever, MdAddCircle } from "react-icons/md"
import { userLoginDetailHeader, userDivisionHeader, userLocationHeader, employeeHelpListHeader, divisionHelpListHeader, locationHelpListHeader } from "./userMasterHelpers"
import ButtonUi from "../../../components/basic/button"
import RowAction from "../../../components/common/rowAction"
import SimpleBar from "simplebar-react"
import toast from "react-hot-toast"
//import ButtonUi from "../../../components/basic/button"
import { FcInfo } from "react-icons/fc"

const UserMasterDtl = ({
  formData = {},
  formStatus,
  showSuggestionList,
  departments = [],
  authpersons = [],
  empSuggestions = [],
  isLoadingSuggestions = false,
  handleChange = () => { },
  setEmpSuggestions = () => { },
  setShowSuggestionList = () => { },
  fetchSuggestions = () => { }, // Added prop for fetching suggestions
  divisionSuggest,
  setDivisionSuggest = () => { },
  locationSuggest,
  setLocationSuggest = () => { },
  suggestionRef,
  handleAddTableRecord,
  handleDelete = () => { },
  activeRow,
  setActiveRow,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  focusedRowIndex = -1,
  //setFocusedRowIndex = () => { },
  setFocusedRowIndex,
  focusedRowIndex1 = -1,
  //setFocusedRowIndex1 = () => { },
  setFocusedRowIndex1,
  getValidateData,
  validateDivisionData,
  validateLocationData,
  validateDefaultDiv,
  validateDefaultLoc



}) => {

  // MAKE CURSOR ON DETAIL BLOCK
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData?.userDivisionData.find((entry) => entry.id === id);
    console.log("focused row clicked", id)
    setFocusedRowIndex(rowIndex);
  };

  const makeFocusOnTableRow1 = (rowIndex, id) => {
    const entry = formData?.userLocationData.find((entry) => entry.id === id);
    console.log("focused row1 clicked", id)
    setFocusedRowIndex1(rowIndex);
  };


  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };



  const handleDoubleClick = (field, header, index = null) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={3}>
          <Row>
            {/* **************** USER-LOGIN DETAIL SECTION **************** */}
            <div style={{ maxHeight: "calc(100vh - 190px)", overflowY: "auto" }}>
              <table className="table_fix">
                <thead>
                  <tr>
                    {userLoginDetailHeader.map((header, index) => (
                      <th data-required={header.required || false} key={index}>
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData?.userLoginData &&
                    formData?.userLoginData.map((data, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            name="login_name"
                            value={data?.login_name || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("login_name", e.target.value, -1, null, e, rowIndex, "userLoginData", e)}

                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Row>
        </Col>
        <Col xl={9}>
          {/* USER DETAIL/FORMDATA SECTION */}
          <Form id="user-master-user-detail">
            <Row>
              <Col xl={2}>
                <TextField
                  type="text"
                  label="Login ID"
                  name="login_name"
                  maxLength={30}
                  value={formData?.login_name || ""}
                  onChange={(e) => handleChange("login_name", e.target.value, -1, null, e)}
                  onBlur={(e) => {
                    if (formStatus === "Insert" || formStatus === "Update") {
                      const loginName = e.target.value
                      validateRequiredField(e, "Login ID")
                      getValidateData("loginname", loginName)
                    }

                  }}
                  required
                />
              </Col>
              <Col xl={2}>
                <TextField
                  type="text"
                  label="User ID"
                  name="user_id"
                  value={formData?.user_id || ""}
                  onChange={(e) => handleChange("user_id", e.target.value, -1, null, e)}
                  readOnly={formStatus === ""}
                  disabled
                />
              </Col>
              <Col className="mt-4" xl={4} style={{ display: "flex", alignItems: "center" }}>
                <RadioGroup
                  className="button-group-wrapper box-border"
                  options={[{ text: "Group", value: "G" }, { text: "User", value: "U" },]}
                  onChange={(e) => handleChange("is_group", e.target.value, -1, null, e)}
                  checked={formData?.is_group || "U"}

                />
              </Col>
              <Col className="mt-4" xl={4} style={{ display: "flex", alignItems: "center" }}>
                <RadioGroup
                  className="button-group-wrapper box-border"
                  options={[{ text: "NormalUser", value: "N" }, { text: "SuperUser", value: "S" },]}
                  onChange={(e) => handleChange("type_user", e.target.value, -1, null, e)}
                  checked={formData?.type_user || "N"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={6}>
                <TextField
                  type="text"
                  label="User Name"
                  name="user_name"
                  maxLength={50}
                  value={formData?.user_name || ""}
                  onChange={(e) => handleChange("user_name", e.target.value, -1, null, e)}
                />
              </Col>
              <Col xl={6}>
                <TextField
                  label="EMail ID"
                  name="email_id"
                  value={formData?.email_id || ""}
                  maxLength={100}
                  onChange={(e) => handleChange("email_id", e.target.value, -1, null, e)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={6}>
                <Select
                  label="Authorised Person"
                  name="auth_pers"
                  value={formData?.auth_pers || ""}
                  onChange={(e) => handleChange("auth_pers", e.target.value, -1, null, e)}
                  options={authpersons}
                />
              </Col>
              <Col xl={6}>
                <Select
                  label="Department"
                  name="dept_cd"
                  value={formData?.dept_cd || ""}
                  onChange={(e) => handleChange("dept_cd", e.target.value, -1, null, e)}
                  options={departments}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4}>
                <div className="relative">
                  <TextField
                    label="Employee Code"
                    type="text"
                    name="emp_cd"
                    value={formData?.emp_cd || ""}
                    onChange={(e) => {
                      handleChange("emp_cd", e.target.value, -1, null, e)
                    }}
                    required
                    onBlur={(e) => {
                      if (formStatus === "Insert" || formStatus === "Update") {
                        const empName = e.target.value
                        validateRequiredField(e, "Employee Code")
                        getValidateData("employeecd", empName)
                      }
                    }}

                    onDoubleClick={() => handleDoubleClick("employee", employeeHelpListHeader)}
                  />


                </div>
              </Col>

              <Col>
                <TextField
                  label="Employee Name"
                  name="emp_name"
                  value={formData?.emp_name || ""}
                  onChange={(e) => handleChange("emp_name", e.target.value, -1, null, e)}
                  disabled
                />
              </Col>
              <Col xl={3}>
                <TextField
                  label="Initials"
                  name="init_name"
                  value={formData?.init_name || ""}
                  maxLength={5}
                  onChange={(e) => handleChange("init_name", e.target.value, -1, null, e)}

                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("active", e.target.checked ? "Y" : "N")}
                  text="Active"
                  checked={formData?.active === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("allow_erp_access_over_cloud", e.target.checked ? "Y" : "N")}
                  text="AllowErp Access Overcloud"
                  checked={formData?.allow_erp_access_over_cloud === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("is_time_keeper", e.target.checked ? "Y" : "N")}
                  text="Is Time Keeper"
                  checked={formData?.is_time_keeper === "Y"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_raise_pr", e.target.checked ? "Y" : "N")}
                  text="Can Raise PR"
                  checked={formData?.can_raise_pr === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("allow_dashboard_access", e.target.checked ? "Y" : "N")}
                  text="Allow Dashboard Access"
                  checked={formData?.allow_dashboard_access === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_update_dashboard_data", e.target.checked ? "Y" : "N")}
                  text="Can Update Dashboard Data"
                  checked={formData?.can_update_dashboard_data === "Y"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_inspect_material", e.target.checked ? "Y" : "N")}
                  text="Can Inspect Material"
                  checked={formData?.can_inspect_material === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_auth_scrap_rej", e.target.checked ? "Y" : "N")}
                  text="Allow Auth. Scrap Rejection"
                  checked={formData?.can_auth_scrap_rej === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_del_rep_in_so", e.target.checked ? "Y" : "N")}
                  text="Can Delete Report in Sale Order"
                  checked={formData?.can_del_rep_in_so === "Y"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("can_auth_line_rej", e.target.checked ? "Y" : "N")}
                  text="Allow Auth. Line Rejection"
                  checked={formData?.can_auth_line_rej === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("allow_emp_portal_access", e.target.checked ? "Y" : "N")}
                  text="Allow Employee Portal Access"
                  checked={formData?.allow_emp_portal_access === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("process_mis_invtry", e.target.checked ? "Y" : "N")}
                  text="Process MIS Inventory"
                  checked={formData?.process_mis_invtry === "Y"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("allow_upd_in_final_route", e.target.checked ? "Y" : "N")}
                  text="Allow modification in final routing"
                  checked={formData?.allow_upd_in_final_route === "Y"}
                />
              </Col>
              <Col xl={4} className="button-group-wrapper ">
                <Checkbox
                  onChange={(e) => handleChange("cy_flag", e.target.checked ? "Y" : "N")}
                  text="Entry only in Current Year"
                  checked={formData?.cy_flag === "Y"}
                />
              </Col>
            </Row>
          </Form>

          <Row className="mt-1">

            <Col xl={6}>
              {/* **************** USER-DIVISION DETAIL SECTION **************** */}
              <Form id="user-master-div-form">

                <div className="table-title">

                  {

                    (formStatus === 'Insert' || formStatus === 'Update') &&
                    <ButtonUi color="primary" className="add-action"
                      onClick={() => handleAddTableRecord('userDivisionData')}
                    >Add Row</ButtonUi>}

                </div>

                <div className="table-wrapper-v3" style={{ height: "90px", maxHeight: "90px" }}>
                  <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                    <div className="table-sticky-wrapper height-auto">
                      <Table hover>
                        <thead>
                          <tr>
                            {
                              (formStatus === 'Insert' || formStatus === 'Update') &&
                              <th className="sticky-column left">Actions</th>
                            }
                            {userDivisionHeader.map((header, index) => (
                              <th data-required={header.required || false}
                                key={index}
                                style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}
                              >
                                {header.label}
                                {header.required && (
                                  <span className="required-asterisk"> *</span>
                                )}
                                {header.isHelpExist && (<FcInfo title="Info" />)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formData?.userDivisionData.map((data, rowIndex) => (
                            <tr key={rowIndex}
                              // tabIndex={0} // Make row focusable
                              onFocus={() => {
                                makeFocusOnTableRow(rowIndex, data.id)
                              }
                              }
                              style={{
                                border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                                  }`,
                              }}
                            >
                              {
                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formData.userDivisionData.length > 1}
                                    onDelete={() => handleDelete("userDivisionData", rowIndex)}
                                  // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                  />
                                </td>

                              }
                              <td className="table_cell">

                                <TextField
                                  type="text"
                                  name="name"
                                  value={data.name || ""}
                                  onChange={(e) => {
                                    handleChange("name", e.target.value, -1, null, e, rowIndex, "userDivisionData")
                                    // if (e.target.value, -1, null, e.length >= 3) {
                                    //   setActiveRow({ type: "division", index: rowIndex })
                                    //   fetchSuggestions(e.target.name, e.target.value, -1, null, e)
                                    // } else {
                                    //   setDivisionSuggest([])
                                    //   setShowSuggestionList(false)
                                    // }
                                  }}
                                  // onBlur={() => {
                                  //   setTimeout(() => {
                                  //     setActiveRow({ type: null, index: null })
                                  //     setShowSuggestionList(false)
                                  //   }, 200)
                                  // }} 
                                  required
                                  onDoubleClick={() => handleDoubleClick("division", divisionHelpListHeader, rowIndex)}
                                  onBlur={(e) => {
                                    if (formStatus === "Insert" || formStatus === "Update") {
                                      validateRequiredField(e, "Division Name")
                                      validateDivisionData(e.target.value, -1, null, e, rowIndex);
                                    }

                                  }

                                  }
                                />
                                {/* {isLoadingSuggestions && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <span className="loading loading-spinner loading-sm"></span>
                                </div>
                              )} */}
                                {/* {showSuggestionList &&
                                divisionSuggest.length > 0 &&
                                activeRow.type === "division" &&
                                activeRow.index === rowIndex && (
                                  <ul                                   
                                  style={{
                                    position: "absolute",
                                    zIndex: 1000,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    backgroundColor: "white",
                                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                    borderRadius: "4px",
                                  }}>
                                    {divisionSuggest.map((suggestion, index) => (
                                      <li
                                        key={index}
                                        style={{ padding:"2px 4px", cursor:"pointer", width:"100%", fontSize:"13px"}}
                                        onClick={() => {
                                          handleChange("name", suggestion.name, rowIndex, "userDivisionData")
                                          handleChange("division_id", suggestion.division_id, rowIndex, "userDivisionData")
                                          setDivisionSuggest([])
                                          setShowSuggestionList(false)
                                          setActiveRow({ type: null, index: null })
                                        }}
                                      >
                                        {suggestion.name}
                                      </li>
                                    ))}
                                  </ul>
                                )} */}

                              </td>
                              <td className='table_cell'>
                                <Checkbox
                                  onChange={(e) => handleChange("default_division", e.target.checked ? "Y" : "N", rowIndex, "userDivisionData")}
                                  checked={data?.default_division === "Y"}
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
            </Col>
            <Col xl={6}>
              {/* **************** USER-LOCATION DETAIL SECTION **************** */}
              <Form id="user-master-loc-form">

                <div className="table-title">

                  {

                    (formStatus === 'Insert' || formStatus === 'Update') &&
                    <ButtonUi color="primary" className="add-action"
                      onClick={() => handleAddTableRecord('userLocationData')}
                    >Add Row</ButtonUi>}

                </div>


                <div className="table-wrapper-v3" style={{ height: "90px", maxHeight: "90px" }}>
                  <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                    <div className="table-sticky-wrapper height-auto">
                      <Table hover>
                        <thead>
                          <tr>

                            {
                              (formStatus === 'Insert' || formStatus === 'Update') &&
                              <th className="sticky-column left">Actions</th>
                            }
                            {userLocationHeader.map((header, index) => (
                              <th data-required={header.required || false} key={index}
                                style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}
                              >
                                {header.label}
                                {header.isHelpExist && (<FcInfo title="Info" />)}
                                {header.required && (
                                  <span className="required-asterisk"> *</span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formData?.userLocationData.map((data, rowIndex) => (
                            <tr key={rowIndex}
                              // tabIndex={0} // Make row focusable
                              onFocus={() => {
                                makeFocusOnTableRow1(rowIndex, data.id)
                              }
                              }

                              style={{
                                border: `${rowIndex === focusedRowIndex1 ? "2px solid black" : "none"
                                  }`,
                              }}
                            >
                              {
                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formData.userLocationData.length > 1}
                                    onDelete={() => handleDelete("userLocationData", rowIndex)}
                                  //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                  />
                                </td>

                              }
                              <td className="table_cell">

                                <TextField
                                  type="text"
                                  name="location_desc"
                                  value={data.location_desc || ""}
                                  onChange={(e) => {
                                    handleChange("location_desc", e.target.value, -1, null, e, rowIndex, "userLocationData");
                                    // if (e.target.value, -1, null, e.length >= 3) {
                                    //   setActiveRow({ type: "location", index: rowIndex })
                                    //   fetchSuggestions(e.target.name, e.target.value, -1, null, e)
                                    // } else {
                                    //   setDivisionSuggest([])
                                    //   setShowSuggestionList(false)
                                    // }
                                  }}
                                  // onBlur={() => {
                                  //   setTimeout(() => {
                                  //     setActiveRow({ type: null, index: null })
                                  //     setShowSuggestionList(false)
                                  //   }, 200)
                                  // }}   
                                  required

                                  onBlur={(e) => {
                                    if (formStatus === "Insert" || formStatus === "Update") {
                                      validateRequiredField(e, "Location Description")
                                      validateLocationData(e.target.value, rowIndex);
                                    }

                                  }

                                  }

                                  onDoubleClick={() => handleDoubleClick("location", locationHelpListHeader, rowIndex)}
                                />
                                {/* {isLoadingSuggestions && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <span className="loading loading-spinner loading-sm"></span>
                                </div>
                              )}
                              {showSuggestionList && locationSuggest.length > 0 &&
                                activeRow.type === "location" &&
                                activeRow.index === rowIndex && (
                                <ul
                                  // ref={divisionSuggestionRef}
                                  className="absolute z-1000 w-full bg-white border border-gray-300"
                                  style={{
                                    position: "absolute",
                                    zIndex: 1000,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    backgroundColor: "white",
                                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {locationSuggest.map((suggestion, index) => (
                                    <li
                                      key={index}
                                      style={{
                                        padding:"2px 4px",
                                        cursor:"pointer",
                                        width:"100%"
                                      }}
                                      onClick={() => {
                                        handleChange("location_desc", suggestion.location_desc, rowIndex, "userLocationData");
                                        handleChange("location_id", suggestion.location_id, rowIndex, "userLocationData");
                                        setLocationSuggest([]);
                                        setShowSuggestionList(false);
                                        setActiveRow({ type: null, index: null })
                                      }}
                                    >
                                      {suggestion.location_desc}
                                    </li>
                                  ))}
                                </ul>
                              )} */}

                              </td>
                              <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange("default_location", e.target.checked ? "Y" : "N", rowIndex, "userLocationData")}
                                  checked={data?.default_location === "Y"}
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
            </Col>
          </Row>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default UserMasterDtl

