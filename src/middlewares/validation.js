function validateUserData(req, res, next) {
    const { firstName, secondName, email, age, password } = req.body;

    if (!firstName || !secondName || !email || !age || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    next();
}

module.exports = { validateUserData };