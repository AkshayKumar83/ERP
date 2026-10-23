import toast from "react-hot-toast";


export const headers=[
    { label: "NO.", width:"6%" ,required:true},
    { label: "Opnen Desc.", width:"25%" ,required:true},
    { label: "Stage Name", width:"7%",required:true },
    { label: "M/C Based", width:"5%"},
    { label: "Insp. Stage", width:"5%"},
    { label: "Opn. Dtl. Desc.", width:"50%"},
]

 export const defineOpreationData={
    operation_no:"",        
    opn_desc:"",  
    opn_stage_name:"", 
    opn_dtl_desc:"",
    machin_based:"Y",
    inspection_flag:"N",
    opn_id:"",  
 }

export const validateFromDb = async ({ type, value, extra }) => {
  
  try {
    const url = import.meta.env.VITE_BASE_API_URL + "/define-operation/validate";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type,
        value,
        extra,
      }),
    });

    const data = await response.json();

    if (data?.valid) {
      return data;
    }

    toast.error(data?.message || "Validation failed");
    return false;

  } catch (error) {
    console.error("validateFromDb fetch error:", error);
    toast.error("Server not reachable");
    return false;
  }
};

















//  select s_moemopns_opn_id.nextval into :moemopns.opn_id from dual;



// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// IF :MOEMOPNS.OPN_DESC IS NULL THEN
// 	 ERROR_MESSAGE('Oparation Description can not be null');
// 	 RAISE FORM_TRIGGER_FAILURE;
// ELSE
//    DECLARE 
// 	  DUMMY  VARCHAR2(1);
// 	 BEGIN
//      SELECT 'X' INTO DUMMY FROM MOEMOPNS
//      WHERE OPN_DESC = :MOEMOPNS.OPN_DESC;
//      ERROR_MESSAGE ('Name exists in Table');
//      RAISE FORM_TRIGGER_FAILURE;
//   EXCEPTION
// 	  WHEN NO_DATA_FOUND THEN NULL;
//   END ;
// END IF;
// END IF;

// if :control.di_formstatus in ('INSERT','UPDATE') THEN
// IF :MOEMOPNS.OPERATION_NO IS NULL THEN
// 	 ERROR_MESSAGE('Operation No. can not be null');
// 	 RAISE FORM_TRIGGER_FAILURE;
// ELSE
//    DECLARE 
// 	  DUMMY  VARCHAR2(1);
// 	 BEGIN
//      SELECT 'X' INTO DUMMY FROM MOEMOPNS
//      WHERE OPERATION_NO = :MOEMOPNS.OPERATION_NO;
//      ERROR_MESSAGE ('Operation No. Already exists in Table.');
//      RAISE FORM_TRIGGER_FAILURE;
//    EXCEPTION
// 	   WHEN NO_DATA_FOUND THEN NULL;
//    END ;
// END IF;
// END IF;

// IF :CONTROL.DI_FORMSTATUS IN ('INSERT','UPDATE') THEN
// IF :MOEMOPNS.OPN_STAGE_NAME IS NULL THEN
// 	 ERROR_MESSAGE('Oparation Stage Name can not be null');
// 	 RAISE FORM_TRIGGER_FAILURE;
// ELSE
// 	NULL;
// END IF;
// END IF;
  