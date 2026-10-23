
exports.transformMommstokForThreeDecimalQuery = (row) => {
  return {
    ...row,
    yrop_qtyok: row.yrop_qtyok != null ? Number(row.yrop_qtyok).toFixed(3) : ".000",
    yrop_qtyre: row.yrop_qtyre != null ? Number(row.yrop_qtyre).toFixed(3) : ".000",
  };
};


exports.transformMommwcToDbData = (data) => {
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

exports.transformMommstokToDbData = (data) => {
  return {
    // NOT NULL fields
    it_code: data.it_code,
    wc_id: data.wc_id,
    trans_year: data.trans_year ?? '2024',
    active: data.active ?? 'Y',
    default_store: data.default_store ?? 'N',

    // Optional fields
    it_bin_ty: data.it_bin_ty || null,
    it_shelfno: data.it_shelfno || null,
    currbal_ok: data.currbal_ok || null,
    yrop_dt: data.yrop_dt || null,
    yrop_qtyok: data.yrop_qtyok || 0,
    yrop_qtyre: data.yrop_qtyre || 0,
    ytd_recpok: data.ytd_recpok || null,
    ytd_issuok: data.ytd_issuok || null,
    ytd_recrej: data.ytd_recrej || null,
    ytd_issrej: data.ytd_issrej || null,
    yrok_bacok: data.yrok_bacok || null,
    mtd_recpok: data.mtd_recpok || null,
    mtd_issuok: data.mtd_issuok || null,
    mtd_recrej: data.mtd_recrej || null,
    mtd_issrej: data.mtd_issrej || null,
    mtdok_bac: data.mtdok_bac || null,
    last_recok: data.last_recok || null,
    last_recre: data.last_recre || null,
    last_issok: data.last_issok || null,
    last_issre: data.last_issre || null,
    create_id: data.create_id || null,
    create_date: data.create_date || null,
    update_id: data.update_id || null,
    update_date: data.update_date || null,
    ytd_lrej: data.ytd_lrej || null,
    ytd_prod: data.ytd_prod || null,
    ytd_scrap: data.ytd_scrap || null,
    ytd_u_insp: data.ytd_u_insp || null,
    ytd_fs_trf: data.ytd_fs_trf || null,
    ytd_desp: data.ytd_desp || null,
    ytd_lret_ok: data.ytd_lret_ok || null,
    ytd_lret_rej: data.ytd_lret_rej || null,
    mtd_lrej: data.mtd_lrej || null,
    mtd_prod: data.mtd_prod || null,
    mtd_scrap: data.mtd_scrap || null,
    mtd_u_insp: data.mtd_u_insp || null,
    mtd_fs_trf: data.mtd_fs_trf || null,
    mtd_desp: data.mtd_desp || null,
    mtd_lret_ok: data.mtd_lret_ok || null,
    mtd_lret_rej: data.mtd_lret_rej || null,
    wip_norm: data.wip_norm || null,
    stkun_insp: data.stkun_insp || null,
    yrop_wipok: data.yrop_wipok || null,
    physical_loc: data.physical_loc || null,
    default_process: data.default_process || null,
    rack_no: data.rack_no || null,
    bin_no: data.bin_no || null,
    otherlocation: data.otherlocation || null,
    shelfno: data.shelfno || null,
    reordr_qty: data.reordr_qty || null,
    reordr_level: data.reordr_level || null,
    min_stock: data.min_stock || null,
    max_stock: data.max_stock || null,
  };
};


exports.transformMommstokBatchToDbData = (data) => {
  return {
    // Required fields (NOT NULL)
    it_code: data.it_code,
    wc_id: data.wc_id,
    trans_year: data.trans_year,
    batch_no: data.batch_no,
    batch_date: data.batch_date,
    loca_rack_bin_desc: data.loca_rack_bin_desc ?? 'NOT AVAILABLE',

    // Optional fields
    ok_qty: data.ok_qty || 0,
    rej_qty: data.rej_qty || 0,
    create_id: data.create_id || null,
    create_date: data.create_date || null,
    update_id: data.update_id || null,
    update_date: data.update_date || null,
    expiry_dt: data.expiry_dt || null,
    currbal_ok: data.currbal_ok || null,
    currbal_rej: data.currbal_rej || null,
    ytd_recpok: data.ytd_recpok || null,
    ytd_issuok: data.ytd_issuok || null,
    ytd_recprej: data.ytd_recprej || null,
    ytd_issurej: data.ytd_issurej || null,
    cwo_id: data.cwo_id || null,
    cwo_item: data.cwo_item || null,
    auto_gen: data.auto_gen ?? 'N',
    supp_code: data.supp_code || null,
    manuf_code: data.manuf_code || null,
    basic_rate: data.basic_rate || null,
    ex_duty_perc: data.ex_duty_perc || null,
    splex_duty_perc: data.splex_duty_perc || null,
    assess_rate: data.assess_rate || null,
    mrir_no: data.mrir_no || null,
    supp_inv_no: data.supp_inv_no || null,
    supp_inv_dt: data.supp_inv_dt || null,
    manu_inv_no: data.manu_inv_no || null,
    manu_inv_dt: data.manu_inv_dt || null,
    exc_per_unit: data.exc_per_unit || null,
    spl_exc_per_unit: data.spl_exc_per_unit || null,
    manuf_qty: data.manuf_qty || null,
    manuf_asses_val: data.manuf_asses_val || null,
    supp_rg23a_no: data.supp_rg23a_no || null,
    supp_rg23a_dt: data.supp_rg23a_dt || null,
    manuf_rg23a_no: data.manuf_rg23a_no || null,
    manuf_rg23a_dt: data.manuf_rg23a_dt || null,
    add_duty_per_unit: data.add_duty_per_unit || null,
    higher_edu_cess_prc: data.higher_edu_cess_prc || null,
    higher_edu_cess_per_unit: data.higher_edu_cess_per_unit || null,
    be_no: data.be_no || null,
    be_date: data.be_date || null,
    suppl_manuf_asses_val: data.suppl_manuf_asses_val || null,
    suppl_excs_per_unit: data.suppl_excs_per_unit || null,
    suppl_spl_excs_per_unit: data.suppl_spl_excs_per_unit || null,
    suppl_higher_edu_cess_per_unit: data.suppl_higher_edu_cess_per_unit || null,
    suppl_add_duty_per_unit: data.suppl_add_duty_per_unit || null,
    cwo_type: data.cwo_type || null,
  };
};

// PROCEDURE ok_batch_qty IS
// nqty number(11);
// BEGIN
//    if get_item_batch_control_flag(:mommstok.it_code) = 'Y' then
//    	 Begin
// 	     select sum(ok_qty)
//        into nqty
//        from mommstok_batch
//       where it_code = :mommstok.it_code
//         and wc_id = :mommstok.wc_id
//         and trans_year = :mommstok.trans_year;
//         if nvl(nqty,0) = 0 and nvl(:mommstok.yrop_qtyok,0) != 0 then 
//      	    error_message('Batch Ok Qty cannot be Zero or null');
//      	    go_item('mommstok_batch.ok_qty');
//      	    Raise form_trigger_failure;
//         elsif nvl(nqty,0) != 0 and nvl(:mommstok.yrop_qtyok,0) != nvl(nqty,0) then 
//      	    error_message('Total Ok Batch Qty must be equal to Year Opening Ok Qty ');
//      	    go_item('mommstok_batch.ok_qty');
//      	    Raise form_trigger_failure;
//         end if;
//      Exception
//        when no_data_found then
//        null;
//      End;
//    end if;
// END;


// PROCEDURE rej_batch_qty IS
// nqty number(11);
// BEGIN
// 	if get_item_batch_control_flag(:mommstok.it_code) = 'Y' then
//     Begin
// 	    select sum(rej_qty)
//       into nqty
//       from mommstok_batch
//      where it_code = :mommstok.it_code
//        and wc_id = :mommstok.wc_id
//        and trans_year = :mommstok.trans_year;
//        if nvl(nqty,0) = 0 and nvl(:mommstok.yrop_qtyre,0) != 0 then 
//      	   error_message('Batch Reject Qty cannot be Zero or null');
//      	   go_item('mommstok_batch.rej_qty');
//      	   Raise form_trigger_failure;
//        elsif nvl(nqty,0) != 0 and nvl(:mommstok.yrop_qtyre,0) != nvl(nqty,0) then 
//      	   error_message('Total Reject Batch Qty must be equal to Year Opening Reject Qty ');
//      	   go_item('mommstok_batch.rej_qty');
//      	   Raise form_trigger_failure;
//        end if;
//     Exception
//       when no_data_found then
//       null;
//     End;
//   end if;
// END;




// BEGIN
//   go_block('MOMMSTOK');
//   IF :control.di_formstatus = 'UPDATE' THEN
//   	 post_data;
// -- added by pradipto 14.1.2008 for batch based items
//   	 ok_batch_qty ;
//   	 rej_batch_qty ;
// --  	 
//     commit_form;


// CREATE OR REPLACE PROCEDURE rej_batch_qty(
//     p_it_code text,
//     p_wc_id integer,
//     p_trans_year integer,
//     p_yrop_qtyre numeric
// )
// LANGUAGE plpgsql
// AS $$
// DECLARE
//     nqty numeric;
// BEGIN
//     IF get_item_batch_control_flag(p_it_code) = 'Y' THEN
//         BEGIN
//             SELECT SUM(rej_qty)
//             INTO nqty
//             FROM mommstok_batch
//             WHERE it_code = p_it_code
//               AND wc_id = p_wc_id
//               AND trans_year = p_trans_year;

//             IF COALESCE(nqty,0) = 0 AND COALESCE(p_yrop_qtyre,0) != 0 THEN
//                 RAISE EXCEPTION 'Batch Reject Qty cannot be Zero or null';
//             ELSIF COALESCE(nqty,0) != 0 AND COALESCE(p_yrop_qtyre,0) != COALESCE(nqty,0) THEN
//                 RAISE EXCEPTION 'Total Reject Batch Qty must be equal to Year Opening Reject Qty';
//             END IF;
//         EXCEPTION
//             WHEN NO_DATA_FOUND THEN
//                 NULL;
//         END;
//     END IF;
// END;
// $$;


// CALL ok_batch_qty('2N02300171-000R00', 4, 2025, 10);

// -- OK Batch Qty Procedure
// CREATE OR REPLACE PROCEDURE ok_batch_qty(
//     p_it_code text,
//     p_wc_id integer,
//     p_trans_year integer,
//     p_yrop_qtyok numeric
// )
// LANGUAGE plpgsql
// AS $$
// DECLARE
//     nqty numeric;
// BEGIN
//     IF get_item_batch_control_flag(p_it_code) = 'Y' THEN
//         BEGIN
//             SELECT SUM(ok_qty)
//             INTO nqty
//             FROM mommstok_batch
//             WHERE it_code = p_it_code
//               AND wc_id = p_wc_id
//               AND trans_year = p_trans_year;

//             IF COALESCE(nqty,0) = 0 AND COALESCE(p_yrop_qtyok,0) != 0 THEN
//                 RAISE EXCEPTION 'Batch OK Qty cannot be Zero or null';
//             ELSIF COALESCE(nqty,0) != 0 AND COALESCE(p_yrop_qtyok,0) != COALESCE(nqty,0) THEN
//                 RAISE EXCEPTION 'Total OK Batch Qty must be equal to Year Opening OK Qty';
//             END IF;
//         EXCEPTION
//             WHEN NO_DATA_FOUND THEN
//                 NULL;
//         END;
//     END IF;
// END;
// $$;

// SELECT it_code, batch_control_flag
// FROM mommitem
// WHERE batch_control_flag = 'Y'