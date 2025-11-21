import { prisma } from '../prisma/client.js';
import {
  CreateDeviceRequest,
  UpdateDeviceRequest,
  UpdateDeviceStatusRequest,
  UpdateDeviceDataRequest,
  Device,
  DeviceData,
} from '../types.js';

// Convert Prisma Device to API Device format
function prismaDeviceToDevice(prismaDevice: any): Device {
  const data = typeof prismaDevice.data === 'string' 
    ? JSON.parse(prismaDevice.data) 
    : prismaDevice.data;
  
  return {
    id: prismaDevice.id,
    name: prismaDevice.name,
    type: prismaDevice.type as 'sensor' | 'controller',
    status: prismaDevice.status as 'online' | 'offline',
    lastUpdate: prismaDevice.lastUpdate.getTime(),
    data: {
      temperature: data.temperature,
      humidity: data.humidity,
      power: data.power as 'on' | 'off',
    },
  };
}

export const deviceService = {
  // Get all devices
  async getAllDevices(): Promise<Device[]> {
    const devices = await prisma.device.findMany({
      orderBy: { lastUpdate: 'desc' },
    });
    return devices.map(prismaDeviceToDevice);
  },

  // Get device by ID
  async getDeviceById(id: string): Promise<Device | null> {
    const device = await prisma.device.findUnique({
      where: { id },
    });
    return device ? prismaDeviceToDevice(device) : null;
  },

  // Create new device
  async createDevice(data: CreateDeviceRequest): Promise<Device> {
    const defaultData: DeviceData = {
      temperature: 20,
      humidity: 40,
      power: 'off',
    };

    const deviceData = data.data || defaultData;

    const device = await prisma.device.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'online',
        data: deviceData as any,
      },
    });

    return prismaDeviceToDevice(device);
  },

  // Update device
  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.data !== undefined) {
      updateData.data = data.data as any;
    }
    updateData.lastUpdate = new Date();

    const device = await prisma.device.update({
      where: { id },
      data: updateData,
    });

    return prismaDeviceToDevice(device);
  },

  // Update device status
  async updateDeviceStatus(
    id: string,
    status: UpdateDeviceStatusRequest
  ): Promise<Device | null> {
    const device = await prisma.device.update({
      where: { id },
      data: {
        status: status.status,
        lastUpdate: new Date(),
      },
    });

    return prismaDeviceToDevice(device);
  },

  // Update device data
  async updateDeviceData(
    id: string,
    data: UpdateDeviceDataRequest
  ): Promise<Device | null> {
    const device = await prisma.device.update({
      where: { id },
      data: {
        data: data.data as any,
        lastUpdate: new Date(),
      },
    });

    return prismaDeviceToDevice(device);
  },

  // Delete device
  async deleteDevice(id: string): Promise<boolean> {
    try {
      await prisma.device.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};

