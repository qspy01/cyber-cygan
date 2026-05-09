import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { isTokenRevoked } from '../core/redis.js';
import prisma from '../core/prisma.js';

export const identityMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        const isRevoked = await isTokenRevoked(token);
        if (isRevoked) {
            return next();
        }

        const decoded = jwt.verify(token, env.jwtSecret as string) as jwt.JwtPayload;
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { plan: true, overrides: true }
        });

        if (user) {
            (req as any).user = user;
        }
        
        next();
    } catch (error) {
        // Just ignore errors and treat as unauthenticated
        next();
    }
};
