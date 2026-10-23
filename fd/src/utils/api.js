export const APP_PROD_API = {
  REGISTER_URL: `/auth/register`,
  // REGISTER NEW USER

  // LOGIN USER
  LOGIN_URL: "/auth/login",
  GET_EMAIL_OTP: "/auth/get_otp",
  GET_RESET_PSK_OTP_EMAIL: "/auth/reset-psk-otp",
  RESET_NEW_PSK: "/auth/reset-new-psk",

  // LOGOUT
  LOGOUT: "/auth/logout",

  //USER BASED ACCESS/PERMISSION CONTROL
  USER_MODULE_RIGHTS:'/rights/module',
  USER_MENU_RIGHTS:'/rights/menu',
  USER_FORM_RIGHTS:'/rights/form',
  USER_FORM_ACTIVITY_RIGHTS:'/rights/form/activity',

  //APPLICATION LEVEL API ENDPOINTS
  CHECK_OPEN_YEAR_DATE: "/check_opn_yr_dt",
  CHECK_DATE_IN_FIN_YEAR: "/lib/check-dt-fin-yr",
  FIN_YEAR_LIST: `/fin-year`,
  DIVISION_LIST: `/division`,

  // MEMBERSHIP ONBOARDING FORM
  GET_DEALER_LIST: `/form-module/dealers`,
  GET_MEMBER_DATA_BY_DEALER_CODE: `/form-module/member-data`,
  GET_LIST_OF_CONSTANT: `/form-module/list-constants`,
  POST_MEMBERSHIP_DETAIL: `/form-module/member-data`,
  GET_DATA_FOR_MEMBER_FORM: `/form-module/form-data`,
  VALIDATE_MEMBERSHIP_FORM: `/form-module/form-data/validate`, // make it on dt. 24.09.2025

  // EMFA_STATUS_ALL_MEMBERS REPORT
  GET_MEMBER_REPORT_DATA: `/member/form-data`,
  GET_EMFA_REPORT_DATA: `/member/form-data`,
  GET_DLR_NAME_LIST_OF_CONSTANTS: `/member/list-constants`,
  GET_LOAN_NO_LIST_OF_CONSTANTS: `/member/list-constants`,
  GET_EMFA_STATUS_ALL_MEMBER_DATA: `/member/form-data`,

  //INVOICE GENERATION AND BULK MAILING
  GET_INV_BULK_MAIL_FORMDATA: `/inv-bulk-mail/list-constant`,
  GET_INV_BULK_MAIL_GEN_BULK_INV: `/inv-bulk-mail/bulk-inv-gen`,
  GENERATE_SELECTED_INV:`/inv-bulk-mail/generate-selected-inv`,
  GET_EMI_LIST:`/inv-bulk-mail/emi-list`,

  // USER MASTER FORM
  GET_USER_MASTER_DATA: `/user-master/user-data`,
  GET_USER_MASTER_DROPDOWN_DATA: `/user-master/list-constants`,
  SUBMIT_USER_MASTER_DATA: `/user-master/new-user`,
  GET_EMP_SUGGESTIONS: "/user-master/autocomplete",
  GET_USER_MASTER_HELP_LIST_DATA: `/user-master/help`,
  GET_USER_MASTER_VALIDATE_DATA: `/user-master/validdata`,

  // STATE WISE MASTER FORM
  GET_STATEWISE_MASTER_DATA: `/state-master/state-data`,
  SUBMIT_STATEWISE_MASTER_DATA: `/state-master/submit`,
  GET_STATEWISE_MASTER_VALIDATE_DATA: `/state-master/form-data`,

  // AGEING PARAMETER FORM
  GET_AGEING_PARAMETER_DATA: `/age-parameter/query-data`,
  SUBMIT_AGEING_PARAMETER_DATA: `/age-parameter/submit`,
  GET_AGEING_PARAMETER_VALIDATE_DATA: `/age-parameter/form-data`,

  // Division Master FORM
  GET_DIVISION_MASTER_DATA: `/division-master/form-data`,
  GET_DIVISION_MASTER_DROPDOWNDATA: `/division-master/list-constants`,
  SUBMIT_DIVISION_MASTER_DATA: `/division-master/submit`,
  GET_HELP_LIST_DATA: `/division-master/form-data`,
  GET_DIVISION_MASTER_VALIDATE_DATA: `/division-master/division-data`,

  // Code Definition Master
  GET_CODE_DEFINITION_DROPDOWNDATA: `/code-definition/category`,
  GET_CODE_DEFINITION_TYPE_DETAILDATA: `/code-definition/category-type`,
  SUBMIT_CODE_DEFINITION_DATA: `/code-definition/form-data`,
  GET_CHECK_DUPLICATE_DESC: `/code-definition/check-duplicate`,

  // Year Opening Updation
  GET_YEAR_OPEN_UPDATION_DROPDOWNDATA: `/year-open/list-constants`,
  GET_YEAR_OPEN_UPDATION_DATA: `/year-open/year-data`,

  // Financial Year Open Period
  GET_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/finance-data`,
  SUBMIT_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/submit`,
  GET_FINANCE_YEAR_OPEN_PERIOD_VALIDATE_DATA: `/financial-year/form-data`,
  POST_CURRENT_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/current-year`,
  GET_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/finance-data`,
  SUBMIT_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/submit`,
  //GET_FINANCE_YEAR_OPEN_PERIOD_VALIDATE_DATA: `/financial-year/form-data`,
  POST_CURRENT_FINANCE_YEAR_OPEN_PERIOD_DATA: `/financial-year/current-year`,

  // Expense Bill Voucher
  GET_EXP_LIST_CONSTANTS: "/exp-vchr/list-constants",
  GET_EXP_PARTY_LIST: "/exp-vchr/parties",
  POST_EXPENSE_VOUCHER_DATA: "/exp-vchr/expense-data",
  GET_EXP_FORM_DATA: "/exp-vchr/form-data",
  VALIDATE_EXP_FROM_DATA: "/exp-vchr/form-data",
  GET_EXP_TDS_ENTRIES: "/exp-vchr/form-data/create-tds-entry",
  CREATE_GST_ENTRIES_EXP: "/exp-vchr/form-data/create-gst-entry",
  AUTHORIZED_EXP_VCH: `/exp-vchr/auth_vch`,
  CANCELLATION_EXP_VCH: `/exp-vchr/cancel_vch`,

  // BASE DATA FOR CASH VOUCHER
  GET_BASE_DATA_CASH_VOUCHER: `/cash-vchr/fetch-constants`,
  GET_BASE_DATA_CASH_VOUCHER_NARRATION: `/cash-vchr/acc-meta`,
  GET_CASH_VOUCHER_BILL_META: `/cash-vchr/acc-bill-meta`,
  GET_CASH_VOUCHER_BAL_META: `/cash-vchr/balance-meta`,
  GET_QUERY_DATA_CASH_VOUCHER: `/cash-vchr/query-data`,
  POST_DATA_CASH_VOUCHER: `/cash-vchr/form-data`,
  UPDATE_DATA_CASH_VOUCHER: `/cash-vchr/form-data`,
  GET_FORM_DATA_CASH_VOUCHER: `/cash-vchr/form-data/validate`,
  GET_CASH_VOUCHER_ITC_META: `/cash-vchr/itc-meta`,
  AUTHORIZED_CASH_VCH: `/cash-vchr/auth_vch`,
  CANCELLATION_CASH_VCH: `/cash-vchr/cancel_vch`,

  // General parameter
  GET_GENERAL_PARAMETER_DROPDOWNDATA: `/gen-param/list-constants`,
  GET_GENERAL_PARAMETER_DATA: `/gen-param/form-data`,
  POST_GENERAL_PARAMETER_DATA: `/gen-param/submit`,

  // Customer Master
  GET_CUST_LIST_OF_CONSTANTS: `/cust-mstr/list-constants`,
  GET_CUSTOMER_FORM_DATA: "/cust-mstr/form-data",
  POST_CUSTOMER_FORM_DATA: "/cust-mstr/form-data",

  // Suplier Master
  GET_SUPPLIER_LIST_OF_CONSTANTS: `/sup-mstr/list-constants`,
  GET_SUPPLIER_FORM_DATA: "/sup-mstr/form-data",
  POST_SUPPLIER_MSTR_DATA: "/sup-mstr/form-data",

  // UNIT MASTER
  GET_UNIT_MSTR_FORM_DATA: "/unit-mstr/form-data",
  POST_UNIT_MSTR_DATA: "/unit-mstr/submit",
  GET_UNIT_MSTR_VALIDATE_DATA: `/unit-mstr/unit-data`,

  // UNIT CONVERSION MASTER
  GET_UNIT_CONVERSION_MSTR_FORM_DATA: "/unit-conv-mstr/form-data",
  GET_UNIT_CONVERSION_MSTR_LIST_OF_CONSTANTS: `/unit-conv-mstr/list-constants`,
  POST_UNIT_CONVERSION_MSTR_FORM_DATA: "/unit-conv-mstr/form-data",

  //  ITEM STOCK MASTER
  GET_ITEM_STOCK_OPNG_MSTR_DATA: "/itm-stock-opn-mstr/form-data",
  POST_ITEM_STOCK_OPNG_MSTR_DATA: "/itm-stock-opn-mstr/form-data",

  // Tax Parameters Master
  GET_TAX_PARA_MSTR_DATA: `/tax-para-mstr/form-data`,
  POST_TAX_PARA_MSTR_DATA: `/tax-para-mstr/submit`,

  // Gen. Para Div Wise
  GET_DIV_WISE_PARAM_DATA: `/div-wise-param/form-data`,
  POST_DIV_WISE_PARAM_DATA: `/div-wise-param/submit`,
  GET_DIV_WISE_PARAM_DROPDOWNDATA: `/div-wise-param/list-constants`,

  // Currency Master
  GET_CURR_MSTR_FORM_DATA: "/curr-mstr/form-data",
  POST_CURR_MSTR_DATA: "/curr-mstr/submit",

  //EFA Master/loan
  GET_EFA_MSTR_DATA: `/efa-mstr/form-data`,
  POST_EFA_MSTR_DATA: `/efa-mstr/form-data`,

  // Email Alert Master
  GET_EMAIL_MASTER_DROPDOWNDATA: `/email-master/list-constants`,
  GET_EMAIL_MASTER_DATA: `/email-master/form-data`,
  POST_EMAIL_MASTER_DATA: `/email-master/submit`,

  // Email Description
  GET_EMAIL_DESCRIPTION_DATA: `/email-description/form-data`,
  POST_EMAIL_DESCRIPTION_DATA: `/email-description/submit`,
  GET_EMAIL_DESCRIPTION_VALIDATE_DATA: `/email-description/email-data`,

  // Bank Voucher
  GET_BANK_VOUCHER_DATA: `/bank-voucher/form-data`,
  GET_BANK_VOUCHER_LIST_DATA: "/bank-voucher/list-constants",
  GET_BASE_DATA_BANK_VOUCHER_NARRATION: `/bank-voucher/acc-meta`,
  POST_BANK_VOUCHER_DATA: `/bank-voucher/form-data`,
  GET_BANK_VOUCHER_BILL_META: `/bank-voucher/acc-bill-meta`,
  AUTHORIZED_BANK_VCH: `/bank-voucher/auth_vch`,
  CANCELLATION_BANK_VCH: `/bank-voucher/cancel_vch`,
  GET_BANK_TDS_ENTRIES: "/bank-voucher/form-data/create-tds-entry",

  // Sale Voucher
  GET_SALE_VOUCHER_DATA: `/sale-voucher/form-data`,
  GET_SALE_VOUCHER_LIST_DATA: `/sale-voucher/list-constants`,

  // journal Voucher
  GET_JOURNAL_VOUCHER_DATA: `/journal-voucher/form-data`,
  POST_JOURNAL_VOUCHER_DATA: `/journal-voucher/form-data`, // it include put and post method
  GET_JOURNAL_VOUCHER_LIST_DATA: `/journal-voucher/list-constants`,
  VALIDATE_JOURNAL_VOUCHER: `journal-voucher/validate`,
  AUTHORIZED_JOURNAL_VCH: `/journal-voucher/auth_vch`,
  CANCELLATION_JOURNAL_VCH: `/journal-voucher/cancel_vch`,

  // Change Password
  POST_CHANGE_PASSWORD_DATA: `/change-password/submit`,

  // finance Sections
  GET_FINANCE_SECTION_LIST_DATA: `/finance-section/list-constants`,
  GET_FINANCE_SECTION_DATA: `/finance-section/form-data`,
  POST_FINANCE_SECTION_DATA: `/finance-section/submit`,

  // user Sections
  GET_USER_SECTION_DATA: `/user-section/form-data`,
  GET_USER_SECTION_VALIDATE_DATA: `/user-section/section-data`,
  POST_USER_SECTION_DATA: `/user-section/submit`,

  // statewise gst Master
  GET_STATEWISE_GST_MASTER_DROPDOWNDATA: `/state-wise-gst/list-constants`,
  GET_STATEWISE_GST_MASTER_DATA: `/state-wise-gst/form-data`,

  // bank details
  GET_BANK_DETAILS_DROPDOWNDATA: `/bank-details/list-constants`,
  GET_BANK_DETAILS_DATA: `/bank-details/form-data`,
  POST_BANK_DETAILS_DATA: `/bank-details/submit`,
  GET_BANK_DETAILS_VALIDATE_DATA: `/bank-details/bank-data`,

  // Account code for gst
  GET_ACC_CODE_FOR_GST_DATA: `/gst-acc-mstr/form-data`,
  GET_ACC_CODE_FOR_GST_DROPDOWNDATA: `/gst-acc-mstr/list-constants`,
  GET_ACC_CODE_FOR_GST_VALID_DATA: `/gst-acc-mstr/valid-data`,

  // ITC entry
  GET_ITC_ENTRY_DROPDOWNDATA: `/itc-entry/list-constants`,
  GET_ITC_ENTRY_DATA: `/itc-entry/form-data`,
  GET_ITC_ENTRY_VALIDATE_DATA: `/itc-entry/validate-data`,
  POST_ITC_ENTRY_DATA: `/itc-entry/submit`,
  AUTHORIZED_ITC_ENTRY_DATA: `/itc-entry/auth_itc`,
  DELETE_ITC_ENTRY_DATA: `/itc-entry/delete`,

  // Finance -> GL -> Payment Reverse
  GET_PYMNT_RVRS_FORM_DATA: `/pymnt-rvrs/form-data`,
  GET_PYMNT_RVRS_LIST_DATA: `/pymnt-rvrs/list-constants`,
  POST_PYMNT_RVRS_DATA: `/pymnt-rvrs/submit`,
  GET_PYMNT_RVRS_VALIDATE_DATA: `/pymnt-rvrs/validation`,

  // Standard Remark
  GET_STD_REM_FORM_DATA: `/std-rem/form-data`,
  POST_STD_REM_DATA: `/std-rem/form-data`,

  // GL Master
  GET_GL_MSTR_FORM_DATA: `/gl-master/form-data`,
  GET_GL_MSTR_DROPDOWNDATA: `/gl-master/list-constants`,
  POST_GL_MSTR_DATA: `/gl-master/submit`,
  VALIDATE_GL_MSTR_FROM_DATA: "/gl-master/form-data",

  // Item Code Ctg Classificatio
  GET_ITEM_CD_CTG_CLS_FORM_DATA: `/item-cd-ctg-cls/form-data`,
  POST_ITEM_CD_CTG_CLS_DATA: `/item-cd-ctg-cls/form-data`,

  // Sale Order form
  GET_DATA_FOR_SALES_ORDER_FORM: `/sales-order/form-data`,
  FETCH_SALES_ORDER_DROPDOWN_DATA: `/sales-order/dropdown-data`,
  GET_SALES_ORDEER_HELP_LIST_DATA: `/sales-order/help-list-data`,
  GET_CUSTOMER_DEPENDENT_DATA: `/sales-order/customer-dependent-data`,
  GET_ITEM_CODE_INACTIVE_DATA: `/sales-order/verify-item-code`,
  GET_HSN_CODE_INACTIVE_DATA: `/sales-order/verify-hsn-code`,

  // Account wise TDS master
  GET_ACCOUNT_WISE_TDS_MSTR: `/acc-wise-tds-mstr/form-data`,
  POST_ACCWISE_TDS_MSTR_DATA: `/acc-wise-tds-mstr/submit`,
  GET_ACCWISE_TDS_MSTR_VALID_DATA: `/acc-wise-tds-mstr/acc-data`,

  // Gl-Rollup Master
  GET_GL_ROLLUP_MSTR_FORM_DATA: `/gl-rollup-mstr/form-data`,
  POST_GL_ROLLUP_MSTR_DATA: `/gl-rollup-mstr/form-data`,
  CHECK_GL_ROLLUP_DELETE: "/gl-rollup-mstr/check-delete",

  // Loan Master
  // CREATE_EMI_RECORDS: `/loan_master/form-data`,
  POST_LOAN_MASTER_DATA: `/loan-master/form-data`,
  GET_LOAN_MASTER_DATA: "/loan-master/form-data",
  GET_LOAN_MASTER_LOAN_NO: "/loan-master/form-data/get-loan-no",
  GET_LOAN_MASTER_DROPDOWN_DATA: "/loan-master/list-constants",
  GET_LOAN_MASTER_DOC_LIST: "/loan-master/form-data/doc-list",
  UPLD_LOAN_MASTER_DOC: "/loan-master/form-data/upload-documents",
  PRINT_REPAYMENT_SCHEDULE: `/loan-master/print-repay-schedule`,

  // EMI REPAYMENT MASTER
  GET_LOAN_REPAY_DROPDOWN_DATA: "/emi-repayment/list-constants",
  GET_EMI_REPAYMENT_DATA: "/emi-repayment/form-data",
  POST_EMI_REPAYMENT_DATA: "/emi-repayment/form-data",
  GET_LOAN_REPAYMENT_LOAN_RECEIPT_NO:
    "/emi-repayment/form-data/get-loan-rec-no",

  // EMI VEHICAL DETAIL
  GET_VEHICAL_DTL_LOAN_LIST: "/vehical-dtl/list-constants",
  POST_SUBMIT_VEHICAL_DATA: "/vehical-dtl/form-data",

  // GET_EMI_REPAYMENT_DATA: "/emi-repayment/form-data",
  // POST_EMI_REPAYMENT_DATA: "/emi-repayment/form-data",

  // Inventory Management
  GET_INVENTORY_CONFIG: `/it-mngmnt/fetch`,
  GET_INVENTORY_LEVEL_DATA: `/it-mngmnt/fetch-level`,
  GET_GENERATE_INVENTORY_CODE: `/it-mngmnt/gen-code`,
  GET_INVENTORY_STOCK_PURCHASE_UNITS: `/it-mngmnt/fetch-stk-prchse-units`,
  UPSERT_INVENTORY_DATA: `/it-mngmnt/post-data`,

  // Bulk Upload Vouchers
  UPLOAD_ALL_VOUCHERS: `/blk-upld-vch/temp-upload-all-vch`,

  // Bulk Upload Invoice
  UPLOAD_BULK_INVOICE: `/blk-upld-inv/temp-upload-all-vch`,
  POST_CREATE_BULK_INVOICE: `/blk-upld-inv/create-invoice`,

  // Price List (SALES MODULE)
  GET_PRICE_LIST_DATA: `/price-list/form-data`,
  POST_PRICE_LIST_DATA: `/price-list/form-data`,
  UPLOAD_RATE_LIST_EXCEL: `/price-list/upload-item-rate`,

  // PAYMENT TERM PURCHASE
  GET_PYMNT_TERM_FORM_DATA: `/pay-term/form-data`,
  GET_PYMNT_TERM_LIST_OF_CONSTANTS: `/pay-term/list-constants`,
  POST_PYMNT_TERM_FORM_DATA: `/pay-term/form-data`,

  // PAYMENT TERM SALE
  GET_PYMNT_TERM_SALE_FORM_DATA: `/pay-term-sale/form-data`,
  GET_PYMNT_TERM_SALE_LIST_OF_CONSTANTS: `/pay-term-sale/list-constants`,
  POST_PYMNT_TERM_SALE_FORM_DATA: `/pay-term-sale/form-data`,

  // PO CATEGORY
  GET_PO_CAT_FORM_DATA: `/po-category/form-data`,
  POST_PO_CAT_FORM_DATA: `/po-category/form-data`,

  // BIN KARD // INVENTERY
  GET_BIN_KARD_FORM_DATA: `/bin-kard/form-data`,
  GET_BIN_KARD_STOCKS_ITEM: `/bin-kard/item-dtl`,

  // Product Master
  GET_PRODUCT_MASTER_DATA: `/product-mstr/form-data`,
  GET_PRODUCT_MSTR_DROPDOWNDATA: `/product-mstr/list-constants`,
  POST_PRODUCT_MASTER_DATA: `/product-mstr/submit`,

  // Invoice Category
  GET_INVOICE_CATEGORY_DATA: `/invoice-category/form-data`,
  GET_INVOICE_DROPDOWNDATA: `/invoice-category/list-constants`,
  POST_INVOICE_CATEGORY_DATA: `/invoice-category/submit`,
  GET_INVOICE_CATEGORY_VALID_DATA: `/invoice-category/invoice-data`,

  // Product Category
  GET_PRODUCT_CATEGORY_DATA: `/product-category/form-data`,
  POST_PRODUCT_CATEGORY_DATA: `/product-category/submit`,

  // Vendor TDS Declaration

  GET_VENDOR_TDS_DATA: `/vendor-tds/form-data`,
  GET_VENDOR_TDS_DROPDOWNDATA: `/vendor-tds/list-constants`,
  POST_VENDOR_TDS_DATA: `/vendor-tds/submit`,
  GET_VENDOR_VALIDATE_DATA: `/vendor-tds/valid-data`,

  // Service Invoice
  GET_SERVICE_INVOICE_DATA: `/service-invoice/form-data`,
  GET_SERVICE_INVOICE_DROPDOWNDATA: `/service-invoice/list-constants`,
  GET_SERVICE_INVOICE_DEPENDENT_DATA: `/service-invoice/customer-dependent-data`,
  GET_SERVICE_INVOICE_HSN_CODE_DATA: `/service-invoice/verify-hsn-code`,
  POST_SERVICE_INVOICE_DATA: `/service-invoice/form-data`,
  CANCELLATION_SERVICE_INV: `/service-invoice/cancel-inv`,
  PRINT_SERVICE_INV: `/service-invoice/print-inv`,
  AUTHORIZED_INVOICE: `/service-invoice/auth-inv`,

  // Normal Invoice
  GET_NORMAL_INVOICE_DATA: `/normal-invoice/form-data`,
  GET_NORMAL_INVOICE_DROPDOWNDATA: `/normal-invoice/list-constants`,
  GET_NORMAL_INVOICE_VALIDATE_FIELD: `/normal-invoice/validate`,
  GET_NORMAL_INVOICE_HSN_CODE_DATA: `/normal-invoice/verify-hsn-code`,

  // WarehouesMaster(Work Center Master)
  GET_WORK_CENTER_MASTER_DATA: `/work-center/form-data`,
  GET_WORK_CENTER_DROPDOWNDATA: `/work-center/list-constants`,
  POST_WORK_CENTER_MASTER_DATA: `/work-center/form-data`,
  GET_GEN_WCID_WORK_CENTER: `/work-center/form-data/gen-wc-id`,
  VALIDATE_MAIN_WORK_CENTER: `/work-center/form-data/validate-main-work-center`,

  // Debit Credit Note
  GET_DEBIT_CREDIT_NOTE_DATA: `/debit-credit-note/form-data`,
  GET_DEBIT_CREDIT_NOTE_DROPDOWNDATA: `/debit-credit-note/list-constants`,
  POST_DEBIT_CREDIT_NOTE_DATA: `/debit-credit-note/submit`,
  AUTHORIZED_DEBIT_CREDIT_NOTE_DATA: `/debit-credit-note/auth_DebitCredit`,
  CANCELLATION_DBCR_VCH: `/debit-credit-note/cancel-vchr`,

  // Gst Debit Credit Note
  GET_GST_DEBIT_CREDIT_NOTE: `/gst-debit-credit-note/form-data`,
  GET_GST_DEBIT_CREDIT_NOTE_DROPDOWNDATA: `/gst-debit-credit-note/list-constants`,
  POST_GST_DEBIT_CREDIT_NOTE_DATA: `/gst-debit-credit-note/submit`,
  AUTHORIZED_GST_DEBIT_CREDIT_NOTE_DATA: `/gst-debit-credit-note/auth_gstDebitCredit`,

  // UNPOSTING VOUCHER
  GET_UNPOSTING_VOUCHER_DROPDOWNDATA: `/unposting-voucher/list-constants`,
  POST_UNPOSTING_VOUCHER_DATA: `/unposting-voucher/submit`,
  GET_UNPOSTING_VOUCHER_DATA: `/unposting-voucher/form-data`,

  // BALANCE SHEET INV FOR ACC LINKAGE
  GET_BALANCE_SHEET_ACC_LINK: `/balance-sheet-acc-link/form-data`,
  POST_BALANCE_SHEET_ACC_LINK_DATA: `/balance-sheet-acc-link/submit`,
  GET_BALANCE_SHEET_ACC_LINK_DATA: `/balance-sheet-acc-link/valid-data`,

  // Closing Inv for Balance Sheet
  GET_CLOSING_INV_BAL_SHEET: `/closing-inv-bal-sheet/form-data`,
  POST_CLOSING_INV_BAL_SHEET_DATA: `/closing-inv-bal-sheet/submit`,
  GET_CLOSING_INV_BAL_SHEET_VALID_DATA: `/closing-inv-bal-sheet/valid-data`,

  // Balance Sheet Formulae detail
  GET_BALANCE_SHEET_FORMULA_DETAIL: `/bal-sheet-formulae-dtl/form-data`,
  POST_BALANCE_SHEET_FORMULA_DETAIL: `/bal-sheet-formulae-dtl/submit`,
  GET_BALANCE_SHEET_FORMULA_DETAIL_VALID_DATA: `/bal-sheet-formulae-dtl/valid-data`,

  // Balance Sheet Profit and Loss
  GET_DATA_FOR_BALANCE_SHEET_PL: `/bal-sheet-profit-loss/form-data`,
  POST_BAL_SHEET_PL_DATA: `/bal-sheet-profit-loss/form-data`,
  GET_BAL_SHEET_PL_VALID_DATA: `/bal-sheet-profit-loss/valid-data`,
  GET_BAL_SHEET_PL_GENERATE_DATA: `/bal-sheet-profit-loss/generate-data`,

  // Item Code Ctg Classificatio
  GET_ITEM_CD_CTG_CLS_FORM_DATA: `/item-cd-ctg-cls/form-data`,
  POST_ITEM_CD_CTG_CLS_DATA: `/item-cd-ctg-cls/form-data`,
  CHECK_ITEM_CD_CTG_CLS_DELETE: `/item-cd-ctg-cls/check-delete`,

  // Item Wise Acc entry api
  GET_ITEM_WISE_ACC_ENTRY_DROPDOWN_DATA: `/item-wise-acc-entry/list-constants`,
  GET_ITEM_WISE_ACC_ENTRY_DATA: `/item-wise-acc-entry/form-data`,
  GET_ITEM_WISE_ACC_ENTRY_SHOW_ITEM: `/item-wise-acc-entry/form-data/show-item`,
  GET_ITEM_WISE_ACC_ENTRY_PURAC_HEAD: `/item-wise-acc-entry/validate-purchase-acc-head`,
  GET_ITEM_WISE_ACC_ENTRY_SALEAC_HEAD: `/item-wise-acc-entry/validate-sales-acc-head`,
  GET_ITEM_WISE_ACC_ENTRY_FILTER_DATA: `/item-wise-acc-entry/form-data/filter-selection`,
  PUT_ITEM_WISE_ACC_ENTRY_DATA: `/item-wise-acc-entry/form-data`,

  // ACCOUNT WISE DETAIL ENTRY
  ACC_WISE_DTL_ENTRY: `/acc-wise-dtl-entry/form-data`,
  ACC_WISE_DTL_ENTRY_SHOW: `/acc-wise-dtl-entry/show`,

  // Purchase voucher Entery
  GET_PURCHASE_VCHR_ENTRY_DROPDOWN_DATA: `/pur-vchr-entry/list-constants`,
  GET_PURCHASE_VCHR_ENTRY_DATA: `/pur-vchr-entry/form-data`,

  // Unlink AP Bill
  GET_UNLINK_AP_BILL_DATA: `/unlink-ap-bill/form-data`,
  POST_UNLINK_AP_BILL_DATA: `/unlink-ap-bill/form-data`,
  GET_UNLINK_AP_BILL_CHK_UNLINK: `/unlink-ap-bill/check-unlink`,

  // Item opening rate master
  GET_DATA_FOR_ITEM_OPENING_RATE_MSTR: `/item-opening-rate-mstr/form-data`,
  POST_ITEM_OPENING_RATE_MSTR: "/item-opening-rate-mstr/submit",

  // incoming quality inspection
  GET_DATA_INCOMING_QUALITY_INSPECTON: `/incoming-quality-inspect/form-data`,
  POST_DATA_INCOMING_QUALITY_INSPECTION: `/incoming-quality-inspect/submit`,
  GET_DROPDOWNDATA_INCOMING_QUALITY_INSPECTION: `/incoming-quality-inspect/list-constants`,

  // Inter Transfer Memo
  GET_DATA_FOR_INTER_TRANSFER_MEMO: `/inter-transfer-memo/form-data`,
  GET_DROPDOWNDATA_INTER_TRANSFER_MEMO: `/inter-transfer-memo/list-constants`,
  POST_INTER_TRANSFER_MEMO_DATA: "/inter-transfer-memo/submit",
  GET_INTER_TRANSFER_MEMO_VALID_DATA: "/inter-transfer-memo/valid-data",
  AUTHORIZED_INTER_TRANSFER_MEMO: `/inter-transfer-memo/auth_memo`,
  CANCELLATION_INTER_TRANSFER_MEMO: `/inter-transfer-memo/cancel_memo`,
  GET_CHECK_DATE_IN_FINYEAR: `/inter-transfer-memo/check_date`,

  // Material Issue
  GET_DATA_FOR_MATERIAL_ISSUE: `/material-issue/form-data`,
  GET_DROPDOWNDATA_MATERIAL_ISSUE: `/material-issue/list-constants`,
  POST_MATERIAL_ISSUE_DATA: "/material-issue/submit",
  GET_MATERIAL_ISSUE_VALID_DATA: "/material-issue/valid-data",
  AUTHORIZED_MATERIAL_ISSUE: `/material-issue/auth_memo`,
  CANCELLATION_MATERIAL_ISSUE: `/material-issue/cancel_memo`,

  // DASHBOARD USER RIGHTS
  GET_DB_USER_RIGHTS_FORM_DATA: `/dashboard-user-right/form-data`,
  POST_DB_USER_RIGHTS_FORM_DATA: `/dashboard-user-right/form-data`,

  // DASHBOARD LINKS RIGHTS
  GET_DB_LINK_RIGHTS_FORM_DATA: `/db-link-rights/form-data`,
  POST_DB_LINK_RIGHTS_FORM_DATA: `/db-link-rights/form-data`,

  // RCM INVOICE
  GET_RCM_FORM_DATA: `/rev-chrg-inv/form-data`,
  GET_RCM_DROPDOWNDATA: `/rev-chrg-inv/list-constants`,

  // TRANSACTION MASTER
  GET_TRANSACTION_MSTR_DATA: `/trans-mstr/form-data`,
  POST_TRANSACTION_MSTR_DATA: `/trans-mstr/form-data`,

  // ITEM MIN MAX STOCK LEVEL
  GET_ITEM_MIN_MAX_STOCK_DATA: `/item-min-max-stock/form-data`,
  GET_ITEM_MIN_MAX_STOCK_DROPDOWN_DATA: `/item-min-max-stock/list-constants`,
  GET_ITEM_MIN_MAX_STOCK_SHOW_ITEM: `/item-min-max-stock/form-data/show-item`,
  GET_ITEM_MIN_MAX_STOCK_FILTER_DATA: `/item-min-max-stock/form-data/filter-selection`,
  PUT_ITEM_MIN_MAX_STOCK_DATA: `/item-min-max-stock/form-data`,

  // Cheque book entry
  GET_CHEQUE_BOOK_ENTRY_FORM_DATA: `/cheque-book-entry/form-data`,
  GET_CHEQUE_BOOK_ENTRY_DROPDOWN_DATA: `/cheque-book-entry/list-constants`,
  POST_CHEQUE_BOOK_ENTRY_FORM_DATA: `/cheque-book-entry/form-data`,
  CHECK_DUBLICATE_CHEQUE_NO_DATA: `/cheque-book-entry/check-dup`,
  CHECK_OPEN_FLAG: `/cheque-book-entry/open-flag`,

  // ACC CODE FORM PURCHASE VOUCHER
  GET_ACC_CODE_PURC_VOCH_FORM_DATA: `/acc-code-purc-voch/form-data`,
  GET_ACC_CODE_PURC_VOCH_LIST_OF_CONSTANTS: `/acc-code-purc-voch/list-constants`,
  POST_ACC_CODE_PURC_VOCH_FORM_DATA: `/acc-code-purc-voch/form-data`,
  GET_ACC_CODE_PURC_VOCH_CHECK_DUPLICATE: `/acc-code-purc-voch/check-duplicate`,

  // OUYSTANDING PAYMENT
  GET_OUTSTND_PYMT_FORM_DATA: `/outstnd-pymt/form-data`,
  GET_CHECK_VALIDATE_DATE: `/outstnd-pymt/form-data`,
  POST_OUTSTND_PYMT_FORM_DATA: `/outstnd-pymt/form-data`,

  // voucher Authorization
  GET_DATA_FOR_VOUCHER_AUTH: `/vouch-auth/form-data`,
  GET_VOUCHER_AUTH_DROPDOWN_DATA: `/vouch-auth/list-constants`,

  // purchase category defination
  GET_PURCH_CTGY_DFNT_FORM_DATA: `/purch-ctgy-dfnt/form-data`,
  POST_PURCH_CTGY_DFNT_FORM_DATA: `/purch-ctgy-dfnt/form-data`,
  GET_PURCH_CTGY_DFNT_CHECK_DUPLICATE: `/purch-ctgy-dfnt/check-duplicate`,

  //  Block payment Option
  GET_DATA_FOR_BLOCK_PAYMENT: `/block-payment/form-data`,
  POST_FOR_BLOCK_PAYMENT_DATA: "/block-payment/submit",
  GET_VALIDATE_BLOCK_PAYMENT: `/block-payment/valid-data`,

  // Purchase Voucher
  GET_PURC_LIST_CONSTANTS: "/purc-vchr/list-constants",
  GET_PURC_PARTY_LIST: "/purc-vchr/parties",
  POST_PURCHASE_VOUCHER_DATA: "/purc-vchr/purchase-data",
  GET_PURC_FORM_DATA: "/purc-vchr/form-data",
  VALIDATE_PURC_FROM_DATA: `/purc-vchr/form-data`,
  GET_PURC_TDS_ENTRIES: `/purc-vchr/form-data/create-tds-entry`,
  CREATE_GST_ENTRIES: `/purc-vchr/form-data/create-gst-entry`,
  AUTHORIZED_PURC_VCH: `/purc-vchr/auth_vch`,
  CANCELLATION_PURC_VCH: `/purc-vchr/cancel_vch`,

  // Stock adjustment batch
  GET_DATA_FOR_STOCK_ADJUSTMENT_BATCH: `/stock-adjustment-batch/form-data`,
  GET_DROPDOWNDATA_STOCK_ADJUSTMENT_BATCH: `/stock-adjustment-batch/list-constants`,
  GET_STOCK_ADJUSTMENT_BATCH_FOR_VALID_DATA:
    "/stock-adjustment-batch/valid-data",
  POST_DATA_FOR_STOCK_ADJUSTMENT_BATCH: `/stock-adjustment-batch/submit`,
  GET_VALIDATE_STOCK_ADJUSTMENT_BATCH: `stock-adjustment-batch/valid-data`,
  AUTHORIZED_STOCK_ADJUSTMENT_BATCH: `/stock-adjustment-batch/auth_memo`,
  CANCELLATION_STOCK_ADJUSTMENT_BATCH: `/stock-adjustment-batch/cancel_memo`,
  // GET_CHECK_DATE_IN_FINYEAR: `/stock-adjustment-batch/check_date`,

  // Item Location Master
  GET_DATA_FOR_ITEM_LOCATION_MASTER: `/item-location-master/form-data`,
  GET_ITEM_LOCATION_MASTER_FOR_VALID_DATA: `/item-location-master/valid-data`,
  POST_DATA_FOR_ITEM_LOCATION_MASTER: `/item-location-master/submit`,

  // WOR internal
  GET_DATA_FOR_WOR_INTERNAL: `/wor-internal/form-data`,
  GET_WOR_INTERNAL_FOR_VALID_DATA: `/wor-internal/valid-data`,
  POST_DATA_FOR_WOR_INTERNAL: `/wor-internal/submit`,
  AUTHORIZED_FOR_WOR_INTERNAL: `/wor-internal/auth`,
  CANCELLATION_FOR_WOR_INTERNAL: `/wor-internal/cancel`,

  // Purchase Order (PO)
 GET_DRP_DOWN_DATA_PRCH_ORDR: `/prch-ordr/list-constants`,
  GET_PRCH_ORDR_DATA: `/prch-ordr/form-data`,
  VALIDATE_PO_FROM_DATA: `/prch-ordr/validate`,
  VALIDATE_PO_ITEM_CODE: `/prch-ordr/verify-item-code`,
  POST_PRCH_ORDR_DATA: `/prch-ordr/submit`,
  AUTHORIZE_PRCH_ORDR: `/prch-ordr/authorization`,
  PRINT_PURCHASE_ORDER: `/prch-ordr/print-po`,
  CANCEL_PRCH_ORDR_DATA:`/prch-ordr/cancel-po`,
  GET_PO_LEVEL_CHARGES_WITH_MASTER:`/prch-ordr/po-level-charges-with-master`,

  // physical inventory
  GET_PHYSICAL_INV_FORM_DATA: `/physical-inv/form-data`,
  GET_PHYSICAL_INV_DROPDOWN_DATA: `/physical-inv/list-constants`,
  POST_PHYSICAL_INV_FORM_DATA: `/physical-inv/form-data`,

  // Upload physical inventory
  GET_UPLOAD_PHY_INV_FORM_DATA: `/upload-phy-inv/form-data`,
  GET_UPLOAD_PHY_INV_DROPDOWN_DATA: `/upload-phy-inv/list-constants`,
  POST_UPLOAD_PHY_INV_FORM_DATA: `/upload-phy-inv/form-data`,
  UPLOAD_EXCEL_FILE: `/upload-phy-inv/upload-phyinv-excel`,
  //  GET_UPLOADED_EXCEL_DATA: `/upload-phy-inv/get-uploaded-phyinv`,
  POST_UPLOADED_EXCEL_DATA: `/upload-phy-inv/get-uploaded-phyinv`,
  POST_GEN_EXCPT_CSV: `/upload-phy-inv/generate-exception-csv`,

  // Update physical inventory
  POST_UPDATE_PHY_INV_GEN_ADJUST: `/update-phy-inv/generate-adjustments`,
  GET_UPDATE_PHY_INV_DROPDOWN_DATA: `/update-phy-inv/list-constants`,

  //  REPORTS API MATERIAL ACCEPTANCE
  GET_MATERIAL_ACCEPTANCE_DATA: `/material-accptn/form-data`,
  GET_MATERIAL_ACCEPTANCE_DROPDOWN_DATA: `/material-accptn/list-constants`,
  POST_MATERIAL_ACCEPTANCE_DATA: `/material-accptn/form-data`,
  GET_MATERIAL_ACCEPTANCE_WC_NO_DATA: "/material-accptn/validate-store",

  //  REPORTS API MATERIAL Issue Printing
  GET_MATERIAL_ISSUE_PRINTING_DATA: `/material-issue-printing/form-data`,
  GET_MATERIAL_ISSUE_PRINTING_DROPDOWN_DATA: `/material-issue-printing/list-constants`,
  POST_MATERIAL_ISSUE_PRINTING_DATA: `/material-issue-printing/form-data`,
  GET_MATERIAL_ISSUE_PRINTING_WC_NO_DATA:
    "/material-issue-printing/validate-store",

  //  REPORTS API incoming Material Detail
  GET_INCOMING_MATERIAL_DETAIL_DATA: `/incoming-material-detail/form-data`,
  GET_INCOMING_MATERIAL_DETAIL_DROPDOWN_DATA: `/incoming-material-detail/list-constants`,
  POST_INCOMING_MATERIAL_DETAIL_DATA: `/incoming-material-detail/form-data`,
  GET_INCOMING_MATERIAL_DETAIL_VALIDATE_PO_NO_DATA: `/incoming-material-detail/validate-po-no`,
  GET_VALIDATE_PO_CATEGORY: `/incoming-material-detail/validate-po-category`,

  // customer tds dec
  GET_CUSTOMER_TDS_FORM_DATA: `/cus-tds-dec/form-data`,
  POST_CUSTOMER_TDS_FORM_DATA: `/cus-tds-dec/form-data`,
  GET_CUSTOMER_TDS_VALIDATE_YEAR: `/cus-tds-dec/check-year`,

  // Department master
  GET_DATA_FOR_DEPT_MSTR: `/dept-mstr/form-data`,
  POST_DATA_FOR_DEPT_MSTR: `/dept-mstr/submit`,

  // GRADE AND CATEGORY
  GET_DATA_FOR_GRADE_AND_CAT: `/grd-cat/form-data`,
  POST_DATA_FOR_GRADE_AND_CAT: `/grd-cat/submit`,
  GET_GRADE_AND_CAT_VALID_DATA: `/grd-cat/valid-data`,

  // Grade
  GET_GRADE_FORM_DATA: `/grade/form-data`,
  POST_GRADE_DATA: `/grade/submit`,

  // Gate Entry
  GET_GATE_ENTRY_FORM_DATE: `/gate-entry/form-data`,
  GET_DRP_DOWN_DATA_GATE_ENTRY: `/gate-entry/list-constants`,
  GET_GATE_ETNRY_FILL_ITEM: `/gate-entry/fill-item`,
  GET_GATE_ETNRY_VALIDATE: `/gate-entry/validate`,
  POST_GATE_ENTRY_POST: `/gate-entry/submit`,
  POST_CHECK_DUPLICATE_VENDOR_CHLN: `/gate-entry/validate-vndr-chln`,
   PRINT_GATE_ENTRY: `/gate-entry/print-ge`,

  // Contractor Master
  GET_CONTRACTOR_MSTR_FORM_DATA: `/cont-mstr/form-data`,
  POST_CONTRACTOR_MSTR_FORM_DATA: `/cont-mstr/submit`,

  // Daily Bulletin
  GET_DAILY_BULLETIN_FORM_DATA: `/daily-bulletin/form-data`,
  POST_DAILY_BULLETIN_FORM_DATA: `/daily-bulletin/submit`,

  // Increament
  GET_INCREAMENT_FORM_DATA: `/increament/form-data`,
  POST_INCREAMENT_FORM_DATA: `/increament/submit`,
  GET_INCREAMENT_VALIDATE_DATA: `/increament/valid-data`,

  // RMGP
  GET_RMGP_FORM_DROP_DWN_DATA: `/rmgp/list-constants`,
  GET_RMGP_FORM_DATA: `/rmgp/form-data`,
  GET_RMGP_VALIDATE_DATA: `/rmgp/validate`,
  POST_RMGP_FORM_DATA: `/rmgp/submit`,
  DELETE_RMGP_FORM_DATA: `/rmgp/delete`,

  // Bulk Upload Bills
  GET_BULK_UPLOAD_BILL_FORM_DATA: `/blk-upl-bill/form-data`,
  POST_BULK_UPLOAD_BILLS_FORM_DATA: `/blk-upl-bill/temp-upload`,
  RUN_SUPPLY_CHAIN_ENTRIES_BULK_UPLOAD_BILLS: `/blk-upl-bill/supply-chain-entries`,

  //Update Bulk Member Detail Upload
  POST_BULK_UPDATE_MEMBER_DTL_UPLOAD: `/blk-upl-upd-member-dtl/temp-upload`,
  POST_BULK_UPDATE_MEMBER_DTL_MAIN: `/blk-upl-upd-member-dtl/final-main-update`,
  GET_BULK_UPDATE_MEMBER_DTL_EXL_FORMATE: `/blk-upl-upd-member-dtl/excel-template`,

  // item-mstr-listing report api
  POST_ITEM_MASTER_LISTING_DATA: `/item-mstr-listing/form-data`,
  GET_ITEM_MASTER_LISTING_DROPDOWN_DATA: `/item-mstr-listing/list-constants`,
  GET_ITEM_MASTER_LISTING_DATA: `/item-mstr-listing/form-data`,

  // BOM FORM API
  GET_DATA_FOR_BILL_OF_MATERIAL: `/bill-of-material/form-data`,
  POST_BILL_OF_MATERIAL_DATA: "/bill-of-material/form-data",
  PUT_BILL_OF_MATERIAL_DATA: "/bill-of-material/form-data",

  // routing maintenaNce
  GET_ROUTE_MAINTENANCE_FORM_DATA: `/route-maintenance/form-data`,
  POST_ROUTE_MAINTENANCE_FORM_DATA: `/route-maintenance/form-data`,
  VALIDATE_COMMON_EXIST_OR_NOT: "/route-maintenance/validate",
  UPLOAD_ROUTE_DRAWING: "/route-maintenance/uploadDrawing",

  //Define Operations
  GET_DEFINE_OPERATION_FORM_DATA: `/define-operation/form-data`,
  POST_DEFINE_OPERATION_DATA: "/define-operation/submit",

  // copy routing
  GET_COPY_ROUTING_FORM_DATA: `/copy-routing/form-data`,
  POST_COPY_ROUTING_DATA: "/copy-routing/submit",

  // AUDIT_TRAIL report api
  POST_AUDIT_TRAIL_DATA: `/audit-trail/form-data`,
  GET_AUDIT_TRAIL_DROPDOWN_DATA: `/audit-trail/list-constants`,
  GET_AUDIT_TRAIL_TRANSACTION_NO: `/audit-trail/transaction-no`,

  // BULK UPLOAD JOURNAL VOUCHER ENTRIES -- 04-02-2026 BY AMIT RAWAT
  POST_BULK_UPLOAD_JV_FORM_DATA: `/bulk-upl-jv/upload-in-temp`,
  POST_BULK_UPLOAD_JV_BUILD_JV: `/bulk-upl-jv/build-jv`,
  GET_BULK_UPLOAD_JV_TEMPLATE: "/bulk-upl-jv/get-template",

  //  uploaded document tracker
  GET_UPLD_DOC_TRACKER_LIST_OF_CONSTANTS: `/upld-doc-tracker/list-constants`,
  GET_UPLD_DOC_TRACKER_DATA: `/upld-doc-tracker/form-data`,

  //sales return
  GET_DATA_FOR_SALE_RETURN_FORM: `/sale-return/form-data`,
  GET_DATA_FOR_GST_SALE_RETURN_FORM: `/sale-return/verify-hsn-code`,
  POST_SALE_RETURN_FORM_DATA: `/sale-return/form-data`,
  AUTHORIZED_SALE_RETURN: `/sale-return/auth-inv`,

  // Rate Master
  GET_DATA_FOR_RATE_MASTER_FORM: `/rate-mstr/form-data`,
  POST_DATA_FOR_RATE_MASTER_FORM: `/rate-mstr/submit`,
  POST_CHECK_DUPLICATE_EFF_DATE: `/rate-mstr/check-duplicate-eff-date`,

  //BULK  PO CREATION
  GET_DATA_FOR_BULK_PO_CREATION_FORM: `/bulk_po_creation/form-data`,
  POST_DATA_FOR_BULK_PO_CREATION_BUTTON_FORM: `/bulk_po_creation/bulk-btn`,
  POST_DATA_FOR_BULK_PO_CREATION_FORM: `/bulk_po_creation/submit`,

  // Customer Rate Master
  GET_DATA_FOR_CUSTOMER_RATE_MASTER_FORM: `/customer-rate-mstr/form-data`,
  POST_DATA_FOR_CUSTOMER_RATE_MASTER_FORM: `/customer-rate-mstr/submit`,
  POST_CHECK_DUPLICATE_CUSTOMER_RATE_MASTER: `/customer-rate-mstr/check-duplicate`,

  // Item Wise Dealer Subsidy
  GET_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM: `/item-wise-dealer-subsidy/form-data`,
  POST_DATA_FOR_ITEM_WISE_DEALER_SUBSIDY_FORM: `/item-wise-dealer-subsidy/submit`,
  POST_CHECK_DUPLICATE_ITEM_WISE_DEALER_SUBSIDY: `/item-wise-dealer-subsidy/check-duplicate`,


  // BULK PRINTING
  GET_BULK_PRINTING_DATA: `/bulk-printing/form-data`,


  // QR GENERATOR
   QR_GENERATOR: `/qr/generate`,
   QR_SEARCH: `/qr/search`,


  // NRGP
  GET_NRGP_FORM_DROP_DWN_DATA: `/nrgp/list-constants`,
  GET_NRGP_FORM_DATA: `/nrgp/form-data`,  
  GET_NRGP_VALIDATE_DATA: `/nrgp/validate`,  
  POST_NRGP_FORM_DATA: `/nrgp/submit`, 
  DELETE_NRGP_FORM_DATA: `/nrgp/delete`,
  POST_PRINT_NRGP_REPORT: `/nrgp/print`,


// item Stock Ledger report
GET_ITEM_STOCK_LEDGER_DROPDOWN_DATA: `/item-stock-ledger/list-constants`,
POST_ITEM_STOCK_LEDGER_DATA: `/item-stock-ledger/form-data`,
GET_ITEM_STOCK_LEDGER_DATA: `/item-stock-ledger/form-data`,
GET_ITEM_STOCK_LEDGER_WC_NO_DATA: `/item-stock-ledger/validate-wc-no`,
GET_ITEM_STOCK_LEDGER_ALL_ITEM_DATA: `/item-stock-ledger/get-all-items`,

//po Dump 

GET_PO_DUMP_DATA: `/po-dump/form-data`,
POST_PO_DUMP_DATA: `/po-dump/form-data`,

  // BULK PRINTING
  GET_BULK_PRINTING_DATA: `/bulk-printing/form-data`,
  GET_BULK_PRINT_HELP_DATA: `/bulk-printing/help-list-data`,
  POST_BULK_PRINT_ROW_DATA: `/bulk-printing/form-data`,


  
  //DLR SUBSIDY ACCOUNT MSTR
  GET_DLR_SUBSIDY_ACCOUNT_CONSTANT_LIST: `/dlr-subsidy-acc-mstr/list-constants`,
  GET_DLR_SUBSIDY_ACCOUNT_QUERY_DATA: `/dlr-subsidy-acc-mstr/form-data`,
  POST_DLR_SUBSIDY_ACCOUNT_FORM_DATA: `/dlr-subsidy-acc-mstr/submit`,
  GET_DLR_SUBSIDY_ACCOUNT_REPORT_DATA:`/dlr-subsidy-acc-mstr/report-data`,


// pending po authorization
GET_DATA_FOR_PENDING_PO_AUTH_FORM:`/pending-po-auth/form-data`,
POST_DATA_FOR_PENDING_ALL_PO_AUTHORIZATION:`/pending-po-auth/all-po-auth`,


// STAGING PV

GET_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM:`/staging-purch-vchr/form-data`,
PUT_DATA_FOR_STAGING_PURCHASE_VOUCHER_FORM:`/staging-purch-vchr/submit`,

 // Update Purchase Order (UPO)
  GET_DRP_DOWN_DATA_UPDATE_PRCH_ORDR: `/update-purchase-order/list-constants`,
  GET_UPDATE_PRCH_ORDR_DATA: `/update-purchase-order/form-data`,
  VALIDATE_UPDATE_PO_FROM_DATA: `/update-purchase-order/validate`,
  VALIDATE_UPDATE_PO_ITEM_CODE: `/update-purchase-order/verify-item-code`,
  POST_UPDATE_PRCH_ORDR_DATA: `/update-purchase-order/submit`,
  GET_UPDATE_PO_LEVEL_CHARGES_WITH_MASTER:`/update-purchase-order/po-level-charges-with-master`,

    // PO CLOSURE
  GET_DATA_FOR_PO_CLOSURE_FORM:`/po-closure/form-data`,
  POST_DATA_FOR_PO_CLOSURE_FORM:`/po-closure/submit`,
  CHECK_PO_GATE_ENTRY: "/po-closure/check-po-gate-entry",

  
  // purchase dashboard 
  GET_DATA_FOR_PURCHASE_DASHBOARD:`/purchase-dashboard/dashboard-data`,
  GET_VENDOR_BY_MONTH:`/purchase-dashboard/month-data`,
  GET_VENDOR_PO_SUMMARY:`/purchase-dashboard/summary-data`,

  // member dashboard 
  GET_DATA_FOR_MEMBER_DASHBOARD:`/member-dashboard/dashboard-data`,
  GET_MEMBER_LOAN_DETAILS:`/member-dashboard/loan-member-data`,

  // sale dashboard 
  GET_DATA_FOR_SALE_DASHBOARD:`/sale-dashboard/dashboard-data`,
  
  // Finance dashboard
  GET_DATA_FOR_FINANCE_DASHBOARD:`/fin-dashboard/dashboard-data`,

    // sale return report api
  POST_SALE_RETURN_REPORT_DATA:`/sale-return-report/form-data`,

  
  // user activity 
  GET_USER_ACTIVITY_LIST_OF_CONSTANTS: `/user-activity/list-constants`, 
  GET_USER_ACTIVITY_LIST_OF_SUBMODULE: `/user-activity/list-submodule`,
  GET_USER_ACTIVITY_FORM_DATA: `/user-activity/form-data`,
  POST_USER_ACTIVITY_DATA: `/user-activity/submit`,

    // EMAIL NOTIFY
  EMAIL_NOTIFICATION_FETCH:`/email-notify/form-data`,
  EMAIL_NOTIFICATION_SEND:`/email-notify/send`,

      // fin report voucher report
    POST_VOUCHER_REPORT_DATA:`/voucher-report/form-data`,

// ITC RECORD (hsn WISE PURCHASE SUMMARY)
  GET_ITC_RECORD_DROPDOWN_DATA: `/itc-record/list-constants`,
  POST_ITC_RECORD_FORM_DATA: `/itc-record/form-data`,

     // Gl-Rollup Master
  GET_GL_ROLLUP_BSPL_FORM_DATA: `/gl-rollup-bspl/form-data`,
  POST_GL_ROLLUP_BSPL_DATA: `/gl-rollup-bspl/form-data`,
  CHECK_GL_ROLLUP_BSPL_DELETE: "/gl-rollup-bspl/check-delete",

};
