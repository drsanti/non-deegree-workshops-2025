import { FastifySchema } from 'fastify';

// Device validation schemas
export const createDeviceSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1 },
      type: { type: 'string', enum: ['sensor', 'controller'] },
      status: { type: 'string', enum: ['online', 'offline'] },
      data: {
        type: 'object',
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          power: { type: 'string', enum: ['on', 'off'] },
        },
      },
    },
  },
};

export const updateDeviceSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      type: { type: 'string', enum: ['sensor', 'controller'] },
      status: { type: 'string', enum: ['online', 'offline'] },
      data: {
        type: 'object',
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          power: { type: 'string', enum: ['on', 'off'] },
        },
      },
    },
  },
};

export const updateDeviceStatusSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['online', 'offline'] },
    },
  },
};

export const updateDeviceDataSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['data'],
    properties: {
      data: {
        type: 'object',
        required: ['temperature', 'humidity', 'power'],
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          power: { type: 'string', enum: ['on', 'off'] },
        },
      },
    },
  },
};

export const createDeviceDataHistorySchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['temperature', 'humidity', 'power'],
    properties: {
      temperature: { type: 'number' },
      humidity: { type: 'number' },
      power: { type: 'string', enum: ['on', 'off'] },
    },
  },
};

export const deviceIdParamSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};

export const deviceHistoryQuerySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
    },
  },
};

