const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const axios = require('axios');
const fs = require('fs');
const mysql = require('mysql');
const multer = require('multer');
const sharp = require('sharp');
const Joi = require('joi');
const cookieParser = require('cookie-parser');

dotenv.config();

// Определяем basePath здесь
const basePath = path.join(__dirname, 'views');

// Контроллеры
const homeController = require("./controllers/homeController.js");
const registrationController = require("./controllers/registrationController.js");
const datingController = require("./controllers/datingController.js");
const likesController = require("./controllers/likesController.js");
const matchesController = require("./controllers/matchesController.js");
const settingsController = require("./controllers/settingsController.js");
// Маршруты
const homeRouter = require("./routes/homeRouter.js");
const registrationRouter = require("./routes/registrationRouter.js");
const datingRouter = require("./routes/datingRouter.js");
const matchesRouter = require("./routes/matchesRouter.js");
const likesRouter = require("./routes/likesRouter.js");
const settingsRouter = require("./routes/settingsRouter.js");
app.use(cookieParser());
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: true, limit: '1mb'}));

app.use('/uploads/verification', express.static(path.join(__dirname, 'uploads/verification')));
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));

// Настройка Handlebars с макетами
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main', // Основной макет
    layoutsDir: path.join(basePath, 'layouts'), // Директория макетов
    partialsDir: [path.join(basePath, 'partials')] // Директория частичных шаблонов
}));
app.set('view engine', 'hbs');
app.set('views', basePath);

// Регистрация частичных шаблонов
exphbs.create({}).getPartials().then(partials => {
    app.locals.partials = partials;
});

/* Маршруты для контроллеров */
// Домашняя страница
app.use("/", homeRouter);
// Политика конфиденциальности
app.use("/privacy", homeRouter);
// Отказ от ответственности
app.use("/disclaimer", homeRouter);
// Создание анкеты
app.use("/", registrationRouter);
// Профиль
app.use("/", datingRouter);
// Лайки
app.use("/", likesRouter);
// Мэтчи
app.use("/", matchesRouter);
// Настройки
app.use("/", settingsRouter);
app.use("/delete-sheet", settingsRouter);
app.use("/edit-sheet", settingsRouter);
app.use("/edit-filter", settingsRouter);
app.use("/update-photo", settingsRouter);
app.use("/profile", settingsRouter);

app.get('/not-username', (req, res) => {
    res.status(403).render('not-username', {title: '403 | Нет доступа'});
});

app.get('/403', (req, res) => {
    res.status(403).render('403', {title: '403 | Нет доступа'});
});

// Маршрут для страницы 404
app.use((req, res, next) => {
    res.status(404).render('404', {title: '404 | Страница не найдена'});
});

// Общий обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {title: '500 | Что-то пошло не так'});
});

// Прослушиваем порт 3000
app.listen(3000, () => {
    console.log('Сервер запущен на порте 3000');
});