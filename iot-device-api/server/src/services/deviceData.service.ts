import { prisma } from '../prisma/client.js';
import { CreateDeviceDataHistoryRequest, DeviceDataHistoryQuery } from '../types.js';

export interface DeviceDataHistory {
  id: string;
  deviceId: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  power: 'on' | 'off';
}

export const deviceDataService = {
  // Create device data history entry
  async createDeviceDataHistory(
    deviceId: string,
    data: CreateDeviceDataHistoryRequest
  ): Promise<DeviceDataHistory> {
    const history = await prisma.deviceDataHistory.create({
      data: {
        deviceId,
        temperature: data.temperature,
        humidity: data.humidity,
        power: data.power,
        timestamp: new Date(),
      },
    });

    return {
      id: history.id,
      deviceId: history.deviceId,
      timestamp: history.timestamp.getTime(),
      temperature: history.temperature,
      humidity: history.humidity,
      power: history.power as 'on' | 'off',
    };
  },

  // Get device data history
  async getDeviceDataHistory(query: DeviceDataHistoryQuery): Promise<DeviceDataHistory[]> {
    const where: any = {
      deviceId: query.deviceId,
    };

    if (query.startTime || query.endTime) {
      where.timestamp = {};
      if (query.startTime) {
        where.timestamp.gte = query.startTime;
      }
      if (query.endTime) {
        where.timestamp.lte = query.endTime;
      }
    }

    const history = await prisma.deviceDataHistory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: query.limit || 100,
    });

    return history.map((h) => ({
      id: h.id,
      deviceId: h.deviceId,
      timestamp: h.timestamp.getTime(),
      temperature: h.temperature,
      humidity: h.humidity,
      power: h.power as 'on' | 'off',
    }));
  },

  // Get latest device data history entry
  async getLatestDeviceDataHistory(deviceId: string): Promise<DeviceDataHistory | null> {
    const history = await prisma.deviceDataHistory.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });

    if (!history) {
      return null;
    }

    return {
      id: history.id,
      deviceId: history.deviceId,
      timestamp: history.timestamp.getTime(),
      temperature: history.temperature,
      humidity: history.humidity,
      power: history.power as 'on' | 'off',
    };
  },
};

