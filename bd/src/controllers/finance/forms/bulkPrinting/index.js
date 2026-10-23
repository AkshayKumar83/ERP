const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const VOUCHER_TYPE_MAP = {
  B: ["B1", "B2"],
  // P: ["P1", "P4"],
  // P0: ["P0"],
  PE: ["P0","P1", "P4"],
  S: ["S1"],
  J: ["J1"],
  C: ["C1"],
};

const INVOICE_TYPE_MAP = {
  G: ["T"], // Good Invoice
  S: ["S"], // Service Invoice
};

const PO_TYPE_MAP = {
  P: ["DI"],
};

exports.handleGoButtonOperation = catchAsync(async (req, res, next) => {
  const {
    doc_type,
    voucher_type,
    invoice_type,
    po_type,
    from_no,
    to_no,
    trans_year,
    from_date,
    to_date,
    search_by
  } = req.query;

  try {
    let query = "";
    let values = [];

    //  VOUCHER
    // if (doc_type === "V") {
    //   const transTypes = VOUCHER_TYPE_MAP[voucher_type];

    //   if (!transTypes?.length) {
    //     return res.status(400).json({ message: "Invalid voucher type" });
    //   }

    //   query = `
    //     SELECT *,
    //  TO_CHAR(voucher_dt, 'YYYY-MM-DD') AS voucher_dt
    //     FROM thfmtran
    //     WHERE trans_year = $1
    //     AND trans_type = ANY($2)
    //     AND voucher_no BETWEEN $3 AND $4
    //     ORDER BY voucher_no
    //   `;

    //   values = [trans_year, transTypes, from_no, to_no];
    // }

    if (doc_type === "V") {
  const transTypes = VOUCHER_TYPE_MAP[voucher_type];

  if (!transTypes?.length) {
    return res.status(400).json({ message: "Invalid voucher type" });
  }

  // Purchase / Expense Voucher
 if (voucher_type === "PE") {

   if (!search_by) {
    return res.status(400).json({
      message: "Search Range type required"
    });
  }

  if (search_by === "D") {

     if (!from_date || !to_date) {
    return res.status(400).json({
      message: "From Date and To Date required"
    });
  }

    query = `
      SELECT *,
        TO_CHAR(voucher_dt, 'YYYY-MM-DD') AS voucher_dt
      FROM thfmtran
      WHERE trans_year = $1
        AND trans_type = ANY($2)
        AND voucher_dt BETWEEN $3 AND $4
      ORDER BY voucher_no
    `;

    values = [trans_year,transTypes,from_date,to_date,];

  } else {

    query = `
      SELECT *,
        TO_CHAR(voucher_dt, 'YYYY-MM-DD') AS voucher_dt
      FROM thfmtran
      WHERE trans_year = $1
        AND trans_type = ANY($2)
        AND voucher_no BETWEEN $3 AND $4
      ORDER BY voucher_no
    `;

    values = [trans_year,transTypes,from_no,to_no];
  }
}

  // Bank, Cash, Sale, Journal
  else {
    query = `
      SELECT *,
        TO_CHAR(voucher_dt, 'YYYY-MM-DD') AS voucher_dt
      FROM thfmtran
      WHERE trans_year = $1
        AND trans_type = ANY($2)
        AND voucher_no BETWEEN $3 AND $4
      ORDER BY voucher_no
    `;

    values = [ trans_year, transTypes, from_no, to_no ];
  }
}

    //  INVOICE
    else if (doc_type === "I") {
      const invTypes = INVOICE_TYPE_MAP[invoice_type];

      if (!invTypes?.length) {
        return res.status(400).json({ message: "Invalid invoice type" });
      }

      query = `
        SELECT *,
        TO_CHAR(inv_dt, 'YYYY-MM-DD') AS inv_dt
        FROM mhsminv
        WHERE inv_type = ANY($1)
        AND inv_no BETWEEN $2 AND $3
        ORDER BY inv_no
      `;

      values = [invTypes, from_no, to_no];
    }

    //  PO
    else if (doc_type === "P") {
      const poTypes = PO_TYPE_MAP[po_type];

      if (!poTypes?.length) {
        return res.status(400).json({ message: "Invalid PO type" });
      }

      query = `
      (
  SELECT *,
    TO_CHAR(po_date, 'YYYY-MM-DD') AS po_date
  FROM mhmmpo
  WHERE category = ANY($1)
    AND po_no BETWEEN $2 AND $3
)

UNION ALL

(
  SELECT *,
    TO_CHAR(po_date, 'YYYY-MM-DD') AS po_date
  FROM mhmmpoamd
  WHERE category = ANY($1)
    AND po_no BETWEEN $2 AND $3
)

ORDER BY po_no;
      `;

      values = [poTypes, from_no, to_no];
    }

    else {
      return res.status(400).json({ message: "Invalid doc type" });
    }

    const result = await db.query(query, values);

return res.status(200).json({
  data: result.rows,
  count: result.rows.length
});

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error on fetching range data",
    });
  }
});

exports.handleHelpListOperation = catchAsync(async (req, res, next) => {
  try {
    const { type, subType, appFinYear } = req.query;

    // console.log("TYPE:", type);
    // console.log("SUBTYPE:", subType);

    let query = "";
    let values = [];

    if (type === "V") {
      const transTypes = VOUCHER_TYPE_MAP[subType];

      if (!transTypes?.length) {
        return res.status(400).json({ message: "Invalid voucher subtype" });
      }

      query = `
        SELECT voucher_no
        FROM thfmtran
        WHERE trans_year = $1
        AND trans_type = ANY($2)
        ORDER BY voucher_no
      `;

      values = [appFinYear, transTypes];
    }

    else if (type === "I") {
      const invTypes = INVOICE_TYPE_MAP[subType];

      query = `
        SELECT inv_no
        FROM mhsminv
        WHERE inv_type = ANY($1)
        ORDER BY inv_no
      `;

      values = [invTypes];
    }

    else if (type === "P") {
      const poTypes = PO_TYPE_MAP[subType];

      query = `
        (
          SELECT po_no FROM mhmmpo WHERE category = ANY($1)
        )
        UNION ALL
        (
          SELECT po_no FROM mhmmpoamd WHERE category = ANY($1)
        )
        ORDER BY po_no
      `;

      values = [poTypes];
    }

    else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const result = await db.query(query, values);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error in help list API",
    });
  }
});

exports.handleBulkPrintingOperation = catchAsync(async (req, res, next) => {
  const { printRows, doc_type } = req.body;

  if (!printRows?.length) {
    return res.status(400).json({ error: "No rows received" });
  }

  const type = doc_type?.toUpperCase();
  const generatedFiles = [];

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar"
  );

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../reportGeneration/reports/"
  );

  try {
    for (const row of printRows) {

      // =====================================================
      //  VOUCHER
      // =====================================================
      if (type === "V") {
        const pVch_no = row.voucher_no;
        if (!pVch_no) continue;

        let transType, voucherId, refId;
        let reportName = null;
        let params = {};

        // Step 1: Identify transaction
        const result = await db.query(
          `select trans_type, voucher_id from thfmtran where voucher_no = $1`,
          [pVch_no]
        );

        console.log(`[STEP-1] thfmtran result for ${pVch_no}:`, result.rows);

        if (result.rows.length > 0) {
          transType = result.rows[0].trans_type;
          voucherId = result.rows[0].voucher_id;

          console.log(`[STEP-1] Found in thfmtran => transType: ${transType}, voucherId: ${voucherId}`);

          // If cash type found in thfmtran, also fetch refId from thfmcash
          if (transType.startsWith("C")) {
            console.log(`[STEP-1] Cash type found in thfmtran, fetching refId from thfmcash for voucher: ${pVch_no}`);
            const cashRef = await db.query(
              // `select ref_id from thfmcash where ref_no = $1`,
              `select ref_id from thfmcash where voucher_no = $1`,
              [pVch_no]
            );
            console.log(`[STEP-1] thfmcash ref result:`, cashRef.rows);
            if (cashRef.rows.length > 0) {
              refId = cashRef.rows[0].ref_id;
              console.log(`[STEP-1] refId fetched from thfmcash: ${refId}`);
            } else {
              console.warn(`[STEP-1] No refId found in thfmcash for voucher: ${pVch_no}`);
            }
          }

        } else {
          const cash = await db.query(
            `select trans_type, ref_id from thfmcash where ref_no = $1`,
            [pVch_no]
          );

          console.log(`[STEP-1] thfmcash result for ${pVch_no}:`, cash.rows);

          if (cash.rows.length > 0) {
            transType = cash.rows[0].trans_type;
            refId = cash.rows[0].ref_id;
            console.log(`[STEP-1] Found in thfmcash => transType: ${transType}, refId: ${refId}`);
          } else {
            const bank = await db.query(
              `select trans_type, ref_id from thfmbank where ref_no = $1`,
              [pVch_no]
            );

            console.log(`[STEP-1] thfmbank result for ${pVch_no}:`, bank.rows);

            if (bank.rows.length > 0) {
              transType = bank.rows[0].trans_type;
              refId = bank.rows[0].ref_id;
              console.log(`[STEP-1] Found in thfmbank => transType: ${transType}, refId: ${refId}`);
            } else {
              console.warn(`[STEP-1] No record found anywhere for voucher: ${pVch_no}, skipping...`);
              continue;
            }
          }
        }

        console.log(`[STEP-2] Determining report for transType: ${transType}, voucherId: ${voucherId}, refId: ${refId}`);

        // Step 2: Determine report
        if (transType === "P0") {
          reportName = "exp_vch";
          await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
          params = {
            pVch_id: { type: "Integer", value: voucherId },
            PCompany_name: { type: "String", value: "Eddal" },
            PDiv: { type: "Integer", value: 1 },
          };
        } else if (['P1', 'P4'].includes(transType)) {
          reportName = "purch_vch";
          await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
          params = {
            pVch_id: { type: "Integer", value: voucherId },
            PCompany_name: { type: "String", value: "Eddal" },
            PDiv: { type: "Integer", value: 1 },
          };
        } else if (transType.startsWith("B") && voucherId) {
          reportName = "bank_vch";
          await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
          params = {
            pRef_id: { type: "Integer", value: voucherId },
            pDiv_name: { type: "String", value: "UNIT-1" },
            pAddress: { type: "String", value: "FARIDABAD" },
          };
        } else if (transType.startsWith("C")) {
          console.log(`[STEP-2] Cash voucher block hit => refId: ${refId}`);
          reportName = "cash_vch";
          await db.query(`call proc_voucher_print_temp(null,$1,$2,$3)`, [refId, transType, 0]);
          params = {
            Ref_id: { type: "Integer", value: refId },
            PCompany_name: { type: "String", value: "Eddal" },
            pDiv_name: { type: "String", value: "Unit-1" },
          };
        } else if (transType.startsWith("J")) {
          reportName = "jrnl_vch";
          await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
          params = {
            pVch_id: { type: "Integer", value: voucherId },
            PCompany_name: { type: "String", value: "Eddal" },
            PDiv: { type: "Integer", value: 1 },
          };
        } else if (transType.startsWith("RN") || transType.startsWith("DN")) {
          // ⚠️ FIXED: was `("RN" || "DN")` which is always "RN"
          console.log(`[STEP-2] DBCR block hit => transType: ${transType}`);
          reportName = "dbcr";
          await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
          params = {
            pVch_id: { type: "Integer", value: voucherId },
            PCompany_name: { type: "String", value: "Eddal" },
            PDiv: { type: "Integer", value: 1 },
          };
        } else {
          console.warn(`[STEP-2] Unsupported trans_type: ${transType} for voucher: ${pVch_no}, skipping...`);
          continue;
        }

        console.log(`[STEP-3] reportName: ${reportName}, params:`, params);

        const outputFileName = `${reportName}_${pVch_no.replace(/[\/]/g, "-")}.pdf`;
        const fullOutputPath = path.join(REPORT_DIR, outputFileName);

        const paramString = Object.entries(params)
          .map(([key, { type, value }]) => `${key}=${type}:${value}`)
          .concat([`outputFileName=${outputFileName}`])
          .join(" ");

        const command = `java -jar "${JAR_PATH}" reportName="${reportName}" ${paramString}`;

        console.log(`[STEP-3] Executing command: ${command}`);

        await new Promise((resolve, reject) => {
          exec(command, { cwd: path.dirname(JAR_PATH), shell: true }, (error, stdout, stderr) => {
            if (error || stderr) {
              console.error(`[STEP-3] PDF generation failed:`, error?.message || stderr);
              return reject(error || stderr);
            }

            setTimeout(() => {
              if (!fs.existsSync(fullOutputPath)) {
                return reject(new Error(`Voucher PDF not found: ${fullOutputPath}`));
              }
              console.log(`[STEP-3] PDF generated successfully: ${fullOutputPath}`);
              generatedFiles.push(fullOutputPath);
              resolve();
            }, 400);
          });
        });
      }

      // =====================================================
      //  INVOICE
      // =====================================================
      else if (type === "I") {
        const inv_id = Number(row.inv_id);

        const reportName = "invprint_ls";
        const baseOutputName = `${reportName}_${inv_id}`;
        const outputFilename = `${baseOutputName}.pdf`;
        const fullOutputPath = path.join(REPORT_DIR, outputFilename);

        if (fs.existsSync(fullOutputPath)) {
          fs.unlinkSync(fullOutputPath);
        }

        const params = {
          pInv_id: { type: "Integer", value: inv_id },
        };

        const paramString = Object.entries(params)
          .map(([key, { type, value }]) => `${key}=${type}:${value}`)
          .join(" ");

        const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

        console.log("COMMAND:", command);

        await new Promise((resolve, reject) => {
          exec(
            command,
            { cwd: path.dirname(JAR_PATH), shell: "C:\\Windows\\System32\\cmd.exe" },
            (error, stdout, stderr) => {
              if (error || stderr) {
                console.error("❌ Error generating service invoice print:", error?.message || stderr);
                return res.status(500).json({ error: "Error generating Service Invoice Print" });
              }

              setTimeout(() => {
                const exists = fs.existsSync(fullOutputPath);
                const size = exists ? fs.statSync(fullOutputPath).size : 0;
                console.log(`PDF exists: ${exists}, size: ${size}`);

                if (!exists || size < 1000) {
                  return reject(new Error(`Invoice PDF not generated properly for inv_id: ${inv_id}`));
                }
                generatedFiles.push(fullOutputPath);
                resolve();
              }, 400);
            }
          );
        });
      }

      // =====================================================
      //  PURCHASE ORDER (PO)
      // =====================================================
      else if (type === "P") {
        const po_no = row.po_no;
        if (!po_no) continue;

        let ref_id;

        const genPoRefId = await db.query(
          `select nextval('s_mhmmpo_print_temp_rep_id') as ref_id`
        );

        if (genPoRefId.rowCount === 0) {
          throw new Error("Failed to generate PO reference ID");
        }

        ref_id = Number(genPoRefId.rows[0].ref_id);

        await db.query(
          `call fill_data_4_po_print($1, $2, $3, $4, 'N','Y','N','F', null)`,
          [ref_id, 1, po_no, po_no]
        );

        const reportName = "po_print";
        const baseOutputName = `${reportName}_${ref_id}`;
        const outputFilename = `${baseOutputName}.pdf`;
        const fullOutputPath = path.join(REPORT_DIR, outputFilename);

        const params = {
          PREP_ID: { type: "Long", value: ref_id },
        };

        const paramString = Object.entries(params)
          .map(([key, { type, value }]) => `${key}=${type}:${value}`)
          .join(" ");

        const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

        await new Promise((resolve, reject) => {
          exec(
            command,
            { cwd: path.dirname(JAR_PATH), shell: "C:\\Windows\\System32\\cmd.exe" },
            (error, stdout, stderr) => {
              if (error || stderr) {
                console.error("PO Error:", error?.message || stderr);
                return reject(error || stderr);
              }

              setTimeout(() => {
                if (!fs.existsSync(fullOutputPath)) {
                  return reject(new Error("PO PDF not found"));
                }
                generatedFiles.push(fullOutputPath);
                resolve();
              }, 400);
            }
          );
        });
      }

      else {
        console.warn("Invalid doc_type:", type);
        continue;
      }
    }

    // =====================================================
    //  MERGE ALL PDFs
    // =====================================================
    if (generatedFiles.length === 0) {
      return res.status(400).json({ error: "No reports generated" });
    }

    const { PDFDocument } = require("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    for (const filePath of generatedFiles) {
      const pdfBytes = fs.readFileSync(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }

    const mergedPdfBytes = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bulk_print.pdf"`);

    return res.send(Buffer.from(mergedPdfBytes));

  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// exports.handleBulkPrintingOperation = catchAsync(async (req, res, next) => {
//   const { printRows, doc_type } = req.body;

//   if (!printRows?.length) {
//     return res.status(400).json({ error: "No rows received" });
//   }

//   const type = doc_type?.toUpperCase(); // V / I
//   const generatedFiles = [];

//   const JAR_PATH = path.resolve(
//     __dirname,
//     "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar"
//   );

//   const REPORT_DIR = path.resolve(
//     __dirname,
//     "../../../../../reportGeneration/reports/"
//   );

//   try {
//     for (const row of printRows) {

//       // =====================================================
//       //  VOUCHER
//       // =====================================================
//       if (type === "V") {
//         const pVch_no = row.voucher_no;
//         if (!pVch_no) continue;

//         let transType, voucherId, refId;
//         let reportName = null;
//         let params = {};

//         // Step 1: Identify transaction
//         const result = await db.query(
//           `select trans_type, voucher_id from thfmtran where voucher_no = $1`,
//           [pVch_no]
//         );

//         if (result.rows.length > 0) {
//           transType = result.rows[0].trans_type;
//           voucherId = result.rows[0].voucher_id;
//         } else {
         
//         const cash = await db.query(
//           `select trans_type, ref_id from thfmcash where ref_no = $1`,
//           [pVch_no]
//         );
//         if (cash.rows.length > 0) {
//           transType = cash.rows[0].trans_type;
//           refId = cash.rows[0].ref_id;
//           } else {
//             const bank = await db.query(
//               `select trans_type, ref_id from thfmbank where ref_no = $1`,
//               [pVch_no]
//             );

//             if (bank.rows.length > 0) {
//               transType = bank.rows[0].trans_type;
//               refId = bank.rows[0].ref_id;
//             } else {
//               console.warn(`No report found for voucher: ${pVch_no}`);
//               continue;
//             }
//           }
//         }

//         // Step 2: Determine report
//    if (transType === "P0") {
//       reportName = "exp_vch";
//       await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
//         voucherId,
//         transType,
//         0,
//       ]);
//       params = {
//         pVch_id: { type: "Integer", value: voucherId },
//         PCompany_name: { type: "String", value: "Eddal" },
//         PDiv: { type: "Integer", value: 1 },
//       };
//     }else if(['P1','P4'].includes(transType)){
//       // console.log('inside purch block', transType)
//         reportName = "purch_vch";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [ voucherId, transType, 0]);
//       params = {
//         pVch_id: { type: "Integer", value: voucherId },
//         PCompany_name: { type: "String", value: "Eddal" },
//         PDiv: { type: "Integer", value: 1 },
//       };
//     }else if (transType.startsWith("B") && voucherId) {
//       reportName = "bank_vch";
//       await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
//         voucherId,
//         transType,
//         0,
//       ]);
//       // params = {
//       //   pVoucher_id: { type: "Integer", value: voucherId },
//       // };
//        params = {
//         pRef_id: { type: "Integer", value: voucherId },
//         pDiv_name: { type: "String", value: "UNIT-1" },
//         pAddress: { type: "String", value: "FARIDABAD" },
//       };
//     } else if (transType.startsWith("C") && refId) {
//       reportName = "cash_vch";
//       await db.query(`call proc_voucher_print_temp(null,$1,$2,$3)`, [
//         refId,
//         transType,
//         0,
//       ]);

//       params = {
//         Ref_id: { type: "Integer", value: refId },
//         PCompany_name: { type: "String", value: "Eddal" },
//         pDiv_name: { type: "String", value: "Unit-1" },
//       };
//     } else if (transType.startsWith("J")) {
//       reportName = "jrnl_vch";
//       await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
//         voucherId,
//         transType,
//         0,
//       ]);
//       params = {
//         pVch_id: { type: "Integer", value: voucherId },
//         PCompany_name: { type: "String", value: "Eddal" },
//         PDiv: { type: "Integer", value: 1 },
//       };
//     }else if (transType.startsWith("RN" ||"DN")) {
//       console.log('inside dbcr block')
//       reportName = "dbcr";
//       await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
//         voucherId,
//         transType,
//         0,
//       ]);
//       params = {
//         pVch_id: { type: "Integer", value: voucherId },
//         PCompany_name: { type: "String", value: "Eddal" },
//         PDiv: { type: "Integer", value: 1 },
//       };
//     } else {
//        console.warn(`Unsupported trans_type: ${transType} for voucher: ${pVch_no}, skipping...`);
//         continue;
//         }

//         const outputFileName = `${reportName}_${pVch_no.replace(/[\/]/g, "-")}.pdf`;
//         const fullOutputPath = path.join(REPORT_DIR, outputFileName);

//         const paramString = Object.entries(params)
//           .map(([key, { type, value }]) => `${key}=${type}:${value}`)
//           .concat([`outputFileName=${outputFileName}`])
//           .join(" ");

//         const command = `java -jar "${JAR_PATH}" reportName="${reportName}" ${paramString}`;

//         await new Promise((resolve, reject) => {
//           exec(command, { cwd: path.dirname(JAR_PATH), shell: true }, (error, stdout, stderr) => {
//             if (error || stderr) return reject(error || stderr);

//             setTimeout(() => {
//               if (!fs.existsSync(fullOutputPath)) {
//                 return reject(new Error("Voucher PDF not found"));
//               }
//               generatedFiles.push(fullOutputPath);
//               resolve();
//             }, 400);
//           });
//         });
//       }

//       //  INVOICE ()

// else if (type === "I") {
//   const inv_id = Number(row.inv_id);

//   const reportName = "invprint_ls";
//   const baseOutputName = `${reportName}_${inv_id}`;
//   const outputFilename = `${baseOutputName}.pdf`;
//   const fullOutputPath = path.join(REPORT_DIR, outputFilename);

//   if (fs.existsSync(fullOutputPath)) {
//     fs.unlinkSync(fullOutputPath);
//   }

//   const params = {
//     pInv_id: { type: "Integer", value: inv_id },
//   };

//   const paramString = Object.entries(params)
//     .map(([key, { type, value }]) => `${key}=${type}:${value}`)
//     .join(" ");

//   const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

//   console.log("COMMAND:", command); // ← exact command dekho

//   await new Promise((resolve, reject) => {
//     exec(
//       command,
//       { cwd: path.dirname(JAR_PATH), 
//         shell: "C:\\Windows\\System32\\cmd.exe" },
//       // (error, stdout, stderr) => {
//       //   console.log("STDOUT:", stdout);       // ← Jasper output
//       //   console.log("STDERR:", stderr);       // ← Jasper error — YE SABSE IMPORTANT HAI
//       //   console.log("ERROR:", error?.message); // ← exec error

//       //   if (error) return reject(error);

//       (error, stdout, stderr) => {
//       // console.log(stdout);
//       if (error || stderr) {
//         console.error(
//           "❌ Error generating service invoice print:",
//           error?.message || stderr,
//         );
//         return res
//           .status(500)
//           .json({ error: "Error generating Service Invoice Print" });
//       }

//         setTimeout(() => {
//           const exists = fs.existsSync(fullOutputPath);
//           const size = exists ? fs.statSync(fullOutputPath).size : 0;
//           console.log(`PDF exists: ${exists}, size: ${size}`);

//           if (!exists || size < 1000) { // size bhi check karo — empty PDF ~500 bytes hoti hai
//             return reject(new Error(`Invoice PDF not generated properly for inv_id: ${inv_id}`));
//           }
//           generatedFiles.push(fullOutputPath);
//           resolve();
//         }, 400);
//       }
//     );
//   });
// }

    
// //  PURCHASE ORDER (PO)

// else if (type === "P") {
//   const po_no = row.po_no;
//   if (!po_no) continue;

//   let ref_id;

//   // Step 1: Generate ref_id
//   const genPoRefId = await db.query(
//     `select nextval('s_mhmmpo_print_temp_rep_id') as ref_id`
//   );

//   if (genPoRefId.rowCount === 0) {
//     throw new Error("Failed to generate PO reference ID");
//   }

//   ref_id = Number(genPoRefId.rows[0].ref_id);

//   // Step 2: Call procedure (same as single API)
//   await db.query(
//     `call fill_data_4_po_print($1, $2, $3, $4, 'N','Y','N','F', null)`,
//     [ref_id, 1, po_no, po_no]
//   );

//   const reportName = "po_print";
//   const baseOutputName = `${reportName}_${ref_id}`;
//   const outputFilename = `${baseOutputName}.pdf`;
//   const fullOutputPath = path.join(REPORT_DIR, outputFilename);

//   const params = {
//     PREP_ID: { type: "Long", value: ref_id },
//   };

//   const paramString = Object.entries(params)
//     .map(([key, { type, value }]) => `${key}=${type}:${value}`)
//     .join(" ");

//   const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

//   await new Promise((resolve, reject) => {
//     exec(
//       command,
//       {
//         cwd: path.dirname(JAR_PATH),
//         shell: "C:\\Windows\\System32\\cmd.exe",
//       },
//       (error, stdout, stderr) => {
//         if (error || stderr) {
//           console.error("PO Error:", error?.message || stderr);
//           return reject(error || stderr);
//         }

//         setTimeout(() => {
//           if (!fs.existsSync(fullOutputPath)) {
//             return reject(new Error("PO PDF not found"));
//           }

//           generatedFiles.push(fullOutputPath);
//           resolve();
//         }, 400);
//       }
//     );
//   });
// }

//       else {
//         console.warn("Invalid doc_type:", type);
//         continue;
//       }
//     }

//     // =====================================================
//     //  MERGE ALL PDFs
//     // =====================================================
//     if (generatedFiles.length === 0) {
//       return res.status(400).json({ error: "No reports generated" });
//     }

//     const { PDFDocument } = require("pdf-lib");
//     const mergedPdf = await PDFDocument.create();

//     for (const filePath of generatedFiles) {
//       const pdfBytes = fs.readFileSync(filePath);
//       const pdf = await PDFDocument.load(pdfBytes);
//       const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//       pages.forEach((p) => mergedPdf.addPage(p));
//     }

//     const mergedPdfBytes = await mergedPdf.save();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="bulk_print.pdf"`);

//     return res.send(Buffer.from(mergedPdfBytes));

//   } catch (err) {
//     console.error("💥 Error:", err);
//     res.status(500).json({ error: err.message });
//   }  
// });











// exports.handleBulkPrintingOperation = catchAsync(async (req, res, next) => {
//   const { printRows } = req.body;

//   if (!printRows?.length) {
//     return res.status(400).json({ error: "No rows received" });
//   }

//   const generatedFiles = [];

//   try {
//     for (const row of printRows) {
//       const pVch_no = row.voucher_no;

//       if (!pVch_no) continue; // skip if no voucher_no

//       let transType, voucherId, refId;
//       let reportName = null;
//       let params = {};

//       // Step 1: Identify transaction
//       const result = await db.query(
//         `select trans_type, voucher_id from thfmtran where voucher_no = $1`,
//         [pVch_no]
//       );

//       if (result.rows.length > 0) {
//         transType = result.rows[0].trans_type;
//         voucherId = result.rows[0].voucher_id;
//       } else {
//         const cash = await db.query(
//           `select trans_type, ref_id from thfmcash where ref_no = $1`,
//           [pVch_no]
//         );
//         if (cash.rows.length > 0) {
//           transType = cash.rows[0].trans_type;
//           refId = cash.rows[0].ref_id;
//         } else {
//           const bank = await db.query(
//             `select trans_type, ref_id from thfmbank where ref_no = $1`,
//             [pVch_no]
//           );
//           if (bank.rows.length > 0) {
//             transType = bank.rows[0].trans_type;
//             refId = bank.rows[0].ref_id;
//           } else {
//             console.warn(`No report found for voucher: ${pVch_no}, skipping...`);
//             continue; // skip this voucher instead of returning error
//           }
//         }
//       }

//       // Step 2: Determine report and params
//       if (transType === "P0") {
//         reportName = "exp_vch";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
//         params = {
//           pVch_id: { type: "Integer", value: voucherId },
//           PCompany_name: { type: "String", value: "Eddal" },
//           PDiv: { type: "Integer", value: 1 },
//         };
//       } else if (["P1", "P4"].includes(transType)) {
//         reportName = "purch_vch";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
//         params = {
//           pVch_id: { type: "Integer", value: voucherId },
//           PCompany_name: { type: "String", value: "Eddal" },
//           PDiv: { type: "Integer", value: 1 },
//         };
//       } else if (transType.startsWith("B") && voucherId) {
//         reportName = "bank_vch";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
//         params = {
//           pRef_id: { type: "Integer", value: voucherId },
//           pDiv_name: { type: "String", value: "UNIT-1" },
//           pAddress: { type: "String", value: "FARIDABAD" },
//         };
//       } else if (transType.startsWith("C") && refId) {
//         reportName = "cash_vch";
//         await db.query(`call proc_voucher_print_temp(null,$1,$2,$3)`, [refId, transType, 0]);
//         params = {
//           Ref_id: { type: "Integer", value: refId },
//           PCompany_name: { type: "String", value: "Eddal" },
//           pDiv_name: { type: "String", value: "Unit-1" },
//         };
//       } else if (transType.startsWith("J")) {
//         reportName = "jrnl_vch";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
//         params = {
//           pVch_id: { type: "Integer", value: voucherId },
//           PCompany_name: { type: "String", value: "Eddal" },
//           PDiv: { type: "Integer", value: 1 },
//         };
//       } else if (transType.startsWith("RN") || transType.startsWith("DN")) {
//         reportName = "dbcr";
//         await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [voucherId, transType, 0]);
//         params = {
//           pVch_id: { type: "Integer", value: voucherId },
//           PCompany_name: { type: "String", value: "Eddal" },
//           PDiv: { type: "Integer", value: 1 },
//         };
//       } else {
//         console.warn(`Unsupported trans_type: ${transType} for voucher: ${pVch_no}, skipping...`);
//         continue;
//       }

//       // Step 3: Generate report for this voucher
//       const JAR_PATH = path.resolve(
//         __dirname,
//         // "../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar"
//         "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
//       );
//       const REPORT_DIR = path.resolve(__dirname, 
//         // "../reportGeneration/reports/"
//     "../../../../../reportGeneration/reports/",

//       );

//       const outputFileName = `${reportName}_${pVch_no.replace(/[\/]/g, "-")}.pdf`;
//       const fullOutputPath = path.join(REPORT_DIR, outputFileName);

//       const paramString = Object.entries(params)
//         .map(([key, { type, value }]) => `${key}=${type}:${value}`)
//         .concat([`outputFileName=${outputFileName}`])
//         .join(" ");

//       const command = `java -jar "${JAR_PATH}" reportName="${reportName}" ${paramString}`;
//       console.log(`🖨 Generating report: ${outputFileName}`);

//       // Run jasper and wait for it to finish (promisified)
//       await new Promise((resolve, reject) => {
//         exec(command, { cwd: path.dirname(JAR_PATH), shell: true }, (error, stdout, stderr) => {
//           console.log(stdout);
//           if (error || stderr) {
//             console.error(`❌ Jasper Error for ${pVch_no}:`, error?.message || stderr);
//             return reject(new Error(`Failed to generate report for ${pVch_no}`));
//           }
//           setTimeout(() => {
//             if (!fs.existsSync(fullOutputPath)) {
//               return reject(new Error(`Report file not found for ${pVch_no}`));
//             }
//             generatedFiles.push(fullOutputPath);
//             resolve();
//           }, 400);
//         });
//       });
//     }

//     if (generatedFiles.length === 0) {
//       return res.status(400).json({ error: "No reports could be generated" });
//     }

//     // Step 4: Merge all PDFs into one using pdf-lib
//     const { PDFDocument } = require("pdf-lib");
//     const mergedPdf = await PDFDocument.create();

//     for (const filePath of generatedFiles) {
//       const pdfBytes = fs.readFileSync(filePath);
//       const pdf = await PDFDocument.load(pdfBytes);
//       const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//       copiedPages.forEach((page) => mergedPdf.addPage(page));
//     }

//     const mergedPdfBytes = await mergedPdf.save();

//     // Step 5: Send merged PDF
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="bulk_print.pdf"`);
//     return res.send(Buffer.from(mergedPdfBytes));

//   } catch (err) {
//     console.error("💥 Internal Server Error:", err);
//     res.status(500).json({ error: err.message || "Internal server error" });
//   }
// });