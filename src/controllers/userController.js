const db = require('../database');
const jwt = require('jsonwebtoken');

// Функція для генерації токена
function generateToken(userId) {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET || 'your_secret_key', 
        { expiresIn: '1h' }
    );
}

// Функція реєстрації
function registerUser(req, res) {
    const { firstName, secondName, email, age, password } = req.body;

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.status(400).json({ error: 'Email is already registered' });
        } else {
            const insertUserQuery = 'INSERT INTO users (firstName, secondName, email, age, password) VALUES (?, ?, ?, ?, ?)';
            db.query(insertUserQuery, [firstName, secondName, email, age, password], (err, result) => {
                if (err) throw err;

                const userId = result.insertId; // отримуємо ID користувача
                const token = generateToken(userId); // генеруємо токен з ID користувача
                res.status(200).json({
                    message: 'User registered successfully',
                    userId: userId,  // Додаємо userId до відповіді
                    token: token
                });
            });
        }
    });
}


module.exports = { registerUser };