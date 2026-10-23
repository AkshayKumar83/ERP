const { error } = require("pdf-lib");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { procInsertContraEntry, transformExpVchrForInsert,
    transformExpVchrDetailForInsert,
    transformMasterToDbData,
    transformNarrationToDbData,
} = require("./presentation");

const { v4: uuidv4 } = require('uuid');

const TABLE_NAMES = {
    EXPENSE_HEAD_TABLE: "integral.thfmtran",
    EXPENSE_DETAIL_TABLE: "integral.tdfmtran",
    SECTION_LIST_TABLE: "integral.moitsection",
    USER_SECTION_LIST_TABLE: "integral.moitusersection",
    PURPOSE_LIST_VIEW: "integral.vwPurp",
    REGISTER_TYPE_LIST_TABLE: "integral.VWEXCISEREGISTERTYPE",
    GLM_MASTER_TABLE: "integral.mhfmglm",
    VENDOR_MASTER_TABLE: "integral.mommvend",
    COST_CENTRE_VIEW: "integral.vwcostc",
	GLM_ACTIVE_CR_VIEW:"integral.vwGlmActiveCreditors",
    GENERATE_VOUCHER_NO:`integral.GEN_VOUCHER_SECT`,
    CREATE_GST_WITH_ITC:`integral.test_gst_cal_fun_by_amit($1,$2,$3,$4)`
};
const PROCEDURE={
    CREATE_GST_WITH_ITC:`calc_gst_entries_exp($1,$2,$3,$4)`
}

// PROCWOAMT PROGRAMMUNIT IMPLEMENTED ✔
const procwoamt = async (po_id) => {
    try {
      // Retrieve woAmt
      const woAmt = await db.query(`SELECT total_amount AS wo_amt FROM mhmmpo WHERE po_id = $1`,[po_id]);
  
      // Check if woAmt is not null and contains rows
      if (woAmt && woAmt.rows.length > 0) {
        const woBalAmt = await db.query(
          `
          SELECT COALESCE($1, 0) - COALESCE(SUM(CASE WHEN db_cr = 'D' THEN amount ELSE 0 END), 0) AS wo_bal_amt
          FROM tdfmtran d
          JOIN thfmtran h ON h.voucher_id = d.voucher_id
          WHERE h.trans_type LIKE 'P%'
          AND COALESCE(h.cancel, 'N') = 'N'
          AND COALESCE(d.db_cr, 'D') = 'D'
          AND h.voucher_id <= COALESCE(NULL, h.voucher_id)
          AND h.po_id = $2;
          `,
          [woAmt.rows[0].wo_amt, po_id]
        );
        
        return {wo_amt:woAmt.rows[0].wo_amt?? 0, wo_bal_amt: woBalAmt.rows[0].wo_bal_amt};
      }
    } catch (err) {
      console.error(err);
    }
};

// On Form Render setup initial Data in form
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    let global_user_id = req?.userInfo?.global_user_id || 583 // todo: also remove hardcord user from here

    const { formStatus, appFinYear} = req?.query

    //todo hardcode the user_id = 0 rightnow so do remove when user_id work will be do
    // as user id not engage properly with division
    global_user_id = 0; // HARD CODE

    if (!global_user_id && !formStatus) {
        return res.status(404).json({ message: "User Not Found" });
    }

    const sectionList = await db.query(
        `SELECT s.section_desc, u.section_id
          FROM ${TABLE_NAMES.SECTION_LIST_TABLE} s
          JOIN ${TABLE_NAMES.USER_SECTION_LIST_TABLE} u ON s.section_id = u.section_id
          WHERE u.user_id = $1
          ORDER BY s.section_desc`,
        [Number(global_user_id)]
    );

    // console.log(sectionList.rows)
    
    // this will return the sect for use as perameter in voucher id generator
    const sect = await db.query(
        `SELECT SECTION_PREFIX FROM ${TABLE_NAMES.SECTION_LIST_TABLE}
         WHERE SECTION_ID = $1`,
        [sectionList.rows[0].section_id]
    );

    //this will return po_cat list
    const po_catList = await db.query(
        `select mc.po_cat_description, fc.po_cat_prefix as po_cat
          from integral.mofmpcat fc, integral.mommpcat mc
          where fc.po_cat_prefix = mc.po_cat_prefix`
    );

    //this will return purpus list
    const purpose = await db.query(
        `select description, code from integral.vwPurp order by 1`
    );

    // this will return registerType
    const rgstrTypeList = await db.query(
        `SELECT register_type FROM integral.VWEXCISEREGISTERTYPE`
    );

    const getcurrencyList = await db.query(
        `select curr_code, curr_desc from currency`
    )

    let currDetail ={curr_code:'', exchang_rt:''}
    let maxVoucherId = 0;
    if(formStatus === 'Insert'){
        const getCurrencyAndRate = await db.query(`SELECT CURR_CODE, RATE FROM CURRENCY WHERE DEF_FLAG = $1;`,['Y'])
        if(getCurrencyAndRate.rowCount === 1){
            currDetail.curr_code = getCurrencyAndRate.rows[0].curr_code;
            currDetail.exchang_rt = getCurrencyAndRate.rows[0].rate;
        }

        const getMaxVchId = await db.query(`SELECT MAX(voucher_id) FROM thfmtran`) 

        if(getMaxVchId.rowCount){
            maxVoucherId = getMaxVchId.rows[0].max
        }
    }

    return res.status(200).json({
        poCategory: po_catList.rows,
        sections: sectionList.rows,
        purposes: purpose.rows,
        registerList: rgstrTypeList.rows,
        currencyList:getcurrencyList.rows,
        sect: sect.rows[0].section_prefix,
        curr_code: formStatus=== 'Insert'? currDetail.curr_code:'',
        exchang_rt:formStatus=== 'Insert'? currDetail.exchang_rt:'',
        maxVoucherId:formStatus=== 'Insert'? maxVoucherId:'',
  
    });
});

// For Query Operation
const getExpVchrDataOnQuery = async (req, res) => {
    let whereClauses = [];

     // Define search keys that should be checked in WHERE clause
     let searchKeys = ["voucher_no", "voucher_dt"];

     // If any of these searchKeys exist in the query, add them to WHERE clause
     for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
        }
    }

     // Build WHERE clause dynamically
     let queryValues = whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

    
  const {formStatus, appDivisionId, appFinYear} = req?.query
    let transYear = appFinYear || '2023';
    let divisionId = appDivisionId || 1;
    let user_id = req?.userInfo?.user_id || 583; // todo: remove this after resolving the issue of cookies not seted in client

    // console.log(divisionId)
    let thfmtranData = {}

    try {
        let queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${ req.query.offset || 0}`;
        let recordCount;
        // console.log(req.query);
         // If search parameters exist, count results accordingly
         if (whereClauses.length > 0) {
            const getCount = await db.query(`SELECT COUNT(voucher_id)
                FROM ${TABLE_NAMES.EXPENSE_HEAD_TABLE}
                WHERE Trans_year = $1
                AND Division_id = $2
                AND trans_type like 'P%'
				and trans_type != 'P0'
               ${queryValues}`, [transYear, divisionId]);
            recordCount = getCount.rows[0]?.count;
            queryParameter = `${queryValues} ${queryParameter}`;
        }else{
            switch (req?.query?.get_data) {
                case "Query":
                case "First": {
                    const getCount = await db.query(
                        `
                            SELECT COUNT(voucher_id)
                            FROM ${TABLE_NAMES.EXPENSE_HEAD_TABLE}
                            WHERE Trans_year = $1
                            AND Division_id = $2
                           AND trans_type like 'P%'
				            and trans_type != 'P0'              
              `,
                        [transYear, divisionId]
                    );
                    recordCount = getCount.rows[0]?.count;
                    break;
                }
                case "Last": {
                    queryParameter = "ORDER BY voucher_no DESC LIMIT 1";
                    break;
                }
                default:
                    queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${
                        req.query.offset || 0
                    }`;
                    break;
            }

        }


        const expenseVoucher = await db.query(
            `
        SELECT *
        FROM ${TABLE_NAMES.EXPENSE_HEAD_TABLE}
        WHERE Trans_year = $1
        AND Division_id = $2
       AND trans_type like 'P%'
		and trans_type != 'P0'
        
        ${queryParameter}
      `,
            [transYear, divisionId]
        );

        if (!expenseVoucher.rows.length) {
            return res.status(200).send({ type:'not found', message: "No voucher data found", count: 0});
        }

        // SET EXP VOUCHER DATA
        thfmtranData ={...expenseVoucher.rows[0]}



        // SETUP PARTY CODE AND PARTY NAME AS IN POST- QUERY ✅
        const party_detail = await db.query(
            `
                SELECT d.acc_no, m.acc_desc 
                FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} d, ${TABLE_NAMES.GLM_MASTER_TABLE} m
                WHERE d.voucher_id = $1
                AND d.flag = $2
                AND d.acc_no = m.acc_no
      `,
            [expenseVoucher.rows[0].voucher_id, "Y"]
        );
        thfmtranData.party_code = party_detail.rowCount>0?party_detail.rows[0].acc_no:''
        thfmtranData.party_name = party_detail.rowCount>0?party_detail.rows[0].acc_desc:''

        // if (party_detail.rows.length) {
        //     expenseVoucher.rows[0].party_code = party_detail.rows[0].acc_no;
        //     expenseVoucher.rows[0].party_name = party_detail.rows[0].acc_desc;
        // }

        // SETUP PO_CAT
        const getPoCat = await db.query(`
            select m.po_cat_prefix as po_cat
                from mofmpcat f, mommpcat m
                where f.trans_code = $1
                and f.po_cat_prefix = m.po_cat_prefix limit 1;
            `,[thfmtranData.trans_type])
        thfmtranData.po_cat = getPoCat.rowCount>0?getPoCat.rows[0].po_cat:''

        const getSection = await db.query(`
            select s.section_id as section
            from moitsection s, user_master u
                where s.dept_cd = u.dept_cd
                AND u.user_id = $1;
            `,[user_id])
            thfmtranData.section = getSection.rowCount>0?getSection.rows[0].section:1 // todo remove this hardcode section or ask pm sir


        // SETUP GST DETAIL OF PARTY ✅
        const gst_detail = await db.query(
            `SELECT WHETHER_GST_REGISTERED_DLR, gst_no 
                FROM ${TABLE_NAMES.VENDOR_MASTER_TABLE}
                WHERE V_CODE = SUBSTR($1, 2)
            `,
            [party_detail.rows[0].acc_no]
        );
        thfmtranData.gst_registered = gst_detail.rowCount>0?gst_detail.rows[0].whether_gst_registered_dlr:''
        thfmtranData.party_gst_no = gst_detail.rowCount>0?gst_detail.rows[0].gst_no:''
        // if (gst_detail.rows.length) {
        //     expenseVoucher.rows[0].gst_registered = gst_detail.rows[0].whether_gst_registered_dlr;
        //     expenseVoucher.rows[0].party_gst_no = gst_detail.rows[0].gst_no;
        // }

        thfmtranData.exp_work = expenseVoucher.rows[0].po_id == null ? "E" : "W";

        // SETUP WO_NO AND WO_AMT USING PO_ID and exp_work ✅ as found in 🌟 ( procwoamt program unit )
        // expenseVoucher.rows[0].exp_work = expenseVoucher.rows[0].po_id == null ? "E" : "W";
        const wo_detail = await db.query(`SELECT po_no, total_amount FROM mhmmpo WHERE po_id = $1`, [expenseVoucher.rows[0].po_id]);

        thfmtranData.wo_no = wo_detail.rowCount>0?wo_detail.rows[0].po_no:''
        thfmtranData.wo_amt = wo_detail.rowCount>0?wo_detail.rows[0].total_amount:''

        // if (wo_detail.rows.length) {
        //     expenseVoucher.rows[0].wo_no = wo_detail.rows[0].po_no || '';
        //     expenseVoucher.rows[0].wo_amt = wo_detail.rows[0].total_amount || '';
        // }

        const woBalAmt = await db.query(
        `SELECT COALESCE($1, 0) - COALESCE(SUM(CASE WHEN db_cr = 'D' THEN amount ELSE 0 END), 0) AS wo_bal_amt
        FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} d, ${TABLE_NAMES.EXPENSE_HEAD_TABLE} h
        WHERE h.voucher_id = d.voucher_id
        AND h.trans_type LIKE 'P%'
        AND COALESCE(h.cancel, 'N') = 'N'
        AND COALESCE(d.db_cr, 'D') = 'D'
        AND h.voucher_id <= COALESCE($2, h.voucher_id)
        AND h.po_id = $3
      `, [expenseVoucher.rows[0].wo_amt, expenseVoucher.rows[0].voucher_id, expenseVoucher.rows[0].po_id,]
        );

        thfmtranData.wo_bal_amt = wo_detail.rowCount>0?woBalAmt.rows[0].wo_bal_amt:''

        //🌟 end of procwoamt program unit  ✅ 


        // if (woBalAmt.rows.length) {
        //     expenseVoucher.rows[0].wo_bal_amt = woBalAmt.rows[0].wo_bal_amt;
        // }


        const party_amt = await db.query(
        `SELECT SUM(CASE WHEN DB_CR = 'D' THEN AMOUNT ELSE -1 * AMOUNT END) AS party_amt FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} 
            WHERE FLAG = 'N' AND VOUCHER_ID = $1
        `, [expenseVoucher.rows[0].voucher_id]
        );
        thfmtranData.party_amt = party_amt.rows[0]?.party_amt || 0;

        // expenseVoucher.rows[0].party_amt = party_amt.rows[0]?.party_amt || 0;

        // FETCH TDFMTRAN DATA RELATED TO ABOVE THFMTRAN VOUCHER_ID
        const expenseDetail = await db.query(
        `SELECT * FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} WHERE voucher_id = $1 AND flag = $2 ORDER BY srl_no
      `, [expenseVoucher.rows[0].voucher_id, "N"]);

        // FETCH PROCINSERTCONTRA ENTERY  
        const procInsertContra = await db.query(
            `SELECT * FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} WHERE voucher_id = $1 AND flag = $2 
          `, [expenseVoucher.rows[0].voucher_id, "Y"]);

        await Promise.all(
            expenseDetail.rows.map(async (item, index) => {
                if (item.cost_centr !== null) {
                    const cost_cntr = await db.query(
                        ` SELECT description, prefix FROM ${TABLE_NAMES.COST_CENTRE_VIEW} WHERE code = $1`,
                        [item.cost_centr]
                    );
                    item.cost_desc = cost_cntr.rows[0]?.description;
                    item.cost_pre = cost_cntr.rows[0]?.prefix;
                    item.cost = item.cost_pre
                }
                if (item.pur_code !== null) {
                    const purp_desc = await db.query(
                        `SELECT description FROM ${TABLE_NAMES.PURPOSE_LIST_VIEW} WHERE code = $1`,
                        [item.pur_code]
                    );
                    item.pur_desc = purp_desc.rows[0]?.description;
                }
                const acc_desc = await db.query(
                    `SELECT * FROM integral.vwGlmActiveOthers WHERE acc_no = $1`,
                    [item.acc_no]
                );
                if (acc_desc.rows.length > 0) {
                    item.acc_desc = acc_desc.rows[0].acc_desc;
                }
                if (item.emp_cd !== null) {
                    const emp_detail = await db.query(
                        `SELECT emp_name FROM integral.mhpmempm WHERE emp_cd = $1`,
                        [item.emp_cd]
                    );
                    item.emp_name = emp_detail.rows[0]?.emp_name || null;
                }

                item.row_id = uuidv4()
            })
        );

        return res.status(200).json({
            type: "found",
            expenseVoucher: { ...thfmtranData},
            expenseDetail: expenseDetail.rows,
            procInsertContra:{...procInsertContra.rows[0]},
            count: recordCount || 0,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Error" });
    }
};

// For HelpList
const helpListData = async (req, res) => {
    const {appFinYear:transYear, appDivisionId:divisionId, form_status, help_list} = req?.query
    if(!['Insert', 'Update', 'Search'].includes(form_status)){
        return res.status(200).send([]);
    }
    // console.log(req.query)
    // for party code help list
    if (help_list === "parties") {
        const parties = await db.query(
            `Select acc_desc, acc_no from ${TABLE_NAMES.GLM_ACTIVE_CR_VIEW} V
				where v.division_id = $1
				and v.trans_year = $2`,
            [divisionId, transYear] 
        ); 
        return res.status(200).send(parties.rows);
    } else if (help_list === "acc_no") {
        //this is for accunt no help in field of acc.no reside in detail block
        const accNoList = await db.query(
        `Select acc_desc, acc_no from integral.vwGlmActiveOthers 
          where division_id = $1 and trans_year = $2
          order by 1
          `, [divisionId, transYear] );
        if (accNoList.rows.length > 0) {
            res.status(200).json(accNoList.rows);
        }
        // console.log(accNoList.rows)
    } else if (help_list === "cost_centre") {
        //this is for cost centre help in field of c.c reside in detail block
        const costCentre = await db.query(`select prefix, description, code from integral.mommcode where cat_group= $1 order by 1`,
            ["COSTC"]
          );
          res.status(200).json(costCentre.rows);
    } else if(help_list === "itc_ref"){
        const itcRef = await db.query(
        `
SELECT h.itc_sr_no, h.gst_id, h.v_code, v_name, doc_no,
    TO_CHAR(doc_date, 'YYYY-MM-DD') AS doc_date, h.itc_sr_no AS itc_sr_no2, 
    h.gst_id AS gst_id2, 'S' || h.v_code AS v_code2, v.v_name AS v_name2, 
    h.doc_no AS doc_no2, TO_CHAR(h.doc_date, 'YYYY-MM-DD') AS doc_date2
FROM thfminwardgst h, mommvend v
WHERE h.division_id = $1
    AND V_TYPE = 'V'
    and register_type = 'G'
    AND h.v_code = v.v_code
    and h.auth_flag = 'Y'
    AND NOT EXISTS (
        SELECT 1 
        FROM thfmcash c  
        WHERE 
            c.division_id = h.division_id
            AND COALESCE(c.cancel, 'N') = 'N'
            AND c.gst_id IS NOT NULL 
            AND h.gst_id = c.gst_id
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM thfmtran t 
        WHERE 
            t.division_id = h.division_id
            AND COALESCE(t.cancel, 'N') = 'N'
            AND t.gst_id IS NOT NULL 
            AND h.gst_id = t.gst_id
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM mhapbill b 
        WHERE 
            b.division_id = h.division_id
            AND COALESCE(b.cancel, 'N') = 'N'
            AND b.v_code = h.v_code
            AND b.bill_no = h.doc_no
            AND b.bill_dt::date = h.doc_date::date
    );
    `,
            [divisionId]
          );
          res.status(200).json(itcRef.rows);
    }else if(help_list === 'wo_no'){
        const getWoNoList = await db.query(`select po_no, po_id from mhmmpo where v_code = substr($1, 2)
        and funcpocategorytype(po_id) in ('WO','WI','PS') and division_id = $2`,[req?.query?.f_party_code, divisionId])
        res.status(200).json(getWoNoList.rows);
    }

};


exports.createGstEntries = catchAsync(async (req, res, next) => {
    const { createGstWithItc, divisionId, billDt, billNo } = req.query;
    console.log(createGstWithItc, divisionId, billDt, billNo)
    let trans_amt = 0;
    let party_amt;
    
    try {
        if(createGstWithItc == undefined || createGstWithItc == null){
            throw new Error('Please fill the required field to Create Gst Entries')
        }
        // Query for GST entries
        const result = await db.query(
            `SELECT * 
             FROM ${PROCEDURE.CREATE_GST_WITH_ITC}`,
            [divisionId, createGstWithItc, billNo, billDt]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No record found' });
        }

        const expenseDetails = await Promise.all(
            result.rows.map(async (record, index) => {
                try {
                    // Cost centre info
                    if (record.cost_centr) {
                        const costCentre = await db.query(
                            `SELECT prefix, description FROM integral.mommcode 
                             WHERE cat_group = $1 AND code = $2 LIMIT 1`,
                            ["COSTC", record.cost_centr]
                        );
                        if (costCentre.rows.length) {
                            record.cost_desc = costCentre.rows[0].description;
                            record.cost_pre = costCentre.rows[0].prefix;
                        }
                    }

                    // Account number info
                    if (record.acc_no) {
                        const accNoList = await db.query(
                            `SELECT acc_desc FROM integral.vwGlmActiveOthers 
                             WHERE division_id = $1 AND acc_no = $2 LIMIT 1`,
                            [divisionId, record.acc_no]
                        );
                        if (accNoList.rows.length) {
                            record.acc_desc = accNoList.rows[0].acc_desc;
                        }
                    }

                    // Amount calculation
                    const amount = parseFloat(record.amount);
                    if (record.db_cr === 'D') {
                        trans_amt += amount;
                    } else {
                        trans_amt -= amount;
                    }



                    // Rename and format
                    record.bill_no = record.billno;
                    record.bill_dt = dateFormater(record.billdt); // make sure this exists
                    delete record.billdt;
                    delete record.billno;

                    return record;

                } catch (error) {
                    console.error(`Error processing record at index ${index}:`, error);
                    throw error;
                }
            })
        );

        party_amt = trans_amt;

        // Fetch GST status and number
        const getGstNo = await db.query(
            `SELECT WHETHER_GST_REGISTERED_DLR, gst_no 
             FROM ${TABLE_NAMES.VENDOR_MASTER_TABLE} 
             WHERE V_CODE = SUBSTR($1, 2)`,
            [createGstWithItc]
        );

            // fetch gst_id from thfminwardgst table
    const gstIdResult = await db.query(
      `select gst_id from thfminwardgst 
where v_code = $1
and doc_no = $2
and doc_date = $3`,
      [createGstWithItc.slice(1), billNo, billDt],
    );

        return res.status(200).json({
            data: expenseDetails,
            expenseVoucher: {
                trans_amt: parseFloat(trans_amt.toFixed(2)),
                party_amt : parseFloat(trans_amt.toFixed(2)),
                ...getGstNo.rows[0],
                gst_id: gstIdResult.rows[0]?.gst_id || null,
            }
        });

    } catch (err) {
        console.error('Error in createGstEntries:', err);
        res.status(500).json({ message: err.message || "Internal Server Error" });
    }
});

// create Tds Entry
exports.createTdsEntries = catchAsync(async (req, res, next) => {
    let {
        voucher_dt,
        bill_no,
        bill_dt,
        srl_no,
        party_code,
        amount,
        acc_no,
        pay_rec,
        pur_code,
        cost_centr,
         cost,
        voucher_id,
        } = req.body;


    let getUniqueVoucherId = Date.now()
    if(!voucher_id){
        voucher_id = Number(getUniqueVoucherId)
    }
    //todo do uncomment it
    // console.log(acc_no, party_code, voucher_dt)
    try {
    //     const isExpWithPartyExist = await db.query(`
    //         select 'Y' from mofmtds
    //             where acc_no = $1
    //             and v_code = $2
    //             AND eff_date =
    //                         (SELECT MAX(eff_date)
    //                             FROM integral.mofmtds d
    //                         WHERE acc_no = $1
    //                             AND v_code = $2
    //                             AND eff_date <= $3::date)
    //         `,[acc_no, party_code, voucher_dt])
    //     console.log(isExpWithPartyExist.rows)
    //         if(isExpWithPartyExist.rowCount == 0){
    //             throw new Error('Cannot Create TDS For this Party with Entered Account Number')
    //         }

        const tdsEntries = await db.query(`call calc_tds_exp($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [voucher_id,voucher_dt,cost_centr, cost, pur_code, bill_no, bill_dt,srl_no, Number(amount), acc_no, party_code, Number(pay_rec)]
        );
        
        console.log(tdsEntries.rows);

        const getTdsEntries = await db.query('select * from tdfmtran_temp_tds where voucher_id = $1',[voucher_id])
        if(getTdsEntries.rowCount == 0){
            throw new Error('No TDS Entries created')
        }
        const deleteTdsEntries = await db.query('delete from tdfmtran_temp_tds where voucher_id = $1',[voucher_id])
        return res.status(200).json({type: 'created', data:getTdsEntries.rows||[]})

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || `Server error while creating TDS entries.`,
            type: 'error',
            data:[]
        });
    }
});

const partyGstDetail = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT WHETHER_GST_REGISTERED_DLR, gst_no FROM ${TABLE_NAMES.VENDOR_MASTER_TABLE} WHERE V_CODE = SUBSTR($1, 2);`,
            [req.query.get_gst]
        );
        if (result.rows.length) {
            res.send({ type: "found", ...result.rows[0] });
        } else {
            res.send({ type: "not found" });
        }
    } catch (err) {
        console.error(err);
    }
};

// submit logic
const submitExpenseVoucher = async (req, res) => {
  const { expenseVoucher, expenseDetails, procInsertContra } = req.body;
  const { userId, form_status } = req?.query;

  if (form_status !== 'Insert') {
    return res.status(400).json({ type: 'error', message: `formStatus should be ${form_status}` });
  }

  const { bill_no, bill_dt, trans_type, pay_rec, party_code } = expenseVoucher;
  let voucherNo, voucherId, voucherDt = expenseVoucher.voucher_dt;

  if (!expenseVoucher || !expenseDetails || !procInsertContra) {
    return res.status(400).json({ type: 'error', message: "Please fill all the details" });
  }

  try {
    await db.query('BEGIN');

    // Generate Voucher No
    const getVoucherNo = await db.query(
      `SELECT ${TABLE_NAMES.GENERATE_VOUCHER_NO}($1,$2,$3,$4,$5)`,
      [parseInt(expenseVoucher.division_id), expenseVoucher.sect, "C", "P", expenseVoucher.voucher_dt]
    );

    voucherNo = getVoucherNo.rows[0].gen_voucher_sect;

    // Generate Voucher ID
    const getVoucherId = await db.query(`SELECT nextval('integral.s_thfmtran_voucher_id')`);
    voucherId = getVoucherId.rows[0].nextval;

    // Use your utility transformation for master/header
    const expenseVchrHead = transformMasterToDbData({
      ...expenseVoucher,
      voucher_id: voucherId,
      voucher_no: voucherNo,
      create_id: userId
    });

    // Insert expense header
    const insertHeaderQuery = generateSingleInsertQuery(TABLE_NAMES.EXPENSE_HEAD_TABLE, expenseVchrHead, 'create_date');
    await db.query(insertHeaderQuery, Object.values(expenseVchrHead));

    // Use your utility transformation for expense narration/details
    const expenseDetailRecords = transformNarrationToDbData(expenseDetails, voucherId, {
      ...expenseVoucher,
      voucher_no: voucherNo,
      voucher_dt: voucherDt
    });

    for (const expDetail of expenseDetailRecords) {
      const insertDetailQuery = generateSingleInsertQuery(TABLE_NAMES.EXPENSE_DETAIL_TABLE, expDetail, 'create_date');
      await db.query(insertDetailQuery, Object.values(expDetail));
    }

    // Call stored procedure to insert contra entry
    await db.query('CALL integral.proc_insert_contra_expbill($1, $2)', [voucherId, party_code]);

    await db.query('COMMIT');
    
      res.status(200).send({
      type: "success",
      message: "record successfully saved",
      gen_voucher_no: voucherNo,
    });
  } catch (error) {
    console.error(error);
    await db.query('ROLLBACK');
    return res.status(400).json({ type: 'error', message: error.message || 'internal server error' });
  }
};

exports.handleUpdateData= catchAsync(async(req, res, next)=>{

    const {deletedExpEntries, newExpEntries, updatedExpEntries, updatedExpHdr, expMasterData } = req?.body
    let voucher_id = updatedExpHdr.voucher_id
    delete updatedExpHdr.voucher_id
    if(!deletedExpEntries.length && !newExpEntries.length && !updatedExpEntries.length && !Object.keys(updatedExpHdr)){
        return res.status(400).json({type:'error', message:'No update data Found! Please update the data'})
    }


    try {
        await db.query('begin')

        if(Object.keys(updatedExpHdr).length && voucher_id){
            const columns = Object.keys(updatedExpHdr);
            const values = Object.values(updatedExpHdr);

            // Create SET clause for SQL UPDATE query
            const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(", ");

            // Generate the full SQL query
            const query = `UPDATE ${TABLE_NAMES.EXPENSE_HEAD_TABLE} SET ${setClause}
             WHERE voucher_id = $${columns.length + 1}`;

             await db.query(query, [...values, voucher_id]); 
        }


        // 2. Delete entries
        for (const entry of deletedExpEntries) {
            if (entry.srl_no) {
            await db.query(
                `DELETE FROM ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} WHERE voucher_id = $1 and srl_no = $2`,
                [voucher_id, entry.srl_no]
            );
            }
        }

        // 3. Insert new entries
        // for (const entry of newExpEntries) {
        //     const columns = Object.keys(entry);
        //     const values = Object.values(entry);
        //     const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
        //     const insertQuery = `INSERT INTO ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} (${columns.join(
        //     ', '
        //     )}) VALUES (${placeholders})`;
    
        //     await db.query(insertQuery, values);
        // }
        for (const [index, record] of newExpEntries.entries()) {
            let getMaxSrlNo = await db.query(`select max(srl_no) from tdfmtran where voucher_id = $1`,[voucher_id])
            getMaxSrlNo = getMaxSrlNo.rows[0].max
            let expenseVchrDetail = transformExpVchrDetailForInsert({
                ...record,
                voucher_id: voucher_id,
                vch_no: expMasterData?.voucher_no,
                vch_dt:expMasterData.voucher_dt,
                tran_year:expMasterData.trans_year,
                tran_type: expMasterData.trans_type,
                pay_rec:expMasterData.pay_rec, 
                bill_no:expMasterData.bill_no,
                bill_dt:expMasterData.bill_dt,
                srl_no:getMaxSrlNo + 1,
                // create_id:userId
            });
            // console.log("expense Details: ", expenseVchrDetail);
            try {
                const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.EXPENSE_DETAIL_TABLE, expenseVchrDetail);

                const valuesForInsertQuery = Object.values(expenseVchrDetail);
                // console.log("exp detail query", queryForInsert);
                // console.log("exp detail insert query", valuesForInsertQuery);
                //todo:  Insert record one by one
                await db.query(queryForInsert, [...valuesForInsertQuery]);
            } catch (error) {
                // Handle individual record insert error
                console.error(`Error inserting record at index ${index}:`, error);
                throw Error(error);
            }
        }
  
        // 4. Update modified entries
        for (const entry of updatedExpEntries) {
            delete entry?.acc_desc
            delete entry?.cost
            delete entry?.cost_desc
            delete entry?.cost_pre
            delete entry?.entry_type
            const { srl_no, ...data } = entry;
            const columns = Object.keys(data);
            const values = Object.values(data);
            const setClause = columns
            .map((column, index) => `${column} = $${index + 1}`)
            .join(', ');
    
            const updateQuery = `UPDATE ${TABLE_NAMES.EXPENSE_DETAIL_TABLE} SET ${setClause} WHERE srl_no = $${
            columns.length + 1} and voucher_id=$${columns.length + 2}`;
    
            await db.query(updateQuery, [...values, srl_no, voucher_id]);
        }

        // update CONTRA ENTRY 
        const insertContraEntry =await db.query('CALL proc_insert_contra_expbill($1, $2)',[voucher_id, expMasterData?.party_code])


            //updating ser_party_cd
          await db.query('CALL integral.update_party_acc_in_vchrs($1)', [voucher_id]);

        await db.query('commit')
        return res.status(200).json({type:'success', message:'Record successfuly saved'})
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        return res.status(400).json({type:'error', message:error.message||'Internal Server Error'});
    }

})

// validating field value
const validateInputField = async (req, res) => {
    try {
        if (req?.query?.party_code && req?.query?.divisionId && req?.query?.transYear) {
            let dataForClient = {};

            // Query for party details
            const partyData = await db.query(
                `SELECT acc_desc, acc_no FROM ${TABLE_NAMES.GLM_ACTIVE_CR_VIEW} V
                WHERE V.division_id = $1
                AND V.trans_year = $2
                AND V.acc_no = $3`,
                [req.query.divisionId, req.query.transYear, req.query.party_code]
            );

            if (partyData.rowCount !== 0) {
                // If party data is found, add it to the response object
                dataForClient.partyDetail = { ...partyData.rows[0] };

                // Query for GST details
                const gstDetail = await db.query(
                    `SELECT WHETHER_GST_REGISTERED_DLR, gst_no 
                    FROM ${TABLE_NAMES.VENDOR_MASTER_TABLE} 
                    WHERE V_CODE = SUBSTR($1, 2);`,
                    [req.query.party_code]
                );

                if (gstDetail.rows.length) {
                    // If GST details are found, add them to the response object
                    dataForClient.gstDetail = { ...gstDetail.rows[0] };
                }

                // Send the response with the party and GST details
                return res.status(200).send(dataForClient);
            }

            // If no party data is found, return 404 with an empty object
            return res.status(404).send({ dataForClient });
        } else {
            // If required query parameters are missing
            return res.status(400).send({ message: "Missing required query parameters" });
        }
    } catch (error) {
        // Handle any errors during the process
        console.error(error);
        return res.status(500).send({ message: "Server error", error: error.message });
    }
};

// VALIDATION ACC NO FIELD
const validateAccNo = async (req, res) => {
    const { acc_no, appFinYear:transYear, appDivisionId:divisionId, f_party_code } = req?.query;
    let acc_desc, empRelation;

    try {
        if(!acc_no){
            throw new Error('Acc No is not Provided!')
        }
        const cursorQuery = `SELECT acc_desc FROM vwglmactiveothers
            WHERE acc_no =$1 AND division_id = $2 AND trans_year = $3`

        const cursorQueryForEmpRln= `SELECT emp_relate FROM vwmdfmglm
            WHERE acc_no = $1 AND division_id = $2 AND trans_year = $3;`

        if (acc_no) {
            //if acc_no and party_code same then
            if (acc_no === f_party_code) {
                const accInGlmMH = await db.query(`SELECT acc_desc, cc_purpose FROM mhfmglm WHERE acc_no = $1`, [acc_no]);
                if (accInGlmMH.rows.length > 0) {
                    acc_desc = accInGlmMH.rows[0].acc_desc;
                    // ccPurpose = accInGlmMH.rows[0].cc_purpose
                }
            } else {
                const getAccDesc = await db.query(cursorQuery,  [acc_no, divisionId, transYear])
                if(getAccDesc.rowCount === 0){
                    const isFound = await db.query(`SELECT 'x' as cfound FROM vwglmactive
                        WHERE acc_no = $1 AND division_id = $2 AND trans_year =$3`,[acc_no, divisionId, transYear])
                        
                    if(isFound.rowCount){
                        cfound = isFound.rows[0].cfound
                        throw new Error(`Account Number exists but you cannot use here`)
                    }else{
                        throw new Error(`Account Number ${acc_no} not present in G/L Master.`)
                    }

                }else{
                  acc_desc = getAccDesc.rows[0].acc_desc;
                }
            }
        }

        //--------------------------- next block code from here
    
        // if select acc_no of CASH IN HAND then
        const accCashInHand = await db.query(`SELECT 'x' as cfound FROM mofmptax
                WHERE tax_code = $1 AND acc_no = $2;`, ["C1", acc_no]
        );
        if (accCashInHand.rowCount > 0) {
            throw new Error (`Cannot use Account Code of CASH IN HAND`)
        } else {
            // if select acc_no of CASH BANK CONTRA then
            const accCashBankContra = await db.query(`SELECT 'x' as cfound FROM mofmptax t
                    WHERE t.tax_code = $1 AND t.acc_no = $2`,["CBC", acc_no]
            );
            if (accCashBankContra.rows.length > 0) {
                throw new Error(`Cannot use Account Code of CASH BANK CONTRA`)
            }
        }
    


        const accEmpRelation = await db.query(cursorQueryForEmpRln,[acc_no, divisionId, transYear]);

        if (accEmpRelation.rows.length > 0) {
            empRelation = accEmpRelation.rows[0].emp_relate; // if it 'Y' then enable the emp Detail otherwise disabled
        } else {
            throw new Error(`Account Code does not exist.`)
        }

        const getCcPurpose = await db.query(`select cc_purpose from mhfmglm where acc_no = $1`,[acc_no])
        
        
        res.status(200).json({type:'found',
            data:{
                acc_no:acc_no,
                p_acc:acc_no,
                acc_desc: acc_desc,
                emp_rel: empRelation,
                cc_purpose: getCcPurpose.rows[0].cc_purpose,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: 'error', message: error.message});
    }
};

// VALIDATION COST CENTER FIELD
const validCostCentr = async (req, res) => {
    const { cost, f_accNo } = req?.query;
    try {
        if (!cost) {
            throw Error("Cost center Cannot be Blank");
        }
        if (!f_accNo) {
            throw Error("Acc Number Cannot be Blank");
        }

        const isCcPurposeRequired = await db.query(`select cc_purpose from mhfmglm where acc_no = $1`, [f_accNo]);
        if(!isCcPurposeRequired.rowCount){
            throw new Error(`Invalid Account No. ...Please Check`)
        }

        const ccPurpose = isCcPurposeRequired.rows[0].cc_purpose
        if(ccPurpose === 'N'){
           return res.status(200).json({ type:'found',
            data:{
                cost_desc: '',
                cost_pre :'',
                cost_centr: '',
                cost: '',
            }
            });
        }
        

        const isValidCostC = await db.query(`select description, code from vwcostc where prefix = $1`,[cost]);


        if (!isValidCostC.rowCount) {
            throw new Error(`Invalid Cost Centre...Please Check`);
        }

        if (isValidCostC.rows.length === 1) {
           return res.status(200).json({ type:'found',
                data:{
                    cost_desc: isValidCostC.rows[0].description,
                    cost_centr: isValidCostC.rows[0].code,
                    cost_pre:cost,
                }
            });
        }
        if(isValidCostC.rowCount>1){
            throw Error(`More than One Cost Centre defined for this...Please Check`)
        }

    } catch (error) {
        console.error(error.message);
        res.status(404).json({
            type: "error",
            message: error.message || "Internal server Error",
        });
    }
};

// VALIDATION PURPOSE
const validatePurCode = async (req, res) => {
    const { pur_code, f_accNo } = req?.query;
    try {
        if (!pur_code) {
            throw Error("Purpose cannot be blank...Please Check");
        }
        if (!f_accNo) {
            throw Error("Acc Number Cannot be Blank");
        }

        const isCcPurposeRequired = await db.query(`select cc_purpose from mhfmglm where acc_no = $1`, [f_accNo]);
        if(!isCcPurposeRequired.rowCount){
            throw new Error(`Invalid Account No. ...Please Check`)
        }

        const ccPurpose = isCcPurposeRequired.rows[0].cc_purpose
        if(ccPurpose === 'N'){
           return res.status(200).json({
            type:'found',
            data:{
                pur_code:'',
                pur:'',
            }
            });
        }

        return res.status(200).json({
            type:'found',
            data:{
                pur_code:pur_code,
                pur:pur_code,
            }
            });

    } catch (error) {
        console.error(error.message);
        res.status(404).json({
            type: "error",
            message: error.message || "Internal server Error",
        });
    }
};

//VALIDATION PARTY CODE
const validateParty = async (req, res) => {
    try {
        const { party_code:partyCode, appFinYear, appDivisionId } = req.query;

        // Validate input parameters
        if (!partyCode) {
            return res.status(400).json({ type: 'error', message: 'Party Code cannot be null' });
        }
        if (!appFinYear || !appDivisionId) {
            return res.status(400).json({ type: 'error', message: 'Necessary parameters not passed' });
        }

        // Check if party exists in vwGlmActiveCreditors
        const partyResult = await db.query(
            `SELECT SUBSTR(acc_desc, 1, 40) AS party_name 
             FROM vwGlmActiveCreditors 
             WHERE acc_no = $1 AND division_id = $2 AND trans_year = $3`,
            [partyCode, appDivisionId, appFinYear]
        );

        if (partyResult.rowCount === 0) {
            return res.status(404).json({ type: 'error', message: 'Party No. does not exist in G/L Master' });
        }

        // Prepare default response
        let resPayload = {
            type: 'found',
            data: {
                party_gst_no: '',
                gst_registered: 'N',
                party_name: partyResult.rows[0].party_name
            }
        };

        // Fetch GST details
        const gstResult = await db.query(
            `SELECT WHETHER_GST_REGISTERED_DLR AS gst_registered, gst_no AS party_gst_no 
             FROM MOMMVEND 
             WHERE V_CODE = SUBSTR($1, 2)`,
            [partyCode]
        );

        if (gstResult.rowCount > 0) {
            resPayload.data.party_gst_no = gstResult.rows[0].party_gst_no;
            resPayload.data.gst_registered = gstResult.rows[0].gst_registered;
        }

        // Success response
        res.status(200).json(resPayload);

    } catch (error) {
        console.error('Error in validateParty:', error);
        res.status(500).json({ type: 'error', message: 'Internal server error' });
    }
};

// VALIDATION WO NO
const validateWoNo = async (req, res)=>{
    try {
        const {wo_no, f_party_code, appDivisionId} = req?.query
        if(!wo_no){
            throw new Error('Wo_no is null, please select form help')
        }
        if(!f_party_code){
            throw new Error('For work Order No, Party Required?')
        }

        const getPoId = await db.query(`select po_id from mhmmpo
    	    where po_no = $1
    	    and v_code = substr($2, 2)
      	    and division_id = $3;`,[wo_no, f_party_code, appDivisionId]);
        
        if(!getPoId.rowCount){
            throw new Error('Invalid Work Order No.')
        }

        const checkPoType = await db.query(`SELECT funcpocategorytype($1) AS category`, [getPoId.rows[0].po_id]);
        
        // Extract the category from the result
        const category = checkPoType.rows[0]?.category;
        if (!['WO', 'WI', 'PS'].includes(category)) {
            throw new Error('Invalid Work Order No.');
        }

        const getTransTypeAndPoCat = await db.query(`select trans_code as trans_type, po_cat_prefix as po_cat
      	from mofmpcat c, mhmmpo p where c.po_cat_prefix = substr(po_no, 1, 2) and p.po_id = $1;`,[getPoId.rows[0].po_id])

        if(!getTransTypeAndPoCat.rowCount){
            throw new Error('Purchase Category Not Defined')
        }

        const getWoAmtinfo = await procwoamt(getPoId.rows[0].po_id)
        

        res.status(200).json({type:'found', data:{
            po_id:getPoId.rows[0].po_id,  
            ...getTransTypeAndPoCat.rows[0],
            ...getWoAmtinfo
        }})
    } catch (error) {
        console.error('Error in validateWoNo:', error);
        res.status(500).json({ type: 'error', message: error.message });
    }
}

// voucher authorization logic
exports.authorizedExpVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  let { posted, id, division_id, trans_year, trans_type, section, pay_rec, voucher_id } = vchrData;
  console.log(vchrData)
  // Temporarily hardcoded, as per your note
  division_id = Number(division_id);


  if (!voucher_id) {
    return res.status(400).json({ type: 'error', message: 'Missing voucher_id' });
  }

  try {
    await db.query('BEGIN');

    // // first checking the ref_dt exists in financial open year
    // const checkFinYearOpen = await db.query(` SELECT proc_lib_check_open_year_date($1, $2::date, $3, $4)`,[trans_year, ref_date,'FM', 'CV']);
   
    // if(!checkFinYearOpen?.rowCount){
    //   return res.status(400).json({type:'error',message:'Error while checking financial year open'})
    // }

    // const isFinanceYearOpen = checkFinYearOpen.rows[0]?.proc_lib_check_open_year_date

    // // if value is 'N'
    // if(isFinanceYearOpen == 'N'){
    //   return res.status(400).json({type:'error',message:'INVALID DATE OR YEAR CLOSED'})
    // }


    // Passed all checks – update to "posted"
    await db.query(`UPDATE thfmtran SET posted = $1, update_id = $2 WHERE voucher_id = $3`,
      [posted, id, voucher_id]
    );

    await db.query('commit');

    return res.status(200).json({
      type: 'success',
    //   voucher_no: voucher_no,
    //   voucher_dt: voucher_dt,
      message: 'Voucher authorized successfully.',
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error authorizing cash voucher:', error.message);
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  } 
});

// Voucher cancellation logic
exports.cancelExpVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  console.log("Voucher cancellation data:", vchrData);

  try {
    const { cancel, voucher_id, id } = vchrData || {};

    if (!voucher_id) {
      return res.status(400).json({
        type: 'error',
        message: 'Missing voucher_id in request data.',
      });
    }

    // Optional: Validate cancel value
    if (!['Y', 'N'].includes(cancel)) {
      return res.status(400).json({
        type: 'error',
        message: 'Invalid cancel value. Must be "Y" or "N".',
      });
    }

    // Optional: Validate user id
    if (!id) {
      return res.status(400).json({
        type: 'error',
        message: 'Missing user ID.',
      });
    }
    await db.query('begin')
    // Update both tables
    await db.query(
      `UPDATE thfmtran SET cancel = $1, update_id = $2 WHERE voucher_id = $3`,
      [cancel, id, voucher_id]
    );

    await db.query('commit')
    return res.status(200).json({
      type: 'success',
      message: cancel === 'Y' ? 'Voucher cancelled successfully.' : 'Voucher cancellation reverted successfully.',
    });

  } catch (error) {
    console.error('Error cancelling voucher:', error);
    await db.query('rollback')
    return res.status(500).json({
      type: 'error',
      message: error.message || 'Internal Server Error',
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getExpVchrDataOnQuery(req, res);
        return;
    }
    // if (req?.query?.get_data) {
    //     await getExpVchrDataOnQuery(req, res);
    //     return;
    // }
    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
	if(req?.query?.get_gst) {
		if(!req?.query?.get_gst){
			return next('party_code required')
		}
		await partyGstDetail(req, res);
        return;
	}
    // if(req?.query?.createGstWithItc){
    //     await createGstEnries(req, res);
    //     return;
    // }
    if(req?.query?.party_code){
        await validateInputField(req, res);
        return;
    }
    //todo i commented it as it call twicly here
    // if(req?.query?.acc_no){
    //     await validateAccNo(req, res);
    //     return;
    // }

});

exports.handlePost= catchAsync(async(req, res, next)=>{
 if(req?.query?.form_status && req?.query?.form_status ==='Insert'){
        await submitExpenseVoucher(req, res)
        return;
    }
})

exports.handleValidation = catchAsync(async (req, res, next) => {
    if (req.query?.party_code) {
        await validateParty(req, res);
        return;
    } else if (req.query?.wo_no) {
        await validateWoNo(req, res);
        return;
    } else if (req?.query?.acc_no) {
        await validateAccNo(req, res);
        return;
    } else if (req?.query?.cost) {
        await validCostCentr(req, res);
        return;
    }else if (req?.query?.pur_code) {
        await validatePurCode(req, res);
        return;
    }
});
