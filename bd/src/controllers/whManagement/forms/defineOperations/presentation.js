
exports.transformoperationToDbData = (data) =>{
    return {

        opn_id:data.opn_id,
        opn_desc:data.opn_desc,
        machin_based:data.machin_based,
        opn_dtl_desc:data.opn_dtl_desc || null,
        opn_stage_name: data.opn_stage_name,
        wc_id: data.wc_id || null,
        operation_no: data.operation_no,
        inspection_flag: data.inspection_flag || 'N',

    }
}




