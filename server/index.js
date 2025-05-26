require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // PostgreSQL pool
const nodemailer = require('nodemailer');
const crypto = require('crypto');



const transporter = nodemailer.createTransport({
    service: 'gmail', // или любой другой почтовый сервис
    auth: {
        user: 'your-email@gmail.com',  // ваш email
        pass: 'your-email-password'    // ваш пароль (или лучше использовать OAuth2)
    }
});

const sendResetCodeEmail = async (email, resetCode) => {
    const mailOptions = {
        from: 'your-email@gmail.com',  // ваш email
        to: email,
        subject: 'Сброс пароля',
        text: `Ваш код для сброса пароля: ${resetCode}. Он действует 30 минут.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email отправлен: ' + info.response);
    } catch (error) {
        console.error('Ошибка при отправке email: ', error);
    }
};



const app = express();
app.use(cors());
app.use(bodyParser.json());

// Регистрация
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


// Авторизация
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

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // { id, email, role }
        next();
    });
};

app.get('/api/profile', (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Нет токена' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Например, decoded.id
        db.query('SELECT * FROM users WHERE id = $1', [decoded.id])
            .then(result => {
                if (result.rows.length === 0) {
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }

                const user = result.rows[0];
                res.json({
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                });
            })
            .catch(err => {
                console.error('Ошибка SQL-запроса:', err);
                res.status(500).json({ message: 'Ошибка запроса к БД' });
            });

    } catch (err) {
        console.error('Ошибка авторизации:', err);
        res.status(500).json({ message: 'Ошибка сервера при авторизации' });
    }
});


app.put('/api/profile', authenticateToken, async (req, res) => {
    const { full_name, email, phone } = req.body;
    const userId = req.user.id;

    // Логируем полученные данные
    console.log('Полученные данные:', req.body);

    if (!full_name || !email || !phone) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    try {
        // Проверка на уникальность email и телефона
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const phoneCheck = await db.query('SELECT * FROM users WHERE phone = $1 AND id != $2', [phone, userId]);
        if (phoneCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким телефоном уже существует' });
        }

        // Обновление данных
        const updateQuery = `
      UPDATE users
      SET full_name = $1, email = $2, phone = $3
      WHERE id = $4
      RETURNING id, full_name, email, phone;
    `;

        const updatedUser = await db.query(updateQuery, [full_name, email, phone, userId]);

        res.json({
            message: 'Профиль обновлен',
            user: updatedUser.rows[0],
        });
    } catch (err) {
        console.error('Ошибка обновления профиля:', err);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
});


app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Пожалуйста, введите email' });
    }

    try {
        // Проверка, существует ли пользователь с таким email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Пользователь с таким email не найден' });
        }

        // Генерация случайного кода для сброса пароля
        const resetCode = crypto.randomBytes(3).toString('hex');  // 6-значный код, например, "a3b2c9"

        // Устанавливаем код сброса и срок его действия в базу данных
        const resetCodeExpiry = new Date(Date.now() + 30 * 60 * 1000);  // 30 минут

        await db.query(
            'UPDATE users SET reset_code = $1, reset_code_expiry = $2 WHERE email = $3',
            [resetCode, resetCodeExpiry, email]
        );

        // Отправляем email с кодом сброса пароля
        await sendResetCodeEmail(email, resetCode);

        res.status(200).json({ message: 'На ваш email отправлен код для сброса пароля' });
    } catch (err) {
        console.error('Ошибка при восстановлении пароля:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.post('/api/reset-password', async (req, res) => {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
        return res.status(400).json({ message: 'Пожалуйста, введите код и новый пароль' });
    }

    try {
        // Проверяем, существует ли пользователь с таким кодом и код не истек
        const userResult = await db.query('SELECT * FROM users WHERE reset_code = $1 AND reset_code_expiry > NOW()', [code]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Неверный код или срок его действия истек' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль пользователя
        await db.query('UPDATE users SET password = $1, reset_code = NULL, reset_code_expiry = NULL WHERE id = $2', [hashedPassword, user.id]);

        res.json({ success: true, message: 'Пароль успешно сброшен!' });
    } catch (err) {
        console.error('Ошибка при сбросе пароля:', err);
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
    const {
        category,
        gender,
        type,
        brand,
        feature,
        priceMin,
        priceMax,
        size
    } = req.query;

    let query = `
    SELECT DISTINCT p.*, b.name AS brand_name, p.image_url, p.color, p.quantity
    FROM products p
    JOIN types t ON p.type_id = t.id
    JOIN categories c ON t.category_id = c.id
    JOIN genders g ON p.gender_id = g.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    LEFT JOIN feature_values fv ON pf.feature_value_id = fv.id
    LEFT JOIN features f ON fv.feature_id = f.id
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

    if (brand) {
        let brandList = Array.isArray(brand)
            ? brand
            : brand.includes(',') ? brand.split(',').map(b => b.trim()) : [brand];

        if (brandList.length) {
            const placeholders = brandList.map((_, idx) => `$${count + idx}`).join(',');
            query += ` AND b.name IN (${placeholders})`;
            values.push(...brandList);
            count += brandList.length;
        }
    }

    if (feature) {
        query += ` AND fv.value = $${count++}`;
        values.push(feature);
    }

    if (priceMin) {
        query += ` AND p.price >= $${count++}`;
        values.push(priceMin);
    }

    if (priceMax) {
        query += ` AND p.price <= $${count++}`;
        values.push(priceMax);
    }

    try {
        const result = await db.query(query, values);
        const products = result.rows;

        // Если фильтрация по размеру — делаем отдельно
        let filteredProducts = products;
        if (size) {
            const sizeList = Array.isArray(size)
                ? size
                : size.includes(',') ? size.split(',').map(s => s.trim()) : [size];

            const sizeQuery = `
        SELECT DISTINCT ps.product_id
        FROM product_sizes ps
        JOIN sizes s ON ps.size_id = s.id
        WHERE s.name = ANY($1)
      `;
            const sizeResult = await db.query(sizeQuery, [sizeList]);
            const allowedProductIds = sizeResult.rows.map(r => r.product_id);
            filteredProducts = products.filter(p => allowedProductIds.includes(p.id));
        }

        // Получаем размеры
        const productIds = filteredProducts.map(p => p.id);
        const sizeQuery = `
      SELECT ps.product_id, s.name AS size
      FROM product_sizes ps
      JOIN sizes s ON ps.size_id = s.id
      WHERE ps.product_id = ANY($1)
    `;
        const sizeResult = await db.query(sizeQuery, [productIds]);

        const sizeMap = {};
        sizeResult.rows.forEach(({ product_id, size }) => {
            if (!sizeMap[product_id]) sizeMap[product_id] = [];
            sizeMap[product_id].push(size);
        });

        // Добавляем размеры в каждый товар
        filteredProducts = filteredProducts.map(product => ({
            ...product,
            sizes: sizeMap[product.id] || []  // Связанные размеры товара
        }));

        res.json(filteredProducts);
    } catch (err) {
        console.error('Ошибка при получении товаров:', err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



// Добавить отзыв
app.post('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = req.params.id;
        const { user_id, rating, comment } = req.body;

        if (!user_id || !rating) {
            return res.status(400).json({ error: 'user_id и rating обязательны' });
        }

        await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)',
            [user_id, productId, rating, comment]
        );

        res.status(201).json({ message: 'Отзыв добавлен' });
    } catch (err) {
        console.error('Ошибка при добавлении отзыва:', err);
        res.status(500).json({ error: 'Ошибка сервера при добавлении отзыва' });
    }
});


// Получить отзывы по товару
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT reviews.*, users.full_name FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.product_id = $1
            ORDER BY reviews.created_at DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении отзывов:', err);
        res.status(500).json({ error: 'Ошибка сервера при получении отзывов' });
    }
});



// Получение всех брендов
app.get('/api/brands', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM brands');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching brands:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Получение всех характеристик (features)
app.get('/api/features', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM features');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching features:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/feature-values', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT fv.id, fv.value, f.name AS feature
            FROM feature_values fv
            JOIN features f ON fv.feature_id = f.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении значений характеристик:', err.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех размеров
app.get('/api/sizes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sizes');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sizes:', err.message);
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


app.get('/api/products/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        // Получаем данные о товаре
        const productResult = await db.query('SELECT * FROM products WHERE id = $1', [productId]);

        if (productResult.rows.length > 0) {
            const product = productResult.rows[0];

            // Получаем размеры товара из таблицы product_size и size
            const sizesResult = await db.query(
                `SELECT s.name
         FROM product_sizes ps
         JOIN sizes s ON ps.size_id = s.id
         WHERE ps.product_id = $1`,
                [productId]
            );

            // Преобразуем результаты в массив размеров
            const sizes = sizesResult.rows.map(row => row.name);

            // Добавляем размеры к объекту товара
            product.sizes = sizes;

            console.log('Product Sizes:', product.sizes);  // Проверка в консоли

            res.json(product);  // Возвращаем данные о товаре
        } else {
            res.status(404).json({ error: 'Товар не найден' });
        }
    } catch (err) {
        console.error('Ошибка при получении товара:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Настройка порта и запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
