import dotenv from 'dotenv';
import Fastify from 'fastify';
import { deviceRoutes } from './routes/device.routes.js';
import { deviceDataRoutes } from './routes/deviceData.routes.js';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify instance
const fastify = Fastify({
  logger: true,
});

// Register routes
fastify.register(deviceRoutes);
fastify.register(deviceDataRoutes);

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: Date.now() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`API endpoints available at http://${HOST}:${PORT}/api`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

