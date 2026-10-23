//---------TOMMSTOCKADJ--------------------------  


//ADJ_TYPE = 'WOR' AND TRANS_YEAR = :GLOBAL.G_FIN_YEAR AND DIVISION_ID = :GLOBAL.G_DIVISION_ID  


//ADJ_NO DESC ORDER BY  


//TOMMSER_BATCH     



//-----------------RG WC_ID ----------------

// SELECT DESCRIPTION,WC_ID FROM MOMMWC WHERE DIVISION_ID = :GLOBAL.G_DIVISION_ID
// ORDER BY DESCRIPTION



//--------------------RG ITEM----------------  

// SELECT A.IT_NAME,A.IT_CODE FROM MOMMITEM A,MOMMSTOK B
// WHERE A.IT_CODE=B.IT_CODE
// AND TRANS_YEAR = :GLOBAL.G_FIN_YEAR
// AND B.WC_ID=:WC_ID_FROM 
// ORDER BY A.IT_NAME  


//-----------RG BATCH NO------------------  

// select batch_no,nvl(mrir_date,batch_date) batch_date,
// item_current_opening_bal_batch(v.wc_id, v.it_code, GET_DBSYSDATE, :GLOBAL.G_FIN_YEAR, 'O', v.batch_no)  batch_qty,
// 'O' ok_rej,mrir_no,mrir_date,it_code
//  from vwshowbatches v,mommwc m
//  where it_code=:TOMMSTOCKADJ.it_code
//    and m.wc_id=v.wc_id
//    and m.wc_id=:tommstockadj.wc_id_from
//    and m.division_id=:GLOBAL.G_DIVISION_ID
//    and v.trans_year =:GLOBAL.G_FIN_YEAR
// AND  NVL(item_current_opening_bal_batch(v.wc_id, v.it_code, GET_DBSYSDATE, :GLOBAL.G_FIN_YEAR, 'O', v.batch_no),0) > 0
// order by 1    


// VALIDATE    

//------------ ADJ_DATE-------------------------

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	BEGIN
// 		   CHECKDATEINFINYEAR(:TOMMSTOCKADJ.ADJ_DT);
// 	END;
  
//   IF :TOMMSTOCKADJ.ADJ_DT <> TRUNC(SYSDATE) THEN
//   	  ERROR_MESSAGE('DOC Date Should be current date');
//   	  RAISE FORM_TRIGGER_FAILURE;
//   END IF;	
  
// END IF;	  

//-----------------WC_ID_FROM_DESC-----------------------   

// IF :WC_DESC_FROM IS NULL THEN
// 	:WC_ID_FROM :=NULL;
// END IF;
// CHECK_ITEM_WC;  


// ---------------WC_ID_TO_DESC-----------------   

// IF :TO_STORE_TYPE ='N' THEN
// 	IF :WC_DESC_TO IS NULL THEN
// 		ERROR_MESSAGE('Select WOR Store...');
// 		raise form_trigger_failure;
// 	END IF;
// END IF;

// IF :WC_DESC_TO IS NULL THEN
// 	:WC_ID_TO :=NULL;
// END IF;
// CHECK_ITEM_WC;  



//-------------------IT CODE----------------------

// IF :TOMMSTOCKADJ.IT_CODE IS NOT NULL THEN
// 	DECLARE
// 		X VARCHAR2(1);
// 	BEGIN
// 		SELECT IT_NAME INTO :IT_DESC FROM MOMMITEM A, MOMMSTOK B
// 	  WHERE A.IT_CODE=B.IT_CODE
// 	  AND A.IT_CODE=:TOMMSTOCKADJ.IT_CODE
// 	  AND B.WC_ID=:WC_ID_FROM
// 	  AND B.TRANS_YEAR = :Global.G_Fin_Year;
// 	EXCEPTION
// 		WHEN NO_DATA_FOUND THEN
// 		ERROR_MESSAGE('Invalid Item Code');
// 		RAISE FORM_TRIGGER_FAILURE;
// 	END;
// END IF;
// CHECK_ITEM_WC;
// :STOCK_QTY := ITEM_CURRENT_OPENING_BAL(:WC_ID_FROM, :TOMMSTOCKADJ.IT_CODE, GET_DBSYSDATE, :GLOBAL.G_FIN_YEAR, 'O');

// :TOMMSTOCKADJ.RATE :=  Fetchfiforate(:TOMMSTOCKADJ.IT_CODE,1,GET_DBSYSDATE,:Global.G_Division_id,:GLOBAL.G_FIN_YEAR);
// ------check added for  checking the item code & store combination entry which is pending for authorization.
// ---stop user to do new entry if previous entry is still pending for authorization (26.06.2025)
// DECLARE 
// 	CFOUND  VARCHAR2(1);
// BEGIN
// 			BEGIN
// 		   	SELECT 'Y' INTO CFOUND 
// 					FROM TOMMSTOCKADJ   
// 			 where  it_code  = :TOMMSTOCKADJ.IT_CODE
// 				and  wc_id_from  = :TOMMSTOCKADJ.WC_ID_FROM 
// 				and ADJ_TYPE = 'WOR'
// 			  AND NVL(AUTH_FLAG,'N') = 'N'
// 				AND NVL(CANCEL_FLAG,'N') = 'N'
// 				AND ROWNUM = 1;
// 			EXCEPTION WHEN  NO_DATA_FOUND THEN  
// 				  CFOUND :=  'N';
// 			END;	
//  	 IF  NVL(CFOUND,'N')  =  'Y' THEN 	
//  			ERROR_MESSAGE('This item code & store combination entry was pending for authorization.' ||CHR(9)||'Please authorise pending entry.item code is :' || :TOMMSTOCKADJ.IT_CODE);
//  			 raise form_trigger_failure;              
// 	 END IF;		
// END;

// ------------------------   



//----------------------QTY----------------------------------  

// if :control.di_formstatus in ('INSERT','UPDATE') then	

// 	if :qty > :stock_qty then
// 		error_message('Quantity Can not be more then Stock Quantity');
// 		raise form_trigger_failure;
// 	end if;

// 	if :tommstockadj.qty is null then
// 		error_message('Qty. can not be left blank');
// 		raise form_trigger_failure;
// 	end if;
	
// 	if  :tommstockadj.qty <0 then
// 		error_message('Qty cannot be negative');
// 		raise form_trigger_failure;
// 	end if;
	
// 	if  :tommstockadj.qty = 0 then
// 		error_message('Qty cannot be zero');
// 		raise form_trigger_failure;
// 	end if;

// end if;

// IF :TOMMSTOCKADJ.QTY IS NOT NULL THEN  
//   IF  	NVL(:TOMMSTOCKADJ.RATE ,0) > 0  THEN  
// 	  :TOMMSTOCKADJ.TOT_VALUE  :=  :TOMMSTOCKADJ.QTY  * :TOMMSTOCKADJ.RATE ; 
//   END IF;
// END IF;  
  

//---------------------RATE-------------------------  

// if :qty > :stock_qty then
// 	error_message('Quantity Can not be more then Stock Quantity');
// 	raise form_trigger_failure;
// end if;


//WHEN VALIDATE RECORD  

// IF   :WC_ID_FROM IS NULL THEN
//  ERROR_MESSAGE('Store Can not be left blank');
//   raise form_trigger_failure;
// END IF;
// IF :TOMMSTOCKADJ.IT_CODE IS NULL THEN
//  ERROR_MESSAGE('Item Code Can not be left blank');
//   raise form_trigger_failure;
// END IF;
// IF :QTY IS NULL THEN
//  ERROR_MESSAGE('Qty. Can not be left blank');
//   raise form_trigger_failure;
// END IF;  

//--------------PRE INSERT  ---------------------  

// :TOMMSTOCKADJ.DIVISION_ID:=:GLOBAL.G_DIVISION_ID;
// :TOMMSTOCKADJ.TRANS_YEAR:=:GLOBAL.G_FIN_YEAR;
// :TOMMSTOCKADJ.TRANS_CODE:=58;
// :ADJ_TYPE:='WOR';
// :TOMMSTOCKADJ.ADJ_NO:=GENSTOCKADJNO('WOR',:GLOBAL.G_FIN_YEAR, :GLOBAL.G_DIVISION_ID);	 


//--------------------------------TOMMESR_BATCH-----------------

//----------------WHEN VALIDATE RECORD -----

// If :Control.Di_FormStatus in('INSERT','UPDATE') then
// 		if :tommesr_batch.batch_no is not null and :tommesr_batch.batch_dt is null then
// 			error_message('Batch date is must if batch no entered');
// 			raise form_trigger_failure;			
// 		end if;
// /*	if :tommesr_batch.batch_no is null then
// 		if chk_it_batch_control(:tommesr_batch.it_code) = 'Y' then
// 				error_message('Batch no is must for this item');
// 				raise form_trigger_failure;
// 		end if; 
// 	end if;*/
   
//    if :tommstockadj.it_code<>:tommesr_batch.it_code then
//    		error_message('Please feed correct batch no');
//       raise form_trigger_failure;
//    end if;
   
//    if :tommesr_batch.total_qty >:tommstockadj.qty then
//    	error_message('Total Qty greater than recevied item');
//    	raise form_trigger_failure;
//    end if;
   
// End if;   

//-------------BATCH_NO----------------

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tommesr_batch.batch_no is null then
// 		   if chk_it_batch_control(:tommesr_batch.it_code) = 'Y' then
// 				error_message('Batch no is must for this item');
// 				raise form_trigger_failure;
// 		end if; 
// 		if :tommstockadj.it_code!=:tommesr_batch.it_code then
// 			error_message('Please feed correct batch no');
// 			raise form_trigger_failure;
// 		end if;	
// 		else
// 			declare
// 			vbatch_no tdmmmchl_batch.batch_no%type;
// 			vFifo_dt    date; 
// 			begin 		
// 				if chk_it_batch_control(:tommstockadj.it_code )='Y' then
// 					if  check_fifo_batch(:tommstockadj.It_code, :tommstockadj.wc_id_from,:tommesr_batch.batch_dt,:tommstockadj.ok_reg_from,:tommstockadj.trans_year,
//                                :tommstockadj.adj_dt, vbatch_no, vFifo_dt)=TRUE then 
                   
//                    error_message('Prior batch' ||vbatch_no||'-'||vFifo_dt||' exists');
// 					else
// 				  	null;
// 					end if;
// 				end if;
// 			end ;
//    end if;
// end if;

// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :tommesr_batch.batch_no is not null then
//    declare 
//     vwbatch_no varchar2(4000);
// 	  begin
// 		  select batch_no into vwbatch_no
// 			   from vwshowbatches v,mommwc m
// 			   where it_code=:tommstockadj.it_code
// 	       and m.wc_id=v.wc_id
// 			   and m.wc_id=:tommstockadj.wc_id_from
// 			   and m.division_id=:tommstockadj.division_id
// 			   and batch_no = :tommesr_batch.batch_no;
// 	    exception when no_data_found then
// 	  	   error_message('You are entering new batch no.');
// 	         :tommesr_batch.batch_dt := trunc(sysdate);		   
// 	  end;
//   end if;
// end if;





 
//-------------------BATCH_QTY-------------------

// if :control.di_formstatus in ('INSERT','UPDATE') then	
// 	if  :tommesr_batch.batch_no is null then
// 		  error_message('Please first feed batch no');
// 		  raise form_trigger_failure;
// 	end if;
	

	
// 	if :tommesr_batch.batch_no is not null and :tommesr_batch.batch_qty is null then
// 		error_message('Received Qty. can not be left blank');
// 		raise form_trigger_failure;
// 	end if;
// 	if  :tommesr_batch.batch_qty<0 then
// 		error_message('Qty cannot be negative');
// 		raise form_trigger_failure;
// 	end if;
	
// 	if  :tommesr_batch.batch_qty=0 then
// 		error_message('Qty cannot be zero');
// 		raise form_trigger_failure;
// 	end if;
// 	if :tommstockadj.qty < :tommesr_batch.batch_qty then
// 		error_message('Total Batch Received Qty has to be same as Item Received Qty');
// 		raise form_trigger_failure;
// 	end if;	
	
// 	if NVL(:tommesr_batch.total_qty,0)>NVL(:tommstockadj.qty,0) then
//    	error_message('Batch total Qty not equal to recevied item qty');
//    	raise form_trigger_failure;
//    end if;
	
// 	:tommesr_batch.division_id:=:tommstockadj.division_id;
//    :tommesr_batch.trans_year:=:tommstockadj.trans_year;
//    :tommesr_batch.trans_code:=:tommstockadj.trans_code;
//    :tommesr_batch.ok_rej:=:tommstockadj.ok_reg_to;
// End if;
  



// CREATE OR REPLACE PROCEDURE check_item_wc(
//     p_it_code TEXT,
//     p_wc_id_from INTEGER,
//     p_wc_id_to INTEGER,
//     p_fin_year TEXT
// )     



// ---------------- rate validate -------------------------  

// f :qty > :stock_qty then
// 	error_message('Quantity Can not be more then Stock Quantity');
// 	raise form_trigger_failure;
// end if;    


// expiry date validate 

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// 	if :tommstockadj.it_code<>:tommesr_batch.it_code then
//    		error_message('Please feed correct batch no');
//       raise form_trigger_failure;
// 	end if;
// END IF;	  


// batch_qty 

// if :control.di_formstatus in ('INSERT','UPDATE') then	
// 	if  :tommesr_batch.batch_no is null then
// 		  error_message('Please first feed batch no');
// 		  raise form_trigger_failure;
// 	end if;
	

	
// 	if :tommesr_batch.batch_no is not null and :tommesr_batch.batch_qty is null then
// 		error_message('Received Qty. can not be left blank');
// 		raise form_trigger_failure;
// 	end if;
// 	if  :tommesr_batch.batch_qty<0 then
// 		error_message('Qty cannot be negative');
// 		raise form_trigger_failure;
// 	end if;
	
// 	if  :tommesr_batch.batch_qty=0 then
// 		error_message('Qty cannot be zero');
// 		raise form_trigger_failure;
// 	end if;
// 	if :tommstockadj.qty < :tommesr_batch.batch_qty then
// 		error_message('Total Batch Received Qty has to be same as Item Received Qty');
// 		raise form_trigger_failure;
// 	end if;	
	
// 	if NVL(:tommesr_batch.total_qty,0)>NVL(:tommstockadj.qty,0) then
//    	error_message('Batch total Qty not equal to recevied item qty');
//    	raise form_trigger_failure;
//    end if;
	
// 	:tommesr_batch.division_id:=:tommstockadj.division_id;
//    :tommesr_batch.trans_year:=:tommstockadj.trans_year;
//    :tommesr_batch.trans_code:=:tommstockadj.trans_code;
//    :tommesr_batch.ok_rej:=:tommstockadj.ok_reg_to;
// End if;



// tommsert validate ------------------------------------------   


// If :Control.Di_FormStatus in('INSERT','UPDATE') then
// 		if :tommesr_batch.batch_no is not null and :tommesr_batch.batch_dt is null then
// 			error_message('Batch date is must if batch no entered');
// 			raise form_trigger_failure;			
// 		end if;
/*	if :tommesr_batch.batch_no is null then
		if chk_it_batch_control(:tommesr_batch.it_code) = 'Y' then
				error_message('Batch no is must for this item');
				raise form_trigger_failure;
		end if; 
	end if;*/
   
//    if :tommstockadj.it_code<>:tommesr_batch.it_code then
//    		error_message('Please feed correct batch no');
//       raise form_trigger_failure;
//    end if;
   
//    if :tommesr_batch.total_qty >:tommstockadj.qty then
//    	error_message('Total Qty greater than recevied item');
//    	raise form_trigger_failure;
//    end if;
   
// End if;     



//-----------post query --------------------- 

// BEGIN
// 	SELECT IT_NAME INTO :IT_DESC FROM MOMMITEM
// 	WHERE IT_CODE = :TOMMSTOCKADJ.IT_CODE;
// EXCEPTION
// 	WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;

// BEGIN
// 	SELECT DESCRIPTION INTO :WC_DESC_FROM FROM MOMMWC
// 	WHERE WC_ID=:WC_ID_FROM;
// EXCEPTION
// 	WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;

// BEGIN
// 	SELECT DESCRIPTION INTO :WC_DESC_TO FROM MOMMWC
// 	WHERE WC_ID=:WC_ID_TO;
// EXCEPTION
// 	WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;
// DECLARE
// 	X VARCHAR2(15);
// 	Y VARCHAR2(15);
// BEGIN
// 	SELECT AUTH_FLAG ,CANCEL_FLAG INTO  X,Y  FROM TOMMSTOCKADJ
// 	WHERE ADJ_NO = :TOMMSTOCKADJ.ADJ_NO
//   	AND DIVISION_ID = :GLOBAL.G_DIVISION_ID
//   	AND TRANS_YEAR = :GLOBAL.G_FIN_YEAR;
// 	IF X ='Y' THEN
// 		set_item_property('CANCEL_WOR',enabled,property_false);
// 		:DISP_FLAG:='Authorised';
// 	END IF;
// 	IF :CANCEL_FLAG='Y' THEN
// 		:DISP_FLAG:='Cancelled';
// 		set_item_property('CANCEL_WOR',enabled,property_false);
// 	END IF;
// EXCEPTION
// 	WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;

// IF :TOMMSTOCKADJ.QTY IS NOT NULL THEN  
//   IF  	NVL(:TOMMSTOCKADJ.RATE ,0) > 0  THEN  
// 	  :TOMMSTOCKADJ.TOT_VALUE  :=  :TOMMSTOCKADJ.QTY  * :TOMMSTOCKADJ.RATE ; 
//   END IF;
// END IF;   


//------------------pre insert--------------- 

// :TOMMSTOCKADJ.DIVISION_ID:=:GLOBAL.G_DIVISION_ID;
// :TOMMSTOCKADJ.TRANS_YEAR:=:GLOBAL.G_FIN_YEAR;
// :TOMMSTOCKADJ.TRANS_CODE:=58;
// :ADJ_TYPE:='WOR';
// :TOMMSTOCKADJ.ADJ_NO:=GENSTOCKADJNO('WOR',:GLOBAL.G_FIN_YEAR, :GLOBAL.G_DIVISION_ID);	  



//----------------USER_UPDATE-------------------  

// IF :AUTH_FLAG='Y' THEN
// 	ERROR_MESSAGE('You can not modify an Authorised Document');
// elsif :cancel_flag='Y' then
// 	error_message('You can not modify an Authorised Document');
// 	else


// :control.di_formstatus := 'UPDATE';
// WHEN_ACTIVITY_BUTTON_PRESSED;
// SetInsertAllowed('TOMMSTOCKADJ', 1);
// SetUpdateAllowed('TOMMSTOCKADJ', 1);
// SetDeleteAllowed('TOMMSTOCKADJ', 1);

// go_block('TOMMSTOCKADJ');
// SetDetailActivity;
// end if;


// ----------------- USER INSERT-------------------------  



// :control.di_formstatus := 'INSERT';

// WHEN_ACTIVITY_BUTTON_PRESSED;
// SetInsertAllowed('TOMMSTOCKADJ', 1);
// SetUpdateAllowed('TOMMSTOCKADJ', 1);
// SetDeleteAllowed('TOMMSTOCKADJ', 1);

// SetInsertAllowed('tommesr_batch', 1);
// SetUpdateAllowed('tommesr_batch', 1);
// SetDeleteAllowed('tommesr_batch', 1);



// go_block('TOMMSTOCKADJ');
// last_record;
// create_record;
// SetDetailActivity;  


//--------------------------- USER_SAVE-----------------------  

// BEGIN	
//   --go_block('TOMMSTOCKADJ');
//   IF :control.di_formstatus ='INSERT' THEN  
//   if chk_it_batch_control(:tommstockadj.it_code)='Y' THEN
// 	 	If not CheckDetailEntry('tommesr_batch', 'BATCH_NO', TRUE) then
// 	  		error_message('Batch no must for this item1');   		
// 	    raise form_trigger_failure;
// 	 	End if;	
// 	 	if NVL(:tommesr_batch.total_qty,0) <>NVL(:tommstockadj.qty,0) then
// 	   	error_message('Batch total Qty not equal to recevied item qty');
// 	   	raise form_trigger_failure;
//     end if;
//   End if;	 	
  
  
//   COMMIT_FORM;	
//   ERROR_MESSAGE('THE NEW DOCUMENT NO  '||:TOMMSTOCKADJ.ADJ_NO);
  
//   ELSIF :control.di_formstatus IN ('UPDATE') THEN		
//   if chk_it_batch_control(:tommstockadj.it_code)='Y' THEN
//   	If not CheckDetailEntry('tommesr_batch', 'BATCH_NO', TRUE) then
//   		error_message('Batch no must for this item'); 
//     raise form_trigger_failure;
//   	End if;
// 	   if :tommesr_batch.total_qty <>:tommstockadj.qty then
// 	   	error_message('Batch total Qty not equal to recevied item qty');
// 	   	raise form_trigger_failure;
// 	   end if;
//   End if;	
	
//     commit_form;
//     IF :System.Form_Status <> 'QUERY' THEN 
//       Error_Message('An error prevented your changes from being committed.'); 
//       Bell; 
//       RAISE Form_Trigger_Failure; 
    
//      END IF; 
    
//  END IF;
//     -- for master  block
//     SetInsertAllowed('TOMMSTOCKADJ', 0);
//     SetUpdateAllowed('TOMMSTOCKADJ', 0);
//     SetDeleteAllowed('TOMMSTOCKADJ', 0);
    
//    SetInsertAllowed('tommesr_batch',0);
//    SetUpdateAllowed('tommesr_batch',0);
//    SetDeleteAllowed('tommesr_batch',0);
    
//     go_block('TOMMSTOCKADJ');
//     :control.di_formstatus := 'QUERY';
//     SET_USER_ACTIVITY;

// END;



/*BEGIN
   go_block('TOMMSTOCKADJ');
 IF :control.di_formstatus ='INSERT' THEN
    :TOMMSTOCKADJ.ADJ_NO:=GENSTOCKADJNO('WOR',:GLOBAL.G_FIN_YEAR, :GLOBAL.G_DIVISION_ID);	
  	ERROR_MESSAGE('THE NEW DOCUMENT NO  '||:TOMMSTOCKADJ.ADJ_NO);
  
  End if;	 	
  COMMIT_FORM;	


ELSIF :control.di_formstatus IN ('INSERT', 'UPDATE') THEN
    commit_form;
    IF :System.Form_Status <> 'QUERY' THEN 
      Error_Message('An error prevented your changes from being committed.'); 
      Bell; 
      RAISE Form_Trigger_Failure; 
    
     END IF; 
    
 END IF;
    -- for master  block
    SetInsertAllowed('TOMMSTOCKADJ', 0);
    SetUpdateAllowed('TOMMSTOCKADJ', 0);
    SetDeleteAllowed('TOMMSTOCKADJ', 0);
    go_block('TOMMSTOCKADJ');
    :control.di_formstatus := 'QUERY';
    SET_USER_ACTIVITY;

END;*/


//----------------------USER AUTHORISE------------------------ 

// IF :CANCEL_FLAG='Y' THEN
// 	ERROR_MESSAGE('You can not  Authorise a cancelled Document');
// ELSIF NVL(:tommstockadj.AUTH_FLAG,'N') = 'N' THEN
// --	ERROR_MESSAGE('1');
// 	PROC_AUTHORISE;
//   ERROR_MESSAGE('Document is Authorised');
	
// 	set_item_property('CANCEL_WOR',enabled,property_false);
// ELSIF NVL(:tommstockadj.AUTH_FLAG,'N') = 'Y' THEN
// --	ERROR_MESSAGE('2');
// 	PROC_UNAUTHORISE;
// 	set_item_property('CANCEL_WOR',enabled,property_true);
// 	ERROR_MESSAGE('Document is UnAuthorised');
// ELSE
// 	 NULL;
// END IF;  

//----------------USER CANCEL DOC-------------------------  

// IF :System.Form_Status <> 'INSERT' OR :System.Form_Status <> 'UPDATE'	THEN
	
// SetUpdateAllowed('TOMMSTOCKADJ', 1);
// 	:CANCEL_FLAG:='Y';
// 	:CANCEL_DT:=SYSDATE;
// 	:disp_flag:='Cancelled';
// 	set_item_property('CANCEL_WOR',enabled,property_false);
// COMMIT_FORM;
// SetUpdateAllowed('TOMMSTOCKADJ', 0);
// error_message('Document is cancelled');
	
// END IF;    





// -- Table: integral.tommesr_batch

// -- DROP TABLE IF EXISTS integral.tommesr_batch;

// CREATE TABLE IF NOT EXISTS integral.tommesr_batch
// (
//     division_id bigint NOT NULL,
//     trans_year character varying(4) COLLATE pg_catalog."default" NOT NULL,
//     trans_code smallint NOT NULL,
//     adj_no character varying(15) COLLATE pg_catalog."default" NOT NULL,
//     it_code character varying(20) COLLATE pg_catalog."default" NOT NULL,
//     create_id smallint,
//     create_date timestamp(0) without time zone,
//     update_id smallint,
//     update_date timestamp(0) without time zone,
//     batch_no character varying(60) COLLATE pg_catalog."default" NOT NULL,
//     batch_dt timestamp(0) without time zone,
//     batch_qty double precision,
//     ok_rej character varying(1) COLLATE pg_catalog."default",
//     expiry_date timestamp(0) without time zone,
//     CONSTRAINT tommesr_batch_pkey PRIMARY KEY (division_id, trans_year, trans_code, adj_no, it_code, batch_no)
// )

// TABLESPACE pg_default;

// ALTER TABLE IF EXISTS integral.tommesr_batch
//     OWNER to postgres;

// GRANT ALL ON TABLE integral.tommesr_batch TO mrprole;

// GRANT ALL ON TABLE integral.tommesr_batch TO postgres;

// -- Trigger: trg_upd_tommesr_batch

// -- DROP TRIGGER IF EXISTS trg_upd_tommesr_batch ON integral.tommesr_batch;

// CREATE OR REPLACE TRIGGER trg_upd_tommesr_batch
//     BEFORE UPDATE 
//     ON integral.tommesr_batch
//     FOR EACH ROW
//     EXECUTE FUNCTION integral.trigger_fct_trg_upd_tommesr_batch();   



// for insert 

//chk_it_batch_control('CI004')   


//-----------------------USER AUTHORISE -----------------------------------   


// IF :CANCEL_FLAG='Y' THEN
// 	ERROR_MESSAGE('You can not  Authorise a cancelled Document');
// ELSIF NVL(:tommstockadj.AUTH_FLAG,'N') = 'N' THEN
// --	ERROR_MESSAGE('1');
// 	PROC_AUTHORISE;
//   ERROR_MESSAGE('Document is Authorised');
	
// 	set_item_property('CANCEL_WOR',enabled,property_false);
// ELSIF NVL(:tommstockadj.AUTH_FLAG,'N') = 'Y' THEN
// --	ERROR_MESSAGE('2');
// 	PROC_UNAUTHORISE;
// 	set_item_property('CANCEL_WOR',enabled,property_true);
// 	ERROR_MESSAGE('Document is UnAuthorised');
// ELSE
// 	 NULL;
// END IF;  




//   IF :System.Form_Status <> 'INSERT' OR :System.Form_Status <> 'UPDATE'	THEN
	
// SetUpdateAllowed('TOMMSTOCKADJ', 1);
// 	:CANCEL_FLAG:='Y';
// 	:CANCEL_DT:=SYSDATE;
// 	:disp_flag:='Cancelled';
// 	set_item_property('CANCEL_WOR',enabled,property_false);
// COMMIT_FORM;
// SetUpdateAllowed('TOMMSTOCKADJ', 0);
// error_message('Document is cancelled');
	
// END IF;   


// USER UPDATE 

// IF :AUTH_FLAG='Y' THEN
// 	ERROR_MESSAGE('You can not modify an Authorised Document');
// elsif :cancel_flag='Y' then
// 	error_message('You can not modify a cancelled Document');
// 	else


// :control.di_formstatus := 'UPDATE';
// WHEN_ACTIVITY_BUTTON_PRESSED;
// SetInsertAllowed('TOMMSTOCKADJ', 1);
// SetUpdateAllowed('TOMMSTOCKADJ', 1);
// SetDeleteAllowed('TOMMSTOCKADJ', 1);

// go_block('TOMMSTOCKADJ');
// SetDetailActivity;
// end if;
