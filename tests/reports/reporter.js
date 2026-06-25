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

  // Create Summary Dashboard sheet
  const summarySheet = workbook.addWorksheet('Summary Dashboard');

  // Title block
  summarySheet.mergeCells('A1:D1');
  const sumTitleRow = summarySheet.getRow(1);
  sumTitleRow.getCell(1).value = 'PAYBUDDY WEB E2E TEST ANALYSIS DASHBOARD';
  sumTitleRow.getCell(1).font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  sumTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }; // Dark charcoal/slate
  sumTitleRow.height = 35;

  summarySheet.addRow([]); // Blank spacer

  const totalCount = testResults.length;
  const passedCount = testResults.filter(r => r.status === 'Passed').length;
  const failedCount = testResults.filter(r => r.status === 'Failed').length;
  const passPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  
  // Calculate average response time
  const msValues = testResults
    .map(r => {
      const match = r.time && r.time.match(/^(\d+)ms$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(val => val > 0);
  const avgResponseTime = msValues.length > 0 ? Math.round(msValues.reduce((a, b) => a + b, 0) / msValues.length) : 0;
  const overallStatus = failedCount === 0 ? 'PASS' : 'FAIL';

  const addSumRow = (label, val) => {
    const r = summarySheet.addRow([label, val]);
    r.height = 22;
    r.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true };
    r.getCell(2).font = { name: 'Segoe UI', size: 10 };
    r.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    r.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    r.getCell(2).alignment = { horizontal: 'center' };
    return r;
  };

  addSumRow('Total Test Cases', totalCount);
  addSumRow('Passed', passedCount);
  addSumRow('Failed', failedCount);
  addSumRow('Pass Percentage', `${passPercent}%`);
  addSumRow('Average Response Time', `${avgResponseTime}ms`);
  
  const statusRow = summarySheet.addRow(['Overall Status', overallStatus]);
  statusRow.height = 26;
  statusRow.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  statusRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
  statusRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  statusRow.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true, color: overallStatus === 'PASS' ? { argb: 'FF065F46' } : { argb: 'FF991B1B' } };
  statusRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: overallStatus === 'PASS' ? { argb: 'D1FAE5' } : { argb: 'FEE2E2' } };
  statusRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

  summarySheet.addRow([]); // Blank spacer
  summarySheet.addRow([]); // Blank spacer

  // Category Breakdown table
  const breakHeader = summarySheet.addRow(['Category', 'Total Tests', 'Passed', 'Failed']);
  breakHeader.height = 24;
  breakHeader.eachCell(c => {
    c.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } }; // medium gray
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  categories.forEach(cat => {
    const list = groupedResults[cat] || [];
    const p = list.filter(t => t.status === 'Passed').length;
    const f = list.filter(t => t.status === 'Failed').length;
    const row = summarySheet.addRow([cat, list.length, p, f]);
    row.height = 20;
    row.eachCell((cell, colIndex) => {
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
      if (colIndex > 1) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  summarySheet.getColumn(1).width = 28;
  summarySheet.getColumn(2).width = 16;
  summarySheet.getColumn(3).width = 12;
  summarySheet.getColumn(4).width = 12;

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

  // Write to GitHub Actions summary if running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      const summaryPath = process.env.GITHUB_STEP_SUMMARY;
      const statusEmoji = overallStatus === 'PASS' ? '🟢 PASS' : '🔴 FAIL';
      
      let md = `## 📊 PayBuddy Web E2E Test Execution Summary\n\n`;
      md += `| Metric | Value |\n`;
      md += `| :--- | :--- |\n`;
      md += `| **Total Test Cases** | ${totalCount} |\n`;
      md += `| **Passed** | ✅ ${passedCount} |\n`;
      md += `| **Failed** | ${failedCount > 0 ? '❌ ' : ''}${failedCount} |\n`;
      md += `| **Pass Percentage** | **${passPercent}%** |\n`;
      md += `| **Average Response Time** | ⏱️ ${avgResponseTime}ms |\n`;
      md += `| **Overall Status** | **${statusEmoji}** |\n\n`;

      md += `### 📂 Category Breakdown\n\n`;
      md += `| Category | Total Tests | Passed | Failed | Pass % |\n`;
      md += `| :--- | :---: | :---: | :---: | :---: |\n`;
      categories.forEach(cat => {
        const list = groupedResults[cat] || [];
        const p = list.filter(t => t.status === 'Passed').length;
        const f = list.filter(t => t.status === 'Failed').length;
        const pct = list.length > 0 ? Math.round((p / list.length) * 100) : 0;
        md += `| **${cat}** | ${list.length} | ${p} | ${f} | ${pct}% |\n`;
      });
      md += `\n`;

      fs.appendFileSync(summaryPath, md, 'utf8');
      console.log('Successfully wrote E2E test results to GITHUB_STEP_SUMMARY');
    } catch (summaryErr) {
      console.warn(`[WARNING] Failed to write to GITHUB_STEP_SUMMARY: ${summaryErr.message}`);
    }
  }
}

module.exports = { generateReport };
