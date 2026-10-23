// import React, { useState, useCallback, useEffect } from "react";
// import { Form, Spinner, TabContent, TabPane } from "reactstrap";
// import FormSetup from "../../../../components/common/formSetup";
// import MembershipDetail from "./membership_header";
// import { useFormStatus } from "../../../../hooks/useFormStatus";
// import { APP_PROD_API } from "../../../../utils/api";
// import {
//   createSearchPayloadForMember,
//   dealerHelpListHeader,
//   directoryInitialFormDataTemplate,
//   familyInitialFormDataTemplate,
//   membershipInitialFormData,
//   membershipInitialFormDataForSearch,
//   transformDirectoryData,
//   updateFormDataPayloadTemplete,
//   validateMemberNo,
// } from "./member_onboard_helper";
// import {
//   dateFormatter,
//   formatDateForInput,
//   validateForm,
// } from "../../../../utils/fn";
// import MemberDirectory from "./membership_directory";
// import { useRecordCount } from "../../../../hooks/useRecordCount";
// import FamilyDetail from "./membership_family";
// import { DateTime } from "luxon";
// import toast from "react-hot-toast";
// import HelpList from "../../../../components/HelpList";

// import { Modal, ModalHeader, ModalBody } from "reactstrap";
// import { formatOptions } from "../../../../lib";
// import { fetchAppData } from "../../../../utils/fetchUtils";
// import { useSelector } from "react-redux";
// import ConfirmationModal from "../../../../components/Modals/confirmationModal";

// const TYPES = {
//   DIRECTORY: "directory",
//   FAMILY: "family",
// };

// const MembershipOnboarding = () => {
//   // HOOKS
//   const {
//     formStatus,
//     setFormStatus,
//     handleOperation,
//     releaseFormStatus,
//     searchQuery,
//     setSearchQuery,
//   } = useFormStatus();
//   const {
//     handleOffset,
//     currentRecordNo,
//     totalRecordCount,
//     setTotalRecordCount,
//     setCurrentRecordNo,
//   } = useRecordCount();

//   // FORM DATA STATE FOR EACH FORM COMPONENT
//   const [formData, setFormData] = useState({});
//   const [memberDirectoryData, setMemberDirectoryData] = useState([
//     //directoryInitialFormDataTemplate,
//   ]);
//   const [familyFormData, setFamilyFormData] = useState([
//     familyInitialFormDataTemplate,
//   ]);

//   const [searchQueryData, setSearchQueryData] = useState({});

//   const [regionalServiceInfoData, setRegionalServiceInfoData] = useState({});

//   const [activeTab, setActiveTab] = useState(1);
//   const [dealerCodeData, setDealerCodeData] = useState([]);
//   const [updateFormPayload, setUpdateFormPayload] = useState({
//     ...updateFormDataPayloadTemplete,
//   });
//   const [selectedDealerCode, setSelectedDealerCode] = useState("");
//   const [showFamilyDetail, setShowFamilyDetail] = useState(-1);
//   const [isDisabledFamilyAddBtn, setIsDisabledFamilyAddBtn] = useState(false);

//   const [loading, setLoading] = useState(true); // loading before form render
//   const [formLoading, setFormLoading] = useState(false); //loading on submit

//   const [confirmationModal, setConfirmationModal] = useState(false);
//   const [confirmationConfig, setConfirmationConfig] = useState({});

//   const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
//   const [helpFor, setHelpFor] = useState("dealers"); //fieldName for helpList you want

//   const [isHelpModelOpen, setIsHelpModelOpen] = useState();
//   const toggleHelpModal = () => setHelpList(!helpList);

//   // DROP DOWN DATA
//   const [constitutions, setConstitutions] = useState([]);
//   const [qualifications, setQualifications] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [familyRelation, setFamilyRelation] = useState([]);
//   const [division, setDivision] = useState([]);

//   const tabs = ["Membership Onboarding"];

//   const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

//   useEffect(() => {
//     const fetchDealerData = async () => {
//       try {
//         setLoading(true);
//         const resp = await fetch(
//           `${import.meta.env.VITE_BASE_API_URL}${
//             APP_PROD_API.GET_DEALER_LIST
//           }?form_status=${formStatus}`,
//           {
//             credentials: "include",
//           }
//         );
//         if (resp.status === 200) {
//           const data = await resp.json();
//           if (data.length) {
//             setDealerCodeData(data);
//           }
//           setLoading(false);
//         }
//       } catch (err) {
//         // console.log(err);
//         setLoading(false);
//       }
//     };

//     // fetchDealerData();

//     const fetchConstantList = async () => {
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_BASE_API_URL}${
//             APP_PROD_API.GET_LIST_OF_CONSTANT
//           }`,
//           {
//             credentials: "include",
//           }
//         );
//         if (response.status === 200) {
//           const data = await response.json();
//           setConstitutions([
//             { value: "", label: "" },
//             ...formatOptions(data.constitutions || [], "code", "description"),
//           ]);
//           setQualifications([
//             { value: "", label: "" },
//             ...formatOptions(data.qualitifcations || [], "code", "description"),
//           ]);
//           setDesignations([
//             { value: "", label: "" },
//             ...formatOptions(data.designations || [], "code", "description"),
//           ]);
//           setFamilyRelation([
//             { value: "", label: "" },
//             ...formatOptions(data.relation || [], "code", "description"),
//           ]);
//           setDivision([
//             { value: "", label: "" },
//             ...formatOptions(data.divisionData || [], "division", "division"),
//           ]);
//         }
//         // setTotalRecordCount(0) // comment it while building search feature
//         setCurrentRecordNo(0);
//       } catch (err) {
//         // console.log(err);
//       }
//     };
//     if (!constitutions.length) {
//       fetchConstantList();
//     }
//     if (!dealerCodeData.length) {
//       fetchDealerData();
//     }
//   }, [formStatus]);

//   const handleHideFamilyDetails = () => {
//     setShowFamilyDetail(-1);
//     setFamilyFormData([]);
//   };

//   useEffect(() => {
//     if (formStatus !== "Insert") {
//       return;
//     }
//     if (selectedDealerCode) {
//       const dealerDetails = dealerCodeData.find(
//         (dealer) => dealer.dealer_code === selectedDealerCode
//       );
//       if (dealerDetails) {
//         setFormData((prev) => ({
//           dealerInoperative: dealerDetails.dlr_inoperative,
//           dealerCode: dealerDetails.dealer_code,
//           division: dealerDetails.dlr_type,
//           dealershipName: dealerDetails.dealership_name,
//           location: dealerDetails.city,
//           alternateEmailId: dealerDetails.alternate_email_id,
//           gstin: dealerDetails.gstin,
//           phoneNo: dealerDetails.phone_no,
//           dealershipStatus: dealerDetails.dlr_status,
//           dealershipActive: dealerDetails.active?.startsWith("Y")
//             ? true
//             : false,
//           dealershipOperative: dealerDetails.operative?.startsWith("Y")
//             ? true
//             : false,
//           dealerAppointmentDate: formatDateForInput(
//             dealerDetails.appointment_date
//           ),
//           inoprativeDate: formatDateForInput(dealerDetails.in_operative_date),
//           // ceasationDate: formatDateForInput(dealerDetails.agr_expiry_date),
//           ceasationDate: formatDateForInput(dealerDetails.ceasation_date),
//           emailId: dealerDetails.email_id,
//           address: dealerDetails.address,
//         }));
//         setRegionalServiceInfoData(dealerDetails);
//       }
//       const fetchMemberData = async () => {
//         const response = await fetch(
//           `${import.meta.env.VITE_BASE_API_URL}${
//             APP_PROD_API.GET_MEMBER_DATA_BY_DEALER_CODE
//           }?dealer_code=${selectedDealerCode}&form_status=${formStatus}`,
//           { credentials: "include" }
//         );
//         const result = await response.json();
//         if (result.type === "found"){
//           const hasDirectory = result?.directory?.length > 0;
//           setFormData((prev) => ({
//             ...prev,
//             member_id: result.memberData.member_id || "",
//             membershipNo: result.memberData.member_no || "",
//             membershipStatus: result.memberData?.member_status || "P",
//             membershipFee: result.memberData.membership_fee == "Y" || false,
//             ddNo: result.memberData.pay_instr_no || "",
//             membershipForm: result.memberData.member_form == "Y" || "",
//             membershipDate: dateFormatter(result.memberData.member_date) || "",
//             boardMeetingCeasationDate:
//               dateFormatter(result.memberData.member_board_cease_date) || "",
//             ddDate: dateFormatter(result.memberData.pay_instr_date) || "",
//             boardMeetingReinstateDate:
//               dateFormatter(result.memberData.member_board_reinstate) || "",
//             membershipActive: result.memberData.member_active == "Y" || false,
//             fbAccount: result.facebook_acc || "",
//           }));

//           setMemberDirectoryData(
//             hasDirectory
//               ? transformDirectoryData(result?.directory)
//               : // : [directoryInitialFormDataTemplate]
//                 []
//           );
//         } else if (result.type === "created") {
//           setFormData((prev) => ({
//             ...prev,
//             membershipNo: result.membership_number,
//           }));
//           // setMemberDirectoryData([directoryInitialFormDataTemplate]);
//         } else if (result.type == "not found") {
//           if (formStatus === "Query" || formStatus === "Update") {
//             toast.error("Member not Found");
//           } else {
//             toast.error("Dealer Not Found");
//           }
//           setFormData(membershipInitialFormData);
//           setFamilyFormData([familyInitialFormDataTemplate]);
//           // setMemberDirectoryData([directoryInitialFormDataTemplate]);
//           setMemberDirectoryData([]);
//         }
//       };
//       fetchMemberData();
//     }
//     handleHideFamilyDetails();
//   }, [selectedDealerCode, dealerCodeData, formStatus]);

//   // show family detail box for directory
//   const handleShowFamilyDetail = (data) => {
//     if (data) {
//       setShowFamilyDetail(data.id);
//       setFamilyFormData(data?.familyDetails || [familyInitialFormDataTemplate]);
//       // Use setTimeout to ensure the DOM has updated before scrolling
//       setTimeout(() => {
//         const element = document.getElementById("familyDetails");
//         if (element) {
//           element.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//       }, 0);
//     }
//   };

//   // Membership head Feild change
//   const handleMembershipDetail = (e, name, value) => {
//     if (!["Insert", "Update", "Search"].includes(formStatus)) {
//       return;
//     }
//     // console.log(name, value);
//     let newVal = value;
//     // console.log(typeof value); // Logs the type of the value

//     if (e?.target?.type === "text") {
//       newVal = value.toUpperCase();
//     }
//     // Check if it's a number input
//     else if (e?.target?.type === "number") {
//       // Check if the value matches the regex (up to 2 decimal places)
//       if (/^\d*\.?\d{0,2}$/.test(value)) {
//         newVal = value;
//       } else {
//         return;
//       }
//     }

//     // Update state with the validated value
//     setFormData((prev) => ({ ...prev, [name]: newVal }));
//     if (formStatus === "Search") {
//       setSearchQueryData((prev) => ({ ...prev, [name]: newVal }));
//     }
//   };

//   // handle change for directory data
//   const handleDirectoryChanges = useCallback(
//     (name, value, index) => {
//       if (!["Insert", "Update", "Search"].includes(formStatus)) {
//         return;
//       }
//       let newVal;
//       if (name != "emailId") {
//         newVal = value.toUpperCase();
//       } else {
//         newVal = value;
//       }
//       setMemberDirectoryData((prevData) => {
//         const newData = [...prevData];
//         newData[index] = {
//           individual_sno: index + 1,
//           ...newData[index],
//           [name]: newVal,
//         };
//         return newData;
//       });
//     },
//     [memberDirectoryData, formData, formStatus]
//   );

//   // handle change for family data
//   const handleFamilyDataChanges = useCallback(
//     (name, value, index) => {
//       if (!["Insert", "Update", "Search"].includes(formStatus)) {
//         return;
//       }

//       let newVal;
//       if (name != "emailId") {
//         newVal = value.toUpperCase();
//       } else {
//         newVal = value;
//       }

//       setFamilyFormData((prevData) => {
//         const newData = [...prevData];
//         newData[index] = {
//           individual_sno: showFamilyDetail,
//           family_member_sno: index + 1,
//           ...newData[index],
//           [name]: newVal,
//         };
//         return newData;
//       });
//     },
//     [showFamilyDetail, memberDirectoryData, formData, formStatus]
//   );

//   // add directory or family row
//   const handleAddRow = useCallback(
//     (type) => {
//       if (type === TYPES.DIRECTORY) {
//         setMemberDirectoryData((prevData) => [
//           ...prevData,
//           { ...directoryInitialFormDataTemplate, id: prevData.length + 1 },
//         ]);
//       } else if (type === TYPES.FAMILY) {
//         setFamilyFormData((prevData) => [
//           ...prevData,
//           { ...familyInitialFormDataTemplate },
//         ]);
//       }
//     },
//     [memberDirectoryData, familyFormData]
//   );

//   // delete directory or family row
//   const handleDeleteRow = useCallback((type, index) => {
//     if (type === TYPES.DIRECTORY) {
//       setMemberDirectoryData((prevData) =>
//         prevData.filter((_, rowIndex) => rowIndex !== index)
//       );
//     } else if (type === TYPES.FAMILY) {
//       setFamilyFormData((prevData) =>
//         prevData.filter((_, rowIndex) => rowIndex !== index)
//       );
//     }
//   }, []);

//   // Delete on Update formStatus
//   async function deleteRecordInUpdate(data) {
//     if (data?.directory) {
//       setUpdateFormPayload((prev) => {
//         return {
//           ...prev,
//           deletedDirectory: [...prev.deletedDirectory, data.directory],
//         };
//       });
//     }

//     if (data?.familyData) {
//       setUpdateFormPayload((prev) => {
//         return {
//           ...prev,
//           deletedFamilyDetails: [...prev.deletedFamilyDetails, data.familyData],
//         };
//       });
//     }
//   }

//   const handleHelpList = (data) => {
//     setHelpList(data);
//   };
//   const onSelectHelpItem = (data) => {
//     if (formStatus == "Search") {
//       setFormData((prev) => ({
//         ...prev,
//         dealerCode: data?.dealer_code,
//         dealershipName: data?.dealership_name,
//         division: data?.dlr_type,
//       }));
//       setSearchQueryData((prev) => ({
//         ...prev,
//         dealerCode: data?.dealer_code,
//         dealershipName: data?.dealership_name,
//         division: data?.dlr_type,
//       }));
//       return;
//     }
//     // console.log(data);
//     setSelectedDealerCode(data.dealer_code);
//   };

//   // get Dealer Data when user write itself
//   const handleDealerCodeField = (data) => {
//     if (data === "" && formStatus) {
//       toast.error("Please Enter/Fill the Dealer Code");
//     }
//     setSelectedDealerCode(data);
//   };

//   // save family details for the directory
//   const handleSave = (id) => {
//     const entryToSave = memberDirectoryData.find((entry) => entry.id === id);
//     entryToSave.familyDetails = familyFormData;
//   };

//   const updateActiveTab = useCallback((tab) => {
//     setActiveTab(tab);
//   }, []);

//   // Form submission logic
//   const handleSubmit = async (e) => {
//     console.log('update formstatus')
//     e.preventDefault();

//     if(!formData?.membershipNo){
//       toast.error('Member No. cannot be blank')
//       return
//     }
   
//     if(formStatus === 'Insert'){
//       //check memberNo existence
//       const isValidMember = await validateMemberNo({e:{targe:{value:formData.membershipNo}},
//         formData, setFormData, formStatus, isCheckOnSubmit:true})
  
//       if(!isValidMember){
//         return
//       }

//     }


//     try {
//       setFormLoading(true);
//       const isValidMemershipForm = validateForm(
//         "membership-form-v1",
//         "Membership Form"
//       );
//       if (!isValidMemershipForm) {
//         return;
//       }

//       // form validations
//       if (formData.dealerAppointmentDate && formData.membershipDate) {
//         const dt1 = DateTime.fromISO(formData.membershipDate, {
//           zone: "Asia/Kolkata",
//         });
//         const dt2 = DateTime.fromISO(formData.dealerAppointmentDate, {
//           zone: "Asia/Kolkata",
//         });

//         // if (!(dt1 >= dt2)) {
//         //   throw new Error(
//         //     "Membership date should be greater than Dealer Appointment Date"
//         //   );
//         // }
//       }
//       const currentDate = Date.now();
//       const membershipDate = new Date(formData.membershipDate).getTime();

//       if (membershipDate > currentDate && formStatus == "Insert") {
//         throw new Error(
//           "Membership date should not be greater than Current Date"
//         );
//       }

//       //boardMeetingAppointmentDate
//       const bordMeetApntDt = new Date(
//         formData.boardMeetingAppointmentDate
//       ).getTime();

//       // commented this check as per shail said on 18.08.2025 meeting  and also error
//       // if(bordMeetApntDt > membershipDate){
//       //  throw new Error("Board Meeting Appointment Date cannot be prior then Membership Date");
//       // }

//       if (formData.dealerAppointmentDate && formData.ddDate) {
//         const dt1 = DateTime.fromISO(formData.ddDate, { zone: "Asia/Kolkata" });
//         const dt2 = DateTime.fromISO(formData.dealerAppointmentDate, {
//           zone: "Asia/Kolkata",
//         });
//         // commented this check as per shail said on 18.08.2025 meeting  and also error
//         // if (!(dt1 > dt2)) {
//         //   throw new Error("DD date should be greater than Dealer Appointment Date");
//         // }
//       }

//       //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT MEMBERSHIP DETAIL DATA WE COMMENTED IT AS PER SAID BY JSB SIR
//       //  end of form validations

//       if (memberDirectoryData.length) {
//         const isValidForm = validateForm(
//           "member-directory-form-v1",
//           "Member Directory"
//         );
//         if (!isValidForm) {
//           return;
//         }
//       }

//       //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT FAMILY DATA WE COMMENTED IT AS PER SAID BY JSB SIR
//       // const isFamilyDetailsValid = memberDirectoryData.every(
//       //   (dir) =>
//       //     Array.isArray(dir.familyDetails) && dir.familyDetails.length > 0
//       // );

//       // if (!isFamilyDetailsValid) {
//       //   throw new Error(
//       //     "Each directory entry must have at least one family detail."
//       //   );
//       // }

//       //  if(showFamilyDetail > -1){
//       //    const isValidMemberFmlyForm = validateForm("family-form-v1", "Membership Family Form");
//       //    if (!isValidMemberFmlyForm) {
//       //      return;
//       //    }
//       //  }

//       // logic to manage the memberShip Status
//       let formDataPayload = { ...formData };
//       let currentMemberShipStatus = "P";
//       const {
//         membershipFee,
//         membershipForm,
//         tools,
//         uniform,
//         promotionalKit,
//         stationary,
//         allKitItem,
//       } = formData;
//       if (membershipFee && membershipForm) {
//         if (tools || uniform || promotionalKit || stationary || allKitItem) {
//           //  formDataPayload.membershipStatus = "C";
//           currentMemberShipStatus = "C";
//         }
//       }
//       // If any of Criteria fail then update membership status
//       currentMemberShipStatus === "C"
//         ? (formDataPayload.membershipStatus = "C")
//         : (formDataPayload.membershipStatus = "P");

//       // execute submit logic and hit the API
//       let formPayload = {};
//       if (formStatus === "Insert") {
//         formPayload = {
//           membership: formDataPayload,
//           directory: memberDirectoryData,
//           user: {
//             trans_year: user?.global_fin_year,
//             division_id: user?.global_division_id,
//           },
//         };
//       }

//       // for updating member form
//       if (formStatus === "Update") {
//         const memberDirData = [...memberDirectoryData];
//         let newDirectoryAdded = memberDirData.filter(
//           (data) => !data.hasOwnProperty("create_date")
//         );
//         let updateFormPayloadData = {
//           ...updateFormPayload,
//           newDirectory: newDirectoryAdded,
//         };

//         formPayload = {
//           member_id: formDataPayload.member_id,
//           member_no: formDataPayload.membershipNo,
//           ...updateFormPayloadData,
//           updatedMemberData: formDataPayload,
//             user: {
//             trans_year: user?.global_fin_year,
//             division_id: user?.global_division_id,
//           },
//         };

//         // console.log("update form formpayload :", formPayload);


//       }

//       const response = await fetch(
//         `${import.meta.env.VITE_BASE_API_URL}${
//           APP_PROD_API.POST_MEMBERSHIP_DETAIL
//         }?form_status=${formStatus}`,
//         {
//           method: "POST",
//           body: JSON.stringify(formPayload),
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );

//       if (!response.ok) {
//         const result = await response.json();
//         throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
//       }
//       toast.success(
//         `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`
//       );
//       if (formStatus == "Insert") {
//         const result = await response.json();
//         showGeneratedMemberNo(result?.new_member_no);
//       }

//       formCleanup();
//     } catch (error) {
//       toast.error(
//         error?.message ||
//           "Please check all the form fields or contact administrator"
//       );
//       return;
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   // Update Logic
//   async function updateMemberForm(data) {
//     // console.log("updated: ", data);

//     // Handle directory data
//     if (data.hasOwnProperty("directory")) {
//       // let familyDetails = [...data.directory.familyDetails]
//       delete data?.directory?.familyDetails; // Remove familyDetails if it exists
//       setUpdateFormPayload((prev) => {
//         const { individual_sno, member_id } = data?.directory;
//         let updatedDirectory = [...prev?.updatedDirectory];
//         let newDirectory = [...prev.newDirectory];

//         // Check if an object with matching individual_sno exists
//         const index = updatedDirectory.findIndex(
//           (dir) => dir.individual_sno === individual_sno
//         );

//         if (index !== -1) {
//           // If a match is found, remove the existing object
//           updatedDirectory.splice(index, 1);
//         }

//         // Add/push the new data.directory object if member_id exists
//         if (member_id) {
//           // data.directory.familyDetails = familyDetails;
//           updatedDirectory.push(data.directory);
//         } else {
//           // If member_id is missing, push the directory to a separate array (newDirectory)

//           newDirectory = [...prev.newDirectory];
//           const index = newDirectory.findIndex(
//             (dir) => dir.individual_sno === individual_sno
//           );
//           if (index !== -1) {
//             // If a match is found, remove the existing object
//             newDirectory.splice(index, 1);
//           }
//           newDirectory.push(data.directory);
//         }
//         return { ...prev, updatedDirectory, newDirectory };
//       });
//     }

//     // handle family data
//     if (data.hasOwnProperty("familyData")) {
//       let familyData = { ...data.familyData }; // Clone the incoming familyData

//       setUpdateFormPayload((prev) => {
//         let updatedFamilyDetails = [...prev.updatedFamilyDetails]; // Clone the previous family details

//         // Check if an object with matching individual_sno and family_member_sno exists
//         const index = updatedFamilyDetails.findIndex(
//           (fam) =>
//             fam.individual_sno === familyData.individual_sno &&
//             fam.family_member_sno === familyData.family_member_sno
//         );

//         if (index !== -1) {
//           // Remove the existing object if a match is found
//           updatedFamilyDetails.splice(index, 1);
//         }
//         // Push the new familyData (whether replacing or adding)
//         updatedFamilyDetails.push(familyData);

//         return { ...prev, updatedFamilyDetails };
//       });
//     }

//     // Handle familyDataList (future implementation)
//     if (data.hasOwnProperty("familyDataList")) {
//       // Clone the incoming familyDataList
//       let familyDetails = [...data.familyDataList];

//       // Filter out elements where 'member_id' is not present
//       let newFamilyData = familyDetails.filter(
//         (family) => !family.hasOwnProperty("member_id")
//       );

//       setUpdateFormPayload((prev) => {
//         let newFamilyDetails = [...prev.newFamilyDetails]; // Clone previous newFamilyDetails

//         // Iterate through each element in newFamilyData
//         newFamilyData.forEach((family) => {
//           // Check if an object with matching individual_sno and family_member_sno exists in newFamilyDetails
//           const index = newFamilyDetails.findIndex(
//             (fam) =>
//               fam.individual_sno === family.individual_sno &&
//               fam.family_member_sno === family.family_member_sno
//           );

//           if (index !== -1) {
//             // If a match is found, remove the existing object
//             newFamilyDetails.splice(index, 1);
//           }

//           // Push the new family data (whether replacing or adding)
//           newFamilyDetails.push(family);
//         });

//         // Update the form payload with the new family details
//         return { ...prev, newFamilyDetails };
//       });
//     }
//   }

//   const formCleanup = async () => {
//     setFormData({ ...membershipInitialFormData });
//     // setMemberDirectoryData([directoryInitialFormDataTemplate]);
//     setMemberDirectoryData([]);
//     setFamilyFormData([familyInitialFormDataTemplate]);
//     if (formStatus !== "Insert") {
//       setFormStatus("");
//     }
//     setSelectedDealerCode("");
//     setRegionalServiceInfoData({});
//     setSearchQueryData({});
//   };

//   const handleCancel = useCallback(() => {
//     formCleanup();
//     releaseFormStatus();
//   }, []);

//   const setupQueryData = useCallback(
//     (queryData, btnClicked) => {
//       // console.log("Data from memberForm on query", queryData);
//       setFamilyFormData([familyInitialFormDataTemplate]);
//       setShowFamilyDetail(-1);
//       let dealerDetails = queryData.dealerData;
//       if (queryData.type === "found") {
//         setRegionalServiceInfoData(dealerDetails);
//         setSelectedDealerCode(queryData?.dealerData?.dealer_code);
//         const hasDirectory = queryData?.directory?.length > 0;
//         setFormData((prev) => ({
//           ...prev,
//           dealerInoperative: dealerDetails.dlr_inoperative,
//           dealerCode: dealerDetails.dealer_code,
//           division: dealerDetails.dlr_type,
//           dealershipName: dealerDetails.dealership_name,
//           location: dealerDetails.city,
//           alternateEmailId: dealerDetails.alternate_email_id,
//           gstin: dealerDetails.gstin,
//           phoneNo: dealerDetails.phone_no,
//           dealerAppointmentDate: formatDateForInput(
//             dealerDetails.appointment_date
//           ),
//           inoprativeDate: formatDateForInput(dealerDetails.in_operative_date),
//           ceasationDate: formatDateForInput(dealerDetails.ceasation_date),
//           emailId: dealerDetails.email_id,
//           member_id: queryData.membershipData.member_id || "",
//           membershipNo: queryData.membershipData.member_no || "",
//           membershipStatus: queryData.membershipData?.member_status || "P",
//           membershipFee:
//             queryData.membershipData.membership_fee == "Y" || false,
//           ddNo: queryData.membershipData.pay_instr_no || "",
//           membershipForm: queryData.membershipData.member_form == "Y" || false,
//           membershipDate:
//             dateFormatter(queryData.membershipData.member_date) || "",
//           boardMeetingCeasationDate:
//             dateFormatter(queryData.membershipData.member_board_cease_date) ||
//             "",
//           ddDate: dateFormatter(queryData.membershipData.pay_instr_date) || "",
//           boardMeetingAppointmentDate:
//             dateFormatter(queryData.membershipData.member_board_appnt_date) ||
//             "",
//           boardMeetingReinstateDate:
//             dateFormatter(queryData.membershipData.member_board_reinstate) ||
//             "",
//           tools: queryData.membershipData.start_kit_tool == "Y" || false,
//           uniform: queryData.membershipData.start_kit_uniform == "Y" || false,
//           promotionalKit:
//             queryData.membershipData.start_kit_promotion == "Y" || false,
//           stationary:
//             queryData.membershipData.start_kit_stationery == "Y" || false,
//           allKitItem: queryData.membershipData.start_kit_all == "Y" || false,
//           membershipActive:
//             queryData.membershipData.member_active == "Y" || false,
//           // dealershipActive: dealerDetails.active == "Yes" ? true : false,
//           // dealershipOperative: dealerDetails.operative == "Yes" ? true : false,
//           dealershipActive: dealerDetails.active?.startsWith("Y")
//             ? true
//             : false,
//           dealershipOperative: dealerDetails.operative?.startsWith("Y")
//             ? true
//             : false,
//           memberFeeAmt: queryData.membershipData.member_fee_amount || "",
//           fbAccount: queryData.membershipData.facebook_acc,
//           address: dealerDetails?.address,
//           forFeitureAcc : queryData.membershipData.forfeiture_amount
//         }));

//         setMemberDirectoryData(
//           hasDirectory ? transformDirectoryData(queryData?.directory) : []
//           // : [directoryInitialFormDataTemplate]
//         );
//       }
//       // if(btnClicked === 'Query'){
//       //   setTotalRecordCount(queryData?.count)
//       // }
//       if (queryData?.type === "found" && queryData?.count) {
//         setTotalRecordCount(queryData?.count || 0);
//       }
//       setLoading(true);
//     },
//     [formStatus, currentRecordNo]
//   );

//   // console.log('formStatus from memberform', formStatus)
//   const handleSearch = async () => {
//     try {
//       setTotalRecordCount(0);
//       setCurrentRecordNo(0);
//       // console.log(formData);
//       const searchPayload = createSearchPayloadForMember(searchQueryData);
//       const queryList = new URLSearchParams(searchPayload);

//       if ([...queryList].length === 0) {
//         toast.error("Please enter search criteria");
//         return;
//       }

//       setSearchQuery(searchPayload);

//       const data = await fetchAppData(
//         `${APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}?formStatus=${formStatus}&${queryList}`
//       );

//       if (data?.count === 0) {
//         toast.error("No matching data record found");
//         return;
//       }

//       setupQueryData(data, "Query");
//       handleOperation("Query");
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error(error?.message || "Some error occurred");
//     }
//   };

//   const onSuccessConfirmation = useCallback(
//     (confirm, member_no) => {
//       if (confirm && member_no) {
//         // console.log("generated member no is :", member_no);
//       }
//       setConfirmationConfig({});
//       setConfirmationModal(false);
//     },
//     [formData]
//   );

//   const showGeneratedMemberNo = useCallback((member_no) => {
//     setConfirmationConfig({
//       title: "Member No. generated",
//       description: `New member no generated is ${member_no}`,
//       uniqKey: "member_no",
//     });
//     setConfirmationModal(true);
//   }, []);

//   return (
//     <FormSetup
//       navType="tabs"
//       activeTab={activeTab}
//       tabs={tabs}
//       updateActiveTab={updateActiveTab}
//       formStatus={formStatus}
//       currentRecordNo={currentRecordNo}
//       totalRecordCount={totalRecordCount}
//       pageCount={1}
//       totalPageCount={1}
//       isSingleQuery={true}
//       setupQueryData={setupQueryData}
//       handleSubmit={handleSubmit}
//       handleCancel={handleCancel}
//       handleOperation={handleOperation}
//       handleOffset={handleOffset}
//       QUERY_API={APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}
//       formName={"Membership Onboarding"}
//       setSearchQuery={setSearchQuery}
//       handleSearch={handleSearch}
//       formPayload={{ searchQuery }}
//     >
//       <TabContent activeTab={activeTab}>
//         <TabPane tabId={1}>
//           <MembershipDetail
//             formData={formData}
//             handleChange={handleMembershipDetail}
//             handleDealerCodeField={handleDealerCodeField}
//             formStatus={formStatus}
//             updateMemberForm={updateMemberForm}
//             dealerCodeData={dealerCodeData}
//             division={division}
//             handleHelpList={handleHelpList}
//             regionalInfo={regionalServiceInfoData}
//             setFormData={setFormData}
//           />
//           <MemberDirectory
//             formData={memberDirectoryData}
//             handleChange={handleDirectoryChanges}
//             handleAddRow={() => handleAddRow(TYPES.DIRECTORY)}
//             handleDeleteRow={(index) => handleDeleteRow(TYPES.DIRECTORY, index)}
//             constitutions={constitutions}
//             qualifications={qualifications}
//             designations={designations}
//             handleShowFamilyDetail={handleShowFamilyDetail}
//             formStatus={formStatus}
//             updateMemberForm={updateMemberForm}
//             selectedDealerCode={selectedDealerCode}
//             deleteRecordInUpdate={deleteRecordInUpdate}
//           />
//           <div id="familyDetails">
//             {showFamilyDetail > -1 && (
//               <FamilyDetail
//                 rowIndex={showFamilyDetail}
//                 formData={familyFormData}
//                 handleChange={handleFamilyDataChanges}
//                 qualifications={qualifications}
//                 familyRelation={familyRelation}
//                 handleAddRow={() => handleAddRow(TYPES.FAMILY)}
//                 handleDeleteRow={(index) => handleDeleteRow(TYPES.FAMILY, index)}
//                 handleSave={handleSave}
//                 handleCloseOperation={handleHideFamilyDetails}
//                 setIsDisabledFamilyAddBtn={setIsDisabledFamilyAddBtn}
//                 formStatus={formStatus}
//                 updateMemberForm={updateMemberForm}
//                 deleteRecordInUpdate={deleteRecordInUpdate}
//               />
//             )}
//           </div>
//           {helpList && (
//             <Modal
//               id="help-list-modal"
//               isOpen={helpList}
//               toggle={toggleHelpModal}
//               size="xl"
//             >
//               <ModalHeader toggle={toggleHelpModal}></ModalHeader>
//               <ModalBody>
//                 <HelpList
//                   formStatus={formStatus}
//                   helpFor={helpFor}
//                   apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
//                     APP_PROD_API.GET_DATA_FOR_MEMBER_FORM
//                   }`}
//                   helpListHeader={dealerHelpListHeader}
//                   handleHelpList={handleHelpList}
//                   onSelectHelpItem={onSelectHelpItem}
//                 />
//               </ModalBody>
//             </Modal>
//           )}

//           {confirmationModal && (
//             <ConfirmationModal
//               isOpen={confirmationModal}
//               onClose={() => {
//                 onSuccessConfirmation(false, confirmationConfig);
//                 setConfirmationModal(false);
//               }}
//               {...confirmationConfig}
//               onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
//             />
//           )}
//         </TabPane>
//       </TabContent>
//     </FormSetup>
//   );
// };

// export default MembershipOnboarding;




import React, { useState, useCallback, useEffect } from "react";
import { Form, Spinner, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import MembershipDetail from "./membership_header";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import {
  contactModalInitialFormData,
  createSearchPayloadForMember,
  dealerHelpListHeader,
  directoryInitialFormDataTemplate,
  familyInitialFormDataTemplate,
  membershipInitialFormData,
  membershipInitialFormDataForSearch,
  transformDirectoryData,
  updateFormDataPayloadTemplete,
  validateMemberNo,
} from "./member_onboard_helper";
import {
  dateFormatter,
  formatDateForInput,
  validateForm,
} from "../../../../utils/fn";
import MemberDirectory from "./membership_directory";
import { useRecordCount } from "../../../../hooks/useRecordCount";
import FamilyDetail from "./membership_family";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";

import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formatOptions } from "../../../../lib";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useSelector } from "react-redux";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

const TYPES = {
  DIRECTORY: "directory",
  FAMILY: "family",
};

const MembershipOnboarding = () => {
  // HOOKS
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const {
    handleOffset,
    currentRecordNo,
    totalRecordCount,
    setTotalRecordCount,
    setCurrentRecordNo,
  } = useRecordCount();

  // FORM DATA STATE FOR EACH FORM COMPONENT
  const [formData, setFormData] = useState({});
  const [memberDirectoryData, setMemberDirectoryData] = useState([
    //directoryInitialFormDataTemplate,
  ]);
  const [familyFormData, setFamilyFormData] = useState([
    familyInitialFormDataTemplate,
  ]);

  const [searchQueryData, setSearchQueryData] = useState({});

  const [regionalServiceInfoData, setRegionalServiceInfoData] = useState({});
  const [contactInfoData, setContactInfoData] = useState({});


  const [activeTab, setActiveTab] = useState(1);
  const [dealerCodeData, setDealerCodeData] = useState([]);
  const [updateFormPayload, setUpdateFormPayload] = useState({
    ...updateFormDataPayloadTemplete,
  });
  const [selectedDealerCode, setSelectedDealerCode] = useState("");
  const [showFamilyDetail, setShowFamilyDetail] = useState(-1);
  const [isDisabledFamilyAddBtn, setIsDisabledFamilyAddBtn] = useState(false);

  const [loading, setLoading] = useState(true); // loading before form render
  const [formLoading, setFormLoading] = useState(false); //loading on submit

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState("dealers"); //fieldName for helpList you want

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  // DROP DOWN DATA
  const [constitutions, setConstitutions] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [familyRelation, setFamilyRelation] = useState([]);
  const [division, setDivision] = useState([]);
  const [dlrType, setDlrType] = useState([]);

  const tabs = ["Membership Onboarding"];

  const { user } = useSelector((state) => state.auth); // ADDED BY AMIT FOR GLOABL DATA

  useEffect(() => {
    const fetchDealerData = async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_DEALER_LIST
          }?form_status=${formStatus}`,
          {
            credentials: "include",
          }
        );
        if (resp.status === 200) {
          const data = await resp.json();
          if (data.length) {
            setDealerCodeData(data);
          }
          setLoading(false);
        }
      } catch (err) {
        // console.log(err);
        setLoading(false);
      }
    };

    // fetchDealerData();

    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_LIST_OF_CONSTANT
          }`,
          {
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setConstitutions([
            { value: "", label: "" },
            ...formatOptions(data.constitutions || [], "code", "description"),
          ]);
          setQualifications([
            { value: "", label: "" },
            ...formatOptions(data.qualitifcations || [], "code", "description"),
          ]);
          setDesignations([
            { value: "", label: "" },
            ...formatOptions(data.designations || [], "code", "description"),
          ]);
          setFamilyRelation([
            { value: "", label: "" },
            ...formatOptions(data.relation || [], "code", "description"),
          ]);
          setDivision([
            { value: "", label: "" },
            ...formatOptions(data.divisionData || [], "division", "division"),
          ]);
          setDlrType([
            { value: "", label: "" },
            ...formatOptions(data.dlrTypeData || [], "dlr_type", "description"),
          ]);
        }
        // setTotalRecordCount(0) // comment it while building search feature
        setCurrentRecordNo(0);
      } catch (err) {
        // console.log(err);
      }
    };
    if (!constitutions.length) {
      fetchConstantList();
    }
    if (!dealerCodeData.length) {
      fetchDealerData();
    }
  }, [formStatus]);

  const handleHideFamilyDetails = () => {
    setShowFamilyDetail(-1);
    setFamilyFormData([]);
  };

  useEffect(() => {
    if (formStatus !== "Insert") {
      return;
    }
    if (selectedDealerCode) {
      const dealerDetails = dealerCodeData.find(
        (dealer) => dealer.dealer_code === selectedDealerCode
      );
      if (dealerDetails) {
        setFormData((prev) => ({
          dealerInoperative: dealerDetails.dlr_inoperative,
          dealerCode: dealerDetails.dealer_code,
          division: dealerDetails.dlr_type,
          dealershipName: dealerDetails.dealership_name,
          location: dealerDetails.city,
          alternateEmailId: dealerDetails.alternate_email_id,
          gstin: dealerDetails.gstin,
          phoneNo: dealerDetails.phone_no,
          dealershipStatus: dealerDetails.dlr_status,
          dealershipActive: dealerDetails.active?.startsWith("Y")
            ? true
            : false,
          dealershipOperative: dealerDetails.operative?.startsWith("Y")
            ? true
            : false,
          dealerAppointmentDate: formatDateForInput(
            dealerDetails.appointment_date
          ),
          inoprativeDate: formatDateForInput(dealerDetails.in_operative_date),
          // ceasationDate: formatDateForInput(dealerDetails.agr_expiry_date),
          ceasationDate: formatDateForInput(dealerDetails.ceasation_date),
          emailId: dealerDetails.email_id,
          address: dealerDetails.address,
         
        }));
        setRegionalServiceInfoData(dealerDetails);
         setContactInfoData({
          city: dealerDetails.city || "",
          distt: dealerDetails.distt || "",
          state: dealerDetails.state || "",
          pin: dealerDetails.pin || "",
          phone_no: dealerDetails.phone_no || "",
          mobile_no: dealerDetails.mobile_no || "",
          email_id: dealerDetails.email_id || "",
          alternate_email_id: dealerDetails.alternate_email_id || "",
          gstin: dealerDetails.gstin || "",
          address1: dealerDetails.address1 || "",
          address2: dealerDetails.address2 || "",
          address3: dealerDetails.address3 || "",
          address: dealerDetails.address || "",
          dlr_type: dealerDetails.dlr_type || "",
        });
      }
      const fetchMemberData = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_MEMBER_DATA_BY_DEALER_CODE
          }?dealer_code=${selectedDealerCode}&form_status=${formStatus}`,
          { credentials: "include" }
        );
        const result = await response.json();
        if (result.type === "found"){
          const hasDirectory = result?.directory?.length > 0;
          setFormData((prev) => ({
            ...prev,
            member_id: result.memberData.member_id || "",
            membershipNo: result.memberData.member_no || "",
            membershipStatus: result.memberData?.member_status || "P",
            membershipFee: result.memberData.membership_fee == "Y" || false,
            ddNo: result.memberData.pay_instr_no || "",
            membershipForm: result.memberData.member_form == "Y" || "",
            membershipDate: dateFormatter(result.memberData.member_date) || "",
            boardMeetingCeasationDate:
              dateFormatter(result.memberData.member_board_cease_date) || "",
            ddDate: dateFormatter(result.memberData.pay_instr_date) || "",
            boardMeetingReinstateDate:
              dateFormatter(result.memberData.member_board_reinstate) || "",
            membershipActive: result.memberData.member_active == "Y" || false,
            fbAccount: result.facebook_acc || "",
          }));

          setMemberDirectoryData(
            hasDirectory
              ? transformDirectoryData(result?.directory)
              : // : [directoryInitialFormDataTemplate]
                []
          );
        } else if (result.type === "created") {
          setFormData((prev) => ({
            ...prev,
            membershipNo: result.membership_number,
          }));
          // setMemberDirectoryData([directoryInitialFormDataTemplate]);
        } else if (result.type == "not found") {
          if (formStatus === "Query" || formStatus === "Update") {
            toast.error("Member not Found");
          } else {
            toast.error("Dealer Not Found");
          }
          setFormData(membershipInitialFormData);
          setFamilyFormData([familyInitialFormDataTemplate]);
          // setMemberDirectoryData([directoryInitialFormDataTemplate]);
          setMemberDirectoryData([]);
        }
      };
      fetchMemberData();
    }
    handleHideFamilyDetails();
  }, [selectedDealerCode, dealerCodeData, formStatus]);

  // show family detail box for directory
  const handleShowFamilyDetail = (data) => {
    if (data) {
      setShowFamilyDetail(data.id);
      setFamilyFormData(data?.familyDetails || [familyInitialFormDataTemplate]);
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        const element = document.getElementById("familyDetails");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    }
  };

  // Membership head Feild change
  const handleMembershipDetail = (e, name, value) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }
    // console.log(name, value);
    let newVal = value;
    // console.log(typeof value); // Logs the type of the value

    const lowerCaseFields = ["email_id", "alternate_email_id"];

if (e?.target?.type === "text") {
  newVal = lowerCaseFields.includes(name)
    ? value
    : value.toUpperCase();
}

    // Check if it's a number input
    else if (e?.target?.type === "number") {
      // Check if the value matches the regex (up to 2 decimal places)
      if (/^\d*\.?\d{0,2}$/.test(value)) {
        newVal = value;
      } else {
        return;
      }
    }

    // Update state with the validated value
    setFormData((prev) => ({ ...prev, [name]: newVal }));
    if (formStatus === "Search") {
      setSearchQueryData((prev) => ({ ...prev, [name]: newVal }));
    }

   
  };

 const handleContactInfoChange = (e, name, value) => {
  if (!["Insert", "Update", "Search"].includes(formStatus)) {
    return;
  }

  let newVal = value;

  const lowerCaseFields = ["email_id", "alternate_email_id"];

  if (e?.target?.type === "text") {
    newVal = lowerCaseFields.includes(name)
      ? value
      : value.toUpperCase();
  }

  setContactInfoData((prev) => ({
    ...prev,
    [name]: newVal,
  }));
   
    setFormData((prev) => ({
  ...prev,

  ...(name === "gstin" && { gstin: newVal }),
  ...(name === "email_id" && { emailId: newVal }),
  ...(name === "alternate_email_id" && { alternateEmailId: newVal }),
  ...(name === "phone_no" && { phoneNo: newVal }),
  ...(name === "city" && { location: newVal }),
  ...(name === "address" && { address: newVal }),
  ...(name === "dlr_type" && { division: newVal }),
}));

};

  // handle change for directory data
  const handleDirectoryChanges = useCallback(
    (name, value, index) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }
      let newVal;
      if (name != "emailId") {
        newVal = value.toUpperCase();
      } else {
        newVal = value;
      }
      setMemberDirectoryData((prevData) => {
        const newData = [...prevData];
        newData[index] = {
          individual_sno: index + 1,
          ...newData[index],
          [name]: newVal,
        };
        return newData;
      });
    },
    [memberDirectoryData, formData, formStatus]
  );

  // handle change for family data
  const handleFamilyDataChanges = useCallback(
    (name, value, index) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      let newVal;
      if (name != "emailId") {
        newVal = value.toUpperCase();
      } else {
        newVal = value;
      }

      setFamilyFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = {
          individual_sno: showFamilyDetail,
          family_member_sno: index + 1,
          ...newData[index],
          [name]: newVal,
        };
        return newData;
      });
    },
    [showFamilyDetail, memberDirectoryData, formData, formStatus]
  );

  // add directory or family row
  const handleAddRow = useCallback(
    (type) => {
      if (type === TYPES.DIRECTORY) {
        setMemberDirectoryData((prevData) => [
          ...prevData,
          { ...directoryInitialFormDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.FAMILY) {
        setFamilyFormData((prevData) => [
          ...prevData,
          { ...familyInitialFormDataTemplate },
        ]);
      }
    },
    [memberDirectoryData, familyFormData]
  );

  // delete directory or family row
  const handleDeleteRow = useCallback((type, index) => {
    if (type === TYPES.DIRECTORY) {
      setMemberDirectoryData((prevData) =>
        prevData.filter((_, rowIndex) => rowIndex !== index)
      );
    } else if (type === TYPES.FAMILY) {
      setFamilyFormData((prevData) =>
        prevData.filter((_, rowIndex) => rowIndex !== index)
      );
    }
  }, []);

  // Delete on Update formStatus
  async function deleteRecordInUpdate(data) {
    if (data?.directory) {
      setUpdateFormPayload((prev) => {
        return {
          ...prev,
          deletedDirectory: [...prev.deletedDirectory, data.directory],
        };
      });
    }

    if (data?.familyData) {
      setUpdateFormPayload((prev) => {
        return {
          ...prev,
          deletedFamilyDetails: [...prev.deletedFamilyDetails, data.familyData],
        };
      });
    }
  }

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    if (formStatus == "Search") {
      setFormData((prev) => ({
        ...prev,
        dealerCode: data?.dealer_code,
        dealershipName: data?.dealership_name,
        division: data?.dlr_type,
      }));
      setSearchQueryData((prev) => ({
        ...prev,
        dealerCode: data?.dealer_code,
        dealershipName: data?.dealership_name,
        division: data?.dlr_type,
      }));
      return;
    }
    // console.log(data);
    setSelectedDealerCode(data.dealer_code);
  };

  // get Dealer Data when user write itself
  const handleDealerCodeField = (data) => {
    if (data === "" && formStatus) {
      toast.error("Please Enter/Fill the Dealer Code");
    }
    setSelectedDealerCode(data);
  };

  // save family details for the directory
  const handleSave = (id) => {
    const entryToSave = memberDirectoryData.find((entry) => entry.id === id);
    entryToSave.familyDetails = familyFormData;
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Form submission logic
  const handleSubmit = async (e) => {
    console.log('update formstatus')
    e.preventDefault();

    if(!formData?.membershipNo){
      toast.error('Member No. cannot be blank')
      return
    }
   
    if(formStatus === 'Insert'){
      //check memberNo existence
      const isValidMember = await validateMemberNo({e:{targe:{value:formData.membershipNo}},
        formData, setFormData, formStatus, isCheckOnSubmit:true})
  
      if(!isValidMember){
        return
      }

    }


    try {
      setFormLoading(true);
      const isValidMemershipForm = validateForm(
        "membership-form-v1",
        "Membership Form"
      );
      if (!isValidMemershipForm) {
        return;
      }

      // form validations
      if (formData.dealerAppointmentDate && formData.membershipDate) {
        const dt1 = DateTime.fromISO(formData.membershipDate, {
          zone: "Asia/Kolkata",
        });
        const dt2 = DateTime.fromISO(formData.dealerAppointmentDate, {
          zone: "Asia/Kolkata",
        });

        // if (!(dt1 >= dt2)) {
        //   throw new Error(
        //     "Membership date should be greater than Dealer Appointment Date"
        //   );
        // }
      }
      const currentDate = Date.now();
      const membershipDate = new Date(formData.membershipDate).getTime();

      if (membershipDate > currentDate && formStatus == "Insert") {
        throw new Error(
          "Membership date should not be greater than Current Date"
        );
      }

      //boardMeetingAppointmentDate
      const bordMeetApntDt = new Date(
        formData.boardMeetingAppointmentDate
      ).getTime();

      // commented this check as per shail said on 18.08.2025 meeting  and also error
      // if(bordMeetApntDt > membershipDate){
      //  throw new Error("Board Meeting Appointment Date cannot be prior then Membership Date");
      // }

      if (formData.dealerAppointmentDate && formData.ddDate) {
        const dt1 = DateTime.fromISO(formData.ddDate, { zone: "Asia/Kolkata" });
        const dt2 = DateTime.fromISO(formData.dealerAppointmentDate, {
          zone: "Asia/Kolkata",
        });
        // commented this check as per shail said on 18.08.2025 meeting  and also error
        // if (!(dt1 > dt2)) {
        //   throw new Error("DD date should be greater than Dealer Appointment Date");
        // }
      }

      //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT MEMBERSHIP DETAIL DATA WE COMMENTED IT AS PER SAID BY JSB SIR
      //  end of form validations

      if (memberDirectoryData.length) {
        const isValidForm = validateForm(
          "member-directory-form-v1",
          "Member Directory"
        );
        if (!isValidForm) {
          return;
        }
      }

      //TODO  AS ON 26.05.2025 SINCE THEY HAVE NOT FAMILY DATA WE COMMENTED IT AS PER SAID BY JSB SIR
      // const isFamilyDetailsValid = memberDirectoryData.every(
      //   (dir) =>
      //     Array.isArray(dir.familyDetails) && dir.familyDetails.length > 0
      // );

      // if (!isFamilyDetailsValid) {
      //   throw new Error(
      //     "Each directory entry must have at least one family detail."
      //   );
      // }

      //  if(showFamilyDetail > -1){
      //    const isValidMemberFmlyForm = validateForm("family-form-v1", "Membership Family Form");
      //    if (!isValidMemberFmlyForm) {
      //      return;
      //    }
      //  }

      // logic to manage the memberShip Status
      let formDataPayload = { ...formData };
      let currentMemberShipStatus = "P";
      const {
        membershipFee,
        membershipForm,
        tools,
        uniform,
        promotionalKit,
        stationary,
        allKitItem,
      } = formData;
      if (membershipFee && membershipForm) {
        if (tools || uniform || promotionalKit || stationary || allKitItem) {
          //  formDataPayload.membershipStatus = "C";
          currentMemberShipStatus = "C";
        }
      }
      // If any of Criteria fail then update membership status
      currentMemberShipStatus === "C"
        ? (formDataPayload.membershipStatus = "C")
        : (formDataPayload.membershipStatus = "P");

      // execute submit logic and hit the API
      let formPayload = {};
      if (formStatus === "Insert") {
        formPayload = {
          membership: formDataPayload,
          contactInfo: contactInfoData,
          directory: memberDirectoryData,
          user: {
            trans_year: user?.global_fin_year,
            division_id: user?.global_division_id,
          },
        };
      }

      // for updating member form
      if (formStatus === "Update") {
        const memberDirData = [...memberDirectoryData];
        let newDirectoryAdded = memberDirData.filter(
          (data) => !data.hasOwnProperty("create_date")
        );
        let updateFormPayloadData = {
          ...updateFormPayload,
          newDirectory: newDirectoryAdded,
        };

        formPayload = {
          member_id: formDataPayload.member_id,
          member_no: formDataPayload.membershipNo,
          ...updateFormPayloadData,
          updatedMemberData: formDataPayload,
          updatedContactInfo: contactInfoData,
        };

        // console.log("update form formpayload :", formPayload);


      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_MEMBERSHIP_DETAIL
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
      }
      toast.success(
        `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`
      );
      if (formStatus == "Insert") {
        const result = await response.json();
        showGeneratedMemberNo(result?.new_member_no);
      }

      formCleanup();
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator"
      );
      return;
    } finally {
      setFormLoading(false);
    }
  };

  // Update Logic
  async function updateMemberForm(data) {
    // console.log("updated: ", data);

    // Handle directory data
    if (data.hasOwnProperty("directory")) {
      // let familyDetails = [...data.directory.familyDetails]
      delete data?.directory?.familyDetails; // Remove familyDetails if it exists
      setUpdateFormPayload((prev) => {
        const { individual_sno, member_id } = data?.directory;
        let updatedDirectory = [...prev?.updatedDirectory];
        let newDirectory = [...prev.newDirectory];

        // Check if an object with matching individual_sno exists
        const index = updatedDirectory.findIndex(
          (dir) => dir.individual_sno === individual_sno
        );

        if (index !== -1) {
          // If a match is found, remove the existing object
          updatedDirectory.splice(index, 1);
        }

        // Add/push the new data.directory object if member_id exists
        if (member_id) {
          // data.directory.familyDetails = familyDetails;
          updatedDirectory.push(data.directory);
        } else {
          // If member_id is missing, push the directory to a separate array (newDirectory)

          newDirectory = [...prev.newDirectory];
          const index = newDirectory.findIndex(
            (dir) => dir.individual_sno === individual_sno
          );
          if (index !== -1) {
            // If a match is found, remove the existing object
            newDirectory.splice(index, 1);
          }
          newDirectory.push(data.directory);
        }
        return { ...prev, updatedDirectory, newDirectory };
      });
    }

    // handle family data
    if (data.hasOwnProperty("familyData")) {
      let familyData = { ...data.familyData }; // Clone the incoming familyData

      setUpdateFormPayload((prev) => {
        let updatedFamilyDetails = [...prev.updatedFamilyDetails]; // Clone the previous family details

        // Check if an object with matching individual_sno and family_member_sno exists
        const index = updatedFamilyDetails.findIndex(
          (fam) =>
            fam.individual_sno === familyData.individual_sno &&
            fam.family_member_sno === familyData.family_member_sno
        );

        if (index !== -1) {
          // Remove the existing object if a match is found
          updatedFamilyDetails.splice(index, 1);
        }
        // Push the new familyData (whether replacing or adding)
        updatedFamilyDetails.push(familyData);

        return { ...prev, updatedFamilyDetails };
      });
    }

    // Handle familyDataList (future implementation)
    if (data.hasOwnProperty("familyDataList")) {
      // Clone the incoming familyDataList
      let familyDetails = [...data.familyDataList];

      // Filter out elements where 'member_id' is not present
      let newFamilyData = familyDetails.filter(
        (family) => !family.hasOwnProperty("member_id")
      );

      setUpdateFormPayload((prev) => {
        let newFamilyDetails = [...prev.newFamilyDetails]; // Clone previous newFamilyDetails

        // Iterate through each element in newFamilyData
        newFamilyData.forEach((family) => {
          // Check if an object with matching individual_sno and family_member_sno exists in newFamilyDetails
          const index = newFamilyDetails.findIndex(
            (fam) =>
              fam.individual_sno === family.individual_sno &&
              fam.family_member_sno === family.family_member_sno
          );

          if (index !== -1) {
            // If a match is found, remove the existing object
            newFamilyDetails.splice(index, 1);
          }

          // Push the new family data (whether replacing or adding)
          newFamilyDetails.push(family);
        });

        // Update the form payload with the new family details
        return { ...prev, newFamilyDetails };
      });
    }
  }

  const formCleanup = async () => {
    setFormData({ ...membershipInitialFormData });
    // setMemberDirectoryData([directoryInitialFormDataTemplate]);
    setMemberDirectoryData([]);
    setFamilyFormData([familyInitialFormDataTemplate]);
    if (formStatus !== "Insert") {
      setFormStatus("");
    }
    setSelectedDealerCode("");
    setRegionalServiceInfoData({});
    setContactInfoData({...contactModalInitialFormData});
    setSearchQueryData({});
  };

  const handleCancel = useCallback(() => {
    formCleanup();
    releaseFormStatus();
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // console.log("Data from memberForm on query", queryData);
      setFamilyFormData([familyInitialFormDataTemplate]);
      setShowFamilyDetail(-1);
      let dealerDetails = queryData.dealerData;
      if (queryData.type === "found") {
        setRegionalServiceInfoData(dealerDetails);

      setContactInfoData({
  ...contactModalInitialFormData,
  city: dealerDetails.city,
  distt: dealerDetails.distt,
  state: dealerDetails.state,
  pin: dealerDetails.pin,
  phone_no: dealerDetails.phone_no,
  mobile_no: dealerDetails.mobile_no,
  email_id: dealerDetails.email_id,
  alternate_email_id: dealerDetails.alternate_email_id,
  address1: dealerDetails.address1,
  address2: dealerDetails.address2,
  address3: dealerDetails.address3,
  gstin: dealerDetails.gstin,
  address: dealerDetails.address,
   dlr_type: dealerDetails.dlr_type,
});

        setSelectedDealerCode(queryData?.dealerData?.dealer_code);
        const hasDirectory = queryData?.directory?.length > 0;
        setFormData((prev) => ({
          ...prev,
          dealerInoperative: dealerDetails.dlr_inoperative,
          dealerCode: dealerDetails.dealer_code,
          division: dealerDetails.dlr_type,
          dealershipName: dealerDetails.dealership_name,
          location: dealerDetails.city,
          alternateEmailId: dealerDetails.alternate_email_id,
          gstin: dealerDetails.gstin,
          phoneNo: dealerDetails.phone_no,
          dealerAppointmentDate: formatDateForInput(
            dealerDetails.appointment_date
          ),
          inoprativeDate: formatDateForInput(dealerDetails.in_operative_date),
          ceasationDate: formatDateForInput(dealerDetails.ceasation_date),
          emailId: dealerDetails.email_id,
          member_id: queryData.membershipData.member_id || "",
          membershipNo: queryData.membershipData.member_no || "",
          membershipStatus: queryData.membershipData?.member_status || "P",
          membershipFee:
            queryData.membershipData.membership_fee == "Y" || false,
          ddNo: queryData.membershipData.pay_instr_no || "",
          membershipForm: queryData.membershipData.member_form == "Y" || false,
          membershipDate:
            dateFormatter(queryData.membershipData.member_date) || "",
          boardMeetingCeasationDate:
            dateFormatter(queryData.membershipData.member_board_cease_date) ||
            "",
          ddDate: dateFormatter(queryData.membershipData.pay_instr_date) || "",
          boardMeetingAppointmentDate:
            dateFormatter(queryData.membershipData.member_board_appnt_date) ||
            "",
          boardMeetingReinstateDate:
            dateFormatter(queryData.membershipData.member_board_reinstate) ||
            "",
          tools: queryData.membershipData.start_kit_tool == "Y" || false,
          uniform: queryData.membershipData.start_kit_uniform == "Y" || false,
          promotionalKit:
            queryData.membershipData.start_kit_promotion == "Y" || false,
          stationary:
            queryData.membershipData.start_kit_stationery == "Y" || false,
          allKitItem: queryData.membershipData.start_kit_all == "Y" || false,
          membershipActive:
            queryData.membershipData.member_active == "Y" || false,
          // dealershipActive: dealerDetails.active == "Yes" ? true : false,
          // dealershipOperative: dealerDetails.operative == "Yes" ? true : false,
          dealershipActive: dealerDetails.active?.startsWith("Y")
            ? true
            : false,
          dealershipOperative: dealerDetails.operative?.startsWith("Y")
            ? true
            : false,
          memberFeeAmt: queryData.membershipData.member_fee_amount || "",
          fbAccount: queryData.membershipData.facebook_acc,
          address: dealerDetails?.address,
          forFeitureAcc : queryData.membershipData.forfeiture_amount
        }));

        setMemberDirectoryData(
          hasDirectory ? transformDirectoryData(queryData?.directory) : []
          // : [directoryInitialFormDataTemplate]
        );
      }
      // if(btnClicked === 'Query'){
      //   setTotalRecordCount(queryData?.count)
      // }
      if (queryData?.type === "found" && queryData?.count) {
        setTotalRecordCount(queryData?.count || 0);
      }
      setLoading(true);
    },
    [formStatus, currentRecordNo]
  );

  // console.log('formStatus from memberform', formStatus)
  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      // console.log(formData);
      const searchPayload = createSearchPayloadForMember(searchQueryData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}?formStatus=${formStatus}&${queryList}`
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        return;
      }

      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  const onSuccessConfirmation = useCallback(
    (confirm, member_no) => {
      if (confirm && member_no) {
        // console.log("generated member no is :", member_no);
      }
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formData]
  );

  const showGeneratedMemberNo = useCallback((member_no) => {
    setConfirmationConfig({
      title: "Member No. generated",
      description: `New member no generated is ${member_no}`,
      uniqKey: "member_no",
    });
    setConfirmationModal(true);
  }, []);

  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={tabs}
      updateActiveTab={updateActiveTab}
      formStatus={formStatus}
      currentRecordNo={currentRecordNo}
      totalRecordCount={totalRecordCount}
      pageCount={1}
      totalPageCount={1}
      isSingleQuery={true}
      setupQueryData={setupQueryData}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      handleOperation={handleOperation}
      handleOffset={handleOffset}
      QUERY_API={APP_PROD_API.GET_DATA_FOR_MEMBER_FORM}
      formName={"Membership Onboarding"}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <MembershipDetail
            formData={formData}
            handleChange={handleMembershipDetail}
            handleDealerCodeField={handleDealerCodeField}
            formStatus={formStatus}
            updateMemberForm={updateMemberForm}
            dealerCodeData={dealerCodeData}
            division={division}
            handleHelpList={handleHelpList}
            regionalInfo={regionalServiceInfoData}
            setFormData={setFormData}
            contactData={contactInfoData}
            handleContactInfoChange={handleContactInfoChange}
            dlrType={dlrType}
          />
          <MemberDirectory
            formData={memberDirectoryData}
            handleChange={handleDirectoryChanges}
            handleAddRow={() => handleAddRow(TYPES.DIRECTORY)}
            handleDeleteRow={(index) => handleDeleteRow(TYPES.DIRECTORY, index)}
            constitutions={constitutions}
            qualifications={qualifications}
            designations={designations}
            handleShowFamilyDetail={handleShowFamilyDetail}
            formStatus={formStatus}
            updateMemberForm={updateMemberForm}
            selectedDealerCode={selectedDealerCode}
            deleteRecordInUpdate={deleteRecordInUpdate}
          />
          <div id="familyDetails">
            {showFamilyDetail > -1 && (
              <FamilyDetail
                rowIndex={showFamilyDetail}
                formData={familyFormData}
                handleChange={handleFamilyDataChanges}
                qualifications={qualifications}
                familyRelation={familyRelation}
                handleAddRow={() => handleAddRow(TYPES.FAMILY)}
                handleDeleteRow={(index) => handleDeleteRow(TYPES.FAMILY, index)}
                handleSave={handleSave}
                handleCloseOperation={handleHideFamilyDetails}
                setIsDisabledFamilyAddBtn={setIsDisabledFamilyAddBtn}
                formStatus={formStatus}
                updateMemberForm={updateMemberForm}
                deleteRecordInUpdate={deleteRecordInUpdate}
              />
            )}
          </div>
          {helpList && (
            <Modal
              id="help-list-modal"
              isOpen={helpList}
              toggle={toggleHelpModal}
              size="xl"
            >
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.GET_DATA_FOR_MEMBER_FORM
                  }`}
                  helpListHeader={dealerHelpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                />
              </ModalBody>
            </Modal>
          )}

          {confirmationModal && (
            <ConfirmationModal
              isOpen={confirmationModal}
              onClose={() => {
                onSuccessConfirmation(false, confirmationConfig);
                setConfirmationModal(false);
              }}
              {...confirmationConfig}
              onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
            />
          )}
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default MembershipOnboarding;
