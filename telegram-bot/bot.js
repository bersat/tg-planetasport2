const { Telegraf, session } = require('telegraf');

// === Токен и ID администратора ===
const bot = new Telegraf('7685888546:AAGFM9y_i8i-B7cYY46Sy0iS9Xj5OolHMSE'); // Токен бота
const ADMIN_ID = 1875616267; // Твой Telegram user ID

// === Подключение сессии ===
bot.use(session({ defaultSession: () => ({}) }));

// === Часто задаваемые вопросы ===
const faqList = [
    {
        q: "Как зарегистрироваться?",
        a: "Перейдите на сайт и нажмите кнопку 'Регистрация'. Заполните форму и подтвердите почту."
    },
    {
        q: "Как восстановить пароль?",
        a: "Нажмите 'Забыли пароль?' на странице входа и следуйте инструкциям."
    },
    {
        q: "Как связаться с поддержкой?",
        a: "Вы можете написать нам через кнопку /ask в боте."
    }
];

// === Команда /start ===
bot.start((ctx) => {
    ctx.reply("Привет! Я бот поддержки.\n\nДоступные команды:\n/faq – Часто задаваемые вопросы\n/ask – Задать вопрос администратору");
});

// === Команда /faq ===
bot.command('faq', (ctx) => {
    const message = faqList.map(item => `❓ ${item.q}\n💬 ${item.a}`).join('\n\n');
    ctx.reply(message);
});

// === Команда /ask ===
bot.command('ask', (ctx) => {
    ctx.session.awaitingQuestion = true;
    ctx.reply('✏️ Пожалуйста, напишите свой вопрос, и я передам его администратору.');
});

// === Обработка всех текстовых сообщений ===
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;

    // 1. Администратор отвечает пользователю
    if (userId === ADMIN_ID && ctx.session?.replyTo) {
        const answer = ctx.message.text;
        const targetUserId = ctx.session.replyTo;

        try {
            await bot.telegram.sendMessage(targetUserId, `💬 Ответ администратора:\n\n${answer}`);
            ctx.reply('✅ Ответ отправлен пользователю.');
        } catch (err) {
            ctx.reply('❌ Не удалось отправить ответ. Возможно, пользователь заблокировал бота.');
        }

        ctx.session.replyTo = null;
        return;
    }

    // 2. Пользователь отправил вопрос
    if (ctx.session?.awaitingQuestion) {
        const question = ctx.message.text;
        ctx.session.awaitingQuestion = false;

        const username = ctx.from.username || ctx.from.first_name;

        // Отправка вопроса админу
        await bot.telegram.sendMessage(ADMIN_ID,
            `📩 Вопрос от @${username} (ID: ${userId}):\n\n${question}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Ответить', callback_data: `reply_${userId}` }]
                ]
            }
        });

        ctx.reply('✅ Ваш вопрос отправлен. Ожидайте ответа от администратора.');
        return;
    }

    // 3. Все прочие случаи
    ctx.reply('Напишите /faq чтобы посмотреть часто задаваемые вопросы или /ask чтобы задать вопрос администратору.');
});

// === Обработка inline кнопки "Ответить" от администратора ===
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (ctx.from.id !== ADMIN_ID) {
        return ctx.answerCbQuery('⛔ У вас нет доступа.');
    }

    if (data.startsWith('reply_')) {
        const userId = data.split('_')[1];
        ctx.session.replyTo = userId;
        ctx.reply(`✏️ Введите ответ для пользователя с ID: ${userId}`);
    }

    ctx.answerCbQuery();
});

// === Запуск бота ===
bot.launch();
console.log('✅ Бот запущен');
