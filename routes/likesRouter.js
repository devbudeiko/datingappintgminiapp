const express = require("express");
const likesRouter = express.Router();
const { queryAsync } = require('../utils/db');
const { authMiddleware } = require('../utils/middleware');

likesRouter.get("/likes", authMiddleware, async (req, res) => {
    try {
        const authenticatedUserId = res.locals.initData.user.id;

        // Получаем список пользователей, которые поставили лайк текущему пользователю, исключая скрытых пользователей
        const getLikesQuery = `
            SELECT u.tg_user_id, u.name, u.age, u.city, u.text, u.profile_image_url
            FROM likes l
                     JOIN users u ON l.user_id_from = u.tg_user_id
            WHERE l.user_id_to = ? AND l.flag = 1
              AND u.tg_user_id NOT IN (
                SELECT hidden_user_id
                FROM user_hidden_cards
                WHERE user_id = ?
            )
        `;
        const likesResult = await queryAsync(getLikesQuery, [authenticatedUserId, authenticatedUserId]);

        // Рендеринг страницы с данными о лайках
        res.render("likes", { users: likesResult });
    } catch (error) {
        console.error('Ошибка при получении списка лайков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = likesRouter;
