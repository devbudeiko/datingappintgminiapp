const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.BOT_TOKEN;

// Создаем экземпляр бота
const bot = new TelegramBot(token, {polling: true});

// Устанавливаем команды для меню
bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'}
]);

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Опции для кнопок
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Начать', url: 'https://t.me/WndyDatBot/Wndy'},
                    {text: 'Канал', url: 'https://t.me/wanaby_dating'}
                ]
            ]
        }
    };

    // URL изображения
    const imageUrl = 'https://wondy.online/assets/images/tg-intro-bot-one.png';

    // Отправляем сообщение с картинкой и кнопками
    bot.sendPhoto(chatId, imageUrl, options);
});

// Функция для отправки сообщения пользователю
function sendDeletionMessage(chatId) {
    const message = 'Мне жаль, что ты удалил(а) свою анкету 😔\n' +
        'Будет здорово, если ты оставишь мне обратную связь о своем опыте в приложении 🙂\n' +
        'Написать: @wanaby_dev';
    bot.sendMessage(chatId, message);
}

// Функция для отправки уведомления о лайке
function sendLikeNotification(chatId) {
    const message = 'Тебе поставили лайк 😊'

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Посмотреть 👀', url: 'https://t.me/WndyDatBot/Wndy' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, message, options);
}

// Функция для отправки уведомления о мэтче
function sendMatchNotification(chatId) {
    const message = 'У тебя новый мэтч 🎉';

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Посмотреть 👀', url: 'https://t.me/WndyDatBot/Wndy' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, message, options);
}

module.exports = {
    sendDeletionMessage,
    sendLikeNotification,
    sendMatchNotification
};