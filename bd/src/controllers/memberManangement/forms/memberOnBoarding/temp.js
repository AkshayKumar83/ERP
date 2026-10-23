// const {pool} = require('../../../../config/dbConnection')
// const catchAsync = require("../../../../utility/catchAsync");
// const {
//     cleanObject,
//     generateSingleInsertQuery,
// } = require("../../../../utility/query");

// const TABLE_NAMES = {
//     DEALER_TABLE: "integral.moeddealer",
//     MEMBER_TABLE: "integral.moedmember",
//     MEMBER_DIRECTORY_TABLE: "integral.mdedmember_dtl",
//     MEMBER_FAMILY_TABLE: "integral.mdedmember_dtl_family",
//     GET_MEMBER_ID_BY_SEQUENCE: "nextval('integral.s_moedmember_member_id')"
// };

// let transactions = {};

// const generateMemberNumber = async (client) => {
//     const query = await client.query("select genmembershipno()");
//     // console.log(query?.rows);
//     return query?.rows[0].genmembershipno;
// };


// const transformMembershipData = (mno, data) => {
//     const {
//         dealerCode,
//         membershipNo,
//         membershipStatus,
//         membershipFee,
//         ddNo,
//         division,
//         dealershipName,
//         location,
//         membershipForm,
//         ddDate,
//         alternateEmailId,
//         gstin,
//         dealershipStatus,
//         dealerAppointmentDate,
//         membershipDate,
//         boardMeetingAppointmentDate,
//         boardMeetingCeasationDate,
//         inoprativeDate,
//         ceasationDate,
//         boardMeetingReinstateDate,
//         dealerInoperative = "N",
//         dealerEmail,
//         others,
//         dealershipActive,
//         memberId,
//     } = data;

//     return {
//         member_id: memberId,
//         member_no: mno,
//         division: division,
//         member_status: membershipStatus,
//         dlr_name: dealershipName,
//         member_active: membershipStatus,
//         dlr_gstin: gstin,
//         dlr_email: dealerEmail,
//         dlr_alt_email: alternateEmailId,
//         member_date: membershipDate,
//         member_board_appnt_date: boardMeetingAppointmentDate,
//         member_board_cease_date: boardMeetingCeasationDate,
//         member_board_reinstate: boardMeetingReinstateDate,
//         member_board_appnt_date: dealerAppointmentDate,
//         // dlr_status: dealershipStatus,
//         // dlr_active: dealershipActive,
//         dlr_inoperative: dealerInoperative,
//         membership_fee: membershipFee ? "Y" : "N",
//         member_form: membershipForm ? "Y" : "N",
//         other: others ? "Y" : "N",
//         pay_instr_no: ddNo,
//         pay_instr_date: ddDate,
//         dealer_code: dealerCode,
//     };
// };

// const transformDirectoryData = (data) => {
//     let {
//         individual_sno,
//         constitution,
//         desigRelation,
//         title,
//         name,
//         qualification,
//         dob,
//         dom,
//         bloodGroup,
//         mobileNo,
//         emailId,
//         resAdd,
//         resPhone,
//         memberStatus,
//     } = data;

//     return {
//         individual_sno,
//         constitution: constitution,
//         designation: desigRelation,
//         title: title,
//         name: name,
//         qualification: qualification,
//         dob: dob,
//         dom: dom,
//         blood_group: bloodGroup,
//         mobile_no: mobileNo,
//         email_id: emailId,
//         res_add_1: resAdd,
//         res_phone: resPhone,
//         member_status: memberStatus,
//     };
// };

// const transformFamilyData = (data) => {
//     let {
//         individual_sno,
//         family_member_sno,
//         desigRelation,
//         title,
//         name,
//         qualification,
//         dob,
//         dom,
//         bloodGroup,
//         mobileNo,
//         emailId,
//         resAdd,
//         resPhone,
//         involmentInBusiness,
//         since,
//         status,
//     } = data;

//     return {
//         individual_sno: individual_sno,
//         family_member_sno: family_member_sno,
//         relation: desigRelation,
//         title: title,
//         name: name,
//         qualification: qualification,
//         dob: dob,
//         dom: dom,
//         blood_group: bloodGroup,
//         mobile_no: mobileNo,
//         email_id: emailId,
//         res_add_1: resAdd,
//         res_phone: resPhone,
//         involvement_in_buisness: involmentInBusiness,
//         since: since,
//         fam_member_status: status,
//     };
// };

// exports.startTransaction = catchAsync(async (req, res, next) => {
//     const transactionId = Date.now().toString(); // Simple unique ID
//     const client = await pool.connect();
//     await client.query("BEGIN");
//     transactions[transactionId] = client;

//     try {
//         if (req?.query?.form_status === "Insert") {
//             const result = await client.query(
//                 `SELECT ${TABLE_NAMES.GET_MEMBER_ID_BY_SEQUENCE} AS next_id`
//             );
//             const memberId = result.rows[0].next_id;
//             return res.status(200).send({ member_id: memberId, transactionId });
//         } else {
//             return res.status(200).send({ transactionId });
//         }
//     } catch (error) {
//         console.error("Failed to get Member ID:", error);
//         res.status(500).json({ error: "Failed to retrieve Member ID" });
//     }
// });

// const saveMember = catchAsync(async (req, res, next) => {
//     // if(req?.query?.block) return;
//     // console.log(req.body);
//     const { dealerCode, membershipNo } = req.body;
//     const membershipData = { ...req.body };
//     const client = transactions[req?.query?.transactionId];

//     // console.log(req?.query?.transactionId, dealerCode, membershipNo);

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }

//     const membershipDataForInsert = transformMembershipData(
//         membershipNo,
//         membershipData
//     );
//     // console.log("transform insert", membershipDataForInsert);

//     const cleanMembershipDataForInsert = cleanObject(membershipDataForInsert);
    
//     const queryForInsert = generateSingleInsertQuery(
//         TABLE_NAMES.MEMBER_TABLE,
//         cleanMembershipDataForInsert
//     );
//     // console.log(queryForInsert);

//     const valuesForInsertQuery = Object.values(cleanMembershipDataForInsert);

//     try {
//         // //locking the table
//         // await client.query("LOCK TABLE integral.moedmember IN EXCLUSIVE MODE");
//         await client.query(queryForInsert, [...valuesForInsertQuery]);
//         res.send({ status: "sucess" });
//     } catch (error) {
//         console.error("Error during saveMember operation:", error);

//         if (error.code === "40P01") {
//             // Deadlock detected
//             res.status(503).json({
//                 error: "The table is currently being updated by another transaction. Please try again later.",
//             });
//         } else if (error.code === "57014") {
//             // Query canceled (could indicate lock timeout or manual cancellation)
//             res.status(503).json({
//                 error: "The operation was canceled. Please try again later.",
//             });
//         } else {
//             res.status(500).json({ error: "Operation failed" });
//         }
//     }
// });

// const postMemberDetail = catchAsync(async (req, res, next) => {
//     // console.log(req.body, "and queryperameter:", req.query);
//     const client = transactions[req.query.transactionId];

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }
//     const getDirectorydata = transformDirectoryData(req.body);
//     // console.log('directoryData',getDirectorydata)

//     const directoryDataForInsert = cleanObject({
//         ...getDirectorydata,
//         member_id: req.body.member_id,
//         member_no: req.body.member_no,
//     });
//     // console.log(directoryDataForInsert)
//     const queryForInsert = generateSingleInsertQuery(
//         TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
//         directoryDataForInsert
//     );
//     // console.log("MemberDetail Data for insert : ", directoryDataForInsert);
//     // console.log("MemberDetail insert query: ", queryForInsert);
//     const valuesForInsertQuery = Object.values(directoryDataForInsert);
//     try {
//         await client.query(queryForInsert, [...valuesForInsertQuery]);
//         res.send({ status: "success" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.detail });
//     }
// });

// const updateMemberDetail = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }

//     const getDirectorydata = transformDirectoryData(req.body);
//     const directoryDataForUpdate = cleanObject({
//         ...getDirectorydata,
//     });

//     delete directoryDataForUpdate.individual_sno;

//     // console.log("directoryData for update : ", directoryDataForUpdate);

//     // Get the columns and values from the cleaned object
//     const columns = Object.keys(directoryDataForUpdate);
//     const values = Object.values(directoryDataForUpdate);

//     // Create SET clause for SQL UPDATE query
//     const setClause = columns
//         .map((column, index) => `${column} = $${index + 1}`)
//         .join(", ");

//     // Generate the full SQL query
//     const query = `UPDATE ${
//         TABLE_NAMES.MEMBER_DIRECTORY_TABLE
//     } SET ${setClause} WHERE member_id = $${
//         columns.length + 1
//     } and individual_sno = $${columns.length + 2}`;

//     // console.log("here updated query: ", query);

//     try {
//         // Execute the update query
//         await client.query(query, [
//             ...values,
//             req.body.member_id,
//             req.body.individual_sno,
//         ]);
//         res.send({ status: "successfully updated" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message });
//     }
// });

// const deleteMemberDetail = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];
//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }
//     // console.log("member detail data for delete : ", req.body);

//     const query = `Delete from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_id = $1 and individual_sno = $2`;

//     try {
//         await client.query(query, [
//             req?.body?.member_id,
//             req?.body?.individual_sno,
//         ]);
//         // console.log("Successfully deleted member detail");
//         res.send({ status: "successfully delete" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.detail });
//     }
// });

// const postFamilyDetail = catchAsync(async (req, res, next) => {
//     // console.log(req.body, "and queryperameter:", req.query);
//     const client = transactions[req.query.tansactionId];

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }
//     // console.log("family detail data", req.body);
//     const getFamilyDetailData = transformFamilyData(req.body);

//     const familyDataForInsert = cleanObject({
//         ...getFamilyDetailData,
//         member_id: req.body.member_id,
//         member_no: req.body.member_no,
//     });

//     const queryForInsert = generateSingleInsertQuery(
//         TABLE_NAMES.MEMBER_FAMILY_TABLE,
//         familyDataForInsert
//     );
//     // console.log("family data for insert : ", queryForInsert);
//     const valuesForInsertQuery = Object.values(familyDataForInsert);
//     try {
//         await client.query(queryForInsert, [...valuesForInsertQuery]);
//         res.send({ status: "success" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error });
//     }
// });

// const updateFamilyDetail = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }

//     // console.log("family detail data", req.body);
//     const getFamilyDetailData = transformFamilyData(req.body);

//     const familyDataForUpdate = cleanObject({
//         ...getFamilyDetailData,
//     });
//     delete familyDataForUpdate.individual_sno;
//     delete familyDataForUpdate.family_member_sno;

//     // console.log("family updated data", familyDataForUpdate);

//     // Get the columns and values from the cleaned object
//     const columns = Object.keys(familyDataForUpdate);
//     const values = Object.values(familyDataForUpdate);

//     // Create SET clause for SQL UPDATE query
//     const setClause = columns
//         .map((column, index) => `${column} = $${index + 1}`)
//         .join(", ");

//     // Generate update full SQL query
//     const query = `UPDATE ${
//         TABLE_NAMES.MEMBER_FAMILY_TABLE
//     } SET ${setClause} WHERE member_id = $${
//         columns.length + 1
//     } and individual_sno = $${columns.length + 2} and family_member_sno = $${
//         columns.length + 3
//     }`;
//     // console.log("here updated query: ", query);

//     try {
//         // Execute the update query
//         await client.query(query, [
//             ...values,
//             req.body.member_id,
//             req.body.individual_sno,
//             req.body.family_member_sno,
//         ]);
//         res.send({ status: "successfully updated" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.detail });
//     }
// });

// const deleteMemberFamilyDetail = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];
//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }
//     // console.log("member detail data for delete : ", req.body);
//     const query = `Delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2 and family_member_sno = $3`;
//     try {
//         await client.query(query, [
//             req?.body?.member_id,
//             req?.body?.individual_sno,
//             req?.body?.family_member_sno,
//         ]);
//         res.send({ status: "successfully delete" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.detail });
//     }
// });

// const setMemberNoOnSubmit = async (memberId, client) => {
//     try {
//         const getMemberId = await generateMemberNumber(client);
//         await client.query(
//             `update ${TABLE_NAMES.MEMBER_TABLE} set member_no = $1 where member_id = $2`,
//             [getMemberId, memberId]
//         );
//         await client.query(
//             `update ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} set member_no = $1 where member_id = $2`,
//             [getMemberId, memberId]
//         );
//         const isFamilyDtlExist = await client.query(`select * from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1`, [memberId])
//         if(isFamilyDtlExist?.rows?.length){
//             await client.query(
//                 `update ${TABLE_NAMES.MEMBER_FAMILY_TABLE} set member_no = $1 where member_id = $2`,
//                 [getMemberId, memberId]
//             );
//         }
//         return true
//     } catch (error) {
//         console.error(error);
//         return false
//     }
// };

// exports.commitTransaction = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];
//     // console.log("Body Data :", req?.body);
//     const onlyCommit = req?.query?.onlyCommit === "Y";
//     const memberId = req?.query?.memberId;

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }

//     try {
//         if (onlyCommit) {
//             const isMemberNoUpdated = await setMemberNoOnSubmit(memberId, client);
//             if(!isMemberNoUpdated) return;

//             await client.query("COMMIT"); // Commit the transaction
//             client.end();
//             delete transactions[req.query.transactionId];
//             return res.json({ status: "committed" });
//         } else {
//             const getDirectoryData = transformDirectoryData(req.body);
//             // console.log("after transformDirectoryData : ", getDirectoryData);
//             // console.log("Directory data on submit:", getDirectoryData);

//             const directoryDataForInsert = cleanObject({
//                 ...getDirectoryData,
//                 member_id: req?.body?.member_id,
//                 member_no: req.body.member_no,
//             });
//             // console.log("Final data for insert:", directoryDataForInsert);

//             const queryForInsert = generateSingleInsertQuery(
//                 TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
//                 directoryDataForInsert
//             );
//             const valuesForInsertQuery = Object.values(directoryDataForInsert);

//             await client.query(queryForInsert, valuesForInsertQuery);
//             const isMemberNoUpdated = await setMemberNoOnSubmit(req.body.member_id, client);
//             if(!isMemberNoUpdated) return
//             await client.query("COMMIT"); // Commit the transaction
//             client.end();
//             delete transactions[req.query.transactionId];
//             return res.json({ status: "committed" });
//         }
//     } catch (error) {
//         console.error("Commit failed:", error);
//         if (client) {
//             await client.query("ROLLBACK"); // Rollback the transaction on error
//             client.end();
//         }
//         delete transactions[req.query.transactionId];
//         return res.status(500).json({ error: "Commit failed" });
//     }
// });

// exports.rollbackTransaction = catchAsync(async (req, res, next) => {
//     const client = transactions[req?.query?.transactionId];

//     if (!client) {
//         return res.status(404).json({ error: "Transaction not found" });
//     }

//     try {
//         await client.query("ROLLBACK"); // Rollback the transaction
//         client.end();
//         delete transactions[req.query.transactionId];
//         return res.json({ status: "rolled back" });
//     } catch (error) {
//         console.error("Rollback failed:", error);
//         if (client) {
//             client.end();
//         }
//         delete transactions[req.query.transactionId];
//         return res.status(500).json({ error: "Rollback failed" });
//     }
// });

// exports.handleTransaction = catchAsync(async (req, res, next) => {
//     // console.log(req.query);
//     if (req?.query?.transaction === "start") {
//         exports.startTransaction(req, res, next);
//         return;
//     }
//     if (req?.query?.cancelTransaction === "Y") {
//         exports.rollbackTransaction(req, res, next);
//         return;
//     }
// });


// exports.handlePostData = catchAsync(async (req, res, next) => {
//     if (!req?.query?.block) {
//         saveMember(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "member_detail") {
//         postMemberDetail(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "update_member_detail") {
//         updateMemberDetail(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "delete_member_detail") {
//         deleteMemberDetail(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "family_detail") {
//         postFamilyDetail(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "update_family_detail") {
//         updateFamilyDetail(req, res, next);
//     } else if (req?.query?.block && req?.query?.block === "delete_family_detail") {
//         deleteMemberFamilyDetail(req, res, next);
//     }
// });


const {pool} = require('../../../../config/dbConnection')
const catchAsync = require("../../../../utility/catchAsync");
const {
    cleanObject,
    generateSingleInsertQuery,
} = require("../../../../utility/query");

const TABLE_NAMES = {
    DEALER_TABLE: "integral.moeddealer",
    MEMBER_TABLE: "integral.moedmember",
    MEMBER_DIRECTORY_TABLE: "integral.mdedmember_dtl",
    MEMBER_FAMILY_TABLE: "integral.mdedmember_dtl_family",
    GET_MEMBER_ID_BY_SEQUENCE: "nextval('integral.s_moedmember_member_id')"
};

let transactions = {};

const generateMemberNumber = async (client) => {
    const query = await client.query("select genmembershipno()");
    // console.log(query?.rows);
    return query?.rows[0].genmembershipno;
};


const transformMembershipData = (mno, data) => {
    const {
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
        dealershipStatus,
        dealerAppointmentDate,
        membershipDate,
        boardMeetingAppointmentDate,
        boardMeetingCeasationDate,
        inoprativeDate,
        ceasationDate,
        boardMeetingReinstateDate,
        dealerInoperative = "N",
        dealerEmail,
        others,
        dealershipActive,
        memberId,
    } = data;

    return {
        member_id: memberId,
        member_no: mno,
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
        member_board_appnt_date: dealerAppointmentDate,
        // dlr_status: dealershipStatus,
        // dlr_active: dealershipActive,
        dlr_inoperative: dealerInoperative,
        membership_fee: membershipFee ? "Y" : "N",
        member_form: membershipForm ? "Y" : "N",
        other: others ? "Y" : "N",
        pay_instr_no: ddNo,
        pay_instr_date: ddDate,
        dealer_code: dealerCode,
    };
};

const transformDirectoryData = (data) => {
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

const transformFamilyData = (data) => {
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

exports.startTransaction = catchAsync(async (req, res, next) => {
    const transactionId = Date.now().toString(); // Simple unique ID
    const client = await pool.connect();
    await client.query("BEGIN");
    transactions[transactionId] = client;

    try {
        if (req?.query?.form_status === "Insert") {
            const result = await client.query(
                `SELECT ${TABLE_NAMES.GET_MEMBER_ID_BY_SEQUENCE} AS next_id`
            );
            const memberId = result.rows[0].next_id;
            return res.status(200).send({ member_id: memberId, transactionId });
        } else {
            return res.status(200).send({ transactionId });
        }
    } catch (error) {
        console.error("Failed to get Member ID:", error);
        res.status(500).json({ error: "Failed to retrieve Member ID" });
    }
});

const saveMember = catchAsync(async (req, res, next) => {
    // if(req?.query?.block) return;
    // console.log(req.body);
    const { dealerCode, membershipNo } = req.body;
    const membershipData = { ...req.body };
    const client = transactions[req?.query?.transactionId];

    // console.log(req?.query?.transactionId, dealerCode, membershipNo);

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    const membershipDataForInsert = transformMembershipData(
        membershipNo,
        membershipData
    );
    // console.log("transform insert", membershipDataForInsert);

    const cleanMembershipDataForInsert = cleanObject(membershipDataForInsert);
    
    const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.MEMBER_TABLE,
        cleanMembershipDataForInsert
    );
    // console.log(queryForInsert);

    const valuesForInsertQuery = Object.values(cleanMembershipDataForInsert);

    try {
        // //locking the table
        // await client.query("LOCK TABLE integral.moedmember IN EXCLUSIVE MODE");
        await client.query(queryForInsert, [...valuesForInsertQuery]);
        res.send({ status: "sucess" });
    } catch (error) {
        console.error("Error during saveMember operation:", error);

        if (error.code === "40P01") {
            // Deadlock detected
            res.status(503).json({
                error: "The table is currently being updated by another transaction. Please try again later.",
            });
        } else if (error.code === "57014") {
            // Query canceled (could indicate lock timeout or manual cancellation)
            res.status(503).json({
                error: "The operation was canceled. Please try again later.",
            });
        } else {
            res.status(500).json({ error: "Operation failed" });
        }
    }
});

const postMemberDetail = catchAsync(async (req, res, next) => {
    // console.log(req.body, "and queryperameter:", req.query);
    const client = transactions[req.query.transactionId];

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }
    const getDirectorydata = transformDirectoryData(req.body);
    // console.log('directoryData',getDirectorydata)

    const directoryDataForInsert = cleanObject({
        ...getDirectorydata,
        member_id: req.body.member_id,
        member_no: req.body.member_no,
    });
    // console.log(directoryDataForInsert)
    const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
        directoryDataForInsert
    );
    // console.log("MemberDetail Data for insert : ", directoryDataForInsert);
    // console.log("MemberDetail insert query: ", queryForInsert);
    const valuesForInsertQuery = Object.values(directoryDataForInsert);
    try {
        await client.query(queryForInsert, [...valuesForInsertQuery]);
        res.send({ status: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.detail });
    }
});

const updateMemberDetail = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    const getDirectorydata = transformDirectoryData(req.body);
    const directoryDataForUpdate = cleanObject({
        ...getDirectorydata,
    });

    delete directoryDataForUpdate.individual_sno;

    // console.log("directoryData for update : ", directoryDataForUpdate);

    // Get the columns and values from the cleaned object
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
    } and individual_sno = $${columns.length + 2}`;

    // console.log("here updated query: ", query);

    try {
        // Execute the update query
        await client.query(query, [
            ...values,
            req.body.member_id,
            req.body.individual_sno,
        ]);
        res.send({ status: "successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const deleteMemberDetail = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];
    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }
    // console.log("member detail data for delete : ", req.body);

    const query = `Delete from ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} where member_id = $1 and individual_sno = $2`;

    try {
        await client.query(query, [
            req?.body?.member_id,
            req?.body?.individual_sno,
        ]);
        // console.log("Successfully deleted member detail");
        res.send({ status: "successfully delete" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.detail });
    }
});

const postFamilyDetail = catchAsync(async (req, res, next) => {
    // console.log(req.body, "and queryperameter:", req.query);
    const client = transactions[req.query.tansactionId];

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }
    // console.log("family detail data", req.body);
    const getFamilyDetailData = transformFamilyData(req.body);

    const familyDataForInsert = cleanObject({
        ...getFamilyDetailData,
        member_id: req.body.member_id,
        member_no: req.body.member_no,
    });

    const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.MEMBER_FAMILY_TABLE,
        familyDataForInsert
    );
    // console.log("family data for insert : ", queryForInsert);
    const valuesForInsertQuery = Object.values(familyDataForInsert);
    try {
        await client.query(queryForInsert, [...valuesForInsertQuery]);
        res.send({ status: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

const updateFamilyDetail = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    // console.log("family detail data", req.body);
    const getFamilyDetailData = transformFamilyData(req.body);

    const familyDataForUpdate = cleanObject({
        ...getFamilyDetailData,
    });
    delete familyDataForUpdate.individual_sno;
    delete familyDataForUpdate.family_member_sno;

    // console.log("family updated data", familyDataForUpdate);

    // Get the columns and values from the cleaned object
    const columns = Object.keys(familyDataForUpdate);
    const values = Object.values(familyDataForUpdate);

    // Create SET clause for SQL UPDATE query
    const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

    // Generate update full SQL query
    const query = `UPDATE ${
        TABLE_NAMES.MEMBER_FAMILY_TABLE
    } SET ${setClause} WHERE member_id = $${
        columns.length + 1
    } and individual_sno = $${columns.length + 2} and family_member_sno = $${
        columns.length + 3
    }`;
    // console.log("here updated query: ", query);

    try {
        // Execute the update query
        await client.query(query, [
            ...values,
            req.body.member_id,
            req.body.individual_sno,
            req.body.family_member_sno,
        ]);
        res.send({ status: "successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.detail });
    }
});

const deleteMemberFamilyDetail = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];
    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }
    // console.log("member detail data for delete : ", req.body);
    const query = `Delete from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1 and individual_sno = $2 and family_member_sno = $3`;
    try {
        await client.query(query, [
            req?.body?.member_id,
            req?.body?.individual_sno,
            req?.body?.family_member_sno,
        ]);
        res.send({ status: "successfully delete" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.detail });
    }
});

const setMemberNoOnSubmit = async (memberId, client) => {
    try {
        const getMemberId = await generateMemberNumber(client);
        await client.query(
            `update ${TABLE_NAMES.MEMBER_TABLE} set member_no = $1 where member_id = $2`,
            [getMemberId, memberId]
        );
        await client.query(
            `update ${TABLE_NAMES.MEMBER_DIRECTORY_TABLE} set member_no = $1 where member_id = $2`,
            [getMemberId, memberId]
        );
        const isFamilyDtlExist = await client.query(`select * from ${TABLE_NAMES.MEMBER_FAMILY_TABLE} where member_id = $1`, [memberId])
        if(isFamilyDtlExist?.rows?.length){
            await client.query(
                `update ${TABLE_NAMES.MEMBER_FAMILY_TABLE} set member_no = $1 where member_id = $2`,
                [getMemberId, memberId]
            );
        }
        return true
    } catch (error) {
        console.error(error);
        return false
    }
};

exports.commitTransaction = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];
    // console.log("Body Data :", req?.body);
    const onlyCommit = req?.query?.onlyCommit === "Y";
    const memberId = req?.query?.memberId;

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    try {
        if (onlyCommit) {
            const isMemberNoUpdated = await setMemberNoOnSubmit(memberId, client);
            if(!isMemberNoUpdated) return;

            await client.query("COMMIT"); // Commit the transaction
            client.end();
            delete transactions[req.query.transactionId];
            return res.json({ status: "committed" });
        } else {
            const getDirectoryData = transformDirectoryData(req.body);
            // console.log("after transformDirectoryData : ", getDirectoryData);
            // console.log("Directory data on submit:", getDirectoryData);

            const directoryDataForInsert = cleanObject({
                ...getDirectoryData,
                member_id: req?.body?.member_id,
                member_no: req.body.member_no,
            });
            // console.log("Final data for insert:", directoryDataForInsert);

            const queryForInsert = generateSingleInsertQuery(
                TABLE_NAMES.MEMBER_DIRECTORY_TABLE,
                directoryDataForInsert
            );
            const valuesForInsertQuery = Object.values(directoryDataForInsert);

            await client.query(queryForInsert, valuesForInsertQuery);
            const isMemberNoUpdated = await setMemberNoOnSubmit(req.body.member_id, client);
            if(!isMemberNoUpdated) return
            await client.query("COMMIT"); // Commit the transaction
            client.end();
            delete transactions[req.query.transactionId];
            return res.json({ status: "committed" });
        }
    } catch (error) {
        console.error("Commit failed:", error);
        if (client) {
            await client.query("ROLLBACK"); // Rollback the transaction on error
            client.end();
        }
        delete transactions[req.query.transactionId];
        return res.status(500).json({ error: "Commit failed" });
    }
});

exports.rollbackTransaction = catchAsync(async (req, res, next) => {
    const client = transactions[req?.query?.transactionId];

    if (!client) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    try {
        await client.query("ROLLBACK"); // Rollback the transaction
        client.end();
        delete transactions[req.query.transactionId];
        return res.json({ status: "rolled back" });
    } catch (error) {
        console.error("Rollback failed:", error);
        if (client) {
            client.end();
        }
        delete transactions[req.query.transactionId];
        return res.status(500).json({ error: "Rollback failed" });
    }
});

exports.handleTransaction = catchAsync(async (req, res, next) => {
    // console.log(req.query);
    if (req?.query?.transaction === "start") {
        exports.startTransaction(req, res, next);
        return;
    }
    if (req?.query?.cancelTransaction === "Y") {
        exports.rollbackTransaction(req, res, next);
        return;
    }
});


exports.handlePostData = catchAsync(async (req, res, next) => {
    if (!req?.query?.block) {
        saveMember(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "member_detail") {
        postMemberDetail(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "update_member_detail") {
        updateMemberDetail(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "delete_member_detail") {
        deleteMemberDetail(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "family_detail") {
        postFamilyDetail(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "update_family_detail") {
        updateFamilyDetail(req, res, next);
    } else if (req?.query?.block && req?.query?.block === "delete_family_detail") {
        deleteMemberFamilyDetail(req, res, next);
    }
});
