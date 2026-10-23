exports.transformRouteHeaderToDbData = (data) => {
  return {
    route_no: data.route_no || null,
    route_start_date: data.route_start_date || null,
    route_end_date: data.route_end_date || null,
    operation_no: data.operation_no || null,
    it_code: data.it_code || null,
    wc_id: data.wc_id || null,
    operation_description: data.operation_description || null,
    min_hour_flag: data.min_hour_flag || null,
    setup_time: data.setup_time || null,
    run_time: data.run_time || null,
    move_time: data.move_time || null,
    setup_crew_no: data.setup_crew_no || null,
    run_crew_no: data.run_crew_no || null,
    helper_crew_no: data.helper_crew_no || null,
    remarks: data.remarks || null,
    tool_change_time: data.tool_change_time || null,
    qty: data.qty || 1,
    master_route_no: data.master_route_no || null,
    route_id: data.route_id, 
    opn_id: data.opn_id,
    final_code: data.final_code || null,
    default_wc: data.default_wc || "N",
    cancel_flag: data.cancel_flag || "N",
    cancel_date: data.cancel_date || null,
    rev_no: data.rev_no || 0,
    rev_date: data.rev_date || null,
    ecn_id: data.ecn_id || null,
    ver_no: data.ver_no || 0,
    design_eng_name: data.design_eng_name || null,
    instructions: data.instructions || null,
    machine_hour_rate: data.machine_hour_rate || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
  };
};

exports.transformRouteDetailToDbData = (data) => {
  return {
    route_no: data.route_no || null,
    input_it_code: data.input_it_code, 
    usage: data.usage || null,
    rej_perc: data.rej_perc || 0,
    it_bom_um: data.it_bom_um || null,
    esti_cost: data.esti_cost || null,
    cost_external: data.cost_external || null,
    paint_cost: data.paint_cost || null,
    consumable_cost: data.consumable_cost || null,
    route_id: data.route_id, 
    rev_no: data.rev_no || 0,
    rev_date: data.rev_date || null,
    ecn_id: data.ecn_id || null,
    rec_id: data.rec_id || null,
    ver_no: data.ver_no || 0,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
  };
};

exports.transformRouteToolToDbData = (data) => {
  return {
    route_id: data.route_id ,
    route_no: data.route_no || null,
    it_code:data.it_code || null,
    no_off:data.no_off || null,
    remarks:data.remarks || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
    wef_date:data.wef_date || null,
    tool_cost:data.tool_cost || null,
    tool_no_years:data.tool_no_years || null,
  }
}

exports.transformRouteDrawingToDbData = (data) => {
  return {
     route_id: data.route_id || null,
     process_drw:data.process_drw || null,
  
  }
}