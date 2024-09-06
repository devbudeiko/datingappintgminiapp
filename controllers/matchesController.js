const path = require('path');
const handlebars = require('express-handlebars');

exports.index = function (request, response) {
    response.render('matches', { title: 'Wanaby | Мэтчи' });
};