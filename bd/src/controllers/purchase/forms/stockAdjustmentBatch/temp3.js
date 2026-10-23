// item location master 

// EXISTS (SELECT 'X' FROM MOMMSTOK S
// WHERE S.WC_ID = MOMMWC.WC_ID)
// AND DIVISION_ID = :GLOBAL.G_DIVISION_ID  //-----------  MOMMWC  


// post query  ----------- MOMMSTOCK  
// table name --  mdmmstok_location  

// trans_year = global_fin_year   

// when validate_record 
// --error_message(:control.di_formstatus);
// if :control.di_formstatus in ('ÍNSERT','UPDATE') then
// --error_message(:MOMMSTOK.PHYSICAL_LOC);
// 	if :MOMMSTOK.PHYSICAL_LOCA is null then
// 		error_message('PHYSICAL LOCATION CAN NOT BE BLANK');
// 		 raise form_trigger_failure;
// 	end if;

//  	if :MOMMSTOK.RACK_NO is null then
// 						 	error_message('RACK NO CAN NOT BE BLANK');
// 						 	 raise form_trigger_failure;
//  	end if;
//   if :MOMMSTOK.BIN_NO is null then
// 			 	error_message('BIN NO CAN NOT BE BLANK');
// 			 	 raise form_trigger_failure;
//   end if;
  
//   if :MOMMSTOK.LOC_QTY is null then
// 			 	error_message('LOCATION QTY CANNOT BE BLANK');
// 			 	 raise form_trigger_failure;
//   end if;
  
//   --error_message('wvr 1');
//   if :MOMMSTOK.IT_CODE is not null then
//   	declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cfound
// 					  from mdmmstok_location
// 					where trans_year = :global.g_fin_year 
// 						and wc_id = :MOMMWC.WC_ID
// 					  and it_code = :MOMMSTOK.IT_CODE
// 					  and physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 					  and rack_no = :MOMMSTOK.RACK_NO
// 					  and bin_no = :MOMMSTOK.BIN_NO
// 					  and rownum = 1;
// 					error_message('Item Linked with this Physical Location No, BIN no, Rack No already exists');
// 					raise form_trigger_failure;
// 				exception when no_data_found then
//            null;
// 				end;
//       end;
// 		end if;
//   --error_message('wvr 2 '||:MOMMSTOK.PHYSICAL_LOCA||:MOMMSTOK.RACK_NO|| :MOMMSTOK.BIN_NO);
//      :MOMMSTOK.COORDINATE_NO := :MOMMSTOK.PHYSICAL_LOCA||:MOMMSTOK.RACK_NO|| :MOMMSTOK.BIN_NO;

// end if;  


// pre-insert  

// :mommstok.trans_year := :GLOBAL.G_FIN_YEAR;  


// ------------------------validation ---------------------------- 

// ---------------it_code----------------  

// if :control.di_formstatus in ('INSERT') then
// 	if :mommstok.it_code is null then
// 		error_message('Item code cannot be left blsnk');
// 		raise form_trigger_failure;
// 	end if;
// 	if :mommstok.it_code is not null then
// 		begin
// 		  select it_name into :mommstok.description
// 		    from mommstok m, mommitem i
// 		  where m.trans_year = :global.g_fin_year
// 		    and m.wc_id =  :mommwc.wc_id
// 		    and i.it_code = :mommstok.it_code
// 		    and i.it_code = m.it_code;
// 		exception when no_data_found then
// 			error_message('Either Item not linked with this store in this Fin year or invalid Item code');
// 			raise form_trigger_failure;
// 		end;
//   end if;	
// end if; 

//--------------------------- physical_loca ------------------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	/*if :MOMMSTOK.PHYSICAL_LOC is null then
// 		error_message('PHYSICAL LOCATION CAN NOT BE BLANK');
// 		 raise form_trigger_failure;
// 	end if;*/
// --set_item_property('RACK_NO', disabled, PROPERTY_FALSE);
// 	if :MOMMSTOK.PHYSICAL_LOCA is not null then
// 		declare
// 			cFound varchar2(1);
// 		begin
// 			begin
// 				select 'Y' into cFound
// 				  from mommitem_locations
// 				where physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 				  and rownum = 1;
// 			exception when no_data_found then
// 				error_message('Invalid Physical location... select from list');
// 				raise form_trigger_failure;
// 			end;
// 		end;

//   end if;
// end if;
  

// ----------reck_no-------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	declare
// 		cn VARCHAR2(20);
// 		CHK_BUTTON NUMBER;
// 		cRACK_NO   VARCHAR2(10);
// 	begin
		 	
// 		 	/*if :MOMMSTOK.RACK_NO is null then
// 								 	error_message('RACK NO CAN NOT BE BLANK');
// 								 	 raise form_trigger_failure;
// 		 	end if;*/
	
// 		if :MOMMSTOK.RACK_NO is not null then
// 			declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cFound
// 					  from mommitem_locations
// 					where physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 						and rack_no = :MOMMSTOK.RACK_NO
// 					  and rownum = 1;
// 				exception when no_data_found then
// 					error_message('Invalid rack no/Not linked with physical location in Location master... select from list');
// 					raise form_trigger_failure;
// 				end;
// 			end;
	
// 	  end if;
	
	
// 	END;
// end if;

//-----------Bin_no_--------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	  /*if :MOMMSTOK.BIN_NO is null then
// 				 	error_message('BIN NO CAN NOT BE BLANK');
// 				 	 raise form_trigger_failure;
// 	  end if;*/
	
	
// 		if :MOMMSTOK.BIN_NO is not null then
// 			declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cFound
// 					  from mommitem_locations
// 					where physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 					  and rack_no = :MOMMSTOK.RACK_NO
// 					  and bin_no = :MOMMSTOK.BIN_NO
// 					  and rownum = 1;
// 				exception when no_data_found then
// 					error_message('Invalid BIN no/Not linked with physical location/rack no in Location master... select from list');
// 					raise form_trigger_failure;
// 				end;
// 			end;
// 	  end if;
//   if :MOMMSTOK.IT_CODE is not null then
//   /*	error_message(':global.g_fin_year ' || :global.g_fin_year);
//   	error_message(':MOMMWC.WC_ID ' || :MOMMWC.WC_ID);
//   	error_message(':MOMMSTOK.IT_CODE ' || :MOMMSTOK.IT_CODE);
//   	error_message(':MOMMSTOK.PHYSICAL_LOCA ' || :MOMMSTOK.PHYSICAL_LOCA);
//   	error_message(':MOMMSTOK.RACK_NO ' || :MOMMSTOK.RACK_NO);
//   	error_message(':MOMMSTOK.BIN_NO ' || :MOMMSTOK.BIN_NO);*/
//   	declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cfound
// 					  from mdmmstok_location
// 					where trans_year = :global.g_fin_year 
// 						and wc_id = :MOMMWC.WC_ID
// 					  and it_code = :MOMMSTOK.IT_CODE
// 					  and physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 					  and rack_no = :MOMMSTOK.RACK_NO
// 					  and bin_no = :MOMMSTOK.BIN_NO
// 					  and rownum = 1;
// 					error_message('Item Linked with this Physical Location No, BIN no, Rack No already exists');
// 					raise form_trigger_failure;
// 				exception when no_data_found then
// 					null;
// 				end;
//       end;
// 		end if;
	          
	         
// end if;  


// ------------------loc_qty--------------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	  if :MOMMSTOK.LOC_QTY is null  then
// 				 	error_message('Location Qty cannot be left blank');
// 				 	 raise form_trigger_failure;
// 	  end if;
// 	  if :MOMMSTOK.LOC_QTY <= 0 then
// 	  	error_message('Location Qty cannot be zero and less then zero');
// 				 	 raise form_trigger_failure;
// 	  end if;
// end if;  


// help list  

//-----------------RG STORE---------------------  

// SELECT W.WC_ID, W.DESCRIPTION
// FROM MOMMWC W
// WHERE EXISTS (SELECT 'X' FROM MOMMSTOK S
// WHERE S.WC_ID = W.WC_ID)
// AND DIVISION_ID = :GLOBAL.G_DIVISION_ID
// ORDER BY W.DESCRIPTION   


//-------------RG PHY_LOC----------------

// SELECT DISTINCT PHYSICAL_LOCA FROM MOMMITEM_LOCATIONS    

// ---------------- RG_ITEM------------ 

// select i.it_code, g.it_name 
// from mommstok i, mommitem g
// where i.trans_year = :Global.G_Fin_year
// and i.wc_id = :mommwc.wc_id
// and i.it_code = g.it_code
// order by it_code  


//  ---------RG_RACK_NO ---------------  

// SELECT DISTINCT RACK_NO FROM MOMMITEM_LOCATIONS WHERE PHYSICAL_LOCA = :MOMMSTOK.PHYSICAL_LOCA ORDER BY RACK_NO  


// RG_BIN_No 

// SELECT DISTINCT BIN_NO FROM MOMMITEM_LOCATIONS WHERE PHYSICAL_LOCA = :MOMMSTOK.PHYSICAL_LOCA AND RACK_NO = :MOMMSTOK.RACK_NO ORDER BY RACK_NO



// user save  

// DECLARE
//   cFormStatus Varchar(80) := :Control.DI_FormStatus;
// BEGIN

//   go_BLOCK('MOMMSTOK');  

// 	IF :control.di_formstatus in ('INSERT','UPDATE') THEN
// 		POST_DATA;
// 	  commit_form;
// 	END IF;
//   -- for detail block
//   SetinsertAllowed('MOMMSTOK', 0);
//   SetUpdateAllowed('MOMMSTOK', 0);
//   SetdeleteAllowed('MOMMSTOK', 0);
//   GO_BLOCK('MOMMSTOK');
//   :Control.DI_FormStatus := 'QUERY';
//   SET_USER_ACTIVITY;
// END;  


//user update 

// :Control.DI_FormStatus := 'UPDATE';
// WHEN_ACTIVITY_BUTTON_PRESSED;

// set_item_property('CONTROL.DELETE', ENABLED, PROPERTY_FALSE);

// SetinsertAllowed('MOMMSTOK', 1);
// SetUpdateAllowed('MOMMSTOK', 1);
// SetdeleteAllowed('MOMMSTOK', 1);

// go_item('MOMMSTOK.physical_loc');
// --go_item('MOMMSTOK.RACK_NO');   


// validate Data Procedure   

// PROCEDURE validate_data IS
// nCnt1				number;
// nCnt2       number;
// nCnt3       number;
// nCnt4       number;

// BEGIN

 
//  select count(*) into nCnt4  from mommstok
//  where WC_ID = :MOMMSTOK.WC_ID
//  and IT_CODE = :MOMMSTOK.IT_CODE
//  and PHYSICAL_LOC = :MOMMSTOK.PHYSICAL_LOCA
//  and RACK_NO = :MOMMSTOK.RACK_NO
//  and BIN_NO = :MOMMSTOK.BIN_NO;
//  if nCnt4 > 0 then
//  	 error_message('This Combination of data already exists');
//  	 raise form_trigger_failure;
//  end if;
//  exception when no_data_found then
//  null;
 
//  -- dupliacet employee
// END;     


// --error_message(:control.di_formstatus);
// if :control.di_formstatus in ('ÍNSERT','UPDATE') then
// --error_message(:MOMMSTOK.PHYSICAL_LOC);
// 	if :MOMMSTOK.PHYSICAL_LOCA is null then
// 		error_message('PHYSICAL LOCATION CAN NOT BE BLANK');
// 		 raise form_trigger_failure;
// 	end if;

//  	if :MOMMSTOK.RACK_NO is null then
// 						 	error_message('RACK NO CAN NOT BE BLANK');
// 						 	 raise form_trigger_failure;
//  	end if;
//   if :MOMMSTOK.BIN_NO is null then
// 			 	error_message('BIN NO CAN NOT BE BLANK');
// 			 	 raise form_trigger_failure;
//   end if;
  
//   if :MOMMSTOK.LOC_QTY is null then
// 			 	error_message('LOCATION QTY CANNOT BE BLANK');
// 			 	 raise form_trigger_failure;
//   end if;
  
//   --error_message('wvr 1');
//   if :MOMMSTOK.IT_CODE is not null then
//   	declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cfound
// 					  from mdmmstok_location
// 					where trans_year = :global.g_fin_year 
// 						and wc_id = :MOMMWC.WC_ID
// 					  and it_code = :MOMMSTOK.IT_CODE
// 					  and physical_loca = :MOMMSTOK.PHYSICAL_LOCA
// 					  and rack_no = :MOMMSTOK.RACK_NO
// 					  and bin_no = :MOMMSTOK.BIN_NO
// 					  and rownum = 1;
// 					error_message('Item Linked with this Physical Location No, BIN no, Rack No already exists');
// 					raise form_trigger_failure;
// 				exception when no_data_found then
//            null;
// 				end;
//       end;
// 		end if;
//   --error_message('wvr 2 '||:MOMMSTOK.PHYSICAL_LOCA||:MOMMSTOK.RACK_NO|| :MOMMSTOK.BIN_NO);
//      :MOMMSTOK.COORDINATE_NO := :MOMMSTOK.PHYSICAL_LOCA||:MOMMSTOK.RACK_NO|| :MOMMSTOK.BIN_NO;

// end if;



//-------------------------user authorise----------------------------------

// DECLARE 
// 	cAUTHORISED_REQ mommtrty.AUTHORISED_REQ%type;
// BEGIN
// 	select nvl(AUTHORISED_REQ,'N') into cAUTHORISED_REQ 
// 	from mommtrty 
// 	where trans_code = :THMMMAIN.TRANS_CODE;
// 	begin	
// 		if cAUTHORISED_REQ = 'N' then
// 		  error_message('Authorisation Not Required');
// 		  raise form_trigger_failure;
// 		elsif NVL(cAUTHORISED_REQ, 'N') = 'Y' then
// 			if NVL(:THMMMAIN.authorised, 'N') = 'N' then
// 				if confirm('WANT TO AUTHORISED ? ') = ALERT_BUTTON1 then
// 		     	setupdateallowed('THMMMAIN', 1);			
// 			   	:THMMMAIN.authorised := 'Y';
// 		     	:THMMMAIN.disp_flag := 'Authorised';
// 		     	SYNCHRONIZE;
// 					setupdateallowed('THMMMAIN', 0);
// 		     -- ProcGenerateContraEntry;
// 		      begin
// 		      Update_tommmain(:thmmmain.doc_id, :thmmmain.division_id,
// 		                      :thmmmain.trans_year, :thmmmain.doc_no,
// 		                      :thmmmain.trans_code);
// 		      exception when others then
// 		      	error_message(dbms_error_text);
// 		      	raise form_trigger_failure;
// 		      end;	
// 	  	    commit_form;
// 				end if;
// 			elsif :THMMMAIN.authorised = 'Y' then
//   		  error_message('Cannot Unauthorise ');
// 	  	  raise form_trigger_failure;
//     	/*if confirm('WANT TO UNAUTHORISED ? ') = ALERT_BUTTON1 then
// 					setupdateallowed('THMMMAIN', 1);
// 		   		:THMMMAIN.authorised := 'N';
// 		   		:THMMMAIN.disp_flag := '';
// 	    		SYNCHRONIZE;
// 			  	setupdateallowed('THMMMAIN', 0);
// 					COMMIT_FORM;
// 	      	DELETE FROM TOMMMAIN WHERE DOC_NO = :THMMMAIN.DOC_NO;
// 	     		COMMIT_FORM;			
// 	    	end if;*/
// 	    end if;
// 		end if;
// 		go_block('thmmmain');
// 	end;	
// 	exception when no_data_found then
// 	 	cAUTHORISED_REQ := 'N';
// end;

 //-----------------------------------------Cancel------------------------------------

// IF SUBSTR(:thmmmain.doc_no, 1, 1) != '~' THEN
// 	check_stock;
// END IF;	
// Execute_Trigger('User_Delete');
