const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const TABLE_NAMES = {
    MOMMITEM_TABLE :"mommitem",
}


// dropDownData
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    const { level1, level2 } = req.query;

    const itemType = await db.query(
        ` SELECT cat_desc, level1
           FROM moitbase
           WHERE COALESCE(level2, '00') = '00'
            AND COALESCE(level3, '00') = '00'
            ORDER BY 2;`
                    );

    const itemBase = await db.query(
        `SELECT cat_desc, level2
          FROM moitbase
          WHERE COALESCE(level3, '00') = '00'
          AND level1 =$1`,
          [level1]
    );

    const itemSubCat = await db.query(
        `SELECT cat_desc, level3
        FROM moitbase
        WHERE level1 = $1
        AND level2 = $2 `,
        [level1, level2]
    );

    return res.status(200).json({
        level1: itemType.rows,
        level2: itemBase.rows,
        level3: itemSubCat.rows,
    });
});

    // showItem btn function
  exports.handleShowItemBtn = catchAsync(async (req, res, next) => {

    try {
      const getData = await db.query(
        `SELECT * 
        FROM ${TABLE_NAMES.MOMMITEM_TABLE} order by it_code`
      );

     if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No Items defined for above Category.",
      });
    }


      return res.status(200).json({
        type: "found",
        itemMinMaxStockLevel: getData.rows,
        // totalCount: getData.rowCount,
      });

    } catch (error) {
      console.error("Error in handleShowItemBtn:", error);
      return res.status(500).json({
        message: "Internal server error on query"
      });
    }
  });


  exports.handleFilterDataOnSelectValue = catchAsync(async (req, res, next) => {
    let { level1, level2, level3 } = req.query;

    level1 = (!level1 || level1.trim() === '' || level1.toLowerCase() === 'null') ? null : level1;
    level2 = (!level2 || level2.trim() === '' || level2.toLowerCase() === 'null') ? null : level2;
    level3 = (!level3 || level3.trim() === '' || level3.toLowerCase() === 'null') ? null : level3;

    try {
      const getData = await db.query(
        `SELECT * 
        FROM ${TABLE_NAMES.MOMMITEM_TABLE}
        WHERE ($1::text IS NULL OR it_type = $1)
          AND ($2::text IS NULL OR it_base = $2)
          AND ($3::text IS NULL OR it_sub_c = $3)
        ORDER BY it_code`,
        [level1, level2, level3]
      );

      if (getData.rowCount === 0) {
        let message = "No Account Found";

        if (level1 && !level2 && !level3) {
          message = `No Item Account Found for this Item Type.`;
        } else if (level1 && level2 && !level3) {
          message = `No Item Account Found for combination of Item Type  and Item Base.`;
        } else if (level1 && level2 && level3) {
          message = `No Item Account Found for combination of Item Type  Item Base , and Item Sub Category.`;
        }

        return res.status(200).json({
          type: "empty",
          message,
          itemMinMaxStockLevel: []
        });
      }

      return res.status(200).json({
        type: "found",
        itemMinMaxStockLevel: getData.rows
      });

    } catch (error) {
      console.error("Error in handleFilterDataOnSelectValue:", error);
      return res.status(500).json({
        message: "Internal server error on query"
      });
    }
  });

const updateItemMinMaxStockLevel = async (req, res) => {
 const { formData, deletedRow } = req.body;

      if ((!Array.isArray(formData) || formData.length === 0) && (!Array.isArray(deletedRow) || deletedRow.length === 0)) {
        return res.status(400).json({ type: 'error', message: 'No updated data received while submitting.' });
      }

      try {
        await db.query("BEGIN");

        // STEP 1: Handle deletions
      if (Array.isArray(deletedRow) && deletedRow.length > 0) {
      const deleteQuery = `
        UPDATE ${TABLE_NAMES.MOMMITEM_TABLE} 
        SET max_stock = null, max_stock_days = null,min_stock = null, min_stock_days = null,optimumstk = null, optimumstk_days = null 
        WHERE it_code = $1
      `;

      for (const row of deletedRow) {
        await db.query(deleteQuery, [row.it_code]);
      }
    }

        // STEP 2: Handle updates
        let updatedCount = 0;

        if (Array.isArray(formData) && formData.length > 0) {
          const rowsToUpdate = formData.filter(row => row.isStatus === 'update');

          if (rowsToUpdate.length === 0) {
            return res.status(400).json({ type: 'error', message: 'No updated rows to submit.' });
          }

          for (const row of rowsToUpdate) {
            const { it_code, isStatus, ...otherFields } = row;
            if (!it_code) continue; // Skip if no it_code
            const columns = Object.keys(otherFields);
            const values = Object.values(otherFields);
            if (columns.length === 0) continue; // Nothing to update
            const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(", ");
            const query = `
              UPDATE ${TABLE_NAMES.MOMMITEM_TABLE}
              SET ${setClause}
              WHERE it_code = $${columns.length + 1}
            `;
            await db.query(query, [...values, it_code]);
            updatedCount++;
          }
        }

        await db.query("commit");

        res.status(200).json({
          type: 'success',
          message: `Updated ${updatedCount} records, deleted ${deletedRow?.length || 0} records.`,
          updated: updatedCount,
          deleted: deletedRow?.length || 0
        });

      } catch (error) {
        await db.query("ROLLBACK");
        console.error('Update error:', error.message);
        res.status(500).json({ type: "error", message: error.message || 'Internal Server Error.' });
      }
    };
 

  exports.handleFormOperation = catchAsync(async (req, res, next) => {
      // if (req?.query?.get_data) {
      //     await getDataOnquery(req, res);
      //     return;
      // }
        if (req?.query?.help_list) {
      await helpListData(req, res);
      return;
    }
  });

    exports.handleUpdateFormData = catchAsync(async (req,res,next) =>{
      if(req?.query?.form_status && req?.query?.form_status === 'Update'){
        await updateItemMinMaxStockLevel(req,res);
        return;
      }
    })