exports.transformMasterToDbData = (data) => {

    return{
        cr_acc_no: data.cr_acc_no,
        dr_acc_no: data.dr_acc_no,
        brand_code: data.brand_code,
    }
}