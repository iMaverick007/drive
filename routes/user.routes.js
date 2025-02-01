import express from 'express';
const router = express.Router();
import { body, validationResult } from 'express-validator';
import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register',
    body('email').isEmail().isLength({ min: 13 }),
    body('password').isLength({ min: 5 }),
    body('username').isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid Data'
            });
        }
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ username, email, password: hashedPassword });
        res.send('Registration Successfull')
    });

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid Data'
            });
        }
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: 'username or password is incorrect'
            });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: 'username or password is incorrect'
            });
        }
        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token);
        res.send('Login successful');
    }
);

export default router;