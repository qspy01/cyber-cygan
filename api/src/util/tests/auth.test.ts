import { hashPassword, comparePassword } from '../auth.js';
import assert from 'node:assert';
import test from 'node:test';

test('auth util', async (t) => {
  await t.test('should hash and compare password correctly', async () => {
    const password = 'my-secret-password';
    const hash = await hashPassword(password);
    
    assert.notStrictEqual(password, hash);
    assert.strictEqual(typeof hash, 'string');
    
    const isMatch = await comparePassword(password, hash);
    assert.strictEqual(isMatch, true);
    
    const isNotMatch = await comparePassword('wrong-password', hash);
    assert.strictEqual(isNotMatch, false);
  });
});
