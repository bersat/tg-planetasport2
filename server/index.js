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

// Получение всех категорий
app.get('/api/categories', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Получение всех полов
app.get('/api/genders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM genders');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching genders:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Получение типов товаров в зависимости от выбранной категории
app.get('/api/types', async (req, res) => {
    const { category } = req.query;
    if (!category) {
        return res.status(400).json({ error: 'Category is required' });
    }

    try {
        const query = `
      SELECT types.id AS id, types.name AS name
      FROM types
      JOIN categories c ON types.category_id = c.id
      WHERE c.name = $1
    `;
        const result = await db.query(query, [category]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching types:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/api/products', async (req, res) => {
    const { category, gender, type } = req.query;

    let query = `
    SELECT p.*
    FROM products p
    JOIN types t ON p.type_id = t.id
    JOIN categories c ON t.category_id = c.id
    JOIN genders g ON p.gender_id = g.id
    WHERE 1=1
  `;

    const values = [];
    let count = 1;

    if (category) {
        query += ` AND c.name = $${count++}`;
        values.push(category);
    }
    if (gender) {
        query += ` AND g.name = $${count++}`;
        values.push(gender);
    }
    if (type) {
        query += ` AND t.name = $${count++}`;
        values.push(type);
    }

    try {
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API для поиска товаров
app.get('/api/products/search', async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        const result = await db.query(
            `SELECT id, title, price, image_url FROM products WHERE LOWER(title) LIKE LOWER($1) LIMIT 10`,
            [`%${query}%`]
        );
        res.json(result.rows);  // Возвращаем найденные товары
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// server.js
app.get('/api/products/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Возвращаем данные о товаре
        } else {
            res.status(404).json({ error: 'Товар не найден' });
        }
    } catch (err) {
        console.error('Ошибка при получении товара:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



// 🚀 Настройка порта и запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
