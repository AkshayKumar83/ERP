// import toast from "react-hot-toast";
// import { APP_PROD_API } from "../../../../utils/api";
// import { dateFormatter } from "../../../../utils/fn";


// // ------------------------- #### MEMBERSHIP DETAIL/ -- HEADER ----------------------------------

// export const membershipInitialFormData = {
//   member_id: "",
//   dealerCode: "",
//   membershipNo: "",
//   membershipStatus: "",
//   membershipActive: false,
//   membershipFee: false,
//   dealershipActive: false,
//   dealershipOperative: false,
//   ddNo: "",
//   division: "",
//   dealershipName: "",
//   location: "",
//   membershipForm: false,
//   ddDate: "",
//   alternateEmailId: "",
//   gstin: "",
//   dealerAppointmentDate: "",
//   membershipDate: "",
//   boardMeetingAppointmentDate: "",
//   boardMeetingCeasationDate: "",
//   inoprativeDate: "",
//   ceasationDate: "",
//   boardMeetingReinstateDate: "",
//   tools: false,
//   uniform: false,
//   promotionalKit: false,
//   stationary: false,
//   allKitItem: false,
//   forFeitureAcc: "",
//   memberFeeAmt: "",
//   emailId: "",
//   fbAccount:""
// };
// export const membershipInitialFormDataForSearch = {
//   member_id: "",
//   dealerCode: "",
//   membershipNo: "",
//   membershipStatus: "",
//   // membershipActive: false,
//   // membershipFee: false,
//   // dealershipActive: false,
//   // dealershipOperative: false,
//   ddNo: "",
//   division: "",
//   dealershipName: "",
//   location: "",
//   // membershipForm: false,
//   ddDate: "",
//   alternateEmailId: "",
//   gstin: "",
//   dealerAppointmentDate: "",
//   membershipDate: "",
//   boardMeetingAppointmentDate: "",
//   boardMeetingCeasationDate: "",
//   inoprativeDate: "",
//   ceasationDate: "",
//   boardMeetingReinstateDate: "",
//   // tools: false,
//   // uniform: false,
//   // promotionalKit: false,
//   // stationary: false,
//   // allKitItem: false,
//   forFeitureAcc: "",
//   memberFeeAmt: "",
//   emailId: "",
//   fbAccount:""
// };

// // ------------------------- #### MEMBER DETAIL/ -- DIRECTORY DETAIL -----------------------------

// // MEMBER DIRECTORY / MEMBER DETAIL
// export const memberDirectoryHeader = [
//   { label: "Constitution", key: "constitution", required:true, width: "230px" },
//   { label: "Desig/Relation", key: "desig_relation", required:true, width: "150px" },
//   { label: "Title", key: "title", required:true, width: "80px" },
//   { label: "Name", key: "name", required:true, width: "200px" },
//   { label: "Qualification", key: "qualification", required:true, width: "120px" },
//   { label: "Date of Birth", key: "dob", required:true, width: "120px" },
//   { label: "Date of Marriage", key: "dom", width: "120px" },
//   { label: "Blood Group", key: "blood_group", width: "130px" },
//   { label: "Mobile No.", key: "mob_no", required:true, width: "120px" },
//   { label: "Email ID", key: "email_id", required:true, width: "200px" },
//   { label: "Res. Add.", key: "res_add", width: "200px" },
//   { label: "Res. Phone No.", key: "res_phone", width: "120px" },
//   { label: "Member Status", key: "member_status", width: "180px" },
// ];

// // ------------------------- #### MEMBER FAMILY/ -- FAMILY DETAIL --------------------------------

// // MEMBER FAMILY DETAIL
// export const familyData = [
//   { label: "Desig/Relation", key: "desig_relation", required:true, width: "150px" },
//   { label: "Title", key: "title", required:true, width: "80px" },
//   { label: "Name", key: "name", required:true, width: "200px" },
//   { label: "Qualification", key: "qualification", required:true, width: "120px" },
//   { label: "Date of Birth", key: "dob", required:true, width: "120px" },
//   { label: "Date of Marriage", key: "dom", width: "120px" },
//   { label: "Blood Group", key: "blood_group", width: "130px" },
//   { label: "Mobile No.", key: "mob_no", width: "120px" },
//   { label: "Email ID", key: "email_id", width: "200px" },
//   { label: "Res. Add.", key: "res_add", width: "200px" },
//   { label: "Res. Phone No.", key: "res_phone", width: "120px" },
//   { label: "Involvement in Business", key: "involvement_in_business", width: "180px" },
//   { label: "Since (year)", key: "since", width: "100px" },
//   { label: "Status", key: "status", width: "120px" },
// ];

// export const familyTitle=[
//   { value: "",label: "",},
//   { value: "MR", label: "MR." },
//   { value: "MRS", label: "MRS." },
//   { value: "MISS", label: "MISS.",},
//   { value: "DR", label: "DR." },
//   { value: "BRIG", label: "BRIG.",},
//   { value: "COL", label: "COL." },
//   { value: "OTHER", label: "OTHERS",},
// ]

// // BLOOD GROUP SELECT OPTION
// export const bloodGroupOption=[
//   { value: "",label: "",},
//   { value: "A+", label: "A+" },
//   { value: "A-", label: "A-" },
//   { value: "B+", label: "B+" },
//   { value: "B-", label: "B-" },
//   { value: "O+", label: "O+" },
//   { value: "O-", label: "O-" },
//   { value: "AB+", label: "AB+" },
//   { value: "AB-", label: "AB-" },
// ]

// // MEMBER FAMILY INITIAL DATA TEMPLATE
// export const familyInitialFormDataTemplate = {
//   desigRelation: "",
//   title: "",
//   name: "",
//   qualification: "",
//   dob: "",
//   dom: "",
//   bloodGroup: "",
//   mobileNo: "",
//   emailId: "",
//   resAdd: "",
//   resPhone: "",
//   involmentInBusiness: "",
//   since: "",
//   status: "",
// };

// // MEMBER DIRECTORY INITIAL DATA TEMPLATE
// export const directoryInitialFormDataTemplate = {
//   id: 1,  
//   constitution: "",
//   desigRelation: "",
//   title: "",
//   name: "",
//   qualification: "",
//   dob: "",
//   dom: "",
//   bloodGroup: "",
//   mobileNo: "",
//   emailId: "",
//   resAdd: "",
//   resPhone: "",
//   memberStatus: "",
//   gstin:''
// };

// // UPDATE FORM DATA TEMPLATE/CONFIG
// export const updateFormDataPayloadTemplete = {
//   updatedMemberData:{},
//   updatedDirectory:[],
//   deletedDirectory:[],
//   updatedFamilyDetails:[],
//   newDirectory:[],
//   newFamilyDetails:[],
//   deletedFamilyDetails:[],
// }

// // HELP LIST HEADER/COLUMNS DETAILS  --> DEALER CODE
// export const dealerHelpListHeader= [
//   { label: "Dealer Code", key: "dealer_code" },
//   { label: "Dealer Name", key: "dealership_name" },
//   { label: "Division", key: "dlr_type" },
//   { label: "Location", key: "city" },
// ]

// export const dealerHelpListHeaderOnSerach= [
//   { label: "Dealer Code", key: "dealer_code" },
//   { label: "Dealer Name", key: "dealership_name" },
//   { label: "Division", key: "dlr_type" },
//   { label: "Location", key: "city" },
// ]

// // MEMBER FAMILY DATA TRANSFORM
// export const transformFamilyDetails = (data = []) => {

//     if (Array.isArray(data) && data.length) {
//         return data.map((row, index) => {
//             return {
//                 ...row,
//                 id: index,
//                 desigRelation: row.relation,
//                 bloodGroup: row.blood_group,
//                 mobileNo: row.mobile_no,
//                 emailId: row.email_id,
//                 resAdd: row.res_add_1,
//                 resPhone: row.res_phone,
//                 involmentInBusiness: row.involvement_in_buisness,
//                 since: row.since,
//                 status: row.fam_member_status,
//                 dob: dateFormatter(row.dob),
//                 dom: dateFormatter(row.dom)
//             }
//         })
//     }
//     return;
// };

// // MEMBER DIRECTORY DATA TRANSFORM
// export const transformDirectoryData = (data = []) => {
//     if (Array.isArray(data) && data.length) {
//         return data.map((row) => {
//             return {
//                 ...row,
//                 id: row.individual_sno,
//                 desigRelation: row.designation,
//                 bloodGroup: row.blood_group,
//                 mobileNo: row.mobile_no,
//                 emailId: row.email_id,
//                 resAdd: row.res_add_1,
//                 resPhone: row.res_phone,
//                 memberStatus: row.member_status,
//                 dob: dateFormatter(row.dob),
//                 dom: dateFormatter(row.dom),
//                 familyDetails: transformFamilyDetails(row?.familyDetails)
//             }
//         })
//     };
//     return [];
// };



// export const createSearchPayloadForMember = (masterData) => {
//   let payload = {};

//   // //console.log('masterdata', masterData);

//   let masterKeys = {
//     dealerCode: "dealer_code",
//     membershipNo: "member_no",
//     membershipStatus: "member_status",
//     membershipActive: "member_active",
//     dealershipName:'dlr_name',
//     division:'division',
//     location:'location',
//   };

//   let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
//   // //console.log('hasMasterKeys', hasMasterKeys);

//   if (hasMasterKeys) {
//     Object.keys(masterKeys).forEach((key) => {
//       let value = masterData[key];

//       // Exclude undefined and empty values ("")
//       if (value !== undefined && value !== "") {
//           payload[masterKeys[key]] = value;
//       }
//     });
//   }

//   return payload;
// };



// // export const validateMemberNo = async ({
// //   e,
// //   formData,
// //   setFormData,
// //   formStatus,
// //   isCheckOnSubmit=false,
// // }) => {
 
// //   if(!['Insert'].includes(formStatus)){
// //     return
// //   }
// //   if(isCheckOnSubmit == false){
// //     if(!formData.membershipNo){
// //       toast.error('Member No. cannot be blank')
// //       e.target.focus()
// //       return
// //     }
// //   }
// //   const params = new URLSearchParams({
// //     validate_field: "member_no",
// //     member_no: formData?.membershipNo,
// //   });

// //   try {
// //     const response = await fetch(
// //       `${import.meta.env.VITE_BASE_API_URL}${
// //         APP_PROD_API.VALIDATE_MEMBERSHIP_FORM
// //       }?${params.toString()}`,
// //       { credentials: "include" }
// //     );

// //     const data = await response.json(); // Parse response before using

// //     if (response.ok) {
// //       setFormData({ ...formData });
      
// //     } else {
// //       throw new Error(data?.message || "member_no duplication check validation failed");
// //     }
// //     // return true;
// //     if(isCheckOnSubmit){
// //       return true
// //     }
// //   } catch (error) {
// //     toast.error(error.message || "An error occurred");
// //     setFormData({
// //       ...formData,
// //     });
// //     if(isCheckOnSubmit){
// //       return false
// //     }
    
// //     e.target.focus()
// //     return;
// //   }
// // };




// export const validateMemberNo = async ({
//   e,
//   formData,
//   setFormData,
//   formStatus,
//   isCheckOnSubmit = false,
// }) => {
//   if (!['Insert'].includes(formStatus)) {
//     return;
//   }

//   const membershipNo = formData.membershipNo?.trim();

//   if (!membershipNo) {
//     if (!isCheckOnSubmit) {
//       toast.error("Member No. cannot be blank");
//       e.target.focus();
//     }
//     return false;
//   }

//   // Must match "M" followed by digits
//   if (!/^M\d+$/.test(membershipNo)) {
//     toast.error("Invalid Member No. Format. Use M followed by numbers (e.g., M1234).");
//     e.target.focus();
//     return false;
//   }

//   // Must be at least 5 chars long
//   if (membershipNo.length < 5) {
//     toast.error("Member No. must be at least 5 characters long (e.g., M1234).");
//     e.target.focus();
//     return false;
//   }

//   const params = new URLSearchParams({
//     validate_field: "member_no",
//     member_no: membershipNo,
//   });

//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.VALIDATE_MEMBERSHIP_FORM}?${params.toString()}`,
//       { credentials: "include" }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data?.message || "member_no duplication check validation failed");
//     }

//     setFormData({ ...formData });

//     return isCheckOnSubmit ? true : undefined;
//   } catch (error) {
//     toast.error(error.message || "An error occurred");
//     setFormData({ ...formData });
//     if (!isCheckOnSubmit) {
//       e.target.focus();
//     }
//     return false;
//   }
// };


import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
import { dateFormatter } from "../../../../utils/fn";


// ------------------------- #### MEMBERSHIP DETAIL/ -- HEADER ----------------------------------

export const membershipInitialFormData = {
  member_id: "",
  dealerCode: "",
  membershipNo: "",
  membershipStatus: "",
  membershipActive: false,
  membershipFee: false,
  dealershipActive: false,
  dealershipOperative: false,
  ddNo: "",
  division: "",
  dealershipName: "",
  location: "",
  membershipForm: false,
  ddDate: "",
  alternateEmailId: "",
  gstin: "",
  dealerAppointmentDate: "",
  membershipDate: "",
  boardMeetingAppointmentDate: "",
  boardMeetingCeasationDate: "",
  inoprativeDate: "",
  ceasationDate: "",
  boardMeetingReinstateDate: "",
  tools: false,
  uniform: false,
  promotionalKit: false,
  stationary: false,
  allKitItem: false,
  forFeitureAcc: "",
  memberFeeAmt: "",
  emailId: "",
  fbAccount:"",

};


export const contactModalInitialFormData = {
  city:"",
  distt:"",
  state:"",
  pin:"",
  phone_no:"",
  gstin:"",
  mobile_no:"",
  email_id:"",
  alternate_email_id:"",
  address1:"",
  address2:"",
  address3:"",
  address:"",
  dlr_type:"",
};


export const membershipInitialFormDataForSearch = {
  member_id: "",
  dealerCode: "",
  membershipNo: "",
  membershipStatus: "",
  // membershipActive: false,
  // membershipFee: false,
  // dealershipActive: false,
  // dealershipOperative: false,
  ddNo: "",
  division: "",
  dealershipName: "",
  location: "",
  // membershipForm: false,
  ddDate: "",
  alternateEmailId: "",
  gstin: "",
  dealerAppointmentDate: "",
  membershipDate: "",
  boardMeetingAppointmentDate: "",
  boardMeetingCeasationDate: "",
  inoprativeDate: "",
  ceasationDate: "",
  boardMeetingReinstateDate: "",
  // tools: false,
  // uniform: false,
  // promotionalKit: false,
  // stationary: false,
  // allKitItem: false,
  forFeitureAcc: "",
  memberFeeAmt: "",
  emailId: "",
  fbAccount:""
};

// ------------------------- #### MEMBER DETAIL/ -- DIRECTORY DETAIL -----------------------------

// MEMBER DIRECTORY / MEMBER DETAIL
export const memberDirectoryHeader = [
  { label: "Constitution", key: "constitution", required:true, width: "230px" },
  { label: "Desig/Relation", key: "desig_relation", required:true, width: "150px" },
  { label: "Title", key: "title", required:true, width: "80px" },
  { label: "Name", key: "name", required:true, width: "200px" },
  { label: "Qualification", key: "qualification", required:true, width: "120px" },
  { label: "Date of Birth", key: "dob", required:true, width: "120px" },
  { label: "Date of Marriage", key: "dom", width: "120px" },
  { label: "Blood Group", key: "blood_group", width: "130px" },
  { label: "Mobile No.", key: "mob_no", required:true, width: "120px" },
  { label: "Email ID", key: "email_id", required:true, width: "200px" },
  { label: "Res. Add.", key: "res_add", width: "200px" },
  { label: "Res. Phone No.", key: "res_phone", width: "120px" },
  { label: "Member Status", key: "member_status", width: "180px" },
];

// ------------------------- #### MEMBER FAMILY/ -- FAMILY DETAIL --------------------------------

// MEMBER FAMILY DETAIL
export const familyData = [
  { label: "Desig/Relation", key: "desig_relation", required:true, width: "150px" },
  { label: "Title", key: "title", required:true, width: "80px" },
  { label: "Name", key: "name", required:true, width: "200px" },
  { label: "Qualification", key: "qualification", required:true, width: "120px" },
  { label: "Date of Birth", key: "dob", required:true, width: "120px" },
  { label: "Date of Marriage", key: "dom", width: "120px" },
  { label: "Blood Group", key: "blood_group", width: "130px" },
  { label: "Mobile No.", key: "mob_no", width: "120px" },
  { label: "Email ID", key: "email_id", width: "200px" },
  { label: "Res. Add.", key: "res_add", width: "200px" },
  { label: "Res. Phone No.", key: "res_phone", width: "120px" },
  { label: "Involvement in Business", key: "involvement_in_business", width: "180px" },
  { label: "Since (year)", key: "since", width: "100px" },
  { label: "Status", key: "status", width: "120px" },
];

export const familyTitle=[
  { value: "",label: "",},
  { value: "MR", label: "MR." },
  { value: "MRS", label: "MRS." },
  { value: "MISS", label: "MISS.",},
  { value: "DR", label: "DR." },
  { value: "BRIG", label: "BRIG.",},
  { value: "COL", label: "COL." },
  { value: "OTHER", label: "OTHERS",},
]

// BLOOD GROUP SELECT OPTION
export const bloodGroupOption=[
  { value: "",label: "",},
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
]

// MEMBER FAMILY INITIAL DATA TEMPLATE
export const familyInitialFormDataTemplate = {
  desigRelation: "",
  title: "",
  name: "",
  qualification: "",
  dob: "",
  dom: "",
  bloodGroup: "",
  mobileNo: "",
  emailId: "",
  resAdd: "",
  resPhone: "",
  involmentInBusiness: "",
  since: "",
  status: "",
};

// MEMBER DIRECTORY INITIAL DATA TEMPLATE
export const directoryInitialFormDataTemplate = {
  id: 1,  
  constitution: "",
  desigRelation: "",
  title: "",
  name: "",
  qualification: "",
  dob: "",
  dom: "",
  bloodGroup: "",
  mobileNo: "",
  emailId: "",
  resAdd: "",
  resPhone: "",
  memberStatus: "",
  gstin:''
};

// UPDATE FORM DATA TEMPLATE/CONFIG
export const updateFormDataPayloadTemplete = {
  updatedMemberData:{},
  updatedDirectory:[],
  deletedDirectory:[],
  updatedFamilyDetails:[],
  newDirectory:[],
  newFamilyDetails:[],
  deletedFamilyDetails:[],
}

// HELP LIST HEADER/COLUMNS DETAILS  --> DEALER CODE
export const dealerHelpListHeader= [
  { label: "Dealer Code", key: "dealer_code" },
  { label: "Dealer Name", key: "dealership_name" },
  { label: "Division", key: "dlr_type" },
  { label: "Location", key: "city" },
]

export const dealerHelpListHeaderOnSerach= [
  { label: "Dealer Code", key: "dealer_code" },
  { label: "Dealer Name", key: "dealership_name" },
  { label: "Division", key: "dlr_type" },
  { label: "Location", key: "city" },
]

// MEMBER FAMILY DATA TRANSFORM
export const transformFamilyDetails = (data = []) => {

    if (Array.isArray(data) && data.length) {
        return data.map((row, index) => {
            return {
                ...row,
                id: index,
                desigRelation: row.relation,
                bloodGroup: row.blood_group,
                mobileNo: row.mobile_no,
                emailId: row.email_id,
                resAdd: row.res_add_1,
                resPhone: row.res_phone,
                involmentInBusiness: row.involvement_in_buisness,
                since: row.since,
                status: row.fam_member_status,
                dob: dateFormatter(row.dob),
                dom: dateFormatter(row.dom)
            }
        })
    }
    return;
};

// MEMBER DIRECTORY DATA TRANSFORM
export const transformDirectoryData = (data = []) => {
    if (Array.isArray(data) && data.length) {
        return data.map((row) => {
            return {
                ...row,
                id: row.individual_sno,
                desigRelation: row.designation,
                bloodGroup: row.blood_group,
                mobileNo: row.mobile_no,
                emailId: row.email_id,
                resAdd: row.res_add_1,
                resPhone: row.res_phone,
                memberStatus: row.member_status,
                dob: dateFormatter(row.dob),
                dom: dateFormatter(row.dom),
                familyDetails: transformFamilyDetails(row?.familyDetails)
            }
        })
    };
    return [];
};



export const createSearchPayloadForMember = (masterData) => {
  let payload = {};

  // //console.log('masterdata', masterData);

  let masterKeys = {
    dealerCode: "dealer_code",
    membershipNo: "member_no",
    membershipStatus: "member_status",
    membershipActive: "member_active",
    dealershipName:'dlr_name',
    division:'division',
    location:'location',
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  // //console.log('hasMasterKeys', hasMasterKeys);

  if (hasMasterKeys) {
    Object.keys(masterKeys).forEach((key) => {
      let value = masterData[key];

      // Exclude undefined and empty values ("")
      if (value !== undefined && value !== "") {
          payload[masterKeys[key]] = value;
      }
    });
  }

  return payload;
};



// export const validateMemberNo = async ({
//   e,
//   formData,
//   setFormData,
//   formStatus,
//   isCheckOnSubmit=false,
// }) => {
 
//   if(!['Insert'].includes(formStatus)){
//     return
//   }
//   if(isCheckOnSubmit == false){
//     if(!formData.membershipNo){
//       toast.error('Member No. cannot be blank')
//       e.target.focus()
//       return
//     }
//   }
//   const params = new URLSearchParams({
//     validate_field: "member_no",
//     member_no: formData?.membershipNo,
//   });

//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${
//         APP_PROD_API.VALIDATE_MEMBERSHIP_FORM
//       }?${params.toString()}`,
//       { credentials: "include" }
//     );

//     const data = await response.json(); // Parse response before using

//     if (response.ok) {
//       setFormData({ ...formData });
      
//     } else {
//       throw new Error(data?.message || "member_no duplication check validation failed");
//     }
//     // return true;
//     if(isCheckOnSubmit){
//       return true
//     }
//   } catch (error) {
//     toast.error(error.message || "An error occurred");
//     setFormData({
//       ...formData,
//     });
//     if(isCheckOnSubmit){
//       return false
//     }
    
//     e.target.focus()
//     return;
//   }
// };




export const validateMemberNo = async ({
  e,
  formData,
  setFormData,
  formStatus,
  isCheckOnSubmit = false,
}) => {
  if (!['Insert'].includes(formStatus)) {
    return;
  }

  const membershipNo = formData.membershipNo?.trim();

  if (!membershipNo) {
    if (!isCheckOnSubmit) {
      toast.error("Member No. cannot be blank");
      e.target.focus();
    }
    return false;
  }

  // Must match "M" followed by digits
  if (!/^M\d+$/.test(membershipNo)) {
    toast.error("Invalid Member No. Format. Use M followed by numbers (e.g., M1234).");
    e.target.focus();
    return false;
  }

  // Must be at least 5 chars long
  if (membershipNo.length < 5) {
    toast.error("Member No. must be at least 5 characters long (e.g., M1234).");
    e.target.focus();
    return false;
  }

  const params = new URLSearchParams({
    validate_field: "member_no",
    member_no: membershipNo,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.VALIDATE_MEMBERSHIP_FORM}?${params.toString()}`,
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "member_no duplication check validation failed");
    }

    setFormData({ ...formData });

    return isCheckOnSubmit ? true : undefined;
  } catch (error) {
    toast.error(error.message || "An error occurred");
    setFormData({ ...formData });
    if (!isCheckOnSubmit) {
      e.target.focus();
    }
    return false;
  }
};
