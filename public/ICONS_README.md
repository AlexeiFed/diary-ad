# Иконки PWA

Для создания PNG иконок из SVG:

1. Используйте онлайн-конвертер: https://convertio.co/svg-png/
2. Или ImageMagick: convert -background none -resize 192x192 public/icon.svg public/pwa-192x192.png
3. Или через Node.js с sharp: npx sharp -i public/icon.svg -o public/pwa-192x192.png --resize 192x192

Требуемые размеры:
- pwa-192x192.png (192x192 пикселей)
- pwa-512x512.png (512x512 пикселей)
