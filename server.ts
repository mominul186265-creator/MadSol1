import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { communicationRouter } from './src/server/communication/routes';
import { CommunicationSchedulerWorker } from './src/server/communication/scheduler/CommunicationSchedulerWorker';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount communication routes
  app.use('/api/communication', communicationRouter);

  // In production, serve static files from dist; in development, attach Vite middleware
  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[MadSol Server] Running on http://0.0.0.0:${PORT} (ENV: ${isProd ? 'production' : 'development'})`);
    
    // Boot server-side persistent scheduler worker
    CommunicationSchedulerWorker.getInstance().start();

    // Execute Protiddhoni Adapter Compliance Test Suite on boot
    try {
      const { ProtiddhoniAdapterTest } = await import('./src/server/communication/providers/ProtiddhoniAdapterTest');
      const testReport = await ProtiddhoniAdapterTest.runTests();
      console.log(`[Protiddhoni Test Runner] Compliance status: ${testReport.success ? 'SUCCESS (All Specs Passed)' : 'FAILURE'}`);
      testReport.results.forEach(res => console.log(`  ${res}`));
    } catch (testErr) {
      console.error('[Protiddhoni Test Runner] Failed to execute compliance tests:', testErr);
    }
  });
}

process.on('SIGTERM', () => {
  CommunicationSchedulerWorker.getInstance().stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  CommunicationSchedulerWorker.getInstance().stop();
  process.exit(0);
});

startServer().catch((err) => {
  console.error('[MadSol Server] Fatal Startup Error:', err);
  process.exit(1);
});
