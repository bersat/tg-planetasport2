require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const botToken = process.env.HTTPAPI;
const webAppUrl = 'https://delightful-kangaroo-580b07.netlify.app'; // frontend

const bot = new TelegramBot(botToken, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Нажми кнопку для входа:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Войти в магазин', web_app: { url: `${webAppUrl}` } }]
                ]
            }
        });
    }
});

// Авторизация
app.post('/api/auth', async (req, res) => {
    const { telegram_id, username, first_name, last_name } = req.body;

    if (!telegram_id) {
        return res.status(400).json({ message: 'Нет Telegram ID' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [telegram_id]);

        if (!rows.length) {
            await db.execute(
                'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
                [telegram_id, username, first_name, last_name]
            );
        }

        const token = jwt.sign({ telegram_id, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Успешная авторизация', token });
    } catch (err) {
        console.error('Ошибка сервера:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
