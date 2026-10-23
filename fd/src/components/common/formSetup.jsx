import { useState, useCallback, useEffect } from "react";
import { Card, CardBody, CardHeader, Container } from "reactstrap";
import ToolbarComponent from "./toolbarComponent";
import SimpleBar from "simplebar-react";
import PillsNavbar from "./pillsNavbar";
import TabsNavbar from "./tabsNavbar";
import Submitbar from "./submitbarComponent";


const FormSetup = ({
  navType,
  tabs,
  activeTab,
  updateActiveTab,
  children,
  formStatus,
  currentRecordNo,
  totalRecordCount,
  pageCount,
  totalPageCount,
  isSingleQuery,
  handleSubmit = () => {},
  handleCancel = () => {},
  handleOperation = () => {},
  QUERY_API,
  formName,
  setLoading = () => {},
  setupQueryData = () => {},
  handleOffset,
  searchQueryPayload = {},
  opterationBtn = [],
  handlePrint = () => {},
  isQueryReqOnInsertBtn = false,
  isQueryReqOnNextPreBtn = true,
  handleSearch = () => {},
  formPayload = {},
  setSearchQuery = () => {},
  authority,
  handleAuthRecord=() => {},
  btnEnableDtl,
  reqCurrentQueryRecOnInsert = false,
  // handleAuthorised = () => {},
}) => {
  const [cacheSearchQueryParam, setCacheSearchQueryParam] = useState("");

  const [cardBodyHeight] = useState(
    navType && navType === "tabs"
      ? "calc(100vh - 190px)"
      : "calc(100vh - 100px)"
  );

  // const [cardBodyHeight] = useState("100vh - 100px")
  const toggleTab = useCallback(
    (tab) => {
      if (activeTab !== tab) {
        if (tab >= 1 && tab <= tabs.length) {
          updateActiveTab(tab);
        }
      }
    },
    [activeTab, tabs.length, updateActiveTab]
  );

  // below useeffect added by akshay

//  useEffect(()=>{

//   const savedTheme = localStorage.getItem("theme") || "light";

//   const wrappers = document.querySelectorAll(".form-wrapper");

//   wrappers.forEach((wrapper)=>{
//     wrapper.classList.add(savedTheme);
//   });

// },[]);


  return (
    // <div className="form-wrapper">
    <div className={`form-wrapper ${localStorage.getItem("theme") || "light"}`}>
      <Container fluid={true}>
        <Card>
          <CardBody>
            {navType && navType === "tabs" ? (
              <TabsNavbar
                tabs={tabs}
                toggleTab={toggleTab}
                activeTab={activeTab}
              />
            ) : (
              <PillsNavbar
                tabs={tabs}
                toggleTab={toggleTab}
                activeTab={activeTab}
              />
            )}
            {/* addby by akshay for given style bg */}
          <Card className="form-card" style={{ background: "#fff3cd" }}>  
              <CardHeader className="form-header">
                <ToolbarComponent
                  handleOperation={handleOperation}
                  formStatus={formStatus}
                  QUERY_API={QUERY_API}
                  formPayload={formPayload}
                  currentRecordNo={currentRecordNo}
                  handleOffset={handleOffset}
                  totalRecordCount={totalRecordCount}
                  setupQueryData={setupQueryData}
                  handleCancel={handleCancel}
                  setLoading={setLoading}
                  formName={formName}
                  handlePrint={handlePrint}
                  isQueryReqOnNextPreBtn={isQueryReqOnNextPreBtn}
                  isQueryReqOnInsertBtn={isQueryReqOnInsertBtn}
                  setSearchQuery={setSearchQuery}
                  // handleAuthorised={handleAuthorised}
                  handleAuthRecord={handleAuthRecord}
                  authority={authority}
                  btnEnableDtl={btnEnableDtl}
                  reqCurrentQueryRecOnInsert={reqCurrentQueryRecOnInsert}
                />
              </CardHeader>
              <SimpleBar
                id="simplebar-container"
                style={{
                  maxHeight: cardBodyHeight,
                  minHeight: cardBodyHeight,
                }}
                forceVisible="y"
                autoHide={false}
              >
                {/* <CardBody className="form-body">{children}</CardBody> */}
        
         {/* // added by akshay form given bg color of formlayput*/}

         {/* #fff9c4   → very light yellow
          #fff3cd   → soft yellow (ERP / alert type)
          #fff8e1   → pale yellow
          #fffacd   → lemon chiffon */}

            {/* #e3f2fd   → very light blue (Material UI style)
                #d6e9ff   → soft blue
                #e7f3ff   → pale sky blue
              #f0f8ff   → alice blue */}

              {/* //f1f3f5 current color apply */}

        <CardBody className="form-body" 
        style={{ background: "#fff3cd" }}>  
          {children}
        </CardBody>

              </SimpleBar>
              <Submitbar
                formStatus={formStatus}
                currentRecordNo={currentRecordNo}
                totalRecordCount={totalRecordCount}
                pageCount={pageCount}
                totalPageCount={totalPageCount}
                isSingleQuery={isSingleQuery}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                handleSearch={handleSearch}
                extraBtn={opterationBtn}
              />
            </Card>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default FormSetup;
