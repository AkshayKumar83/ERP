export const userSourceHeaders = [
    { label: "User Id", required: true, width: "" },
    { label: "Login Name", required: true, width: "" },
    { label: "User Name", required: true, width: "" },
    { label: "Dept", required: true, width: "" },
    { label: "Active", required: true, width: "" },
];

export const userTargetHeaders = [
    { label: "User Id", required: true, width: "" },
    { label: "Login Name", required: true, width: "" },
    { label: "User Name", required: true, width: "" },
    { label: "Dept", required: true, width: "" },
    { label: "Active", required: true, width: "" },
];

export const sourceProgramHeaders = [
    { label: "", required: true, width: "" },
    { label: "", required: true, width: "" },
];

export const sourceProgramsHdr = [
    { label: "", required: true, width: "" },
    { label: "", required: true, width: "" },
];

export const TargetProgramHeaders = [
    { label: "", required: true, width: "" },
    { label: "", required: true, width: "" },
];

export const TargetProgramsHdr = [
    { label: "", required: true, width: "" },
    { label: "", required: true, width: "" },
];

// below two user tab
export const UserMasterSRC = {   // bata block name is user_master_src
    user_id: " ",
    login_name: " ",
    user_name: "",
    dept_cd: "",
    dept_short_desc: "",
    active: "N",
};
export const UserMasterTRG = {      // bata block name is user_master_trg
    user_id: " ",
    login_name: " ",
    user_name: "",
    dept_cd: "",
    dept_short_desc: "",
    active: "N",
};

 // below two source tab
export const ModuleInfoSRC = {    // bata block name is module_info_src
    program_id: "",
    user_id: " ",
    program_desc: "",
};


export const UserActivitySRC = {    // bata block name is user_activity_src
    user_id: " ",
    program_id: "",
    activity_id: "",
    activity_disp_name: "",
};



  // below two target tab
export const ModuleInfoTRG = {     // bata block name is module_info_trg
    program_id: "",
    user_id: " ",
    program_desc: "",
};

export const UserActivityTRG = {  // bata block name is user_activity_trg
    user_id: " ",
    program_id: "",
    activity_id: "",
    activity_disp_name: "",
};
