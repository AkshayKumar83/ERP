import { APP_PROD_API } from "../../../../utils/api";
import toast from 'react-hot-toast';

export const barrelOneHeader = [
  { label: "Level-1", width: "15%" },
  { label: "Description-1", width: "70%" },
];

export const barrelOneInitData = {
  level1: "",
  level2: "",
  level3: "",
  level4: "",
  cat_desc: "",
};

export const barrelTwoHeader = [
  { label: "Level-2", width: "15%" },
  { label: "Description-2", width: "70%" },
];

export const barrelTwoInitData = {
  level1: "",
  level2: "",
  level3: "",
  level4: "",
  cat_desc: "",
};

export const barrelThreeHeader = [
  { label: "Level-3", width: "15%" },
  { label: "Description-3", width: "70%" },
];

export const barrelThreeInitData = {
  level1: "",
  level2: "",
  level3: "",
  level4: "",
  cat_desc: "",
};

export const barrelFourHeader = [
  { label: "Level-4", width: "15%" },
  { label: "Description-4", width: "70%" },
];

export const barrelFourInitData = {
  level1: "",
  level2: "",
  level3: "",
  level4: "",
  cat_desc: "",
};



export const transformCategoryToDbData = ({ hierarchicalData, focusedRows, formStatus }) => {
  const finalData = [];

  hierarchicalData.level1.forEach((l1, l1Index) => {
    const level1 = l1.level1;

    // Include new or updated records (depending on formStatus)
    if ((formStatus === 'Insert' && l1.isNew) || (formStatus === 'Update' && l1.isAlreadyExist)) {
      if (l1.level1 && l1.cat_desc) {
        finalData.push({
          level1,
          level2: null,
          level3: null,
          level4: null,
          cat_desc: l1.cat_desc,
          isAlreadyExist: l1.isAlreadyExist,
          isNew: l1.isNew,
        });
      }
    }

    l1.level2.forEach((l2) => {
      if ((formStatus === 'Insert' && l2.isNew) || (formStatus === 'Update' && l2.isAlreadyExist)) {
        if (l2.level2 && l2.cat_desc) {
          finalData.push({
            level1,
            level2: l2.level2,
            level3: null,
            level4: null,
            cat_desc: l2.cat_desc,
            isAlreadyExist: l2.isAlreadyExist,
            isNew: l2.isNew,
          });
        }
      }

      l2.level3.forEach((l3) => {
        if ((formStatus === 'Insert' && l3.isNew) || (formStatus === 'Update' && l3.isAlreadyExist)) {
          if (l3.level3 && l3.cat_desc) {
            finalData.push({
              level1,
              level2: l2.level2,
              level3: l3.level3,
              level4: null,
              cat_desc: l3.cat_desc,
              isAlreadyExist: l3.isAlreadyExist,
              isNew: l3.isNew,
            });
          }
        }

        l3.level4.forEach((l4) => {
          if ((formStatus === 'Insert' && l4.isNew) || (formStatus === 'Update' && l4.isAlreadyExist)) {
            if (l4.level4 && l4.cat_desc) {
              finalData.push({
                level1,
                level2: l2.level2,
                level3: l3.level3,
                level4: l4.level4,
                cat_desc: l4.cat_desc,
                isAlreadyExist: l4.isAlreadyExist,
                isNew: l4.isNew,
              });
            }
          }
        });
      });
    });
  });

  return finalData;
};

export const isDeletableRollup = async ({ formData, formStatus, barrel }) => {
  if (formStatus !== 'Update') {
    toast.error('Delete allowed only in Update mode');
    return false;
  }

  const { level1, level2, level3, level4 } = formData;

  // Build query string
  const queryParams = new URLSearchParams({
    level1: level1 || '',
    level2: level2 || '',
    level3: level3 || '',
    level4: level4 || '',
    barrel:barrel|| '',
  }).toString();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_ITEM_CD_CTG_CLS_DELETE}?${queryParams}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Delete check failed!');
    }

    const result = await response.json();
    // console.log(result)
    return result; // You may return true/false based on result from backend

  } catch (err) {
    console.error('Delete validation error:', err.message);
    toast.error(err.message || 'Something went wrong while checking delete status');
    return false;
  }
};


  // function setupQueryData (data) {
  //   const level1List = data.level1List || [];
  //   const level2List = data.level2List || [];
  //    const level3List = data.level3List || [];
  //   const level4List = data.level4List || [];

  //     setOriginalData ({level1List,level2List,level3List, level4List});
  //     setFormData(level1List);

  //     const firstLevel1 = level1List[0]?.level1;

  //     const barrelTwoFiltered = level2List.filter(item => item.level1 === firstLevel1);
  //     setBarrelTwo(barrelTwoFiltered);

  //     const firstLevel2 = barrelTwoFiltered[0]?.level2;
  //     const barrelThreeFiltered = level3List.filter(item => item.level1 === firstLevel1 &&
  //        item.level2 === firstLevel2);
  //        setBarrelThree(barrelThreeFiltered);

  //        const firstLevel3 = barrelThreeFiltered[0]?.level3;
  //        const barrelFourFiltered = level4List.filter(item => item.level1 === firstLevel1
  //         && item.level2 === firstLevel2 && item.level3 === firstLevel3) ;
  //         setBarrelFour(barrelFourFiltered);
  // }

  //  useEffect(() =>{
  //   if(!originalData) return;
     
  //   const selectedLevel1 = formData[focusedRowBarrel1]?.level1;
  //   const filteredLevel2 = originalData.level2List?.filter(item => 
  //     item.level1 === selectedLevel1) || [];
  //    setBarrelTwo(filteredLevel2);
  //    setFocusedRowBarrel2(0);
  //  },[focusedRowBarrel1,formData,originalData]);

  //  useEffect(() => {
  //   if(!originalData) return;
     
  //   const selectedLevel1 = formData[focusedRowBarrel1]?.level1;
  //   const selectedLevel2 = barrelTwo[focusedRowBarrel2]?.level2;
  //   const filteredLevel3 = originalData.level3List?.filter(item =>
  //      item.level1 === selectedLevel1 &&
  //      item.level2 === selectedLevel2) || [];
  //     setBarrelThree(filteredLevel3);
  //     setFocusedRowBarrel3(0);
  //  },[focusedRowBarrel2, barrelTwo, formData, originalData]);

  //    useEffect(() => {
  //      if (!originalData) return;
   
  //      const selectedLevel1 = formData[focusedRowBarrel1]?.level1;
  //      const selectedLevel2 = barrelTwo[focusedRowBarrel2]?.level2;
  //      const selectedLevel3 = barrelThree[focusedRowBarrel3]?.level3;
  //      const filteredLevel4 = originalData.level4List?.filter(item =>
  //        item.level1 === selectedLevel1 &&
  //        item.level2 === selectedLevel2 &&
  //        item.level3 === selectedLevel3
  //      ) || [];
  //      setBarrelFour(filteredLevel4);
  //      setFocusedRowBarrel4(0);
  //    }, [focusedRowBarrel3, barrelThree, barrelTwo, formData, originalData]);
   