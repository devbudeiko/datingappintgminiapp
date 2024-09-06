const path = require('path');
const handlebars = require('express-handlebars');

exports.index = function (request, response) {
    response.render('likes', { title: 'Wanaby | Лайки' });
};