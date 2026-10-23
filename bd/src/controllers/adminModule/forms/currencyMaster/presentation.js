
 exports.transformMoemcurrData = (data) =>{
  return {
    curr_code: data.curr_code,
    curr_desc: data.curr_desc,
    curr_sdesc: data.curr_sdesc,
    curr_frac: data.curr_frac ,
    eff_date: data.eff_date ,
    end_date: data.end_date || null,
    curr_customs_rt: data.curr_customs_rt || null,
    def_flag: data.def_flag || null,
    ex_rate: data.ex_rate ,
    curr_customs: data.curr_customs || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || null
  };
}

  exports.transformMdemcurrData = (data) => {
  return {
    curr_code:data.curr_code,
    eff_date:data.eff_date,
    rate: data.ex_rate,
    curr_frac:data.curr_frac || null,
    end_date:data.end_date || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || null

  }
 }
    

//  post Query
//  begin
// 	:MOEMCURR.OLD_EX_RATE := :MOEMCURR.EX_RATE;
//   :row_status := 'x';
// end;

//        user delete in formbuilder
// if :control.di_formstatus = 'QUERY' then
//   :control.di_formstatus := 'DELETE';
//   WHEN_ACTIVITY_BUTTON_PRESSED;
//   SetDeleteAllowed('MOEMCURR', 1);
// end if;
// DECLARE
// 	DUMMY_NUMBER CHAR(1);
//  CURSOR C_CUR IS 
//     SELECT 1 FROM	 MDEMCURR WHERE CURR_CODE = :MOEMCURR.CURR_CODE ;
// BEGIN
// 	OPEN C_CUR;
// 	FETCH C_CUR INTO DUMMY_NUMBER;
// 	IF (C_CUR%FOUND) THEN
// 		ERROR_MESSAGE('Cannot delete master record when matching detail records exist.');     
// 		 CLOSE c_cur;     
//     RAISE Form_Trigger_Failure;     
// 	END IF;
// 	CLOSE c_cur;     
	
	
// END;


// when validate record 
// IF :CONTROL.DI_FORMSTATUS = 'UPDATE' THEN
// 	DECLARE
// 		nCount number;
// 	BEGIN
// 	  SELECT COUNT(*) INTO nCount FROM MDEMCURR 
// 	   WHERE CURR_CODE = :MOEMCURR.CURR_CODE
// 	   AND EFF_DATE = :MOEMCURR.EFF_DATE 
// 	   AND END_DATE = :MOEMCURR.END_DATE;
// 	   IF NVL(nCount,0) > 0 THEN 
// 	   	ERROR_MESSAGE('Sales currency details exist between this period. '||CHR(10)||
// 	   	'Enter new rates against another period');
// 	   	RAISE FORM_TRIGGER_FAILURE;
// 	   END IF;
// 	EXCEPTION WHEN NO_DATA_FOUND THEN
// 	  NULL;   	
// 	END;
// 	DECLARE
// 		nCount NUMBER;
// 	BEGIN
// 	  SELECT COUNT(*) INTO nCount FROM MDEMCURR 
// 	   WHERE CURR_CODE = :MOEMCURR.CURR_CODE
// 	   AND ((EFF_DATE BETWEEN :MOEMCURR.EFF_DATE AND :MOEMCURR.END_DATE)
// 	   OR (END_DATE BETWEEN :MOEMCURR.EFF_DATE AND :MOEMCURR.END_DATE));
// 	   IF NVL(nCount,0) > 0 THEN 
// 	   	ERROR_MESSAGE('Sales currency details exist between this period. '||CHR(10)||
// 	   	'Enter a valid period');
// 	   	RAISE FORM_TRIGGER_FAILURE;
// 	   END IF;
// 	EXCEPTION WHEN NO_DATA_FOUND THEN
// 	  NULL;   	
// 	END;
// END IF;

// begin
//   if :MOEMCURR.curr_desc is null then
//     error_message('MOEMCURR Description cannot be blank');
//     raise form_trigger_failure;
//   end if;
//   if :MOEMCURR.curr_sdesc is null then
//     error_message('MOEMCURR Short Description cannot be blank');
//     raise form_trigger_failure;
//   end if;
//   if :MOEMCURR.curr_code is null then
//     error_message('MOEMCURR Code cannot be blank');
//     raise form_trigger_failure;
//   end if;
//   if :MOEMCURR.curr_frac is null then
//     error_message('MOEMCURR Fraction cannot be blank');
//     raise form_trigger_failure;
//   end if;
// end;

//            post insert in trigger 
// 		 IF :PARAMETER.EFF_DATE <> :MOEMCURR.EFF_DATE AND :PARAMETER.EFF_DATE IS NOT NULL THEN
// 		 	INSERT INTO MDEMCURR(CURR_CODE,EFF_DATE,RATE,CURR_FRAC,END_DATE) 
// 		 	                        VALUES(:MOEMCURR.CURR_CODE,:MOEMCURR.EFF_DATE,
// 		 	                               :MOEMCURR.EX_RATE,:MOEMCURR.CURR_FRAC,
// 		 	                               :MOEMCURR.END_DATE);
// 	 ELSE
// 		 	UPDATE MDEMCURR SET RATE = :MOEMCURR.EX_RATE, CURR_FRAC = :MOEMCURR.CURR_FRAC
// 		 	   WHERE CURR_CODE = :MOEMCURR.CURR_CODE AND EFF_DATE = :MOEMCURR.EFF_DATE;
// 		 	IF SQL%NOTFOUND THEN
// 		 		ERROR_MESSAGE(:MOEMCURR.CURR_CODE||'--'||:MOEMCURR.EFF_DATE||'--'||
// 		 	                               :MOEMCURR.EX_RATE||'--'||:MOEMCURR.CURR_FRAC||'--'||
// 		 	                               :MOEMCURR.END_DATE);
// 		 		INSERT INTO MDEMCURR(CURR_CODE,EFF_DATE,RATE,CURR_FRAC,END_DATE) 
// 		 	                        VALUES(:MOEMCURR.CURR_CODE,:MOEMCURR.EFF_DATE,
// 		 	                               :MOEMCURR.EX_RATE,:MOEMCURR.CURR_FRAC,
// 		 	                               :MOEMCURR.END_DATE);
// 		 	END IF;
// 	 END IF;




//          post update in trigger
// 	 IF :PARAMETER.EFF_DATE <> :MOEMCURR.EFF_DATE AND :PARAMETER.EFF_DATE IS NOT NULL THEN
// 		 	INSERT INTO MDEMCURR(CURR_CODE,EFF_DATE,RATE,CURR_FRAC,END_DATE) 
// 		 	                        VALUES(:MOEMCURR.CURR_CODE,:MOEMCURR.EFF_DATE,
// 		 	                               :MOEMCURR.EX_RATE,:MOEMCURR.CURR_FRAC,
// 		 	                               :MOEMCURR.END_DATE);
// 	 ELSE
// 		 	UPDATE MDEMCURR SET RATE = :MOEMCURR.EX_RATE, CURR_FRAC = :MOEMCURR.CURR_FRAC,
// 		 	   END_DATE = :MOEMCURR.END_DATE
// 		 	   WHERE CURR_CODE = :MOEMCURR.CURR_CODE AND EFF_DATE = :MOEMCURR.EFF_DATE;
// 		 	IF SQL%NOTFOUND THEN
// 		 		INSERT INTO MDEMCURR(CURR_CODE,EFF_DATE,RATE,CURR_FRAC,END_DATE) 
// 		 	                        VALUES(:MOEMCURR.CURR_CODE,:MOEMCURR.EFF_DATE,
// 		 	                               :MOEMCURR.EX_RATE,:MOEMCURR.CURR_FRAC,
// 		 	                               :MOEMCURR.END_DATE);
// 		 	END IF;
// 	 END IF;


//      field level validation-----------------1
// 		        if not( :MOEMCURR.CURR_DESC IS NOT NULL ) then
// 		  error_message( 'MOEMCURR Description cannot be blank' );
// 		  raise form_trigger_failure;
// 		end if;
            

// 				BEGIN 2
// 				  if not( :MOEMCURR.CURR_CODE IS NOT NULL ) then
// 				     error_message( 'MOEMCURR Code cannot be blank' );
// 				     raise form_trigger_failure;
// 				  end if;

// 				  declare
// 				    cRowid rowid;
// 				  begin
// 				    SELECT rowid into cRowid FROM MOEMCURR
// 				    WHERE Curr_Code = :MOEMCURR.Curr_Code;
// 				    IF :MOEMCURR.rowid is null or :MOEMCURR.rowid <> cRowid THEN
// 				      error_message('MOEMCURR Code already exists');
// 				      raise form_trigger_failure;
// 				    END IF;
// 				  exception WHEN no_data_found THEN
// 				    null;
// 				  end;
// 				END;
//                              3
// 				if not( :MOEMCURR.CURR_SDESC IS NOT NULL ) then
// 					error_message( 'MOEMCURR Short Description cannot be blank' );
// 					raise form_trigger_failure;
// 					end if;
				
//                            4
// 				IF :CONTROL.DI_FORMSTATUS = 'UPDATE' THEN
// 					IF :MOEMCURR.END_DATE IS NULL AND :MOEMCURR.OLD_EX_RATE <> :MOEMCURR.EX_RATE THEN
// 						ERROR_MESSAGE('First close this Sale curreny detail by entring the end date');
// 						RAISE FORM_TRIGGER_FAILURE;
// 					END IF;
// 				ELSE
// 					IF :MOEMCURR.EX_RATE IS NULL THEN
// 						ERROR_MESSAGE('Exchange rate can not be left blank');
// 						RAISE FORM_TRIGGER_FAILURE;
// 					ELSIF :MOEMCURR.EX_RATE <= 0 THEN
// 						ERROR_MESSAGE('Exchange rate can not be less then or equal to zero');
// 						RAISE FORM_TRIGGER_FAILURE;
// 					END IF;
// 				END IF;
       
// 				      5
// 					IF :MOEMCURR.EFF_DATE IS NOT NULL THEN
// 						IF :MOEMCURR.EFF_DATE> SYSDATE THEN
// 							ERROR_MESSAGE('Effective date can not be greater then today date');
// 							RAISE FORM_TRIGGER_FAILURE;
// 						END IF;
// 					ELSE
// 					ERROR_MESSAGE('Effective Date can not be left blank');		
// 					RAISE FORM_TRIGGER_FAILURE;
// 					END IF;

// 					IF :CONTROL.DI_FORMSTATUS = 'UPDATE' THEN
// 						IF :MOEMCURR.EFF_DATE < :PARAMETER.EFF_DATE THEN
// 							ERROR_MESSAGE('Effective date cannot be less then previous effective date');
// 							RAISE FORM_TRIGGER_FAILURE;
// 						END IF;
						
// 						IF (:MOEMCURR.EFF_DATE > :PARAMETER.EFF_DATE  AND 
// 								:MOEMCURR.EFF_DATE < :PARAMETER.END_DATE)  THEN
// 						ERROR_MESSAGE('New Sales Currency details can not be defined between an existing detail. Enter eff. date after end date of existing detail');
// 						RAISE FORM_TRIGGER_FAILURE;
// 						ELSIF (:MOEMCURR.EFF_DATE > :PARAMETER.EFF_DATE  
// 								AND :PARAMETER.END_DATE IS NULL 
// 								AND :OLD_EX_RATE = :EX_RATE) THEN
// 						ERROR_MESSAGE('First enter the end date for this record and then add new Currency detail to make exact History for this Sales Currency Master');
// 						RAISE FORM_TRIGGER_FAILURE;
// 						END IF;
// 					END IF;
//                                 6
// 					 IF :MOEMCURR.End_Date < :MOEMCURR.Eff_Date THEN
// 						error_message('End Date cannot be Less than Effective Date .. please re-enter');
// 						RAISE FORM_TRIGGER_FAILURE;
// 						END IF;
 

