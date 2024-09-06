const express = require("express");
const homeController = require("../controllers/homeController.js");
const homeRouter = express.Router();
const {
    setInitData,
    getInitData,
    authMiddleware,
    showInitDataMiddleware,
    defaultErrorMiddleware,
} = require('../utils/middleware');
const { checkUserInitialization } = require('../utils/userUtils');

homeRouter.use(express.json());

homeRouter.get("/", homeController.index);
homeRouter.get("/privacy", homeController.privacy);
homeRouter.get("/disclaimer", homeController.disclaimer);

homeRouter.post("/checkUserInitData", authMiddleware, async (req, res) => {
    try {
        const result = await checkUserInitialization(res);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

homeRouter.use(defaultErrorMiddleware);

module.exports = homeRouter;