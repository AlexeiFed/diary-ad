# Быстрая публикация на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Название репозитория: `diary-ad` (или любое другое)
3. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть)
4. Нажмите "Create repository"

## Шаг 2: Запушьте код

После создания репозитория GitHub покажет команды. Выполните:

```bash
git remote add origin https://github.com/ВАШ_USERNAME/diary-ad.git
git branch -M main
git push -u origin main
```

Замените `ВАШ_USERNAME` на ваш GitHub username.

## Шаг 3: Настройте GitHub Pages

1. Перейдите в Settings → Pages вашего репозитория
2. Source: выберите "GitHub Actions"
3. Workflow уже настроен в `.github/workflows/deploy.yml`

## Шаг 4: Обновите base path (если нужно)

Если ваш репозиторий называется не `diary-ad`, обновите `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/ИМЯ_ВАШЕГО_РЕПОЗИТОРИЯ/',
  // ...
})
```

Или если репозиторий называется `diary-ad`, оставьте как есть.

## Альтернатива: Vercel (проще и быстрее)

1. Зайдите на https://vercel.com
2. Войдите через GitHub
3. New Project → Import Git Repository
4. Выберите ваш репозиторий
5. Deploy

Vercel автоматически определит настройки и задеплоит приложение!

