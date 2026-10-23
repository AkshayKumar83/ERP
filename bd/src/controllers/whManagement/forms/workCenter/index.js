const { error } = require("pdf-lib");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformWarehouseToDbData, transformSkillSetToDbData, transformMcRateToDbData } = require("./presentation");

const TABLE_NAMES = {
  MOMMWC_TABLE: "mommwc",
  MDMMWC_TABLE: "mdmmwc",
  MOEMWC_SKILL_TABLE:'moemwc_skill',
};

 // dropDownData
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {

  const divisionList = await db.query(
   ` select name, division_id from moitdivision order by 1`
  );
  // console.log("genflag:", genList.rows);
  // console.log("genflag:", genList?.rows[0].gen_flag);

    const departmentList = await db.query(
    ` select department, dept_cd from mhpmdept order by 1 `
     );
  // console.log("controlacc:", controlList.rows);
  return res.status(200).json({
    divisionID: divisionList.rows,
    department:departmentList.rows,
    
  });
});

    // WCID genrate function 
exports.handleGenWcId = catchAsync(async (req, res, next) => {
    try {
        const result = await db.query(`SELECT nextval('s_MOMMWC_wc_id') AS wc_id`);

        if (result.rows.length > 0) {
            const nextWcId = result.rows[0].wc_id;

            return res.status(200).json({
                type: "success",
                wc_id: nextWcId,
            });
        } else {
            throw new Error("Failed to generate Work Center ID");
        }
    } catch (error) {
        console.error("Error generating Work Center ID:", error);
        return res.status(500).json({
            type: "error",
            message: error.message || "Internal server error during sequence generation.",
        });
    }
});

const helpListData = async (req, res) => {
    const { help_list , wc_id: wcId, form_status } = req?.query;

    if (help_list === "mainWorkCenter") {
        const mainWorkCenterList = await db.query(
          `SELECT wc_id, wc_no, description 
            FROM mommwc 
            WHERE main_wc_id IS NULL 
            AND store_process = 'P' 
            AND wc_id != COALESCE($1, 0)`,
            [wcId]  
        );

        return res.status(200).send(mainWorkCenterList.rows);
    }
    else if (help_list === "skillDesc") {
     const skilldescList = await db.query(
     `select skill_id,skill_desc,skill_type from moemskillset order by skill_desc`
        );
        return res.status(200).send(skilldescList.rows); 
    }
       // below  for Searching
    else if (help_list === "wcNo") {
     const WcNoAnddescList = await db.query(
     `select wc_no ,description from mommwc order by wc_no `
        );
        return res.status(200).send(WcNoAnddescList.rows); 
    }
    else if (help_list === "Desc") {
     const WcNoAnddescList = await db.query(
     `select wc_no, description from mommwc order by description `
        );
        return res.status(200).send(WcNoAnddescList.rows); 
    }
};

   // queryDataFunctio
const getDataOnquery = async (req, res) => {
     const { formStatus, appDivisionId, appFinYear, userId } = req.query

let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["wc_no",'description'];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }
       
  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;
 

    try {
        let queryParameter = `ORDER BY wc_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
        let dataCount;

        if(whereClauses.length > 0) {
                     const getCount = await db.query(
                         `SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMWC_TABLE} ${queryValues}`
                       );
                       dataCount = getCount.rows[0]?.count;
                       queryParameter = `${queryValues} ${queryParameter}`;
                      
               } else {
        switch (req?.query?.get_data) {
            case "Query":
            case "First": {
                const getCount = await db.query(`SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMWC_TABLE}`);
                dataCount = getCount.rows[0]?.count;
                break;
            }
            case "Last": {
                queryParameter = "ORDER BY wc_id DESC LIMIT 1";
                break;
            }
            default:
                queryParameter = `ORDER BY wc_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
                break;
        }
    }

        const getMOMMWCData = await db.query(`SELECT * FROM ${TABLE_NAMES.MOMMWC_TABLE} ${queryParameter}`);

        if (getMOMMWCData.rowCount === 0) {
            return res.status(200).json({
                type: "not_found",
                message: 'No data found',
                 count: dataCount || 0,
            });
        }

        const mommwcData = getMOMMWCData.rows[0];

           // Step 3: Post Query Logic for 
        let sub_work_centre = mommwcData.main_wc_id == null ? 'N' : 'Y';

        let work_centre_no = null;

        if (mommwcData.main_wc_id != null) {
            const wcResult = await db.query(`SELECT wc_no FROM ${TABLE_NAMES.MOMMWC_TABLE} WHERE wc_id = $1`, [mommwcData.main_wc_id]);

            if (wcResult.rowCount > 0) {
                work_centre_no = wcResult.rows[0].wc_no;
            }
        }

        const getMDMMWCData = await db.query(`SELECT * FROM ${TABLE_NAMES.MDMMWC_TABLE} WHERE wc_id = $1 AND FIN_ENGG = 'E'`, [mommwcData.wc_id]);
        const mcRateDataArray = getMDMMWCData.rows || [];

        // const getSkillData = await db.query(`SELECT * FROM ${TABLE_NAMES.MOEMWC_SKILL_TABLE} WHERE wc_id = $1`, [mommwcData.wc_id]);
        // const skillDataArray = getSkillData.rows || [];

        const getSkillData = await db.query(`
            SELECT 
                ws.*, 
                ms.skill_desc, 
                ms.skill_type
            FROM moemwc_skill ws
            LEFT JOIN moemskillset ms ON ws.skill_id = ms.skill_id
            WHERE ws.wc_id = $1
            `, [mommwcData.wc_id]);

const skillDataArray = getSkillData.rows || [];

        return res.status(200).json({
            type: "found",
            mommwcData: mommwcData, //  single object
            sub_work_centre: sub_work_centre, //  Post Query Field
            work_centre_no: work_centre_no, //  Post Query Field
            mdmmwcData: mcRateDataArray, // array
            moemwcSkillData: skillDataArray,// array
            count: dataCount,
        });

    } catch (error) {
        console.error("Error in getWorkCenterDataOnQuery:", error);
        return res.status(500).json({ message: "Internal server error on query" });
    }
};

   //  Work Center Validation
const checkDuplicateWorkCenter = async (req, res) => {
    try {
        const { wc_no, wc_id } = req.query;

        if (!wc_no || wc_no.trim() === '') {
            return res.status(400).json({ exists: false, message: 'Work Centre cannot be null' });
        }

        const duplicateQuery = `
            SELECT wc_id FROM mommwc 
            WHERE wc_no = $1 AND wc_id != COALESCE($2, 0)
        `;

        const duplicateResult = await db.query(duplicateQuery, [wc_no, wc_id]);

        if (duplicateResult.rowCount > 0) {
            return res.json({ exists: true });  // duplicate hai
        } else {
            return res.json({ exists: false }); // duplicate nahi hai
        }

    } catch (error) {
        console.error('Duplicate Check wc_no:', error);
        return res.status(500).json({error: 'Database query failed'});
    }
};

   // Duplicate Check for Machine Rate and Effective Date

const checkDuplicateMcRate = async (req, res) => {
    try {
        const { wc_id, wef_date, fin_engg, ctid } = req.query;

        if (!wc_id || !wef_date || !fin_engg) {
            return res.status(400).json({ type: 'error', message: 'Missing required parameters' });
        }

        const duplicateQuery = `
            SELECT ctid FROM mdmmwc
            WHERE wc_id = $1
            AND wef_date = $2
            AND fin_engg = $3
            LIMIT 1
        `;

        const result = await db.query(duplicateQuery, [wc_id, wef_date, fin_engg]);

        if (result.rowCount > 0) {
            const existingCtid = result.rows[0].ctid;

            // Insert case
            if (!ctid) {
                return res.status(400).json({ type: 'error', message: `Machine rate already defined with this Effective Date(${wef_date})` });
            }

            // Update case but different row
            if (ctid && ctid !== existingCtid) {
                return res.status(400).json({ type: 'error', message: `Machine rate already defined with this Effective Date(${wef_date})` });
            }
        }

        return res.status(200).json({ type: 'success', message: 'No duplicate found' });

    } catch (error) {
        console.error("Error in checkDuplicateMcRate:", error);
        return res.status(500).json({ type: 'error', message: 'Internal server error' });
    }
};

const checkDuplicateSkillId = async (req, res) => {
  try {
    const { wc_id, skill_id } = req.query;

    if (!wc_id || !skill_id) {
      return res.status(400).json({ type: "error", message: "Missing required parameters (wc_id or skill_id)" });
    }

    const query = `
      SELECT 1 FROM moemwc_skill
      WHERE wc_id = $1 AND skill_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [wc_id, skill_id]);

    if (result.rowCount > 0) {
      return res.status(200).json({
        type: "error",
        message: "Description already exists in the table",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "No duplicate found",
    });

  } catch (error) {
    console.error("Error in checkDuplicateSkillId:", error);
    return res.status(500).json({ type: "error", message: "Internal server error" });
  }
};


const postworkCenter = async (req, res) => {
    const { formData, mcRateData, skillSetData } = req.body;
    // console.log("Form Data:", formData);
    // console.log("Machine Rate Data:", mcRateData);
    // console.log("Skill Set Data:", skillSetData);

    try {
        await db.query('BEGIN');

        const seqResult = await db.query(`SELECT nextval('s_MOMMWC_wc_id') AS wc_id`);
           formData.wc_id = seqResult.rows[0].wc_id;
    
             //  Validation
        if (formData.sub_work_centre === 'Y') {

              // work_centre_no should not be null
            if (!formData.work_centre_no || formData.work_centre_no.trim() === '') {
                throw new Error('Main work centre can not be null');
            }

              // work_centre_no must exist in mommwc table
            const mainWcResult = await db.query(
                `SELECT wc_id FROM ${TABLE_NAMES.MOMMWC_TABLE} WHERE wc_no = $1`,
                [formData.work_centre_no]
            );

            if (mainWcResult.rowCount === 0) {
                throw new Error('Work centre no is not found');
            }

            // Assign main_wc_id in formData
            formData.main_wc_id = mainWcResult.rows[0].wc_id;
        }

        // Store No Generation
        let finalStoreNo = formData.store_no;

        if (formData.store_process === 'S' && (!finalStoreNo || finalStoreNo.trim() === '')) {
           const result = await db.query(`SELECT COALESCE(MAX(CAST(NULLIF(store_no, '') AS INTEGER)), 0) AS max_store_no FROM mommwc`);
            const maxStoreNo = result.rows[0].max_store_no;

            if (maxStoreNo < 9) {
                finalStoreNo = '0' + (maxStoreNo + 1);
            } else {
                finalStoreNo = '' + (maxStoreNo + 1);
            }
        } else if (formData.store_process !== 'S') {
            finalStoreNo = null;
        }

        // Insert into MOMMWC table
        let workCenterData = transformWarehouseToDbData({ ...formData, store_no: finalStoreNo });
        const workCenterInsertQuery = generateSingleInsertQuery(TABLE_NAMES.MOMMWC_TABLE, workCenterData);
        const workCenterValForInsertQuery = Object.values(workCenterData);

        // console.log("Insert MOMMWC Query:", workCenterInsertQuery);
        // console.log("Values:", workCenterValForInsertQuery);

        await db.query(workCenterInsertQuery, [...workCenterValForInsertQuery]);

        //  Only insert mcRateData and skillSetData if store_process === 'P'
        if (formData.store_process === 'P') {

            // Insert into MDMMWC table
            for (let row of mcRateData) {
                let rateData = transformMcRateToDbData({ ...row, wc_id: formData.wc_id });
                const rateInsertQuery = generateSingleInsertQuery(TABLE_NAMES.MDMMWC_TABLE, rateData);

                // console.log("Insert MDMMWC Query:", rateInsertQuery);
                await db.query(rateInsertQuery, [...Object.values(rateData)]);
            }

            // Insert into MOEMWC_SKILL table
            if (skillSetData && skillSetData.length) {
                for (let row of skillSetData) {
                    if (row?.skill_id) { // Yeh null, undefined, blank sab check karega
                        let skillRow = transformSkillSetToDbData({ ...row, wc_id: formData.wc_id });
                        const skillInsertQuery = generateSingleInsertQuery(TABLE_NAMES.MOEMWC_SKILL_TABLE, skillRow);

                        // console.log("Insert MOEMWC_SKILL Query:", skillInsertQuery);
                        await db.query(skillInsertQuery, [...Object.values(skillRow)]);
                    }
                }
            }
        }

        await db.query('COMMIT');
        return res.status(200).json({ type: 'success', message: 'Work Center inserted successfully' });

    } catch (error) {
        console.error("Database Error:", error);
        await db.query("ROLLBACK");
        return res.status(400).json({ type: 'error', message: error.message || "Some error occurred" });
    }
};

const updateWorkCenter = async (req, res) => {
    const { formData, mcRateData, skillSetData } = req.body;

    // console.log("Form Data:", formData);
    // console.log("Machine Rate Data:", mcRateData);
    // console.log("Skill Set Data:", skillSetData);

    try {
        await db.query('BEGIN');

         if (formData.sub_work_centre === 'Y') {
      if (!formData.work_centre_no || formData.work_centre_no.trim() === '') {
        throw new Error('Main work centre cannot be null');
      }

      const mainWcResult = await db.query(
        `SELECT wc_id FROM ${TABLE_NAMES.MOMMWC_TABLE} WHERE wc_no = $1`,
        [formData.work_centre_no]
      );

      if (mainWcResult.rowCount === 0) {
        throw new Error('Work centre no is not found');
      }

      formData.main_wc_id = mainWcResult.rows[0].wc_id;
    } else {
      formData.main_wc_id = null;
    }

        // Update Main Table
        let workCenterData = transformWarehouseToDbData({ ...formData });
        const columns = Object.keys(workCenterData);
        const values = Object.values(workCenterData);

        const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');

        const updateQuery = `
            UPDATE ${TABLE_NAMES.MOMMWC_TABLE}
            SET ${setClause}
            WHERE wc_id = $${columns.length + 1}
        `;

        await db.query(updateQuery, [...values, formData.wc_id]);

        // Process Child Tables (MC Rate + Skill Set)
        if (formData.store_process === 'P') {

            //  MC Rate Table - Delete Old & Insert New
            await db.query(`DELETE FROM ${TABLE_NAMES.MDMMWC_TABLE} WHERE wc_id = $1`, [formData.wc_id]);

            if (mcRateData && mcRateData.length) {
                for (let row of mcRateData) {
                    if (row?.mc_hr_rate) {
                        let rateData = transformMcRateToDbData({ ...row, wc_id: formData.wc_id });
                        const rateInsertQuery = generateSingleInsertQuery(TABLE_NAMES.MDMMWC_TABLE, rateData);
                        await db.query(rateInsertQuery, [...Object.values(rateData)]);
                    }
                }
            }

            //  Skill Set Table - Delete Old & Insert New
            await db.query(`DELETE FROM ${TABLE_NAMES.MOEMWC_SKILL_TABLE} WHERE wc_id = $1`, [formData.wc_id]);

            if (skillSetData && skillSetData.length) {
                for (let row of skillSetData) {
                    if (row?.skill_id) {
                        let skillRow = transformSkillSetToDbData({ ...row, wc_id: formData.wc_id });
                        const skillInsertQuery = generateSingleInsertQuery(TABLE_NAMES.MOEMWC_SKILL_TABLE, skillRow);
                        await db.query(skillInsertQuery, [...Object.values(skillRow)]);
                    }
                }
            }

            //  Automatically Update Machine Hour Rate in Process Tab
            if (mcRateData.length > 0) {
                const latestRate = mcRateData[mcRateData.length - 1]?.mc_hr_rate || 0;

                await db.query(`
                    UPDATE ${TABLE_NAMES.MOMMWC_TABLE}
                    SET machine_hour_rate = $1
                    WHERE wc_id = $2
                `, [latestRate, formData.wc_id]);
            }
        }

        await db.query('COMMIT');
        return res.status(200).json({ type: 'success', message: 'Work Center updated successfully' });

    } catch (error) {
        console.error("Database Error:", error);
        await db.query('ROLLBACK');
        return res.status(400).json({ type: 'error', message: error.message || "Some error occurred" });
    }
};

// validation for main work centre
exports.validateMainWorkCenter = catchAsync(async (req, res, next) => {
    try {
        const { sub_work_centre, work_centre_no } = req.query;

        if (sub_work_centre !== 'Y') {
            // If sub_work_centre is not 'Y', no validation required
            return res.status(200).json({ type: 'success', message: 'Validation not required' });
        }

        if (!work_centre_no || work_centre_no.trim() === '') {
            return res.status(400).json({ type: 'error', message: 'Main work centre cannot be null' });
        }

        // Check if work_centre_no exists in mommwc table
        const mainWcResult = await db.query(
            `SELECT wc_id FROM ${TABLE_NAMES.MOMMWC_TABLE} WHERE wc_no = $1`,
            [work_centre_no]
        );

        if (mainWcResult.rowCount === 0) {
            return res.status(404).json({ type: 'error', message: 'Work centre no is not found' });
        }

        // Success
        return res.status(200).json({
            type: 'success',
            message: 'Main work centre is valid',
            main_wc_id: mainWcResult.rows[0].wc_id 
        });

    } catch (error) {
        console.error("Error in validateMainWorkCenter API:", error);
        return res.status(500).json({ type: 'error', message: 'Internal server error' });
    }
});


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (["Query", "Search"].includes(req?.query?.formStatus)) { 
        await getDataOnquery(req, res);
        return;
    }

    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
        if (req?.query?.wc_no) {
            await checkDuplicateWorkCenter(req, res);
            return;
        }

    if (req?.query?.check_duplicate === "mc_rate") {
        await checkDuplicateMcRate(req, res);
        return;
    }
    if (req?.query?.check_duplicate === "skill_id") {
        await checkDuplicateSkillId(req, res);
        return;
    }

});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateWorkCenter(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postworkCenter(req, res);
        return;
    }
});


