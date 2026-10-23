
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformBomToDbData } = require("./presentation");

let TABLE_NAMES = {
    MOPSBOM: `MOPSBOM`,
};



const getDataOnquery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY par_it_cd LIMIT 1 OFFSET ${Number(req.query.offset || 0)}`;
    let totalCount = 0;

    if (["Query", "First"].includes(req.query.get_data)) {
      const countRes = await db.query(
        `SELECT COUNT(DISTINCT par_it_cd) AS total_count FROM mopsbom`
      );
      totalCount = Number(countRes.rows[0].total_count);
    }

   
    if (req.query.get_data === "Last") {
      queryParameter = "ORDER BY par_it_cd DESC LIMIT 1";
    }

   
    const parentRes = await db.query(`
      SELECT DISTINCT par_it_cd
      FROM mopsbom
      ${queryParameter}
    `);

    if (!parentRes.rows.length) {
      return res.json({ type: "not_found" });
    }

    const par_it_cd = parentRes.rows[0].par_it_cd;

    //  RECURSIVE BOM (STRUCTURE ONLY)

    const bomRes = await db.query(
      `
      WITH RECURSIVE bom_tree AS (
        SELECT 
          *,
          0 AS lvl
        FROM mopsbom
        WHERE par_it_cd = $1

        UNION ALL

        SELECT 
          m.*,
          bt.lvl + 1 AS lvl
        FROM mopsbom m
        JOIN bom_tree bt
          ON m.par_it_cd = bt.chl_it_cd
      )
      SELECT *
      FROM bom_tree
      ORDER BY lvl, par_it_cd, seq_no
      `,
      [par_it_cd]
    );

    const bomRows = bomRes.rows;

    //  PARENT DESCRIPTION (MOMMITEM)

    const parentDescRes = await db.query(
      `
      SELECT
        COALESCE(it_name_long, it_name) AS par_desc,
        it_bom_um AS par_uom,
        drawing_no
      FROM mommitem
      WHERE it_code = $1
      `,
      [par_it_cd]
    );

    const parentInfo = parentDescRes.rows[0] || {
      par_desc: null,
      par_uom: null,
      drawing_no: null,
    };

    //  PARENT REMARKS

    const parentRemarksRes = await db.query(
      `
      SELECT DISTINCT par_remarks
      FROM mopsbom
      WHERE par_it_cd = $1
      `,
      [par_it_cd]
    );

    const par_remarks = parentRemarksRes.rows[0]?.par_remarks || null;

    // CHILD DETAILS 

    const childCodes = [
      ...new Set(
        bomRows
          .map(r => r.chl_it_cd)
          .filter(Boolean)
      )
    ];

    let childDetailsMap = {};

    if (childCodes.length > 0) {
      const childDetailsRes = await db.query(
        `
        SELECT
          it_code,
          COALESCE(it_name_long, it_name) AS child_desc,
          it_bom_um AS child_uom,
          drawing_no,
          COALESCE(active, 'Y') AS active,
          it_fmp_pu,
          mrp_yesno
        FROM mommitem
        WHERE it_code = ANY($1)
        `,
        [childCodes]
      );

      childDetailsMap = Object.fromEntries(
        childDetailsRes.rows.map(r => [r.it_code, r])
      );
    }

    //  MERGE BOM + CHILD DETAILS

    const bomWithChildDetails = bomRows.map(row => {
      const child = childDetailsMap[row.chl_it_cd] || {};

      return {
        ...row,
        child_desc: child.child_desc || null,
        child_uom: child.child_uom || null,
        child_drawing_no: child.drawing_no || null,
        active: child.active || "Y",
        it_fmp_pu: child.it_fmp_pu || null,
        mrp_yesno: child.mrp_yesno || null,
      };
    });


    return res.json({
      type: "found",
      totalCount,
      parent: {
        par_it_cd,
        par_desc: parentInfo.par_desc,
        par_uom: parentInfo.par_uom,
        drawing_no: parentInfo.drawing_no,
        par_remarks,
      },
      bom: bomWithChildDetails,
    });

  } catch (err) {
    console.error("BOM Query Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const helpListData = async (req, res) => {
    const { help_list , user_id, form_status } = req?.query;

    if (help_list === "parItem") {
        const parentItemCode = await db.query(
          `select  it_code, it_name_long, it_bom_um, drawing_no, i.old_it_code
        from mommitem i, mommitmright r
        where r.user_id = 586
        AND COALESCE(r.it_type,  COALESCE(i.it_type, '-1')) = COALESCE(i.it_type, '-1')
        AND COALESCE(r.it_base,  COALESCE(i.it_base, '-1')) = COALESCE(i.it_base, '-1')
        AND COALESCE(r.it_sub_c, COALESCE(i.it_sub_c, '-1')) = COALESCE(i.it_sub_c, '-1')
        AND i.active = 'Y'
        ORDER BY it_name`,  [user_id]  
        );

        return res.status(200).send(parentItemCode.rows);
    }
    else if (help_list === "ChildItem") {
     const ChildItemCode = await db.query(
     `select it_code, it_name_long, it_bom_um, drawing_no, old_it_code
        from mommitem i, mommitmright r
        where r.user_id = 586
        AND COALESCE(r.it_type,  COALESCE(i.it_type, '-1')) = COALESCE(i.it_type, '-1')
        AND COALESCE(r.it_base,  COALESCE(i.it_base, '-1')) = COALESCE(i.it_base, '-1')
        AND COALESCE(r.it_sub_c, COALESCE(i.it_sub_c, '-1')) = COALESCE(i.it_sub_c, '-1')
        AND i.active = 'Y'
        ORDER BY it_name_long`,[user_id]
            );
        return res.status(200).send(ChildItemCode.rows); 
    } 
};

const postBillOfMaterial = async (req, res) => {
  const payload = req.body;

  try {
    await db.query("BEGIN");

    const { par_remarks, details = [] } = payload;

    if (!details.length) {
      throw new Error("Invalid BOM payload");
    }

    for (let row of details) {
      const finalRow = {
        ...row,          
        par_remarks,
      };

      const bomDbRow = transformBomToDbData(finalRow);
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MOPSBOM,
        bomDbRow
      );

      await db.query(insertQuery, Object.values(bomDbRow));
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "BOM saved successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("BOM Insert Error:", error);
    return res.status(500).json({ type: "error", message: error.message });
  }
};



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
        await updateBOM(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postBillOfMaterial(req, res);
        return;
    }
});

