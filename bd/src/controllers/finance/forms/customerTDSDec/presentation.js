


exports.transformCustomerTDSDeclToDbData = (data) => {
  return {
    c_code: data.c_code,
    trans_year: data.trans_year,
    return_filed:data.return_filed || 'Y',
    acknowledgement_no:data.acknowledgement_no || null,
    contact_person:data.contact_person || null,
    contact_person_tel:data.contact_person_tel || null,
    acknowledgement_date:data.acknowledgement_date || null,
    last_date_return_file:data.last_date_return_file || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.userId || null,
    update_date: new Date(),
  };
};



// if :control.di_formstatus in ('INSERT','UPDATE') then
// 	if :mommstok.trans_year is null then
// 		error_message('Year cannot be left blank');
// 		raise form_trigger_failure;
// 	end if;
// 	if :mommstok.trans_year is not null then
// 		begin
// 		  select year_code into :mommstok.trans_year
// 		  from moitfinyear 
// 		  where year_code = :mommstok.trans_year;
// 		exception when no_data_found then
// 			error_message('Please select correct Year from help');
// 			raise form_trigger_failure;
// 		end;
//   end if;
  
//   if :mommstok.LAST_DATE_RETURN_FILE is null then
// 		error_message('Last Date of Return Filing cannot be left blank');
// 		raise form_trigger_failure;
// 	end if;

//   if :mommstok.CONTACT_PERSON is null then
// 		error_message('Contact Person cannot be left blank');
// 		raise form_trigger_failure;
//   end if;
  
//   if :mommstok.CONTACT_PERSON_TEL is null then
// 		error_message('Contact Person Telephone No. cannot be left blank');
// 		raise form_trigger_failure;
// 	end if;
  
//   if :MOMMSTOK.RETURN_FILED = 'Y' and :MOMMSTOK.ACKNOWLEDGEMENT_NO is null then
//  		 error_message('If Return filed the Acknowledgement no is must');
// 			raise form_trigger_failure;
// 	end if;
  
//   if :MOMMSTOK.trans_year is not null then
//   	--error_message(':MOMMSTOK.trans_year ' || :MOMMSTOK.trans_year);
//   	--error_message(':MOMMWC.v_code ' || :MOMMWC.v_code);
//   	declare
// 				cFound varchar2(1);
// 			begin
// 				begin
// 					select 'Y' into cfound
// 					  from mdsmcust_tds_decl
// 					where trans_year = :MOMMSTOK.trans_year
// 						and c_code = :MOMMWC.c_code
// 					/*  and RETURN_FILED = :MOMMSTOK.RETURN_FILED
// 					  and ACKNOWLEDGEMENT_NO = :MOMMSTOK.ACKNOWLEDGEMENT_NO*/
// 					  and rownum = 1;
// 					error_message('TDS declarations already exists for  this customer for the year');
// 					raise form_trigger_failure;
// 				exception when no_data_found then
//            null;
// 				end;
//       end;
// 		end if;
 
// end if;