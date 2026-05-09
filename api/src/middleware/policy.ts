import { Request, Response, NextFunction } from 'express';
import { resolveQuota, checkAndIncrementUsage, UserWithPlanAndOverrides } from '../services/policy.js';

export interface PolicyRequest extends Request {
    user?: UserWithPlanAndOverrides | null;
    policy?: {
        quota: ReturnType<typeof resolveQuota>;
        usage: { allowed: boolean; remaining: number };
    };
}

export const unifiedPolicyEngine = async (req: PolicyRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user ?? null;

        if (user) {
            if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
                res.status(403).json({ error: 'User is suspended or banned.' });
                return;
            }
        }

        const quota = resolveQuota(user);
        
        // Use user ID if authenticated, else IP address
        let identifier = '';
        if (user) {
            identifier = `user:${user.id}`;
        } else {
            identifier = `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
        }

        const usage = await checkAndIncrementUsage(identifier, quota);

        req.policy = {
            quota,
            usage
        };

        if (!usage.allowed) {
            res.status(429).json({
                error: 'Too Many Requests',
                message: `You have exceeded your daily limit of ${quota.dailyLimit} requests.`
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Policy Engine Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
