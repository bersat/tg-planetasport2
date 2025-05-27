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

app.post('/api/orders', async (req, res) => {
    const { user_id, name, phone, email, address, totalItems, totalPrice, orderItems } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'Пользователь не авторизован' });
    }

    try {
        // Получаем максимальный номер заказа, чтобы сгенерировать новый
        const result = await db.query('SELECT MAX(order_number) AS max_order_number FROM orders');
        const maxOrderNumber = result.rows[0].max_order_number || 0; // Если заказов нет, начинаем с 1

        const orderNumber = maxOrderNumber + 1; // Генерация следующего номера заказа

        // Вставляем данные в таблицу заказов, включая user_id
        const orderRes = await db.query(
            'INSERT INTO orders (user_id, name, phone, email, address, total_items, total_price, order_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, order_number',
            [user_id, name, phone, email, address, totalItems, totalPrice, orderNumber]
        );

        const orderId = orderRes.rows[0].id;

        // Вставляем товары в таблицу order_items
        const orderItemsPromises = orderItems.map(item => {
            return db.query(
                'INSERT INTO order_items (order_id, product_id, title, price, quantity, size) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, item.product_id, item.title, item.price, item.quantity, item.size]
            );
        });

        await Promise.all(orderItemsPromises);

        // Отправляем успешный ответ с номером заказа
        res.status(201).json({ orderNumber: orderRes.rows[0].order_number });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/orders', async (req, res) => {
    // Получаем user_id из токена
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    try {
        // Расшифровываем токен
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Получаем user_id из токена

        // Запрашиваем заказы для конкретного пользователя
        const ordersResult = await db.query(
            'SELECT id, order_number, total_price, total_items, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        if (ordersResult.rows.length === 0) {
            return res.status(404).json({ message: 'У вас нет заказов.' });
        }

        const orders = ordersResult.rows;

        // Для каждого заказа получаем детали
        const orderDetailsPromises = orders.map(async (order) => {
            const orderItemsResult = await db.query(
                'SELECT product_id, title, price, quantity, size FROM order_items WHERE order_id = $1',
                [order.id]
            );
            return { ...order, items: orderItemsResult.rows };
        });

        const fullOrders = await Promise.all(orderDetailsPromises);

        res.status(200).json(fullOrders);
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех заказов с данными пользователя
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    try {
        // Проверяем, что пользователь имеет роль 'admin'
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        // Получаем все заказы с данными пользователя и товарами
        const ordersResult = await db.query(`
            SELECT o.id AS order_id, o.created_at, o.total_price, u.full_name, u.email,
                   oi.title, oi.price, oi.quantity, oi.size
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ORDER BY o.created_at DESC
        `);

        // Преобразуем результат в структуру, нужную для клиента
        const orders = ordersResult.rows.reduce((acc, order) => {
            const existingOrder = acc.find(o => o.order_id === order.order_id);
            if (existingOrder) {
                existingOrder.items.push({
                    product_name: order.title,
                    price: order.price,
                    quantity: order.quantity,
                    size: order.size || 'Не указан',
                });
            } else {
                acc.push({
                    order_id: order.order_id,
                    created_at: order.created_at,
                    total_price: order.total_price,
                    full_name: order.full_name,
                    email: order.email,
                    items: [{
                        product_name: order.title,
                        price: order.price,
                        quantity: order.quantity,
                        size: order.size || 'Не указан',
                    }]
                });
            }
            return acc;
        }, []);

        res.json(orders); // Возвращаем массив заказов с товарами
    } catch (err) {
        console.error('Ошибка при получении заказов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавление товара в избранное
app.post('/api/favorites', authenticateToken, async (req, res) => {
    const { product_id, title, description, price, image_url } = req.body;
    const user_id = req.user.id;

    console.log("Добавляем товар:", req.body); // Логирование данных, полученных от клиента

    if (!product_id || !title || !price) {
        return res.status(400).json({ message: 'Необходимы обязательные параметры (product_id, title, price)' });
    }

    try {
        // Проверка, есть ли уже этот товар в избранном у данного пользователя
        const existingFavorite = await db.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({ message: 'Товар уже добавлен в избранное' });
        }

        // Добавляем товар в избранное
        await db.query(
            'INSERT INTO favorites (user_id, product_id, title, description, price, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
            [user_id, product_id, title, description, price, image_url]
        );

        res.status(201).json({ message: 'Товар успешно добавлен в избранное' });
    } catch (err) {
        console.error('Ошибка при добавлении товара в избранное:', err); // Логирование ошибки
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// Получение списка избранных товаров
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query('SELECT * FROM favorites WHERE user_id = $1', [user_id]);
        res.json(result.rows);  // Отправляем избранные товары
    } catch (err) {
        console.error('Ошибка при получении избранных товаров:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// Удаление товара из избранного
app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        // Проверяем, существует ли товар в избранном у пользователя
        const favorite = await db.query('SELECT * FROM favorites WHERE id = $1 AND user_id = $2', [id, user_id]);

        if (favorite.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден в избранном' });
        }

        // Удаляем товар из избранного
        await db.query('DELETE FROM favorites WHERE id = $1', [id]);

        res.json({ message: 'Товар удален из избранного' });
    } catch (err) {
        console.error('Ошибка при удалении товара из избранного:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    const { product_id, title, description, price, image_url, quantity, size } = req.body;
    const user_id = req.user.id;

    console.log("Добавляем товар в корзину:", req.body);

    // Проверка обязательных параметров
    if (!product_id || !title || !price || !quantity) {
        return res.status(400).json({ message: 'Необходимы обязательные параметры (product_id, title, price, quantity)' });
    }

    // Если размер товара не указан, передаем null
    const sizeToInsert = size || null;

    try {
        // Проверка, есть ли уже этот товар в корзине у данного пользователя
        const existingItem = await db.query(
            'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingItem.rows.length > 0) {
            // Если товар уже есть, обновляем его количество
            const updatedQuantity = existingItem.rows[0].quantity + quantity;
            await db.query(
                'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
                [updatedQuantity, user_id, product_id]
            );
            return res.status(200).json({ message: 'Количество товара в корзине обновлено' });
        }

        // Добавляем новый товар в корзину, с проверкой на размер
        await db.query(
            'INSERT INTO cart (user_id, product_id, size, title, description, price, image_url, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [user_id, product_id, sizeToInsert, title, description, price, image_url, quantity]
        );

        res.status(201).json({ message: 'Товар успешно добавлен в корзину' });
    } catch (err) {
        console.error('Ошибка при добавлении товара в корзину:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.get('/api/cart', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query('SELECT * FROM cart WHERE user_id = $1', [user_id]);
        res.json(result.rows);  // Отправляем товары из корзины
    } catch (err) {
        console.error('Ошибка при получении корзины:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Это ID записи корзины
    const user_id = req.user.id;

    try {
        // Ищем товар по ID записи корзины
        const cartItem = await db.query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [id, user_id]);

        if (cartItem.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        // Удаляем товар из корзины по ID записи
        await db.query('DELETE FROM cart WHERE id = $1', [id]);

        res.json({ message: 'Товар удалён из корзины' });
    } catch (err) {
        console.error('Ошибка при удалении товара из корзины:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// Настройка порта и запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
