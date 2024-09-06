const path = require('path');
const handlebars = require('express-handlebars');

exports.index = function (request, response) {
    response.render('index', { title: 'Wanaby | Добро пожаловать' });
};

exports.privacy = function (request, response) {
    response.render('privacy', { title: 'Wanaby | Политика в отношении обработки персональных данных' });
};

exports.disclaimer = function (request, response) {
    response.render('disclaimer', { title: 'Wanaby | Отказ от ответственности' });
};