import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";


export const headers = [
   
    { label: "GST Type", required: true, width: "7%" },
    { label: "GST %", required: false, width: "4%", isHelpExist: true },
    { label: "Payable", required: true, width: "5%", isHelpExist: true },
    { label: "Reverse Payable", required: true, width: "7%", isHelpExist: true },
    { label: "Inward", required: true, width: "5%", isHelpExist: true },
    { label: "Electronic Cash Ledger Account", required: true, width: "6%" , isHelpExist: true},
    { label: "Available", required: true, width: "6%", isHelpExist: true },
    { label: "GST Interest Paid", required: true, width: "6%", isHelpExist: true },
    { label: "GST Penalty Paid", required: true, width: "6%", isHelpExist: true },
     { label: "GST Account Provisional", required: true, width: "7%", isHelpExist: true },
    { label: "GST Expense Account", required: true, width: "7%", isHelpExist: true },
    { label: "Effective Date", required: true, width: "6%" },
];  

export const gstAccMstrInitialData = {
    gst_type: "",
    gst_pers: "",
    acc_no_payable: "",
    acc_no_payable_desc: "",
    acc_no_rev_payable: "",
    acc_no_rev_payable_desc: "",
    acc_no_inward: "",
    acc_no_inward_desc: "",
    gst_elec_cash_legr_reg_acc: "",
    gst_elec_cash_legr_reg_ac_desc: "",
    acc_no_available: "",
    acc_no_available_desc: "",
    acc_no_int_paid: "",
    acc_no_int_paid_desc: "",
    acc_no_penalty_paid: "",
    acc_no_penalty_paid_desc: "",
    gst_expense_acc_no: "",
    gst_expense_acc_desc: "",
    form_no: "",
    eff_dt: "",
    record_id: "",
};   

export const accHelpListHeader =[
	{ label: "Account No", key: "acc_no" },
    { label: "Description", key: "acc_desc" },
]
export const gstPersHelpListHeader =[
	{ label: "Percentage", key: "gstp" },
]

// for help list
export const helpFieldMap = {
	acc_no_payable: ["acc_no_payable", "acc_no_payable_desc"],
	acc_no_rev_payable: ["acc_no_rev_payable", "acc_no_rev_payable_desc"],
	acc_no_inward: ["acc_no_inward", "acc_no_inward_desc"],
	gst_elec_cash_legr_reg_acc: ["gst_elec_cash_legr_reg_acc", "gst_elec_cash_legr_reg_ac_desc"],
	acc_no_available: ["acc_no_available", "acc_no_available_desc"],
	acc_no_int_paid: ["acc_no_int_paid", "acc_no_int_paid_desc"],
	acc_no_penalty_paid: ["acc_no_penalty_paid", "acc_no_penalty_paid_desc"],
	gst_expense_acc_no: ["gst_expense_acc_no", "gst_expense_acc_desc"],
    acc_no_provisional: ["acc_no_provisional", "gst_prov_acc_desc"]
};   


// Feild Validation ------------------->
// GST TYPE
export const validateFieldGstType = (accGstData) => {
    const { gst_type } = accGstData;
    if (!gst_type) {
        toast.error("GST Type cannot be left blank.");
    }
};

export const getFieldItemDesc = async (
    e,
    formStatus,
    index,
    handleChange = () => {}
) => {
    if (!["Insert", "Update"].includes(formStatus)) {
        return;
    }

    const errorMessages = {
        acc_no_payable: {
            errMsg: "Payable Account Code cannot be left blank.",
            descFieldName: "acc_no_payable_desc",
        },
        acc_no_rev_payable: {
            errMsg: "Reverse Payable Account Code cannot be left blank.",
            descFieldName: "acc_no_rev_payable_desc",
        },
        acc_no_inward: {
            errMsg: "Inward Account Code cannot be left blank.",
            descFieldName: "acc_no_inward_desc",
        },
        gst_elec_cash_legr_reg_acc: {
            errMsg: "Electronic Cash Ledger Account Code cannot be left blank.",
            descFieldName: "gst_elec_cash_legr_reg_ac_desc",
        },
        acc_no_available: {
            errMsg: "Available Account Code cannot be left blank.",
            descFieldName: "acc_no_available_desc",
        },
        acc_no_int_paid: {
            errMsg: "GST Interest Paid Account Code cannot be left blank.",
            descFieldName: "acc_no_int_paid_desc",
        },
        acc_no_penalty_paid: {
            errMsg: "GST Penalty Paid Account Code cannot be left blank.",
            descFieldName: "acc_no_penalty_paid_desc",
        },
        gst_expense_acc_no: {
            errMsg: "GST Expense Account Code cannot be left blank.",
            descFieldName: "gst_expense_acc_desc",
        }, 

         acc_no_provisional: {
            errMsg: "GST Provisional Account code cannot be left blank.",
            descFieldName: "gst_prov_acc_desc",
        },
    };

    const { name, value } = e.target;

    // if (!value) {
    //     toast.error(errorMessages[name]?.errMsg || "Required Field!");
    //     return;
    // }

    try {
        const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_FOR_GST_DATA}?${name}=${encodeURIComponent(value)}`
        ,{credentials:'include',});

        if (!response.ok) {
            const result = await response.json();
            toast.error(result.errMsg || "Failed to fetch field description.");
            handleChange(name, "", index);
            handleChange(errorMessages[name]?.descFieldName, "", index);
            return false;
        }

        const result = await response.json();
        if (result && Object.keys(result).length > 0) {
            handleChange(
                errorMessages[name]?.descFieldName || name,
                Object.values(result)[0],
                index
            );
            //console.log("Validation Response:", result);
        } else {
            toast.error("Invalid response from server");
        }

        return true;
    } catch (error) {
        console.error("Error fetching field description:", error);
        toast.error(
            "An unexpected error occurred while fetching field description."
        );
        return false;
    }
};

export const validateEffDate = (e) => {
    const { name, value } = e.target;
    if (!value) {
        toast.error("Effective Date cannot be left blank.");
    }
};

export const validateGstPerc=(name, value)=>{
	let result = {isValid : false, value: ''}
	if(name === 'gst_pers'){
		if(value && value <0){
			toast.error('GST % cannot be negative.')
			return result.isValid  = false
		}
	}
}

// Duplication record check logic
export const dupValidation = (formData) => {
    const seen = new Set();

    for (const record of formData) {
        const { gst_type, gst_pers, eff_dt } = record;

        // Ensure gst_type and eff_dt are defined and not null
        if (gst_type == null || eff_dt == null) {
            continue; // Skip records with missing gst_type or eff_dt
        }

		const key = `${gst_type}-${(gst_pers && gst_pers.trim() !== "") ? gst_pers : "null"}-${eff_dt}`;

        if (seen.has(key)) {
            return true; // Duplicate found
        }

        seen.add(key);
    }
	//console.log(seen)
    return false; // No duplicates
};





