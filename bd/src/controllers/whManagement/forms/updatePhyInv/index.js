  const catchAsync = require("../../../../utility/catchAsync");
  const { db } = require("../../../../config/dbConnection");

  const getFormBaseConstants = catchAsync(async (req, res) => {
    const { store_process, appDivisionId, level1, level2 } = req.query;

    const needWCAndL1 = !level1 && !level2;    
    const needL2      =  level1 && !level2;     
    const needL3      =  level1 &&  level2;    

    let wcList = [];
    let itemType = [];
    let itemBase = [];
    let itemSubCat = [];


    if (needWCAndL1) {
      if (!store_process || !appDivisionId) {
        return res.status(400).json({
          success: false,
          message: "store_process and appDivisionId are required for initial load",
          received: { store_process, appDivisionId },
        });
      }

    
      const wcRes = await db.query(
        `  SELECT w.wc_id, w.wc_no
        FROM mommwc w
        WHERE EXISTS (SELECT 1 FROM tommpinv p WHERE p.wc_id = w.wc_id)
          AND w.store_process = $1
          AND w.division_id   = $2::int
        ORDER BY w.wc_no
        `,
        [store_process, appDivisionId]
      );
      wcList = wcRes.rows;

      // Item Type list (Level 1)
      const l1Res = await db.query(`
        SELECT cat_desc, level1
        FROM moitbase
        WHERE level2 = '00' AND level3 = '00'
        ORDER BY cat_desc;
      `);
      itemType = l1Res.rows;
    }

    //  Level 2 (Item Base): only needs level1
    if (needL2) {
      const l2Res = await db.query(
        `
        SELECT cat_desc, level2
        FROM moitbase
        WHERE level1 = $1 AND level3 = '00' AND level2 <> '00'
        ORDER BY cat_desc;
        `,
        [level1]
      );
      itemBase = l2Res.rows;
    }

    //  Level 3 (Sub Category): needs level1 + level2
    if (needL3) {
      const l3Res = await db.query(
        `
        SELECT cat_desc, level3
        FROM moitbase
        WHERE level1 = $1 AND level2 = $2 AND level3 <> '00'
        ORDER BY cat_desc;
        `,
        [level1, level2]
      );
      itemSubCat = l3Res.rows;
    }

    return res.status(200).json({
      success: true,
      wcList,        
      level1: itemType,
      level2: itemBase,
      level3: itemSubCat,
    });
    });

 const generateAdjustments = catchAsync(async (req, res) => {
  try {
    const { wc_id, curryear, inv_month, adj_date, division_id } = req.body;

    if (!wc_id || !curryear || !inv_month || !adj_date || !division_id) {
      return res.status(400).json({
        success: false,
        message: "wc_id, curryear, inv_month, adj_date, division_id are required",
      });
    }

    // find store_process
    const wcRow = await db.query(`SELECT store_process FROM mommwc WHERE wc_id = $1`, [wc_id]);
    if (!wcRow.rows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid Work Center not defined as store or process",
      });
    }

    const cstore_process = wcRow.rows[0].store_process;


    const ptrans_year = String(curryear);
    const ptrans_year_adj = String(curryear);

    const adjDateObj = new Date(adj_date);
    const adjDateOnly = adjDateObj.toISOString().split("T")[0]; // e.g. "2025-11-10"

    await db.query("BEGIN");

    // ===== STORE BRANCH =====
    if (cstore_process === "S") {
      await db.query(
        `CALL updphysicalinvtry($1,$2,$3,$4::date,$5)`,
        [ptrans_year, wc_id, inv_month, adjDateOnly, division_id]
      );

      await db.query(
        `CALL gen_up_phy_batch_adj_STEP5($1,$2,$3,$4,$5,$6::date,$7)`,
        [division_id, ptrans_year_adj, null, wc_id, inv_month, adjDateOnly, null]
      );

      await db.query("COMMIT");
      return res.status(200).json({
        success: true,
        branch: "S",
        message: "Completed for store",
      });
    }

    // ===== PROCESS BRANCH =====
    else if (cstore_process === "P") {
      await db.query(
        `CALL updphysicalinvtry_wip_1($1,$2,$3,$4::date,$5)`,
        [ptrans_year, wc_id, inv_month, adjDateOnly, division_id]
      );

      await db.query(
        `CALL updphysicalinvtry_wip_2($1,$2,$3,$4::date,$5)`,
        [ptrans_year, wc_id, inv_month, adjDateOnly, division_id]
      );

      await db.query("COMMIT");
      return res.status(200).json({
        success: true,
        branch: "P",
        message: "Completed for process",
      });
    }

    // ===== INVALID BRANCH =====
    else {
      await db.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "store_process must be 'S' or 'P' for the selected Work Center",
      });
    }
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch {}
    console.error("Generate adjustments failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate adjustments",
      error: err.message,
    });
  }
});





  module.exports = { getFormBaseConstants, generateAdjustments};
