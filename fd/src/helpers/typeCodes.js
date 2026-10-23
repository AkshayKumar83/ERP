const routeToPageName = {
  "/": "Home",
  "/erp": "ERP",
  "/module/memberMgmnt": "Member Management",
  "/module/memberMgmnt/10101": "Dealer Upload",
  "/module/memberMgmnt/10102": "Member Onboarding",
  "/module/memberMgmnt/10103": "Upload Updated Member Detail",
  "/module/memberMgmnt/10201": "EMFA Types",
  "/module/memberMgmnt/10202": "EMFA Disbursal",
  "/module/memberMgmnt/10203": "EMFA Receipt",
  "/module/memberMgmnt/10205": "Vehicle Detail",
  "/module/memberMgmnt/10206": "Emfa Eligibility",

  // ****** Member / Report
  "/module/memberMgmnt/10301": "All Member",
  "/module/memberMgmnt/10302": "All Dealer",
  "/module/memberMgmnt/10303": "Pan Card Wise TDS",
  "/module/memberMgmnt/10304": "EMFA Status View",
  "/module/memberMgmnt/10305": "EMI Overdue Ageing",
  "/module/memberMgmnt/10306": "EMFA Ledger All Member",
  "/module/memberMgmnt/10307": "Invoice Generation & Bulk Mail",
  // "/module/memberMgmnt/10308": "All Member React Report",
  "/module/memberMgmnt/10308": "Emfa Status All Members",

  // **** Sales / MASTERS
  "/module/saleMgmnt/20101": "Product Master",
  "/module/saleMgmnt/20102": "Customer Master",
  "/module/saleMgmnt/20103": "Price List",
  "/module/saleMgmnt/20104": "Payment Term",
  "/module/saleMgmnt/20105": "Product Category",
  "/module/saleMgmnt/20106": "Customer Rate Master",

  // **** Sales / SALES ORDER PROCESSING
  "/module/saleMgmnt/20201": "Sales Order",
  "/module/saleMgmnt/20202": "Service Order",
  "/module/saleMgmnt/20203": "Scrap Order",

  // **** Sales / INVOICING
  "/module/saleMgmnt/20301": "Normal Invoicing",
  "/module/saleMgmnt/20302": "Scrap Invoicing",
  "/module/saleMgmnt/20303": "Invoice",
  "/module/saleMgmnt/20304": "Sales Return",
  "/module/saleMgmnt/20305": "Invoice Category",
  "/module/saleMgmnt/20306": "Bulk Invoice Upload",

  // **** Sales / Report
  "/module/saleMgmnt/20401": "Sales By State",
  "/module/saleMgmnt/20402": "Sales By Customer",
  "/module/saleMgmnt/20403": "Invoice Summary",
  "/module/saleMgmnt/20404": "Item-wise HSN Report",
  "/module/saleMgmnt/20406": "Sale Return",

  // **** Inventory / MASTERS
  "/module/whMgmnt/30101": "Unit Master",
  "/module/whMgmnt/30102": "Item Master",
  "/module/whMgmnt/30103": "Unit Conversion Master",
  "/module/whMgmnt/30104": "Item Stock Openining Master",
  "/module/whMgmnt/30105": "Item Opening Rate Master",
  "/module/whMgmnt/30106": "Warehouse Master (Work Center Master)",
  "/module/whMgmnt/30107": "Item Min Max Stock Level",
  "/module/whMgmnt/30108": "Item Code Category Classification",
  "/module/whMgmnt/30110": "Bin Kard",
  "/module/whMgmnt/30111": "Transaction Master",
  "/module/whMgmnt/30112": "Item Location Master",
  "/module/whMgmnt/30115": "Physical Inventory",
  "/module/whMgmnt/30113": "Update Physical Inventory",
  "/module/whMgmnt/30114": "Upload Physical Inventory",
  "/module/whMgmnt/30119": "Bill of Material",
  "/module/whMgmnt/30116": "Routing Maintenance",
  "/module/whMgmnt/30117": "Define Operation",
  "/module/whMgmnt/30118": "Copy Routing",

  // **** Inventory / REPORTS
  "/module/whMgmnt/30201": "Material Acceptance",
  "/module/whMgmnt/30202": "Material Issue Printing",
  "/module/whMgmnt/30203": "Incoming Material Detail",
  "/module/whMgmnt/30204": "Item Master Listing",
  "/module/whMgmnt/30205": "Item Stock Ledger",
  "/module/whMgmnt/30207": "Item Issue To",

  // **** Financial Management / MASTERS
  "/module/financeMgmnt/40101": "GL Rollup Master",
  // "/module/financeMgmnt/40102": "Chart of Accounts",
  "/module/financeMgmnt/40102": "Item Wise Account Entry",
  "/module/financeMgmnt/40103": "Standard Remarks",
  "/module/financeMgmnt/40104": "State Wise GST Master",
  "/module/financeMgmnt/40105": "Account Code for GST",
  "/module/financeMgmnt/40106": "Year Opening for Bank Reco",
  "/module/financeMgmnt/40107": "Bank Details",
  "/module/financeMgmnt/40108": "Bank Reco Statement Upload",
  "/module/financeMgmnt/40109": "GL Master",
  "/module/financeMgmnt/40110": "Bulk Upload Bills",
   "/module/financeMgmnt/40111": "Uploaded Document Tracker",
    "/module/financeMgmnt/40112": "Dealer Subsidy Account Master",
   "/module/financeMgmnt/40113": "GL Rollup BSPL",



  // **** Financial Management / ACCOUNTS PAYABLES
  "/module/financeMgmnt/40201": "AP Bill Entry",
  "/module/financeMgmnt/40202": "Expense Voucher",
  "/module/financeMgmnt/40203": "Block Payment Option",
  "/module/financeMgmnt/40204": "Account Wise TDS Master",
  "/module/financeMgmnt/40205": "Vendor TDS Declaration",
  "/module/financeMgmnt/40206": "Payment Advice",
  "/module/financeMgmnt/40207": "Purchase Voucher Query",
  "/module/financeMgmnt/40211": "Purchase Voucher",
  "/module/financeMgmnt/40208": "Unlink AP Bill",
  "/module/financeMgmnt/40209": "Account Code For Purchase Voucher",
  "/module/financeMgmnt/40210": "Purchase Category Definition",

  // **** Financial Management / ACCOUNTS RECEIVABLES
  "/module/financeMgmnt/40301": "Outstanding Payments",
  "/module/financeMgmnt/40302": "Payment Received Entry",
  "/module/financeMgmnt/40303": "Customer TDS Declaration",
  "/module/financeMgmnt/40304": "Sale Voucher",

  // **** Financial Management / VOUCHERS
  "/module/financeMgmnt/40401": "Cash Voucher",
  "/module/financeMgmnt/40402": "Bank Voucher",
  "/module/financeMgmnt/40403": "Journal Voucher",
  "/module/financeMgmnt/40404": "Debit Credit Note",
  "/module/financeMgmnt/40405": "GST Debit Credit Note",
  "/module/financeMgmnt/40406": "ITC",
  "/module/financeMgmnt/40407": "Bulk Upload of Vouchers",
  "/module/financeMgmnt/40408": "Reverse Charge Invoice",
  "/module/financeMgmnt/40409": "Bulk Upload Journal Voucher",
  "/module/financeMgmnt/40410": "Bulk Printing",
  "/module/financeMgmnt/40411": "Staging Purchase Voucher ",


  // **** Financial Management / Chart of Accounts
  "/module/financeMgmnt/40501": "Balance Sheet / Profit and Loss",
  "/module/financeMgmnt/40502": "P/L Schd. Mat Consumption",
  "/module/financeMgmnt/40503": "P/L Schd. Mat Consumption closing",
  "/module/financeMgmnt/40504": "Balance Sheet Formulae Detail",
  "/module/financeMgmnt/40505": "Balance Sheet Inv. Account Linkage",
  "/module/financeMgmnt/40506": "Closing Inv. For Balance Sheet",
  "/module/financeMgmnt/40507": "Provision for Balance Sheet",

  // **** Financial Management / General Ledger
  "/module/financeMgmnt/40601": "Voucher Authorisation Lim IT Definition",
  "/module/financeMgmnt/40602": "Voucher Authorisation",
  "/module/financeMgmnt/40603": "Unposting Voucher",
  "/module/financeMgmnt/40604": "Cheque Book Entry",
  "/module/financeMgmnt/40605": "Bank Reco Entry",
  "/module/financeMgmnt/40606": "Bank Reco Updation",
  "/module/financeMgmnt/40607": "Payment Reverse",
  "/module/financeMgmnt/40608": "Account Wise Detail Entry",

  // ****** Finance / Report
  "/module/financeMgmnt/40700": "Reference Voucher No",
  "/module/financeMgmnt/40701": "GSTR-1 and GSTR-3B",
  "/module/financeMgmnt/40702": "Bank Book",
  "/module/financeMgmnt/40703": "Account Ledger",
  "/module/financeMgmnt/40715": "Member Account Ledger",
  "/module/financeMgmnt/40716": "Dealer Credit Report",
  "/module/financeMgmnt/40704": "Bank Reco",
  "/module/financeMgmnt/40705": "Account Ledger Dump",
  "/module/financeMgmnt/40706": "Debtor's Outstanding",
  "/module/financeMgmnt/40707": "Vendor-Wise Outstanding",
  "/module/financeMgmnt/40708": "Customer Receipt",
  "/module/financeMgmnt/40709": "Purchase Voucher Report",
  "/module/financeMgmnt/40710": "Expense Voucher Report",
  "/module/financeMgmnt/40711": "Open GRN Pending For Billing",
  "/module/financeMgmnt/40712": "Purchase Book",
  "/module/financeMgmnt/40713": "Trial Balance",
  "/module/financeMgmnt/40714": "Audit Trial",
  "/module/financeMgmnt/40720": "Pan Card Wise TDS Report",
  "/module/financeMgmnt/40730": "Voucher Report",
  "/module/financeMgmnt/40731": "HSN Wise Purchase Summary",

  // ***** ADMIN / USER
  "/module/adminMgmnt/user_master": "User Master",
  "/module/adminMgmnt/50101": "User Master", // Remove this after developing  user master form
  "/module/adminMgmnt/50102": "User Activity",
  "/module/adminMgmnt/50103": "Dashboard User Rights",
  "/module/adminMgmnt/50104": "Dashboard Link Rights",
  "/module/adminMgmnt/50105": "Change Password",
  "/module/adminMgmnt/50106": "User Grant Transfer",
  "/module/adminMgmnt/50107": "User Creation",

  // **** ADMIN / FINANCIAL YEAR
  "/module/adminMgmnt/50201": "Financial Year Opening Updation",
  "/module/adminMgmnt/50202": "Financial Year Open Period",

  // **** ADMIN / PARAMETERS
  "/module/adminMgmnt/50301": "General Perameters",
  "/module/adminMgmnt/50302": "Division Wise Parameters",
  "/module/adminMgmnt/50303": "Ageing Parameters",
  "/module/adminMgmnt/50304": "Tax Parameters Master",

  // **** ADMIN / SECTIONS
  "/module/adminMgmnt/50401": "Finance Section",
  "/module/adminMgmnt/50402": "User Wise Section",

  // **** ADMIN / GENERAL MASTER
  "/module/adminMgmnt/50501": "Code Definition",
  "/module/adminMgmnt/50502": "Division Master",
  "/module/adminMgmnt/50503": "Currency Master",
  "/module/adminMgmnt/50504": "Email Description",
  "/module/adminMgmnt/50505": "Email Alert Master",
  "/module/adminMgmnt/50506": "Calendar",
  "/module/adminMgmnt/50507": "State Wise Master",

   // **** ADMIN / Send Notify
   "/module/adminMgmnt/50601": "Send Email Notification",

  // **** Material / MASTERS
  "/module/materialMgmnt/60101": "Supplier Master",
  "/module/materialMgmnt/60102": "PO Category",
  "/module/materialMgmnt/60103": "Payment Term",
  "/module/materialMgmnt/60106": "Gate Entry",
  "/module/materialMgmnt/60110": "RMGP",
  "/module/materialMgmnt/60111": "Purchase Order",
  "/module/materialMgmnt/60112": "Stock Adjustment Batch",
  "/module/materialMgmnt/60113": "Wor Internal",
  "/module/materialMgmnt/60114": "Rate Master",
  "/module/materialMgmnt/60115": "Bulk Po Creation",
  "/module/materialMgmnt/60116": "Item Wise Dealer Subsidy",
  "/module/materialMgmnt/60117": "NRGP",
  "/module/materialMgmnt/60118": "Pending PO Authorization",
   "/module/materialMgmnt/60119": "Update Purchase Order",
    "/module/materialMgmnt/60120": "PO Closure",

  // **** Material / QUALITY
  "/module/materialMgmnt/70101": "Inter Transfer Memo",
  "/module/materialMgmnt/70102": "Incoming Quality Inspection",
  "/module/materialMgmnt/70103": "Material Issue",

  // **** Material / Reports
  "/module/materialMgmnt/60201": "Vendor Master",
  "/module/materialMgmnt/60202": "Vendor-Wise Item Purchase",
  "/module/materialMgmnt/60203": "Vendor-wise Total Purchase",
  "/module/materialMgmnt/60204": "Daily Material Receipt",
  "/module/materialMgmnt/60205": "Monthly Purchase Summary",
  "/module/materialMgmnt/60206": "PO Dump",

  // *** Modules ***
  "/module/materialMgmnt": "Purchase Management",
  "/module/saleMgmnt": "Sale Management",
  "/module/adminMgmnt": "Admin Management",
  "/module/financeMgmnt": "Finance Management",
  "/module/whMgmnt": "WH Management",
  "/module/hrMgmnt": "HR Management",

  // **** Human Resource / Master
  "/module/hrMgmnt/80101": "Department Master",
  "/module/hrMgmnt/80102": "Grade And Category",
  "/module/hrMgmnt/80103": "Grade",
  "module/hrMgmnt/80104": "Contractor Master",
  "module/hrMgmnt/80105": "Daily Bulletin",
  "module/hrMgmnt/80106": "Increaments",

  // ** temp
  "/payment-advice": "Payment Advice Form with pills navigation",
  "/payment-advice-tabs": "Payment Advice Form with tabs navigation",
  "/membership": "Membership Form with pills navigation",
  "/membership-tabs": "Membership Advice Form with tabs navigation",
  "/module/financeMgmnt/40700": "Reference Voucher Printing",
};


export { routeToPageName };
