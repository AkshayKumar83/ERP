import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const headers=[
    // { label: "Action", required: false, width:"2%"  },
    { label: " From Unit", required: true, width:"20%" },
    { label: " Conversion Factor", required: true, width:"50%"},
    { label: "TO Unit", required: true,width:"20%" },
]

export const unitConversionData={
    from_id:"",  
    multiplier:"",
    to_id:"",
    create_id:"",
    create_date:"",
    update_id:"",
    update_date:"",
    
}

export const checkDuplicateFromToID = async ({ from_id, to_id, formStatus }) => {
  if (!['Insert', 'Update'].includes(formStatus)) {
    return { exists: false, type: 'success' }; // Early return if formStatus invalid
  }

  try {
    // Ensure from_id and to_id are numbers
    const fromId = parseInt(from_id, 10);
    const toId = parseInt(to_id, 10);

    if (isNaN(fromId) || isNaN(toId)) {
      return { exists: false, type: 'error', message: 'Invalid from_id or to_id' };
    }

    const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UNIT_CONVERSION_MSTR_FORM_DATA}/check_duplicate?from_id=${fromId}&to_id=${toId}`;

    const response = await fetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { exists: false, type: 'error', message: data.message || 'Error checking duplicate' };
    }

    if (data.exists) {
      return { exists: true, type: 'error', message: `Duplicate entry found for From ID: ${fromId}, To ID: ${toId}` };
    }

    return { exists: false, type: 'success' };
  } catch (error) {
    console.error('Error in checkDuplicateFromToID:', error);
    return { exists: false, type: 'error', message: error.message || 'Something went wrong while checking duplicate' };
  }
};




