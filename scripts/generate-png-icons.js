const fs = require('fs');
const path = require('path');

// Script pour créer des icônes PNG avec Canvas (si disponible) ou Sharp
// Ce script créera des icônes PNG basiques pour la démo

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Créer des icônes PNG de base en utilisant une approche simple
// Pour une vraie application, utilisez Sharp ou un service comme Real Favicon Generator

const createBasicIconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size/8}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2.2}" r="${size/4}" fill="white" opacity="0.9"/>
  <rect x="${size/2.5}" y="${size/1.8}" width="${size/5}" height="${size/10}" fill="white" opacity="0.9" rx="${size/40}"/>
  <rect x="${size/2.2}" y="${size/1.6}" width="${size/10}" height="${size/8}" fill="white" opacity="0.9" rx="${size/80}"/>
  <rect x="${size/1.8}" y="${size/1.6}" width="${size/10}" height="${size/8}" fill="white" opacity="0.9" rx="${size/80}"/>
  <text x="${size/2}" y="${size/1.3}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/10}" font-weight="bold">TeamUp</text>
</svg>`;
};

// Créer les icônes SVG améliorées
sizes.forEach(size => {
  const svgContent = createBasicIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svgContent);
  console.log(`Created improved ${filename}`);
});

// Instructions pour convertir en PNG
console.log('\n📱 Icônes PWA créées!');
console.log('💡 Pour convertir en PNG optimisé, utilisez:');
console.log('   - Online: https://convertio.co/svg-png/');
console.log('   - CLI: npm install -g sharp-cli && sharp input.svg -o output.png');
console.log('   - ImageMagick: convert icon.svg icon.png');
console.log('\n🎯 Les icônes actuelles sont des SVG fonctionnels pour la démo.');
