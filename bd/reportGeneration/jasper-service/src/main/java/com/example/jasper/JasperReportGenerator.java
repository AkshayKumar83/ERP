
// package com.example.jasper;

// import net.sf.jasperreports.engine.*;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

// import java.io.*;
// import java.sql.Connection;
// import java.sql.DriverManager;
// import java.util.HashMap;
// import java.util.Map;

// public class JasperReportGenerator {
//     private static final Logger logger = LoggerFactory.getLogger(JasperReportGenerator.class);

//     // Define the paths for reports and compiled Jasper files

//     private static final String REPORTS_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/reports/";
//     // private static final String REPORTS_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/reports/expenseReport.pdf";
//     private static final String JASPER_FILES_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/jasper-service/src/main/resources/reports/";

//     public static void main(String[] args) {
//         if (args.length < 2) {
//             logger.error("Usage: java JasperReportGenerator <reportName> <paramName>=<paramValue> [...]");
//             System.exit(1);
//         }

//         // Extract report name correctly
//         String reportName = args[0];
//         if (reportName.contains("=")) {
//             reportName = reportName.split("=")[1];  // Extracts value after '='
//         }

//         Map<String, Object> parameters = new HashMap<>();

//         // Extract dynamic parameters from command-line arguments
//         // for (int i = 1; i < args.length; i++) {
//         //     String[] paramParts = args[i].split("=", 2);
//         //     if (paramParts.length == 2) {
//         //         parameters.put(paramParts[0], paramParts[1]);
//         //     } else {
//         //         logger.warn("Invalid parameter format: {}", args[i]);
//         //     }
//         // }
//         for (int i = 1; i < args.length; i++) {
//             String[] paramParts = args[i].split("=", 2);
//             if (paramParts.length == 2) {
//                 String paramName = paramParts[0];
//                 String paramData = paramParts[1];
        
//                 // Expecting format Type:Value
//                 String[] dataParts = paramData.split(":", 2);
//                 if (dataParts.length == 2) {
//                     String type = dataParts[0];
//                     String value = dataParts[1];
        
//                     switch (type.toLowerCase()) {
//                         case "integer":
//                             parameters.put(paramName, Integer.valueOf(value));
//                             break;
//                         case "double":
//                             parameters.put(paramName, Double.valueOf(value));
//                             break;
//                         case "boolean":
//                             parameters.put(paramName, Boolean.valueOf(value));
//                             break;
//                         case "string":
//                             parameters.put(paramName, value);
//                             break;
//                         default:
//                             logger.warn("Unknown type '{}'. Treating as String.", type);
//                             parameters.put(paramName, value);
//                     }
        
//                     logger.info("Parsed parameter: {} (Type: {}) = {}", paramName, type, value);
//                 } else {
//                     logger.warn("Invalid parameter format (missing type): {}", args[i]);
//                 }
//             } else {
//                 logger.warn("Invalid parameter format: {}", args[i]);
//             }
//         }
        

//         generateReport(reportName, parameters);
//     }

//     public static String generateReport(String reportName, Map<String, Object> parameters) {
//         String pdfPath = REPORTS_DIRECTORY + reportName + ".pdf";

//         try (Connection connection = getDatabaseConnection()) {
//             logger.info("Database connected successfully!");

//             // Load the Jasper report file
//             String jasperFilePath = getReportAbsolutePath(reportName);
//             logger.debug("Report parameters set: {}", parameters);

//             // Fill the report
//             logger.info("Filling the report...");
//             JasperPrint jasperPrint = JasperFillManager.fillReport(jasperFilePath, parameters, connection);

//             // Ensure the reports directory exists
//             File reportDirectory = new File(REPORTS_DIRECTORY);
//             if (!reportDirectory.exists()) {
//                 reportDirectory.mkdirs(); // Create directory if it doesn’t exist
//             }

//             // Export report to PDF
//             try (FileOutputStream fos = new FileOutputStream(pdfPath)) {
//                 JasperExportManager.exportReportToPdfStream(jasperPrint, fos);
//             }

//             logger.info("{} report generated at: {}", reportName, pdfPath);
//             return pdfPath;
//         } catch (Exception e) {
//             logger.error("Error generating report", e);
//             return null;
//         }
//     }

//     private static Connection getDatabaseConnection() throws Exception {
//         String dbUrl = "jdbc:postgresql://192.168.1.117:5432/BOLDROCCHI";
//         String dbUser = "postgres";
//         String dbPassword = "infogen1";
//         // String dbUrl = "jdbc:postgresql://192.168.1.117:5432/BOLDROCCHI";
//         // String dbUser = "postgres";
//         // String dbPassword = "infogen1";
//         return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
//     }

//     private static String getReportAbsolutePath(String reportName) throws FileNotFoundException {
//         String reportPath = JASPER_FILES_DIRECTORY + reportName + ".jasper";
//         File reportFile = new File(reportPath);

//         if (!reportFile.exists()) {
//             throw new FileNotFoundException("Jasper report file not found: " + reportPath);
//         }

//         return reportFile.getAbsolutePath();
//     }
// }

//todo: commented the code before written on 22-07-2025


// package com.example.jasper;

// import net.sf.jasperreports.engine.*;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

// import java.io.*;
// import java.sql.Connection;
// import java.sql.DriverManager;
// import java.util.HashMap;
// import java.util.Map;

// public class JasperReportGenerator {
//     private static final Logger logger = LoggerFactory.getLogger(JasperReportGenerator.class);

//     private static final String REPORTS_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/reports/";
//     private static final String JASPER_FILES_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/jasper-service/src/main/resources/reports/";

//     public static void main(String[] args) {
//         if (args.length < 2) {
//             logger.error("Usage: java JasperReportGenerator <reportName> <paramName>=<paramValue> [...]");
//             System.exit(1);
//         }

//         // Extract report name correctly
//         String reportName = args[0];
//         if (reportName.contains("=")) {
//             reportName = reportName.split("=")[1];
//         }

//         Map<String, Object> parameters = new HashMap<>();

//         // Parse all CLI arguments into parameters map
//         for (int i = 1; i < args.length; i++) {
//             String[] paramParts = args[i].split("=", 2);
//             if (paramParts.length == 2) {
//                 String paramName = paramParts[0];
//                 String paramData = paramParts[1];

//                 String[] dataParts = paramData.split(":", 2);
//                 if (dataParts.length == 2) {
//                     String type = dataParts[0];
//                     String value = dataParts[1];

//                     switch (type.toLowerCase()) {
//                         case "integer":
//                             parameters.put(paramName, Integer.valueOf(value));
//                             break;
//                         case "double":
//                             parameters.put(paramName, Double.valueOf(value));
//                             break;
//                         case "boolean":
//                             parameters.put(paramName, Boolean.valueOf(value));
//                             break;
//                         case "string":
//                             parameters.put(paramName, value);
//                             break;
//                         default:
//                             logger.warn("Unknown type '{}'. Treating as String.", type);
//                             parameters.put(paramName, value);
//                     }

//                     logger.info("Parsed parameter: {} (Type: {}) = {}", paramName, type, value);
//                 } else {
//                     logger.warn("Invalid parameter format (missing type): {}", args[i]);
//                 }
//             } else {
//                 logger.warn("Invalid parameter format: {}", args[i]);
//             }
//         }

//         generateReport(reportName, parameters);
//     }

//     public static String generateReport(String reportName, Map<String, Object> parameters) {
//         // Use 'custom_output' param if provided, else default to reportName
//         String customOutputName = parameters.containsKey("custom_output")
//                 ? parameters.get("custom_output").toString()
//                 : reportName;

//         String pdfPath = REPORTS_DIRECTORY + customOutputName + ".pdf";

//         // Remove 'custom_output' so Jasper doesn’t get confused
//         parameters.remove("custom_output");

//         try (Connection connection = getDatabaseConnection()) {
//             logger.info("Database connected successfully!");

//             String jasperFilePath = getReportAbsolutePath(reportName);
//             logger.debug("Report parameters set: {}", parameters);

//             logger.info("Filling the report...");
//             JasperPrint jasperPrint = JasperFillManager.fillReport(jasperFilePath, parameters, connection);

//             File reportDirectory = new File(REPORTS_DIRECTORY);
//             if (!reportDirectory.exists()) {
//                 reportDirectory.mkdirs();
//             }

//             try (FileOutputStream fos = new FileOutputStream(pdfPath)) {
//                 JasperExportManager.exportReportToPdfStream(jasperPrint, fos);
//             }

//             logger.info("{} report generated at: {}", customOutputName, pdfPath);
//             return pdfPath;
//         } catch (Exception e) {
//             logger.error("Error generating report", e);
//             return null;
//         }
//     }

//     private static Connection getDatabaseConnection() throws Exception {
//         String dbUrl = "jdbc:postgresql://192.168.1.117:5432/BOLDROCCHI";
//         String dbUser = "postgres";
//         String dbPassword = "infogen1";
//         return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
//     }

//     private static String getReportAbsolutePath(String reportName) throws FileNotFoundException {
//         String reportPath = JASPER_FILES_DIRECTORY + reportName + ".jasper";
//         File reportFile = new File(reportPath);

//         if (!reportFile.exists()) {
//             throw new FileNotFoundException("Jasper report file not found: " + reportPath);
//         }

//         return reportFile.getAbsolutePath();
//     }
// }



package com.example.jasper;

import net.sf.jasperreports.engine.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.HashMap;
import java.util.Map;
import java.sql.Date;

public class JasperReportGenerator {
    private static final Logger logger = LoggerFactory.getLogger(JasperReportGenerator.class);

    private static final String REPORTS_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/reports/";
    private static final String JASPER_FILES_DIRECTORY = "D:/EDDAL/BACKEND/reportGeneration/jasper-service/src/main/resources/reports/";

    public static void main(String[] args) {
        if (args.length < 2) {
            logger.error("❌ Missing required arguments: reportName or outputFileName");
            System.exit(1);
        }

        String reportName = null;
        String outputFileName = null;
        Map<String, Object> parameters = new HashMap<>();

        for (String arg : args) {
            if (arg.startsWith("reportName=")) {
                reportName = arg.substring("reportName=".length());
            } else if (arg.startsWith("outputFileName=")) {
                outputFileName = arg.substring("outputFileName=".length());
            } else {
                String[] parts = arg.split("=", 2);
                if (parts.length == 2) {
                    String paramName = parts[0];
                    String[] typeVal = parts[1].split(":", 2);
                    if (typeVal.length == 2) {
                        String type = typeVal[0];
                        String value = typeVal[1];
                       switch (type.toLowerCase()) {
                            case "integer": parameters.put(paramName, Integer.parseInt(value)); break;
                            case "double": parameters.put(paramName, Double.parseDouble(value)); break;
                            case "boolean": parameters.put(paramName, Boolean.parseBoolean(value)); break;
                            case "long": parameters.put(paramName, Long.parseLong(value)); break;
                            case "date": parameters.put(paramName, Date.valueOf(value));break;
                            case "string":
                            default: parameters.put(paramName, value); break;
                        }
                        logger.info("Parsed parameter: {} (Type: {}) = {}", paramName, type, value);
                    }
                }
            }
        }

        if (reportName == null || outputFileName == null) {
            logger.error("❌ Missing required arguments: reportName or outputFileName");
            System.exit(1);
        }

        // Ensure final filename ends with .pdf
        if (!outputFileName.toLowerCase().endsWith(".pdf")) {
            outputFileName += ".pdf";
        }

        generateReport(reportName, parameters, outputFileName);
    }

    public static void generateReport(String reportName, Map<String, Object> parameters, String outputFileName) {
        String pdfPath = REPORTS_DIRECTORY + outputFileName;

        try (Connection connection = getDatabaseConnection()) {
            logger.info("Database connected successfully!");
            String jasperPath = getReportAbsolutePath(reportName);

            logger.info("Report parameters set: {}", parameters);
            logger.info("Filling the report...");

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperPath, parameters, connection);

            File reportDir = new File(REPORTS_DIRECTORY);
            if (!reportDir.exists()) reportDir.mkdirs();

            try (FileOutputStream fos = new FileOutputStream(pdfPath)) {
                JasperExportManager.exportReportToPdfStream(jasperPrint, fos);
            }

            logger.info("✅ Report generated at: {}", pdfPath);
        } catch (Exception e) {
            logger.error("❌ Error generating report", e);
        }
    }

    private static Connection getDatabaseConnection() throws Exception {
        return DriverManager.getConnection(
            "jdbc:postgresql://13.235.80.101:5432/eddal", "postgres", "infogen1_IITPL"
        );
    }

    private static String getReportAbsolutePath(String reportName) throws FileNotFoundException {
        File file = new File(JASPER_FILES_DIRECTORY + reportName + ".jasper");
        if (!file.exists()) throw new FileNotFoundException("Report not found: " + file.getAbsolutePath());
        return file.getAbsolutePath();
    }
}
