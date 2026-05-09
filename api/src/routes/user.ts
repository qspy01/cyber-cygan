import { Router, Request, Response } from 'express';
import prisma from '../core/prisma.js';
import { initClient } from '../core/redis.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get user usage
const getUserUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { plan: true }
        });

        if (!user || !user.plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }

        // Fetch usage from Redis (assumed counters based on task)
        // Implementation note: These keys need to be defined based on your actual Redis structure.
        // I will use a placeholder logic here as per instructions.
        await initClient();
        // const dailyUsage = await redisClient.get(`usage:daily:${userId}`);
        // const monthlyUsage = await redisClient.get(`usage:monthly:${userId}`);
        
        // Mock usage for structure demonstration:
        const dailyUsage = 0; 
        const monthlyUsage = 0;

        res.json({
            dailyUsage,
            monthlyUsage,
            currentPlan: user.plan.name,
            nextReset: new Date(new Date().setHours(24, 0, 0, 0)) // Example: midnight
        });
    } catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user activity
const getUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const activities = await prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.get('/usage', authMiddleware, getUserUsage);
router.get('/activity', authMiddleware, getUserActivity);

export default router;
