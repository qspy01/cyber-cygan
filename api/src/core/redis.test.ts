import test from 'node:test';
import assert from 'node:assert';
import { revokeAccessToken, isTokenRevoked } from './redis.js';

test('revokeAccessToken and isTokenRevoked', async () => {
    const token = 'test-token-123';
    
    // Initially not revoked
    const initialCheck = await isTokenRevoked(token);
    assert.strictEqual(initialCheck, false);

    // Revoke token
    const expiryTime = Math.floor(Date.now() / 1000) + 10; // 10 seconds from now
    await revokeAccessToken(token, expiryTime);

    // Check again
    const afterRevokeCheck = await isTokenRevoked(token);
    assert.strictEqual(afterRevokeCheck, true);
});
