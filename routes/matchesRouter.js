const express = require("express");
const likesRouter = express.Router();
const { queryAsync } = require('../utils/db');
const { authMiddleware } = require('../utils/middleware');

likesRouter.get("/matches", authMiddleware, async (req, res) => {
    try {
        const authenticatedUserId = res.locals.initData.user.id;

        // Получаем список пользователей, с которыми есть взаимные лайки (матчи)
        const getMatchesQuery = `
            SELECT u.tg_user_id, u.tg_user_username, u.name, u.age, u.city, u.text, u.profile_image_url
            FROM matches m
                     JOIN users u ON (
                    (m.user_id_1 = ? AND m.user_id_2 = u.tg_user_id) OR
                    (m.user_id_2 = ? AND m.user_id_1 = u.tg_user_id)
                )
        `;
        const matchesResult = await queryAsync(getMatchesQuery, [authenticatedUserId, authenticatedUserId]);

        res.render("matches", { matches: matchesResult });
    } catch (error) {
        console.error('Ошибка при получении списка матчей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = likesRouter;
