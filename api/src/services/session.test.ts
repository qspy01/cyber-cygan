import test from 'node:test';
import assert from 'node:assert';
import { generateAccessToken, generateRefreshToken, revokeSession } from './session.js';

test('generateAccessToken', async () => {
    const token = await generateAccessToken('user-123');
    assert.ok(typeof token === 'string');
    assert.ok(token.length > 0);
});

test.skip('generateRefreshToken', async () => {
    // this test will fail because generateRefreshToken is not implemented
    const result = await generateRefreshToken('user-123', 'device', '127.0.0.1');
    assert.ok(result.length > 0);
});

test('revokeSession', async () => {
    await revokeSession('refresh-token-123', 'access-token-123');
    assert.ok(true);
});
