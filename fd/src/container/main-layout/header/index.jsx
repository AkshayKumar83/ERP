import React from "react";
import { Link } from "react-router-dom";
import brandLogo from "../../../assets/images/logo-lg.png";
import Profile from "./profile";
import { useSelector } from "react-redux";


const Header = ({ currentPage }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const division = isAuthenticated ? user?.global_division_name : "";
    const financialYear = isAuthenticated ? Number(user?.global_fin_year):''
    const isHomePage = currentPage != 'Home'
    
    function getCurrDate() {
      const date = new Date();
      
      // Format options
      const options = { weekday: "long", month: "long", day: "2-digit", year: "numeric" };
  
      // Format the date
      const formattedDate = date.toLocaleDateString("en-US", options);
  
      return formattedDate;
  }
  
  return (
    <React.Fragment>
      <header className="header-wrapper">
        <div className="header ">
          <div className="d-flex">
            <div className="navbar-logo-wrapper">
              <Link to="#" className="logo">
                <img src={brandLogo} alt="" height="38" />
              </Link>
            </div>
            {currentPage && <h5 className="form-title h-v-center mb-0 ms-4" style={{fontSize:'16px'}}>{currentPage}</h5>}
          </div>
            <div className="d-flex  gap-3">
              <span className="" style={{fontSize:'13px', fontWeight:'bold', letterSpacing:'1px'}}>{isHomePage && division}</span>
              <span style={{fontSize:'13px', letterSpacing:'1px'}}>
                { isHomePage && financialYear && `[${financialYear} - ${financialYear+1}]`}
              </span>
            </div>
          <div className="d-flex">
            <div className=" px-2 d-flex" >
              <span style={{fontSize:'13px', color:'red', fontWeight:'500', display:'flex', justifyContent:'center', alignItems:'center'
              }}>
                {getCurrDate()}
              </span>
            </div>
            <Profile />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;


