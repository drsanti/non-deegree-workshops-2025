import { FastifyInstance } from "fastify";
import { deviceService } from "../services/device.service.js";
import {
  createDeviceSchema,
  updateDeviceSchema,
  updateDeviceStatusSchema,
  updateDeviceDataSchema,
  deviceIdParamSchema,
} from "../utils/validation.js";

export async function deviceRoutes(fastify: FastifyInstance) {
  // GET /api/devices - Get all devices
  fastify.get(
    "/api/devices",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                type: { type: "string" },
                status: { type: "string" },
                lastUpdate: { type: "number" },
                data: {
                  type: "object",
                  properties: {
                    temperature: { type: "number" },
                    humidity: { type: "number" },
                    power: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        const devices = await deviceService.getAllDevices();
        return reply.code(200).send(devices);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to fetch devices" });
      }
    }
  );

  // GET /api/devices/:id - Get device by ID
  fastify.get(
    "/api/devices/:id",
    {
      schema: {
        ...deviceIdParamSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              status: { type: "string" },
              lastUpdate: { type: "number" },
              data: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  humidity: { type: "number" },
                  power: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const device = await deviceService.getDeviceById(id);

        if (!device) {
          return reply.code(404).send({ error: "Device not found" });
        }

        return reply.code(200).send(device);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to fetch device" });
      }
    }
  );

  // POST /api/devices - Create new device
  fastify.post(
    "/api/devices",
    {
      schema: {
        ...createDeviceSchema,
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              status: { type: "string" },
              lastUpdate: { type: "number" },
              data: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  humidity: { type: "number" },
                  power: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const device = await deviceService.createDevice(request.body as any);
        return reply.code(201).send(device);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Failed to create device",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // PUT /api/devices/:id - Update device
  fastify.put(
    "/api/devices/:id",
    {
      schema: {
        ...deviceIdParamSchema,
        ...updateDeviceSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              status: { type: "string" },
              lastUpdate: { type: "number" },
              data: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  humidity: { type: "number" },
                  power: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const device = await deviceService.updateDevice(
          id,
          request.body as any
        );

        if (!device) {
          return reply.code(404).send({ error: "Device not found" });
        }

        return reply.code(200).send(device);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to update device" });
      }
    }
  );

  // PATCH /api/devices/:id/status - Update device status
  fastify.patch(
    "/api/devices/:id/status",
    {
      schema: {
        ...deviceIdParamSchema,
        ...updateDeviceStatusSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              status: { type: "string" },
              lastUpdate: { type: "number" },
              data: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  humidity: { type: "number" },
                  power: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const device = await deviceService.updateDeviceStatus(
          id,
          request.body as any
        );

        if (!device) {
          return reply.code(404).send({ error: "Device not found" });
        }

        return reply.code(200).send(device);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .code(500)
          .send({ error: "Failed to update device status" });
      }
    }
  );

  // PATCH /api/devices/:id/data - Update device sensor data
  fastify.patch(
    "/api/devices/:id/data",
    {
      schema: {
        ...deviceIdParamSchema,
        ...updateDeviceDataSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              status: { type: "string" },
              lastUpdate: { type: "number" },
              data: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  humidity: { type: "number" },
                  power: { type: "string" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const device = await deviceService.updateDeviceData(
          id,
          request.body as any
        );

        if (!device) {
          return reply.code(404).send({ error: "Device not found" });
        }

        return reply.code(200).send(device);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to update device data" });
      }
    }
  );

  // DELETE /api/devices/:id - Delete device
  fastify.delete(
    "/api/devices/:id",
    {
      schema: {
        ...deviceIdParamSchema,
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const deleted = await deviceService.deleteDevice(id);

        if (!deleted) {
          return reply.code(404).send({ error: "Device not found" });
        }

        return reply.code(200).send({ message: "Device deleted successfully" });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Failed to delete device" });
      }
    }
  );
}
