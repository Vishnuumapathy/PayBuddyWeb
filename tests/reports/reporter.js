const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateReport(testResults) {
  if (!testResults || testResults.length === 0) {
    return;
  }

  // Detect suite type
  const firstId = testResults[0].id || '';
  const suiteType = firstId.startsWith('TC-WEB') ? 'web' : 'mobile';
  
  // If this is a mobile suite run, we do not want to generate/modify the report
  if (suiteType === 'mobile') {
    console.log('Skipping report generation for Mobile tests.');
    return;
  }

  const reportPath = path.join(__dirname, 'Test_Analysis_Report.xlsx');
  const workbook = new ExcelJS.Workbook();

  // Try to load existing report to preserve any current structure
  if (fs.existsSync(reportPath)) {
    try {
      await workbook.xlsx.readFile(reportPath);
    } catch (e) {
      console.log('Starting fresh workbook.', e.message);
    }
  }

  // Explicitly remove the Summary Dashboard, Mobile Details, Web Details, and old template sheet if they exist
  const sheetsToRemove = ['Summary Dashboard', 'Mobile Test Details', 'Test Analysis Report', 'Web Test Details'];
  sheetsToRemove.forEach(name => {
    try {
      const sheet = workbook.getWorksheet(name);
      if (sheet) {
        workbook.removeWorksheet(sheet.id);
      }
    } catch (e) {
      // Ignore removal issues
    }
  });

  // Group test results by category
  const groupedResults = {};
  testResults.forEach(result => {
    const cat = result.category || 'General';
    if (!groupedResults[cat]) {
      groupedResults[cat] = [];
    }
    groupedResults[cat].push(result);
  });

  // Define order of categories
  const categoryOrder = ['UI/UX', 'Functional', 'Unit', 'Validation', 'Deployment'];
  const categories = Object.keys(groupedResults).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Helper to sanitize category names for Excel sheets (no /, \, ?, *, :, [, ])
  function sanitizeSheetName(name) {
    let sanitized = name.replace(/[\\/?:*[\]]/g, '-');
    return sanitized.substring(0, 30);
  }

  // Create a separate worksheet for each category
  categories.forEach(category => {
    const sheetName = sanitizeSheetName(category);
    let sheet = workbook.getWorksheet(sheetName);
    if (sheet) {
      try {
        workbook.removeWorksheet(sheet.id);
      } catch (e) {}
    }
    sheet = workbook.addWorksheet(sheetName);

    // Setup sheet columns
    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Test Case Description', key: 'description', width: 50 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Execution Time', key: 'time', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];

    // Style Header
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' } // Slate gray
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Populate data
    groupedResults[category].forEach(result => {
      const row = sheet.addRow(result);
      row.height = 20;
      
      // Formatting cells
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      const statusCell = row.getCell('status');
      statusCell.alignment = { horizontal: 'center' };
      if (result.status === 'Passed') {
        statusCell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF27AE60' }, bold: true };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F8F5' } };
      } else {
        statusCell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FFC0392B' }, bold: true };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDF2E9' } };
      }
    });
  });

  // Save changes
  try {
    await workbook.xlsx.writeFile(reportPath);
    console.log(`Excel report successfully generated/updated at: ${reportPath}`);
  } catch (err) {
    console.warn(`\n[WARNING] Failed to write Excel report: ${err.message}.\nIf the file is open in Excel, please close it and run the tests again.\n`);
  }
}

module.exports = { generateReport };
