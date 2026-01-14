const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/* ================= SAFE XML ESCAPE ================= */
const escapeXml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const processPhoto = async (imageBuffer, tokenNumber, gender) => {
  try {
    const rawTimestamp = new Date().toLocaleString('en-IN');
    const timestamp = escapeXml(rawTimestamp);

    const uploadsDir = path.join(__dirname, 'uploads');
    const logoPath = path.join(__dirname, 'assets', 'finalLogo.png');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(
      uploadsDir,
      `${gender}_${tokenNumber}_${Date.now()}.jpg`
    );

    const CANVAS_WIDTH = 800;
    const HEADER_HEIGHT = 360; // increased for logo
    const IMAGE_HEIGHT = 600;
    const CANVAS_HEIGHT = HEADER_HEIGHT + IMAGE_HEIGHT;
    const LOGO_SIZE = 120;

    /* ================= FACE IMAGE ================= */
    const faceImage = await sharp(imageBuffer)
      .resize(CANVAS_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .toBuffer();

    const teluguGender =
      gender.toLowerCase() === 'male' ? 'పురుషుడు' : 'స్త్రీ';

    /* ================= SVG HEADER ================= */
    const textSvg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${CANVAS_WIDTH}"
           height="${HEADER_HEIGHT}">
        <style>
          .title {
            fill:#7a3e00;
            font-size:34px;
            font-weight:bold;
            text-anchor:middle;
          }
          .sub {
            fill:#7a3e00;
            font-size:24px;
            text-anchor:middle;
          }
          .location {
            fill:#7a3e00;
            font-size:20px;
            text-anchor:middle;
          }
          .meta-left {
            fill:#000;
            font-size:18px;
            font-weight:bold;
          }
          .meta-right {
            fill:#000;
            font-size:18px;
            font-weight:bold;
            text-anchor:end;
          }
        </style>

        <!-- TITLE -->
        <text x="${CANVAS_WIDTH / 2}" y="190" class="title">
          నారాయణ క్షేత్రం
        </text>

        <!-- SUB TITLE -->
        <text x="${CANVAS_WIDTH / 2}" y="230" class="sub">
          శ్రీ దేవుడు బాబు సంస్థానం
        </text>

        <!-- LOCATION -->
        <text x="${CANVAS_WIDTH / 2}" y="260" class="location">
          S.మూలపొలం
        </text>

        <!-- TOKEN -->
        <text x="${CANVAS_WIDTH / 2}" y="305" class="title">
          టోకెన్ : ${tokenNumber}
        </text>

        <!-- DATE & TIME -->
        <text x="20" y="${HEADER_HEIGHT - 20}" class="meta-left">
          తేదీ &amp; సమయం : ${timestamp}
        </text>

        <!-- GENDER -->
        <text x="${CANVAS_WIDTH - 20}" y="${HEADER_HEIGHT - 20}" class="meta-right">
          ${teluguGender}
        </text>
      </svg>
    `;

    /* ================= BASE CANVAS ================= */
    const baseImage = sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 3,
        background: { r: 255, g: 248, b: 230 }
      }
    });

    const layers = [];

    /* ================= LOGO (TOP CENTER) ================= */
    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain' })
    .removeAlpha()
    .flatten({ background: { r: 255, g: 248, b: 230 } }) // match canvas bg
    .toBuffer();


      layers.push({
        input: logoBuffer,
        top: 20,
        left: (CANVAS_WIDTH - LOGO_SIZE) / 2
      });
    }

    /* ================= COMPOSE ================= */
    layers.push(
      { input: Buffer.from(textSvg), top: 0, left: 0 },
      { input: faceImage, top: HEADER_HEIGHT, left: 0 }
    );

    await baseImage
      .composite(layers)
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    return outputPath;

  } catch (err) {
    console.error("❌ Image processing failed:", err);
    return null;
  }
 

};

module.exports = processPhoto;
