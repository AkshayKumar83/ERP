import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Row, Col, Form, Table } from "reactstrap"
import RadioGroup from '../../../components/basic/radioGroup'
import TextField from '../../../components/basic/textField'
import Checkbox from '../../../components/basic/checkbox'
import { MdDeleteForever, MdAddCircle } from "react-icons/md"
import ButtonUi from "../../../components/basic/button"
import { debounce } from "lodash"
import TablePagination from './TablePagination'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../components/common/rowAction' 
import toast from 'react-hot-toast'

const statewiseMasterDtl = ({ formData = {},
    stateData,
    formStatus,
    handleStateDataChange,
    handleChange,
    handleSetStateData,
    actualStateData,
    setStateData,
    initStateFormDataTemplate,
    visibleData = [{}],
    setVisibleData,
    page,
    setPage,
    handleAddTableRecord,
    handleDeleteTableRecord,
    getValidateData,
    otherQueryPera,
    setFilteredStateData,
    setSelectedTypeFlag,
     deleteRecordInUpdate,
     setCurrentRecordNo
}) => {

    // const [selectedTypeFlag, setSelectedTypeFlag] = useState("");

    // const [filteredStateData, setFilteredStateData] = useState(stateData);
    //console.log("actualstate data at type:", actualStateData); 

     const handleDelete = async (data, index) => {
        await deleteRecordInUpdate(index); // 👈 Pass index instead of data
        handleDeleteTableRecord(index); // ✅ Local delete
    };

    //const [page, setPage] = useState(1)
    const containerRef = useRef(null)

    const ITEMS_PER_PAGE = 100

    const stateDetailHeader = [
      

        {
            "label": "CHILD NAME",
            required: true

        },
        {
            "label": "Short Name",
            required: true

        },
        {
            "label": "M/N"

        },
        {
            "label": "State cap."

        },
        {
            "label": "PARENT NAME",
            required: true

        },
        {
            "label": "Local Flag"

        },
        {
            "label": "State TDS"

        },
        {
            "label": "Code GST"

        },
        {
            "label": "E-Invoice Country"

        },
        {
            "label": "Union Territory"

        },

    ]


    useEffect(() => {
        setStateData(initStateFormDataTemplate)
        setVisibleData(initStateFormDataTemplate?.slice(0, ITEMS_PER_PAGE))
        //console.log("visible Data at detail:", visibleData)
    }, [initStateFormDataTemplate])

    const loadMoreItems = useCallback(() => {
        if (page * ITEMS_PER_PAGE >= stateData.length) return; // Prevent loading if all items are visible
        const nextPage = page + 1;
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setVisibleData((prev) => [...prev, ...stateData.slice(startIndex, endIndex)]);
        //setStateData((prev) => [...prev, ...stateData.slice(startIndex, endIndex)])

        setPage(nextPage);
    }, [page, stateData]);


    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                loadMoreItems()
            }
        }
    }, [loadMoreItems])

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
   

    const handleTypeChange = (flag) => { 

        setSelectedTypeFlag(flag);
        handleChange("type", flag);

        // Filter the program description data based on the selected flag 

        if (formStatus === "Search" || formStatus === "Insert") {
            return
        }

        let filteredData;

        if (flag === "C") {
            filteredData = actualStateData.filter((item) => item.type === "C");
            console.log("C, Filtered Data:", filteredData);
        } else if (flag === "D") {
            filteredData = actualStateData.filter((item) => item.type === "D");
            console.log("D, Filtered Data:", filteredData);
        } else if (flag === "Z") {
            filteredData = actualStateData.filter((item) => item.type === "Z");
            console.log("Z, Filtered Data:", filteredData);
        } else if (flag === "T") {
            filteredData = actualStateData.filter((item) => item.type === "T");
            console.log("T, Filtered Data:", filteredData);
        } else if (flag === "S") {
            filteredData = actualStateData.filter((item) => item.type === "S");
            console.log("S, Filtered Data:", filteredData);
        } else if (flag === "R") {
            filteredData = actualStateData.filter((item) => item.type === "R");
            console.log("R, Filtered Data:", filteredData);
        }
        // Map parent_id from the filtered data
        const parentIds = filteredData.map((item) => item.parent_id);
        //console.log("parent_id:", parentIds);

        // Find matching state_name in actualStateData
        const matchingStates = parentIds.map((parent_id) => {
            const match = actualStateData.find(
                (state) => state.state_id === parent_id
            );
            return match ? match.state_name : null;
        });

        //console.log("Matching State Names:", matchingStates);

        // Add `parent_desc` (matching state_name) to the filtered data
        const updatedFilteredData = filteredData.map((item, index) => ({
            ...item,
            parent_desc: matchingStates[index], // Add the matching state name
        }));

        setFilteredStateData(updatedFilteredData);

        handleSetStateData(updatedFilteredData)

        // Update visibleData with the first page of filtered data
        const initialVisibleData = updatedFilteredData.slice(0, ITEMS_PER_PAGE);
        setVisibleData(initialVisibleData); 

         setCurrentRecordNo(updatedFilteredData.length - 1)

        console.log("Filtered data:", updatedFilteredData);
        console.log("stateData at detail", stateData)
        //console.log("Visible data:", initialVisibleData);
        console.log("visible data at detail:", visibleData)
        // Reset pagination
        setPage(1);

    };  

    return (
        <React.Fragment>

            <Row>
                <Col xl={8} className=''>
                    <RadioGroup
                        className="button-group-wrapper box-border d-flex justify-content-between"
                        options={[
                            { text: "CITY", value: "C" },
                            { text: "DISTRICT", value: "D" },
                            { text: "STATE", value: "S" },
                            { text: "ZONE", value: "Z" },
                            { text: "COUNTRY", value: "T" },
                            { text: "REGION", value: "R" }
                        ]}
                        // onChange={(e) => handleTypeChange("type", e.target.value)}
                        onChange={

                            (e) => {
                                console.log("handlechange clicked:", e.target.value)
                                handleTypeChange(e.target.value)
                            }

                        } 
                        checked={formData?.type}
                    />

                </Col>

            </Row>


            {/* // table content for statedata */} 
            <Form id = "statewise-master-form"> 
                  <div className="table-title"> 
                    { (formStatus === 'Insert' || formStatus === 'Update') &&
                        <ButtonUi color="primary" className="add-action"
                            onClick={handleAddTableRecord}
                        >Add Row</ButtonUi>}

               </div>
            <Row>
                <Col xl={12} >

                    <div   className="table-container"

                        ref={containerRef}
                        onScroll={handleScroll}
                        style={{
                            // maxHeight: "100vh", // Using calc to subtract 300px from the viewport height
                            marginTop: "7px",
                           height: "320px",
                            maxHeight: "320px",
                            overflowY: "auto", // Allow scroll if content exceeds max 
                            //border: "1px solid black"
                        }}> 
                        <SimpleBar> 
                            {/* <div className="table-sticky-wrapper height-auto">  */}
                        <Table hover>
                            
                            <thead>
                                <tr> 
                                {
                                 (formStatus === 'Insert' || formStatus === 'Update') &&
                                        <th className="sticky-column left">Actions</th>
                                    }

                                    {stateDetailHeader.map((header, index) => (
                                        <th data-required={header.required || false} key={index}>
                                            {header.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(visibleData) && visibleData?.map((data, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {
                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                <td className="sticky-column left">
                                                    <RowAction
                                                        formStatus={formStatus}
                                                        canDelete={visibleData.length > 1}
                                                        onDelete={() => handleDelete(data, rowIndex)}
                                                        //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                    />
                                                </td>

                                            }
                                        <td className="table_cell">
                                            <TextField
                                                required
                                                name="state_name"
                                                placeholder={""}
                                                maxLength = {40}
                                                //value={data.state_name || ""}
                                                //value={stateData[rowIndex]?.state_name || data.state_name}
                                                 value={visibleData[rowIndex]?.state_name || data.state_name}

                                                  onBlur = {(e) => { 
                                                    if (formStatus === "Insert" || formStatus === "Update" ) {
                                                        const stateName = e.target.value;
                                                        validateRequiredField(e, "State Name")
                                                        getValidateData("stateName", stateName, otherQueryPera)  
                                                    }
                                                   
                                                  }}  
                                                // onKeyDown ={
                                                //   (e) => {
                                                //     e.key === Enter 
                                                //     const stateName = e.target.value;
                                                //     const type = formDataType 
                                                //     getSearchedData("stateName", stateName, {type: type})
                                                //   }
                                                // }
                                                onChange={(e) => {
                                                    handleStateDataChange("state_name", e.target.value, rowIndex);
                                                }}
                                            />
                                        </td>
                                        <td className="table_cell">
                                            <TextField
                                                //required
                                                name="short_name"
                                                placeholder={""}
                                                  maxLength = {3}
                                                //value={stateData[rowIndex]?.short_name || data.short_name}
                                                  value={visibleData[rowIndex]?.short_name || data.short_name}
                                                onChange={(e) => {
                                                    handleStateDataChange("short_name", e.target.value, rowIndex);
                                                }}
                                                onBlur = {(e) => { 
                                                    if (formStatus === "Insert" || formStatus === "Update" ) {
                                                        const stateName = e.target.value;
                                                        
                                                        getValidateData("stateName", stateName, otherQueryPera)  
                                                    }
                                                   
                                                  }}  
                                            />
                                        </td>
                                        <td className="table_cell">
                                            <Checkbox
                                                name="metro_city"
                                                // checked={stateData[rowIndex]?.metro_city === "Y"}
                                                  checked={visibleData[rowIndex]?.metro_city === "Y"}

                                                onChange={(e) => {
                                                    handleStateDataChange(
                                                        "metro_city",
                                                        e.target.checked ? "Y" : "N",
                                                        rowIndex
                                                    )
                                                }}
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <Checkbox
                                                name="state_cap_flag"
                                               // checked={stateData[rowIndex]?.state_cap_flag === "Y"}
                                                checked={visibleData[rowIndex]?.state_cap_flag === "Y"}
                                                onChange={(e) => {
                                                    handleStateDataChange(
                                                        "state_cap_flag",
                                                        e.target.checked ? "Y" : "N",
                                                        rowIndex
                                                    )
                                                }}
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <TextField
                                                required
                                                name="parent_desc"
                                                placeholder={""}
                                                  maxLength = {40}
                                                //value={stateData[rowIndex]?.parent_desc || data.parent_desc}
                                                value={visibleData[rowIndex]?.parent_desc || data.parent_desc}
                                                onChange={(e) =>
                                                    handleStateDataChange("parent_desc", e.target.value, rowIndex)
                                                } 
                                                onBlur={(e) => validateRequiredField(e, "Parent Desc")}
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <TextField
                                                //required
                                                name="local_flag"
                                                placeholder={""}
                                                maxLength = {1}
                                               // value={stateData[rowIndex]?.local_flag || data.local_flag}
                                                value={visibleData[rowIndex]?.local_flag || data.local_flag}
                                                onChange={(e) =>
                                                    handleStateDataChange("local_flag", e.target.value, rowIndex)
                                                }
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <TextField
                                                //required
                                                name="tds_state_code"
                                                placeholder={""}
                                                  maxLength = {10}
                                                //value={stateData[rowIndex]?.tds_state_code || data.tds_state_code}
                                                value={visibleData[rowIndex]?.tds_state_code || data.tds_state_code}
                                                onChange={(e) =>
                                                    handleStateDataChange(
                                                        "tds_state_code",
                                                        e.target.value,
                                                        rowIndex
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <TextField
                                                //required
                                                name="gst_state_code"
                                                placeholder={""}
                                                  maxLength = {2}
                                                //value={stateData[rowIndex]?.gst_state_code || data.gst_state_code}
                                                value={visibleData[rowIndex]?.gst_state_code || data.gst_state_code}
                                                onChange={(e) =>
                                                    handleStateDataChange(
                                                        "gst_state_code",
                                                        e.target.value,
                                                        rowIndex
                                                    )
                                                }

                                            />
                                        </td>

                                        <td className="table_cell">
                                            <TextField
                                                //required
                                                name="e_inv_country_cd"
                                                placeholder={""}
                                                  maxLength = {3}
                                                //value={stateData[rowIndex]?.e_inv_country_cd || data.e_inv_country_cd}
                                                value={visibleData[rowIndex]?.e_inv_country_cd || data.e_inv_country_cd}
                                                onChange={(e) =>
                                                    handleStateDataChange(
                                                        "e_inv_country_cd",
                                                        e.target.value,
                                                        rowIndex
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="table_cell">
                                            <Checkbox
                                                name="ut_yes_no"
                                                //checked={stateData[rowIndex]?.state_cap_flag === "Y"}
                                                checked={visibleData[rowIndex]?.ut_yes_no === "Y"}
                                                onChange={(e) =>
                                                    handleStateDataChange(
                                                        "ut_yes_no",
                                                        e.target.checked ? "Y" : "N",
                                                        rowIndex
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </Table>
                         {/* </div> */}
                        {/* {(formStatus === "Insert" || formStatus === "Update") && (
                            <div className="table-add-record">
                                <ButtonUi onClick={handleAddTableRecord}>Add Row</ButtonUi>
                            </div>
                        )} */} 
                        </SimpleBar>
                    </div>


                        <h4 style={{
                            textAlign: "left",
                            color: "red",
                            marginLeft: "60px",
                            //border: "1px solid black"
                            fontSize: '18px'
                        }}>
                            Note:-State capital flag (other than metro) applicable for india only
                        </h4>

                </Col>
            </Row> 
            </Form>
        </React.Fragment>
    )
}

 export default statewiseMasterDtl  

// import React, { useState, useEffect, useCallback } from "react"
// import { Row, Col } from "reactstrap"
// import RadioGroup from "../../../components/basic/radioGroup"
// import TextField from "../../../components/basic/textField"
// import Checkbox from "../../../components/basic/checkbox"
// import { MdDeleteForever, MdAddCircle } from "react-icons/md"
// import ButtonUi from "../../../components/basic/button"
// import TablePagination from "./TablePagination"

// const StatewiseMasterDtl = ({
//     formData = {},
//     stateData,
//     formStatus,
//     handleStateDataChange,
//     handleChange,
//     handleSetStateData,
//     actualStateData,
//     setStateData,
//     initStateFormDataTemplate,
//     visibleData,
//     setVisibleData,
//     currentPage,
//     handlePageChange,
//     handleAddTableRecord,
//     //totalPages,
// }) => {
//     const [selectedTypeFlag, setSelectedTypeFlag] = useState("")
//     const [filteredStateData, setFilteredStateData] = useState(stateData)

//     console.log("actualstate data at type:", actualStateData);
//     const stateDetailHeader = [
//         { label: "Actions" },
//         { label: "CHILD NAME", required: true },
//         { label: "Short Name", required: true },
//         { label: "M/N" },
//         { label: "State cap." },
//         { label: "PARENT NAME", required: true },
//         { label: "Local Flag" },
//         { label: "<-----State Tds" },
//         { label: "Code-----> GST" },
//         { label: "E-Invoice Country" },
//         { label: "Union Territory" },
//     ]

//     useEffect(() => {
//         setStateData(initStateFormDataTemplate)
//         setVisibleData(initStateFormDataTemplate?.slice(0, 30))
//     }, [initStateFormDataTemplate])



//     const handleTypeChange = (flag) => {
//         setSelectedTypeFlag(flag);
//         handleChange("type", flag);

//         // Filter the program description data based on the selected flag
//         let filteredData;

//         if (flag === "C") {
//             filteredData = actualStateData.filter((item) => item.type === "C");
//             console.log("C, Filtered Data:", filteredData);
//         } else if (flag === "D") {
//             filteredData = actualStateData.filter((item) => item.type === "D");
//             console.log("D, Filtered Data:", filteredData);
//         } else if (flag === "Z") {
//             filteredData = actualStateData.filter((item) => item.type === "Z");
//             console.log("Z, Filtered Data:", filteredData);
//         } else if (flag === "T") {
//             filteredData = actualStateData.filter((item) => item.type === "T");
//             console.log("T, Filtered Data:", filteredData);
//         } else if (flag === "S") {
//             filteredData = actualStateData.filter((item) => item.type === "S");
//             console.log("S, Filtered Data:", filteredData);
//         } else if (flag === "R") {
//             filteredData = actualStateData.filter((item) => item.type === "R");
//             console.log("R, Filtered Data:", filteredData);
//         }

//         // Map parent_id from the filtered data
//         const parentIds = filteredData.map((item) => item.parent_id);
//         console.log("parent_id:", parentIds);

//         // Find matching state_name in actualStateData
//         const matchingStates = parentIds.map((parent_id) => {
//             const match = actualStateData.find(
//                 (state) => state.state_id === parent_id
//             );
//             return match ? match.state_name : null;
//         });

//         console.log("Matching State Names:", matchingStates);

//         // Add `parent_desc` (matching state_name) to the filtered data
//         const updatedFilteredData = filteredData.map((item, index) => ({
//             ...item,
//             parent_desc: matchingStates[index], // Add the matching state name
//         }));

//         setFilteredStateData(updatedFilteredData);
//         handleSetStateData(updatedFilteredData);

//         // Update visibleData with the first page of filtered data
//         const initialVisibleData = updatedFilteredData;
//         setVisibleData(initialVisibleData);

//         // console.log("Filtered data:", updatedFilteredData);
//         // console.log("stateData at detail", stateData);
//         // console.log("visible data at detail:", visibleData);

//         // Reset pagination
//         handlePageChange(1)
//     };


//     const ITEMS_PER_PAGE = 10; // Define a default value for ITEMS_PER_PAGE
//     const totalPages = Math.max(1, Math.ceil((stateData?.length || 0) / ITEMS_PER_PAGE));

//     useEffect(() => {
//         if (currentPage > totalPages) {
//             handlePageChange(1); // Reset to the first page if currentPage exceeds totalPages
//         }
//     }, [currentPage, totalPages, visibleData]);


//     return (
//         <React.Fragment>
//             <Row>
//                 <Col xl={8}>
//                     <RadioGroup
//                         className="button-group-wrapper box-border"
//                         options={[
//                             { text: "CITY", value: "C" },
//                             { text: "DISTRICT", value: "D" },
//                             { text: "STATE", value: "S" },
//                             { text: "ZONE", value: "Z" },
//                             { text: "COUNTRY", value: "T" },
//                             { text: "REGION", value: "R" },
//                         ]}
//                         onChange={(e) => handleTypeChange(e.target.value)}
//                         checked={formData?.type}
//                     />
//                 </Col>
//             </Row>

//             <Row>
//                 <Col xl={12} >
//                     <div style={{ marginTop: "7px", height: "62vh", overflowY: "auto" }}>
//                         <table className="table_fix">
//                             <thead>
//                                 <tr>
//                                     {stateDetailHeader.map((header, index) => (
//                                         <th data-required={header.required || false} key={index}>
//                                             {header.label}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {Array.isArray(visibleData) &&
//                                     visibleData?.map((data, rowIndex) =>
//                                         <tr key={rowIndex}>
//                                             {/* Table row content (unchanged) */}

//                                             <td>
//                                                 {visibleData?.length > 1 && (formStatus === "Insert" || formStatus === "Update") ? (
//                                                     <span className="delete-wrapper">
//                                                         <MdDeleteForever size={20} color="red" />
//                                                     </span>
//                                                 ) : (
//                                                     "-"
//                                                 )}
//                                             </td>
//                                             <td className="table_cell">
//                                                 <TextField
//                                                     required
//                                                     name="state_name"
//                                                     placeholder={""}
//                                                     //value={data.state_name || ""}
//                                                     //value={stateData[rowIndex]?.state_name || data.state_name}
//                                                     value={visibleData[rowIndex]?.state_name || data.state_name}

//                                                     //   onBlur = {(e) => {
//                                                     //     const stateName = e.target.value;

//                                                     //     getValidateData("stateName", stateName, otherQueryPera)
//                                                     //   }}  
//                                                     // onKeyDown ={
//                                                     //   (e) => {
//                                                     //     e.key === Enter 
//                                                     //     const stateName = e.target.value;
//                                                     //     const type = formDataType 
//                                                     //     getSearchedData("stateName", stateName, {type: type})
//                                                     //   }
//                                                     // }
//                                                     onChange={(e) => {
//                                                         handleStateDataChange("state_name", e.target.value, rowIndex);
//                                                     }}
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     required
//                                                     name="short_name"
//                                                     placeholder={""}
//                                                     //value={stateData[rowIndex]?.short_name || data.short_name}
//                                                     value={visibleData[rowIndex]?.short_name || data.short_name}
//                                                     onChange={(e) => {
//                                                         handleStateDataChange("short_name", e.target.value, rowIndex);
//                                                     }}
//                                                 //   onBlur = {(e) => {
//                                                 //     const shortName = e.target.value;
//                                                 //     const type = formData.type
//                                                 //     getValidateData("shortName", shortName, otherQueryPera)
//                                                 //   }}
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <Checkbox
//                                                     name="metro_city"
//                                                     // checked={stateData[rowIndex]?.metro_city === "Y"}
//                                                     checked={visibleData[rowIndex]?.metro_city === "Y"}

//                                                     onChange={(e) => {
//                                                         handleStateDataChange(
//                                                             "metro_city",
//                                                             e.target.checked ? "Y" : "N",
//                                                             rowIndex
//                                                         )
//                                                     }}
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <Checkbox
//                                                     name="state_cap_flag"
//                                                     // checked={stateData[rowIndex]?.state_cap_flag === "Y"}
//                                                     checked={visibleData[rowIndex]?.state_cap_flag === "Y"}
//                                                     onChange={(e) => {
//                                                         handleStateDataChange(
//                                                             "state_cap_flag",
//                                                             e.target.checked ? "Y" : "N",
//                                                             rowIndex
//                                                         )
//                                                     }}
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     required
//                                                     name="parent_desc"
//                                                     placeholder={""}
//                                                     //value={stateData[rowIndex]?.parent_desc || data.parent_desc}
//                                                     value={visibleData[rowIndex]?.parent_desc || data.parent_desc}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange("parent_desc", e.target.value, rowIndex)
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     required
//                                                     name="local_flag"
//                                                     placeholder={""}
//                                                     // value={stateData[rowIndex]?.local_flag || data.local_flag}
//                                                     value={visibleData[rowIndex]?.local_flag || data.local_flag}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange("local_flag", e.target.value, rowIndex)
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     //required
//                                                     name="tds_state_code"
//                                                     placeholder={""}
//                                                     //value={stateData[rowIndex]?.tds_state_code || data.tds_state_code}
//                                                     value={visibleData[rowIndex]?.tds_state_code || data.tds_state_code}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange(
//                                                             "tds_state_code",
//                                                             e.target.value,
//                                                             rowIndex
//                                                         )
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     //required
//                                                     name="gst_state_code"
//                                                     placeholder={""}
//                                                     //value={stateData[rowIndex]?.gst_state_code || data.gst_state_code}
//                                                     value={visibleData[rowIndex]?.gst_state_code || data.gst_state_code}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange(
//                                                             "gst_state_code",
//                                                             e.target.value,
//                                                             rowIndex
//                                                         )
//                                                     }

//                                                 // onKeyDown ={
//                                                 //   (e) => {
//                                                 //     e.key === Enter 
//                                                 //     const gstCode = e.target.value;
//                                                 //     const type = formDataType 
//                                                 //     getSearchedData("gstCode", gstCode, {type: type})
//                                                 //   }
//                                                 // }
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <TextField
//                                                     //required
//                                                     name="e_inv_country_cd"
//                                                     placeholder={""}
//                                                     //value={stateData[rowIndex]?.e_inv_country_cd || data.e_inv_country_cd}
//                                                     value={visibleData[rowIndex]?.e_inv_country_cd || data.e_inv_country_cd}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange(
//                                                             "e_inv_country_cd",
//                                                             e.target.value,
//                                                             rowIndex
//                                                         )
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="table_cell">
//                                                 <Checkbox
//                                                     name="ut_yes_no"
//                                                     //checked={stateData[rowIndex]?.state_cap_flag === "Y"}
//                                                     checked={visibleData[rowIndex]?.state_cap_flag === "Y"}
//                                                     onChange={(e) =>
//                                                         handleStateDataChange(
//                                                             "ut_yes_no",
//                                                             e.target.checked ? "Y" : "N",
//                                                             rowIndex
//                                                         )
//                                                     }
//                                                 />
//                                             </td>



//                                         </tr>)}
//                             </tbody>
//                         </table>

//                         {(formStatus === "Insert" || formStatus === "Update") && (
//                             <div className="table-add-record">
//                                 <ButtonUi onClick={handleAddTableRecord}>Add Row</ButtonUi>
//                             </div>
//                         )} 
//                         </div>
//                         <div>   
//                         <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

//                         <h5
//                             style={{
//                                 textAlign: "left",
//                                 color: "red",
//                                 marginLeft: "60px",
//                             }}
//                         >
//                             Note:-State capital flag (other than metro) applicable for india only
//                         </h5> 

//                         </div>
                    
//                 </Col>
//             </Row>
//         </React.Fragment>
//     )
// }

// export default StatewiseMasterDtl


