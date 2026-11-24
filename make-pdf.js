const fs = require('fs');
const path = require('path');

function textToPdf(title, textContent, outputPath) {
  const lines = textContent.split('\n');
  const pdfOperations = [];

  pdfOperations.push("BT");
  pdfOperations.push("/F1 16 Tf");
  pdfOperations.push("1 0 0 1 50 780 Tm");
  pdfOperations.push(`(${escapePdf(title)}) Tj`);
  pdfOperations.push("ET");

  let y = 740;
  pdfOperations.push("BT");
  pdfOperations.push("/F1 10 Tf");
  pdfOperations.push("12 TL");
  pdfOperations.push(`1 0 0 1 50 ${y} Tm`);

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      y -= 14;
      pdfOperations.push("ET");
      pdfOperations.push("BT");
      pdfOperations.push(`/F1 10 Tf 1 0 0 1 50 ${y} Tm`);
      continue;
    }

    if (y < 60) {
      // Basic page overflow handling
      break;
    }

    if (line.startsWith('# ')) {
      pdfOperations.push("/F1 14 Tf");
      pdfOperations.push(`(${escapePdf(line.replace('# ', ''))}) Tj`);
      pdfOperations.push("T*");
      pdfOperations.push("/F1 10 Tf");
      y -= 20;
    } else if (line.startsWith('## ')) {
      pdfOperations.push("/F1 12 Tf");
      pdfOperations.push(`(${escapePdf(line.replace('## ', ''))}) Tj`);
      pdfOperations.push("T*");
      pdfOperations.push("/F1 10 Tf");
      y -= 16;
    } else if (line.startsWith('### ')) {
      pdfOperations.push("/F1 11 Tf");
      pdfOperations.push(`(${escapePdf(line.replace('### ', ''))}) Tj`);
      pdfOperations.push("T*");
      pdfOperations.push("/F1 10 Tf");
      y -= 14;
    } else {
      // Truncate / split long lines
      const clean = line.replace(/[*`#]/g, '');
      const chunks = splitTextIntoLines(clean, 85);
      for (let chunk of chunks) {
        pdfOperations.push(`(${escapePdf(chunk)}) Tj`);
        pdfOperations.push("T*");
        y -= 12;
      }
    }
  }

  pdfOperations.push("ET");

  const streamContent = pdfOperations.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000233 00000 n
0000000305 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${360 + streamLength}
%%EOF`;

  fs.writeFileSync(outputPath, pdf, 'binary');
  console.log(`✓ PDF generated: ${path.basename(outputPath)} (${fs.statSync(outputPath).size} bytes)`);
}

function escapePdf(str) {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function splitTextIntoLines(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (let w of words) {
    if ((current + ' ' + w).length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += (current ? ' ' : '') + w;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

const enMd = fs.readFileSync(path.join(__dirname, 'TESTER_GUIDE_EN.md'), 'utf8');
const arMd = fs.readFileSync(path.join(__dirname, 'TESTER_GUIDE_AR.md'), 'utf8');

textToPdf('Fi Byti - English Testing Guide', enMd, path.join(__dirname, 'TESTER_GUIDE_EN.pdf'));
textToPdf('Fi Byti - Arabic Testing Guide', arMd, path.join(__dirname, 'TESTER_GUIDE_AR.pdf'));
