export const headers=[

    { label: "Seq.", width:"70px" ,},
    { label: "Parent Item Code", width:"200px" ,},
    { label: "Child Item Code", width:"200px" },
    { label: "Description", width:"250px", },
    { label: "UOM", width:"100px" ,},
    { label: "Usage", width:"100px" },
    { label: "Rej px", width:"100px", },
    { label: "Active", width:"10px" ,},
    { label: "Remarks", width:"200px" ,},
    { label: "Drawing No.", width:"100px" ,},
    { label: "Overheads", width:"100px" ,},
    { label: "Labourcost", width:"100px" ,},
    { label: "FMP", width:"2px" ,},
    { label: "Inc. MRP", width:"2px" ,},

]
 export const BOMDataHeader={
 row_status:"",
 par_it_cd:  "",
 par_desc:"",
 par_uom: "",
 flag:"",
 par_remarks:"",
 par_it_cd_copy:"",
 par_desc_copy:"",
 drawing_no:"",
 }

 export const BOMDataDetails = {
  row_status: "",
  seq_no: "",
  assembly_no: "",
  par_it_cd: "",
  chl_it_cd: "",
  child_uom: "",
  child_desc: "",
  usage: "",
  rej_perc: "",
  remarks: "",
  par_remarks: "",
  drawing_no: "",
  overheads: "",
  labourcost: "",
  entry_type: "",
  purchase_flag: "N",
  active: "N",
  flag: '',
  it_fmp_pu: "N",
  mrp_yesno: "N",
  // NEW: For hierarchy (id generated on add, so remove from default)
  parentId: null, // null for top-level
  level: 0, // Indentation level
  expanded: true, // For collapse/expand
  children: [], // Array of child items
};

// Helper to build tree from flat data (if loading from API)

  export const buildTree = (rows, parentCode, level = 0) => {
  return rows
    .filter(r => r.par_it_cd === parentCode)
    .map(r => ({
      ...r,
      level,
      expanded: false,
      children: buildTree(rows, r.chl_it_cd, level + 1)
    }));
};




 export const flattenTree = (nodes, parentItemCode) => {
  let flat = [];

  nodes.forEach((node, index) => {
    const {
      children,
      expanded,
      id,
      parentId,
      ...rest
    } = node;

    const currentParItCd = parentItemCode;

    flat.push({
      ...rest,
      par_it_cd: parentItemCode,   //  REAL PARENT
      chl_it_cd: node.chl_it_cd,
      entry_type: parentItemCode === null ? "P" : "C"
    });

    if (children && children.length > 0) {
      flat = flat.concat(
        flattenTree(children, node.chl_it_cd) // 🔥 NEXT LEVEL PARENT
      );
    }
  });

  return flat;
};

export const findRootParent = (rows) => {
  const parents = new Set(rows.map(r => r.par_it_cd));
  const children = new Set(rows.map(r => r.chl_it_cd));

  for (let p of parents) {
    if (!children.has(p)) {
      return p; //  REAL ROOT ITEM (1ABC)
    }
  }
  return null;
};





