import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { SheetData, CellData } from '@/components/xsheets/SpreadsheetGrid';
import type { Slide } from '@/components/xslides/SlideCanvas';

// ─── PDF generation (pure HTML→print) ───
function printToPDF(htmlContent: string, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #1a1a1a; }
        h1 { font-size: 28px; margin-bottom: 16px; }
        h2 { font-size: 22px; margin-top: 24px; margin-bottom: 12px; }
        h3 { font-size: 18px; margin-top: 20px; margin-bottom: 8px; }
        p { margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        ul, ol { padding-left: 24px; margin-bottom: 12px; }
        img { max-width: 100%; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

// ─── DOCX generation (XML-based) ───
function generateDocxXml(htmlContent: string, title: string): string {
  const div = document.createElement('div');
  div.innerHTML = htmlContent;

  let body = '';
  const walkNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        const parent = node.parentElement;
        const isBold = parent?.tagName === 'B' || parent?.tagName === 'STRONG' || parent?.style?.fontWeight === 'bold';
        const isItalic = parent?.tagName === 'I' || parent?.tagName === 'EM';
        const isUnderline = parent?.tagName === 'U';
        let rPr = '';
        if (isBold) rPr += '<w:b/>';
        if (isItalic) rPr += '<w:i/>';
        if (isUnderline) rPr += '<w:u w:val="single"/>';
        body += `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toUpperCase();

    if (['H1', 'H2', 'H3'].includes(tag)) {
      const level = tag === 'H1' ? '1' : tag === 'H2' ? '2' : '3';
      const size = tag === 'H1' ? '56' : tag === 'H2' ? '44' : '36';
      body += `<w:p><w:pPr><w:pStyle w:val="Heading${level}"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="${size}"/></w:rPr><w:t>${escapeXml(el.textContent || '')}</w:t></w:r></w:p>`;
    } else if (tag === 'P' || tag === 'DIV') {
      body += '<w:p>';
      el.childNodes.forEach(walkNodes);
      body += '</w:p>';
    } else if (tag === 'UL' || tag === 'OL') {
      el.querySelectorAll('li').forEach(li => {
        body += `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="${tag === 'UL' ? '1' : '2'}"/></w:numPr></w:pPr><w:r><w:t>${escapeXml(li.textContent || '')}</w:t></w:r></w:p>`;
      });
    } else if (tag === 'BR') {
      body += '<w:p/>';
    } else {
      el.childNodes.forEach(walkNodes);
    }
  };

  div.childNodes.forEach(walkNodes);
  if (!body) body = '<w:p/>';

  return body;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exportDocAsPDF(htmlContent: string, title: string) {
  printToPDF(htmlContent, title);
}

export async function exportDocAsDOCX(htmlContent: string, title: string) {
  const bodyXml = generateDocxXml(htmlContent, title);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${bodyXml}</w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels')!.file('.rels', rels);
  zip.folder('word')!.file('document.xml', document);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, `${title || 'document'}.docx`);
}

// ─── Spreadsheet exports ───

const colLabel = (i: number) => String.fromCharCode(65 + i);

export function exportSheetAsCSV(data: SheetData, title: string) {
  const rows: string[][] = [];
  Object.entries(data).forEach(([key, cell]) => {
    const col = key.charCodeAt(0) - 65;
    const row = parseInt(key.slice(1)) - 1;
    while (rows.length <= row) rows.push([]);
    while (rows[row].length <= col) rows[row].push('');
    rows[row][col] = cell.value;
  });
  const csv = rows.map(r => r.map(c => c.includes(',') ? `"${c}"` : c).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${title || 'spreadsheet'}.csv`);
}

export async function exportSheetAsXLSX(data: SheetData, title: string) {
  // Build XLSX via XML inside ZIP (Office Open XML)
  const rows: string[][] = [];
  let maxCol = 0;
  Object.entries(data).forEach(([key, cell]) => {
    const col = key.charCodeAt(0) - 65;
    const row = parseInt(key.slice(1)) - 1;
    while (rows.length <= row) rows.push([]);
    while (rows[row].length <= col) rows[row].push('');
    rows[row][col] = cell.value;
    maxCol = Math.max(maxCol, col);
  });

  let sheetData = '';
  rows.forEach((row, r) => {
    sheetData += `<row r="${r + 1}">`;
    row.forEach((val, c) => {
      const ref = `${colLabel(c)}${r + 1}`;
      const num = parseFloat(val);
      if (val && !isNaN(num)) {
        sheetData += `<c r="${ref}"><v>${num}</v></c>`;
      } else if (val) {
        sheetData += `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
      }
    });
    sheetData += '</row>';
  });

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetData}</sheetData>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels')!.file('.rels', rels);
  const xl = zip.folder('xl')!;
  xl.file('workbook.xml', workbook);
  xl.folder('_rels')!.file('workbook.xml.rels', wbRels);
  xl.folder('worksheets')!.file('sheet1.xml', sheet);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${title || 'spreadsheet'}.xlsx`);
}

// ─── Presentation exports ───

export function exportSlidesAsPDF(slides: Slide[], title: string) {
  let html = '';
  slides.forEach((slide, i) => {
    html += `<div style="width:100%;aspect-ratio:16/9;background:${slide.background || '#fff'};position:relative;overflow:hidden;${i > 0 ? 'page-break-before:always;' : ''}">`;
    slide.elements.forEach(el => {
      const style = `position:absolute;left:${(el.x / 1920) * 100}%;top:${(el.y / 1080) * 100}%;width:${(el.width / 1920) * 100}%;height:${(el.height / 1080) * 100}%;`;
      if (el.type === 'text') {
        const fs = el.style?.fontSize ? `font-size:${parseInt(el.style.fontSize) * 0.6}px;` : '';
        html += `<div style="${style}${fs}font-weight:${el.style?.fontWeight || 'normal'};color:${el.style?.color || '#000'};display:flex;align-items:center;">${escapeXml(el.content || '')}</div>`;
      } else if (el.type === 'image') {
        html += `<img src="${el.src}" style="${style}object-fit:contain;" />`;
      } else if (el.type === 'shape') {
        html += `<div style="${style}background:${el.style?.backgroundColor || '#6366f1'};border-radius:8px;"></div>`;
      }
    });
    html += '</div>';
  });
  printToPDF(html, title);
}

export async function exportSlidesAsPPTX(slides: Slide[], title: string) {
  const emu = (px: number) => Math.round(px * 9525);
  const slideW = emu(1920);
  const slideH = emu(1080);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n  ')}
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  const presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slides.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join('\n  ')}
</Relationships>`;

  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldSz cx="${slideW}" cy="${slideH}"/>
  <p:sldIdLst>
    ${slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`).join('\n    ')}
  </p:sldIdLst>
</p:presentation>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels')!.file('.rels', rels);
  const ppt = zip.folder('ppt')!;
  ppt.file('presentation.xml', presentation);
  ppt.folder('_rels')!.file('presentation.xml.rels', presRels);

  const slidesFolder = ppt.folder('slides')!;

  slides.forEach((slide, i) => {
    let spTree = '';
    slide.elements.forEach((el, j) => {
      const x = emu(el.x);
      const y = emu(el.y);
      const w = emu(el.width);
      const h = emu(el.height);

      if (el.type === 'text') {
        const fontSize = el.style?.fontSize ? parseInt(el.style.fontSize) * 100 : 3200;
        const bold = el.style?.fontWeight === 'bold' ? ' b="1"' : '';
        const color = cssColorToHex(el.style?.color || '#000000');
        spTree += `
<p:sp>
  <p:nvSpPr><p:cNvPr id="${j + 2}" name="Text ${j}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="square" anchor="ctr"/>
    <a:p><a:r><a:rPr lang="en-US" sz="${fontSize}"${bold}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:rPr><a:t>${escapeXml(el.content || '')}</a:t></a:r></a:p>
  </p:txBody>
</p:sp>`;
      } else if (el.type === 'shape') {
        const bgColor = cssColorToHex(el.style?.backgroundColor || '#6366f1');
        spTree += `
<p:sp>
  <p:nvSpPr><p:cNvPr id="${j + 2}" name="Shape ${j}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>
    <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
    <a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>
  </p:spPr>
</p:sp>`;
      }
      // Note: images in PPTX require embedding binary data — skipped for simplicity
    });

    const bgColor = cssColorToHex(slide.background || '#ffffff');
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      ${spTree}
    </p:spTree>
  </p:cSld>
</p:sld>`;
    slidesFolder.file(`slide${i + 1}.xml`, slideXml);
  });

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  saveAs(blob, `${title || 'presentation'}.pptx`);
}

function cssColorToHex(color: string): string {
  if (color.startsWith('#')) return color.slice(1).padEnd(6, '0').slice(0, 6);
  if (color.startsWith('rgb')) {
    const m = color.match(/\d+/g);
    if (m && m.length >= 3) {
      return m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    }
  }
  // For hsl(var(--...)) fallback
  return '000000';
}
