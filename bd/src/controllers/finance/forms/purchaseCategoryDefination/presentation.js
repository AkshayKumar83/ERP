exports.transformPurchCtgyDfntToDbData = (data) => {
  return {
    trans_code: data.trans_code,
    po_cat_prefix: data.po_cat_prefix || null,
    frt_acc_no: data.frt_acc_no || null,
    division_id: data.division_id || 1 ,
    create_id: data.create_id || data.userId || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || data.userId || null,
    update_date:data.upddate_date || new Date(),
  };
};

 
// ------where clause-------

// exists 
// (select 1 from MOMMPCAT  
// where PO_CAT_PREFIX = MOFMPCAT.PO_CAT_PREFIX
//   and division_id = :Global.G_Division_id) 
// --------------------------------------------------------


// ---------------helplist --------------------
// ---po category-

// select PO_CAT_DESCRIPTION,PO_CAT_PREFIX  from MOMMPCAT h
// where division_id = :Global.G_Division_id
//   and not exists (select 1 from MOFMPCAT d where h.PO_CAT_PREFIX= d.PO_CAT_PREFIX)

// --- acc code ---------
// select acc_desc,h.acc_no from mhfmglm h , mdfmglm d
// where h.acc_no = d.ACC_NO
//   and d.DIVISION_ID = :Global.G_Division_id
//   and d.TRANS_YEAR = :Global.G_Fin_Year
//   order by 1

// ------------------------------------------------------------------


// item level validation
// --- Trans Code ----
// return;
// if substr(:MOFMPCAT.TRANS_CODE,1,1) <> 'P' THEN
// 	error_message('First Character of Transaction type should be ''P''');
// 	raise form_trigger_failure;
// end if;	

// if length(:MOFMPCAT.TRANS_CODE) < 2 then
// 	error_message('Transaction Code should be Minimum of two Character');
// 	raise form_trigger_failure;
// end if;	

// if :di_formstatus in ('INSERT','UPDATE') then
// 	declare
// 		ccheck varchar2(30);
// 	begin
// 	  select rowid INTO ccheck 
// 	   from mofmpcat 
// 	   where trans_code = :mofmpcat.trans_code;
// 	   IF :mofmpcat.ROWID IS NULL OR :mofmpcat.ROWID <> ccheck THEN
//         error_message('Trans Code  already exist ');
//         RAISE form_trigger_failure;
// 	   END IF;
// 	exception when no_data_found then
// 	  null;
// 	end;   
// end if;
	
// ---------po category-----
// if :PO_CAT_PREFIX is not null then
// 	begin
//    select PO_CAT_DESCRIPTION into  :PO_CAT_PREFIX_DESC 
//     from MOMMPCAT 
//    where division_id = :Global.G_Division_id
//      and PO_CAT_PREFIX = :PO_CAT_PREFIX;
// 	exception when no_data_found then
// 		error_message('Invalid po Category');
// 		raise form_trigger_failure;
// 	end;	
// end if;

// --------freight acc code ---------

// 	if :frt_acc_no is not null then
// 	begin
// 			select acc_desc into :acc_desc 
// 			from mhfmglm h , mdfmglm d
// 		where h.acc_no = d.ACC_NO
// 		  and h.acc_no = :frt_acc_no
// 		  and d.DIVISION_ID = :Global.G_Division_id
// 		  and d.TRANS_YEAR  = :Global.G_Fin_Year;
// 	exception when no_data_found then
// 		error_message('Invalid Account code');
// 		raise form_trigger_failure;
// 	end;
// end if;	
  
// ----------------post query------------
// 	begin
//    select PO_CAT_DESCRIPTION into  :PO_CAT_PREFIX_DESC 
//     from MOMMPCAT 
//    where division_id = :Global.G_Division_id
//      and PO_CAT_PREFIX = :PO_CAT_PREFIX;
// 	exception when no_data_found then
// 		error_message('Invalid po Category');
// 		raise form_trigger_failure;
// 	end;
// 	if :frt_acc_no is not null then
// 	begin
// 		select acc_desc into :acc_desc 
// 		from mhfmglm h , mdfmglm d
// 	where h.acc_no = d.ACC_NO
// 	  and h.acc_no = :frt_acc_no
// 	  and d.DIVISION_ID = :Global.G_Division_id
// 	  and d.TRANS_YEAR  = :Global.G_Fin_Year;
//   exception when no_data_found then
// 	  error_message('Invalid Account code');
// 	  raise form_trigger_failure;
//   end;
//   end if;

// ----------------------------------------

// function GEN_TRANS_CODE return varchar2 IS
//   cChar varchar2(2);
//   cFound varchar2(1);
// begin
// 	FOR I IN 49 .. 126 LOOP
// 		if i between 49 and 57 or i between 65 and 90 then
// 			cChar := 'P'||chr(i);
// 			begin
//     	  select 'Y' into cFound from mofmpcat f where f.trans_code = cChar
//     	                        and f.division_id = :global.g_division_id;
// 			exception when no_data_found then
// 				exit;
// 			end;
// 		end if;
// 	END LOOP;
//   return (cChar);
// END;