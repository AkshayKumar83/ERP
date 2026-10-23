// import { useCallback, useState } from "react";

// export const useFormStatus = () => {
//     const [formStatus, setFormStatus] = useState("");




//     const handleOperation = useCallback((data) => {
       
//             if(formStatus === '' && data === 'Update'){
//                 return;
//             }
//             setFormStatus(data);
//         },[formStatus]
//     );

//     const releaseFormStatus = () => {
//         setFormStatus("");
//     };


//     return { formStatus, setFormStatus, handleOperation, releaseFormStatus};
// };





// CHANGED BY SID
import { useCallback, useState } from "react";

export const useFormStatus = () => {
  const [formStatus, setFormStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState({});

  const handleOperation = useCallback(
    (data) => {
      if (formStatus === "" && data === "Update") {
        return;
      }

      setFormStatus(data);
    },
    [formStatus]
  );

  const releaseFormStatus = () => {
    setFormStatus("");
  };

  

  // console.log({ searchQuery });

  return {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  };
};