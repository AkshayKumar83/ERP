// import React, { useEffect, useState } from "react";
// import Select from "../../../../components/basic/select";
// import TextField from "../../../../components/basic/textField";
// import { checkDuplicateEntry, validateDirectoryData, validateForm } from "../../../../utils/fn";
// import toast from "react-hot-toast";
// import { Form, Table } from "reactstrap";
// import { memberDirectoryHeader } from "./member_onboard_helper";
// import SimpleBar from "simplebar-react";
// import Title from "../../../../components/Title";
// import Divider from "../../../../components/Divider";
// import ButtonUi from "../../../../components/basic/button";
// import { validateField } from "../../../../lib";
// import RowAction from "../../../../components/common/rowAction";

// const MemberDirectory = ({
//     constitutions=[],
//     qualifications=[],
//     designations=[],
//     formData=[{}],
//     handleAddRow = ()=>{},
//     handleDeleteRow =()=>{},
//     handleChange=()=>{},
//     handleShowFamilyDetail,
//     formStatus='',
//     updateMemberForm,
//     selectedDealerCode,
//     deleteRecordInUpdate,
// }) => {

//     const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

//     const triggerAddRow = () => {
//         const hasValidData = validateDirectoryData(formData);
//         if (!hasValidData) {
//           toast.error("Please fill all the directory rows then add new row");
//           return;
//         };

//         let isFamilyExist =  formData.every((row) => {
//             return !!(Array.isArray(row['familyDetails']) && row['familyDetails'].length>=1);
        
//         });

//         // if(!isFamilyExist){
//         //     toast.error('Cannot add new Record, There must atleast one Family Member')
//         //     return;
//         // }

//         // Check for duplicate entry with multiple fields
//         if(formData.length > 1){
//             let newEntry = formData[formData.length - 1]
//             let newFormData = formData.filter((item)=>item.individual_sno !== newEntry.individual_sno)
//             const isDuplicate = checkDuplicateEntry(newFormData, newEntry, ['constitution','desigRelation', 'name', 'dob']); 
//             if (isDuplicate) {
//             toast.error('Duplicate entry found. The Member with Name already exist/Entered');
//             return;
//             }
//         }
        
//         // if(formStatus === 'Update'){
//         //     //console.log('newly added directory: ', formData)
//         //   let getNotADBRecord = formData.filter((directory)=> !directory?.member_id)
//         //   //console.log('not a db record :', getNotADBRecord)

//         // }
//         if (handleAddRow) {
//           handleAddRow();
//         }
//     };
    
//     // as per removing family button this logic might be offload to onfucus of table row
//     const triggerFamilyDetail = (id) => {
//         const entry = formData.find((entry) => entry.id === id);
//         const isValidEntry = validateDirectoryData(entry || {}, true);
//         // //console.log('directory data :', entry)
//         if(formStatus === 'Insert'){
//             // 'member-directory-form'
//             const isValidForm =  validateForm('member-directory-form-v1', 'Member Directory')
//             if(!isValidForm){
//                 return
//             }
//         }

//         // Check for duplicate entry with multiple fields
//         if(formData.length > 1){
//             let newFormData = formData.filter((item)=>item.individual_sno !== entry.individual_sno)
//             const isDuplicate = checkDuplicateEntry(newFormData, entry, ['constitution','desigRelation', 'name', 'dob']); 
//             if (isDuplicate) {
//                 toast.error('Duplicate entry found. The Member with Name already exist/Entered');
//                 return;
//             }
//         }
        
//         if(formStatus === 'Update'){
//             if(!entry?.member_id){
//                 //this will added to newDirectory array property of updateFormPayload object
//                 updateMemberForm({directory:{...entry}})
//             }

//         }
//         handleShowFamilyDetail(entry);
//     };
    

//     const makeFocusOnTableRow = (rowIndex, id)=>{
//         const entry = formData.find((entry) => entry.id === id);
//         setFocusedRowIndex(rowIndex)
//         // handleShowFamilyDetail(entry); // commented after said by sahil on meet 18-08-2025 the family show shows only when family btn press
//         // triggerFamilyDetail(id)
//     }

//     const handleUpdate = async(data)=>{
//         const hasValidData = validateDirectoryData(data, true);
//         if (!hasValidData) {
//             toast.error("Please fill all the required fields then update");
//             return;
//         }

//         // Check for duplicate entry with multiple fields
//         let newFormData = formData.filter((item)=>item.individual_sno !== data.individual_sno)
//         const isDuplicate = checkDuplicateEntry(newFormData, data, ['constitution', 'desigRelation', 'name', 'dob']); 
//         if (isDuplicate) {
//         toast.error('Duplicate entry found. The Member with Name already exist/entered.');
//         return;
//         }

//         // //console.log('update btn click')
//         updateMemberForm({directory:{...data}})
//         toast.success('Record Updated')
//     }

//     const handleDelete = async(data, index)=>{
//         //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT MEMBERSHIP DETAIL DATA WE COMMENTED IT AS PER SAID BY JSB SIR
//         // if(formData.length === 1){
//         //     toast.error('Record cannot deleted as there should be minimum one record in directory')
//         //     return;
//         // }
//         // //console.log('for delete directory ; ', data);
//         if(data?.familyDetails && data.familyDetails.length){
//             toast.error('Cannot delete directory cause Family Member Exist')
//             return;
//         }

//         if(!data.hasOwnProperty('member_id')){
//             handleDeleteRow(index);  
//         }else{
//             deleteRecordInUpdate({directory: {...data}})
//             handleDeleteRow(index);  
//         }

//     }

//     const handleBlur = async (fieldName, value) => {

//         if(formStatus ==='Insert'|| formStatus === 'Update'){
//             const result = await validateField(GET_DATA_FOR_MEMBER_FORM, fieldName, value, 'dealer_code', selectedDealerCode);
//             // //console.log('hanldeBlur result', result)
//             if(result){
//                 if(result?.dlr_gstin){
//                     if(value !== result?.dlr_gstin){
//                         toast.error('Gst no not match with the current dealer')
//                         return
//                     }
//                 }
//                 if(result?.message){
//                     toast.error(result?.message)
//                     return
//                 }
//             }

//         }
//     };
    
//     useEffect(()=>{
//         setFocusedRowIndex(-1)
//     }, [selectedDealerCode])

//     return (
//         <Form id="member-directory-form-v1">
//             <div className="table-title">
//                 <span>Member Directory</span>
//                 {
//                     (formStatus === 'Insert' || formStatus === 'Update') &&
//                     <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
//                 }
//             </div>
//             <div className="table-container">
//                 <SimpleBar  forceVisible="y" autoHide={false}>
//                     <Table hover>
//                         <thead>
//                             <tr>{
//                                     (formStatus==='Insert' || formStatus==='Update') &&
//                                     <th className="sticky-column left">Actions</th>
//                                 }
//                                 {memberDirectoryHeader.map((header, index) => (
//                                     <th
//                                     key={index}
//                                     data-required={header.required || false}
//                                     style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
//                                         {header.label}
//                                     </th>
//                                 ))}
//                                 <th style={{ width: "80px", minWidth: "80px", backgroundColor:'#828eedff' }} className="sticky-column right">Family</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {formData.map((data, rowIndex) => (
//                             <tr key={rowIndex}
//                                 onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
//                                 // onBlur={() => setFocusedRowIndex(-1)}
//                                 style={{border:`${rowIndex=== focusedRowIndex? '2px solid black': 'none'}`}}
//                                 tabIndex={0}
//                             >
//                                 {
//                                (formStatus==='Insert' || formStatus==='Update') &&
//                                 <td className="sticky-column left">
//                                     <RowAction
//                                         formStatus={formStatus}
//                                         canDelete={formData.length > 0} // ALLOW USER TO DELETE IF NO DETAIL AS PER JSB SIR SAID ON 26.05.2025
//                                         onDelete={() => handleDelete(data, rowIndex)}
//                                         onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
//                                     />
//                                 </td>
                                  
//                                 }
//                                 <td>
//                                     <Select
//                                         required
//                                         name="constitution"
//                                         value={data.constitution || ""}
//                                         onChange={(e) => handleChange("constitution", e.target.value, rowIndex)}
//                                         options={constitutions}
                                        
//                                     />
//                                     </td>
//                                 <td>
//                                     <Select
//                                         required
//                                         name="desigRelation"
//                                         value={data.desigRelation || ""}
//                                         onChange={(e) => handleChange("desigRelation", e.target.value, rowIndex)}
//                                         options={designations}
//                                     />
//                                 </td>
//                                 <td>
//                                     <Select
//                                         required
//                                         name="title"
//                                         value={data.title || ""}
//                                         onChange={(e) => handleChange("title", e.target.value, rowIndex)}
//                                         options={[
//                                         { value: "", label: " " },
//                                         { value: "MR", label: "MR." },
//                                         { value: "MRS", label: "MRS." },
//                                         { value: "MISS", label: "MISS." },
//                                         { value: "DR", label: "DR." },
//                                         { value: "BRIG", label: "BRIG." },
//                                         { value: "COL", label: "COL." },
//                                         { value: "OTHER", label: "OTHERS" },
//                                         ]}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required
//                                         type="text"
//                                         name="name"
//                                         value={data.name || ""}
//                                         onChange={(e) => handleChange("name", e.target.value, rowIndex)}
//                                         maxLength={100}
//                                     />
//                                 </td>
//                                 <td>
//                                     <Select
//                                         required
//                                         name="qualification"
//                                         value={data.qualification || ""}
//                                         onChange={(e) => handleChange("qualification", e.target.value, rowIndex)}
//                                         options={qualifications}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required
//                                         type="date"
//                                         name="dob"
//                                         value={data.dob || ""}
//                                         onChange={(e) => handleChange("dob", e.target.value, rowIndex)}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
                                      
//                                         type="date"
//                                         name="dom"
//                                         value={data.dom || ""}
//                                         onChange={(e) => handleChange("dom", e.target.value, rowIndex)}
//                                     />
//                                 </td>
//                                 <td>
//                                     <Select
//                                         required={false}
//                                         name="bloodGroup"
//                                         value={data.bloodGroup || ""}
//                                         onChange={(e) => handleChange("bloodGroup", e.target.value, rowIndex)}
//                                         options={[
//                                         { value: "", label: "" },
//                                         { value: "A+", label: "A+" },
//                                         { value: "A-", label: "A-" },
//                                         { value: "B+", label: "B+" },
//                                         { value: "B-", label: "B-" },
//                                         { value: "O+", label: "O+" },
//                                         { value: "O-", label: "O-" },
//                                         { value: "AB+", label: "AB+" },
//                                         { value: "AB-", label: "AB-" },
//                                         ]}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required
//                                         type="text"
//                                         name="mobileNo"
//                                         value={data.mobileNo || ""}
                                        
//                                         onChange={(e) => {
//                                         const value = e.target.value;
//                                         if (/^\d*$/.test(value)) {
//                                             handleChange("mobileNo", value, rowIndex);
//                                         }
//                                         }}
//                                         maxLength={10}
//                                         inputMode="numeric"
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required
//                                         type="email"
//                                         name="emailId"
//                                         value={data.emailId || ""}
//                                         onChange={(e) => handleChange("emailId", e.target.value, rowIndex)}
//                                         maxLength={100}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required={false}
//                                         type="text"
//                                         name="resAdd"
//                                         value={data.resAdd || ""}
//                                         onChange={(e) => handleChange("resAdd", e.target.value, rowIndex)}
//                                         maxLength={60}
//                                     />
//                                 </td>
//                                 <td>
//                                     <TextField
//                                         required={false}
//                                         type="text"
//                                         name="resPhone"
//                                         value={data.resPhone || ""}
//                                         onChange={(e) => {
//                                         const value = e.target.value;
//                                         if (/^\d*$/.test(value)) {
//                                             handleChange("resPhone", value, rowIndex);
//                                         }
//                                         }}
//                                         maxLength={10}
//                                         inputMode="numeric"
//                                     />
//                                 </td>
//                                 <td>
//                                     <Select
//                                         required={false}
//                                         name="memberStatus"
//                                         value={data.memberStatus || ""}
//                                         onChange={(e) => handleChange("memberStatus", e.target.value, rowIndex)}
//                                         options={[
//                                         { value: "", label: "" },
//                                         { value: "Y", label: "Active" },
//                                         { value: "N", label: "Inactive" },
//                                         ]}
//                                     />
//                                 </td>
//                                 <td className="sticky-column right">
//                                 <button style={{padding:"0px 6px", fontSize:"12px", width:"100%", cursor:'pointer'}}
//                                 onClick={() => {triggerFamilyDetail(data.id)}} type="button">
//                                     Family
//                                 </button>
//                                 </td>
//                             </tr>
//                             ))}
//                         </tbody>
//                     </Table>
//                 </SimpleBar>
//             </div>
//         </Form>
//     );
// };

// export default MemberDirectory;


import React, { useEffect, useState } from "react";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import { checkDuplicateEntry, validateDirectoryData, validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { Form, Table } from "reactstrap";
import { memberDirectoryHeader } from "./member_onboard_helper";
import SimpleBar from "simplebar-react";
import Title from "../../../../components/Title";
import Divider from "../../../../components/Divider";
import ButtonUi from "../../../../components/basic/button";
import { validateField } from "../../../../lib";
import RowAction from "../../../../components/common/rowAction";

const MemberDirectory = ({
    constitutions=[],
    qualifications=[],
    designations=[],
    formData=[{}],
    handleAddRow = ()=>{},
    handleDeleteRow =()=>{},
    handleChange=()=>{},
    handleShowFamilyDetail,
    formStatus='',
    updateMemberForm,
    selectedDealerCode,
    deleteRecordInUpdate,
}) => {

    const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

    const triggerAddRow = () => {
        const hasValidData = validateDirectoryData(formData);
        if (!hasValidData) {
          toast.error("Please fill all the directory rows then add new row");
          return;
        };

        let isFamilyExist =  formData.every((row) => {
            return !!(Array.isArray(row['familyDetails']) && row['familyDetails'].length>=1);
        
        });

        // if(!isFamilyExist){
        //     toast.error('Cannot add new Record, There must atleast one Family Member')
        //     return;
        // }

        // Check for duplicate entry with multiple fields
        if(formData.length > 1){
            let newEntry = formData[formData.length - 1]
            let newFormData = formData.filter((item)=>item.individual_sno !== newEntry.individual_sno)
            const isDuplicate = checkDuplicateEntry(newFormData, newEntry, ['constitution','desigRelation', 'name', 'dob']); 
            if (isDuplicate) {
            toast.error('Duplicate entry found. The Member with Name already exist/Entered');
            return;
            }
        }
        
        // if(formStatus === 'Update'){
        //     //console.log('newly added directory: ', formData)
        //   let getNotADBRecord = formData.filter((directory)=> !directory?.member_id)
        //   //console.log('not a db record :', getNotADBRecord)

        // }
        if (handleAddRow) {
          handleAddRow();
        }
    };
    
    // as per removing family button this logic might be offload to onfucus of table row
    const triggerFamilyDetail = (id) => {
        const entry = formData.find((entry) => entry.id === id);
        const isValidEntry = validateDirectoryData(entry || {}, true);
        // //console.log('directory data :', entry)
        if(formStatus === 'Insert'){
            // 'member-directory-form'
            const isValidForm =  validateForm('member-directory-form-v1', 'Member Directory')
            if(!isValidForm){
                return
            }
        }

        // Check for duplicate entry with multiple fields
        if(formData.length > 1){
            let newFormData = formData.filter((item)=>item.individual_sno !== entry.individual_sno)
            const isDuplicate = checkDuplicateEntry(newFormData, entry, ['constitution','desigRelation', 'name', 'dob']); 
            if (isDuplicate) {
                toast.error('Duplicate entry found. The Member with Name already exist/Entered');
                return;
            }
        }
        
        if(formStatus === 'Update'){
            if(!entry?.member_id){
                //this will added to newDirectory array property of updateFormPayload object
                updateMemberForm({directory:{...entry}})
            }

        }
        handleShowFamilyDetail(entry);
    };
    

    const makeFocusOnTableRow = (rowIndex, id)=>{
        const entry = formData.find((entry) => entry.id === id);
        setFocusedRowIndex(rowIndex)
        // handleShowFamilyDetail(entry); // commented after said by sahil on meet 18-08-2025 the family show shows only when family btn press
        // triggerFamilyDetail(id)
    }

    const handleUpdate = async(data)=>{
        const hasValidData = validateDirectoryData(data, true);
        if (!hasValidData) {
            toast.error("Please fill all the required fields then update");
            return;
        }

        // Check for duplicate entry with multiple fields
        let newFormData = formData.filter((item)=>item.individual_sno !== data.individual_sno)
        const isDuplicate = checkDuplicateEntry(newFormData, data, ['constitution', 'desigRelation', 'name', 'dob']); 
        if (isDuplicate) {
        toast.error('Duplicate entry found. The Member with Name already exist/entered.');
        return;
        }

        // //console.log('update btn click')
        updateMemberForm({directory:{...data}})
        toast.success('Record Updated')
    }

    const handleDelete = async(data, index)=>{
        //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT MEMBERSHIP DETAIL DATA WE COMMENTED IT AS PER SAID BY JSB SIR
        // if(formData.length === 1){
        //     toast.error('Record cannot deleted as there should be minimum one record in directory')
        //     return;
        // }
        // //console.log('for delete directory ; ', data);
        if(data?.familyDetails && data.familyDetails.length){
            toast.error('Cannot delete directory cause Family Member Exist')
            return;
        }

        if(!data.hasOwnProperty('member_id')){
            handleDeleteRow(index);  
        }else{
            deleteRecordInUpdate({directory: {...data}})
            handleDeleteRow(index);  
        }

    }

    const handleBlur = async (fieldName, value) => {

        if(formStatus ==='Insert'|| formStatus === 'Update'){
            const result = await validateField(GET_DATA_FOR_MEMBER_FORM, fieldName, value, 'dealer_code', selectedDealerCode);
            // //console.log('hanldeBlur result', result)
            if(result){
                if(result?.dlr_gstin){
                    if(value !== result?.dlr_gstin){
                        toast.error('Gst no not match with the current dealer')
                        return
                    }
                }
                if(result?.message){
                    toast.error(result?.message)
                    return
                }
            }

        }
    };
    
    useEffect(()=>{
        setFocusedRowIndex(-1)
    }, [selectedDealerCode])

    return (
        <Form id="member-directory-form-v1">
            <div className="table-title">
                <span>Member Directory</span>
                {
                    (formStatus === 'Insert' || formStatus === 'Update') &&
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
                }
            </div>
            <div className="table-container">
                <SimpleBar  forceVisible="y" autoHide={false}>
                    <Table hover>
                        <thead>
                            <tr>{
                                    (formStatus==='Insert' || formStatus==='Update') &&
                                    <th className="sticky-column left">Actions</th>
                                }
                                {memberDirectoryHeader.map((header, index) => (
                                    <th
                                    key={index}
                                    data-required={header.required || false}
                                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                        {header.label}
                                    </th>
                                ))}
                                <th style={{ width: "80px", minWidth: "80px", backgroundColor:'#828eedff' }} className="sticky-column right">Family</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.map((data, rowIndex) => (
                            <tr key={rowIndex}
                                onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                                // onBlur={() => setFocusedRowIndex(-1)}
                                style={{border:`${rowIndex=== focusedRowIndex? '2px solid black': 'none'}`}}
                                tabIndex={0}
                            >
                                {
                               (formStatus==='Insert' || formStatus==='Update') &&
                                <td className="sticky-column left">
                                    <RowAction
                                        formStatus={formStatus}
                                        canDelete={formData.length > 0} // ALLOW USER TO DELETE IF NO DETAIL AS PER JSB SIR SAID ON 26.05.2025
                                        onDelete={() => handleDelete(data, rowIndex)}
                                        onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                    />
                                </td>
                                  
                                }
                                <td>
                                    <Select
                                        required
                                        name="constitution"
                                        value={data.constitution || ""}
                                        onChange={(e) => handleChange("constitution", e.target.value, rowIndex)}
                                        options={constitutions}
                                        
                                    />
                                    </td>
                                <td>
                                    <Select
                                        required
                                        name="desigRelation"
                                        value={data.desigRelation || ""}
                                        onChange={(e) => handleChange("desigRelation", e.target.value, rowIndex)}
                                        options={designations}
                                    />
                                </td>
                                <td>
                                    <Select
                                        required
                                        name="title"
                                        value={data.title || ""}
                                        onChange={(e) => handleChange("title", e.target.value, rowIndex)}
                                        options={[
                                        { value: "", label: " " },
                                        { value: "MR", label: "MR." },
                                        { value: "MRS", label: "MRS." },
                                        { value: "MISS", label: "MISS." },
                                        { value: "DR", label: "DR." },
                                        { value: "BRIG", label: "BRIG." },
                                        { value: "COL", label: "COL." },
                                        { value: "OTHER", label: "OTHERS" },
                                        ]}
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required
                                        type="text"
                                        name="name"
                                        value={data.name || ""}
                                        onChange={(e) => handleChange("name", e.target.value, rowIndex)}
                                        maxLength={100}
                                    />
                                </td>
                                <td>
                                    <Select
                                        required
                                        name="qualification"
                                        value={data.qualification || ""}
                                        onChange={(e) => handleChange("qualification", e.target.value, rowIndex)}
                                        options={qualifications}
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required
                                        type="date"
                                        name="dob"
                                        value={data.dob || ""}
                                        onChange={(e) => handleChange("dob", e.target.value, rowIndex)}
                                    />
                                </td>
                                <td>
                                    <TextField
                                      
                                        type="date"
                                        name="dom"
                                        value={data.dom || ""}
                                        onChange={(e) => handleChange("dom", e.target.value, rowIndex)}
                                    />
                                </td>
                                <td>
                                    <Select
                                        required={false}
                                        name="bloodGroup"
                                        value={data.bloodGroup || ""}
                                        onChange={(e) => handleChange("bloodGroup", e.target.value, rowIndex)}
                                        options={[
                                        { value: "", label: "" },
                                        { value: "A+", label: "A+" },
                                        { value: "A-", label: "A-" },
                                        { value: "B+", label: "B+" },
                                        { value: "B-", label: "B-" },
                                        { value: "O+", label: "O+" },
                                        { value: "O-", label: "O-" },
                                        { value: "AB+", label: "AB+" },
                                        { value: "AB-", label: "AB-" },
                                        ]}
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required
                                        type="text"
                                        name="mobileNo"
                                        value={data.mobileNo || ""}
                                        
                                        onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            handleChange("mobileNo", value, rowIndex);
                                        }
                                        }}
                                        maxLength={10}
                                        inputMode="numeric"
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required
                                        type="email"
                                        name="emailId"
                                        value={data.emailId || ""}
                                        onChange={(e) => handleChange("emailId", e.target.value, rowIndex)}
                                        maxLength={100}
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required={false}
                                        type="text"
                                        name="resAdd"
                                        value={data.resAdd || ""}
                                        onChange={(e) => handleChange("resAdd", e.target.value, rowIndex)}
                                        maxLength={60}
                                    />
                                </td>
                                <td>
                                    <TextField
                                        required={false}
                                        type="text"
                                        name="resPhone"
                                        value={data.resPhone || ""}
                                        onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            handleChange("resPhone", value, rowIndex);
                                        }
                                        }}
                                        maxLength={10}
                                        inputMode="numeric"
                                    />
                                </td>
                                <td>
                                    <Select
                                        required={false}
                                        name="memberStatus"
                                        value={data.memberStatus || ""}
                                        onChange={(e) => handleChange("memberStatus", e.target.value, rowIndex)}
                                        options={[
                                        { value: "", label: "" },
                                        { value: "Y", label: "Active" },
                                        { value: "N", label: "Inactive" },
                                        ]}
                                    />
                                </td>
                                <td className="sticky-column right">
                                <button style={{padding:"0px 6px", fontSize:"12px", width:"100%", cursor:'pointer'}}
                                onClick={() => {triggerFamilyDetail(data.id)}} type="button">
                                    Family
                                </button>
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

export default MemberDirectory;


