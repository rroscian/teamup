const fs = require('fs');
const path = require('path');

// Script simple pour créer des icônes de base
// Dans un environnement de production, vous utiliseriez des outils comme sharp ou imagemagick

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Créer des icônes de base SVG
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
  <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="#3b82f6" font-family="Arial, sans-serif" font-size="${size/8}" font-weight="bold">TU</text>
</svg>`;
};

// Pour cette démonstration, créons des icônes SVG simples
// En production, vous devriez utiliser des vraies icônes PNG optimisées
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svgContent);
  console.log(`Created ${filename}`);
});

console.log('Icons generated! Note: For production, convert SVG to optimized PNG files.');
console.log('You can use online tools or CLI tools like imagemagick to convert:');
console.log('convert icon-192x192.svg icon-192x192.png');
