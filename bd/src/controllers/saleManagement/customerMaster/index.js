const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../utility/query");
const { transformCustomerToDbData } = require("./prersentation");
const { transFormCustomerMstrForInsert } = require("./utility");

const TABLE_NAMES = {
    CUSTOMER_MASTER: "MOSMCUST_MASTER",
};
    // dropDownData
 exports.getBaseConstants = catchAsync(async (req, res, next) => {
    let cCodeManualOrAuto;
    const isCCodeManualOrAuto = await db.query(
        `select c_code_auto_gen from mosmparm`
    );
    if (isCCodeManualOrAuto.rowCount) {
        cCodeManualOrAuto = isCCodeManualOrAuto.rows[0].c_code_auto_gen;
    } else {
        //HERE NEED TO SEND THE ERROR MSG : 'Please Define Finance parameters'
        cCodeManualOrAuto = "Y";
    }
    const getCustType = await db.query(
        `select description, code from vwCtype order by 1`
    );
    const getCurrList = await db.query(
        `select curr_desc, curr_code from currency order by curr_desc`
    );
    const getModOfTrans = await db.query(
        `select description, code from vwMot order by 1`
    );
    const getTermCode = await db.query(
        `select term_desc, term_code from mhmmterm where sale_or_purchase = $1 order by term_desc`,
        ["S"]
    );
    const delTerm = await db.query(
        `select description, code from vwPbasis order by 1`
    );
    const custInd = await db.query(
        `select description, code from mommcode
        where cat_group = $1
        order by 1`,
        ["CUSIND"]
    );
    return res.status(200).json({
        custType: getCustType.rows,
        modeOfTrans: getModOfTrans.rows,
        priceBasis: delTerm.rows,
        currList: getCurrList.rows,
        termCodeList: getTermCode.rows,
        cust_ind: custInd.rows,
        ccode_auto: cCodeManualOrAuto,
    });
});
    // query logic
const getCustomerDataOnQuery = async (req, res) => {

        const { formStatus, appDivisionId, appFinYear, userId } = req.query
        let whereClauses = [];
                // Define search keys that should be checked in WHERE clause
        let searchKeys = ["c_code", "c_name"];
         
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
        let queryParameter = `ORDER BY c_name LIMIT 1 OFFSET ${parseInt(req.query.offset) || 0}`;
        let customerRelatedData = {};
        let dataCount;

        // Handle different cases for 'get_data'
          if(whereClauses.length > 0) {
                           const getCount = await db.query(
                               `SELECT COUNT(*) FROM ${TABLE_NAMES.CUSTOMER_MASTER} ${queryValues}`
                             );
                             dataCount = getCount.rows[0]?.count;
                             queryParameter = `${queryValues} ${queryParameter}`;
                         } else{
                         switch (req?.query?.get_data) {
            case "First":
            case "Query": {
                const getCount = await db.query(
                    `SELECT COUNT(*) FROM ${TABLE_NAMES.CUSTOMER_MASTER}`
                );
                dataCount = getCount.rows[0]?.count;
                break;
            }
            case "Last": {
                queryParameter = "ORDER BY c_name DESC LIMIT 1";
                break;
            }
        }
    }

        // Fetch customer master data
        const getcustomerMstrData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.CUSTOMER_MASTER} ${queryParameter}`
        );

        // If no customer data is found, return early
        
        if (getcustomerMstrData.rows.length === 0) {
            return res.send({
                type: "not found",
                customerMstr: null,
                count: dataCount || 0,
            });
        }

        // if (getcustomerMstrData.rows.length === 0) {
        //     return res.status(404).json({
        //         type: "not found",
        //         customerMstr: [],
        //         count: dataCount || 0,
        //     });
        // }

        const customer = getcustomerMstrData.rows[0];

        if (customer.ship_bill_code) {
            customer.ship_bill_name = customer.c_name;
        }
        if (customer.sales_per_cd) {
            const getEmpName = await db.query(
                `select emp_name from mhpmempm where emp_cd  = $1;`,
                [customer.sales_per_cd]
            );
            if (getEmpName.rowCount > 0) {
                customer.emp_name = getEmpName.rows[0].emp_name;
            }
        }

        // If supplier has a city, run queries to fetch related data
        if (customer?.c_city) {
            const c_city = customer.c_city;
            // console.log("c_city", c_city);

            // Parallel execution of location, tax, user details, and gst_state_code queries
            const [locationDetail, createBy, updateBy, gstStateCode] =
                await Promise.all([
                    db.query(
                        `
                    SELECT
                        integral.get_from_state($1, 'C', 'N') AS c_city_name,
                        integral.get_from_state($1, 'D', 'N') AS c_district,
                        integral.get_from_state($1, 'S', 'N') AS c_state,
                        integral.get_from_state($1, 'Z', 'N') AS c_zone,
                        integral.get_from_state($1, 'T', 'N') AS c_country,
                        integral.get_from_state($1, 'R', 'N') AS c_region;
                `,
                        [c_city]
                    ),
                    customer.create_id
                        ? db.query(
                              `SELECT user_name AS create_by FROM integral.user_master WHERE user_id = $1`,
                              [customer.create_id]
                          )
                        : null,
                    customer.update_id
                        ? db.query(
                              `SELECT user_name AS update_by FROM integral.user_master WHERE user_id = $1`,
                              [customer.update_id]
                          )
                        : null,
                    customer.c_city
                        ? db.query(
                              `SELECT integral.FETCH_GST_STATE_CODE($1) AS gst_state_code`,
                              [customer.c_city]
                          )
                        : null, // Fetch GST state code
                ]);

            if (locationDetail?.rowCount > 0) {
                customerRelatedData = {
                    ...customerRelatedData,
                    ...locationDetail.rows[0],
                };
            }

            if (createBy?.rowCount > 0) {
                customerRelatedData = {
                    ...customerRelatedData,
                    ...createBy.rows[0],
                };
            }

            if (updateBy?.rowCount > 0) {
                customerRelatedData = {
                    ...customerRelatedData,
                    ...updateBy.rows[0],
                };
            }

            if (gstStateCode?.rowCount > 0) {
                customerRelatedData.gst_state_code =
                    gstStateCode.rows[0].gst_state_code;
            }
        }

        //if customer has null value in c_city
        if (!customer.c_city) {
            // console.log("yes customer has not c_city");
            if (
                customer.c_city_name ||
                customer.c_district ||
                customer.c_state
            ) {
                const getDlrCd = await db.query(
                    "select dealer_code from moedmember where member_no = $1",
                    [customer.c_code]
                );
                if (getDlrCd.rowCount > 0) {
                    const getDealerLocDetail = await db.query(
                        `select zone, region from moeddealer where dealer_code = $1`,
                        [getDlrCd.rows[0].dealer_code]
                    );
                    if (getDealerLocDetail.rowCount > 0) {
                        // console.log(getDealerLocDetail.rows[0]);
                        customer.c_zone = getDealerLocDetail.rows[0].zone;
                        customer.c_region = getDealerLocDetail.rows[0].region;
                        customer.c_country = "INDIA";
                    }
                }
            }
        }

        // if (customer.create_id) {
        //     const getCreatedBy = await db.query(
        //         `select user_name from user_master
        //       where user_id = $1;`,
        //         [customer.create_id]
        //     );
        //     if (getCreatedBy.rowCount > 0) {
        //         customer.create_by = getCreatedBy.rows[0].user_name;
        //     }
        // }
        // if (customer.update_id) {
        //     const getUpdatedBy = await db.query(
        //         `select user_name from user_master
        //       where user_id = $1`,
        //         [customer.update_id]
        //     );
        //     if (getUpdatedBy.rowCount > 0) {
        //         customer.update_by = getUpdatedBy.rows[0].user_name;
        //     }
        // }
        
        const getCustDiscountData = await db.query(
            `SELECT mcd.*, md.disc_desc FROM  mosmcustdisc mcd  LEFT JOIN  mosmdisc md ON 
        mcd.disc_id = md.disc_id WHERE mcd.c_code = $1`,
            [customer.c_code]
        );

        if (customer.tax_code) {
            const taxDetail = await db.query(
                `select st_form, tax_perc, surch_per from mofmptax where tax_code = $1;`,
                [customer.tax_code]
            );
            if (taxDetail.rowCount > 0) {
                customer.st_form = taxDetail.rows[0].st_form;
                customer.cst_lst_prc = taxDetail.rows[0].tax_perc;
                customer.surch_per = taxDetail.rows[0].surch_per;
            }
        }

        const response = {
            type: "found",
            customerMstr: { ...customer, ...customerRelatedData },
            discountDetail: getCustDiscountData.rows || [],
            count: dataCount || 0, // Default to 0 if count is undefined
        };

        return res.send(response);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Internal server error on query" });
    }
};
     //  All helpList Logic
const helpListData = async (req, res) => {
    const { help_list, form_status } = req.query; // Make sure these are extracted from the request
    try {
      
        
        if (
            help_list === "city" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
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
        } else if (
            (help_list === "CCode"|| help_list === 'CName') &&
           (form_status === "Insert" || form_status === "Update" || form_status === "Search")
        ) {
          
            const CusCodeList = await db.query(
                `select c_code , c_name from MOSMCUST_MASTER order by c_name`
            );
            if (CusCodeList.rowCount > 0) {
                return res.status(200).json(CusCodeList.rows);
            } else {
                return res.status(200).json([]);
            }
        } else if (
            help_list === "shipBillCode" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const getCustCodeList = await db.query(
                `select c_name, c_code from vwcustactive order by 1`
            );
            if (getCustCodeList.rowCount > 0) {
                return res.status(200).json(getCustCodeList.rows);
            } else {
                return res.status(200).json([]);
            }
        } else if (
            help_list === "salePerson" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const empCodeList = await db.query(
                `select emp_name, emp_cd from mhpmempm order by emp_name`
            );
            if (empCodeList.rowCount > 0) {
                return res.status(200).json(empCodeList.rows);
            } else {
                return res.status(200).json([]);
            }
        } else if (
            help_list === "supplierCodeAlloted" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const getSuppCodeAll = await db.query(
                 `select v_name, v_code from mommvend order by 1`
            );
            if (getSuppCodeAll.rowCount > 0) {
                return res.status(200).json(getSuppCodeAll.rows);
            } else {
                return res.status(200).json([]);
            }
              } else if (
            help_list === "stockistCode" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const getStockistCode = await db.query(
                `select distinct c_code from mosmcust`
            );
            if (getStockistCode.rowCount > 0) {
                return res.status(200).json(getStockistCode.rows);
            } else {
                return res.status(200).json([]);
            }
        } else if (
            help_list === "supplierCode" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const getCVCode = await db.query(
                `select v_name, v_code from mommvend order by 1`
            );
            if (getCVCode.rowCount > 0) {
                return res.status(200).json(getCVCode.rows);
            } else {
                return res.status(200).json([]);
            }
        } else if (
            help_list === "disc_desc" &&
            (form_status === "Insert" || form_status === "Update")
        ) {
            const {cust_type, c_city, c_code} = req?.query
            const getDiscountDiscList = await db.query(`
            SELECT 
                d.disc_desc, 
                d.disc_id, 
                CASE 
                    WHEN d.disc_prc_amt = 'P' THEN '%' 
                    WHEN d.disc_prc_amt = 'S' THEN 'PCS' 
                    WHEN d.disc_prc_amt = 'A' THEN 'AMT' 
                END AS disc_prc_amt, 
                TO_CHAR(d.disc_value, '999990.00') AS disc_value, 
                TO_CHAR(d.disc_qty_from, '999990.000') AS disc_qty_from, 
                TO_CHAR(d.disc_qty_to, '999990.000') AS disc_qty_to
            FROM mosmdisc d
            WHERE 
                active = 'Y' 
                AND disc_on_qty = 'N'
                AND (disc_cust_type IS NULL OR disc_cust_type = $1)
                AND (
                    EXISTS (
                        SELECT 1 
                        FROM mosmdisc_state 
                        WHERE disc_id = d.disc_id 
                        AND state_id = get_from_state($2, 'S', 'I')::bigint
                    ) 
                    OR NOT EXISTS (
                        SELECT 1 
                        FROM mosmdisc_state 
                        WHERE disc_id = d.disc_id
                    )
                )
                AND NOT EXISTS (
                    SELECT 1 
                    FROM mosmcustdisc p
                    WHERE p.c_code = $3   
                    AND p.disc_id = d.disc_id
                )
                AND (
                    EXISTS (
                        SELECT 1 
                        FROM mosmcustdisc 
                        WHERE disc_id = d.disc_id 
                        AND c_code = $4 
                    ) 
                    OR NOT EXISTS (
                        SELECT 1 
                        FROM mosmdisc_state 
                        WHERE disc_id = d.disc_id
                    )
                )
            ORDER BY d.disc_desc;
            `,[cust_type, c_city, c_code, c_code]);
            if (getDiscountDiscList.rowCount > 0) {
                return res.status(200).json(getDiscountDiscList.rows);
            } else {
                return res.status(200).json([]);
            }
        } else {
            return res.status(400).json({ error: "Invalid request" }); // Handle invalid requests
        }
    } catch (error) {
        console.error("Database query error:", error); // Log the error
        return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
    }
};

 const validateCcode = async (req, res) => {
    
    const { c_code } = req?.query;

    // console.log('c_code is ', c_code)
    try {
        const result = await db.query(
            `SELECT 1 FROM ${TABLE_NAMES.CUSTOMER_MASTER} WHERE c_code = $1 LIMIT 1`,
            [c_code]
        );
        if (result.rowCount > 0) {
            return res.send({ exists: true });
        } else {
            return res.send({ exists: false });
        }
    } catch (error) {
        console.error("Error checking c_code:", error);
        res.status(500).json({ error: "Database query failed" });
    }
};

   // submit new Customer(Insert Data Function)
const submitCustomerMstr = async (req, res) => {
    const formData = { ...req?.body.formData };
    // const userInfo = { ...req?.body.userInfo };
      const {global_division_id:appDivisionId, global_fin_year:appFinYear} = req.body?.user
    // const discountDetail={...req?.body.discountDetail}

    let isCCodeAuto = formData.ccode_auto;
 
    
    try {
        await db.query("Begin");

        if (isCCodeAuto === "Y") {
            //this query will generate voucher id through db sequence function
            const getCustomerCode = await db.query(
                `SELECT gencustomercode($1)`,
                [formData.c_name]
            );

            // Check if the sequence function returns a valid result
            if (!getCustomerCode.rows[0]?.gencustomercode) {
                throw new Error("Failed to generate customer code");
            }
            formData.c_code = getCustomerCode.rows[0].gencustomercode;
        }

        // before insert into customer master clean the object as required for insert

        // let customerMstrData = transFormCustomerMstrForInsert({ ...formData });


             // adding by akshay and create presentation file
          let customerMstrData = transformCustomerToDbData({...formData});


        // Insert customer master data
        const customerInsertQuery = generateSingleInsertQuery(
            TABLE_NAMES.CUSTOMER_MASTER,
            customerMstrData,
        );
        const custMstrValForInsertQuery = Object.values(customerMstrData);

   
        

        await db.query(customerInsertQuery, [...custMstrValForInsertQuery]);
              
            // TODO discount tab for timebeing not using 
        // if (discountDetail.length) {
        //     for (const [index, record] of discountDetail.entries()) {
        //         try {
        //             const queryForInsert = generateSingleInsertQuery('mosmcustdisc', record, "create_date");

        //             const valuesForInsertQuery = Object.values(record);
        //             await db.query(queryForInsert, [...valuesForInsertQuery]);
        //         } catch (error) {
        //             console.error(`Error inserting record at index ${index}:`, error);
        //             throw Error(error);
        //         }
        //     }
        // }

        // IMPLEMENTING THE LOGIC TO UPDATE MHFMGLM AND MDFMGLM
        // THE ACTUAL FUNCTION IS UPDCODEGLM IN DB BUT HERE WE USED UPDCODEGLM_TEST MODIFIED BY AMIT
        // //TODO // DIVISION AND TRANSYEAR SHOULD BE DYNAMIC
     
        
        const isGlmUpdated = await db.query(
            `SELECT updcustomercodeglm($1, $2, $3, $4)`,
             [`C${formData.c_code}`, formData.c_name, appDivisionId, appFinYear]
          //  [
                // `C${formData.c_code}`,
                // formData.c_name,
                // parseInt(userInfo.division_id),
                // userInfo.trans_year,
            // ]
        );

        if (isGlmUpdated.rows[0].updcustomercodeglm) {
            // Check for specific error message returned by the function
            await db.query("ROLLBACK");
            return res
                .status(409)
                .json({type:'error', message: isGlmUpdated.rows[0].updcustomercodeglm });
        }

        await db.query("commit");
        return res.status(200).json({ type: "created" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        return res.status(400).json({type:'error', message: error.message||'Internal Server Error'});
    }
};

   // update function 
const updateCustomerMstr = async (req, res) => {

    
    const formData = { ...req?.body.formData };
    // const userInfo = { ...req?.body.userInfo };
      const {global_division_id:appDivisionId, global_fin_year:appFinYear} = req.body?.user
    // const newDiscountDetail =[...req?.body.newDiscountDetail]
    // const udpatedDiscountDetail =[...req?.body.udpatedDiscountDetail]
    // const deletedDiscountDetial =[...req?.body.deletedDiscountDetial]

    try {
        await db.query("BEGIN"); // Start transaction

        let customerCode = formData.c_code;
        if (!customerCode) {
         throw new Error('Customer code no send')
        }

        // Remove fields that should not be updated
        delete formData.update_date;
        
        // Transform the data before updating the table
        let customerMstrData = transformCustomerToDbData({ ...formData });
        
        delete formData.c_code;


        // Create SET clause dynamically
        const columns = Object.keys(customerMstrData);
        const values = Object.values(customerMstrData);
        const setClause = columns
            .map((column, idx) => `${column} = $${idx + 1}`)
            .join(", ");

        // SQL Update query
        const query = `UPDATE ${
            TABLE_NAMES.CUSTOMER_MASTER
        } SET ${setClause} WHERE c_code = $${columns.length + 1}`;

  
        
        // Execute the update query
        await db.query(query, [...values, customerCode]);

        // // Discount Insertion logic
        // if (newDiscountDetail.length) {
        //     for (const [index, record] of newDiscountDetail.entries()) {
        //             delete record?.disc_desc
        //             record.c_code = customerCode
        //         try {
        //             const queryForInsert = generateSingleInsertQuery('mosmcustdisc', record, "create_date");

        //             const valuesForInsertQuery = Object.values(record);
        //             // console.log("mosmcustDisc detail query", queryForInsert);
        //             // console.log("mosmcustDisc detail insert query",valuesForInsertQuery);
        //             await db.query(queryForInsert, [...valuesForInsertQuery]);
        //         } catch (error) {
        //             console.error(`Error inserting record at index ${index}:`, error);
        //             throw Error(error);
        //         }
        //     }
        // }

        // if (udpatedDiscountDetail.length) {
        //     for (const [index, record] of udpatedDiscountDetail.entries()) {
        //         delete record?.disc_desc
        //         const columns = Object.keys(record);
        //         const values = Object.values(record);

        //         // Create SET clause for SQL UPDATE query
        //         const setClause = columns
        //             .map((column, idx) => `${column} = $${idx + 1}`)
        //             .join(", ");

        //         const query = `UPDATE mosmcustdisc SET ${setClause}
        //          WHERE disc_id = $${columns.length + 1} and c_code = $${columns.length + 2}`;

        //         try {
        //             let isRecExist = await db.query('select disc_id from mosmcustdisc where disc_id = $1 and c_code = $2',
        //                 [record.disc_id, record.c_code])
        //             if(isRecExist.rowCount>0){
        //                 await db.query(query, [...values, record.disc_id, customerCode]);
        //             }
        //         } catch (error) {
        //             console.error(`Error updating record at index ${index}:`,error);
        //             throw Error(`Update failed for record at index ${index}`);
        //         }
        //     }
        // }

        // // Delete Records
        // if (deletedDiscountDetial.length) {
        //     for (const [index, record] of deletedDiscountDetial.entries()) {
                
        //         const deleteQuery = `DELETE FROM mosmcustdisc WHERE disc_id = $1 AND c_code = $2`;
        //         try {
        //             let isRecExist = await db.query('select * from mosmcustdisc where disc_id = $1 and c_code = $2',
        //                 [record.disc_id, record.c_code])
        //             if(isRecExist.rowCount>0){
        //                 await db.query(deleteQuery, [record.disc_id, customerCode]);
        //             }
        //         } catch (error) {
        //             console.error(`Error deleting record at index ${index}:`, error);
        //             throw Error(`Deletion failed for record at index ${index}`);
        //         }
        //     }
        // }

        const isGlmUpdated = await db.query(
            `SELECT updcustomercodeglm($1, $2, $3, $4)`,
            [
                `C${formData.c_code}`, formData.c_name, appDivisionId, appFinYear
            ]
        );

        // Check GLM update status
        if (isGlmUpdated.rows[0]?.updcustomercodeglm) {

            
            await db.query("ROLLBACK");
            return res.status(409).json({type:'error', message: isGlmUpdated.rows[0].updcustomercodeglm });
        }

        // Commit the transaction
        await db.query("COMMIT");
        return res.status(200).json({ type: "updated" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        return res
            .status(400)
            .json({type:'error', message:error.message || 'Internal Server Error'});
    }


};

const validateCity = async (req, res) => {
    const { c_city_name } = req.query; // Changed to req.query instead of req?.query

    
    let locationData = {};
    let errMsg = null;

    // Check if v_city_name is provided
    if (!c_city_name) {
        return res.status(400).json({ errMsg: "City name is required." });
    }

    try {
        const getLocationDetail = await db.query(
            `
            SELECT 
                M.STATE_ID as C_CITY, 
                O.STATE_NAME as C_DISTRICT, 
                I.STATE_NAME as C_STATE,
                T.STATE_NAME as C_ZONE, 
                S.STATE_NAME as C_COUNTRY, 
                A.STATE_NAME as C_REGION
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
            [c_city_name]
        );

        // Handling the query results
        if (getLocationDetail.rowCount > 1) {
            errMsg = "More than one city exists, Please select from help.";
        } else if (getLocationDetail.rowCount === 1) {
            locationData = getLocationDetail.rows[0];
            const getGstStateCode = await db.query(
                `SELECT integral.FETCH_GST_STATE_CODE($1) AS gst_state_code`,
                [parseInt(locationData.c_city)]
            );
      
            

            const getLocalFlag = await db.query(
                `SELECT LOCAL_FLAG FROM MOITSTATE
	    WHERE STATE_NAME = $1 AND TYPE = $2;`,
                [locationData.c_state, "S"]
            );

            if (getLocalFlag.rowCount > 0) {
                if (getLocalFlag.rows[0].local_flag === "Y") {
                    locationData.local_flag = "L";
                    locationData.lst_cst_flag = "L";
                }
                if (
                    getLocalFlag.rows[0].local_flag === "N" &&
                    locationData.c_country === "INDIA"
                ) {
                    locationData.local_flag = "I";
                    locationData.lst_cst_flag = "C";
                }
                if (locationData.c_country !== "INDIA") {
                    locationData.local_flag = "F";
                    locationData.lst_cst_flag = "C";
                }
            }
            locationData = {
                ...locationData,
                gst_state_code: getGstStateCode.rows[0].gst_state_code,
            };
        } else {
            errMsg = "City not found. Please check your input.";
        }

        // Sending a response
        return res.status(200).json({ locationData, errMsg });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errMsg: "An error occurred while fetching the city details.",
        });
    }
};

const validateSalePerson = async (req, res) => {
    const { sales_per_cd } = req.query; // Changed to req.query instead of req?.query
   
    

    if (!sales_per_cd) {
        return res.status(400).json({ errMsg: "sales code is required." });
    }
    try {
        const getEmpName = await db.query(
            `select emp_name from mhpmempm 
    where emp_cd  = $1;`,
            [sales_per_cd]
        );
        if (getEmpName.rowCount > 0) {
            res.status(200).json({ emp_name: getEmpName.rows[0].emp_name });
        } else {
            return res
                .status(200)
                .json({
                    errMsg: "Employee Code does not exist in Employee Master",
                });
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({
                errMsg: "An error occurred while fetching the Sale Persons details.",
            });
    }
};

exports.getCustomerList = catchAsync (async (req, res, next) => {
    try {
        const getCustomerList = await db.query(`select c_code, c_name from MOSMCUST_MASTER order by c_name`)

        if(getCustomerList.rowCount > 0) {
            res.status(200).json({type:'found', data: getCustomerList.rows});
        }
    }
    catch (error) {
        console.error(error)
        res.status(500).json({type:'not found', message: error.message || 'Internal Server Error'})
    }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getCustomerDataOnQuery(req, res);
        return;
    }
    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
    if (req?.query?.c_city_name && req?.query?.form_status != 'Search') {
        await validateCity(req, res);
        return;
    }
    if (req?.query?.c_code && req?.query?.form_status != 'Search') {
        await validateCcode(req, res);
        return;
    }
    if (req?.query?.sales_per_cd && req?.query?.form_status != 'Search') {
        await validateSalePerson(req, res);
        return;
    }
    
    // if(req?.query?.v_name){
    //     await validateVname(req, res)
    //     return
    // }
});

exports.handleSubmitFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateCustomerMstr(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
   
        
        await submitCustomerMstr(req, res);
        return;
    }
});
