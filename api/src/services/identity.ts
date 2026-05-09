import prisma from '../core/prisma.js';
import { User, UserStatus, Role } from '@prisma/client';

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (data: {
  email: string;
  passwordHash: string;
}) => {
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? Role.ADMIN : Role.USER;

  return prisma.user.create({
    data: {
      ...data,
      role,
      status: UserStatus.ACTIVE, // Assuming newly created users are ACTIVE if not specified
    },
  });
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
};
