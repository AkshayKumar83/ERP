const { removeKeysFromObject, cleanObject } = require("../../../../utility/query");

function convertEmptyStringToNull(obj) {
    let newObj = {...obj}
    for (const key in newObj) {
      if (newObj.hasOwnProperty(key) && newObj[key] === '') {
        newObj[key] = null;
      }
    }
    console.log('inside make null funciotn', newObj)
    return newObj
  }

 const transFormSupplierMstrForInsert= (formData = {}) => {
    const supplierData = { ...formData };
    const keysForRemove = [
        "city",
        "v_city_name",
        "v_district",
        "v_state",
        "v_zone",
        "v_country",
        "v_region",
        "update_by",
        "create_by",
        'msme_regn_no',
        'gst_state_code',
        'vcode_auto'
    ];

    const updatedSupplierData = cleanObject(supplierData)
    const readyForInsertSuppData = removeKeysFromObject(updatedSupplierData, keysForRemove);
    console.log('supplier master from inside transFormSupplierMstrForInsert :', readyForInsertSuppData)

    return readyForInsertSuppData;
};


module.exports = {transFormSupplierMstrForInsert}