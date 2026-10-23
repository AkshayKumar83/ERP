
export const initUserMasterData = {
    cy_flag: "N",
    active: 'N',
    can_raise_pr: "N",
    can_inspect_material: "N",
    allow_dashboard_access: "N",
    allow_erp_access_over_cloud: "N",
    can_update_dashboard_data: "N",
    can_auth_line_rej: "N",
    can_auth_scrap_rej: "N",
    is_time_keeper: "N",
    can_del_rep_in_so: "N",
    process_mis_invtry: "N",
    allow_upd_in_final_route: "N",
    allow_emp_portal_access: "N",
    type_user:'N',
    is_group:'U',

    userDivisionData:[ 
      {
      name: "",
      default_division: "N",
      // isDivisionPosted: false,
      division_id: "",
      id: 1,
      original_division_id: "",

      },
    ],

    userLocationData:[
      {
        location_desc: "",
        default_location: "N",
        // isLocationPosted: false,
        location_id: "",
        id: 1,
        original_location_id: ""
      },
    ],

    userLoginData:[
      {
        create_date: '',
        default_division : "",
        division_id:"",
        name:'' ,
        user_id:''
      }
    ]

}

export const updFormpayloadTemplate = {
 
  deletedDivisionData:[],
  deletedLocationData:[],
}



export const userLoginDetailHeader = [{ label: "Login Name" }];
export const userDivisionHeader = [
  
  { label: "Division Name", required: true, isHelpExist: true },
  { label: "Default Division"  },
];
export const userLocationHeader = [

  { label: "Location Name", required: true, isHelpExist: true},
  { label: "Default Location" },
]; 

export const employeeHelpListHeader = [
  {label: "Employee Code", key: "emp_cd"},
  {label: "Employee Name", key: "emp_name"}
]  

export const divisionHelpListHeader = [
  {label: "Division ID", key: "division_id"},
  {label: "Division Name", key: "name"}
]   

export const locationHelpListHeader = [
  {label: "Location ID", key: "location_id"},
  {label: "Location Name", key: "location_desc"}
]     

 export const createSearchPayloadForBVSpecificSearch = (masterData) => {
    let payload = {};
  
    //console.log('masterdata', masterData);
  
    let masterKeys = { 
  
      login_name: "login_name", 
       
     
    };
  
    let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
    //console.log('hasMasterKeys', hasMasterKeys);
  
    if (hasMasterKeys) {
      Object.keys(masterKeys).forEach((key) => {
        let value = masterData[key];
  
        // Exclude undefined and empty values ("")
        if (value !== undefined && value !== "") {
            payload[masterKeys[key]] = value;
        }
      });
    }
  
    return payload;
  };