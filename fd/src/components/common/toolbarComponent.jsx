
// import ButtonUi from "../basic/button";
// import {
//   RiClipboardFill,
//   RiFileCopy2Line,
//   RiPlayMiniFill,
//   RiPlayReverseMiniFill,
//   RiPrinterFill,
//   RiScissorsLine,
//   RiSkipBackMiniFill,
//   RiSkipForwardMiniFill,
// } from "@remixicon/react";
// import editIcon from "../../assets/svg/edit.svg";
// import insertIcon from "../../assets/svg/insert-row.svg";
// import deleteIcon from "../../assets/svg/delete-row.svg";
// import queryFillIcon from "../../assets/svg/query-fill.svg";
// import querySearchIcon from "../../assets/svg/menu-search-line.svg";
// import { useToolbarLogic } from "./toolbarLogic";
// import { useFormStatus } from "../../hooks/useFormStatus";
// import { PiStampBold } from "react-icons/pi";
// import { FaRegPaste } from "react-icons/fa6";

// const ToolbarComponent = ({
//   handleOperation = () => {},
//   formStatus,
//   QUERY_API,
//   currentRecordNo,
//   handleOffset,
//   totalRecordCount,
//   setupQueryData,
//   handleCancel,
//   setLoading = () => {},
//   formName = "FORM_NAME",
//   isQueryReqOnNextPreBtn = true,
//   isQueryReqOnInsertBtn = false,
//   queryDataOnpage = 0,
//   pageCount = 0,
//   whereClauseForQuery = {},
//   searchRecordApi = "",
//   formPayload,
//   formData = {},
//   authority = { query: "Y", insert: "Y", update: "Y", message: "" },
//   handlePrint = () => {},
//   setSearchQuery = () => {},
//   handleAuthorised = () => {},
//   handleAuthRecord = () => {},
//   btnEnableDtl = {
//     insert: true,
//     query: true,
//     search: true,
//     print: true,
//     update: true,
//     delete: true,
//     authorization: true,
//   },
// }) => {
//   const { searchQuery } = useFormStatus();

//   const {
//     isFocused,
//     activeButton,
//     queryDataRequiredOnInsert,
//     handleUpdate,
//     fetchData,
//     handleFocus,
//     handleBlur,
//     handleQueryMode,
//     handleExist,
//     handleSearchQuery,
//     user,
//   } = useToolbarLogic({
//     handleOperation,
//     formStatus,
//     QUERY_API,
//     currentRecordNo,
//     handleOffset,
//     totalRecordCount,
//     setupQueryData,
//     handleCancel,
//     setLoading,
//     formName,
//     isQueryReqOnNextPreBtn,
//     isQueryReqOnInsertBtn,
//     queryDataOnpage,
//     pageCount,
//     whereClauseForQuery,
//     searchRecordApi,
//     formPayload,
//     formData,
//     authority,
//   });

//   return (
//     <div className="toolbar">
//       <ButtonUi
//         color="light"
//         className="d-flex align-items-center gap-1"
//         disabled={formStatus === "" || formStatus === "Query" ? false : true}
//         title="Query"
//         iconPos="before"
//         onClick={() => {
//           setSearchQuery({});
//           handleQueryMode();
//         }}
//         icon={<img src={queryFillIcon} style={{ height: "18px", width: "18px" }} />}
//       >
//         <span>Query</span>
//       </ButtonUi>
//       <ButtonUi
//         color="light"
//         className="d-flex align-items-center gap-1"
//         disabled={ formStatus === "" || formStatus === "Query" || formStatus === "Search" ? false : true}
//         iconPos="before"
//         onClick={() => {
//           setSearchQuery({});
//           handleSearchQuery();
//         }}
//         icon={<img src={querySearchIcon} style={{ height: "18px", width: "18px" }}/>}
//       >
//         <span>Search</span>
//       </ButtonUi>
//       <ButtonUi
//         color="light"
//         className="d-flex align-items-center gap-1"
//         disabled={formStatus === "" ? true : false}
//         icon={
//           <>
//             {/* <span className="spinner-border spinner-border-sm me-1" role="status" /> */}
//             <RiPrinterFill />
//           </>
//         }
//         title="Print"
//         onClick={handlePrint}
//         iconPos="before"
//       >
//         {" "}
//         <span>Print</span>
//       </ButtonUi>
//       <div className="v-separator"></div>
//       <div className="toolbar-split">
//         <ButtonUi
//           color="light"
//           className="d-flex align-items-center gap-1"
//           disabled={ formStatus === "" || formStatus === "Insert" || formStatus === "Query" ? false : true}
//           onClick={() => queryDataRequiredOnInsert("Insert")}
//           icon={<img src={insertIcon} style={{ height: "18px", width: "18px" }} />}
//           iconPos="before"
//         >
//           <span>Insert</span>
//         </ButtonUi>
//         <ButtonUi
//           color="light"
//           className="d-flex align-items-center gap-1 "
//           disabled={formStatus === "Query" || formStatus === "" ? false : true}
//           onClick={() => handleUpdate("Update")}
//           icon={<img src={editIcon} style={{ height: "18px", width: "18px" }} />}
//           title="Update"
//           iconPos="before"
//         >
//           <span>Update</span>
//         </ButtonUi>
//         <ButtonUi
//           color="light"
//           className="d-flex align-items-center gap-1"
//           disabled={formStatus === "" ? false : true}
//           icon={
//             <img src={deleteIcon} style={{ height: "18px", width: "18px" }} />
//           }
//           title="Delete"
//           iconPos="before"
//         >
//           <span>Delete</span>
//         </ButtonUi>
//       </div>
//       <div className="v-separator"></div>
//       <ButtonUi
//         color="light"
//         className="btn-toolbar"
//         disabled={formStatus !== "Query"}
//         icon={<PiStampBold style={{ width: "18px", height: "18px" }} />}
//         title="Authorised"
//         onClick={() => handleAuthRecord()}
//       />

//       <div className="v-separator"></div>
//       <div
//         className="toolbar-split"
//         tabIndex={0}
//         onFocus={handleFocus}
//         onBlur={handleBlur}
//       >
//         <ButtonUi
//           color="light"
//           className={`btn-toolbar ${activeButton === "First" ? "active" : ""}`}
//           onClick={() => fetchData("First", searchQuery)}
//           icon={<RiSkipBackMiniFill />}
//           disabled={formStatus != "Query"}
//         />
//         <ButtonUi
//           color="light"
//           className={`btn-toolbar ${activeButton === "Prev" ? "active" : ""}`}
//           onClick={() => fetchData("Prev", searchQuery)}
//           icon={<RiPlayReverseMiniFill />}
//           disabled={formStatus != "Query"}
//         />
//         <ButtonUi
//           color="light"
//           className={`btn-toolbar ${activeButton === "Next" ? "active" : ""}`}
//           onClick={() => fetchData("Next", searchQuery)}
//           icon={<RiPlayMiniFill />}
//           disabled={formStatus != "Query"}
//         />
//         <ButtonUi
//           color="light"
//           className={`btn-toolbar ${activeButton === "Last" ? "active" : ""}`}
//           onClick={() => fetchData("Last", searchQuery)}
//           icon={<RiSkipForwardMiniFill />}
//           disabled={formStatus != "Query"}
//         />
//       </div>
//       <div className="toolbar-split">
//         <ButtonUi
//           color="light"
//           className="btn-toolbar"
//           disabled={formStatus === "" || formStatus === "Query" ? false : true}
//           onClick={handleExist}
//         >
//           Exit
//         </ButtonUi>
//       </div>
//     </div>
//   );
// };

// export default ToolbarComponent;



// below code is updated on 18-07-2025 and commented the above code

import ButtonUi from "../basic/button";
import {
  RiClipboardFill,
  RiFileCopy2Line,
  RiPlayMiniFill,
  RiPlayReverseMiniFill,
  RiPrinterFill,
  RiScissorsLine,
  RiSkipBackMiniFill,
  RiSkipForwardMiniFill,
} from "@remixicon/react";
import editIcon from "../../assets/svg/edit.svg";
import insertIcon from "../../assets/svg/insert-row.svg";
import deleteIcon from "../../assets/svg/delete-row.svg";
import queryFillIcon from "../../assets/svg/query-fill.svg";
import querySearchIcon from "../../assets/svg/menu-search-line.svg";
import { useToolbarLogic } from "./toolbarLogic";
import { useFormStatus } from "../../hooks/useFormStatus";
import { PiStampBold } from "react-icons/pi";
import { FaRegPaste } from "react-icons/fa6";

const ToolbarComponent = ({
  handleOperation = () => {},
  formStatus,
  QUERY_API,
  currentRecordNo,
  handleOffset,
  totalRecordCount,
  setupQueryData,
  handleCancel,
  setLoading = () => {},
  formName = "FORM_NAME",
  isQueryReqOnNextPreBtn = true,
  isQueryReqOnInsertBtn = false,
  queryDataOnpage = 0,
  pageCount = 0,
  whereClauseForQuery = {},
  searchRecordApi = "",
  formPayload,
  formData = {},
  authority = { query: "Y", insert: "Y", update: "Y", message: "" },
  handlePrint = () => {},
  setSearchQuery = () => {},
  handleAuthorised = () => {},
  handleAuthRecord = () => {},
  btnEnableDtl: btnEnableDtlProp,
  reqCurrentQueryRecOnInsert = false,
}) => {
  const defaultBtnEnableDtl = {
    insert: true,
    query: true,
    search: true,
    print: true,
    update: true,
    delete: true,
    authorization: true,
  };

  const btnEnableDtl = { ...defaultBtnEnableDtl, ...btnEnableDtlProp };

  const { searchQuery } = useFormStatus();

  const {
    isFocused,
    activeButton,
    queryDataRequiredOnInsert,
    handleUpdate,
    fetchData,
    handleFocus,
    handleBlur,
    handleQueryMode,
    handleExist,
    handleSearchQuery,
    user,
  } = useToolbarLogic({
    handleOperation,
    formStatus,
    QUERY_API,
    currentRecordNo,
    handleOffset,
    totalRecordCount,
    setupQueryData,
    handleCancel,
    setLoading,
    formName,
    isQueryReqOnNextPreBtn,
    isQueryReqOnInsertBtn,
    queryDataOnpage,
    pageCount,
    whereClauseForQuery,
    searchRecordApi,
    formPayload,
    formData,
    authority,
  });

  return (
    <div className="toolbar">
      <ButtonUi
        color="light"
        className="d-flex align-items-center gap-1"
        disabled={(formStatus !== "" && formStatus !== "Query") || !btnEnableDtl.query}
        title="Query"
        iconPos="before"
        onClick={() => {
          setSearchQuery({});
          handleQueryMode();
        }}
        icon={<img src={queryFillIcon} style={{ height: "18px", width: "18px" }} />}
      >
        <span>Query</span>
      </ButtonUi>

      <ButtonUi
        color="light"
        className="d-flex align-items-center gap-1"
        disabled={!(formStatus === "" || formStatus === "Query" || formStatus === "Search") || !btnEnableDtl.search}
        iconPos="before"
        onClick={() => {
          setSearchQuery({});
          handleSearchQuery();
        }}
        icon={<img src={querySearchIcon} style={{ height: "18px", width: "18px" }} />}
      >
        <span>Search</span>
      </ButtonUi>

      <ButtonUi
        color="light"
        className="d-flex align-items-center gap-1"
        disabled={formStatus != 'Query' || !btnEnableDtl.print}
        icon={
          <>
          {/* <span className="spinner-border spinner-border-sm me-1" role="status" /> */}
            <RiPrinterFill />
          </>
        }
        title="Print"
        onClick={handlePrint}
        iconPos="before"
      >
        <span>Print</span>
      </ButtonUi>

      <div className="v-separator"></div>

      <div className="toolbar-split">
        <ButtonUi
          color="light"
          className="d-flex align-items-center gap-1"
          disabled={!(formStatus === "" || formStatus === "Insert" || formStatus === "Query") || !btnEnableDtl.insert}
          onClick={() => queryDataRequiredOnInsert("Insert", reqCurrentQueryRecOnInsert)}
          icon={<img src={insertIcon} style={{ height: "18px", width: "18px" }} />}
          iconPos="before"
        >
          <span>Insert</span>
        </ButtonUi>

        <ButtonUi
          color="light"
          className="d-flex align-items-center gap-1"
          disabled={(formStatus != "Query" || formStatus === "") || !btnEnableDtl.update}
          onClick={() => handleUpdate("Update")}
          icon={<img src={editIcon} style={{ height: "18px", width: "18px" }} />}
          title="Update"
          iconPos="before"
        >
          <span>Update</span>
        </ButtonUi>

        <ButtonUi
          color="light"
          className="d-flex align-items-center gap-1"
          disabled={formStatus === "" || !btnEnableDtl.delete}
          icon={<img src={deleteIcon} style={{ height: "18px", width: "18px" }} />}
          title="Delete"
          iconPos="before"
        >
          <span>Delete</span>
        </ButtonUi>
      </div>

      <div className="v-separator"></div>

      <ButtonUi
        color="light"
        className="btn-toolbar"
        disabled={formStatus !== "Query" || !btnEnableDtl.authorization}
        icon={<PiStampBold style={{ width: "18px", height: "18px" }} />}
        title="Authorised"
        onClick={() => handleAuthRecord()}
      />

      <div className="v-separator"></div>

      <div
        className="toolbar-split"
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <ButtonUi
          color="light"
          className={`btn-toolbar ${activeButton === "First" ? "active" : ""}`}
          onClick={() => fetchData("First", searchQuery)}
          icon={<RiSkipBackMiniFill />}
          disabled={formStatus !== "Query"}
        />
        <ButtonUi
          color="light"
          className={`btn-toolbar ${activeButton === "Prev" ? "active" : ""}`}
          onClick={() => fetchData("Prev", searchQuery)}
          icon={<RiPlayReverseMiniFill />}
          disabled={formStatus !== "Query"}
        />
        <ButtonUi
          color="light"
          className={`btn-toolbar ${activeButton === "Next" ? "active" : ""}`}
          onClick={() => fetchData("Next", searchQuery)}
          icon={<RiPlayMiniFill />}
          disabled={formStatus !== "Query"}
        />
        <ButtonUi
          color="light"
          className={`btn-toolbar ${activeButton === "Last" ? "active" : ""}`}
          onClick={() => fetchData("Last", searchQuery)}
          icon={<RiSkipForwardMiniFill />}
          disabled={formStatus !== "Query"}
        />
      </div>

      <div className="toolbar-split">
        <ButtonUi
          color="light"
          className="btn-toolbar"
          disabled={formStatus === "Insert" || formStatus === "Update"}
          onClick={handleExist}
        >
          Exit
        </ButtonUi>
      </div>
    </div>
  );
};

export default ToolbarComponent;
