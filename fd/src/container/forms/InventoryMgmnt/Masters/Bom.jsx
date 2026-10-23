

import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import BomTableRow from "./BomtableRow";
import { BOMDataDetails, BOMDataHeader, buildTree, findRootParent, flattenTree } from "./bomHelpers";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const billOfMaterial = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...BOMDataHeader });
  // UPDATED: Initial empty tree - no default row
  const [detailData, setDetailData] = useState([]); 
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  // UPDATED: focusedNodeId for tree focus by ID
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  // NEW: Track selected node for adding child
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  // NEW: Loading state for submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = ["BILL OF MATERIAL"];
  const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

   const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ ...BOMDataHeader });
    setDetailData([]); // Reset to empty
    setSelectedNodeId(null);
    setFocusedNodeId(null);
  }, []);

  // UPDATED: Async handleSubmit with API call
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (!formData.par_it_cd.trim()) {
    toast.error("Parent Item Code is required!");
    return;
  }

  if (detailData.length === 0) {
    toast.error("At least one BOM detail row is required!");
    return;
  }

  //  flattenTree already sets correct par_it_cd
  const flatDetails = flattenTree(detailData, formData.par_it_cd).map(
    ({ children, expanded, ...row }) => ({
      ...row,
      user_id: user?.id || user?.user_id,
    })
  );

  const payload = {
    ...formData,
    details: flatDetails,
    user_id: user?.id || user?.user_id,
  };

  console.log("FINAL BOM PAYLOAD:", payload);

  setIsSubmitting(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BILL_OF_MATERIAL_DATA}?form_status=${formStatus}`,
      {
        method: formStatus === "Insert" ? "POST" : "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    toast.success("BOM data saved successfully!");
    handleCancel();
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsSubmitting(false);
  }
}, [formStatus, detailData, formData, user, isSubmitting, handleCancel]);


  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

 

  // UPDATED: Recursive handleChange for tree, with uppercase for text fields

  const handleChange = useCallback((name, value, nodeId) => {
   if (!["Insert", "Update"].includes(formStatus)) return;

  if (typeof value === "string") {
    value = value.toUpperCase();
  }

  // HEADER fields
  if (!nodeId) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    return;
  }

  // DETAIL rows
  const updateNode = (nodes) =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, [name]: value };
      }
      if (node.children?.length) {
        return { ...node, children: updateNode(node.children) };
      }
      return node;
    });

  setDetailData((prev) => updateNode(prev));
}, [formStatus]);


  // UPDATED: Add row as child of selected, or top-level, and focus on new row
  //  FIXED: Set par_it_cd properly for new rows in Insert/Update (same as Query)
  const triggerAddRow = useCallback((parentId = null) => {
    const newRowId = Date.now() + Math.random();
    let newRow = { ...BOMDataDetails, id: newRowId, parentId };

    if (parentId === null) {
      // Top-level: Use header's par_it_cd as parent
      newRow.par_it_cd = formData.par_it_cd || "";
    } else {
      // Child: Find parent node and set its chl_it_cd as par_it_cd
      const findParentCode = (nodes) => {
        for (let node of nodes) {
          if (node.id === parentId) {
            return node.chl_it_cd || "";
          }
          if (node.children?.length > 0) {
            const found = findParentCode(node.children);
            if (found) return found;
          }
        }
        return "";
      };
      newRow.par_it_cd = findParentCode(detailData);
    }

    if (parentId === null) {
      // Add top-level
      setDetailData((prev) => [...prev, newRow]);
    } else {
      // Add as child recursively
      const addChild = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentId) {
            return { ...node, children: [...node.children, newRow] };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: addChild(node.children) };
          }
          return node;
        });
      };
      setDetailData((prev) => addChild(prev));
    }
    // Focus on new row
    setFocusedNodeId(newRowId);
    setSelectedNodeId(null); // Clear selection after add
  }, [detailData, formData.par_it_cd]);

  // UPDATED: Delete node + subtree
  const handleDelete = useCallback((nodeId) => {
    const deleteNode = (nodes) => {
      return nodes.filter((node) => {
        if (node.id === nodeId) return false;
        if (node.children && node.children.length > 0) {
          node.children = deleteNode(node.children);
        }
        return true;
      });
    };
    setDetailData((prev) => deleteNode(prev));

    if (focusedNodeId === nodeId) {
      setFocusedNodeId(null);
    }
    setSelectedNodeId(null); // Clear selection
  }, [focusedNodeId]);

  // NEW: Toggle expand/collapse
  const toggleExpand = useCallback((nodeId) => {
    const toggle = (nodes) => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    };
    setDetailData((prev) => toggle(prev));
  }, []);

  // NEW: Select node for adding child
  const handleSelectNode = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
  }, []);





// const setupQueryData = useCallback((queryData, btnClicked) => {
//   if (queryData?.type !== "found") return;

//   const rows = queryData.bom;

//   // FIXED: Assign unique IDs to rows before building tree (prevents undefined IDs causing all rows to match focus)
//   const rowsWithIds = rows.map((row, index) => ({
//     ...row,
//     id: `${row.chl_it_cd || 'item'}-${row.seq_no || index}` // Unique combo; fallback to index if seq_no missing
//   }));

//   setFormData({
//     par_it_cd: rows[0].par_it_cd,
//     par_remarks: rows[0].par_remarks || "",
//   });

//   //  YAHI MAIN FIX HAI
//   const treeData = buildTree(rowsWithIds, rows[0].par_it_cd);
//   setDetailData(treeData);

//   // FIXED: Default focus to first row on load
//   setFocusedNodeId(treeData[0]?.id || null);

//   if (btnClicked === "Query") {
//     setTotalRecordCount(queryData.totalCount);
//   }
// }, []);

  // const setupQueryData = useCallback((queryData, btnClicked) => {
  //   if (queryData?.type !== "found") return;

  //   const rows = queryData.bom.map((row, index) => ({
  //     ...row,
  //     id: `${row.par_it_cd}-${row.chl_it_cd}-${index}`,
  //   }));

  //   // HEADER
  //   const rootParItCd = findRootParent(rows);

  //   setFormData({
  //     par_it_cd: rootParItCd,
  //     par_remarks: rows[0]?.par_remarks || "",
  //   });

  //   //  TREE STARTS FROM HEADER'S CHILDREN
  //   const level0Nodes = rows.filter(r => r.par_it_cd === rootParItCd);

  //   const treeData = level0Nodes.map(r => ({
  //     ...r,
  //     level: 0,
  //     expanded: false,
  //     children: buildTree(rows, r.chl_it_cd, 1),
  //   }));

  //   setDetailData(treeData);
  //   setFocusedNodeId(treeData[0]?.id || null);
    
  //  console.log(
  //    treeData.map(n => ({
  //      item: n.chl_it_cd,
  //      level: n.level,
  //      childCount: n.children.length
  //    }))
  //  );
   

  //   if (btnClicked === "Query") {
  //     setTotalRecordCount(queryData.totalCount);
  //   }
  //  }, []);


const setupQueryData = useCallback((queryData, btnClicked) => {
  if (queryData?.type !== "found") return;

  const { parent, bom, totalCount } = queryData;
  setFormData({
    par_it_cd: parent.par_it_cd || "",
    par_desc: parent.par_desc || "",
    par_uom: parent.par_uom || "",
    drawing_no: parent.drawing_no || "",
    par_remarks: parent.par_remarks || "",
  });

  //  BUILD TREE FROM BOM

  const rows = bom.map((row, index) => ({
    ...row,
    id: `${row.par_it_cd}-${row.chl_it_cd}-${index}`,
  }));

  const rootParItCd = parent.par_it_cd;

  const level0Nodes = rows.filter(
    (r) => r.par_it_cd === rootParItCd
  );

  const treeData = level0Nodes.map((r) => ({
    ...r,
    level: 0,
    expanded: false,
    children: buildTree(rows, r.chl_it_cd, 1),
  }));

  setDetailData(treeData);
  setFocusedNodeId(treeData[0]?.id || null);

  if (btnClicked === "Query") {
    setTotalRecordCount(totalCount);
  }
}, []);



  return (
    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={tabs}
        updateActiveTab={updateActiveTab}
        formStatus={formStatus}
        currentRecordNo={currentRecordNo}
        totalRecordCount={totalRecordCount}
        pageCount={1}
        totalPageCount={1}
        isSingleQuery={true}
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_BILL_OF_MATERIAL}
        formName={"Bill of Material"}
        authority={{insert:"N",update:"N"}}
        btnEnableDtl={{ insert:false,update:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
           
              <BomTableRow
                formData={formData}
                setFormData={setFormData}
                detailData={detailData}
                setDetailData={setDetailData}
                handleChange={handleChange}
                formStatus={formStatus}
                triggerAddRow={triggerAddRow}
                handleDelete={handleDelete}
                toggleExpand={toggleExpand}
                handleSelectNode={handleSelectNode}
                selectedNodeId={selectedNodeId}
                focusedNodeId={focusedNodeId}
                setFocusedNodeId={setFocusedNodeId}
              />
          
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default billOfMaterial;