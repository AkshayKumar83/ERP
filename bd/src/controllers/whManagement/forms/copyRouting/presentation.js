exports.transformRouteHeaderToDbData = (data) => {
  return {
    route_no: data.route_no || null,
    route_start_date: data.route_start_date || null,
    route_end_date: data.route_end_date || null,
    operation_no: data.operation_no || null,
    it_code: data.it_code || null,
    wc_id: data.wc_id || null,
    operation_description: data.operation_description || null,
    min_hour_flag: data.min_hour_flag || null,
    setup_time: data.setup_time || null,
    run_time: data.run_time || null,
    move_time: data.move_time || null,
    setup_crew_no: data.setup_crew_no || null,
    run_crew_no: data.run_crew_no || null,
    helper_crew_no: data.helper_crew_no || null,
    remarks: data.remarks || null,
    tool_change_time: data.tool_change_time || null,
    qty: data.qty || 1,
    master_route_no: data.master_route_no || null,
    route_id: data.route_id, 
    opn_id: data.opn_id,
    final_code: data.final_code || null,
    default_wc: data.default_wc || "N",
    cancel_flag: data.cancel_flag || "N",
    cancel_date: data.cancel_date || null,
    rev_no: data.rev_no || 0,
    rev_date: data.rev_date || null,
    ecn_id: data.ecn_id || null,
    ver_no: data.ver_no || 0,
    design_eng_name: data.design_eng_name || null,
    instructions: data.instructions || null,
    machine_hour_rate: data.machine_hour_rate || null,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
  };
};


// declare
// 	dummy varchar2(1);
// begin
// 	if :mhpscopyrout.from_route_no is null then
// 		error_message('From Route Sheet No. Can not be blank');
// 		raise form_trigger_failure;
// 	end if;
// 		select 'x' into dummy 
// 	from  mhpsrout 
// 	where route_no = :mhpscopyrout.from_route_no
// 		and rownum = 1;
// exception when no_data_found then
// 	error_message('From Route Sheet No. does not exist');
// 	raise form_trigger_failure;
// end;

// declare
// 	dummy varchar2(1);
// begin
// 	if :mhpscopyrout.to_route_no is null then
// 		error_message('To Route Sheet No. Can not be blank');
// 		raise form_trigger_failure;
// 	end if;
// 	select 'x' into dummy 
// 	from  mhpsrout 
// 	where route_no = :mhpscopyrout.to_route_no
// 		and rownum = 1;
// 	error_message('To Route Sheet No. already exists');
// --	raise form_trigger_failure;
// exception when no_data_found then
// 	null;
// end;

// BEGIN
// 	SELECT IT_NAME INTO :MHPSROUT.NEW_IT_NAME
// 	FROM MOMMITEM
// 	WHERE IT_CODE = :MHPSROUT.NEW_IT_CODE;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	ERROR_MESSAGE('New Output Item Code does not exist');
// 	RAISE FORM_TRIGGER_FAILURE;
// END;

// DECLARE
// 	cFound NUMBER;
// BEGIN
// 	SELECT 1 INTO cFound
// 	FROM MOMMITEM
// 	WHERE IT_CODE = :MHPSROUT.NEW_FINAL_CODE;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	ERROR_MESSAGE('Final Item Code does not exist');
// 	RAISE FORM_TRIGGER_FAILURE;
// END;


// BEGIN
// 	SELECT OPERATION_NO INTO :MHPSROUT.OPERATION_NO
// 	FROM MOEMOPNS
// 	WHERE OPN_ID = :MHPSROUT.OPN_ID;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;
// BEGIN
// 	SELECT IT_NAME INTO :MHPSROUT.IT_NAME
// 	FROM MOMMITEM
// 	WHERE IT_CODE = :MHPSROUT.IT_CODE;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;
// BEGIN
// 	SELECT WC_NO INTO :MHPSROUT.WC_NO
// 	FROM MOMMWC
// 	WHERE WC_ID = :MHPSROUT.WC_ID;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	NULL;
// END;
// BEGIN
// 	SELECT IT_CODE, FINAL_CODE INTO :MHPSROUT.NEW_IT_CODE,:MHPSROUT.NEW_FINAL_CODE
// 	FROM MHPSROUT
// 	WHERE ROUTE_NO = :TO_ROUTE_NO
// 	AND OPN_ID = :OPN_ID;
// 	SELECT 'Y' INTO :MHPSROUT.SELECT_CHECK
// 	FROM MHPSROUT
// 	WHERE ROUTE_NO = :TO_ROUTE_NO
// 	AND OPN_ID = :OPN_ID
// 	AND :MHPSROUT.NEW_IT_CODE IS NOT NULL;
// EXCEPTION WHEN NO_DATA_FOUND THEN
// 	NULL;
// 	WHEN TOO_MANY_ROWS THEN
// 	ERROR_MESSAGE ('Combination of Item code and final code exists more than once');
// 	raise form_trigger_failure; 
// END;

// :MHPSROUT.NEW_IT_CODE:=:MHPSROUT.IT_CODE;
// :MHPSROUT.NEW_FINAL_CODE:=:MHPSROUT.FINAL_CODE;


// PROCEDURE ROUTE_COPY IS
// BEGIN
// 	GO_BLOCK('MHPSROUT');
// 	FIRST_RECORD;
// 	WHILE :MHPSROUT.IT_CODE IS NOT NULL LOOP
// 		IF :MHPSROUT.NEW_IT_CODE IS NOT NULL AND NVL(:SELECT_CHECK,'N') = 'N' THEN
// 			SELECT S_MHPSROUT_ROUTE_ID.NEXTVAL INTO :MHPSROUT.NEW_ROUTE_ID FROM DUAL;
					
// 			INSERT INTO MHPSROUT (
// 				ROUTE_NO, ROUTE_START_DATE, ROUTE_END_DATE, OPERATION_NO, IT_CODE, WC_ID,
// 				OPERATION_DESCRIPTION, MIN_HOUR_FLAG, SETUP_TIME, RUN_TIME, MOVE_TIME,
// 				SETUP_CREW_NO, RUN_CREW_NO, HELPER_CREW_NO, REMARKS, QTY, ROUTE_ID, 
// 				MASTER_ROUTE_NO, OPN_ID, FINAL_CODE, TOOL_CHANGE_TIME, CANCEL_FLAG, DEFAULT_WC)
// 			(SELECT 
// 				:MHPSCOPYROUT.TO_ROUTE_NO, ROUTE_START_DATE, ROUTE_END_DATE, OPERATION_NO,
// 				:MHPSROUT.NEW_IT_CODE, WC_ID,	OPERATION_DESCRIPTION, MIN_HOUR_FLAG,
// 				SETUP_TIME, RUN_TIME, MOVE_TIME, SETUP_CREW_NO, RUN_CREW_NO,
// 				HELPER_CREW_NO, REMARKS, QTY, :MHPSROUT.NEW_ROUTE_ID, MASTER_ROUTE_NO, OPN_ID,
// 				:MHPSROUT.NEW_FINAL_CODE, TOOL_CHANGE_TIME, 'N', H.DEFAULT_WC
// 			FROM MHPSROUT H
// 			WHERE H.ROUTE_ID = :MHPSROUT.ROUTE_ID);

// 			INSERT INTO MDPSROUT (ROUTE_NO, INPUT_IT_CODE, USAGE, IT_BOM_UM, ROUTE_ID)
// 			(SELECT :MHPSCOPYROUT.TO_ROUTE_NO, INPUT_IT_CODE, USAGE, IT_BOM_UM, :MHPSROUT.NEW_ROUTE_ID
// 			FROM MDPSROUT D
// 			WHERE D.ROUTE_ID = :MHPSROUT.ROUTE_ID);

// 			BEGIN
// 				GEN_ROUTING_MOMMSTOK(:GLOBAL.G_FIN_YEAR, :MHPSROUT.ROUTE_ID,
// 														:MHPSCOPYROUT.TO_ROUTE_NO, :MHPSROUT.NEW_FINAL_CODE,
// 														:MHPSROUT.WC_ID);
// 			END;
// 		END IF;
// 		EXIT WHEN :SYSTEM.LAST_RECORD = 'TRUE';
// 		NEXT_RECORD;
// 	END LOOP;
// END;