// import { useState, useRef, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import toast from 'react-hot-toast';
// import { fetchAppData } from '../../utils/fetchUtils';


// export const useToolbarLogic = ({
//   handleOperation,
//   formStatus ='Query',
//   QUERY_API,
//   currentRecordNo,
//   handleOffset,
//   totalRecordCount,
//   setupQueryData,
//   handleCancel,
//   setLoading,
//   formName,
//   isQueryReqOnNextPreBtn = true,
//   isQueryReqOnInsertBtn = false,
//   queryDataOnpage = 0,
//   pageCount = 0,
//   whereClauseForQuery = {},
//   searchRecordApi = '',
//   formPayload,
//   formData = {},
//   authority = { insert: 'Y', update: 'Y' }
// }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const [activeButton, setActiveButton] = useState("");


//   const param = useParams();
//   const navigate = useNavigate();
//    const { user } = useSelector((state) => state.auth);

//   // On clicking Exit Button
//   const handleExist = () => {
//     if (formStatus === 'Query' || formStatus === '') {
//       navigate(`/${window.location.pathname.split('/')[1]}/${param.moduleId}`);
//     } else {
//       handleCancel();
//     }
//   };

//   //On clicking Query Button
//   const handleQueryMode = () => {
//       handleOperation("Query");
//       fetchData("Query");
//       handleOffset(0);
//       setActiveButton('Query');
//   };

//   // On clicking Search Button
//   const handleSearchQuery=()=>{
//       handleCancel()
//       handleOperation('Search');
//   }

//   const queryDataRequiredOnInsert = (btnClicked) => {
//     if (authority.insert !== 'Y') {
//       toast.error('Insert not Allowed! Please contact Administrator');
//       return;
//     }
    
//     if (!isQueryReqOnInsertBtn) {
//        handleCancel() // this will relase the formStatus
//     }
   
//     if (isQueryReqOnInsertBtn) {
//       handleOperation(btnClicked);
//       fetchData(btnClicked);
//       handleOffset(0);
//     } else {
//       handleOperation(btnClicked);
//     }
//   };

//   const handleUpdate = (btnClicked) => {
//     if (authority.update !== 'Y') {
//       toast.error('Update not Allowed! Please contact Administrator');
//       return;
//     }
//     handleOperation(btnClicked);
//   };

//   const fetchData = async (btnClicked) => {
//     // if(formStatus !== 'Query'){
//     //   return
//     // }
//     if (QUERY_API === null || QUERY_API === undefined) {
//       return;
//     }
//     if (!isQueryReqOnNextPreBtn) {
//       if (btnClicked === 'Next' || btnClicked === 'Prev' || btnClicked === 'First' || btnClicked === 'Last') {
//         return;
//       }
//     }

//     let newRecord;
//     switch (btnClicked) {
//       case "Next":
//         newRecord = queryDataOnpage ? currentRecordNo : currentRecordNo + 1;
//         if (parseInt(newRecord) === parseInt(totalRecordCount)) {
//           return;
//         }
//         handleOffset(currentRecordNo + 1);
//         break;
//       case "Prev":
//         if (queryDataOnpage) {
//           newRecord = 50;
//         } else {
//           if (currentRecordNo >= 1) {
//             newRecord = currentRecordNo - 1;
//             handleOffset(newRecord);
//           } else {
//             handleOffset(0);
//             return;
//           }
//         }
//         break;
//       case "First":
//       case "Query":
//         handleOffset(0);
//         newRecord = 0;
//         break;
//       case "Insert":
//         if (!isQueryReqOnInsertBtn) {
//           return;
//         }
//         newRecord = 0;
//         break;
//       case "Last":
//         newRecord = totalRecordCount - 1;
//         handleOffset(newRecord);
//         break;
//       default:
//         break;
//     }

//     // try {
    
//     // // const data = await query_data(`${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}`);
//     // const data = await fetchAppData(`${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}&formStatus=${'Query'}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}`); 
//     //    setupQueryData(data, btnClicked);
//     // console.log('making api call')
//     // } catch (error) {
//     //   console.error("Error fetching data:", error);
//     // }

//     try {
//     // console.log("Calling Query:: ", { QUERY_API, btnClicked, newRecord, pageCount, q: `${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}` });
//       // const data = await query_data(`${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}`);
//     const data = await fetchAppData(`${QUERY_API}?get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}&formStatus=${'Query'}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}`); 
//        setupQueryData(data, btnClicked);
//     console.log('making api call')
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (formStatus === "Query" && isFocused) {
//         let btnClicked = "";
//         switch (event.key) {
//           case "ArrowRight":
//             btnClicked = "Next";
//             break;
//           case "ArrowLeft":
//             btnClicked = "Prev";
//             break;
//           case "ArrowUp":
//             btnClicked = "First";
//             break;
//           case "ArrowDown":
//             btnClicked = "Last";
//             break;
//           default:
//             break;
//         }

//         if (btnClicked) {
//           fetchData(btnClicked);
//           setActiveButton(btnClicked);
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [formStatus, currentRecordNo, totalRecordCount]);

//   const handleFocus = () => setIsFocused(true);
//   const handleBlur = () => setIsFocused(false);

//   return {
//     isFocused,
//     activeButton,
//     handleExist,
//     handleQueryMode,
//     queryDataRequiredOnInsert,
//     handleUpdate,
//     fetchData,
//     handleFocus,
//     handleBlur,
//     handleSearchQuery,
//     user
//   };
// };





import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAppData } from "../../utils/fetchUtils";

export const useToolbarLogic = ({
  handleOperation,
  formStatus = "Query",
  QUERY_API,
  currentRecordNo,
  handleOffset,
  totalRecordCount,
  setupQueryData,
  handleCancel,
  setLoading,
  formName,
  isQueryReqOnNextPreBtn = true,
  isQueryReqOnInsertBtn = false,
  queryDataOnpage = 0,
  pageCount = 0,
  whereClauseForQuery = {},
  searchRecordApi = "",
  formPayload,
  formData = {},
  authority = { insert: "Y", update: "Y" },
  
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeButton, setActiveButton] = useState("");

  const param = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // On clicking Exit Button
  const handleExist = () => {
    if (formStatus === "Query" || formStatus === "") {
      navigate(`/${window.location.pathname.split("/")[1]}/${param.moduleId}`);
    } else {
      handleCancel();
    }
  };

  //On clicking Query Button
  const handleQueryMode = () => {
    handleOperation("Query");
    fetchData("Query");
    handleOffset(0);
    setActiveButton("Query");
  };

  // On clicking Search Button
  const handleSearchQuery = async () => {
    handleCancel();
    handleOperation("Search");
  };

  const queryDataRequiredOnInsert = (btnClicked, isCurntRecReqOnInsert ) => {
    if (authority.insert !== "Y") {
      toast.error("Insert not Allowed! Please contact Administrator");
      return;
    }

    if (!isQueryReqOnInsertBtn) {
      handleCancel(); // this will relase the formStatus
    }

    if (isQueryReqOnInsertBtn) {
      handleOperation(btnClicked);
      if(isCurntRecReqOnInsert){
        fetchData(btnClicked,{},isCurntRecReqOnInsert); // required this as per current query record need in insert
        
      }else{
        fetchData(btnClicked);
      }
      handleOffset(0);
    //  handleOffset(0); // changed by amit on dt 11.09.2025 due to account code purchase issue on insert as it requried current offest to fetch record on insert
    } else {
      handleOperation(btnClicked);
    }
  };

  const handleUpdate = (btnClicked) => {

    console.log('authority', authority)
    if (authority.update !== "Y") {
      const {message} = authority
      if(message){
        toast.error(`${message}`||'Update not allowed');
        return
      }
      toast.error("Update not Allowed! Please contact Administrator");
      return;
    }
    handleOperation(btnClicked);
  };

  const fetchData = async (btnClicked, additionalPayload = {}, isReqOffsetOnInsert = false) => {
    // added new parameter isReqOffsetOnInsert by amit on 11.09.2025
    if (QUERY_API === null || QUERY_API === undefined) {
      return;
    }
    if (!isQueryReqOnNextPreBtn) {
      if (
        btnClicked === "Next" ||
        btnClicked === "Prev" ||
        btnClicked === "First" ||
        btnClicked === "Last"
      ) {
        return;
      }
    }

    let newRecord;
    switch (btnClicked) {
      case "Next":
        newRecord = queryDataOnpage ? currentRecordNo : currentRecordNo + 1;
        if (parseInt(newRecord) === parseInt(totalRecordCount)) {
          return;
        }
        handleOffset(currentRecordNo + 1);
        break;
      case "Prev":
        if (queryDataOnpage) {
          newRecord = 50;
        } else {
          if (currentRecordNo >= 1) {
            newRecord = currentRecordNo - 1;
            handleOffset(newRecord);
          } else {
            handleOffset(0);
            return;
          }
        }
        break;
      case "First":
      case "Query":
        handleOffset(0);
        newRecord = 0;
        break;
      case "Insert":
        if (!isQueryReqOnInsertBtn) {
          return;
        }

        if(isReqOffsetOnInsert){
          newRecord = currentRecordNo
        }else{
          newRecord = 0;
        }

        break;
      case "Last":
        newRecord = totalRecordCount - 1;
        handleOffset(newRecord);
        break;
      default:
        break;
    }


    try {
      let queryList = new URLSearchParams(formPayload?.searchQuery || {});
      if(btnClicked === 'Query'){
        queryList = new URLSearchParams({});
      }
      // console.log({ queryList, additionalPayload: formPayload?.searchQuery });

      let queryParams = `get_data=${btnClicked}&offset=${newRecord}&page=${pageCount}&formStatus=${"Query"}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}`;
      queryParams = `${queryParams}${queryList ? `&${queryList}` : ""}`;

      const data = await fetchAppData(`${QUERY_API}?${queryParams}`);
      
      setupQueryData(data, btnClicked);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if (formStatus === "Query" && isFocused) {
  //       let btnClicked = "";
  //       switch (event.key) {
  //         case "ArrowRight":
  //           btnClicked = "Next";
  //           break;
  //         case "ArrowLeft":
  //           btnClicked = "Prev";
  //           break;
  //         case "ArrowUp":
  //           btnClicked = "First";
  //           break;
  //         case "ArrowDown":
  //           btnClicked = "Last";
  //           break;
  //         default:
  //           break;
  //       }

  //       if (btnClicked) {
  //         fetchData(btnClicked);
  //         setActiveButton(btnClicked);
  //       }
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [formStatus, currentRecordNo, totalRecordCount]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return {
    isFocused,
    activeButton,
    handleExist,
    handleQueryMode,
    queryDataRequiredOnInsert,
    handleUpdate,
    fetchData,
    handleFocus,
    handleBlur,
    handleSearchQuery,
    user,
  };
};
