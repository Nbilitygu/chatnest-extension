const sharp = require('sharp');

const sizes = [16, 32, 48, 128];
const color = '#7c3aed';

async function generateIcons() {
  for (const size of sizes) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="20" fill="${color}"/>
        <text x="50" y="65" font-size="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">N</text>
      </svg>
    `;
    await sharp(Buffer.from(svg))
      .png()
      .toFile(`icons/icon${size}.png`);
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error);
