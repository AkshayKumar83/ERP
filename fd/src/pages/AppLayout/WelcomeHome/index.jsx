// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   Card,
//   CardBody,
//   Button,
//   Row,
//   Col,
// } from "reactstrap";
// import {
//   MdRocketLaunch,
//   MdSearch,
//   MdDashboard,
//   MdInventory,
//   MdAttachMoney,
//   MdPeople,
//   MdInsights,
//   MdNotifications,
// } from "react-icons/md";
// import { FaTasks } from "react-icons/fa";
// import logo from "../../../assets/images/Eddal Logo.webp";
// import styles from "./style.module.scss";
// import avatar from "../../../assets/images/avatar.png";

// const modules = [
//   { icon: <MdDashboard />, name: "Dashboard", color: "#4CAF50" },
//   { icon: <MdInventory />, name: "Inventory", color: "#2196F3" },
//   { icon: <MdAttachMoney />, name: "Finance", color: "#FFC107" },
//   { icon: <MdPeople />, name: "HR", color: "#9C27B0" },
//   { icon: <MdInsights />, name: "Analytics", color: "#FF5722" },
//   { icon: <FaTasks />, name: "Projects", color: "#795548" },
// ];


// const WelcomeHome = () => {


//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//    const financialYear = isAuthenticated ? Number(user?.global_fin_year):''




//   return (
//     <div className={styles.welcomeContainer}>
//       <Card className={styles.heroCard}>
//         <CardBody className={styles.heroCardBody}>
//           <div className={styles.logoContainer}>
//             <img src={logo} alt="Eddal" className={styles.logo} />
//             <div className={styles.titleContainer}>
//               <h1 className={styles.heroTitle}>Escorts Dealership Development Association limited</h1>
//               <p className={styles.heroSubtitle}>
//                 Integral Business Enterprise Suite
//               </p>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       <Row className={styles.welcomeContent}>
//           <Col xl={4} md={6} className="">
//             <Card className="p-2 text-center">
//               <h4 className="mb-2">Welcome Dear {user?.username}</h4>
//               <img src={avatar} className="rounded-circle mx-auto d-block" style={{ width: "6rem", height: "6rem" }} alt="Profile Avatar" />
//               <div className="mt-3">
//                 <p className="mb-1 text-muted">You are currently working in</p>
//                 <h5>{user?.global_division_name}</h5>
//               </div>
//               <div className="mt-2">
//                 <p className="mb-1 text-muted">Financial Year</p>
//                 <h5>{financialYear && `${financialYear} - ${financialYear + 1}`}</h5>
//               </div>
//             </Card>
//           </Col>  
//           <Col xl={8}>
//           <Card className="p-2">
//               <Row className={styles.welcomeMessage}>
//                 <h2>Welcome to Integral ERP System</h2>
//                 <p>
//                   Manage all your business modules efficiently in one place with
//                   seamless integration and user-friendly interfaces.
//                 </p>
//               </Row>

//               <Row className={styles.welcomeActions}>
//                 <Col lg={4} sm={4}>
//                 <Button color="primary" size="lg" className={styles.getStartedBtn}>
//                   <Link to={`/erp`}>
//                     <MdRocketLaunch className={styles.buttonIcon} />
//                     <span>Launch ERP</span>
//                   </Link>
//                 </Button>
//                 </Col>
//               </Row>
//           </Card>
//           </Col>
//       </Row>
//       {/* <div className={styles.welcomeContent}>
//         <div className={styles.welcomeMessage}>
//           <h2>Welcome to Integral ERP System</h2>
//           <p>
//             Manage all your business modules efficiently in one place with
//             seamless integration and user-friendly interfaces.
//           </p>
//         </div>

//         <div className={styles.welcomeActions}>
//           <Button color="primary" size="lg" className={styles.getStartedBtn}>
//             <Link to={`/erp`}>
//               <MdRocketLaunch className={styles.buttonIcon} />
//               <span>Launch ERP</span>
//             </Link>
//           </Button>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default WelcomeHome;



import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { Card, CardBody, Button, Row, Col, Container } from "reactstrap"
import { MdRocketLaunch, MdDashboard, MdInventory, MdAttachMoney, MdPeople, MdInsights } from "react-icons/md"
import { FaTasks } from "react-icons/fa"
import logo from "../../../assets/images/Eddal Logo.webp"
import styles from "./style.module.scss"
import avatar from "../../../assets/images/avatar.png"

const modules = [
  { icon: <MdDashboard />, name: "E-Invoicing", color: "#4CAF50" },
  // { icon: <MdInventory />, name: "Inventory", color: "#2196F3" },
  // { icon: <MdAttachMoney />, name: "Finance", color: "#FFC107" },
  // { icon: <MdPeople />, name: "HR", color: "#9C27B0" },
  // { icon: <MdInsights />, name: "Analytics", color: "#FF5722" },
  // { icon: <FaTasks />, name: "Projects", color: "#795548" },
]

const WelcomeHome = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const financialYear = isAuthenticated ? Number(user?.global_fin_year) : ""

  return (
    <Container fluid className={styles.welcomeContainer}>
      <Card className={styles.heroCard}>
        <CardBody className={styles.heroCardBody}>
          <div className={styles.logoContainer}>
            <img src={logo || "/placeholder.svg"} alt="Eddal" className={styles.logo} />
            <div className={styles.titleContainer}>
              <h1 className={styles.heroTitle}>Escorts Dealership Development Association Limited</h1>
              <p className={styles.heroSubtitle}>Integral Business Enterprise Suite</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Row className={styles.contentRow}>
        <Col lg={4} md={12} className="">
          <Card className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <h4>Welcome, {user?.username}</h4>
            </div>
            <div className={styles.profileContent}>
              <div className={styles.avatarWrapper}>
                <img src={avatar || "/placeholder.svg"} className={styles.avatar} alt="Profile Avatar" />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Division</span>
                  <h5 className={styles.infoValue}>{user?.global_division_name}</h5>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Financial Year</span>
                  <h5 className={styles.infoValue}>{financialYear && `${financialYear} - ${financialYear + 1}`}</h5>
                </div>
              </div>
            </div>
          </Card>

        </Col>

        <Col lg={8} md={12}>
          <Card className={styles.welcomeCard}>
            <div className={styles.welcomeHeader}>
              <h2>Welcome to Integral ERP System</h2>
              <div className={styles.welcomeDivider}></div>
              <p>
              Manage all your business modules efficiently in one place with seamless integration and user-friendly interfaces.
              </p>
            </div>
            <div className={styles.welcomeActions}>
              <Button color="primary" size="lg" className={styles.getStartedBtn}>
                <Link to={`/erp`}>
                  <MdRocketLaunch className={styles.buttonIcon} />
                  <span>Launch ERP</span>
                </Link>
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default WelcomeHome




