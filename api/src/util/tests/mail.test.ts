import { sendMail } from '../mail.js';
import assert from 'node:assert';
import test from 'node:test';

test('mail util', async (t) => {
  await t.test('should be defined', () => {
    assert.strictEqual(typeof sendMail, 'function');
  });
});
