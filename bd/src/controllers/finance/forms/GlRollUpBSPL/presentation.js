
// Helper to transform Level 1 data
  exports.transformLevel1Data = (formData) => {
    if (!Array.isArray(formData)) return [];

    return formData
      .filter(item => item?.level1 && item?.cat_desc)
      .map((item) => ({
        level1: item.level1,
        cat_desc: item.cat_desc,
      }));
  };


// Helper to transform Level 2 data (needs level1)
exports.transformLevel2Data = (formData, barrelTwo, focusedRowBarrel1) => {
  const level1 = formData?.[focusedRowBarrel1]?.level1 || null;

  if (!Array.isArray(barrelTwo)) return [];

  return barrelTwo
    .filter(item => item?.level2 && item?.cat_desc)
    .map((item) => ({
      level1,
      level2: item.level2,
      cat_desc: item.cat_desc,
    }));
};


// Helper to transform Level 3 data (needs level1 + level2)
exports.transformLevel3Data = (
  formData,
  barrelTwo,
  barrelThree,
  focusedRowBarrel1,
  focusedRowBarrel2
) => {
  const level1 = formData?.[focusedRowBarrel1]?.level1 || null;
  const level2 = barrelTwo?.[focusedRowBarrel2]?.level2 || null;

  if (!Array.isArray(barrelThree)) return [];

  return barrelThree
    .filter(item => item?.level3 && item?.cat_desc)
    .map((item) => ({
      level1,
      level2,
      level3: item.level3,
      cat_desc: item.cat_desc,
    }));
};


// Helper to transform Level 4 data (needs level1 + level2 + level3)
exports.transformLevel4Data = (
  formData,
  barrelTwo,
  barrelThree,
  barrelFour,
  focusedRowBarrel1,
  focusedRowBarrel2,
  focusedRowBarrel3
) => {
  const level1 = formData?.[focusedRowBarrel1]?.level1 || null;
  const level2 = barrelTwo?.[focusedRowBarrel2]?.level2 || null;
  const level3 = barrelThree?.[focusedRowBarrel3]?.level3 || null;

  if (!Array.isArray(barrelFour)) return [];

  return barrelFour
    .filter(item => item?.level4 && item?.cat_desc)
    .map((item) => ({
      level1,
      level2,
      level3,
      level4: item.level4,
      cat_desc: item.cat_desc,
    }));
};


