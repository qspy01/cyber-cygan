import { Router } from 'express';
import { signup, login, SignupSchema, LoginSchema } from '../services/auth.js';
import { generateAccessToken, generateRefreshToken, revokeSession } from '../services/session.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/signup', validate(SignupSchema), async (req, res) => {
    try {
        await signup(req.body);
        res.status(201).json({ message: 'User created successfully' });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/login', validate(LoginSchema), async (req, res) => {
    try {
        const user = await login(req.body);
        const accessToken = await generateAccessToken(user.id);
        const refreshToken = await generateRefreshToken(user.id, req.headers['user-agent'], req.ip);
        
        res.json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email }
        });
    } catch (e: any) {
        res.status(401).json({ error: e.message });
    }
});

router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];
        
        if (refreshToken) {
            await revokeSession(refreshToken, accessToken);
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (e: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
