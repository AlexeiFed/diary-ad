# Инструкция по публикации

## Вариант 1: GitHub Pages (бесплатно)

1. Создайте репозиторий на GitHub:
   ```bash
   # На GitHub создайте новый репозиторий (например, diary-ad)
   ```

2. Добавьте remote и запушьте:
   ```bash
   git remote add origin https://github.com/ВАШ_USERNAME/diary-ad.git
   git branch -M main
   git push -u origin main
   ```

3. Включите GitHub Pages:
   - Перейдите в Settings → Pages
   - Source: GitHub Actions
   - Workflow уже настроен в `.github/workflows/deploy.yml`

4. Обновите `vite.config.ts` для правильного base path:
   ```typescript
   export default defineConfig({
     base: '/diary-ad/', // замените на имя вашего репозитория
     // ... остальная конфигурация
   })
   ```

## Вариант 2: Vercel (рекомендуется для PWA)

1. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Деплой:
   ```bash
   vercel
   ```

3. Или через веб-интерфейс:
   - Зайдите на vercel.com
   - Импортируйте репозиторий
   - Автоматически задеплоится

## Вариант 3: Netlify

1. Установите Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Деплой:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## После публикации

После публикации приложение будет доступно по ссылке. Для установки на Android:
1. Откройте ссылку в Chrome на Android
2. Меню → "Добавить на главный экран"
3. Готово!

