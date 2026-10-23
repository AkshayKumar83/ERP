exports.transBulkPoCreationToDbData = (data, user) => {
  return {
    v_code: data.v_code, 
    it_code: data.it_code,
    // rate: data.rate ,
    // qty:data.qty,
    ship_to:data.ship_to,
    po_id:data.po_id || null,
    po_no:data.po_no || null,
    po_date:data.po_date,
    eff_date:data.eff_date || null,
    // receipt_qty:data.receipt_qty,
    rate: data.rate ? Number(data.rate) : null,
   qty: data.qty ? Number(data.qty) : null,
    receipt_qty: data.receipt_qty ? Number(data.receipt_qty) : null,
    po_closer:data.po_closer || "N",
    advice:data.advice  || "N"
    


  };
};