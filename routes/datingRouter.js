const express = require("express");
const datingRouter = express.Router();
const {queryAsync} = require('../utils/db');
const {authMiddleware, getInitData} = require('../utils/middleware');
const {sendLikeNotification, sendMatchNotification} = require('../utils/bot');

datingRouter.get("/dating", authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Получаем номер страницы
    const limit = 5; // Количество карточек на странице

    try {
        const initData = getInitData(res);
        const authenticatedUserId = initData.user.id;
        const allUsers = await getAllUsers(authenticatedUserId, page, limit);
        res.render('dating', {
            users: allUsers
        });
    } catch (error) {
        res.status(500).send('Ошибка сервера');
    }
});

async function getAllUsers(authenticatedUserId, page = 1, limit = 5) {

    const userQuery = `
        SELECT city, city_search, gender_category
        FROM users
        WHERE tg_user_id = ?
    `;

    const usersQuery = `
        SELECT name, age, city, tg_user_id, text, profile_image_url, gender
        FROM users
        WHERE tg_user_id != ?
          AND tg_user_id NOT IN (
            SELECT hidden_user_id
            FROM user_hidden_cards
            WHERE user_id = ?
          )
          AND (city = ? OR ? = 'all')
          AND (gender = ? OR ? = 'g3')
        ORDER BY tg_user_id
            LIMIT ?
    `;

    try {
        const userResult = await queryAsync(userQuery, [authenticatedUserId]);
        if (userResult.length === 0) {
            throw new Error('User not found');
        }

        const {city, city_search, gender_category} = userResult[0];
        const result = await queryAsync(usersQuery, [
            authenticatedUserId,
            authenticatedUserId,
            city_search,
            city_search,
            gender_category,
            gender_category,
            limit
        ]);

        return result;
    } catch (error) {
        throw error;
    }
}

datingRouter.post("/dating/like", authMiddleware, async (req, res) => {
    try {
        const authenticatedUserId = res.locals.initData.user.id;
        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({error: 'Не указан userId'});
        }

        const userExistsQuery = `
            SELECT tg_user_id
            FROM users
            WHERE tg_user_id = ?
        `;
        const userExistsResult = await queryAsync(userExistsQuery, [userId]);
        if (userExistsResult.length === 0) {
            return res.status(404).json({error: 'Пользователь не найден'});
        }

        // Добавляем запись в таблицу user_hidden_cards
        const insertHiddenCardQuery = `
            INSERT INTO user_hidden_cards (user_id, hidden_user_id)
            VALUES (?, ?) ON DUPLICATE KEY
            UPDATE hidden_user_id =
            VALUES (hidden_user_id)
        `;
        await queryAsync(insertHiddenCardQuery, [authenticatedUserId, userId]);

        const insertLikeQuery = `
            INSERT INTO likes (user_id_from, user_id_to, flag)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE flag = 1
        `;
        await queryAsync(insertLikeQuery, [authenticatedUserId, userId]);

        const checkMutualLikeQuery = `
            SELECT *
            FROM likes
            WHERE user_id_from = ? AND user_id_to = ? AND flag = 1
        `;
        const mutualLikeResult = await queryAsync(checkMutualLikeQuery, [userId, authenticatedUserId]);

        if (mutualLikeResult.length > 0) {
            const insertMatchQuery = `
                INSERT INTO matches (user_id_1, user_id_2)
                VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE user_id_1 = VALUES(user_id_1), user_id_2 = VALUES(user_id_2)
            `;
            await queryAsync(insertMatchQuery, [authenticatedUserId, userId]);

            const deleteLikesQuery = `
                DELETE FROM likes
                WHERE (user_id_from = ? AND user_id_to = ?) OR (user_id_from = ? AND user_id_to = ?)
            `;
            await queryAsync(deleteLikesQuery, [authenticatedUserId, userId, userId, authenticatedUserId]);

            // Отправляем уведомление о мэтче обоим пользователям
            const tgUserId2 = userExistsResult[0].tg_user_id;
            sendMatchNotification(authenticatedUserId);
            sendMatchNotification(tgUserId2);

            return res.status(200).json({message: 'Лайк успешно добавлен и матч найден!', match: true});
        } else {
            // Отправляем уведомление о лайке
            const tgUserId = userExistsResult[0].tg_user_id;
            sendLikeNotification(tgUserId);

            return res.status(200).json({message: 'Лайк успешно добавлен.', match: false});
        }
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({error: 'Ошибка сервера'});
    }
});

datingRouter.post("/dating/dislike", authMiddleware, async (req, res) => {
    try {
        const authenticatedUserId = res.locals.initData.user.id;
        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({error: 'Не указан userId'});
        }

        const userExistsQuery = `
            SELECT COUNT(*) AS count
            FROM users
            WHERE tg_user_id = ?
        `;
        const userExistsResult = await queryAsync(userExistsQuery, [userId]);
        if (userExistsResult[0].count === 0) {
            return res.status(404).json({error: 'Пользователь не найден'});
        }

        // Добавляем запись в таблицу user_hidden_cards
        const insertHiddenCardQuery = `
            INSERT INTO user_hidden_cards (user_id, hidden_user_id)
            VALUES (?, ?) ON DUPLICATE KEY
            UPDATE hidden_user_id =
            VALUES (hidden_user_id)
        `;
        await queryAsync(insertHiddenCardQuery, [authenticatedUserId, userId]);

        // Обновляем таблицу likes, устанавливая флаг дизлайка
        const insertDislikeQuery = `
            INSERT INTO likes (user_id_from, user_id_to, flag)
            VALUES (?, ?, 0) ON DUPLICATE KEY
            UPDATE flag = 0
        `;
        await queryAsync(insertDislikeQuery, [authenticatedUserId, userId]);

        res.status(200).json({message: 'Дизлайк успешно добавлен'});
    } catch (error) {
        console.error('Ошибка при добавлении дизлайка:', error);
        res.status(500).json({error: 'Ошибка сервера'});
    }
});

module.exports = datingRouter;