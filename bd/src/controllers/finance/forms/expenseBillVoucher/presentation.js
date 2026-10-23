const {
    toIntOrNull,
    toDate,
    toNumber,
  } = require("../../../../utility/query");


const procInsertContraEntry = (contraEntry = {})=>{
    if(!contraEntry){
        throw new Error('contra entry found empty')
        return;
    }
    let rem =` 'Party ${contraEntry.party_code}, Bill No. - ${contraEntry.bill_no}, Dated - ${contraEntry.bill_dt}`
    let procInsertContraEntry = {...contraEntry, remarks:rem}
    delete procInsertContraEntry?.party_amt
    const updatedContraEntry = convertEmptyStringToNull(procInsertContraEntry)

    return updatedContraEntry;
} 

function removeKeysFromObject(obj, keysToRemove) {
    let newObj = { ...obj };

    if (Array.isArray(keysToRemove)) {
        keysToRemove.forEach((key) => {
            delete newObj[key];
        });
    } else if (typeof keysToRemove === "string") {
        delete newObj[keysToRemove];
    }
    return newObj;
}

function convertEmptyStringToNull(obj) {
    let newObj = {...obj}
    for (const key in newObj) {
      if (newObj.hasOwnProperty(key) && newObj[key] === '') {
        newObj[key] = null;
      }
    }
    console.log('inside make null funciotn', newObj)
    return newObj
  }

const transformExpVchrForInsert = (formData = {}) => {
    const expenseVoucher = { ...formData };
    const keysForRemove = [
        "party_desc",
        "party_name",
        "party_gst_no",
        "gst_registered",
        "exp_work",
        "party_code",
        "party_amt",
        "section",
        "sect",
        "wo_no",
        "wo_amt",
        "wo_bal_amt",
        "row_status",
        'party_gst_no',
        'gst_registered',
        "cons_ctrl_no",
        'itc_ref',
        'disp_party',
        'bill_date',
        'pur',
        'p_acc'
    ];

    const updatedExpVchr = convertEmptyStringToNull(expenseVoucher)
    const readyForInsertExpVchr = removeKeysFromObject(updatedExpVchr, keysForRemove);
    console.log('thfmtran from insde transformExpVchrForInsert :', readyForInsertExpVchr)
    return readyForInsertExpVchr;
};

const transformExpVchrDetailForInsert = (formData = {}) => {
    const expenseVoucherDetail = { ...formData };
    const keysForRemove = [
        "cost",
        "cost_desc",
        "cost_pre",
        "acc_desc",
        "sr_no",
        "credit_date",
        "sa_code",
        'old_amount',
        'emp_name',
        'row_status',
        'party_desc',
        'service_cat',
        'party_amt',
        'net_amt',
        'emp_rel',
        'cc_purpose',
        'row_id',
        'row_num',
        'pur',
        'p_acc',
        'entry_type'

    ];
    const updateExpVchrDetail =  convertEmptyStringToNull(expenseVoucherDetail)
    const readyForInsertExpVchrDetail = removeKeysFromObject(updateExpVchrDetail, keysForRemove)
    return readyForInsertExpVchrDetail
};


  const transformMasterToDbData = (row) => {
    return {
      voucher_id: toNumber(row.voucher_id),
      division_id: toIntOrNull(row.division_id) ?? 1,
      trans_year: row.trans_year,
      trans_type: row.trans_type || "P0",
      voucher_no: row.voucher_no,
      voucher_dt: toDate(row.voucher_dt),
      curr_code: row.curr_code || "INR",
      exchang_rt: toNumber(row.exchang_rt) ?? 1,
      pay_rec: toIntOrNull(row.pay_rec),
      on_acc: row.on_acc || "N",
      memo_vchr: row.memo_vchr || "N",
      bill_no: row.bill_no || null,
      bill_dt: toDate(row.bill_dt),
      trans_amt: toNumber(row.trans_amt),
      cancel: row.cancel || "N",
      reference: row.reference || null,
      posted: row.posted || "N",
      print_vch: row.print_vch || "N",
      auth_id: toIntOrNull(row.auth_id),
      // create_id: toIntOrNull(row.create_id),
      // create_date: toDate(row.create_date),
      // update_id: toIntOrNull(row.update_id),
      // update_date: toDate(row.update_date),
      bill_id: toNumber(row.bill_id),
      po_cat: row.po_cat || null,
      po_id: toNumber(row.po_id),
      capital_flag: row.capital_flag || null,
      inv_type: row.inv_type || null,
      note_type: row.note_type || "VC",
      svr_tax_vch_id: toNumber(row.svr_tax_vch_id),
      not_exceed_flg: row.not_exceed_flg || "N",
      fund_trns_vch_id: toNumber(row.fund_trns_vch_id),
      bank_trnf_flg: row.bank_trnf_flg || "N",
      old_voucher_no: row.old_voucher_no || null,
      cash_ref_id: toNumber(row.cash_ref_id),
      ecs_flag: row.ecs_flag || "N",
      computrized_chq: row.computrized_chq || "N",
      cons_ctrl_id: toNumber(row.cons_ctrl_id),
      collection_flg: row.collection_flg || null,
      chq_acc_payee: row.chq_acc_payee || "N",
      oth_division_id: toIntOrNull(row.oth_division_id),
      e1_flag: row.e1_flag || "N",
      order_id: toNumber(row.order_id),
      due_date: toDate(row.due_date),
      excs_id: toNumber(row.excs_id),
      supp_cust_code_in_lr: row.supp_cust_code_in_lr || null,
      supp_cust_bill_no_in_lr: row.supp_cust_bill_no_in_lr || null,
      supp_cust_bill_dt_in_lr: toDate(row.supp_cust_bill_dt_in_lr),
      sal_enq_id: toNumber(row.sal_enq_id),
      gst_id: toNumber(row.gst_id),
      trans_id: toNumber(row.trans_id),
    };
  };
  
  
const transformNarrationToDbData = (narrationArray, voucher_id, masterData) => {
    return narrationArray.map((item,index) => ({
      voucher_id: toNumber(voucher_id),
      srl_no: toNumber(item.srl_no)?? index+1,
      acc_no: item.acc_no,
      pay_rec: toIntOrNull(item.pay_rec || masterData?.pay_rec),
      emp_cd: item.emp_cd || null,
      cost_centr: toIntOrNull(item.cost_centr),
      pur_code: toIntOrNull(item.pur_code),
      bill_no: masterData?.bill_no || item.bill_no || null,
      bill_dt: masterData?.bill_dt || toDate(item.bill_dt),
      chq_no: item.chq_no || null,
      chq_dt: toDate(item.chq_dt),
      amount: toNumber(item.amount),
      db_cr: item.db_cr,
      flag: item.flag || "N",
      remarks: item.remarks || null,
      posted: item.posted || "N",
      // create_id: toIntOrNull(item.create_id),
      // create_date: toDate(item.create_date),
      // update_id: toIntOrNull(item.update_id),
      // update_date: toDate(item.update_date),
      deposit_slip: item.deposit_slip || null,
      deposit_slip_dt: toDate(item.deposit_slip_dt),
      stat_id: toNumber(item.stat_id),
      reco_date: toDate(item.reco_date),
      reco_flag: item.reco_flag || null,
      tds_cr_amt: toNumber(item.tds_cr_amt),
      tds_perc: toNumber(item.tds_perc),
      tds_amt: toNumber(item.tds_amt),
      tds_sur_perc: toNumber(item.tds_sur_perc),
      tds_sur_amt: toNumber(item.tds_sur_amt),
      tds_chln_no: item.tds_chln_no || null,
      tds_chln_dt: toDate(item.tds_chln_dt),
      tds_bank: item.tds_bank || null,
      tel_no: item.tel_no || null,
      tds_debit_entry: item.tds_debit_entry || null,
      chq_in_favour: item.chq_in_favour || null,
      div_id: toIntOrNull(item.div_id) ?? 1,
      tran_year: item.tran_year || masterData.trans_year,
      vch_no: item.vch_no || masterData.voucher_no,
      vch_dt: toDate(item.vch_dt || masterData.voucher_dt),
      tran_type: item.tran_type || masterData.trans_type,
      ref_obj_qty: toNumber(item.ref_obj_qty),
      loan_id: toNumber(item.loan_id),
      ser_cr_amt: toNumber(item.ser_cr_amt),
      ser_party_cd: item.ser_party_cd || null,
      ser_flg: item.ser_flg || "N",
      tds_cess_perc: toNumber(item.tds_cess_perc),
      tds_cess_amt: toNumber(item.tds_cess_amt),
      srno_part2_dt: toDate(item.srno_part2_dt),
      register_type: item.register_type || null,
      srno_part2: toNumber(item.srno_part2),
      svr_tax_vch_id: toNumber(item.svr_tax_vch_id),
      tds_challan_id: toNumber(item.tds_challan_id),
      tds_party_acc: item.tds_party_acc || null,
      prn_chq_dt: toDate(item.prn_chq_dt),
      chq_prn_flag: item.chq_prn_flag || "N",
      ser_debit_entry: item.ser_debit_entry || "N",
      tds_hsc_perc: toNumber(item.tds_hsc_perc),
      tds_hsc_amt: toNumber(item.tds_hsc_amt),
      include_in_servtax: item.include_in_servtax || "N",
      prof_no: item.prof_no || null,
      prof_dt: toDate(item.prof_dt),
      cons_ctrl_id: toNumber(item.cons_ctrl_id),
      adjusted_in_sales_commission: item.adjusted_in_sales_commission || "N",
      oth_div_id: toIntOrNull(item.oth_div_id),
      bnk_grn_no: item.bnk_grn_no || null,
      bnk_grn_dt: toDate(item.bnk_grn_dt),
      exp_id: toNumber(item.exp_id),
    }));
  };



module.exports = {procInsertContraEntry, transformExpVchrForInsert, removeKeysFromObject, transformExpVchrDetailForInsert, transformMasterToDbData, transformNarrationToDbData}
