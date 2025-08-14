# 📥 Инструкция по установке

## 1. Установка Node.js

### Windows
1. Перейдите на [официальный сайт Node.js](https://nodejs.org/)
2. Скачайте LTS версию (рекомендуется)
3. Запустите установщик и следуйте инструкциям
4. Перезагрузите компьютер после установки

### Проверка установки
Откройте PowerShell или командную строку и выполните:
```bash
node --version
npm --version
```

## 2. Установка зависимостей бота

После установки Node.js выполните в папке проекта:
```bash
npm install
```

## 3. Настройка Discord Bot

### Создание Discord приложения
1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Нажмите "New Application"
3. Введите название для вашего бота
4. Перейдите в раздел "Bot" в левом меню
5. Нажмите "Add Bot"
6. Скопируйте токен бота (Reset Token → Copy)

### Настройка интентов
В разделе "Bot" включите следующие интенты:
- ✅ Presence Intent
- ✅ Server Members Intent  
- ✅ Message Content Intent

### Приглашение бота на сервер
1. Перейдите в раздел "OAuth2" → "URL Generator"
2. Выберите "bot" в Scopes
3. Выберите необходимые права:
   - Send Messages
   - Use Slash Commands
   - Connect
   - Speak
   - Read Message History
4. Скопируйте сгенерированную ссылку и откройте её в браузере
5. Выберите сервер и подтвердите приглашение

## 4. Настройка Spotify API

### Создание Spotify приложения
1. Перейдите на [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Войдите в свой аккаунт Spotify
3. Нажмите "Create App"
4. Заполните форму:
   - App name: любое название
   - App description: описание
   - Website: http://localhost
   - Redirect URI: http://localhost/callback
5. Нажмите "Save"
6. Скопируйте Client ID и Client Secret

## 5. Настройка конфигурации

1. Откройте файл `config.env`
2. Замените placeholder значения на реальные:
   ```env
   DISCORD_TOKEN=ваш_токен_дискорд_бота
   SPOTIFY_CLIENT_ID=ваш_spotify_client_id
   SPOTIFY_CLIENT_SECRET=ваш_spotify_client_secret
   BOT_OWNER_ID=ваш_discord_user_id
   ```

## 6. Запуск бота

### Регистрация slash команд
```bash
node deploy-commands.js
```

### Запуск бота
```bash
npm start
```

## 7. Проверка работы

1. Убедитесь, что бот онлайн на вашем сервере
2. Присоединитесь к голосовому каналу
3. Используйте команду `!play название_трека`
4. Бот должен подключиться и начать воспроизведение

## 🚨 Возможные проблемы

### "npm не распознается как команда"
- Перезагрузите компьютер после установки Node.js
- Проверьте, что Node.js добавлен в PATH

### "Discord token invalid"
- Проверьте правильность токена
- Убедитесь, что бот создан и токен скопирован правильно

### "Spotify API error"
- Проверьте Client ID и Client Secret
- Убедитесь, что приложение создано в Spotify Developer Dashboard

### Бот не подключается к голосовому каналу
- Проверьте права бота
- Убедитесь, что включены все необходимые интенты

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи в консоли
2. Убедитесь, что все токены настроены правильно
3. Проверьте права бота на сервере
4. Убедитесь, что все зависимости установлены

---

**Удачи с настройкой вашего музыкального бота! 🎵**
