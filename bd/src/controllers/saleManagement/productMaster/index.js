const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../utility/query");

const TABLE_NAMES = {
  PRODUCT_MASTER: "mosmprod",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const productList = await db.query(
    `SELECT it_grp_desc, it_grp_cd as it_group 
FROM mosmitgrp

UNION ALL

SELECT NULL AS it_grp_desc, NULL AS it_group

ORDER BY 1;`
  );

  const mainCatList = await db.query(
    `SELECT MAIN_CAT_DESC,MAIN_CAT_ID FROM MOSMMAINCAT`
  );
  
  const subCatList = await db.query(
    `SELECT SUB_CAT_DESC,SUB_CAT_ID FROM MOSMSUBCAT`
  ); 
  

   const commodityList = await db.query(
    `select commodity_desc, commodity_code 
from commodity c
where 
  sal_pur_flag = 'S'
  and eff_date = (
    select max(eff_date) 
    from commodity b
    where sal_pur_flag = 'S'
      and b.commodity_code = c.commodity_code
  )
union all
select null as commodity_desc, null as commodity_code
order by commodity_desc;
`
  ); 

  

  return res.status(200).json({
    product: productList.rows,
    mainCat: mainCatList.rows,
    subCat: subCatList.rows,
    commodity: commodityList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  //console.log("this is working");
  try {
    let queryParameter = ` order by it_code LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount;
    //console.log("quey:", req?.query);
    // console.log("Offset value:", req.query.offset);

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.PRODUCT_MASTER}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "order by it_code DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = ` order by it_code LIMIT 1 OFFSET ${
          req.query.offset || 0
        }`;
        break;
    }

    const productMasterData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.PRODUCT_MASTER} ${queryParameter}`
    );
    
    const itCode = productMasterData.rows[0].it_code;
    const commodity = productMasterData.rows[0].commodity  

    // post query data 
    const stdPack = await db.query(
      ` select std_packing from mommitem
  where it_code = $1;`,
      [itCode]
    ); 

    const tarrif = await db.query(` select tariff_no  from commodity
  where commodity_code = $1`, [commodity])
   
   productMasterData.rows[0].std_packing =
      stdPack.rowCount > 0 ? stdPack.rows[0].std_packing : ""; 

        productMasterData.rows[0].tarrif_no =
      tarrif.rowCount > 0 ? tarrif.rows[0].tarrif_no : "";


    const response = {
      ...productMasterData.rows[0],
      count: dataCount || 0,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};  


const postProductMasterDetails = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log("formData", req.body);

    const cleanProductMasterForInsert = cleanObject(formData);
    console.log("cleanProductMasterForInsert:", cleanProductMasterForInsert);
     delete cleanProductMasterForInsert.tarrif_no
    if (Object.keys(cleanProductMasterForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.PRODUCT_MASTER,
      cleanProductMasterForInsert 
      //delete cleanProductMasterForInsert.tarrif_no
    );
    const valuesForInsertQuery = Object.values(cleanProductMasterForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({error: error.message || 'Internal Server Error'});
  }
};  

const updateProductMasterDetails = async (req, res) => {
  console.log("for update:", req.body);

  const { it_code, ...formData } = req.body; 

  try {
    await db.query("BEGIN");

    if (Object.keys(req.body).length !== 0) {
      const productMasterDataForInsert = { ...formData }; 

      delete productMasterDataForInsert.count; 
      delete productMasterDataForInsert.tarrif_no

      const cleanProductMasterDataForUpdate = cleanObject(productMasterDataForInsert);
      const columns = Object.keys(cleanProductMasterDataForUpdate);
      const values = Object.values(cleanProductMasterDataForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${TABLE_NAMES.PRODUCT_MASTER} SET ${setClause} WHERE it_code = $${columns.length + 1} `;

      console.log("here updated formData query: ", query);

      try {
        // Execute the update query
        await db.query(query, [...values, it_code]); 
        await db.query("COMMIT");
        console.log("updated successfully");
      } catch (error) {
        await db.query("ROLLBACK");
        throw new Error(error);
      }
    }
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: error.message || 'Updation failed' });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});   

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateProductMasterDetails(req, res);
    return;
  } else {
    await postProductMasterDetails(req, res);
    return;
  }
});
