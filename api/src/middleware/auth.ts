import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { isTokenRevoked } from '../core/redis.js';

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized: Missing token' });
            return;
        }

        const isRevoked = await isTokenRevoked(token);
        if (isRevoked) {
            res.status(401).json({ error: 'Unauthorized: Token has been revoked' });
            return;
        }

        const decoded = jwt.verify(token, env.jwtSecret as string) as jwt.JwtPayload;
        
        req.user = { id: decoded.userId };
        
        next();
    } catch (error) {
        if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError')) {
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
        } else {
            console.error('Auth middleware error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
