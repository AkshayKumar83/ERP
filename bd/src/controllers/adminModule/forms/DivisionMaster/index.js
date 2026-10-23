const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOITDIVISION: "moitdivision",
  GET_DIVISION_ID_BY_SEQUENCE: "nextval('s_moitdivision_division_id')",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const regionList = await db.query(
    `select description, (code) from mommcode where cat_group = 'REGION' order by 1 `
  );

  console.log("region:", regionList.rows);

  return res.status(200).json({
    regions: regionList.rows,
  });
});

//for HelpList

// const helpListData = async (req, res) => {
//   const { transYear, divisionId, form_status, help_list } = req?.query;
//   console.log(req.query);

//   // for party code help list
//   if (help_list === "state" && ['Insert','Update'].includes(form_status)) {
//     const state = await db.query(
//       `SELECT STATE_NAME, STATE_ID FROM integral.MOITSTATE WHERE TYPE = 'S'`
//     );
//     return res.status(200).send(state.rows);
//   } else if (
//     (help_list === "city" && form_status === "Insert") ||
//     form_status === "Update"
//   ) {
//     const city = await db.query(
//       `SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID FROM integral.MOITSTATE WHERE TYPE = 'C'`
//     );
//     return res.status(200).send(city.rows);
//   } else if (help_list == "customer" && ['Insert','Update'].includes(form_status)) {
//     const customer = await db.query(
//       `select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' order by 1`
//     );
//     return res.status(200).send(customer.rows);
//   } else if (
//     (help_list === "bank" && form_status === "Insert") ||
//     form_status === "Update"
//   ) {
//     const bank = await db.query(
//       `SELECT 
//       acc_no
//       bank_code,
//       bank_name,
//       BADD1 || ' ' || BADD2 || ' ' || BADD3 AS Address,
//       BNK_AC_NO AS Bank_account_no,
//       ifsc_code,
//       micr_code
//   FROM 
//       integral.mhfmbank AS a
//   WHERE 
//       COALESCE(active_bank, 'N') = 'Y'
//       AND division_id = 1`
//     );
//     return res.status(200).send(bank.rows);
//   }
// };


const helpListData = async (req, res) => {
  try {
    const { appDivisionId, appFinYear, appUserId, form_status, help_list,  } = req.query;
    console.log("Query Params:", req.query);

    // For state help list
    if (help_list === "state" && ['Insert', 'Update'].includes(form_status)) {
      const state = await db.query(
        `SELECT STATE_NAME, STATE_ID , GST_STATE_CODE FROM integral.MOITSTATE WHERE TYPE = 'S'`
      );
      return res.status(200).send(state.rows);
    }

    // For city help list
    if (help_list === "city" && ['Insert', 'Update'].includes(form_status)) {
      const city = await db.query(
        `SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID 
         FROM integral.MOITSTATE 
         WHERE TYPE = 'C'`
      );
      return res.status(200).send(city.rows);
    }

    // For customer help list
    if (help_list === "customer" && ['Insert', 'Update'].includes(form_status)) {
      const customer = await db.query(
        `SELECT c_name, c_code 
         FROM integral.mosmcust 
         WHERE ship_bill_flag = 'N' 
         ORDER BY c_name`
      );
      return res.status(200).send(customer.rows);
    }

    // For bank help list
    if (help_list === "bank" && ['Insert', 'Update'].includes(form_status)) {
      const bank = await db.query(
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
       AND division_id = $1`,
        [appDivisionId || 1] // use provided divisionId or default to 1
      );
      return res.status(200).send(bank.rows);
    }

    // If no matching condition
    return res.status(400).json({ error: "Invalid help_list or form_status" });

  } catch (error) {
    console.error("Error in helpListData:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getDataOnQuery = async (req, res) => {
  //console.log("this is working"); 
   const { appDivisionId, appFinYear } = req.query;
  try {
    let queryParameter = `ORDER BY division_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount; 

     let whereClauses = [];
    
        // Define search keys that should be checked in WHERE clause
        let searchKeys = ["name"];
    
        // If any of these searchKeys exist in the query, add them to WHERE clause
        for (const key of searchKeys) {
          if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
          }
        }
    
        console.log("whereClauses", whereClauses);
    
        // Build WHERE clause dynamically
        let queryValues =
          whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
    
        console.log("whereClauses", queryValues);
    
        // If search parameters exist, count results accordingly
        if (whereClauses.length > 0) {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.MOITDIVISION} ${queryValues}`
          );
          dataCount = getCount.rows[0]?.count;
          queryParameter = `${queryValues} ${queryParameter}`;
          console.log("queryParameter", queryParameter)
        } 
        else {
   
    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOITDIVISION}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY division_id DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY division_id LIMIT 1 OFFSET ${
          req.query.offset || 0
        }`;
        break;
    } 
  }

    const divisionData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOITDIVISION} ${queryParameter}`
    );
    console.log("divisionData:", divisionData.rows[0]);

    const custcode = divisionData.rows[0]?.c_code;
    console.log("custcode:", custcode);

    const stateid = divisionData.rows[0]?.state_id;
    console.log("stateid:", stateid);

    const cityid = divisionData.rows[0]?.city_id;
    console.log("cityid:", cityid);

    const result2 = await db.query(
      `select  c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' and c_code = $1`,
      [custcode]
    );

    console.log("c_name:", result2.rows[0]?.c_name);

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
        AND division_id = $1`, [appDivisionId]);

    const result4 = await db.query(
      `SELECT STATE_NAME,STATE_ID FROM integral.MOITSTATE WHERE TYPE = 'S' and STATE_ID = $1`,
      [stateid]
    );

    const result5 = await db.query(
      `SELECT STATE_NAME AS CITY_NAME, STATE_ID AS CITY_ID FROM integral.MOITSTATE WHERE TYPE = 'C' and STATE_ID = $1`,
      [cityid]
    );
    
      const result6 = await db.query(
      `select gst_state_code from moitstate where state_id = $1`,[stateid]
    
    );


    const lst = dateFormater(divisionData.rows[0]?.lst_dt);
    const cst = dateFormater(divisionData.rows[0]?.cst_dt);
    const serv_tax_reg_dt = dateFormater(divisionData.rows[0]?.serv_tax_reg_dt)

    const response = {
      ...divisionData.rows[0],
      lst_dt: lst,
      cst_dt: cst,
      c_name: result2.rows[0]?.c_name,
      bank_name: result3.rows[0]?.bank_name,
      bank_code: result3.rows[0]?.bank_code,
      state_name: result4.rows[0]?.state_name,
      city_name: result5.rows[0]?.city_name,
      serv_tax_reg_dt: serv_tax_reg_dt,
      gst_state_code: result6.rows[0]?.gst_state_code,
      count: dataCount || 0,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

// for validate data

exports.getValidateData = catchAsync(async (req, res) => {
  const { c_code, bank_code, appDivisionId, appFinYear } = req.query;
  try {
    if (c_code) {
      console.log("c_code after query:", c_code);
      const custcdData = await db.query(
        "select c_name, c_code from integral.mosmcust where ship_bill_flag = 'N' and c_code =$1 order by 1",
        [c_code]
      );
      if (custcdData.rows.length > 0) {
       
       
        res.status(200).json({
          c_name: c_name,
        });
      } else {
        
        res
          .status(400)
          .json({ message: "Customer code does not exist in customer master" });
      }
      console.log(custcdData.rows[0]);
    }

    if (bank_code) {
      console.log("bank_code after query:", bank_code);

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
        AND division_id = $1 AND 
        acc_no = $2`,
        [appDivisionId,bank_code]
      );

      if (bankcdData.rows.length > 0) {
        console.log("bank code presents");
        const { bank_name } = bankcdData.rows[0];
        res.status(200).json({
          bank_name: bank_name,
        });
      } else {
        console.log("bank not exits");
        res.status(400).json({ message: "BANK NOT EXISTS." });
      }
    }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const postDivisionDetails = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log("req body:", req.body);
    const {
      state_name,
      city_name,
      c_name,
      bank_name,
      bank_code,
      gst_state_code,
      res_emp_state_name,
      v_name,
      //ex_rang,
      ...remainingData
    } = formData;

    // fetch next division_id from sequence

    const result = await db.query(
      `SELECT ${TABLE_NAMES.GET_DIVISION_ID_BY_SEQUENCE} AS next_id`
    );
    const divisionId = result.rows[0].next_id;
    console.log("divisionId:", divisionId);

    // Clean up the formData and add the userId
    const cleanDivisionDataForInsert = cleanObject(remainingData);
    cleanDivisionDataForInsert.division_id = divisionId;

    console.log("Cleaned Data for Insert:", cleanDivisionDataForInsert);

    if (Object.keys(cleanDivisionDataForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.MOITDIVISION,
      cleanDivisionDataForInsert
    );
    const valuesForInsertQuery = Object.values(cleanDivisionDataForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(400).send("Some error occurred");
  }
};

const updateDivisionDetails = async (req, res) => {
  console.log("for update:", req.body);
  // const { division_id, formData } = { ...req?.body }; 
  const { division_id, ...formData } = req.body;

  console.log("after update:", division_id, formData);

  try {
    await db.query("Begin");

    // Check if legal_name exists and is not empty, if so, set it to the value of name
    if (!formData?.legal_name || !formData?.legal_name.trim()) {
      formData.legal_name = formData.name;
    }

    //updating the division data
    if (Object.keys(req.body).length !== 0) {
      const divisionDataForInsert = { ...formData }; 

      delete divisionDataForInsert.state_name;
      delete divisionDataForInsert.c_name;
      delete divisionDataForInsert.count;
      //delete divisionDataForInsert.ex_rang;
      delete divisionDataForInsert.bank_name;
      delete divisionDataForInsert.city_name;
      delete divisionDataForInsert.bank_code;
      delete divisionDataForInsert.gst_state_code;
      delete divisionDataForInsert.res_emp_state_name;
      delete divisionDataForInsert.v_name; 
       delete divisionDataForInsert.fax_no; 


      const cleanDivisionDataForUpdate = cleanObject(divisionDataForInsert);

      const columns = Object.keys(cleanDivisionDataForUpdate);
      const values = Object.values(cleanDivisionDataForUpdate);  
      //console.log("updated columns:", columns)
      //console.log("updated values:", values)

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${
        TABLE_NAMES.MOITDIVISION
      } SET ${setClause} WHERE division_id = $${columns.length + 1} `;

      console.log("here updated formData query: ", query);

      try {
        // Execute the update query
        await db.query(query, [...values, division_id]);  
         // Commit the transaction
        await db.query("COMMIT");
        console.log("updated successfully")
      } catch (error) {
        throw new Error(error);
      } 

    } 
    return res.status(200).send({status: "successfully updated"})
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // } 

   if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateDivisionDetails(req, res);
    return;
  } else {
    await postDivisionDetails(req, res);
    return;
  }
});
