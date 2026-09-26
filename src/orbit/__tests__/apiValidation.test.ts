/**
 * ORBIT-A 3.1 HTTP REST API Test & Validation Suite
 * 
 * Tests:
 *   - Valid requests across all endpoints
 *   - Malformed JSON handling
 *   - Missing dataset / missing state error handling
 *   - Shock analysis & MEI-2 intervention analysis
 *   - Provenance catalog
 *   - Large state load testing
 */

import { createServer, request } from 'http';
import { handleApiRequest } from '../../server/routes';
import { serializeStateForTransport } from '../../server/types';
import { createSyntheticState, createDimensionSafeInterventions } from '../v3/scalabilityBenchmark';

export async function runApiTestSuite(): Promise<{ passed: number; failed: number; errors: string[] }> {
  console.log('\n====================================================');
  console.log('ORBIT-A 3.1 HTTP REST API Integration Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  // Start server on ephemeral port 0
  const server = createServer((req, res) => handleApiRequest(req, res));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function makeReq(
    method: string,
    path: string,
    body?: any,
    rawBody?: string
  ): Promise<{ status: number; data: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const payload = rawBody !== undefined ? rawBody : body ? JSON.stringify(body) : undefined;
      const req = request(
        `${baseUrl}${path}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
          }
        },
        (res) => {
          let chunks = '';
          res.on('data', (c) => (chunks += c));
          res.on('end', () => {
            let data: any;
            try {
              data = JSON.parse(chunks);
            } catch {
              data = chunks;
            }
            resolve({ status: res.statusCode || 0, data, headers: res.headers });
          });
        }
      );
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`✓ [API Test ${passed}] ${name}`);
    } catch (err: any) {
      failed++;
      const msg = `✗ [API Test FAILED] ${name}: ${err.message || String(err)}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  try {
    // 1. GET /api/health
    await test('GET /api/health returns 200 with status UP', async () => {
      const res = await makeReq('GET', '/api/health');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.status !== 'UP') throw new Error(`Expected UP, got ${res.data.status}`);
      if (res.data.engine !== 'ORBIT-A 3.1') throw new Error(`Expected ORBIT-A 3.1, got ${res.data.engine}`);
    });

    // 2. GET /api/version
    await test('GET /api/version returns version 3.1.0 and algorithm capabilities', async () => {
      const res = await makeReq('GET', '/api/version');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.version !== '3.1.0') throw new Error(`Expected 3.1.0, got ${res.data.version}`);
      if (!Array.isArray(res.data.capabilities)) throw new Error('Capabilities should be an array');
    });

    // 3. GET /api/datasets
    await test('GET /api/datasets returns registered external datasets', async () => {
      const res = await makeReq('GET', '/api/datasets');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.count < 3) throw new Error(`Expected at least 3 datasets, got ${res.data.count}`);
    });

    // 4. GET /api/datasets/:id
    await test('GET /api/datasets/:id returns dataset metadata for valid ID and 404 for invalid ID', async () => {
      const resValid = await makeReq('GET', '/api/datasets/nyc_tlc');
      if (resValid.status !== 200) throw new Error(`Expected 200, got ${resValid.status}`);
      if (resValid.data.metadata.id !== 'nyc_tlc_transport_2024') throw new Error('Invalid metadata returned');

      const resInvalid = await makeReq('GET', '/api/datasets/non_existent_dataset');
      if (resInvalid.status !== 404) throw new Error(`Expected 404 for missing dataset, got ${resInvalid.status}`);
    });

    // 5. GET /api/provenance
    await test('GET /api/provenance returns provenance categories and integrity audit status', async () => {
      const res = await makeReq('GET', '/api/provenance');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.provenanceBreakdown.RAW || !res.data.provenanceBreakdown.SIMULATED) {
        throw new Error('Provenance categories RAW and SIMULATED must be present');
      }
    });

    // 6. POST /api/analyze (valid request)
    await test('POST /api/analyze executes full ORBIT-A 3.1 pipeline on synthetic state', async () => {
      const state = serializeStateForTransport(createSyntheticState(20));
      const interventions = createDimensionSafeInterventions(20);
      const res = await makeReq('POST', '/api/analyze', {
        state,
        interventions,
        options: { higherOrder: true, shockAnalysis: true }
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (typeof res.data.tbi !== 'number') throw new Error('Missing numeric tbi');
      if (!res.data.dominantRay) throw new Error('Missing dominantRay in response');
      if (!res.data.higherOrderInteractions) throw new Error('Missing higherOrderInteractions');
    });

    // 7. POST /api/analyze (missing state payload)
    await test('POST /api/analyze returns 400 when state payload is missing', async () => {
      const res = await makeReq('POST', '/api/analyze', { options: { higherOrder: true } });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    // 8. POST /api/analyze (malformed JSON)
    await test('POST /api/analyze returns 400 or 500 when payload is malformed JSON', async () => {
      const res = await makeReq('POST', '/api/analyze', undefined, '{ "state": invalid_json_here ');
      if (res.status < 400) throw new Error(`Expected error status, got ${res.status}`);
    });

    // 9. POST /api/boundary
    await test('POST /api/boundary returns boundary transition distance and rays', async () => {
      const state = serializeStateForTransport(createSyntheticState(15));
      const res = await makeReq('POST', '/api/boundary', { state });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (typeof res.data.adaptiveBtd !== 'number') throw new Error('Missing adaptiveBtd');
      if (typeof res.data.raysEvaluated !== 'number') throw new Error('Missing raysEvaluated');
    });

    // 10. POST /api/intervention
    await test('POST /api/intervention returns Pareto optimal escape interventions', async () => {
      const state = serializeStateForTransport(createSyntheticState(15));
      const interventions = createDimensionSafeInterventions(15);
      const res = await makeReq('POST', '/api/intervention', { state, interventions });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!Array.isArray(res.data.paretoFrontier)) throw new Error('Missing paretoFrontier array');
    });

    // 11. POST /api/shock/analyze
    await test('POST /api/shock/analyze classifies step displacement and returns recovery direction', async () => {
      const state1 = serializeStateForTransport(createSyntheticState(10));
      const state2 = serializeStateForTransport(createSyntheticState(10));
      // Induce step disruption
      const res = await makeReq('POST', '/api/shock/analyze', {
        currentState: state2,
        previousState: state1,
        currentBtd: 0.8
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.report || !res.data.report.fastestRecoveryDirection) {
        throw new Error('Missing shock report or recovery direction');
      }
    });

    // 12. POST /api/batch/analyze
    await test('POST /api/batch/analyze processes multiple system states and returns aggregate latency', async () => {
      const s1 = serializeStateForTransport(createSyntheticState(10));
      const s2 = serializeStateForTransport(createSyntheticState(10));
      const res = await makeReq('POST', '/api/batch/analyze', {
        items: [{ state: s1 }, { state: s2 }]
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.batchSize !== 2) throw new Error(`Expected batchSize 2, got ${res.data.batchSize}`);
      if (typeof res.data.meanLatencyMs !== 'number') throw new Error('Missing meanLatencyMs');
    });

    // 13. Large state load testing (N=250)
    await test('POST /api/analyze handles N=250 state vector within 50ms', async () => {
      const stateLarge = serializeStateForTransport(createSyntheticState(250));
      const t0 = performance.now();
      const res = await makeReq('POST', '/api/analyze', { state: stateLarge });
      const roundTripMs = performance.now() - t0;
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.inferenceTimeMs > 50) {
        throw new Error(`Inference exceeded 50ms: ${res.data.inferenceTimeMs}ms`);
      }
      console.log(`      (N=250 Engine Inference: ${res.data.inferenceTimeMs}ms | Round-trip: ${roundTripMs.toFixed(1)}ms)`);
    });

  } finally {
    server.close();
  }

  return { passed, failed, errors };
}

// Direct execution
if (process.argv[1]?.endsWith('apiValidation.test.ts')) {
  runApiTestSuite().then((res) => {
    if (res.failed > 0) process.exit(1);
    process.exit(0);
  });
}
