const mysql = require('mysql');

// Настройка соединения с базой данных
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to database');
});

async function checkUserExists(userId) {
    const query = 'SELECT COUNT(*) AS count FROM users WHERE tg_user_id = ?';
    try {
        const result = await queryAsync(query, [userId]);
        return result[0].count > 0;
    } catch (error) {
        console.error('Ошибка при выполнении запроса к базе данных:', error);
        throw error;
    }
}

function queryAsync(sql, args) {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    db,
    checkUserExists,
    queryAsync
};