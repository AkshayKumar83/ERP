const {db}= require("../../config/dbConnection");
const {dateFormater} = require("../../utility/constant");

const onQuery = async (req, res) => {
  try {
    const recordCount = await db.query(
      "select count(*) from integral.moitdivision"
    );

    console.log("count:", recordCount.rows[0].count);

    const result = await db.query(`SELECT * FROM integral.moitdivision`);
    console.log("result:", result.rows);

    const custcode = result.rows[0].c_code;
    console.log("custcode:", custcode);

    const stateid = result.rows[0].state_id;
    console.log("stateid:", stateid);

    const cityid = result.rows[0].city_id;
    console.log("cityid:", cityid);

    const result2 = await db.query(
      `select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' order by 1`
    );

    //const result2 = await db.query(`select  c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' and c_code = $1`, [custcode]);

    console.log("c_name:", result2.rows[0]?.c_name)

    const result3 = await db.query(`SELECT 
        acc_no
        bank_code,
        bank_name,
        BADD1 || ' ' || BADD2 || ' ' || BADD3 AS Address,
        BNK_AC_NO AS Bank_account_no,
        ifsc_code,
        micr_code
    FROM 
        integral.mhfmbank AS a
    WHERE 
        COALESCE(active_bank, 'N') = 'Y'
        AND division_id = 1;`);

        const result4 = await db.query(`SELECT STATE_NAME,STATE_ID FROM integral.MOITSTATE WHERE TYPE = 'S' and STATE_ID = $1`, [stateid])

        const result5 = await db.query(`SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID FROM integral.MOITSTATE WHERE TYPE = 'C' and STATE_ID = $1`, [cityid])

    const lst = dateFormater(result.rows[0]?.lst_dt);
    const cst = dateFormater(result.rows[0]?.cst_dt);

    const newForm = {
      ...result.rows[0],
      lst_dt: lst,
      cst_dt: cst,
      c_name: result2.rows[0]?.c_name,
      bank_name: result3.rows[0].bank_name,
      bank_code: result3.rows[0].bank_code,
      state_name: result4.rows[0].state_name,
      city_name: result5.rows[0].city_name,
      count: recordCount.rows[0].count,
    };

    res.status(200).json(newForm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const nextPre_onQuery = async (req, res) => {
  const recordNo = parseInt(req.params.data);
  console.log("record no:", recordNo);

  try {
    const result = await db.query(
      `SELECT * FROM integral.moitdivision WHERE division_id = $1`,
      [recordNo]
    );

    const bankcode = result.rows[0]?.default_bank;
    const custcode = result.rows[0]?.c_code;
    const stateid = result.rows[0]?.state_id;
    console.log("stateid:", stateid);

    const cityid = result.rows[0]?.city_id;
    console.log("cityid:", cityid);

    console.log("result:", result.rows[0]);

    const result2 = await db.query(
      `select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' and c_code =$1 order by 1`, [custcode]
    );

    const result3 = await db.query(`SELECT 
    acc_no
    bank_code,
    bank_name,
    BADD1 || ' ' || BADD2 || ' ' || BADD3 AS Address,
    BNK_AC_NO AS Bank_account_no,
    ifsc_code,
    micr_code
FROM 
    integral.mhfmbank AS a
WHERE 
    COALESCE(active_bank, 'N') = 'Y'
    AND division_id = 1 AND acc_no = $1`, [bankcode]);

    const result4 = await db.query(`SELECT STATE_NAME,STATE_ID FROM integral.MOITSTATE WHERE TYPE = 'S' and STATE_ID = $1`, [stateid])

    const result5 = await db.query(`SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID FROM integral.MOITSTATE WHERE TYPE = 'C' and STATE_ID = $1`, [cityid])

     console.log("c_code:", result.rows[0]?.c_code);
    console.log("c_name:", result2.rows[0]?.c_name);
    console.log("bank_code:", result3.rows[0]?.bank_code);
    console.log("bank_name:", result3.rows[0]?.bank_name);



    const lst = dateFormater(result.rows[0]?.lst_dt);
    const cst = dateFormater(result.rows[0]?.cst_dt);

    const newForm = {
      ...result.rows[0],
      lst_dt: lst,
      cst_dt: cst,
      c_name: result2.rows[0]?.c_name,
      bank_name: result3.rows[0]?.bank_name,
      bank_code: result3.rows[0]?.bank_code,
      state_name: result4.rows[0]?.state_name,
      city_name: result5.rows[0]?.city_name,
    };

    res.status(200).json(newForm);
    //res.status(200).json(result.rows[0]); // Just sending the query result as response for now
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" }); // Sending a generic error response
  }
};

const empHelpListData = async (req, res) => {
  const tableName = req.params.data;

  if (tableName === "statecd")
    try {
      const result = await db.query(
        `SELECT STATE_NAME,STATE_ID FROM integral.MOITSTATE WHERE TYPE = 'S'`
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "cannot find the data" });
    }
  else if (tableName === "citycd")
    try {
      const result = await db.query(
        `SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID FROM integral.MOITSTATE WHERE TYPE = 'C'`
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "cannot find the data" });
    }
  else if (tableName === "custcd")
    try {
      const result = await db.query(
        `select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' order by 1`
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "cannot find the data" });
    }
  else if (tableName === "bankcd")
    try {
      const result = await db.query(
        `SELECT 
      acc_no
      bank_code,
      bank_name,
      BADD1 || ' ' || BADD2 || ' ' || BADD3 AS Address,
      BNK_AC_NO AS Bank_account_no,
      ifsc_code,
      micr_code
  FROM 
      integral.mhfmbank AS a
  WHERE 
      COALESCE(active_bank, 'N') = 'Y'
      AND division_id = 1;`
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "cannot find the data" });
    }
};

const groupDropDownData = async (req, res) => {
  try {
    const regionResult = await db.query(
      "select description, (code) from integral.mommcode where cat_group = 'REGION' order by 1"
    );

    const dropdownData = {
      regionlist: regionResult.rows,
    };
    console.log("dropdownlist", dropdownData);
    res.status(200).json(dropdownData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const onSubmit = async (req, res) => {
  try {
    const DivisionMaster = { ...req.body };
    console.log("divisionMasterform:", DivisionMaster);

    // Check if legal_name exists and is not empty, if so, set it to the value of name
    if (!DivisionMaster.legal_name || !DivisionMaster.legal_name.trim()) {
      DivisionMaster.legal_name = DivisionMaster.name;
    }

    const propfordelete = [
      "state_name",
      "c_name",
      "bank_name",
      "bank_code",
      "gst_st_code",
      "res_emp_state_name",
      "v_name",
    ];
    propfordelete.forEach((key) => delete DivisionMaster[key]);

    const { ...otherFormData } = DivisionMaster;

    const columns = Object.keys(otherFormData);
    console.log("columns:", columns);

    const values = Object.values(otherFormData);
    console.log("values: ", values);

    const placeholders = values
      .map((item, index) => `$${index + 2}`)
      .join(", ");
    console.log("placeholders:", placeholders);

    // Get division_id from database
    const division_id_query = await db.query(
      `SELECT nextval('integral.s_moitdivision_division_id')`
    );
    const division_id = division_id_query.rows[0].nextval;
    console.log("division_id:", division_id);

    const insertQuery = `INSERT INTO integral.moitdivision ( division_id, ${columns.join(
      ", "
    )}) VALUES ($1, ${placeholders})`;
    console.log("insertQuery:", insertQuery);

    // Execute INSERT INTO query for moitdivision table
    const result = await db.query(insertQuery, [division_id, ...values]); // Pass division_id directly

    // Extracting division_id from the result of the first query
    const divisionId = result.rows[0].division_id;

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data into moitdivision:", error.message);
    res.status(500).json({ error: "Failed to insert data into moitdivision" });
  }
};

const whenValidateCustCode = async (req, res) => {
  const { data } = req.params;
  console.log("custcode:", data);
  try {
    const custcdData = await db.query(
      "select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' and c_code =$1 order by 1",
      [data]
    );
    if (custcdData.rows.length > 0) {
      const { c_name } = custcdData.rows[0];
      res.status(200).json({
        custname: c_name,
      });
    } else {
      res
        .status(500)
        .json({ message: "Customer code does not exist in customer master" });
    }
    console.log(custcdData.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const whenValidatBankCode = async (req, res) => {
  const { data } = req.params;
  console.log("bankcode:", data);
  try {
    const bankcdData = await db.query(
      `SELECT 
      acc_no
      bank_code,
      bank_name,
      BADD1 || ' ' || BADD2 || ' ' || BADD3 AS Address,
      BNK_AC_NO AS Bank_account_no,
      ifsc_code,
      micr_code
  FROM 
      integral.mhfmbank AS a
  WHERE 
      COALESCE(active_bank, 'N') = 'Y'
      AND division_id = 1 AND 
      acc_no = $1`,
      [data]
    );

    if (bankcdData.rows.length > 0) {
      const { bank_name } = bankcdData.rows[0];
      res.status(200).json({
        bankname: bank_name,
      });
    } else {
      res.status(500).json({ message: "BANK NOT EXISTS." });
    }
    console.log("query:", bankcdData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const onUpdate = async (req, res) => {
  try {
    const updatedDivisionData = req.body;
    console.log("Updated division data:", updatedDivisionData);

    // Extract division_id from the updated data
    const divisionId = updatedDivisionData.division_id;

    // Check if legal_name exists and is not empty, if so, set it to the value of name
    if (
      !updatedDivisionData.legal_name ||
      !updatedDivisionData.legal_name.trim()
    ) {
      updatedDivisionData.legal_name = updatedDivisionData.name;
    }

    const propfordelete = [
      "state_name",
      "c_name",
      "bank_name",
      "bank_code",
      "gst_st_code",
      "res_emp_state_name",
      "v_name",
    ];
    propfordelete.forEach((key) => delete updatedDivisionData[key]);

    const { ...otherFormData } = updatedDivisionData;

    const columns = Object.keys(otherFormData);
    console.log("Columns to update:", columns);

    const values = Object.values(otherFormData);
    console.log("Updated values: ", values);

    // Construct the SET part of the UPDATE query
    const setClause = columns
      .map((column, index) => `${column} = $${index + 2}`)
      .join(", ");
    console.log("SET clause:", setClause);

    // Prepare the parameters for the UPDATE query
    const updateParams = [divisionId, ...values];
    console.log("Update parameters:", updateParams);

    // Construct the UPDATE query
    const updateQuery = `UPDATE integral.moitdivision SET ${setClause} WHERE division_id = $1`;
    console.log("Update query:", updateQuery);

    // Execute the UPDATE query
    await db.query(updateQuery, updateParams);

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error.message);
    res.status(500).json({ error: "Failed to update data" });
  }
};
module.exports = {
  onQuery,
  nextPre_onQuery,
  empHelpListData,
  groupDropDownData,
  onSubmit,
  whenValidatBankCode,
  whenValidateCustCode,
  onUpdate,
};
