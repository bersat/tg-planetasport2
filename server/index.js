require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');


const token = process.env.HTTPAPI;
const webAppUrl = 'https://tg-bot-planetasport2.netlify.app';


const bot = new TelegramBot(token, { polling: true });


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Заполни форму', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data.data)

            await bot.sendMessage(chatId, 'Спасибо за обратную свзять!')
            await bot.sendMessage(chatId, 'Ваша страна: ' + data.country);
            await bot.sendMessage(chatId, 'Ваша удица: ' + data.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате')
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});