const express = require("express");
const settingsRouter = express.Router();
const { queryAsync } = require('../utils/db');
const { authMiddleware, getInitData } = require('../utils/middleware');
const Joi = require('joi');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { sendDeletionMessage } = require('../utils/bot');

const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: 'uploads/profile/',
    limits: {
        fileSize: 10 * 1024 * 1024,
    }
});

const getFullImageUrl = (req, relativePath) => {
    return `${req.protocol}://${req.get('host')}/${relativePath}`;
};

settingsRouter.get("/settings", authMiddleware, async (req, res) => {
    res.render('settings');
});

settingsRouter.get("/settings/delete-sheet", authMiddleware, async (req, res) => {
    res.render('delete-sheet');
});

settingsRouter.get('/settings/edit-filter', authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;

    const query = `
        SELECT city
        FROM users
        WHERE tg_user_id = ?
    `;

    try {
        const result = await queryAsync(query, [userId]);
        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = result[0];

        res.render('edit-filter', {
            city: user.city
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});



settingsRouter.get("/settings/update-photo", authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        const [user] = await queryAsync('SELECT profile_image_url FROM users WHERE tg_user_id = ?', [userId]);
        const profileImageUrl = user.profile_image_url ? getFullImageUrl(req, user.profile_image_url) : null;
        res.render('update-photo', { profileImageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке фото профиля' });
    }
});

settingsRouter.get("/settings/edit-sheet", authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        const [user] = await queryAsync('SELECT name, age, city, text FROM users WHERE tg_user_id = ?', [userId]);
        res.render('edit-sheet', { user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке данных пользователя' });
    }
});

settingsRouter.get("/settings/profile", authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        const [user] = await queryAsync('SELECT name, age, city, text, tg_user_id, profile_image_url FROM users WHERE tg_user_id = ?', [userId]);
        res.render('profile', { user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке данных пользователя' });
    }
});

settingsRouter.post("/settings/delete-sheet/delete-profile", authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        // Удаление связанных записей из таблицы `user_hidden_cards`
        await queryAsync('DELETE FROM user_hidden_cards WHERE user_id = ?', [userId]);

        // Удаление связанных записей из таблицы `matches`
        await queryAsync('DELETE FROM matches WHERE user_id_1 = ? OR user_id_2 = ?', [userId, userId]);

        // Удаление пользователя из таблицы `users`
        const result = await queryAsync('DELETE FROM users WHERE tg_user_id = ?', [userId]);

        sendDeletionMessage(userId);

        // Редирект на главную страницу
        return res.redirect('/');
    } catch (error) {
        console.error('Error during deletion:', error.message);
        res.status(500).json({ message: 'Ошибка при удалении анкеты', error: error.message });
    }
});

const profileSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(2).required(),
    city: Joi.string().required(),
    text: Joi.string().allow('')
});

settingsRouter.post('/settings/edit-sheet/update-profile', authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        const validatedData = await profileSchema.validateAsync(req.body, { abortEarly: false });

        const sql = `
            UPDATE users SET 
                name = ?, 
                age = ?, 
                city = ?, 
                city_search = ?, 
                text = ? 
            WHERE 
                tg_user_id = ?
        `;

        const params = [
            validatedData.name,
            validatedData.age,
            validatedData.city,
            validatedData.city, // обновляем city_search
            validatedData.text || null,
            userId
        ];

        try {
            await queryAsync(sql, params);

            res.sendStatus(200);
        } catch (error) {
            res.status(500).send('Ошибка сервера');
        }
    } catch (error) {
        res.status(400).json({ message: error.details.map(d => d.message) });
    }
});

// Схема валидации для данных фильтра
const filterSchema = Joi.object({
    gender_category: Joi.string().valid('g1', 'g2', 'g3').optional(),
    city: Joi.string().allow('').optional() // Разрешаем пустую строку
});

// Маршрут для обновления фильтра настроек
settingsRouter.post('/settings/edit-filter/update-filter', authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;

    try {
        // Валидация данных, полученных из тела запроса
        const validatedData = await filterSchema.validateAsync(req.body, { abortEarly: false });

        const updateFields = [];
        const params = [];

        if (validatedData.gender_category) {
            updateFields.push('gender_category = ?');
            params.push(validatedData.gender_category);
        }

        // Проверяем, выбран ли город пользователя
        if (validatedData.city !== undefined && validatedData.city !== null && validatedData.city !== '') {
            updateFields.push('city_search = ?');
            params.push(validatedData.city);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Нужно выбрать хотя бы один критерий' });
        }

        params.push(userId);

        // SQL запрос для обновления данных пользователя
        const sql = `
            UPDATE users SET 
                ${updateFields.join(', ')}
            WHERE 
                tg_user_id = ?
        `;

        try {
            // Выполняем SQL запрос с параметрами
            await queryAsync(sql, params);

            // Отправляем успешный статус в ответ
            res.sendStatus(200);
        } catch (error) {
            // В случае ошибки сервера отправляем статус 500 и сообщение об ошибке
            res.status(500).send('Ошибка сервера');
        }
    } catch (error) {
        // В случае ошибки валидации отправляем статус 400 и сообщение об ошибке
        res.status(400).json({ message: 'Некорректные данные' });
    }
});

settingsRouter.get("/settings/update-photo", authMiddleware, async (req, res) => {
    const userId = res.locals.initData.user.id;
    try {
        const [user] = await queryAsync('SELECT profile_image_url FROM users WHERE tg_user_id = ?', [userId]);
        res.render('update-photo', { user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке данных пользователя' });
    }
});

settingsRouter.post('/settings/update-photo/update-photo', authMiddleware, upload.single('profileImage'), async (req, res) => {
    const userId = res.locals.initData.user.id;

    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', 'profile', `userid_${userId}.jpg`);

    try {
        await sharp(inputPath)
            .rotate()
            .resize({ width: 800 })
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        fs.unlinkSync(inputPath);

        const profileImageUrl = outputPath;

        const sql = 'UPDATE users SET profile_image_url = ? WHERE tg_user_id = ?';
        await queryAsync(sql, [profileImageUrl, userId]);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = settingsRouter;
