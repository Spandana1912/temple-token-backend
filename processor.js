const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processPhoto = async (imageBuffer, tokenNumber, gender) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const logoPath = path.join(__dirname, 'assets', 'finalLogo.png');
    const fontPath = path.join(__dirname, 'assets', 'NotoSerifTelugu-Regular.ttf');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(
      uploadsDir,
      `${gender}_${tokenNumber}_${Date.now()}.jpg`
    );

    const CANVAS_WIDTH = 800;
    const HEADER_HEIGHT = 360;
    const IMAGE_HEIGHT = 600;
    const CANVAS_HEIGHT = HEADER_HEIGHT + IMAGE_HEIGHT;

    const timestamp = new Date().toLocaleString('en-IN');
    const teluguGender = gender.toLowerCase() === 'male' ? 'పురుషుడు' : 'స్త్రీ';

    /* ================= BASE CANVAS ================= */
    let image = sharp({
      create: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        channels: 3,
        background: { r: 255, g: 248, b: 230 }
      }
    });

    /* ================= LOGO ================= */
    if (fs.existsSync(logoPath)) {
      const logo = await sharp(logoPath)
        .resize(120, 120, { fit: 'contain' })
        .toBuffer();

      image = image.composite([
        { input: logo, top: 20, left: (CANVAS_WIDTH - 120) / 2 }
      ]);
    }

    /* ================= TELUGU TEXT (PANGO) ================= */
    image = image.composite([
      {
        input: {
          text: {
            text: 'నారాయణ క్షేత్రం',
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'center',
            rgba: true
          }
        },
        top: 170,
        left: 0
      },
      {
        input: {
          text: {
            text: 'శ్రీ దేవుడు బాబు సంస్థానం',
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'center',
            rgba: true
          }
        },
        top: 215,
        left: 0
      },
      {
        input: {
          text: {
            text: 'S.మూలపొలం',
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'center',
            rgba: true
          }
        },
        top: 250,
        left: 0
      },
      {
        input: {
          text: {
            text: `టోకెన్ : ${tokenNumber}`,
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'center',
            rgba: true
          }
        },
        top: 295,
        left: 0
      },
      {
        input: {
          text: {
            text: `తేదీ & సమయం : ${timestamp}`,
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'left',
            rgba: true
          }
        },
        top: HEADER_HEIGHT - 30,
        left: 20
      },
      {
        input: {
          text: {
            text: teluguGender,
            fontfile: fontPath,
            width: CANVAS_WIDTH,
            align: 'right',
            rgba: true
          }
        },
        top: HEADER_HEIGHT - 30,
        left: -20
      }
    ]);

    /* ================= FACE IMAGE ================= */
    const faceImage = await sharp(imageBuffer)
      .resize(CANVAS_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .toBuffer();

    image = image.composite([
      { input: faceImage, top: HEADER_HEIGHT, left: 0 }
    ]);

    await image.jpeg({ quality: 90 }).toFile(outputPath);

    return outputPath;

  } catch (err) {
    console.error('❌ Image processing failed:', err);
    return null;
  }
};

module.exports = processPhoto;
