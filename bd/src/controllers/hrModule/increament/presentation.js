

// const toSmallInt = (v) => {
//   if (v === "" || v === undefined || v === null) return null;
//   return Number(v);
// };
  

const toSmallInt = (v) =>
  v === "" || v === undefined || v === null ? null : Number(v);

const toNumber = (v) =>
  v === "" || v === undefined || v === null ? null : Number(v);





// Map JS object -> DB insert/update payload for integral.tdpmincr  


// exports.transToTdpmincrDbData = (data) => {
//   return {
//     emp_score_cd:      data.emp_score_cd ?? null,
//     emp_cd:            data.emp_cd || null,
//     eff_date:          data.eff_date || null,
//     desgn:             data.desgn ?? null,
//     grade_cd:          data.grade_cd ?? null,
//     basic:             data.basic ?? null,
//     old_basic:         data.old_basic ?? null,
//     increament:        data.increament || null,
//     increament_amt:    data.increament_amt ?? null,
//     rating_cd:         toSmallInt(data.rating_cd) ?? null,
//     perf_award_amt:    data.perf_award_amt ?? null,
//     exgratia_amt:      data.exgratia_amt ?? null,
//     adjustment_amt:    data.adjustment_amt ?? null,
//     category:          data.category ?? null,
//     update_in_month:   toSmallInt(data.update_in_month) ?? null,
//     create_id:         data.create_id ?? null,
//     create_date:       data.create_date || null,
//     update_id:         data.update_id ?? null,
//     update_date:       data.update_date || null,
//   };
// };   

exports.transToTdpmincrDbData = (data) => {
  return {
    emp_score_cd:    toSmallInt(data.emp_score_cd),
    emp_cd:          data.emp_cd || null,
    eff_date:        data.eff_date || null,
    desgn:           data.desgn || null,

    grade_cd:        toSmallInt(data.grade_cd),
    basic:           toNumber(data.basic),
    old_basic:       toNumber(data.old_basic),

    increament:      data.increament || null,
    increament_amt:  toNumber(data.increament_amt),

    rating_cd:       toSmallInt(data.rating_cd),
    perf_award_amt:  toNumber(data.perf_award_amt),
    exgratia_amt:    toNumber(data.exgratia_amt),
    adjustment_amt:  toNumber(data.adjustment_amt),

    category:        toSmallInt(data.category),
    update_in_month: toSmallInt(data.update_in_month),

    create_id:       toSmallInt(data.create_id),
    create_date:     data.create_date || null,

    update_id:       toSmallInt(data.update_id),
    update_date:     data.update_date || null,
  };
};


// Map JS object -> DB insert/update payload for integral.mhpmempm
exports.transToMhpmempmDbData = (data) => {
  return {
    division_id:          data.division_id ?? null,
    location_id:          data.location_id ?? null,
    emp_cd:               data.emp_cd || null,
    emp_name:             data.emp_name || null,
    religion:             data.religion ?? null,
    probcon:              data.probcon ?? null,
    sex:                  data.sex || null,
    marital_st:           data.marital_st ?? null,
    reserve_category:     data.reserve_category ?? null,
    guardian:             data.guardian || null,
    guardian_occupation:  data.guardian_occupation || null,
    nominee:              data.nominee || null,
    dob:                  data.dob || null,
    actual_dob:           data.actual_dob || null,
    birth_place:          data.birth_place || null,
    birth_district:       data.birth_district || null,
    birth_state:          data.birth_state ?? null,
    doj:                  data.doj || null,
    dor:                  data.dor || null,
    doc:                  data.doc || null,
    height:               data.height ?? null,
    weight:               data.weight ?? null,
    pr_add1:              data.pr_add1 || null,
    pr_add2:              data.pr_add2 || null,
    pr_add3:              data.pr_add3 || null,
    pr_city:              data.pr_city || null,
    pr_state:             data.pr_state ?? null,
    pr_pincode:           data.pr_pincode || null,
    pr_phone:             data.pr_phone || null,
    pr_phone1:            data.pr_phone1 || null,
    pm_add1:              data.pm_add1 || null,
    pm_add2:              data.pm_add2 || null,
    pm_add3:              data.pm_add3 || null,
    pm_city:              data.pm_city || null,
    pm_state:             data.pm_state ?? null,
    pm_pincode:           data.pm_pincode || null,
    pm_phone:             data.pm_phone || null,
    pm_phone1:            data.pm_phone1 || null,
    emergency_address:    data.emergency_address || null,
    emergency_phone:      data.emergency_phone || null,
    emer_cont_pers:       data.emer_cont_pers || null,
    addemer_cont_no:      data.addemer_cont_no || null,
    refrence1:            data.refrence1 || null,
    refrence2:            data.refrence2 || null,
    p_grade:              data.p_grade ?? null,
    p_desig:              data.p_desig ?? null,
    p_category:           data.p_category ?? null,
    p_basic:              data.p_basic ?? null,
    p_da:                 data.p_da ?? null,
    p_dept:               data.p_dept || null,
    p_dept_wef:           data.p_dept_wef || null,
    p_dept_head:          data.p_dept_head || null,
    p_report_to:          data.p_report_to || null,
    j_grade:              data.j_grade || null,
    j_desig:              data.j_desig || null,
    j_category:           data.j_category || null,
    pfno:                 data.pfno || null,
    esino:                data.esino || null,
    uan_no:               data.uan_no || null,
    pension_no:           data.pension_no || null,
    bank_acc_no:          data.bank_acc_no || null,
    acc_no:               data.acc_no || null,
    ifsc_code:            data.ifsc_code || null,
    bank_details:         data.bank_details || null,
    cheque_mode:          data.cheque_mode || null,
    pan_no:               data.pan_no || null,
    aadhar_card_no:       data.aadhar_card_no || null,
    blood_grp:            data.blood_grp || null,
    identy_mrk:           data.identy_mrk || null,
    achievements:         data.achievements || null,
    goals:                data.goals || null,
    defence_training:     data.defence_training || null,
    social_activity:      data.social_activity || null,
    literary_activity:    data.literary_activity || null,
    major_illness:        data.major_illness || null,
    criminal_charges:     data.criminal_charges || null,
    employment_exchange_no: data.employment_exchange_no || null,
    emp_file_no:            data.emp_file_no || null,
    emp_card_no:            data.emp_card_no || null,
    cost_per_annum:       data.cost_per_annum ?? null,
    emp_itax_basic_ded:   data.emp_itax_basic_ded ?? null,
    emp_itax_surch_ded:   data.emp_itax_surch_ded ?? null,
    emp_itax_cess_ded:    data.emp_itax_cess_ded ?? null,
    date_left:            data.date_left || null,
    reason:               data.reason || null,
    date_of_expire:       data.date_of_expire || null,
    nationality:          data.nationality || null,
    union_member:         data.union_member || 'N',
    society_member:       data.society_member || null,
    super_anua_member:    data.super_anua_member || null,
    ff_death:             data.ff_death || null,
    emp_status:           data.emp_status || 'E',
    active:               data.active || 'Y',
    active_flag:          data.active_flag || 'Y',
    active_finance:       data.active_finance || null,
    daily_wages:          data.daily_wages || 'N',
    lease_ind:            data.lease_ind || null,
    lease_flag:           data.lease_flag || null,
    emp_contr:            data.emp_contr || 'C',
    contr_code:           data.contr_code || null,
    cost_centre:          data.cost_centre ?? 2022,
    mode_cd:              data.mode_cd || 'B',
    branch_flag:          data.branch_flag || null,
    field_staff_flag:     data.field_staff_flag || 'N',
    bus_id:               data.bus_id ?? null,
    bus_dest_desc:        data.bus_dest_desc || null,
    covered_4_ot:         data.covered_4_ot || 'N',
    covered_4_perc_ot:    data.covered_4_perc_ot || 'N',
    emp_first_name:       data.emp_first_name || null,
    emp_midle_name:       data.emp_midle_name || null,
    emp_last_name:        data.emp_last_name || null,
    father_first_name:    data.father_first_name || null,
    father_midle_name:    data.father_midle_name || null,
    father_last_name:     data.father_last_name || null,
    mother_first_name:    data.mother_first_name || null,
    mother_midle_name:    data.mother_midle_name || null,
    mother_last_name:     data.mother_last_name || null,
    e_fnm:                data.e_fnm || null,
    e_mnm:                data.e_mnm || null,
    e_lnm:                data.e_lnm || null,
    f_fnm:                data.f_fnm || null,
    f_mnm:                data.f_mnm || null,
    f_lnm:                data.f_lnm || null,
    m_fnm:                data.m_fnm || null,
    m_mnm:                data.m_mnm || null,
    m_lnm:                data.m_lnm || null,
    itax_add:             data.itax_add || null,
    email_id:             data.email_id || null,
    email_id_prsnl:       data.email_id_prsnl || null,
    fax:                  data.fax || null,
    create_id:            data.create_id ?? null,
    create_date:          data.create_date || null,
    update_id:            data.update_id ?? null,
    update_date:          data.update_date || null,
  };
};

