const { db } = require("../../../../../config/dbConnection");
const catchAsync = require("../../../../../utility/catchAsync");
const { dateFormater } = require("../../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../../utility/query");
const { transformHdrToDBTable } = require("./presentation");

const TABLE_NAMES = {
  LOAN_MASTER_HDR: "thlnefatran_temp",
  LOAN_MASTER_DTL: "tdlnefatran_temp",
  GET_EFA_ID_BY_SEQUENCE: "s_thlnefatran_efa_id",
  LOAN_MASTER: "thlnefatran",
  LOAN_MASTER_DETAIL: "tdlnefatran",
};

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  console.log(req?.query?.division_id);

  const bankList = await db.query(
    `SELECT acc_no as bank_cd,bank_name FROM mhfmbank where division_id = $1`,
    [req?.query?.division_id],
  );

  const loanPurposeList = await db.query(
    `SELECT loan_id, loan_purpose_desc FROM mhedloan order by loan_id`,
  );
  return res.status(200).json({
    loanPurpose: loanPurposeList.rows,
    bankList: bankList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  try {
    console.log(req?.query);
    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["efa_ctrl_id", "member_id"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    // Financial Year Filter added by akshay 05-06-26
if (req.query.appFinYear) {
  whereClauses.push(`
    EXISTS (
      SELECT 1
      FROM moitfinyear mf
      WHERE mf.year_code = '${req.query.appFinYear}'
      AND efa_application_date::date
          BETWEEN mf.st_date AND mf.end_date
    )
  `);
}


    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // Default query ordering
    let queryPerameter = `ORDER BY efa_application_date LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount;

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.LOAN_MASTER} ${queryValues}`,
      );
      dataCount = getCount.rows[0]?.count;
      queryPerameter = `${queryValues} ${queryPerameter}`;
    } else {
      // If no search parameters, handle first/last/next/prev normally
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.LOAN_MASTER}`,
          );
          dataCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryPerameter = "ORDER BY efa_application_date DESC LIMIT 1";
          break;
        }
        default:
          queryPerameter = `ORDER BY efa_application_date LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
      }
    }

    // Fetch loan data based on search query or normal query
    const efaData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.LOAN_MASTER} ${queryPerameter}`,
    );

    if (!efaData.rows.length) {
      return res.status(200).send({
        message: "No EFA data found",
        type: "not found",
        count: 0,
      });
    }

    let efaHdrData = efaData?.rows[0];
    let efaDtlData = [];

    // Get party
    const party = await db.query(
      `Select dlr_name, member_no, member_id from moedmember where member_id = $1`,
      [efaHdrData?.member_id],
    );

    if (party.rowCount > 0) {
      efaHdrData.party_name = party.rows[0]?.dlr_name;
      efaHdrData.member_no = party.rows[0]?.member_no;
      efaHdrData.member_id = party.rows[0]?.member_id;
    }
    // formating date
    efaHdrData.instrument_date = dateFormater(efaHdrData.instrument_date);
    efaHdrData.efa_application_date = dateFormater(
      efaHdrData.efa_application_date,
    );

    //GET EMI'S DETAIL'S
    const efaDetails = await db.query(
      `Select * from ${TABLE_NAMES.LOAN_MASTER_DETAIL} where efa_id = $1 order by emi_sno`,
      [efaHdrData?.efa_id],
    );
    if (efaDetails.rowCount > 0) {
      efaDtlData = efaDetails.rows.map((item) => {
        const {
          igst_amt,
          interest_amt,
          principal_amt,
          service_chg_ded,
          sgst_amt,
          cgst_amt,
        } = item;
        let total_amt =
          Number(igst_amt) +
          Number(interest_amt) +
          Number(principal_amt) +
          Number(service_chg_ded) +
          Number(sgst_amt) +
          Number(cgst_amt);
        return {
          ...item,
          emi_date: dateFormater(item?.emi_date),
          total_amt: total_amt.toFixed(2),
        };
      });
    }

    const response = {
      type: "found",
      formHdrData: efaHdrData,
      formDtlData: efaDtlData || [],
      count: dataCount || 0,
    };

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: `Internal server error on query ${error.message}` });
  }
};

const getHelpData = async (req, res) => {
  try {
    const { help_list, form_status, appDivisionId, appFinYear } = req?.query;
    if (help_list === "party_name") {
      const getMemberDataList = await db.query(`
                Select dlr_name, member_no, division, d.city as location, member_id from moedmember m, moeddealer d
                  where m.dealer_code = d.dealer_code
                  order by dlr_name
                `);

      if (getMemberDataList.rows.length > 0) {
        res.status(200).json(getMemberDataList.rows);
      }
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }
};

exports.handleCreateEMI = catchAsync(async (req, res, next) => {
  console.log(req.body);

  let formData = req.body.LoanMasterHdr;

  try {
    await db.query("begin");

    let newFormData = transformHdrToDBTable(formData);
    console.log(newFormData);

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.LOAN_MASTER_HDR,
      newFormData,
    );

    console.log(queryForInsert);

    const valuesForInsertQuery = Object.values(newFormData);

    console.log(queryForInsert, valuesForInsertQuery);
    const result = await db.query(queryForInsert, [...valuesForInsertQuery]);

    if (!result.rowCount > 0) {
      throw new Error("Error while saving header data");
    }

    const queryResult = await db.query(`call create_emi_records_in_temp($1)`, [
      result.rows[0].efa_id,
    ]);

    const getEmiData = await db.query(
      `select * from tdlnefatran_temp where efa_id = $1`,
      [result.rows[0].efa_id],
    );

    let efaDtlData = [];
    if (getEmiData.rowCount > 0) {
      efaDtlData = getEmiData.rows.map((item) => {
        const {
          igst_amt,
          interest_amt,
          principal_amt,
          service_chg_ded,
          sgst_amt,
          cgst_amt,
        } = item;
        let total_amt =
          Number(igst_amt) +
          Number(interest_amt) +
          Number(principal_amt) +
          Number(service_chg_ded) +
          Number(sgst_amt) +
          Number(cgst_amt);
        return {
          ...item,
          emi_date: dateFormater(item?.emi_date),
          total_amt: total_amt.toFixed(2),
        };
      });
    }

    await db.query("commit");
    return res
      .status(200)
      .json({ data: efaDtlData, message: "EMI records created successfully" });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }

  // const result = await db.query(`call create_emi_records($1)`,[]);
});

exports.handleCreateEMIFinal = catchAsync(async (req, res, next) => {
  try {
    await db.query("begin");

    let formData = req.body.LoanMasterHdr;
    const queryResult = await db.query(`call create_emi_records_in_final($1)`, [
      req?.body?.efa_id,
    ]);

    // get Loan No
    const efaNo = formData?.efa_ctrl_id;
    // const getLoanNo = await db.query(`select genloanno() as loanno`);

    // if(getLoanNo.rows[0].loanno != formData?.efa_ctrl_id){

    //    efaNo = getLoanNo.rows[0]?.loanno;
    // }else{
    //   efaNo = formData?.efa_ctrl_id
    // }

    await db.query(
      `update thlnefatran set efa_ctrl_id = $1 where efa_id = $2`,
      [efaNo, req?.body?.efa_id],
    );

    const updateDocTbl = await db.query(
      `update thlndocuments set efa_ctrl_id = $1 where efa_ctrl_id = $2`,
      [efaNo, formData.efa_ctrl_id],
    );
    // const updateDocTbl = await db.query(
    //   `update thlndocuments set efa_ctrl_id = $1 where efa_ctrl_id = $2`,
    //   [efaNo,  req?.body?.efa_id]
    // );

    // for creating jv after loan Disbursal
    await db.query(`call cr_jv_at_loan_disbursal($1)`, [req?.body?.efa_id]);

    const getJvNoCreated = await db.query(
        `select voucher_no 
        from thfmtran 
        where trans_type like 'J%'
        and reference like 'LOAN DISBURSAL ENTRY FOR ' || $1 || '%'
        order by voucher_id desc
        limit 1`,
            [efaNo],
    );

    let getJvNo = getJvNoCreated.rows[0].voucher_no;

    await db.query("commit");
    return res
      .status(200)
      .json({
        data: efaNo,
        message: `Loan No: ${efaNo} Created successfully with JV No: ${getJvNo}`,
      });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }
});

// BRING CUSTOMER GST RATE DETAILS AS PER STATE CODE
exports.getGSTRateDetail = catchAsync(async (req, res, next) => {
  try {
    const { member_no } = req.query;

    if (!member_no) {
      throw new Error("Please select party again as Member No. not selected");
    }

    // ✅ Fetch customer's GST state code
    const getCustStateCode = await db.query(
      `SELECT fetch_cust_gst_state_code(c_state) AS state_code 
       FROM mosmcust_master 
       WHERE c_code = $1`,
      [member_no],
    );

    if (getCustStateCode.rowCount === 0) {
      throw new Error(
        "Customer state code not found! Please Enter GST rate's manually",
      );
    }

    const stateCode = getCustStateCode.rows[0].state_code;

    let resPayload = {
      igst_rate: 0,
      sgst_rate: 0,
      cgst_rate: 0,
    };

    // ✅ If state code is '06' (Haryana), use SGST + CGST
    if (stateCode === "06") {
      resPayload.sgst_rate = 9.0;
      resPayload.cgst_rate = 9.0;
    } else {
      resPayload.igst_rate = 18.0;
    }

    // ✅ Return GST rate info
    return res.status(200).json({
      type: "success",
      data: resPayload,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message:
        error.message ||
        "Internal Server Error while fetching GST rate details",
    });
  }
});

exports.getDocList = catchAsync(async (req, res, next) => {
  try {
    const { loan_id } = req.query;

    console.log(loan_id);

    if (!loan_id) {
      return res.status(400).json({
        type: "error",
        message: "loan_id is required",
      });
    }

    const getReqDocList = await db.query(
      `
      SELECT eligible_docs
      FROM (
        SELECT unnest(array[
          CASE WHEN loan_eligibility_doc1 = 'Y' THEN 'Aadhaar Card' END,
          CASE WHEN loan_eligibility_doc2 = 'Y' THEN 'PAN Card' END,
          CASE WHEN loan_eligibility_doc3 = 'Y' THEN 'Photograph' END,
          CASE WHEN loan_eligibility_doc4 = 'Y' THEN 'Bank Statement' END,
          CASE WHEN loan_eligibility_doc5 = 'Y' THEN 'Salary Slip' END,
          CASE WHEN loan_eligibility_doc6 = 'Y' THEN 'Other Document' END
        ]) AS eligible_docs
        FROM integral.mhedloan
        WHERE loan_id = $1
      ) AS sub
      WHERE eligible_docs IS NOT NULL;
      `,
      [loan_id],
    );

    return res.status(200).json({
      type: "success",
      data: getReqDocList.rows.map((row) => row.eligible_docs), // return as array of strings
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message:
        error.message ||
        "Internal Server Error while fetching required documents",
    });
  }
});

// get new Loan Number
exports.getNewLoanNumber = catchAsync(async (req, res, next) => {
  try {
    // const getLoanNo = await db.query(`SELECT nextval('temp_efa_ln_no') AS nextfano`);
    const getLoanNo = await db.query(`select genloanno() as loanno`);
    return res.status(200).json({
      type: "success",
      getLoanNo: getLoanNo?.rows[0]?.loanno,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

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
        [efa_ctrl_id, file.filename, file.originalname, file.path, file.size],
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
    "../../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
  );

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../../reportGeneration/reports/",
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
          error?.message || stderr,
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
          `attachment; filename="${outputFilename}"`,
        );
        return res.sendFile(finalPdfPath);
      }, 400);
    },
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
      [efa_ctrl_id],
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

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
  if (req?.query?.help_list) {
    await getHelpData(req, res);
    return;
  }
});
