// import React, { useEffect, useState } from "react";
// import Select from "../../../../components/basic/select";
// import TextField from "../../../../components/basic/textField";
// import { validateFamilyData, validateForm } from "../../../../utils/fn";
// import toast from "react-hot-toast";
// import { bloodGroupOption, familyData, familyTitle } from "./member_onboard_helper";
// import ButtonUi from "../../../../components/basic/button";
// import { Form, Table } from "reactstrap";
// import SimpleBar from "simplebar-react";
// import RowAction from "../../../../components/common/rowAction";
// import { IoInformationCircleSharp } from "react-icons/io5";

// const FamilyDetail = ({
//     rowIndex,
//     formData,
//     handleAddRow,
//     handleDeleteRow,
//     handleChange,
//     qualifications,
//     familyRelation,
//     handleSave,
//     handleCloseOperation = () => {},
//     setIsDisabledFamilyAddBtn,
//     formStatus,
//     updateMemberForm,
//     deleteRecordInUpdate,
// }) => {
//     const [saved, setSaved] = useState(false);
//     const [error, setError] = useState(false);
//     const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

//     useEffect(() => {
//         if (saved) {
//             let timer = setTimeout(() => {
//                 setSaved(false);
//             }, 3000);

//             return () => {
//                 clearTimeout(timer);
//                 setSaved(false);
//             };
//         }
//     }, [saved]);

//     //
//     useEffect(()=>{
//         setFocusedRowIndex(-1)
//     },[rowIndex])

//     const handleSaveOperation = (e) => {
//         if (validateFamilyData(formData)) {
//             setError(false);
//             handleSave(rowIndex);
//             if (formStatus === "Update") {
//                 updateMemberForm({ familyDataList: [...formData] }); //should be new data or updated data
//             }
//             setSaved(true);
//         } else {
//             setError(true);
//         }
//     };

//     const triggerAddRow = (e) => {
//         e.stopPropagation();
//         e.preventDefault();
//         if(formStatus ==='Insert'){ //for time being doing this only for insert 
//             const isValidFamilyData =  validateForm('family-form', 'Family Detail Form')
//             if(!isValidFamilyData){
//                 return
//             }
//         }
//         const hasValidData = validateFamilyData(formData);
//         if (!hasValidData) {
//             toast.error("Please fill all the details in family rows then add a new row");
//             return;
//         }
//         if (handleAddRow) {
//             handleAddRow();
//         }
//     };

//     const handleUpdate = async (data) => {
//         const hasValidData = validateFamilyData(formData);
//         if (!hasValidData) {
//             toast.error("Please fill all the required fields then update");
//             return;
//         }
//         // console.log("update btn click from familydetail");
//         updateMemberForm({ familyData: { ...data } });
//         toast.success('Record Updated')
//     };


//     const deleteFamilyData =(data, index)=>{
//         if(!data.hasOwnProperty('member_id')){
//             handleDeleteRow(index);

//         }else{
//             deleteRecordInUpdate({familyData:{...data}})
//             handleDeleteRow(index)
//         }
//     }

//     return (
//         <Form id="family-form-v1">
//             <div className="table-title">
//                 <div>
//                 <span>Family Detail</span>
//                     {error && (
//                         <span style={{ color: "red", fontSize:"12px", verticalAlign:"middle", border:'1px solid black', marginInline:"1rem"}}>
//                             (Please fill all the required fields)
//                         </span>
//                     )}
//                     {saved && (
//                         <span style={{color: "green", fontSize:"12px", verticalAlign:"middle", marginInline:"1rem"}}>
//                             Data Saved for directory
//                         </span>
//                     )}
//                 </div>
//                 {
//                 (formStatus === 'Insert' || formStatus === 'Update') &&
//                  <div style={{display:'flex', gap:'0.2rem', flex:'1', marginInline:"0.5rem", justifyContent: 'end', alignContent:"center"}}>
//                     <IoInformationCircleSharp/>
//                     <span style={{fontSize:'12px',color:"gray"}}>Please Save the Family Detail after Update/Add</span>
//                  </div>
//                 }

//                 <div style={{display:'flex', gap:"0.5rem"}}>
//                     {(formStatus === 'Insert' || formStatus === 'Update') && 
//                     <>
//                     <ButtonUi color="primary" outline className="add-action" onClick={handleSaveOperation} >Save</ButtonUi>
//                     <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
//                     </>
//                 }
//                 <ButtonUi color="danger" className="add-action" onClick={handleCloseOperation} >Close</ButtonUi>
//                 </div>
//             </div>
//             <div className="table-container">
//                 <SimpleBar  forceVisible="y" autoHide={false}>
//                     <Table hover>
//                         <thead>
//                             <tr>{
//                                     (formStatus==='Insert' || formStatus==='Update') &&
//                                     <th className="sticky-column left">Actions</th>
//                                 }
//                                 {familyData.map((header, index) => (
//                                     <th
//                                     key={index}
//                                     data-required={header.required || false}
//                                     style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
//                                         {header.label}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {formData.map((data, index) => (
//                                 <tr 
//                                     key={index}
//                                     onFocus={() => setFocusedRowIndex(index)}
//                                     style={{border:`${index=== focusedRowIndex? '2px solid black': 'none'}`}}
//                                     tabIndex={0}
//                                 >
//                                     {
//                                     (formStatus==='Insert' || formStatus==='Update') &&
//                                     <td className="sticky-column left">
//                                         <RowAction
//                                             formStatus={formStatus}
//                                             canDelete={true}
//                                             onDelete={() => deleteFamilyData(data, index)}
//                                             onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
//                                         />
//                                     </td>
//                                     }
//                                     <td >
//                                         <Select
//                                             name="desigRelation"
//                                             value={data.desigRelation || ""}
//                                             onChange={(e) =>handleChange("desigRelation", e.target.value, index)}
//                                             options={familyRelation}
//                                             required
//                                         />
//                                     </td>
//                                     <td >
//                                         <Select
//                                             name="title"
//                                             value={data.title || ""}
//                                             onChange={(e) =>handleChange( "title", e.target.value, index)}
//                                             options={familyTitle}
//                                             required
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="text"
//                                             name="name"
//                                             value={data.name || ""}
//                                             onChange={(e) => handleChange( "name", e.target.value, index)}
//                                             required={true}
//                                             maxLength={100}
//                                         />
//                                     </td>
//                                     <td >
//                                         <Select
//                                             name="qualification"
//                                             value={data.qualification || ""}
//                                             onChange={(e) => handleChange( "qualification", e.target.value, index)}
//                                             options={qualifications}
//                                             required
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="date"
//                                             name="dob"
//                                             value={data.dob || ""}
//                                             onChange={(e) => handleChange( "dob", e.target.value, index)}
//                                             required={true}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="date"
//                                             name="dom"
//                                             value={data.dom || ""}
//                                             onChange={(e) => handleChange( "dom", e.target.value, index)}
//                                             required={false}
//                                         />
//                                     </td>
//                                     <td >
//                                         <Select
//                                             name="bloodGroup"
//                                             value={data.bloodGroup || ""}
//                                             onChange={(e) => handleChange( "bloodGroup", e.target.value, index)}
//                                             options={bloodGroupOption}
//                                             required={false}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="text"
//                                             name="mobileNo"
//                                             value={data.mobileNo || ""}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 if (/^\d*$/.test(value)) { // Allow only numbers
//                                                     handleChange("mobileNo", value, index);
//                                                 }
//                                             }}
//                                             required={false}
//                                             inputMode="numeric"
//                                             maxLength={10}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="email"
//                                             name="emailId"
//                                             value={data.emailId || ""}
//                                             onChange={(e) => handleChange( "emailId", e.target.value, index)}
//                                             required={false}
//                                             maxLength={100}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="text"
//                                             name="resAdd"
//                                             value={data.resAdd || ""}
//                                             onChange={(e) => handleChange( "resAdd", e.target.value, index)}
//                                             required={false}
//                                             maxLength={60}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="text"
//                                             name="resPhone"
//                                             value={data.resPhone || ""}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 if (/^\d*$/.test(value)) { // Allow only numbers
//                                                     handleChange("resPhone", value, index);
//                                                 }
//                                             }}
//                                             maxLength={10}// Limit the max value
//                                             inputMode="numeric"
//                                             required={false}
//                                         />
//                                     </td>
//                                     <td >
//                                         <Select
//                                             name="involmentInBusiness"
//                                             value={ data.involmentInBusiness || ""}
//                                             onChange={(e) => handleChange( "involmentInBusiness",  e.target.value, index)}
//                                             options={[
//                                                 { value: "", label: "" },
//                                                 { value: "H", label: "High" },
//                                                 { value: "L", label: "Low",}]}
//                                             required={false}
//                                         />
//                                     </td>
//                                     <td >
//                                         <TextField
//                                             type="text"
//                                             name="since"
//                                             value={data.since || ""}
//                                             required={false}
//                                             minLength={4}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 if (/^\d*$/.test(value)) { // Allow only numbers
//                                                     handleChange("since", value, index);
//                                                 }
//                                             }}
//                                             maxLength={4}// Limit the max value
//                                             inputMode="numeric"
//                                         />
//                                     </td>
//                                     <td >
//                                         <Select
//                                             name="status"
//                                             value={data.status || ""}
//                                             onChange={(e) => handleChange( "status", e.target.value, index)}
//                                             options={[
//                                                 { value: "", label: "" },
//                                                 { value: "Y", label: "ACTIVE" },
//                                                 { value: "N", label: "INACTIVE",}]}
//                                             required={false}
//                                         />
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </Table>
//                 </SimpleBar>
//             </div>
//         </Form>
//     );
// };

// export default FamilyDetail;


import React, { useEffect, useState } from "react";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import { validateFamilyData, validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { bloodGroupOption, familyData, familyTitle } from "./member_onboard_helper";
import ButtonUi from "../../../../components/basic/button";
import { Form, Table } from "reactstrap";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { IoInformationCircleSharp } from "react-icons/io5";

const FamilyDetail = ({
    rowIndex,
    formData,
    handleAddRow,
    handleDeleteRow,
    handleChange,
    qualifications,
    familyRelation,
    handleSave,
    handleCloseOperation = () => {},
    setIsDisabledFamilyAddBtn,
    formStatus,
    updateMemberForm,
    deleteRecordInUpdate,
}) => {
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(false);
    const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

    useEffect(() => {
        if (saved) {
            let timer = setTimeout(() => {
                setSaved(false);
            }, 3000);

            return () => {
                clearTimeout(timer);
                setSaved(false);
            };
        }
    }, [saved]);

    //
    useEffect(()=>{
        setFocusedRowIndex(-1)
    },[rowIndex])

    const handleSaveOperation = (e) => {
        if (validateFamilyData(formData)) {
            setError(false);
            handleSave(rowIndex);
            if (formStatus === "Update") {
                updateMemberForm({ familyDataList: [...formData] }); //should be new data or updated data
            }
            setSaved(true);
        } else {
            setError(true);
        }
    };

    const triggerAddRow = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if(formStatus ==='Insert'){ //for time being doing this only for insert 
            const isValidFamilyData =  validateForm('family-form', 'Family Detail Form')
            if(!isValidFamilyData){
                return
            }
        }
        const hasValidData = validateFamilyData(formData);
        if (!hasValidData) {
            toast.error("Please fill all the details in family rows then add a new row");
            return;
        }
        if (handleAddRow) {
            handleAddRow();
        }
    };

    const handleUpdate = async (data) => {
        const hasValidData = validateFamilyData(formData);
        if (!hasValidData) {
            toast.error("Please fill all the required fields then update");
            return;
        }
        // console.log("update btn click from familydetail");
        updateMemberForm({ familyData: { ...data } });
        toast.success('Record Updated')
    };


    const deleteFamilyData =(data, index)=>{
        if(!data.hasOwnProperty('member_id')){
            handleDeleteRow(index);

        }else{
            deleteRecordInUpdate({familyData:{...data}})
            handleDeleteRow(index)
        }
    }

    return (
        <Form id="family-form-v1">
            <div className="table-title">
                <div>
                <span>Family Detail</span>
                    {error && (
                        <span style={{ color: "red", fontSize:"12px", verticalAlign:"middle", border:'1px solid black', marginInline:"1rem"}}>
                            (Please fill all the required fields)
                        </span>
                    )}
                    {saved && (
                        <span style={{color: "green", fontSize:"12px", verticalAlign:"middle", marginInline:"1rem"}}>
                            Data Saved for directory
                        </span>
                    )}
                </div>
                {
                (formStatus === 'Insert' || formStatus === 'Update') &&
                 <div style={{display:'flex', gap:'0.2rem', flex:'1', marginInline:"0.5rem", justifyContent: 'end', alignContent:"center"}}>
                    <IoInformationCircleSharp/>
                    <span style={{fontSize:'12px',color:"gray"}}>Please Save the Family Detail after Update/Add</span>
                 </div>
                }

                <div style={{display:'flex', gap:"0.5rem"}}>
                    {(formStatus === 'Insert' || formStatus === 'Update') && 
                    <>
                    <ButtonUi color="primary" outline className="add-action" onClick={handleSaveOperation} >Save</ButtonUi>
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
                    </>
                }
                <ButtonUi color="danger" className="add-action" onClick={handleCloseOperation} >Close</ButtonUi>
                </div>
            </div>
            <div className="table-container">
                <SimpleBar  forceVisible="y" autoHide={false}>
                    <Table hover>
                        <thead>
                            <tr>{
                                    (formStatus==='Insert' || formStatus==='Update') &&
                                    <th className="sticky-column left">Actions</th>
                                }
                                {familyData.map((header, index) => (
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
                            {formData.map((data, index) => (
                                <tr 
                                    key={index}
                                    onFocus={() => setFocusedRowIndex(index)}
                                    style={{border:`${index=== focusedRowIndex? '2px solid black': 'none'}`}}
                                    tabIndex={0}
                                >
                                    {
                                    (formStatus==='Insert' || formStatus==='Update') &&
                                    <td className="sticky-column left">
                                        <RowAction
                                            formStatus={formStatus}
                                            canDelete={true}
                                            onDelete={() => deleteFamilyData(data, index)}
                                            onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                        />
                                    </td>
                                    }
                                    <td >
                                        <Select
                                            name="desigRelation"
                                            value={data.desigRelation || ""}
                                            onChange={(e) =>handleChange("desigRelation", e.target.value, index)}
                                            options={familyRelation}
                                            required
                                        />
                                    </td>
                                    <td >
                                        <Select
                                            name="title"
                                            value={data.title || ""}
                                            onChange={(e) =>handleChange( "title", e.target.value, index)}
                                            options={familyTitle}
                                            required
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="text"
                                            name="name"
                                            value={data.name || ""}
                                            onChange={(e) => handleChange( "name", e.target.value, index)}
                                            required={true}
                                            maxLength={100}
                                        />
                                    </td>
                                    <td >
                                        <Select
                                            name="qualification"
                                            value={data.qualification || ""}
                                            onChange={(e) => handleChange( "qualification", e.target.value, index)}
                                            options={qualifications}
                                            required
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="date"
                                            name="dob"
                                            value={data.dob || ""}
                                            onChange={(e) => handleChange( "dob", e.target.value, index)}
                                            required={true}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="date"
                                            name="dom"
                                            value={data.dom || ""}
                                            onChange={(e) => handleChange( "dom", e.target.value, index)}
                                            required={false}
                                        />
                                    </td>
                                    <td >
                                        <Select
                                            name="bloodGroup"
                                            value={data.bloodGroup || ""}
                                            onChange={(e) => handleChange( "bloodGroup", e.target.value, index)}
                                            options={bloodGroupOption}
                                            required={false}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="text"
                                            name="mobileNo"
                                            value={data.mobileNo || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) { // Allow only numbers
                                                    handleChange("mobileNo", value, index);
                                                }
                                            }}
                                            required={false}
                                            inputMode="numeric"
                                            maxLength={10}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="email"
                                            name="emailId"
                                            value={data.emailId || ""}
                                            onChange={(e) => handleChange( "emailId", e.target.value, index)}
                                            required={false}
                                            maxLength={100}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="text"
                                            name="resAdd"
                                            value={data.resAdd || ""}
                                            onChange={(e) => handleChange( "resAdd", e.target.value, index)}
                                            required={false}
                                            maxLength={60}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="text"
                                            name="resPhone"
                                            value={data.resPhone || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) { // Allow only numbers
                                                    handleChange("resPhone", value, index);
                                                }
                                            }}
                                            maxLength={10}// Limit the max value
                                            inputMode="numeric"
                                            required={false}
                                        />
                                    </td>
                                    <td >
                                        <Select
                                            name="involmentInBusiness"
                                            value={ data.involmentInBusiness || ""}
                                            onChange={(e) => handleChange( "involmentInBusiness",  e.target.value, index)}
                                            options={[
                                                { value: "", label: "" },
                                                { value: "H", label: "High" },
                                                { value: "L", label: "Low",}]}
                                            required={false}
                                        />
                                    </td>
                                    <td >
                                        <TextField
                                            type="text"
                                            name="since"
                                            value={data.since || ""}
                                            required={false}
                                            minLength={4}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) { // Allow only numbers
                                                    handleChange("since", value, index);
                                                }
                                            }}
                                            maxLength={4}// Limit the max value
                                            inputMode="numeric"
                                        />
                                    </td>
                                    <td >
                                        <Select
                                            name="status"
                                            value={data.status || ""}
                                            onChange={(e) => handleChange( "status", e.target.value, index)}
                                            options={[
                                                { value: "", label: "" },
                                                { value: "Y", label: "ACTIVE" },
                                                { value: "N", label: "INACTIVE",}]}
                                            required={false}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </SimpleBar>
            </div>
        </Form>
    );
};

export default FamilyDetail;


