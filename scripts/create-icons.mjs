import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createIcon(size, filename) {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, size, size);
    
    // Скругленные углы (простая имитация)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.15);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Текст
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('АД', size / 2, size / 2);
    
    const buffer = canvas.toBuffer('image/png');
    const publicDir = path.join(__dirname, '..', 'public');
    fs.writeFileSync(path.join(publicDir, filename), buffer);
    console.log(`✅ Создан ${filename}`);
  } catch (error) {
    console.log(`⚠️  Canvas не доступен: ${error.message}`);
    console.log('📝 Используйте SVG иконку и конвертируйте через онлайн-сервис');
  }
}

// Создаем иконки
await createIcon(192, 'pwa-192x192.png');
await createIcon(512, 'pwa-512x512.png');

