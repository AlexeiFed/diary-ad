// Простой скрипт для создания иконок PWA
// Запуск: node scripts/generate-icons.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Простая SVG иконка
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#6366f1"/>
  <circle cx="256" cy="180" r="70" stroke="white" stroke-width="30" fill="none"/>
  <path d="M256 250 L256 380 M210 310 L256 380 L302 310" stroke="white" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="256" y="450" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">АД</text>
</svg>`;

// Сохраняем SVG
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
console.log('✅ Создан icon.svg');
console.log('📝 Для создания PNG иконок используйте онлайн-конвертер или ImageMagick:');
console.log('   convert -background none -resize 192x192 public/icon.svg public/pwa-192x192.png');
console.log('   convert -background none -resize 512x512 public/icon.svg public/pwa-512x512.png');

