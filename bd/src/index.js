require("dotenv").config();
const express = require("express");
const { connectToDatabase } = require("./config/dbConnection");
const setupMiddleware = require("./middleware/general");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORT = process.env.SERVER_PORT || 3080;
const server = express();

const { db } = require("./config/dbConnection");
const emailQueue = require("./utility/emailQueue");

// MIDDLEWARE SETUPzxasA
setupMiddleware(server);

const uploadPath = path.join(__dirname, "../loan_doc");


server.use("/uploads", express.static(uploadPath));


server.post("/api/v1/generate-report/exp_vch", async (req, res) => {
  const { pVch_no } = req.body;

  if (!pVch_no) {
    return res.status(400).json({ error: "Missing pVch_no" });
  }

  let transType, voucherId, refId;
  let reportName = null;
  let params = {};

  try {
    // Step 1: Identify transaction
    const result = await db.query(
      `select trans_type, voucher_id from thfmtran where voucher_no = $1`,
      [pVch_no]
    );

    if (result.rows.length > 0) {
      transType = result.rows[0].trans_type;
      voucherId = result.rows[0].voucher_id;
    } else {

      const cash = await db.query(
        `select trans_type, ref_id from thfmcash where ref_no = $1`,
        [pVch_no]
      );
      if (cash.rows.length > 0) {
        transType = cash.rows[0].trans_type;
        refId = cash.rows[0].ref_id;
      } else {
        const bank = await db.query(
          `select trans_type, ref_id from thfmbank where ref_no = $1`,
          [pVch_no]
        );
        if (bank.rows.length > 0) {
          transType = bank.rows[0].trans_type;
          refId = bank.rows[0].ref_id;
        } else {
          return res.status(400).json({ message: "No Report Exist" });
        }
      }

    }


    // Step 2: Determine report and params
    if (transType === "P0") {
      reportName = "exp_vch";
      await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
        voucherId,
        transType,
        0,
      ]);
      params = {
        pVch_id: { type: "Integer", value: voucherId },
        PCompany_name: { type: "String", value: "Eddal" },
        PDiv: { type: "Integer", value: 1 },
      };
    }else if(['P1','P4'].includes(transType)){
      // console.log('inside purch block', transType)
        reportName = "purch_vch";
        await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [ voucherId, transType, 0]);
      params = {
        pVch_id: { type: "Integer", value: voucherId },
        PCompany_name: { type: "String", value: "Eddal" },
        PDiv: { type: "Integer", value: 1 },
      };
    }else if (transType.startsWith("B") && voucherId) {
      reportName = "bank_vch";
      await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
        voucherId,
        transType,
        0,
      ]);
      // params = {
      //   pVoucher_id: { type: "Integer", value: voucherId },
      // };
       params = {
        pRef_id: { type: "Integer", value: voucherId },
        pDiv_name: { type: "String", value: "UNIT-1" },
        pAddress: { type: "String", value: "FARIDABAD" },
      };
    } else if (transType.startsWith("C") && refId) {
      reportName = "cash_vch";
      await db.query(`call proc_voucher_print_temp(null,$1,$2,$3)`, [
        refId,
        transType,
        0,
      ]);

      params = {
        Ref_id: { type: "Integer", value: refId },
        PCompany_name: { type: "String", value: "Eddal" },
        pDiv_name: { type: "String", value: "Unit-1" },
      };
    } else if (transType.startsWith("J")) {
      reportName = "jrnl_vch";
      await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
        voucherId,
        transType,
        0,
      ]);
      params = {
        pVch_id: { type: "Integer", value: voucherId },
        PCompany_name: { type: "String", value: "Eddal" },
        PDiv: { type: "Integer", value: 1 },
      };
    }else if (transType.startsWith("RN" ||"DN")) {
      console.log('inside dbcr block')
      reportName = "dbcr";
      await db.query(`call proc_voucher_print_temp($1,null,$2,$3)`, [
        voucherId,
        transType,
        0,
      ]);
      params = {
        pVch_id: { type: "Integer", value: voucherId },
        PCompany_name: { type: "String", value: "Eddal" },
        PDiv: { type: "Integer", value: 1 },
      };
    } else {
      return res.status(400).json({ error: "Report type not supported" });
    }

    // Step 3: Generate report
    const JAR_PATH = path.resolve(
      __dirname,
      "../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar"
    );
    const REPORT_DIR = path.resolve(__dirname, "../reportGeneration/reports/");
    const outputFileName = `${reportName}_${pVch_no.replace(/[\/]/g, "-")}.pdf`;
    const fullOutputPath = path.join(REPORT_DIR, outputFileName);

    // Add outputFileName param for Java CLI
    const paramString = Object.entries(params)
      .map(([key, { type, value }]) => `${key}=${type}:${value}`)
      .concat([`outputFileName=${outputFileName}`]) // 👈 key line
      .join(" ");

    const command = `java -jar "${JAR_PATH}" reportName="${reportName}" ${paramString}`;
    console.log(`🖨 Generating report: ${outputFileName}`);

    exec(
      command,
      { cwd: path.dirname(JAR_PATH), shell: true },
      (error, stdout, stderr) => {
        console.log(stdout);
        if (error || stderr) {
          console.error("❌ Jasper Error:", error?.message || stderr);
          return res.status(500).json({ error: "Failed to generate report" });
        }

        // Wait for file to flush to disk
        setTimeout(() => {
          if (!fs.existsSync(fullOutputPath)) {
            return res
              .status(500)
              .json({ error: "Report not found after generation" });
          }

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${outputFileName}"`
          );
          return res.sendFile(fullOutputPath);
        }, 400);
      }
    );
  } catch (err) {
    console.error("💥 Internal Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.post('api/v1/auth/email-login', async (req, res) => {
try {

    const { token } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userRes = await db.query(
      `
      SELECT *
      FROM user_master
      WHERE user_id = $1
      `,
      [decoded.user_id]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: userRes.rows[0],
    });

  } catch (err) {

    return res.status(401).json({
      message: "Invalid token",
    });

  }

})


// IMPORTS AND USE ROUTES FOR ALL FORMS AND REPORTS MODULES


// AUTH SERVICE
const auth = require("./Routes/auth");


const changeFinYear = require("./Routes/erp/changeFinYear");
const changeDivision = require("./Routes/erp/changeDivision");


// MEMBERSHIP MANAGEMENT
const dealerUpoadData = require("./Routes/MemberManagement/dealerUpload");
const memberOnboardMaster = require("./Routes/MemberManagement/memberOnboardMaster");


const efaMaster = require("./Routes/MemberManagement/loan/efaMaster");
const loanRepayment = require("./Routes/MemberManagement/loan/loanRepay");
const loanMaster = require("./Routes/MemberManagement/loan/loanMaster");
const vehicalDetail = require("./Routes/MemberManagement/loan/vehicalDetail");
const invoiceGenBulkMail = require("./Routes/MemberManagement/invoiceAndBulkMail")
const memberReport = require("./Routes/MemberManagement/memberReport")
const uploadUpdatedMemberDtl = require("./Routes/MemberManagement/updateMemberDetailUpload")


// ADMIN MANAGEMENT
const codeDefination = require("./Routes/adminModule/forms/codeDefination");
const userMaster = require("./Routes/adminModule/forms/userMaster");
const division_master = require("./Routes/adminModule/forms/DivisionMaster");
const financial_year_open = require("./Routes/adminModule/forms/FinancialYearOpen");
const year_open_update = require("./Routes/adminModule/forms/YearOpenUpdation");
const user_activity = require("./Routes/adminModule/forms/UserActivity");
const statewise_master = require("./Routes/adminModule/forms/StatewiseMaster");
const age_parameter = require("./Routes/adminModule/forms/AgeParameter");
const general_parameter = require(`./Routes/adminModule/forms/GeneralParameter`);
const email_master = require(`./Routes/adminModule/forms/EmailMaster`);
const email_description = require(`./Routes/adminModule/forms/EmailDescription`);
const taxparamstr = require("./Routes/adminModule/forms/TaxParameterMaster");
const divWiseParam = require("./Routes/adminModule/forms/divisionWiseParam");
const change_password = require(`./Routes/adminModule/forms/ChangePassword`); 
const user_creation = require(`./Routes/adminModule/forms/UserCreation`);
const finance_section = require(`./Routes/adminModule/forms/financeSection`);
const user_section = require(`./Routes/adminModule/forms/userSection`);
const dashBoardUserRight = require(`./Routes/adminModule/forms/dashBoardUserRight`)
const dashboardLinkRights = require(`./Routes/adminModule/forms/dashboardLinkRights`)

const currMstr = require("./Routes/adminModule/forms/currencymaster");
const appAuthorizationCtrl = require("./Routes/adminModule/authorization");

const emailNotify =  require("./Routes/adminModule/forms/emailNotification");

// FINANCE MANAGEMENT
const expenseVoucher = require("./Routes/finance/expenseBillVoucher");
const stateWiseGst = require("./Routes/finance/stateWiseGst");
const gstAccMstr = require("./Routes/finance/gstAccountMstr");
const glMaster = require("./Routes/finance/GlMaster");
const cashVoucherRoutes = require("./Routes/finance/cashVoucher");
const bankVoucher = require("./Routes/finance/bankVoucher");
const saleVoucher = require("./Routes/finance/saleVoucher");
const journalVoucher = require("./Routes/finance/journalVoucher");
const bankDetails = require("./Routes/finance/bankDetails");
const itcEntry = require("./Routes/finance/ItcEntry");
const pymtRvrs = require("./Routes/finance/paymentReversal");
const stdRem = require("./Routes/finance/standardRemark");
const accWiseTdsMstr = require("./Routes/finance/accWiseTdsMstr");
const glRollUpMstr = require("./Routes/finance/GlRollUpMaster");
const bulkVoucherUpload = require("./Routes/finance/bulkVoucherUpload");
const vendorTdsDeclare = require("./Routes/finance/vendorTDSDec");
const debitCreditNote = require("./Routes/finance/debitCreditNote");
const gstDebitCreditNote = require("./Routes/finance/gstDebitCreditNote");
const unpostingVoucher = require("./Routes/finance/unpostingVoucher");
const itemWiseAccEntry = require("./Routes/finance/itemWiseAccEntry");
const accWIseDtlEntry = require("./Routes/finance/accWiseDtlEntry/index");
const balanceSheetAccLink = require('./Routes/finance/balanceSheetAccLink'); 
const closingInvBalSheet = require(`./Routes/finance/closingInvBalSheet`);
const balSheetFormulaeDtl = require(`./Routes/finance/balSheetFormualeDtl`);
const BalanceSheetProfitAndLoss = require('./Routes/finance/BalanceSheetProfitAndLoss/index')
const purchaseVchrEntry = require('./Routes/finance/purchaseVchrEntry/index')
const unlinkApBill = require('./Routes/finance/unlinkApBill/index')
const ReverseChargeInvoice = require('./Routes/finance/ReverseChargeInvoice/index')
const ChequeBookEntry = require('./Routes/finance/chequeBookEntry')
const accCodeForPurcVoch = require('./Routes/finance/accCodePurcVoch')
const outstandingPayment = require('./Routes/finance/outstandingPayment')
const voucherAuthorisation = require('./Routes/finance/voucherAuth')
const purchaseCategoryDefination = require('./Routes/finance/purchaseCategoryDefination')
const blockPayment = require("./Routes/finance/blockPayment")
const purchaseVoucher = require("./Routes/finance/purchaseVoucher");  // copy from expense bill
const customerTDSDec = require('./Routes/finance/customerTDSDec')
const bulkUploadBill = require('./Routes/finance/bulkUploadBill')
const auditTrail = require('./Routes/finance/reports/auditTrail')
const bulkUploadJV = require('./Routes/finance/bulkUploadJV')
const uploadedDocTracker = require('./Routes/finance/uploadedDocTracker')
const dlrSubsidyAccMstr = require('./Routes/finance/dlrSubsidyAccMstr')
const stagingPurchaseVoucher = require('./Routes/finance/stagingPurchVchr')
const voucherReport = require('./Routes/finance/reports/voucherReport')
const itcRecord = require('./Routes/finance/reports/itcRecord')
const glRollUpBSPL = require("./Routes/finance/GlRollUpBSPL");


// PURCHAGE MANAGEMENT
const poCategory = require("./Routes/purchase/poCategory");
const paymentTerm = require("./Routes/purchase/paymentTerm");
const supplierMaster = require("./Routes/purchase/supplierMaster");
const interTransferMemo = require("./Routes/purchase/interTransferMemo");
const incomingQualityInspection = require("./Routes/purchase/incomingQualityInspection");
const materialIssue = require("./Routes/purchase/materailIssue")
const purchaseOrder = require("./Routes/purchase/purchaseOrder")
const stockAdjustment = require("./Routes/purchase/stockAdjustmentBatch");
const worInternal = require("./Routes/purchase/worInternal");
const gateEntry = require("./Routes/purchase/gateEntry")
const rmgp = require("./Routes/purchase/rmgp");
const nrgp = require("./Routes/purchase/nrgp");
const poDump = require("./Routes/purchase/reports/poDump");
const pendingPoAuth = require("./Routes/purchase/pendingPoAuth");
const updatePurchaseOrder = require("./Routes/purchase/updatePurchaseOrder");
const poClosure = require("./Routes/purchase/poClosure");

// SALE MANAGEMENT
const custMaster = require("./Routes/saleManagement/customerMaster");
const saleOrder = require("./Routes/saleManagement/salesOrder/index");
const productMaster = require("./Routes/saleManagement/productMaster");
const invoiceCategory = require("./Routes/saleManagement/invoiceCategory");
const productCategory = require("./Routes/saleManagement/productCategory");
const serviceInvoice = require("./Routes/saleManagement/serviceInvoice");
const normalInvoice = require("./Routes/saleManagement/normalInvoice");
const priceList = require("./Routes/saleManagement/priceList");
const paymentTermSale = require("./Routes/saleManagement/paymentTermSale");
const bulkInvUpd = require("./Routes/saleManagement/bulkInvUpload");
const sendEmail = require("./Routes/saleManagement/bulkInvSendEmail");
const saleReturn = require("./Routes/saleManagement/saleReturn")
const customerRateMaster = require("./Routes/saleManagement/customerRateMaster")


// const genQR = require("./Routes/saleManagement/qrGenerator")


// WH MANAGEMENT
const binKard = require("./Routes/whManagement/reports/binKard");
const unitMaster = require("./Routes/whManagement/forms/unitMaster");
const unitConvMaster = require("./Routes/whManagement/forms/unitConvMaster");
const itemStockOpngMstr = require("./Routes/whManagement/forms/itemStockOpngMstr");
const itemCodeCtgCls = require("./Routes/whManagement/forms/itemCodeCtgCls");
const workCenter = require("./Routes/whManagement/forms/workCenter");
const inventoryManagementRoutes = require("./Routes/inventoryManagement");
const itemOpeningRateMstr = require("./Routes/whManagement/forms/itemOpeningRateMstr");
const transactionMaster = require('./Routes/whManagement/forms/transactionMaster_temp');
const itemMinMaxStockLevel = require('./Routes/whManagement/forms/itemMinMaxstkLevel');
const itemLocationMaster = require("./Routes/inventoryManagement/itemLocationMaster");

const physicalInventory = require('./Routes/whManagement/forms/physicalInventory')
const uploadPhysicalInventory = require('./Routes/whManagement/forms/uploadPhyInv')
const updatePhysicalInventory = require('./Routes/whManagement/forms/updatePhyInv')
const materialAcceptance = require('./Routes/whManagement/reports/materialAcceptance')
const materialIssuePrinting = require('./Routes/whManagement/reports/materialIssuePrinting')
const incomingMaterialDetail = require('./Routes/whManagement/reports/incomingMaterialDetail')
const itemMasterListing = require('./Routes/whManagement/reports/itemMasterListing')
const billOfMaterials = require('./Routes/whManagement/forms/billOfMaterials')
const routeMaintenance = require('./Routes/whManagement/forms/routeMaintenance')
const defineOperation = require('./Routes/whManagement/forms/defineOperations')
const copyRouting = require('./Routes/whManagement/forms/copyRouting')
const itemStockLedger = require('./Routes/whManagement/reports/itemStockLedger')


//HR MANAGEMENT
const departmentMster = require("./Routes/hrManagement/deptMaster");
const gradeCategory = require("./Routes/hrManagement/gradeCategory");
const grade = require("./Routes/hrManagement/grade");
const contractMaster = require("./Routes/hrManagement/contractMaster");
const dailyBulletin = require("./Routes/hrManagement/dailyBulletin"); 
const increaments = require("./Routes/hrManagement/increament");


const rateMaster = require("./Routes/purchase/rateMaster")
const bulkPoCreation = require("./Routes/purchase/bulkPoCreation")
const itemWiseDealerSubsidy = require("./Routes/purchase/itemWiseDealerSubsidy")
const bulkPrinting = require("./Routes/finance/bulkPrinting")

const PurchaseDashboard =require("./Routes/purchase/Dashboard")
const MemberDashboard =require("./Routes/MemberManagement/Dashboard")
const SaleDashboard =require("./Routes/saleManagement/Dashboard")
const FinanceDashboard =require("./Routes/finance/Dashboard/index")

const saleReturnReport =require("./Routes/saleManagement/Reports/saleReturn/index")

const { userAuth } = require("./middleware/auth");

// APP LIBRARY METHODS
const appLib = require("./Routes/appLib");

// USE ROUTES
server.use("/api/v1/auth", auth); // AUTH SERVICE

//todo #### uncomment this below middleware in production
server.use(userAuth) //applying middleware in each routes

server.use("/api/v1/upload", dealerUpoadData);
server.use("/api/v1/fin-year", changeFinYear);
server.use("/api/v1/division", changeDivision);
server.use("/api/v1/form-module", memberOnboardMaster);
server.use("/api/v1/code-definition", codeDefination);
server.use("/api/v1/user-master", userMaster);
server.use("/api/v1/division-master", division_master);
server.use("/api/v1/financial-year", financial_year_open);
server.use("/api/v1/exp-vchr", expenseVoucher);
server.use("/api/v1/po-category", poCategory);
server.use("/api/v1/pay-term", paymentTerm);
server.use("/api/v1/sup-mstr", supplierMaster);
server.use("/api/v1/bin-kard", binKard);
server.use("/api/v1/state-wise-gst", stateWiseGst);
server.use("/api/v1/gst-acc-mstr", gstAccMstr);
server.use("/api/v1/year-open", year_open_update);
server.use("/api/v1/user-activity", user_activity);
server.use("/api/v1/state-master", statewise_master);
server.use("/api/v1/cust-mstr", custMaster);
server.use("/api/v1/age-parameter", age_parameter);
server.use("/api/v1/gen-param", general_parameter);
server.use("/api/v1/gl-master", glMaster);
server.use("/api/v1/cash-vchr", cashVoucherRoutes);
server.use("/api/v1/efa-mstr", efaMaster);
server.use("/api/v1/unit-mstr", unitMaster);
server.use("/api/v1/unit-conv-mstr", unitConvMaster);
server.use("/api/v1/itm-stock-opn-mstr", itemStockOpngMstr);
server.use("/api/v1/email-master", email_master);
server.use("/api/v1/email-description", email_description);
server.use("/api/v1/bank-voucher", bankVoucher);
server.use("/api/v1/sale-voucher", saleVoucher);
server.use("/api/v1/journal-voucher", journalVoucher);
server.use("/api/v1/change-password", change_password);
server.use("/api/v1/finance-section", finance_section);
server.use("/api/v1/user-section", user_section);
server.use("/api/v1/tax-para-mstr", taxparamstr);
server.use("/api/v1/div-wise-param", divWiseParam);
server.use("/api/v1/curr-mstr", currMstr);
server.use("/api/v1/pymnt-rvrs", pymtRvrs);
server.use("/api/v1/std-rem", stdRem);
server.use("/api/v1/item-cd-ctg-cls", itemCodeCtgCls);
server.use("/api/v1/bank-details", bankDetails);
server.use("/api/v1/itc-entry", itcEntry);
server.use("/api/v1/sales-order/", saleOrder);
server.use("/api/v1/gl-rollup-mstr", glRollUpMstr);
server.use("/api/v1/it-mngmnt", inventoryManagementRoutes);
server.use("/api/v1/emi-repayment", loanRepayment);
server.use("/api/v1/loan-master", loanMaster);
server.use("/api/v1/acc-wise-tds-mstr", accWiseTdsMstr);
server.use("/api/v1/blk-upld-vch", bulkVoucherUpload);
server.use("/api/v1/product-mstr", productMaster);
server.use("/api/v1/invoice-category", invoiceCategory);
server.use("/api/v1/product-category", productCategory);
server.use("/api/v1/vendor-tds", vendorTdsDeclare);
server.use("/api/v1/service-invoice", serviceInvoice);
server.use("/api/v1/normal-invoice", normalInvoice);
server.use("/api/v1/price-list", priceList);
server.use("/api/v1/pay-term-sale", paymentTermSale);
server.use("/api/v1/vehical-dtl", vehicalDetail);
server.use("/api/v1/blk-upld-inv", bulkInvUpd); // bulk inv upload/member-contrebuition
server.use("/api/v1/debit-credit-note", debitCreditNote);
server.use("/api/v1/gst-debit-credit-note", gstDebitCreditNote);
server.use("/api/v1/work-center", workCenter);
server.use("/api/v1/lib", appLib);
server.use("/api/v1/unposting-voucher", unpostingVoucher);
server.use("/api/v1/balance-sheet-acc-link", balanceSheetAccLink);
server.use("/api/v1/closing-inv-bal-sheet", closingInvBalSheet);
server.use("/api/v1/item-wise-acc-entry", itemWiseAccEntry);
server.use("/api/v1/acc-wise-dtl-entry", accWIseDtlEntry);
server.use("/api/v1/send-email", sendEmail);
server.use("/api/v1/inter-transfer-memo", interTransferMemo);
server.use("/api/v1/bal-sheet-formulae-dtl", balSheetFormulaeDtl);
server.use("/api/v1/bal-sheet-profit-loss",BalanceSheetProfitAndLoss);
server.use("/api/v1/pur-vchr-entry",purchaseVchrEntry);
server.use("/api/v1/unlink-ap-bill",unlinkApBill);
server.use("/api/v1/item-opening-rate-mstr", itemOpeningRateMstr);
server.use("/api/v1/dashboard-user-right",dashBoardUserRight);
server.use("/api/v1/db-link-rights",dashboardLinkRights);
server.use("/api/v1/rev-chrg-inv",ReverseChargeInvoice);
server.use("/api/v1/trans-mstr",transactionMaster);
server.use("/api/v1/item-min-max-stock",itemMinMaxStockLevel);
server.use("/api/v1/prch-ordr", purchaseOrder);
server.use('/api/v1/cheque-book-entry',ChequeBookEntry);
server.use('/api/v1/acc-code-purc-voch',accCodeForPurcVoch)
server.use('/api/v1/outstnd-pymt',outstandingPayment)
server.use('/api/v1/vouch-auth',voucherAuthorisation)
server.use('/api/v1/purch-ctgy-dfnt',purchaseCategoryDefination)
server.use("/api/v1/incoming-quality-inspect", incomingQualityInspection);
server.use("/api/v1/material-issue", materialIssue);
server.use("/api/v1/block-payment", blockPayment)
server.use("/api/v1/stock-adjustment-batch",  stockAdjustment)
server.use("/api/v1/item-location-master", itemLocationMaster )
server.use("/api/v1/wor-internal",worInternal )
server.use("/api/v1/purc-vchr", purchaseVoucher); // copy from expense bill
server.use("/api/v1/inv-bulk-mail", invoiceGenBulkMail)
server.use("/api/v1/member",memberReport)
server.use('/api/v1/physical-inv',physicalInventory)
server.use('/api/v1/upload-phy-inv',uploadPhysicalInventory)
server.use('/api/v1/update-phy-inv',updatePhysicalInventory)
server.use('/api/v1/material-accptn',materialAcceptance)
server.use('/api/v1/material-issue-printing',materialIssuePrinting)
server.use('/api/v1/incoming-material-detail',incomingMaterialDetail)
server.use('/api/v1/cus-tds-dec',customerTDSDec)
server.use("/api/v1/gate-entry", gateEntry); 
server.use("/api/v1/dept-mstr", departmentMster);
server.use("/api/v1/user-creation", user_creation);
server.use("/api/v1/grd-cat", gradeCategory);
server.use("/api/v1/grade", grade);
server.use("/api/v1/cont-mstr", contractMaster);
server.use("/api/v1/daily-bulletin", dailyBulletin);
server.use("/api/v1/increament", increaments);
server.use("/api/v1/rmgp", rmgp);
server.use("/api/v1/blk-upl-bill", bulkUploadBill);
server.use("/api/v1/blk-upl-upd-member-dtl",uploadUpdatedMemberDtl)
server.use("/api/v1/item-mstr-listing",itemMasterListing)
server.use("/api/v1/bill-of-material", billOfMaterials);
server.use("/api/v1/route-maintenance", routeMaintenance);
server.use("/api/v1/define-operation", defineOperation);
server.use("/api/v1/copy-routing", copyRouting); 
server.use("/api/v1/audit-trail",auditTrail)
server.use("/api/v1/bulk-upl-jv", bulkUploadJV)
server.use("/api/v1/upld-doc-tracker", uploadedDocTracker);
server.use("/api/v1/sale-return", saleReturn)
server.use("/api/v1/rate-mstr", rateMaster);
server.use("/api/v1/bulk_po_creation", bulkPoCreation);
server.use("/api/v1/customer-rate-mstr", customerRateMaster);
server.use("/api/v1/item-wise-dealer-subsidy", itemWiseDealerSubsidy);
server.use("/api/v1/bulk-printing", bulkPrinting);
// server.use("/api/v1/qr", genQR);
server.use("/api/v1/nrgp", nrgp);
server.use("/api/v1/item-stock-ledger", itemStockLedger);
server.use("/api/v1/po-dump", poDump);
server.use("/api/v1/dlr-subsidy-acc-mstr", dlrSubsidyAccMstr);
server.use("/api/v1/pending-po-auth", pendingPoAuth);
server.use("/api/v1/staging-purch-vchr", stagingPurchaseVoucher);
server.use("/api/v1/update-purchase-order", updatePurchaseOrder);
server.use("/api/v1/po-closure", poClosure);
server.use("/api/v1/purchase-dashboard",PurchaseDashboard);
server.use("/api/v1/member-dashboard",MemberDashboard);
server.use("/api/v1/sale-dashboard",SaleDashboard);
server.use("/api/v1/fin-dashboard",FinanceDashboard);
server.use("/api/v1/sale-return-report",saleReturnReport);


server.use("/api/v1/email-notify", emailNotify);
server.use("/api/v1/rights", appAuthorizationCtrl);


 server.use("/api/v1/voucher-report", voucherReport);
 server.use("/api/v1/itc-record",itcRecord)

  server.use("/api/v1/gl-rollup-bspl", glRollUpBSPL);

// STARTING SERVER AFTER DB SUCCESSFULLY CONNECTED
const startServer = async () => {
  await connectToDatabase();


  await emailQueue.start();
  console.log("✅ pg-boss started");

  await emailQueue.createQueue("email-queue");
  console.log("✅ email-queue ready");

  server.listen(PORT, "0.0.0.0", () =>
    console.log(`Server is running on port ${PORT}`)
  );
};

startServer();
