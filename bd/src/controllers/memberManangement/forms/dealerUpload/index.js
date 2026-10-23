const {pool, db} = require("../../../../config/dbConnection");
const { generateSingleInsertQuery } = require("../../../../utility/query");

// UPLOAD DEALERS INTO TEMP TABLE
const uploadDealers = async(req, res)=>{

    const {dealers} = req.body

    try {
        if(!dealers.length)
        throw new Error(`Data not uploaded or not having record in file`);

        // clean the table 
        await db.query(`delete from temp_moeddealer_upl`)

        await db.query('BEGIN')

            for (const [index, record] of dealers.entries()) {
                delete record['__empty']
                delete record['__empty_1']
                delete record['__empty_2']
                const queryForInsert = generateSingleInsertQuery(
                    'temp_moeddealer_upl',
                    // 'temp_upload_dealer_amit',
                    record
                );
                const valuesForInsertQuery = Object.values(record);
                // console.log(valuesForInsertQuery)
                await db.query(queryForInsert, valuesForInsertQuery);
            }
        const uplDealers = await db.query(`select * from temp_moeddealer_upl`)
        // const uplDealers = await db.query(`select * from temp_upload_dealer_amit`)
        
        await db.query('commit')
        res.status(201).json({type:'created', dealers:uplDealers.rows, count:uplDealers.rowCount})

    } catch (err) {
        console.error(err)
        await db.query('rollback')
        res.status(404).send({errMsg: err.message || 'Internal server error while uploading excel data into Database'})
    }
}

// UPLOAD DEALERS INTO MAIN TABLE
const uploadInMainDealer = async (req, res) => {
    try {
        await db.query('BEGIN');
        await db.query('CALL upload_dealer_main()');
        await db.query('COMMIT');

        const uplDealers = await db.query('SELECT * FROM moeddealer');

        res.status(201).json({
            type: 'created',
            dealers: uplDealers.rows,
            count: uplDealers.rowCount,
        });
    } catch (error) {
        console.error('Error:', error);
        await db.query('ROLLBACK');
        res.status(500).send({ errMsg: `Error: ${error.message}` });
    }
};

const deleteDataFromTempUpld = async(req,res)=>{
    try {
        await db.query('begin')
        const isDeleted = await db.query('delete from temp_moeddealer_upl')
        await db.query('commit')
        res.status(200).json({type:'success'})
    } catch (error) {
        res.status(500).send({ message: `Error: ${error.message}` });
    }
}



module.exports={uploadDealers, uploadInMainDealer, deleteDataFromTempUpld}