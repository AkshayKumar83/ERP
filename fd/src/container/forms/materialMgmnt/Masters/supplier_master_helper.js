import toast from "react-hot-toast";
import { validate_field } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";

export const supplierMasterInitialData = {
    expense_flg:'N',
    v_code:'',
    v_name:'',
    v_name1:'',
    v_add1:'',
    v_add2:'',
    v_add3:'',
    v_city_name:'',
    v_city:'',
    mode_cd:'',
    pric_basis:'',
    v_district:'',
    v_state:'',
    update_by:'',
    create_by:'',
    v_zone:'',
    v_country:'',
    v_region:'',
    v_zip_code:'',
    turnover:'',
    vend_type:'',
    active:'',
    incl_vend_rat:'',
    date_added:'',
    con_per1:'',
    con_per2:'',
    v_loc:'L',
    covered_excise:'Y',
    msme_flag:'E',
    telephone1:'',
    telephone2:'',
    fax:'',
    telex:'',
    tarrif_no:'',
    v_grams:'',
    email:'',
    msme_regn_no:'',
    cst_no:'',
    lst_no:'',
    ecc_no:'',
    ser_tax_no:'',
    term_code:'',
    direct_bill_create:'',
    ssi_flag:'',
    tds_thresh_hold_limit:'',
    tds_flag:'N',
    tds_cat:'N', //IT SHOULD BE C
    curr_cd:'',
    range:'',
    division:'',
    comm:'',
    pan_no:'',
    v_banker:'',
    bnk_ac_no:'',
    v_banker_add1:'',
    v_banker_add2:'',
    v_banker_add3:'',
    ifsc_cd:'',
    manuf_flag:'',
    tax_code:'',
    tax_desc:'',
    vend_bank_ifsc_code:'',
    vend_bank_acc_no:'',
    acc_holder_name:'',
    vend_bank_acc_name:'',
    vend_bank_add:'',
    bank_swift_code:'',
    bank_iban_sort_bsb_transit_no:'',
    bank_intermediary_name:'',
    create_id:'',
    update_id:'',
    tin_no:'',
    transport:'',
    security_service:'',
    legal:'',
    gst_state_code:'',
    cb_gst_registered:'',
    arn_no:'',
    gst_no:'',
    gst_contact_persion:'',
    gst_contact_persion_desig:'',
    gst_contact_no:'',
    gst_contact_email:'',
    rc_applicable:'',
    v_legal_name:'',
    trans_dist_km:'',
    travel_agency_yn:'',
    whether_gst_registered_dlr:'Y',
    vcode_auto:'Y'
}

export const cityHelpListHeader= [
    { label: "City", key: "city" },
    { label: "Country", key: "country" },
    { label: "City Code", key: "ctycode" },
    { label: "District", key: "district" },
    { label: "Region", key: "region" },
    { label: "State", key: "state" },
    { label: "Zone", key: "zone" },
]

export const vendorNameHelpListHeader = [
    {label: "Vendor Code", key: "v_code"},
    {label: "Vendor Name",key: "v_name"},  
 ]

export const taxCodeHelpListHeader = [
    {label: "Tax Code", key: "tax_code"},
    {label: "Tax Desc.",key: "tax_desc"},  
 ]

  

 export const handleValidateField = (e,formStatus,formData) => {
    if(!['Insert', 'Update'].includes(formStatus)){
        return
    }
    const { name, value } = e.target;
    if (name === "v_code") {
        if (!value) {
            toast.error("Vendor Code cannot be blank");
            document.getElementById("v_code").focus();
        }
        return;
    }
    if (name === "v_name") {
        if (!value) {
            toast.error("Vendor Name cannot be blank");
            document.getElementById("v_name").focus();
        }
        return;
    }
      if (name === "v_add1") {
        if (!value) {
            toast.error("Address name can not be null");
            document.getElementById("v_add1").focus();
        }
        return;
    }
      if (name === "v_city_name") {
        if (!value) {
            toast.error("City Name Can Not be null,Please Select on Help List");
            document.getElementById("v_city_name").focus();
        }

        return;
    }
     if (name === "v_zip_code") {
        if (!value) {
            toast.error("Pin Code  can not be null");
            document.getElementById("v_zip_code").focus();
        }
        return;
    }
    if (name === "vend_type") {
        if (!value) {
            toast.error("Vendor Type cannot be blank");
            document.getElementById("vend_type").focus();
        }
        return;
    } 
    if (name === "telephone1") {
        if (!value) {
            toast.error("Telephone[1] cannot be blank");
            document.getElementById("telephone1").focus();
        }
        return;
    } 
    if (name === "email") {
        if (!value) {
            toast.error("Email cannot be blank");
            document.getElementById("email").focus();
        }
        return;
    } 
    // if (name === "pan_no") {
    //     if (!value) {
    //         toast.error("Pan No. cannot be blank");
    //         document.getElementById("pan_no").focus();
    //     }
    //     return;
    // } 
    
     // PAN No validation
  if (name === "pan_no") {
    // Required check (always)
    if (!value || value.trim() === "") {
      toast.error("PAN No cannot be blank");
      document.getElementById("pan_no").focus();
      return;
    }
}



    // Conditional validatePanNo check
    const { v_city, v_country } = formData;
    if (v_city && v_country === 'INDIA') {
      const isValid = validatePanNo(formData, formStatus);
      if (!isValid) {
        document.getElementById("pan_no").focus(); // invalid hone pe focus wahi rok do
        return;
      }
    }
    return;
};

// validate supplier master form on save
export const validateFormDataOnSave =(formData={})=>{
    if(!formData?.v_name){
        toast.error('Vendor Name cannot be left blank')
        return
    }
    if(!formData?.v_add1){
        toast.error('Vendor Address Can Not be null')
        return
    }
    if(!formData?.v_city_name){
        toast.error('City Name Can Not be null')
        return
    }
    if(!formData?.v_zip_code){
        toast.error('Zip Code can not be left blank')
        return
    }
    if(formData?.turnover<0){
        toast.error('Turnover Amount cannot be less than zero')
        return
    }
    if(!formData?.vend_type){
        toast.error(`Vendor type can not be left blank`)
        return
    }
     return true;    // Everything is valid
}

  // for validate Vendor Code
 export const validateVcode = async (vCode, isVCodeAuto) => {  
    // If VCode is auto-generated, skip manual validation
    if (isVCodeAuto === 'Y') {
        return true;
    }

    // Check for empty or null VCode
    if (!vCode) {
        toast.error('Vendor Code cannot be null');
        return false;
    }

    try {
        // Call your API or helper to validate v_code
        const isVCodeFound = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}`, 'v_code', vCode);

        if (isVCodeFound.exists) {
            toast.error('Vendor Code already exists');
            return false;
        }

        return true; // VCode is valid and unique
    } catch (error) {
        console.error("Error validating Vendor Code:", error);
        toast.error("Error validating Vendor Code");
        return false;
    }
};

   // for validate Vendor Name
export const validateVname = async (formData, handleDiLastCode = () => {}) => {
    
  const { v_name, vcode_auto, expense_flg } = formData;

  if (!v_name) {
    toast.error('Vendor Name cannot be left blank');
    return false;
  }

  if (vcode_auto === 'N') {
    try {
      const maxVendorCode = await validate_field(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}`,'v_name',v_name,{ exp_flg: expense_flg }
      );

      const lastCode = maxVendorCode?.v_code;

      if (lastCode) {
        handleDiLastCode(`Last Vendor Code is ${lastCode}`);
      } else {
        handleDiLastCode('');
      }
    } catch (error) {
      console.error('Error fetching last vendor code:', error);
      toast.error('Failed to fetch last vendor code');
    }
  }

  return true;
};

// for validate city field
export const validateCity = async (e, setData, formData = {}, formStatus) => {
    if(!formStatus){
        return
    }
    try {
        const {name, value} = e.target;

        // Check if the input value is empty
        if (!value.trim()) {
            toast.error("City Name cannot be null");
            e.target.focus(); // Use target focus instead of document
            return false;
        }

        // API call to validate the field
        const getLocationDetail = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}`, name, value);

        // Check if there was an error message from the API
        if (getLocationDetail?.errMsg) {
            toast.error(getLocationDetail.errMsg);
            setData((prev) => {
                // Clear or update the form data if validation fails
                return {
                    ...prev,
                    v_city_name: "",
                    v_city: "",
                    v_district: "",
                    v_state: "",
                    v_zone: "",
                    v_country: "",
                    v_region: " ",
                    gst_state_code:''
                }; // Or handle the state as needed
            });
            return false;
        } 
        // else {
            // Update form data if validation succeeds
            // setData(prev => {
            //     return {
            //         ...formData,
            //         v_city_name: value,
            //         ...getLocationDetail.locationData
            //         // You can add other fields returned from API if needed
            //     };
            // });
            //   }
             else {
            setData(prev => ({
                ...prev,
                v_city_name: value,
                ...getLocationDetail.locationData
            }));
        }


        return true;

    } catch (error) {
        console.error("Error during city validation:", error);
        toast.error("An error occurred while validating the city name");
        return false;
    }
};

export const validatePanNo = (formData, formStatus) => {
  const { pan_no, v_city, v_country } = formData;

  if (formStatus === 'Insert' || formStatus === 'Update') {
    if (v_city && v_country === 'INDIA') {

      if (!pan_no || pan_no.trim() === '') {
        toast.error("PAN No cannot be left blank or enter PANNOTAVBL.");
        return false;
      }

      const panUpper = pan_no.toUpperCase();

      // Allow "PANNOTAVBL" as valid
      if (panUpper === "PANNOTAVBL") {
        return true;
      }

      // Regex check for valid PAN format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panUpper)) {
        toast.error("Invalid PAN No. Format should be: AAAAA9999A or PANNOTAVBL");
        return false;
      }
    }
  }

  return true; // Validation passed
};
    // for validate GST no field
export const validateGstNo = (formData) => {
    const { gst_no, arn_no, pan_no, gst_state_code, whether_gst_registered_dlr } = formData;

    // Check if the dealer is registered for GST
    if (whether_gst_registered_dlr === "Y") {
        // GST Number cannot be blank if the vendor is GST registered and ARN is missing
        if (!arn_no) {
            if (!gst_no) {
                toast.error("GST NUMBER cannot be left blank. If the vendor is not a GST Registered Dealer, then uncheck GST Registered No.");
                return false;
            } else {
                // Check if the state code in GST Number matches the state code in address
                if (gst_no.substring(0, 2) !== gst_state_code) {
                    toast.error("GST NUMBER does not seem to be correct. The State code in address is not matching with the State code in GST Number. Please verify address also.");
                    return false;
                }

                // Check if the PAN number in GST Number matches the provided PAN number
                if (gst_no.substring(2, 12) !== pan_no) {
                    toast.error("GST NUMBER does not seem to be correct. The PAN NUMBER entered is not matching with the PAN number in GST Number. Please verify PAN also.");
                    return false;
                }
            }
        }
        // ARN and GST No should not exist together
        if (gst_no && arn_no) {
            toast.error("BOTH ARN NO AND GST NO SHOULD NOT EXIST TOGETHER");
            return false;
        }
    }
    return true;
};

export const createSearchPayloadForSupMstrSpecificSearch = (masterData) =>{
   let payload = {};


  let masterKeys = {
    v_code: "v_code",
    v_name: "v_name",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);


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
} 

// export const validateCity = async (e, setData, formData = {}, formStatus) => {
//     if (!formStatus) return;

//     try {
//         const { name, value } = e.target;

//         if (!value.trim()) {
//             toast.error("City Name cannot be null");
//             e.target.focus();
//             return false;
//         }

//         const getLocationDetail = await validate_field(
//             `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SUPPLIER_FORM_DATA}`,
//             name,
//             value
//         );

//         if (getLocationDetail?.errMsg) {
//             toast.error(getLocationDetail.errMsg);
//             setData(prev => ({
//                 ...prev,
//                 v_city_name: "",
//                 v_city: "",
//                 v_district: "",
//                 v_state: "",
//                 v_zone: "",
//                 v_country: "",
//                 v_region: "",
//                 gst_state_code: ""
//             }));
//             return false;
//         } else {
//             setData(prev => ({
//                 ...prev,
//                 v_city_name: value,
//                 ...getLocationDetail.locationData
//             }));
//         }

//         return true;

//     } catch (error) {
//         console.error("Error during city validation:", error);
//         toast.error("An error occurred while validating the city name");
//         return false;
//     }
// };


// for validate pan no field

// export const validatePanNo = (formData, formStatus) => {
    
//   const { pan_no, v_city, v_country } = formData; 
  
//   if (formStatus === 'Insert' || formStatus === 'Update') {
//     if (v_city && v_country=== 'INDIA') {
//       if (!pan_no || pan_no.trim() === '') {
//         toast.error("PAN No cannot be left blank or enter PANNOTAVBL.");
//         return false;
//       }

//       // Check length of the PAN number
//       if (pan_no.length !== 10) {
//         toast.error("Wrong PAN No...");
//         return false; 
//       }
//     }
//   }
//   return true; // Return true if validation passes
// };