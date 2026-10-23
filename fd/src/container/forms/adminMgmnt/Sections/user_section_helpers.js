export const userDescHeader = [
    { label: "User Name", key: "user_name", width: "150px", isHelpExist: true, required: true },
    { label: "Section Name", key: "section_name", width: "150px", isHelpExist: true, required: true },
    { label: "Authorised Name", key: "auth_name", width: "150px", isHelpExist: true, required: true },
    { label: "Default Section", key: "default_section", width: "60px" },
  ];
  

  export const userSectionInitFormDataTemplate = {
    id: 1,
    user_id: "",
    section_id: "",
    auth_id: "",
    user_name: "",
    section_name: "",
    auth_name: "",
    default_section: "N",
     init_user_id: "",
     init_sec_id: "",
  
  };   

  //  auth name help list header  
  export const authHelpListHeader = [
    {label: "Auth ID", key: "user_id"},
    {label: "Auth Name", key: "user_name"}
]     

 //  user name help list header   
 export const userHelpListHeader = [
  {label: "User ID", key: "user_id"},
  {label: "User Name", key: "user_name"}
]     

//  section name help list header   
export const sectionHelpListHeader = [
  {label: "Section ID", key: "section_id"},
  {label: "Section Desc", key: "section_desc"}
]   

