const { checkUserInitialization } = require('../utils/userUtils');
const { authMiddleware, getInitData } = require('../utils/middleware');

// Список запрещенных страниц для пользователей, которых нет в БД и не прошли аутентификацию
const restrictedPages = ['/dating'];

const authCheckMiddleware = async (req, res, next) => {
    try {
        // Выполняем аутентификацию пользователя
        await authMiddleware(req, res, async () => {
            // Проверяем, является ли запрашиваемая страница запрещенной
            if (restrictedPages.includes(req.path)) {
                const initData = getInitData(res);

                // Проверяем инициализацию пользователя
                const { exists } = await checkUserInitialization(res);

                if (!exists) {
                    // Если пользователь не найден в базе данных, отдаем ошибку 401
                    return res.status(401).send('Unauthorized');
                }
            }

            // Если все проверки пройдены, продолжаем обработку запроса
            next();
        });
    } catch (error) {
        console.error('Error in authCheckMiddleware:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = authCheckMiddleware;