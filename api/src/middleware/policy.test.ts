import assert from 'node:assert';
import { unifiedPolicyEngine, PolicyRequest } from './policy.js';

// Simple mock for Response
class MockResponse {
    statusCode: number = 200;
    jsonData: any = null;

    status(code: number) {
        this.statusCode = code;
        return this;
    }

    json(data: any) {
        this.jsonData = data;
        return this;
    }
}

async function runTests() {
    console.log('Running policy middleware tests...');

    // Test 1: Banned user
    const req1 = {
        user: { id: 'u1', status: 'BANNED' }
    } as any;
    const res1 = new MockResponse();
    let nextCalled1 = false;
    await unifiedPolicyEngine(req1, res1 as any, () => { nextCalled1 = true; });
    assert.strictEqual(res1.statusCode, 403);
    assert.strictEqual(nextCalled1, false);

    // Test 2: Valid anonymous user (no redis)
    const req2 = { ip: '127.0.0.1' } as any;
    const res2 = new MockResponse();
    let nextCalled2 = false;
    await unifiedPolicyEngine(req2, res2 as any, () => { nextCalled2 = true; });
    assert.strictEqual(nextCalled2, true);
    assert.ok(req2.policy);
    assert.strictEqual(req2.policy.usage.allowed, true);

    console.log('All policy middleware tests passed!');
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
