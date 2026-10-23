import toast from "react-hot-toast";

export const transactionMstrInitData = {
    type:"",
    ok_rej:"",
    trans_code:"",
    type_desc:"",
    from_wc_no:"",
    from_desc:"",
    from_wc_id:"",
    to_wc_no:"",
    to_desc:"",
    authorised_req:"N",
    prdn_dlvry_flag:"N",
    receive_issue_flag:"",
    to_wc_id:"",
    create_id:"",
    create_date:"",
    update_id:"",
    update_date:"",
}

export const DescHelpListHeader = [
  {label: "Trans Code", key: "trans_code"},
  {label: "Trans Description", key: "type_desc"},
]

export const fromHelpListHeader = [
    {label: "Description", key: "description"},
     {label: "WC No.", key: "wc_no"},
     {label: "WC Id.", key: "wc_id"},
 ]
 export const toHelpListHeader = [
   {label: "Description", key: "description"},
    {label: "WC No.", key: "wc_no"},
    {label: "WC Id.", key: "wc_id"},
    
 ]


 export const handleValidateField = (e, formStatus) => {
  if (!["Insert",'Update'].includes(formStatus)) {
    return;
  }
  
  const { name, value } = e.target;

  if (name === "from_wc_no") {
    if (!value) {
      toast.error("From Site can't be blank, Please select on double click");
      e.target.focus(); 
    }
    return;
  }
  if (name === "to_wc_no") {
    if (!value) {
      toast.error("To Site can't be blank, Please select on double click");
      e.target.focus(); 
    }
    return;
  }
};


   export const createSearchPayloadForTransMstrSpecificSearch = (masterData) =>{
     let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    type_desc:'type_desc',
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  console.log("hasMasterKeys", hasMasterKeys);

  if (hasMasterKeys) {
    Object.keys(masterKeys).forEach((key) => {
      let value = masterData[key];

      // Exclude undefined and empty values ("")
      if (value !== undefined && value !== "") {
        payload[masterKeys[key]] = value;
      }
    });
  }

  return payload;
};












// PROCEDURE CHANGELOV_WC IS
// BEGIN
//     SET_ITEM_PROPERTY('FROM_WC_NO', LOV_NAME, 'LOV_WC1');   
//     SET_ITEM_PROPERTY('TO_WC_NO', LOV_NAME, 'LOV_WC2');   

//     if :TYPE in (1, 2) then
//       :mommtrty.ok_rej := 'O';
//     elsif :TYPE in (3, 4) then
//       :mommtrty.ok_rej := 'R';
//     end if;

//     if :mommtrty.type in (1,3) then
//       :mommtrty.receive_issue_flag := 'R';
//     elsif :mommtrty.type in (2,4) then
//       :mommtrty.receive_issue_flag := 'I';
//     end if;
// END;

// FUNCTION FuncGenTransCode(pType number) RETURN number IS
//   nTrans_code Number(3);
//   nNewTrans_code number(3);
// BEGIN
//   Select max(trans_code) into nTrans_Code
//   from mommtrty
//   where type <> 0;

//   If pType is not null then 
//     If nTrans_code is null then
//       nNewTrans_code := 101;
//     Else
//       nNewTrans_code := nTrans_code + 1;
//     End if;     
//   Else 
//     :mommtrty.trans_code := null;
//      Error_message('Transection code not generated .. Select Type');
//      raise form_trigger_failure;
//   End if;
//   Return(nNewTrans_code);
// End;

// PROCEDURE InsertContraEntry IS
//   nTrans_code number;
//   nType number;
//   cType_desc varchar2(40);
//   cOk_rej varchar2(1);
//   cReceive_issue_flag varchar2(1);
//   cProcess_store varchar2(1);
//   cProcess_store1 varchar2(1);
// BEGIN
//   begin
//      select store_process into cProcess_store 
//          from mommwc where wc_id = :from_wc_id;
//   exception
//      when no_data_found then
//        null;
//   end;
//   begin
//      select store_process into cProcess_store1
//         from mommwc where wc_id = :to_wc_id;
//   exception
//      when no_data_found then
//        null;
//   end;

//   if cProcess_store = 'S' and cProcess_store1 = 'S' then
//      if :mommtrty.type = 1 then
//         nType := 2;
//         cOk_rej := 'O';
//         cReceive_issue_flag := 'I';
//         cType_desc := 'NON PRODUCTIVE ISSUE';
//      elsif :mommtrty.type = 2 then
//         nType := 1;
//         cOk_rej := 'O';
//         cReceive_issue_flag := 'R';
//         cType_desc := 'MATERIAL RETURN';
//      elsif :mommtrty.type = 3 then
//         nType := 4;
//         cOk_rej := 'R';
//         cReceive_issue_flag := 'I';
//         cType_desc := 'REJECTION ISSUE';
//      elsif :mommtrty.type = 4 then
//         nType := 3;
//         cOk_rej := 'R';
//         cReceive_issue_flag := 'R';
//        cType_desc := 'MATERIAL RETURN (REJ.)';
//      end if;
//      nTrans_code  := FuncGenTransCode(nType);
//      insert into mommtrty(trans_code, type, type_desc, from_wc_id, to_wc_id,
//         ok_rej, receive_issue_flag)
//      values(nTrans_code, nType, cType_desc, :from_wc_id, :to_wc_id, cOk_rej,
//         cReceive_issue_flag);
//   end if;
// END;
