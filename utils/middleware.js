const { validate, parse } = require("@tma.js/init-data-node");
const { checkUserExists } = require("./db");

const token = process.env.BOT_TOKEN;

function setInitData(res, initData) {
    res.locals.initData = initData;
}

function getInitData(res) {
    return res.locals.initData;
}

const authMiddleware = async (req, res, next) => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return res.redirect("/");
    }

    const initData = req.cookies.initData;

    if (!initData) {
        return res.redirect("/");
    }

    try {
        // validate(initData, token, { expiresIn: 3600 });
        setInitData(res, parse(initData));

        const userExists = await checkUserExists(res.locals.initData.user.id);

        if (userExists) {
            return next();
        }

        return res.redirect("/");
    } catch (e) {
        console.log("ошибка при проверке пользователя:", e);

        return res.redirect("/");
        // return res.status(401).json({ error: 'Unauthorized' });
    }
};

const showInitDataMiddleware = (_req, res, next) => {
    const initData = getInitData(res);
    if (!initData) {
        return next(
            new Error("Cant display init data as long as it was not found")
        );
    }
    res.json(initData);
};

const defaultErrorMiddleware = (err, _req, res, _next) => {
    res.status(500).json({
        error: err.message,
    });
};

module.exports = {
    setInitData,
    getInitData,
    authMiddleware,
    showInitDataMiddleware,
    defaultErrorMiddleware,
};
