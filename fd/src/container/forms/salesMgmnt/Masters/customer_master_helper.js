import toast from "react-hot-toast";
import { validate_field } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";

export const customerMstrInitDataTemplate = {   // Data Block name is MOSMCUST & This data Main Tab , Additional tab, Tax Info Tab.
   c_code: "",
    c_name: "",
    c_name1: "",
    cust_type: "",
    c_industry_type: "",
    cshort_name: "",
    cust_category: "",
    ship_bill_flag: "N",
    ship_bill_code: "",
    ship_bill_name: "",
    local_flag: "L", // value will be local, inter_state, foreign
    active: "",
    st38_flag: "",
    c_add1: "",
    c_add2: "",
    c_add3: "",
    c_city_name: "",
    c_city: "",
    c_district: "",
    c_state: "",
    c_zone: "",
    c_country: "",
    c_region: "",
    c_zip_code: "",
    email: "",
    telephone1: "",
    telephone2: "",
    fax: "",
    update_by: "",
    create_by: "",
    create_id: "",
    update_id: "",
    c_v_code: "",
    c_v_name: "",
    con_per1: "",
    con_per1_email: "",
    con_per1_telephone: "",
    con_per1_desig: "",
    con_per2: "",
    con_per2_email: "",
    con_per2_telephone: "",
    commercial_con_per: "",
    commercial_con_per_telephone: "",
    commercial_con_per_mail: "",
    commercial_con_per_desig: "",
    sales_per_cd: "",
    emp_name: "",
    curr_cd: "",
    mode_cd: "",
    port_disc: "",
    octroi: "",
    freight: "",
    insurance: "",
    tcs_cat: "",
    term_code: "",
    del_terms: "",
    ship_mark: "",
    interst: "",
    cre_limit: "",
    pymnt_days: "",
    bankers: "",
    cus_v_code: "",
    stockist_code: "",
    exise_range: "",
    exise_division: "",
    exise_collectorate: "",
    ecc_code: "",
    cst_no: "",
    cst_dt: "",
    lst_no: "",
    lst_dt: "",
    tin_no: "",
    pan_no: "",
    lst_cst_flag: "",
    st_form: "",
    cst_lst_prc: "",
    surch_prc: "",
    tax_code: "",
    excise_flag: "",
    telex: "",
    gst_state_code: "",
    gst_no: "",
    gst_no_sez: "",
    whether_gst_registered_dlr: "",
    whether_rgstrd_under_comp: "",
    utn_flag: "",
    print_qr_code: "N",
    c_legal_name: "",
    trans_dist_km: "",
    tcs_applicable: "N",
    ccode_auto: "N",
    temp_local_flag:'',
};

export const discountHeader= [
  { label: "Discount Description",  width: "80%" },
  { label: "Active", width: "20%" },
]

export const DiscountTabInitData ={    // Data Block name is MOSMCUSTDISC
disc_desc:"",
active:"N",
disc_id:"",
c_code:"",
}

export const controlInitData ={
  di_ship_bill_code:"",
  di_formstatus:"",
  userid:"",
}

export const CustomerHelpListHeader = [
 {label: "C Code", key: "c_code"},
    {label: " C Name", key: "c_name"}, 
]
export const CustomerNameHelpListHeader = [
 {label: "C Code", key: "c_code"},
    {label: " C Name", key: "c_name"}, 
]

export const cityHelpListHeader= [
    { label: "City", key: "city" },
    { label: "Country", key: "country" },
    { label: "City Code", key: "ctycode" },
    { label: "District", key: "district" },
    { label: "Region", key: "region" },
    { label: "State", key: "state" },
    { label: "Zone", key: "zone" },
]

export const shipBillCodeHelpListHeader = [
    {label: "ship Code", key: "c_code"},
    {label: "ship Name", key: "c_name"},  
 ]

export const supplierCodeHelpListHeader = [
    {label: "supplier Code", key: "v_code"},
    {label: "supplier Desc.",key: "v_name"},  
 ]

export const salePersonHelpListHeader = [
    {label: "sale code ", key: "emp_cd"},
    {label: "ssle name.",key: "emp_name"},  
 ]

 export const SupplierCodeAllotedHelpListHeader = [
   {label: "supplierAlloted code ", key: "v_code"},  
 ]

 export const StockistCodeHelpListHeader = [
    {label: "stock code ", key: "c_code"},  
 ]

      // for searching 
      export const createSearchPayloadForCusMstrSpecificSearch = (masterData) =>{
        let payload = {};

    
      let masterKeys = {
        c_code: "c_code",
        c_name: "c_name",
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
    };

    function setShipBillFlag(ship_bill_flag) {
        // if ship_bill_flag value will be N then disable the field other wise open the field
        let di_ship_bill_code = "";
        if (ship_bill_flag === "S") {
            di_ship_bill_code = "Ship To Code of";
        } else if (ship_bill_flag === "B") {
            di_ship_bill_code = "Bill To Code of";
        } else if (ship_bill_flag === "A") {
            di_ship_bill_code = "Ship/Bill To Code of";
        }
        return di_ship_bill_code;
    }

// main tab
const handleValidateField = (e,formStatus) => {
    if(!['Insert', 'Update'].includes(formStatus)){
        return
    }
    const { name, value } = e.target;
    if (name === "c_code") {
        if (!value) {
            toast.error("Customer Code cannot be blank");
            document.getElementById("c_code").focus();
        }
        return;
    }
    if (name === "c_name") {
        if (!value) {
            toast.error("Customer Name cannot be blank");
            document.getElementById("c_name").focus();
        }
        return;
    }
    // if (name === "cust_type") {
    //     if (!value) {
    //         toast.error("Customer Type cannot be blank");
    //         document.getElementById("cust_type").focus();
    //     }
    //     return;
    // }
    // if (name === "c_industry_type") {
    //     if (!value) {
    //         toast.error("Customer industry type cannot be blank because this field used in project tracker report...");
    //         document.getElementById("c_industry_type").focus();
    //     }
    //     return;
    // }
    if (name === "c_city_name") {
        if (!value) {
            toast.error("City Name Can Not be null");
            document.getElementById("c_city_name").focus();
        }
        return;
    }
    if (name === "c_add1") {
        if (!value) {
            toast.error("Address name can not be null");
            document.getElementById("c_add1").focus();
        }
        return;
    }
    if (name === "c_zip_code") {
        if (!value) {
            toast.error("Pin Code  can not be null");
            document.getElementById("c_zip_code").focus();
        }
        return;
    }
};

// const validateShipBillCd = (formData, di_ship_bill_code) => {
//     if (formData.ship_bill_flag != "N" && !formData.ship_bill_code) {
//         toast.error(`${di_ship_bill_code} cannot be blank`);
//         document.getElementById("ship_bill_code").focus();
//     }
// };

const validateShipBillCd = (formData, diShipBillCode) => {
    if ((formData.ship_bill_flag === "S" || formData.ship_bill_flag === "B" || formData.ship_bill_flag === "A") && !formData.ship_bill_code?.trim()) {
        toast.error(`${diShipBillCode} cannot be blank`);
        const targetElement = document.getElementsByName("ship_bill_code")[0];
        if (targetElement) {
            targetElement.focus();
        }
        return false;
    }
    return true;
};


const checkValidation = (formData) => {
    // commented these checks as i found the field not visible
    // const validateFeild = [
    //     "exise_range",
    //     "exise_division",
    //     "exise_collectorate",
    //     "ecc_code",
    //     "cst_no",
    //     "lst_no",
    //     "tin_no",
    //     "pan_no",
    //     "st_form",
    // ];
    const validateFeild = ["pan_no"];

    const allValid = validateFeild.every((field) => {
        if (!formData[field] || formData[field].trim() === "") {
            toast.error(
                `${field.replace(/_/g, " ").toUpperCase()} cannot be null`
            );
            return false; // Stop checking fields if validation fails
        }
        return true;
    });

    return allValid;
};

const gstNoValidation = (formData) => {
    const { gst_no, gst_state_code, pan_no, whether_gst_registered_dlr} = formData;
    if(whether_gst_registered_dlr === 'N'){
        return true
    }
    // Check if GST Number is provided
    if (!gst_no) {
        toast.error(
            `GST NUMBER cannot be left blank. If the Customer is not a GST Registered Dealer, enter NA`
        );
        return false;
    }

    // if(parseInt(gst_no.substring(0,2))!== parseInt(gst_state_code)){
    //     toast.error(
    //         `GST NUMBER does not seem to be correct. The State code in addess is not matching with 
    //         State code in GST Number. Please verify address also`
    //     );
    //     return false;
    // }

    // Check if GST number's last part matches PAN number
    if (gst_no.slice(2,12) !== pan_no) {
        toast.error(
            `GST NUMBER does not seem to be correct. The PAN NUMBER entered is not matching with PAN number in GST Number.
            Please verify PAN also`
        );
        return false;
    }

    return true;
};

const validateCustMstrFormOnSave = (formData, formStatus, di_ship_bill_code) => {
    let formValid = true;
     if(!formData.c_name){
        toast.error(`Customer Name cannot be blank`)
        formValid = false;
     }
     if(!formData.cust_type){
        toast.error(`Customer Type cannot be blank`)
        formValid = false;
     }

        // Validate industry type
    // if (!formData?.c_industry_type) {
    //     toast.error(
    //         `Customer industry type cannot be blank because this field is used in the project tracker report...`
    //     );
    //     formValid = false;
    // }

    // GST validation
    if (!gstNoValidation(formData)) {
        formValid = false;
    }

    // Interest validation
    if (formData?.interst < 0) {
        toast.error(`Panel Interest cannot be negative`);
        formValid = false;
    } else if (formData?.interst > 100) {
        toast.error(`Panel Interest cannot be greater than 100`);
        formValid = false;
    }

    // Credit limit validation
    if (formData?.cre_limit && formData.cre_limit < 0) {
        toast.error(`Credit Limit cannot be negative`);
        formValid = false;
    }

    // Payment days validation
    if (formData?.pymnt_days && formData.pymnt_days < 0) {
        toast.error(`Payment Days cannot be negative`);
        formValid = false;
    }

    if (formData.ship_bill_flag != "N" && !formData.ship_bill_code) {
        toast.error(`${di_ship_bill_code} cannot be blank`);
        formValid = false
        
    }

    // Sales Tax Flag validation // ask to sir is it need apply in eddal
    // if (!checkSalesTaxFlagHdr(formData)) {
    //     formValid = false;
    // }

    return formValid;
};

const validateCcode = async (cCode, isCCodeAuto) => {
    if (isCCodeAuto === "Y") {
        return true;
    }

    if (!cCode) {
        toast.error("Customer Code Cannot be null");
        return false;
    }
    try {
        const isCCodeFound = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_FORM_DATA}`, "c_code", cCode);


        if (isCCodeFound.exists) {
            toast.error("Customer Code already exists. Please Change the Customer code");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error validating Customer Code:", error);
        toast.error("Error validating Customer Code");
        return false;
    }
};

const validateCity = async (e, setData, formData = {}, formStatus) => {
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
         const getLocationDetail = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_FORM_DATA}`, name, value);

        // Check if there was an error message from the API
        if (getLocationDetail?.errMsg) {
            toast.error(getLocationDetail.errMsg);
            setData((prev) => {
                // Clear or update the form data if validation fails
                return {
                    ...prev,
                    c_city_name: "",
                    c_city: "",
                    c_district: "",
                    c_state: "",
                    c_zone: "",
                    c_country: "",
                    c_region: " ",
                    gst_state_code:'',
                    temp_local_flag: ""   // create this key only for frontend to get value of local_flag form moitstate table
                }; // Or handle the state as needed
            });
            return false;
        } else {
            // Update form data if validation succeeds
            setData(prev => {
                return {
                    ...formData,
                    c_city_name: value,
                    ...getLocationDetail.locationData,
                    temp_local_flag: getLocationDetail.locationData.local_flag
                    // You can add other fields returned from API if needed
                };
            });
        }

        return true;

    } catch (error) {
        console.error("Error during city validation:", error);
        toast.error("An error occurred while validating the city name");
        return false;
    }
};

const validateSalesCd = async (e, setData, formData = {}, formStatus) => {
    if(!formStatus){
        return
    }
    try {
        const {name, value} = e.target;
        // API call to validate the field
        const getSalesEmpDetail = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_FORM_DATA}`,name,value);
        if (getSalesEmpDetail?.errMsg) {
            toast.error(getSalesEmpDetail.errMsg);
            setData((prev) => {
                // Clear or update the form data if validation fails
                return {
                    ...prev,
                    emp_name: '',
                    sales_per_cd:''

                }; // Or handle the state as needed
            });
            return false;
        } else {
            // Update form data if validation succeeds
            setData(prev => {
                return {
                    ...formData,
                    emp_name: getSalesEmpDetail?.emp_name,
                    // You can add other fields returned from API if needed
                };
            });
        }

        return true;

    } catch (error) {
        console.error("Error during sale_per_cd validation:", error);
        toast.error("An error occurred while validating the sale person name");
        return false;
    }
};

const validateCityField = (formData) => {
    let updatedFormData = { ...formData };
    if (formData.c_country == "INDIA") {
        updatedFormData.local_flag = "F";
        updatedFormData.lst_cst_flag = "C";
        updatedFormData.tax_code = "";
        updatedFormData.st_form = "";
        updatedFormData.cst_lst_prc = "";
        updatedFormData.surch_prc = "";
    }
    if (formData.c_country !== "INDIA") {
        updatedFormData.local_flag = "F";
        updatedFormData.lst_cst_flag = "C";
        updatedFormData.tax_code = "";
        updatedFormData.st_form = "";
        updatedFormData.cst_lst_prc = "";
        updatedFormData.surch_prc = "";
    }
    return updatedFormData
};

const checkSalesTaxFlagHdr = (formData)=>{
    if(formData?.local_flag === 'L' && formData.lst_cst_flag === 'C'){
        toast.error(`This Ship to party is Local, you cannot apply Central Sales Tax`)
        return false
    }

    if(formData?.local_flag === 'I' && formData.lst_cst_flag === 'L'){
        toast.error(`This Ship to party is Inter State , you cannot apply Local Sales Tax`)
        return false
    }

    return true

}

const validateDiscountForm = (formData) => {
    let isFormValid = { isValid: true };

    if (formData.length) {
        for (let index = 0; index < formData.length; index++) {
            if (!formData[index].disc_id) {
                isFormValid = { isValid: false, index };
                break; // Stop checking further rows
            }
        }
    }

    return isFormValid;
};


export {
    setShipBillFlag,
    handleValidateField,
    validateShipBillCd,
    checkValidation,
    validateCustMstrFormOnSave,
    validateCcode,
    gstNoValidation,
    validateCity,
    validateSalesCd,
    validateDiscountForm
};
  
 

   

 
