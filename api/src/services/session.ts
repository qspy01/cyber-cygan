import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config.js';
import { PrismaClient } from '@prisma/client';
import { revokeAccessToken } from '../core/redis.js';

const prisma = new PrismaClient();

export const generateAccessToken = async (userId: string) => {
    const payload = { userId };
    const secret = env.jwtSecret as string;
    const expiresIn = parseInt(String(env.jwtLifetime || 900), 10); // default 15m
    
    return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = async (userId: string, deviceName?: string, ipAddress?: string) => {
    const token = randomUUID();
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await prisma.session.create({
        data: {
            userId,
            refreshToken: token,
            deviceName,
            ipAddress,
            expiresAt,
        }
    });

    return token;
};

export const revokeSession = async (refreshToken: string, accessToken?: string) => {
    try {
        await prisma.session.delete({
            where: { refreshToken }
        });
    } catch (e) {
        // Ignore if session not found
    }

    if (accessToken) {
        try {
            const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
            if (decoded && decoded.exp) {
                await revokeAccessToken(accessToken, decoded.exp);
            }
        } catch (e) {
            // Ignore decode errors
        }
    }
};
