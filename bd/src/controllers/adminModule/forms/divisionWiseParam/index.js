const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

let TABLE_NAMES = {
    DIV_WISE_PARAM: `MOITPARMDIV`,
};


      
// const getDivWiseParamDataOnQuery = async (req, res) => {    // optimize function
//     try {
//       const offset = parseInt(req.query.offset) || 0;
//       const getDataType = req?.query?.get_data;
  
//       let queryParameter = `ORDER BY division_id LIMIT 1 OFFSET ${offset}`;
//       let dataCount = 0;
  
//       switch (getDataType) {
//         case "First":
//         case "Query": {
//           const getCount = await db.query(`SELECT COUNT(*) FROM ${TABLE_NAMES.DIV_WISE_PARAM}`);
//           dataCount = Number(getCount.rows[0]?.count || 0);
//           break;
//         }
//         case "Last": {
//           queryParameter = "ORDER BY division_id DESC LIMIT 1";
//           break;
//         }
//       }
  
//       const getData = await db.query(`
//         SELECT * FROM ${TABLE_NAMES.DIV_WISE_PARAM} ${queryParameter}
//       `);
  
//          if (getData.rowCount === 0) {
//       return res.status(200).json({
//         type: "not_found",
//         message: "No data found",
//         totalCount: dataCount,
//         divWiseParam: null,
//       });
//     }
  
//       const row = getData.rows[0];
  
//       const [
//         getExciseGodownWcDescResult,
//         getFloorStockWcDescResult,
//         getServiceCellWcDesc,
//         getPartyWcDesc,
//         getReceivingStoreWcDesc,
//         getPrdnTransferToWcDesc,
//         getIncomingMatrejWcDesc,
//         getReworkWcDesc,
//         getTradingStoreDesc,
//       ] = await Promise.all([
//         db.query(`SELECT description AS excise_godown_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.excise_godown_wc_id]),
//         db.query(`SELECT description AS floor_stock_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.floor_stock_wc_id]),
//         db.query(`SELECT description AS service_cell_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.service_cell_wc_id]),
//         db.query(`SELECT description AS party_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.party_wc_id]),
//         db.query(`SELECT description AS receiving_store_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.receiving_store_wc_id]),
//         db.query(`SELECT description AS prdn_transfer_to_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.prdn_transfer_to_wc_id]),
//         db.query(`SELECT description AS incoming_matrej_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.incoming_matrej_wc_id]),
//         db.query(`SELECT description AS rework_wc_desc FROM mommwc WHERE wc_id = $1;`, [row.rework_wc_id]),
//         db.query(`SELECT description AS trading_store_desc FROM mommwc WHERE wc_id = $1;`, [row.trading_store]),
//       ]);
  
//       const exciseGodownWcDesc = getExciseGodownWcDescResult.rows[0]?.excise_godown_wc_desc || null;
//       const floorStockWcDesc = getFloorStockWcDescResult.rows[0]?.floor_stock_wc_desc || null;
//       const serviceCellWcDesc = getServiceCellWcDesc.rows[0]?.service_cell_wc_desc || null;
//       const partyWcDesc = getPartyWcDesc.rows[0]?.party_wc_desc || null;
//       const receivingStoreWcDesc = getReceivingStoreWcDesc.rows[0]?.receiving_store_wc_desc || null;
//       const prdnTransferToWcDesc = getPrdnTransferToWcDesc.rows[0]?.prdn_transfer_to_wc_desc || null;
//       const incomingMatrejWcDesc = getIncomingMatrejWcDesc.rows[0]?.incoming_matrej_wc_desc || null;
//       const reworkWcDesc = getReworkWcDesc.rows[0]?.rework_wc_desc || null;
//       const tradingStoreDesc = getTradingStoreDesc.rows[0]?.trading_store_desc || null;
  
//       return res.status(200).json({
//         type: "found",
//         divWiseParam: {
//           ...row,
//           excise_godown_wc_desc: exciseGodownWcDesc,
//           floor_stock_wc_desc: floorStockWcDesc,
//           service_cell_wc_desc: serviceCellWcDesc,
//           party_wc_desc: partyWcDesc,
//           receiving_store_wc_desc: receivingStoreWcDesc,
//           prdn_transfer_to_wc_desc: prdnTransferToWcDesc,
//           incoming_matrej_wc_desc: incomingMatrejWcDesc,
//           rework_wc_desc: reworkWcDesc,
//           trading_store_desc: tradingStoreDesc,
//         },
//         totalCount: dataCount,
//       });
  
//     } catch (error) {
//       console.error("Error in getdivWiseParamDataOnQuery:", error);
//       return res.status(500).json({ message: "Internal server error on query" });
//     }
//   };
  
  // this function is optimize

  const getDivWiseParamDataOnQuery = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const getDataType = req?.query?.get_data;

    let queryParameter = `ORDER BY division_id LIMIT 1 OFFSET ${offset}`;
    let dataCount = 0;

    switch (getDataType) {
      case "First":
      case "Query": {
        const getCount = await db.query(`SELECT COUNT(*) FROM ${TABLE_NAMES.DIV_WISE_PARAM}`);
        dataCount = Number(getCount.rows[0]?.count || 0);
        break;
      }
      case "Last": {
        queryParameter = "ORDER BY division_id DESC LIMIT 1";
        break;
      }
    }

    const getData = await db.query(`
      SELECT * FROM ${TABLE_NAMES.DIV_WISE_PARAM} ${queryParameter}
    `);

    if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found",
        totalCount: dataCount,
        divWiseParam: null,
      });
    }

    const row = getData.rows[0];

    // helper for null-safe desc
    const getDesc = (result, key) => result.rows[0]?.[key] || null;

    const [
      exciseRes,
      floorRes,
      serviceRes,
      partyRes,
      receivingRes,
      prdnRes,
      incomingRes,
      reworkRes,
      tradingRes,
    ] = await Promise.all([
      db.query(`SELECT description AS excise_godown_wc_desc FROM mommwc WHERE wc_id = $1`, [row.excise_godown_wc_id]),
      db.query(`SELECT description AS floor_stock_wc_desc FROM mommwc WHERE wc_id = $1`, [row.floor_stock_wc_id]),
      db.query(`SELECT description AS service_cell_wc_desc FROM mommwc WHERE wc_id = $1`, [row.service_cell_wc_id]),
      db.query(`SELECT description AS party_wc_desc FROM mommwc WHERE wc_id = $1`, [row.party_wc_id]),
      db.query(`SELECT description AS receiving_store_wc_desc FROM mommwc WHERE wc_id = $1`, [row.receiving_store_wc_id]),
      db.query(`SELECT description AS prdn_transfer_to_wc_desc FROM mommwc WHERE wc_id = $1`, [row.prdn_transfer_to_wc_id]),
      db.query(`SELECT description AS incoming_matrej_wc_desc FROM mommwc WHERE wc_id = $1`, [row.incoming_matrej_wc_id]),
      db.query(`SELECT description AS rework_wc_desc FROM mommwc WHERE wc_id = $1`, [row.rework_wc_id]),
      db.query(`SELECT description AS trading_store_desc FROM mommwc WHERE wc_id = $1`, [row.trading_store]),
    ]);

    return res.status(200).json({
      type: "found",
      divWiseParam: {
        ...row,
        excise_godown_wc_desc: getDesc(exciseRes, "excise_godown_wc_desc"),
        floor_stock_wc_desc: getDesc(floorRes, "floor_stock_wc_desc"),
        service_cell_wc_desc: getDesc(serviceRes, "service_cell_wc_desc"),
        party_wc_desc: getDesc(partyRes, "party_wc_desc"),
        receiving_store_wc_desc: getDesc(receivingRes, "receiving_store_wc_desc"),
        prdn_transfer_to_wc_desc: getDesc(prdnRes, "prdn_transfer_to_wc_desc"),
        incoming_matrej_wc_desc: getDesc(incomingRes, "incoming_matrej_wc_desc"),
        rework_wc_desc: getDesc(reworkRes, "rework_wc_desc"),
        trading_store_desc: getDesc(tradingRes, "trading_store_desc"),
      },
      totalCount: dataCount,
    });

  } catch (error) {
    console.error("Error in getDivWiseParamDataOnQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

  

exports.getFormBaseConstants = catchAsync(async (req, res, next) =>{

        const {appDivision} = req?.query
 
    const exciseList = await db.query(
       ` Select description, wc_id  from mommwc where store_process = 'S' and division_id = $1`
      ,[appDivision]);

    //   const floorList = await db.query(
    //   ` Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   );

    //   const serviceList = await db.query(
    //    ` Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   );

    //   const partyList = await db.query(
    //     ` Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   );

    //   const receiveList = await db.query(
    //     ` Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   );

    //   const productionList = await db.query(
    //     `Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   )
    //   const incomingMtrlList = await db.query(
    //     `Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   )
    //   const reworkList = await db.query(
    //     `Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   )
    //   const tradingList = await db.query(
    //     `Select description, wc_id from mommwc where store_process = 'S' and division_id = 1`
    //   )
    
       return res.status(200).json({
        excise: exciseList.rows,
        floor: exciseList.rows,
        party: exciseList.rows,
        service: exciseList.rows,
        receive: exciseList.rows,
        production: exciseList.rows,
        income: exciseList.rows,
        rework: exciseList.rows,
        trading: exciseList.rows,
       })
})


const updateFormData = async (req, res) => {
    try {
      await db.query('BEGIN');
  
      let { formData } = req.body;
      if (!formData || !formData.division_id) {
        return res.status(400).json({ message: "Invalid form data. 'division_id' is required." });
      }
  
      const divisionId = formData.division_id;
  
      // Remove division_id and filter out *_desc fields or non-DB fields
      const { division_id,auto_gen_item_cd_escorts, ...cleanData } = formData;
      delete cleanData?.auto_gen_item_cd_escorts
      
    const validEntries = Object.entries(cleanData)
  .filter(([key]) => !key.endsWith("_desc")) // filter out *_desc
  .map(([key, value]) => [key, value === "" ? null : value]); // convert "" to null
  
      if (validEntries.length === 0) {
        return res.status(400).json({ message: "No valid fields to update." });
      }
  
      const columns = validEntries.map(([key]) => key);
      const values = validEntries.map(([_, value]) => value);
  
      const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(", ");
      const query = `UPDATE ${TABLE_NAMES.DIV_WISE_PARAM} SET ${setClause} WHERE division_id = $${columns.length + 1}`;
  
      await db.query(query, [...values, divisionId]);
  
      await db.query('COMMIT');
  
      return res.status(200).json({type:"Seccess", message: "Record updated successfully" });
  
    } catch (error) {
      await db.query('ROLLBACK');
      console.error("Error updating Div Wise Param:", error);
      return res.status(500).json({
        type:"error",
        message: "Failed to update Div Wise Param",
        error: error.message,
      });
    }
  };
  


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (req?.query?.get_data) {
        await getDivWiseParamDataOnQuery(req, res);
        return;
    }
    res.status(400).json({ message: "Invalid request" });
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateFormData(req, res);
        return;
      } 
      
})