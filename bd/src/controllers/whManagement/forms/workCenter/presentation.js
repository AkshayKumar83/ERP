// transformWarehouseToDbData.js

exports.transformWarehouseToDbData = (data) => {
    return {
        wc_id: data.wc_id ,
        wc_no: data.wc_no || null,
        description: data.description || null,
        division_id: data.division_id || null,
        store_process: data.store_process || null,
        store_no: data.store_no || null,
        no_of_machine: data.no_of_machine || null,
        setup_crew_no: data.setup_crew_no || null,
        setup_crew_rate: data.setup_crew_rate || null,
        operator_crew_no: data.operator_crew_no || null,
        operator_crew_rate: data.operator_crew_rate || null,
        helper_crew_no: data.helper_crew_no || null,
        helper_crew_rate: data.helper_crew_rate || null,
        machine_hour_rate: data.machine_hour_rate || null,
        efficiency: data.efficiency || null,
        labour_burden_rate: data.labour_burden_rate || null,
        create_id: data.create_id || null,
        create_date: data.create_date ||null,
        update_id: data.update_id || null,
        update_date: data.update_date ||null,
        dept_cd: data.dept_cd || null,
        main_wc_id: data.main_wc_id || null,
        inside_outside: data.inside_outside || null,
        store_type: data.store_type || 'G',
        last_stage: data.last_stage || 'N',
        fa_assy: data.fa_assy || null,
        c_code: data.c_code || null,
        c_code_to: data.c_code_to || null,
        active: data.active || null,
        for_process_inventory: data.for_process_inventory || 'N',
    };
};

// transformMcRateToDbData.js

exports.transformMcRateToDbData = (data) => {
    return {
        wc_id: data.wc_id ,
        mc_hr_rate: data.mc_hr_rate || null,
        wef_date: data.wef_date ||null,
        create_id: data.create_id || null,
        create_date: data.create_date ||null,
        update_id: data.update_id || null,
        update_date: data.update_date || null,
        fin_engg: data.fin_engg || 'E'
    };
};

// transformSkillSetToDbData.js

exports.transformSkillSetToDbData = (data) => {
    return {
        wc_id: data.wc_id,
        skill_id: data.skill_id ,
        no_of_emp: data.no_of_emp || null,
    };
};


