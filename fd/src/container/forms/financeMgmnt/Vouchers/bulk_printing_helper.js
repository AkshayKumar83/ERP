export const TABLE_CONFIG = {
  V: {
    headers: [
      { label: "Voucher No", width: "20px" },
      { label: "Voucher Date", width: "20px" },
      { label: "Authorized", width: "20px" },
      { label: "Trans Amount", width: "20px" },
      { label: "Print", width: "10px" },
    ],
    fields: [
      { name: "voucher_no", type: "text" },
      { name: "voucher_dt", type: "date" },
      { name: "posted", type: "text" },
      { name: "trans_amt", type: "number" },
    ],
  },

  I: {
    headers: [
      { label: "Invoice No", width: "20px" },
      { label: "Invoice Date", width: "20px" },
      { label: "Authorized", width: "20px" },
      { label: "Net Amount", width: "20px" },
      { label: "Print", width: "10px" },
    ],
    fields: [
      { name: "inv_no", type: "text" },
      { name: "inv_dt", type: "date" },
      { name: "auth_flag", type: "text" },
      { name: "net_amt", type: "number" },
    ],
  },

  P: {
    headers: [
      { label: "PO No", width: "20%" },
      { label: "PO Date", width: "10%" },
      { label: "Authorized", width: "20%" },
      { label: "Total Amount", width: "15%" },
      { label: "Print", width: "10%" },
    ],
    fields: [
      { name: "po_no", type: "text" },
      { name: "po_date", type: "date" },
      { name: "flag", type: "text" },
      { name: "total_amount", type: "number" },
    ],
  },
};


 export const RANGE_LABEL_CONFIG = {
  V: "Voucher No",
  I: "Invoice No",
  P: "PO No",
};

 export const RADIO_CONFIG = {
  V: {
    name: "Voucher",
    options: [
      { text: "Bank Voucher", value: "B" },
      // { text: "Purchase Voucher", value: "P" },
      // { text: "Expense Voucher", value: "P0" },
      { text: "Purchase / Expense Voucher", value: "PE" },
      { text: "Sale Voucher", value: "S" },
      { text: "Journal Voucher", value: "J" },
      { text: "Cash Voucher", value: "C" },
    ],
  },
  I: {
    name: "Invoice",
    options: [
      { text: "Good Invoice", value: "G" },
      { text: "Service Invoice", value: "S" },
    ],
  },
  P: {
    name: "PO",
    options: [
       { text: "PO", value: "P" },
    ],
  },
};


export const HELP_LIST_CONFIG = {
  V: {
    B: [{ label: "Bank Voucher No From", key: "voucher_no" }],
    S: [{ label: "Sale Voucher No From", key: "voucher_no" }],
    // P: [{ label: "Purchase Voucher No From", key: "voucher_no" }],
    // P0: [{ label: "Expense Voucher No From", key: "voucher_no" }],
    PE: [ { label: "Purchase / Expense Voucher No From", key: "voucher_no", },],
    C: [{ label: "Cash Voucher No From", key: "voucher_no" }],
    J: [{ label: "Journal Voucher No From", key: "voucher_no" }],
  },


  I: {
    G: [{ label: "Good Invoice No From", key: "inv_no" }],
    S: [{ label: "Service Invoice No From", key: "inv_no" }],
  },

  P: {
    P: [{ label: "PO No From", key: "po_no" }],
  },
};
 
