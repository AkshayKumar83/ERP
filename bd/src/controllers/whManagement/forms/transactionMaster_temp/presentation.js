exports.transformTransactionMasterToDbData = (data) => {

    return {
        trans_code: data.trans_code ,
        type: data.type,
        type_desc: data.type_desc || null,
        from_wc_id: data.from_wc_id ,
        to_wc_id: data.to_wc_id ,
        ok_rej: data.ok_rej,
        create_id: data.create_id || null,
        create_date: data.create_date || new Date(),
        update_id: data.update_id || null,
        update_date: data.update_date || new Date(),
        authorised_req: data.authorised_req || "N",
        receive_issue_flag: data.receive_issue_flag,
        prdn_dlvry_flag: data.prdn_dlvry_flag || "N",
        short_desc: data.short_desc || null,
        stock_transfer_flag: data.stock_transfer_flag || "N",
    };
};
