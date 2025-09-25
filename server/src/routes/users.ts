import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Form from '../models/Form';

const router = express.Router();

router.get('/', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const users = await User.find({ isMaster: false }).select('-password');
        const forms = await Form.find({ feedback: null });
        const usersWithCounts = users.map(user => {
            const ungradedCount = forms.filter(form => form.userId.equals(user._id)).length;
            return { ...user.toObject(), ungradedCount };
        });
        res.json(usersWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
