import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const headers1 = [
    // { label: "Action", required: false, width:"3%" },
    { label: "Currency", required: true, width:"25%"},
    { label: "Short Desc.", required: true,width:"15%" },
    { label: "Code", required: true, width:"10%" },
    { label: "Fraction",width:"10%",required: true },
    { label: "Exchange Rate", required: true,width:"10%" },
    { label: "Customer Rate",width:"10%" },
    { label: "Effective Date", required: true,width:"10%" },
    { label: "End Date", width:"10%"},
    { label: "Default",  width:"5%" },
   
  ];

  export const headers2 =[
    // { label: "Action", required: false, width:"3%" },
    { label: "Currency",  width:"15%"  },
    { label: "Effective Date",width:"20%"  },
    { label: "Exchange Rate", width:"15%" },
    { label: "Fraction",width:"20%"  },
    { label: "End Date",width:"20%"  },
  
  ]


export const currencyMasterInitialData={
    row_status:"",
    curr_desc:"",
    curr_sdesc:"", 
    curr_code:"", 
    curr_frac:"", 
    ex_rate:"",
    curr_customs:"",   
    eff_date:"",
    end_date:"",
    def_flag:"N",
    old_ex_rate:""
}

export const currencyMasterDisableData={
  curr_code:"",  
  eff_date:"", 
  rate:"",
  curr_frac:"",
  end_date:"",
}


  export const checkDuplicateCurrCode = async (curr_code, old_curr_code) => {
    try {
      let url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CURR_MSTR_FORM_DATA}?curr_code=${encodeURIComponent(curr_code)}`;
      
      if (old_curr_code) {
        url += `&old_curr_code=${encodeURIComponent(old_curr_code)}`;
      }

      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error("Currency Code cannot be blank");
        } else if (response.status === 409) {
          toast.error("Currency Code already exists");
        } else {
          toast.error("Error checking currency code");
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking duplicate currency code:", error);
      toast.error("Internal Server Error");
      return false;
    }
    };


    export const handleValidateField = async (e,formStatus,formData,rowIndex,historyFormData) => {
     if (!["Insert", "Update"].includes(formStatus)) return true;

    const { name, value } = e.target;
    const fieldId = `${name}-${rowIndex}`;

           //  Skip validation if row unchanged

      const isRowUnchanged = () => {
      const oldEff = formData.param_eff_date ? new Date(formData.param_eff_date).getTime() : null;
      const newEff = formData.eff_date ? new Date(formData.eff_date).getTime() : null;

      const oldEnd = formData.param_end_date ? new Date(formData.param_end_date).getTime() : null;
      const newEnd = formData.end_date ? new Date(formData.end_date).getTime() : null;

      return (
        formData.curr_code === formData.old_curr_code &&
        Number(formData.ex_rate) === Number(formData.old_ex_rate) &&
        oldEff === newEff &&
        oldEnd === newEnd &&
        formData.curr_desc === (formData.old_curr_desc || formData.curr_desc) &&
        formData.curr_sdesc === (formData.old_curr_sdesc || formData.curr_sdesc)
      );
    };

    if (formStatus === "Update" && isRowUnchanged()) return true;

       // ---------- (1) CURRENCY DESCRIPTION REQUIRED ----------
    if (name === "curr_desc" && (!value || !value.trim())) {
      toast.error("Currency Description cannot be blank");
      document.getElementById(fieldId)?.focus();
      return false;
    }
         // ---------- (2) SHORT DESCRIPTION REQUIRED ----------
      if (name === "curr_sdesc" && (!value || !value.trim())) {
        toast.error("Currency Short Description cannot be blank");
         document.getElementById(fieldId)?.focus();
        return false;
      }

        // ---------- (3) CURRENCY CODE REQUIRED + DUPLICATE CHECK ----------
    if (name === "curr_code") {
      if (!value || !value.trim()) {
        toast.error("Currency Code cannot be blank");
        document.getElementById(fieldId)?.focus();
        return false;
      }

      const old_curr_code = formData.old_curr_code || null;
      if (formData.isStatus === "new" || value !== old_curr_code) {
        const isValid = await checkDuplicateCurrCode(value, old_curr_code);
        if (!isValid) {
          // toast.error("Currency Code already exists");
         document.getElementById(fieldId)?.focus();
          return false;
        }
      }
    }

          if (name === "curr_frac" && (!value || !value.trim())) {
        toast.error("Currency Fraction cannot be blank");
         document.getElementById(fieldId)?.focus();
        return false;
      }
    

               // ---------- (4) EXCHANGE RATE VALIDATION ----------
          if (name === "ex_rate") {
            const exRate = Number(value);

            if (formStatus === "Update") {
              const oldRate = Number(formData.old_ex_rate || 0);

              //  Only apply this if record is existing (not a newly added one)
              const isExistingRecord = formData.isStatus !== "new";

              if (isExistingRecord && !formData.end_date && oldRate !== exRate) {
                toast.error("First close this Sale currency detail by entering the end date");
                  document.getElementById(`end_date-${rowIndex}`)?.focus();
                return false;
              }
            } else {
              if (value === "" || value === null) {
                toast.error("Exchange rate cannot be left blank");
             document.getElementById(fieldId)?.focus();
                return false;
              } else if (exRate <= 0) {
                toast.error("Exchange rate cannot be less than or equal to zero");
                 document.getElementById(fieldId)?.focus();
                return false;
              }
            }
          }

                 // ---------- (5) EFF DATE VALIDATION ----------

              if (name === "eff_date") {
              const effDate = value ? new Date(value) : null;
              const today = new Date();

              if (!effDate) {
                toast.error("Effective Date cannot be left blank");
                document.getElementById(fieldId)?.focus();
                return false;
              }

              if (effDate > today) {
                toast.error("Effective date cannot be greater than today's date");
                document.getElementById(fieldId)?.focus();
                return false;
              }

                  //  Update-specific checks
              if (formStatus === "Update") {
                const oldEff = formData.param_eff_date ? new Date(formData.param_eff_date) : null;
                const oldEnd = formData.param_end_date ? new Date(formData.param_end_date) : null;
                const oldRate = Number(formData.old_ex_rate || 0);
                const newRate = Number(formData.ex_rate || 0);

                   // New eff < old eff
                if (oldEff && effDate < oldEff) {
                  toast.error("Effective date cannot be less than previous effective date");
                  document.getElementById(fieldId)?.focus();
                  return false;
                }

                    //  Eff between oldEff and oldEnd
                if (oldEff && oldEnd && effDate > oldEff && effDate < oldEnd) {
                  toast.error("New Sales Currency details cannot be defined between an existing detail. Enter eff. date after end date of existing detail");
                  document.getElementById(fieldId)?.focus();
                  return false;
                }

                     // oldEnd null + same rate
                if (oldEff && !oldEnd && effDate > oldEff && oldRate === newRate) {
                  toast.error("First enter the end date for this record and then add new Currency detail to make exact History for this Sales Currency Master");
                  document.getElementById(fieldId)?.focus();
                  return false;
                }
              }
            }

                  // ---------- (6) END DATE VALIDATION ----------
              if (name === "end_date" && value) {
                const endDate = new Date(value);
                const effDate = formData.eff_date ? new Date(formData.eff_date) : null;

                if (effDate && endDate < effDate) {
                  toast.error("End Date cannot be less than Effective Date .. please re-enter");
                  document.getElementById(fieldId)?.focus();
                  return false;
                }
              }
    }

  

export const validateCurrencyBusinessRules = (row, formStatus) => {
  const {
    eff_date,
    end_date,
    ex_rate,
    old_ex_rate,
    param_eff_date,
    param_end_date,
  } = row;

  const effDate = eff_date ? new Date(eff_date) : null;
  const endDate = end_date ? new Date(end_date) : null;
  const paramEff = param_eff_date ? new Date(param_eff_date) : null;
  const paramEnd = param_end_date ? new Date(param_end_date) : null;
  const today = new Date();

  /* ===================== 1 ===================== */
  // IF END_DATE IS NULL AND OLD_EX_RATE <> EX_RATE
  if (
    formStatus === "Update" &&
    !endDate &&
    Number(old_ex_rate) !== Number(ex_rate)
  ) {
    toast.error(
      "First close this Sale curreny detail by entring the end date"
    );
    return false;
  }

  /* ===================== 2 ===================== */
  // EFF_DATE NOT NULL AND > SYSDATE
  if (!effDate) {
    toast.error("Effective Date can not be left blank");
    return false;
  }

  if (effDate > today) {
    toast.error("Effective date can not be greater then today date");
    return false;
  }

  /* ===================== 3 ===================== */
  if (formStatus === "Update" && paramEff) {
    // EFF_DATE < PARAMETER.EFF_DATE
    if (effDate < paramEff) {
      toast.error(
        "Effective date cannot be less then previous effective date"
      );
      return false;
    }

    // EFF_DATE between PARAMETER.EFF_DATE and PARAMETER.END_DATE
    if (paramEnd && effDate > paramEff && effDate < paramEnd) {
      toast.error(
        "New Sales Currency details can not be defined between an existing detail. Enter eff. date after end date of existing detail"
      );
      return false;
    }

    // PARAMETER.END_DATE IS NULL AND OLD_EX_RATE = EX_RATE
    if (
      !paramEnd &&
      effDate > paramEff &&
      Number(old_ex_rate) === Number(ex_rate)
    ) {
      toast.error(
        "First enter the end date for this record and then add new Currency detail to make exact History for this Sales Currency Master"
      );
      return false;
    }
  }

  /* ===================== 4 ===================== */
  // END_DATE < EFF_DATE
  if (endDate && effDate && endDate < effDate) {
    toast.error(
      "End Date cannot be Less than Effective Date .. please re-enter"
    );
    return false;
  }

  return true; // ALL GOOD
};



/**
 * @param {Object} currentRow  - row being submitted
 * @param {Array} dbRows       - existing MDEMCURR rows (from query)
 */
export const validateCurrencyPeriodOverlap = (
  currentRow,
  dbRows
) => {
  const {
    curr_code,
    eff_date,
    end_date,
    param_eff_date,
    param_end_date,
  } = currentRow;

  const effDate = new Date(eff_date);
  const endDate = end_date ? new Date(end_date) : null;

  const sameCurrencyRows = dbRows.filter(r =>
    r.curr_code === curr_code
  );

  //  EXCLUDE SAME RECORD (VERY IMPORTANT)
  const filteredRows = sameCurrencyRows.filter(r => {
    const rEff = new Date(r.eff_date).getTime();
    const rEnd = r.end_date ? new Date(r.end_date).getTime() : null;

    const currEff = new Date(param_eff_date || eff_date).getTime();
    const currEnd = param_end_date
      ? new Date(param_end_date).getTime()
      : null;

    return !(rEff === currEff && rEnd === currEnd);
  });

  /* ===================== BLOCK 1 ===================== */
  const exactMatch = filteredRows.some(r =>
    new Date(r.eff_date).getTime() === effDate.getTime() &&
    (
      (!r.end_date && !endDate) ||
      (r.end_date && endDate &&
        new Date(r.end_date).getTime() === endDate.getTime())
    )
  );

  if (exactMatch) {
    toast.error(
      "Sales currency details exist between this period.\n" +
      "Enter new rates against another period"
    );
    return false;
  }

  /* ===================== BLOCK 2 ===================== */
  const isOverlapping = filteredRows.some(r => {
    const rEff = new Date(r.eff_date);
    const rEnd = r.end_date ? new Date(r.end_date) : null;

    const newEnd = endDate ;
    const oldEnd = rEnd ;

    return rEff <= newEnd && effDate <= oldEnd;
  });

  if (isOverlapping) {
    toast.error(
      "Sales currency details exist between this period.\n" +
      "Enter a valid period"
    );
    return false;
  }

  return true;
};


 

 // export const validateRecordLevel = (formRow, historyFormData = []) => {
    //   const newEff = formRow.eff_date || null;   // already in YYYY-MM-DD
    //   const newEnd = formRow.end_date || null;   // null or YYYY-MM-DD

    //   if (!newEff) return { ok: true };

    //   // filter only matching currency
    //   const hist = (historyFormData || []).filter(
    //     (r) => (r.curr_code || r.CURR_CODE) === formRow.curr_code
    //   );

    //   //  SAME PERIOD CHECK
    //   const samePeriodExists = hist.some((rec) => {
    //     const recEff = rec.eff_date || rec.EFF_DATE;
    //     const recEnd = rec.end_date || rec.END_DATE;
    //     return recEff === newEff && recEnd === newEnd;
    //   });

    //   if (samePeriodExists) {
    //     return {
    //       ok: false,
    //       message:
    //         "Sales currency details exist between this period.\nEnter new rates against another period",
    //     };
    //   }

    //   // Helper: check if date d lies between start & end (handles nulls)
    //   const isBetween = (d, start, end) => {
    //     if (!d || !start) return false;
    //     if (!end) return d >= start;
    //     return d >= start && d <= end;
    //   };

    //   //  OVERLAP CHECK
    //   const overlapExists = hist.some((rec) => {
    //     const recEff = rec.eff_date || rec.EFF_DATE;
    //     const recEnd = rec.end_date || rec.END_DATE;

    //     // Case 1: existing eff between newEff and newEnd
    //     if (recEff && isBetween(recEff, newEff, newEnd)) return true;

    //     // Case 2: existing end between newEff and newEnd
    //     if (recEnd && isBetween(recEnd, newEff, newEnd)) return true;

    //     // Case 3: existing open-ended (recEnd null)
    //     if (!recEnd) {
    //       if (!newEnd) return true;          // both open-ended
    //       return recEff <= newEnd;           // overlap if existing start <= new end
    //     }

    //     // Case 4: new record open-ended (newEnd null)
    //     if (!newEnd) {
    //       if (recEff && (!recEnd || recEnd >= newEff)) return true;
    //     }

    //     return false;
    //   });

    //   if (overlapExists) {
    //     return {
    //       ok: false,
    //       message:
    //         "Sales currency details exist between this period.\nEnter a valid period",
    //     };
    //   }

    //   return { ok: true };
    //   };


   
// export const validateAllRows = async (formData, formStatus, historyFormData) => {
//   for (let rowIndex = 0; rowIndex < formData.length; rowIndex++) {
//     const row = formData[rowIndex];
//     if (row.isStatus === "deleted") continue; // Skip deleted

//     // NAYA: Skip unchanged rows in Update mode
//     if (formStatus === "Update" && !row.isStatus) {
//       continue; // Unchanged row - no validation needed
//     }

//     // Simulate onBlur for each field (but without event – use row values)
//     const fieldValidations = {
//       curr_desc: row.curr_desc?.trim(),
//       curr_sdesc: row.curr_sdesc?.trim(),
//       curr_code: row.curr_code?.trim(),
//       curr_frac: row.curr_frac,  // Add for required check
//       ex_rate: row.ex_rate,
//       eff_date: row.eff_date,
//       end_date: row.end_date,
//     };

//     // (1) Curr Desc required
//     if (!fieldValidations.curr_desc) {
//       toast.error(`Row ${rowIndex + 1}: Currency Description cannot be blank`);
//       document.getElementById(`curr_desc-${rowIndex}`)?.focus();
//       return false;
//     }

//     // (2) Short Desc required
//     if (!fieldValidations.curr_sdesc) {
//       toast.error(`Row ${rowIndex + 1}: Currency Short Description cannot be blank`);
//       document.getElementById(`curr_sdesc-${rowIndex}`)?.focus();
//       return false;
//     }

//     // NAYA: (Fraction required + >0? Assume >0 jaise ex_rate)
//     if (!fieldValidations.curr_frac || Number(fieldValidations.curr_frac) <= 0) {
//       toast.error(`Row ${rowIndex + 1}: Fraction cannot be blank or less than or equal to zero`);
//       document.getElementById(`curr_frac-${rowIndex}`)?.focus();
//       return false;
//     }

//     // (3) Curr Code required + duplicate (API check)
//     if (!fieldValidations.curr_code) {
//       toast.error(`Row ${rowIndex + 1}: Currency Code cannot be blank`);
//       document.getElementById(`curr_code-${rowIndex}`)?.focus();
//       return false;
//     }
//     const old_curr_code = row.old_curr_code || null;
//     if (row.isStatus === "new" || fieldValidations.curr_code !== old_curr_code) {
//       const isValidCode = await checkDuplicateCurrCode(fieldValidations.curr_code, old_curr_code);
//       if (!isValidCode) {
//         toast.error(`Row ${rowIndex + 1}: Currency Code already exists`);
//         document.getElementById(`curr_code-${rowIndex}`)?.focus();
//         return false;
//       }
//     }

//     // (4) Ex Rate validation
//     const exRate = Number(fieldValidations.ex_rate || 0);
//     if (formStatus === "Update") {
//       const oldRate = Number(row.old_ex_rate || 0);
//       const isExisting = row.isStatus !== "new";
//       if (isExisting && !row.end_date && oldRate !== exRate) {
//         toast.error(`Row ${rowIndex + 1}: First close this Sale currency detail by entering the end date`);
//         document.getElementById(`end_date-${rowIndex}`)?.focus();
//         return false;
//       }
//     } else {
//       if (!fieldValidations.ex_rate || exRate <= 0) {
//         toast.error(`Row ${rowIndex + 1}: Exchange rate cannot be less than or equal to zero (or blank)`);
//         document.getElementById(`ex_rate-${rowIndex}`)?.focus();
//         return false;
//       }
//     }

//     // (5) Eff Date validation
//     const effDate = fieldValidations.eff_date ? new Date(fieldValidations.eff_date) : null;
//     const today = new Date();
//     // today.setHours(0, 0, 0, 0); // Ignore time
//     if (!effDate || isNaN(effDate.getTime())) {
//       toast.error(`Row ${rowIndex + 1}: Effective Date cannot be left blank`);
//       document.getElementById(`eff_date-${rowIndex}`)?.focus();
//       return false;
//     }
//     if (effDate > today) {
//       toast.error(`Row ${rowIndex + 1}: Effective date cannot be greater than today's date`);
//       document.getElementById(`eff_date-${rowIndex}`)?.focus();
//       return false;
//     }

//     // Update-specific eff date checks
//     if (formStatus === "Update") {
//       const oldEff = row.param_eff_date ? new Date(row.param_eff_date) : null;
//       const oldEnd = row.param_end_date ? new Date(row.param_end_date) : null;
//       const newRate = exRate;

//       if (oldEff && effDate < oldEff) {
//         toast.error(`Row ${rowIndex + 1}: Effective date cannot be less than previous effective date`);
//         document.getElementById(`eff_date-${rowIndex}`)?.focus();
//         return false;
//       }

//       if (oldEff && oldEnd && effDate > oldEff && effDate < oldEnd) {
//         toast.error(`Row ${rowIndex + 1}: New Sales Currency details cannot be defined between an existing detail. Enter eff. date after end date of existing detail`);
//         document.getElementById(`eff_date-${rowIndex}`)?.focus();
//         return false;
//       }

//       if (oldEff && !oldEnd && effDate > oldEff && Number(row.old_ex_rate || 0) === newRate) {
//         toast.error(`Row ${rowIndex + 1}: First enter the end date for this record and then add new Currency detail to make exact History for this Sales Currency Master`);
//         document.getElementById(`eff_date-${rowIndex}`)?.focus();
//         return false;
//       }
//     }

//     // (6) End Date validation (if entered)
//     if (fieldValidations.end_date) {
//       const endDate = new Date(fieldValidations.end_date);
//       if (effDate && endDate < effDate) {
//         toast.error(`Row ${rowIndex + 1}: End Date cannot be less than Effective Date .. please re-enter`);
//         document.getElementById(`end_date-${rowIndex}`)?.focus();
//         return false;
//       }
//     }

//     // Record-level: Overlap/Same Period (per row's history)
//     const rowHistory = historyFormData.filter(h => h.curr_code === row.curr_code);
//     const recCheck = validateRecordLevel(row, rowHistory);
//     if (!recCheck.ok) {
//       toast.error(`Row ${rowIndex + 1}: ${recCheck.message}`);
//       // Focus eff_date as it's period-related
//       document.getElementById(`eff_date-${rowIndex}`)?.focus();
//       return false;
//     }
//   }


//   return true;
// };