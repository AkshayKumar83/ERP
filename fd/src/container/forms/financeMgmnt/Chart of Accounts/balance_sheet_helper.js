export const balanceSheetDtlTHeader = [
    {
        label: "Description",
        required: true,
        width: "30%",
    },
    {
        label: "Total",
        required: false,
        width: "9%",
    },

    {
        label: "---",
        required: false,
        width: "9%",
    },
    {
        label: "Heading",
        required: false,
        width: "9%",
    },

    {
        label: "+/-",
        required: false,
        width: "9%",
    },

    {
        label: "Seq No.",
        required: true,
        width: "12%",
    },
    {
        label: "Sch No.",
        required: false,
        width: "10%",
    },
    {
        label: "Sub Sch.",
        required: false,
        width: "10%",
    },
    {
        label: "Rollup Account",
        required: false,
        width: "17%",
        isHelpExist: true,
    },
];

export const balanceSheetDtlInitFormData = {
  //  row_status: "",
    trans_year: "",
    division_id: "",
    bs_pl_flag: "B",
    ass_lib_inc_exp_app_sch_flag: "A",
    description: "",
    total_flag: "N",
    pl_balance_effect: "",
    line_flag: "N",
    heading_flag: "N",
    plus_minus: "N",
    sno: "",
    schd_no: "",
    sch_sno: "",
    rollup_acc1: "",
    id: 1,
    init_description: ''
};

export const InitialFormData = {
    bs_pl_flag: "B",
    ass_lib_inc_exp_app_sch_flag: "A",
};


export const RollUpAccHeadHelpListHeader = [
    { label: "Rollup Acc", key: "rollup_acc1" },
    
];