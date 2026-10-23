const { cleanObject, removeKeysFromObject, makeNullValue } = require("../../../utility/query");


const transFormCustomerMstrForInsert= (formData = {}) => {
    const customerData = { ...formData };
    const keysForRemove = [
        "row_status",
        "exise_range",
        "exise_division",
        "exise_collectorate",
        "city",
        "c_zone",
        "c_country",
        "c_region",
        "update_by",
        "create_by",
        'msme_regn_no',
        'gst_state_code',
        'ccode_auto',
        'ship_bill_name',
        'c_v_name',
        'emp_name',
        'st_form',
        'cst_lst_prc',
        'surch_prc',
        'discountDetail',
        "print_gst_code",
        "temp_local_flag",
    ];

    const updatedCustomerData = makeNullValue(customerData)
    const readyForInsertCustData = removeKeysFromObject(updatedCustomerData, keysForRemove);
    console.log('customer master from inside transFormCustomerMstrForInsert :', readyForInsertCustData)

    return readyForInsertCustData;
};

module.exports = {transFormCustomerMstrForInsert}