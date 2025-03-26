import api from './api';
import { Device, DeviceFormData } from '../types/device';

export const getAll = (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
}) => {
    return api.get<{ data: Device[]; total: number }>('/devices', { params });
};

export const getById = (id: string) => {
    return api.get<Device>(`/devices/${id}`);
};

export const create = (data: DeviceFormData) => {
    return api.post<Device>('/devices', data);
};

export const update = (id: string, data: Partial<DeviceFormData>) => {
    return api.put<Device>(`/devices/${id}`, data);
};

export const remove = (id: string) => {
    return api.delete(`/devices/${id}`);
};

interface DeviceDataParams {
    startDate: string;
    endDate: string;
    interval: 'hourly' | 'daily' | 'monthly';
}

export const getDeviceData = (deviceId: string, params: DeviceDataParams) => {
    return api.get(`/devices/${deviceId}/data`, { params });
}; 