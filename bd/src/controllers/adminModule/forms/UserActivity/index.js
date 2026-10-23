const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  USER_ACTIVITY: "integral.user_activity",
  MODULE_TABLE: "integral.module_info",
  USER_MASTER: "integral.user_master",
  PROGRAM_ACTIVITY: "integral.program_activity"


};

const { transToUserActivityDbData, transToProgramActivityDbData } = require("./presentation")

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const { appUserId } = req.query

  const moduleList = await db.query(
    `select submod_form_name, program_id, module_name from module_info where module_flag = 'M'
and $1 in (select user_id from user_master where type_user = 'N' and active = 'Y')
union
select submod_form_name, program_id, module_name from module_info where module_flag = 'M' and 
$1 in (select user_id from user_master where type_user = 'S' and active = 'Y')  
`, [appUserId]
  );

  //console.log("moduleList:", moduleList.rows);
  return res.status(200).json({
    modules: moduleList.rows,
  });
});

exports.getSubmoduleDataByModule = catchAsync(async (req, res) => {

  const { program_id } = req.query

  // module data 

  const moduleData = await db.query(`SELECT * FROM ${TABLE_NAMES.MODULE_TABLE} WHERE program_id = $1`,
    [program_id]
  )

  const moduleName = moduleData.rows[0]?.module_name

  //  submodule data
  const subModuleData = await db.query(
    `SELECT submod_form_name, program_id
   FROM ${TABLE_NAMES.MODULE_TABLE} 
    where module_flag = 'S' and module_name = $1 
   `,
    [moduleName]
  );
  response = {
    subModuleData: subModuleData.rows || [],

  };

  return res.send(response);
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;
  console.log('this function called', formStatus)

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  try {
    let queryParameter = `ORDER BY login_name OFFSET ${req.query.offset || 0
      }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["login_name"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    //console.log("whereClauses", whereClauses);


    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);


    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.USER_MASTER}
                `)

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.USER_MASTER} ${queryValues};
                      `
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.USER_MASTER}
                      `,

      );
      recordCount = getCount.rows[0]?.count;
    }
    // QUERY DATA

    // for USER_Mster
    const userData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.USER_MASTER} ${queryParameter}
 `
    );

    if (userData.rowCount == 0) {
      return res.status(400).json({ success: false, message: "No matching record found", userData: [], recordCount: 0 });
    }

    const userId = userData.rows[0]?.user_id

    // for Module_info
    const moduleData = await db.query(`SELECT * FROM ${TABLE_NAMES.MODULE_TABLE} where module_flag not in('M', 'S') order by program_desc `)

    const programId = moduleData.rows[0]?.program_id

    // for program activity data
    const programData = await db.query(`
  SELECT * 
  FROM integral.program_activity 
 -- where activity_id not in (select activity_id 

 -- from user_activity where program_id = $1 and user_id = $2
 -- )
 
`,
// [programId, userId]
);

    // post query data 

    if (programData.rows.length > 0) {
      await Promise.all(
        programData.rows.map(async (item) => {
          if (item.activity_id !== null) {
            const activityDesc = await db.query(
              ` 		select activity_disp_name from activity_master
    where activity_id= $1`,
              [item.activity_id]
            );

            item.activity_disp_name =
              activityDesc.rowCount > 0 ? activityDesc.rows[0].activity_disp_name : "";
          }
        })
      );
    }

const userActivityData = await db.query(` SELECT 
    ua.*,
    COALESCE(am.activity_disp_name, '') AS activity_disp_name
  FROM user_activity ua
  LEFT JOIN activity_master am
    ON am.activity_id = ua.activity_id`)

    // post query data 

    // if (userActivityData.rows.length > 0) {
    //   await Promise.all(
    //     userActivityData.rows.map(async (item) => {
    //       if (item.activity_id !== null) {
    //         const activityDesc = await db.query(
    //           ` 		select activity_disp_name from activity_master
    // where activity_id= $1`,
    //           [item.activity_id]
    //         );

    //         item.activity_disp_name =
    //           activityDesc.rowCount > 0 ? activityDesc.rows[0].activity_disp_name : "";
    //       }
    //     })
    //   );
    // }

    const responseData = {
      userData: userData.rows,
      moduleData: moduleData.rows,
      programData: programData.rows,
      userActivityData: userActivityData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getSubmoduleData = catchAsync(async (req, res) => {
  const { module, program_id, submodule } = req.query;

  try {
    if (module) {
      console.log("module:", module);

      const submoduleList = await db.query(
        `SELECT submod_form_name 
           FROM integral.module_info 
           WHERE module_flag = 'S' AND module_name = $1`,
        [module]
      );

      console.log("submoduleList:", submoduleList.rows);
      const programdescList = await db.query(
        `select program_desc from integral.module_info where program_id = $1 and module_flag = 'M'`,
        [module]
      );

      console.log("programdescList:", programdescList.rows);

      return res.status(200).json({
        submodules: submoduleList.rows,
        programDescData: programdescList.rows,
      });
    }

    if (submodule) {
      const programdescList = await db.query(
        `select program_desc from integral.module_info where submod_form_name = $1 and module_flag = 'S'`,
        [submodule]
      );

      console.log("programdescList:", programdescList.rows);
      return res.status(200).json({
        programDescData: programdescList.rows,
      });
    }

    if (program_id) {
      console.log("program_id:", program_id);

      const activityDescData = await db.query(
        `SELECT *
           FROM integral.activity_master  
           WHERE activity_id IN (
               SELECT activity_id 
               FROM integral.program_activity 
               WHERE program_id = $1
           )`,
        [program_id]
      );

      console.log("programActivityDescData:", activityDescData.rows);

      return res.status(200).json({
        programActivityDescData: activityDescData.rows,
      });
    }
  } catch (error) {
    console.log("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getUserName = catchAsync(async (req, res) => {
  const { login_name, program_id, selectedUserId } = req.query;

  try {
    if (login_name) {
      const userNameData = await db.query(
        `SELECT * FROM integral.user_master WHERE login_name = $1`,
        [login_name]
      );

      if (userNameData.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        userName: userNameData.rows[0].user_name,
      });
    }

    // Fetch user activity data using `program_id` and `userId`
    if (program_id && selectedUserId) {
      console.log("selecteduserid", selectedUserId);
      console.log("programid", program_id);
      const userActivityData = await db.query(
        `SELECT * 
           FROM integral.activity_master  
           WHERE activity_id IN (
               SELECT activity_id 
               FROM integral.user_activity 
               WHERE program_id = $1 AND user_id = $2)`,
        [program_id, selectedUserId]
      );

      console.log("newuseractivity:", userActivityData.rows);

      return res.status(200).json({
        userActivityDescData: userActivityData.rows,
      });
    } else {
      return res
        .status(400)
        .json({ message: "login_name or program_id is required" });
    }
  } catch (error) {
    console.log("Error due to fetching data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// const updateUserActivityData = async (req, res) => {

//   try {
//     const { formData, userActivityData, selectedProgramId, removedActivities } = req.body;


//     // for inserting userActivityData

//     if (Array.isArray(userActivityData) && userActivityData.length) {

//       //  Keep only records WITHOUT create_id and create_date
//       const filteredData = userActivityData.filter(
//         (record) => !record.create_id && !record.create_date
//       );


//       console.log('userActivityData', filteredData);

//       for (const [index, record] of filteredData.entries()) {

//         const dbData = transToUserActivityDbData(record);

//         const queryForInsert = generateSingleInsertQuery(
//           TABLE_NAMES.USER_ACTIVITY,
//           dbData
//         );

//         const valuesForInsertQuery = Object.values(dbData);

//         console.log('record.form_rep_id', record.form_rep_id)
//         console.log('formData.user_id', formData.user_id)


//         try {
//           const result = await db.query(queryForInsert, valuesForInsertQuery);

//         } catch (error) {
//           throw new Error(`Insert error at index ${index}: ${error.message}`);
//         }
//       }
//     }



//     // remove activities from user_activity table 

//     if (Array.isArray(removedActivities) && removedActivities.length) {
//       console.log("DELETE LOOP COUNT:", removedActivities.length);
//       for (const d of removedActivities) {
//        const result =   await db.query(
//           `DELETE FROM ${TABLE_NAMES.USER_ACTIVITY}
//                 WHERE activity_id = $1 and program_id = $2 AND user_id = $3`,
//           [d.activity_id, d.program_id, d.user_id]
//         );

//         console.log("DELETE REQUEST:", {
//           user_id: d.user_id,
//           program_id: d.program_id,
//           activity_id: d.activity_id
//         });

//         console.log("ROWS DELETED:", result.rowCount);
//         console.log("DELETED DATA:", result.rows);
//       }
//     } else if (removedActivities) {
//       await db.query(
//         `DELETE FROM ${TABLE_NAMES.USER_ACTIVITY}
//                WHERE activity_id = $1 and program_id = $2 AND user_id = $3`,
//         [removedActivities.activity_id, removedActivities.program_id, removedActivities.user_id]
//       );
//     }

//     res.status(200).json({ message: "Data updated successfully" });

//   } catch (error) {
//     console.error("Transaction error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };  

const updateUserActivityData = async (req, res) => {
  try {
    const {
      formData,
      userActivityData,
      selectedProgramId,
      removedActivities
    } = req.body;

    // ================================
    // INSERT USER ACTIVITY
    // ================================
    if (Array.isArray(userActivityData) && userActivityData.length) {

      // Keep only records WITHOUT create_id and create_date
      const filteredData = userActivityData.filter(
        (record) => !record.create_id && !record.create_date
      );

      console.log("userActivityData:", filteredData);

      for (const [index, record] of filteredData.entries()) {

        const dbData = transToUserActivityDbData(record);

        try {
          // ==========================================
          // CHECK DUPLICATE BEFORE INSERT
          // ==========================================
          const duplicateCheck = await db.query(
            `SELECT 1
             FROM ${TABLE_NAMES.USER_ACTIVITY}
             WHERE user_id = $1
               AND program_id = $2
               AND activity_id = $3
             LIMIT 1`,
            [
              dbData.user_id,
              dbData.program_id,
              dbData.activity_id
            ]
          );

          // Already exists → do not insert
          if (duplicateCheck.rows.length > 0) {
            console.log("DUPLICATE - SKIPPING INSERT:", {
              user_id: dbData.user_id,
              program_id: dbData.program_id,
              activity_id: dbData.activity_id
            });

            continue;
          }

          // ==========================================
          // INSERT ONLY IF NOT ALREADY EXISTS
          // ==========================================
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.USER_ACTIVITY,
            dbData
          );

          const valuesForInsertQuery = Object.values(dbData);

          const result = await db.query(
            queryForInsert,
            valuesForInsertQuery
          );

          console.log("INSERTED:", {
            user_id: dbData.user_id,
            program_id: dbData.program_id,
            activity_id: dbData.activity_id
          });

            await db.query(`call insert_user_activity($1, $2)`, [record?.user_id, record?.program_id])

        } catch (error) {
          throw new Error(
            `Insert error at index ${index}: ${error.message}`
          );
        }
      }
    }

    // ================================
    // REMOVE USER ACTIVITIES
    // ================================
    if (Array.isArray(removedActivities) && removedActivities.length) {

      console.log(
        "DELETE LOOP COUNT:",
        removedActivities.length
      );

      for (const d of removedActivities) {

        const result = await db.query(
          `DELETE FROM ${TABLE_NAMES.USER_ACTIVITY}
           WHERE activity_id = $1
             AND program_id = $2
             AND user_id = $3`,
          [
            d.activity_id,
            d.program_id,
            d.user_id
          ]
        );

        console.log("DELETE REQUEST:", {
          user_id: d.user_id,
          program_id: d.program_id,
          activity_id: d.activity_id
        });

        console.log("ROWS DELETED:", result.rowCount);
      }

    } else if (removedActivities) {

      await db.query(
        `DELETE FROM ${TABLE_NAMES.USER_ACTIVITY}
         WHERE activity_id = $1
           AND program_id = $2
           AND user_id = $3`,
        [
          removedActivities.activity_id,
          removedActivities.program_id,
          removedActivities.user_id
        ]
      );
    }

    res.status(200).json({
      message: "Data updated successfully"
    });

  } catch (error) {
    console.error("Transaction error:", error);

    res.status(500).json({
      error: error.message
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  // await getDataOnQuery(req, res);
  // return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateUserActivityData(req, res);
    return;
  } else {
    await postUserActivityData(req, res);
    return;
  }
});

