// Map a JS object -> DB insert/update payload for integral.mdmmstok_location
exports.transToMdmmstokLocationDbData = (data, userId) => {
  return {
    trans_year:      data.trans_year      || null,
    wc_id:           data.wc_id           || null,
    it_code:         data.it_code         || null,
    physical_loca:   data.physical_loca   || null,
    rack_no:         data.rack_no         || null,
    bin_no:          data.bin_no          || null,
    loc_qty:         data.loc_qty         || null,
    create_id:       userId               || null,
    create_date:     new Date(),                  // current timestamp
    update_id:       userId               || null,
    update_date:     new Date(),                  // current timestamp
  };
};  

// 
exports.transToMommwcDbData = (data, userId) => {
  return {
    wc_id:                  data.wc_id                  || null,
    wc_no:                  data.wc_no                  || null,
    description:            data.description            || null,
    division_id:            data.division_id            || null,
    store_process:          data.store_process          || null,
    store_no:               data.store_no               || null,
    no_of_machine:          data.no_of_machine          || null,
    setup_crew_no:          data.setup_crew_no          || null,
    setup_crew_rate:        data.setup_crew_rate        || null,
    operator_crew_no:       data.operator_crew_no       || null,
    operator_crew_rate:     data.operator_crew_rate     || null,
    helper_crew_no:         data.helper_crew_no         || null,
    helper_crew_rate:       data.helper_crew_rate       || null,
    machine_hour_rate:      data.machine_hour_rate      || null,
    efficiency:             data.efficiency             || null,
    labour_burden_rate:     data.labour_burden_rate     || null,
    create_id:              userId                      || null,
    create_date:            new Date(),                         // current timestamp
    update_id:              userId                      || null,
    update_date:            new Date(),                         // current timestamp
    dept_cd:                data.dept_cd                || null,
    main_wc_id:             data.main_wc_id             || null,
    inside_outside:         data.inside_outside         || null,
    store_type:             data.store_type             || 'G',   // default 'G'
    last_stage:             data.last_stage             || null,
    fa_assy:                data.fa_assy                || null,
    c_code:                 data.c_code                 || null,
    c_code_to:              data.c_code_to              || null,
    active:                 data.active                 || null,
    for_process_inventory:  data.for_process_inventory  || 'N',   // default 'N'
  };
};

