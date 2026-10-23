import React, { useEffect, useState } from "react";
import { Row, Col, Form, Table, NavItem } from "reactstrap";
import {
  financeDataHeader,
  TranDataHeader,
  ModuleDataHeader,
} from "./financial_year_OpenPeriodDetailHelper";
import SimpleBar from "simplebar-react";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import RadioGroup from "../../../../components/basic/radioGroup";
import RadioButton from "../../../../components/basic/radioButton";
import RowAction from "../../../../components/common/rowAction";
import toast from "react-hot-toast";

const FinancialyearOpnPeriodDetail = ({
  formData,
  formStatus,
  handleChange,
  financeData = [{}],
  // moduleData = [{}],
  // tranData = [{}],
  triggerAddRow,
  handleDeleteRow,
  setSelectedModeCd,
  handleModeChange,
  selectedFinIndex,
  setTranData,
  setSelectedTransId,
  fetchValidateData,
  deleteRecordInUpdate,
  handleRowClick,
  selectedIndex1,
  isFiltered,
  setIsFiltered,
  updateCurrentYear,
  setIsUpdatedCurrentYear,
  isUpdatedCurrentYear,
  selectedTransId,
  tranDataToShow,
  setTranDataToShow,
  focusedRowIndex,
  setFocusedRowIndex
}) => {
  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value

    if ( !value) {
      toast.error(`This ${fieldLabel} is required`);
     
      e.target.focus();
      return false;
    }
    if (!value) { }
    return true;
  };

  const [filteredTranData, setFilteredTranData] = useState();
  // const [tranDataToShow, setTranDataToShow] = useState([tranData])
  //const [isFiltered, setIsFiltered] = useState(false);  // To track filtered state

  //const [isFilteredModule, setIsFilteredModule] = useState(false)

  //const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  const [focusedRowIndex1, setFocusedRowIndex1] = useState(-1);

  const [selectedStDate, setSelectedStDate] = useState();
  const [selectedEndDate, setSelectedEndDate] = useState();

  const makeFocusOnTableRow1 = (rowIndex, id) => {
    const entry = moduleData.find((entry) => entry.id === id);
    setFocusedRowIndex1(rowIndex);
    // triggerFamilyDetail(id)
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = financeData.find((entry) => entry.row_id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleUpdate = () => { };

  //console.log('check', tranData)

  return (
    <React.Fragment>
      <Row>
        <Col xl={2} style={{ marginTop: "1.65rem" }}>
          <ButtonUi
            style={{
              backgroundColor: "grey",
              marginLeft: "1.4rem",
              border: "1px solid grey",
            }}
            onClick={() => {
              //console.log("Selected Index:", selectedIndex1);
              handleRowClick(focusedRowIndex);
              setIsUpdatedCurrentYear(true);
              //updateCurrentYear();
            }}
          >
            Current Year
          </ButtonUi>

          <p
            style={{
              width: "160px",
              height: "80px",
              backgroundColor: "white",
              border: "1px solid black",
              marginTop: "40px",
              marginLeft: "2px",
              textAlign: "center",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              position: "relative",
              cursor: "pointer",
            }}
          >
            Click here to change Current Year
          </p>
        </Col>

        <Col xl={1}></Col>

        <Col xl={7}>
          <Form id="financial-year-finyear-form">
            <div className="table-title">
              <span>Financial year</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddRow("financeTable")}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar
                style={{ border: "" }}
                forceVisible="Y"
                autoHide={false}
              >
                <div className="table-sticky-wrapper height-auto">
                  <Table hover>
                    <thead style={{ border: "" }}>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                            <th className="sticky-column left">Actions</th>
                          )}
                        {financeDataHeader?.map((header, index) => (
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
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {financeData &&
                        financeData?.map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() => {
                              makeFocusOnTableRow(rowIndex, data.row_id);
                            }}
                            // onBlur={() => setFocusedRowIndex(-1)}
                            style={{
                              border: `${rowIndex === focusedRowIndex
                                ? "2px solid black"
                                : "none"
                                }`,
                            }}
                            // onClick={(e) => {
                            //     console.log("selectedFindex", data.st_date, data.end_date)
                            //     console.log("tranData", tranData)
                            //     if(!selectedTransId){
                            //         toast.error("transaction id is not selected")
                            //         return
                            //     }

                            //     const matchingEntry = tranData.filter(entry => entry.trans_id === selectedTransId);
                            //     console.log("Matching Entry:", matchingEntry, selectedTransId);

                            //     if(matchingEntry.length){
                            //         const filteredData = matchingEntry.filter(item =>
                            //             item.period_start >= data.st_date && item.period_end <= data.end_date
                            //         );

                            //         console.log("filtered data", filteredData)
                            //         setTranDataToShow(filteredData)
                            //         setIsFiltered(true); // Set flag to indicate filtering
                            //         setSelectedEndDate(data.end_date)
                            //         setSelectedStDate(data.st_date)
                            //     }

                            // }
                            // }

                            onClick={() => {
                              console.log(
                                "Finance Row Selected:",
                                data.st_date,
                                data.end_date
                              );

                              // Reset selected transaction ID when a new finance row is clicked
                              // setSelectedTransId(null);

                              // Store selected finance period
                              setSelectedStDate(data.st_date);
                              setSelectedEndDate(data.end_date);
                            }}
                          >
                            {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={financeData?.length > 1}
                                    onDelete={() =>
                                      handleDeleteRow("finyear", data, rowIndex)
                                    }
                                  // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                  />
                                </td>
                              )}
                            <td className="table_cell">
                              <TextField
                                required
                                type="date"
                                name="st_date"
                                placeholder=""
                                value={
                                  financeData[rowIndex]?.st_date ||
                                  data.st_date ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "financeData",
                                    "st_date",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onBlur={async (e) => {
                                  if (
                                    formStatus === "Update" ||
                                    formStatus === "Insert"
                                  ) { 
                                     validateRequiredField(e, "Start date")

                                  }
                                }}
                              />
                            </td>

                            {/* <td className="table_cell">
                              <TextField
                                required
                                type="date"
                                name="end_date"
                                placeholder=""
                                value={
                                  financeData[rowIndex]?.end_date ||
                                  data.end_date
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "financeData",
                                    "end_date",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onBlur={async (e) => {
                                  if (
                                    formStatus === "Update" ||
                                    formStatus === "Insert"
                                  ) { 
                                      const fieldName = e.target.name
                                  
                                    validateRequiredField(e, "End Date");
                                    const isValid = await fetchValidateData(
                                      fieldName,
                                      e.target.value,
                                      {},
                                      rowIndex
                                    )

                                    if (!isValid) {
                                      e.target.focus()
                                    }
                                  }
                                }}
                              />
                            </td> */}
                            <td className="table_cell">
                              <TextField
                                required
                                type="date"
                                name="end_date"
                                value={financeData[rowIndex]?.end_date || ""}
                                onChange={(e) =>
                                  handleChange(
                                    "financeData",
                                    "end_date",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onBlur={async (e) => {
                                  if (formStatus === "Update" || formStatus === "Insert") { 
                                     validateRequiredField(e, "End date")
                                  
                                  }
                                }}
                              />
                            </td>
                            <td
                              className="table_cell"
                              style={{ width: "60px" }}
                            >
                              <TextField
                                //required
                                //readOnly
                                required={false}
                                type="text"
                                name="flag"
                                placeholder=""
                                maxLength={1}
                                value={financeData[rowIndex]?.flag || data.flag}
                                onChange={(e) =>
                                  handleChange(
                                    "financeData",
                                    "flag",
                                    e.target.value,
                                    rowIndex
                                  )
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
          </Form>
        </Col>

        {/* <Col xl={5}>
                    <Form id="financial-year-tranyear-form">
                        <div className="table-title">
                            <span>Transaction Period</span>
                            {

                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action"
                                    onClick={() => triggerAddRow("tranTable")}
                                >Add Row</ButtonUi>}

                        </div>

                        <div style={{ height: '150px', maxHeight: '150px' }} className='table-container'>
                            <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                                <Table hover>
                                    <thead style={{ border: '' }}>
                                        <tr>
                                            {
                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                <th className="sticky-column left">Actions</th>
                                            }
                                            {TranDataHeader.map((header, index) => (
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
                                        { tranDataToShow && tranDataToShow.map((data, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {
                                                    (formStatus === 'Insert' || formStatus === 'Update') &&
                                                    <td className="sticky-column left">
                                                        <RowAction
                                                            formStatus={formStatus}
                                                            canDelete={tranDataToShow.length > 1}
                                                            onDelete={() => handleDeleteRow("transyear", data, rowIndex)}
                                                            onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                        />
                                                    </td>

                                                }
                                                <td className='table_cell'>
                                                    <TextField
                                                        required
                                                        type="date"
                                                        name="period_start"
                                                        placeholder=""
                                                        value={
                                                            tranDataToShow[rowIndex]?.period_start || data.period_start
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "tranData",
                                                                "period_start",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                        onBlur={(e) => {
                                                            if (formStatus === "Update" || formStatus === "Insert") {
                                                                fetchValidateData(
                                                                    e.target.name,
                                                                    e.target.value
                                                                );
                                                            }

                                                        }}
                                                    />
                                                </td>

                                                <td className='table_cell'>
                                                    <TextField
                                                        required
                                                        type="date"
                                                        name="period_end"
                                                        placeholder=""
                                                        value={
                                                            tranDataToShow[rowIndex]?.period_end || data.period_end
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "tranData",
                                                                "period_end",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }

                                                        onBlur={(e) => {
                                                            if (formStatus === "Update" || formStatus === "Insert") {
                                                                fetchValidateData(
                                                                    e.target.name,
                                                                    e.target.value
                                                                );
                                                            }

                                                        }}
                                                    />
                                                </td>
                                                <td className='table_cell'>
                                                    <RadioButton
                                                        className='radio-button'
                                                        required
                                                        //required={false}
                                                        type="radio"
                                                        name={`status_flag_${rowIndex}`} // unique name for each row
                                                        value="O"
                                                        checked={data?.status_flag === "O"}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "tranData",
                                                                "status_flag",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td className='table_cell'>
                                                    <RadioButton
                                                        className='radio-button'
                                                        required
                                                        //required={false}
                                                        type="radio"
                                                        value="C"
                                                        name={`status_flag_${rowIndex}`}
                                                        checked={data?.status_flag === "C"}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "tranData",
                                                                "status_flag",
                                                                e.target.value,
                                                                rowIndex
                                                            )
                                                        }
                                                    />
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </SimpleBar>
                        </div>


                    </Form>
                </Col> */}
      </Row>

      <Row style={{ gap: "1px" }}>
        {/* <Col xl={2}>
                    <div style={{
                        width: '150px',
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxSizing: "border-box",
                        border: "1px solid grey",
                        padding: "8px",
                        borderRadius: "4px"
                    }}>
                        {[
                            { text: "Module", value: "M" },
                            { text: "Transaction", value: "T" },
                            { text: "Both", value: "B" }
                        ].map((option) => (
                            <Row key={option.value}>
                                <Col className="m-auto">
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", hover: 'blue' }}>
                                            <RadioButton
                                                className="radio-button-wrapper"
                                                type="radio"
                                                name="selectedModeCd"
                                                value={option.value}
                                                checked={formData?.selectedModeCd === option.value}
                                                // onChange={(e) =>
                                                //     handleChange("formData", "selectedModeCd", e.target.value)
                                                // } 
                                                onChange={

                                                    (e) => {
                                                        console.log("handlechange clicked:", e.target.value)
                                                        handleModeChange(e.target.value)
                                                    }

                                                }
                                            />
                                            <span style={{ minWidth: "100px" }}>{option.text}</span>
                                        </label>
                                    </div>
                                </Col>
                            </Row>
                        ))}
                    </div>
                </Col> */}

        {/* <Col xl={5}>
                    <Form>
                        <div className="table-title">
                            <span>Transactions</span>

                        </div>
                        <div style={{ height: '150px', maxHeight: '150px' }} className='table-container'>
                            <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                                <Table hover>
                                    <tbody>
                                        {moduleData &&
                                            moduleData.map((data, rowIndex) => (
                                                <tr key={rowIndex}
                                                    onFocus={() => {makeFocusOnTableRow1(rowIndex, data.index)}}
                                                    // onBlur={() => setFocusedRowIndex(-1)}
                                                    style={{
                                                        border: `${rowIndex === focusedRowIndex1 ? "2px solid black" : "none"
                                                            }`,
                                                    }}
                                                    // onClick={() => {
                                                    //     //setSelectedIndex1(rowIndex);
                                                    //     const selectedTransId = data.trans_id;
                                                    //     console.log("trans_id at the module:", data.trans_id)
                                                    //     setSelectedTransId(selectedTransId);  

                                                    //     if(!selectedTransId){ 
                                                    //         toast.error("transaction id is not selected")
                                                    //         return
                                                    //     }

                                                    //     const matchingEntry = tranData.filter(entry => entry.trans_id === selectedTransId);
                                                    //     console.log("Matching Entry at module:", matchingEntry, selectedTransId);

                                                    //     if(matchingEntry.length){
                                                    //         const filteredData = matchingEntry.filter(item =>
                                                    //             item.period_start >= selectedStDate && item.period_end <= selectedEndDate
                                                    //         ); 

                                                    //         console.log("filtered data at module", filteredData)
                                                    //         setTranDataToShow(filteredData)
                                                    //         setIsFiltered(true); // Set flag to indicate filtering 
                                                    //     }
                                                       

                                                    // }} 

                                                    onClick={() => {
                                                        console.log("Module Row Selected, Transaction ID:", data.trans_id);
                                                        
                                                        // Set selected transaction ID
                                                        setSelectedTransId(data.trans_id);
                                    
                                                        // if (!selectedTransId) {
                                                        //     toast.error("Please select a transaction record");
                                                        //     return;
                                                        // }
                                    
                                                        // Filter data based on transaction ID and finance period
                                                        const matchingEntry = tranData.filter(entry => entry.trans_id === data.trans_id);
                                                        console.log("Matching Entry at module:", matchingEntry);
                                    
                                                        if (matchingEntry.length) {
                                                            const filteredData = matchingEntry.filter(item =>
                                                                item.period_start >= selectedStDate && item.period_end <= selectedEndDate
                                                            );
                                                            //console.log("Filtered Data at module:", filteredData);
                                                            setTranDataToShow(prevState => {
                                                                const filteredData = matchingEntry.filter(item =>
                                                                    item.period_start >= selectedStDate && item.period_end <= selectedEndDate
                                                                );
                                                                console.log("Filtered Data at module:", filteredData);
                                                                return [...filteredData]; // Ensure a new reference is created
                                                            });
                                                            // setTranDataToShow(prevState => {
                                                            //     const filteredData = matchingEntry.filter(item =>
                                                            //         item.period_start >= selectedStDate && item.period_end <= selectedEndDate
                                                            //     );
                                                            //     console.log("Filtered Data at module:", filteredData);
                                                            //     return [...filteredData]; // Ensure a new reference is created
                                                            // });
                                                            
                                                            setIsFiltered(true);
                                                        }
                                                    }}
                                                >

                                                    <td className='table_cell'>
                                                        <TextField
                                                            required
                                                            type="text"
                                                            name="module_name"
                                                            value={data.module_name || ""}
                                                            placeholder=""
                                                            //disabled
                                                            onChange={(e) =>
                                                                handleChange("moduleData", "module_name", e.target.value, rowIndex)
                                                            }

                                                        />
                                                    </td>

                                                    <td className='table_cell'>
                                                        <TextField
                                                            required
                                                            //disabled
                                                            type="text"
                                                            name="trans_name"
                                                            value={data.trans_name || ""}
                                                            placeholder=""
                                                            onChange={(e) =>
                                                                handleChange("moduleData", "trans_name", e.target.value, rowIndex)
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>

                                </Table>
                            </SimpleBar>
                        </div>
                    </Form>
                </Col> */}
      </Row>
    </React.Fragment>
  );
};

export default FinancialyearOpnPeriodDetail;
