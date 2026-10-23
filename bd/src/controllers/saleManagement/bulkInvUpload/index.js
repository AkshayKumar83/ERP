const { pool, db } = require("../../../config/dbConnection");
const { dateFormater } = require("../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../utility/query");

// UPLOAD DEALERS INTO TEMP TABLE
const uploadInvoices = async (req, res) => {
  const { invoicesData, fileName, user_id, inv_creation_dt } = req.body;

  try {
    if (!invoicesData.length)
      throw new Error(`Data not uploaded or not having record in file`);

    // clean the table
    await db.query(`delete from tofm_bulk_upld_member_inv_temp`);

    await db.query("BEGIN");

    for (const [index, record] of invoicesData.entries()) {
      delete record["__empty"];
      delete record["__empty_1"];
      delete record["__empty_2"];
      delete record?.s_no;
      record.uploaded_xl_file_name = fileName;
      record.user_id = user_id;
      record.inv_creation_dt = inv_creation_dt;
      record.cost_center = record.cost_center || null;

      const queryForInsert = generateSingleInsertQuery(
        "tofm_bulk_upld_member_inv_temp",
        record,
      );


      const valuesForInsertQuery = Object.values(record);
      // console.log(valuesForInsertQuery)
      await db.query(queryForInsert, valuesForInsertQuery);
    }
    const invData = await db.query(
      `select * from tofm_bulk_upld_member_inv_temp`,
    );
    // const uplDealers = await db.query(`select * from temp_upload_dealer_amit`)

    let getTransFormedData = invData.rows.map((item) => ({ ...item, inv_creation_dt: dateFormater(item.inv_creation_dt) }));

    await db.query("commit");
    res
      .status(201)
      .json({
        type: "created",
        invoices: getTransFormedData,
        count: invData.rowCount,
      });
  } catch (err) {
    console.error(err);
    await db.query("rollback");
    // res.status(404).send({ errMsg: `Error: ${err}` });
    res.status(400).json({
      errMsg: err.message || "Something went wrong",
    });
  }
};

const createBulkInvoice = async (req, res) => {
  const { user_id, fileName } = req.body;

  console.log(req.body, "create_bulk_invoice call");
  try {
    await db.query("begin");

    await db.query("call cr_inv_member_bulk_upldd($1, $2)", [
      user_id,
      fileName,
    ]);

    await db.query("commit");

    return res
      .status(201)
      .json({ type: "created", message: "Bulk Invoices created successfully" });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    // res.status(404).send({ errMsg: `Error: ${error.message}` });

    res.status(400).json({
      errMsg: error.message || "Bulk creation failed",
    });
  }
};

module.exports = { uploadInvoices, createBulkInvoice };
