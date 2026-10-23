const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const {
  transformRouteHeaderToDbData,
  transformRouteDetailToDbData,
  transformRouteToolToDbData,
  transformRouteDrawingToDbData,
} = require("./presentation");

let TABLE_NAMES = {
   ROUTE_HEADER: `MHPSROUT`,
   ROUTE_DETAIL: `MDPSROUT`,
   ROUTE_TOOL: `MDPSROUTOOL`,
   ROUTE_DRAWING: `MDPSROUTDRW`,
};

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const DRAWING_UPLOAD_DIR = path.join(
  __dirname,
  "uploadDrawing"
);

if (!fs.existsSync(DRAWING_UPLOAD_DIR)) {
  fs.mkdirSync(DRAWING_UPLOAD_DIR, { recursive: true });
}

exports.uploadRouteDrawingMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DRAWING_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `ROUTE_${req.body.route_id}_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

exports.uploadRouteDrawing = catchAsync(async (req, res) => {
  const { route_id } = req.body;

  if (!route_id || !req.file) {
    return res.status(400).json({
      success: false,
      message: "Route ID or file missing",
    });
  }

  const filePath = `routeMaintenance/uploadDrawing/${req.file.filename}`;

  const exists = await db.query(
    `SELECT 1 FROM MDPSROUTDRW WHERE route_id = $1`,
    [route_id]
  );

  if (exists.rowCount > 0) {
    await db.query(
      `UPDATE MDPSROUTDRW
       SET process_drw = $1
       WHERE route_id = $2`,
      [filePath, route_id]
    );
  } else {
    await db.query(
      `INSERT INTO MDPSROUTDRW (route_id, process_drw)
       VALUES ($1, $2)`,
      [route_id, filePath]
    );
  }

  res.json({
    success: true,
    message: "Drawing uploaded successfully",
    drawingPath: filePath,
  });
});



const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];
  let values = [];

  // ---------- SEARCH KEYS ----------
  let searchKeys = ["route_no"];

  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      values.push(req.query[key]);
      whereClauses.push(`${key} = $${values.length + 1}`); 
    }
  }

  let transYear = appFinYear || "2023";
  let divisionId = Number(appDivisionId) || 1;
  let user_id = userId || 583;

  // ---------- BASE WHERE (EXISTS) ----------
  values.unshift(divisionId); // $1 = division id

  let whereClause = `
    WHERE EXISTS (
      SELECT 'X'
      FROM MOMMWC W
      WHERE W.WC_ID = MHPSROUT.WC_ID
        AND W.DIVISION_ID = $1
    )
  `;

  if (whereClauses.length > 0) {
    whereClause += " AND " + whereClauses.join(" AND ");
  }

  // ---------- ORDER BY ----------
  let orderByClause = `ORDER BY ROUTE_NO, GET_OPERATION_NO(OPN_ID)`;

  // ---------- OFFSET / NAVIGATION ----------
  let queryParameter = `LIMIT 1 OFFSET ${Number(req.query.offset) || 0}`;

  try {
    let dataCount;

    // ---------- COUNT ----------
    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.ROUTE_HEADER} ${whereClause}`,
      values
    );
    dataCount = Number(getCount.rows[0].count);

    // ---------- FIRST / LAST / QUERY ----------
    switch (req?.query?.get_data) {
      case "Last":
        orderByClause = `ORDER BY ROUTE_NO DESC, GET_OPERATION_NO(OPN_ID) DESC`;
        queryParameter = `LIMIT 1`;
        break;

      case "First":
      case "Query":
      default:
        // default order already set
        break;
    }

    // ---------- FINAL QUERY ----------
    const getHeaderData = await db.query(
      `
      SELECT *
      FROM ${TABLE_NAMES.ROUTE_HEADER}
      ${whereClause}
      ${orderByClause}
      ${queryParameter}
      `,
      values
    );

    if (getHeaderData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        headerData: {},
        detailData: [],
        toolData: [],
        count: dataCount,
        message:'No data found'
      });
    }

    const headerData = getHeaderData.rows[0];
    const routeId = headerData.route_id

    // fetch post query for header
   
    if (headerData.it_code) {
    const postItemRes = await db.query(
        `
        SELECT it_name
        FROM mommitem
        WHERE it_code = $1
        `,
        [headerData.it_code]
    );

    headerData.it_name = postItemRes.rows[0]?.it_name || null;
    }
    
    if (headerData.opn_id) {
    const postOprNoRes = await db.query(
        `
        select operation_no 
        from  moemopns  where opn_id = $1
        `,
        [headerData.opn_id]
    );

    headerData.opn_no = postOprNoRes.rows[0]?.operation_no || null;
    }

    if (headerData.it_code) {
    const postFinalDescRes = await db.query(
        `
    select it_name 
        from mommitem i
        where i.it_code = $1
        `,
        [headerData.it_code]
    );

    headerData.fianal_code_desc = postFinalDescRes.rows[0]?.it_name || null;
    }

    if (headerData.wc_id) {
    const postWcRes = await db.query(
        `
    select wc_no from mommwc
        where wc_id = $1
        `,
        [headerData.wc_id]
    );

    headerData.wc_no = postWcRes.rows[0]?.wc_no || null;
    }

    if (headerData.wc_id) {
  const mainWcRes = await db.query(
    `
    SELECT wc_id, wc_no, description
    FROM mommwc
    WHERE wc_id = (
      SELECT main_wc_id
      FROM mommwc
      WHERE wc_id = $1
    )
    `,
    [headerData.wc_id]
  );

  if (mainWcRes.rowCount > 0) {
    headerData.main_wc_id   = mainWcRes.rows[0].wc_id;
    headerData.main_wc_no   = mainWcRes.rows[0].wc_no;
    headerData.main_wc_desc = mainWcRes.rows[0].description;
  } else {
    headerData.main_wc_id   = null;
    headerData.main_wc_no   = null;
    headerData.main_wc_desc = null;
  }
    }



     // fetch detailsdata
            const getDetailData = await db.query(
            `
            SELECT *
            FROM ${TABLE_NAMES.ROUTE_DETAIL}
            WHERE route_id = $1
            ORDER BY input_it_code
            `,
            [routeId]
            );

    let detailData = getDetailData.rows || [];


//    POST QUERY – DETAIL ITEM NAME & UOM

for (let i = 0; i < detailData.length; i++) {
  const row = detailData[i];

  if (row.input_it_code) {
    const itemRes = await db.query(
      `
      SELECT it_name, it_bom_um
      FROM mommitem
      WHERE it_code = $1
      `,
      [row.input_it_code]
    );

    if (itemRes.rowCount > 0) {
      row.it_name   = itemRes.rows[0].it_name;
      row.it_bom_um = itemRes.rows[0].it_bom_um;
    } else {
      row.it_name   = null;
      row.it_bom_um = null;
    }
  }
}

 
      // fetch toolData ///////////
        const getToolData = await db.query(
        `
        SELECT *
        FROM ${TABLE_NAMES.ROUTE_TOOL}
        WHERE route_id = $1
        ORDER BY it_code
        `,
        [routeId]
        );

        let toolData = getToolData.rows || [];


        //    POST QUERY – TOOL ITEM NAME & UOM

        for (let i = 0; i < toolData.length; i++) {
        const row = toolData[i];

        if (row.it_code) {
            const toolItemRes = await db.query(
            `
            SELECT it_name, um_code
            FROM mommitem
            WHERE it_code = $1
            `,
            [row.it_code]
            );

            if (toolItemRes.rowCount > 0) {
            row.it_name = toolItemRes.rows[0].it_name;
            row.uom     = toolItemRes.rows[0].um_code; 
            } else {
            row.it_name = null;
            row.uom     = null;
            }
        }
        }

        // ---------- FETCH DRAWING DATA ----------
const getDrawingData = await db.query(
  `
  SELECT
    route_id,
    encode(process_drw, 'escape') AS process_drw
  FROM ${TABLE_NAMES.ROUTE_DRAWING}
  WHERE route_id = $1
  `,
  [routeId]
);

const drawingData = getDrawingData.rows[0] || null;





    return res.status(200).json({
      type: "success",
      headerData: headerData,
      detailData:detailData,
      toolData:toolData,
      drawingData: drawingData,
      count: dataCount,
    });

  } catch (error) {
    console.error("Error in getDataOnQuery:", error);
    return res.status(500).json({
      message: "Internal server error on query",
    });
  }
};



    const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;
  // Allowed form statuses
  if (!["Insert", "Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }
  
   if (help_list === "mstrRoute") {
      const getMstrHelp = `
        SELECT ROUTE_NO FROM MHPSROUT ORDER BY ROUTE_NO
      `;
      
      const result = await db.query(getMstrHelp);
      return res.status(200).json(result.rows);
    }
  
   if (help_list === "finalCode") {
      const getFinalCodeHelp = `
          SELECT DISTINCT M.PAR_IT_CD,I.IT_NAME
          FROM MOPSBOM M,MOMMITEM I
          WHERE I.IT_CODE=M.PAR_IT_CD
          ORDER BY M.PAR_IT_CD
      `;

      const result = await db.query(getFinalCodeHelp);
      return res.status(200).json(result.rows);
    }
  
   if (help_list === "outputCode") {
      const getOutputCodeHelp = `
           SELECT M.PAR_IT_CD IT_CODE, I.IT_NAME IT_DESC
          FROM MOPSBOM M, MOMMITEM I
          WHERE I.IT_CODE=M.PAR_IT_CD
          GROUP BY M.PAR_IT_CD, I.IT_NAME
          ORDER BY M.PAR_IT_CD
      `;

      const result = await db.query(getOutputCodeHelp);
      return res.status(200).json(result.rows);
    }

   if (help_list === "inputItCode") {
      const getInputItCodeHelp = `
          SELECT IT_CODE  CHL_IT_CD, IT_NAME, 1 USAGE FROM MOMMITEM ORDER BY IT_CODE DESC
      `;

      const result = await db.query(getInputItCodeHelp);
      return res.status(200).json(result.rows);
    }

   if (help_list === "newPrcdCode") {
      const getNewProductItCodeHelp = `
      SELECT M.PAR_IT_CD IT_CODE, I.IT_NAME IT_DESC
      FROM MOPSBOM M, MOMMITEM I
      WHERE I.IT_CODE=M.PAR_IT_CD
      GROUP BY M.PAR_IT_CD, I.IT_NAME
      ORDER BY M.PAR_IT_CD
      `;

      const result = await db.query(getNewProductItCodeHelp);
      return res.status(200).json(result.rows);
    }
   if (help_list === "toolItCode") {
      const getToolItCodeHelp = `
    select it_code, it_name, um_code from mommitem order by 1
      `;

      const result = await db.query(getToolItCodeHelp);
      return res.status(200).json(result.rows);
    }


  // If help_list value doesn't match
  return res.status(400).json({ error: "Invalid help_list value" });
  };


    exports.validateCommon = async (req, res) => {
      const { type, value, extra} = req.body;

      try {
        let result;

        switch (type) {

          /* ================= MASTER ROUTE ================= */
          case "MASTER_ROUTE": {
            if (!value) {
              return res.status(200).json({
                valid: false,
                message: "Master Route No. can't be blank",
              });
            }

            result = await db.query(
              `SELECT COUNT(1) AS count
              FROM mhpsrout
              WHERE route_no = $1`,
              [value]
            );

            if (Number(result.rows[0].count) === 0) {
              return res.status(200).json({
                valid: false,
                message: "Master Route No. doesn't exist",
              });
            }

            return res.status(200).json({ valid: true });
          }

        /* ================= FINAL STAGE CODE  ================= */
          case "FINAL_STAGE_CODE": {

          if (!value) {
            return res.status(200).json({
              valid: false,
              message: "Final Stage code can't be blank",
            });
          }

            const result = await db.query(
              `
              SELECT it_name
              FROM mommitem
              WHERE it_code = $1
              LIMIT 1
              `,
              [value]
            );

            if (result.rowCount === 0) {
              return res.status(200).json({
                valid: false,
                message: "Final Stage code does not exist in item master",
              });
            }

            //  select it_name into :final_code_desc
            return res.status(200).json({
              valid: true,
              data: {final_code_desc: result.rows[0].it_name },
            });
          }
                    /* ================= OPERATION_NO  ================= */
              case "OPERATION_NO": {

                if (!value) {
                  return res.status(200).json({
                    valid: false,
                    message: "Operation No. can't be blank",
                  });
                }

                const result = await db.query(
                  `
                  SELECT 
                    opn_id,
                    COALESCE(opn_dtl_desc, opn_desc) AS operation_description
                  FROM moemopns
                  WHERE operation_no = $1
                  LIMIT 1
                  `,
                  [value]
                );

                if (result.rowCount === 0) {
                  return res.status(200).json({
                    valid: false,
                    message: "Operation No. does not exists",
                  });
                }

                //  select into variables
                return res.status(200).json({
                  valid: true,
                  data: {
                    opn_id: result.rows[0].opn_id,
                    operation_description: result.rows[0].operation_description,
                  },
                });
              }
 /* ================= WC_NO  ================= */
            case "WC_VALIDATE": {
                const wc = await db.query(
                  `SELECT wc_id, main_wc_id FROM mommwc WHERE wc_no = $1`,
                  [value]
                );

                if (wc.rowCount === 0) {
                  return res.json({ valid: false, message: "Work Center No. does not exist" });
                }

                let mainWc = null;
                if (wc.rows[0].main_wc_id) {
                  const m = await db.query(
                    `SELECT wc_id, wc_no, description FROM mommwc WHERE wc_id = $1`,
                    [wc.rows[0].main_wc_id]
                  );
                  mainWc = m.rows[0] || null;
                }

                return res.json({
                  valid: true,
                  data: {
                    wc_id: wc.rows[0].wc_id,
                    main_wc_id: mainWc?.wc_id,
                    main_wc_no: mainWc?.wc_no,
                    main_wc_desc: mainWc?.description,
                  },
                });
              }
 /* ================= check fmp exist or not   ================= */
          case "FMP_EXIST_CHECK": {
            const r = await db.query(
              `SELECT 1 FROM mommitem WHERE it_code = $1`,
              [value]
            );

            return res.json({
              valid: true,
              exists: r.rowCount > 0,
            });
          }
          
              /* ================= CREATE_ITEM   ================= */
          case "CRT_FMP_ITEM": {
            const { final_code, opn_no, wc_id, fin_year } = extra || {};

            if (!final_code || !opn_no || !wc_id || !fin_year) {
              return res.json({
                valid: false,
                message: "Missing required parameters for FMP creation",
              });
            }

            // call PostgreSQL procedure
            await db.query(
              `CALL crt_item($1, $2, $3, $4)`,
              [final_code, opn_no, wc_id, fin_year]
            );

                return res.json({
                  valid: true,
                  message: "FMP Item created successfully",
                });
              }
       /* ================= OUTPUT_CODE_VALIDATE   ================= */
              case "OUTPUT_CODE_VALIDATE": {
                if (!value) {
                  return res.json({
                    valid: false,
                    message: "Product Code can't be blank",
                  });
                }

                /*  Design BOM check (warning only) */
                const designBom = await db.query(
                  `SELECT 1 FROM mopsbom_design WHERE par_it_cd = $1 LIMIT 1`,
                  [value]
                );

                let designWarning = null;
                if (designBom.rowCount === 0) {
                  designWarning = "Product code does not exist in Design BOM";
                }

                /*  Item master check (mandatory) */
                const item = await db.query(
                  `SELECT it_name FROM mommitem WHERE it_code = $1 LIMIT 1`,
                  [value]
                );

                if (item.rowCount === 0) {
                  return res.json({
                    valid: false,
                    message: "Product code does not exist in Item Master",
                  });
                }

                return res.json({
                  valid: true,
                  data: {
                    it_name: item.rows[0].it_name,
                    warning: designWarning, //  optional warning
                  },
                });
              }

          case "DETAIL_ITEM_VALIDATE": {
                    const { input_it_code, final_code, usage: extraUsage } = extra || {};

                    if (!input_it_code) {
                      return res.json({
                        valid: false,
                        message: "Item code can't be blank",
                      });
                    }

                    /* ===== Item Master (MANDATORY) ===== */
                    const item = await db.query(
                      `
                      SELECT it_name, it_bom_um, it_fmp_pu
                      FROM mommitem
                      WHERE it_code = $1
                      LIMIT 1
                      `,
                      [input_it_code]
                    );

                    if (item.rowCount === 0) {
                      return res.json({
                        valid: false,
                        message: "Item code does not exists in Item Master",
                      });
                    }

                    /* ===== FMP ITEM ROUTE CHECK (MANDATORY) ===== */
                    if (item.rows[0].it_fmp_pu === "F") {
                      const routeRes = await db.query(
                        `
                        SELECT 1
                        FROM mhpsrout
                        WHERE it_code = $1
                        LIMIT 1
                        `,
                        [input_it_code]
                      );

                      if (routeRes.rowCount === 0) {
                        return res.json({
                          valid: false,
                          message: "Route for this FMP Item not defined",
                        });
                      }
                    }

                    /* ===== Design BOM (OPTIONAL usage) ===== */
                    let usage = extraUsage ?? null;

                    if (usage == null && final_code) {
                      const bom = await db.query(
                        `
                        SELECT usage
                        FROM mopsbom_design
                        WHERE chl_it_cd = $1
                          AND par_it_cd = $2
                        LIMIT 1
                        `,
                        [input_it_code, final_code]
                      );

                      if (bom.rowCount > 0) {
                        usage = bom.rows[0].usage;
                      }
                    }

                    /* ===== FINAL SUCCESS RESPONSE ===== */
                    return res.json({
                      valid: true,
                      data: {
                        it_name: item.rows[0].it_name,
                        it_bom_um: item.rows[0].it_bom_um,
                        usage,
                      },
                    });
                  }

              case "COPY_ROUTE_VALIDATE": {
                const { new_route_no } = extra || {};

                if (!new_route_no) {
                  return res.json({
                    valid: false,
                    message: "New Route No. can't be blank",
                  });
                }

                const dup = await db.query(
                  `
                  SELECT 1
                  FROM mhpsrout
                  WHERE route_no = $1
                  LIMIT 1
                  `,
                  [new_route_no]
                );

                if (dup.rowCount > 0) {
                  return res.json({
                    valid: false,
                    message: "Route Sheet No. already exists",
                  });
                }

                return res.json({ valid: true });
              }

            case "COPY_ROUTE_SHEET": {
              const {
                old_route_no,
                new_route_no,
                new_it_code,
                wc_id,
                user_id,
              } = extra || {};

              if (!old_route_no || !new_route_no || !new_it_code || !wc_id || !user_id) {
                return res.json({
                  valid: false,
                  message: "Missing required data for Copy Route",
                });
              }

              //  CALL PG PROCEDURE
              await db.query(
                `CALL copy_route_sheet($1,$2,$3,$4,$5)`,
                [
                  old_route_no,   // current route
                  new_route_no,   // new route
                  new_it_code,    // new product
                  wc_id,          // work center
                  user_id,        // logged-in user
                ]
              );

              return res.json({
                valid: true,
                message: "Route Sheet Successfully Copied",
              });
            }

             case "TOOL_ITEM_VALIDATE": {
              const { it_code, route_no } = extra || {};

              if (!it_code) {
                return res.json({
                  valid: false,
                  message: "Tool Item Code can't be blank",
                });
              }

              /* ===== ITEM MASTER CHECK ===== */
              const item = await db.query(
                `
                SELECT it_name, um_code
                FROM mommitem
                WHERE it_code = $1
                LIMIT 1
                `,
                [it_code]
              );

              if (item.rowCount === 0) {
                return res.json({
                  valid: false,
                  message: "Item Code does not exist",
                });
              }

              /* ===== DUPLICATE TOOL IN SAME ROUTE ===== */
              if (route_no) {
                const dup = await db.query(
                  `
                  SELECT 1
                  FROM mdpsroutool
                  WHERE route_no = $1
                    AND it_code = $2
                  LIMIT 1
                  `,
                  [route_no, it_code]
                );

                if (dup.rowCount > 0) {
                  return res.json({
                    valid: false,
                    message: "Item already exist",
                  });
                }
              }

              /* ===== SUCCESS ===== */
              return res.json({
                valid: true,
                data: {
                  it_name: item.rows[0].it_name,
                  uom: item.rows[0].um_code,
                },
              });
            }

          default:
            return res.status(200).json({
              valid: false,
              message: "Invalid validation type",
            });
        }

      } catch (error) {
        console.error("validateCommon error:", error);
        return res.status(200).json({
          valid: false,
        message: error.message || "Validation server error",
        });
      }
     };


  const postRouteMaintenanceData = async (req, res) => {
  const { header = {}, details = [], tools = [], drawings = [], user_id } = req.body;

  try {
    await db.query("BEGIN");

    /* ===============================
        GENERATE ROUTE_ID
    =============================== */
    const seqRes = await db.query(
      `SELECT nextval('s_MHPSROUT_route_id') AS route_id`
    );

    const route_id = seqRes.rows[0]?.route_id;
    if (!route_id) {
      throw new Error("Failed to generate route_id");
    }

    /* ===============================
        INSERT ROUTE HEADER
    =============================== */
    const headerRow = transformRouteHeaderToDbData({
      ...header,
      route_id,
    });

    const headerInsertQuery = generateSingleInsertQuery(
      TABLE_NAMES.ROUTE_HEADER,
      headerRow
    );

    await db.query(headerInsertQuery, Object.values(headerRow));

    /* ===============================
        INSERT ROUTE DETAILS
    =============================== */
    if (Array.isArray(details) && details.length > 0) {
      for (const row of details) {
        if (row.isStatus === "deleted") continue;

        const detailRow = transformRouteDetailToDbData({
          ...row,
          route_id,
          route_no: header.route_no,
        });

        const detailInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.ROUTE_DETAIL,
          detailRow
        );

        await db.query(detailInsertQuery, Object.values(detailRow));
      }
    }

    /* =============================
        INSERT ROUTE TOOLS
    =============================== */
    if (Array.isArray(tools) && tools.length > 0) {
      for (const row of tools) {
        if (row.isStatus === "deleted") continue;

        const toolRow = transformRouteToolToDbData({
          ...row,
          route_id,
          route_no: header.route_no,
        });

        const toolInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.ROUTE_TOOL,
          toolRow
        );

        await db.query(toolInsertQuery, Object.values(toolRow));
      }
    }

    /* ===============================
        INSERT ROUTE DRAWINGS ()
    =============================== */
    if (Array.isArray(drawings) && drawings.length > 0) {
      for (const row of drawings) {
        const drawingRow = transformRouteDrawingToDbData({
          ...row,
          route_id,
        });

        const drawingInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.ROUTE_DRAWING,
          drawingRow
        );

        await db.query(drawingInsertQuery, Object.values(drawingRow));
      }
    }

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Route Maintenance data saved successfully",
      route_id,
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save route maintenance data",
    });
  }
  };


  const updateRouteMaintenanceData = async (req, res) => {
    try {
      await db.query("BEGIN");

      const { header, details = [], tools = [], user_id } = req.body;

      if (!header?.route_id) {
        throw new Error("Route Id is required for update");
      }

      /* ================= HEADER UPDATE ================= */
      const headerData = transformRouteHeaderToDbData(header, user_id);
      const headerCols = Object.keys(headerData);
      const headerVals = Object.values(headerData);

      if (headerCols.length) {
        const setClause = headerCols
          .map((c, i) => `${c} = $${i + 1}`)
          .join(", ");

        await db.query(
          `
          UPDATE ${TABLE_NAMES.ROUTE_HEADER}
          SET ${setClause}
          WHERE route_id = $${headerCols.length + 1}
          `,
          [...headerVals, header.route_id]
        );
      }

      /* ================= DETAILS ================= */
      for (const row of details) {
        row.route_id = header.route_id;
        row.route_no = header.route_no;

        /* ---- DELETE ---- */
        if (row.isStatus === "deleted") {
          await db.query(
            `
            DELETE FROM ${TABLE_NAMES.ROUTE_DETAIL}
            WHERE route_id = $1
              AND route_no = $2
              AND input_it_code = $3
            `,
            [row.route_id, row.old_route_no, row.old_input_it_code]
          );
          continue;
        }

        /* ---- INSERT ---- */
        if (row.isStatus === "new") {
          const insertData = transformRouteDetailToDbData(row, user_id);
          const cols = Object.keys(insertData);
          const vals = Object.values(insertData);

          await db.query(
            `
            INSERT INTO ${TABLE_NAMES.ROUTE_DETAIL} (${cols.join(", ")})
            VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})
            `,
            vals
          );
          continue;
        }

        /* ---- KEY CHANGE (input_it_code) ---- */
        if (
          row.isStatus === "changed" &&
          row.old_input_it_code !== row.input_it_code
        ) {
          // delete old
          await db.query(
            `
            DELETE FROM ${TABLE_NAMES.ROUTE_DETAIL}
            WHERE route_id = $1
              AND route_no = $2
              AND input_it_code = $3
            `,
            [row.route_id, row.old_route_no, row.old_input_it_code]
          );

          // insert new
          const insertData = transformRouteDetailToDbData(row, user_id);
          const cols = Object.keys(insertData);
          const vals = Object.values(insertData);

          await db.query(
            `
            INSERT INTO ${TABLE_NAMES.ROUTE_DETAIL} (${cols.join(", ")})
            VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})
            `,
            vals
          );
          continue;
        }

        /* ---- NORMAL UPDATE ---- */
        if (row.isStatus === "changed") {
          const updateData = transformRouteDetailToDbData(row, user_id, true);
          const cols = Object.keys(updateData);
          const vals = Object.values(updateData);

          const setClause = cols
            .map((c, i) => `${c} = $${i + 1}`)
            .join(", ");

          await db.query(
            `
            UPDATE ${TABLE_NAMES.ROUTE_DETAIL}
            SET ${setClause}
            WHERE route_id = $${cols.length + 1}
              AND route_no = $${cols.length + 2}
              AND input_it_code = $${cols.length + 3}
            `,
            [...vals, row.route_id, row.old_route_no, row.old_input_it_code]
          );
        }
      }

      /* ================= TOOLS ================= */
      for (const row of tools) {
        row.route_id = header.route_id;
        row.route_no = header.route_no;

        /* ---- DELETE ---- */
        if (row.isStatus === "deleted") {
          await db.query(
            `
            DELETE FROM ${TABLE_NAMES.ROUTE_TOOL}
            WHERE route_id = $1
              AND route_no = $2
              AND it_code = $3
            `,
            [row.route_id, row.old_route_no, row.old_it_code]
          );
          continue;
        }

        /* ---- INSERT ---- */
        if (row.isStatus === "new") {
          const insertData = transformRouteToolToDbData(row, user_id);
          const cols = Object.keys(insertData);
          const vals = Object.values(insertData);

          await db.query(
            `
            INSERT INTO ${TABLE_NAMES.ROUTE_TOOL} (${cols.join(", ")})
            VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})
            `,
            vals
          );
          continue;
        }

        /* ---- KEY CHANGE (it_code) ---- */
        if (
          row.isStatus === "changed" &&
          row.old_it_code !== row.it_code
        ) {
          // delete old
          await db.query(
            `
            DELETE FROM ${TABLE_NAMES.ROUTE_TOOL}
            WHERE route_id = $1
              AND route_no = $2
              AND it_code = $3
            `,
            [row.route_id, row.old_route_no, row.old_it_code]
          );

          // insert new
          const insertData = transformRouteToolToDbData(row, user_id);
          const cols = Object.keys(insertData);
          const vals = Object.values(insertData);

          await db.query(
            `
            INSERT INTO ${TABLE_NAMES.ROUTE_TOOL} (${cols.join(", ")})
            VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})
            `,
            vals
          );
          continue;
        }

        /* ---- NORMAL UPDATE ---- */
        if (row.isStatus === "changed") {
          const updateData = transformRouteToolToDbData(row, user_id, true);
          const cols = Object.keys(updateData);
          const vals = Object.values(updateData);

          const setClause = cols
            .map((c, i) => `${c} = $${i + 1}`)
            .join(", ");

          await db.query(
            `
            UPDATE ${TABLE_NAMES.ROUTE_TOOL}
            SET ${setClause}
            WHERE route_id = $${cols.length + 1}
              AND route_no = $${cols.length + 2}
              AND it_code = $${cols.length + 3}
            `,
            [...vals, row.route_id, row.old_route_no, row.old_it_code]
          );
        }
      }

      await db.query("COMMIT");

      return res.status(200).json({
        success: true,
        message: "Routing Maintenance updated successfully",
      });

    } catch (err) {
      await db.query("ROLLBACK");
      console.error("Route update error:", err);

      return res.status(500).json({
        success: false,
        message: err.message || "Failed to update routing maintenance",
      });
    }
  };

  exports.handleFormOperation = catchAsync(async (req, res, next) => {
      if (["Query", "Search"].includes(req?.query?.formStatus)) { 
          await getDataOnQuery(req, res);
          return;
      }

      if (req?.query?.help_list) {
          await helpListData(req, res);
          return;
      }
  })

  exports.handlePostFormData = catchAsync(async (req, res, next) => {
      if (req?.query?.form_status && req?.query?.form_status === "Update") {
          await updateRouteMaintenanceData(req, res);
          return;
      }
      if (req?.query?.form_status === "Insert") {
          await postRouteMaintenanceData(req, res);
          return;
      }
  });

