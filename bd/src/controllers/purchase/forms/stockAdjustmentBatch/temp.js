// :thmmmain.trans_year  := :Global.G_FIn_Year;
// :thmmmain.division_id := :Global.G_Division_id;

// Select Seq_thmmmain_doc_id.Nextval into :thmmmain.doc_id from dual;
// --select sysdate into :thmmmain.doc_date from dual;
// :THMMMAIN.authorised := 'N';
// If :thmmmain.doc_no is null then
//   :thmmmain.doc_no := '~' || to_char(:thmmmain.doc_id);  


// when validate item 

// begin
//   select from_wc_id, to_wc_id into :thmmmain.from_wc_id, :thmmmain.to_wc_id
//    from mommtrty where trans_code = :thmmmain.trans_code;
// exception
//    when no_data_found then
//     null;
// end;

// if :control.di_formStatus <> 'QUERY' then
//    if :thmmmain.trans_code is null or :thmmmain.trans_code = 0  then
//       error_message('Select the Movement/Transaction');
//       raise form_trigger_failure;
//    end if;
// end if;

// if :control.di_formStatus <> 'QUERY' then
//    if :thmmmain.doc_date is null then
//       error_message('Document Date cannot be blank');
//       raise form_trigger_failure;
//    end if;
// end if;  

// Begin  

// -----------------------------------------when validate item ---------------------------------------------------------   


//---------------------wc_no-----------------------------


//   Select wc_id, description into :thmmmain.wc_id, :thmmmain.wc_description
// 		from mommwc where wc_no = :thmmmain.wc_no
// 		and division_id = :global.g_division_id;
// Exception
//      When no_data_found then
//       error_message('Store does not exist');
//       raise form_trigger_failure;
// End;
// If :control.di_formStatus in ('INSERT', 'UPDATE') then
// --error_message(to_char(:parameter.user_wc_id)||' parameter');
// Declare 
//    cCheck VARCHAR2(1);
// Begin 
//     Select 'x' into cCheck from store where user_id = :Global.G_user_id
//         and wc_id = :thmmmain.wc_id; --:parameter.user_wc_id;
// Exception
//     when no_data_found then
//     error_message('User/Store is not matching');
//     raise form_trigger_failure;
// End;
// end if;
// If :Control.Di_FormStatus != 'QUERY' then
//    :thmmmain.from_wc_id := 0;
//    :thmmmain.to_wc_id := 0;
//    :thmmmain.trans_code := 0;
//    :thmmmain.from_wc_desc := ' ';
//    :thmmmain.to_wc_desc := ' ';
// End if;
// --error_message(:thmmmain.wc_id||' - '||:Global.G_USER_ID||' - '||:thmmmain.tr_type||' - '||:thmmmain.ok_rej||' - '||:thmmmain.MAT_TRANS_TYPE);  


//-------------------- from wc_desc-----------------------  

// begin
//   select from_wc_id, to_wc_id 
//     into :thmmmain.from_wc_id, :thmmmain.to_wc_id
//    from mommtrty where trans_code = :thmmmain.trans_code;
// exception
//    when no_data_found then
//     null;
// end;  


//----------------temp react -------------

// IF :TEMP_RECT ='Y' THEN
// 	SET_ITEM_PROPERTY('THMMMAIN.SRS_NO',ENABLED,PROPERTY_OFF);
// 	PROCENABLEDTRUE('TMP_ENTRY_NO');
// 	ELSE
// 	PROCENABLEDTRUE('THMMMAIN.SRS_NO');
// 	SET_ITEM_PROPERTY('TMP_ENTRY_NO',ENABLED,PROPERTY_OFF);
// 	:TMP_ENTRY_NO:=null;
// END IF;
// SET_LOV_ITEM;  


// -------------srs_no -------------------

// DECLARE
//   cstn     VARCHAR2 (10);
//   cfound   VARCHAR2 (10);
//   cPch     varchar2(1);
//   cauth    varchar2(1);
// BEGIN
//   IF :temp_rect = 'N' THEN
//   	/* changed by vikas at EEL as discussed with Mr Bansal to add a new flag of stock transfer in mommtrty
//   	 and use that flag in place of this substr
//     SELECT SUBSTR (type_desc, 1, 3)
//       INTO cstn
//       FROM mommtrty
//      WHERE trans_code = :thmmmain.trans_code;
//      */
//     SELECT nvl(stock_transfer_flag,'N') 
//       INTO cstn
//       FROM mommtrty
//      WHERE trans_code = :thmmmain.trans_code;
  
//     IF :di_formstatus IN ('INSERT','UPDATE') THEN
//       IF :thmmmain.ok_rej = 'O' AND :thmmmain.trans_type = 'I' THEN
//         IF :thmmmain.mat_trans_type = 'I' THEN
//           IF :thmmmain.srs_no IS NOT NULL THEN
						
// 						begin
// 							select print_flag into cPch
// 	  						from mhmmsrs
// 	 	 					 where srs_no = :thmmmain.srs_no;
// 						exception when no_data_found then
// 							cPch := 'N';
// 						end;
// 						if cPch = 'N' then
// 							error_message('Print SRS Before Issue');
// 							raise form_trigger_failure;
// 						end if;          		
						
// 						begin
// 							select auth_flag into cauth
// 	  						from mhmmsrs
// 	 	 					 where srs_no = :thmmmain.srs_no;
// 						exception when no_data_found then
// 							cauth := 'N';
// 						end;
// 						if cauth = 'N' then
// 							error_message('Authorise SRS Before Issue');
// 							raise form_trigger_failure;
// 						end if;  
						
//             BEGIN
//               SELECT distinct h.srs_id
//                 INTO :thmmmain.srs_id
//                 FROM mhmmsrs h
//                WHERE srs_no = :thmmmain.srs_no
//                  AND division_id = :GLOBAL.g_division_id
//                  and nvl(auth_flag,'N') = 'Y' 
//                  and nvl(print_flag,'Y') = 'Y'
//                  and nvl(cancl_flag,'N') = 'N'
//                  AND wc_id = :from_wc_id	
//                  AND to_wc_id = :to_wc_id;
//             EXCEPTION
//               WHEN NO_DATA_FOUND THEN
//                 error_message ('Srs No. Does not Exists');
//                 RAISE form_trigger_failure;
//             END;

//             BEGIN
//               SELECT distinct h.srs_id
//                 INTO :thmmmain.srs_id
//                 FROM mhmmsrs h, mdmmsrs d
//                WHERE srs_no = :thmmmain.srs_no
//                  AND division_id = :GLOBAL.g_division_id
//                  and nvl(auth_flag,'N') = 'Y' 
//                  and nvl(cancl_flag,'N') = 'N'
//                  AND wc_id = :from_wc_id	
//                  AND to_wc_id = :to_wc_id
//                  and h.srs_id = d.srs_id
//                  and (SRS_QTY-FUNC_SRS_ALREADY_ISSUE_QTY(h.srs_id, it_code))> 0 ;
//             EXCEPTION
//               WHEN NO_DATA_FOUND THEN
//                 error_message ('Item Already Issued Against SRS');
//                 RAISE form_trigger_failure;
//             END;

//           /*
//           begin
//             select 'Y' into cfound from thmmmain
//              where division_id = :global.g_division_id
//                and trans_year = :global.g_fin_year
//                and srs_id = :thmmmain.srs_id;
//             Error_message('Material Against this SRS No. Already Issue');
//             raise form_trigger_failure;
//           exception when no_data_found then
//             null;
//           end;
//           */
//           ELSE
//             IF cstn = 'N' THEN
//             	 null;
//              -- error_message ('SRS NO. cannot be left blank');
//              -- RAISE form_trigger_failure;
//             END IF;
//           END IF;
//         END IF;
//       END IF;
//     END IF;
//   END IF;
// EXCEPTION
//   WHEN NO_DATA_FOUND THEN
//     NULL;
// END;
// check_store_define;  


//--------------doc_date----------------

// if :thmmmain.doc_date is not null then
//   CheckOpenYearDate(:thmmmain.doc_date, :parameter.module_name, :parameter.trans_name);
//   if trunc(:thmmmain.doc_date) > trunc(sysdate) then
//     error_message('Document Date cannot be greater than Today''s date');
//     raise form_trigger_failure;
//   end if;
//   declare 
//     cParam_it_base varchar2(1);
//     cLast_issue_date date;
//     cStore mommwc.store_no%type;
//   begin
//     begin 
//       select itmemo_no_base into cParam_it_base from mommparm;
//       if cParam_it_base is null then
//          error_message('Define the Parameter for Document No. Generation'
//           || chr(10) || 'Contact the ISD/EDP Department');
//          raise form_trigger_failure;
//       end if;
//     exception when no_data_found then
//       error_message('Define the Parameter for Document No. Generation'
//         || chr(10) || 'Contact the ISD/EDP Department');
//       raise form_trigger_failure;
//     end;
//     if cParam_it_base = 'D' then
//       if :receive_issue_flag = 'I' and :thmmmain.ok_rej = 'O' then
// 				Select --+ index(tommmain I_TOMMMAIN_YEAR_WC_IT_DT_TRANS)
// 				max(doc_date) into cLast_issue_date from tommmain
// 				where wc_id = :thmmmain.wc_id
// 					and tommmain.Trans_year  = :Control.CURRYear
// 					and tommmain.Division_id = :Global.G_division_id;
// 				--and tommmain.doc_no != :thmmmain.doc_no;
//        -- if trunc(cLast_issue_date) > trunc(:thmmmain.doc_date) then
//         --  error_message('Last Issue date -   ' || ' [ ' || 
//          --      to_char(cLast_issue_date, 'DD-MM-YYYY')|| ' ]');
//          -- :thmmmain.doc_date := cLast_issue_date;
//         --  raise form_trigger_failure;
//        -- end if;
//       end if; 
//     end if;
//     --begin
//     --	select srs_date into dSrs_dt from mhmmsrs
//     --	where srs_id =:thmmmain.srs_id;
//     --exception when no_data_found then
    	
//   end;
// end if;  


//------------------ for tdmmmain block --------------

// :Tdmmmain.wc_id := :Thmmmain.wc_id;
 

// --------------when validate record------------\

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	IF :SRS_NO IS NOT NULL THEN
// 		IF :SRS_QTY != :QTY THEN
// 			IF :SHORT_ISS_CODE_DESC IS NULL THEN
// 					ERROR_MESSAGE('Please mention the reason for short issue');
// 					RAISE FORM_TRIGGER_FAILURE;
// 			END IF;
// 		END IF;
// 	END IF;
// END IF;  

//------------ when new record instance ----------

// Post_Data;
// CHECK_BATCH; 
// :control.temp_qty := :tdmmmain.qty;   

// check batch

// PROCEDURE CHECK_BATCH IS
//   cursor c is
//     select it_code
//       from tdmmmain d
//      where doc_id = :thmmmain.doc_id
//        and it_code = :tdmmmain.it_code;
// BEGIN
//   for i in c LOOP
//   	if get_item_batch_control_flag(i.it_code) = 'Y' then
// 		  PROCENABLEDTRUE('TDMMMAIN_BATCH.CWO_NO');
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_NO', VISUAL_ATTRIBUTE, 'ENTRY');

// 	  	PROCENABLEDTRUE('TDMMMAIN_BATCH.CWO_ITEM');
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_ITEM', VISUAL_ATTRIBUTE, 'ENTRY');

// 	  	PROCENABLEDTRUE('TDMMMAIN_BATCH.BATCH_NO');
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.BATCH_NO', VISUAL_ATTRIBUTE, 'ENTRY');
// 		else
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_NO', ENABLED, PROPERTY_FALSE);
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_NO', VISUAL_ATTRIBUTE, 'DISPLAY');	  

//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_ITEM', ENABLED, PROPERTY_FALSE);
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.CWO_ITEM', VISUAL_ATTRIBUTE, 'DISPLAY');	  

//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.BATCH_NO', ENABLED, PROPERTY_FALSE);
//   		SET_ITEM_PROPERTY('TDMMMAIN_BATCH.BATCH_NO', VISUAL_ATTRIBUTE, 'DISPLAY');	  			
//   	end if;	
//   END LOOP;  		  
// END; 


// ----------------------it_code ----------------------------

// BEGIN
//   BEGIN
//     IF :tdmmmain.it_code IS NOT NULL THEN
//       DECLARE
//         ccheck   VARCHAR2 (1);
//       BEGIN
//         SELECT 'x' INTO ccheck
//           FROM tdmmmain
//          WHERE doc_id = :thmmmain.doc_id AND it_code = :tdmmmain.it_code;
//          error_message ('Item already exists');
//          RAISE form_trigger_failure;
//       EXCEPTION WHEN NO_DATA_FOUND THEN
//           NULL;
//       END;

//       DECLARE
//         cit_code   mommitem.it_code%TYPE;
//       BEGIN
//         SELECT it_code INTO cit_code
//           FROM mommstok
//          WHERE wc_id = :thmmmain.from_wc_id
//            AND it_code = :tdmmmain.it_code
//            AND trans_year = :control.curryear;
//       EXCEPTION WHEN NO_DATA_FOUND THEN
//           error_message ('Item does not exist in this store  '||:from_wc_desc);
//           RAISE form_trigger_failure;
//       END;
          
//       DECLARE
//         cit_code   mommitem.it_code%TYPE;
//       BEGIN
//         SELECT it_code INTO cit_code
//           FROM mommstok
//          WHERE wc_id = :thmmmain.to_wc_id
//            AND it_code = :tdmmmain.it_code
//            AND trans_year = :control.curryear;
//       EXCEPTION WHEN NO_DATA_FOUND THEN
//           error_message ('Item does not exist in this store  '||:to_wc_desc);
//           RAISE form_trigger_failure;
//       END;
                
//       DECLARE
//         cactive   mommitem.active%TYPE;
//       BEGIN
//         SELECT it_name, mommitem.um_code, mommitem.ass_cost,
//                NVL (active, 'N')
//           INTO :tdmmmain.it_name, :tdmmmain.um_code, :tdmmmain.rate,
//                cactive
//           FROM mommitem
//          WHERE mommitem.it_code = :tdmmmain.it_code;

//         IF cactive = 'N' THEN
//           error_message ('Item is not Active');
//           RAISE form_trigger_failure;
//         END IF;
//       EXCEPTION WHEN NO_DATA_FOUND THEN
//           error_message ('Item does not exist in Master');
//           RAISE form_trigger_failure;
//       END;
//     END IF;
//   EXCEPTION WHEN NO_DATA_FOUND THEN
//       error_message ('ITEM CODE DOES NOT EXIST');
//       RAISE form_trigger_failure;
//   END;
// /*
//   DECLARE
//     ccheck   VARCHAR2 (1);
//   BEGIN
//     SELECT 'x'
//       INTO ccheck
//       FROM mommitem a, mommstok b, mommusrcat c
//      WHERE a.it_code = :tdmmmain.it_code
//        AND a.it_code = b.it_code
//        AND b.wc_id = :thmmmain.wc_id
//        AND c.user_id = :GLOBAL.g_user_id
//        AND c.trans_code = :thmmmain.trans_code
//        AND b.trans_year = :control.curryear
//        AND ROWNUM = 1
//        AND NVL(a.it_type, '0') = NVL(c.it_type, NVL(a.it_type, '0'))
//        AND NVL(a.it_base, '00') = NVL(c.it_base, NVL(a.it_base, '00'))
//        AND NVL(a.it_sub_c, '00') = NVL(c.it_sub_c, NVL(a.it_sub_c, '00'));
//   EXCEPTION
//     WHEN NO_DATA_FOUND THEN
//       error_message ('You cannot access this item.');
//       RAISE form_trigger_failure;
//   END;
// */
//   DECLARE
//     cparam_it_base     VARCHAR2 (1);
//     clast_issue_date   DATE;
//     cstore             mommwc.store_no%TYPE;
//   BEGIN
//     SELECT itmemo_no_base
//       INTO cparam_it_base
//       FROM mommparm;

//     IF cparam_it_base IS NULL THEN
//       error_message (   'Define the Parameter for Document No. Generation'
//                      || CHR (10)
//                      || 'Contact the ISD/EDP Department'
//                     );
//       RAISE form_trigger_failure;
//     END IF;

//     IF cparam_it_base = 'I' THEN
//       IF :receive_issue_flag = 'I' AND :thmmmain.ok_rej = 'O' THEN
//         BEGIN
// --            select last_issok into cLast_issue_date from mommstok
// --            where it_code = :tdmmmain.it_code
// --              and wc_id = :thmmmain.wc_id;

//           SELECT MAX (doc_date)
//             INTO clast_issue_date
//             FROM tommmain t, mommtrty y
//            WHERE t.it_code = :tdmmmain.it_code
//              AND t.wc_id = :thmmmain.wc_id
//              AND t.trans_year = :control.curryear
//              AND t.division_id = :GLOBAL.g_division_id
//              AND t.trans_code = y.trans_code
//              AND y.receive_issue_flag = 'I';

//           IF clast_issue_date IS NOT NULL THEN
//             IF TRUNC (clast_issue_date) > TRUNC (:thmmmain.doc_date) THEN
//               error_message (   'Last Issue date for this Item  -   '
//                              || ' [ '
//                              || TO_CHAR (clast_issue_date, 'DD-MM-YYYY')
//                              || ' ]'
//                             );
//               RAISE form_trigger_failure;
//             END IF;
//           END IF;
//         EXCEPTION
//           WHEN NO_DATA_FOUND THEN
//             NULL;
//         END;
//       END IF;
//     END IF;
//   EXCEPTION
//     WHEN NO_DATA_FOUND THEN
//       error_message (   'Define the Parameter for Document No. Generation'
//                      || CHR (10)
//                      || 'Contact the ISD/EDP Department'
//                     );
//       RAISE form_trigger_failure;
//   END;

// ----- Added by Rajeev on 09th oct 2010
// ----- if store type is process then we check stock from WIP else main store.
// -----------------------------
// -----------------------------
// 	declare
// 		vstkproc mommwc.store_process%type;
// 	begin
// 		begin
// 			select store_process into vstkproc
// 			  from mommwc
// 			 where wc_id = :thmmmain.from_wc_id;
// 		exception when no_data_found then
// 			null;
// 		end;
// 		if vstkproc = 'S' then
//     	:tdmmmain.store_stock := ITEM_CURRENT_OPENING_BAL(:thmmmain.from_wc_id, :tdmmmain.it_code,
//       	                                                :thmmmain.doc_date,:thmmmain.trans_year, 
//         	                                              :thmmmain.ok_rej);
// 		else
// --			error_message('Rajeev 2 '||:tdmmmain.wc_id||' , '|| :tdmmmain.it_code||' , '||:thmmmain.doc_date
// 	--		                             ||' , '|| :thmmmain.trans_year||' , '||:thmmmain.division_id);
// 			:tdmmmain.store_stock := ITEM_WIP_OPENING_DIV_WISE (:thmmmain.from_wc_id, :tdmmmain.it_code,
// 																												  :thmmmain.doc_date,:thmmmain.trans_year,  
// 																												  :thmmmain.division_id);
// 		end if;	
// 	end;
// -----------------------------
// -----------------------------
// /*
//   :tdmmmain.store_stock :=
//     item_current_opening_bal (:tdmmmain.wc_id,
//                               :tdmmmain.it_code,
//                               :thmmmain.doc_date,
//                               :control.curryear,
//                               :thmmmain.ok_rej
//                              );
// */
//   BEGIN
//     SELECT catalog_code
//       INTO :tdmmmain.catalog_code
//       FROM mosmprod
//      WHERE it_code = :tdmmmain.it_code;
//   EXCEPTION
//     WHEN NO_DATA_FOUND THEN
//       NULL;
//   END;
// END;
  

//--------------Qty----------------------


// --added by gaurav gera on 7.10.2010
// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	IF :SRS_NO IS NOT NULL THEN
// 		IF :QTY IS NOT NULL THEN
// 			IF :SRS_QTY!=:QTY THEN
// 				PROCENABLEDTRUE('SHORT_ISS_CODE_DESC');
// 				SET_ITEM_PROPERTY('SHORT_ISS_CODE_DESC', VISUAL_ATTRIBUTE, 'ENTRY');
// 			ELSE
// 				SET_ITEM_PROPERTY('SHORT_ISS_CODE_DESC', ENABLED, PROPERTY_FALSE);
// 			END IF;
// 		END IF;
// 	END IF;
// END IF;					
// ----------						
						
// If nvl(:tdmmmain.store_stock,0) = 0 then
// 	declare
// 		vstkproc mommwc.store_process%type;
// 	Begin
// --		error_message('WC Id '||:tdmmmain.wc_id);
// 		begin
// 			select store_process into vstkproc
// 			  from mommwc
// 			 where wc_id = :thmmmain.from_wc_id;
// 		exception when no_data_found then
// 			null;
// 		end;
// --		error_message('vstkproc '||vstkproc);
// 		if vstkproc = 'S' then
// --			error_message('Rajeev 1 ');
//     	:tdmmmain.store_stock := ITEM_CURRENT_OPENING_BAL(:thmmmain.from_wc_id, :tdmmmain.it_code,
//       	                                                :thmmmain.doc_date,:thmmmain.trans_year, 
//         	                                              :thmmmain.ok_rej);
// 		else
// --			error_message('Rajeev 2 '||:tdmmmain.wc_id||' , '|| :tdmmmain.it_code||' , '||:thmmmain.doc_date
// 	--		                             ||' , '|| :thmmmain.trans_year||' , '||:thmmmain.division_id);
// 			:tdmmmain.store_stock := ITEM_WIP_OPENING_DIV_WISE (:thmmmain.from_wc_id, :tdmmmain.it_code,
// 																												  :thmmmain.doc_date,:thmmmain.trans_year,  
// 																												  :thmmmain.division_id);
// 		end if;	
//   End;
// End if;

// declare 
// 	cIT_FMP_PU varchar2(1);
// 	cInv_yesno varchar2(1);
// 	cIt_type mommitem.it_type%type;
// begin
// 	If :tdmmmain.qty is not null then
//   	If :tdmmmain.qty < 0 then
//     	Error_message('Qty cannot be negative');
//     	Raise form_trigger_failure;
//   	End if;

// 		IF :di_formstatus != 'QUERY' THEN
//   		If :tdmmmain.qty = 0 /*and :thmmmain.srs_no is null*/ then
//     		Error_message('Qty cannot be Zero');
//     		Raise form_trigger_failure;
//   		End if;
// 		End if;	

// 		begin
// 			select IT_FMP_PU,It_type,Inventory_yesno 
// 			  into cIT_FMP_PU,cIt_type, cInv_yesno 
// 			  from mommitem
// 			 where it_code = :tdmmmain.it_code;
// 		exception when no_data_found then
// 			cIt_fmp_pu := 'F';
// 		end;
//    /*
//   	If :receive_issue_flag = 'I' then
//     	If nvl(:tdmmmain.qty,0) > nvl(:tdmmmain.store_stock,0) + nvl(:control.temp_qty,0) then
//       	error_message('Store Stock is less than issue qty');
//       	raise form_trigger_failure;
//     	elsIf :thmmmain.srs_no is not null and nvl(:tdmmmain.srs_qty,0)-nvl(:tdmmmain.srs_already_issue,0) < nvl(:tdmmmain.qty,0) then
//       	error_message('Issue qty cannot be greater than SRS pending Qty');
//       	raise form_trigger_failure;
//     	End if;
//   	else
//    		if cIT_FMP_PU = 'P' then
//    			if cInv_yesno = 'Y' then
//    				if cIt_type not in ('D','G','L','M','N','T','Z') then
//     				If nvl(:tdmmmain.qty,0) > nvl(:tdmmmain.store_stock,0) + nvl(:control.temp_qty,0) then
//       				error_message('Store Stock is less than Receiving qty');
//       				raise form_trigger_failure;
//     				end if;
//    				end if;
//    			end if;	
//   		end if;
//   	End if;
//   	*/
// 	else
//   	error_message('Qty cannot be empty');
//   	raise form_trigger_failure;
// 	end if;
// end;  


//------------------------short_iss_code_desc-------------------

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	IF :SRS_NO IS NOT NULL THEN
// 		IF :SRS_QTY != :QTY THEN
// 			IF :SHORT_ISS_CODE_DESC IS NULL THEN
// 					ERROR_MESSAGE('Please mention the reason for short issue');
// 					RAISE FORM_TRIGGER_FAILURE;
// 			END IF;
// 		END IF;
// 	END IF;


	
// 	IF :SHORT_ISS_CODE_DESC IS NOT NULL THEN
// 		BEGIN
// 			SELECT DESCRIPTION, CODE 
// 				INTO :SHORT_ISS_CODE_DESC, :SHORT_ISS_CODE
// 				FROM MOMMCODE
// 				WHERE CODE = :SHORT_ISS_CODE;
// 					EXCEPTION WHEN NO_DATA_FOUND THEN
// 						ERROR_MESSAGE('Invalid reason please select from the list');
// 					raise form_trigger_failure;
// 		END;
// 	END IF;
// END IF;

//--------------------------------cc------------------------------

// if :tdmmmain.cc is null then
// 	error_message('Cost Center cannot be left Blank');
// 	raise form_trigger_failure;
// else
// 	:Parameter.cc := :tdmmmain.cc;
// end if;  

// --------------- tdmmmain_batch---------------------

// post_data; 
// setdetailactivity;
// if :CONTROL.DI_FORMSTATUS <> 'QUERY' then
// 	if :thmmmain.srs_no is not null	then
// 		if :tdmmmain.it_code is not null then
// 			PROC_INSERT_BATCH_SRS;
//     end if; 	
// 	end if;
// 	POST_DATA;
// end if;



//------------------------- proc_insert_batch--------

// PROCEDURE PROC_INSERT_BATCH_SRS IS
// 	nQty_order number;
// 	ntot       number;
// 	nRct_qty   number;
// 	ncnt       number := 0;
// BEGIN
// if :control.di_formstatus in ('INSERT','UPDATE') then
// --error_message('Rajeev 1 '||:thmmmain.doc_id||' - '||:tdmmmain.it_code);
// 	begin
// 		select count(*) 
// 		  into ntot
// 		  from tdmmmain_batch
// 		 where doc_id = :thmmmain.doc_id
// 			 and it_code = :tdmmmain.it_code;
// 	exception when no_data_found then
// 		ntot := 0;
// 	end;
// --error_message('nTot : '||ntot);
// 	begin
// 		select s.srs_qty 
// 		  into nQty_order 
// 		  from thmmmain c, mdmmsrs s
// 		 where c.doc_no = :thmmmain.doc_no
// 		   and c.srs_id = s.srs_id
// 		   and s.it_code = :tdmmmain.it_code;
// 	exception when no_data_found then
// 		nQty_order :=0;
// 	end;
// --error_message('Rajeev 2 '||:thmmmain.srs_id||' - '||:tdmmmain.it_code);	
//   if nvl(ntot,0) = 0 then	
// --error_message('Rajeev 3');
// 		 declare
// 	 	 	 cursor c1 is 
// 				select distinct s.cwo_id, s.cwo_item, w.cwo_no, d.srs_qty,
// 				       v.batch_no, v.batch_date,s.srs_type, 
// 				       item_current_opening_bal_batch (:thmmmain.wc_id, :tdmmmain.it_code, :thmmmain.doc_date, 
//                                                :thmmmain.trans_year, :thmmmain.ok_rej,
//                                                v.batch_no) batch_qty
//   			  from mhmmsrs s, mdmmsrs d, thsmcwo w, mommstok_batch v 
//  				 where s.srs_id = :thmmmain.srs_id
//  				   and d.it_code = :tdmmmain.it_code
//    				 and s.srs_type = 'C'
//    				 and chk_it_batch_control(d.it_code) = 'Y'
//    				 and s.srs_id = d.srs_id
//    				 and s.cwo_id = w.cwo_id
//    				 and s.cwo_id = v.cwo_id
// 				   and s.cwo_item = v.cwo_item 	
// 				   and d.it_code = v.it_code	 
//            and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                                :tdmmmain.it_code,
//                                                :thmmmain.doc_date,
//                                                :thmmmain.trans_year,
//                                                :thmmmain.ok_rej,
//                                                v.batch_no)>0				     		 
// 			 union all
// 				select distinct s.order_id, s.cwo_item, w.order_no, d.srs_qty,
// 				       v.batch_no, v.batch_date,s.srs_type, 
// 				       item_current_opening_bal_batch (:thmmmain.wc_id, :tdmmmain.it_code, :thmmmain.doc_date, 
//                                                :thmmmain.trans_year, :thmmmain.ok_rej,
//                                                v.batch_no) batch_qty
//   			  from mhmmsrs s, mdmmsrs d, mhsmordr w, mommstok_batch v 
//  				 where s.srs_id = :thmmmain.srs_id
//  				   and d.it_code = :tdmmmain.it_code
//    				 and s.srs_type = 'S'
//    				 and chk_it_batch_control(d.it_code) = 'Y'
//    				 and s.srs_id = d.srs_id
//    				 and s.order_id = w.order_id
//    				 and s.order_id = v.cwo_id
// 				   and s.cwo_item = v.cwo_item 	
// 				   and d.it_code = v.it_code
//            and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                                :tdmmmain.it_code,
//                                                :thmmmain.doc_date,
//                                                :thmmmain.trans_year,
//                                                :thmmmain.ok_rej,
//                                                v.batch_no) > 0 
//          order by 5; 
// 		 begin
// 			for i in c1 loop
// 				go_block('tdmmmain_batch');
// 				if ncnt < :tdmmmain.qty then
// 					create_record;
// 					if i.cwo_id is not null then
// 						:tdmmmain_batch.cwo_id :=i.cwo_id;
// 						:tdmmmain_batch.cwo_no :=i.cwo_no;
// 						:tdmmmain_batch.cwo_type :=i.srs_type;
// 						:tdmmmain_batch.cwo_item := i.cwo_item;
// 						if :tdmmmain.qty < i.batch_qty then
// 							:tdmmmain_batch.batch_qty := :tdmmmain.qty;
// 						else
// 							:tdmmmain_batch.batch_qty := i.batch_qty;
// 						end if;	
// 			  	end if;
// 						:tdmmmain_batch.batch_no := i.batch_no;
// 						:tdmmmain_batch.batch_date :=  i.batch_date;
// 						ncnt := nvl(ncnt,0) + nvl(i.batch_qty,0);
// 		  		post_data;
// 		  		next_record;
// --		  		post_data;
// 		  	end if;	
// 			end loop;
// 		 end;
// 	end if;
// end if;  
// END;




// -------------- when validate record-------------------

// If :control.di_formstatus in ('INSERT','UPDATE') then
//   if :tdmmmain_batch.batch_no is not null then
//   	if :tdmmmain_batch.tot_batch_qty > :tdmmmain.qty then
//   	   error_message('Total Batch Qty Cannot be greater than Item Qty');
//   		 raise form_trigger_failure;
//   	end if;
//   end if;
// end if;   


//-----------------cwo_no -------------------------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tdmmmain_batch.cwo_no is not null then
// 		if :trans_type = 'I' then		
// 				 begin
// 						select distinct cwo_id ,'C'
//   						into :tdmmmain_batch.cwo_id, :tdmmmain_batch.cwo_type
//   						from thsmcwo
//  	 	 				 where cwo_no = :tdmmmain_batch.cwo_no
// 				   union 
// 						select distinct order_id ,'S'
//   						from mhsmordr
//  	 	 		   	 where order_no = :tdmmmain_batch.cwo_no;
// 					exception when no_data_found then
// 						null;
// 					end;		
// 	 --error_message('1 '||:tdmmmain_batch.cwo_type||'    '||:tdmmmain_batch.cwo_id);
// 	 elsif :trans_type = 'R' then
// 			begin
// 				select distinct v.cwo_id into :tdmmmain_batch.cwo_id 
//   			  from tommwipstock v, mommwc m, thsmcwo w
//  				 where w.cwo_no = :tdmmmain_batch.cwo_no
//    				 and v.it_code = :tdmmmain.it_code
//    				 and m.wc_id = v.wc_id
//    				 and m.wc_id = :thmmmain.from_wc_id
//    				 and m.division_id = :thmmmain.division_id
//    				 and v.trans_year = :global.g_fin_year
//    				 and v.cwo_id = w.cwo_id;
// 			exception when no_data_found then
// 				if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 					begin
// 						select distinct w.cwo_id into :tdmmmain_batch.cwo_id 
// 					  	from thsmcwo w
//  					 	 where w.cwo_no = :tdmmmain_batch.cwo_no
//    					 	 and w.cancel_flag = 'N'
//    					 	 --and w.end_dt > :thmmmain.doc_date
//    				--	 and w.cwo_type = 'PL'
//    				   	 and exists(select 1 from thsmprojects p
//           						     where p.cwo_id = w.cwo_id);
// 					exception when no_data_found then
// 						error_message('Please select valid work order no from help');
// 						raise form_trigger_failure;
// 					end;
// 				else
// 					begin
// 						select distinct w.order_id into :tdmmmain_batch.cwo_id 
// 					  	from mhsmordr w
//  					 	 where w.order_no = :tdmmmain_batch.cwo_no
//    					 	 and w.cancel_flag = 'N';
//    					 	 --and w.end_dt > :thmmmain.doc_date;
// 					exception when no_data_found then
// 						error_message('Please select valid work order no from help');
// 						raise form_trigger_failure;
// 					end;					
// 				end if;	
// 			end;
// 		end if;
// 	end if;
// end if;  

//--------------------------cwo_item---------------------------------



// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tdmmmain_batch.cwo_item is not null then
// -- added by pm on 28.3.2011 in case cwo type is null then get thru new function
// 		if :tdmmmain_batch.cwo_type is null then
//        	:tdmmmain_batch.cwo_type := get_cwo_type(:tdmmmain_batch.cwo_id, :tdmmmain_batch.cwo_item );
// 		end if;
// --		
// 		if :TRANS_TYPE = 'I' then
		
// 		 /*
// 			begin
// 				select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//           from mhmmsrs s, mommitem i
//          where s.cwo_item = :tdmmmain_batch.cwo_item 
//            and s.srs_id = :thmmmain.srs_id
//            and s.cwo_item = i.it_code;
// 			exception when no_data_found then
// 				begin---------------
// 					select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//             from mhmmsrs h, mdmmsrs d, mommitem i
//            where h.srs_id = :thmmmain.srs_id
//              and d.it_code = :tdmmmain.it_code
//              and h.srs_type = 'S'
//              and h.cwo_item is null
//              and h.srs_id = d.srs_id
//              and d.it_code = i.it_code;
// 				exception when no_data_found then
// 					error_message('Please select valid work order item from help');
// 					raise form_trigger_failure;
// 				end;	
// 			end;    
// 			*/       
// 		begin 
// 			select distinct it_name_long
// 			into :tdmmmain_batch.cwo_item_desc
// 			from
// 			(
// 			  select distinct get_it_name(v.cwo_item,'L') it_name_long			    
// 		      from mommstok_batch v,thsmcwo w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'C') = 'C'
// 				   and w.cwo_id = v.cwo_id
// 				   and w.cwo_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				union all
// 				select distinct get_it_name(v.cwo_item,'L') it_name_long
// 			   from tommmain_batch v,thsmcwo w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'C') = 'C'
// 				   and w.cwo_id = v.cwo_id
// 				   and w.cwo_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				union all
// 				select distinct get_it_name(v.cwo_item,'L') it_name_long
// 				  from mommstok_batch v, mhsmordr w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'S') = 'S'
// 				   and w.order_id = v.cwo_id
// 				   and w.order_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				  union all
// 				  	select distinct get_it_name(v.cwo_item,'L') it_name_long
// 				  from tommmain_batch v, mhsmordr w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'S') = 'S'
// 				   and w.order_id = v.cwo_id
// 				   and w.order_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0);
// 			 	exception when no_data_found then
// 							error_message('Please select valid work order item from help');
// 							raise form_trigger_failure;
// 			 end;	
// 	 elsif :TRANS_TYPE = 'R' then	
// 			if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 				begin
// 					select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   			 	  from tommwipstock v, mommitem i
//  				 	 where v.cwo_id = :tdmmmain_batch.cwo_id
//  				   	 and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   	 and v.it_code = :tdmmmain.it_code
// 				   	 and v.trans_year = :global.g_fin_year
// 				   	 and v.cwo_item = i.it_code;
// 				exception when no_data_found then
// 					begin
// 						select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   				  	from thsmprojects h, tdsmprojects p,  mommitem i
//  					 	 where h.cwo_id = :tdmmmain_batch.cwo_id
//  					   	 and p.it_code = :tdmmmain_batch.cwo_item
// 				     	 and h.proj_id = p.proj_id
//    					 	 and p.it_code = i.it_code;
// 					exception when no_data_found then
// 						error_message('Please select valid work order item from help');
// 						raise form_trigger_failure;
// 					end;
// 				end;
// 			elsif :tdmmmain_batch.cwo_type = 'S' then
// 					begin
// 						select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   				  	from mdsmordr p,  mommitem i
//  					 	 where p.order_id = :tdmmmain_batch.cwo_id
//  					   	 and p.it_code = :tdmmmain_batch.cwo_item
//    					 	 and p.it_code = i.it_code;
// 					exception when no_data_found then
// 						error_message('Please select valid work order item from help');
// 						raise form_trigger_failure;
// 					end;
// 			end if;
		
// 			if  :thmmmain.trans_type = 'R' then
// 				if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 					declare
// 						vcwo_type thsmcwo.cwo_type%type;
// 					begin
// 						select cwo_type into vcwo_type
// 						  from thsmcwo 
// 						 where cwo_id = :tdmmmain_batch.cwo_id;
// 						if vcwo_type = 'PL' then	 
// 							:tdmmmain_batch.batch_no := substr(:tdmmmain_batch.cwo_no,1,2)||'-'||substr(:tdmmmain_batch.cwo_no,4,2)
// 						  	                                                                 ||substr(:tdmmmain_batch.cwo_no,7,2)
// 				  					                                                        ||'-'||substr(:tdmmmain_batch.cwo_no,10)
// 				  					                                                        ||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 						else	
// 							:tdmmmain_batch.batch_no := substr(:tdmmmain_batch.cwo_no,1,3)||'-'||substr(:tdmmmain_batch.cwo_no,5,2)
// 						  	                                                                 ||substr(:tdmmmain_batch.cwo_no,8,2)
// 				  					                                                        ||'-'||substr(:tdmmmain_batch.cwo_no,11)
// 				  					                                                        ||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 						end if;	
// 					end;	
// 				elsif :tdmmmain_batch.cwo_type = 'S' then
// 					:tdmmmain_batch.batch_no := :tdmmmain_batch.cwo_no||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 				end if;	
//         :tdmmmain_batch.batch_date := :thmmmain.doc_date;				                                                              
// 			end if;	
// 		end if;
// 	end if;
// end if;  


// -----------------------batch_no -----------------------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tdmmmain_batch.batch_no is not null then
// 		Declare 
//   		cRowid rowid;
// 		Begin
//   		select rowid into cRowid
//   		  from tdmmmain_batch
//   		 where doc_id = :thmmmain.doc_id
//   		   and it_code = :tdmmmain.it_code
//   		   and cwo_id = :tdmmmain_batch.cwo_id
//   		   and cwo_item = :tdmmmain_batch.cwo_item 
//   		   and batch_no = :tdmmmain_batch.batch_no;
// 	  	if :tdmmmain_batch.rowid is null or :tdmmmain_batch.rowid <> cRowid then
// 		  	error_message('Batch No. already exists');
// 	  		raise form_trigger_failure;
// 	  	end if;
// 	  	Exception when no_data_found then
//  			null;
// 		End;

// 		if :tdmmmain_batch.batch_no != 'Old Data' then
// 			declare
// 				vbatch_no tdmmmain_batch.batch_no%type;
// 				vFifo_dt    date; 
// 			begin 			 	
// 			--if :tdmmmain_batch.batch_date is not null then
// 				/*
// 				if chk_it_batch_control(:tdmmmain_batch.it_code )='Y' then
// 					if  check_fifo_batch(:tdmmmain.It_code,:thmmmain.wc_id,:tdmmmain_batch.batch_date,
// 					 										  :thmmmain.ok_rej,:thmmmain.trans_year,
// 			                          :thmmmain.doc_date, vbatch_no, vFifo_dt,
// 			                          :tdmmmain_batch.cwo_id,:tdmmmain_batch.cwo_item )=TRUE then 
// 			              error_message('Prior batch' ||vbatch_no||'-'||vFifo_dt||' exists'); --  null;
// 					else
// 					   null;
// 					end if;
// 				end if;
// 				*/		
// 				if :tdmmmain_batch.batch_date is null then
// 					begin
// 						select distinct a.batch_date into :tdmmmain_batch.batch_date
// 						  from tommmain_batch a, tommmain b, mommtrty t
// 						 where a.it_code = :tdmmmain.it_code
// 						   and a.trans_year = :thmmmain.trans_year
// 						   and a.division_id = :thmmmain.division_id
// 						   and a.ok_rej = :thmmmain.ok_rej
// 							 and b.wc_id = :thmmmain.wc_id
// 							 and a.batch_no = :tdmmmain_batch.batch_no
// 							 and t.receive_issue_flag = 'R'
// 						   and a.division_id = b.division_id
// 						   and a.trans_year = b.trans_year
// 						   and a.doc_no = b.doc_no
// 						   and a.trans_code = b.trans_code
// 						   and a.it_code = b.it_code
// 							 and t.trans_code = a.trans_code;
// 							 /*
// 							 and item_current_opening_bal_batch (:thmmmain.wc_id,
// 							                                     :tdmmmain.it_code,
// 							                                     :thmmmain.doc_date, 
// 							                                     :thmmmain.trans_year,
// 							                                     :thmmmain.ok_rej,
// 							                                     a.batch_no,
// 							                                     :tdmmmain_batch.cwo_id,
// 							                                     :tdmmmain_batch.cwo_item ) > 0;		 */
// 								exception when no_data_found then
// 												    error_message('Invalid Batch or no balance quantity');
// 												    raise form_trigger_failure;
// 													when too_many_rows then
// 													   error_message('Same batch with more than 1 date...Pls select from list');
// 													   raise form_trigger_failure;							
// 								end;
// 				end if;	 
// ----------------
// 				--end if;
// 			end;
// 				:batch_store_qty := item_current_opening_bal_batch(:tdmmmain.wc_id,:tdmmmain.it_code,:thmmmain.doc_date,
// 		                             		                       :Control.Curryear,:thmmmain.ok_rej,:tdmmmain_batch.batch_no);
// 		 else
// 				:batch_store_qty := item_current_opening_bal_batch(:tdmmmain.wc_id,:tdmmmain.it_code,:thmmmain.doc_date,
// 		                             		                       :Control.Curryear,:thmmmain.ok_rej,:tdmmmain_batch.batch_no);
//      end if;		                                                   
// 	else
// 		if :tdmmmain_batch.cwo_id is not null then
// 			if get_item_batch_control_flag(:tdmmmain_batch.it_code) = 'Y' then
// 				error_message('Batch No. must for this item');
// 				raise form_trigger_failure;
// 			end if;
// 		end if;	
//   end if;		                                                   
// end if;
  

// ------------------------------------ batch_qty --------------------------------


// if :control.di_formstatus in ('INSERT','UPDATE') then
// 		If :tdmmmain_batch.batch_qty is not null then
// 		  If :tdmmmain_batch.batch_qty < 0 then
// 		    Error_message('Qty cannot be negative');
// 		    Raise form_trigger_failure;
// 		  End if;
		
// 		  If :tdmmmain_batch.batch_qty = 0 /*and :thmmmain.srs_no is null*/ then
// 		    Error_message('Qty cannot be Zero');
// 		    Raise form_trigger_failure;
// 		  End if;
		
// 		  If :receive_issue_flag = 'I' then
// 		    If nvl(:tdmmmain_batch.batch_qty,0) > nvl(:tdmmmain_batch.batch_store_qty,0)/* + nvl(:control.temp_qty,0)*/ then
// 		      error_message('Batch Store Stock is less than batch issue qty');
// 		      raise form_trigger_failure;
// 		    End if;
// 		  End if;

// 			if nvl(:tdmmmain_batch.tot_batch_qty,0) > nvl(:tdmmmain.qty,0) then
//   		 error_message('Batch Qty Cannot be greater than Item Qty');
//   		 raise form_trigger_failure;
// 			end if;
			
// 		else
// 		  error_message('Qty cannot be empty');
// 		  raise form_trigger_failure;
// 		end if;

// end if;   



//-------------------------- user save---------------------------------------------   


// DECLARE
//   cdoc_no           tommmain.doc_no%TYPE;
//   cauthorised_req   mommtrty.authorised_req%TYPE;
// BEGIN
//   IF NOT checkdetailentry ('TDMMMAIN', 'IT_CODE', TRUE) THEN
//     RAISE form_trigger_failure;
//   END IF;
//   post_data;        
//   CHECK_BATCH;
//   valid_batch_qty;
//   GO_BLOCK ('THMMMAIN');

//   IF :control.di_formstatus = 'INSERT' THEN
//     setupdateallowed ('THMMMAIN', 1);
//     gendocno;
//     post_data;
//     check_no_of_records;

//     IF SUBSTR(:thmmmain.doc_no, 1, 1) = '~' THEN
//       error_message ('PROBLEM IN DATA ENTRY');
//       RAISE form_trigger_failure;
//     END IF;

//     IF :SYSTEM.form_status <> 'QUERY' THEN
//       error_message (DBMS_ERROR_TEXT);
//       error_message ('problem in Saving, contact EDP');
//       RAISE form_trigger_failure;
//     END IF;

//     BEGIN
//       SELECT NVL (authorised_req, 'N')
//         INTO cauthorised_req
//         FROM mommtrty
//        WHERE trans_code = :thmmmain.trans_code;
// ERROR_MESSAGE('1');
//       IF cauthorised_req = 'Y' THEN
//         error_message ('Authorisation is Required for this Transaction.');
//       ELSIF cauthorised_req = 'N' THEN
//        -- procgeneratecontraentry;
//         update_tommmain (:thmmmain.doc_id,
//                          :thmmmain.division_id,
//                          :thmmmain.trans_year,
//                          :thmmmain.doc_no,
//                          :thmmmain.trans_code
//                         );
//       END IF;
//     EXCEPTION
//       WHEN NO_DATA_FOUND THEN
//         NULL;
//     END;
//     COMMIT_FORM;
//  ERROR_MESSAGE('2');   
//     if confirm('DO YOU WANT TO PRINT THE MEMO ? ') = ALERT_BUTTON1 then
//     	EXECUTE_TRIGGER('USER_PRINT');
//     END IF;	
//    -- COMMIT_FORM;

//     IF :SYSTEM.form_status <> 'QUERY' THEN
//       error_message ('problem in Saving, contact EDP');
//       RAISE form_trigger_failure;
//     END IF;

//     error_message ('Document no ' || :thmmmain.doc_no || ' is generated');

//     BEGIN
//       IF cauthorised_req = 'Y' THEN
//         IF confirm ('Want to Print this Document ?') = alert_button1 THEN
//           EXECUTE_TRIGGER ('user_print');
//         END IF;
//       END IF;

//       GO_BLOCK ('THMMMAIN');
//       GO_ITEM ('THMMMAIN.OK_REJ');
// --      CREATE_RECORD;
//       setupdateallowed ('THMMMAIN', 0);
//     END;
//   ELSIF :control.di_formstatus = 'UPDATE' THEN
//     BEGIN
//       SELECT NVL (authorised_req, 'N')
//         INTO cauthorised_req
//         FROM mommtrty
//        WHERE trans_code = :thmmmain.trans_code;

//       IF cauthorised_req = 'Y' THEN
//         error_message ('Authorisation is Required for this Transaction .');
//       ELSIF cauthorised_req = 'N' THEN
//         post_data;
//         procgeneratecontraentry;
// /*
// error_message('Befor update tommain table  '||:thmmmain.doc_id||', '
//                                             ||:thmmmain.division_id||', '||:thmmmain.trans_year||', '
//                                             ||:thmmmain.doc_no||', '||:thmmmain.trans_code);
// */                                                            
//         update_tommmain (:thmmmain.doc_id,
//                          :thmmmain.division_id,
//                          :thmmmain.trans_year,
//                          :thmmmain.doc_no,
//                          :thmmmain.trans_code
//                         );
//       END IF;
//     EXCEPTION
//       WHEN NO_DATA_FOUND THEN
//         NULL;
//     END;

//     COMMIT_FORM;
// /*
//     setinsertallowed ('THMMMAIN', 0);
//     setupdateallowed ('THMMMAIN', 0);
//     setdeleteallowed ('THMMMAIN', 0);
//     setinsertallowed ('TDMMMAIN', 0);
//     setupdateallowed ('TDMMMAIN', 0);
//     setdeleteallowed ('TDMMMAIN', 0);
//     SetInsertAllowed('TDMMMAIN_BATCH', 0);
//     SetUpdateAllowed('TDMMMAIN_BATCH', 0);
//     SetDeleteAllowed('TDMMMAIN_BATCH', 0);
//     GO_BLOCK ('THMMMAIN');
//     :control.di_formstatus := 'QUERY';
//     set_user_activity;
// */
//   END IF;
//     setinsertallowed ('THMMMAIN', 0);
//     setupdateallowed ('THMMMAIN', 0);
//     setdeleteallowed ('THMMMAIN', 0);
//     setinsertallowed ('TDMMMAIN', 0);
//     setupdateallowed ('TDMMMAIN', 0);
//     setdeleteallowed ('TDMMMAIN', 0);
//     SetInsertAllowed('TDMMMAIN_BATCH', 0);
//     SetUpdateAllowed('TDMMMAIN_BATCH', 0);
//     SetDeleteAllowed('TDMMMAIN_BATCH', 0);  
//     GO_BLOCK ('THMMMAIN');
//     :control.di_formstatus := 'QUERY';
//     set_user_activity;    
// EXCEPTION
//   WHEN form_trigger_failure THEN
//     RAISE;
//   WHEN OTHERS THEN
//     error_message (DBMS_ERROR_TEXT);
//     RAISE;
// END;   


// user_update  

// begin
// 	CheckOpenPeriod;
// exception when form_trigger_failure then
// 	return;
// end;
// if :THMMMAIN.authorised = 'Y' then
//   error_message('You connot Modify Authorised Inter Transfer Memo');
//   raise form_trigger_failure;
// end if;
// If :thmmmain.cancel_memo = 'Y' then
//     error_message('This Inter Transfer Memo has already been cancelled');
//     raise form_trigger_failure;
// End if;
// UserStoreCheck;

// if :trans_type = 'R' then
//   if FuncCheck_StoreType then
//      error_message('This Receipt transaction cannot be modify.' || chr(10) ||
//                   'The material received from other WareHouse');
//      raise form_trigger_failure;
//   end if;
// end if;

// if :THMMMAIN.TRANS_CODE <= 100 then
//   error_message('This entry is automatically generated, You connot Modify');
//   raise form_trigger_failure;
// end if;

// :CONTROL.DI_FORMSTATUS := 'UPDATE';
// WHEN_ACTIVITY_BUTTON_PRESSED;

// SetUpdateAllowed('THMMMAIN', 1);

// SetInsertAllowed('TDMMMAIN', 1);
// SetUpdateAllowed('TDMMMAIN', 1);
// SetDeleteAllowed('TDMMMAIN', 1);

// SetInsertAllowed('TDMMMAIN_BATCH', 1);
// SetUpdateAllowed('TDMMMAIN_BATCH', 1);
// SetDeleteAllowed('TDMMMAIN_BATCH', 1);

// go_block('THMMMAIN');  


// ------------------RG ITEMS--------------------------------   

// select a.it_name, a.it_code, a.um_code , catalog_code 
// from mommitem a, mommstok b, mommusrcat c , mosmprod s
// where a.it_code = b.it_code 
// and b.wc_id = :thmmmain.wc_id 
// and c.user_id = :global.g_user_id 
// and b.trans_year = :control.curryear
// and c.trans_code = :thmmmain.trans_code 
// and a.it_code = s.it_code (+)
// and nvl(a.it_type,'0') =  decode(nvl(c.it_type,'0'), '0', nvl(a.it_type,'0'), nvl(c.it_type,'0')) 
// and nvl(a.it_base,'00') =  decode(nvl(c.it_base,'0'), '00', nvl(a.it_base,'0'), nvl(c.it_base,'0')) 
// and nvl(a.it_sub_c,'00') = decode(nvl(c.it_sub_c,'0'), '00', nvl(a.it_sub_c,'0'), nvl(c.it_sub_c,'0'))
// and a.active = 'Y'
// order by a.it_code  


// -----------------------cwo item-----------------------  

// select distinct get_it_name(v.cwo_item,'L') it_name_long, v.cwo_item
//   from mommstok_batch v,thsmcwo w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'C') = 'C'
//    and w.cwo_id = v.cwo_id
//    and w.cwo_id = :tdmmmain_batch.cwo_id
//    and c.c_code = w.c_code
// and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )   
// and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union
// select distinct get_it_name(v.cwo_item,'L') it_name_long, v.cwo_item
//   from tommmain_batch v,thsmcwo w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'C') = 'C'
//    and w.cwo_id = v.cwo_id
//    and w.cwo_id = :tdmmmain_batch.cwo_id
//    and c.c_code = w.c_code
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union
// select distinct get_it_name(v.cwo_item,'L') it_name_long, v.cwo_item
//   from mommstok_batch v, mhsmordr w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'S') = 'S'
//    and w.order_id = v.cwo_id
//    and w.order_id = :tdmmmain_batch.cwo_id
//    and c.c_code = w.c_code
// and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )   
// and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                       :thmmmain.trans_year,		                                                                         :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union
// select distinct get_it_name(v.cwo_item,'L') it_name_long, v.cwo_item
//   from tommmain_batch v, mhsmordr w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'S') = 'S'
//    and w.order_id = v.cwo_id
//    and w.order_id = :tdmmmain_batch.cwo_id
//    and c.c_code = w.c_code
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                       :thmmmain.trans_year,		                                                                         :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union
// select distinct it_name_long, v.cwo_item
//   from tommwipstock v, mommwc m, mommitem i
//  where :TRANS_TYPE = 'R'
//    and v.it_code = :tdmmmain.it_code
//    and m.wc_id = v.wc_id
//    and m.wc_id = :thmmmain.from_wc_id
//    and m.division_id = :thmmmain.division_id
//    and v.trans_year = :global.g_fin_year
//    and v.cwo_id = :tdmmmain_batch.cwo_id
//    and v.cwo_item = i.it_code
// union all
// select distinct it_name_long, p.it_code cwo_item
//   from thsmcwo w, thsmprojects h, tdsmprojects p,  mommitem i
//  where :TRANS_TYPE = 'R'
//    and w.cwo_id = :tdmmmain_batch.cwo_id
//    and :tdmmmain_batch.cwo_type = 'C'
// /*   and w.cwo_type = 'PL'*/
//    and w.cwo_id = h.cwo_id
//    and h.proj_id = p.proj_id
//    and p.it_code = i.it_code
// union all
// select distinct it_name_long, o.it_code cwo_item
//   from mdsmordr o, mommitem i
//  where :TRANS_TYPE = 'R'
//    and o.order_id = :tdmmmain_batch.cwo_id
//    and :tdmmmain_batch.cwo_type = 'S'
//    and o.it_code = i.it_code
//  order by 1



// ---------------------------------RG CWO-----------------------  

// select distinct w.cwo_no, w.c_code, v.cwo_id,nvl(v.cwo_type,'C') cwo_type,
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from mommstok_batch v,thsmcwo w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'C') = 'C'
//    and w.cwo_id = v.cwo_id
//    and c.c_code = w.c_code
//    and not exists(select 1 from tommmain_batch a
// 	                  where v.it_code = a.it_code
// 		            and v.wc_id = a.wc_id
//                             and v.trans_year = a.trans_year
// 			    and v.cwo_id = a.cwo_id
// 			    and v.cwo_item = a.cwo_item
// 			    and v.batch_no = a.batch_no
// 			    and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 			    )   
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union all
// select distinct w.cwo_no, w.c_code, v.cwo_id,nvl(v.cwo_type,'C') cwo_type,
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from tommmain_batch v,thsmcwo w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'C') = 'C'
//    and w.cwo_id = v.cwo_id
//    and c.c_code = w.c_code
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union all
// select distinct w.order_no, w.c_code, v.cwo_id, v.cwo_type,
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from mommstok_batch v, mhsmordr w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'S') = 'S'
//    and w.order_id = v.cwo_id
//    and c.c_code = w.c_code
//    and not exists(select 1 from tommmain_batch a
// 	                  where v.it_code = a.it_code
// 		            and v.wc_id = a.wc_id
//                             and v.trans_year = a.trans_year
// 			    and v.cwo_id = a.cwo_id
// 			    and v.cwo_item = a.cwo_item
// 			    and v.batch_no = a.batch_no
// 			    and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 			    )      
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union all
// select distinct w.order_no, w.c_code, v.cwo_id, v.cwo_type,
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from tommmain_batch v, mhsmordr w, mosmcust c
//  where v.it_code = :tdmmmain.it_code
//    and :TRANS_TYPE = 'I'
//    and v.wc_id = :thmmmain.from_wc_id
//    and v.trans_year = :global.g_fin_year
//    and nvl(v.cwo_type,'S') = 'S'
//    and w.order_id = v.cwo_id
//    and c.c_code = w.c_code
//    and item_current_opening_bal_batch (:thmmmain.wc_id,
//                                        :tdmmmain.it_code,
// 	                               :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
//                                        v.batch_no) > 0
// union all
// select distinct w.cwo_no, w.c_code,v.cwo_id, 'C' cwo_type, 
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from tommwipstock v, mommwc m, thsmcwo w, mosmcust c
//  where :TRANS_TYPE = 'R'
//    and v.it_code = :tdmmmain.it_code
//    and m.wc_id = v.wc_id
//    and m.wc_id = :thmmmain.from_wc_id
//    and m.division_id = :thmmmain.division_id
//    and v.trans_year = :global.g_fin_year
//    and v.cwo_id = w.cwo_id
//    and w.c_code = c.c_code
// union all
// select distinct w.cwo_no, w.c_code,w.cwo_id, 'C' cwo_type, 
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from thsmcwo w, mosmcust c
//  where :TRANS_TYPE = 'R'
//    and w.cancel_flag = 'N'
// /*   and w.cwo_type = 'PL'
//    and end_dt > :thmmmain.doc_date*/
//    and w.c_code = c.c_code
//    and exists(select 1 from thsmprojects p
//                where p.cwo_id = w.cwo_id)
// union all
// select distinct w.order_no, w.c_code,w.order_id, 'S' cwo_type, 
// decode(c.c_name1,null,c.c_name,c.c_name||' - '||c.c_name1) c_name
//   from mhsmordr w, mosmcust c
//  where :TRANS_TYPE = 'R'
//    /*and end_dt > :thmmmain.doc_date*/
//    and inv_type not in ('B','V')
//    and w.c_code = c.c_code
//  order by 1      


// ------------- short issue quantity-----------------------------  

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	IF :SRS_NO IS NOT NULL THEN
// 		IF :SRS_QTY != :QTY THEN
// 			IF :SHORT_ISS_CODE_DESC IS NULL THEN
// 					ERROR_MESSAGE('Please mention the reason for short issue');
// 					RAISE FORM_TRIGGER_FAILURE;
// 			END IF;
// 		END IF;
// 	END IF;


	
// 	IF :SHORT_ISS_CODE_DESC IS NOT NULL THEN
// 		BEGIN
// 			SELECT DESCRIPTION, CODE 
// 				INTO :SHORT_ISS_CODE_DESC, :SHORT_ISS_CODE
// 				FROM MOMMCODE
// 				WHERE CODE = :SHORT_ISS_CODE;
// 					EXCEPTION WHEN NO_DATA_FOUND THEN
// 						ERROR_MESSAGE('Invalid reason please select from the list');
// 					raise form_trigger_failure;
// 		END;
// 	END IF;
// END IF;



// cwo_no 

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tdmmmain_batch.cwo_no is not null then
// 		if :trans_type = 'I' then		
// 				 begin
// 						select distinct cwo_id ,'C'
//   						into :tdmmmain_batch.cwo_id, :tdmmmain_batch.cwo_type
//   						from thsmcwo
//  	 	 				 where cwo_no = :tdmmmain_batch.cwo_no
// 				   union 
// 						select distinct order_id ,'S'
//   						from mhsmordr
//  	 	 		   	 where order_no = :tdmmmain_batch.cwo_no;
// 					exception when no_data_found then
// 						null;
// 					end;		
// 	 --error_message('1 '||:tdmmmain_batch.cwo_type||'    '||:tdmmmain_batch.cwo_id);
// 	 elsif :trans_type = 'R' then
// 			begin
// 				select distinct v.cwo_id into :tdmmmain_batch.cwo_id 
//   			  from tommwipstock v, mommwc m, thsmcwo w
//  				 where w.cwo_no = :tdmmmain_batch.cwo_no
//    				 and v.it_code = :tdmmmain.it_code
//    				 and m.wc_id = v.wc_id
//    				 and m.wc_id = :thmmmain.from_wc_id
//    				 and m.division_id = :thmmmain.division_id
//    				 and v.trans_year = :global.g_fin_year
//    				 and v.cwo_id = w.cwo_id;
// 			exception when no_data_found then
// 				if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 					begin
// 						select distinct w.cwo_id into :tdmmmain_batch.cwo_id 
// 					  	from thsmcwo w
//  					 	 where w.cwo_no = :tdmmmain_batch.cwo_no
//    					 	 and w.cancel_flag = 'N'
//    					 	 --and w.end_dt > :thmmmain.doc_date
//    				--	 and w.cwo_type = 'PL'
//    				   	 and exists(select 1 from thsmprojects p
//           						     where p.cwo_id = w.cwo_id);
// 					exception when no_data_found then
// 						error_message('Please select valid work order no from help');
// 						raise form_trigger_failure;
// 					end;
// 				else
// 					begin
// 						select distinct w.order_id into :tdmmmain_batch.cwo_id 
// 					  	from mhsmordr w
//  					 	 where w.order_no = :tdmmmain_batch.cwo_no
//    					 	 and w.cancel_flag = 'N';
//    					 	 --and w.end_dt > :thmmmain.doc_date;
// 					exception when no_data_found then
// 						error_message('Please select valid work order no from help');
// 						raise form_trigger_failure;
// 					end;					
// 				end if;	
// 			end;
// 		end if;
// 	end if;
// end if;


// cwo_item  

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tdmmmain_batch.cwo_item is not null then
// -- added by pm on 28.3.2011 in case cwo type is null then get thru new function
// 		if :tdmmmain_batch.cwo_type is null then
//        	:tdmmmain_batch.cwo_type := get_cwo_type(:tdmmmain_batch.cwo_id, :tdmmmain_batch.cwo_item );
// 		end if;
// --		
// 		if :TRANS_TYPE = 'I' then
		
// 		 /*
// 			begin
// 				select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//           from mhmmsrs s, mommitem i
//          where s.cwo_item = :tdmmmain_batch.cwo_item 
//            and s.srs_id = :thmmmain.srs_id
//            and s.cwo_item = i.it_code;
// 			exception when no_data_found then
// 				begin---------------
// 					select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//             from mhmmsrs h, mdmmsrs d, mommitem i
//            where h.srs_id = :thmmmain.srs_id
//              and d.it_code = :tdmmmain.it_code
//              and h.srs_type = 'S'
//              and h.cwo_item is null
//              and h.srs_id = d.srs_id
//              and d.it_code = i.it_code;
// 				exception when no_data_found then
// 					error_message('Please select valid work order item from help');
// 					raise form_trigger_failure;
// 				end;	
// 			end;    
// 			*/       
// 		begin 
// 			select distinct it_name_long
// 			into :tdmmmain_batch.cwo_item_desc
// 			from
// 			(
// 			  select distinct get_it_name(v.cwo_item,'L') it_name_long			    
// 		      from mommstok_batch v,thsmcwo w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'C') = 'C'
// 				   and w.cwo_id = v.cwo_id
// 				   and w.cwo_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				union all
// 				select distinct get_it_name(v.cwo_item,'L') it_name_long
// 			   from tommmain_batch v,thsmcwo w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'C') = 'C'
// 				   and w.cwo_id = v.cwo_id
// 				   and w.cwo_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                                   :thmmmain.trans_year,		                                                                                     :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				union all
// 				select distinct get_it_name(v.cwo_item,'L') it_name_long
// 				  from mommstok_batch v, mhsmordr w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'S') = 'S'
// 				   and w.order_id = v.cwo_id
// 				   and w.order_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and not exists(select 1 from tommmain_batch a
// 	                         where v.it_code = a.it_code
// 		                         and v.wc_id = a.wc_id
//                              and v.trans_year = a.trans_year
// 													   and v.cwo_id = a.cwo_id
// 													   and v.cwo_item = a.cwo_item
// 													   and v.batch_no = a.batch_no
// 													   and nvl(trunc(batch_date),trunc(sysdate)) = nvl(trunc(batch_date),trunc(sysdate))
// 													   )
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0
// 				  union all
// 				  	select distinct get_it_name(v.cwo_item,'L') it_name_long
// 				  from tommmain_batch v, mhsmordr w, mosmcust c
// 				 where v.it_code = :tdmmmain.it_code
// 				   and v.wc_id = :thmmmain.from_wc_id
// 				   and v.trans_year = :global.g_fin_year
// 				   and nvl(v.cwo_type,'S') = 'S'
// 				   and w.order_id = v.cwo_id
// 				   and w.order_id = :tdmmmain_batch.cwo_id
// 				   and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   and c.c_code = w.c_code
// 				   and item_current_opening_bal_batch (:thmmmain.wc_id,
// 				                                       :tdmmmain.it_code,
// 					                                     :thmmmain.doc_date,                                                                                              :thmmmain.trans_year,		                                                                                :thmmmain.ok_rej,
// 				                                       v.batch_no) > 0);
// 			 	exception when no_data_found then
// 							error_message('Please select valid work order item from help');
// 							raise form_trigger_failure;
// 			 end;	
// 	 elsif :TRANS_TYPE = 'R' then	
// 			if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 				begin
// 					select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   			 	  from tommwipstock v, mommitem i
//  				 	 where v.cwo_id = :tdmmmain_batch.cwo_id
//  				   	 and v.cwo_item = :tdmmmain_batch.cwo_item
// 				   	 and v.it_code = :tdmmmain.it_code
// 				   	 and v.trans_year = :global.g_fin_year
// 				   	 and v.cwo_item = i.it_code;
// 				exception when no_data_found then
// 					begin
// 						select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   				  	from thsmprojects h, tdsmprojects p,  mommitem i
//  					 	 where h.cwo_id = :tdmmmain_batch.cwo_id
//  					   	 and p.it_code = :tdmmmain_batch.cwo_item
// 				     	 and h.proj_id = p.proj_id
//    					 	 and p.it_code = i.it_code;
// 					exception when no_data_found then
// 						error_message('Please select valid work order item from help');
// 						raise form_trigger_failure;
// 					end;
// 				end;
// 			elsif :tdmmmain_batch.cwo_type = 'S' then
// 					begin
// 						select distinct it_name_long into :tdmmmain_batch.cwo_item_desc
//   				  	from mdsmordr p,  mommitem i
//  					 	 where p.order_id = :tdmmmain_batch.cwo_id
//  					   	 and p.it_code = :tdmmmain_batch.cwo_item
//    					 	 and p.it_code = i.it_code;
// 					exception when no_data_found then
// 						error_message('Please select valid work order item from help');
// 						raise form_trigger_failure;
// 					end;
// 			end if;
		
// 			if  :thmmmain.trans_type = 'R' then
// 				if nvl(:tdmmmain_batch.cwo_type,'C') = 'C' then
// 					declare
// 						vcwo_type thsmcwo.cwo_type%type;
// 					begin
// 						select cwo_type into vcwo_type
// 						  from thsmcwo 
// 						 where cwo_id = :tdmmmain_batch.cwo_id;
// 						if vcwo_type = 'PL' then	 
// 							:tdmmmain_batch.batch_no := substr(:tdmmmain_batch.cwo_no,1,2)||'-'||substr(:tdmmmain_batch.cwo_no,4,2)
// 						  	                                                                 ||substr(:tdmmmain_batch.cwo_no,7,2)
// 				  					                                                        ||'-'||substr(:tdmmmain_batch.cwo_no,10)
// 				  					                                                        ||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 						else	
// 							:tdmmmain_batch.batch_no := substr(:tdmmmain_batch.cwo_no,1,3)||'-'||substr(:tdmmmain_batch.cwo_no,5,2)
// 						  	                                                                 ||substr(:tdmmmain_batch.cwo_no,8,2)
// 				  					                                                        ||'-'||substr(:tdmmmain_batch.cwo_no,11)
// 				  					                                                        ||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 						end if;	
// 					end;	
// 				elsif :tdmmmain_batch.cwo_type = 'S' then
// 					:tdmmmain_batch.batch_no := :tdmmmain_batch.cwo_no||'-'||to_char(:thmmmain.doc_date,'ddmmyyyy');						
// 				end if;	
//         :tdmmmain_batch.batch_date := :thmmmain.doc_date;				                                                              
// 			end if;	
// 		end if;
// 	end if;
// end if;




///user update

// begin
// 	CheckOpenPeriod;
// exception when form_trigger_failure then
// 	return;
// end;
// if :THMMMAIN.authorised = 'Y' then
//   error_message('You connot Modify Authorised Inter Transfer Memo');
//   raise form_trigger_failure;
// end if;
// If :thmmmain.cancel_memo = 'Y' then
//     error_message('This Inter Transfer Memo has already been cancelled');
//     raise form_trigger_failure;
// End if;
// UserStoreCheck;

// if :trans_type = 'R' then
//   if FuncCheck_StoreType then
//      error_message('This Receipt transaction cannot be modify.' || chr(10) ||
//                   'The material received from other WareHouse');
//      raise form_trigger_failure;
//   end if;
// end if;

// if :THMMMAIN.TRANS_CODE <= 100 then
//   error_message('This entry is automatically generated, You connot Modify');
//   raise form_trigger_failure;
// end if;

// :CONTROL.DI_FORMSTATUS := 'UPDATE';
// WHEN_ACTIVITY_BUTTON_PRESSED;

// SetUpdateAllowed('THMMMAIN', 1);

// SetInsertAllowed('TDMMMAIN', 1);
// SetUpdateAllowed('TDMMMAIN', 1);
// SetDeleteAllowed('TDMMMAIN', 1);

// SetInsertAllowed('TDMMMAIN_BATCH', 1);
// SetUpdateAllowed('TDMMMAIN_BATCH', 1);
// SetDeleteAllowed('TDMMMAIN_BATCH', 1);

// go_block('THMMMAIN');
