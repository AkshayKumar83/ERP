const { error } = require("pdf-lib");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transFormSupplierMstrForInsert } = require("./utility");
const { transformVendorToDbData } = require("./presentation");

let TABLE_NAMES = {
    VENDER_MASTER: `mommvend`,
};

// query logic
const getSupplierDataOnQuery = async (req, res) => {
      const { formStatus, appDivisionId, appFinYear, userId } = req.query

         let whereClauses = [];
           // Define search keys that should be checked in WHERE clause
  let searchKeys = ["v_code", "v_name"];

  
  // If any of these searchKeys exist in the query, add them to WHERE clause
                    for (const key of searchKeys) {
                        if (req.query[key] !== undefined && req.query[key] !== "") {
                        whereClauses.push(`${key} = '${req.query[key]}'`);
                        }
                    }

                // Build WHERE clause dynamically
                        let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

                        let transYear = appFinYear || "2023";
                        let divisionId = appDivisionId || 1;
                        let user_id = userId || 583;
                        console.log("req_payload:: ", req?.query);
                        console.log("transformed transYr & divId::", transYear, divisionId);



    try {
        let queryParameter = `ORDER BY v_code LIMIT 1 OFFSET ${parseInt(req.query.offset) || 0}`;
        let supplierRelatedData = {};
        let dataCount;

           if(whereClauses.length > 0) {
                   const getCount = await db.query(
                       `SELECT COUNT(*) FROM ${TABLE_NAMES.VENDER_MASTER} ${queryValues}`
                     );
                     dataCount = getCount.rows[0]?.count;
                     queryParameter = `${queryValues} ${queryParameter}`;
                 } else{
                   
              switch (req?.query?.get_data) {
            case 'First':
            case 'Query': {
                const getCount = await db.query(`SELECT COUNT(*) FROM ${TABLE_NAMES.VENDER_MASTER}`);
                dataCount = getCount.rows[0]?.count;
                break;
            }
            case 'Last': {
                queryParameter = 'ORDER BY v_code DESC LIMIT 1';
                break;
            }
        }
    }

        // Fetch supplier master data
        const getSupplierMstrData = await db.query(`SELECT * FROM ${TABLE_NAMES.VENDER_MASTER} ${queryParameter}`);

        // If no supplier data is found, return early
        if (getSupplierMstrData.rows.length === 0) {
            return res.send({ type: "not found", supplierMstr: null, count: dataCount || 0 });
        }

        const supplier = getSupplierMstrData.rows[0];

        // If supplier has a city, run queries to fetch related data
        if (supplier?.v_city) {
            const v_city = supplier.v_city;

            // Parallel execution of location, tax, user details, and gst_state_code queries
            const [locationDetail, taxDesc, createBy, updateBy, gstStateCode] = await Promise.all([
                db.query(`
                    SELECT
                        integral.get_from_state($1, 'C', 'N') AS v_city_name,
                        integral.get_from_state($1, 'D', 'N') AS v_district,
                        integral.get_from_state($1, 'S', 'N') AS v_state,
                        integral.get_from_state($1, 'Z', 'N') AS v_zone,
                        integral.get_from_state($1, 'T', 'N') AS v_country,
                        integral.get_from_state($1, 'R', 'N') AS v_region;
                `, [v_city]),
                supplier.tax_code ? db.query(`SELECT tax_desc FROM integral.mofmptax WHERE tax_code = $1`, [supplier.tax_code]) : null,
                supplier.create_id ? db.query(`SELECT user_name AS create_by FROM integral.user_master WHERE user_id = $1`, [supplier.create_id]) : null,
                supplier.update_id ? db.query(`SELECT user_name AS update_by FROM integral.user_master WHERE user_id = $1`, [supplier.update_id]) : null,
                supplier.v_city ? db.query(`SELECT integral.FETCH_GST_STATE_CODE($1) AS gst_state_code`, [supplier.v_city]) : null 
            ]);

            if (locationDetail?.rowCount > 0) {
                supplierRelatedData = { ...supplierRelatedData, ...locationDetail.rows[0] };
            }

            if (taxDesc?.rowCount > 0) {
                supplierRelatedData = { ...supplierRelatedData, ...taxDesc.rows[0] };
            }

            if (createBy?.rowCount > 0) {
                supplierRelatedData = { ...supplierRelatedData, ...createBy.rows[0] };
            }

            if (updateBy?.rowCount > 0) {
                supplierRelatedData = { ...supplierRelatedData, ...updateBy.rows[0] };
            }

            if (gstStateCode?.rowCount > 0) {
                supplierRelatedData.gst_state_code = gstStateCode.rows[0].gst_state_code;
            }
        }

        const response = {
            type: "found",
            supplierMstr: { ...supplier, ...supplierRelatedData },
            count: dataCount || 0 // Default to 0 if count is undefined
        };

        return res.send(response);

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message || 'Internal server error on query' });
    }
};

// dropDownData
exports.getBaseConstants = catchAsync(async(req,res, next)=>{
    let vCodeManualOrAuto ;
    const isVCodeManualOrAuto = await db.query(`select vcode_auto from integral.mommparm`)
    if(isVCodeManualOrAuto.rowCount){
        vCodeManualOrAuto = isVCodeManualOrAuto.rows[0].vcode_auto
    }else{
        //HERE NEED TO SEND THE ERROR MSG : 'Please Define Finance parameters'
        vCodeManualOrAuto = 'Y'
    }

    const getVendType = await db.query(
        `select * from integral.mommcode
            where cat_group = $1`,
            ["VTYPE"]);

    const getModOfTrans = await db.query(
        `select description, code from integral.mommcode where cat_group = $1 order by 1`,['MOT']
    )
    const getPriceBasis = await db.query(
        `select description, code from integral.mommcode where cat_group = $1 order by 1`,['PBASIS']
    )
    const getCurrList = await db.query(`select curr_desc, curr_code from integral.currency`)
    
    const getTaxCodeList = await db.query(`
        select tax_code , tax_desc, TAX_PERC, ST_FORM, SURCH_PER
        from integral.mofmptax
        where sal_or_pur = $1`,['P'])
        
    const getTermCode = await db.query(`select term_desc, term_code from integral.mhmmterm order by 1`)
    return res
        .status(200)
        .json({
            vendorType: getVendType.rows,
            modeOfTrans: getModOfTrans.rows,
            priceBasis: getPriceBasis.rows,
            currList:getCurrList.rows,
            taxCodeList:getTaxCodeList.rows,
            termCodeList:getTermCode.rows,
            vcode_auto: vCodeManualOrAuto

        });
})

// submit new Supplier(Insert Data Function)
const submitSupplierMstr = async(req, res)=>{
    const formData = {...req?.body.formData}
    // const user = {...req?.body.user}
    const {appDivisionId, appFinYear} = req.query
    let isVCodeAuto = formData.vcode_auto;
    console.log(formData)
    try {
        await db.query('Begin')
        
        if(isVCodeAuto === 'Y'){
            //this query will generate voucher id through db sequence function
            const getVendorCode = await db.query(`SELECT integral.genvendorcode($1)`,
                 [formData.v_name]);
    
            // Check if the sequence function returns a valid result
            if (!getVendorCode.rows[0]?.genvendorcode) {
                throw new Error("Failed to generate vendor code");
            }
            formData.v_code = getVendorCode.rows[0].genvendorcode;
        }

        // before insert into mommvend clean the object as required for insert
        //    let supplierMstrData = transFormSupplierMstrForInsert({...formData});

             // adding by akshay and create presentation file
        let supplierMstrData = transformVendorToDbData({...formData});

        // Insert suplier master data
        const suppMstrInsertQuery = generateSingleInsertQuery( TABLE_NAMES.VENDER_MASTER, supplierMstrData);
        const suppMstrValForInsertQuery = Object.values(supplierMstrData);

        console.log(suppMstrInsertQuery);
        console.log(suppMstrValForInsertQuery);

        await db.query(suppMstrInsertQuery, [...suppMstrValForInsertQuery]);

        // IMPLEMENTING THE LOGIC TO UPDATE MHFMGLM AND MDFMGLM
        // THE ACTUAL FUNCTION IS UPDCODEGLM IN DB BUT HERE WE USED UPDCODEGLM_TEST MODIFIED BY AMIT
        // //TODO // DIVISION AND TRANSYEAR SHOULD BE DYNAMIC
        const isGlmUpdated = await db.query(
            // `SELECT integral.UPDCODEGLM($1, $2, $3, $4, $5, $6)`,
            `SELECT integral.UPDCODEGLM($1, $2, $3, $4)`,
            // [`S${formData.v_code}`, formData.v_name, parseInt(user.division_id), user.trans_year, formData.expense_flag, formData.v_name1]
            [`S${formData.v_code}`, formData.v_name, appDivisionId, appFinYear]
        );

        if (isGlmUpdated.rows[0].updcodeglm_test) {
            // Check for specific error message returned by the function
            await db.query('ROLLBACK');
            return res.status(409).json({ errMsg: isGlmUpdated.rows[0].updcodeglm_test });
        }

        await db.query('commit')
        return res.status(200).json({type: 'created'});
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        return res.status(400).json({type:'error', message:error.message || "Some error occurred"});
    }
}

// update the supplier record


const updateSupplierMstr = async (req, res) => {
    const formData = { ...req?.body.formData };
    const { form_status: formStatus, appDivisionId, appFinYear, userId } = req.query;

    console.log(" Received FormData:", formData);
    console.log(" Query Params =>", { formStatus, appDivisionId, appFinYear, userId });

    try {
        await db.query('BEGIN'); // Start transaction

        const vendorCode = formData.v_code;
        if (!vendorCode) {
            return res.status(400).json({ message: "Vendor code is missing." });
        }

        if (!formData.v_name) {
            return res.status(400).json({ message: "Vendor name is missing." });
        }

        // Transform data for DB
        const supplierMstrData = transformVendorToDbData({ ...formData });
        console.log(" DB-ready data:", supplierMstrData);
   
        // Remove update_date if present
            delete supplierMstrData.update_date;
         
        const columns = Object.keys(supplierMstrData);
        const values = Object.values(supplierMstrData);

        // Generate dynamic SET clause
        const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');

       
        const updateQuery = `
            UPDATE ${TABLE_NAMES.VENDER_MASTER}
            SET ${setClause}, update_date = current_date
            WHERE v_code = $${columns.length + 1}
        `;
        // Execute update
        await db.query(updateQuery, [...values, vendorCode]);

        console.log(" Vendor master updated successfully for:", vendorCode);

        // Call GLM Update
        const glmResult = await db.query(
            `SELECT integral.UPDCODEGLM($1, $2, $3, $4)`,
            [`S${formData.v_code}`, formData.v_name,(appDivisionId), (appFinYear)]
        );

        const glmResponseKey = Object.keys(glmResult.rows[0] || {})[0];
        const glmMessage = glmResult.rows[0]?.[glmResponseKey];

        console.log(" GLM Result:", glmResult.rows[0]);

        if (glmMessage) {
            console.log(" GLM Error Message:", glmMessage);
            await db.query('ROLLBACK');
            return res.status(409).json({ errMsg: glmMessage });
        }

        await db.query('COMMIT');
        console.log("Supplier update transaction committed.");
        return res.status(200).json({ type: 'updated' });

    } catch (error) {
        console.error(" Update Supplier Error:", error.message, error.stack);
        await db.query('ROLLBACK');
        return res.status(400).json({ message: error.message || "An error occurred while updating the supplier data." });
    }
};


// helpList for city name and vendor name and tax Code
const helpListData = async (req, res) => {
    const { help_list, form_status } = req.query; // Make sure these are extracted from the request
    console.log()

    if (!["Insert", "Update","Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

    if (help_list === "city") {
            const cityList = await db.query(`
                SELECT 
                    SUBSTR(M.STATE_NAME, 1, 20) AS CITY,
                    M.STATE_ID AS CTYCODE,
                    M.SHORT_NAME,
                    SUBSTR(O.STATE_NAME, 1, 20) AS DISTRICT,
                    SUBSTR(I.STATE_NAME, 1, 20) AS STATE,
                    SUBSTR(T.STATE_NAME, 1, 20) AS ZONE,
                    SUBSTR(S.STATE_NAME, 1, 20) AS COUNTRY,
                    SUBSTR(A.STATE_NAME, 1, 20) AS REGION
                FROM
                    integral.MOITSTATE M,
                    integral.MOITSTATE O,
                    integral.MOITSTATE I,
                    integral.MOITSTATE T,
                    integral.MOITSTATE S,
                    integral.MOITSTATE A
                WHERE
                    M.TYPE = 'C' AND
                    M.PARENT_ID = O.STATE_ID AND
                    O.PARENT_ID = I.STATE_ID AND
                    I.PARENT_ID = T.STATE_ID AND
                    T.PARENT_ID = S.STATE_ID AND
                    S.PARENT_ID = A.STATE_ID
            `);
            return res.status(200).json(cityList.rows); // Use json to send response

    } else if (help_list === "vendorCode" ) {
       const vendorCode = await db.query (
        `SELECT V_CODE ,V_NAME FROM MOMMVEND order by v_name`
       );
       return res.status(200).json(vendorCode.rows)

    }
     else if (help_list === "vendorName" ) {
       const vendorName = await db.query (
        `SELECT V_CODE ,V_NAME FROM MOMMVEND order by v_name`
       );
       return res.status(200).json(vendorName.rows)

    } else if (help_list === "taxCode"){
        const taxCode = await db.query (
           `select tax_code , tax_desc, TAX_PERC, ST_FORM, SURCH_PER
                from mofmptax
                where sal_or_pur = 'P'
                `
        )
            return res.status(200).json(taxCode.rows)
    }
};

const validateCity = async (req, res) => {
    const { v_city_name } = req.query;  // Changed to req.query instead of req?.query
    let locationData = {};
    let errMsg = null;

    // Check if v_city_name is provided
    if (!v_city_name) {
        return res.status(400).json({ errMsg: 'City name is required.' });
    }

    try {
        const getLocationDetail = await db.query(`
            SELECT 
                M.STATE_ID as V_CITY, 
                O.STATE_NAME as V_DISTRICT, 
                I.STATE_NAME as V_STATE,
                T.STATE_NAME as V_ZONE, 
                S.STATE_NAME as V_COUNTRY, 
                A.STATE_NAME as V_REGION
            FROM
                integral.MOITSTATE M,
                integral.MOITSTATE O,
                integral.MOITSTATE I,
                integral.MOITSTATE T,
                integral.MOITSTATE S,
                integral.MOITSTATE A
            WHERE 
                M.TYPE='C' AND 
                M.STATE_NAME=$1 AND
                M.PARENT_ID=O.STATE_ID AND
                O.PARENT_ID=I.STATE_ID AND
                I.PARENT_ID=T.STATE_ID AND
                T.PARENT_ID=S.STATE_ID AND
                S.PARENT_ID=A.STATE_ID;`, 
            [v_city_name]
        );

        // Handling the query results
        if (getLocationDetail.rowCount > 1) {
            errMsg = 'More than one city found. Please check the city name.';
        } else if (getLocationDetail.rowCount === 1) {
            locationData = getLocationDetail.rows[0];
            const getGstStateCode = await db.query(`SELECT integral.FETCH_GST_STATE_CODE($1) AS gst_state_code`, [parseInt(locationData.v_city)]);
            console.log(getGstStateCode)
            locationData = { ...locationData, gst_state_code: getGstStateCode.rows[0].gst_state_code };
        } else {
            errMsg = 'City not found. Please check your input.';
        }

        // Sending a response
        return res.status(200).json({ locationData, errMsg });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errMsg: error.message || 'An error occurred while fetching the city details.',
        });
    }
};

const validateVcode = async (req, res)=>{
    const {v_code} = req?.query;
    try {
        const result = await db.query(
            `SELECT 1 FROM ${TABLE_NAMES.VENDER_MASTER} WHERE v_code = $1 LIMIT 1`, [v_code]
        );
        if (result.rowCount > 0) {
            return res.send({ exists: true });
        } else {
            return res.send({ exists: false });
        }
    } catch (error) {
        console.error("Error checking v_code:", error);
        res.status(500).json({ error: error.message || 'Database query failed' });
    }
}

const validateVname = async (req, res) => {
    const { v_name, exp_flg } = req.query;
    try {
        let query;
        const params = [v_name]; 

        if (exp_flg === 'N') {
            query = `
                SELECT MAX(v_code) AS max_v_code
                FROM INTEGRAL.mommvend 
                WHERE SUBSTR(v_code, 1, 1) = SUBSTR($1, 1, 1)
                  AND SUBSTR(v_code, -1, 1) != 'E'
            `;
        } else if (exp_flg === 'Y') {
            query = `
                SELECT MAX(v_code) AS max_v_code
                FROM INTEGRAL.mommvend 
                WHERE SUBSTR(v_code, 1, 1) = SUBSTR($1, 1, 1)
                  AND SUBSTR(v_code, -1, 1) = 'E'
            `;
        } else {
            return res.status(400).json({ error: 'Invalid exp_flg value' }); 
        }

        const result = await db.query(query, params);

        if (result.rows.length > 0) {
            res.send({ v_code: result.rows[0].max_v_code || null });
        } else {
            res.send({ v_code: null });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message||'Database query failed' });
    }
};


exports.getVendorList = catchAsync(async (req, res, next) => {
   try {
    const getVendorList = await db.query(`select v_code, v_name from  mommvend ORDER BY v_name`)

    if(getVendorList.rowCount > 0) {
        res.status(200).json({type:'found', data: getVendorList.rows});
      } else {
        res.status(200).json({type:'found', data: []});
       }
   } 
   catch (error) {
    console.error(error)
    res.status(500).json({type:'not found', message: error.message || 'Internal Server Error'})
   }
});



exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
       await getSupplierDataOnQuery(req, res);
        return;
    }

    if(req?.query?.help_list){
        await helpListData(req, res)
        return;
    }
    if(req?.query?.v_city_name){
        await validateCity(req, res)
        return;
    }
    if(req?.query?.v_code){
        await validateVcode(req, res)
        return;
    }
    if(req?.query?.v_name){
        await validateVname(req, res)
        return
    }

  
});


exports.handleSubmitFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateSupplierMstr(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await submitSupplierMstr(req, res);
        return;
    }
});