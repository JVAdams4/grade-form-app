import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ firstName, lastName, email, password, isMaster: email === process.env.MASTER_EMAIL });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, isMaster: user.isMaster } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, isMaster: user.isMaster } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) { res.status(500).send('Server error'); }
});

router.get('/', auth, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user!.id);
        res.json(user);
    } catch (err) { res.status(500).send('Server Error'); }
});

export default router;
