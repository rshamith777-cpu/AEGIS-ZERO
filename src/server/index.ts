/**
 * ORBIT-A 3.1 HTTP REST API Server
 * 
 * Launch:
 *   npx tsx src/server/index.ts
 */

import { createServer } from 'http';
import { handleApiRequest } from './routes';

const PORT = parseInt(process.env.PORT || '3001', 10);

export function createOrbitServer() {
  return createServer((req, res) => {
    handleApiRequest(req, res);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.ORBIT_NO_AUTO_START) {
  const server = createOrbitServer();
  server.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`ORBIT-A 3.1 HTTP REST API SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`API Version : http://localhost:${PORT}/api/version`);
    console.log(`Datasets    : http://localhost:${PORT}/api/datasets`);
    console.log(`Provenance  : http://localhost:${PORT}/api/provenance`);
    console.log(`============================================================`);
  });
}
