import { runAllOrbitTests } from './orbitCore.test';
import { runAllOrbitV3Tests } from './orbitV3Regression.test';
import { runApiTestSuite } from './apiValidation.test';
import { runInvarianceAndLeakageSuite } from './invarianceAndLeakage.test';

async function main() {
  console.log('====================================================');
  console.log('ORBIT-A & ORBIT-Bench Comprehensive Research Test Suite');
  console.log('====================================================\n');

  const resCore = runAllOrbitTests();
  resCore.results.forEach((r, idx) => {
    const symbol = r.passed ? '✓' : '✗';
    console.log(`${symbol} [Core Test ${idx + 1}] ${r.name}`);
    if (!r.passed) {
      console.error(`  Error: ${r.error}`);
    }
  });

  console.log('\n====================================================');
  console.log('ORBIT-A 3.0 Specialized Regression Test Suite');
  console.log('====================================================\n');

  const resV3 = runAllOrbitV3Tests();
  resV3.results.forEach((r, idx) => {
    const symbol = r.passed ? '✓' : '✗';
    console.log(`${symbol} [V3 Regression ${idx + 1}] ${r.name}`);
    if (!r.passed) {
      console.error(`  Error: ${r.error}`);
    }
  });

  // Run ORBIT-A 3.1 HTTP REST API Tests
  const resApi = await runApiTestSuite();

  // Run ORBIT-A 3.1 Mathematical Invariance & Temporal Leakage Audit
  const resAudit = await runInvarianceAndLeakageSuite();

  const totalPassed = resCore.passedCount + resV3.passedCount + resApi.passed + resAudit.passed;
  const totalCount = resCore.totalCount + resV3.totalCount + (resApi.passed + resApi.failed) + (resAudit.passed + resAudit.failed);

  console.log(`\n====================================================`);
  console.log(`ORBIT-A 3.1 Unified Test & Verification Summary`);
  console.log(`====================================================`);
  console.log(`Core Engine Tests:              ${resCore.passedCount} / ${resCore.totalCount}`);
  console.log(`V3 Regression Tests:            ${resV3.passedCount} / ${resV3.totalCount}`);
  console.log(`HTTP REST API Tests:            ${resApi.passed} / ${resApi.passed + resApi.failed}`);
  console.log(`Invariance & Leakage Audits:    ${resAudit.passed} / ${resAudit.passed + resAudit.failed}`);
  console.log(`Total Quality Gates:            ${totalPassed} / ${totalCount} (${((totalPassed / totalCount) * 100).toFixed(1)}%)`);

  if (totalPassed !== totalCount) {
    console.error('\nFAILURE: Quality gate failed.');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All ORBIT-A 3.1 quality gates passed.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
