import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Form from '../models/Form';
import User from '../models/User';

const router = express.Router();

router.post('/', auth, async (req: AuthRequest, res) => {
    const { formData } = req.body;
    try {
        const user = await User.findById(req.user!.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const newForm = new Form({ userId: user._id, userFullName: `${user.firstName} ${user.lastName}`, formData });
        const form = await newForm.save();
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/', auth, async (req: AuthRequest, res) => {
    try {
        const forms = await Form.find({ userId: req.user!.id }).sort({ date: -1 });
        res.json(forms);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/user/:userId', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const forms = await Form.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(forms);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id', auth, async (req: AuthRequest, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ msg: 'Form not found' });
        if (form.userId.toString() !== req.user!.id && !req.user!.isMaster) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/feedback', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const form = await Form.findByIdAndUpdate(req.params.id, { $set: { feedback: req.body } }, { new: true });
        if (!form) return res.status(404).json({ msg: 'Form not found' });
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

export default router;
