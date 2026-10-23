
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateInsertQuery, generateSingleInsertQuery } = require("../../../../utility/query");
const { transformRouteHeaderToDbData } = require("./presentation");

const TABLE_NAMES = {
  COPY_ROUTING: `MHPSROUT`,
};

const getDataOnFillButton = async (req, res) => {
  try{
  const { from_route_no, to_route_no } = req.query;

  if (!from_route_no) {
    return res.status(400).json({ message: "from_route_no is required" });
  }
  if (!to_route_no) {
    return res.status(400).json({ message: "to_route_no is required" });
  }

  /* ========= 1. FROM ROUTE DATA ========= */
  const routQuery = `
    SELECT *
    FROM mhpsrout
    WHERE route_no = $1
  `;
  const { rows: routRows } = await db.query(routQuery, [from_route_no]);

  if (routRows.length === 0) {
    return res.status(200).json({ detail: [] });
  }

  /* ========= 2. POST QUERY LOGIC ========= */
  for (const row of routRows) {

    /* --- OPERATION_NO --- */
    if (row.opn_id) {
      const { rows } = await db.query(
        `SELECT operation_no FROM moemopns WHERE opn_id = $1`,
        [row.opn_id]
      );
      row.operation_no = rows[0]?.operation_no || null;
    }

    /* --- IT_NAME --- */
    if (row.it_code) {
      const { rows } = await db.query(
        `SELECT it_name FROM mommitem WHERE it_code = $1`,
        [row.it_code]
      );
      row.it_name = rows[0]?.it_name || null;
    }

    /* --- WC_NO --- */
    if (row.wc_id) {
      const { rows } = await db.query(
        `SELECT wc_no FROM mommwc WHERE wc_id = $1`,
        [row.wc_id]
      );
      row.wc_no = rows[0]?.wc_no || null;
    }

    /* ========= toRoute and opn_id ========= */

    const toRouteQuery = `
      SELECT it_code, final_code
      FROM mhpsrout
      WHERE route_no = $1
      AND opn_id = $2
    `;

    const { rows: toRows } = await db.query(toRouteQuery, [
      to_route_no,
      row.opn_id,
    ]);

    /* TOO_MANY_ROWS */
    if (toRows.length > 1) {
      return res.status(400).json({
        message:
          "Combination of Item code and final code exists more than once",
      });
    }

    if (toRows.length === 1) {
      // record exists in TO_ROUTE
      row.new_it_code = toRows[0].it_code;
      row.new_final_code = toRows[0].final_code;
      row.select_check = row.new_it_code ? "Y" : "N";
    } else {
      // NO_DATA_FOUND
      row.new_it_code = row.it_code;
      row.new_final_code = row.final_code;
      row.select_check = "N";
    }
    
    /* NOW fetch new_it_name */
    if (row.new_it_code) {
      const { rows } = await db.query(
        `SELECT it_name FROM mommitem WHERE it_code = $1`,
        [row.new_it_code]
      );
      row.new_it_name = rows[0]?.it_name || null;
    }
    }

    /* ========= RESPONSE ========= */
    return res.status(200).json( {
       detail: routRows 
      });

  } catch (error) {
    console.error("getDataOnFillButton error:", error);

    return res.status(500).json({
      message: "Internal server error while fetching routing data",
    });
  }
};



// helpList Function

    const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;
  // Allowed form statuses
  if (!["Insert", "Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }
  
   if (help_list === "fromRoute") {
      const getFromHelp = `
       SELECT DISTINCT ROUTE_NO, IT_NAME FROM MHPSROUT H, MOMMITEM I WHERE I.IT_CODE = H.ROUTE_NO ORDER BY ROUTE_NO
      `;
      
      const result = await db.query(getFromHelp);
      return res.status(200).json(result.rows);
    }
  
   if (help_list === "toRoute") {
      const getToHelp = `
         SELECT   m.par_it_cd it_code, i.it_name it_desc, i.old_it_code
        FROM mopsbom m, mommitem i
        WHERE i.it_code = m.par_it_cd
        AND NOT EXISTS (SELECT 1
        FROM mopsbom b
        WHERE b.chl_it_cd = m.par_it_cd)
        GROUP BY m.par_it_cd, i.it_name, i.old_it_code
        ORDER BY m.par_it_cd
      `;

      const result = await db.query(getToHelp);
      return res.status(200).json(result.rows);
    }


  // If help_list value doesn't match
  return res.status(400).json({ error: "Invalid help_list value" });
  };


// const postCopyRoutingData = async (req, res) => {
// const payload = req.body;

// const {from_route_no, to_route_no,fin_year} = payload;

// try {

//   await db.query("BEGIN")
//   const formData = payload.formData || []

//   const newRows = formData.map(row => row)

//   for( let row of newRows) {
    
//     const finalRow = { ...row};
//     const copyRouting = transformRouteHeaderToDbData(finalRow);
//     const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.COPY_ROUTING,copyRouting)
//     const valuesForInsertQuery = Object.values(copyRouting)

//     await db.query(queryForInsert,valuesForInsertQuery)
//   }
//   await db.query(`CALL route_copy($1,$2)`,[from_route_no,fin_year])
  
//   await db.query("COMMIT");


  
// } catch (error) {
//   await db.query("ROLLBACK");
//   console.error("Insert Error:", error);

//   return res.status(500).json({
//     type:'error',
//     message:error.message || "failed to data submit",
//   });
// }
// };

const postCopyRoutingData = async (req, res) => {
  const { from_route_no, to_route_no, fin_year, rows } = req.body;

 
  if (!from_route_no || !to_route_no || !fin_year) {
    return res.status(400).json({
      type: "error",
      message: "From Route No, To Route No and Financial Year are required",
    });
  }

  if (!rows || rows.length === 0) {
    return res.status(400).json({
      type: "error",
      message: "No routing rows found to copy",
    });
  }

  try {
 
    await db.query("BEGIN");

    // Each UI row → one procedure call
   for (const row of rows) {
  await db.query(
    `CALL route_copy($1, $2, $3, $4, $5)`,
    [
      from_route_no,
      to_route_no,
      fin_year,
      row.new_it_code,
      row.new_final_code
    ]
  );
}

    //Commit
    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Routing copied successfully",
    });

  } catch (error) {
    // Rollback on error
    await db.query("ROLLBACK");

    console.error("Copy Routing Error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Failed to copy routing",
    });
  }
};




exports.handleFormOperation = catchAsync(async (req, res, next) => {


  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnFillButton(req, res);
    return;
  }

   if (req.query.from_route_no) {
    await getDataOnFillButton(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateCopyRoutingData(req, res);
    return;
  }
  
  if (req?.query?.form_status === "Insert") {
    await postCopyRoutingData(req, res);
    return;
  }
});

exports.validateCommon = async (req, res) => {
  const { type, value } = req.body;

  try {
    switch (type) {

      /* ================= FROM_ROUTE_NO ================= */
      case "FROM_ROUTE_NO": {
    
        if (!value) {
          return res.status(400).json({
            valid: false,
            message: "From Route Sheet No. Can not be blank",
          });
        }

        const query = `
          SELECT 1
          FROM mhpsrout
          WHERE route_no = $1
          LIMIT 1
        `;

        const { rowCount } = await db.query(query, [value]);

        if (rowCount === 0) {
          return res.status(404).json({
            valid: false,
            message: "From Route Sheet No. does not exist",
          });
        }

        return res.status(200).json({ valid: true });
      }

      /* ================= TO_ROUTE_NO ================= */
      case "TO_ROUTE_NO": {
     
        if (!value) {
          return res.status(400).json({
            valid: false,
            message: "To Route Sheet No. Can not be blank",
          });
        }

 
        const query = `
          SELECT 1
          FROM mhpsrout
          WHERE route_no = $1
          LIMIT 1
        `;

        const { rowCount } = await db.query(query, [value]);

        // record FOUND → already exists (warning type validation)
        if (rowCount > 0) {
          return res.status(200).json({
            valid: false,
            message: "To Route Sheet No. already exists",
          });
        }

        return res.status(200).json({
         valid: true
        });
      }

     /* ================= TO_OUTPUT_CODE ================= */
      case "NEW_IT_CODE": {

            const query = `
                SELECT it_name
                FROM mommitem
                WHERE it_code = $1
                LIMIT 1
            `;

            const { rowCount, rows } = await db.query(query, [value]);

            if (rowCount === 0) {
                return res.status(404).json({
                valid: false,
                message: "New Output Item Code does not exist",
                });
            }

            return res.status(200).json({
                valid: true,
                it_name: rows[0].it_name,
            });
       }

    /* ================= TO_FINAL_CODE ================= */
        case "NEW_FINAL_CODE": {
        
        const query = `
            SELECT 1
            FROM mommitem
            WHERE it_code = $1
            LIMIT 1
        `;

        const { rowCount } = await db.query(query, [value]);

        if (rowCount === 0) {
            return res.status(404).json({
            valid: false,
            message: "Final Item Code does not exist",
            });
        }

        return res.status(200).json({ valid: true });
          }

      default:
        return res.status(400).json({
          valid: false,
          message: "Invalid validation type",
        });
    }
  } catch (error) {
    console.error("validateCommon error:", error);
    return res.status(500).json({
      valid: false,
      message: "Validation server error",
    });
  }
};



