require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // PostgreSQL pool
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        // Получаем id роли 'user' из таблицы roles
        const roleResult = await db.query('SELECT id FROM roles WHERE role_name = $1', ['user']);
        const roleId = roleResult.rows[0]?.id;

        if (!roleId) {
            return res.status(400).json({ message: 'Роль пользователя не найдена' });
        }

        // Проверка на существование пользователя с таким email
        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставляем нового пользователя с id роли 'user'
        await db.query(
            'INSERT INTO users (full_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)',
            [full_name, email, phone, hashedPassword, roleId]
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

        // Получаем роль пользователя по его id
        const roleResult = await db.query('SELECT role_name FROM roles WHERE id = $1', [user.role]);
        const roleName = roleResult.rows[0]?.role_name;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: roleName }, // Роль из таблицы roles
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ message: 'Успешный вход', token });
    } catch (err) {
        console.error('Ошибка при входе:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});



// 🚀 Настройка порта и запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
