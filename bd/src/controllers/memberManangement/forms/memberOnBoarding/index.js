// const { db } = require("../../../../config/dbConnection");
// const catchAsync = require("../../../../utility/catchAsync");
// const {
//   replaceKeysWithTemplate,
//   transformDirectoryPayload,
//   generateSingleInsertQuery,
//   cleanObject,
//   convertStringsToBooleans,
//   buildSearchQuery,
// } = require("../../../../utility/query");



// const TABLE_NAMES = {
//   DEALER_TABLE: "moeddealer",
//   CONSTITUTION_TABLE: "moed_constitution",
//   QUALIFICATION_TABLE: "moed_qualification",
//   DESIGNATION_TABLE: "moed_designation",
//   MEMBER_TABLE: "moedmember",
//   MEMBER_DIRECTORY_TABLE: "mdedmember_dtl",
//   MEMBER_FAMILY_TABLE: "mdedmember_dtl_family",
//   GEN_NEW_MEMBER_NO: "genmembershipno()",
//   GET_MEMBER_ID_BY_SEQUENCE: "nextval('s_moedmember_member_id')",
// };

// const generateMemberNumber = async () => {
//   const query = await db.query(`select ${TABLE_NAMES.GEN_NEW_MEMBER_NO}`);
//   // console.log(query?.rows);
//   return query?.rows[0].genmembershipno;
// };

// // make by amit on dt 24.09.2025 as per sahil said to mannually allotting member no on meeting 23.09.2025 and approved by PM & JSB
// const checkIsMemberExist= async (req, res)=>{
//   const {member_no} = req?.query
//   try {
//     if(!member_no){
//       throw new Error('Member No cannot be blank')
//     }

//     const checkMemberExistence = await db.query('select * from moedmember where member_no = $1',[member_no])

//     if(checkMemberExistence.rowCount > 0){
//       throw new Error(`Member already exist with the Member No. ${member_no}`)
//     }

//     res.status(200).json({type:'success', data:{member_no:member_no}})    
//   } catch (error) {
//     return res.status(500).json({type:'error', message:error.message || 'Internal Server Error'})
//   }
// }

// exports.getDealerList = catchAsync(async (req, res, next) => {
//   let queryparams = req?.query?.form_status;
//   // console.log('formstatus on get dealercode', queryparams)
//   if (queryparams === "Insert") {
//     const dealerList = await db.query(
//       `           select *
//             from ${TABLE_NAMES.DEALER_TABLE} d
//             where not exists (
//                 select 1 
//                 from ${TABLE_NAMES.MEMBER_TABLE} m 
//                 where m.dealer_code = d.dealer_code
//                 )
//             order by d.dealer_code`
//     );
//     return res.status(200).send(dealerList.rows);
//   } else if (queryparams === "Query" || queryparams === "Update") {
//     const dealerList = await db.query(
//       `select *
//             from ${TABLE_NAMES.DEALER_TABLE} d
//             where exists (
//                 select 1 
//                 from ${TABLE_NAMES.MEMBER_TABLE} m 
//                 where m.dealer_code = d.dealer_code
//                 )
//             order by d.dealer_code`
//     );
//     return res.status(200).send(dealerList.rows);
//   } else if (queryparams === "" || queryparams === "Search") {
//     return res.status(200).send([]);
//   }
// });

// exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
//   const constitutionList = await db.query(
//     `select * from mommcode where cat_group = $1`,
//     ["MEMCT"]
//   );
//   const qualitifcationList = await db.query(
//     `SELECT * FROM mommcode where cat_group = $1`,
//     ["QLFGRP"]
//   );
//   const designationList = await db.query(
//     `SELECT * FROM mommcode WHERE CAT_GROUP = $1`,
//     ["EMPDSG"]
//   );
//   const childRelationList = await db.query(
//     `SELECT * FROM mommcode WHERE CAT_GROUP = $1`,
//     ["RELATN"]
//   );
//   const divisionLIst = await db.query(
//     `SELECT DISTINCT division FROM moedmember WHERE division IS NOT NULL`
//   );
//   return res.status(200).json({
//     constitutions: constitutionList.rows || [],
//     qualitifcations: qualitifcationList.rows || [],
//     designations: designationList.rows || [],
//     relation: childRelationList.rows || [],
//     divisionData: divisionLIst.rows || [],
//   });
// });

// exports.fetchMembershipDetailsByDealerCode = catchAsync(
//   async (req, res, next) => {
//     if (!req.query.dealer_code) {
//       return next("dealer_code required");
//     }
//     let searchQuery;
//     let response = {};
//     if (req?.query?.form_status === "Insert") {
//       // searchQuery = `SELECT * from ${TABLE_NAMES.DEALER_TABLE} where dealer_code = $1 limit 1`
//       searchQuery = `SELECT * 
//             FROM ${TABLE_NAMES.DEALER_TABLE}
//             WHERE dealer_code = $1 
//             AND NOT EXISTS (
//                 SELECT 1 
//                 FROM ${TABLE_NAMES.MEMBER_TABLE} 
//                 WHERE dealer_code = $1
//             )
//             LIMIT 1;`;
//     } else if (req?.query?.form_status === "Query") {
//       searchQuery = `SELECT * from ${TABLE_NAMES.MEMBER_TABLE} where dealer_code = $1 limit 1`;
//     } else if (
//       req?.query?.form_status === null ||
//       req?.query?.form_status === undefined
//     ) {
//       res.send({ type: "not found" });
//     }

//     const memberDataResponse = await db.query(searchQuery, [
//       req?.query?.dealer_code,
//     ]);
//     if (memberDataResponse?.rowCount == 0) {
//       response = {
//         type: "not found",
//       };
//     } else {
//       let memberData = memberDataResponse.rows?.[0];
//       const memberDirectoryData = await db.query(
//         `SELECT * from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_no = $1 order by individual_sno`,
//         [memberData?.member_no]
//       );
//       const memberFamilyData = await db.query(
//         `SELECT * from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_no = $1 order by family_member_sno`,
//         [memberData.member_no]
//       );

//       const transformedData = transformDirectoryPayload(
//         memberDirectoryData.rows,
//         memberFamilyData.rows
//       );
//       response = {
//         type: "found",
//         memberData,
//         directory: transformedData || [],
//       };
//     }
//     return res.send(response);
//   }
// );

// const transformMembershipData = (mNo = "", data) => {
//   const {
//     member_id,
//     dealerCode,
//     membershipNo,
//     membershipStatus,
//     membershipFee,
//     ddNo,
//     division,
//     dealershipName,
//     location,
//     membershipForm,
//     ddDate,
//     alternateEmailId,
//     gstin,
//     // dealershipStatus,  // i have commented it for insert
//     dealerAppointmentDate,
//     membershipDate,
//     boardMeetingAppointmentDate,
//     boardMeetingCeasationDate,
//     inoprativeDate,
//     ceasationDate,
//     boardMeetingReinstateDate,
//     dealerInoperative,
//     dealerEmail,
//     others,
//     dealershipActive,
//     tools,
//     uniform,
//     promotionalKit,
//     stationary,
//     allKitItem,
//     forFeitureAcc,
//     memberFeeAmt,
//     membershipActive,
//   } = data;

//   return {
//     member_id: member_id,
//     member_no: mNo,
//     division: division,
//     member_status: membershipStatus,
//     dlr_name: dealershipName,
//     member_active: membershipStatus,
//     dlr_gstin: gstin,
//     dlr_email: dealerEmail,
//     dlr_alt_email: alternateEmailId,
//     member_date: membershipDate,
//     member_board_appnt_date: boardMeetingAppointmentDate,
//     member_board_cease_date: boardMeetingCeasationDate,
//     member_board_reinstate: boardMeetingReinstateDate,
//     // dlr_status: dealershipStatus,
//     // dlr_active: dealershipActive, //?'Y':'N',
//     // dlr_inoperative: dealerInoperative, //?'Y':'N',
//     // membership_fee: membershipFee, // ? "Y" : "N",
//     // member_form: membershipForm, // ? "Y" : "N",
//     // pay_instr_no: ddNo, //,
//     // pay_instr_date: ddDate, //,
//     // dealer_code: dealerCode, //,
//     // start_kit_tool: tools, //? "Y" : "N",
//     // start_kit_uniform: uniform, //? "Y" : "N",
//     // start_kit_promotion: promotionalKit, //? "Y" : "N",
//     // start_kit_stationery: stationary, //? "Y" : "N",
//     // start_kit_all: allKitItem, //? "Y" : "N",
//     // member_fee_amount:memberFeeAmt, //,
//     // forfeiture_amount:forFeitureAcc, //? "Y" : "N",
//     // member_active:membershipActive, //?"Y":'N'
//     dlr_active: dealershipActive ? "Y" : "N",
//     dlr_inoperative: dealerInoperative ? "Y" : "N",
//     membership_fee: membershipFee ? "Y" : "N",
//     member_form: membershipForm ? "Y" : "N",
//     pay_instr_no: ddNo,
//     pay_instr_date: ddDate,
//     dealer_code: dealerCode,
//     start_kit_tool: tools ? "Y" : "N",
//     start_kit_uniform: uniform ? "Y" : "N",
//     start_kit_promotion: promotionalKit ? "Y" : "N",
//     start_kit_stationery: stationary ? "Y" : "N",
//     start_kit_all: allKitItem ? "Y" : "N",
//     member_fee_amount: memberFeeAmt,
//     forfeiture_amount: Number(forFeitureAcc)|| 0,
//     member_active: membershipActive ? "Y" : "N",
//   };
// };

// const transformMembershipDataSearch = (data) => {
//   const {
//     member_id,
//     dealerCode,
//     membershipNo,
//     membershipStatus,
//     membershipFee,
//     ddNo,
//     division,
//     dealershipName,
//     location,
//     membershipForm,
//     ddDate,
//     alternateEmailId,
//     gstin,
//     // dealershipStatus,  // i have commented it for insert
//     dealerAppointmentDate,
//     membershipDate,
//     boardMeetingAppointmentDate,
//     boardMeetingCeasationDate,
//     inoprativeDate,
//     ceasationDate,
//     boardMeetingReinstateDate,
//     dealerInoperative,
//     dealerEmail,
//     others,
//     dealershipActive,
//     tools,
//     uniform,
//     promotionalKit,
//     stationary,
//     allKitItem,
//     forFeitureAcc,
//     memberFeeAmt,
//     membershipActive,
//   } = data;

//   return {
//     member_id: member_id,
//     member_no: membershipNo,
//     division: division,
//     member_status: membershipStatus,
//     dlr_name: dealershipName,
//     member_active: membershipStatus,
//     dlr_gstin: gstin,
//     dlr_email: dealerEmail,
//     dlr_alt_email: alternateEmailId,
//     member_date: membershipDate,
//     member_board_appnt_date: boardMeetingAppointmentDate,
//     member_board_cease_date: boardMeetingCeasationDate,
//     member_board_reinstate: boardMeetingReinstateDate,
//     // dlr_status: dealershipStatus,
//     dlr_active: dealershipActive, //?'Y':'N',
//     dlr_inoperative: dealerInoperative, //?'Y':'N',
//     membership_fee: membershipFee, // ? "Y" : "N",
//     member_form: membershipForm, // ? "Y" : "N",
//     pay_instr_no: ddNo, //,
//     pay_instr_date: ddDate, //,
//     dealer_code: dealerCode, //,
//     start_kit_tool: tools, //? "Y" : "N",
//     start_kit_uniform: uniform, //? "Y" : "N",
//     start_kit_promotion: promotionalKit, //? "Y" : "N",
//     start_kit_stationery: stationary, //? "Y" : "N",
//     start_kit_all: allKitItem, //? "Y" : "N",
//     member_fee_amount: memberFeeAmt, //,
//     forfeiture_amount: forFeitureAcc, //? "Y" : "N",
//     member_active: membershipActive, //?"Y":'N'
//     // dlr_active: dealershipActive?'Y':'N',
//     // dlr_inoperative: dealerInoperative?'Y':'N',
//     // membership_fee: membershipFee ? "Y" : "N",
//     // member_form: membershipForm ? "Y" : "N",
//     // pay_instr_no: ddNo,
//     // pay_instr_date: ddDate,
//     // dealer_code: dealerCode,
//     // start_kit_tool: tools? "Y" : "N",
//     // start_kit_uniform: uniform? "Y" : "N",
//     // start_kit_promotion: promotionalKit? "Y" : "N",
//     // start_kit_stationery: stationary? "Y" : "N",
//     // start_kit_all: allKitItem? "Y" : "N",
//     // member_fee_amount:memberFeeAmt,
//     // forfeiture_amount:forFeitureAcc? "Y" : "N",
//     // member_active:membershipActive?"Y":'N'
//   };
// };

// const transformDirectoryData = (memberRow = {}, data = []) => {
//   let directoryTemplate = {
//     constitution: "constitution",
//     desigRelation: "designation",
//     title: "title",
//     name: "name",
//     qualification: "qualification",
//     dob: "dob",
//     dom: "dom",
//     bloodGroup: "blood_group",
//     mobileNo: "mobile_no",
//     emailId: "email_id",
//     resAdd: "res_add_1",
//     resPhone: "res_phone",
//     memberStatus: "member_status",
//   };

//   let directory = [];
//   if (Array.isArray(data) && data.length) {
//     directory = data.map((row, index) => {
//       let obj = {
//         member_no: memberRow.member_no,
//         member_id: memberRow.member_id,
//         ...replaceKeysWithTemplate(row, directoryTemplate),
//       };
//       let { id, familyDetails, ...params } = obj;
//       return params;
//     });
//   }

//   return { directory };
// };

// const transformSingleDirectoryData = (data) => {
//   let {
//     individual_sno,
//     constitution,
//     desigRelation,
//     title,
//     name,
//     qualification,
//     dob,
//     dom,
//     bloodGroup,
//     mobileNo,
//     emailId,
//     resAdd,
//     resPhone,
//     memberStatus,
//   } = data;

//   return {
//     individual_sno,
//     constitution: constitution,
//     designation: desigRelation,
//     title: title,
//     name: name,
//     qualification: qualification,
//     dob: dob,
//     dom: dom,
//     blood_group: bloodGroup,
//     mobile_no: mobileNo,
//     email_id: emailId,
//     res_add_1: resAdd,
//     res_phone: resPhone,
//     member_status: memberStatus,
//   };
// };

// const transformSingleFamilyData = (data) => {
//   let {
//     individual_sno,
//     family_member_sno,
//     desigRelation,
//     title,
//     name,
//     qualification,
//     dob,
//     dom,
//     bloodGroup,
//     mobileNo,
//     emailId,
//     resAdd,
//     resPhone,
//     involmentInBusiness,
//     since,
//     status,
//   } = data;

//   return {
//     individual_sno: individual_sno,
//     family_member_sno: family_member_sno,
//     relation: desigRelation,
//     title: title,
//     name: name,
//     qualification: qualification,
//     dob: dob,
//     dom: dom,
//     blood_group: bloodGroup,
//     mobile_no: mobileNo,
//     email_id: emailId,
//     res_add_1: resAdd,
//     res_phone: resPhone,
//     involvement_in_buisness: involmentInBusiness,
//     since: since,
//     fam_member_status: status,
//   };
// };

// const transformFamilyData = (
//   memberRow = {},
//   directoryRows = [],
//   directory = []
// ) => {
//   let template = {
//     member_id: "member_id",
//     member_no: "member_no",
//     individual_sno: "individual_sno",
//     family_member_sno: "family_member_sno",
//     desigRelation: "relation",
//     title: "title",
//     name: "name",
//     qualification: "qualification",
//     dob: "dob",
//     dom: "dom",
//     bloodGroup: "blood_group",
//     mobileNo: "mobile_no",
//     emailId: "email_id",
//     resAdd: "res_add_1",
//     resPhone: "res_phone",
//     involmentInBusiness: "involvement_in_buisness",
//     since: "since",
//     status: "fam_member_status",
//   };

//   let familyRows = [];
//   if (Array.isArray(directory) && directory.length) {
//     directory.forEach((row, index) => {
//       if (
//         row?.familyDetails &&
//         Array.isArray(row?.familyDetails) &&
//         row?.familyDetails?.length
//       ) {
//         row.familyDetails.forEach((family, famIndex) => {
//           let obj = {
//             // individual_sno: directoryRows[index]?.individual_sno,
//             individual_sno: row?.individual_sno,
//             member_no: memberRow?.member_no,
//             member_id: memberRow.member_id,
//             ...replaceKeysWithTemplate(family, template),
//           };
//           let { ...data } = obj;
//           familyRows.push(data);
//         });
//       }
//     });
//   }
//   return familyRows;
// };

// const postMembershipDetails = async (req, res) => {
//   try {
//     // creating a transaction block
//     await db.query("Begin");

//     const { membership, directory, user } = req.body;
//     if (!membership || !directory) {
//       return res.status(400).json({
//         error: true,
//         message: "Please fill all the details",
//       });
//     }
//     // const memberNo = await generateMemberNumber();
//     const memberNo = membership?.membershipNo;
//     const memberData = transformMembershipData(memberNo, membership);

//     const isExistingMember = await db.query(
//       `SELECT * from ${TABLE_NAMES.MEMBER_TABLE} where dealer_code = $1 limit 1`,
//       [memberData.dealer_code]
//     );
//     let memberRow = {};
//     let directoryRows = [];
//     let directoryFamilyRows = [];

//     if (isExistingMember?.rowCount == 0) {
//       // get member id by runing sequence
//       const get_memberId = await db.query(
//         `select ${TABLE_NAMES.GET_MEMBER_ID_BY_SEQUENCE} AS next_id`
//       );
//       const memberId = get_memberId.rows[0].next_id;
//       const membershipData = { ...memberData, member_id: memberId };
//       const membershipDataForInsert = cleanObject(membershipData);
//       // console.log('new MembershipData',membershipDataForInsert)
//       const queryForInsert = generateSingleInsertQuery(
//         TABLE_NAMES.MEMBER_TABLE,
//         membershipDataForInsert,
//         "create_date"
//       );

//       const valuesForInsertQuery = Object.values(membershipDataForInsert);
//       // console.log(valuesForInsertQuery)
//       const result = await db.query(queryForInsert, [...valuesForInsertQuery]);
//       if (result.rowCount === 0) {
//         throw new Error(`Error: Internal server error`);
//       }

//       memberRow = result.rows[0];
//     }

//     if (memberRow && memberRow.member_no) {
//       let { directory: transformedDirectory } = transformDirectoryData(
//         memberRow,
//         directory
//       );

//       for (const [index, record] of transformedDirectory.entries()) {
//         // console.log('directoryDetail record: ', record)
//         if (record?.gstin) {
//           delete record.gstin;
//         }
//         try {
//           const queryForInsert = generateSingleInsertQuery(
//             TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
//             record,
//             "create_date"
//           );

//           const valuesForInsertQuery = Object.values(record);

//           // Insert record one by one
//           await db.query(queryForInsert, [...valuesForInsertQuery]);
//         } catch (error) {
//           console.error(`Error inserting record at index ${index}:`, error);
//           throw Error(error.message);
//         }
//       }

//       // Add mutiple family rows
//       let familyTransformedData = transformFamilyData(
//         memberRow,
//         directoryRows,
//         directory
//       );

//       for (const [index, record] of familyTransformedData.entries()) {
//         try {
//           const queryForInsert = generateSingleInsertQuery(
//             TABLE_NAMES.MEMBER_FAMILY_TABLE,
//             record,
//             "create_date"
//           );

//           const valuesForInsertQuery = Object.values(record);

//           // Insert record one by one
//           await db.query(queryForInsert, [...valuesForInsertQuery]);
//         } catch (error) {
//           // Handle individual record insert error
//           console.error(`Error inserting record at index ${index}:`, error);
//           throw Error(error.mesage);
//         }
//       }
//     }

//     // AFTER SUCCESSFULLY MAKING MEMBER THEN MEKING IT CUSTOMER ALSO

//     if (memberRow && memberRow.member_no) {
//       try {
//         const makeCustomer = await db.query(
//           `CALL insert_into_cust_master($1, $2)`,
//           [memberRow.member_no, user?.trans_year]
//         );
//       } catch (error) {
//         console.error("Error while making customer:", error.message);
//         throw new Error(
//           `Error while calling insert_into_cust_master: ${error.message}`
//         );
//       }
//     }
//     await db.query("COMMIT");
//     return res.status(200).json({
//       memberData: memberRow,
//       directory: directory || [],
//       new_member_no: memberNo
//     });
//   } catch (error) {
//     console.error(error);
//     await db.query("ROLLBACK");
//     return res.status(400).json({ errMsg: `Some error occurred ${error}` });
//   }
// };

// const updateMembershipDetails = async (req, res) => {
//   console.log(req.body);
//   const {
//     member_id,
//     member_no,
//     updatedMemberData, //done
//     updatedDirectory,
//     updatedFamilyDetails,
//     newDirectory,
//     newFamilyDetails,
//     deletedDirectory,
//     deletedFamilyDetails,
//   } = { ...req?.body };

//   try {
//     await db.query("Begin");

//     // deleting the memberDirectory
//     if (deletedDirectory.length) {
//       for (const [index, record] of deletedDirectory.entries()) {
//         let individual_sno = record.individual_sno;
//         const deleteFamilyDetails = `delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2`;
//         const deleteDirectory = `delete from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_id = $1 and individual_sno = $2`;
//         // console.log(query)
//         try {
//           // Execute the update query
//           await db.query(deleteFamilyDetails, [member_id, individual_sno]);
//           await db.query(deleteDirectory, [member_id, individual_sno]);
//         } catch (error) {
//           throw new Error(error);
//         }
//       }
//     }

//     if (deletedFamilyDetails.length) {
//       for (const [index, record] of deletedDirectory.entries()) {
//         const { individual_sno, family_member_sno } = record;
//         const deleteFamilyDetails = `delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2 and family_member_sno = $3`;
//         try {
//           // Execute the update query
//           await db.query(deleteFamilyDetails, [
//             member_id,
//             individual_sno,
//             family_member_sno,
//           ]);
//         } catch (error) {
//           throw new Error(error);
//         }
//       }
//     }

//     //updating the membership data
//     if (Object.keys(updatedMemberData).length !== 0) {
//       const membershipDataForInsert = transformMembershipData(
//         member_no,
//         updatedMemberData
//       );
//       const cleanMembershipDataForUpdate = cleanObject(membershipDataForInsert);
//       console.log(cleanMembershipDataForUpdate);

//       const columns = Object.keys(cleanMembershipDataForUpdate);
//       const values = Object.values(cleanMembershipDataForUpdate);

//       console.log("membership updated data ::", columns, values);

//       // Create SET clause for SQL UPDATE query
//       const setClause = columns
//         .map((column, index) => `${column} = $${index + 1}`)
//         .join(", ");

//       // Generate the full SQL query
//       const query = `UPDATE ${
//         TABLE_NAMES.MEMBER_TABLE
//       } SET ${setClause} WHERE member_id = $${
//         columns.length + 1
//       } and member_no = $${columns.length + 2}`;

//       console.log("membership update query::: ", query);
//       try {
//         // Execute the update query
//         await db.query(query, [...values, member_id, member_no]);
//       } catch (error) {
//         throw new Error(`updating Membershipt detail: ${error}`);
//       }
//     }

//     //updating the MemberDirectory
//     if (updatedDirectory.length >= 1) {
//       for (const [index, record] of updatedDirectory.entries()) {
//         const getDirectorydata = transformSingleDirectoryData(record);
//         const directoryDataForUpdate = cleanObject({ ...getDirectorydata });
//         // console.log(directoryDataForUpdate)
//         const { individual_sno } = directoryDataForUpdate;
//         delete directoryDataForUpdate.individual_sno;

//         const columns = Object.keys(directoryDataForUpdate);
//         const values = Object.values(directoryDataForUpdate);

//         // Create SET clause for SQL UPDATE query
//         const setClause = columns
//           .map((column, index) => `${column} = $${index + 1}`)
//           .join(", ");

//         // Generate the full SQL query
//         const query = `UPDATE ${
//           TABLE_NAMES.MEMBER_DIRECTORY_TABLE
//         } SET ${setClause} WHERE member_id = $${
//           columns.length + 1
//         } and member_no = $${columns.length + 2} and individual_sno = $${
//           columns.length + 3
//         }`;

//         // console.log(query)
//         try {
//           // Execute the update query
//           await db.query(query, [
//             ...values,
//             member_id,
//             member_no,
//             individual_sno,
//           ]);
//         } catch (error) {
//           throw new Error(error);
//         }
//       }
//     }

//     //updating the FamilyDetail
//     if (updatedFamilyDetails.length >= 1) {
//       for (const [index, record] of updatedFamilyDetails.entries()) {
//         const getFamilyData = transformSingleFamilyData(record);
//         const familyDataforUpdate = cleanObject({ ...getFamilyData });
//         // console.log(familyDataforUpdate)
//         const { individual_sno, family_member_sno } = familyDataforUpdate;
//         delete familyDataforUpdate.individual_sno;
//         delete familyDataforUpdate.family_member_sno;

//         const columns = Object.keys(familyDataforUpdate);
//         const values = Object.values(familyDataforUpdate);

//         // Create SET clause for SQL UPDATE query
//         const setClause = columns
//           .map((column, index) => `${column} = $${index + 1}`)
//           .join(", ");

//         // Generate the full SQL query
//         const query = `UPDATE ${
//           TABLE_NAMES.MEMBER_FAMILY_TABLE
//         } SET ${setClause} WHERE member_id = $${
//           columns.length + 1
//         } and member_no = $${columns.length + 2} and individual_sno = $${
//           columns.length + 3
//         } and family_member_sno = $${columns.length + 4}`;

//         // console.log(query)
//         try {
//           // Execute the update query
//           await db.query(query, [
//             ...values,
//             member_id,
//             member_no,
//             individual_sno,
//             family_member_sno,
//           ]);
//         } catch (error) {
//           throw new Error(error);
//         }
//       }
//     }

//     // inserting new Directory Data
//     if (newDirectory.length >= 1) {
//       for (const [index, record] of newDirectory.entries()) {
//         // const isFamilyExist = await db.query(`
//         //     select * from mdedmember_dtl_family where member_id = $1 and individual_sno = $2 and family_member_sno = $3`,
//         // [member_id, record.individual_sno, record.family_member_sno]
//         // )

//         // if(isFamilyExist.rowCount){
//         //       continue;
//         // }

//         const getNewDirectorydata = transformSingleDirectoryData(record);
//         const directoryDataForInsert = cleanObject({ ...getNewDirectorydata });

//         try {
//           const queryForInsert = generateSingleInsertQuery(
//             TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
//             { member_id, member_no, ...directoryDataForInsert },
//             "create_date"
//           );

//           const valuesForInsertQuery = Object.values({
//             member_id,
//             member_no,
//             ...directoryDataForInsert,
//           });
//           // Insert record one by one
//           await db.query(queryForInsert, [...valuesForInsertQuery]);
//         } catch (error) {
//           // Handle individual record insert error
//           console.error(`Error inserting record at index ${index}:`, error);
//           throw Error({ message: error });
//         }
//       }
//     }

//     // inserting new FamilyData
//     if (newFamilyDetails.length >= 1) {
//       for (const [index, record] of newFamilyDetails.entries()) {
//         const getNewFamilydata = transformSingleFamilyData(record);
//         const familyDataForInsert = cleanObject({ ...getNewFamilydata });
//         // console.log('newfamilyDetail data',getNewFamilydata)

//         const isFamilyExist = await db.query(
//           `
//                     select * from mdedmember_dtl_family where member_id = $1 and individual_sno = $2 and family_member_sno = $3`,
//           [member_id, record.individual_sno, record.family_member_sno]
//         );

//         if (isFamilyExist.rowCount) {
//           continue;
//         }

//         try {
//           const queryForInsert = generateSingleInsertQuery(
//             TABLE_NAMES.MEMBER_FAMILY_TABLE,
//             { member_id, member_no, ...familyDataForInsert },
//             "create_date"
//           );

//           const valuesForInsertQuery = Object.values({
//             member_id,
//             member_no,
//             ...familyDataForInsert,
//           });

//           // Insert record one by one
//           await db.query(queryForInsert, [...valuesForInsertQuery]);
//         } catch (error) {
//           // Handle individual record insert error
//           console.error(`Error inserting record at index ${index}:`, error);
//           throw Error({ message: error });
//         }
//       }
//     }

//     if (member_id && member_no) {
//       try {
//         const makeCustomer = await db.query(
//           `CALL insert_into_cust_master($1, $2)`,
//           [member_no, "2024"] // Bind parameters
//         );
//       } catch (error) {
//         console.error("Error while making customer:", error.message);
//         throw new Error(
//           `Error while calling insert_into_cust_master: ${error.message}`
//         );
//       }
//     }

//     await db.query("COMMIT");
//     return res.status(200).send({ status: "successfully updated" });
//   } catch (error) {
//     console.error(`Error : `, error);
//     await db.query("ROLLBACK");
//     return res
//       .status(400)
//       .send({ errMsg: `Some error occurred ${error.message}` });
//   }
// };

// const getDataOnQuery = async (req, res) => {
//   try {
//     console.log(req?.query);
//     let whereClauses = [];

//     // Convert boolean fields to 'Y' or 'N' before processing
//     let booleanFields = ["member_active"];
//     for (const field of booleanFields) {
//       if (req.query[field] !== undefined) {
//         req.query[field] = req.query[field] == "true" ? "Y" : "N";
//       }
//     }

//     // Define search keys that should be checked in WHERE clause
//     let searchKeys = [
//       "member_no",
//       "dealer_code",
//       "member_status",
//       "member_active",
//       "dlr_name",
//       "division",
//       "location",
//     ];

//     // If any of these searchKeys exist in the query, add them to WHERE clause
//     // for (const key of searchKeys) {
//     //     if (req.query[key] !== undefined && req.query[key] !== "") {
//     //         whereClauses.push(`${key} = '${req.query[key]}'`);
//     //     }
//     // }

//     for (const key of searchKeys) {
//       if (req.query[key] !== undefined && req.query[key] !== "") {
//         if (key === "dlr_name") {
//           whereClauses.push(`dlr_name ILIKE '${req.query[key]}%'`);
//         } else {
//           whereClauses.push(`${key} = '${req.query[key]}'`);
//         }
//       }
//     }

//     // Build WHERE clause dynamically
//     let queryValues =
//       whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

//     // Default query ordering
//     let queryPerameter = `ORDER BY member_no LIMIT 1 OFFSET ${
//       req.query.offset || 0
//     }`;
//     let dataCount;

//     // If search parameters exist, count results accordingly
//     if (whereClauses.length > 0) {
//       const getCount = await db.query(
//         `SELECT COUNT(*) FROM ${TABLE_NAMES.MEMBER_TABLE} ${queryValues}`
//       );
//       dataCount = getCount.rows[0]?.count;
//       queryPerameter = `${queryValues} ${queryPerameter}`;
//     } else {
//       // If no search parameters, handle first/last/next/prev normally
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const getCount = await db.query(
//             `SELECT COUNT(*) FROM ${TABLE_NAMES.MEMBER_TABLE}`
//           );
//           dataCount = getCount.rows[0]?.count;
//           break;
//         }
//         case "Last": {
//           queryPerameter = "ORDER BY member_no DESC LIMIT 1";
//           break;
//         }
//         default:
//           queryPerameter = `ORDER BY member_no LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//       }
//     }

//     // Fetch membership data based on search query or normal query
//     const membershipData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.MEMBER_TABLE} ${queryPerameter}`
//     );

//     if (!membershipData.rows.length) {
//       return res.status(200).send({
//         message: "No membership data found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     const dealerData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.DEALER_TABLE} WHERE dealer_code = $1`,
//       [membershipData.rows[0].dealer_code]
//     );

//     const memberId = membershipData.rows[0].member_id;

//     const memberDirectoryData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} WHERE member_id = $1 ORDER BY individual_sno`,
//       [memberId]
//     );

//     if (dealerData.rowCount === 0 && membershipData.rowCount !== 0) {
//       const { dlr_name, division, dealer_code } = membershipData.rows[0];
//       dealerData.rows[0] = {
//         dealership_name: dlr_name,
//         dlr_type: division,
//         dealer_code,
//       };
//     }

//     const memberFamilyData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.MEMBER_FAMILY_TABLE} WHERE member_id = $1 ORDER BY family_member_sno`,
//       [memberId]
//     );

//     const transformedData = transformDirectoryPayload(
//       memberDirectoryData.rows,
//       memberFamilyData.rows
//     );

//     const response = {
//       type: "found",
//       dealerData: dealerData.rows[0],
//       membershipData: membershipData.rows[0],
//       directory: transformedData || [],
//       count: dataCount || 0,
//     };

//     return res.send(response);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .send({ message: `Internal server error on query ${error.message}` });
//   }
// };

// const validateGstin = async (req, res) => {
//   // console.log('validatGstin function call')
//   const dealer_code = req?.query?.dealer_code;
//   if (!dealer_code) {
//     res.status(400).send({ message: "Please Select first dealer" });
//     return;
//   }
//   try {
//     const result = await db.query(
//       `select dlr_gstin from ${TABLE_NAMES.DEALER_TABLE} where dealer_code = $1`,
//       [dealer_code]
//     );
//     if (result.rowCount === 0) {
//       res.status(400).send({ message: "data not found" });
//       return;
//     }
//     res.status(200).json({ dlr_gstin: result.rows[0].dlr_gstin });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error });
//   }
// };

// const helpListData = async (req, res) => {
//   const helpList = req?.query?.help_list;
//   const formStatus = req?.query?.form_status;
//   if (helpList === "dealers" && formStatus === "Insert") {
//     const dealersData = await db.query(`select *
//             from ${TABLE_NAMES.DEALER_TABLE} d
//             where not exists (
//                 select 1 
//                 from ${TABLE_NAMES.MEMBER_TABLE} m 
//                 where m.dealer_code = d.dealer_code
//                 )
//             order by d.dealer_code`);
//     return res.status(200).send(dealersData.rows);
//   } else if (
//     (helpList === "dealers" && formStatus === "Query") ||
//     formStatus === "Update"
//   ) {
//     const dealersData = await db.query(
//       `select *
//             from ${TABLE_NAMES.DEALER_TABLE} d
//             where exists (
//                 select 1 
//                 from ${TABLE_NAMES.MEMBER_TABLE} m 
//                 where m.dealer_code = d.dealer_code
//                 )
//             order by d.dealer_code`
//     );
//     return res.status(200).send(dealersData.rows);
//   } else if (helpList == "dealers" && formStatus === "Search") {
//     const dealersData = await db.query(`select dealer_code, dlr_name as dealership_name, division as dlr_type
//             from ${TABLE_NAMES.MEMBER_TABLE} 
//             `);
//     return res.status(200).send(dealersData.rows);
//   }
// };

// const getDealerCodeByMemberNo = async (req, res) => {
//   const getDealerCode = await db.query(
//     `select dealer_code from ${TABLE_NAMES.MEMBER_TABLE} where member_no = $1`,
//     [req?.query?.membershipNo]
//   );
//   if (getDealerCode.rowCount === 0) {
//     res.send({ type: "not found" });
//   } else {
//     res.send({
//       type: "found",
//       dealer_code: getDealerCode.rows[0].dealer_code,
//     });
//   }
// };

// exports.handleFormOperation = catchAsync(async (req, res, next) => {
//   if (["Query", "Search"].includes(req?.query?.formStatus)) {
//     await getDataOnQuery(req, res);
//     return;
//   }
//   if (req?.query?.gstin) {
//     await validateGstin(req, res);
//     return;
//   }
//   // if(req?.query?.membershipNo){
//   //     await getDealerCodeByMemberNo(req, res)
//   //     return;
//   // }
//   if (req?.query?.help_list) {
//     await helpListData(req, res);
//     return;
//   }
// });

// exports.handlePostFormData = catchAsync(async (req, res, next) => {
//   const formStatus = req?.query?.form_status;
//   if (!formStatus) {
//     return res.status(404).send({ errMsg: "Cannot Save Data" });
//   }
//   if (formStatus === "Update") {
//     await updateMembershipDetails(req, res);
//     return;
//   } else if (formStatus === "Insert") {
//     await postMembershipDetails(req, res);
//     return;
//   }
// });


// exports.handleValidateField = catchAsync(async(req, res, next)=>{
//   if (req?.query?.validate_field == 'member_no'){
//     await checkIsMemberExist(req, res)
//   }
// })




const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  replaceKeysWithTemplate,
  transformDirectoryPayload,
  generateSingleInsertQuery,
  cleanObject,
  convertStringsToBooleans,
  buildSearchQuery,
} = require("../../../../utility/query");



const TABLE_NAMES = {
  DEALER_TABLE: "moeddealer",
  CONSTITUTION_TABLE: "moed_constitution",
  QUALIFICATION_TABLE: "moed_qualification",
  DESIGNATION_TABLE: "moed_designation",
  MEMBER_TABLE: "moedmember",
  MEMBER_DIRECTORY_TABLE: "mdedmember_dtl",
  MEMBER_FAMILY_TABLE: "mdedmember_dtl_family",
  GEN_NEW_MEMBER_NO: "genmembershipno()",
  GET_MEMBER_ID_BY_SEQUENCE: "nextval('s_moedmember_member_id')",
};

const generateMemberNumber = async () => {
  const query = await db.query(`select ${TABLE_NAMES.GEN_NEW_MEMBER_NO}`);
  // console.log(query?.rows);
  return query?.rows[0].genmembershipno;
};

// make by amit on dt 24.09.2025 as per sahil said to mannually allotting member no on meeting 23.09.2025 and approved by PM & JSB
const checkIsMemberExist= async (req, res)=>{
  const {member_no} = req?.query
  try {
    if(!member_no){
      throw new Error('Member No cannot be blank')
    }

    const checkMemberExistence = await db.query('select * from moedmember where member_no = $1',[member_no])

    if(checkMemberExistence.rowCount > 0){
      throw new Error(`Member already exist with the Member No. ${member_no}`)
    }

    res.status(200).json({type:'success', data:{member_no:member_no}})    
  } catch (error) {
    return res.status(500).json({type:'error', message:error.message || 'Internal Server Error'})
  }
}

exports.getDealerList = catchAsync(async (req, res, next) => {
  let queryparams = req?.query?.form_status;
  // console.log('formstatus on get dealercode', queryparams)
  if (queryparams === "Insert") {
    const dealerList = await db.query(
      `           select *
            from ${TABLE_NAMES.DEALER_TABLE} d
            where not exists (
                select 1 
                from ${TABLE_NAMES.MEMBER_TABLE} m 
                where m.dealer_code = d.dealer_code
                )
            order by d.dealer_code`
    );
    return res.status(200).send(dealerList.rows);
  } else if (queryparams === "Query" || queryparams === "Update") {
    const dealerList = await db.query(
      `select *
            from ${TABLE_NAMES.DEALER_TABLE} d
            where exists (
                select 1 
                from ${TABLE_NAMES.MEMBER_TABLE} m 
                where m.dealer_code = d.dealer_code
                )
            order by d.dealer_code`
    );
    return res.status(200).send(dealerList.rows);
  } else if (queryparams === "" || queryparams === "Search") {
    return res.status(200).send([]);
  }
});

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const constitutionList = await db.query(
    `select * from mommcode where cat_group = $1`,
    ["MEMCT"]
  );
  const qualitifcationList = await db.query(
    `SELECT * FROM mommcode where cat_group = $1`,
    ["QLFGRP"]
  );
  const designationList = await db.query(
    `SELECT * FROM mommcode WHERE CAT_GROUP = $1`,
    ["EMPDSG"]
  );
  const childRelationList = await db.query(
    `SELECT * FROM mommcode WHERE CAT_GROUP = $1`,
    ["RELATN"]
  );
  const divisionLIst = await db.query(
    `SELECT DISTINCT division FROM moedmember WHERE division IS NOT NULL`
  );
  const dlrLIst = await db.query(
    `select description, description as dlr_type from mommcode where cat_group = 'CTYPE'`
  );
  return res.status(200).json({
    constitutions: constitutionList.rows || [],
    qualitifcations: qualitifcationList.rows || [],
    designations: designationList.rows || [],
    relation: childRelationList.rows || [],
    divisionData: divisionLIst.rows || [],
    dlrTypeData: dlrLIst.rows || [],
  });
});

exports.fetchMembershipDetailsByDealerCode = catchAsync(
  async (req, res, next) => {
    if (!req.query.dealer_code) {
      return next("dealer_code required");
    }
    let searchQuery;
    let response = {};
    if (req?.query?.form_status === "Insert") {
      // searchQuery = `SELECT * from ${TABLE_NAMES.DEALER_TABLE} where dealer_code = $1 limit 1`
      searchQuery = `SELECT * 
            FROM ${TABLE_NAMES.DEALER_TABLE}
            WHERE dealer_code = $1 
            AND NOT EXISTS (
                SELECT 1 
                FROM ${TABLE_NAMES.MEMBER_TABLE} 
                WHERE dealer_code = $1
            )
            LIMIT 1;`;
    } else if (req?.query?.form_status === "Query") {
      searchQuery = `SELECT * from ${TABLE_NAMES.MEMBER_TABLE} where dealer_code = $1 limit 1`;
    } else if (
      req?.query?.form_status === null ||
      req?.query?.form_status === undefined
    ) {
      res.send({ type: "not found" });
    }

    const memberDataResponse = await db.query(searchQuery, [
      req?.query?.dealer_code,
    ]);
    if (memberDataResponse?.rowCount == 0) {
      response = {
        type: "not found",
      };
    } else {
      let memberData = memberDataResponse.rows?.[0];
      const memberDirectoryData = await db.query(
        `SELECT * from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_no = $1 order by individual_sno`,
        [memberData?.member_no]
      );
      const memberFamilyData = await db.query(
        `SELECT * from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_no = $1 order by family_member_sno`,
        [memberData.member_no]
      );

      const transformedData = transformDirectoryPayload(
        memberDirectoryData.rows,
        memberFamilyData.rows
      );
      response = {
        type: "found",
        memberData,
        directory: transformedData || [],
      };
    }
    return res.send(response);
  }
);

const transformMembershipData = (mNo = "", data) => {
  const {
    member_id,
    dealerCode,
    membershipNo,
    membershipStatus,
    membershipFee,
    ddNo,
    division,
    dealershipName,
    location,
    membershipForm,
    ddDate,
    alternateEmailId,
    gstin,
    // dealershipStatus,  // i have commented it for insert
    dealerAppointmentDate,
    membershipDate,
    boardMeetingAppointmentDate,
    boardMeetingCeasationDate,
    inoprativeDate,
    ceasationDate,
    boardMeetingReinstateDate,
    dealerInoperative,
    dealerEmail,
    others,
    dealershipActive,
    tools,
    uniform,
    promotionalKit,
    stationary,
    allKitItem,
    forFeitureAcc,
    memberFeeAmt,
    membershipActive,
  } = data;

  return {
    member_id: member_id,
    member_no: mNo,
    division: division,
    member_status: membershipStatus,
    dlr_name: dealershipName,
    member_active: membershipStatus,
    dlr_gstin: gstin,
    dlr_email: dealerEmail,
    dlr_alt_email: alternateEmailId,
    member_date: membershipDate,
    member_board_appnt_date: boardMeetingAppointmentDate,
    member_board_cease_date: boardMeetingCeasationDate,
    member_board_reinstate: boardMeetingReinstateDate,
    // dlr_status: dealershipStatus,
    // dlr_active: dealershipActive, //?'Y':'N',
    // dlr_inoperative: dealerInoperative, //?'Y':'N',
    // membership_fee: membershipFee, // ? "Y" : "N",
    // member_form: membershipForm, // ? "Y" : "N",
    // pay_instr_no: ddNo, //,
    // pay_instr_date: ddDate, //,
    // dealer_code: dealerCode, //,
    // start_kit_tool: tools, //? "Y" : "N",
    // start_kit_uniform: uniform, //? "Y" : "N",
    // start_kit_promotion: promotionalKit, //? "Y" : "N",
    // start_kit_stationery: stationary, //? "Y" : "N",
    // start_kit_all: allKitItem, //? "Y" : "N",
    // member_fee_amount:memberFeeAmt, //,
    // forfeiture_amount:forFeitureAcc, //? "Y" : "N",
    // member_active:membershipActive, //?"Y":'N'
    dlr_active: dealershipActive ? "Y" : "N",
    dlr_inoperative: dealerInoperative ? "Y" : "N",
    membership_fee: membershipFee ? "Y" : "N",
    member_form: membershipForm ? "Y" : "N",
    pay_instr_no: ddNo,
    pay_instr_date: ddDate,
    dealer_code: dealerCode,
    start_kit_tool: tools ? "Y" : "N",
    start_kit_uniform: uniform ? "Y" : "N",
    start_kit_promotion: promotionalKit ? "Y" : "N",
    start_kit_stationery: stationary ? "Y" : "N",
    start_kit_all: allKitItem ? "Y" : "N",
    member_fee_amount: memberFeeAmt,
    forfeiture_amount: Number(forFeitureAcc)|| 0,
    member_active: membershipActive ? "Y" : "N",
  };
};

const transformMembershipDataSearch = (data) => {
  const {
    member_id,
    dealerCode,
    membershipNo,
    membershipStatus,
    membershipFee,
    ddNo,
    division,
    dealershipName,
    location,
    membershipForm,
    ddDate,
    alternateEmailId,
    gstin,
    // dealershipStatus,  // i have commented it for insert
    dealerAppointmentDate,
    membershipDate,
    boardMeetingAppointmentDate,
    boardMeetingCeasationDate,
    inoprativeDate,
    ceasationDate,
    boardMeetingReinstateDate,
    dealerInoperative,
    dealerEmail,
    others,
    dealershipActive,
    tools,
    uniform,
    promotionalKit,
    stationary,
    allKitItem,
    forFeitureAcc,
    memberFeeAmt,
    membershipActive,
  } = data;

  return {
    member_id: member_id,
    member_no: membershipNo,
    division: division,
    member_status: membershipStatus,
    dlr_name: dealershipName,
    member_active: membershipStatus,
    dlr_gstin: gstin,
    dlr_email: dealerEmail,
    dlr_alt_email: alternateEmailId,
    member_date: membershipDate,
    member_board_appnt_date: boardMeetingAppointmentDate,
    member_board_cease_date: boardMeetingCeasationDate,
    member_board_reinstate: boardMeetingReinstateDate,
    // dlr_status: dealershipStatus,
    dlr_active: dealershipActive, //?'Y':'N',
    dlr_inoperative: dealerInoperative, //?'Y':'N',
    membership_fee: membershipFee, // ? "Y" : "N",
    member_form: membershipForm, // ? "Y" : "N",
    pay_instr_no: ddNo, //,
    pay_instr_date: ddDate, //,
    dealer_code: dealerCode, //,
    start_kit_tool: tools, //? "Y" : "N",
    start_kit_uniform: uniform, //? "Y" : "N",
    start_kit_promotion: promotionalKit, //? "Y" : "N",
    start_kit_stationery: stationary, //? "Y" : "N",
    start_kit_all: allKitItem, //? "Y" : "N",
    member_fee_amount: memberFeeAmt, //,
    forfeiture_amount: forFeitureAcc, //? "Y" : "N",
    member_active: membershipActive, //?"Y":'N'
    // dlr_active: dealershipActive?'Y':'N',
    // dlr_inoperative: dealerInoperative?'Y':'N',
    // membership_fee: membershipFee ? "Y" : "N",
    // member_form: membershipForm ? "Y" : "N",
    // pay_instr_no: ddNo,
    // pay_instr_date: ddDate,
    // dealer_code: dealerCode,
    // start_kit_tool: tools? "Y" : "N",
    // start_kit_uniform: uniform? "Y" : "N",
    // start_kit_promotion: promotionalKit? "Y" : "N",
    // start_kit_stationery: stationary? "Y" : "N",
    // start_kit_all: allKitItem? "Y" : "N",
    // member_fee_amount:memberFeeAmt,
    // forfeiture_amount:forFeitureAcc? "Y" : "N",
    // member_active:membershipActive?"Y":'N'
  };
};

const transformDirectoryData = (memberRow = {}, data = []) => {
  let directoryTemplate = {
    constitution: "constitution",
    desigRelation: "designation",
    title: "title",
    name: "name",
    qualification: "qualification",
    dob: "dob",
    dom: "dom",
    bloodGroup: "blood_group",
    mobileNo: "mobile_no",
    emailId: "email_id",
    resAdd: "res_add_1",
    resPhone: "res_phone",
    memberStatus: "member_status",
  };

  let directory = [];
  if (Array.isArray(data) && data.length) {
    directory = data.map((row, index) => {
      let obj = {
        member_no: memberRow.member_no,
        member_id: memberRow.member_id,
        ...replaceKeysWithTemplate(row, directoryTemplate),
      };
      let { id, familyDetails, ...params } = obj;
      return params;
    });
  }

  return { directory };
};

const transformSingleDirectoryData = (data) => {
  let {
    individual_sno,
    constitution,
    desigRelation,
    title,
    name,
    qualification,
    dob,
    dom,
    bloodGroup,
    mobileNo,
    emailId,
    resAdd,
    resPhone,
    memberStatus,
  } = data;

  return {
    individual_sno,
    constitution: constitution,
    designation: desigRelation,
    title: title,
    name: name,
    qualification: qualification,
    dob: dob,
    dom: dom,
    blood_group: bloodGroup,
    mobile_no: mobileNo,
    email_id: emailId,
    res_add_1: resAdd,
    res_phone: resPhone,
    member_status: memberStatus,
  };
};

const transformSingleFamilyData = (data) => {
  let {
    individual_sno,
    family_member_sno,
    desigRelation,
    title,
    name,
    qualification,
    dob,
    dom,
    bloodGroup,
    mobileNo,
    emailId,
    resAdd,
    resPhone,
    involmentInBusiness,
    since,
    status,
  } = data;

  return {
    individual_sno: individual_sno,
    family_member_sno: family_member_sno,
    relation: desigRelation,
    title: title,
    name: name,
    qualification: qualification,
    dob: dob,
    dom: dom,
    blood_group: bloodGroup,
    mobile_no: mobileNo,
    email_id: emailId,
    res_add_1: resAdd,
    res_phone: resPhone,
    involvement_in_buisness: involmentInBusiness,
    since: since,
    fam_member_status: status,
  };
};

const transformFamilyData = (
  memberRow = {},
  directoryRows = [],
  directory = []
) => {
  let template = {
    member_id: "member_id",
    member_no: "member_no",
    individual_sno: "individual_sno",
    family_member_sno: "family_member_sno",
    desigRelation: "relation",
    title: "title",
    name: "name",
    qualification: "qualification",
    dob: "dob",
    dom: "dom",
    bloodGroup: "blood_group",
    mobileNo: "mobile_no",
    emailId: "email_id",
    resAdd: "res_add_1",
    resPhone: "res_phone",
    involmentInBusiness: "involvement_in_buisness",
    since: "since",
    status: "fam_member_status",
  };

  let familyRows = [];
  if (Array.isArray(directory) && directory.length) {
    directory.forEach((row, index) => {
      if (
        row?.familyDetails &&
        Array.isArray(row?.familyDetails) &&
        row?.familyDetails?.length
      ) {
        row.familyDetails.forEach((family, famIndex) => {
          let obj = {
            // individual_sno: directoryRows[index]?.individual_sno,
            individual_sno: row?.individual_sno,
            member_no: memberRow?.member_no,
            member_id: memberRow.member_id,
            ...replaceKeysWithTemplate(family, template),
          };
          let { ...data } = obj;
          familyRows.push(data);
        });
      }
    });
  }
  return familyRows;
};

const postMembershipDetails = async (req, res) => {
  try {
    // creating a transaction block
    await db.query("Begin");

    const { membership, directory, user,contactInfo } = req.body;
    if (!membership || !directory) {
      return res.status(400).json({
        error: true,
        message: "Please fill all the details",
      });
    }
    // const memberNo = await generateMemberNumber();
    const memberNo = membership?.membershipNo;
    const memberData = transformMembershipData(memberNo, membership);

    const isExistingMember = await db.query(
      `SELECT * from ${TABLE_NAMES.MEMBER_TABLE} where dealer_code = $1 limit 1`,
      [memberData.dealer_code]
    );
    let memberRow = {};
    let directoryRows = [];
    let directoryFamilyRows = [];

    if (isExistingMember?.rowCount == 0) {
      // get member id by runing sequence
      const get_memberId = await db.query(
        `select ${TABLE_NAMES.GET_MEMBER_ID_BY_SEQUENCE} AS next_id`
      );
      const memberId = get_memberId.rows[0].next_id;
      const membershipData = { ...memberData, member_id: memberId };
      const membershipDataForInsert = cleanObject(membershipData);
      // console.log('new MembershipData',membershipDataForInsert)
      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.MEMBER_TABLE,
        membershipDataForInsert,
        "create_date"
      );

      const valuesForInsertQuery = Object.values(membershipDataForInsert);
      // console.log(valuesForInsertQuery)
      const result = await db.query(queryForInsert, [...valuesForInsertQuery]);
      if (result.rowCount === 0) {
        throw new Error(`Error: Internal server error`);
      }

      memberRow = result.rows[0];
    }

    if (memberRow && memberRow.member_no) {
      let { directory: transformedDirectory } = transformDirectoryData(
        memberRow,
        directory
      );

      for (const [index, record] of transformedDirectory.entries()) {
        // console.log('directoryDetail record: ', record)
        if (record?.gstin) {
          delete record.gstin;
        }
        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
            record,
            "create_date"
          );

          const valuesForInsertQuery = Object.values(record);

          // Insert record one by one
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error(error.message);
        }
      }

      // Add mutiple family rows
      let familyTransformedData = transformFamilyData(
        memberRow,
        directoryRows,
        directory
      );

      for (const [index, record] of familyTransformedData.entries()) {
        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MEMBER_FAMILY_TABLE,
            record,
            "create_date"
          );

          const valuesForInsertQuery = Object.values(record);

          // Insert record one by one
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          // Handle individual record insert error
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error(error.mesage);
        }
      }
    }

    // AFTER SUCCESSFULLY MAKING MEMBER THEN MEKING IT CUSTOMER ALSO

    if (memberRow && memberRow.member_no) {
      try {
        const makeCustomer = await db.query(
          `CALL insert_into_cust_master($1, $2)`,
          [memberRow.member_no, user?.trans_year]
        );
      } catch (error) {
        console.error("Error while making customer:", error.message);
        throw new Error(
          `Error while calling insert_into_cust_master: ${error.message}`
        );
      }
    }


      // dealer contact detail update 
    if (contactInfo && Object.keys(contactInfo).length) {
  const dealerData = cleanObject(contactInfo);

  const columns = Object.keys(dealerData);
  const values = Object.values(dealerData);

  const setClause = columns
    .map((column, index) => `${column} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE ${TABLE_NAMES.DEALER_TABLE}
    SET ${setClause}
    WHERE dealer_code = $${columns.length + 1}
  `;

  await db.query(query, [ ...values, membership.dealerCode ]);
}

    await db.query("COMMIT");


    return res.status(200).json({
      memberData: memberRow,
      directory: directory || [],
      new_member_no: memberNo
    });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    return res.status(400).json({ errMsg: `Some error occurred ${error}` });
  }
};

const updateMembershipDetails = async (req, res) => {
  console.log(req.body);
  const {
    member_id,
    member_no,
    updatedMemberData, //done
    updatedDirectory,
    updatedFamilyDetails,
    newDirectory,
    newFamilyDetails,
    deletedDirectory,
    deletedFamilyDetails,
    updatedContactInfo
  } = { ...req?.body };

  try {
    await db.query("Begin");

    // deleting the memberDirectory
    if (deletedDirectory.length) {
      for (const [index, record] of deletedDirectory.entries()) {
        let individual_sno = record.individual_sno;
        const deleteFamilyDetails = `delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2`;
        const deleteDirectory = `delete from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_id = $1 and individual_sno = $2`;
        // console.log(query)
        try {
          // Execute the update query
          await db.query(deleteFamilyDetails, [member_id, individual_sno]);
          await db.query(deleteDirectory, [member_id, individual_sno]);
        } catch (error) {
          throw new Error(error);
        }
      }
    }

    if (deletedFamilyDetails.length) {
      for (const [index, record] of deletedDirectory.entries()) {
        const { individual_sno, family_member_sno } = record;
        const deleteFamilyDetails = `delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2 and family_member_sno = $3`;
        try {
          // Execute the update query
          await db.query(deleteFamilyDetails, [
            member_id,
            individual_sno,
            family_member_sno,
          ]);
        } catch (error) {
          throw new Error(error);
        }
      }
    }

    //updating the membership data
    if (Object.keys(updatedMemberData).length !== 0) {
      const membershipDataForInsert = transformMembershipData(
        member_no,
        updatedMemberData
      );
      const cleanMembershipDataForUpdate = cleanObject(membershipDataForInsert);
      console.log(cleanMembershipDataForUpdate);

      const columns = Object.keys(cleanMembershipDataForUpdate);
      const values = Object.values(cleanMembershipDataForUpdate);

      console.log("membership updated data ::", columns, values);

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${
        TABLE_NAMES.MEMBER_TABLE
      } SET ${setClause} WHERE member_id = $${
        columns.length + 1
      } and member_no = $${columns.length + 2}`;

      console.log("membership update query::: ", query);
      try {
        // Execute the update query
        await db.query(query, [...values, member_id, member_no]);
      } catch (error) {
        throw new Error(`updating Membershipt detail: ${error}`);
      }
    }

    //updating the MemberDirectory
    if (updatedDirectory.length >= 1) {
      for (const [index, record] of updatedDirectory.entries()) {
        const getDirectorydata = transformSingleDirectoryData(record);
        const directoryDataForUpdate = cleanObject({ ...getDirectorydata });
        // console.log(directoryDataForUpdate)
        const { individual_sno } = directoryDataForUpdate;
        delete directoryDataForUpdate.individual_sno;

        const columns = Object.keys(directoryDataForUpdate);
        const values = Object.values(directoryDataForUpdate);

        // Create SET clause for SQL UPDATE query
        const setClause = columns
          .map((column, index) => `${column} = $${index + 1}`)
          .join(", ");

        // Generate the full SQL query
        const query = `UPDATE ${
          TABLE_NAMES.MEMBER_DIRECTORY_TABLE
        } SET ${setClause} WHERE member_id = $${
          columns.length + 1
        } and member_no = $${columns.length + 2} and individual_sno = $${
          columns.length + 3
        }`;

        // console.log(query)
        try {
          // Execute the update query
          await db.query(query, [
            ...values,
            member_id,
            member_no,
            individual_sno,
          ]);
        } catch (error) {
          throw new Error(error);
        }
      }
    }

    //updating the FamilyDetail
    if (updatedFamilyDetails.length >= 1) {
      for (const [index, record] of updatedFamilyDetails.entries()) {
        const getFamilyData = transformSingleFamilyData(record);
        const familyDataforUpdate = cleanObject({ ...getFamilyData });
        // console.log(familyDataforUpdate)
        const { individual_sno, family_member_sno } = familyDataforUpdate;
        delete familyDataforUpdate.individual_sno;
        delete familyDataforUpdate.family_member_sno;

        const columns = Object.keys(familyDataforUpdate);
        const values = Object.values(familyDataforUpdate);

        // Create SET clause for SQL UPDATE query
        const setClause = columns
          .map((column, index) => `${column} = $${index + 1}`)
          .join(", ");

        // Generate the full SQL query
        const query = `UPDATE ${
          TABLE_NAMES.MEMBER_FAMILY_TABLE
        } SET ${setClause} WHERE member_id = $${
          columns.length + 1
        } and member_no = $${columns.length + 2} and individual_sno = $${
          columns.length + 3
        } and family_member_sno = $${columns.length + 4}`;

        // console.log(query)
        try {
          // Execute the update query
          await db.query(query, [
            ...values,
            member_id,
            member_no,
            individual_sno,
            family_member_sno,
          ]);
        } catch (error) {
          throw new Error(error);
        }
      }
    }

    // inserting new Directory Data
    if (newDirectory.length >= 1) {
      for (const [index, record] of newDirectory.entries()) {
        // const isFamilyExist = await db.query(`
        //     select * from mdedmember_dtl_family where member_id = $1 and individual_sno = $2 and family_member_sno = $3`,
        // [member_id, record.individual_sno, record.family_member_sno]
        // )

        // if(isFamilyExist.rowCount){
        //       continue;
        // }

        const getNewDirectorydata = transformSingleDirectoryData(record);
        const directoryDataForInsert = cleanObject({ ...getNewDirectorydata });

        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
            { member_id, member_no, ...directoryDataForInsert },
            "create_date"
          );

          const valuesForInsertQuery = Object.values({
            member_id,
            member_no,
            ...directoryDataForInsert,
          });
          // Insert record one by one
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          // Handle individual record insert error
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error({ message: error });
        }
      }
    }

    // inserting new FamilyData
    if (newFamilyDetails.length >= 1) {
      for (const [index, record] of newFamilyDetails.entries()) {
        const getNewFamilydata = transformSingleFamilyData(record);
        const familyDataForInsert = cleanObject({ ...getNewFamilydata });
        // console.log('newfamilyDetail data',getNewFamilydata)

        const isFamilyExist = await db.query(
          `
                    select * from mdedmember_dtl_family where member_id = $1 and individual_sno = $2 and family_member_sno = $3`,
          [member_id, record.individual_sno, record.family_member_sno]
        );

        if (isFamilyExist.rowCount) {
          continue;
        }

        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MEMBER_FAMILY_TABLE,
            { member_id, member_no, ...familyDataForInsert },
            "create_date"
          );

          const valuesForInsertQuery = Object.values({
            member_id,
            member_no,
            ...familyDataForInsert,
          });

          // Insert record one by one
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          // Handle individual record insert error
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error({ message: error });
        }
      }
    }

    if (member_id && member_no) {
      try {
        const makeCustomer = await db.query(
          `CALL insert_into_cust_master($1, $2)`,
          [member_no, "2024"] // Bind parameters
        );
      } catch (error) {
        console.error("Error while making customer:", error.message);
        throw new Error(
          `Error while calling insert_into_cust_master: ${error.message}`
        );
      }
    }
    
    // dealer contact details update

    if (updatedContactInfo && Object.keys(updatedContactInfo).length) {
  const dealerData = cleanObject(updatedContactInfo);

  const columns = Object.keys(dealerData);
  const values = Object.values(dealerData);

  const setClause = columns
    .map((column, index) => `${column} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE ${TABLE_NAMES.DEALER_TABLE}
    SET ${setClause}
    WHERE dealer_code = $${columns.length + 1}
  `;

  console.log("Dealer Update Query:", query);
  console.log("Dealer Update Values:", [
    ...values,
    updatedMemberData.dealerCode,
  ]);

  await db.query(query, [
    ...values,
    updatedMemberData.dealerCode,
  ]);
}

    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
    return res
      .status(400)
      .send({ errMsg: `Some error occurred ${error.message}` });
  }
};

const getDataOnQuery = async (req, res) => {
  try {
    console.log(req?.query);
    let whereClauses = [];

    // Convert boolean fields to 'Y' or 'N' before processing
    let booleanFields = ["member_active"];
    for (const field of booleanFields) {
      if (req.query[field] !== undefined) {
        req.query[field] = req.query[field] == "true" ? "Y" : "N";
      }
    }

    // Define search keys that should be checked in WHERE clause
    let searchKeys = [
      "member_no",
      "dealer_code",
      "member_status",
      "member_active",
      "dlr_name",
      "division",
      "location",
    ];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    // for (const key of searchKeys) {
    //     if (req.query[key] !== undefined && req.query[key] !== "") {
    //         whereClauses.push(`${key} = '${req.query[key]}'`);
    //     }
    // }

    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        if (key === "dlr_name") {
          whereClauses.push(`dlr_name ILIKE '${req.query[key]}%'`);
        } else {
          whereClauses.push(`${key} = '${req.query[key]}'`);
        }
      }
    }

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // Default query ordering
    let queryPerameter = `ORDER BY member_no LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount;

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MEMBER_TABLE} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryPerameter = `${queryValues} ${queryPerameter}`;
    } else {
      // If no search parameters, handle first/last/next/prev normally
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.MEMBER_TABLE}`
          );
          dataCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryPerameter = "ORDER BY member_no DESC LIMIT 1";
          break;
        }
        default:
          queryPerameter = `ORDER BY member_no LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
      }
    }

    // Fetch membership data based on search query or normal query
    const membershipData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MEMBER_TABLE} ${queryPerameter}`
    );

    if (!membershipData.rows.length) {
      return res.status(200).send({
        message: "No membership data found",
        type: "not found",
        count: 0,
      });
    }

    const dealerData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.DEALER_TABLE} WHERE dealer_code = $1`,
      [membershipData.rows[0].dealer_code]
    );

    const memberId = membershipData.rows[0].member_id;

    const memberDirectoryData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} WHERE member_id = $1 ORDER BY individual_sno`,
      [memberId]
    );

    if (dealerData.rowCount === 0 && membershipData.rowCount !== 0) {
      const { dlr_name, division, dealer_code } = membershipData.rows[0];
      dealerData.rows[0] = {
        dealership_name: dlr_name,
        dlr_type: division,
        dealer_code,
      };
    }

    const memberFamilyData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MEMBER_FAMILY_TABLE} WHERE member_id = $1 ORDER BY family_member_sno`,
      [memberId]
    );

    const transformedData = transformDirectoryPayload(
      memberDirectoryData.rows,
      memberFamilyData.rows
    );

    const response = {
      type: "found",
      dealerData: dealerData.rows[0],
      membershipData: membershipData.rows[0],
      directory: transformedData || [],
      count: dataCount || 0,
    };

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: `Internal server error on query ${error.message}` });
  }
};

const validateGstin = async (req, res) => {
  // console.log('validatGstin function call')
  const dealer_code = req?.query?.dealer_code;
  if (!dealer_code) {
    res.status(400).send({ message: "Please Select first dealer" });
    return;
  }
  try {
    const result = await db.query(
      `select dlr_gstin from ${TABLE_NAMES.DEALER_TABLE} where dealer_code = $1`,
      [dealer_code]
    );
    if (result.rowCount === 0) {
      res.status(400).send({ message: "data not found" });
      return;
    }
    res.status(200).json({ dlr_gstin: result.rows[0].dlr_gstin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

const helpListData = async (req, res) => {
  const helpList = req?.query?.help_list;
  const formStatus = req?.query?.form_status;
  if (helpList === "dealers" && formStatus === "Insert") {
    const dealersData = await db.query(`select *
            from ${TABLE_NAMES.DEALER_TABLE} d
            where not exists (
                select 1 
                from ${TABLE_NAMES.MEMBER_TABLE} m 
                where m.dealer_code = d.dealer_code
                )
            order by d.dealer_code`);
    return res.status(200).send(dealersData.rows);
  } else if (
    (helpList === "dealers" && formStatus === "Query") ||
    formStatus === "Update"
  ) {
    const dealersData = await db.query(
      `select *
            from ${TABLE_NAMES.DEALER_TABLE} d
            where exists (
                select 1 
                from ${TABLE_NAMES.MEMBER_TABLE} m 
                where m.dealer_code = d.dealer_code
                )
            order by d.dealer_code`
    );
    return res.status(200).send(dealersData.rows);
  } else if (helpList == "dealers" && formStatus === "Search") {
    const dealersData = await db.query(`select dealer_code, dlr_name as dealership_name, division as dlr_type
            from ${TABLE_NAMES.MEMBER_TABLE} 
            `);
    return res.status(200).send(dealersData.rows);
  }
};

const getDealerCodeByMemberNo = async (req, res) => {
  const getDealerCode = await db.query(
    `select dealer_code from ${TABLE_NAMES.MEMBER_TABLE} where member_no = $1`,
    [req?.query?.membershipNo]
  );
  if (getDealerCode.rowCount === 0) {
    res.send({ type: "not found" });
  } else {
    res.send({
      type: "found",
      dealer_code: getDealerCode.rows[0].dealer_code,
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
  if (req?.query?.gstin) {
    await validateGstin(req, res);
    return;
  }
  // if(req?.query?.membershipNo){
  //     await getDealerCodeByMemberNo(req, res)
  //     return;
  // }
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const formStatus = req?.query?.form_status;
  if (!formStatus) {
    return res.status(404).send({ errMsg: "Cannot Save Data" });
  }
  if (formStatus === "Update") {
    await updateMembershipDetails(req, res);
    return;
  } else if (formStatus === "Insert") {
    await postMembershipDetails(req, res);
    return;
  }
});


exports.handleValidateField = catchAsync(async(req, res, next)=>{
  if (req?.query?.validate_field == 'member_no'){
    await checkIsMemberExist(req, res)
  }
})