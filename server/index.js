require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // PostgreSQL pool

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 Регистрация
app.post('/api/register', async (req, res) => {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !phone || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля' });
    }

    try {
        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4)',
            [full_name, email, phone, hashedPassword]
        );

        res.status(201).json({ message: 'Регистрация прошла успешно' });
    } catch (err) {
        console.error('Ошибка при регистрации:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// 🔐 Авторизация
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Введите email и пароль' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Успешный вход', token });
    } catch (err) {
        console.error('Ошибка при входе:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// 🔍 Проверка токена
app.get('/api/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.query(
            'SELECT id, full_name, email, phone, created_at FROM users WHERE id = $1',
            [decoded.id]
        );
        res.json(user.rows[0]);
    } catch (err) {
        res.status(403).json({ message: 'Неверный токен' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
