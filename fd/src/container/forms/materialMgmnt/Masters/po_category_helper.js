import toast from "react-hot-toast";

export const headers = [

    { label: "PO Category", width: "60%", required:true },
    { label: "Prefix",  width: "15%", required:true },
    { label: "Mod Vat",  width: "15%" },
  ];

export const poCategoryInitialData = [
    {
        po_cat_description:'',
        po_cat_prefix:'',
        user_code:'',
        mod_vat:'N',
    },

]


export const createSearchPayloadForPoCategorySpecificSearch = (masterData) =>{
   let payload = {};
  const row = masterData?.[0] || {};

  if (row.user_code) {
    payload.user_code = row.user_code;
  }

  // if (row.po_date) {
  //   payload.po_date = row.po_date; 
  // }

  return payload;
};


export const handleValidateField = (e, formStatus, rowIndex, isAddingRow) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }

  // Skip validation if adding a new row
  if (isAddingRow) {
    return;
  }

  const { name, value } = e.target;
  if (name === "po_cat_description") {
    if (!value) {
      toast.error("PO Category can't be blank");
      document.getElementById(`po_cat_description_${rowIndex}`)?.focus();
    }
    return;
  }
  if (name === "po_cat_prefix") {
    if (!value) {
      toast.error("Prefix can't be blank");
      document.getElementById(`po_cat_prefix_${rowIndex}`)?.focus();
    }
    return;
  }
};

// Check if all required fields are filled
export const checkRequiredFields = (data, requiredFields, isSingle = false) => {
    const isValidRow = (row) => {
        return requiredFields.every((field) => {
            return !!(row[field] && String(row[field]).trim() !== "");
        });
    };

    if (isSingle) {
        return isValidRow(data);
    }

    return data.every(isValidRow);
};


export const checkDuplicates = (data, fields) => {
    const duplicateInfo = {
        po_cat_description: [],
        po_cat_prefix: []
    };

    fields.forEach((field) => {
        const seen = new Set();

        data.forEach((item, index) => {
            const value = item[field]?.trim().toLowerCase();

            if (value) {
                if (seen.has(value)) {
                    duplicateInfo[field].push(index); // Store index of duplicate
                } else {
                    seen.add(value);
                }
            }
        });
    });

    return duplicateInfo;
};


export const validatePOCategory = (formData, isUpdate = false) => {
  for (const [index, record] of formData.entries()) {
    // For new records (no create_date), require all fields
    if (!record.create_date) {
      if (!record.po_cat_description || !record.po_cat_prefix) {
        return {
          isValid: false,
          error: "Description and Prefix are required for new records",
        };
      }
    } else if (isUpdate) {
      // For updates, ensure at least one field is provided
      if (
        !record.po_cat_description &&
        !record.po_cat_prefix &&
        !record.mod_vat &&
        !record.user_code
      ) {
        return {
          isValid: false,
          error: "At least one field must be provided for update",
        };
      }
    }

    //  Check for duplicate po_cat_prefix (case-insensitive)
    const duplicatePrefix = formData.some(
      (r, i) =>
        i !== index &&
        r.po_cat_prefix &&
        record.po_cat_prefix &&
        r.po_cat_prefix.trim().toLowerCase() === record.po_cat_prefix.trim().toLowerCase()
    );
    if (duplicatePrefix) {
      return {
        isValid: false,
        error: `Duplicate po_cat_prefix: ${record.po_cat_prefix}`,
      };
    }

    // Check for duplicate po_cat_description (case-insensitive)
    const duplicateDesc = formData.some(
      (r, i) =>
        i !== index &&
        r.po_cat_description &&
        record.po_cat_description &&
        r.po_cat_description.trim().toLowerCase() === record.po_cat_description.trim().toLowerCase()
    );
    if (duplicateDesc) {
      return {
        isValid: false,
        error: `Duplicate po_cat_description: ${record.po_cat_description}`,
      };
    }
  }

  return { isValid: true };
};



// export const validatePOCategory = (data, isSingle = false) => {
//     const requiredFields = ["po_cat_description", "po_cat_prefix"];

//     // Check for required fields
//     const requiredFieldsValid = checkRequiredFields(data, requiredFields, isSingle);
    
//     if (!requiredFieldsValid) {
//         return {
//             isValid: false,
//             error: "Please fill all required fields (PO Category Description and Prefix)."
//         };
//     }

//     if (!isSingle) {
//         const duplicates = checkDuplicates(data, ["po_cat_description", "po_cat_prefix"]);

//         let errorMessages = [];

//         // Check for duplicates in po_cat_description
//         if (duplicates.po_cat_description.length > 0) {
//             const descriptionRows = duplicates.po_cat_description.map(i => i + 1).join(', ');
//             errorMessages.push(`Duplicate PO Category Descriptions found at rows: ${descriptionRows}`);
//         }

//         // Check for duplicates in po_cat_prefix
//         if (duplicates.po_cat_prefix.length > 0) {
//             const prefixRows = duplicates.po_cat_prefix.map(i => i + 1).join(', ');
//             errorMessages.push(`Duplicate PO Category Prefixes found at rows: ${prefixRows}`);
//         }

//         if (errorMessages.length > 0) {
//             return {
//                 isValid: false,
//                 error: errorMessages.join(". ") // Combine error messages for both fields
//             };
//         }
//     }

//     return { isValid: true };
// };


  // export const validatePOCategory = (formData, isUpdate = false) => {
  //   for (const [index, record] of formData.entries()) {
  //     // For new records (no create_date), require all fields
  //     if (!record.create_date) {
  //       if (!record.po_cat_description || !record.po_cat_prefix) {
  //         return {
  //           isValid: false,
  //           error: "Description and Prefix are required for new records",
  //         };
  //       }
  //     } else if (isUpdate) {
  //       // For updates, ensure at least one field is provided
  //       if (!record.po_cat_description && !record.po_cat_prefix && !record.mod_vat && !record.user_code) {
  //         return {
  //           isValid: false,
  //           error: "At least one field must be provided for update",
  //         };
  //       }
  //     }

  //     // Check for duplicate po_cat_prefix, excluding the current record
  //     const duplicates = formData.filter(
  //       (r, i) =>
  //         i !== index &&
  //         r.po_cat_prefix &&
  //         r.po_cat_prefix === record.po_cat_prefix &&
  //         (!isUpdate || !r.create_date || r.po_cat_prefix !== record.original_po_cat_prefix)
  //     );
  //     if (duplicates.length > 0) {
  //       return {
  //         isValid: false,
  //         error: `Duplicate po_cat_prefix: ${record.po_cat_prefix}`,
  //       };
  //     }
  //   }
  //   return { isValid: true };
  // };
