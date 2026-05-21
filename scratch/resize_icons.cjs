const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function resizeIcons() {
    const inputPath = path.join(__dirname, '../public/pwa-192x192.png');
    
    // Copy the original to a temp file just in case it overwrites itself badly
    const tempPath = path.join(__dirname, 'original.png');
    fs.copyFileSync(inputPath, tempPath);

    console.log('Resizing to 192x192...');
    await sharp(tempPath)
        .resize(192, 192)
        .toFile(path.join(__dirname, '../public/pwa-192x192.png'));

    console.log('Resizing to 512x512...');
    await sharp(tempPath)
        .resize(512, 512)
        .toFile(path.join(__dirname, '../public/pwa-512x512.png'));

    console.log('Done reszing icons.');
}

resizeIcons().catch(console.error);
