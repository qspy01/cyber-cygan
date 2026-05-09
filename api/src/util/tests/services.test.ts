import assert from 'node:assert';
import test from 'node:test';
import { mock } from 'node:test';

// Mocking Prisma
const mockPrisma = {
  user: {
    findUnique: mock.fn(async () => null),
    count: mock.fn(async () => 0),
    create: mock.fn(async (data: any) => ({ id: '1', ...data.data })),
    update: mock.fn(async (data: any) => ({ id: data.where.id, ...data.data })),
  },
};

// Replace the real prisma with our mock
// Note: This is tricky in ESM. We might need to use a library or just inject prisma.
// For simplicity in this environment, I'll write a test that uses the services but mocks the prisma calls if I can.
// Actually, I'll try to use the real prisma if I can confirm DB is up, or just mock the functions in the service.

import * as identityService from '../../services/identity.js';
import * as authService from '../../services/auth.js';
import prisma from '../../core/prisma.js';

test('Identity Service', async (t) => {
  // Mock prisma.user.findUnique
  const findUniqueMock = mock.method(prisma.user, 'findUnique', async (args: any) => {
    if (args.where.email === 'test@example.com') {
      return { id: '1', email: 'test@example.com', passwordHash: 'hash', role: 'USER', status: 'ACTIVE' };
    }
    return null;
  });

  await t.test('getUserByEmail should return user if found', async () => {
    const user = await identityService.getUserByEmail('test@example.com');
    assert.strictEqual(user?.email, 'test@example.com');
  });

  await t.test('getUserByEmail should return null if not found', async () => {
    const user = await identityService.getUserByEmail('notfound@example.com');
    assert.strictEqual(user, null);
  });
  
  findUniqueMock.mock.restore();
});

test('Identity Service - createUser', async (t) => {
  const countMock = mock.method(prisma.user, 'count', async () => 0);
  const createMock = mock.method(prisma.user, 'create', async (args: any) => {
    return { id: '1', ...args.data };
  });

  await t.test('createUser should set first user as ADMIN', async () => {
    const user = await identityService.createUser({ email: 'admin@example.com', passwordHash: 'hash' });
    assert.strictEqual(user.role, 'ADMIN');
  });

  countMock.mock.restore();
  mock.method(prisma.user, 'count', async () => 1);

  await t.test('createUser should set subsequent users as USER', async () => {
    const user = await identityService.createUser({ email: 'user@example.com', passwordHash: 'hash' });
    assert.strictEqual(user.role, 'USER');
  });

  createMock.mock.restore();
});

test('Auth Service', async (t) => {
  // Mock identityService.getUserByEmail and hashPassword/comparePassword
  // But wait, authService imports identityService, so we should mock identityService
  
  mock.method(prisma.user, 'findUnique', async (args: any) => {
    if (args.where.email === 'test@example.com') {
      const { hashPassword } = await import('../auth.js');
      const hash = await hashPassword('password123');
      return { id: '1', email: 'test@example.com', passwordHash: hash, role: 'USER', status: 'ACTIVE' };
    }
    return null;
  });

  await t.test('login should return user for valid credentials', async () => {
    const user = await authService.login({ email: 'test@example.com', password: 'password123' });
    assert.strictEqual(user.email, 'test@example.com');
  });

  await t.test('login should throw error for invalid password', async () => {
    await assert.rejects(
      authService.login({ email: 'test@example.com', password: 'wrongpassword' }),
      /Invalid credentials/
    );
  });
});
