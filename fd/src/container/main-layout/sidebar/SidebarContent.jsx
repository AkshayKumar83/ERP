// // import React, { useEffect, useRef, useMemo, useState } from "react"
// // import { Link, useLocation } from "react-router-dom"
// // import MetisMenu from "metismenujs"
// // import {
// //   RiHome2Line,
// //   RiBuilding2Line,
// //   RiFileList3Line,
// //   RiFileChartLine,
// //   RiArrowDownSLine,
// //   RiArrowRightSLine,
// // } from "@remixicon/react"
// // import {
// //   moduleIconConfig,
// //   membershipModuleMenu,
// //   adminModuleMenu,
// //   purchaseModuleMenu,
// //   saleModuleMenu,
// //   whModuleMenu,
// //   finModuleMenu,
// //   hrModuleMenu
// // } from "../../../utils/appHelpers/menuConfig"
// // import { SlCalender } from "react-icons/sl";
// // import { MdOutlineDashboard } from "react-icons/md";
// // import ChangeFinYear from "../../forms/adminMgmnt/User/change_fin_year"
// // import ChangeDivision from "../../forms/adminMgmnt/User/change_division"

// // const modalType = {
// //   changeFinYear:'changeFinYear',
// //   changeDiv:'changeDiv',
// // }

// // const SidebarContent = ({ isMobile }) => {
// //   const location = useLocation()
// //   const metisMenuRef = useRef(null)
// //   const [expandedItems, setExpandedItems] = useState({})

// //   const [clickedModal, setClickedModal] = useState(undefined)
// //   const [isModalOpen, setIsModalOpen] = useState(false)
// //   const toggleModal = () =>setIsModalOpen(!isModalOpen);

// //   const currentModule = useMemo(() => {
// //     const path = location.pathname.split("/")
// //     // setCurrModuleName(path[2])
// //     return path[2] || ""
// //   }, [location])

// //   const currentModuleMenu = useMemo(() => {
// //     switch (currentModule) {
// //       case "memberMgmnt":
// //         return membershipModuleMenu
// //       case "adminMgmnt":
// //         return adminModuleMenu
// //       case "materialMgmnt":
// //         return purchaseModuleMenu
// //       case "saleMgmnt":
// //         return saleModuleMenu
// //       case "whMgmnt":
// //         return whModuleMenu
// //       case "financeMgmnt":
// //         return finModuleMenu
// //       case "hrMgmnt":
// //         return hrModuleMenu
// //       default:
// //         return []
// //     }
// //   }, [currentModule])

// //   useEffect(() => {
// //     initializeMetisMenu()
// //     return () => {
// //       if (metisMenuRef.current) {
// //         metisMenuRef.current.dispose()
// //       }
// //     }
// //   }, [])

// //   // useEffect(() => {
// //   //   highlightActiveMenu()

// //   //   return()=>{
// //   //       setExpandedItems({})
// //   //   }
// //   // }, [currentModule]) // Updated dependency array

// // //   useEffect(() => {
// // //   if (location.pathname !== `/module/${currentModule}`) {
// // //     highlightActiveMenu();
// // //   } else {
// // //     setExpandedItems({}); // No auto-expand
// // //   }

// // //   return () => {
// // //     setExpandedItems({});
// // //   };
// // // }, [currentModule, location.pathname]);

// // useEffect(() => {
// //   if (!/^\/module\/[^/]+$/.test(location.pathname)) {
// //     highlightActiveMenu();
// //   }
// // }, [location.pathname]);



// //   const initializeMetisMenu = () => {
// //     metisMenuRef.current = new MetisMenu("#side-menu", {
// //       toggle: false,
// //     })
// //   }

// //   // const highlightActiveMenu = () => {
// //   //   const items = document.querySelectorAll("#side-menu a")
// //   //   items.forEach((item) => {
// //   //     item.classList.remove("active")
// //   //     const parent = item.parentElement
// //   //     if (parent) {
// //   //       parent.classList.remove("mm-active")
// //   //     }
// //   //   })

// //   //   const matchingMenuItem = Array.from(items).find((item) => item.pathname === location.pathname)

// //   //   if (matchingMenuItem) {
// //   //     activateParentDropdown(matchingMenuItem)
// //   //   }
// //   // }

// // const highlightActiveMenu = () => {
// //   const items = document.querySelectorAll("#side-menu a");
// //   items.forEach((item) => {
// //     item.classList.remove("active");
// //     const parent = item.parentElement;
// //     if (parent) parent.classList.remove("mm-active");
// //   });

// //   // Only match routes beyond just the module root
// //   const matchingMenuItem = Array.from(items).find(
// //     (item) =>
// //       item.pathname === location.pathname &&
// //       !/^\/module\/[^/]+$/.test(item.pathname) // Avoid pure /module/memberMgmnt
// //   );

// //   if (matchingMenuItem) {
// //     activateParentDropdown(matchingMenuItem);
// //   }
// // };



// //   const activateParentDropdown = (item) => {
// //     item.classList.add("active")
// //     let parent = item.parentElement

// //     while (parent) {
// //       if (parent.tagName === "LI") {
// //         parent.classList.add("mm-active")
// //         const childUl = parent.querySelector("ul")
// //         if (childUl) {
// //           childUl.style.display = "block"
// //         }
// //       }
// //       parent = parent.parentElement
// //     }
// //   }

// //   const toggleMenuItem = (itemId) => {
// //     setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
// //   }

// //   const renderMenuItems = (items, parentId) => {
// //     return items.map((item, index) => (
// //       <li key={`${parentId}-${index}`}>
// //         {/* <Link to={`/module/${currentModule}/${item.id}`}>
// //           <span>{item.formName}</span>
// //         </Link> */}
// //         <Link
// //           to={`/module/${currentModule}/${item.id}`}
// //           className={location.pathname === `/module/${currentModule}/${item.id}` ? "active" : ""}
// //         >
// //           <span>{item.formName}</span>
// //         </Link>

// //       </li>
// //     ))
// //   }

// //   const renderMenuGroup = (group, id, type) => {
// //     const groupId = `${type}-${id}`
// //     const isExpanded = expandedItems[groupId]
// //     return (
// //       <li key={groupId} id={groupId}>
// //         <Link to="#" onClick={() => toggleMenuItem(groupId)} style={{display:'flex', justifyContent:"space-between"}}>
// //           {/* <i className="ri-account-circle-line"></i> */}
// //           <span className="ms-1">{group.formName}</span>
// //           {group.item && (isExpanded ? <RiArrowDownSLine className="menu-arrow" /> : <RiArrowRightSLine className="menu-arrow" />)}
// //         </Link>
// //         {isExpanded && group.item && <ul className="sub-menu">{renderMenuItems(group.item, groupId)}</ul>}
// //       </li>
// //     )
// //   }

// //   function handleOpenModal(e, modalType){
// //     e.preventDefault()
// //     //console.log('Opening modal:', modalType);  // Debugging line
// //     toggleModal()
// //     setClickedModal(modalType)
// //   }

// //   return (
// //     <React.Fragment>
// //       <div id="sidebar-menu">
// //         <ul className="list-unstyled metismenu" id="side-menu">
// //           <li className="menu-title">Dashboard</li>
// //           <li>
// //             <Link to="/">
// //               <RiHome2Line className="icon" />
// //               <span className="ms-1">Home</span>
// //             </Link>
// //           </li>

// //           <li className="menu-title">ERP</li>
// //           {/* <li>
// //             <Link to={'/erp'}>
// //               <MdOutlineDashboard className="icon"/>
// //               <span className="ms-1">Launch ERP</span>
// //             </Link>
// //           </li> */}
// //          <li className={location.pathname === "/erp" ? "mm-active" : ""}>
// //           <Link to="/erp">
// //             <MdOutlineDashboard className="icon" />
// //             <span className="ms-1">Launch ERP</span>
// //           </Link>
// //         </li>

// //           {
// //             location.pathname =='/erp' && 
// //             <>
// //               <li>
// //                 <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeFinYear)}>
// //                   <SlCalender className="icon"/>
// //                   <span className="ms-1">Change Financial Year</span>
// //                 </Link>
// //               </li>
// //               <li>
// //                 <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeDiv)}>
// //                   <RiBuilding2Line className="icon" />
// //                   <span className="ms-1">Change Division</span>
// //                 </Link>
// //               </li>
// //             </>
// //           }
// //           {currentModule && (
// //             <>
// //               <li className="menu-title">Forms</li>
// //               {currentModuleMenu
// //                 .filter((menu) => menu.name === "Form" || !menu.name)
// //                 .map((formGroup, index) =>
// //                   formGroup.item
// //                     ? renderMenuGroup(formGroup, formGroup.id, "form")
// //                     : renderMenuItems([formGroup], `form-${index}`),
// //                 )}

// //               <li className="menu-title">Reports</li>
// //               {currentModuleMenu
// //                 .filter((menu) => menu.name === "Report")
// //                 .map((reportGroup, index) => renderMenuGroup(reportGroup, index, "report"))}
// //             </>
// //           )}

// //           {
// //             isModalOpen &&  clickedModal=='changeFinYear' && <ChangeFinYear isModalOpen={isModalOpen} toggleModal={toggleModal}/>
// //           }
// //           {
// //             isModalOpen &&  clickedModal=='changeDiv' && <ChangeDivision isModalOpen={isModalOpen} toggleModal={toggleModal}/>
// //           }


// //         </ul>
// //       </div>
// //     </React.Fragment>
// //   )
// // }

// // export default SidebarContent









// import React, { useEffect, useRef, useMemo, useState } from "react"
// import { Link, useLocation } from "react-router-dom"
// import MetisMenu from "metismenujs"
// import {
//   RiHome2Line,
//   RiBuilding2Line,
//   RiFileList3Line,
//   RiFileChartLine,
//   RiArrowDownSLine,
//   RiArrowRightSLine,
// } from "@remixicon/react"
// import {
//   moduleIconConfig,
//   membershipModuleMenu,
//   adminModuleMenu,
//   purchaseModuleMenu,
//   saleModuleMenu,
//   whModuleMenu,
//   finModuleMenu,
//   hrModuleMenu,
//   getUserMenuConfig
// } from "../../../utils/appHelpers/menuConfig"
// import { SlCalender } from "react-icons/sl";
// import { MdOutlineDashboard } from "react-icons/md";
// import ChangeFinYear from "../../forms/adminMgmnt/User/change_fin_year"
// import ChangeDivision from "../../forms/adminMgmnt/User/change_division"
// import { useSelector } from "react-redux"

// const modalType = {
//   changeFinYear:'changeFinYear',
//   changeDiv:'changeDiv',
// }

// const SidebarContent = ({ isMobile }) => {
//   const location = useLocation()
//   const metisMenuRef = useRef(null)
//   const [expandedItems, setExpandedItems] = useState({})

//   const [clickedModal, setClickedModal] = useState(undefined)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const toggleModal = () =>setIsModalOpen(!isModalOpen);

//   // ## dynamically fetching the menu from as per the user rights
//   const [allMenus, setAllMenus] = useState({});
//   const [menuLoading, setMenuLoading] = useState(true);

//   const currentModule = useMemo(() => {
//     const path = location.pathname.split("/")
//     // setCurrModuleName(path[2])
//     return path[2] || ""
//   }, [location])

//   console.log('menu visible')

//     // GLOBAL USERDATA
//   const { user } = useSelector((state) => state.auth);



// // useEffect(() => {

// //   // Don't call API if user is not inside a module
// //   if (!currentModule) {
// //     return;
// //   }

// //   // Already fetched this module
// //   if (Object.prototype.hasOwnProperty.call(allMenus, currentModule)) {
// //     return;
// //   }

// //   const fetchMenu = async () => {
// //     try {
// //       setMenuLoading(true);

// //       const response = await getUserMenuConfig({
// //         division_id: 1,
// //         fin_year: "2026",
// //         user_id: 607,
// //         module: currentModule
// //       });

// //       if (response.success) {
// //         // setAllMenus((prev) => ({
// //         //   ...prev,
// //         //   [currentModule]: response.data
// //         // }));
// //         setAllMenus((prev) => ({
// //           ...prev,
// //           ...response.data
// //         }));
// //       }

// //     } catch (error) {
// //       console.error(
// //         `Failed to fetch menu for ${currentModule}:`,
// //         error
// //       );
// //     } finally {
// //       setMenuLoading(false);
// //     }
// //   };

// //   fetchMenu();

// // }, [currentModule]);

//   // const currentModuleMenu = useMemo(() => {
//   //   switch (currentModule) {
//   //     case "memberMgmnt":
//   //       return membershipModuleMenu
//   //     case "adminMgmnt":
//   //       return adminModuleMenu
//   //     case "materialMgmnt":
//   //       return purchaseModuleMenu
//   //     case "saleMgmnt":
//   //       return saleModuleMenu
//   //     case "whMgmnt":
//   //       return whModuleMenu
//   //     case "financeMgmnt":
//   //       return finModuleMenu
//   //     case "hrMgmnt":
//   //       return hrModuleMenu
//   //     default:
//   //       return []
//   //   }
//   // }, [currentModule])


//   useEffect(() => {
//   if (!currentModule) {
//     return;
//   }

//   // Already fetched this module
//   if (Object.prototype.hasOwnProperty.call(allMenus, currentModule)) {
//     return;
//   }

//   const fetchMenu = async () => {
//     try {
//       setMenuLoading(true);

//       const response = await getUserMenuConfig({
//         division_id: user?.global_division_id,
//         fin_year: user?.global_fin_year,
//         user_id: user.id
//       });

//       // console.log("API response:", response);

//       if (response.success) {
//         setAllMenus((prev) => ({
//           ...prev,
//           ...response.data
//         }));
//       }

//     } catch (error) {
//       console.error(
//         `Failed to fetch menu for ${currentModule}:`,
//         error
//       );
//     } finally {
//       setMenuLoading(false);
//     }
//   };

//   fetchMenu();

// }, [currentModule]);


//   const currentModuleMenu = useMemo(() => {
//   return allMenus[currentModule] || [];
// }, [allMenus, currentModule]);


// console.log(allMenus)






//   useEffect(() => {
//     initializeMetisMenu()
//     return () => {
//       if (metisMenuRef.current) {
//         metisMenuRef.current.dispose()
//       }
//     }
//   }, [])

//   // useEffect(() => {
//   //   highlightActiveMenu()

//   //   return()=>{
//   //       setExpandedItems({})
//   //   }
//   // }, [currentModule]) // Updated dependency array

// //   useEffect(() => {
// //   if (location.pathname !== `/module/${currentModule}`) {
// //     highlightActiveMenu();
// //   } else {
// //     setExpandedItems({}); // No auto-expand
// //   }

// //   return () => {
// //     setExpandedItems({});
// //   };
// // }, [currentModule, location.pathname]);

// useEffect(() => {
//   if (!/^\/module\/[^/]+$/.test(location.pathname)) {
//     highlightActiveMenu();
//   }
// }, [location.pathname]);



//   const initializeMetisMenu = () => {
//     metisMenuRef.current = new MetisMenu("#side-menu", {
//       toggle: false,
//     })
//   }

//   // const highlightActiveMenu = () => {
//   //   const items = document.querySelectorAll("#side-menu a")
//   //   items.forEach((item) => {
//   //     item.classList.remove("active")
//   //     const parent = item.parentElement
//   //     if (parent) {
//   //       parent.classList.remove("mm-active")
//   //     }
//   //   })

//   //   const matchingMenuItem = Array.from(items).find((item) => item.pathname === location.pathname)

//   //   if (matchingMenuItem) {
//   //     activateParentDropdown(matchingMenuItem)
//   //   }
//   // }

// const highlightActiveMenu = () => {
//   const items = document.querySelectorAll("#side-menu a");
//   items.forEach((item) => {
//     item.classList.remove("active");
//     const parent = item.parentElement;
//     if (parent) parent.classList.remove("mm-active");
//   });

//   // Only match routes beyond just the module root
//   const matchingMenuItem = Array.from(items).find(
//     (item) =>
//       item.pathname === location.pathname &&
//       !/^\/module\/[^/]+$/.test(item.pathname) // Avoid pure /module/memberMgmnt
//   );

//   if (matchingMenuItem) {
//     activateParentDropdown(matchingMenuItem);
//   }
// };



//   const activateParentDropdown = (item) => {
//     item.classList.add("active")
//     let parent = item.parentElement

//     while (parent) {
//       if (parent.tagName === "LI") {
//         parent.classList.add("mm-active")
//         const childUl = parent.querySelector("ul")
//         if (childUl) {
//           childUl.style.display = "block"
//         }
//       }
//       parent = parent.parentElement
//     }
//   }

//   const toggleMenuItem = (itemId) => {
//     setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
//   }

//   const renderMenuItems = (items, parentId) => {
//     return items.map((item, index) => (
//       <li key={`${parentId}-${index}`}>
//         {/* <Link to={`/module/${currentModule}/${item.id}`}>
//           <span>{item.formName}</span>
//         </Link> */}
//         <Link
//           to={`/module/${currentModule}/${item.id}`}
//           className={location.pathname === `/module/${currentModule}/${item.id}` ? "active" : ""}
//         >
//           <span>{item.formName}</span>
//         </Link>

//       </li>
//     ))
//   }

//   const renderMenuGroup = (group, id, type) => {
//     const groupId = `${type}-${id}`
//     const isExpanded = expandedItems[groupId]
//     return (
//       <li key={groupId} id={groupId}>
//         <Link to="#" onClick={() => toggleMenuItem(groupId)} style={{display:'flex', justifyContent:"space-between"}}>
//           {/* <i className="ri-account-circle-line"></i> */}
//           <span className="ms-1">{group.formName}</span>
//           {group.item && (isExpanded ? <RiArrowDownSLine className="menu-arrow" /> : <RiArrowRightSLine className="menu-arrow" />)}
//         </Link>
//         {isExpanded && group.item && <ul className="sub-menu">{renderMenuItems(group.item, groupId)}</ul>}
//       </li>
//     )
//   }

//   function handleOpenModal(e, modalType){
//     e.preventDefault()
//     //console.log('Opening modal:', modalType);  // Debugging line
//     toggleModal()
//     setClickedModal(modalType)
//   }

//   return (
//     <React.Fragment>
//       <div id="sidebar-menu">
//         <ul className="list-unstyled metismenu" id="side-menu">
//           <li className="menu-title">Dashboard</li>
//           <li>
//             <Link to="/">
//               <RiHome2Line className="icon" />
//               <span className="ms-1">Home</span>
//             </Link>
//           </li>

//           <li className="menu-title">ERP</li>
//           {/* <li>
//             <Link to={'/erp'}>
//               <MdOutlineDashboard className="icon"/>
//               <span className="ms-1">Launch ERP</span>
//             </Link>
//           </li> */}
//          <li className={location.pathname === "/erp" ? "mm-active" : ""}>
//           <Link to="/erp">
//             <MdOutlineDashboard className="icon" />
//             <span className="ms-1">Launch ERP</span>
//           </Link>
//         </li>

//           {
//             location.pathname =='/erp' && 
//             <>
//               <li>
//                 <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeFinYear)}>
//                   <SlCalender className="icon"/>
//                   <span className="ms-1">Change Financial Year</span>
//                 </Link>
//               </li>
//               <li>
//                 <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeDiv)}>
//                   <RiBuilding2Line className="icon" />
//                   <span className="ms-1">Change Division</span>
//                 </Link>
//               </li>
//             </>
//           }
//           {currentModule && (
//             <>
//               <li className="menu-title">Forms</li>
//               {currentModuleMenu
//                 .filter((menu) => menu.name === "Form" || !menu.name)
//                 .map((formGroup, index) =>
//                   formGroup.item
//                     ? renderMenuGroup(formGroup, formGroup.id, "form")
//                     : renderMenuItems([formGroup], `form-${index}`),
//                 )}

//               <li className="menu-title">Reports</li>
//               {currentModuleMenu
//                 .filter((menu) => menu.name === "Report")
//                 .map((reportGroup, index) => renderMenuGroup(reportGroup, index, "report"))}
//             </>
//           )}

//           {
//             isModalOpen &&  clickedModal=='changeFinYear' && <ChangeFinYear isModalOpen={isModalOpen} toggleModal={toggleModal}/>
//           }
//           {
//             isModalOpen &&  clickedModal=='changeDiv' && <ChangeDivision isModalOpen={isModalOpen} toggleModal={toggleModal}/>
//           }


//         </ul>
//       </div>
//     </React.Fragment>
//   )
// }

// export default SidebarContent








import React, { useEffect, useRef, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import MetisMenu from "metismenujs"
import {
  RiHome2Line,
  RiBuilding2Line,
  RiFileList3Line,
  RiFileChartLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import {
  moduleIconConfig,
  membershipModuleMenu,
  adminModuleMenu,
  purchaseModuleMenu,
  saleModuleMenu,
  whModuleMenu,
  finModuleMenu,
  hrModuleMenu,
  getUserMenuConfig
} from "../../../utils/appHelpers/menuConfig"
import { SlCalender } from "react-icons/sl";
import { MdOutlineDashboard } from "react-icons/md";
import ChangeFinYear from "../../forms/adminMgmnt/User/change_fin_year"
import ChangeDivision from "../../forms/adminMgmnt/User/change_division"
import { useSelector } from "react-redux"

const modalType = {
  changeFinYear:'changeFinYear',
  changeDiv:'changeDiv',
}

const SidebarContent = ({ isMobile }) => {
  const location = useLocation()
  const metisMenuRef = useRef(null)
  const [expandedItems, setExpandedItems] = useState({})

  const [clickedModal, setClickedModal] = useState(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const toggleModal = () =>setIsModalOpen(!isModalOpen);

  // ## dynamically fetching the menu from as per the user rights
  const [allMenus, setAllMenus] = useState({});
  const [menuLoading, setMenuLoading] = useState(true);

  const currentModule = useMemo(() => {
    const path = location.pathname.split("/")
    // setCurrModuleName(path[2])
    return path[2] || ""
  }, [location])

  console.log('menu visible')

    // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);



// useEffect(() => {

//   // Don't call API if user is not inside a module
//   if (!currentModule) {
//     return;
//   }

//   // Already fetched this module
//   if (Object.prototype.hasOwnProperty.call(allMenus, currentModule)) {
//     return;
//   }

//   const fetchMenu = async () => {
//     try {
//       setMenuLoading(true);

//       const response = await getUserMenuConfig({
//         division_id: 1,
//         fin_year: "2026",
//         user_id: 607,
//         module: currentModule
//       });

//       if (response.success) {
//         // setAllMenus((prev) => ({
//         //   ...prev,
//         //   [currentModule]: response.data
//         // }));
//         setAllMenus((prev) => ({
//           ...prev,
//           ...response.data
//         }));
//       }

//     } catch (error) {
//       console.error(
//         `Failed to fetch menu for ${currentModule}:`,
//         error
//       );
//     } finally {
//       setMenuLoading(false);
//     }
//   };

//   fetchMenu();

// }, [currentModule]);

  // const currentModuleMenu = useMemo(() => {
  //   switch (currentModule) {
  //     case "memberMgmnt":
  //       return membershipModuleMenu
  //     case "adminMgmnt":
  //       return adminModuleMenu
  //     case "materialMgmnt":
  //       return purchaseModuleMenu
  //     case "saleMgmnt":
  //       return saleModuleMenu
  //     case "whMgmnt":
  //       return whModuleMenu
  //     case "financeMgmnt":
  //       return finModuleMenu
  //     case "hrMgmnt":
  //       return hrModuleMenu
  //     default:
  //       return []
  //   }
  // }, [currentModule])


  useEffect(() => {
  if (!currentModule) {
    return;
  }

  // Already fetched this module
  if (Object.prototype.hasOwnProperty.call(allMenus, currentModule)) {
    return;
  }

  const fetchMenu = async () => {
    try {
      setMenuLoading(true);

      const response = await getUserMenuConfig({
          division_id: user?.global_division_id,
          fin_year: user?.global_fin_year,
          user_id: user.id
      });

      // console.log("API response:", response);

      if (response.success) {
        setAllMenus((prev) => ({
          ...prev,
          ...response.data
        }));
      }

    } catch (error) {
      console.error(
        `Failed to fetch menu for ${currentModule}:`,
        error
      );
    } finally {
      setMenuLoading(false);
    }
  };

  fetchMenu();

}, [currentModule]);


  const currentModuleMenu = useMemo(() => {
  return allMenus[currentModule] || [];
}, [allMenus, currentModule]);


console.log(allMenus)






  useEffect(() => {
    initializeMetisMenu()
    return () => {
      if (metisMenuRef.current) {
        metisMenuRef.current.dispose()
      }
    }
  }, [])

  // useEffect(() => {
  //   highlightActiveMenu()

  //   return()=>{
  //       setExpandedItems({})
  //   }
  // }, [currentModule]) // Updated dependency array

//   useEffect(() => {
//   if (location.pathname !== `/module/${currentModule}`) {
//     highlightActiveMenu();
//   } else {
//     setExpandedItems({}); // No auto-expand
//   }

//   return () => {
//     setExpandedItems({});
//   };
// }, [currentModule, location.pathname]);

useEffect(() => {
  if (!/^\/module\/[^/]+$/.test(location.pathname)) {
    highlightActiveMenu();
  }
}, [location.pathname]);



  const initializeMetisMenu = () => {
    metisMenuRef.current = new MetisMenu("#side-menu", {
      toggle: false,
    })
  }

  // const highlightActiveMenu = () => {
  //   const items = document.querySelectorAll("#side-menu a")
  //   items.forEach((item) => {
  //     item.classList.remove("active")
  //     const parent = item.parentElement
  //     if (parent) {
  //       parent.classList.remove("mm-active")
  //     }
  //   })

  //   const matchingMenuItem = Array.from(items).find((item) => item.pathname === location.pathname)

  //   if (matchingMenuItem) {
  //     activateParentDropdown(matchingMenuItem)
  //   }
  // }

const highlightActiveMenu = () => {
  const items = document.querySelectorAll("#side-menu a");
  items.forEach((item) => {
    item.classList.remove("active");
    const parent = item.parentElement;
    if (parent) parent.classList.remove("mm-active");
  });

  // Only match routes beyond just the module root
  const matchingMenuItem = Array.from(items).find(
    (item) =>
      item.pathname === location.pathname &&
      !/^\/module\/[^/]+$/.test(item.pathname) // Avoid pure /module/memberMgmnt
  );

  if (matchingMenuItem) {
    activateParentDropdown(matchingMenuItem);
  }
};



  const activateParentDropdown = (item) => {
    item.classList.add("active")
    let parent = item.parentElement

    while (parent) {
      if (parent.tagName === "LI") {
        parent.classList.add("mm-active")
        const childUl = parent.querySelector("ul")
        if (childUl) {
          childUl.style.display = "block"
        }
      }
      parent = parent.parentElement
    }
  }

  const toggleMenuItem = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const renderMenuItems = (items, parentId) => {
    return items.map((item, index) => (
      <li key={`${parentId}-${index}`}>
        {/* <Link to={`/module/${currentModule}/${item.id}`}>
          <span>{item.formName}</span>
        </Link> */}
        <Link
          to={`/module/${currentModule}/${item.id}`}
          className={location.pathname === `/module/${currentModule}/${item.id}` ? "active" : ""}
        >
          <span>{item.formName}</span>
        </Link>

      </li>
    ))
  }

  const renderMenuGroup = (group, id, type) => {
    const groupId = `${type}-${id}`
    const isExpanded = expandedItems[groupId]
    return (
      <li key={groupId} id={groupId}>
        <Link to="#" onClick={() => toggleMenuItem(groupId)} style={{display:'flex', justifyContent:"space-between"}}>
          {/* <i className="ri-account-circle-line"></i> */}
          <span className="ms-1">{group.formName}</span>
          {group.item && (isExpanded ? <RiArrowDownSLine className="menu-arrow" /> : <RiArrowRightSLine className="menu-arrow" />)}
        </Link>
        {isExpanded && group.item && <ul className="sub-menu">{renderMenuItems(group.item, groupId)}</ul>}
      </li>
    )
  }

  function handleOpenModal(e, modalType){
    e.preventDefault()
    //console.log('Opening modal:', modalType);  // Debugging line
    toggleModal()
    setClickedModal(modalType)
  }

  return (
    <React.Fragment>
      <div id="sidebar-menu">
        <ul className="list-unstyled metismenu" id="side-menu">
          <li className="menu-title">Dashboard</li>
          <li>
            <Link to="/">
              <RiHome2Line className="icon" />
              <span className="ms-1">Home</span>
            </Link>
          </li>

          <li className="menu-title">ERP</li>
          {/* <li>
            <Link to={'/erp'}>
              <MdOutlineDashboard className="icon"/>
              <span className="ms-1">Launch ERP</span>
            </Link>
          </li> */}
         <li className={location.pathname === "/erp" ? "mm-active" : ""}>
          <Link to="/erp">
            <MdOutlineDashboard className="icon" />
            <span className="ms-1">Launch ERP</span>
          </Link>
        </li>

          {
            location.pathname =='/erp' && 
            <>
              <li>
                <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeFinYear)}>
                  <SlCalender className="icon"/>
                  <span className="ms-1">Change Financial Year</span>
                </Link>
              </li>
              <li>
                <Link to="#" onClick={(e) => handleOpenModal(e, modalType.changeDiv)}>
                  <RiBuilding2Line className="icon" />
                  <span className="ms-1">Change Division</span>
                </Link>
              </li>
            </>
          }
          {currentModule && (
            <>
              <li className="menu-title">Forms</li>
              {currentModuleMenu
                .filter((menu) => menu.name === "Form" || !menu.name)
                .map((formGroup, index) =>
                  formGroup.item
                    ? renderMenuGroup(formGroup, formGroup.id, "form")
                    : renderMenuItems([formGroup], `form-${index}`),
                )}

              <li className="menu-title">Reports</li>
              {currentModuleMenu
                .filter((menu) => menu.name === "Report")
                .map((reportGroup, index) => renderMenuGroup(reportGroup, index, "report"))}
            </>
          )}

          {
            isModalOpen &&  clickedModal=='changeFinYear' && <ChangeFinYear isModalOpen={isModalOpen} toggleModal={toggleModal}/>
          }
          {
            isModalOpen &&  clickedModal=='changeDiv' && <ChangeDivision isModalOpen={isModalOpen} toggleModal={toggleModal}/>
          }


        </ul>
      </div>
    </React.Fragment>
  )
}

export default SidebarContent


