

exports.transformPhyinvUploadToDbData = (data) => {
  return {
      rec_id: data.rec_id || null,
      it_code: data.it_code || null,
      batch_no:data.batch_no || null,
      batch_date:data.batch_date || null,
      make:data.make || null,
      qty:data.qty|| null,
      file_name:data.file_name || null ,
      wc_id:data.wc_id || null ,
      inv_date:data.inv_date || null ,
      inv_month:data.inv_month || null ,
      user_id:data.user_id || null ,
  }
}
     
//      upload data from xl button press working
// if :control.di_formstatus in ('UPDATE') then
// 	declare
// 		cfound varchar2(1);
// 	begin
// 		if :INV_DATE is null then
// 		 error_message('Inventory date cannot be left blank.');
// 	   raise form_trigger_failure;
// 		end if;  			
// 		if :temp.file_name is not null then
// 			begin
// 				select 'Y' into cfound from temp_phyinv_upload
// 				where file_name = :temp.file_name
// 				and rownum = 1;
// 			exception when no_data_found then
// 				cfound := 'N';
// 			end;
// 			if cfound = 'Y' then 
// 				error_message('Please use SHOW UPLOADED DATA button to see the already uploaded data');
// 				return;
// 			end if;
// 	end if;	

// 		synchronize;
	
// 			load_text_file;
// 			DELETE FROM temp_phyinv_upload WHERE IT_CODE IS NULL;

// 	--	synchronize;
	
// 	  error_message('Updation of data completed. please use SHOW UPLOADED DATA to view the data');
// 	--  validate_uploaded_file(pFile_name);
// 	end;
// END IF;
   

  // show upload data
//   declare
// 		dummy number;
// 		err number;
// 		test number;
// 		error number;		
//  begin			
//   if :control.di_formstatus in ('INSERT','UPDATE') then
// 	go_block('temp_phyinv_upload');
// 	execute_query;
// 	post_data;
// 	first_record;
// set_item_property('control.PB_GENERATE', enabled, property_true);
// 	loop
// 		begin
// 			Select 1 into dummy from mommitem where it_code = :temp_phyinv_upload.IT_CODE;
// 			exception when no_data_found then
// 			set_item_instance_property('temp_phyinv_upload.it_code', current_record,visual_attribute,'err_attr');
// 			err:=1;	
// 		end;
// 		  if :system.last_record = 'TRUE' then	
// 		 	 exit;
// 		  end if;	
// 	   next_record;
// 	end loop;
//  first_record;
  
// 	loop
// 	begin
// 	Select 1 into test from mommitem m,mommstok o where 
// 			  m.it_code = o.it_code
// 			  and m.it_code = :TEMP_PHYINV_UPLOAD.it_code
// 			  and trans_year = :Global.G_FIN_YEAR
// 			  and wc_id = :TEMP_PHYINV_UPLOAD.wc_id;
// 	exception when no_data_found then
//   	Begin
//   	Select 1 into test from mommitem m,mommstok o where 
// 			  m.it_code = o.it_code
// 			  and m.it_code = :TEMP_PHYINV_UPLOAD.it_code
// 			  and trans_year = :Global.G_FIN_YEAR -------------- checking in previous year too, if new year transfer has not taken place.
// 			  and wc_id = :TEMP_PHYINV_UPLOAD.wc_id;             ----------  added by bansal sir on 04-04-2014  
// 	  exception when no_data_found then
// 	  set_item_instance_property('temp_phyinv_upload.it_code', current_record,visual_attribute,'ERR_STORE');
// 	  error:=1;
// 	  End;	
// 	end;
// 	 if :system.last_record = 'TRUE' then	
// 	 	exit;
// 	 end if;
// 	 next_record;
//   end loop;
  	
//   if err = 1 then
//   	error_message('The excel uploaded contains invalid item codes, displayed in red.'|| chr(10)|| 
//   	'You can not proceed further till corrections are made'||chr(10)||
//   	'in the excel file and file uploading done again');
//   	set_item_property('control.PB_GENERATE', enabled, property_false);
//   end if;
//    if error = 1 then
// 			ERROR_MESSAGE('The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue'|| chr(10)||
// 				'You can not proceed further till corrections are made'||chr(10)||
//   			'in the excel file and file uploading done again');  
// 			set_item_property('control.PB_GENERATE', enabled, property_false);
//   end IF;
// end if;
// end;
// if :control.di_formstatus in ('INSERT','UPDATE') then
// declare
// 	cIt_code mommitem.it_code%type;
// 	error number;
// begin
// begin
// 	--error_message(1);
// 			select it_code into cIt_code from temp_phyinv_upload
// 			where file_name = :TEMP_PHYINV_UPLOAD.file_name
// 			and it_code = :TEMP_PHYINV_UPLOAD.it_code;
// 			exception when too_many_rows then
// 			error := 1;
// 			when no_data_found then
// 			error_message('file uploaded contains no record');
// 			end;


//   show exception
//   begin
// 	proc_gen_csv;
// exception  when  others  then 
// 	error_message('proc_gen_csv ' || sqlerrm);
// end; 	

//  PROCEDURE PROC_GEN_CSV IS
// out_file  Text_IO.File_Type;
	
//  Cursor C_SALITEM
//  is
// select it_code,'Invalid Item Code' it_type from temp_phyinv_upload t
//   where file_name = :TEMP_PHYINV_UPLOAD.file_name --- :P_FILE_NAME 
//   and not exists 
//   (select 1 from mommitem m where
//   t.it_code = m.it_code)
// union
//  select distinct it_code, 'Store Not defined' it_type from temp_phyinv_upload t 
//   where file_name = :TEMP_PHYINV_UPLOAD.file_name -----------:P_FILE_NAME 
//   and not exists 
// (Select 1 from mommitem m,mommstok o where 
//  m.it_code = o.it_code
//  and t.it_code = m.it_code
//  and trans_year =  :Global.G_Fin_Year ---:P_TRANS_YEAR
//  and t.wc_id = o.wc_id)  
// /*union------ blocked  by ravi  01-fev-2023  as discuss with bansal sir   bec  single item has a mutiple batch 
//  select it_code, 'Duplicate Items' it_type  from temp_phyinv_upload t
//  where file_name = :TEMP_PHYINV_UPLOAD.file_name -----:P_FILE_NAME 
//  group by it_code
//  having count(it_code) > 1*/
// union
//  select it_code, 'Negative Qty' it_type from temp_phyinv_upload
//  where file_name =  :TEMP_PHYINV_UPLOAD.file_name--- :P_FILE_NAME 
//  and qty < 0
// order by it_type ;



//   chtml_path moitparm.html_path%type;
//   v_name  moitdivision.name%type;    
//   cFNAME VARCHAR2(1000);
//   cinv_cat varchar2(200);
//   CGSTNO VARCHAR2(1000);
//   cit_name  varchar2(200);
// begin
// 	begin 
//     select GST_RETURN_CSV_PATH into chtml_path from moitparm ;
//   exception when no_data_found then
//     error_message('Package directory not defined in parameter master');
//   end; 
  
//   IF cHTML_PATH IS NULL THEN
//     error_message('GST RETURN CSV PATH defined in parameter master');
//   End IF; 
  	
  	
//   cFNAME := TO_CHAR(SYSDATE,'HH24MISS')||'phy'||'_DATEWISE.csv';	
//   cHTML_PATH :=cHTML_PATH||cFNAME;
//    out_file  := Text_IO.Fopen(chtml_path, 'W');
//    Text_IO.Put_Line(out_file, 
//                              'Item Code,'||
//                              'Item Description,'||     
//                               'Error type,');   
                     
//   FOR REC IN C_SALITEM LOOP
  		
// 	   	begin
// 		    select It_name into cit_name from mommitem 
// 		  	where  it_code = REC.it_code;
// 		  	exception when no_data_found then 
// 		      cit_name  := '';	
// 		  	end;
		  	
//   	   		    Text_IO.Put_Line(out_file, 
//   	                           REC.it_code||','||
//   	                           replace(cIT_NAME,',','')||','||
//                                REC.it_type);
 
//    end loop;
  
//     Text_IO.Fclose (out_file);
// 	begin 
//     select HTML_PATH into chtml_path from moitparm ;
//   exception when no_data_found then
//     error_message('Package directory not defined in parameter master');
//   end; 
  
//   IF cHTML_PATH IS NULL THEN
//     error_message('Package help directory not defined in parameter master under HTML PATH');
//   End IF;   
//   WEB.SHOW_DOCUMENT(CHTML_PATH||cfname,'_blank');

// end;
  

    // upload into main table
// declare
//     seq_TOMMPINV_PINV_ID number;
//      nCOUNT NUMBER ;
//      last_it_code varchar2(20);
//     cursor c_header is
//          select REC_ID,IT_CODE,nvl(QTY,0) qty ,
//                 FILE_NAME, WC_ID,INV_DATE,INV_MONTH,USER_ID,BATCH_NO,MAKE,
//                 to_date(batch_date,'dd-mm-yyyy') batch_date
//           from temp_phyinv_upload a
//           where inv_month = :temp_phyinv_upload.inv_month 
//           and inv_date =:temp_phyinv_upload.inv_date
//           and wc_id = :temp_phyinv_upload.wc_id
//           and not exists(select 1 from tommpinv b				
//                                 where inv_month = :temp_phyinv_upload.inv_month 
//                                 and inv_date =:temp_phyinv_upload.inv_date
//                                 and wc_id = :temp_phyinv_upload.wc_id
//                                 and a.it_code = b.it_code)
//                 order by REC_ID, it_code;
//      cursor c2 is 
//            select it_code,wc_id from mommstok a where 
//                  trans_year = :Global.G_fin_year
//                  and wc_id = :TEMP_PHYINV_UPLOAD.wc_id
//                  and not exists(select 1 from temp_phyinv_upload b
//                                 where inv_month = :temp_phyinv_upload.inv_month 
//                                 and inv_date =:temp_phyinv_upload.inv_date
//                                 and wc_id = :temp_phyinv_upload.wc_id
//                                 and a.it_code = b.it_code); 
//      cStore_process mommwc.store_process%type;                
// begin
//     begin
//         select Store_process into cStore_process
//          from mommwc 
//         where wc_id = :temp_phyinv_upload.wc_id;
//     exception when no_data_found then
//         error_message('Work Center doesnot exist');
// end;
// ---chk_invalid_data;  
//     for i in c_header loop
//         begin
//         if i.it_code <> NVL(last_it_code, 'XXXXXXX') then
//                   begin    
//                        select S_TOMMPINV_PINV_ID.nextval into seq_TOMMPINV_PINV_ID from dual;
//                   end ;
//           begin
//               insert into TOMMPINV(it_code,wc_id,trans_year,inv_month,inv_date,it_ok_qty,store_process,PINV_ID)
//                values(i.it_code , i.wc_id , :Global.G_fin_year ,i.inv_month , i.inv_date,to_number(i.qty),cStore_process,seq_TOMMPINV_PINV_ID);
//              nCOUNT:= nCOUNT+1;
//           exception when others then
//                  error_message(1||' '||i.it_code||' '||i.wc_id||' '||sqlerrm||'     '||sqlcode);
//                  raise form_trigger_failure;
//           end;
//           begin
//              insert into TOMMPINV_BATCH(it_code,wc_id,trans_year,inv_month,inv_date,it_ok_qty,baTch_no,batch_date,pinv_id)-- pinv_id  column added by ravi 27-dec-2022 as discuss with pm/bansal 
//                values(i.it_code , i.wc_id , :Global.G_fin_year ,i.inv_month , i.inv_date,to_number(i.qty),
//                i.batch_no||' - '||i.make,i.batch_date,seq_TOMMPINV_PINV_ID);
//              nCOUNT:= nCOUNT+1;
//           exception when others then
//                  error_message(2||' '||i.it_code||' '||i.wc_id||' '||sqlerrm||'     '||sqlcode);
//                  raise form_trigger_failure;
//           end;
//            begin
//              insert into TDMMPINV(PINV_ID,WO_ID,it_code,QTY_OK,QTY_REJ,BATCH_NO,BATCH_DATE)
//                values(seq_TOMMPINV_PINV_ID,i.wc_id ,i.it_code ,to_number(i.qty),null ,
//                 i.batch_no||' - '||i.make,i.batch_date);
//              nCOUNT:= nCOUNT+1;
//           exception when others then
//                  error_message(4||' '||i.it_code||' '||i.wc_id||' '||sqlerrm||'     '||sqlcode);
//                  raise form_trigger_failure;
//           end;
//         else
//           begin
//              insert into TOMMPINV_BATCH(it_code,wc_id,trans_year,inv_month,inv_date,it_ok_qty,baTch_no,batch_date,pinv_id)----- pinv_id  column added by ravi 27-dec-2022 as discuss with pm/bansal 
//                values(last_it_code , i.wc_id , :Global.G_fin_year ,i.inv_month , i.inv_date,to_number(i.qty),
//                i.batch_no||' - '||i.make,i.batch_date,seq_TOMMPINV_PINV_ID);
//              nCOUNT:= nCOUNT+1;
//           exception when others then
//                  ---error_message(3||' '||i.it_code||' '||i.wc_id||' '||:Global.G_fin_year||' '||i.inv_month||' '||i.inv_date||' '||i.qty||' '||i.batch_no||' '||i.make||' '||sqlerrm||'     '||sqlcode);
//                  --raise form_trigger_failure;
//                  insert into TOMMPINV_BATCH_FAILED(it_code,wc_id,trans_year,inv_month,inv_date,it_ok_qty,baTch_no)
//                values(last_it_code , i.wc_id , :Global.G_fin_year ,i.inv_month , i.inv_date,to_number(i.qty),i.batch_no||' - '||i.make);
//              ----nCOUNT:= nCOUNT+1;
//           end;
//           begin
//              insert into TDMMPINV(PINV_ID,WO_ID,it_code,QTY_OK,QTY_REJ,BATCH_NO,BATCH_DATE)
//                values(seq_TOMMPINV_PINV_ID,i.wc_id ,i.it_code ,to_number(i.qty),null , 
//                i.batch_no||' - '||i.make,i.batch_date);
//              nCOUNT:= nCOUNT+1;
//           exception when others then
//                  ---error_message(3||' '||i.it_code||' '||i.wc_id||' '||:Global.G_fin_year||' '||i.inv_month||' '||i.inv_date||' '||i.qty||' '||i.batch_no||' '||i.make||' '||sqlerrm||'     '||sqlcode);
//                  --raise form_trigger_failure;
//                  insert into TDMMPINV_FAILED(PINV_ID,WO_ID,it_code,QTY_OK,QTY_REJ,BATCH_NO,BATCH_DATE)
//                values(seq_TOMMPINV_PINV_ID,i.wc_id ,i.it_code ,to_number(i.qty),null ,
//                 i.batch_no||' - '||i.make,i.batch_date);
//              ----nCOUNT:= nCOUNT+1;
//           end;
//         end if;
//         end;-----        
//         last_it_code:=i.it_code;      
//         COMMIT;--PREETI
//     end loop; 
//       update tommpinv a 
//       set it_ok_qty = (select sum(it_ok_qty) 
//                        from tommpinv_batch b 
//                        where b.it_code = a.it_code and b.wc_id = a.wc_id 
//                        and   b.trans_year = a.trans_year and b.inv_month=a.inv_month 
//                        and b.inv_date = a.inv_date 
//                        and  b.pinv_id = a.pinv_id ---- pinv_id  column added by ravi 27-dec-2022 as discuss with pm/bansal 
//                        );
//     begin
//         for j in c2 loop
//             begin
//                 begin    
//                   select S_TOMMPINV_PINV_ID.nextval into seq_TOMMPINV_PINV_ID from dual;
//                  end ;
//                 insert into TOMMPINV(it_code,wc_id,trans_year,inv_month,inv_date,it_ok_qty,store_process,PINV_ID)
//                 values (j.it_code,j.wc_id,:Global.G_fin_year,:TEMP_PHYINV_UPLOAD.inv_month,:TEMP_PHYINV_UPLOAD.inv_date,0,cStore_process,seq_TOMMPINV_PINV_ID); --S_TOMMPINV_PINV_ID);
//             exception when others then
//                 ERROR_MESSAGE(sqlerrm);
//             end;
//           COMMIT ;--PREETI---------------PREETI
//         end loop;
//     end;
//  error_message('Data successfully updated into main table.' ); 
//  error_message(nCOUNT||'  '||'Rows successfully Inserted.' );
//  --.select count(*) from 
//  --code added by sachin gupta on 09112015      
//  delete
//  from temp_phyinv_upload
//               where inv_month = :temp_phyinv_upload.inv_month 
//           and inv_date =:temp_phyinv_upload.inv_date
//           and wc_id = :temp_phyinv_upload.wc_id  ;  
//  commit;         								-- added on 1.8.2022 (pm)
// end;

