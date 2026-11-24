const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function markdownToHtml(title, mdContent, isRtl = false) {
  let html = mdContent
    .replace(/^# (.*$)/gim, '<h1 style="color:#C85A32; font-size: 24px; border-bottom: 2px solid #C85A32; padding-bottom: 8px; margin-bottom: 16px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#1C2526; font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#334155; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">$1</h3>')
    .replace(/^\* (.*$)/gim, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>')
    .replace(/^1\. (.*$)/gim, '<li style="margin-left: 20px; list-style-type: decimal;">$1</li>')
    .replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; color: #c85a32; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return `<!DOCTYPE html>
<html lang="${isRtl ? 'ar' : 'en'}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: ${isRtl ? "'Segoe UI', 'Cairo', Tahoma, sans-serif" : "'Segoe UI', Arial, sans-serif"}; padding: 40px; color: #1e293b; line-height: 1.6; font-size: 13px; }
    h1, h2, h3 { page-break-after: avoid; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: ${isRtl ? 'right' : 'left'}; }
    th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
    tr:nth-child(even) { background-color: #f1f5f9; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

function generatePdfs() {
  console.log('Generating PDF files for Tester Guides...');

  const enMd = fs.readFileSync(path.join(__dirname, 'TESTER_GUIDE_EN.md'), 'utf8');
  const arMd = fs.readFileSync(path.join(__dirname, 'TESTER_GUIDE_AR.md'), 'utf8');

  const enHtmlPath = path.join(__dirname, 'TESTER_GUIDE_EN.html');
  const arHtmlPath = path.join(__dirname, 'TESTER_GUIDE_AR.html');

  fs.writeFileSync(enHtmlPath, markdownToHtml('Fi Byti - English Testing Guide', enMd, false));
  fs.writeFileSync(arHtmlPath, markdownToHtml('Fi Byti - دليل الاختبار الشامل باللغة العربية', arMd, true));

  const enPdfPath = path.join(__dirname, 'TESTER_GUIDE_EN.pdf');
  const arPdfPath = path.join(__dirname, 'TESTER_GUIDE_AR.pdf');

  try {
    console.log('Converting EN HTML to PDF via Edge Headless...');
    execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${enPdfPath}" "${enHtmlPath}"`, { timeout: 15000 });
    console.log('✓ TESTER_GUIDE_EN.pdf generated successfully!');

    console.log('Converting AR HTML to PDF via Edge Headless...');
    execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${arPdfPath}" "${arHtmlPath}"`, { timeout: 15000 });
    console.log('✓ TESTER_GUIDE_AR.pdf generated successfully!');
  } catch (err) {
    console.error('PDF generation result:', err.message);
  }
}

generatePdfs();
