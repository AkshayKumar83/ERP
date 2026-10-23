 export const updatePhyInvData={
    store_process:"S",        
    wc_id:"",  
    curryear:"", 
    adj_date:"",
    inv_month:"",
    it_type:"",
    it_base:"",
    it_sub_c:"",
    di_det_fill:"", 
 }

   
   //  helplist  wk
// select wc_no, to_char(wc_id) wc_id
// from mommwc w
// where exists (select 1 from tommpinv p
//  where p.wc_id = w.wc_id)
// and store_process = :store_process
// and division_id = :global.g_division_id
// order by wc_no

    // month RG
// select cmonth, to_char(to_number(month)) from vwmonths where to_number(month) in (select inv_month from tommpinv where status_flag is null or status_flag = 'N')

        //it_base
   //  select cat_desc, level2 from moitbase where level1 = :it_type and level3 = '00' and level2 != '00'
         // it_type
   // select cat_desc, level1 from moitbase where level2 = '00' and level3 = '00'
       // it_sub_c
      //  select cat_desc, level3 from moitbase where level1 = :it_type and level2 = :it_base and level3 != '00'
      
//         generate button working
//     DECLARE
//   cstore_process mommwc.store_process%TYPE;
// BEGIN
//   IF confirm('Are you sure to generate adjustments ?') = alert_button1 THEN
//     BEGIN
//       SELECT store_process
//         INTO cstore_process
//         FROM mommwc w
//        WHERE wc_id = :updphyin.wc_id;
//     EXCEPTION
//       WHEN no_data_found THEN
//         error_message('Invalid Work Center not defined as store or process');
//         RAISE form_trigger_failure;
//     END;
    
//  ---- CHK_BATCH_QTY;
//     :di_det_fill := 'Creating Adjustments, Wait!';
//     synchronize;
  
//     ---FOR STORE 
//     IF cstore_process = 'S' THEN
//     	BEGIN
//        updphysicalinvtry(:curryear, :wc_id, :inv_month, :adj_date, :Global.G_Division_id);
//        gen_up_phy_batch_adj_STEP5(:Global.G_Division_id,:curryear,null, :wc_id, :inv_month,:adj_date,null);        
//     	EXCEPTION WHEN OTHERS THEN
//     		ERROR_MESSAGE(SQLERRM);
//       END;
//       commit_form;
//       :di_det_fill := '';
//       error_message('Completed for store');
//       clear_form;
//       COMMIT;
//     END IF;
  
//     ---FOR PROCESS
//     IF cstore_process = 'P' THEN
//            ---below proc blocked by ravi as told by bansal and two new proc added  for wip physical inventory    	
//            --- Updphysicalinvtry_Wip(:curryear, :wc_id, :inv_month, :adj_date, :Global.G_Division_id);
//            begin
//              updphysicalinvtry_wip_1(:curryear,:wc_id,:inv_month,:adj_date,:Global.G_Division_id);
//            EXCEPTION WHEN OTHERS THEN
//     	        	ERROR_MESSAGE(SQLERRM);
//     	        	raise form_trigger_failure; 
//            end;

//            begin
//             updphysicalinvtry_wip_2(:curryear,:wc_id,:inv_month,:adj_date,:Global.G_Division_id);
//            	EXCEPTION WHEN OTHERS THEN
//     		        ERROR_MESSAGE(SQLERRM); 
//     		        raise form_trigger_failure; 
//            end;
     
//       commit_form;
//       :di_det_fill := '';
//       error_message('Completed for Process');
//       clear_form;
//       COMMIT;
//     END IF;
//   END IF;
// END;



