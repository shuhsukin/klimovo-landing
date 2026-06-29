# Заявки с сайта → Telegram

Токен бота **не хранится на GitHub Pages**. Между сайтом и Telegram стоит бесплатный **Cloudflare Worker**.

## 1. Создать бота

1. Telegram → [@BotFather](https://t.me/BotFather)
2. `/newbot` → имя, например `Климово заявки`
3. username, например `KlimovoLeadsBot`
4. Сохраните **токен** (`123456789:AAH...`)

## 2. Узнать chat_id

Напишите боту `/start` (со своего аккаунта, куда должны приходить заявки).

В терминале:

```bash
curl -s "https://api.telegram.org/bot<ТОКЕН>/getUpdates" | python3 -m json.tool
```

В ответе найдите `"chat":{"id":123456789` — это **TELEGRAM_CHAT_ID**.

> Заявки в канал @KlimovoZ: добавьте бота админом в канал, напишите в канале, снова `getUpdates` — id будет вида `-100...`

## 3. Задеплоить Worker

Нужен бесплатный аккаунт [Cloudflare](https://dash.cloudflare.com/sign-up).

```bash
cd Personal/klimovo-landing/worker
npm install -g wrangler   # или: npx wrangler
wrangler login

wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID

wrangler deploy
```

В конце будет URL, например: `https://klimovo-leads.account.workers.dev`

## 4. Прописать URL на сайте

В `js/site-config.js`:

```javascript
window.KLIMOVO_SITE = {
  leadApiUrl: 'https://klimovo-leads.account.workers.dev',
};
```

Закоммитьте и запушьте — форма на сайте начнёт слать заявки в Telegram.

## Проверка

```bash
curl -X POST https://klimovo-leads.account.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+7 (999) 000-00-00"}'
```

В Telegram должно прийти сообщение с заявкой.
