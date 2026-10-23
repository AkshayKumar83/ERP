const {pool, db} = require("../../../../config/dbConnection");
const { generateSingleInsertQuery } = require("../../../../utility/query");

// UPLOAD VOUCHERS INTO TEMP TABLE
const uploadVouchers = async(req, res)=>{
    const {vouchers} = req.body
    
    // try {
    //     if(!dealers.length)
    //     throw new Error(`Data not uploaded or not having record in file`);

    //     // clean the table 
    //     await db.query(`delete from temp_moeddealer_upl`)

    //     await db.query('BEGIN')

    //         for (const [index, record] of dealers.entries()) {
    //             const queryForInsert = generateSingleInsertQuery('temp_moeddealer_upl', record);
    //             const valuesForInsertQuery = Object.values(record);
    //             await db.query(queryForInsert, valuesForInsertQuery);
    //         }
    //     const uplDealers = await db.query(`select * from temp_moeddealer_upl`)
    //     await db.query('commit')
    //     res.status(201).json({type:'created', dealers:uplDealers.rows, count:uplDealers.rowCount})

    // } catch (err) {
    //     console.error(err)
    //     await db.query('rollback')
    //     res.status(404).send({errMsg: `Error: ${err}`})
    // }
}

// // UPLOAD DEALERS INTO MAIN TABLE
// const uploadInMainDealer = async (req, res) => {
//     try {
//         await db.query('BEGIN');
//         await db.query('CALL upload_dealer_main()');
//         await db.query('COMMIT');

//         const uplDealers = await db.query('SELECT * FROM moeddealer');

//         res.status(201).json({
//             type: 'created',
//             dealers: uplDealers.rows,
//             count: uplDealers.rowCount,
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         await db.query('ROLLBACK');
//         res.status(500).send({ errMsg: `Error: ${error.message}` });
//     }
// };



module.exports={uploadVouchers}
