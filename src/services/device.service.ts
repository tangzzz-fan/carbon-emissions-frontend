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

export const getById = (id: number) => {
    return api.get<Device>(`/devices/${id}`);
};

export const create = (data: DeviceFormData) => {
    return api.post<Device>('/devices', data);
};

export const update = (id: number, data: Partial<DeviceFormData>) => {
    return api.put<Device>(`/devices/${id}`, data);
};

export const remove = (id: number) => {
    return api.delete(`/devices/${id}`);
};

export const getDeviceData = (id: number, params?: {
    startDate?: string;
    endDate?: string;
    interval?: string;
}) => {
    return api.get(`/devices/${id}/data`, { params });
}; 