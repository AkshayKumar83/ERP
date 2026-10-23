import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
import { setLoader } from "../../../../features/loader/loaderSlice";

export const loanDetalHeader = [
  { width: "5%", label: "EMI Sno", required: false },
  { width: "10%", label: "Installment Date", required: false },
  { width: "15%", label: "Principal Amount(Rs.)", required: false },
  { width: "10%", label: "Service Charge(Rs.)", required: false },
  { width: "10%", label: "Interest(Rs.)", required: false },
  { width: "10%", label: "IGST(Rs.)", required: false },
  { width: "10%", label: "CGST(Rs.)", required: false },
  { width: "10%", label: "SGST(Rs.)", required: false },
  { width: "15%", label: "Total Amount(Rs.)", required: false },
];

export const loanDetailFormDataInitTempate = {
  emi_sno: "", // frontend only field
  emi_date: "",
  principal_amt: "",
  service_charge_ded: "",
  interest: "",
  igst: "",
  cgst: "",
  sgst: "",
  total_amt: "",
};

export const loanHdrFormInitData = {
  trans_type: "BN",
  efa_compliance_yesno: "N",
  emi_date_option: "M",
  emi_compute_perc_on: 100,
};

export const memberNoHelpListHeader = [
  { label: "Dealer name", key: "dlr_name" },
  { label: "Member No.", key: "member_no" },
  { label: "Division", key: "division" },
  { label: "Location", key: "location" },
];

export const validate = (efaDetailData) => {
  const requiredField = ["acc_no", "loan_purpose_desc"];
};

//  createSearchPayloadForBVSpecificSearch
export const createSearchPayloadForLnMstrSearch = (masterData) => {
  let payload = {};

  ////console.log("masterdata", masterData);

  let masterKeys = {
    member_id: "member_id",
    efa_ctrl_id: "efa_ctrl_id",
    efa_application_date: "efa_application_date",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  ////console.log("hasMasterKeys", hasMasterKeys);

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

// ON CLICK IN PRINT BUTTON OF LOAN REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getRepaySchPrint(formData, formStatus, dispatch, username){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {efa_id} = formData;
  
  if (!efa_id) {
    toast.error('Required Parameter is Misssing for repayment schedule!');
    return;
  }
  try {
      dispatch(setLoader({ key: "form", value: true })); 
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.PRINT_REPAYMENT_SCHEDULE}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          pEfa_id: efa_id,
          pUser_name: username,
          
      }), // Send the parameter in the request body
    });

    if (!response.ok) {
      throw new Error('repayment pdf generation failed!');
    }

    // Convert the response to a blob (PDF file)
    const blob = await response.blob();

    // Create a link to trigger the file download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `REPAYMENT_SCHEDULE_${efa_id}.pdf`;  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    ////console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
    dispatch(setLoader({ key: "form", value: false })); 
  }

}
