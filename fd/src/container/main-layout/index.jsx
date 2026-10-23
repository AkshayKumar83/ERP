// import React, { useState, useEffect } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Header from "./header";
// import Sidebar from "./sidebar";
// import { routeToPageName } from "../../helpers/typeCodes";

// const MainLayout= () => {
//   const [isMobile, setIsMobile] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
//   }, []);

//   const getPageName = (pathname) => {
//     return routeToPageName[pathname] || "Unknown Page";
//   };

//   const currentPage = getPageName(location.pathname);

//   return (
//     <React.Fragment>
//       <div className="main-wrapper">
//         <Header currentPage={currentPage} />
//         <Sidebar isMobile={isMobile} />
//         <div className="main-content">
//           <Outlet />
//         </div>
//       </div>
//     </React.Fragment>
//   );
// };

// export default MainLayout;



import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./header";
import Sidebar from "./sidebar";
import { routeToPageName } from "../../helpers/typeCodes";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);


  
  const getPageName = (pathname) => routeToPageName[pathname] || "Unknown Page";

  const currentPage = getPageName(location.pathname);

  return (
    <div className="main-wrapper">
      <Header currentPage={currentPage} />
      <Sidebar
        isMobile={isMobile}
        onVisibilityChange={setSidebarVisible}
      />
      <div className={`main-content ${sidebarVisible ? "with-sidebar" : "full-width"}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
