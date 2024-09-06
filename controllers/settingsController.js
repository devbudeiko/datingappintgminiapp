const path = require('path');
const handlebars = require('express-handlebars');

exports.index = function (request, response) {
    response.render('settings', { title: 'Wanaby | Настройки' });
};

exports.delete = function (request, response) {
    response.render('delete-sheet', { title: 'Wanaby | Удаление анкеты' });
};

exports.edit = function (request, response) {
    response.render('edit-sheet', { title: 'Wanaby | Редактирование анкеты' });
};

exports.update = function (request, response) {
    response.render('profile', { title: 'Wanaby | Профиль' });
};

exports.filter = function (request, response) {
    response.render('edit-filter', { title: 'Wanaby | Изменить критерии поиска' });
};

exports.update = function (request, response) {
    response.render('update-photo', { title: 'Wanaby | Обновление фото профиля' });
};