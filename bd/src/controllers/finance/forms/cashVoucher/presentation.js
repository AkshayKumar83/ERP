// Added
exports.cashVoucherDataMapping = (data) => {
  let obj = {
    type_user: "pay_rec",
    reference_no: "ref_no",
    reference_dt: "ref_date",
    exchange_rate: "exchang_rt",
    onAccount: "on_acc",
    cur_code: "curr_code",
    ref: "reference"
  };

  let payload = {};
  Object.keys(data).forEach(key => {
    let parityKey = key, value = data[key];
    if (obj[key]) {
      parityKey = obj[key];
    };

    if (parityKey === "on_acc") {
      value = value ? "Y" : "N";
    }

    if (value !== undefined && value !== null) {
      payload[parityKey] = value;
    };
  });

  return payload;
};

// Added
exports.cashVoucherDetailDataMapping = data => {
  let obj = {
    type_user: "pay_rec",
    naration: "remarks",
    cost_ctr: "cost_centr",
    purpose_code: "pur_code",
    ref_cheque_no: "chq_no",
    party_cd: "ser_party_cd",
    ser_tax_flag: "ser_flag",
    ser_tax_credit_amt: "ser_cr_amt",
    service_tax: "flag",
    quantity: "ref_obj_qty"
  };

  let payload = {};
  Object.keys(data).forEach(key => {
    let parityKey = key, value = data[key];
    if (obj[key]) {
      parityKey = obj[key];
    };

    if (value !== undefined && value !== null) {
      payload[parityKey] = value;
    };
  });

  return payload;
};

// ref key change as well in below masterToDB and masterToAPI
exports.transformMasterToDbData = (data) => {
  return {
    division_id: data.division_id,
    trans_type: "C1",
    pay_rec: data.type_user,
    posted: "N",
    cancel: "N",
    print_vch: "N",
    ref_no: data?.reference_no,
    ref_date: data.reference_dt,
    curr_code: data.cur_code,
    exchang_rt: data.exchange_rate,
    voucher_dt: data?.voucher_dt,
    on_acc: data?.onAccount ? "Y" : "N",
    bill_dt: data?.bill_dt,
    reference: data?.ref || "",
    trans_amt: data?.trans_amt || data?.vch_amt,
    trans_year: data?.trans_year,
    ref_id: data?.ref_id || 0,
  };
};

exports.transformNarrationToDbData = (data = [], ref_id, masterData = {}) => {
  return data.map((nar, index) => {
    return {
      ref_id: ref_id || 0,
      srl_no: index + 1, //index of array and increase everytime
      //   pay_rec: nar.naration,
      pay_rec: masterData?.type_user || 0, //We can make as header pay rec
      remarks: nar.naration,
      acc_no: nar.acc_no,
      cost_centr: nar.cost_ctr,
      pur_code: nar.purpose_code, //"5219", //nar.purpose,
      bill_no: nar.bill_no,
      bill_dt: nar.bill_dt,
      amount: nar.amount,
      db_cr: nar.db_cr,
      emp_cd: nar.emp_cd,
      chq_no: nar.ref_cheque_no,
      ser_party_cd: nar.party_cd ,
      //   ser_flag: nar.ser_tax_flag,
      ser_flg: "N",
      ser_cr_amt: nar.ser_tax_credit_amt || 1,
      flag: nar.service_tax == true ? 'Y':"N",
      ref_obj_qty: nar.quantity || 2,
    };
    // {"total_Amt":"1000"}
  });
};

exports.transformMasterToAPIData = (data) => {
  return {
    division: data?.division_id,
    section: 2,
    type_user: String(data?.pay_rec),
    reference_no: data?.ref_no,
    reference_dt: data?.ref_date,
    cur_code: data?.curr_code,
    exchange_rate: parseFloat(data?.exchang_rt).toFixed(2),
    voucher_no: data?.voucher_no || '',
    voucher_dt: data?.voucher_dt,
    onAccount: data?.on_acc == "Y",
    bill_dt: data?.bill_dt,
    ref: data?.reference || "",
    vch_amt: data?.trans_amt,
    trans_amt: data?.trans_amt,
    trans_year: data?.trans_year,
    ref_id: data?.ref_id || 0,
    // same as transformMasterToDbData
    trans_type: "C1",
    posted: data?.posted || 'N',
    cancel: data?.cancel || 'N',
    print_vch: "N",
    curr_bal: 100,
    curr_bal_dbcr: "D"
  };
};

exports.transformNarrationToAPIData = (data = []) => {
  return data.map((nar, index) => {
    return {
      // added
      ref_id: nar.ref_id,
      naration: nar.remarks,
      sno: nar.srl_no || index + 1,
      acc_no: nar.acc_no,
      acc_desc: nar.acc_desc,
      cost_ctr: nar.cost_centr,
      cost_center: nar.cost_center,
      purpose_code: nar.pur_code,
      purpose: nar.purpose,
      // purpose: nar.pur_code, // have to bind relation for this
      bill_no: nar.bill_no,
      bill_dt: nar.bill_dt,
      amount: nar.amount,
      db_cr: nar.db_cr,
      emp_cd: nar.emp_cd,
      emp_name: nar.emp_name,
      ref_cheque_no: nar.chq_no,
      party_cd: nar.ser_party_cd,
      ser_tax_flag: nar.ser_flag,
      ser_tax_credit_amt: nar.ser_cr_amt,
      service_tax: nar.flag,
      quantity: nar.ref_obj_qty,
    };
  });
};
