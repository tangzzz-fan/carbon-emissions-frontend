import api from './api';
import { Device, DeviceFormData, DeviceDataParams, DeviceDataResponse } from '../types/device';

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
    return api.patch<Device>(`/devices/${id}`, data);
};

export const remove = (id: string) => {
    return api.delete(`/devices/${id}`);
};

export const getDeviceData = (deviceId: string, params: DeviceDataParams) => {
    return api.get<DeviceDataResponse>(`/devices/${deviceId}/data`, { params });
};

export const updateStatus = (id: string, status: string) => {
    return api.patch<Device>(`/devices/${id}/status`, { status });
};

export const batchUpdateStatus = (deviceIds: string[], status: string) => {
    return api.post<{ devices: Device[] }>('/devices/batch/status', { deviceIds, status });
};

export const getByOperator = (operatorId: string) => {
    return api.get<{ data: Device[]; total: number }>(`/devices/operator/${operatorId}`);
};

export const getByType = (type: string) => {
    return api.get<{ data: Device[]; total: number }>(`/devices/type/${type}`);
};

export const configureDevice = (deviceId: string, config: any) => {
    return api.post(`/devices/${deviceId}/config`, config);
};

export const getSensitiveData = (deviceId: string) => {
    return api.get(`/devices/${deviceId}/sensitive-data`);
}; 