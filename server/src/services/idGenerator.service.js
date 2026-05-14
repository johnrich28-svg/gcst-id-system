import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeneratedId } from '../models/GeneratedId.model.js';
import { IdRequest } from '../models/IdRequest.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Course Metadata ──────────────────────────────────────────────────────────
const COURSE_INFO = {
  BSCRIM:    { l1: 'BACHELOR OF SCIENCE IN', l2: 'CRIMINOLOGY',                abbr: 'BSCRIM'   },
  BSA:       { l1: 'BACHELOR OF SCIENCE IN', l2: 'ACCOUNTANCY',                abbr: 'BSA'      },
  'BSBA-MM': { l1: 'BS IN BUSINESS ADMINISTRATION', l2: 'MARKETING MANAGEMENT', abbr: 'BSBA-MM' },
  'BSBA-OM': { l1: 'BS IN BUSINESS ADMINISTRATION', l2: 'OPERATIONS MANAGEMENT',abbr: 'BSBA-OM' },
  BSED:      { l1: 'BACHELOR OF',            l2: 'SECONDARY EDUCATION',         abbr: 'BSED'     },
  BEED:      { l1: 'BACHELOR OF',            l2: 'ELEMENTARY EDUCATION',        abbr: 'BEED'     },
  BSCS:      { l1: 'BACHELOR OF SCIENCE IN', l2: 'COMPUTER SCIENCE',            abbr: 'BSCS'     },
  BSIT:      { l1: 'BACHELOR OF SCIENCE IN', l2: 'INFORMATION TECHNOLOGY',      abbr: 'BSIT'     },
  BSTM:      { l1: 'BACHELOR OF SCIENCE IN', l2: 'TOURISM MANAGEMENT',          abbr: 'BSTM'     },
};

function getCourse(code) {
  return COURSE_INFO[code] || { l1: code, l2: '', abbr: code };
}

function safeFile(name) {
  return (name || 'student').replace(/[^a-z0-9 _\-]/gi, '').trim().replace(/\s+/g, '_');
}

async function downloadToBuffer(src) {
  if (!src) return null;
  try {
    if (/^https?:\/\//.test(src)) {
      const r = await axios.get(src, { responseType: 'arraybuffer', timeout: 15000 });
      return Buffer.from(r.data);
    }
    if (fs.existsSync(src)) return fs.readFileSync(src);
  } catch (e) { console.error('downloadToBuffer error:', e.message); }
  return null;
}

// ─── SVG text helper (escapes XML special chars) ─────────────────────────────
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Generate FRONT using sharp compositing ───────────────────────────────────
// Template: 640 × 1024 px
//
// PIXEL-SAMPLED from the actual real ID card photo:
//
//  Photo oval     → centered on right portion
//                   In template: left=298, top=218, width=301, height=501
//
//  "Student ID#:" → small italic white label on left side
//                   template placeholder at x≈0-290, y≈478-500
//  "GC-210466"   → large bold white value below label
//                   template placeholder at x≈0-290, y≈503-582
//
//  "Valid for:"   → small italic white label
//                   template placeholder at x≈0-290, y≈596-618
//  "S.Y. XXXX"   → medium bold white value
//                   template placeholder at x≈0-290, y≈622-658
//
//  Course band    → y=685-868 (dark blue, full width)
//    Line 1: full course name (small caps)
//    Line 2: discipline name (larger)
//    Abbr:   abbreviation (largest, e.g. BSIT)
//
//  Name strip     → y=868-1024 (grayish semi-transparent strip)
//    Signature:   centered above name text
//    Name:        centered bold black
//    "Name & Signature" subtitle: small centered gray
//
async function composeFront({ templatePath, photoBuf, sigBuf, studentId, fullName, course }) {
  const ci  = getCourse(course);
  const now = new Date();
  // School year: if month >= June, it's currentYear to currentYear+1; else previous to current
  const month = now.getMonth(); // 0-indexed
  const yr1 = month >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  const yr2 = yr1 + 1;
  const schoolYear = `SY ${yr1}-${yr2}`;

  const W   = 640;
  const H   = 1024;

  const composites = [];

  // ── ① Photo — fitted inside the oval ────────────────────────────────────
  // Oval position in template: left=298, top=218, width=301, height=501
  // The real ID shows the photo fills the white oval exactly.
  const OVAL_LEFT = 298, OVAL_TOP = 218, OVAL_W = 301, OVAL_H = 501;

  if (photoBuf) {
    const resized = await sharp(photoBuf)
      .resize(OVAL_W, OVAL_H, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();

    // Ellipse mask clipping the photo to the oval
    const mask = Buffer.from(
      `<svg width="${OVAL_W}" height="${OVAL_H}">
        <ellipse cx="${OVAL_W / 2}" cy="${OVAL_H / 2}" rx="${OVAL_W / 2}" ry="${OVAL_H / 2}" fill="white"/>
      </svg>`
    );

    const clipped = await sharp(resized)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    composites.push({ input: clipped, left: OVAL_LEFT, top: OVAL_TOP });
  }

  // ── ② Student ID block ───────────────────────────────────────────────────
  // "Student ID#:" label (bold italic white) + ID value (large bold white)
  // Covers template placeholder at y≈476-588, x=0-295
  const ID_X = 0, ID_Y = 476, ID_W = 295, ID_H = 112;
  const idOverlay = Buffer.from(
    `<svg width="${ID_W}" height="${ID_H}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${ID_W}" height="${ID_H}" fill="rgb(10,18,75)"/>` +
    `<text x="12" y="24" font-family="Arial, sans-serif" font-size="17" font-weight="700" font-style="italic" fill="white">Student ID#:</text>` +
    `<text x="10" y="94" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="white">${esc(studentId)}</text>` +
    `</svg>`
  );
  composites.push({ input: idOverlay, left: ID_X, top: ID_Y });

  // ── ③ Valid for block ────────────────────────────────────────────────────
  // "Valid for:" label + school year value
  // Covers template placeholder at y≈592-664, x=0-295
  const VY_X = 0, VY_Y = 592, VY_W = 295, VY_H = 72;
  const vyOverlay = Buffer.from(
    `<svg width="${VY_W}" height="${VY_H}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${VY_W}" height="${VY_H}" fill="rgb(10,18,75)"/>` +
    `<text x="12" y="22" font-family="Arial, sans-serif" font-size="17" font-weight="700" font-style="italic" fill="white">Valid for:</text>` +
    `<text x="10" y="62" font-family="Arial Black, Arial, sans-serif" font-size="32" font-weight="900" fill="white">${esc(schoolYear)}</text>` +
    `</svg>`
  );
  composites.push({ input: vyOverlay, left: VY_X, top: VY_Y });

  // ── ④ Course band ────────────────────────────────────────────────────────
  // Real ID: dark blue band full-width containing:
  //   "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY" (small white bold)
  //   "BSIT" (large white bold)
  // Template band: y=685-868
  const CB_Y = 685, CB_H = 183;

  // Adaptive font sizes
  const l1Len = ci.l1.length;
  const l2Len = ci.l2.length;
  const l1FontSize = l1Len > 28 ? 15 : l1Len > 22 ? 17 : 20;
  const l2FontSize = l2Len > 24 ? 19 : l2Len > 18 ? 23 : 27;
  const abbrFontSize = ci.abbr.length > 7 ? 52 : ci.abbr.length > 6 ? 60 : 76;

  // In the real ID, the course line 1 + line 2 together form the full course title
  // e.g.: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY" split as:
  //   l1 = "BACHELOR OF SCIENCE IN"
  //   l2 = "INFORMATION TECHNOLOGY"
  // Then abbreviation "BSIT" is large below.
  const courseSvg = Buffer.from(`
    <svg width="${W}" height="${CB_H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark blue band matching template -->
      <rect width="${W}" height="${CB_H}" fill="#0A1E8C"/>

      <!-- Top border line -->
      <line x1="0" y1="2" x2="${W}" y2="2" stroke="#002299" stroke-width="4"/>
      <!-- Bottom border line -->
      <line x1="0" y1="${CB_H - 2}" x2="${W}" y2="${CB_H - 2}" stroke="#002299" stroke-width="4"/>

      <!-- Course line 1 (e.g. "BACHELOR OF SCIENCE IN") -->
      <text x="${W / 2}" y="34"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif" font-size="${l1FontSize}" font-weight="900"
        fill="white">${esc(ci.l1)}</text>

      <!-- Course line 2 (e.g. "INFORMATION TECHNOLOGY") -->
      <text x="${W / 2}" y="${34 + l1FontSize + 8}"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif" font-size="${l2FontSize}" font-weight="900"
        fill="white">${esc(ci.l2)}</text>

      <!-- Abbreviation (e.g. "BSIT") — large, centered -->
      <text x="${W / 2}" y="${CB_H - 14}"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif" font-size="${abbrFontSize}" font-weight="900"
        fill="white">${esc(ci.abbr)}</text>
    </svg>`);
  composites.push({ input: courseSvg, left: 0, top: CB_Y });

  // ── ⑤ Name + Signature strip ─────────────────────────────────────────────
  // Template: grayish strip at y=868-1024 (156px tall)
  // Real ID layout from bottom to top:
  //   y=868-1024 strip area:
  //     - Signature image: roughly centered horizontally, top ~y=876
  //     - Name (e.g. "REYNIEL M. CAUSAPIN"): bold, centered, below signature
  //     - "Name & Signature": small label, centered, below name
  //
  // The strip in the template is a semi-transparent grayish overlay.
  // We replace it entirely with a solid version to avoid placeholder "NAME" text.
  const NS_Y = 868, NS_H = H - NS_Y; // 156px

  // Background color matching the template strip (grayish-blue)
  const NS_BG = 'rgba(195,203,215,1.0)';

  // Layout within NS strip:
  //   Signature: top=4, height=52  (leaves room for name below)
  //   Name text: y=96 (baseline)
  //   Subtitle:  y=122 (baseline)
  const nameSvg = Buffer.from(`
    <svg width="${W}" height="${NS_H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Solid strip background, covers template "NAME" placeholder -->
      <rect width="${W}" height="${NS_H}" fill="${NS_BG}"/>

      <!-- Full Name — bold black, centered -->
      <text x="${W / 2}" y="96"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900"
        fill="#111111">${esc(fullName)}</text>

      <!-- "Name &amp; Signature" subtitle — light, centered -->
      <text x="${W / 2}" y="122"
        text-anchor="middle"
        font-family="Arial, sans-serif" font-size="16" font-weight="400"
        fill="#444444">Name &amp; Signature</text>
    </svg>`);
  composites.push({ input: nameSvg, left: 0, top: NS_Y });

  // ── ⑥ Signature image (if available) ─────────────────────────────────
  // Place signature centered in the strip above the name text
  // We use blend: 'multiply' so if the uploaded signature has a white background,
  // it becomes transparent and seamlessly blends onto the gray strip (just like real ink).
  if (sigBuf) {
    const SIG_MAX_W = 200;
    const SIG_MAX_H = 52;
    const sigImg = await sharp(sigBuf)
      .resize({ width: SIG_MAX_W, height: SIG_MAX_H, fit: 'inside' })
      .png()
      .toBuffer();
    const sigMeta = await sharp(sigImg).metadata();
    const sigLeft = Math.round((W - (sigMeta.width || SIG_MAX_W)) / 2);
    const sigTop  = NS_Y + 16;
    composites.push({ input: sigImg, left: sigLeft, top: sigTop, blend: 'multiply' });
  }

  return sharp(templatePath)
    .composite(composites)
    .png()
    .toBuffer();
}

// ─── Generate BACK using sharp compositing ────────────────────────────────────
// Template: 645 × 1018 px (white background)
//
// PIXEL-SAMPLED from real ID back photo:
//
//  Border box:   left≈35, top≈74, right≈613, bottom≈293
//  "ADDRESS:" label:              x=53, y≈88 (small, left-aligned)
//  Address value (e.g. "Talipusngo Maragondon Cavite"):
//                                 centered in box, y≈130-160 (medium text, italic-style)
//  "In case of emergency please notify" label: x=53, y≈180 (small)
//  Guardian name (e.g. "Armida Causapin"):
//                                 centered in box, y≈210-240 (medium text, bold)
//  "Contact No:" label:           x=53, y≈268 (small)
//  Contact value (e.g. "0967-239-7381"):
//                                 right of label, y≈260-285 (medium text)
//
// STRATEGY:
//  Paint a white rect precisely over each XXX placeholder then draw
//  matching text — same style/size as real ID.
//
async function composeBack({ templatePath, address, guardianName, guardianContact }) {
  const W = 645;
  const composites = [];

  // Box inner bounds (inside the border lines)
  const BOX_L = 36, BOX_R = 612;
  const BOX_INNER_W = BOX_R - BOX_L; // 576px

  // ── ① Address value ──────────────────────────────────────────────────────
  // The "ADDRESS:" label sits at y≈86-100. The XXX placeholder for address
  // text is below it at y≈105-165. We cover that zone and draw the value.
  // The real ID shows address in a medium-sized regular/italic font, centered.
  const addrLen = String(address || '').length;
  const addrFontSize = addrLen > 35 ? 16 : addrLen > 25 ? 19 : 22;
  const addrOverlay = Buffer.from(`
    <svg width="${BOX_INNER_W}" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="${BOX_INNER_W}" height="60" fill="white"/>
      <text x="${BOX_INNER_W / 2}" y="42"
        text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${addrFontSize}" font-weight="400"
        font-style="italic"
        fill="black">${esc(address)}</text>
    </svg>`);
  composites.push({ input: addrOverlay, left: BOX_L, top: 108 });

  // ── ② Guardian name value ─────────────────────────────────────────────────
  // "In case of emergency please notify" label at y≈177-190.
  // Guardian name XXX placeholder at y≈195-245. Cover and replace.
  // Real ID shows guardian name in bold, centered, medium font.
  const gnLen = String(guardianName || '').length;
  const gnFontSize = gnLen > 30 ? 17 : gnLen > 22 ? 20 : 24;
  const gnOverlay = Buffer.from(`
    <svg width="${BOX_INNER_W}" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="${BOX_INNER_W}" height="50" fill="white"/>
      <text x="${BOX_INNER_W / 2}" y="36"
        text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${gnFontSize}" font-weight="700"
        fill="black">${esc(guardianName)}</text>
    </svg>`);
  composites.push({ input: gnOverlay, left: BOX_L, top: 198 });

  // ── ③ Contact No value ───────────────────────────────────────────────────
  // "Contact No:" label ends around x≈147. Contact XXX is to the right.
  // Template XXX placeholder at roughly x=200-400, y=255-285.
  // We cover from x=148 to BOX_R and draw value right of label.
  const CONT_LEFT = 148;
  const CONT_W = BOX_R - CONT_LEFT; // 464px
  const contOverlay = Buffer.from(`
    <svg width="${CONT_W}" height="44" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CONT_W}" height="44" fill="white"/>
      <text x="8" y="30"
        text-anchor="start"
        font-family="Arial, sans-serif" font-size="20" font-weight="700"
        fill="black">${esc(guardianContact)}</text>
    </svg>`);
  composites.push({ input: contOverlay, left: CONT_LEFT, top: 248 });

  return sharp(templatePath)
    .composite(composites)
    .png()
    .toBuffer();
}

// ─── Render both sides to PDFs ────────────────────────────────────────────────
async function pngToPdf(pngBuf, widthPx, heightPx) {
  const { default: puppeteer } = await import('puppeteer');
  const b64 = pngBuf.toString('base64');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>*{margin:0;padding:0;}html,body{width:${widthPx}px;height:${heightPx}px;overflow:hidden;}
    img{display:block;width:${widthPx}px;height:${heightPx}px;}</style></head>
    <body><img src="data:image/png;base64,${b64}"/></body></html>`;

  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: widthPx, height: heightPx });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    return await page.pdf({ width: `${widthPx}px`, height: `${heightPx}px`, printBackground: true });
  } finally {
    await browser.close();
  }
}

async function renderPdfs({ personalInfo, uploads, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });
  const safeName  = safeFile(personalInfo.fullName);
  const frontPath = path.join(outDir, `${safeName}_front.pdf`);
  const backPath  = path.join(outDir, `${safeName}_back.pdf`);

  const frontTpl = path.join(__dirname, '../assets/id-template-front.png');
  const backTpl  = path.join(__dirname, '../assets/id-template-back.png');
  if (!fs.existsSync(frontTpl)) throw new Error('id-template-front.png missing from server/src/assets/');
  if (!fs.existsSync(backTpl))  throw new Error('id-template-back.png missing from server/src/assets/');

  const [photoBuf, sigBuf] = await Promise.all([
    downloadToBuffer(uploads?.photo1x1 || uploads?.photoUrl),
    downloadToBuffer(uploads?.signature || uploads?.signatureUrl),
  ]);

  const [frontPng, backPng] = await Promise.all([
    composeFront({ templatePath: frontTpl, photoBuf, sigBuf,
      studentId: personalInfo.studentId, fullName: personalInfo.fullName, course: personalInfo.course }),
    composeBack({ templatePath: backTpl,
      address: personalInfo.address, guardianName: personalInfo.guardianName,
      guardianContact: personalInfo.guardianContact }),
  ]);

  const [frontPdf, backPdf] = await Promise.all([
    pngToPdf(frontPng, 640, 1024),
    pngToPdf(backPng,  645, 1018),
  ]);

  fs.writeFileSync(frontPath, frontPdf);
  fs.writeFileSync(backPath,  backPdf);
  return { frontPath, backPath };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const generateIdCard = async (requestId, issuedById = null) => {
  const request = await IdRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  const { personalInfo, uploads } = request;
  const ylMap    = { '1':'1st Year','2':'2nd Year','3':'3rd Year','4':'4th Year' };
  const ylFolder = ylMap[String(personalInfo.yearLevel)] || `${personalInfo.yearLevel} Year`;
  const outDir   = path.resolve(__dirname, '../../generated-ids',
    ylFolder, personalInfo.course, personalInfo.section || 'Unassigned');

  const { frontPath, backPath } = await renderPdfs({ personalInfo, uploads, outDir });

  let rec = await GeneratedId.findOne({ requestId: request._id });
  if (rec) {
    rec.frontPdfPath = frontPath;
    rec.backPdfPath = backPath;
    if (issuedById) rec.issuedBy = issuedById;
    await rec.save();
  } else {
    rec = await GeneratedId.create({
      requestId:       request._id,
      studentId:       personalInfo.studentId,
      fullName:        personalInfo.fullName,
      course:          personalInfo.course,
      yearLevel:       personalInfo.yearLevel,
      section:         personalInfo.section,
      address:         personalInfo.address,
      guardianName:    personalInfo.guardianName,
      guardianContact: personalInfo.guardianContact,
      photoUrl:        uploads?.photo1x1 || uploads?.photoUrl,
      signatureUrl:    uploads?.signature || uploads?.signatureUrl,
      frontPdfPath:    frontPath,
      backPdfPath:     backPath,
      issuedBy:        issuedById,
    });
  }
  request.status = 'GENERATED';
  await request.save();
  return rec.populate('issuedBy', 'name');
};

export const regeneratePdf = async (generatedIdDocId) => {
  const record = await GeneratedId.findById(generatedIdDocId);
  if (!record) throw new Error('Record not found.');

  const personalInfo = {
    fullName: record.fullName, studentId: record.studentId, course: record.course,
    yearLevel: record.yearLevel, section: record.section, address: record.address,
    guardianName: record.guardianName, guardianContact: record.guardianContact,
  };
  const uploads = { photoUrl: record.photoUrl, signatureUrl: record.signatureUrl };

  const ylMap    = { '1':'1st Year','2':'2nd Year','3':'3rd Year','4':'4th Year' };
  const ylFolder = ylMap[String(record.yearLevel)] || `${record.yearLevel} Year`;
  const outDir   = path.resolve(__dirname, '../../generated-ids',
    ylFolder, record.course, record.section || 'Unassigned');

  const { frontPath, backPath } = await renderPdfs({ personalInfo, uploads, outDir });
  record.frontPdfPath = frontPath; record.backPdfPath = backPath; await record.save();
  return record;
};

export const getGeneratedIds = async (filters = {}) =>
  GeneratedId.find(filters)
    .populate('issuedBy', 'name')
    .sort({ issuedAt: -1 });
