
exports.transformTommpinvToDbData = (data) => {
  return {
    it_code: data.it_code || null,
    wc_id: data.wc_id  || null,
    trans_year: data.trans_year || null,
    inv_month: data.inv_month|| null,
    inv_date: data.inv_date|| null ,  
    it_ok_qty: data.it_ok_qty || null,
    it_rej_qty: data.it_rej_qty || null,
    it_rej_prn_flg: data.it_rej_prn_flg || null,
    sc_flag: data.sc_flag || null,
    status_flag: data.status_flag || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
    store_process: data.store_process || null,
    tag_no: data.tag_no || null,
    pinv_id: data.pinv_id  
  };
};

exports.transformTdmmpinvToDbData = (data) => {
  return {
      pinv_id: data.pinv_id || null,
      wo_id:data.wo_id || null,
      it_code: data.it_code || null,
      batch_no:data.batch_no || null,
      batch_date:data.batch_date || null,
      tag_no: data.tag_no || null,
      qty_ok:data.qty_ok || null,
      qty_rej:data.qty_rej || null,
      create_id: data.create_id || null,
      create_date: data.create_date || new Date(),
      update_id: data.update_id || null,
      update_date: data.update_date || new Date(),
  

  }

}
 
// -- PROCEDURE: integral.check_srl_no_rec(character varying, character varying)

// -- DROP PROCEDURE IF EXISTS integral.check_srl_no_rec(character varying, character varying);

// CREATE OR REPLACE PROCEDURE integral.check_srl_no_rec(
// 	IN p_inv_month smallint,
// 	IN p_it_code character varying)
// LANGUAGE 'plpgsql'
// AS $BODY$
// DECLARE
//     rec RECORD;
//     ncnt INTEGER;
// BEGIN
//     FOR rec IN
//         SELECT pinv_id, it_code, it_ok_qty
//         FROM tommpinv
//         WHERE inv_month = p_inv_month
//           AND chk_it_srl_no_reqd(it_code) = 'Y'
//           AND it_code = p_it_code
//     LOOP
//         SELECT COUNT(*)
//           INTO ncnt
//         FROM tdmmpinv
//         WHERE pinv_id = rec.pinv_id
//           AND it_code = rec.it_code;

//         IF rec.it_ok_qty <> ncnt THEN
//             RAISE EXCEPTION 
//                 'This Item % is Serial Number controlled. Please enter each individual Serial No.',
//                 rec.it_code;
//         END IF;
//     END LOOP;
// END;
// $BODY$;
// ALTER PROCEDURE integral.check_srl_no_rec(smallint, character varying)
//     OWNER TO postgres;



// -- PROCEDURE: integral.valid_batch_qty(character varying, character varying, integer, character varying, character varying)

// -- DROP PROCEDURE IF EXISTS integral.valid_batch_qty(character varying, character varying, integer, character varying, character varying);

// CREATE OR REPLACE PROCEDURE integral.valid_batch_qty(
// 	IN p_inv_month smallint
// 	IN p_it_code character varying,
// 	IN p_trans_year character varying,,
// 	IN p_wc_id smallint,
// 	IN p_store_process character varying)
// LANGUAGE 'plpgsql'
// AS $BODY$
// DECLARE
//     rec RECORD;
//     nqty NUMERIC(11,3);
// BEGIN
//     FOR rec IN
//         SELECT it_code, it_ok_qty, pinv_id
//         FROM tommpinv
//         WHERE inv_month = p_inv_month
//           AND it_code = p_it_code
//           AND trans_year = p_trans_year
//           AND wc_id = p_wc_id
//           AND store_process = p_store_process
//     LOOP
//         -- assuming get_item_batch_control_flag() exists as a function in PG
//         IF get_item_batch_control_flag(rec.it_code) = 'Y' THEN
//             SELECT COALESCE(SUM(qty_ok), 0)
//               INTO nqty
//             FROM tdmmpinv
//             WHERE pinv_id = rec.pinv_id;

//             IF nqty = 0 AND COALESCE(rec.it_ok_qty, 0) > 0 THEN
//                 RAISE EXCEPTION 
//                     'Batch Qty must be entered for % (nqty=%, it_ok_qty=%)', 
//                     rec.it_code, nqty, rec.it_ok_qty;
//             ELSIF nqty > 0 AND COALESCE(rec.it_ok_qty, 0) != nqty THEN
//                 RAISE EXCEPTION 
//                     'Total Batch Qty must be equal to This % Item Qty (nqty=%, it_ok_qty=%)',
//                     rec.it_code, nqty, rec.it_ok_qty;
//             END IF;
//         END IF;
//     END LOOP;
// END;
// $BODY$;
// ALTER PROCEDURE integral.valid_batch_qty(smallint, character varying, character varying, smallint, character varying)
//     OWNER TO postgres;









// ---------- helplist query for work center, item code , batch no----------

	// select wc_no, to_char(wc_id) wc_id
	// from mommwc 
	// where store_process = :temp.store_process 
	// and division_id = :global.g_division_id
	// order by wc_no

// select b.it_name_long it_name, b.it_code, b.drawing_no 
//   from mommstok a, mommitem b
//  where a.wc_id = :temp.wc_id
//    and a.trans_year = :Global.G_fin_year
//    and a.it_code = b.it_code
//    and a.active = 'Y' 
//    and b.it_type = nvl(:temp.it_type, b.it_type)
//    and b.it_base =	nvl(:temp.it_base, b.it_base)
//    and b.it_sub_c = nvl(:temp.it_sub_c, b.it_sub_c)
//    and b.RAW_MATERIAL_CD is null 
//    and not exists (select 'x' from tommpinv
// 					where inv_month = :temp.inv_month
// 	  				  and trans_year = a.trans_year
// 					  and wc_id = a.wc_id
// 					  and it_code = a.it_code)


// select distinct it_code, supp_batch_no, batch_date from tdmmrct_batch
//      where it_code = :tommpinv.it_code
//   order by it_code, supp_batch_no,batch_date


//     -- pre Insert----
// 	begin
//   select s_tommpinv_pinv_id.nextval into :tommpinv.pinv_id from dual;

// 	:tommpinv.wc_id := :temp.wc_id;
// 	:tommpinv.inv_month := :temp.inv_month;
// 	:tommpinv.inv_date := :temp.inv_date;
// 	:tommpinv.trans_year := :Global.G_fin_year;
// 	:tommpinv.store_process := :temp.store_process;
// 	--:tommpinv.it_ok_qty := 0;
// 	--:tommpinv.it_rej_qty := 0;
// 	end;
//           ---item level trigger----
// 		 begin
// 	select it_name_long , drawing_no , um_code
// 	  into :tommpinv.it_name, :tommpinv.drawing_no , :um_code
//     from mommstok a, mommitem b
//    where b.it_code = :tommpinv.it_code
//      and a.wc_id = :temp.wc_id
//      and a.trans_year = :Global.G_fin_year
//      and a.it_code = b.it_code
//      and a.active = 'Y' 
//      and b.it_type = nvl(:temp.it_type, b.it_type)
//      and b.it_base =	nvl(:temp.it_base, b.it_base)
//      and b.it_sub_c = nvl(:temp.it_sub_c, b.it_sub_c)
//      and b.RAW_MATERIAL_CD is null; 
// exception when no_data_found then
// 	error_message('Please select Valid item code from list');
// 	raise form_trigger_failure;
// end;
// declare
// cBatch varchar2(10);
// begin
//  begin	 
//    SELECT get_item_batch_control_flag(:TOMMPINV.it_code)  INTO  cBatch from dual;
//  exception when no_data_found then
//  	  cBatch := 'N';
//  end;
//  if cBatch = 'Y' THEN
//  	 error_message('Item is batch controlled');
//  end if;	 
// end ;

// if :tommpinv.it_ok_qty < 0 then
//   error_message('OK Quantity cannot be negative');
//   raise form_trigger_failure;
// elsif :tommpinv.it_ok_qty is null then
//   error_message('OK Quantity cannot be blank');
//   raise form_trigger_failure;
// end if;
// FormatMaskCheck(:tommpinv.um_code);
 
//    if :tommpinv.it_rej_qty < 0 then
//   error_message('Rejection Quantity cannot be negative');
//   raise form_trigger_failure;
// elsif :tommpinv.it_rej_qty is null then
//   error_message('Rejection Quantity cannot be blank');
//   raise form_trigger_failure;
// end if;
// FormatMaskCheck(:tommpinv.um_code);


//   batch no  item level trigger
//   DECLARE
// 	cRowid rowid;
// BEGIN
//  select rowid into cRowid from tdmmpinv
//   where pinv_id  = :tommpinv.pinv_id
//     and batch_no = :tdmmpinv.batch_no
//     and it_code  = :tommpinv.it_code;
//   if :tdmmpinv.rowid is null or :tdmmpinv.rowid != cRowid then
//   	error_message('Batch no  already exist');
//     raise form_trigger_failure;
//   end if;
// exception when no_data_found then
// 	null;
// END;
// begin
//    if  get_item_batch_control_flag(:tommpinv.it_code) = 'N' then
//     error_message('Batch no is not required for this Item');
//      raise form_trigger_failure; 
//    end if; 	
// end;

//   if :control.di_formstatus in ('INSERT') then
	  
//       QTY_OK
// 	if :batch_no  is not null then
// 	 if nvl(:tdmmpinv.qty_ok,0) <= 0 then
// 	 	 error_message('Ok qty cannot be less than or equals to zero');
// 	 	 raise form_trigger_failure;
// 	 end if;
//  end if;
//            QTY_REJ
//   if :control.di_formstatus in ('INSERT') then
// 	 if nvl(:tdmmpinv.qty_rej,0) < 0 then
// 	 	 error_message('Rej qty cannot be less than 0');
// 	 	 raise form_trigger_failure;
// 	 end if;

// 	 if nvl(:tdmmpinv.qty_rej,0) > 0 then
// 	 	 :tommpinv.it_rej_qty := :tdmmpinv.tot_rej_qty;
// 	 end if;
// end if;


//    ---- user save------
//    BEGIN
//   go_block('TOMMPINV');

//   IF :control.di_formstatus in ('INSERT', 'UPDATE') THEN
//     post_data;
//    -- batch_no_check;
//   	valid_batch_qty;	
//   	check_srl_no_rec;		               
//     commit_form;
//     delete from tdmmpinv d
//      where nvl(qty_ok,0) = 0 
//        and nvl(qty_rej ,0) = 0;
//        commit_form;
    

//    ------procedure valid_batch_qty----
//    PROCEDURE valid_batch_qty IS
//   nqty number(11,3);
//   cursor cur_item is
//      select it_code, it_ok_qty , pinv_id
//       from tommpinv
//      where /*pinv_id = :tommpinv.pinv_id;*/
//             inv_month = :tommpinv.inv_month       
//             and it_code = :tommpinv.it_code
//             AND TRANS_YEAR = :tommpinv.TRANS_YEAR --NEW
//             AND WC_ID = :tommpinv.WC_ID--NEW
//             AND STORE_PROCESS = :tommpinv.STORE_PROCESS;--NEW
// BEGIN
// 	for i in cur_item 
// 	  loop
//  	  	if get_item_batch_control_flag(i.it_code) = 'Y' then
// 	    select sum(qty_ok) into nqty
//         from tdmmpinv 
//         where pinv_id = i.pinv_id;
//          -- and it_code = i.it_code; --UNBLOCKED
//        --  ERROR_MESSAGE(i.it_code ||' nqty '||nqty||' i.it_ok_qty '||i.it_ok_qty);
//              if nvl(nqty,0) = 0 and nvl(i.it_ok_qty,0) > 0 then
//     	          error_message('Batch Qty must be entered for '||i.it_code ||' nqty '||nqty||' i.it_ok_qty '||i.it_ok_qty);
//     	          raise form_trigger_failure;
//              elsif nvl(nqty,0) > 0 and nvl(i.it_ok_qty,0) !=nvl(nqty,0)  then
//     	          error_message('Total Batch Qty must be equal To This '||i.it_code ||' Item Qty');
//     	          go_block('tdmmpinv');
//     	          go_item('tdmmpinv.qty_ok');
//     	          raise form_trigger_failure;
//              end if;
//      end if;
// 	end loop;
// EXCEPTION when no_data_found then
//  	nqty := null;
// END;

//   PROCEDURE check_srl_no_rec IS
//  cursor c1 is
//   select pinv_id, it_code, it_ok_qty
//    from tommpinv 
//   where inv_MONTH = :tommpinv.INV_MONTH
//     and chk_it_srl_no_reqd(it_code) = 'Y'
//     and it_code = :tommpinv.it_code; --NEW
//  ncnt  number;
// BEGIN
//   for i in c1 loop
//    begin	
//   	select count(*) into ncnt
//   	 from tdmmpinv
//   	where  pinv_id =  i.pinv_id
//   	 and  it_code = i.it_code;
//    exception   	
//    	when no_data_found then
//    	  ncnt := 0;
//    end;
//  --  error_message(' ncnt '|| ncnt||' i.it_ok_qty '||i.it_ok_qty||' i.it_code '||i.it_code);
//    if i.it_ok_qty <> ncnt then
//    	 error_message('This Item '|| i.it_code ||' is Serial Number controlled. Please enter each individual Serial No.' );
//    	 raise form_trigger_failure;
//    end if;
//   end loop; 
// END;


//   SET DEFINE OFF;
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1R02020043-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1015.2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132420);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V06030096-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 6, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132421);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09290013-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132422);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09090176-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132423);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030688-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 18, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132424);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V03010099-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 4, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132425);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B05050128-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132426);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B04040006-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132427);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B46020136-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132428);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030020-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 27, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132429);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1S13020004-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132430);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030039-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 12, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132431);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09080069-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 4, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132432);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('2T01350013-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 74, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132433);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02050068-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 50, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132434);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030660-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 11, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132435);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02040035-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 27, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132436);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B39050011-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 4, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132437);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030367-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 321, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132438);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B07010015-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 8, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132439);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09100010-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132440);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1A01010028-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 14, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132441);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1R01011188-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 368, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132442);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1R01060006-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 392.5, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132443);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B48050001-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 6, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132444);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1A01090007-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132445);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09070246-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 4, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132446);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1P01010080-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 20, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132447);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B03030006-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 10, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132448);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1R28020017-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 9.6, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132449);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09090178-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132450);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('2N02300041-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 85, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132451);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09290014-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132452);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('2T03280003-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 40, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132453);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B04050008-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 6, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132454);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B03020006-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132455);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09040176-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132456);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1R01011190-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 4220.2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132457);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V01030054-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 6, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132458);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1P01010019-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 62.5, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132459);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1C09070250-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 3, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132460);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1P02040001-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1240, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132461);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V06050016-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 30, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132462);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B46040125-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 1, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132463);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1B46040196-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 2, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132464);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1A17050004-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 8, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132465);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030329-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 385, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132466);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1P02020001-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 255, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132467);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030629-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 130, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132468);
// Insert into INTEGRAL.TOMMPINV
//    (IT_CODE, WC_ID, TRANS_YEAR, INV_MONTH, INV_DATE, IT_OK_QTY, CREATE_ID, CREATE_DATE, STORE_PROCESS, PINV_ID)
//  Values
//    ('1V02030203-000R00', 2, '2023', 4, TO_DATE('04/01/2023 00:00:00', 'MM/DD/YYYY HH24:MI:SS'), 3, 0, TO_DATE('05/03/2023 19:17:11', 'MM/DD/YYYY HH24:MI:SS'), 'S', 132469);
// COMMIT;
