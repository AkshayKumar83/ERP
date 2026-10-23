const { response } = require("express");
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../utility/query");
//const { SnowDeviceManagement } = require("aws-sdk");
const {
  transToTdpmincrDbData,
  transToMhpmempmDbData,
} = require("./presentation");

const TABLE_NAMES = {
  MHPMEMPM: "MHPMEMPM",
  TDPMINCR: "tdpmincr",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY emp_cd  OFFSET ${req.query.offset || 0}`;

    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.MHPMEMPM}`
    );
    let dataCount = getCount.rows[0]?.count;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["emp_cd"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MHPMEMPM}`
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MHPMEMPM}`
      );
      dataCount = getCount.rows[0]?.count;
    }

    // switch (req?.query?.get_data) {
    //   case "Query":
    //   case "First": {
    //     const getCount = await db.query(
    //       `SELECT COUNT(*) FROM ${TABLE_NAMES.TOFMINVSUMM}`
    //     );
    //     dataCount = getCount.rows[0]?.count;
    //     break;
    //   }

    //   case "Last": {
    //     queryParameter = "ORDER BY INV_DT  DESC LIMIT 1";
    //     break;
    //   }

    //   default:
    //     queryParameter = `ORDER BY INV_DT  LIMIT 1 OFFSET ${
    //       req.query.offset || 0
    //     }`;
    //     break;
    // }

    const employeeData = await db.query(
      `select * from ${TABLE_NAMES.MHPMEMPM} ${queryParameter} `
    );

    // ---------------------------post query data----------------------------------

    const empCode = employeeData.rows[0]?.emp_cd;

    const deptCode = employeeData.rows[0]?.p_dept;

    const desigCode = employeeData.rows[0]?.p_desig;

    const gradeCode = employeeData.rows[0]?.p_grade;

    const categoryCode = employeeData.rows[0]?.p_category;

    const deptData = await db.query(
      `	 SELECT DEPARTMENT 
    FROM MHPMDEPT 
    WHERE DEPT_CD = $1
    `,
      [deptCode]
    );

    console.log("dept data", deptData.rows);

    employeeData.rows[0].p_department =
      deptData.rowCount > 0 ? deptData.rows[0]?.department : "";

    const desigData = await db.query(
      `	  SELECT DESCRIPTION
  FROM VWEMPDSG 
  WHERE CODE = $1
    `,
      [desigCode]
    );

    employeeData.rows[0].p_desig_desc =
      desigData.rowCount > 0 ? desigData.rows[0]?.description : "";

    const gradeData = await db.query(
      `	  SELECT DESCRIPTION
   FROM VWEMPGRD 
   WHERE CODE = $1
    `,
      [gradeCode]
    );

    employeeData.rows[0].p_grade_desc =
      gradeData.rowCount > 0 ? gradeData.rows[0]?.description : "";

    const catData = await db.query(
      ` SELECT DESCRIPTION 
   FROM VWEMPCAT 
   WHERE CODE = $1
    `,
      [categoryCode]
    );

    employeeData.rows[0].p_cat_desc =
      catData.rowCount > 0 ? catData.rows[0]?.description : "";

    const increamentData = await db.query(
      `select * from  ${TABLE_NAMES.TDPMINCR} where emp_cd = $1`,
      [empCode]
    );

    if (increamentData.rows.length > 0) {
      await Promise.all(
        increamentData.rows.map(async (item) => {
          // ✅ format eff_date per row
          item.eff_date = item.eff_date ? dateFormater(item.eff_date) : null;

          const descData = await db.query(
            ` 	select description from vwempcat
where code = $1`,
            [item.empCode]
          );

          item.category_desc =
            descData.rowCount > 0 ? descData.rows[0].description : "";

          if (item.desgn !== null) {
            const desgDesc = await db.query(
              ` 	SELECT DESCRIPTION FROM VWEMPDSG
   WHERE CODE = desgn`,
              [item.desgn]
            );

            item.desg_desc =
              desgDesc.rowCount > 0 ? desgDesc.rows[0].description : "";
          }

          if (item.grade_cd !== null) {
            const gradDesc = await db.query(
              `  SELECT DESCRIPTION  FROM VWEMPGRD
   WHERE CODE = $1`,
              [item.grade_cd]
            );

            item.grad_desc =
              gradDesc.rowCount > 0 ? gradDesc.rows[0].description : "";
          }

          if (item.rating_cd !== null) {
            const ratDesc = await db.query(
              `  SELECT RATING_DESC  FROM MOPMAPPR_RAT WHERE RATING_CD = $1`,
              [item.rating_cd]
            );

            item.rating_desc =
              ratDesc.rowCount > 0 ? ratDesc.rows[0].rating_desc : "";
          }

          if (item.update_in_month !== null) {
            const monthData = await db.query(
              ` select month_name  from mopmmonths
  	where month_no = $1`,
              [item.update_in_month]
            );

            item.month_name =
              monthData.rowCount > 0 ? monthData.rows[0].month_name : "";
          }
        })
      );
    }

    const response = {
      employeeData: employeeData.rows[0],
      increamentData: increamentData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const helpListData = async (req, res) => {
  let {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    category,
  } = req.query;  


  if(category === null && category === '') {
    return
  }

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "emp") {
    try {
      const empData = await db.query(
        `	SELECT EMP_NAME, EMP_CD FROM MHPMEMPM ORDER BY 2   
         `
      );

      return res.status(200).json(empData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "cat") {
    try {
      const catData = await db.query(
        `	SELECT DESCRIPTION,CODE FROM VWEMPcat ORDER BY 1
	
         `
      );

      return res.status(200).json(catData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "grade") {
    try {
      const gradeData = await db.query(
        `select g.description, code from vwEmpGrd g ,mopmcatgrd m 
where g.code=m.grd_no
and m.cat_no= coalesce($1, m.cat_no)
order by 1  
	
         `,
        [category]
      );

      return res.status(200).json(gradeData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "desig") {
    try {
      const desigData = await db.query(
        `	select g.description, g.code from vwEmpDsg g, mopmcatdsg m
where g.code=m.dsg_no
  and m.cat_no= coalesce($1, m.cat_no)
order by 1

         `,
        [category]
      );

      return res.status(200).json(desigData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};

exports.getValidateData = catchAsync(async (req, res) => {
  try {
    const { emp_cd } = req.query;

    if (!emp_cd) {
      return res.status(400).json({ message: "emp_cd is required" });
    }

    const query = `
      SELECT
        e.emp_name,
        e.p_desig,
        dsg.description AS p_desig_desc,
        e.p_dept,
        dept.department AS p_department,
        e.p_grade,
        grd.description AS p_grade_desc,
        e.p_category,
        cat.description AS p_cat_desc,
        e.p_basic,
        e.location_id,
        e.division_id
      FROM mhpmempm e
      LEFT JOIN vwempdsg dsg ON dsg.code = e.p_desig
      LEFT JOIN mhpmdept dept ON dept.dept_cd = e.p_dept
      LEFT JOIN vwempgrd grd ON grd.code = e.p_grade
      LEFT JOIN vwempcat cat ON cat.code = e.p_category
      WHERE e.emp_cd = $1
    `;

    const result = await db.query(query, [emp_cd]); //

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Validation successful",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Validation Error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error during validation." });
  }
});

const postIncreamentData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;
    const empCode = formData.emp_cd;

    // // 1) Transform incoming formData to DB columns
    // const dbRecord = transToMhpmempmDbData(formData);

    // // 2) Extract column names and values
    // const columns = Object.keys(dbRecord);
    // const values = Object.values(dbRecord);

    // // 3) Build SET clause dynamically
    // const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");

    // // 4) Final update query
    // const query = `
    //       UPDATE ${TABLE_NAMES.MHPMEMPM}
    //          SET ${setClause}
    //        WHERE emp_cd = $${columns.length + 1}
    //     `;

    // console.log("UPDATE QUERY =>", query);

    // 5) Execute query
    //await db.query(query, [...values, formData.emp_cd]);

    if (formDetailData) {
      const formArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        // Duplicate check...
        const duplicateCheckQuery = `
   select 1 from tdpmincr
      where emp_cd = $1
        and eff_date = $2
  `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          empCode,
          record.eff_date,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            error: "Employee name + eff_date already exists",
          });
        }

        // Remove unwanted keys before transformation
        delete record.id;
        delete record.init_grd_no;
        delete record.grd_desc;
        record.emp_cd = empCode; 
        delete record.init_eff_date

        // Transform record to DB-ready data
        const tdpmincrData = transToTdpmincrDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.TDPMINCR,
          tdpmincrData
        );
        const valuesForInsertQuery = Object.values(tdpmincrData);

        try {
          const tdpColumns = Object.keys(tdpmincrData);

          tdpColumns.forEach((col, i) => {
            console.log(
              `TDPMINCR -> ${col} ($${i + 1}):`,
              JSON.stringify(valuesForInsertQuery[i]),
              typeof valuesForInsertQuery[i]
            );

            console.log({
              emp_score_cd: tdpmincrData.emp_score_cd,
              rating_cd: tdpmincrData.rating_cd,
              update_in_month: tdpmincrData.update_in_month,
              create_id: tdpmincrData.create_id,
              update_id: tdpmincrData.update_id,
            });
          });
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateIncreamentData = async (req, res) => {
  const { formData, deletedData, formDetailData } = req.body;
  //console.log("formData", formData);

  const empCode = formData.emp_cd;

  try {
    await db.query("BEGIN");

    // Handle UPDATE
    if (Array.isArray(formDetailData) && formDetailData.length) {
      for (const record of formDetailData) {
        // Transform to DB-ready object
        const mapped = transToTdpmincrDbData(record);

        // Remove UI-only fields
        const {
          id,

          ...dbRecord
        } = mapped;

        dbRecord.emp_cd = record.emp_cd;
        dbRecord.eff_date = record.eff_date;

        // CASE 1 Update
        if (!record.id) {
          console.log("update record", record);
          // console.log('update records')
          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.TDPMINCR}
               SET ${setClause}
             WHERE emp_cd = $${columns.length + 1} 
             and eff_date = $${columns.length + 2}
              
          `;

          console.log("UPDATE QUERY =>", query);
          //console.log("UPDATE VALUES =>", [...values, deptCd]);

          // console.log('query', query)

          await db.query(query, [...values, record.emp_cd, record.init_eff_date]);
        } else {
          // Duplicate check...
          const duplicateCheckQuery = `
   select 1 from tdpmincr
      where emp_cd = $1
        and eff_date = $2
  `;
          const duplicateResult = await db.query(duplicateCheckQuery, [
            empCode,
            record.eff_date,
          ]);
          if (duplicateResult.rowCount > 0) {
            return res.status(400).json({
              error: "Employee name + eff_date already exists",
            });
          }

          // Remove unwanted keys before transformation
          delete record.id; 
          delete record.init_eff_date
          record.emp_cd = empCode


          // Transform record to DB-ready data
          const increamentData = transToTdpmincrDbData(record);

          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.TDPMINCR,
            increamentData
          );
          const valuesForInsertQuery = Object.values(increamentData);

          try {
            await db.query(queryForInsert, valuesForInsertQuery);
          } catch (error) {
            throw new Error(`Insert error at index ${index}: ${error.message}`);
          }
        }
      }
    }

    // Handle DELETE
    if (Array.isArray(deletedData) && deletedData.length) {
      for (const d of deletedData) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.TDPMINCR}
            WHERE emp_cd = $1 and eff_date = $2`,
          [d.emp_cd, d.init_eff_date]
        );
      }
    } else if (deletedData) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.TDPMINCR}
          WHERE emp_cd = $1 and eff_date = $2`,
        [deletedData.emp_cd, deletedData.init_eff_date]
      );
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(" Error updating department master:", err);
    res.status(500).send({ error: err.message });
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
    await updateIncreamentData(req, res);
    return;
  } else {
    await postIncreamentData(req, res);
    return;
  }
});
