import assert from 'node:assert';
import { resolveQuota } from './policy.js';

async function runTests() {
    console.log('Running policy.ts tests...');
    
    // Test 1: Defaults
    const defaultQuota = resolveQuota(null);
    assert.strictEqual(defaultQuota.dailyLimit, 100);
    assert.strictEqual(defaultQuota.monthlyLimit, 3000);
    assert.strictEqual(defaultQuota.concurrencyLimit, 2);
    
    // Test 2: Plan limits applied
    const planUser: any = {
        id: 'user-1',
        plan: {
            dailyLimit: 500,
            monthlyLimit: 15000,
            concurrencyLimit: 5
        },
        overrides: []
    };
    const planQuota = resolveQuota(planUser);
    assert.strictEqual(planQuota.dailyLimit, 500);
    
    // Test 3: Overrides applied over Plan limits
    const overrideUser: any = {
        id: 'user-2',
        plan: {
            dailyLimit: 500,
            monthlyLimit: 15000,
            concurrencyLimit: 5
        },
        overrides: [
            { metric: 'dailyLimit', value: 1000 }
        ]
    };
    const overrideQuota = resolveQuota(overrideUser);
    assert.strictEqual(overrideQuota.dailyLimit, 1000);
    assert.strictEqual(overrideQuota.concurrencyLimit, 5);

    console.log('All policy tests passed!');
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
