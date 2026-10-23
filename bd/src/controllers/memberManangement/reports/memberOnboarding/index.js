const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const ExcelJS = require('exceljs');
const fs = require('fs');
const catchAsync = require('../../../../utility/catchAsync');

// for Pdf Report
async function downloadPdf(req, res) {
    try {
        // Create a new PDF Document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);

        // Add content to the PDF
        page.drawText("Sample PDF Report", {
            x: 50,
            y: 350,
            size: 25,
            color: rgb(0, 0, 0),
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Set the response type to 'application/pdf'
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

        // Send the generated PDF
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF");
    }
}




// for Excel Report

const downloadExcel = catchAsync(async(req, res, next) => {
    console.log('downloadExcel function call');
    console.log('data for Excel', {...req.body});
    try {
        const { membership, directory } = req.body;
        // transform directory
        const deletekeysFromDirectory = ['id','desigRelation','bloodGroup','mobileNo', 'emailId','resAdd','resPhone','memberStatus']
       const newDirectoryData = [...directory]
       const transformDirectoryData = newDirectoryData.map(item => {
        deletekeysFromDirectory.forEach(key => {
            if (item.hasOwnProperty(key)) {
                delete item[key];
            }
        });
        return item; // Return the transformed item
    });

    //transform familyDetails
    let familyDetail=[]
    const deleteKeysFromFamilyData = ['id','desigRelation','bloodGroup','mobileNo', 'emailId','resAdd','resPhone','memberStatus', 'involmentInBusiness', 'status']
         directory.forEach(dir=>{
            familyDetail = [...familyDetail,...dir?.['familyDetails']]
        })

        familyDetail.forEach(item=>{
            deleteKeysFromFamilyData.forEach(key => {
                if (item.hasOwnProperty(key)) {
                    delete item[key];
                }
            });
        })
        // console.log('familyDetail after con :', familyDetail)

        const workbook = new ExcelJS.Workbook();

        // Membership Sheet
        const membershipSheet = workbook.addWorksheet('Membership');
        membershipSheet.columns = Object.keys(membership).map(key => ({ header: key, key: key, width: 20 }));
        membershipSheet.addRow(membership);
        membershipSheet.getRow(1).font = { bold: true };

        // Directory Sheet
        const directorySheet = workbook.addWorksheet('Directory');
        transformDirectoryData.forEach((dirObj, index) => {
            // Directory data
            const directoryHeaders = Object.keys(dirObj).filter(key => key !== 'familyDetails');
            directorySheet.columns = directoryHeaders.map(key => ({ header: key, key: key, width: 20 }));
            directorySheet.addRow(dirObj);
           directorySheet.getRow(1).font = { bold: true };
        });

          // Family Member Sheet
          const familyDataSheet = workbook.addWorksheet('Family Member Sheet');
          familyDetail.forEach((fmly, index) => {
              // Directory data
              const familyHeaders = Object.keys(fmly)
              familyDataSheet.columns = familyHeaders.map(key => ({ header: key, key: key, width: 20 }));
              familyDataSheet.addRow(fmly);
              familyDataSheet.getRow(1).font = { bold: true };
          });
      


        // Apply styles and borders
        workbook.eachSheet((sheet) => {
            sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
            });
        });

        // Generate the Excel file buffer
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Error generating Excel');
    }
});


// handle both pdf and excel report
async function handleReport(req, res){
    if(req?.query?.generate_report === 'member-pdf'){
        await downloadPdf(req, res)
    }else if(req?.query?.generate_report === 'member-excel'){
        await downloadExcel(req, res)
    }
}



module.exports ={handleReport}
