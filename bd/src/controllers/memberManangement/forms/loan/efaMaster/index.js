const {db} = require("../../../../../config/dbConnection");
const catchAsync = require("../../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../../utility/query");

const TABLE_NAMES = {
    EFA_MASTER: "mhedloan",
};

const getDataOnQuery = async (req, res) => {
    try {
        const query = await db.query(`SELECT * from ${TABLE_NAMES.EFA_MASTER}`);

        if(!query.rows.length){
            res.status(200).json({type:'not found', efaDetailData:[]})
        }

        await Promise.all(
            query.rows.map(async (item) => {
                    const acc_desc = await db.query(
                        `SELECT * FROM integral.vwGlmActiveOthers WHERE acc_no = $1`,
                        [item.acc_no]
                    );
                    if (acc_desc.rows.length > 0) {
                        item.acc_desc = acc_desc.rows[0].acc_desc;
                    }
                })
            );

        res.status(200).json({type:'found', efaDetailData:[...query.rows]})
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: `Internal server error on query ${error.message}` });
    }
};

const getHelpData = async (req, res) => {
    try {
        const { help_list, form_status, appDivisionId, appFinYear } = req?.query
        if(help_list === 'acc_no'){
            const getAccNoList = await db.query(`
                Select acc_desc, acc_no from vwmdfmglm  
                    where division_id = $1 and trans_year = $2
                    order by 1
                `,[appDivisionId, appFinYear])

            if (getAccNoList.rows.length > 0) {
                res.status(200).json(getAccNoList.rows);
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message:`${error.message}` || 'Internal Server Error' });
    }
}


exports.handlePostFormData = catchAsync(async(req, res, next)=>{
    console.log(req.body)
    const {newRecord}= req.body

    try {
        await db.query('begin')

        if(!newRecord.length){
            return res.status(400).json({type:'error', message:'No new data found for submit'})
        }
        
        for (const [index, record] of newRecord.entries()) {
            let recordDetail = {...record}
            delete recordDetail.row_id
            delete recordDetail.acc_desc
            console.log(recordDetail)
    
            const getSequenceNo = await db.query(`SELECT nextval('integral.mhedloan_loan_id_seq')`)
            const loanId = getSequenceNo.rows[0].nextval; 
    
            // set the generated loan_id
            recordDetail.loan_id = loanId
            
            try {
                const queryForInsert = generateSingleInsertQuery( TABLE_NAMES.EFA_MASTER, recordDetail);
    
                const valuesForInsertQuery = Object.values(recordDetail);
                console.log("exp detail query", queryForInsert);
                console.log("exp detail insert query", valuesForInsertQuery);
                //todo:  Insert record one by one
                await db.query(queryForInsert, [...valuesForInsertQuery]);
            } catch (error) {
                // Handle individual record insert error
                console.error(`Error inserting record at index ${index}:`, error);
                throw Error(error);
            }
        }

        return res.status(200).json({type:'success', data:[]})
    } catch (error) {
        await db.query('Rollback')
        console.error(error)
    }
    

  
})

exports.handleUpdateFormData = catchAsync(async (req, res, next) => {
    const { newEfaData = [], updatedEfaData = [], deletedEfaData = [] } = req.body;

    try {
        await db.query("BEGIN");

        // DELETE
        for (const delRow of deletedEfaData) {
            const loan_id = delRow.loan_id;
            if (loan_id) {
                await db.query(`DELETE FROM ${TABLE_NAMES.EFA_MASTER} WHERE loan_id = $1`, [loan_id]);
            }
        }

        // UPDATE
        for (const updateRow of updatedEfaData) {
            const { loan_id, acc_desc, ...fieldsToUpdate } = updateRow;
            if (!loan_id) continue;

            const keys = Object.keys(fieldsToUpdate);
            const values = Object.values(fieldsToUpdate);

            const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
            const query = `UPDATE ${TABLE_NAMES.EFA_MASTER} SET ${setClause} WHERE loan_id = $${keys.length + 1}`;

            await db.query(query, [...values, loan_id]);
        }

        // INSERT
        for (const newRow of newEfaData) {
            let recordDetail = { ...newRow };
            delete recordDetail.row_id;
            delete recordDetail.acc_desc;

            const getSequenceNo = await db.query(`SELECT nextval('integral.mhedloan_loan_id_seq')`);
            const loanId = getSequenceNo.rows[0].nextval;

            recordDetail.loan_id = loanId;

            const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.EFA_MASTER, recordDetail);
            const valuesForInsertQuery = Object.values(recordDetail);

            await db.query(queryForInsert, valuesForInsertQuery);
        }

        await db.query("COMMIT");
        return res.status(200).json({ type: "success", message: "Data updated successfully" });

    } catch (error) {
        await db.query("ROLLBACK");
        console.error("Transaction error:", error);
        return res.status(500).json({ type: "error", message: error.message || "Something went wrong!" });
    }
});


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getDataOnQuery(req, res);
        return;
    }
    if(req?.query?.help_list){
        await getHelpData(req, res);
        return;
    }
});