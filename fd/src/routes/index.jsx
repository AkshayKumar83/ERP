import LoginPage from "../pages/AppLayout/Login";
import ModuleWelcome from "../pages/AppLayout/ModuleWelcome";
import ErrorPage from "../pages/AppLayout/ErrorPage";
import WelcomeHome from "../pages/AppLayout/WelcomeHome";
import WelcomeERP from "../pages/AppLayout/WelcomeERP";
import ModuleMenuPage from "../pages/AppLayout/ModuleMenuPage";
import FormItemsPage from "../pages/AppLayout/FormItemsPage";
import StateWiseGstMaster from "../container/forms/financeMgmnt/Masters/state_wise_gst_master";
import ProtectedRoute from "../pages/AppLayout/ProtectedRoute";
import ShowReport from "../pages/ShowReport";
import RegisterUser from "../pages/AppLayout/RegisterUser";
import MainLayout from "../container/main-layout";
import UserProfile from "../pages/AppLayout/UserProfile";
import MembershipOnboarding from "../container/forms/memberMgmnt/Membership/membershipOnboarding";
import UserMasterNew from "../container/forms/adminMgmnt/UserMaster";
import DebitCreditNotesPayment from "../container/forms/financeMgmnt/Vouchers/gst_debit_credit_note";
import StatewiseMasterNew from "../container/forms/adminMgmnt/StatewiseMaster";
import DealerUploading from "../container/forms/memberMgmnt/Membership/dealer_upload";
import LoanMaster from "../container/forms/memberMgmnt/Loan/loan_master";
import UserActivity from "../container/forms/adminMgmnt/User/user_activity";
import DashboardUserRights from "../container/forms/adminMgmnt/User/dashboard_user_right";
import DashboardLinkRights from "../container/forms/adminMgmnt/User/dashboard_link_right";
import FinancialYearOpenPeriod from "../container/forms/adminMgmnt/Financial/financial_year_open_period";
import FinancialYearOpenUpdation from "../container/forms/adminMgmnt/Financial/financial_year_open_updation";
import GeneralParameters from "../container/forms/adminMgmnt/Parameters/general_parameter";
import DivisionWiseParameters from "../container/forms/adminMgmnt/Parameters/gen_para_div_wise";
import AgeingParameters from "../container/forms/adminMgmnt/Parameters/ageing_parameters";
import TaxParameterMaster from "../container/forms/adminMgmnt/Parameters/tax_parameter_master";
import FinanceSection from "../container/forms/adminMgmnt/Sections/finance_section";
import UserWiseSections from "../container/forms/adminMgmnt/Sections/user_wise_section";
import CodeDefination from "../container/forms/adminMgmnt/General Masters/code_defination";
import DivisionMaster from "../container/forms/adminMgmnt/General Masters/division_master";
import CurrencyMaster from "../container/forms/adminMgmnt/General Masters/currency_master";
import EmailDescription from "../container/forms/adminMgmnt/General Masters/email_description";
import EmailAlertMaster from "../container/forms/adminMgmnt/General Masters/email_alert_master";
import CalendarForm from "../container/forms/adminMgmnt/General Masters/calendar";
import NormalInvoicing from "../container/forms/salesMgmnt/Invoicing/normal_invoicing";
import ScrapInvoicing from "../container/forms/salesMgmnt/Invoicing/scrap_invoicing";
import ServiceInvoice from "../container/forms/salesMgmnt/Invoicing/service_invoice";
import SalesReturn from "../container/forms/salesMgmnt/Invoicing/sales_return";
import SalesOrder from "../container/forms/salesMgmnt/Sales Order Processing/sales_order";
import ServiceOrder from "../container/forms/salesMgmnt/Sales Order Processing/service_order";
import ProductMaster from "../container/forms/salesMgmnt/Masters/product_master";
import CustomerMaster from "../container/forms/salesMgmnt/Masters/customer_master";
import UnitMaster from "../container/forms/InventoryMgmnt/Masters/unit_master";
import ItemMaster from "../container/forms/InventoryMgmnt/Masters/Item_master";
import UnitConversionMaster from "../container/forms/InventoryMgmnt/Masters/unit_conversion_mstr";
import ItemStockOpeningMaster from "../container/forms/InventoryMgmnt/Masters/item_stock_opening_mstr";
import ItemOpeningRateMaster from "../container/forms/InventoryMgmnt/Masters/item_opening_rate_mstr";
import WareHouseMaster from "../container/forms/InventoryMgmnt/Masters/warehouse_master";
import ItemMinMaxStockLevel from "../container/forms/InventoryMgmnt/Masters/item_min_max_stock_level";
import GlRollUpMaster from "../container/forms/financeMgmnt/Masters/gl_rollup_master";
import ItemWiseAccountEntry from "../container/forms/financeMgmnt/Masters/item_wise_account_entry";
import StandardRemarks from "../container/forms/financeMgmnt/Masters/standard_remarks";
import AccountCodeForGst from "../container/forms/financeMgmnt/Masters/account_code_for_gst";
import YearOpeningForBankReco from "../container/forms/financeMgmnt/Masters/year_opening_for_bank_reco";
import BankDetails from "../container/forms/financeMgmnt/Masters/bank_details";
import ApBillEntry from "../container/forms/financeMgmnt/Accounts Payables/ap_bill_entry";
import ExpenseVoucher from "../container/forms/financeMgmnt/Accounts Payables/expense_voucher";
import AccountWiseTdsMaster from "../container/forms/financeMgmnt/Accounts Payables/acc_wise_tds_master";
import VendorTdsDeclaration from "../container/forms/financeMgmnt/Accounts Payables/vendor_tds_declaration";
import PaymentAdvice from "../container/forms/financeMgmnt/Accounts Payables/payment_advise";
import PurchaseVoucherEntry from "../container/forms/financeMgmnt/Accounts Payables/purchase_voucher_entry";
import UnlinkApBill from "../container/forms/financeMgmnt/Accounts Payables/unlink_ap_bill";
import OutstandingPayments from "../container/forms/financeMgmnt/Accounts Receivables/outstanding_payment";
import PaymentReceivedEntry from "../container/forms/financeMgmnt/Accounts Receivables/payment_received_entry";
import CustomerTdsDeclaration from "../container/forms/financeMgmnt/Accounts Receivables/customer_tds_declaration";
import CashVoucher from "../container/forms/financeMgmnt/Vouchers/cash_voucher";
import BankVoucher from "../container/forms/financeMgmnt/Vouchers/bank_voucher";
import JournalVoucher from "../container/forms/financeMgmnt/Vouchers/journal_voucher";
import DebitCreditNote from "../container/forms/financeMgmnt/Vouchers/debit_credit_note";
import ItcEntry from "../container/forms/financeMgmnt/Vouchers/itc";
import BulkUploadVouchers from "../container/forms/financeMgmnt/Vouchers/bulk_upload_vouchers";
import PriceList from "../container/forms/salesMgmnt/Masters/price_list";
import SupplierMaster from "../container/forms/materialMgmnt/Masters/supplier_master";
import PaymentTerm from "../container/forms/materialMgmnt/Masters/payment_term";
import PaymentTermSale from "../container/forms/salesMgmnt/Masters/payment_term_sale";
import PoCategory from "../container/forms/materialMgmnt/Masters/po_category";
import ItemCodeCategoryClassification from "../container/forms/InventoryMgmnt/Masters/item_code_category_classification";
import Gencddsp from "../container/forms/InventoryMgmnt/Masters/Gencddsp";
import GlMaster from "../container/forms/financeMgmnt/Masters/gl_master";
import BankRecoUpload from "../container/forms/financeMgmnt/Masters/bank_reco_statement_upload";
import ChangePassword from "../container/forms/adminMgmnt/User/change_password";
import BalanceSheet from "../container/forms/financeMgmnt/Chart of Accounts/Balance_sheet";
import PlSchdMatConsumption from "../container/forms/financeMgmnt/Chart of Accounts/pl_schd_mat_consmp";
import PlSchdMatConsumptionClose from "../container/forms/financeMgmnt/Chart of Accounts/pl_schd_mat_consmp_close";
import BalanceSheetFormula from "../container/forms/financeMgmnt/Chart of Accounts/balance_sheet_formulae_dtl";
import BalanceSheetInvAccLink from "../container/forms/financeMgmnt/Chart of Accounts/balance_sheet_inv_acc_link";
import ClosingInvForBalance from "../container/forms/financeMgmnt/Chart of Accounts/closing_inv_for_bal_sheet";
import ProvisionForBalanceSheet from "../container/forms/financeMgmnt/Chart of Accounts/provision_for_balance_sheet";
import VoucherAuthLimitDefn from "../container/forms/financeMgmnt/General Ledger/voucher_auth_lim_it_defn";
import VoucherAuthorisation from "../container/forms/financeMgmnt/General Ledger/voucher_auth";
import UnpostingVoucher from "../container/forms/financeMgmnt/General Ledger/unposting_voucher";
import ChequeBookEntry from "../container/forms/financeMgmnt/General Ledger/cheque_book_entry";
import BankRecoEntry from "../container/forms/financeMgmnt/General Ledger/Bank_reco_entry";
import BankRecoUpdation from "../container/forms/financeMgmnt/General Ledger/bank_reco_updation";
import PaymentReverse from "../container/forms/financeMgmnt/General Ledger/payment_reverse";
import ScrapOrder from "../container/forms/salesMgmnt/Sales Order Processing/scrap_order";
import ReverseChargeInvoice from "../container/forms/financeMgmnt/Vouchers/reverse_charge_invoice";
import BlockPaymentOption from "../container/forms/financeMgmnt/Accounts Payables/block_payment_option";
import SaleVoucher from "../container/forms/financeMgmnt/Accounts Receivables/sale_voucher";
import EfaMaster from "../container/forms/memberMgmnt/Loan/efa_master";
import ReferenceVoucher from "../container/forms/financeMgmnt/General Ledger/ReferenceVoucher/reference_vch_no";
import LoanRepayParent from "../container/forms/memberMgmnt/Loan/loan_repayment";
import InvoiceCategory from "../container/forms/salesMgmnt/Invoicing/invoice_category";
import ProductCategory from "../container/forms/salesMgmnt/Masters/product_category";
import BinKard from "../container/forms/InventoryMgmnt/Masters/bin_kard";
import EfaVehicalDetail from "../container/forms/memberMgmnt/Loan/vehical_detail";
import BulkInvoiceUpload from "../container/forms/salesMgmnt/Invoicing/bulk_invoice_upload";
import UserGrantTransfer from "../container/forms/adminMgmnt/User/user_grant_transfer";
import GateEntry from "../container/forms/materialMgmnt/Masters/gate_entry";
import RMGP from "../container/forms/materialMgmnt/Masters/rmgp";
import AccountWiseDtlEntry from "../container/forms/financeMgmnt/General Ledger/acount_wise_dtl_entry";
import InterTransferMemo from "../container/forms/materialMgmnt/Quality/Inter_transfer_memo";
import PurchaseOrder from "../container/forms/materialMgmnt/Masters/purchase_order";
import UpdatePurchaseOrder from "../container/forms/materialMgmnt/Masters/update_purchase_order";
import PoClosure from "../container/forms/materialMgmnt/Masters/po_closure";

import AccCodeForPurchaseVoucher from "../container/forms/financeMgmnt/Accounts Payables/acc_code_for_purchase_vouc";
import PurchaseCategoryDefination from "../container/forms/financeMgmnt/Accounts Payables/purchase_category_defination";
import TransactionMaster from "../container/forms/InventoryMgmnt/Masters/Transaction_master";
import IncomingQualityInspection from "../container/forms/materialMgmnt/Quality/Incoming_quality_inspect";
import MaterialIssue from "../container/forms/materialMgmnt/Quality/material_issue";
import PurchaseVoucher from "../container/forms/financeMgmnt/Accounts Payables/purchase_voucher";
import InvoiceGenBulkMail from "../container/forms/memberMgmnt/Membership/invoice_gen_bulk_mail";
import AllMemberReactReport from "../container/forms/memberMgmnt/Reports/allMemberReactReport";
import ForgotPassword from "../pages/AppLayout/ForgotPassword";

import StockAdjustmentBatch from "../container/forms/materialMgmnt/Masters/stock_adjustment_batch";
import WorInternal from "../container/forms/materialMgmnt/Masters/wor_internal";
import ItemLocationMaster from "../container/forms/InventoryMgmnt/Masters/item_location_master";
import BalanceSheetForm from "../container/forms/financeMgmnt/Accounts Payables/balance_sheet_report";


import PhysicalInventory from "../container/forms/InventoryMgmnt/Masters/physical_Inventory";
import UpdatePhysicalInventory from "../container/forms/InventoryMgmnt/Masters/update_Physical_Inventory";
import UploadPhysicalInventory from "../container/forms/InventoryMgmnt/Masters/upload_Physical_Inventory";
import MaterialAcceptance from "../container/forms/InventoryMgmnt/Reports/materialAcceptance";
import MaterialIssuePrinting from "../container/forms/InventoryMgmnt/Reports/materialIssuePrinting";
import IncomingMaterialDetail from "../container/forms/InventoryMgmnt/Reports/incomingMaterialDetail";

import DepartmentMaster from "../container/forms/hrMgmnt/Master/department";
import GradeCategory from "../container/forms/hrMgmnt/Master/grade_category" 
import Grade from "../container/forms/hrMgmnt/Master/grade"
import ContractorMaster from "../container/forms/hrMgmnt/Master/contractor_master"
import DailyBulletin from "../container/forms/hrMgmnt/Master/daily_bulletin"
import Increaments from "../container/forms/hrMgmnt/Master/increaments"

import UserCreation from "../container/forms/adminMgmnt/User/user_creation";
import BulkUploadBills from "../container/forms/financeMgmnt/Masters/bulk_upload_bills";
import UploadUpdatedMemberDtl from "../container/forms/memberMgmnt/Membership/upload_updated_member_detail";
import ItemMasterListing from"../container/forms/InventoryMgmnt/Reports/itemMasterListing";

import EmfaStatusAllMembers from "../container/forms/memberMgmnt/Reports/emfa_status_all_members";
import Bom from "../container/forms/InventoryMgmnt/Masters/Bom";
import RoutingMaintenance from "../container/forms/InventoryMgmnt/Masters/routing_maintenance";
import DefineOperation from "../container/forms/InventoryMgmnt/Masters/Define_Operation";
import CopyRouting from "../container/forms/InventoryMgmnt/Masters/copy_routing";
import AuditTrail from"../container/forms/financeMgmnt/Reports/auditTrial";
import BulkUploadJV from "../container/forms/financeMgmnt/Vouchers/bulk_upload_jv";
import UploadedDocumentTracker from "../container/forms/financeMgmnt/Masters/uploaded_document_tracker";
import BulkPoCreation from "../container/forms/materialMgmnt/Masters/bulk_po_creation";

import RateMaster from "../container/forms/materialMgmnt/Masters/rate_master";
import CustomerRateMaster from "../container/forms/salesMgmnt/Masters/customer_rate_master";
import ItemWiseDealerSubsidy from "../container/forms/materialMgmnt/Masters/item_wise_dealer_subsidy";

import BulkPrinting from "../container/forms/financeMgmnt/Vouchers/bulk_printing";
// import QrGenerator from "../container/forms/salesMgmnt/Invoicing/qr_generator";
import NRGP from "../container/forms/materialMgmnt/Masters/nrgp";
import ItemStockLedger from "../container/forms/InventoryMgmnt/Reports/itenStockledger";
import PODump from "../container/forms/materialMgmnt/Reports/po_dump";
import DlrSubsidyAccountMstr from "../container/forms/financeMgmnt/Masters/dlr_subsidy_account_mstr"
import PendingPOAuth from "../container/forms/materialMgmnt/Masters/pending_po_auth";
import StagingPurchaseVoucher from "../container/forms/financeMgmnt/Vouchers/staging_purchase_voucher";
import SaleReturn from "../container/forms/salesMgmnt/Reports/sale_return";


import EmailNotify from "../container/forms/adminMgmnt/Email Notification/notification";
import VoucherReport from "../container/forms/financeMgmnt/Reports/VoucherReport";
import ITCRecord from "../container/forms/financeMgmnt/Reports/ITCRecord";
import GlRollUpBSPL from "../container/forms/financeMgmnt/Masters/gl_rollup_BSPL";

const moduleRoutes = [
  //  ####  ---- Membership Management ----  ####
  //  Membership
  { path: "10101", element: <DealerUploading /> }, // todo fix bug as it not render
  { path: "10102", element: <MembershipOnboarding /> },
  { path: "10103", element: <UploadUpdatedMemberDtl /> },
  // { path: "10103", element: <FormPage /> }, //todo remove it

  //  Loan

  { path: "10201", element: <EfaMaster /> },
  { path: "10202", element: <LoanMaster /> },
  { path: "10203", element: <LoanRepayParent /> },
  { path: "10205", element: <EfaVehicalDetail /> },

  // report invoice generation and bulk mail

  { path: "10307", element: <InvoiceGenBulkMail /> },
  // { path: "10308", element: <AllMemberReactReport /> },
    { path: "10308", element: <EmfaStatusAllMembers /> },


  //  ####  ---- Sales Management ----  ####
  //  Master
  { path: "20101", element: <ProductMaster /> },
  { path: "20102", element: <CustomerMaster /> },
  { path: "20103", element: <PriceList /> },
  { path: "20104", element: <PaymentTermSale /> },
  { path: "20105", element: <ProductCategory /> },
  { path: "20106", element: <CustomerRateMaster /> },

  //  SALES ORDER PROCESSING
  { path: "20201", element: <SalesOrder /> },
  { path: "20202", element: <ServiceOrder /> },
  { path: "20203", element: <ScrapOrder /> },

  //  INVOICING
  { path: "20301", element: <NormalInvoicing /> },
  { path: "20302", element: <ScrapInvoicing /> },
  { path: "20303", element: <ServiceInvoice /> },
  { path: "20304", element: <SalesReturn /> },
  { path: "20305", element: <InvoiceCategory /> },
  { path: "20306", element: <BulkInvoiceUpload /> },
  // { path: "20307", element: <QrGenerator /> },

  //  ####  ---- Inventory Management ----  ####
  //  Masters

  { path: "30101", element: <UnitMaster /> },
  { path: "30102", element: <ItemMaster /> },
  { path: "30103", element: <UnitConversionMaster /> },
  { path: "30104", element: <ItemStockOpeningMaster /> },
  { path: "30105", element: <ItemOpeningRateMaster /> },
  { path: "30106", element: <WareHouseMaster /> },
  { path: "30107", element: <ItemMinMaxStockLevel /> },
  { path: "30108", element: <ItemCodeCategoryClassification /> },
  { path: "30109", element: <Gencddsp /> },
  { path: "30110", element: <BinKard /> },
  { path: "30111", element: <TransactionMaster /> },
  { path: "30112", element: <ItemLocationMaster /> },

  { path: "30115", element: <PhysicalInventory /> },
  { path: "30113", element: <UpdatePhysicalInventory /> },
  { path: "30114", element: <UploadPhysicalInventory /> },

  { path: "30119", element: <Bom /> },
  { path: "30116", element: <RoutingMaintenance /> },
  { path: "30117", element: <DefineOperation /> },
  { path: "30118", element: <CopyRouting /> },

  //  ####  ---- Inventory Management ----  ####

 { path: "30201", element: <MaterialAcceptance /> },
 { path: "30202", element: <MaterialIssuePrinting /> },
 { path: "30203", element: <IncomingMaterialDetail /> },
 { path: "30204", element: <ItemMasterListing /> },
 { path: "30205", element: <ItemStockLedger /> },


  //  ####  ---- Finance Management ----  ####
  //  Masters
  { path: "40101", element: <GlRollUpMaster /> },
  { path: "40102", element: <ItemWiseAccountEntry /> },
  { path: "40103", element: <StandardRemarks /> },
  { path: "40104", element: <StateWiseGstMaster /> },
  { path: "40105", element: <AccountCodeForGst /> },
  { path: "40106", element: <YearOpeningForBankReco /> },
  { path: "40107", element: <BankDetails /> },
  { path: "40108", element: <BankRecoUpload /> },
  { path: "40109", element: <GlMaster /> },
  { path: "40110", element: <BulkUploadBills /> },
  { path: "40111", element: <UploadedDocumentTracker /> },
    { path: "40112", element: <DlrSubsidyAccountMstr /> },
     { path: "40113", element: <GlRollUpBSPL /> },

  //  Accounts Payables
  { path: "40201", element: <ApBillEntry /> },
  { path: "40202", element: <ExpenseVoucher /> },
  { path: "40203", element: <BlockPaymentOption /> },
  { path: "40204", element: <AccountWiseTdsMaster /> },
  { path: "40205", element: <VendorTdsDeclaration /> },
  { path: "40206", element: <PaymentAdvice /> },
  // { path: "40207", element: <PurchaseVoucherEntry /> }, 
  { path: "40208", element: <UnlinkApBill /> },
  { path: "40209", element: <AccCodeForPurchaseVoucher /> },
  { path: "40210", element: <PurchaseCategoryDefination /> },
  { path: "40211", element: <PurchaseVoucher /> }, 


  // { path: "40299", element: <ExpenseBill /> }, // todo : this is old version need to be remove

  //  Accounts Receivables
  { path: "40301", element: <OutstandingPayments /> },
  { path: "40302", element: <PaymentReceivedEntry /> },
  { path: "40303", element: <CustomerTdsDeclaration /> },
  { path: "40304", element: <SaleVoucher /> },

  //  Vouchers
  { path: "40401", element: <CashVoucher /> },
  { path: "40402", element: <BankVoucher /> },
  { path: "40403", element: <JournalVoucher /> },
  { path: "40404", element: <DebitCreditNote /> },
  { path: "40405", element: <DebitCreditNotesPayment /> },
  { path: "40406", element: <ItcEntry /> },
  { path: "40407", element: <BulkUploadVouchers /> },
  { path: "40408", element: <ReverseChargeInvoice /> },
  { path: "40409", element: <BulkUploadJV /> },
  { path: "40410", element: <BulkPrinting/> },
  { path: "40411", element: <StagingPurchaseVoucher/> },

  //  Chart of Accounts
  { path: "40501", element: <BalanceSheet /> },
  { path: "40502", element: <PlSchdMatConsumption /> },
  { path: "40503", element: <PlSchdMatConsumptionClose /> },
  { path: "40504", element: <BalanceSheetFormula /> },
  { path: "40505", element: <BalanceSheetInvAccLink /> },
  { path: "40506", element: <ClosingInvForBalance /> },
  { path: "40507", element: <ProvisionForBalanceSheet /> },

  //  General Ledger
  { path: "40601", element: <VoucherAuthLimitDefn /> },
  { path: "40602", element: <VoucherAuthorisation /> },
  { path: "40603", element: <UnpostingVoucher /> },
  { path: "40604", element: <ChequeBookEntry /> },
  { path: "40605", element: <BankRecoEntry /> },
  { path: "40606", element: <BankRecoUpdation /> },
  { path: "40607", element: <PaymentReverse /> },
  { path: "40608", element: <AccountWiseDtlEntry /> },

// BalanceSheetForm
    { path: "40614", element: <BalanceSheetForm /> }, // Report for BalanceSheet
    { path: "40714", element: <AuditTrail /> },


  //  ####  ---- Admin Management ----  ####
  //  User
  { path: "50101", element: <UserMasterNew /> },
  { path: "50102", element: <UserActivity /> },
  { path: "50103", element: <DashboardUserRights /> },
  { path: "50104", element: <DashboardLinkRights /> },
  { path: "50105", element: <ChangePassword /> },
  { path: "50106", element: <UserGrantTransfer /> },
    { path: "50107", element: <UserCreation /> },

  //  FINANCIAL
  { path: "50201", element: <FinancialYearOpenUpdation /> },
  { path: "50202", element: <FinancialYearOpenPeriod /> },
  // { path: "50203", element: <FinancialPeriodClosing/> },

  //  PARAMETER
  { path: "50301", element: <GeneralParameters /> },
  { path: "50302", element: <DivisionWiseParameters /> },
  { path: "50303", element: <AgeingParameters /> },
  { path: "50304", element: <TaxParameterMaster /> },
  // { path: "50300", element: <AgeParameter/> },
  // { path: "503000", element: <PoCategory/> },


  // { path: "50399", element: <DivisionMasterOld/> },

  //  SECTION
  { path: "50401", element: <FinanceSection /> },
  { path: "50402", element: <UserWiseSections /> },

  //  GENERAL MASTERS
  { path: "50501", element: <CodeDefination /> },
  { path: "50502", element: <DivisionMaster /> },
  { path: "50503", element: <CurrencyMaster /> },
  { path: "50504", element: <EmailDescription /> },
  { path: "50505", element: <EmailAlertMaster /> },
  { path: "50506", element: <CalendarForm /> },
  { path: "50507", element: <StatewiseMasterNew /> },

  //  ####  ---- Material/Purchase Management ----  ####

  //  Masters
  { path: "60101", element: <SupplierMaster /> },
  { path: "60102", element: <PoCategory /> },
  { path: "60103", element: <PaymentTerm /> },
  { path: "40700", element: <ReferenceVoucher /> },
  { path: "60106", element: <GateEntry /> },
  { path: "60110", element: <RMGP /> },
  { path: "70101", element: <InterTransferMemo /> },
  { path: "70102", element: <IncomingQualityInspection /> },
  { path: "70103", element: <MaterialIssue /> },
  { path: "60111", element: <PurchaseOrder /> },
  { path: "60112", element: <StockAdjustmentBatch /> },
  { path: "60113", element: <WorInternal /> },
  { path: "60115", element: <BulkPoCreation /> },
  { path: "60114", element: <RateMaster /> },
  { path: "60116", element: <ItemWiseDealerSubsidy /> },
  { path: "60117", element: <NRGP /> },
  { path: "60118", element: <PendingPOAuth /> },
  { path: "60119", element: <UpdatePurchaseOrder /> },
  { path: "60120", element: <PoClosure /> },


  //  ####  ---- HR Management ----  ####
  //  Masters
  { path: "80101", element: <DepartmentMaster /> },
  { path: "80102", element: <GradeCategory /> },
  { path: "80103", element: <Grade /> },
  { path: "80104", element: <ContractorMaster /> },
  { path: "80105", element: <DailyBulletin /> },
  { path: "80106", element: <Increaments /> },

    // ### ---- Email Notification
  { path: "50601", element: <EmailNotify/> }

];


const reportRoutes = [
  // Membership
  {
    path: "10301",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Member_reports/form_members_report.PHP`}
      />
    ),
  },
  {
    path: "10302",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/dealer_report/form_dealer_report.PHP`}
      />
    ),
  },
  {
    path: "10303",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/pan_card_wise_vendor/form_pan_card_wise_tds.php`}
      />
    ),
  },
  {
    path: "10204",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/full_and_final_closure/form_full_final_closure.php`}
      />
    ),
  },

  //Loan
  {
    path: "10304",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/loan_status/form_loan_status.php`}
      />
    ),
  },
  {
    path: "10305",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/EMI_overdue_ageing/form_emi_overdue_ageing.php`}
      />
    ),
  },
  {
    path: "10306",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/loan_ledger_all_mem/form_loan_ledger_all_mem.php`}
      />
    ),
  },

  // Sales
  {
    path: "20401",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/sales_by_state/form_sales_state.php`}
      />
    ),
  },
  {
    path: "20402",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/sales_by_customer/form_sales_by_customer.php`}
      />
    ),
  },
  {
    path: "20403",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Invoice_summary/form_dispatch_reg_summ.php`}
      />
    ),
  },
  {
    path: "20404",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/ITEM_WISE_GST_RPT_HSN_WISE/form_gst_rpt_hsn_wise.php`}
      />
    ),
  },
  {
    path: "20405",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/B2B_GST_WISE_SALE/form_b2b_gst_wise.php`}
      />
    ),
  },

  {path: "20406", element: <SaleReturn />},


  // Finance
  {
    path: "40701",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/GSTR1_GST3B/form_gst_number_wise.php`}
      />
    ),
  },
  {
    path: "40702",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/bank_book/form_bank_book.php`}
      />
    ),
  },
  {
    path: "40703",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/account_ledger/form_account_ledger.php`}
      />
    ),
  },
  {
    path: "40715",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/account_ledger_member/form_account_ledger_member.php`}
      />
    ),
  },
  {
    path: "40716",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/dealer_credit_balance/form_dealer_credit_balance.php`}
      />
    ),
  },
  {
    path: "40704",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Bank_reco/form_bank_reco.php`}
      />
    ),
  },
  {
    path: "40705",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Party_ledger_dump/form_rep_vw_gl_kard_4_opt.php`}
      />
    ),
  },
  {
    path: "40706",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Debtors_outstanding/form_debtor_outstanding.php`}
      />
    ),
  },
  {
    path: "40707",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Creditors_outstanding/form_creditor_outstanding.php`}
      />
    ),
  },
  {
    path: "40708",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Customer_Receipt/form_customer_receipt.php`}
      />
    ),
  },
  {
    path: "40709",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Purchase_Voucher/form_purchase_vouch.php`}
      />
    ),
  },
  {
    path: "40710",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Expense_voucher/form_expense_vouch.php`}
      />
    ),
  },
  {
    path: "40711",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Open_Grn_Pending_For_bill_booking/form_open_grn_pend_bill_booking.php`}
      />
    ),
  },
  {
    path: "40712",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Purchase_Book/form_purchase_book.php`}
      />
    ),
  },
  {
    path: "40713",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/trial_balance/form_trial_balance.php`}
      />
    ),
    
  },
   { path: "40730", element: <VoucherReport /> },
   { path: "40731", element: <ITCRecord /> },

  // Material / purchase
  {
    path: "60201",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Vendor_detail/rep_vend.php`}
      />
    ),
  },
  {
    path: "60202",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Vendor_Item_wise_Purchase/form_vendor_item_purchase.PHP`}
      />
    ),
  },
  {
    path: "60203",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Vendor_Wise_Total_Purchase/form_rep_vend_purchase.php`}
      />
    ),
  },
  {
    path: "60204",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Daily_Material_Receipt/form_daily_material.php`}
      />
    ),
  },
  {
    path: "60205",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/Monthly_purchase_summ/form_monthly_purchase_summ.php`}
      />
    ),
  },
   {
    path: "30206",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/issue_stock_report/form_issue_stock_report.php`}
      />
    ),
  },
   {
    path: "30207",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/item_issue_to/form_item_issue_to_report.php`}
      />
    ),
  },
   {
    path: "40720",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/pan_card_wise_tds/form_pan_card_wise_tds_report.php`}
      />
    ),
  },
   {
    path: "40725",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/balance_sheet_pl_period_wise/form_balance_sheet_pl_period_wise.php`}
      />
    ),
  },
   {
    path: "40726",
    element: (
      <ShowReport
        url={`http://13.235.80.101:80/EDDAL/voucher_dump/form_voucher_dump.php`}
      />
    ),
  },
  {path:'60206', element:<PODump/>}
];

export const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        {" "}
        <MainLayout />{" "}
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <WelcomeHome /> },
      { path: "erp", element: <WelcomeERP /> },
      { path: "user-profile", element: <UserProfile /> }, // Add UserProfile route here

      // FOR ALL FORMS
      {
        path: "/module/:moduleId",
        element: <ModuleWelcome />,
        children: [
          { index: true, element: <ModuleMenuPage /> },
          ...moduleRoutes,
        ],
      },

      // FOR ALL REPORT
      {
        path: "/module/:moduleId",
        element: <ModuleWelcome />,
        children: [
          { index: true, element: <ModuleMenuPage /> },
          { path: "form-items/:formId", element: <FormItemsPage /> },
          ...reportRoutes,
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterUser /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
];
