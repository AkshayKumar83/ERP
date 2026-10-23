exports.transformUserDataToDbData = (data) => {
  return {
    user_id: data.user_id, // NOT NULL
    login_name: data.login_name, // NOT NULL
    user_name: data.user_name, // NOT NULL
    dept_cd: data.dept_cd || null,
    auth_pers: data.auth_pers || null,
    type_user: data.type_user || null,
    is_group: data.is_group, // NOT NULL
    cy_flag: data.cy_flag || null,
    active: data.active || 'Y', // NOT NULL with default
    can_raise_pr: data.can_raise_pr || null,
    can_inspect_material: data.can_inspect_material || null,
    email_id: data.email_id || null,
    emp_cd: data.emp_cd || null,
    init_name: data.init_name || null,
    last_password_change: data.last_password_change || null,
    can_auth_proj_list: data.can_auth_proj_list || 'N',
    can_change_project_code: data.can_change_project_code || 'N',
    allow_dashboard_access: data.allow_dashboard_access || 'N',
    allow_erp_access_over_cloud: data.allow_erp_access_over_cloud || 'N',
    can_update_dashboard_data: data.can_update_dashboard_data || 'N',
    auto_authorise_po: data.auto_authorise_po || 'N',
    can_auth_line_rej: data.can_auth_line_rej || 'N',
    can_auth_scrap_rej: data.can_auth_scrap_rej || 'N',
    is_time_keeper: data.is_time_keeper || 'N',
    can_del_rep_in_so: data.can_del_rep_in_so || 'N',
    create_dt: data.create_dt || null,
    update_dt: data.update_dt || null,
    allow_sanctning_leave_thr_sms: data.allow_sanctning_leave_thr_sms || 'N',
    user_password: data.user_password || null,
    admin_report_to: data.admin_report_to || null,
    user_current_login_ip: data.user_current_login_ip || null,
    encryptd_pwd: data.encryptd_pwd || null,
    create_id: data.create_id || null,
    update_id: data.update_id || null,
    can_gen_bank_transfr_csv: data.can_gen_bank_transfr_csv || 'N',
    allow_emp_portal_access: data.allow_emp_portal_access || 'Y',
    process_mis_invtry: data.process_mis_invtry || 'N',
    create_auto_travel_jv: data.create_auto_travel_jv || 'N',
    allow_upd_in_final_route: data.allow_upd_in_final_route || 'N',
    otp: data.otp || null,
  };
};
