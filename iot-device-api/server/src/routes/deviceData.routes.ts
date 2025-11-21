import { FastifyInstance } from 'fastify';
import { deviceDataService } from '../services/deviceData.service.js';
import {
  createDeviceDataHistorySchema,
  deviceIdParamSchema,
  deviceHistoryQuerySchema,
} from '../utils/validation.js';

export async function deviceDataRoutes(fastify: FastifyInstance) {
  // GET /api/devices/:id/history - Get device data history
  fastify.get(
    '/api/devices/:id/history',
    {
      schema: {
        ...deviceIdParamSchema,
        ...deviceHistoryQuerySchema,
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                timestamp: { type: 'number' },
                temperature: { type: 'number' },
                humidity: { type: 'number' },
                power: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const query = request.query as {
          startTime?: string;
          endTime?: string;
          limit?: number;
        };

        const historyQuery = {
          deviceId: id,
          startTime: query.startTime ? new Date(query.startTime) : undefined,
          endTime: query.endTime ? new Date(query.endTime) : undefined,
          limit: query.limit,
        };

        const history = await deviceDataService.getDeviceDataHistory(historyQuery);
        return reply.code(200).send(history);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch device history' });
      }
    }
  );

  // POST /api/devices/:id/history - Log new sensor reading
  fastify.post(
    '/api/devices/:id/history',
    {
      schema: {
        ...deviceIdParamSchema,
        ...createDeviceDataHistorySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              timestamp: { type: 'number' },
              temperature: { type: 'number' },
              humidity: { type: 'number' },
              power: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = request.body as any;

        // Verify device exists
        const { deviceService } = await import('../services/device.service.js');
        const device = await deviceService.getDeviceById(id);

        if (!device) {
          return reply.code(404).send({ error: 'Device not found' });
        }

        const history = await deviceDataService.createDeviceDataHistory(id, data);
        return reply.code(201).send(history);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to create device history entry' });
      }
    }
  );

  // GET /api/devices/:id/history/latest - Get latest reading
  fastify.get(
    '/api/devices/:id/history/latest',
    {
      schema: {
        ...deviceIdParamSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              timestamp: { type: 'number' },
              temperature: { type: 'number' },
              humidity: { type: 'number' },
              power: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const latest = await deviceDataService.getLatestDeviceDataHistory(id);

        if (!latest) {
          return reply.code(404).send({ error: 'No history found for device' });
        }

        return reply.code(200).send(latest);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch latest device history' });
      }
    }
  );
}

