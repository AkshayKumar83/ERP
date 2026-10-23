const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");


const TABLE_NAMES = {
  LOAN_MASTER_HDR: "thlnefatran",
  LOAN_MASTER_DTL: "tdlnefatran",
  GET_EFA_ID_BY_SEQUENCE: "s_thlnefatran_efa_id",
  LOAN_MASTER: "thlnefatran",
  LOAN_MASTER_DETAIL: "tdlnefatran",
};

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { dateFormater } = require("../../../../utility/constant");

exports.getInvBulkMailFormConstant = catchAsync(async (req, res, next) => {

  const emiDateRangeList = await db.query(
    `select distinct emi_date from ${TABLE_NAMES.LOAN_MASTER_DTL} order by emi_date desc`,
  );

  return res.status(200).json({
    dateRange: emiDateRangeList.rows.map((item)=>{
        return {...item, emi_date: dateFormater(item?.emi_date)}
    }),
  });
});


exports.getEmiList = catchAsync(async (req, res) => {
  const { emi_date } = req.query;

  if (!emi_date) {
    return res.status(400).json({
      type: "error",
      message: "emi_date is required",
    });
  }

  try {
    const result = await db.query(
      `
      select 
        h.efa_id, 
        m.member_no, 
        m.dlr_name, 
        h.efa_application_date,  
        d.emi_date,
        h.efa_ctrl_id, 
        d.emi_sno, 
        h.efa_amount,
        d.principal_amt, 
        d.service_chg_ded, 
        d.igst_amt, 
        d.cgst_amt, 
        d.sgst_amt

        -- 👇 IMPORTANT (invoice flag)
        -- d.inv_no

      from tdlnefatran d
      join thlnefatran h on h.efa_id = d.efa_id
      join moedmember m on h.member_id = m.member_id

      where d.emi_date = $1
      and d.service_chg_ded != 0

      order by h.efa_application_date
      `,
      [emi_date]
    );

    return res.status(200).json({
      type: "success",
      data: result.rows,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});


exports.generateSelectedInvoices = catchAsync(async (req, res) => {
  const { data } = req.body;

  if (!data || data.length === 0) {
    return res.status(400).json({
      type: "error",
      message: "No EMI selected",
    });
  }

  try {
    await db.query("BEGIN");

    for (const row of data) {
      const { emi_sno, sendMail } = row;

      // 🔍 check already generated
      const check = await db.query(
        `select inv_no from tdlnefatran where emi_sno = $1`,
        [emi_sno]
      );

      if (check.rows[0]?.inv_no) {
        continue; // skip already generated
      }

      // 🎯 YOUR EXISTING PROCEDURE
      await db.query(
        `call gen_single_inv_emi($1)`,
        [emi_sno]
      );

      // 📧 optional mail
      if (sendMail) {
        await db.query(
          `select send_invoice_mail($1)`,
          [emi_sno]
        );
      }
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Invoices generated successfully 🚀",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Error generating invoices",
    });
  }
});


exports.genBulkInv = catchAsync(async(req, res, next)=>{
    try {
      const {emi_date} = req.query
      await db.query('begin')

      await db.query(`call gen_bulk_auto_inv_emi($1::date)`,[emi_date])

      // calling this after successfully creating invoices to create un-created sale voucher
      await db.query(`call reauth_inv_4_miss_sale_vch($1::date)`,[emi_date])

      res.status(200).json({type:'success', message:'Service charge Invoices generated successfully'})
      await db.query('commit')
    } catch (error) {
      await db.query('rollback')
      console.error(error)
      res.status(500).json({type:"error", message: error.message || 'Internal server Error'})
    }
})


// UPLOAD LOAN DOCS
exports.uploadDocuments = async (req, res) => {
  const { efa_ctrl_id } = req.body;
  const files = req.files;

  if (!efa_ctrl_id || !files?.length) {
    return res.status(400).json({
      type: "error",
      message: "efa_ctrl_id and files are required.",
    });
  }

  try {
    for (let file of files) {
      await db.query(
        `INSERT INTO thlndocuments 
         (efa_ctrl_id, filename, original_name, file_path, file_size) 
         VALUES ($1, $2, $3, $4, $5)`,
        [efa_ctrl_id, file.filename, file.originalname, file.path, file.size]
      );
    }

    return res.status(200).json({
      type: "success",
      message: "Documents uploaded successfully.",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      type: "error",
      message: "Error uploading documents to database.",
    });
  }
};

exports.printRepaySch = catchAsync(async (req, res) => {
  const { pEfa_id, pUser_name } = req.body;

  if (!pEfa_id) {
    return res.status(400).json({ error: "Missing pEfa_id" });
  }

  const reportName = "loan_repayment";
  const baseOutputName = `${reportName}_${pEfa_id}`;
  const outputFilename = `${baseOutputName}.pdf`;

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar"
  );

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../../reportGeneration/reports/"
  );

  const finalPdfPath = path.join(REPORT_DIR, outputFilename);

  // Params passed as Jasper parameters only
  const params = {
    pEfa_id: { type: "Integer", value: pEfa_id },
    pUser_name: { type: "String", value: pUser_name },
  };

  const paramString = Object.entries(params)
    .map(([key, { type, value }]) => `${key}=${type}:${value}`)
    .join(" ");

  // ✅ Pass outputFileName as a separate CLI argument (not Jasper param)
  const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

  // console.log(`🖨 Generating Service Invoice: ${outputFilename}`);
  exec(
    command,
    {
      cwd: path.dirname(JAR_PATH),
      shell: "C:\\Windows\\System32\\cmd.exe",
    },
    (error, stdout, stderr) => {
      // console.log(stdout);
      if (error || stderr) {
        console.error(
          "❌ Error generating service invoice print:",
          error?.message || stderr
        );
        return res
          .status(500)
          .json({ error: "Error generating Service Invoice Print" });
      }

      setTimeout(() => {
        if (!fs.existsSync(finalPdfPath)) {
          console.error("Generated PDF not found:", finalPdfPath);
          return res.status(500).json({ error: "Generated PDF not found" });
        }

        // console.log(`✅ Service Invoice Ready: ${finalPdfPath}`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${outputFilename}"`
        );
        return res.sendFile(finalPdfPath);
      }, 400);
    }
  );
});


// GET LOAN DOCS
exports.getUploadedDocuments = catchAsync(async (req, res, next) => {
  const { efa_ctrl_id } = req.query;

  if (!efa_ctrl_id) {
    return res.status(400).json({
      type: "error",
      message: "efa_ctrl_id is required",
    });
  }

  try {
    const result = await db.query(
      `SELECT filename, original_name, file_size, uploaded_at 
       FROM integral.thlndocuments 
       WHERE efa_ctrl_id = $1`,
      [efa_ctrl_id]
    );

    const baseUrl =
      process.env.LOAN_DOCS_BASE_URL || "http://localhost:3080/uploads";

    const documents = result.rows.map((doc) => ({
      file_name: doc.original_name,
      file_url: `${baseUrl}/${doc.filename}`,
      file_size: doc.file_size,
      uploaded_at: doc.uploaded_at,
    }));

    return res.status(200).json({
      type: "success",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching uploaded documents:", error);
    return res.status(500).json({
      type: "error",
      message: "Failed to fetch uploaded documents.",
    });
  }
});

