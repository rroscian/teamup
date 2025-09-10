const fs = require('fs');
const path = require('path');

// Générer de vrais fichiers PNG en utilisant une approche programmatique
// Ces PNG seront reconnus par les navigateurs pour déclencher l'installation PWA

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Créer un PNG minimal mais valide programmatiquement
function createPNGBuffer(size) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const width = size;
  const height = size;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // Créer des données d'image simples (bleu uni)
  const bytesPerPixel = 3; // RGB
  const bytesPerRow = width * bytesPerPixel + 1; // +1 pour filter byte
  const imageData = Buffer.alloc(height * bytesPerRow);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * bytesPerRow;
    imageData[rowStart] = 0; // filter type (None)
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      // Couleur bleue TeamUp (#3b82f6)
      imageData[pixelStart] = 0x3b;     // R
      imageData[pixelStart + 1] = 0x82; // G  
      imageData[pixelStart + 2] = 0xf6; // B
    }
  }
  
  // Compresser avec zlib (simplifié)
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(imageData);
  const idatChunk = createChunk('IDAT', compressedData);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = require('crc').crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

console.log('🎨 Création de vraies icônes PNG...\n');

try {
  sizes.forEach(size => {
    const pngBuffer = createPNGBuffer(size);
    const filename = `icon-${size}x${size}.png`;
    const filePath = path.join(publicDir, filename);
    
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`✅ Créé ${filename} (${Math.round(pngBuffer.length / 1024)}KB)`);
  });
  
  console.log('\n🎯 Icônes PNG créées avec succès!');
  console.log('Les navigateurs peuvent maintenant déclencher l\'installation PWA.');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.log('\n🔧 Alternative: Création manuelle des PNG...');
  
  // Si la création automatique échoue, créer des PNG basiques différemment
  sizes.forEach(size => {
    // Créer un PNG très simple avec une approche alternative
    const simpleHeader = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const filename = `icon-${size}x${size}.png`;
    fs.writeFileSync(path.join(publicDir, filename), simpleHeader);
    console.log(`📝 Créé PNG basique ${filename}`);
  });
}
